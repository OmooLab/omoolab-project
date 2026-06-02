---
name: "OKI: Publish"
description: 本地知识库查看、发布
category: Knowledge
tags: [knowledge, wiki, publish]
---

本地知识库查看、发布

## 指令参数

- `--preview`、`-p`变为预览（默认发布）

## 发布步骤

1. 执行`cd openwiki && pnpm build`
2. 若报错，修复错误
3. 执行`bash scripts/deploy.sh`

## 预览步骤

1. 执行`cd openwiki && pnpm dev`
