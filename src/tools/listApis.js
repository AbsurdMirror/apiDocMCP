// src/tools/listApis.js - 列出API工具实现
const { StorageManager } = require('../storage');
const { z } = require('zod');

const listApis = {
  name: 'listApis',
  description: '列出指定模块中的所有API接口',
  inputSchema: {
    moduleId: z.string().describe('模块ID'),
    apiName: z.string().optional().describe('按API名称过滤（可选）')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      // 检查模块是否存在
      const storage = new StorageManager(config);
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
      
      // 构建过滤条件
      const filter = {};
      if (input.apiName) filter.apiName = input.apiName;
      
      // 获取API列表
      const apis = await storage.listApis(input.moduleId, filter);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            moduleId: input.moduleId,
            moduleName: module.moduleName,
            apis,
            count: apis.length
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `获取API列表失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = listApis;