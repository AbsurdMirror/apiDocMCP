// src/sync/index.js - 同步引擎入口
const { StorageManager } = require('../storage');
const { DocumentGenerator } = require('../document');

class SyncEngine {
  constructor(config = {}) {
    this.config = config;
    this.storage = new StorageManager(config);
    this.docGen = new DocumentGenerator(config);
    this.syncLocks = new Map(); // 用于并发控制
  }

  async syncModule(moduleId) {
    // 检查锁
    if (this.syncLocks.has(moduleId)) {
      throw new Error(`模块正在同步中: ${moduleId}`);
    }
    
    try {
      // 加锁
      this.syncLocks.set(moduleId, true);
      
      // 获取模块信息
      const module = await this.storage.getModule(moduleId);
      if (!module) {
        throw new Error(`模块不存在: ${moduleId}`);
      }
      
      // 同步模块文档
      await this.docGen.generateModuleDoc(moduleId);
      
      // 同步模块下的所有API文档
      for (const api of module.apis) {
        await this.syncApi(api.apiId);
      }
      
      // 同步子模块
      if (module.subModules && module.subModules.length > 0) {
        for (const subModule of module.subModules) {
          // 递归同步子模块
          await this.syncModule(subModule.moduleId);
        }
      }
      
      return true;
    } finally {
      // 解锁
      this.syncLocks.delete(moduleId);
    }
  }

  async syncApi(apiId) {
    // 检查锁
    if (this.syncLocks.has(apiId)) {
      throw new Error(`API正在同步中: ${apiId}`);
    }
    
    try {
      // 加锁
      this.syncLocks.set(apiId, true);
      
      // 同步API文档
      await this.docGen.generateApiDoc(apiId);
      
      return true;
    } finally {
      // 解锁
      this.syncLocks.delete(apiId);
    }
  }

  async syncAll() {
    // 获取所有顶级模块
    const modules = await this.storage.listModules({ isRoot: true });
    
    // 同步每个顶级模块（子模块会在syncModule中递归同步）
    for (const module of modules) {
      await this.syncModule(module.moduleId);
    }
    
    return true;
  }
}

module.exports = { SyncEngine };