// test-requests.js
// 用于向MCP服务器发送测试请求

/**
 * 使用说明：
 * 1. 启动MCP Inspector时，会在控制台输出会话令牌
 * 2. 将会话令牌设置为环境变量 MCP_PROXY_AUTH_TOKEN
 *    例如：set MCP_PROXY_AUTH_TOKEN=your_token_here (Windows)
 *    或：export MCP_PROXY_AUTH_TOKEN=your_token_here (Linux/Mac)
 * 3. 或者直接在下方配置部分设置 proxyAuthToken 变量
 */

const http = require('http');

// 配置
const inspectorHost = 'localhost';
const inspectorPort = 6274; // MCP Inspector代理服务器端口（不是Web界面端口6274）

// 代理会话令牌 - 需要从控制台输出中获取并在此处设置
const proxyAuthToken = process.env.MCP_PROXY_AUTH_TOKEN || 'fb4ec057cd5f30c92704bdb70f20a6a414bea1c5de87b95a451e2e984945e03d'; // 从环境变量获取或设置为空字符串

// 检查是否禁用身份验证
const isAuthDisabled = process.env.DANGEROUSLY_OMIT_AUTH === 'true';
if (isAuthDisabled) {
  console.error('警告: 身份验证已禁用，这可能会带来安全风险');
} else if (!proxyAuthToken) {
  console.warn('警告: 未设置会话令牌，请确保已设置环境变量MCP_PROXY_AUTH_TOKEN或在此文件中直接设置proxyAuthToken变量');
  console.warn('      或者设置环境变量DANGEROUSLY_OMIT_AUTH=true禁用身份验证（仅用于测试）');
}

// 测试请求函数
async function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      method,
      params,
      jsonrpc: '2.0',
      id: Date.now()
    });

    // 准备请求头
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    };
    
    // 如果未禁用身份验证且有令牌，则添加Authorization头
    if (!isAuthDisabled && proxyAuthToken) {
      headers['Authorization'] = `Bearer ${proxyAuthToken}`;
    }
    
    const options = {
      hostname: inspectorHost,
      port: inspectorPort,
      path: '/',
      method: 'POST',
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          console.log(data);
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(requestData);
    req.end();
  });
}

// 测试用例
async function runTests() {
  try {
    console.error('1. 获取工具列表');
    const toolsListResponse = await sendRequest('tools/list', {});
    console.error(JSON.stringify(toolsListResponse, null, 2));

    console.error('\n2. 测试addModule工具');
    const addModuleResponse = await sendRequest('tools/execute', {
      tool: 'addModule',
      input: {
        moduleName: 'testModule',
        description: '这是一个测试模块'
      }
    });
    console.error(JSON.stringify(addModuleResponse, null, 2));

    console.error('\n3. 测试listModules工具');
    const listModulesResponse = await sendRequest('tools/execute', {
      tool: 'listModules',
      input: {}
    });
    console.error(JSON.stringify(listModulesResponse, null, 2));

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 执行测试
console.error('开始MCP协议测试...');
runTests();