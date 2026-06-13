const { execSync } = require('child_process');
const path = require('path');

process.chdir(__dirname);

console.log('🔨 开始构建项目...\n');

try {
  console.log('📦 执行 vite build...');
  execSync('node ' + path.join('node_modules', 'vite', 'bin', 'vite.js') + ' build', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('\n✅ 构建完成！');
  console.log('📁 输出目录: ' + path.join(__dirname, 'dist'));
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}
