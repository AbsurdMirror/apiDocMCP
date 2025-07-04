// src/server.js - MCP服务器入口
const { McpServer: ModelContextServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const tools = require('./tools');

class McpServer {
  constructor(config) {
    this.config = config;
    this.server = null;
  }

  initialize() {
    this.server = new ModelContextServer({
      name: "api-doc-mcp",
      version: "1.0.0"
      // 不在这里传递config，而是在工具处理函数中手动添加
    });
    
    // 注册工具
    this.registerTools();
    
    // 设置传输层
    this.transport = new StdioServerTransport();
  }
  
  registerTools() {
    // 注册所有工具
    [
     tools.addModule,
     tools.addApi,
     tools.updateModule,
     tools.updateApi,
     tools.listModules,
     tools.listApis,
     tools.getModuleDetails,
     tools.getApiDetails
    ].forEach(tool => {
      // 创建一个绑定了config的处理函数
      const handlerWithConfig = async (input, context) => {
        // 确保context.serverContext存在
        if (!context.serverContext) {
          context.serverContext = {};
        }
        // 将config添加到serverContext中
        context.serverContext.config = this.config;
        // 调用原始处理函数
        return await tool.handler(input, context);
      };
      
      var a = this.server.registerTool(
        tool.name,
        {
          title: tool.title || tool.name,
          description: tool.description || "",
          inputSchema: tool.inputSchema
        },
        handlerWithConfig
      );
      console.error(a);
    });
  }

  async start() {
    try {
      await this.server.connect(this.transport);
      const port = this.config.port || 3000;
      // 使用console.error输出服务器信息，避免干扰MCP协议通信
      console.error(`MCP Server running on port ${port}`);
    } catch (error) {
      console.error('Failed to start MCP server:', error);
    }
  }
}

module.exports = McpServer;