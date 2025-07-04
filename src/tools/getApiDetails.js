// src/tools/getApiDetails.js - 获取API详情工具实现
const { StorageManager } = require('../storage');
const { z } = require('zod');

const getApiDetails = {
  name: 'getApiDetails',
  description: '获取指定API接口的详细信息',
  inputSchema: {
    apiId: z.string().describe('要获取详情的API ID')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      // 获取API详情
      const storage = new StorageManager(config);
      const api = await storage.getApi(input.apiId);
      
      if (!api) {
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
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            api
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `获取API详情失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = getApiDetails;