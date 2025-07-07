// src/tools/updateModule.js - 更新模块工具实现
const { StorageManager } = require('../storage');
const { DocumentGenerator } = require('../document');
const { SyncEngine } = require('../sync');
const { z } = require('zod');

const updateModule = {
  name: 'updateModule',
  description: '更新现有的API模块',
  inputSchema: {
    moduleId: z.string().optional().describe('要更新的模块ID'),
    modulePath: z.string().optional().describe('要更新的模块路径（格式如"aaa/bbb"）'),
    moduleName: z.string().optional().describe('模块的新名称（可选）'),
    description: z.string().optional().describe('模块的新描述（可选）')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      const storage = new StorageManager(config);
      let moduleId;

      if (input.modulePath) {
        moduleId = await storage.resolveModulePath(input.modulePath);
      } else if (input.moduleId) {
        moduleId = input.moduleId;
      } else {
        throw new Error('必须提供moduleId或modulePath');
      }

      if (!moduleId) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              message: `模块不存在`
            })
          }]
        };
      }

      const existingModule = await storage.getModule(moduleId);
      

      
      // 2. 更新模块记录
      const updateData = {};
      if (input.moduleName) updateData.moduleName = input.moduleName;
      if (input.description) updateData.description = input.description;
      
      // 如果没有提供任何更新字段，直接返回成功
      if (Object.keys(updateData).length === 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              moduleId: moduleId,
              message: '没有提供更新字段，模块保持不变'
            })
          }]
        };
      }
      
      await storage.updateModule(moduleId, updateData);
      
      // 3. 同步文档
      const syncEngine = new SyncEngine(config);
      await syncEngine.syncModule(moduleId);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            moduleId: moduleId,
            message: '模块更新成功'
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `模块更新失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = updateModule;