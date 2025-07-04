#!/usr/bin/env node
// src/index.js - MCP服务器入口
const McpServer = require('./server');
const { SyncEngine } = require('./sync');
const { Command } = require('commander');
const os = require('os');
const path = require('path');

// 获取用户主目录
const userHomeDir = os.homedir();
const defaultDataDir = path.join(userHomeDir, '.mcpDocData', 'data');
const defaultDocsDir = path.join(userHomeDir, '.mcpDocData', 'docs');

// 命令行参数解析
const program = new Command();
program
  .version('1.0.0')
  .option('-p, --port <number>', 'MCP服务器端口', 3000)
  .option('-w, --web-port <number>', 'Web服务器端口', 8080)
  .option('-d, --data-dir <path>', '数据目录路径', defaultDataDir)
  .option('-o, --docs-dir <path>', '文档目录路径', defaultDocsDir)
  .parse(process.argv);

const options = program.opts();

// 配置
const config = {
  port: process.env.PORT || options.port,
  webPort: process.env.WEB_PORT || options.webPort,
  dataDir: process.env.DATA_DIR || options.dataDir,
  docsDir: process.env.DOCS_DIR || options.docsDir,
  auth: {
    // 认证配置
    enabled: false,
    // 这里可以添加更多认证相关配置
  }
};

// 启动MCP服务器
const mcpServer = new McpServer(config);
mcpServer.initialize();
mcpServer.start();

// Web服务器已移至单独的入口文件 src/web-server.js

// 初始同步
const syncEngine = new SyncEngine(config);
syncEngine.syncAll().catch(console.error);

// 使用console.error输出服务器信息，避免干扰MCP协议通信
console.error(`
MCP服务器已启动:
- MCP服务器运行在端口 ${config.port}
- 数据目录: ${config.dataDir}
- 文档目录: ${config.docsDir}
`);