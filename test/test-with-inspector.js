// test-with-inspector.js
// 用于启动MCP服务器并注入Inspector进行调试

/**
 * 使用说明：
 * 1. 运行此脚本启动MCP服务器并注入Inspector
 * 2. 注意控制台输出中的会话令牌（Session token）
 * 3. 将会话令牌复制并设置为环境变量或直接在test-requests.js中设置
 * 4. 或者使用控制台输出的带有令牌的URL直接访问Inspector界面
 */

const { spawn } = require('child_process');
const path = require('path');

// 配置参数
const serverPath = path.join(__dirname, '..', 'src', 'index.js').replace(/\\/g, '/');
const inspectorCommand = 'npx';
const inspectorArgs = [
  '@modelcontextprotocol/inspector',
  'node',
  serverPath
];

// 启动带Inspector的MCP服务器
// 使用console.error输出信息，避免干扰MCP协议通信
console.error('启动MCP服务器并注入Inspector...');
console.error(`执行命令: ${inspectorCommand} ${inspectorArgs.join(' ')}`);

const serverProcess = spawn(inspectorCommand, inspectorArgs, {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('启动失败:', error);
});

process.on('SIGINT', () => {
  console.error('正在关闭服务器...');
  serverProcess.kill();
  process.exit();
});