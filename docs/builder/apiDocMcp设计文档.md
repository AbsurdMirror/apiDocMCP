# apiDocMcp设计文档

## 1. 概述

MCP（Model Context Protocol，模型上下文协议）是一种开放协议，旨在实现大型语言模型（LLM）应用与外部数据源、工具和服务之间的无缝集成。本项目旨在设计并实现一个基于MCP的API文档管理系统，该系统将允许AI通过MCP接口结构化地读写API文档，同时支持用户以Markdown格式查看这些文档。

本系统的主要目标包括：

1. 提供标准化的MCP接口，用于API文档的创建、读取、更新和删除操作
2. 支持文档的双重存储形式：结构化存储（便于AI处理）和文档化存储（便于人类阅读）
3. 实现两种存储形式之间的同步机制
4. 提供友好的用户界面，便于开发者和用户查阅API文档

## 2. MCP接口设计

MCP接口设计遵循标准的MCP协议规范，提供一系列工具（tools）用于API文档的管理。每个工具都有明确定义的输入模式（inputSchema）和返回值（return）。以下是主要接口的设计：

### 2.1. 新增模块

1. name: `addModule`
2. 描述: 创建新的API模块，包括模块名称、描述和其他元数据
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "moduleName": {
      "type": "string",
      "description": "模块的唯一标识名称"
    },
    "displayName": {
      "type": "string",
      "description": "模块的显示名称"
    },
    "description": {
      "type": "string",
      "description": "模块的详细描述"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "与模块相关的标签列表"
    },
    "version": {
      "type": "string",
      "description": "模块的版本号，遵循语义化版本规范"
    }
  },
  "required": ["moduleName", "displayName", "description"]
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
    },
    "message": {
      "type": "string",
      "description": "操作结果的描述信息"
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
    "displayName": {
      "type": "string",
      "description": "API的显示名称"
    },
    "description": {
      "type": "string",
      "description": "API的详细描述"
    },
    "endpoint": {
      "type": "string",
      "description": "API的访问路径"
    },
    "method": {
      "type": "string",
      "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"],
      "description": "API的HTTP方法"
    },
    "requestSchema": {
      "type": "object",
      "description": "API请求参数的JSON Schema定义"
    },
    "responseSchema": {
      "type": "object",
      "description": "API响应数据的JSON Schema定义"
    },
    "examples": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "request": {
            "type": "object",
            "description": "请求示例"
          },
          "response": {
            "type": "object",
            "description": "响应示例"
          },
          "description": {
            "type": "string",
            "description": "示例描述"
          }
        }
      },
      "description": "API的请求和响应示例"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "与API相关的标签列表"
    }
  },
  "required": ["moduleId", "apiName", "displayName", "description", "endpoint", "method"]
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
    },
    "message": {
      "type": "string",
      "description": "操作结果的描述信息"
    }
  },
  "required": ["success", "apiId"]
}
```

### 2.3. 修改模块

1. name: `updateModule`
2. 描述: 更新现有API模块的信息
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "moduleId": {
      "type": "string",
      "description": "要更新的模块ID"
    },
    "displayName": {
      "type": "string",
      "description": "模块的新显示名称"
    },
    "description": {
      "type": "string",
      "description": "模块的新详细描述"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "与模块相关的新标签列表"
    },
    "version": {
      "type": "string",
      "description": "模块的新版本号"
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
    "success": {
      "type": "boolean",
      "description": "操作是否成功"
    },
    "moduleId": {
      "type": "string",
      "description": "更新的模块ID"
    },
    "message": {
      "type": "string",
      "description": "操作结果的描述信息"
    }
  },
  "required": ["success", "moduleId"]
}
```

### 2.4. 修改接口

