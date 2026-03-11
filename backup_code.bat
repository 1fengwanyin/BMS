@echo off

REM 进入项目目录
cd /d "%~dp0"

REM 设置提交信息
set "commit_msg=Auto backup: %date% %time%"

REM 检查 Git 是否可用
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not installed or not in PATH
    pause
    exit /b 1
)

REM 检查是否在 Git 仓库中
git rev-parse --is-inside-work-tree >nul 2>nul
if %errorlevel% neq 0 (
    echo Not in a Git repository
    pause
    exit /b 1
)

REM 添加所有更改
echo Adding changes...
git add .

REM 提交更改
echo Committing changes...
git commit -m "%commit_msg%"

REM 推送到远程仓库（如果需要）
REM git push

echo Backup completed successfully!
pause