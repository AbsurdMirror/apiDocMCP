// src/tools/listModules.js - 列出模块工具实现
const { StorageManager } = require('../storage');
const { z } = require('zod');

const listModules = {
  name: 'listModules',
  description: '列出所有API模块',
  inputSchema: {
    moduleName: z.string().optional().describe('按模块名称过滤（可选）')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      // 构建过滤条件
      const filter = {};
      if (input.moduleName) filter.moduleName = input.moduleName;
      
      // 获取模块列表
      const storage = new StorageManager(config);
      const modules = await storage.listModules(filter);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            modules,
            count: modules.length
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `获取模块列表失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = listModules;