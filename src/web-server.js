#!/usr/bin/env node
// src/web-server.js - Web服务器独立入口
const { WebServer } = require('./web');
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
  .option('-p, --port <number>', 'Web服务器端口', 8080)
  .option('-d, --data-dir <path>', '数据目录路径', defaultDataDir)
  .option('-o, --docs-dir <path>', '文档目录路径', defaultDocsDir)
  .parse(process.argv);

const options = program.opts();

// 配置
const config = {
  port: process.env.WEB_PORT || options.port,
  dataDir: process.env.DATA_DIR || options.dataDir,
  docsDir: process.env.DOCS_DIR || options.docsDir,
};

// 启动Web服务器
const webServer = new WebServer(config);
webServer.start();

console.log(`
Web服务器已启动:
- Web服务器运行在端口 ${config.port}
- 数据目录: ${config.dataDir}
- 文档目录: ${config.docsDir}

在浏览器中访问: http://localhost:${config.port}
`);