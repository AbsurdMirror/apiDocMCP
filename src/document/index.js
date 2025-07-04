// src/document/index.js - 文档生成器入口
const fs = require('fs').promises;
const path = require('path');
const { StorageManager } = require('../storage');

class DocumentGenerator {
  constructor(config = {}) {
    this.config = config;
    this.docsDir = config.docsDir || path.join(process.cwd(), 'docs');
    this.modulesDir = path.join(this.docsDir, 'modules');
    this.apisDir = path.join(this.docsDir, 'apis');
    this.storage = new StorageManager(config);
    
    // 确保目录存在
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(this.docsDir, { recursive: true });
    await fs.mkdir(this.modulesDir, { recursive: true });
    await fs.mkdir(this.apisDir, { recursive: true });
  }

  async generateModuleDoc(moduleId) {
    // 获取模块数据
    const module = await this.storage.getModule(moduleId);
    if (!module) {
      throw new Error(`模块不存在: ${moduleId}`);
    }
    
    // 生成模块文档
    const markdown = this.generateModuleMarkdown(module);
    
    // 确保模块的API目录存在
    const moduleApiDir = path.join(this.apisDir, module.moduleName);
    await fs.mkdir(moduleApiDir, { recursive: true });
    
    // 写入文件
    const docFile = path.join(this.modulesDir, `${module.moduleName}.md`);
    await fs.writeFile(docFile, markdown);
    
    // 更新索引页
    await this.updateIndexPage();
    
    return docFile;
  }

  generateModuleMarkdown(module) {
    return `# ${module.displayName || module.moduleName}

## 描述

${module.description}

## API列表

${module.apis.map(api => `- [${api.displayName || api.apiName}](../apis/${module.moduleName}/${api.apiName}.md)`).join('\n')}
`;
  }

  async generateApiDoc(apiId) {
    // 获取API数据
    const api = await this.storage.getApi(apiId);
    if (!api) {
      throw new Error(`API不存在: ${apiId}`);
    }
    
    // 获取模块数据（用于导航链接）
    const module = await this.storage.getModule(api.moduleId);
    if (!module) {
      throw new Error(`模块不存在: ${api.moduleId}`);
    }
    
    // 生成API文档
    const markdown = this.generateApiMarkdown(api, module);
    
    // 确保模块的API目录存在
    const moduleApiDir = path.join(this.apisDir, module.moduleName);
    await fs.mkdir(moduleApiDir, { recursive: true });
    
    // 写入文件
    const docFile = path.join(moduleApiDir, `${api.apiName}.md`);
    await fs.writeFile(docFile, markdown);
    
    return docFile;
  }

  generateApiMarkdown(api, module) {
    return `# ${api.displayName || api.apiName}

**模块:** [${module.displayName || module.moduleName}](../../modules/${module.moduleName})

## 函数声明

\`\`\`
${api.functionDeclaration}
\`\`\`

## 描述

${api.description}
`;
  }

  async updateIndexPage() {
    // 获取所有模块
    const modules = await this.storage.listModules();
    
    // 生成索引页内容
    const markdown = this.generateIndexMarkdown(modules);
    
    // 写入文件
    const indexFile = path.join(this.docsDir, 'index.md');
    await fs.writeFile(indexFile, markdown);
    
    return indexFile;
  }

  generateIndexMarkdown(modules) {
    return `# API文档

## 模块列表

${modules.map(module => `- [${module.displayName || module.moduleName}](modules/${module.moduleName})`).join('\n')}
`;
  }
}

module.exports = { DocumentGenerator };