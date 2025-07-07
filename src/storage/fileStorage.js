// src/storage/fileStorage.js - 文件存储实现
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileStorage {
  constructor(config = {}) {
    this.dataDir = config.dataDir || path.join(process.cwd(), 'data');
    this.modulesDir = path.join(this.dataDir, 'modules');
    this.apisDir = path.join(this.dataDir, 'apis');
    this.indexFile = path.join(this.dataDir, 'modules.json');
    
    // 确保目录存在
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(this.modulesDir, { recursive: true });
    await fs.mkdir(this.apisDir, { recursive: true });
    
    // 确保索引文件存在
    try {
      await fs.access(this.indexFile);
    } catch (error) {
      await fs.writeFile(this.indexFile, JSON.stringify({ modules: [] }));
    }
  }

  async createModule(moduleData) {
    const moduleId = uuidv4();
    const now = new Date().toISOString();
    
    const module = {
      moduleId,
      moduleName: moduleData.moduleName,
      description: moduleData.description,
      apis: [],
      subModules: [], // 新增：子模块列表
      createdAt: now,
      updatedAt: now
    };
    
    // 写入模块文件
    const moduleFile = path.join(this.modulesDir, `${moduleId}.json`);
    await fs.writeFile(moduleFile, JSON.stringify(module, null, 2));
    
    // 更新索引
    const index = JSON.parse(await fs.readFile(this.indexFile, 'utf8'));
    index.modules.push({
      moduleId,
      moduleName: moduleData.moduleName
    });
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
    
    return moduleId;
  }

  async getModule(moduleId) {
    try {
      const moduleFile = path.join(this.modulesDir, `${moduleId}.json`);
      const moduleData = JSON.parse(await fs.readFile(moduleFile, 'utf8'));
      return moduleData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // 模块不存在
      }
      throw error;
    }
  }

  async updateModule(moduleId, moduleData) {
    try {
      const moduleFile = path.join(this.modulesDir, `${moduleId}.json`);
      const existingModule = JSON.parse(await fs.readFile(moduleFile, 'utf8'));
      
      const updatedModule = {
        ...existingModule,
        ...moduleData,
        // 确保子模块列表不被覆盖
        subModules: existingModule.subModules || [],
        updatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(moduleFile, JSON.stringify(updatedModule, null, 2));
      
      // 如果模块名称已更改，更新索引
      if (moduleData.moduleName && moduleData.moduleName !== existingModule.moduleName) {
        const index = JSON.parse(await fs.readFile(this.indexFile, 'utf8'));
        const moduleIndex = index.modules.findIndex(m => m.moduleId === moduleId);
        
        if (moduleIndex !== -1) {
          index.modules[moduleIndex].moduleName = moduleData.moduleName;
          await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
        }
      }
      
      return moduleId;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`模块不存在: ${moduleId}`);
      }
      throw error;
    }
  }

  async listModules(filter = {}) {
    try {
      const index = JSON.parse(await fs.readFile(this.indexFile, 'utf8'));
      let modules = index.modules;
      
      // 应用过滤器
      if (filter.moduleName) {
        modules = modules.filter(m => 
          m.moduleName.toLowerCase().includes(filter.moduleName.toLowerCase())
        );
      }
      
      return modules;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async createApi(apiData) {
    const apiId = uuidv4();
    const now = new Date().toISOString();
    
    const api = {
      apiId,
      moduleId: apiData.moduleId,
      apiName: apiData.apiName,
      functionDeclaration: apiData.functionDeclaration,
      description: apiData.description,
      createdAt: now,
      updatedAt: now
    };
    
    // 写入API文件
    const apiFile = path.join(this.apisDir, `${apiId}.json`);
    await fs.writeFile(apiFile, JSON.stringify(api, null, 2));
    
    // 更新模块文件中的API列表
    const moduleFile = path.join(this.modulesDir, `${apiData.moduleId}.json`);
    try {
      const module = JSON.parse(await fs.readFile(moduleFile, 'utf8'));
      module.apis.push({
        apiId,
        apiName: apiData.apiName
      });
      module.updatedAt = now;
      
      await fs.writeFile(moduleFile, JSON.stringify(module, null, 2));
    } catch (error) {
      // 如果模块不存在，删除刚创建的API文件
      await fs.unlink(apiFile);
      throw new Error(`模块不存在: ${apiData.moduleId}`);
    }
    
    return apiId;
  }

  async getApi(apiId) {
    try {
      const apiFile = path.join(this.apisDir, `${apiId}.json`);
      const apiData = JSON.parse(await fs.readFile(apiFile, 'utf8'));
      return apiData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // API不存在
      }
      throw error;
    }
  }

  async updateApi(apiId, apiData) {
    try {
      const apiFile = path.join(this.apisDir, `${apiId}.json`);
      const existingApi = JSON.parse(await fs.readFile(apiFile, 'utf8'));
      
      const updatedApi = {
        ...existingApi,
        ...apiData,
        updatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(apiFile, JSON.stringify(updatedApi, null, 2));
      
      // 如果API名称已更改，更新模块文件中的API列表
      if (apiData.apiName && apiData.apiName !== existingApi.apiName) {
        const moduleFile = path.join(this.modulesDir, `${existingApi.moduleId}.json`);
        const module = JSON.parse(await fs.readFile(moduleFile, 'utf8'));
        
        const apiIndex = module.apis.findIndex(a => a.apiId === apiId);
        if (apiIndex !== -1) {
          module.apis[apiIndex].apiName = apiData.apiName;
          module.updatedAt = updatedApi.updatedAt;
          
          await fs.writeFile(moduleFile, JSON.stringify(module, null, 2));
        }
      }
      
      return apiId;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`API不存在: ${apiId}`);
      }
      throw error;
    }
  }

  async listApis(moduleId, filter = {}) {
    try {
      // 获取模块信息
      const moduleFile = path.join(this.modulesDir, `${moduleId}.json`);
      const module = JSON.parse(await fs.readFile(moduleFile, 'utf8'));
      
      let apis = module.apis;
      
      // 应用过滤器
      if (filter.apiName) {
        apis = apis.filter(a => 
          a.apiName.toLowerCase().includes(filter.apiName.toLowerCase())
        );
      }
      
      return apis;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`模块不存在: ${moduleId}`);
      }
      throw error;
    }
  }

  async resolveModulePath(modulePath) {
    const pathSegments = modulePath.split('/').filter(p => p);
    if (pathSegments.length === 0) {
      return null; // Invalid path
    }

    // 1. Find the root module
    const index = JSON.parse(await fs.readFile(this.indexFile, 'utf8'));
    const rootModuleInfo = index.modules.find(m => m.moduleName === pathSegments[0]);

    if (!rootModuleInfo) {
      return null; // Root module not found
    }

    let currentModuleId = rootModuleInfo.moduleId;

    // 2. Traverse sub-modules
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const currentModule = await this.getModule(currentModuleId);
      if (!currentModule || !currentModule.subModules) {
        return null; // Parent module not found or has no sub-modules
      }

      const subModuleInfo = currentModule.subModules.find(sm => sm.moduleName === segment);
      if (!subModuleInfo) {
        return null; // Sub-module not found
      }
      currentModuleId = subModuleInfo.moduleId;
    }

    return currentModuleId;
  }

  async getModuleByPath(modulePath) {
    const moduleId = await this.resolveModulePath(modulePath);
    if (!moduleId) {
      return null;
    }
    return this.getModule(moduleId);
  }

  async createSubModule(parentModuleId, moduleData) {
    // 检查父模块是否存在
    const parentModule = await this.getModule(parentModuleId);
    if (!parentModule) {
      throw new Error(`父模块不存在: ${parentModuleId}`);
    }
    
    // 创建子模块
    const moduleId = uuidv4();
    const now = new Date().toISOString();
    
    const module = {
      moduleId,
      moduleName: moduleData.moduleName,
      description: moduleData.description,
      apis: [],
      subModules: [],
      parentModuleId, // 记录父模块ID
      createdAt: now,
      updatedAt: now
    };
    
    // 写入子模块文件
    const moduleFile = path.join(this.modulesDir, `${moduleId}.json`);
    await fs.writeFile(moduleFile, JSON.stringify(module, null, 2));
    
    // 更新父模块的子模块列表
    parentModule.subModules = parentModule.subModules || [];
    parentModule.subModules.push({
      moduleId,
      moduleName: moduleData.moduleName
    });
    parentModule.updatedAt = now;
    
    // 保存父模块
    const parentModuleFile = path.join(this.modulesDir, `${parentModuleId}.json`);
    await fs.writeFile(parentModuleFile, JSON.stringify(parentModule, null, 2));
    
    return moduleId;
  }

  async removeSubModule(parentModuleId, subModuleId) {
    // 检查父模块是否存在
    const parentModule = await this.getModule(parentModuleId);
    if (!parentModule) {
      throw new Error(`父模块不存在: ${parentModuleId}`);
    }
    
    // 检查子模块是否存在
    const subModule = await this.getModule(subModuleId);
    if (!subModule) {
      throw new Error(`子模块不存在: ${subModuleId}`);
    }
    
    // 检查子模块是否属于父模块
    const subModuleIndex = parentModule.subModules.findIndex(m => m.moduleId === subModuleId);
    if (subModuleIndex === -1) {
      throw new Error(`子模块不属于指定的父模块: ${subModuleId}`);
    }
    
    // 从父模块的子模块列表中移除
    parentModule.subModules.splice(subModuleIndex, 1);
    parentModule.updatedAt = new Date().toISOString();
    
    // 保存父模块
    const parentModuleFile = path.join(this.modulesDir, `${parentModuleId}.json`);
    await fs.writeFile(parentModuleFile, JSON.stringify(parentModule, null, 2));
    
    // 更新子模块，移除父模块引用
    delete subModule.parentModuleId;
    subModule.updatedAt = parentModule.updatedAt;
    
    // 保存子模块
    const subModuleFile = path.join(this.modulesDir, `${subModuleId}.json`);
    await fs.writeFile(subModuleFile, JSON.stringify(subModule, null, 2));
    
    return true;
  }

  async moveSubModule(subModuleId, newParentModuleId) {
    // 检查子模块是否存在
    const subModule = await this.getModule(subModuleId);
    if (!subModule) {
      throw new Error(`子模块不存在: ${subModuleId}`);
    }
    
    // 检查新父模块是否存在
    const newParentModule = await this.getModule(newParentModuleId);
    if (!newParentModule) {
      throw new Error(`新父模块不存在: ${newParentModuleId}`);
    }
    
    // 如果子模块有当前父模块，先从当前父模块中移除
    if (subModule.parentModuleId) {
      await this.removeSubModule(subModule.parentModuleId, subModuleId);
    }
    
    // 添加到新父模块
    const now = new Date().toISOString();
    
    // 更新子模块，设置新父模块引用
    subModule.parentModuleId = newParentModuleId;
    subModule.updatedAt = now;
    
    // 保存子模块
    const subModuleFile = path.join(this.modulesDir, `${subModuleId}.json`);
    await fs.writeFile(subModuleFile, JSON.stringify(subModule, null, 2));
    
    // 更新新父模块的子模块列表
    newParentModule.subModules = newParentModule.subModules || [];
    newParentModule.subModules.push({
      moduleId: subModuleId,
      moduleName: subModule.moduleName
    });
    newParentModule.updatedAt = now;
    
    // 保存新父模块
    const newParentModuleFile = path.join(this.modulesDir, `${newParentModuleId}.json`);
    await fs.writeFile(newParentModuleFile, JSON.stringify(newParentModule, null, 2));
    
    return true;
  }
}

module.exports = FileStorage;