1. name: `updateApi`
2. 描述: 更新现有API接口的信息
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "apiId": {
      "type": "string",
      "description": "要更新的API ID"
    },
    "displayName": {
      "type": "string",
      "description": "API的新显示名称"
    },
    "description": {
      "type": "string",
      "description": "API的新详细描述"
    },
    "endpoint": {
      "type": "string",
      "description": "API的新访问路径"
    },
    "method": {
      "type": "string",
      "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"],
      "description": "API的新HTTP方法"
    },
    "requestSchema": {
      "type": "object",
      "description": "API请求参数的新JSON Schema定义"
    },
    "responseSchema": {
      "type": "object",
      "description": "API响应数据的新JSON Schema定义"
    },
    "examples": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "request": {
            "type": "object",
            "description": "请求示例"
          },
          "response": {
            "type": "object",
            "description": "响应示例"
          },
          "description": {
            "type": "string",
            "description": "示例描述"
          }
        }
      },
      "description": "API的新请求和响应示例"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "与API相关的新标签列表"
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
    "success": {
      "type": "boolean",
      "description": "操作是否成功"
    },
    "apiId": {
      "type": "string",
      "description": "更新的API ID"
    },
    "message": {
      "type": "string",
      "description": "操作结果的描述信息"
    }
  },
  "required": ["success", "apiId"]
}
```

### 2.5. 读取模块列表

1. name: `listModules`
2. 描述: 获取所有API模块的列表
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "filter": {
      "type": "object",
      "properties": {
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "按标签筛选模块"
        },
        "search": {
          "type": "string",
          "description": "搜索关键词，将匹配模块名称和描述"
        }
      },
      "description": "筛选条件"
    },
    "pagination": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "description": "页码，从1开始"
        },
        "pageSize": {
          "type": "integer",
          "description": "每页项目数"
        }
      },
      "description": "分页参数"
    },
    "sort": {
      "type": "object",
      "properties": {
        "field": {
          "type": "string",
          "enum": ["name", "createdAt", "updatedAt"],
          "description": "排序字段"
        },
        "order": {
          "type": "string",
          "enum": ["asc", "desc"],
          "description": "排序顺序"
        }
      },
      "description": "排序参数"
    }
  }
}
```

4. return:

```json
{
  "type": "object",
  "properties": {
    "modules": {
      "type": "array",
      "items": {
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
          "displayName": {
            "type": "string",
            "description": "模块显示名称"
          },
          "description": {
            "type": "string",
            "description": "模块描述"
          },
          "version": {
            "type": "string",
            "description": "模块版本"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "模块标签"
          },
          "apiCount": {
            "type": "integer",
            "description": "模块中的API数量"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "description": "创建时间"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "description": "最后更新时间"
          }
        }
      },
      "description": "模块列表"
    },
    "pagination": {
      "type": "object",
      "properties": {
        "total": {
          "type": "integer",
          "description": "总项目数"
        },
        "page": {
          "type": "integer",
          "description": "当前页码"
        },
        "pageSize": {
          "type": "integer",
          "description": "每页项目数"
        },
        "totalPages": {
          "type": "integer",
          "description": "总页数"
        }
      },
      "description": "分页信息"
    }
  },
  "required": ["modules", "pagination"]
}
```

### 2.6. 读取接口列表

1. name: `listApis`
2. 描述: 获取指定模块中的API接口列表
3. inputSchema:

