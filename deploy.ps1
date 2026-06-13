# 校园闲置好物交换站 - 一键部署脚本（PowerShell）
Write-Host "============================================" -ForegroundColor Green
Write-Host "  校园闲置好物交换站 - 部署脚本" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# 步骤1: 构建前端
Write-Host "[1/3] 构建前端项目..." -ForegroundColor Cyan
Set-Location "d:\trea"
& node "node_modules\vite\bin\vite.js" build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 构建完成" -ForegroundColor Green
Write-Host ""

# 步骤2: 复制服务器文件
Write-Host "[2/3] 复制服务器文件到 dist 目录..." -ForegroundColor Cyan
Copy-Item "d:\trea\server.js" "d:\trea\dist\server.js"
Copy-Item "d:\trea\server-package.json" "d:\trea\dist\package.json"
Write-Host "✅ 文件复制完成" -ForegroundColor Green
Write-Host ""

# 步骤3: 显示部署说明
Write-Host "============================================" -ForegroundColor Green
Write-Host "  部署文件已生成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 部署目录: d:\trea\dist\" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 服务器部署步骤:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. 将 dist 文件夹整个上传到您的服务器 (43.156.77.58)" -ForegroundColor White
Write-Host "     推荐目录: /home/campus-exchange 或 /root/campus-exchange" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. 在服务器上执行:" -ForegroundColor White
Write-Host "     cd /home/campus-exchange" -ForegroundColor Gray
Write-Host "     npm install" -ForegroundColor Gray
Write-Host "     npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. 后台运行（关闭终端也不停止）:" -ForegroundColor White
Write-Host "     nohup npm start > app.log 2>&1 &" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. 或者使用 PM2 管理:" -ForegroundColor White
Write-Host "     npm install -g pm2" -ForegroundColor Gray
Write-Host "     pm2 start server.js --name campus" -ForegroundColor Gray
Write-Host "     pm2 save" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 访问地址: http://43.156.77.58:9527/" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键结束..." -ForegroundColor Gray
$null = [Console]::ReadKey()
