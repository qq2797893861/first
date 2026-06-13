@echo off
echo ============================================
echo   校园闲置好物交换站 - 一键部署脚本（Windows）
echo ============================================
echo.

echo [1/3] 构建前端项目...
call node node_modules\vite\bin\vite.js build
if errorlevel 1 goto error
echo.

echo [2/3] 复制服务器文件到 dist 目录...
copy server.js dist\server.js
copy server-package.json dist\package.json
if errorlevel 1 goto error
echo.

echo [3/3] 生成部署说明...
echo.
echo ============================================
echo   部署完成！
echo ============================================
echo.
echo 接下来请将 dist 文件夹上传到您的服务器
echo 上传后在服务器执行：
echo   cd dist
echo   npm install
echo   npm start
echo.
echo 访问地址: http://43.156.77.58:9527/
echo.
pause
goto end

:error
echo.
echo ❌ 部署失败，请检查错误信息
pause

:end
