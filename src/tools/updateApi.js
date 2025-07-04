// src/tools/updateApi.js - 更新API工具实现
const { StorageManager } = require('../storage');
const { DocumentGenerator } = require('../document');
const { SyncEngine } = require('../sync');
const { z } = require('zod');

const updateApi = {
  name: 'updateApi',
  description: '更新现有的API接口',
  inputSchema: {
    apiId: z.string().describe('要更新的API ID'),
    apiName: z.string().optional().describe('API的新名称（可选）'),
    functionDeclaration: z.string().optional().describe('API的新函数声明（可选）'),
    description: z.string().optional().describe('API的新描述（可选）')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      // 1. 检查API是否存在
      const storage = new StorageManager(config);
      const existingApi = await storage.getApi(input.apiId);
      
      if (!existingApi) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              message: `API不存在: ${input.apiId}`
            })
          }]
        };
      }
      
      // 2. 更新API记录
      const updateData = {};
      if (input.apiName) updateData.apiName = input.apiName;
      if (input.functionDeclaration) updateData.functionDeclaration = input.functionDeclaration;
      if (input.description) updateData.description = input.description;
      
      // 如果没有提供任何更新字段，直接返回成功
      if (Object.keys(updateData).length === 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              apiId: input.apiId,
              message: '没有提供更新字段，API保持不变'
            })
          }]
        };
      }
      
      await storage.updateApi(input.apiId, updateData);
      
      // 3. 同步文档
      const syncEngine = new SyncEngine(config);
      await syncEngine.syncApi(input.apiId);
      
      // 如果API名称已更改，还需要同步模块文档
      if (input.apiName) {
        await syncEngine.syncModule(existingApi.moduleId);
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            apiId: input.apiId,
            message: 'API更新成功'
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `API更新失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = updateApi;