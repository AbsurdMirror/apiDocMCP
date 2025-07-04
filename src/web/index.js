// src/web/index.js - Web服务器入口
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { StorageManager } = require('../storage');

class WebServer {
  constructor(config = {}) {
    this.config = config;
    this.port = config.port || 8080;
    this.docsDir = config.docsDir || path.join(process.cwd(), 'docs');
    this.storage = new StorageManager(config);
    this.app = express();
    
    this.setupRoutes();
  }

  setupRoutes() {
    // 静态文件服务
    this.app.use('/docs', express.static(this.docsDir));
    
    // API路由
    this.app.get('/api/modules', this.listModules.bind(this));
    this.app.get('/api/modules/:moduleId', this.getModule.bind(this));
    this.app.get('/api/modules/:moduleId/apis', this.listApis.bind(this));
    this.app.get('/api/apis/:apiId', this.getApi.bind(this));
    
    // 前端路由
    this.app.get('/', (req, res) => {
      res.redirect('/docs');
    });
    
    // 文档浏览路由
    this.app.get('/docs', async (req, res) => {
      try {
        const indexPath = path.join(this.docsDir, 'index.md');
        const content = await fs.readFile(indexPath, 'utf8');
        res.send(this.renderMarkdown(content, 'API文档'));
      } catch (error) {
        res.status(404).send(this.renderError('文档首页不存在'));
      }
    });
    
    this.app.get('/docs/modules/:moduleName', async (req, res) => {
      try {
        const modulePath = path.join(this.docsDir, 'modules', `${req.params.moduleName}.md`);
        const content = await fs.readFile(modulePath, 'utf8');
        res.send(this.renderMarkdown(content, `模块: ${req.params.moduleName}`));
      } catch (error) {
        res.status(404).send(this.renderError('模块文档不存在'));
      }
    });
    
    this.app.get('/docs/apis/:moduleName/:apiName', async (req, res) => {
      try {
        const apiPath = path.join(this.docsDir, 'apis', req.params.moduleName, `${req.params.apiName}.md`);
        const content = await fs.readFile(apiPath, 'utf8');
        res.send(this.renderMarkdown(content, `API: ${req.params.apiName}`));
      } catch (error) {
        res.status(404).send(this.renderError('API文档不存在'));
      }
    });
    
    // 搜索路由
    this.app.get('/search', async (req, res) => {
      const query = req.query.q || '';
      if (!query) {
        return res.redirect('/docs');
      }
      
      try {
        // 搜索模块
        const modules = await this.storage.listModules({ moduleName: query });
        
        // 构建模块搜索结果
        const results = {
          modules: modules.map(m => ({
            name: m.moduleName,
            url: `/docs/modules/${m.moduleName}`,
            type: '模块'
          })),
          apis: []
        };
        
        // 搜索所有模块中的API
        for (const module of modules) {
          try {
            const apis = await this.storage.listApis(module.moduleId, { apiName: query });
            if (apis && apis.length > 0) {
              // 将找到的API添加到结果中
              results.apis.push(...apis.map(api => ({
                name: api.apiName,
                url: `/docs/apis/${module.moduleName}/${api.apiName}`,
                type: 'API',
                module: module.moduleName
              })));
            }
          } catch (error) {
            console.error(`搜索模块 ${module.moduleName} 的API时出错:`, error);
            // 继续搜索其他模块的API
          }
        }
        
        // 渲染搜索结果页面
        res.send(this.renderSearchResults(query, results));
      } catch (error) {
        res.status(500).send(this.renderError(`搜索失败: ${error.message}`));
      }
    });
  }

