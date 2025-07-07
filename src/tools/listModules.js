// src/tools/listModules.js - 列出模块工具实现
const { StorageManager } = require('../storage');
const { z } = require('zod');

const listModules = {
  name: 'listModules',
  description: '列出所有API模块',
  inputSchema: {
    moduleName: z.string().optional().describe('按模块名称过滤（可选）'),
    parentModulePath: z.string().optional().describe('父模块路径，用于列出其子模块（可选）')
  },
  async handler(input, context) {
    try {
      // 获取配置信息
      const config = context.serverContext.config || {};
      
      const storage = new StorageManager(config);
      let modules = [];

      if (input.parentModulePath) {
        const parentModule = await storage.getModuleByPath(input.parentModulePath);
        if (!parentModule) {
          throw new Error(`父模块不存在: ${input.parentModulePath}`);
        }

        if (parentModule.subModules && parentModule.subModules.length > 0) {
          modules = await Promise.all(parentModule.subModules.map(async (sub) => {
            const subModuleDetails = await storage.getModule(sub.moduleId);
            return {
              moduleId: sub.moduleId,
              moduleName: subModuleDetails.moduleName,
              description: subModuleDetails.description,
            };
          }));
        }

        if (input.moduleName) {
          modules = modules.filter(m => m.moduleName.toLowerCase().includes(input.moduleName.toLowerCase()));
        }

      } else {
        const filter = {};
        if (input.moduleName) filter.moduleName = input.moduleName;
        modules = await storage.listModules(filter);
      }
      
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