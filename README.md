# apiDocMcp

基于MCP协议的API文档管理系统，支持结构化存储和Markdown格式文档生成。

## 项目概述

MCP（Model Context Protocol，模型上下文协议）是一种开放协议，旨在实现大型语言模型（LLM）应用与外部数据源、工具和服务之间的无缝集成。本项目实现了一个基于MCP的API文档管理系统，该系统允许AI通过MCP接口结构化地读写API文档，同时支持用户以Markdown格式查看这些文档。

## 主要功能

- 提供MCP接口，用于API文档的创建和读取操作
- 支持文档以Markdown格式存储，便于人类阅读
- 提供友好的用户界面，便于开发者和用户查阅API文档

## 系统架构

系统分为以下主要模块：

1. **MCP服务器模块**：实现MCP协议，提供API文档管理的工具接口
2. **存储管理模块**：处理API文档的结构化存储和读写操作
3. **文档生成模块**：将结构化数据转换为Markdown格式的文档
4. **同步引擎模块**：协调结构化存储和文档化存储的一致性
5. **Web界面模块**：提供用户友好的文档浏览和搜索界面

## 安装与使用

### 前置条件

- Node.js 14.x 或更高版本
- npm 6.x 或更高版本

### 安装步骤

1. 克隆仓库

```bash
git clone <repository-url>
cd apiDocMcp
```

2. 安装依赖

```bash
npm install
```

3. 启动服务

```bash
npm start
```

默认情况下，MCP服务器将在端口3000上运行，Web界面将在端口8080上运行。

### 配置选项

#### 环境变量

可以通过环境变量自定义配置：

- `PORT`: MCP服务器端口（默认：3000）
- `WEB_PORT`: Web界面端口（默认：8080）
- `DATA_DIR`: 数据存储目录（默认：用户主目录下的 `.mcpDocData/data`）
- `DOCS_DIR`: 文档存储目录（默认：用户主目录下的 `.mcpDocData/docs`）

#### 命令行参数

也可以通过命令行参数自定义配置：

**MCP服务器 (index.js)**

```bash
node src/index.js --port 3001 --web-port 8081 --data-dir ./custom-data --docs-dir ./custom-docs
```

可用选项：
- `-p, --port <number>`: MCP服务器端口（默认：3000）
- `-w, --web-port <number>`: Web服务器端口（默认：8080）
- `-d, --data-dir <path>`: 数据目录路径（默认：用户主目录下的 `.mcpDocData/data`）
- `-o, --docs-dir <path>`: 文档目录路径（默认：用户主目录下的 `.mcpDocData/docs`）

**Web服务器 (web-server.js)**

```bash
node src/web-server.js --port 8081 --data-dir ./custom-data --docs-dir ./custom-docs
```

可用选项：
- `-p, --port <number>`: Web服务器端口（默认：8080）
- `-d, --data-dir <path>`: 数据目录路径（默认：用户主目录下的 `.mcpDocData/data`）
- `-o, --docs-dir <path>`: 文档目录路径（默认：用户主目录下的 `.mcpDocData/docs`）

#### 预设配置

项目提供了预设的自定义配置脚本：

```bash
npm run start:custom     # 使用自定义配置启动MCP服务器
npm run start:web:custom # 使用自定义配置启动Web服务器
```

## MCP接口

系统提供以下MCP工具：

- `addModule`: 创建新的API模块
- `addApi`: 在指定模块中创建新的API接口
- `updateModule`: 更新现有的API模块
- `updateApi`: 更新现有的API接口
- `listModules`: 列出所有API模块
- `listApis`: 列出指定模块中的所有API接口
- `getModuleDetails`: 获取指定模块的详细信息
- `getApiDetails`: 获取指定API接口的详细信息

## 文档结构

生成的文档采用以下结构：

- `/docs/index.md`: 文档首页，包含模块导航
- `/docs/modules/{moduleName}.md`: 每个模块的文档
- `/docs/apis/{moduleName}/{apiName}.md`: 每个API的详细文档

## 开发指南

### 项目结构

```
.
├── data/                  # 数据存储目录
├── docs/                  # 生成的文档目录
├── src/                   # 源代码
│   ├── document/          # 文档生成模块
│   ├── storage/           # 存储管理模块
│   ├── sync/              # 同步引擎模块
│   ├── tools/             # MCP工具实现
│   ├── web/               # Web界面模块
│   ├── index.js           # 应用入口
│   └── server.js          # MCP服务器
└── package.json           # 项目配置
```

### 扩展指南

#### 添加新的MCP工具

1. 在 `src/tools/` 目录下创建新的工具文件
2. 在 `src/tools/index.js` 中导出新工具
3. 在 `src/server.js` 中注册新工具

#### 自定义存储实现

1. 创建新的存储类，实现与 `FileStorage` 相同的接口
2. 在 `src/storage/index.js` 中添加新的存储类型支持

## 许可证

[ISC](LICENSE)