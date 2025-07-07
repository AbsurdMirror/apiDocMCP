// src/tools/addModule.js - 新增模块工具实现
const { StorageManager } = require('../storage');
const { DocumentGenerator } = require('../document');
const { SyncEngine } = require('../sync');
const { z } = require('zod');

const addModule = {
  name: 'addModule',
  description: '创建新的API模块',
  inputSchema: {
    moduleName: z.string().describe('模块名称'),
    description: z.string().describe('模块描述'),
    parentModulePath: z.string().optional().describe('父模块路径（可选，格式如"aaa/bbb"）')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      // 1. 创建模块记录
      const storage = new StorageManager(config);
      let moduleId;

      if (input.parentModulePath) {
        const parentModule = await storage.getModuleByPath(input.parentModulePath);
        if (!parentModule) {
          throw new Error(`父模块不存在: ${input.parentModulePath}`);
        }
        // The createSubModule method needs to be implemented in storage
        moduleId = await storage.createSubModule(parentModule.moduleId, input);
      } else {
        moduleId = await storage.createModule(input);
      }
      
      // 2. 生成Markdown文档
      const docGen = new DocumentGenerator(config);
      await docGen.generateModuleDoc(moduleId);
      
      // 3. 同步存储
      const syncEngine = new SyncEngine(config);
      await syncEngine.syncModule(moduleId);
      
      // 返回符合MCP协议的响应格式
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            moduleId,
            message: '模块创建成功'
          })
        }]
      };
    } catch (error) {
      // 返回错误信息，符合MCP协议的响应格式
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `模块创建失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = addModule;