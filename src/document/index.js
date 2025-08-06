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

  async generateModuleDoc(moduleId, parentPath = '') {
    const module = await this.storage.getModule(moduleId);
    if (!module) {
      throw new Error(`模块不存在: ${moduleId}`);
    }

    const currentPath = path.join(parentPath, module.moduleName);
    const markdown = await this.generateModuleMarkdown(module, parentPath);

    const moduleDocDir = path.join(this.modulesDir, parentPath);
    await fs.mkdir(moduleDocDir, { recursive: true });

    const docFile = path.join(moduleDocDir, `${module.moduleName}.md`);
    await fs.writeFile(docFile, markdown);

    if (module.subModules && module.subModules.length > 0) {
      for (const subModuleInfo of module.subModules) {
        await this.generateModuleDoc(subModuleInfo.moduleId, currentPath);
      }
    }

    // Only update index for top-level calls
    if (parentPath === '') {
        await this.updateIndexPage();
    }

    return docFile;
  }

  async generateModuleMarkdown(module, parentPath) {
    const modulePath = path.join(parentPath, module.moduleName).replace(/\\/g, '/');
    const moduleDocFile = path.join(this.modulesDir, parentPath, `${module.moduleName}.md`);
    const fromDir = path.dirname(moduleDocFile);

    const apiList = module.apis.map(api => {
        const toFile = path.join(this.apisDir, modulePath, `${api.apiName}.md`);
        const relativeLink = path.relative(fromDir, toFile).replace(/\\/g, '/');
        return `- [${api.apiName}](${relativeLink})`;
    }).join('\n');

    let subModuleList = '';
    if (module.subModules && module.subModules.length > 0) {
      subModuleList = '\n\n## 子模块列表\n\n' + module.subModules.map(subModule => {
        return `- [${subModule.moduleName}](${module.moduleName}/${subModule.moduleName}.md)`;
      }).join('\n');
    }

    return `# ${module.moduleName}\n\n## 描述\n\n${module.description}\n\n## API列表\n\n${apiList}${subModuleList}`;
  }

  async generateApiDoc(apiId) {
    const api = await this.storage.getApi(apiId);
    if (!api) {
      throw new Error(`API不存在: ${apiId}`);
    }

    const module = await this.storage.getModule(api.moduleId);
    if (!module) {
      throw new Error(`模块不存在: ${api.moduleId}`);
    }

    const modulePath = await this.getModulePath(module.moduleId);
    const markdown = this.generateApiMarkdown(api, module, modulePath);
    const moduleApiDir = path.join(this.apisDir, modulePath);
    await fs.mkdir(moduleApiDir, { recursive: true });

    const docFile = path.join(moduleApiDir, `${api.apiName}.md`);
    await fs.writeFile(docFile, markdown);

    return docFile;
  }

  generateApiMarkdown(api, module, modulePath) {
    const relativeModulePath = path.relative(path.join(this.apisDir, modulePath), this.modulesDir).replace(/\\/g, '/');
    const lines = [
      `# ${api.apiName}`,
      '',
      `**模块:** [${module.moduleName}](${relativeModulePath}/${modulePath}.md)`,
      '',
      '## 函数声明',
      '',
      '```',
      api.functionDeclaration,
      '```',
      '',
      '## 描述',
      '',
      api.description,
    ];
    return lines.join('\n');
  }

  async updateIndexPage() {
    const modules = await this.storage.listModules({ isRoot: true });
    const markdown = await this.generateIndexMarkdown(modules, 0);

    const indexFile = path.join(this.docsDir, 'index.md');
    await fs.writeFile(indexFile, markdown);

    return indexFile;
  }

  async generateIndexMarkdown(modules, level) {
    let markdown = '';
    const indent = '  '.repeat(level);

    for (const moduleInfo of modules) {
      const module = await this.storage.getModule(moduleInfo.moduleId);
      if (!module) continue;

      const modulePath = await this.getModulePath(module.moduleId);
      markdown += `${indent}- [${module.moduleName}](modules/${modulePath}.md)\n`;

      if (module.subModules && module.subModules.length > 0) {
        const subModulesInfo = module.subModules.map(sm => ({ moduleId: sm.moduleId, moduleName: sm.moduleName }));
        markdown += await this.generateIndexMarkdown(subModulesInfo, level + 1);
      }
    }
    if (level === 0) {
        return `# API文档\n\n## 模块列表\n\n${markdown}`;
    }

    return markdown;
  }

  async getModulePath(moduleId) {
    const module = await this.storage.getModule(moduleId);
    if (!module) return '';

    if (module.parentModuleId) {
        const parentPath = await this.getModulePath(module.parentModuleId);
        return path.join(parentPath, module.moduleName);
    }
    return module.moduleName;
  }
}

module.exports = { DocumentGenerator };