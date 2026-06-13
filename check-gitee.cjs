const https = require('https');

const GITEE_TOKEN = '9207669366cccae58565e43de2d46d70';

function makeRequest(pathname) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://gitee.com' + pathname);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, data: body ? JSON.parse(body) : null }); }
        catch (e) { resolve({ statusCode: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('\n=== Gitee 信息检查 ===\n');

  // 1. 获取令牌所属用户
  console.log('1. 获取令牌用户信息...');
  const user = await makeRequest('/api/v5/user?access_token=' + GITEE_TOKEN);
  if (user.statusCode === 200 && user.data && user.data.login) {
    console.log('   ✅ 登录名: ' + user.data.login);
    console.log('   ✅ 显示名: ' + user.data.name);
    console.log('   ✅ ID: ' + user.data.id);
  } else {
    console.log('   ❌ 令牌无效，状态码: ' + user.statusCode);
    if (user.data && user.data.message) console.log('   信息: ' + user.data.message);
    return;
  }

  const loginName = user.data.login;
  console.log('\n2. 获取该用户的仓库列表...');
  const repos = await makeRequest('/api/v5/users/' + loginName + '/repos?access_token=' + GITEE_TOKEN + '&page=1&per_page=50');
  if (repos.statusCode === 200 && Array.isArray(repos.data)) {
    console.log('   找到 ' + repos.data.length + ' 个仓库:');
    repos.data.forEach(r => {
      console.log('     - ' + r.full_name);
    });
  } else {
    console.log('   ❌ 获取失败，状态码: ' + repos.statusCode);
    return;
  }

  console.log('\n3. 查找包含 "exchange" 或 "校园" 的仓库...');
  const existingRepo = repos.data.find(r => 
    r.name.toLowerCase().includes('exchange') || 
    r.name.toLowerCase().includes('campus') ||
    r.name.includes('校园')
  );
  
  if (existingRepo) {
    console.log('   ✅ 找到匹配仓库: ' + existingRepo.full_name);
    console.log('   使用此仓库名: ' + existingRepo.name);
  } else {
    console.log('   ❌ 未找到匹配仓库');
    console.log('   您需要先创建仓库: https://gitee.com/projects/new');
    console.log('   仓库名建议: campus-exchange 或 校园闲置好物交换站');
  }

  console.log('\n=== 检查完成 ===\n');
}

main().catch(err => console.error('错误:', err.message));
