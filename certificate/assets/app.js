/* ==========================================================================
   증명서 발급 앱 (대한예수교장로회(백석) 서울강동노회)
   - 증명서 종류별 정의: data/types.json (제목·항목·본문·추가 입력·워터마크)
   - 지면에 찍히는 고정 글자: state.fmt (양식 관리 화면에서 고치고 이 기기에 저장)
   - 사람 명단: data/people.json
   - 직인 이미지: 이 기기 브라우저(localStorage)에만 저장 — 저장소에는 올리지 않는다
   ========================================================================== */
(function () {
  'use strict';

  var A4W = 793.7, A4H = 1122.5, MM = 3.7795;

  var DEFAULTS = {
    church: '글로벌비전교회',
    address: '서울특별시 광진구 구의강변로3가길 33, 상가 2층(구의동)',
    position: '담임목사'
  };

  function defaultFmt() {
    return {
      org: '대한예수교장로회(백석)',
      hqAddress: '서울특별시 서초구 남부순환로 2221',
      tel: 'Tel: 584-6885.9845',
      fax: 'Fax: 521-2729',
      presbytery: '서울강동노회',
      presbyteryAddress: '서울특별시 광진구 구의강변로3가길 33, 2층',
      signerTitle: '노회 서기',
      signerName: '박재용',
      noPrefix: '노회(증)',
      note1: '본 증명서의 진위는 대한예수교장로회(백석) 서울강동노회로 문의하시기 바랍니다.',
      note2: '발급일로부터 90일까지만 효력이 있습니다.',
      types: {}
    };
  }

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    type: $('fType'), name: $('fName'), birth: $('fBirth'), church: $('fChurch'), addr: $('fAddr'),
    sender: $('fSender'), recipient: $('fRecipient'),
    date: $('fDate'), no: $('fNo'), inet: $('fInet'),
    extraBox: $('extraBox'), nameLabel: $('nameLabel'),
    peopleList: $('peopleList'), nameHint: $('nameHint'), warn: $('formWarn'),
    paper: $('paper'), host: $('paperHost'),
    pOrg: $('pOrg'), pHq: $('pHq'), pTel: $('pTel'), pFax: $('pFax'),
    pPresb: $('pPresb'), pNohoeAddr: $('pNohoeAddr'),
    pSignTitleHead: $('pSignTitleHead'), pSignerHead: $('pSignerHead'),
    pNo: $('pNo'), pTitle: $('pTitle'), pFields: $('pFields'), pBody: $('pBody'),
    pDate: $('pDate'), pSignOrg: $('pSignOrg'), pSignTitle: $('pSignTitle'), pSigner: $('pSigner'),
    pNote1: $('pNote1'), pNote2: $('pNote2'), pInet: $('pInet'),
    pFrom: $('pFrom'), pTo: $('pTo'), pFromRow: $('pFromRow'), pToRow: $('pToRow'),
    sealSlots: $('sealSlots'),
    hList: $('hList'), hCnt: $('hCnt'), hSearch: $('hSearch'), hMonth: $('hMonth'), hType: $('hType'),
    toast: $('toast'), tabDot: $('tabDot'), actionBar: $('actionBar')
  };

  var KEY_STATE = 'cert.v1.state';
  var KEY_HIST = 'cert.v1.history';

  var TYPES = [], TYPE_BY_ID = Object.create(null);
  var people = [], peopleByKey = Object.create(null);
  var state = null;

  /* ------------------------------------------------------------------ 저장 */
  function loadJSON(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || 'null'); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function saveState() { try { localStorage.setItem(KEY_STATE, JSON.stringify(state)); } catch (e) {} }
  function loadHistory() { return loadJSON(KEY_HIST, []); }
  function saveHistory(list) { try { localStorage.setItem(KEY_HIST, JSON.stringify(list)); } catch (e) {} }

  /* ------------------------------------------------------------------ 날짜 */
  function todayISO() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function isoToParts(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
  }
  function fmtDate(iso) {
    var p = isoToParts(iso);
    return p ? p.y + '. ' + p.m + '. ' + p.d + '.' : '';
  }
  function fmtDateWide(iso) {
    var p = isoToParts(iso);
    return p ? p.y + '.   ' + p.m + '.   ' + p.d + '.' : '';
  }
  function fmtStamp(isoTs) {
    var d = new Date(isoTs), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d.getMonth() + 1) + '.' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function fmtStampFull(isoTs) {
    var d = new Date(isoTs), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ------------------------------------------------------------------ 번호 */
  function nextNo(iso) {
    var p = isoToParts(iso) || { y: new Date().getFullYear() };
    var yy = String(p.y).slice(2), max = 0;
    loadHistory().forEach(function (h) {
      var m = /제(\d{2})-(\d{5})호/.exec(h.no || '');
      if (m && m[1] === yy) max = Math.max(max, parseInt(m[2], 10));
    });
    var prefix = (state && state.fmt && state.fmt.noPrefix) || '노회(증)';
    return prefix + ' 제' + yy + '-' + ('00000' + (max + 1)).slice(-5) + '호';
  }
  function makeInet() {
    var L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', s = '';
    for (var i = 0; i < 4; i++) s += L[Math.floor(Math.random() * L.length)];
    var n = String(Math.floor(Math.random() * 1e9));
    while (n.length < 9) n = '0' + n;
    return s + n;
  }

  /* ------------------------------------------------------------------ 자료 */
  function normalize(v) { return (v || '').replace(/\s+/g, '').replace(/[·.]/g, ''); }

  function loadTypes() {
    return fetch('data/types.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        TYPES = ((data && data.types) || []).map(function (t) {
          t.rows = t.rows || []; t.extra = t.extra || []; t.body = t.body || [''];
          return t;
        });
        TYPE_BY_ID = Object.create(null);
        TYPES.forEach(function (t) { TYPE_BY_ID[t.id] = t; });
      })
      .catch(function () { TYPES = []; });
  }

  function loadPeople() {
    return fetch('data/people.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        people = ((data && data.people) || []).filter(function (p) { return p && p.name; });
        peopleByKey = Object.create(null);
        people.forEach(function (p) { peopleByKey[normalize(p.name)] = p; });
        el.peopleList.innerHTML = people.map(function (p) {
          return '<option value="' + esc(p.name) + '"></option>';
        }).join('');
      })
      .catch(function () { people = []; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* --------------------------------------------------------------- 서명부 직인 */
  var SEALS = [
    { key: 'secretary',  name: '서기 직인',         short: '서기인' },
    { key: 'chair',      name: '노회장 직인',       short: '노회장인' },
    { key: 'presbytery', name: '서울강동노회 직인', short: '노회인' }
  ];
  var KEY_SEAL_BASE = 'cert.v1.seal.';
  var pendingSealKey = null;

  function getSeal(key) {
    try { return localStorage.getItem(KEY_SEAL_BASE + key) || null; } catch (e) { return null; }
  }
  function setSeal(key, data) {
    try {
      if (data) localStorage.setItem(KEY_SEAL_BASE + key, data);
      else localStorage.removeItem(KEY_SEAL_BASE + key);
      return true;
    } catch (e) { return false; }
  }

  function applySeal() {
    var slot = $('sealSlot');
    if (!slot) return;
    var ph = slot.querySelector('.seal-ph');
    var old = slot.querySelector('img');
    if (old) old.remove();

    var meta = SEALS.filter(function (s) { return s.key === state.sealChoice; })[0];
    if (state.sealChoice === 'none') { slot.style.display = 'none'; return; }
    slot.style.display = '';

    var data = getSeal(state.sealChoice);
    if (data) {
      var img = document.createElement('img');
      img.alt = '';
      img.src = data;
      img.onload = function () { if (ph) ph.style.display = 'none'; };
      slot.appendChild(img);
      if (ph) ph.style.display = 'none';
    } else if (ph) {
      ph.style.display = '';
      ph.textContent = meta ? meta.short : '직인';
    }
  }

  function renderSealSlots() {
    if (!el.sealSlots) return;
    el.sealSlots.innerHTML = SEALS.map(function (s) {
      var data = getSeal(s.key);
      return '<div class="seal-slot">' +
        '<div class="st">' + (data ? '<img src="' + data + '" alt="">' : '없음') + '</div>' +
        '<div class="sn">' + esc(s.name) + '<small>' + (data ? '넣었습니다' : '아직 없습니다') + '</small></div>' +
        '<button type="button" class="mini" data-pick="' + s.key + '">' + (data ? '바꾸기' : '넣기') + '</button>' +
        (data ? '<button type="button" class="mini" data-drop="' + s.key + '">지우기</button>' : '') +
        '</div>';
    }).join('');
  }

  function loadSeal() {
    try {
      var legacy = localStorage.getItem('cert.v1.seal');
      if (legacy) {
        if (!getSeal('secretary')) setSeal('secretary', legacy);
        localStorage.removeItem('cert.v1.seal');
      }
    } catch (e) {}
    if (!state.sealChoice) state.sealChoice = 'secretary';
    Array.prototype.forEach.call(document.querySelectorAll('input[name="sealChoice"]'), function (r) {
      r.checked = r.value === state.sealChoice;
    });
    renderSealSlots();
    applySeal();
  }

  function saveSealFromFile(key, file) {
    if (!file) return;
    if (file.type.indexOf('image/') !== 0) { toast('이미지 파일을 골라 주세요.'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = 480, r = Math.min(1, max / Math.max(im.width, im.height));
        var cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(im.width * r));
        cv.height = Math.max(1, Math.round(im.height * r));
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        var data = cv.toDataURL('image/png');
        if (!setSeal(key, data)) { toast('저장 공간이 부족해 직인을 저장하지 못했습니다.'); return; }
        state.sealChoice = key;
        saveState();
        Array.prototype.forEach.call(document.querySelectorAll('input[name="sealChoice"]'), function (r) {
          r.checked = r.value === state.sealChoice;
        });
        renderSealSlots();
        applySeal();
        toast('직인을 넣었습니다. 이 기기에만 저장됩니다.');
      };
      im.onerror = function () { toast('이미지를 읽지 못했습니다.'); };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* --------------------------------------------------------------- 양식 글자 */
  function fmtOf() { return state.fmt; }

  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

  function typeText(def) {
    var o = (state.fmt.types && state.fmt.types[def.id]) || {};
    return {
      title: o.title || def.title || def.name,
      body: (o.body && o.body.length) ? o.body : def.body,
      labels: o.labels || {},
      signTitle: o.signTitle || state.fmt.signerTitle,
      signerName: o.signerName || state.fmt.signerName
    };
  }

  function typeOverride(id, create) {
    state.fmt.types = state.fmt.types || {};
    if (!state.fmt.types[id] && create) state.fmt.types[id] = {};
    return state.fmt.types[id];
  }

  /* ------------------------------------------------------------------ 상태 */
  function blankState() {
    var iso = todayISO();
    return {
      typeId: 'membership',
      name: '', birth: '', church: DEFAULTS.church, address: DEFAULTS.address, position: DEFAULTS.position,
      sender: '서울강동노회', recipient: '',
      date: iso, no: '', inet: makeInet(),
      noEdited: false, inetEdited: false,
      sealChoice: 'secretary',
      extras: {}, bodies: {}, fmt: defaultFmt()
    };
  }

  function initState() {
    var saved = loadJSON(KEY_STATE, {});
    var base = blankState();
    Object.keys(base).forEach(function (k) {
      if (saved[k] !== undefined && saved[k] !== null) base[k] = saved[k];
    });
    if (!isoToParts(base.date)) base.date = todayISO();
    base.extras = base.extras || {};
    base.bodies = base.bodies || {};
    // 양식 글자는 기본값 위에 저장값을 덮는다
    var fmt = defaultFmt();
    if (saved.fmt && typeof saved.fmt === 'object') {
      Object.keys(fmt).forEach(function (k) {
        if (k !== 'types' && saved.fmt[k] !== undefined && saved.fmt[k] !== null) fmt[k] = saved.fmt[k];
      });
      if (saved.fmt.types && typeof saved.fmt.types === 'object') fmt.types = saved.fmt.types;
    }
    base.fmt = fmt;
    // 예전 '본문 문구 수정' 저장값을 양식 관리 쪽으로 옮긴다
    Object.keys(base.bodies || {}).forEach(function (id) {
      if (base.bodies[id] && base.bodies[id].length) {
        var o = fmt.types[id] || (fmt.types[id] = {});
        if (!o.body) o.body = base.bodies[id].slice();
      }
    });
    state = base;
    state.no = state.no || nextNo(state.date);
  }

  function currentDef() {
    return TYPE_BY_ID[state.typeId] || TYPES[0] || {
      id: 'membership', name: '소속증명서', kind: 'church', title: '소속증명서',
      rows: [{ label: '교회명', src: 'church' }, { label: '주소', src: 'address' },
             { label: '대표자', src: 'name' }, { label: '생년월일', src: 'birth' }],
      body: ['위의 교회는 대한예수교장로회(백석) 서울강동노회에', '소속한 교회임을 증명함.'], extra: []
    };
  }
  function extraOf(typeId) {
    if (!state.extras[typeId]) state.extras[typeId] = {};
    return state.extras[typeId];
  }

  /* --------------------------------------------------------------- 값 채우기 */
  function fill(text) {
    var ex = extraOf(currentDef().id);
    var map = {
      church: state.church, name: state.name, address: state.address, position: state.position,
      presbytery: state.fmt.presbytery,
      birth: fmtDate(state.birth), date: fmtDate(state.date)
    };
    Object.keys(ex).forEach(function (k) {
      var v = ex[k];
      map[k] = /\d{4}-\d{2}-\d{2}/.test(v || '') ? fmtDate(v) : (v || '');
    });
    return String(text).replace(/\{(\w+)\}/g, function (m, k) {
      return map[k] !== undefined ? map[k] : m;
    });
  }

  /* --------------------------------------------------------------- 지면 */
  function setFit(node, minPx) {
    node.style.fontSize = '';
    var fs = parseFloat(getComputedStyle(node).fontSize), guard = 0;
    while (node.scrollWidth > node.clientWidth + 1 && fs > (minPx || 10) && guard < 60) {
      fs -= 0.5;
      node.style.fontSize = (fs / MM).toFixed(2) + 'mm';
      guard++;
    }
  }

  function layoutTitle() {
    var t = el.pTitle, n = t.textContent.replace(/\s/g, '').length || 1;
    t.style.letterSpacing = '0mm'; t.style.paddingLeft = '0mm'; t.style.fontSize = '';
    var targetPx = Math.min(n * 12.9, 158) * MM;
    if (t.offsetWidth > targetPx) {
      var fs = parseFloat(getComputedStyle(t).fontSize);
      while (t.offsetWidth > targetPx && fs > 20) { fs -= 0.5; t.style.fontSize = (fs / MM).toFixed(2) + 'mm'; }
    }
    var ls = n > 1 ? (targetPx - t.offsetWidth) / (n - 1) : 0;
    if (ls > 0) {
      t.style.letterSpacing = (ls / MM).toFixed(2) + 'mm';
      t.style.paddingLeft = (ls / MM).toFixed(2) + 'mm';
    }
  }

  function rowValue(row) {
    if (row.src === 'birth') return fmtDate(state.birth);
    if (row.src === 'church') return state.church;
    if (row.src === 'address') return state.address;
    if (row.src === 'name') return state.name;
    if (row.src === 'position') return state.position;
    var v = extraOf(currentDef().id)[row.src] || '';
    if (row.fmt === 'date' || /\d{4}-\d{2}-\d{2}/.test(v)) return fmtDate(v);
    return v;
  }

  function renderPaper() {
    var F = state.fmt, def = currentDef(), T = typeText(def);

    el.pOrg.textContent = F.org;
    el.pHq.textContent = F.hqAddress;
    el.pTel.textContent = F.tel;
    el.pFax.textContent = F.fax;
    el.pPresb.textContent = F.presbytery;
    el.pNohoeAddr.textContent = F.presbyteryAddress;
    el.pSignTitleHead.textContent = F.signerTitle;
    el.pSignerHead.textContent = F.signerName;
    el.pNo.textContent = state.no || '';
    el.pTitle.textContent = T.title;
    layoutTitle();
    el.pDate.textContent = fmtDateWide(state.date);
    el.pSignOrg.textContent = F.org + ' ' + F.presbytery;
    el.pSignTitle.textContent = T.signTitle;
    el.pSigner.textContent = T.signerName;
    el.pNote1.textContent = F.note1;
    el.pNote2.textContent = F.note2;
    el.pInet.textContent = state.inet || '';

    var wm = el.paper.querySelector('.wm');
    if (wm) wm.style.display = def.watermark === false ? 'none' : '';

    // 발신처 · 수신처 (빈 줄은 찍지 않는다)
    el.pFrom.textContent = state.sender || '';
    el.pTo.textContent = state.recipient || '';
    el.pFromRow.hidden = !String(state.sender || '').trim();
    el.pToRow.hidden = !String(state.recipient || '').trim();
    $('pMail').hidden = el.pFromRow.hidden && el.pToRow.hidden;

    // 항목
    el.pFields.innerHTML = def.rows.map(function (r) {
      var label = (T.labels && T.labels[r.src]) || r.label;
      var lb = String(label).replace(/\s+/g, '').split('').map(function (c) {
        return '<i>' + esc(c) + '</i>';
      }).join('');
      return '<div class="fld"><span class="lb">' + lb + '</span>' +
             '<span class="cl">:</span><span class="vl">' + esc(rowValue(r)) + '</span></div>';
    }).join('');
    var n = def.rows.length || 4;
    var rowH = n >= 5 ? 7.7 : 8.75;
    Array.prototype.forEach.call(el.pFields.children, function (f) { f.style.height = rowH + 'mm'; });
    el.pBody.style.top = Math.max(112.6, 69.4 + n * rowH + 7.2).toFixed(1) + 'mm';

    // 본문
    el.pBody.innerHTML = T.body.map(fill).map(function (l, i) {
      return '<span class="bl' + (i === 0 ? ' first' : '') + '">' + esc(l) + '</span>';
    }).join('');
    setFit(el.pBody, 12);

    Array.prototype.forEach.call(el.pFields.querySelectorAll('.vl'), function (v) { setFit(v, 9.5); });
    applySeal();
  }

  /* --------------------------------------------------------------- 폼 */
  function renderForm() {
    var def = currentDef();
    if (!el.type.options.length) {
      el.type.innerHTML = TYPES.map(function (t) {
        return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>';
      }).join('');
    }
    el.type.value = def.id;
    el.nameLabel.textContent = def.kind === 'church' ? '대표자' : '이름';

    if (!def.extra.length) {
      el.extraBox.innerHTML = '';
    } else {
      el.extraBox.innerHTML = def.extra.map(function (f) {
        var v = extraOf(def.id)[f.key] || '';
        return '<div class="field">' +
          '<label for="ex_' + esc(f.key) + '">' + esc(f.label) + (f.required ? ' <span class="req">*</span>' : '') + '</label>' +
          '<input id="ex_' + esc(f.key) + '" data-extra="' + esc(f.key) + '" type="' + (f.type === 'date' ? 'date' : 'text') + '"' +
          ' value="' + esc(v) + '" placeholder="' + esc(f.placeholder || '') + '">' +
          '</div>';
      }).join('');
      Array.prototype.forEach.call(el.extraBox.querySelectorAll('[data-extra]'), function (inp) {
        inp.addEventListener('input', function () {
          extraOf(def.id)[inp.dataset.extra] = inp.value;
          saveState(); renderPaper();
        });
      });
    }

    if (el.name.value !== state.name) el.name.value = state.name;
    if (el.birth.value !== state.birth) el.birth.value = state.birth || '';
    if (el.church.value !== state.church) el.church.value = state.church;
    if (el.addr.value !== state.address) el.addr.value = state.address;
    if (el.sender.value !== state.sender) el.sender.value = state.sender;
    if (el.recipient.value !== state.recipient) el.recipient.value = state.recipient;
    if (el.date.value !== state.date) el.date.value = state.date;
    if (el.no.value !== state.no) el.no.value = state.no;
    if (el.inet.value !== state.inet) el.inet.value = state.inet;
  }

  function render() { renderForm(); renderPaper(); }

  /* 양식 관리 화면 채우기 */
  function renderFmtForm() {
    var F = state.fmt;
    Array.prototype.forEach.call(document.querySelectorAll('[data-fmt]'), function (inp) {
      if (document.activeElement === inp) return;
      inp.value = F[inp.dataset.fmt] == null ? '' : F[inp.dataset.fmt];
    });

    if (!TYPES.length) return;
    var sel = $('fmType');
    if (!sel.options.length) {
      sel.innerHTML = TYPES.map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join('');
      sel.value = state.typeId;
    }
    var def = TYPE_BY_ID[sel.value] || currentDef();
    var T = typeText(def);
    if (document.activeElement !== $('fmTitle')) $('fmTitle').value = T.title;
    if (document.activeElement !== $('fmBody')) $('fmBody').value = T.body.join('\n');
    if (document.activeElement !== $('fmTSignTitle')) $('fmTSignTitle').value = T.signTitle;
    if (document.activeElement !== $('fmTSignName')) $('fmTSignName').value = T.signerName;

    $('fmLabels').innerHTML = def.rows.map(function (r) {
      var v = (T.labels && T.labels[r.src]) || r.label;
      return '<label class="lg"><span>' + esc(r.label) + '</span>' +
        '<input data-label-src="' + esc(r.src) + '" value="' + esc(v) + '"></label>';
    }).join('');
  }

  /* --------------------------------------------------------------- 미리보기 배율 */
  function fitPreview() {
    var w = el.host.clientWidth;
    if (!w) return;
    var wide = window.matchMedia('(min-width:900px)').matches;
    var maxH = wide ? Math.max(window.innerHeight - 150, 520) : Math.min(window.innerHeight * 0.40, 420);
    var s = Math.min(w / A4W, maxH / A4H);
    el.paper.style.position = 'absolute';
    el.paper.style.top = '0';
    el.paper.style.left = Math.round((w - A4W * s) / 2) + 'px';
    el.paper.style.transform = 'scale(' + s + ')';
    el.host.style.height = Math.round(A4H * s) + 'px';
  }

  /* ------------------------------------------------------------------ 알림 */
  var toastTimer = null;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.hidden = true; }, 2800);
  }
  function warnForm(msg) { el.warn.textContent = msg || ''; el.warn.hidden = !msg; }

  /* ------------------------------------------------------------------ 검사 */
  function ensure() {
    var def = currentDef();
    el.name.classList.remove('bad');
    if (!state.name.trim()) {
      warnForm((def.kind === 'church' ? '대표자 이름' : '이름') + '을 먼저 적어 주세요.');
      el.name.classList.add('bad');
      el.name.focus();
      return false;
    }
    var missing = def.extra.filter(function (f) {
      return f.required && !String(extraOf(def.id)[f.key] || '').trim();
    });
    if (missing.length) {
      warnForm(missing[0].label + '을(를) 적어 주세요.');
      var inp = el.extraBox.querySelector('#ex_' + missing[0].key);
      if (inp) inp.focus();
      return false;
    }
    warnForm('');
    return true;
  }

  /* ------------------------------------------------------------------ 이력 */
  function recordIssue() {
    if (!state.name.trim()) return false;
    var def = currentDef(), list = loadHistory(), last = list[0];
    if (last && last.no === state.no && last.name === state.name && last.typeId === def.id &&
        (Date.now() - new Date(last.at).getTime()) < 60000) return true;
    var ex = {};
    Object.keys(extraOf(def.id)).forEach(function (k) { ex[k] = extraOf(def.id)[k]; });
    list.unshift({
      id: 'c' + Date.now() + Math.random().toString(36).slice(2, 6),
      at: new Date().toISOString(),
      no: state.no, typeId: def.id, type: typeText(def).title || def.name,
      name: state.name.trim(), birth: state.birth, address: state.address,
      church: state.church, position: state.position,
      sender: state.sender, recipient: state.recipient, extras: ex
    });
    saveHistory(list);
    renderHistory();
    return true;
  }

  function typeNameOf(h) {
    if (h.typeId && TYPE_BY_ID[h.typeId]) return TYPE_BY_ID[h.typeId].name;
    return h.type || '증명서';
  }

  function renderHistory() {
    var list = loadHistory();
    var q = normalize(el.hSearch.value);
    var curType = el.hType.value, curMonth = el.hMonth.value;

    var typesInList = {};
    list.forEach(function (h) { typesInList[typeNameOf(h)] = true; });
    el.hType.innerHTML = '<option value="">전체 종류</option>' +
      Object.keys(typesInList).map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + '</option>'; }).join('');
    el.hType.value = typesInList[curType] ? curType : '';

    var months = {};
    list.forEach(function (h) {
      var d = new Date(h.at);
      months[d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2)] = true;
    });
    el.hMonth.innerHTML = '<option value="">전체 기간</option>' + Object.keys(months).sort().reverse().map(function (k) {
      var p = k.split('-');
      return '<option value="' + k + '">' + p[0] + '년 ' + (+p[1]) + '월</option>';
    }).join('');
    el.hMonth.value = months[curMonth] ? curMonth : '';

    var rows = list.filter(function (h) {
      if (el.hType.value && typeNameOf(h) !== el.hType.value) return false;
      if (el.hMonth.value) {
        var d = new Date(h.at);
        var k = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
        if (k !== el.hMonth.value) return false;
      }
      if (q && normalize(h.name).indexOf(q) < 0) return false;
      return true;
    });

    el.hCnt.textContent = rows.length + '건';
    el.tabDot.hidden = list.length === 0;
    el.tabDot.textContent = list.length > 99 ? '99+' : String(list.length);

    if (!rows.length) {
      el.hList.innerHTML = '<p class="empty">' + (list.length ?
        '조건에 맞는 발급 기록이 없습니다.' :
        '아직 발급한 증명서가 없습니다.<br>발급하기에서 인쇄·PDF·이미지로 받으면 여기에 쌓입니다.') + '</p>';
      return;
    }

    el.hList.innerHTML = rows.map(function (h) {
      return '<div class="hitem" data-id="' + h.id + '">' +
        '<div class="who"><b>' + esc(h.name) + ' <em class="badge">' + esc(typeNameOf(h)) + '</em></b>' +
        '<small>' + esc(h.no) + ' · ' + esc(h.church) + (h.recipient ? ' · 수신 ' + esc(h.recipient) : '') + '</small></div>' +
        '<div class="when">' + fmtStamp(h.at) + '</div>' +
        '<button type="button" class="del" data-del="' + h.id + '" aria-label="기록 삭제">✕</button>' +
        '</div>';
    }).join('');
  }

  function loadFromHistory(id) {
    var h = loadHistory().filter(function (x) { return x.id === id; })[0];
    if (!h) return;
    state.typeId = h.typeId || 'membership';
    state.name = h.name;
    state.birth = h.birth || '';
    state.address = h.address || '';
    state.church = h.church || DEFAULTS.church;
    state.position = h.position || DEFAULTS.position;
    state.sender = h.sender || state.sender;
    state.recipient = h.recipient || '';
    state.no = h.no; state.noEdited = true;
    state.date = todayISO();
    state.inet = makeInet();
    extraOf(state.typeId);
    state.extras[state.typeId] = Object.assign({}, h.extras || {});
    saveState(); render(); switchView('issue'); fitPreview();
    toast('이력의 ' + typeNameOf(h) + '를 불러왔습니다. 그대로 다시 받을 수 있습니다.');
  }

  function csvDownload() {
    var list = loadHistory();
    if (!list.length) { toast('내려받을 이력이 없습니다.'); return; }
    var head = ['발급일시', '증명서 종류', '증명서 번호', '이름', '생년월일', '주소', '교회명', '직위', '발신처', '수신처'];
    var lines = [head.join(',')];
    list.forEach(function (h) {
      lines.push([fmtStampFull(h.at), typeNameOf(h), h.no, h.name, h.birth || '', h.address || '',
                  h.church || '', h.position || '', h.sender || '', h.recipient || ''].map(csvCell).join(','));
    });
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, '증명서-발급이력-' + todayISO() + '.csv');
    toast('CSV로 내려받았습니다.');
  }
  function csvCell(v) {
    var s = String(v == null ? '' : v);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* ------------------------------------------------------------------ 받기 */
  function doPrint() {
    if (!ensure()) return;
    recordIssue();
    window.print();
  }

  function doPng() {
    if (!ensure()) return;
    recordIssue();
    if (typeof html2canvas !== 'function') { toast('이미지 저장 도구를 불러오지 못했습니다.'); return; }
    document.body.classList.add('exporting');
    var done = function () { document.body.classList.remove('exporting'); fitPreview(); };
    setTimeout(function () {
      html2canvas(el.paper, {
        scale: 3, backgroundColor: '#ffffff', useCORS: true, logging: false,
        width: Math.round(A4W), height: Math.round(A4H),
        windowWidth: Math.round(A4W), windowHeight: Math.round(A4H)
      }).then(function (canvas) {
        canvas.toBlob(function (blob) {
          downloadBlob(blob, typeText(currentDef()).title.replace(/\s/g, '') + '_' + state.name.trim() + '_' + state.date + '.png');
          toast('이미지(PNG)로 저장했습니다.');
          done();
        }, 'image/png');
      }).catch(function (e) {
        console.error(e);
        toast('이미지 저장에 실패했습니다. 인쇄 창에서 PDF로 받아 주세요.');
        done();
      });
    }, 120);
  }

  /* ------------------------------------------------------------------ 화면 */
  function switchView(name) {
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
      b.classList.toggle('on', b.dataset.view === name);
    });
    $('view-issue').hidden = name !== 'issue';
    $('view-history').hidden = name !== 'history';
    $('view-format').hidden = name !== 'format';
    el.actionBar.style.display = name === 'issue' ? '' : 'none';
    window.scrollTo(0, 0);
    if (name === 'history') renderHistory();
    if (name === 'format') renderFmtForm();
    if (name === 'issue') setTimeout(fitPreview, 30);
  }

  /* ------------------------------------------------------------------ 이벤트 */
  function bind() {
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
      b.addEventListener('click', function () { switchView(b.dataset.view); });
    });

    el.type.addEventListener('change', function () {
      state.typeId = el.type.value;
      if (!state.noEdited) state.no = nextNo(state.date);
      if (!state.inetEdited) state.inet = makeInet();
      saveState(); render(); fitPreview();
    });

    el.name.addEventListener('input', function () {
      state.name = el.name.value;
      var hit = peopleByKey[normalize(state.name)];
      if (hit) {
        if (hit.birth) state.birth = hit.birth;
        if (hit.address) state.address = hit.address;
        if (hit.church) state.church = hit.church;
        if (hit.position) state.position = hit.position;
        el.nameHint.textContent = '명단에서 불러왔습니다 — 생년월일·주소까지 채웠어요.';
        el.nameHint.classList.add('on');
      } else if (people.length) {
        el.nameHint.textContent = '명단에 있는 이름을 고르면 생년월일·주소가 저절로 채워집니다.';
        el.nameHint.classList.remove('on');
      }
      if (!state.noEdited) state.no = nextNo(state.date);
      if (!state.inetEdited) state.inet = makeInet();
      saveState(); render();
    });

    el.birth.addEventListener('change', function () { state.birth = el.birth.value; saveState(); render(); });
    el.church.addEventListener('input', function () { state.church = el.church.value; saveState(); renderPaper(); });
    el.addr.addEventListener('input', function () { state.address = el.addr.value; saveState(); renderPaper(); });
    el.sender.addEventListener('input', function () { state.sender = el.sender.value; saveState(); renderPaper(); });
    el.recipient.addEventListener('input', function () { state.recipient = el.recipient.value; saveState(); renderPaper(); });
    el.date.addEventListener('change', function () {
      state.date = el.date.value || todayISO();
      if (!state.noEdited) state.no = nextNo(state.date);
      saveState(); render();
    });
    el.no.addEventListener('input', function () { state.no = el.no.value; state.noEdited = true; saveState(); renderPaper(); });
    el.inet.addEventListener('input', function () { state.inet = el.inet.value; state.inetEdited = true; saveState(); renderPaper(); });

    /* 직인 */
    Array.prototype.forEach.call(document.querySelectorAll('input[name="sealChoice"]'), function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        state.sealChoice = r.value;
        saveState(); applySeal();
      });
    });
    el.sealSlots.addEventListener('click', function (e) {
      var pick = e.target.closest('[data-pick]');
      if (pick) { pendingSealKey = pick.dataset.pick; $('sealFile').click(); return; }
      var drop = e.target.closest('[data-drop]');
      if (drop) {
        var key = drop.dataset.drop;
        var meta = SEALS.filter(function (s) { return s.key === key; })[0];
        if (!confirm((meta ? meta.name : '직인') + ' 이미지를 이 기기에서 지울까요?')) return;
        setSeal(key, null);
        renderSealSlots(); applySeal();
        toast('지웠습니다.');
      }
    });
    $('sealFile').addEventListener('change', function () {
      saveSealFromFile(pendingSealKey || state.sealChoice, this.files && this.files[0]);
      this.value = '';
    });

    /* 양식 관리 */
    Array.prototype.forEach.call(document.querySelectorAll('[data-fmt]'), function (inp) {
      inp.addEventListener('input', function () {
        var key = inp.dataset.fmt;
        state.fmt[key] = inp.value;
        if (key === 'noPrefix' && !state.noEdited) state.no = nextNo(state.date);
        saveState(); renderPaper();
        if (key === 'signerTitle' || key === 'signerName') renderFmtForm();
        if (key === 'noPrefix') el.no.value = state.no;
      });
    });

    $('fmType').addEventListener('change', function () {
      // 양식 관리에서 고른 종류를 미리보기에도 그대로 띄운다
      state.typeId = $('fmType').value;
      if (!state.noEdited) state.no = nextNo(state.date);
      saveState(); render(); renderFmtForm();
    });

    $('fmTitle').addEventListener('input', function () {
      typeOverride($('fmType').value, true).title = this.value;
      saveState(); renderPaper();
    });
    $('fmBody').addEventListener('input', function () {
      var lines = this.value.split('\n');
      if (lines.length && lines[lines.length - 1] === '') lines.pop();
      typeOverride($('fmType').value, true).body = lines;
      saveState(); renderPaper();
    });
    $('fmTSignTitle').addEventListener('input', function () {
      typeOverride($('fmType').value, true).signTitle = this.value;
      saveState(); renderPaper();
    });
    $('fmTSignName').addEventListener('input', function () {
      typeOverride($('fmType').value, true).signerName = this.value;
      saveState(); renderPaper();
    });
    $('fmLabels').addEventListener('input', function (e) {
      var inp = e.target.closest('[data-label-src]');
      if (!inp) return;
      var o = typeOverride($('fmType').value, true);
      o.labels = o.labels || {};
      o.labels[inp.dataset.labelSrc] = inp.value;
      saveState(); renderPaper();
    });

    $('fmtSave').addEventListener('click', function () {
      saveState();
      renderPaper();
      toast('양식을 저장했습니다. 이 기기 브라우저에 남습니다.');
    });
    $('fmtTypeReset').addEventListener('click', function () {
      var id = $('fmType').value;
      if (!confirm('이 종류의 문구를 기본값으로 되돌릴까요?')) return;
      delete state.fmt.types[id];
      saveState(); renderFmtForm(); renderPaper();
      toast('기본 문구로 되돌렸습니다.');
    });
    $('fmtReset').addEventListener('click', function () {
      if (!confirm('양식 글자를 모두 처음 상태로 되돌릴까요?\n(발급 이력과 직인 이미지는 그대로 남습니다)')) return;
      state.fmt = defaultFmt();
      if (!state.noEdited) state.no = nextNo(state.date);
      saveState(); renderFmtForm(); render(); el.no.value = state.no;
      toast('기본값으로 복원했습니다.');
    });

    $('resetBtn').addEventListener('click', function () {
      if (!confirm('입력한 값을 지우고 처음 상태로 돌아갈까요?\n(발급 이력과 양식 설정은 지워지지 않습니다)')) return;
      var keepFmt = state.fmt, keepSeal = state.sealChoice;
      state = blankState();
      state.fmt = keepFmt; state.sealChoice = keepSeal;
      state.no = nextNo(state.date);
      el.nameHint.textContent = '명단에 있는 이름을 고르면 생년월일·주소가 저절로 채워집니다.';
      el.nameHint.classList.remove('on');
      warnForm('');
      saveState(); render(); fitPreview();
      toast('입력을 초기화했습니다.');
    });

    el.hSearch.addEventListener('input', renderHistory);
    el.hMonth.addEventListener('change', renderHistory);
    el.hType.addEventListener('change', renderHistory);

    el.hList.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (del) {
        var id = del.dataset.del;
        var row = loadHistory().filter(function (x) { return x.id === id; })[0];
        if (!row) return;
        if (!confirm('이 발급 기록을 지울까요?\n\n' + typeNameOf(row) + ' · ' + row.name + ' · ' + row.no)) return;
        saveHistory(loadHistory().filter(function (x) { return x.id !== id; }));
        renderHistory();
        toast('기록을 지웠습니다.');
        return;
      }
      var item = e.target.closest('.hitem');
      if (item) loadFromHistory(item.dataset.id);
    });

    $('csvBtn').addEventListener('click', csvDownload);
    $('btnPrint').addEventListener('click', doPrint);
    $('btnPng').addEventListener('click', doPng);
    $('btnPdf').addEventListener('click', function () { if (ensure()) $('pdfModal').hidden = false; });
    $('pdfCancel').addEventListener('click', function () { $('pdfModal').hidden = true; });
    $('pdfGo').addEventListener('click', function () { $('pdfModal').hidden = true; doPrint(); });

    $('zoomBtn').addEventListener('click', function () {
      var body = $('zoomBody');
      body.innerHTML = '';
      $('zoomModal').hidden = false;
      var clone = el.paper.cloneNode(true);
      clone.removeAttribute('id');
      body.appendChild(clone);
      var s = Math.min((body.clientWidth - 24) / A4W, 1.9);
      clone.style.position = 'absolute';
      clone.style.transformOrigin = 'top left';
      clone.style.left = '12px';
      clone.style.top = '12px';
      clone.style.transform = 'scale(' + s + ')';
      body.style.position = 'relative';
      body.style.minHeight = (A4H * s + 24) + 'px';
    });
    $('zoomClose').addEventListener('click', function () {
      $('zoomModal').hidden = true;
      $('zoomBody').innerHTML = '';
      $('zoomBody').style.minHeight = '';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        $('zoomModal').hidden = true; $('pdfModal').hidden = true; $('zoomBody').innerHTML = '';
      }
    });

    var rt = null;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fitPreview, 120); });
    window.addEventListener('orientationchange', function () { setTimeout(fitPreview, 220); });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { renderPaper(); fitPreview(); });
    }

    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); deferred = e;
      $('installBtn').hidden = false;
    });
    $('installBtn').addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; $('installBtn').hidden = true; });
    });
    window.addEventListener('appinstalled', function () { $('installBtn').hidden = true; });
  }

  /* ------------------------------------------------------------------ 시작 */
  function boot() {
    initState();
    bind();
    loadSeal();

    Promise.all([loadTypes(), loadPeople()]).then(function () {
      if (!TYPE_BY_ID[state.typeId]) state.typeId = (TYPES[0] && TYPES[0].id) || 'membership';
      if (!state.name && people.length) {
        var p = people[0];
        state.name = p.name || '';
        state.birth = p.birth || '';
        state.address = p.address || state.address;
        state.church = p.church || state.church;
        state.position = p.position || state.position;
        state.no = nextNo(state.date);
        saveState();
      }
      state.no = state.no || nextNo(state.date);
      render();
      renderHistory();
      renderFmtForm();
      fitPreview();
      setTimeout(fitPreview, 120);
    });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      });
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
