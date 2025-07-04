# MCP服务器测试指南

本文档提供了使用MCP Inspector对API文档MCP服务器进行测试和调试的详细说明。

## 一、环境准备

### 安装MCP Inspector

```bash
npm install -g @modelcontextprotocol/inspector
```

## 二、测试流程

### 1. 启动带Inspector的MCP服务器

使用提供的测试脚本启动MCP服务器并注入Inspector：

```bash
node test-with-inspector.js
```

这将启动MCP服务器，并通过Inspector代理所有请求和响应。Inspector默认在http://localhost:3333提供Web界面。

### 2. 发送测试请求

使用提供的测试脚本发送一系列测试请求：

```bash
node test-requests.js
```

这将执行以下测试：
- 获取工具列表
- 测试addModule工具
- 测试listModules工具

### 3. 通过Inspector Web界面分析

1. 打开浏览器访问 http://localhost:3333
2. 在Inspector界面中，您可以：
   - 查看所有请求和响应
   - 分析错误详情
   - 手动发送自定义请求

## 三、手动测试

您也可以通过Inspector Web界面手动发送请求：

### 获取工具列表

```json
{"method":"tools/list","params":{},"jsonrpc":"2.0","id":1}
```

### 执行addModule工具

```json
{"method":"tools/execute","params":{"tool":"addModule","input":{"moduleName":"testModule","description":"这是一个测试模块"}},"jsonrpc":"2.0","id":2}
```

### 执行listModules工具

```json
{"method":"tools/execute","params":{"tool":"listModules","input":{}},"jsonrpc":"2.0","id":3}
```

## 四、错误分析

如果遇到"Cannot read properties of null (reading '_def')"错误，请检查：

1. 工具返回格式是否符合MCP协议要求
2. Zod验证模式是否正确定义
3. 输入参数是否符合工具的inputSchema定义

### 错误响应示例

```json
{
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": {
      "details": "Cannot read properties of null (reading '_def')",
      "stack": "TypeError: Cannot read properties of null..."
    }
  }
}
```

## 五、调试技巧

1. 检查工具返回格式：确保所有工具都返回符合MCP协议的响应格式
2. 验证inputSchema：确保所有工具的inputSchema正确定义
3. 检查Zod版本：确保使用的Zod版本与MCP SDK兼容
4. 查看完整错误堆栈：通过Inspector获取完整的错误堆栈信息
