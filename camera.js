/* Daily Planner 拍衣服相機：構圖框 → 拍照 → AI 去背 → 預覽 → 傳回網站
   放在主畫面外殼這一層，因為 iPhone 不讓被包在裡面的網頁開相機 */
window.DPCam = (function () {
  var CATS = ['上衣', '內搭', '褲子', '裙子', '洋裝', '外套', '鞋子', '包包', '配件'];
  var TOP = 'M38,18 Q50,25 62,18 L76,24 L84,64 L76,66 L72,42 L72,102 L28,102 L28,42 L24,66 L16,64 L24,24 Z';
  var G = {
    '上衣': [TOP, '袖子往下放，貼著身體兩側'],
    '內搭': ['M39,22 Q50,28 61,22 L72,27 L78,60 L71,62 L68,42 L68,98 L32,98 L32,42 L29,62 L22,60 L28,27 Z', '袖子往下放，貼著身體兩側'],
    '褲子': ['M31,8 L69,8 L75,122 L54,122 L50,42 L46,122 L25,122 Z M31,16 L69,16', '腰頭拉平，兩條褲管併攏'],
    '裙子': ['M33,22 L67,22 L68,30 L82,104 L18,104 L32,30 Z M33,30 L67,30', '腰頭拉平，裙襬自然展開'],
    '洋裝': ['M38,8 Q50,15 62,8 L74,14 L80,34 L72,36 L68,27 L66,52 L82,124 L18,124 L34,52 L32,27 L28,36 L20,34 L26,14 Z', '肩線拉平，裙襬自然展開'],
    '外套': ['M38,12 Q50,19 62,12 L78,19 L86,76 L78,78 L73,42 L74,116 L26,116 L27,42 L22,78 L14,76 L22,19 Z M50,20 L50,116', '袖子往下放，前襟拉平'],
    '鞋子': ['M22,42 C22,26 44,26 44,42 L44,96 C44,108 22,108 22,96 Z M56,42 C56,26 78,26 78,42 L78,96 C78,108 56,108 56,96 Z', '從正上方拍，兩隻並排'],
    '包包': ['M22,52 L78,52 L82,112 L18,112 Z M36,52 C36,28 64,28 64,52', '提把立起來，正面朝上'],
    '配件': ['M50,30 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0', '放在框中間，背景越素越好']
  };
  var CSS = '#dpcam{position:fixed;inset:0;z-index:50;background:#111;color:#fff;font-family:-apple-system,"PingFang TC",sans-serif;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);-webkit-user-select:none;user-select:none}' +
    '#dpcam .tb{display:flex;justify-content:space-between;align-items:center;padding:10px 16px 6px;font-size:16px;font-weight:700}#dpcam .tb button{background:none;border:0;color:#fff;font-size:22px;width:36px;height:36px}' +
    '#dpcam .chips{display:flex;gap:6px;overflow-x:auto;padding:2px 12px 8px;scrollbar-width:none}#dpcam .chips::-webkit-scrollbar{display:none}' +
    '#dpcam .chips button{flex:none;border:0;padding:5px 12px;border-radius:99px;background:rgba(255,255,255,.16);color:#fff;font-size:13px}#dpcam .chips button.on{background:#F0A497;color:#2B2925;font-weight:700}' +
    '#dpcam .view{flex:1;position:relative;margin:0 12px;border-radius:16px;overflow:hidden;background:#000}#dpcam video,#dpcam .shotimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '#dpcam svg.gd{position:absolute;inset:8%;width:84%;height:84%;pointer-events:none}' +
    '#dpcam .c{position:absolute;width:20px;height:20px;border:0 solid rgba(255,255,255,.9)}#dpcam .tl{left:10px;top:10px;border-width:2px 0 0 2px}#dpcam .tr{right:10px;top:10px;border-width:2px 2px 0 0}#dpcam .bl{left:10px;bottom:10px;border-width:0 0 2px 2px}#dpcam .br{right:10px;bottom:10px;border-width:0 2px 2px 0}' +
    '#dpcam .lvl{position:absolute;left:50%;top:12px;transform:translateX(-50%);font-size:12px;padding:3px 10px;border-radius:99px;background:rgba(0,0,0,.45);white-space:nowrap;border:0;color:#fff}#dpcam .lvl.ok{background:rgba(120,190,140,.9);color:#12301e}#dpcam .lvl.no{background:rgba(233,190,90,.92);color:#3a2a00}' +
    '#dpcam .tip{text-align:center;font-size:13px;margin:8px 24px 0;padding:5px 0;border-radius:99px;background:rgba(255,255,255,.1)}' +
    '#dpcam .bot{display:flex;justify-content:space-between;align-items:center;padding:12px 26px 14px}#dpcam .alb{width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,.2);display:grid;place-items:center;font-size:11px;text-align:center;line-height:1.2}' +
    '#dpcam .sh{width:70px;height:70px;border-radius:50%;border:4px solid #fff;background:none;display:grid;place-items:center;padding:0}#dpcam .sh i{width:54px;height:54px;border-radius:50%;background:#fff;display:block}#dpcam .sh:active i{transform:scale(.9)}' +
    '#dpcam .hint{width:44px;font-size:10px;line-height:1.3;text-align:center;opacity:.75}' +
    '#dpcam .work{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55);text-align:center;font-size:14px;line-height:1.8}#dpcam .spin{width:34px;height:34px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;margin:0 auto 10px;animation:dpspin .9s linear infinite}@keyframes dpspin{to{transform:rotate(360deg)}}' +
    '#dpcam .pv{position:absolute;inset:0;display:grid;place-items:center}#dpcam .pv img{max-width:88%;max-height:88%;object-fit:contain}' +
    '#dpcam .pv.chk{background:repeating-conic-gradient(#d9d4cc 0 25%,#f4f1ec 0 50%) 0 0/22px 22px}#dpcam .pv.dark{background:#3E3A39}#dpcam .pv.light{background:#FFFCF6}' +
    '#dpcam .bgsw{position:absolute;right:10px;top:10px;display:flex;gap:6px}#dpcam .bgsw button{width:28px;height:28px;border-radius:50%;border:2px solid #fff;padding:0}#dpcam .bgsw button.on{outline:2px solid #F0A497;outline-offset:2px}' +
    '#dpcam .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 14px 14px}#dpcam .acts button{border:0;border-radius:14px;padding:12px 6px;font-size:14px;background:rgba(255,255,255,.14);color:#fff}#dpcam .acts button.main{background:#F0A497;color:#2B2925;font-weight:700;grid-column:1/-1}' +
    '#dpcam .msg{font-size:12.5px;text-align:center;opacity:.85;padding:8px 18px 0;line-height:1.6}';
  var root, video, stream, cb, cat, rawBlob, cutBlob, lib = null, orientOn = false, job = 0;

  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function open(req, done) {
    cb = done; cat = CATS.indexOf(req && req.cat) >= 0 ? req.cat : '上衣';
    if (!document.getElementById('dpcam-css')) { var st = document.createElement('style'); st.id = 'dpcam-css'; st.textContent = CSS; document.head.appendChild(st); }
    root = document.createElement('div'); root.id = 'dpcam'; document.body.appendChild(root);
    live();
  }
  function close(res) {
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    window.removeEventListener('deviceorientation', onOrient);
    if (root) { root.remove(); root = null; }
    var f = cb; cb = null; if (f) f(res || { cancel: true });
  }

  /* ---------- 拍照畫面 ---------- */
  function live() {
    job++; var g = G[cat];
    root.innerHTML = '<div class="tb"><button data-x="close" aria-label="關閉">✕</button><span>拍' + esc(cat) + '</span><span style="width:36px"></span></div>' +
      '<div class="chips">' + CATS.map(function (c) { return '<button data-cat="' + c + '" class="' + (c === cat ? 'on' : '') + '">' + c + '</button>'; }).join('') + '</div>' +
      '<div class="view"><video playsinline muted autoplay></video><svg class="gd" viewBox="0 0 100 130" preserveAspectRatio="xMidYMid meet"><path d="' + g[0] + '" fill="rgba(255,255,255,.07)" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' +
      '<i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><button class="lvl" data-x="orient">點這裡開啟水平提示</button></div>' +
      '<div class="tip">' + esc(g[1]) + '</div>' +
      '<div class="bot"><label class="alb">相簿<input type="file" accept="image/*" style="display:none"></label><button class="sh" data-x="shot" aria-label="拍照"><i></i></button><span class="hint">素色背景<br>效果最好</span></div>';
    video = $('video');
    root.onclick = onClick;
    $('input[type=file]').onchange = function (e) { var f = e.target.files && e.target.files[0]; if (f) process(f); };
    $('.chips button.on').scrollIntoView({ inline: 'center', block: 'nearest' });
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') startOrient();
    else if (orientOn) startOrient();
    if (stream) { video.srcObject = stream; return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false })
      .then(function (s) { stream = s; if (video) video.srcObject = s; })
      .catch(function (e) { var v = $('.view'); if (v) v.insertAdjacentHTML('beforeend', '<div class="work"><div>打不開相機<br><span style="font-size:12px;opacity:.8">' + esc(e.name || e) + '</span><br>可以先用左下角「相簿」選照片</div></div>'); });
  }
  function startOrient() { orientOn = true; window.addEventListener('deviceorientation', onOrient); var b = root && $('.lvl'); if (b) b.textContent = '偵測手機角度中…'; }
  function onOrient(e) {
    var b = root && root.querySelector('.lvl'); if (!b || e.beta === null) return;
    var flat = Math.abs(e.beta) < 9 && Math.abs(e.gamma) < 9, up = Math.abs(e.beta - 90) < 10 && Math.abs(e.gamma) < 9;
    b.className = 'lvl ' + (flat || up ? 'ok' : 'no');
    b.textContent = flat ? '⦿ 手機已放平' : up ? '⦿ 手機已直立' : '請把手機放平（平拍）或直立（掛拍）';
  }
  function onClick(e) {
    var t = e.target.closest('[data-x],[data-cat],[data-bg]'); if (!t) return;
    if (t.dataset.cat) { cat = t.dataset.cat; live(); return; }
    if (t.dataset.bg) { var pv = $('.pv'); pv.className = 'pv ' + t.dataset.bg; root.querySelectorAll('.bgsw button').forEach(function (b) { b.classList.toggle('on', b === t); }); return; }
    var x = t.dataset.x;
    if (x === 'close') close({ cancel: true });
    else if (x === 'orient') { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') startOrient(); }).catch(function () {}); }
    else if (x === 'shot') shoot();
    else if (x === 'retake') live();
    else if (x === 'usecut') toData(cutBlob).then(function (d) { close({ kind: 'cut', data: d }); });
    else if (x === 'useraw') toData(rawBlob).then(function (d) { close({ kind: 'raw', data: d, pending: false }); });
    else if (x === 'download') download();
  }

  /* ---------- 拍下：只取畫面上看得到的範圍 ---------- */
  function shoot() {
    if (!video || !video.videoWidth) return;
    var vw = video.videoWidth, vh = video.videoHeight, bw = video.clientWidth, bh = video.clientHeight;
    var k = Math.max(bw / vw, bh / vh), sw = bw / k, sh = bh / k, sx = (vw - sw) / 2, sy = (vh - sh) / 2;
    var m = Math.min(1, 1400 / Math.max(sw, sh)), c = document.createElement('canvas'); c.width = Math.round(sw * m); c.height = Math.round(sh * m);
    c.getContext('2d').drawImage(video, sx, sy, sw, sh, 0, 0, c.width, c.height);
    c.toBlob(function (b) { process(b); }, 'image/jpeg', 0.92);
  }
  function shrink(file) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { var m = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * m); c.height = Math.round(im.naturalHeight * m);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(res, 'image/jpeg', 0.92); };
      im.onerror = function () { URL.revokeObjectURL(u); res(file); };
      im.src = u;
    });
  }
  function loadLib() {
    if (lib) return lib;
    var urls = ['https://cdn.jsdelivr.net/npm/@imgly/background-removal@1/+esm', 'https://esm.sh/@imgly/background-removal@1'];
    lib = (function tryAt(i) { return import(urls[i]).then(function (m) { return m.default || m.removeBackground; }).catch(function (e) { if (i + 1 < urls.length) return tryAt(i + 1); lib = null; throw e; }); })(0);
    return lib;
  }
  function process(file) {
    var my = ++job; var u0 = URL.createObjectURL(file);
    root.innerHTML = '<div class="tb"><button data-x="retake" aria-label="返回">‹</button><span>去背中</span><span style="width:36px"></span></div>' +
      '<div class="view"><img class="shotimg" src="' + u0 + '" style="object-fit:contain"><div class="work"><div><div class="spin"></div><span id="dpw">處理照片…</span><div style="font-size:11.5px;opacity:.7">第一次使用要下載去背模型（約 80MB），建議連 Wi-Fi</div></div></div></div><div style="height:96px"></div>';
    var w = function (t) { var el = root && root.querySelector('#dpw'); if (el) el.textContent = t; };
    shrink(file).then(function (b) {
      rawBlob = b; w('載入去背工具…');
      return loadLib().then(function (remove) {
        w('去背中…');
        return remove(b, { model: 'isnet_fp16', output: { format: 'image/png' },
          progress: function (key, cur, tot) { if (tot && /fetch/.test(key)) w('下載去背模型 ' + Math.round(cur / tot * 100) + '%'); else if (/compute|inference/.test(key)) w('去背中…'); } });
      });
    }).then(function (cut) { if (my !== job) return; cutBlob = cut; preview(true); })
      .catch(function (e) { if (my !== job) return; cutBlob = null; preview(false, String(e && e.message || e)); })
      .then(function () { URL.revokeObjectURL(u0); });
  }

  /* ---------- 預覽：換底色看邊緣 ---------- */
  function preview(ok, err) {
    if (!root) return;
    var u = URL.createObjectURL(ok ? cutBlob : rawBlob);
    root.innerHTML = '<div class="tb"><button data-x="close" aria-label="關閉">✕</button><span>' + (ok ? '去背預覽' : '去背失敗') + '</span><span style="width:36px"></span></div>' +
      '<div class="view"><div class="pv ' + (ok ? 'chk' : 'light') + '"><img src="' + u + '"></div>' +
      (ok ? '<div class="bgsw"><button data-bg="chk" class="on" style="background:repeating-conic-gradient(#bbb 0 25%,#fff 0 50%) 0 0/10px 10px"></button><button data-bg="dark" style="background:#3E3A39"></button><button data-bg="light" style="background:#FFFCF6"></button></div>' : '') + '</div>' +
      '<div class="msg">' + (ok ? '換底色檢查邊緣：白邊有沒有去乾淨、衣服有沒有被吃掉' : '這張沒辦法自動去背' + (/fetch|import|network|load/i.test(err || '') ? '（去背工具下載失敗，請確認網路）' : '') + '<br>可以下載原圖用美圖秀秀去背<br><span style="font-size:10.5px;opacity:.6">' + esc(String(err || '').slice(0, 80)) + '</span>') + '</div>' +
      '<div class="acts">' + (ok ? '<button class="main" data-x="usecut">用這張（去背版）</button>' : '') +
      '<button data-x="download">下載原圖<br><span style="font-size:11px;opacity:.75">先存原圖、標記待去背</span></button><button data-x="retake">重拍</button>' +
      (ok ? '' : '<button class="main" data-x="useraw" style="background:rgba(255,255,255,.22);color:#fff">直接用原圖（不去背）</button>') + '</div>';
  }
  function toData(b) { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsDataURL(b); }); }
  function download() {
    var f = new File([rawBlob], '衣服原圖.jpg', { type: 'image/jpeg' });
    var after = function () { toData(rawBlob).then(function (d) { close({ kind: 'raw', data: d, pending: true }); }); };
    if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f] }).then(after).catch(function (e) { if (e && e.name === 'AbortError') return; after(); });
    else { var u = URL.createObjectURL(rawBlob); root.insertAdjacentHTML('beforeend', '<div class="work" style="position:fixed;z-index:60;background:rgba(0,0,0,.9)"><div><img src="' + u + '" style="max-width:80vw;max-height:60vh;display:block;margin:0 auto 12px">長按圖片 →「加入照片」存到相簿<br><button data-x="dlok" style="margin-top:12px;border:0;border-radius:12px;padding:10px 20px;background:#F0A497;font-size:14px">存好了</button></div></div>');
      root.querySelector('[data-x=dlok]').onclick = function (e) { e.stopPropagation(); after(); }; }
  }
  return { open: open };
})();
