const fs = require('fs');
const path = require('path');
const https = require('https');

const GITEE_USERNAME = 'campus-exchange';
const GITEE_REPO = 'campus-exchange';
const GITEE_TOKEN = '9207669366cccae585b5e43de2d46d70';

const projectDir = __dirname;

const skipPatterns = [
  'node_modules',
  '.git',
  'dist',
  '.DS_Store',
  'upload-gitee.js',
  'upload-script.js',
  'upload-script.cjs',
  'check-gitee.cjs',
  '.local',
  'package-lock.json'
];

function shouldSkip(relativePath) {
  return skipPatterns.some(p => relativePath.includes(p) || relativePath === p);
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  let items;
  try {
    items = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return results;
  }
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (shouldSkip(relativePath)) continue;
    if (item.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else if (item.isFile()) {
      try {
        const stats = fs.statSync(fullPath);
        if (stats.size < 10 * 1024 * 1024) {
          results.push({ path: relativePath, fullPath: fullPath });
        }
      } catch (e) {}
    }
  }
  return results;
}

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

async function checkFileExists(filePath) {
  const apiPath = '/api/v5/repos/' + encodeURIComponent(GITEE_USERNAME) + '/' + encodeURIComponent(GITEE_REPO) + '/contents/' + encodeURIComponent(filePath) + '?access_token=' + GITEE_TOKEN;
  const result = await makeRequest('GET', apiPath);
  return result.statusCode === 200 && result.data && result.data.sha;
}

async function createFile(filePath, content, message) {
  const apiPath = '/api/v5/repos/' + encodeURIComponent(GITEE_USERNAME) + '/' + encodeURIComponent(GITEE_REPO) + '/contents/' + encodeURIComponent(filePath) + '?access_token=' + GITEE_TOKEN;
  const base64 = Buffer.from(content).toString('base64');
  const result = await makeRequest('POST', apiPath, {
    message: message || '初始化项目',
    content: base64,
    branch: 'master'
  });
  return result;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  🚀 上传项目到 Gitee');
  console.log('  用户:', GITEE_USERNAME);
  console.log('  仓库:', GITEE_REPO);
  console.log('='.repeat(60) + '\n');

  // 验证用户
  console.log('🔍 验证令牌...');
  const userCheck = await makeRequest('GET', '/api/v5/user?access_token=' + GITEE_TOKEN);
  if (userCheck.statusCode !== 200) {
    console.log('   ❌ 令牌无效！状态码:', userCheck.statusCode);
    if (userCheck.data && userCheck.data.message) console.log('   信息:', userCheck.data.message);
    return;
  }
  console.log('   ✅ 令牌有效，登录名:', userCheck.data.login);

  // 验证仓库
  console.log('\n🔍 验证仓库...');
  const repoCheckPath = '/api/v5/repos/' + encodeURIComponent(GITEE_USERNAME) + '/' + encodeURIComponent(GITEE_REPO) + '?access_token=' + GITEE_TOKEN;
  const repoCheck = await makeRequest('GET', repoCheckPath);
  if (repoCheck.statusCode !== 200) {
    console.log('   ❌ 仓库访问失败，状态码:', repoCheck.statusCode);
    if (repoCheck.data && repoCheck.data.message) console.log('   信息:', repoCheck.data.message);
    return;
  }
  console.log('   ✅ 仓库验证通过\n');

  // 扫描文件
  console.log('📁 扫描项目文件...');
  const files = getAllFiles(projectDir);
  console.log('   找到 ' + files.length + ' 个文件\n');

  // 上传
  let successCount = 0, failCount = 0, skipCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const prefix = '[' + String(i + 1).padStart(2, ' ') + '/' + files.length + ']';
    try {
      const content = fs.readFileSync(file.fullPath);
      const exists = await checkFileExists(file.path);
      if (exists) {
        console.log(prefix + ' 📋 已存在: ' + file.path);
        skipCount++;
      } else {
        const result = await createFile(file.path, content);
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
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(60));
  console.log('  🎉 上传完成！');
  console.log('='.repeat(60));
  console.log('\n  📊 结果统计：');
  console.log('     成功上传: ' + successCount + ' 个文件');
  console.log('     已存在跳过: ' + skipCount + ' 个文件');
  console.log('     失败: ' + failCount + ' 个文件');
  console.log('\n  🔗 仓库地址: https://gitee.com/' + GITEE_USERNAME + '/' + GITEE_REPO);
  console.log('\n');
}

main().catch(err => {
  console.error('\n❌ 执行出错:', err.message);
  console.error(err);
});
