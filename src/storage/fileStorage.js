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
}

module.exports = FileStorage;