#!/bin/bash

# 检查 wiki 目录是否有变更
CHANGED_FILES=$(git diff --name-only . && git ls-files --others --exclude-standard .)

if [ -n "$CHANGED_FILES" ]; then
    echo "检测到 wiki 目录有变更，正在提交..."
    git add .
    git commit -m "Update wiki"
else
    echo "wiki 目录没有变更，跳过提交"
fi

# 自动获取当前 Git 分支名
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# 获取仓库名称
REMOTE_URL=$(git remote get-url origin)
REPO_NAME=$(basename -s .git "$REMOTE_URL")

# 拼接 Tag 名称：wiki/分支名
TAG_NAME="wiki/$BRANCH_NAME"

echo "当前分支：$BRANCH_NAME"

# 创建本地 Tag
git tag -f "$TAG_NAME"

# 推送到远程仓库
if git push origin -f "$TAG_NAME"; then
    echo -e "\n✅ $BRANCH_NAME 创建并推送成功，等待部署完毕"
else
    echo -e "\n❌ $BRANCH_NAME 推送失败！"
    exit 1
fi