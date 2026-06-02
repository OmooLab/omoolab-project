---
name: "OKI: Lint"
description: 检查并修复知识库
category: Knowledge
tags: [knowledge, wiki]
---

检查并修复知识库

## 指令参数

可指定范围（若不指定则全局），例如：`/oki:lint index.md`，`/oki:lint 资料记录`、`/oki:lint concepts`

## 知识库结构

```bash
openwiki
├── nodes/       # 知识点 - 从「资料记录」提取到的，描述某知识点的页面
├── public/      # 静态资源
├── scripts/     # 执行脚本
├── sources/     # 资料记录 - 对单篇「原始资料」的总结、记录
├── templates/   # 页面模板
├── config.yaml  # 配置文件
├── index.md     # 主页 - 知识库内容索引页
├── log.md       # 变更日志页 - 知识库改动的记录
└── overview.md  # 总览页 - 对知识库的总结
```

## 执行步骤

1. **检查页面规范**
   逐个读取所有「资料记录」、「知识点」内容，是否符合页面规范，并修复
   - 是否根据对应模板（存于`templates/`）构建页面？
   - 是否以中文为主，英文为辅？
   - 是否正文内容设多级标题分块表达？
   - 是否「知识点」的正文内容，「总览页」的节点描述，都至少包含一个与其他页面的链接？
   - 是否「资料记录」的正文内容，没有任何链接能到其他页面？
   - 是否「资料记录」的文件名为`{类型/来源}_{正文标题}`，且不留空格，不用特殊符号？
   - 是否`tags`仅包含分类标签，而没其他标签？
   - 是否使用 Mermaid 绘制流程图？
   - 是否使用规范的`tags`（大驼峰，不留空格，不用除，至少包含一个非数字字符）？
   - 是否使用 `[]()` ，而不是`[[wiki-link]]`

2. **合并重复的页面**
   - 「资料记录」的`source`一致，才视为重复
   - 「知识点」描述主体相似，可视为重复
   - 需用户确认，才可执行

3. **检查链接和文件名**  
   执行`node scripts/check-md.js sources/ nodes/ index.md overview.md log.md`，并修复
4. **页面格式化**  
   执行`npx prettier --write sources/ nodes/ index.md overview.md log.md`
