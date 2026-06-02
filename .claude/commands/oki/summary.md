---
name: "OKI: Summary"
description: 读取原始资料，记录总结，返回对应「资料记录」
category: Knowledge
tags: [knowledge, wiki]
---

读取原始资料，记录总结，返回对应「资料记录」

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

## 「资料记录」页面规范

- 根据模板（`templates/source.md`）构建页面
- 以中文为主，专有名词、约定俗称可用英文
- 正文内容按描述的对象，设多级标题分块表达
- 文件名为`{类型/来源}_{正文标题}`，但不留空格，不用特殊符号
- `tags`大驼峰，不留空格，不用特殊符号，至少包含一个非数字字符
- 若原始资料存于本仓库，`source`使用相对仓库根目录的路径
- 链接使用 `[]()` ，而非`[[wiki-link]]`

**不要**

- 正文中**不要**存在和「知识点」的链接
- `tags`**不要**除分类标签以外的标签类型，如不要`- 胶原蛋白`

## 输入

- `[entry]`，可指定为本地文件或者网址，可批量（用空格区分），如：`/oki:summary references/paper-1.pdf paper-2.pdf`、`/oki:summary https://www.example.com/article.html`

若未指定任何参数，则尝试从对话上下文自动推断；若表述模糊或存在歧义，必须提示列出可用变更项。

## 输出

## 输出

按以下格式输出相关的「资料记录」

```markdown
<!-- 报告正文 -->

## 资料记录

- [{资料记录}](../sources/{资料记录}.md)：{摘要}
- ...
```

## 执行步骤

1. **把「原始资料」解析为「资料缓存」**
   - 若是PDF，执行`opendataloader-pdf file1.pdf file2.pdf -f markdown -o ~/.cache/oki-summary`
   - 若是网页，执行`npx defuddle parse [url] --markdown -o ~/.cache/oki-summary/[cache-name].md`
   - 若是其他格式，则尝试自行选择方式转化为 markdown 并存于`~/.cache/oki-summary`

2. **创建或更新「资料记录」**
   1. 执行`grep -rh "^source:" openwiki/sources/ --include="*.md" | sed 's/^source: *//'`，以获取目前所有「资料记录」的原始资料地址，进行比对
      - 若存在，则更新与之对应「资料记录」
      - 若不存在，则新建对应「资料记录」
   2. 执行`cd openwiki && npx prettier --write sources/ log.md`
