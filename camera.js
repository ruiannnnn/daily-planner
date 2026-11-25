/* Daily Planner 拍衣服相機：構圖框 → 拍照 → AI 去背 → 預覽 → 傳回網站
   放在主畫面外殼這一層，因為 iPhone 不讓被包在裡面的網頁開相機 */
window.DPCam = (function () {
  var CATS = ['上衣', '內搭', '褲子', '裙子', '洋裝', '外套', '鞋子', '包包', '配件'];
  var TOP = 'M38,18 Q50,25 62,18 L76,24 L84,64 L76,66 L72,42 L72,102 L28,102 L28,42 L24,66 L16,64 L24,24 Z';
  var G = {
    '上衣': [TOP, '袖子往下放，貼著身體兩側；手機對準衣服中間'],
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
    '#dpcam .hz{position:absolute;left:0;right:0;top:50%;height:0;pointer-events:none;display:none}#dpcam .hz.on{display:block}' +
    '#dpcam .hline{position:absolute;left:12%;right:12%;top:-1px;height:2px;background:rgba(255,255,255,.85);box-shadow:0 0 3px rgba(0,0,0,.5);transform-origin:50% 50%}#dpcam .hz.ok .hline{background:#8BD3A0}' +
    '#dpcam .ref{position:absolute;top:-1px;width:9%;height:2px;background:rgba(255,255,255,.55)}#dpcam .ref.l{left:2%}#dpcam .ref.r{right:2%}#dpcam .hz.ok .ref{background:#8BD3A0}' +
    '#dpcam .bub{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;border:2px solid rgba(255,255,255,.75);pointer-events:none;display:none}#dpcam .bub.on{display:block}' +
    '#dpcam .bub::before,#dpcam .bub::after{content:"";position:absolute;background:rgba(255,255,255,.5)}#dpcam .bub::before{left:50%;top:-10px;bottom:-10px;width:1px}#dpcam .bub::after{top:50%;left:-10px;right:-10px;height:1px}' +
    '#dpcam .bub i{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:rgba(255,255,255,.9);box-shadow:0 0 4px rgba(0,0,0,.4)}#dpcam .bub.ok{border-color:#8BD3A0}#dpcam .bub.ok i{background:#8BD3A0}' +
    '#dpcam .tb .fl{font-size:13px;width:auto;padding:4px 10px;border-radius:99px;background:rgba(255,255,255,.14);height:auto}#dpcam .tb .fl.on{background:#F6D36B;color:#3a2a00}#dpcam .tb .fl.na{opacity:.4}' +
    '#dpcam .pv canvas{max-width:90%;max-height:90%;touch-action:none}' +
    '#dpcam .tools{display:flex;gap:6px;padding:10px 12px 0;justify-content:center}#dpcam .tools button{flex:1;border:0;border-radius:12px;padding:7px 2px;font-size:12px;background:rgba(255,255,255,.12);color:#fff;display:flex;flex-direction:column;align-items:center;gap:2px;max-width:76px}#dpcam .tools button b{font-size:17px;font-weight:400;line-height:1.1}#dpcam .tools button.on{background:#F0A497;color:#2B2925}#dpcam .tools button:disabled{opacity:.35}' +
    '#dpcam .rot{display:flex;align-items:center;gap:8px;padding:8px 18px 0;font-size:12px}#dpcam .rot input{flex:1;accent-color:#F0A497}#dpcam .rot button{border:0;border-radius:99px;padding:4px 10px;background:rgba(255,255,255,.16);color:#fff;font-size:12px}' +
    '#dpcam .msg{font-size:12.5px;text-align:center;opacity:.85;padding:8px 18px 0;line-height:1.6}';
  var root, video, stream, cb, cat, rawBlob, cutBlob, lib = null, orientOn = false, job = 0, torch = false, torchOk = null;

  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function open(req, done) {
    cb = done; cat = CATS.indexOf(req && req.cat) >= 0 ? req.cat : '上衣';
    if (!document.getElementById('dpcam-css')) { var st = document.createElement('style'); st.id = 'dpcam-css'; st.textContent = CSS; document.head.appendChild(st); }
    root = document.createElement('div'); root.id = 'dpcam'; document.body.appendChild(root);
    live();
  }
  function close(res) {
    torch = false; if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    window.removeEventListener('deviceorientation', onOrient);
    if (root) { root.remove(); root = null; }
    var f = cb; cb = null; if (f) f(res || { cancel: true });
  }

  /* ---------- 拍照畫面 ---------- */
  function live() {
    job++; var g = G[cat];
    root.innerHTML = '<div class="tb"><button data-x="close" aria-label="關閉">✕</button><span>拍' + esc(cat) + '</span><button class="fl' + (torch ? ' on' : '') + (torchOk === false ? ' na' : '') + '" data-x="torch" aria-label="閃光燈">⚡ ' + (torch ? '開' : '關') + '</button></div>' +
      '<div class="chips">' + CATS.map(function (c) { return '<button data-cat="' + c + '" class="' + (c === cat ? 'on' : '') + '">' + c + '</button>'; }).join('') + '</div>' +
      '<div class="view"><video playsinline muted autoplay></video><svg class="gd" viewBox="0 0 100 130" preserveAspectRatio="xMidYMid meet"><path d="' + g[0] + '" fill="rgba(255,255,255,.07)" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' +
      '<i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><div class="hz"><i class="ref l"></i><i class="ref r"></i><div class="hline"></div></div><div class="bub"><i></i></div><button class="lvl" data-x="orient">點這裡開啟水平提示</button></div>' +
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
      .then(function (s) { stream = s; if (video) video.srcObject = s; checkTorch(); })
      .catch(function (e) { var v = $('.view'); if (v) v.insertAdjacentHTML('beforeend', '<div class="work"><div>打不開相機<br><span style="font-size:12px;opacity:.8">' + esc(e.name || e) + '</span><br>可以先用左下角「相簿」選照片</div></div>'); });
  }
  /* 閃光燈：手機相機的補光燈（拍照時一直亮著） */
  function vtrack() { return stream && stream.getVideoTracks()[0]; }
  function checkTorch() { var t = vtrack(), c = null; try { c = t && t.getCapabilities ? t.getCapabilities() : null; } catch (e) {} torchOk = !!(c && c.torch);
    var b = root && root.querySelector('.fl'); if (b) b.classList.toggle('na', !torchOk); if (torch) setTorch(true); }
  function setTorch(on) { var t = vtrack(); if (!t) return Promise.reject();
    return t.applyConstraints({ advanced: [{ torch: on }] }).then(function () { torch = on; var b = root && root.querySelector('.fl'); if (b) { b.classList.toggle('on', on); b.textContent = '⚡ ' + (on ? '開' : '關'); } }); }
  function toast(t) { if (!root) return; var d = document.createElement('div'); d.className = 'lvl'; d.style.cssText = 'top:auto;bottom:16px;z-index:5;background:rgba(0,0,0,.7)'; d.textContent = t; var v = root.querySelector('.view'); if (v) { v.appendChild(d); setTimeout(function () { d.remove(); }, 2200); } }
  function startOrient() { orientOn = true; window.addEventListener('deviceorientation', onOrient); var b = root && $('.lvl'); if (b) b.textContent = '偵測手機角度中…'; }
  function onOrient(e) {
    var b = root && root.querySelector('.lvl'); if (!b || e.beta === null) return;
    var up0 = Math.abs(e.beta) > 45, flat = !up0 && Math.abs(e.beta) < 2 && Math.abs(e.gamma) < 2, up = up0 && Math.abs(e.gamma) < 1.5;
    b.className = 'lvl ' + (flat || up ? 'ok' : 'no');
    b.textContent = flat ? '⦿ 手機已放平' : up ? '⦿ 已經拿正了' : up0 ? '轉一點，讓白線跟兩側短線對齊' : '把白點移到圓圈中間';
    /* 直拿：水平線跟著傾斜，轉正就變綠；平放：中間的氣泡要移到圓圈中心 */
    var hz = root.querySelector('.hz'), bub = root.querySelector('.bub'), upright = Math.abs(e.beta) > 45;
    if (hz && bub) {
      hz.classList.toggle('on', upright); bub.classList.toggle('on', !upright);
      if (upright) { var roll = e.gamma * (e.beta > 0 ? 1 : -1), lv = Math.abs(roll) < 1.5; hz.classList.toggle('ok', lv); hz.querySelector('.hline').style.transform = 'rotate(' + (lv ? 0 : -roll) + 'deg)'; }
      else { var dx = Math.max(-23, Math.min(23, e.gamma * 1.6)), dy = Math.max(-23, Math.min(23, e.beta * 1.6)), ok = Math.abs(e.gamma) < 2 && Math.abs(e.beta) < 2;
        bub.classList.toggle('ok', ok); bub.querySelector('i').style.transform = 'translate(' + (ok ? 0 : -dx) + 'px,' + (ok ? 0 : -dy) + 'px)'; }
    }
  }
  function onClick(e) {
    var t = e.target.closest('[data-x],[data-cat],[data-bg]'); if (!t) return;
    if (t.dataset.cat) { cat = t.dataset.cat; live(); return; }
    if (t.dataset.bg) { var pv = $('.pv'); pv.className = 'pv ' + t.dataset.bg; root.querySelectorAll('.bgsw button').forEach(function (b) { b.classList.toggle('on', b === t); }); return; }
    var x = t.dataset.x;
    if (x === 'close') close({ cancel: true });
    else if (x === 'orient') { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') startOrient(); }).catch(function () {}); }
    else if (x === 'shot') shoot();
    else if (x === 'torch') { if (!torchOk) return toast('這支手機在網頁裡不支援閃光燈，可以開房間燈或靠窗拍'); setTorch(!torch).catch(function () { toast('閃光燈開不起來'); }); }
    else if (x === 'retake') live();
    else if (x === 'usecut') { var cv = root.querySelector('#ed'); (cv ? new Promise(function (r) { cv.toBlob(r, 'image/png'); }) : Promise.resolve(cutBlob)).then(toData).then(function (d) { close({ kind: 'cut', data: d }); }); }
    else if (x === 'tap' || x === 'brush' || x === 'straight') edTool(x);
    else if (x === 'sym') edSym();
    else if (x === 'undo') edUndo();
    else if (x === 'auto') edAuto();
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
      '<div class="view"><div class="pv ' + (ok ? 'chk' : 'light') + '">' + (ok ? '<canvas id="ed"></canvas>' : '<img src="' + u + '">') + '</div>' +
      (ok ? '<div class="bgsw"><button data-bg="chk" class="on" style="background:repeating-conic-gradient(#bbb 0 25%,#fff 0 50%) 0 0/10px 10px"></button><button data-bg="dark" style="background:#3E3A39"></button><button data-bg="light" style="background:#FFFCF6"></button></div>' : '') + '</div>' +
      (ok ? '<div class="tools"><button data-x="tap"><b>◎</b>點選去除</button><button data-x="brush"><b>⌫</b>橡皮擦</button><button data-x="straight"><b>⟲</b>扶正</button><button data-x="sym"><b>◫</b>修齊左右</button><button data-x="undo" disabled><b>↶</b>復原</button></div><div class="rot" style="display:none"><span>傾斜</span><input type="range" min="-15" max="15" step="0.5" value="0"><span class="rv" style="width:34px;text-align:right">0°</span><button data-x="auto">自動</button></div>' : '') +
      '<div class="msg">' + (ok ? '衣架、掛勾：按「點選去除」再點一下它；沒去乾淨的用橡皮擦塗掉' : '這張沒辦法自動去背' + (/fetch|import|network|load/i.test(err || '') ? '（去背工具下載失敗，請確認網路）' : '') + '<br>可以下載原圖用美圖秀秀去背<br><span style="font-size:10.5px;opacity:.6">' + esc(String(err || '').slice(0, 80)) + '</span>') + '</div>' +
      '<div class="acts">' + (ok ? '<button class="main" data-x="usecut">用這張（去背版）</button>' : '') +
      '<button data-x="download">下載原圖<br><span style="font-size:11px;opacity:.75">先存原圖、標記待去背</span></button><button data-x="retake">重拍</button>' +
      (ok ? '' : '<button class="main" data-x="useraw" style="background:rgba(255,255,255,.22);color:#fff">直接用原圖（不去背）</button>') + '</div>';
    if (ok) edInit(u);
  }

  /* ---------- 修圖：點選去除（衣架）、橡皮擦、扶正、修齊左右 ---------- */
  var E = null;
  function edInit(url) {
    var im = new Image(); im.onload = function () {
      var cv = root && root.querySelector('#ed'); if (!cv) return;
      cv.width = im.naturalWidth; cv.height = im.naturalHeight; var g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      E = { cv: cv, g: g, tool: null, undo: [], base: null, rot: 0 };
      cv.addEventListener('pointerdown', edDown); cv.addEventListener('pointermove', edMove);
      cv.addEventListener('pointerup', edUp); cv.addEventListener('pointercancel', edUp);
      var r = root.querySelector('.rot input'); r.oninput = function () { edRotate(+r.value); }; r.onchange = function () { E.base = null; };
    }; im.src = url;
  }
  function edPush() { E.undo.push(E.g.getImageData(0, 0, E.cv.width, E.cv.height)); if (E.undo.length > 12) E.undo.shift(); root.querySelector('[data-x=undo]').disabled = false; }
  function edUndo() { if (!E || !E.undo.length) return; var d = E.undo.pop(); E.cv.width = d.width; E.cv.height = d.height; E.g.putImageData(d, 0, 0); E.base = null; E.rot = 0;
    var r = root.querySelector('.rot input'); r.value = 0; root.querySelector('.rv').textContent = '0°'; root.querySelector('[data-x=undo]').disabled = !E.undo.length; }
  function edTool(t) {
    if (!E) return; E.tool = E.tool === t ? null : t;
    root.querySelectorAll('.tools [data-x]').forEach(function (b) { b.classList.toggle('on', b.dataset.x === E.tool); });
    root.querySelector('.rot').style.display = E.tool === 'straight' ? 'flex' : 'none';
    var m = root.querySelector('.msg'); m.textContent = E.tool === 'tap' ? '點一下要去掉的東西（衣架、掛勾、線），同顏色相連的部分會一起去掉' : E.tool === 'brush' ? '用手指塗掉不要的地方' : E.tool === 'straight' ? '拉動滑桿把衣服轉正，或按「自動」' : '衣架、掛勾：按「點選去除」再點一下它；沒去乾淨的用橡皮擦塗掉';
  }
  function edPt(e) { var r = E.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * E.cv.width / r.width, y: (e.clientY - r.top) * E.cv.height / r.height, k: E.cv.width / r.width }; }
  function edDown(e) {
    if (!E || !E.tool || E.tool === 'straight') return; e.preventDefault(); var p = edPt(e);
    if (E.tool === 'tap') { edPush(); edFill(Math.round(p.x), Math.round(p.y)); return; }
    edPush(); E.drag = true; E.last = p; edDab(p, p);
  }
  function edMove(e) { if (!E || !E.drag) return; e.preventDefault(); var p = edPt(e); edDab(E.last, p); E.last = p; }
  function edUp() { if (E) E.drag = false; }
  function edDab(a, b) { var g = E.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round'; g.lineWidth = 26 * a.k; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x + 0.01, b.y); g.stroke(); g.restore(); }
  /* 點選去除：從點到的地方開始，把顏色相近、連在一起的不透明像素都變透明，再把邊緣的雜色一起清掉 */
  function edFill(x0, y0) {
    var W = E.cv.width, H = E.cv.height; if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return;
    var id = E.g.getImageData(0, 0, W, H), a = id.data, i0 = (y0 * W + x0) * 4;
    if (a[i0 + 3] < 30) { edMsg('這裡已經是透明的，點在衣架上'); E.undo.pop(); return; }
    var r0 = a[i0], g0 = a[i0 + 1], b0 = a[i0 + 2], tol = 62 * 62, seen = new Uint8Array(W * H), q = new Int32Array(W * H), h = 0, t = 0, n = 0;
    var near = function (j, tt) { var dr = a[j * 4] - r0, dg = a[j * 4 + 1] - g0, db = a[j * 4 + 2] - b0; return a[j * 4 + 3] > 20 && dr * dr + dg * dg + db * db < tt; };
    seen[y0 * W + x0] = 1; q[t++] = y0 * W + x0;
    while (h < t) { var j = q[h++], x = j % W; a[j * 4 + 3] = 0; n++;
      var nb = [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, j >= W ? j - W : -1, j < W * H - W ? j + W : -1];
      for (var k = 0; k < 4; k++) { var m = nb[k]; if (m >= 0 && !seen[m]) { seen[m] = 1; if (near(m, tol)) q[t++] = m; } } }
    /* 邊緣柔化：緊貼去掉區域、顏色還算接近的像素也去掉，避免留下一圈紫邊 */
    for (var pass = 0; pass < 2; pass++) { var kill = [];
      for (var y = 1; y < H - 1; y++) for (var x2 = 1; x2 < W - 1; x2++) { var j2 = y * W + x2; if (a[j2 * 4 + 3] === 0) continue;
        if ((a[(j2 - 1) * 4 + 3] === 0 || a[(j2 + 1) * 4 + 3] === 0 || a[(j2 - W) * 4 + 3] === 0 || a[(j2 + W) * 4 + 3] === 0) && near(j2, tol * 2.6)) kill.push(j2); }
      kill.forEach(function (j3) { a[j3 * 4 + 3] = 0; }); }
    E.g.putImageData(id, 0, 0); edMsg(n < 30 ? '去掉的範圍很小，可以點在衣架顏色比較純的地方' : '已去掉，還有殘留可以再點一次或用橡皮擦');
  }
  function edMsg(t) { var m = root && root.querySelector('.msg'); if (m) m.textContent = t; }
  /* 扶正：以目前的圖為底旋轉，畫布放大到不會切到 */
  function edRotate(deg) {
    if (!E) return; if (!E.base) { edPush(); E.base = E.undo[E.undo.length - 1]; }
    var b = E.base, c0 = document.createElement('canvas'); c0.width = b.width; c0.height = b.height; c0.getContext('2d').putImageData(b, 0, 0);
    var rad = deg * Math.PI / 180, W = Math.ceil(Math.abs(b.width * Math.cos(rad)) + Math.abs(b.height * Math.sin(rad))), H = Math.ceil(Math.abs(b.width * Math.sin(rad)) + Math.abs(b.height * Math.cos(rad)));
    E.cv.width = W; E.cv.height = H; var g = E.g; g.clearRect(0, 0, W, H); g.save(); g.translate(W / 2, H / 2); g.rotate(rad); g.drawImage(c0, -b.width / 2, -b.height / 2); g.restore();
    root.querySelector('.rv').textContent = (deg > 0 ? '+' : '') + deg + '°';
  }
  /* 自動扶正：找一個角度，讓衣服的輪廓左右最對稱 */
  function edAuto() {
    if (!E) return; var src = E.base || E.g.getImageData(0, 0, E.cv.width, E.cv.height), s = Math.min(1, 160 / Math.max(src.width, src.height));
    var c0 = document.createElement('canvas'); c0.width = src.width; c0.height = src.height; c0.getContext('2d').putImageData(src, 0, 0);
    var N = 220, c1 = document.createElement('canvas'); c1.width = c1.height = N; var g1 = c1.getContext('2d', { willReadFrequently: true }), best = 0, bs = 1e18;
    for (var d = -15; d <= 15; d += 0.5) {
      g1.clearRect(0, 0, N, N); g1.save(); g1.translate(N / 2, N / 2); g1.rotate(d * Math.PI / 180); g1.drawImage(c0, -src.width * s / 2, -src.height * s / 2, src.width * s, src.height * s); g1.restore();
      var a = g1.getImageData(0, 0, N, N).data, sx = 0, sn = 0;
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) if (a[(y * N + x) * 4 + 3] > 128) { sx += x; sn++; }
      if (!sn) continue; var cx = Math.round(sx / sn), sc = 0;
      for (var y2 = 0; y2 < N; y2++) for (var x2 = 0; x2 < N; x2++) { var mx = 2 * cx - x2; var o1 = a[(y2 * N + x2) * 4 + 3] > 128, o2 = mx >= 0 && mx < N && a[(y2 * N + mx) * 4 + 3] > 128; if (o1 !== o2) sc++; }
      if (sc < bs) { bs = sc; best = d; }
    }
    var r = root.querySelector('.rot input'); r.value = best; edRotate(best); edMsg(best ? '自動轉了 ' + best + '°，可以再用滑桿微調' : '看起來已經是正的');
  }
  /* 修齊左右：輪廓以中線對摺，只保留兩邊都有的部分（圖案不動，只修掉多出來的一邊） */
  function edSym() {
    if (!E) return; edPush(); E.base = null; var W = E.cv.width, H = E.cv.height, id = E.g.getImageData(0, 0, W, H), a = id.data, sx = 0, sn = 0;
    for (var y = 0; y < H; y += 2) for (var x = 0; x < W; x += 2) if (a[(y * W + x) * 4 + 3] > 128) { sx += x; sn++; }
    if (!sn) return; var c0 = sx / sn, best = c0, bs = -1;
    for (var off = -W * 0.04; off <= W * 0.04; off += Math.max(1, W / 400)) { var c = c0 + off, sc = 0;
      for (var y2 = 0; y2 < H; y2 += 4) for (var x2 = 0; x2 < W; x2 += 4) { var m = Math.round(2 * c - x2); if (m >= 0 && m < W && a[(y2 * W + x2) * 4 + 3] > 128 && a[(y2 * W + m) * 4 + 3] > 128) sc++; }
      if (sc > bs) { bs = sc; best = c; } }
    /* 只看「外面」：從邊緣連進來的透明區域，衣服中間的小洞不算，避免把洞也複製到另一邊 */
    var outside = new Uint8Array(W * H), q = new Int32Array(W * H), qh = 0, qt = 0;
    var push = function (j) { if (!outside[j] && a[j * 4 + 3] < 128) { outside[j] = 1; q[qt++] = j; } };
    for (var xx = 0; xx < W; xx++) { push(xx); push((H - 1) * W + xx); } for (var yy = 0; yy < H; yy++) { push(yy * W); push(yy * W + W - 1); }
    while (qh < qt) { var j = q[qh++], xj = j % W; if (xj > 0) push(j - 1); if (xj < W - 1) push(j + 1); if (j >= W) push(j - W); if (j < W * H - W) push(j + W); }
    var out = new Uint8ClampedArray(a);
    for (var y3 = 0; y3 < H; y3++) for (var x3 = 0; x3 < W; x3++) { var m2 = Math.round(2 * best - x3), idx = y3 * W + x3;
      if (m2 < 0 || m2 >= W) { out[idx * 4 + 3] = 0; continue; }
      var mj = y3 * W + m2; if (outside[mj]) out[idx * 4 + 3] = Math.min(a[idx * 4 + 3], a[mj * 4 + 3]); }
    id.data.set(out); E.g.putImageData(id, 0, 0); edMsg('已把左右輪廓修齊；不滿意可以按「復原」');
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
