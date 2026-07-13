@echo off
chcp 65001 >nul
title LLM Life Sim - 启动中...

:: 切换到脚本所在目录
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════╗
echo ║     LLM Life Sim UI 开发服务器      ║
echo ╚══════════════════════════════════════╝
echo.

:: 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

:: 显示 Node.js 版本
for /f "tokens=*" %%i in ('node -v') do echo [信息] Node.js 版本: %%i
for /f "tokens=*" %%i in ('npm -v') do echo [信息] npm 版本: %%i
echo.

:: 检查依赖是否已安装
if not exist "node_modules\" (
    echo [安装] 正在安装项目依赖，请稍候...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接后重试
        pause
        exit /b 1
    )
    echo.
    echo [完成] 依赖安装成功！
) else (
    echo [信息] 依赖已就绪，直接启动...
)
echo.

echo [启动] 正在启动开发服务器...
echo [提示] 浏览器将自动打开，如未打开请手动访问 http://localhost:5173
echo [提示] 关闭此窗口即可停止服务器
echo.

:: 启动 Vite 开发服务器（自动打开浏览器）
start "" http://localhost:5173
call npx vite --open

pause
