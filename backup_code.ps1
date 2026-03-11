# 进入项目目录
Set-Location $PSScriptRoot

# 设置提交信息
$commit_msg = "Auto backup: $(Get-Date)"

# 检查 Git 是否可用
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not in PATH"
    pause
    exit 1
}

# 检查是否在 Git 仓库中
if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
    Write-Host "Not in a Git repository"
    pause
    exit 1
}

# 添加所有更改
Write-Host "Adding changes..."
git add .

# 提交更改
Write-Host "Committing changes..."
git commit -m "$commit_msg"

# 推送到远程仓库（如果需要）
# git push

Write-Host "Backup completed successfully!"
pause