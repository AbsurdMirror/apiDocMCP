# apiDocMcp设计文档（精简版）

## 1. 概述

MCP（Model Context Protocol，模型上下文协议）是一种开放协议，旨在实现大型语言模型（LLM）应用与外部数据源、工具和服务之间的无缝集成。本项目旨在设计并实现一个基于MCP的API文档管理系统，该系统将允许AI通过MCP接口结构化地读写API文档，同时支持用户以Markdown格式查看这些文档。

本系统的主要目标包括：

1. 提供简化的MCP接口，用于API文档的创建和读取操作
2. 支持文档以Markdown格式存储，便于人类阅读
3. 提供友好的用户界面，便于开发者和用户查阅API文档

## 2. MCP接口设计（精简版）

MCP接口设计遵循MCP协议规范，提供简化的工具（tools）用于API文档的管理。每个工具都有明确定义的输入模式（inputSchema）和返回值（return）。以下是主要接口的设计：

### 2.1. 新增模块

1. name: `addModule`
2. 描述: 创建新的API模块，包括模块名称和描述
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "moduleName": {
      "type": "string",
      "description": "模块的唯一标识名称"
    },
    "description": {
      "type": "string",
      "description": "模块的详细描述"
    }
  },
  "required": ["moduleName", "description"]
}
```

4. return:

```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "操作是否成功"
    },
    "moduleId": {
      "type": "string",
      "description": "新创建的模块ID"
    }
  },
  "required": ["success", "moduleId"]
}
```

### 2.2. 新增接口

1. name: `addApi`
2. 描述: 在指定模块中创建新的API接口
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "moduleId": {
      "type": "string",
      "description": "API所属的模块ID"
    },
    "apiName": {
      "type": "string",
      "description": "API的唯一标识名称"
    },
    "functionDeclaration": {
      "type": "string",
      "description": "API的函数声明"
    },
    "description": {
      "type": "string",
      "description": "API的详细描述"
    }
  },
  "required": ["moduleId", "apiName", "functionDeclaration", "description"]
}
```

4. return:

```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "操作是否成功"
    },
    "apiId": {
      "type": "string",
      "description": "新创建的API ID"
    }
  },
  "required": ["success", "apiId"]
}
```

### 2.3. 读取模块

1. name: `getModule`
2. 描述: 获取指定模块的详细信息
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "moduleId": {
      "type": "string",
      "description": "要获取详情的模块ID"
    }
  },
  "required": ["moduleId"]
}
```

4. return:

```json
{
  "type": "object",
  "properties": {
    "moduleId": {
      "type": "string",
      "description": "模块ID"
    },
    "moduleName": {
      "type": "string",
      "description": "模块名称"
    },
    "description": {
      "type": "string",
      "description": "模块详细描述"
    },
    "apis": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "apiId": {
            "type": "string",
            "description": "API ID"
          },
          "apiName": {
            "type": "string",
            "description": "API名称"
          }
        }
      },
      "description": "模块中包含的API列表"
    }
  },
  "required": ["moduleId", "moduleName", "description", "apis"]
}
```

### 2.4. 读取接口

1. name: `getApi`
2. 描述: 获取指定API接口的详细文档
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "apiId": {
      "type": "string",
      "description": "要获取详情的API ID"
    }
  },
  "required": ["apiId"]
}
```

4. return:

```json
{
  "type": "object",
  "properties": {
    "apiId": {
      "type": "string",
      "description": "API ID"
    },
    "moduleId": {
      "type": "string",
      "description": "所属模块ID"
    },
    "apiName": {
      "type": "string",
      "description": "API名称"
    },
    "functionDeclaration": {
      "type": "string",
      "description": "API的函数声明"
    },
    "description": {
      "type": "string",
      "description": "API详细描述"
    }
  },
  "required": ["apiId", "moduleId", "apiName", "functionDeclaration", "description"]
}
```

## 3. API文档设计（精简版）

本系统的API文档设计采用Markdown格式，便于人类阅读和理解。

### 3.1. 简化数据结构

系统的核心数据结构设计如下：

1. **模块（Module）**：

   ```json
   {
     "moduleId": "string",
     "moduleName": "string",
     "description": "string",
     "apis": [Api]
   }
   ```

2. **接口（Api）**：

   ```json
   {
     "apiId": "string",
     "apiName": "string",
     "functionDeclaration": "string",
     "description": "string"
   }
   ```

### 3.2. 文档化存储

文档采用Markdown格式存储，便于人类阅读和在Web界面展示。主要特点：

1. **文件组织**：
   - `/docs/index.md`：文档首页，包含模块导航
   - `/docs/modules/{moduleName}.md`：每个模块的文档
   - `/docs/apis/{moduleName}/{apiName}.md`：每个API的详细文档

2. **文档结构**：
   - 模块文档包含模块名称、描述和API列表
   - API文档包含API名称、函数声明和详细描述
   - 支持代码高亮、表格和其他Markdown特性

## 4. MCP实现设计（精简版）

### 4.1. 技术栈选择

本系统的技术栈选择如下：

1. **后端框架**：
   - Node.js + Express.js：提供轻量级API服务

2. **数据存储**：
   - 文件系统：使用简单的文件存储数据

3. **文档生成**：
   - Markdown生成器：将数据转换为Markdown文档

4. **前端界面**：
   - 简单的HTML/CSS/JS界面，用于浏览文档

### 4.2. 系统架构

系统架构由以下几个主要组件组成：

1. **MCP服务器**：
   - 实现四个核心MCP接口
   - 处理API请求和响应

2. **文档生成器**：
   - 将数据转换为Markdown文档
   - 生成简单的导航链接

3. **Web界面**：
   - 提供文档浏览功能
   - 支持简单的搜索

### 4.3. 部署方式

系统支持简单的本地部署：

1. **本地部署**：
   - 支持单机部署，适用于个人或小型团队
   - 提供简单的启动脚本

2. **使用方式**：
   - 通过HTTP API调用MCP接口
   - 通过Web界面浏览生成的文档
