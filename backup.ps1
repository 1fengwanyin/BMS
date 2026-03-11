# 进入项目目录
cd $PSScriptRoot

# 设置提交信息
$commit_msg = "Auto backup: $(Get-Date)"

# 添加所有更改
echo "Adding changes..."
git add .

# 提交更改
echo "Committing changes..."
git commit -m "$commit_msg"

# 推送到远程仓库（如果需要）
# git push

echo "Backup completed successfully!"
pause