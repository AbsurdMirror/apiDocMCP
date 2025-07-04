# MCP Inspector 调试指南

## 问题修复说明

在使用MCP Inspector进行调试时，可能会遇到以下错误：

```
Error from MCP server: SyntaxError: Unexpected token 'M', "MCP服务器已启动:" is not valid JSON
```

这是因为MCP Inspector期望所有通过标准输出（stdout）的内容都是有效的JSON格式，而我们的服务器代码在启动时通过`console.log`输出了非JSON格式的消息。

### 修复方法

我们已经将所有的`console.log`调用改为`console.error`，这样日志信息会输出到标准错误（stderr）而不是标准输出（stdout），从而避免干扰MCP协议通信。

修改的文件包括：
- `src/index.js`
- `src/server.js`
- `test-with-inspector.js`
- `test-requests.js`

## 使用MCP Inspector的正确方法

1. 启动MCP服务器并注入Inspector：
   ```
   node test-with-inspector.js
   ```

2. 注意控制台输出中的会话令牌（Session token）

3. 将会话令牌设置为环境变量：
   ```
   set MCP_PROXY_AUTH_TOKEN=your_token_here  # Windows
   export MCP_PROXY_AUTH_TOKEN=your_token_here  # Linux/Mac
   ```
   或者直接在`test-requests.js`中设置`proxyAuthToken`变量

4. 运行测试请求：
   ```
   node test-requests.js
   ```

## 注意事项

1. 在开发MCP服务器时，避免使用`console.log`输出非JSON格式的消息，应该使用`console.error`代替

2. 如果需要在MCP协议中输出消息，确保它是有效的JSON格式

3. 使用Inspector调试时，所有通过标准输出（stdout）的内容必须是有效的JSON格式

4. 如果需要查看更多调试信息，可以访问Inspector提供的Web界面（通常在`http://localhost:6274`）