  async listModules(req, res) {
    try {
      const modules = await this.storage.listModules(req.query);
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getModule(req, res) {
    try {
      const module = await this.storage.getModule(req.params.moduleId);
      if (!module) {
        return res.status(404).json({ error: '模块不存在' });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async listApis(req, res) {
    try {
      const apis = await this.storage.listApis(req.params.moduleId, req.query);
      res.json(apis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getApi(req, res) {
    try {
      const api = await this.storage.getApi(req.params.apiId);
      if (!api) {
        return res.status(404).json({ error: 'API不存在' });
      }
      res.json(api);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 处理Markdown内容中的链接，支持.md后缀
  processMarkdownLinks(content) {
    // 处理首页到模块的链接 [模块名](modules/模块名.md) -> [模块名](/docs/modules/模块名)
    let processedContent = content.replace(/\[([^\]]+)\]\(modules\/([^\)]+)\.md\)/g, (match, text, moduleName) => {
      return `[${text}](/docs/modules/${moduleName})`;
    });
    
    // 处理模块文档中到API的链接 [API名称](../apis/模块名/API名.md) -> [API名称](/docs/apis/模块名/API名)
    processedContent = processedContent.replace(/\[([^\]]+)\]\(\.\.\/apis\/([^\)\/]+)\/([^\)]+)\.md\)/g, (match, text, moduleName, apiName) => {
      return `[${text}](/docs/apis/${moduleName}/${apiName})`;
    });
    
    // 处理API文档中到模块的链接 [模块名](../../modules/模块名.md) -> [模块名](/docs/modules/模块名)
    processedContent = processedContent.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/modules\/([^\)]+)\.md\)/g, (match, text, moduleName) => {
      return `[${text}](/docs/modules/${moduleName})`;
    });
    
    return processedContent;
  }

  renderMarkdown(content, title) {
    // 处理Markdown内容中的链接
    const processedContent = this.processMarkdownLinks(content);
    
    // 生成面包屑导航
    let breadcrumbs = '';
    
    // 根据标题判断当前页面类型并生成相应的面包屑
    if (title === 'API文档') {
      // 首页
      breadcrumbs = `<span class="breadcrumb-item current">首页</span>`;
    } else if (title.startsWith('模块: ')) {
      // 模块页面
      const moduleName = title.replace('模块: ', '');
      breadcrumbs = `
        <a class="breadcrumb-item" href="/docs">首页</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item current">${moduleName}</span>
      `;
    } else if (title.startsWith('API: ')) {
      // API页面
      const apiName = title.replace('API: ', '');
      // 从内容中尝试提取模块名
      const moduleMatch = content.match(/\[([^\]]+)\]\(\.\.\/\.\.\/modules\/([^\)]+)\.md\)/);
      const moduleName = moduleMatch ? moduleMatch[2] : '未知模块';
      
      breadcrumbs = `
        <a class="breadcrumb-item" href="/docs">首页</a>
        <span class="breadcrumb-separator">/</span>
        <a class="breadcrumb-item" href="/docs/modules/${moduleName}">${moduleName}</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item current">${apiName}</span>
      `;
    } else if (title.startsWith('搜索: ')) {
      // 搜索结果页面
      const query = title.replace('搜索: ', '');
      breadcrumbs = `
        <a class="breadcrumb-item" href="/docs">首页</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item current">搜索: ${query}</span>
      `;
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - API文档</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.1.0/github-markdown.min.css">
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #24292e;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
          }
          @media (max-width: 767px) {
            body {
              padding: 15px;
            }
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eaecef;
          }
          .search-form {
            display: flex;
          }
          .search-input {
            padding: 6px 12px;
            font-size: 14px;
            line-height: 20px;
            color: #24292e;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            outline: none;
            width: 240px;
          }
          .search-button {
            margin-left: 10px;
            padding: 6px 12px;
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            color: #fff;
            background-color: #2ea44f;
            border: 1px solid rgba(27, 31, 35, 0.15);
            border-radius: 6px;
            cursor: pointer;
          }
          .breadcrumb {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #586069;
            flex-wrap: wrap;
          }
          .breadcrumb-item {
            padding: 4px 8px;
          }
          .breadcrumb-item.current {
            font-weight: 600;
            color: #24292e;
          }
          .breadcrumb-separator {
            color: #586069;
          }
          .breadcrumb a {
            color: #0366d6;
            text-decoration: none;
          }
          .breadcrumb a:hover {
            text-decoration: underline;
          }
          .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <form class="search-form" action="/search" method="get">
            <input class="search-input" type="text" name="q" placeholder="搜索文档...">
            <button class="search-button" type="submit">搜索</button>
          </form>
        </div>
        <div class="breadcrumb">
          ${breadcrumbs}
        </div>
        <div class="markdown-body" id="content"></div>
        <script>
          document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(processedContent)});
        </script>
      </body>
      </html>
    `;
  }

  renderSearchResults(query, results) {
    const modulesHtml = results.modules.map(m => 
      `<li><a href="${m.url}">${m.name}</a> (${m.type})</li>`
    ).join('');
    
    const apisHtml = results.apis.map(api => 
      `<li><a href="${api.url}">${api.name}</a> (${api.type}, 所属模块: ${api.module})</li>`
    ).join('');
    
    const content = `# 搜索结果: "${query}"

## 模块 (${results.modules.length})

${results.modules.length > 0 ? '<ul>' + modulesHtml + '</ul>' : '没有找到匹配的模块'}

## API接口 (${results.apis.length})

${results.apis.length > 0 ? '<ul>' + apisHtml + '</ul>' : '没有找到匹配的API接口'}
`;
    
    // 直接使用renderMarkdown方法，它会自动处理Markdown内容中的链接
    return this.renderMarkdown(content, `搜索: ${query}`);
  }

  renderError(message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>错误 - API文档</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #24292e;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .breadcrumb {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #586069;
            flex-wrap: wrap;
            justify-content: center;
          }
          .breadcrumb-item {
            padding: 4px 8px;
          }
          .breadcrumb-item.current {
            font-weight: 600;
            color: #24292e;
          }
          .breadcrumb-separator {
            color: #586069;
          }
          .breadcrumb a {
            color: #0366d6;
            text-decoration: none;
          }
          .breadcrumb a:hover {
            text-decoration: underline;
          }
          .error-container {
            text-align: center;
          }
          .error {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8d7da;
            color: #721c24;
            border-radius: 5px;
          }
          .home-link {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #0366d6;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>出错了</h1>
        </div>
        <div class="breadcrumb">
          <a class="breadcrumb-item" href="/docs">首页</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">错误</span>
        </div>
        <div class="error-container">
          <div class="error">${message}</div>
          <a href="/docs" class="home-link">返回首页</a>
        </div>
      </body>
      </html>
    `;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Web服务器运行在端口 ${this.port}`);
    });
  }
}

module.exports = { WebServer };