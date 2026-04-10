# MCP Marketplace

一个用于发布和搜索 MCP 条目的轻量级 CLI 项目。

这个项目只管理 MCP 元数据，不负责运行、托管或探测 MCP 服务。

## 功能

- 本地用户注册与登录
- 发布 MCP 条目
- 搜索公开 MCP 条目
- 查看当前用户发布的条目
- 删除当前用户自己的条目

## 技术栈

- TypeScript
- Node.js 18+
- SQLite
- Commander
- Argon2
- Vitest

## 安装

```bash
npm install
```

## 使用方式

注册用户：

```bash
npm run cli -- register --email alice@example.com --password password123 --name Alice
```

登录：

```bash
npm run cli -- login --email alice@example.com --password password123
```

查看当前用户：

```bash
npm run cli -- me
```

上传 endpoint 类型的 MCP：

```bash
npm run cli -- upload \
  --title "DeepKE NER MCP" \
  --summary "用于 NER 任务的 MCP" \
  --version "1.0.0" \
  --transport "streamable-http" \
  --auth "none" \
  --source-type endpoint \
  --endpoint "https://example.com/mcp" \
  --tags "deepke,ner" \
  --tasks "ner"
```

上传 package 类型的 MCP：

```bash
npm run cli -- upload \
  --title "My MCP Package" \
  --summary "通过 npm 分发的 MCP" \
  --version "0.1.0" \
  --transport "stdio" \
  --auth "none" \
  --source-type package \
  --package-name "my-mcp-package" \
  --package-registry "npm"
```

搜索条目：

```bash
npm run cli -- search --query ner
```

按任务筛选：

```bash
npm run cli -- search --task ner
```

查看自己发布的 MCP：

```bash
npm run cli -- my-mcps
```

删除条目：

```bash
npm run cli -- delete --id <listing-id>
```

退出登录：

```bash
npm run cli -- logout
```

## 数据目录

应用数据默认保存在以下位置：

- `$XDG_DATA_HOME/mcp-marketplace`
- 如果未设置 `XDG_DATA_HOME`，则使用 `~/.local/share/mcp-marketplace`

## 项目结构

```text
src/
  app-context.ts
  cli.ts
  cli-format.ts
  domain/
  infrastructure/
  repositories/
  services/

tests/
  auth.test.ts
  helpers.ts
  mcp.test.ts
```

## 开发

```bash
npm run typecheck
npm test
npm run build
```
