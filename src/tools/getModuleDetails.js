// src/tools/getModuleDetails.js - 获取模块详情工具实现
const { StorageManager } = require('../storage');
const { z } = require('zod');

const getModuleDetails = {
  name: 'getModuleDetails',
  description: '获取指定模块的详细信息',
  inputSchema: {
    moduleId: z.string().optional().describe('要获取详情的模块ID'),
    modulePath: z.string().optional().describe('要获取详情的模块路径（格式如"aaa/bbb"）')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      // 获取模块详情
      const storage = new StorageManager(config);
      let module;

      if (input.modulePath) {
        module = await storage.getModuleByPath(input.modulePath);
      } else if (input.moduleId) {
        module = await storage.getModule(input.moduleId);
      } else {
        throw new Error('必须提供moduleId或modulePath');
      }
      
      if (!module) {
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
      

      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            module
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: `获取模块详情失败: ${error.message}`
          })
        }]
      };
    }
  }
};

module.exports = getModuleDetails;