/* 学习软件的本地服务器：把文件夹当作静态网站提供给浏览器
   用法：node server.js   （或直接双击 启动学习软件.bat）

   除了当静态服务器，它还提供两个“手机访问”相关的小接口：
   - /lan.json ：返回本机在局域网里的地址（页面上的「📱 手机打开」按钮会读它）
   - /phone    ：一个给手机/电脑看的说明页，直接显示该在手机里输入哪个地址
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8765;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

/* 找出本机所有局域网 IPv4 地址（手机要通过这些地址访问） */
function lanAddresses() {
  const nets = os.networkInterfaces();
  const list = [];
  Object.keys(nets).forEach(name => {
    (nets[name] || []).forEach(item => {
      if (item.family === 'IPv4' && !item.internal) {
        list.push({ iface: name, address: item.address, url: 'http://' + item.address + ':' + PORT + '/' });
      }
    });
  });
  return list;
}

/* /phone ：给手机看的说明页 */
function phonePage() {
  const list = lanAddresses();
  const rows = list.length
    ? list.map(function (x) {
        return '<div class="addr"><code>' + x.url + '</code>' +
          '<button onclick="copyThis(this)" data-url="' + x.url + '">复制</button>' +
          '<div class="meta">网卡：' + x.iface + '</div></div>';
      }).join('')
    : '<div class="addr"><div class="meta">没有检测到局域网地址：请先确认电脑已连上 WiFi 或网线。</div></div>';

  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
    '<title>在手机上打开学习软件</title><style>' +
    'body{margin:0;padding:20px;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;background:#0e1116;color:#e7ecf3;line-height:1.7}' +
    'h1{font-size:22px;margin:0 0 6px}p{color:#9aa6b8;font-size:14.5px;margin:6px 0}' +
    '.card{background:#171d27;border:1px solid #262f3d;border-radius:14px;padding:18px;margin:14px 0;max-width:640px}' +
    '.addr{background:#10151d;border:1px solid #262f3d;border-radius:10px;padding:12px 14px;margin:10px 0}' +
    'code{font-family:Consolas,monospace;font-size:17px;color:#7dd3fc;word-break:break-all}' +
    'button{margin-top:8px;background:#4f8cff;border:0;color:#fff;border-radius:8px;padding:8px 16px;font-size:14px}' +
    '.meta{color:#6b7788;font-size:12.5px;margin-top:6px}' +
    'ol,ul{padding-left:20px;font-size:14.5px;color:#c9d3e2}li{margin:5px 0}' +
    '.warn{background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.35);border-radius:10px;padding:12px 14px;font-size:14px;color:#f0c37a}' +
    '</style></head><body>' +
    '<h1>📱 在手机上打开学习软件</h1>' +
    '<p>手机和电脑要连<b>同一个 WiFi</b>，然后在手机浏览器地址栏输入下面的地址：</p>' +
    '<div class="card">' + rows + '</div>' +
    '<div class="card"><b>操作步骤</b><ol>' +
    '<li>确认手机连的 WiFi 和电脑是同一个（注意别用手机流量）。</li>' +
    '<li>手机浏览器地址栏输入上面的地址，例如 <code>http://192.168.1.5:' + PORT + '/</code>，注意要带 <b>http://</b>。</li>' +
    '<li>用微信扫码/分享里打开时，右上角选“在浏览器打开”，功能更完整。</li>' +
    '<li>电脑上这个黑色命令行窗口要<b>一直开着</b>，关掉手机就访问不了了。</li>' +
    '</ol></div>' +
    '<div class="card"><b>打不开？依次检查</b><ul>' +
    '<li>电脑上服务器窗口是不是还在运行（关了要重新双击“启动学习软件.bat”）。</li>' +
    '<li>第一次运行时 Windows 会弹防火墙提示，要点“允许访问”（专用网络和公用网络都勾上）。</li>' +
    '<li>电脑和手机是不是连在同一个路由器 / 同一个 WiFi 名字下。</li>' +
    '<li>公司、学校、公共 WiFi 常常禁止设备之间互相访问，可以打开手机热点让电脑连上，再用新的地址。</li>' +
    '<li>路由器重启或换了 WiFi 之后 IP 会变，重新看一次这个页面就行。</li>' +
    '</ul></div>' +
    '<div class="warn">提示：学习进度保存在“当前浏览器”里，电脑和手机上的进度是各自独立的，不会自动同步。想带着进度走，用「我的进度 → 导出进度 / 导入进度」搬运。</div>' +
    '<script>function copyThis(b){var t=b.getAttribute("data-url");' +
    'if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){b.textContent="已复制";setTimeout(function(){b.textContent="复制"},1500);});}' +
    'else{var i=document.createElement("input");i.value=t;document.body.appendChild(i);i.select();document.execCommand("copy");i.remove();b.textContent="已复制";}}</script>' +
    '</body></html>';
}

http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  // 手机访问相关的小接口（放在静态文件之前处理）
  if (urlPath === '/lan.json') {
    const list = lanAddresses();
    return send(res, 200, JSON.stringify({
      port: PORT,
      local: 'http://localhost:' + PORT + '/',
      urls: list
    }), 'application/json; charset=utf-8');
  }
  if (urlPath === '/phone') {
    return send(res, 200, phonePage(), 'text/html; charset=utf-8');
  }

  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) return send(res, 403, '禁止访问');

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, '找不到文件：' + urlPath);
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store, must-revalidate' });
    fs.createReadStream(filePath).pipe(res);
  });
}).on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log('');
    console.log('  [错误] 端口 ' + PORT + ' 已经被占用，可能已经有一个学习软件的服务在运行。');
    console.log('  两种解决办法：');
    console.log('    1) 直接打开 http://localhost:' + PORT + '/ 使用（说明它已经在跑了）；');
    console.log('    2) 关掉那个旧的命令行窗口，再重新运行本程序。');
    console.log('');
    process.exitCode = 1;
    return;
  }
  throw err;
}).listen(PORT, () => {
  const local = 'http://localhost:' + PORT + '/';
  const list = lanAddresses();

  console.log('');
  console.log('  Learning app started');
  console.log('  Open on this computer: ' + local);
  console.log('  Phone setup page:      ' + local + 'phone');
  if (list.length) {
    console.log('');
    console.log('  Open on your phone (same WiFi):');
    list.forEach(x => console.log('    ' + x.url + '    [' + x.iface + ']'));
    console.log('  Tip: in the app, click the phone button at the top right for these addresses.');
  } else {
    console.log('');
    console.log('  No LAN address found. Connect this computer to WiFi, then restart.');
  }
  console.log('');
  console.log('  Press Ctrl+C in this window to stop the server.');
  console.log('');
});
