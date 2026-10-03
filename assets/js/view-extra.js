/* ==========================================================================
   view-extra.js —— 上传 / 主题更换 / 更多服务 / 关于
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;
  const vc = CZ.vc;

  /* ---------------------------------- 上传 ---------------------------------- */
  CZ.views.upload = function () {
    const D = CZ.DATA;
    const samples = D.patterns.slice(0, 6).map((p) =>
      '<button class="sample" data-sample="' + p.id + '"><span>' + U.motif(p) + '</span><b>' + U.esc(p.listName) + '</b></button>').join('');

    return U.el(
      '<div class="uploadpage">' +
      vc.navbar('上传语料', { back: false, right: '<button class="glass-btn" data-more aria-label="上传规范">' + CZ.icon('info', { size: 19 }) + '</button>' }) +
      '<div class="upsteps" id="upSteps">' +
      '<div class="upstep is-on"><span>1</span><b>选择图片</b></div>' +
      '<i class="upsteps__line"></i>' +
      '<div class="upstep"><span>2</span><b>填写信息</b></div>' +
      '<i class="upsteps__line"></i>' +
      '<div class="upstep"><span>3</span><b>提交审核</b></div>' +
      '</div>' +

      '<section class="upblock" data-panel="1">' +
      '<label class="dropzone" id="dropzone">' +
      '<input type="file" accept="image/*" multiple hidden id="fileInput">' +
      '<span class="dropzone__ic">' + CZ.icon('camera', { size: 26 }) + '</span>' +
      '<b>拍摄或选择纹样照片</b>' +
      '<i>支持 JPG / PNG，建议 2000px 以上；每张不超过 20 MB</i>' +
      '</label>' +
      '<div class="sec-head"><div class="sec-head__tx"><h2>或从素材库选择</h2><p>馆藏已收录的纹样图版</p></div></div>' +
      '<div class="samples">' + samples + '</div>' +
      '</section>' +

      '<section class="upblock is-locked" data-panel="2">' +
      '<div class="pickrow" id="pickRow"></div>' +
      '<div class="form">' +
      '<label class="field"><span>纹样名称</span><input id="fName" type="text" placeholder="例如：折枝牡丹纹"></label>' +
      '<div class="field"><span>所属类别</span>' +
      '<div class="seg" id="fCat">' +
      '<button class="seg__it is-on" data-v="plant">植物装饰</button>' +
      '<button class="seg__it" data-v="figure">人物装饰</button>' +
      '<button class="seg__it" data-v="craft">工艺器用</button>' +
      '</div></div>' +
      '<div class="field"><span>主题词</span>' +
      '<div class="taginput"><div class="taginput__list" id="tagList"></div>' +
      '<input id="fTag" type="text" placeholder="输入后回车添加"></div>' +
      '<div class="tags tags--pick" id="tagPick">' +
      ['牡丹纹', '缠枝纹', '白地黑花', '吉祥图案', '婴戏纹', '卷草纹', '适合纹样', '金代'].map((t) => '<button class="tag tag--soft" data-t="' + t + '">' + t + '</button>').join('') +
      '</div></div>' +
      '<label class="field"><span>年代 / 产地</span><input id="fMeta" type="text" placeholder="例如：金代 · 彭城窑"></label>' +
      '<label class="field field--area"><span>描述与来源</span><textarea id="fDesc" rows="3" placeholder="简述纹样构成、器物来源与采集信息"></textarea></label>' +
      '</div>' +
      '<button class="btn btn--ink btn--block" id="submitUp">提交审核</button>' +
      '<p class="upnote">提交后由博物馆研究人员审核，通常 1—3 个工作日</p>' +
      '</section>' +

      vc.bottomSpace(120) + '</div>'
    );
  };

  CZ.views.upload.mounted = function (pageEl) {
    let picked = [];
    let tags = ['牡丹纹'];
    const pickRow = U.qs('#pickRow', pageEl);
    const tagList = U.qs('#tagList', pageEl);
    const fileInput = U.qs('#fileInput', pageEl);

    function setStep(n) {
      U.qsa('.upstep', pageEl).forEach((s, i) => {
        s.classList.toggle('is-on', i === n - 1);
        s.classList.toggle('is-done', i < n - 1);
      });
      U.qs('[data-panel="1"]', pageEl).classList.toggle('is-locked', n > 1);
      U.qs('[data-panel="2"]', pageEl).classList.toggle('is-locked', n < 2);
      if (n < 2) U.qs('[data-panel="2"]', pageEl).classList.add('is-locked');
    }

    function drawTags() {
      tagList.innerHTML = tags.map((t) => '<button class="tag tag--on" data-rm="' + U.esc(t) + '">' + U.esc(t) +
        CZ.icon('close', { size: 12 }) + '</button>').join('');
      U.qsa('[data-rm]', tagList).forEach((b) => b.addEventListener('click', () => {
        tags = tags.filter((t) => t !== b.dataset.rm);
        drawTags();
      }));
    }

    function addPick(html, label) {
      const node = U.el('<div class="pick"><span class="pick__art">' + html + '</span><b>' + U.esc(label) + '</b>' +
        '<button class="pick__rm" aria-label="移除">' + CZ.icon('close', { size: 13 }) + '</button></div>');
      U.qs('.pick__rm', node).addEventListener('click', () => {
        node.remove();
        picked = picked.filter((p) => p.node !== node);
        if (!picked.length) { setStep(1); CZ.ui.toast('已移除全部图片'); }
      });
      pickRow.appendChild(node);
      picked.push({ node: node, label: label });
      node.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }

    U.qsa('[data-sample]', pageEl).forEach((b) => b.addEventListener('click', () => {
      const p = CZ.DATA.byId(b.dataset.sample);
      addPick(U.motif(p), p.listName);
      U.qs('#fName', pageEl).value = p.title;
      U.qs('#fMeta', pageEl).value = p.meta.era + ' · ' + p.meta.origin;
      tags = p.themes.slice(0, 3);
      drawTags();
      setStep(2);
      CZ.ui.toast('已选择「' + p.listName + '」，请补充信息', { icon: 'check' });
      setTimeout(() => U.qs('[data-panel="2"]', pageEl).scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }));

    fileInput.addEventListener('change', () => {
      const files = Array.prototype.slice.call(fileInput.files || []);
      if (!files.length) return;
      files.forEach((f) => {
        const url = URL.createObjectURL(f);
        addPick('<img src="' + url + '" alt="">', f.name.replace(/\.[^.]+$/, ''));
      });
      U.qs('#fName', pageEl).focus();
      setStep(2);
      CZ.ui.toast('已添加 ' + files.length + ' 张图片', { icon: 'check' });
    });

    U.qsa('.seg__it', pageEl).forEach((b) => b.addEventListener('click', () => {
      U.qsa('.seg__it', pageEl).forEach((x) => x.classList.remove('is-on'));
      b.classList.add('is-on');
    }));

    drawTags();
    U.qs('#fTag', pageEl).addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const v = e.target.value.trim();
      if (!v || tags.indexOf(v) >= 0) return;
      tags.push(v);
      e.target.value = '';
      drawTags();
    });
    U.qsa('[data-t]', pageEl).forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.t;
      if (tags.indexOf(t) >= 0) return;
      tags.push(t);
      drawTags();
    }));

    U.qs('#submitUp', pageEl).addEventListener('click', async () => {
      const name = U.qs('#fName', pageEl).value.trim();
      if (!picked.length && !name) {
        CZ.ui.toast('请先选择或拍摄纹样图片', { icon: 'camera' });
        return;
      }
      const ok = await CZ.ui.confirm({
        title: '提交审核',
        text: '「' + (name || picked[0].label) + '」将提交至博物馆语料审核队列。',
        okText: '提交'
      });
      if (!ok) return;
      const btn = U.qs('#submitUp', pageEl);
      btn.classList.add('is-loading');
      btn.textContent = '正在上传…';
      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.textContent = '提交审核';
        setStep(3);
        CZ.store.addUpload({
          id: 'u' + Date.now(),
          name: name || picked[0].label,
          date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
          status: 'review',
          num: Math.max(1, picked.length)
        });
        CZ.ui.toast('提交成功，等待审核', { icon: 'check' });
        setTimeout(() => CZ.router.go('#/uploads'), 700);
      }, 1200);
    });

    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        title: '上传规范',
        items: [
          { icon: 'camera', label: '分辨率不低于 2000px', desc: '保证纹样细节可辨' },
          { icon: 'sun', label: '均匀散射光拍摄', desc: '避免高光与阴影遮挡纹样' },
          { icon: 'target', label: '正投影、满幅构图', desc: '纹样占画面 80% 以上' },
          { icon: 'info', label: '注明器物来源', desc: '馆藏编号或采集地点' }
        ]
      });
    });
    vc.wirePress(pageEl);
  };

  /* -------------------------------- 主题更换 -------------------------------- */
  const THEMES = [
    { key: 'light', name: '浅色', desc: '白地黑花 · 默认', cls: 'th-light' },
    { key: 'dark', name: '深色', desc: '夜窑观器 · 暗色', cls: 'th-dark' },
    { key: 'sepia', name: '宣纸', desc: '旧纸拓片 · 暖色', cls: 'th-sepia' }
  ];

  CZ.views.theme = function () {
    const st = CZ.store.state;
    const cards = THEMES.map((t) =>
      '<button class="themecard ' + t.cls + (st.theme === t.key ? ' is-on' : '') + '" data-theme="' + t.key + '">' +
      '<span class="themecard__preview"><i></i><i></i><i></i></span>' +
      '<b>' + t.name + '</b><i>' + U.esc(t.desc) + '</i>' +
      '<span class="themecard__check">' + CZ.icon('check', { size: 15 }) + '</span></button>').join('');

    return U.el('<div class="pagebox themepage">' + vc.navbar('主题更换') +
      '<p class="pagehint">选择阅读器物语料时的界面色调</p>' +
      '<div class="themegrid">' + cards + '</div>' +
      '<section class="cblock"><h2>正文字号</h2><div class="seg seg--lg" id="fontSeg">' +
      '<button class="seg__it' + (st.fontScale === 1 ? ' is-on' : '') + '" data-f="1">标准</button>' +
      '<button class="seg__it' + (st.fontScale === 1.08 ? ' is-on' : '') + '" data-f="1.08">较大</button>' +
      '<button class="seg__it' + (st.fontScale === 1.16 ? ' is-on' : '') + '" data-f="1.16">特大</button>' +
      '</div><p class="cbody">当前预览：纹样语料以「' + (st.fontScale === 1 ? '标准' : st.fontScale === 1.08 ? '较大' : '特大') + '」字号显示，正文行高随字号同步变化。</p></section>' +
      '<section class="cblock"><h2>动效</h2>' +
      '<div class="switchrow"><span>界面转场与滚动动效</span>' +
      '<button class="switch' + (st.motion !== 'off' ? ' is-on' : '') + '" id="motionSw" role="switch" aria-checked="' + (st.motion !== 'off') + '"><i></i></button></div>' +
      '<p class="cbody">关闭后保留必要反馈，减少位移与缩放动画（同时自动遵循系统的「减少动态效果」设置）。</p></section>' +
      vc.bottomSpace(120) + '</div>');
  };

  CZ.views.theme.mounted = function (pageEl) {
    U.qsa('.themecard', pageEl).forEach((c) => c.addEventListener('click', () => {
      U.qsa('.themecard', pageEl).forEach((x) => x.classList.remove('is-on'));
      c.classList.add('is-on');
      CZ.store.setTheme(c.dataset.theme);
      CZ.store.applyTheme();
      CZ.ui.toast('已切换为「' + c.querySelector('b').textContent + '」主题', { icon: 'shirt' });
    }));
    U.qsa('#fontSeg .seg__it', pageEl).forEach((b) => b.addEventListener('click', () => {
      U.qsa('#fontSeg .seg__it', pageEl).forEach((x) => x.classList.remove('is-on'));
      b.classList.add('is-on');
      CZ.store.setFontScale(parseFloat(b.dataset.f));
      CZ.store.applyTheme();
      CZ.ui.toast('字号已调整为「' + b.textContent + '」', { icon: 'filter' });
    }));
    U.qs('#motionSw', pageEl).addEventListener('click', (e) => {
      const on = !e.currentTarget.classList.contains('is-on');
      e.currentTarget.classList.toggle('is-on', on);
      e.currentTarget.setAttribute('aria-checked', String(on));
      CZ.store.setMotion(on ? 'on' : 'off');
      CZ.store.applyTheme();
      CZ.ui.toast(on ? '已开启动效' : '已减弱动效', { icon: on ? 'play' : 'check' });
    });
    vc.bindBack(pageEl);
    vc.wirePress(pageEl);
  };

  /* -------------------------------- 更多服务 -------------------------------- */
  CZ.views.more = function () {
    const rows = CZ.DATA.moreServices.map((s) =>
      '<div class="lrow' + (s.route ? ' is-nav' : '') + '"' + (s.route ? ' data-nav="' + s.route + '"' : ' data-action="' + s.action + '"') + '>' +
      '<span class="lrow__ic">' + CZ.icon(s.icon, { size: 21 }) + '</span>' +
      '<span class="lrow__tx"><b>' + U.esc(s.title) + '</b><i>' + U.esc(s.desc) + '</i></span>' +
      '<span class="lrow__go">' + CZ.icon('next', { size: 16 }) + '</span></div>').join('');
    return U.el('<div class="pagebox">' + vc.navbar('更多服务') +
      '<div class="lrows">' + rows + '</div>' +
      '<section class="cblock"><h2>数据与支持</h2>' +
      '<div class="lrows">' +
      vc.listRow({ icon: 'book', title: '使用帮助', desc: '检索、收藏与上传说明', nav: '#/about' }) +
      vc.listRow({ icon: 'cloud', title: '同步与备份', desc: '登录后可跨设备同步', nav: '#/about' }) +
      '</div></section>' + vc.bottomSpace(120) + '</div>');
  };

  CZ.views.more.mounted = function (pageEl) {
    vc.bindBack(pageEl);
    U.qsa('[data-action]', pageEl).forEach((row) => row.addEventListener('click', async () => {
      const act = row.dataset.action;
      if (act === 'font') {
        const st = CZ.store.state;
        CZ.ui.sheet({
          title: '正文字号',
          items: [
            { icon: 'filter', label: '标准', checked: st.fontScale === 1, onTap: () => applyFont(1) },
            { icon: 'filter', label: '较大', checked: st.fontScale === 1.08, onTap: () => applyFont(1.08) },
            { icon: 'filter', label: '特大', checked: st.fontScale === 1.16, onTap: () => applyFont(1.16) }
          ]
        });
      } else if (act === 'cache') {
        const ok = await CZ.ui.confirm({ title: '清理缓存', text: '将清除本地缓存的图版与缩略图（收藏与上传记录不受影响）。', okText: '清理' });
        if (!ok) return;
        CZ.ui.toast('正在清理…', { icon: 'refresh' });
        setTimeout(() => CZ.ui.toast('已清理 12.6 MB 缓存', { icon: 'check' }), 900);
      } else if (act === 'feedback') {
        CZ.ui.sheet({
          title: '意见反馈',
          desc: '你的反馈会直接进入语料校对流程',
          items: [
            { icon: 'info', label: '纹样信息纠错', desc: '名称、年代、技法有误', onTap: () => CZ.ui.toast('已记录，感谢你指出问题', { icon: 'check' }) },
            { icon: 'image', label: '图片质量问题', desc: '模糊、色偏或裁切不当', onTap: () => CZ.ui.toast('已记录，我们会重新采集', { icon: 'check' }) },
            { icon: 'plus', label: '建议新增功能', desc: '告诉我们你想要的能力', onTap: () => CZ.ui.toast('已记录你的建议', { icon: 'check' }) }
          ]
        });
      }
    }));
    function applyFont(v) {
      CZ.store.setFontScale(v);
      CZ.store.applyTheme();
      CZ.ui.toast('字号已更新', { icon: 'check' });
    }
    vc.wirePress(pageEl);
  };

  /* ---------------------------------- 关于 ---------------------------------- */
  CZ.views.about = function () {
    const D = CZ.DATA;
    const logs = [
      { v: 'v1.2.0', d: '2025.09', t: '接入 15 张黑白摄影馆藏图，改为黑白摄影 + 纯白博物馆风格；底部导航升级 iOS 液态玻璃' },
      { v: 'v1.1.0', d: '2025.06', t: '界面升级为液态玻璃质感：环境光渐变底、玻璃面板与指针追光' },
      { v: 'v1.0.0', d: '2025.03', t: '首批开放 1,286 件纹样、342 条历史语料与 8 道工艺图谱' },
      { v: 'v0.9.2', d: '2025.02', t: '新增线稿下载与连续纹样范本视图' },
      { v: 'v0.8.0', d: '2025.01', t: '纹样详情加入相关语料与语料范本双栏' }
    ];
    return U.el('<div class="pagebox aboutpage">' + vc.navbar('关于语料库') +
      '<section class="abouthero">' +
      '<div class="abouthero__mark">' + CZ.Art.motif({ seed: 'about', motif: 'peony', comp: 'medallion' }) + '</div>' +
      '<h1>' + U.esc(D.app.name) + '</h1>' +
      '<p>' + U.esc(D.app.version) + '</p>' +
      '<span class="chip chip--ghost">' + U.esc(D.app.museum) + '</span>' +
      '</section>' +
      '<section class="cblock"><h2>项目简介</h2>' +
      '<p class="cbody">本语料库以磁州窑白地黑花、白化妆刻花装饰纹样为对象，按「植物装饰 / 人物装饰」两大类别整理纹样图像、线稿、器物出处与语料注释，为研究者、设计师与公众提供可检索、可引用的纹样数据。</p></section>' +
      '<section class="cblock"><h2>数据与版权</h2>' +
      vc.kv([
        ['图像来源', '馆藏器物测绘与窑址采集'],
        ['授权范围', '仅限学习研究与非商业使用'],
        ['引用格式', D.app.name + '，' + D.app.museum],
        ['数据说明', '当前版本为界面演示用示例数据']
      ]) + '</section>' +
      '<section class="cblock"><h2>更新日志</h2><div class="logs">' +
      logs.map((l) => '<div class="logrow"><span class="logrow__v">' + U.esc(l.v) + '</span>' +
        '<span class="logrow__tx"><b>' + U.esc(l.d) + '</b><i>' + U.esc(l.t) + '</i></span></div>').join('') +
      '</div></section>' +
      '<section class="cblock"><h2>联系我们</h2>' +
      '<div class="lrows">' +
      vc.listRow({ icon: 'message', title: '学术合作与数据申请', desc: 'yuliao@cizhou-museum.example', right: '' }) +
      vc.listRow({ icon: 'location', title: '馆址', desc: '河北省邯郸市峰峰矿区彭城镇', right: '' }) +
      '</div></section>' +
      U.footer() + vc.bottomSpace(120) + '</div>');
  };

  CZ.views.about.mounted = function (pageEl) {
    vc.bindBack(pageEl);
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        items: [
          { icon: 'share', label: '分享语料库', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) },
          { icon: 'refresh', label: '检查更新', desc: '当前已是最新版本', onTap: () => CZ.ui.toast('已是最新版本', { icon: 'check' }) }
        ]
      });
    });
    vc.wirePress(pageEl);
  };
})();
