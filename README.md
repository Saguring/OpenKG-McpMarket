# OpenKG-McpMarket

一个用于发布和搜索 MCP 条目的轻量级 CLI 项目。

当前版本主要聚焦于 MCP 元数据的发布与检索，MCP 服务的运行、托管与探测能力暂未纳入实现范围。

## 功能

- 本地用户注册与登录
- 发布 MCP 条目
- 搜索公开 MCP 条目
- 查看当前用户发布的条目
- 删除当前用户自己的条目

## 技术栈

- Python 3.12+
- SQLite
- argparse
- hashlib.pbkdf2_hmac
- pytest

## 安装

```bash
python3 -m pip install pytest
```

## 使用方式

注册用户：

```bash
python3 -m src.cli register --email alice@example.com --password password123 --name Alice
```

登录：

```bash
python3 -m src.cli login --email alice@example.com --password password123
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
  --package-registry "npm"
```

搜索条目：

```bash
python3 -m src.cli search --query ner
```

按任务筛选：

```bash
python3 -m src.cli search --task ner
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

## 数据目录

应用数据默认保存在以下位置：

- `$XDG_DATA_HOME/OpenKG-McpMarket`
- 如果未设置 `XDG_DATA_HOME`，则使用 `~/.local/share/OpenKG-McpMarket`
- 如果显式传入 `AppContext(base_dir=...)`，则使用 `<base_dir>/OpenKG-McpMarket`

## 项目结构

```text
src/
  app_context.py
  cli.py
  cli_format.py
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
python3 -m pytest
```
