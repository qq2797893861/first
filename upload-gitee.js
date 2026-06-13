/**
 * 上传项目到 Gitee
 * 使用前请先在 Gitee 上创建仓库并生成个人访问令牌
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ========== 配置区域 ==========
const GITEE_USERNAME = '';           // 您的 Gitee 用户名
const GITEE_REPO = '';                // 仓库名
const GITEE_TOKEN = '';               // 个人访问令牌（在 Gitee 设置 -> 私人令牌 中生成）
// ================================

const projectDir = __dirname;

// 跳过的文件/目录
const skipList = [
  'node_modules',
  '.git',
  'dist',
  '.DS_Store',
  'upload-gitee.js',
  '.local'
];

function shouldSkip(filePath) {
  return skipList.some(skip => filePath.includes(skip));
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (shouldSkip(relativePath)) continue;

    if (item.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else if (item.isFile()) {
      results.push({
        path: relativePath,
        fullPath: fullPath
      });
    }
  }
  return results;
}

function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
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
    if (data) req.write(data);
    req.end();
  });
}

async function uploadFile(filePath, content, isBinary = false) {
  const encodedPath = encodeURIComponent(filePath);
  const encodedContent = isBinary
    ? Buffer.from(content).toString('base64')
    : Buffer.from(content).toString('base64');

  const options = {
    hostname: 'gitee.com',
    path: `/api/v5/repos/${GITEE_USERNAME}/${GITEE_REPO}/contents/${encodedPath}?access_token=${GITEE_TOKEN}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({
    message: `上传文件: ${filePath}`,
    content: encodedContent
  });

  return httpsRequest(options, body);
}

async function main() {
  if (!GITEE_USERNAME || !GITEE_REPO || !GITEE_TOKEN) {
    console.log('\n❌ 请先在脚本顶部配置您的 Gitee 信息：');
    console.log('   1. GITEE_USERNAME - 您的 Gitee 用户名');
    console.log('   2. GITEE_REPO      - 仓库名称');
    console.log('   3. GITEE_TOKEN     - 个人访问令牌');
    console.log('\n📖 获取令牌步骤：');
    console.log('   1. 登录 https://gitee.com');
    console.log('   2. 点击右上角头像 -> 设置 -> 私人令牌');
    console.log('   3. 生成新令牌，勾选 projects、user_info、gists');
    console.log('   4. 复制生成的令牌填入脚本\n');
    return;
  }

  console.log(`\n🚀 开始上传项目到 Gitee: ${GITEE_USERNAME}/${GITEE_REPO}`);
  console.log('='.repeat(60));

  const files = getAllFiles(projectDir);
  console.log(`\n📁 共找到 ${files.length} 个文件需要上传\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = ((i + 1) / files.length * 100).toFixed(1);

    try {
      // 检查文件大小，跳过过大的文件
      const stats = fs.statSync(file.fullPath);
      if (stats.size > 10 * 1024 * 1024) {
        console.log(`⏭️  [${progress}%] 跳过大文件: ${file.path}`);
        continue;
      }

      const content = fs.readFileSync(file.fullPath);
      const isBinary = !file.path.match(/\.(txt|md|js|ts|tsx|jsx|css|html|json|yml|yaml|xml|csv|gitignore|vue)$/i);

      const result = await uploadFile(file.path, content, isBinary);

      if (result.statusCode === 201) {
        console.log(`✅  [${progress}%] 上传成功: ${file.path}`);
        successCount++;
      } else if (result.statusCode === 409) {
        console.log(`⚠️  [${progress}%] 文件已存在，跳过: ${file.path}`);
      } else {
        console.log(`❌  [${progress}%] 上传失败: ${file.path} (${result.statusCode})`);
        if (result.data && result.data.message) {
          console.log(`   错误信息: ${result.data.message}`);
        }
        failCount++;
      }
    } catch (err) {
      console.log(`❌  [${progress}%] 上传失败: ${file.path}`);
      console.log(`   ${err.message}`);
      failCount++;
    }

    // 添加延迟避免触发 API 限流
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 上传完成:`);
  console.log(`   成功: ${successCount} 个文件`);
  console.log(`   失败: ${failCount} 个文件`);
  console.log(`\n🔗 仓库地址: https://gitee.com/${GITEE_USERNAME}/${GITEE_REPO}\n`);
}

main().catch(console.error);
