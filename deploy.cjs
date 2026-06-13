const fs = require('fs');
const path = require('path');
const https = require('https');

const GITEE_USERNAME = 'campus-exchange';
const GITEE_REPO = 'campus-exchange';
const GITEE_TOKEN = '9207669366cccae585b5e43de2d46d70';

const distDir = path.join(__dirname, 'dist');

function makeRequest(method, pathname, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://gitee.com' + pathname);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (item.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else if (item.isFile()) {
      results.push({ path: relativePath, fullPath: fullPath });
    }
  }
  return results;
}

async function uploadFile(filePath, content) {
  const apiPath = '/api/v5/repos/' + encodeURIComponent(GITEE_USERNAME) + '/' + encodeURIComponent(GITEE_REPO) + '/contents/' + encodeURIComponent(filePath) + '?access_token=' + GITEE_TOKEN;
  const base64 = Buffer.from(content).toString('base64');
  return makeRequest('POST', apiPath, {
    message: '部署: ' + filePath,
    content: base64,
    branch: 'master'
  });
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  🚀 部署项目到 Gitee Pages');
  console.log('  仓库: ' + GITEE_USERNAME + '/' + GITEE_REPO);
  console.log('='.repeat(60) + '\n');

  // 验证仓库
  console.log('🔍 验证仓库...');
  const repoCheck = await makeRequest('GET', '/api/v5/repos/' + encodeURIComponent(GITEE_USERNAME) + '/' + encodeURIComponent(GITEE_REPO) + '?access_token=' + GITEE_TOKEN);
  if (repoCheck.statusCode !== 200) {
    console.log('   ❌ 仓库访问失败');
    return;
  }
  console.log('   ✅ 仓库可用\n');

  // 扫描 dist 文件
  console.log('📁 扫描 dist 目录...');
  if (!fs.existsSync(distDir)) {
    console.log('   ❌ dist 目录不存在，请先构建项目');
    return;
  }
  const files = getAllFiles(distDir);
  console.log('   找到 ' + files.length + ' 个文件\n');

  // 上传所有文件
  let successCount = 0, failCount = 0, skipCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const prefix = '[' + String(i + 1).padStart(2, ' ') + '/' + files.length + ']';
    try {
      const content = fs.readFileSync(file.fullPath);
      
      // 检查文件是否存在
      const checkPath = '/api/v5/repos/' + encodeURIComponent(GITEE_USERNAME) + '/' + encodeURIComponent(GITEE_REPO) + '/contents/' + encodeURIComponent(file.path) + '?access_token=' + GITEE_TOKEN;
      const check = await makeRequest('GET', checkPath);
      
      if (check.statusCode === 200 && check.data && check.data.sha) {
        // 文件存在，跳过
        console.log(prefix + ' 📋 已存在，跳过: ' + file.path);
        skipCount++;
      } else {
        // 上传新文件
        const result = await uploadFile(file.path, content);
        if (result.statusCode === 201) {
          console.log(prefix + ' ✅ 上传成功: ' + file.path);
          successCount++;
        } else {
          console.log(prefix + ' ❌ 上传失败: ' + file.path + ' (状态: ' + result.statusCode + ')');
          if (result.data && result.data.message) console.log('            错误: ' + result.data.message);
          failCount++;
        }
      }
    } catch (err) {
      console.log(prefix + ' ❌ 错误: ' + file.path + ' - ' + err.message);
      failCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log('  🎉 部署完成！');
  console.log('='.repeat(60));
  console.log('\n  📊 结果统计：');
  console.log('     成功上传: ' + successCount + ' 个文件');
  console.log('     已存在跳过: ' + skipCount + ' 个文件');
  console.log('     失败: ' + failCount + ' 个文件');
  console.log('\n  🔗 Gitee Pages 访问地址:');
  console.log('     https://' + GITEE_USERNAME + '.gitee.io/' + GITEE_REPO + '/');
  console.log('\n  💡 请在 Gitee 仓库设置中开启 Gitee Pages 服务');
  console.log('     路径: 管理 -> Gitee Pages -> 选择 master 分支 -> 启用');
  console.log('\n');
}

main().catch(err => {
  console.error('\n❌ 执行出错:', err.message);
  console.error(err);
});