```json
{
  "type": "object",
  "properties": {
    "moduleId": {
      "type": "string",
      "description": "模块ID"
    },
    "filter": {
      "type": "object",
      "properties": {
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "按标签筛选API"
        },
        "method": {
          "type": "string",
          "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"],
          "description": "按HTTP方法筛选API"
        },
        "search": {
          "type": "string",
          "description": "搜索关键词，将匹配API名称、描述和路径"
        }
      },
      "description": "筛选条件"
    },
    "pagination": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "description": "页码，从1开始"
        },
        "pageSize": {
          "type": "integer",
          "description": "每页项目数"
        }
      },
      "description": "分页参数"
    },
    "sort": {
      "type": "object",
      "properties": {
        "field": {
          "type": "string",
          "enum": ["name", "method", "createdAt", "updatedAt"],
          "description": "排序字段"
        },
        "order": {
          "type": "string",
          "enum": ["asc", "desc"],
          "description": "排序顺序"
        }
      },
      "description": "排序参数"
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
          },
          "displayName": {
            "type": "string",
            "description": "API显示名称"
          },
          "description": {
            "type": "string",
            "description": "API描述"
          },
          "endpoint": {
            "type": "string",
            "description": "API访问路径"
          },
          "method": {
            "type": "string",
            "description": "API的HTTP方法"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "API标签"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "description": "创建时间"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "description": "最后更新时间"
          }
        }
      },
      "description": "API列表"
    },
    "pagination": {
      "type": "object",
      "properties": {
        "total": {
          "type": "integer",
          "description": "总项目数"
        },
        "page": {
          "type": "integer",
          "description": "当前页码"
        },
        "pageSize": {
          "type": "integer",
          "description": "每页项目数"
        },
        "totalPages": {
          "type": "integer",
          "description": "总页数"
        }
      },
      "description": "分页信息"
    }
  },
  "required": ["apis", "pagination"]
}
```

### 2.7. 读取模块说明

1. name: `getModuleDetails`
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
    "displayName": {
      "type": "string",
      "description": "模块显示名称"
    },
    "description": {
      "type": "string",
      "description": "模块详细描述"
    },
    "version": {
      "type": "string",
      "description": "模块版本"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "模块标签"
    },
    "apiCount": {
      "type": "integer",
      "description": "模块中的API数量"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "创建时间"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "最后更新时间"
    },
    "extendedDescription": {
      "type": "string",
      "description": "模块的扩展描述，可以包含Markdown格式的详细文档"
    },
    "examples": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "示例标题"
          },
          "description": {
            "type": "string",
            "description": "示例描述"
          },
          "code": {
            "type": "string",
            "description": "示例代码"
          }
        }
      },
      "description": "模块使用示例"
    }
  },
  "required": ["moduleId", "moduleName", "displayName", "description"]
}
```

### 2.8. 读取接口文档

1. name: `getApiDetails`
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
    "displayName": {
      "type": "string",
      "description": "API显示名称"
    },
    "description": {
      "type": "string",
      "description": "API描述"
    },
    "endpoint": {
      "type": "string",
      "description": "API访问路径"
    },
    "method": {
      "type": "string",
      "description": "API的HTTP方法"
    },
    "requestSchema": {
      "type": "object",
      "description": "API请求参数的JSON Schema定义"
    },
    "responseSchema": {
      "type": "object",
      "description": "API响应数据的JSON Schema定义"
    },
    "examples": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "request": {
            "type": "object",
            "description": "请求示例"
          },
          "response": {
            "type": "object",
            "description": "响应示例"
          },
          "description": {
            "type": "string",
            "description": "示例描述"
          }
        }
      },
      "description": "API的请求和响应示例"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "API标签"
    },
    "extendedDescription": {
      "type": "string",
      "description": "API的扩展描述，可以包含Markdown格式的详细文档"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "创建时间"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "最后更新时间"
    },
    "relatedApis": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "apiId": {
            "type": "string",
            "description": "相关API的ID"
          },
          "apiName": {
            "type": "string",
            "description": "相关API的名称"
          },
          "relationship": {
            "type": "string",
            "description": "与当前API的关系类型"
          }
        }
      },
      "description": "与当前API相关的其他API列表"
    }
  },
  "required": ["apiId", "moduleId", "apiName", "displayName", "description", "endpoint", "method"]
}
```

## 3. API文档设计

本系统的API文档设计需要同时支持两种使用场景：

1. 文档化演示：用户以Markdown格式查看文档，便于阅读和理解
2. 结构化维护：AI通过MCP接口结构化读写文档，便于自动化处理

