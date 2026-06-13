/**
 * 上传项目到 Gitee - 自动上传脚本
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Gitee 配置
const GITEE_USERNAME = '王雨欣';
const GITEE_REPO = 'campus-exchange';
const GITEE_TOKEN = '9207669366cccae58565e43de2d46d70';

const projectDir = __dirname;

// 跳过的文件/目录
const skipPatterns = [
  'node_modules',
  '.git',
  'dist',
  '.DS_Store',
  'upload-gitee.js',
  'upload-script.js',
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
          results.push({
            path: relativePath,
            fullPath: fullPath,
            size: stats.size
          });
        }
      } catch (e) {
        console.log('   跳过无法读取的文件:', relativePath);
      }
    }
  }
  return results;
}

function makeRequest(method, pathname, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'gitee.com',
      path: pathname,
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
          resolve({
            statusCode: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
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

// 检查文件是否已存在
async function checkFileExists(filePath) {
  const encodedPath = encodeURIComponent(filePath);
  const result = await makeRequest(
    'GET',
    `/api/v5/repos/${GITEE_USERNAME}/${GITEE_REPO}/contents/${encodedPath}?access_token=${GITEE_TOKEN}`
  );
  return result.statusCode === 200 && result.data && result.data.sha;
}

// 创建/更新文件
async function createFile(filePath, content, message = '初始化项目') {
  const encodedPath = encodeURIComponent(filePath);
  const base64 = Buffer.from(content).toString('base64');

  const result = await makeRequest(
    'POST',
    `/api/v5/repos/${GITEE_USERNAME}/${GITEE_REPO}/contents/${encodedPath}?access_token=${GITEE_TOKEN}`,
    {
      message: message,
      content: base64,
      branch: 'master'
    }
  );

  return result;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  🚀 上传项目到 Gitee');
  console.log('  用户:', GITEE_USERNAME);
  console.log('  仓库:', GITEE_REPO);
  console.log('='.repeat(60) + '\n');

  // 1. 收集所有文件
  console.log('📁 扫描项目文件...');
  const files = getAllFiles(projectDir);
  console.log(`   找到 ${files.length} 个文件\n`);

  // 2. 验证 Gitee 连接
  console.log('🔍 验证 Gitee 仓库...');
  const repoCheck = await makeRequest(
    'GET',
    `/api/v5/repos/${GITEE_USERNAME}/${GITEE_REPO}?access_token=${GITEE_TOKEN}`
  );

  if (repoCheck.statusCode !== 200) {
    console.log('\n❌ 仓库访问失败！');
    console.log('   状态码:', repoCheck.statusCode);
    if (repoCheck.data && repoCheck.data.message) {
      console.log('   信息:', repoCheck.data.message);
    }
    console.log('\n📋 请检查：');
    console.log('   1. 仓库名称是否正确？');
    console.log('   2. 个人访问令牌是否有效？');
    console.log('   3. 仓库是否已创建？');
    console.log('   4. 访问 https://gitee.com/' + GITEE_USERNAME + '/' + GITEE_REPO + ' 确认仓库存在');
    return;
  }
  console.log('   ✅ 仓库验证通过\n');

  // 3. 上传所有文件
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = ((i + 1) / files.length * 100).toFixed(1);
    const prefix = `[${String(i + 1).padStart(2, ' ')}/${files.length}]`;

    try {
      const content = fs.readFileSync(file.fullPath);

      // 先检查文件是否存在
      const exists = await checkFileExists(file.path);

      if (exists) {
        console.log(`${prefix} 📋 文件已存在: ${file.path}`);
        skipCount++;
      } else {
        // 上传新文件
        const result = await createFile(file.path, content);

        if (result.statusCode === 201) {
          console.log(`${prefix} ✅ 上传成功: ${file.path}`);
          successCount++;
        } else {
          console.log(`${prefix} ❌ 上传失败: ${file.path} (状态: ${result.statusCode})`);
          if (result.data && result.data.message) {
            console.log(`            错误: ${result.data.message}`);
          }
          failCount++;
        }
      }
    } catch (err) {
      console.log(`${prefix} ❌ 错误: ${file.path} - ${err.message}`);
      failCount++;
    }

    // API 调用间隔
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 4. 完成汇总
  console.log('\n' + '='.repeat(60));
  console.log('  🎉 上传完成！');
  console.log('='.repeat(60));
  console.log(`\n  📊 结果统计：`);
  console.log(`     成功上传: ${successCount} 个文件`);
  console.log(`     已存在跳过: ${skipCount} 个文件`);
  console.log(`     失败: ${failCount} 个文件`);
  console.log(`\n  🔗 仓库地址: https://gitee.com/${GITEE_USERNAME}/${GITEE_REPO}`);
  console.log(`     （请在浏览器打开确认上传结果）\n`);
}

main().catch(err => {
  console.error('\n❌ 执行出错:', err.message);
  console.error(err);
});
