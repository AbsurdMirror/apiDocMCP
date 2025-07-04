// src/tools/list.js - 列出所有可用工具实现
const { z } = require('zod');

const list = {
  name: 'list',
  description: '列出所有可用的工具',
  inputSchema: {},
  async handler(input, context) {
    try {
      // 获取所有工具列表
      const tools = [
        'addModule',
        'addApi',
        'updateModule',
        'updateApi',
        'listModules',
        'listApis',
        'getModuleDetails',
        'getApiDetails',
        'list'
      ];
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            tools
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `获取工具列表失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = list;