### 3.1. 数据结构

系统的核心数据结构设计如下：

1. **顶层结构**：一个模块列表（ModuleCollection）

   ```json
   {
     "modules": [Module],
     "metadata": {
       "version": "string",
       "lastUpdated": "date-time",
       "description": "string"
     }
   }
   ```

2. **模块（Module）**：

   ```json
   {
     "moduleId": "string",
     "moduleName": "string",
     "displayName": "string",
     "description": "string",
     "version": "string",
     "tags": ["string"],
     "apis": [Api],
     "submodules": [Module],
     "extendedDescription": "string",
     "examples": [{
       "title": "string",
       "description": "string",
       "code": "string"
     }],
     "createdAt": "date-time",
     "updatedAt": "date-time"
   }
   ```

3. **接口（Api）**：

   ```json
   {
     "apiId": "string",
     "apiName": "string",
     "displayName": "string",
     "description": "string",
     "endpoint": "string",
     "method": "string",
     "requestSchema": "object",
     "responseSchema": "object",
     "examples": [{
       "request": "object",
       "response": "object",
       "description": "string"
     }],
     "tags": ["string"],
     "extendedDescription": "string",
     "createdAt": "date-time",
     "updatedAt": "date-time"
   }
   ```

### 3.2. 结构化存储

结构化存储采用JSON格式，便于程序处理和AI访问。主要特点：

1. **文件组织**：
   - `/data/modules.json`：包含所有模块的基本信息和索引
   - `/data/modules/{moduleId}.json`：每个模块的详细信息，包括其API列表
   - `/data/apis/{apiId}.json`：每个API的详细信息

2. **索引机制**：
   - 使用模块ID和API ID作为唯一标识符
   - 在modules.json中维护全局索引，便于快速查找

3. **版本控制**：
   - 每个文件包含版本信息和最后更新时间
   - 支持历史版本的存储和回溯

### 3.3. 文档化存储

文档化存储采用Markdown格式，便于人类阅读和在Web界面展示。主要特点：

1. **文件组织**：
   - `/docs/index.md`：文档首页，包含模块导航
   - `/docs/modules/{moduleName}.md`：每个模块的文档
   - `/docs/apis/{moduleName}/{apiName}.md`：每个API的详细文档

2. **文档结构**：
   - 模块文档包含模块描述、版本信息、API列表和示例
   - API文档包含详细的参数说明、请求/响应示例、错误码等
   - 支持代码高亮、表格和其他Markdown特性

3. **导航系统**：
   - 提供模块间和API间的交叉引用链接
   - 支持标签和搜索功能

### 3.4. 同步机制

为了保持结构化存储和文档化存储的一致性，系统提供以下同步机制：

1. **实时同步**：
   - 当通过MCP接口修改API文档时，同时更新结构化存储和生成对应的Markdown文档
   - 确保两种存储形式始终保持一致

2. **批量同步**：
   - 提供命令行工具，支持批量将结构化存储转换为Markdown文档
   - 适用于初始导入或大规模更新场景

3. **冲突处理**：
   - 实现版本检查机制，防止并发修改导致的数据不一致
   - 提供冲突解决策略，如最后写入优先或保留两个版本

4. **验证机制**：
   - 在同步过程中验证数据的完整性和一致性
   - 提供日志记录，便于追踪同步过程和排查问题

## 4. MCP实现设计

### 4.1. 技术栈选择

基于MCP的特性和项目需求，推荐以下技术栈：

1. **后端框架**：
   - Node.js + Express.js：轻量级、高性能，适合构建MCP服务器
   - 或 Python + FastAPI：类型安全、自动生成API文档，适合快速开发

2. **数据存储**：
   - 文件系统：直接使用JSON文件存储，简单易用
   - MongoDB：适用于更复杂的查询和大规模数据
   - PostgreSQL：如需关系型数据库和事务支持

