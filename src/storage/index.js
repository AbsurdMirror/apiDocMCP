// src/storage/index.js - 存储管理器入口
const FileStorage = require('./fileStorage');
const DatabaseStorage = require('./databaseStorage');

class StorageManager {
  constructor(config = {}) {
    this.config = config;
    this.storageType = config.storageType || 'file';
    
    // 根据配置选择存储实现
    if (this.storageType === 'file') {
      this.storage = new FileStorage(config);
    } else if (this.storageType === 'database') {
      this.storage = new DatabaseStorage(config);
    } else {
      throw new Error(`不支持的存储类型: ${this.storageType}`);
    }
  }

  async createModule(moduleData) {
    return this.storage.createModule(moduleData);
  }

  async getModule(moduleId) {
    return this.storage.getModule(moduleId);
  }

  async updateModule(moduleId, moduleData) {
    return this.storage.updateModule(moduleId, moduleData);
  }

  async listModules(filter = {}) {
    return this.storage.listModules(filter);
  }

  async createApi(apiData) {
    return this.storage.createApi(apiData);
  }

  async getApi(apiId) {
    return this.storage.getApi(apiId);
  }

  async updateApi(apiId, apiData) {
    return this.storage.updateApi(apiId, apiData);
  }

  async listApis(moduleId, filter = {}) {
    return this.storage.listApis(moduleId, filter);
  }

  async resolveModulePath(modulePath) {
    return this.storage.resolveModulePath(modulePath);
  }

  async getModuleByPath(modulePath) {
    return this.storage.getModuleByPath(modulePath);
  }

  async createSubModule(parentModuleId, moduleData) {
    return this.storage.createSubModule(parentModuleId, moduleData);
  }

  async removeSubModule(parentModuleId, subModuleId) {
    return this.storage.removeSubModule(parentModuleId, subModuleId);
  }

  async moveSubModule(subModuleId, newParentModuleId) {
    return this.storage.moveSubModule(subModuleId, newParentModuleId);
  }
}

module.exports = { StorageManager };