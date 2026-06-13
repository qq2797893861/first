const express = require('express');
const path = require('path');

const app = express();
const PORT = 9527;
const DIST_DIR = path.join(__dirname, 'dist');

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n 校园闲置好物交换站 - 部署完成`);
  console.log(` 访问地址:`);
  console.log(`    本机访问: http://localhost:${PORT}/`);
  console.log(`    网络访问: http://43.156.77.58:${PORT}/`);
  console.log(`    服务目录: ${DIST_DIR}`);
  console.log(`\n  按 Ctrl+C 停止服务\n`);
});