3. **MCP SDK**：
   - 使用官方提供的MCP TypeScript SDK或Python SDK
   - 支持标准的MCP协议和工具定义

4. **文档生成**：
   - Markdown处理：使用markdown-it或similar库
   - 静态站点生成：VitePress或MkDocs，支持搜索和主题定制

5. **前端界面**（可选）：
   - Vue.js或React：构建交互式文档浏览界面
   - TailwindCSS：快速构建美观的UI

### 4.2. 系统架构

系统采用模块化架构，主要包括以下组件：

1. **MCP服务器**：
   - 实现MCP协议，提供工具接口
   - 处理API文档的CRUD操作
   - 管理用户认证和权限控制

2. **存储管理器**：
   - 处理结构化数据的读写
   - 实现版本控制和冲突解决
   - 提供数据索引和查询优化

3. **文档生成器**：
   - 将结构化数据转换为Markdown文档
   - 生成导航和交叉引用
   - 支持自定义模板和样式

4. **同步引擎**：
   - 协调结构化存储和文档化存储
   - 处理并发修改和冲突
   - 提供同步状态监控

5. **Web界面**（可选）：
   - 提供文档浏览和搜索
   - 支持API测试和交互式示例
   - 集成用户反馈机制

### 4.3. MCP对接方案

#### 4.3.1. MCP服务器实现

1. **工具定义**：
   - 按照2.1-2.8节定义的接口，实现对应的MCP工具
   - 每个工具包含名称、描述、输入模式和处理逻辑

2. **服务器配置**：

   ```javascript
   // Node.js示例
   const { createServer } = require('@anthropic-ai/mcp-sdk');
   
   const server = createServer({
     tools: [
       addModule,
       addApi,
       updateModule,
       updateApi,
       listModules,
       listApis,
       getModuleDetails,
       getApiDetails
     ],
     auth: { /* 认证配置 */ }
   });
   
   server.listen(3000);
   ```

3. **工具实现示例**：

   ```javascript
   // 新增模块工具实现
   const addModule = {
     name: 'addModule',
     description: '创建新的API模块',
     inputSchema: { /* 如2.1节所定义 */ },
     async handler(input, context) {
       // 验证输入
       // 创建模块记录
       // 生成Markdown文档
       // 返回结果
       return {
         success: true,
         moduleId: generatedId,
         message: '模块创建成功'
       };
     }
   };
   ```

#### 4.3.2. MCP客户端集成

1. **Claude集成**：
   - 使用Claude的MCP connector API连接服务器
   - 配置工具访问权限和认证

2. **自定义客户端**：
   - 实现MCP客户端协议
   - 提供用户友好的界面调用MCP工具

3. **集成示例**：

   ```javascript
   // 客户端示例
   const { Claude } = require('@anthropic/sdk');
   
   const claude = new Claude({
     apiKey: process.env.ANTHROPIC_API_KEY
   });
   
   const response = await claude.messages.create({
     model: 'claude-3-opus-20240229',
     max_tokens: 1000,
     system: '你是一个API文档助手',
     messages: [{ role: 'user', content: '创建一个用户管理模块' }],
     tools: {
       mcp_connector: {
         servers: [{
           server_url: 'http://localhost:3000',
           tools: ['addModule', 'addApi']
         }]
       }
     }
   });
   ```

### 4.4. 部署和扩展

1. **部署选项**：
   - 本地部署：适用于个人或小团队使用
   - 容器化部署：使用Docker和Kubernetes实现可扩展部署
   - 云服务：部署在AWS、Azure或GCP等云平台

2. **扩展性考虑**：
   - 模块化设计，便于添加新功能
   - 插件系统，支持自定义扩展
   - API版本控制，确保向后兼容

3. **性能优化**：
   - 缓存机制，提高频繁访问的文档加载速度
   - 异步处理，提高并发处理能力
   - 数据索引，优化查询性能
