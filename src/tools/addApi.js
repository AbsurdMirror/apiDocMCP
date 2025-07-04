// src/tools/addApi.js - 新增API工具实现
const { StorageManager } = require('../storage');
const { DocumentGenerator } = require('../document');
const { SyncEngine } = require('../sync');
const { z } = require('zod');

const addApi = {
  name: 'addApi',
  description: '在指定模块中创建新的API接口',
  inputSchema: {
    moduleId: z.string().describe('所属模块ID'),
    apiName: z.string().describe('API名称'),
    functionDeclaration: z.string().describe('API函数声明'),
    description: z.string().describe('API描述')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      // 1. 创建API记录
      const storage = new StorageManager(config);
      
      // 检查模块是否存在
      const module = await storage.getModule(input.moduleId);
      if (!module) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              message: `模块不存在: ${input.moduleId}`
            })
          }]
        };
      }
      
      // 创建API
      const apiId = await storage.createApi(input);
      
      // 2. 生成Markdown文档
      const docGen = new DocumentGenerator(config);
      await docGen.generateApiDoc(apiId);
      
      // 3. 同步模块文档（更新API列表）
      const syncEngine = new SyncEngine(config);
      await syncEngine.syncModule(input.moduleId);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            apiId,
            message: 'API创建成功'
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `API创建失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = addApi;