# OpenKG-McpMarket

一个用于发布和搜索 MCP 条目的轻量级 CLI 项目。

当前版本聚焦于 MCP 元数据的发布、检索和本地会话管理，不包含 MCP 服务的运行、托管和在线探测能力。

## 功能

- 本地用户注册与登录
- 发布 MCP 条目
- 搜索公开 MCP 条目
- 查看当前用户发布的条目
- 删除当前用户自己的条目
- 将登录状态持久化到本地 CLI 状态文件

## 安装

项目要求 Python `3.12+`。

推荐使用虚拟环境：

```bash
cd OpenKG-McpMarket
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip pytest
```

如果只运行 CLI，不执行测试，也可以不安装 `pytest`。

## Quick Start

```bash
cd OpenKG-McpMarket
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip pytest

python -m src.cli register --email alice@example.com --password password123 --name Alice
python -m src.cli login --email alice@example.com --password password123
python -m src.cli search --query ner
```

## 配置

项目默认不需要 `.env` 或外部服务配置。

可选环境变量：

- `XDG_DATA_HOME`：指定应用数据目录；设置后数据将写入 `$XDG_DATA_HOME/OpenKG-McpMarket`

默认数据目录：

```bash
~/.local/share/OpenKG-McpMarket
```

其中会生成：

- `marketplace.db`
- `cli-state.json`

## 使用

```bash
python3 -m src.cli --help
```

注册用户：

```bash
python3 -m src.cli register \
  --email alice@example.com \
  --password password123 \
  --name Alice
```

登录：

```bash
python3 -m src.cli login \
  --email alice@example.com \
  --password password123
```

查看当前用户：

```bash
python3 -m src.cli me
```

上传 endpoint 类型的 MCP：

```bash
python3 -m src.cli upload \
  --title "DeepKE NER MCP" \
  --summary "用于 NER 任务的 MCP" \
  --version "1.0.0" \
  --transport "streamable-http" \
  --auth "none" \
  --source-type endpoint \
  --endpoint "https://example.com/mcp" \
  --source-url "https://github.com/example/deepke-ner-mcp" \
  --homepage-url "https://example.com/deepke-ner-mcp" \
  --tags "deepke,ner" \
  --tasks "ner"
```

上传 package 类型的 MCP：

```bash
python3 -m src.cli upload \
  --title "My MCP Package" \
  --summary "通过 npm 分发的 MCP" \
  --version "0.1.0" \
  --transport "stdio" \
  --auth "none" \
  --source-type package \
  --package-name "my-mcp-package" \
  --package-registry "npm" \
  --source-url "https://github.com/example/my-mcp-package"
```

搜索条目：

```bash
python3 -m src.cli search --query ner
```

组合筛选：

```bash
python3 -m src.cli search --query ner --task ner --transport streamable-http
```

查看自己发布的 MCP：

```bash
python3 -m src.cli my-mcps
```

删除条目：

```bash
python3 -m src.cli delete --id <listing-id>
```

退出登录：

```bash
python3 -m src.cli logout
```

## 项目结构

```text
src/
  domain/
  infrastructure/
  repositories/
  services/

tests/
  helpers.py
  test_auth.py
  test_mcp.py
```

## 开发

```bash
python3 -m pip install -U pytest
python3 -m pytest
```
