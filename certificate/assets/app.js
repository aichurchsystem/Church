/* ==========================================================================
   증명서 발급 앱 (대한예수교장로회(백석) 서울강동노회)
   - 증명서 종류별 정의: data/types.json (제목·항목·본문·추가 입력·워터마크)
   - 지면에 찍히는 고정 글자: state.fmt (관리자 화면에서 고치고 이 기기에 저장)
   - 사람·교회 명단: data/people.json + 이 기기 저장값(cert.v1.people)
   - 직인 이미지: 기본 직인은 assets/seals/, 바꾼 직인은 이 기기(localStorage)
   - 증명사진: 이 기기(localStorage)에만 저장 — 저장소에는 올리지 않는다
   ========================================================================== */
(function () {
  'use strict';

  var A4W = 793.7, A4H = 1122.5, MM = 3.7795;

  var SEALS = [
    { key: 'chair',      name: '노회장 인',    def: 'assets/seals/seal-chair-round.png' },
    { key: 'secretary',  name: '서기 인',      def: 'assets/seals/seal-secretary-round.png' },
    { key: 'presbytery', name: '노회 사각 인', def: 'assets/seals/seal-presbytery-square.png' }
  ];
  var SEAL_IMG = { chair: 'sealChair', secretary: 'sealSecretary', presbytery: 'sealOrg' };
  var WM_VARIANTS = ['navy', 'slate', 'ink', 'none'];

  var DEFAULTS = {
    church: '글로벌비전교회',
    churchAddress: '서울특별시 광진구 구의강변로3가길 33, 상가 2층(구의동)',
    representative: '박재용',
    address: '서울특별시 광진구 구의강변로3가길 33, 상가 2층(구의동)',
    position: '목사'
  };

  function defaultFmt() {
    return {
      org: '대한예수교장로회(백석)',
      presbytery: '서울강동노회',
      hqAddress: '',
      presbyteryAddress: '서울특별시 광진구 구의강변로3가길 33, 2층',
      tel: 'Tel: 02-429-1318',
      fax: 'Fax: 02-429-1319',
      chairTitle: '노회장',
      chairName: '이용동',
      signerTitle: '서기',
      signerName: '박재용',
      noPrefix: '노회(증)',
      watermark: 'slate',
      note1: '본 증명서의 진위는 대한예수교장로회(백석) 서울강동노회로 문의하시기 바랍니다.',
      note2: '발급일로부터 90일까지만 효력이 있습니다.',
      types: {}
    };
  }

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    type: $('fType'), person: $('fPerson'), name: $('fName'), position: $('fPosition'),
    birth: $('fBirth'), church: $('fChurch'), churchAddr: $('fChurchAddr'), addr: $('fAddr'),
    sender: $('fSender'), recipient: $('fRecipient'),
    date: $('fDate'), no: $('fNo'), inet: $('fInet'),
    extraBox: $('extraBox'), nameLabel: $('nameLabel'),
    peopleList: $('peopleList'), nameHint: $('nameHint'), warn: $('formWarn'),
    paper: $('paper'), host: $('paperHost'),
    pOrg: $('pOrg'), pHq: $('pHq'), pTel: $('pTel'), pFax: $('pFax'),
    pPresb: $('pPresb'), pNohoeAddr: $('pNohoeAddr'),
    pNo: $('pNo'), pTitle: $('pTitle'), pFields: $('pFields'), pBody: $('pBody'),
    pDate: $('pDate'), pSignOrg: $('pSignOrg'),
    pSignChairTitle: $('pSignChairTitle'), pSignChair: $('pSignChair'),
    pSignTitle: $('pSignTitle'), pSigner: $('pSigner'),
    pNote1: $('pNote1'), pNote2: $('pNote2'), pInet: $('pInet'), pPhoto: $('pPhoto'),
    pFrom: $('pFrom'), pTo: $('pTo'), pFromRow: $('pFromRow'), pToRow: $('pToRow'),
    sealSlots: $('sealSlots'), sealSlotsAdmin: $('sealSlotsAdmin'),
    hList: $('hList'), hCnt: $('hCnt'), hSearch: $('hSearch'), hMonth: $('hMonth'), hType: $('hType'),
    toast: $('toast'), tabDot: $('tabDot'), actionBar: $('actionBar')
  };

  var KEY_STATE = 'cert.v1.state';
  var KEY_HIST = 'cert.v1.history';
  var KEY_PEOPLE = 'cert.v1.people';
  var KEY_SEAL = 'cert.v1.seal.';
  var KEY_PHOTO = 'cert.v1.photo.';

  var TYPES = [], TYPE_BY_ID = Object.create(null);
  var people = [], basePeople = [];
  var state = null;
  var pendingSealKey = null, pendingSealInput = null, editingPersonId = null, newPhotoData = null;

  /* ------------------------------------------------------------------ 저장 */
  function loadJSON(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || 'null'); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function saveState() { try { localStorage.setItem(KEY_STATE, JSON.stringify(state)); } catch (e) {} }
  function loadHistory() { return loadJSON(KEY_HIST, []); }
  function saveHistory(list) { try { localStorage.setItem(KEY_HIST, JSON.stringify(list)); } catch (e) {} }
  function savePeople() { try { localStorage.setItem(KEY_PEOPLE, JSON.stringify(people)); } catch (e) {} }

  /* ------------------------------------------------------------------ 날짜 */
  function todayISO() {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date());
    } catch (e) {
      var d = new Date();
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }
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

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

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
        basePeople = ((data && data.people) || []).filter(function (p) { return p && p.name; });
        basePeople.forEach(function (p, i) { if (!p.id) p.id = 'p' + (i + 1); });
        var saved = loadJSON(KEY_PEOPLE, null);
        people = Array.isArray(saved) && saved.length ? saved : deepCopy(basePeople);
        renderPeopleOptions();
      })
      .catch(function () { basePeople = []; people = []; });
  }

  function syncPeople() {
    people = people.filter(function (p) { return p && p.name; });
    people.forEach(function (p, i) { if (!p.id) p.id = 'p' + Date.now() + i; });
    savePeople();
    renderPeopleOptions();
    renderPeopleList();
    renderPaper();
  }

  function renderPeopleOptions() {
    var opts = people.map(function (p) {
      var tail = [p.position, p.church].filter(Boolean).join(' · ');
      return '<option value="' + esc(p.id) + '">' + esc(p.name + (tail ? ' — ' + tail : '')) + '</option>';
    }).join('');
    if (el.person) {
      el.person.innerHTML = '<option value="">— 직접 입력 —</option>' + opts;
      el.person.value = state && state.personId ? state.personId : '';
      if (!el.person.value) el.person.value = '';
    }
    if (el.peopleList) {
      el.peopleList.innerHTML = people.map(function (p) {
        return '<option value="' + esc(p.name) + '"></option>';
      }).join('');
    }
  }

  /* --------------------------------------------------------------- 서명부 직인 */
  function sealSrc(key) {
    var own = null;
    try { own = localStorage.getItem(KEY_SEAL + key); } catch (e) {}
    if (own) return own;
    var s = SEALS.filter(function (x) { return x.key === key; })[0];
    return s ? s.def : '';
  }
  function hasOwnSeal(key) {
    try { return !!localStorage.getItem(KEY_SEAL + key); } catch (e) { return false; }
  }
  function setSeal(key, data) {
    try {
      if (data) localStorage.setItem(KEY_SEAL + key, data);
      else localStorage.removeItem(KEY_SEAL + key);
      return true;
    } catch (e) { return false; }
  }

  function applySeal() {
    SEALS.forEach(function (s) {
      var img = $(SEAL_IMG[s.key]);
      if (!img) return;
      var hold = img.closest ? img.closest('.seal-hold') : null;   /* 직인 자리(줄 높이를 차지하지 않는 상자) */
      if (!state.sealsOn) { img.hidden = true; if (hold) hold.hidden = true; return; }
      img.hidden = false;
      if (hold) hold.hidden = false;
      var src = sealSrc(s.key);
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
  }

  function renderSealSlots() {
    var html = SEALS.map(function (s) {
      var own = hasOwnSeal(s.key);
      return '<div class="seal-slot">' +
        '<div class="st"><img src="' + esc(sealSrc(s.key)) + '" alt=""></div>' +
        '<div class="sn">' + esc(s.name) + '<small>' + (own ? '내가 넣은 직인' : '기본 직인') + '</small></div>' +
        '<button type="button" class="mini" data-pick="' + s.key + '">' + (own ? '바꾸기' : '넣기') + '</button>' +
        (own ? '<button type="button" class="mini" data-drop="' + s.key + '">지우기</button>' : '') +
        '</div>';
    }).join('');
    if (el.sealSlots) el.sealSlots.innerHTML = html;
    if (el.sealSlotsAdmin) el.sealSlotsAdmin.innerHTML = html;
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
        renderSealSlots();
        applySeal();
        toast('직인을 넣었습니다. 이 기기에만 저장됩니다.');
      };
      im.onerror = function () { toast('이미지를 읽지 못했습니다.'); };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* --------------------------------------------------------------- 증명사진 */
  function photoKey(id) { return KEY_PHOTO + (id || ''); }
  function photoFor(id) {
    if (!id) return '';
    try { return localStorage.getItem(photoKey(id)) || ''; } catch (e) { return ''; }
  }
  function setPhoto(id, data) {
    if (!id) return false;
    try {
      if (data) localStorage.setItem(photoKey(id), data);
      else localStorage.removeItem(photoKey(id));
      return true;
    } catch (e) { return false; }
  }
  function savePhotoFromFile(id, file) {
    if (!file) return;
    if (file.type.indexOf('image/') !== 0) { toast('이미지 파일을 골라 주세요.'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var im = new Image();
      im.onload = function () {
        // 3:4 증명사진 비율로 가운데를 잘라 360×480으로 줄인다
        var tw = 360, th = 480, ratio = tw / th;
        var sw = im.width, sh = im.height, cw = sw, ch = sh;
        if (sw / sh > ratio) { cw = sh * ratio; } else { ch = sw / ratio; }
        var sx = (sw - cw) / 2, sy = (sh - ch) / 2;
        var cv = document.createElement('canvas');
        cv.width = tw; cv.height = th;
        cv.getContext('2d').drawImage(im, sx, sy, cw, ch, 0, 0, tw, th);
        var data = cv.toDataURL('image/jpeg', 0.82);
        if (!setPhoto(id, data)) { toast('저장 공간이 부족해 사진을 저장하지 못했습니다.'); return; }
        newPhotoData = data;
        renderPersonForm();
        renderPaper();
        renderPeopleList();
        toast('사진을 넣었습니다. 이 기기에만 저장됩니다.');
      };
      im.onerror = function () { toast('이미지를 읽지 못했습니다.'); };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* --------------------------------------------------------------- 양식 글자 */
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

  /* --------------------------------------------------------------- 상태 */
  function blankState() {
    var iso = todayISO();
    var p = people[0] || null;
    return {
      typeId: 'membership',
      personId: p ? p.id : '',
      name: p ? (p.name || '') : '',
      position: (p && p.position) || DEFAULTS.position,
      birth: (p && p.birth) || '',
      church: (p && p.church) || DEFAULTS.church,
      churchAddress: (p && p.churchAddress) || DEFAULTS.churchAddress,
      representative: (p && p.representative) || DEFAULTS.representative,
      address: (p && p.address) || DEFAULTS.address,
      sender: '서울강동노회', recipient: '',
      date: iso, no: '', inet: makeInet(),
      noEdited: false, inetEdited: false,
      sealsOn: true,
      extras: {}, bodies: {}, fmt: defaultFmt()
    };
  }

  /* 이 기기에 남은 예전 기본값을 새 기본값으로 옮긴다(한 번만) */
  var LEGACY_FMT = {
    hqAddress: ['서울특별시 서초구 남부순환로 2221'],
    tel: ['Tel: 584-6885.9845', 'Tel: 584-6885.9845  Fax: 521-2729'],
    fax: ['Fax: 521-2729']
  };
  function migrateFmt(fmt, saved) {
    var def = defaultFmt();
    Object.keys(LEGACY_FMT).forEach(function (k) {
      var v = String(fmt[k] == null ? '' : fmt[k]).trim();
      if (LEGACY_FMT[k].indexOf(v) > -1) fmt[k] = def[k];
    });
    /* 새 지면(2026-11-25)에서 한 번만 옮긴다 — 이후에 관리자에서 고른 값은 그대로 둔다 */
    if (!saved || saved.mig !== 5) {
      if (String(fmt.signerTitle || '').trim() === '노회 서기') fmt.signerTitle = def.signerTitle;
      if (String(fmt.watermark || '').trim() === 'navy') fmt.watermark = def.watermark;
      /* 종류별 문구에 남은 옛 직함도 함께 옮긴다 */
      Object.keys(fmt.types || {}).forEach(function (id) {
        var o = fmt.types[id];
        if (o && typeof o === 'object' && String(o.signTitle || '').trim() === '노회 서기') delete o.signTitle;
      });
      if (!String(fmt.tel || '').trim()) fmt.tel = def.tel;
      if (!String(fmt.fax || '').trim()) fmt.fax = def.fax;
      if (!String(fmt.chairTitle || '').trim() && !String(fmt.chairName || '').trim()) {
        fmt.chairTitle = def.chairTitle; fmt.chairName = def.chairName;
      }
    }
  }

  function initState() {
    var saved = loadJSON(KEY_STATE, {});
    var base = blankState();
    Object.keys(base).forEach(function (k) {
      if (saved[k] !== undefined && saved[k] !== null) base[k] = saved[k];
    });
    // 발급일은 열 때마다 오늘(한국 시간)로 다시 계산한다
    base.date = todayISO();
    base.extras = base.extras || {};
    base.bodies = base.bodies || {};
    base.fmt = base.fmt || defaultFmt();
    var fmt = defaultFmt();
    if (saved.fmt && typeof saved.fmt === 'object') {
      Object.keys(fmt).forEach(function (k) {
        if (k !== 'types' && saved.fmt[k] !== undefined && saved.fmt[k] !== null) fmt[k] = saved.fmt[k];
      });
      if (saved.fmt.types && typeof saved.fmt.types === 'object') fmt.types = saved.fmt.types;
    }
    migrateFmt(fmt, saved);
    base.fmt = fmt;
    // 예전 '본문 문구 수정' 저장값을 종류별 문구로 옮긴다
    Object.keys(base.bodies || {}).forEach(function (id) {
      if (base.bodies[id] && base.bodies[id].length) {
        var o = fmt.types[id] || (fmt.types[id] = {});
        if (!o.body) o.body = base.bodies[id].slice();
      }
    });
    if (typeof saved.sealsOn === 'boolean') base.sealsOn = saved.sealsOn;
    else if (saved.sealChoice === 'none') base.sealsOn = false;
    state = base;
    state.mig = 5;
    state.no = state.no || nextNo(state.date);
    saveState();
  }

  function currentDef() {
    return TYPE_BY_ID[state.typeId] || TYPES[0] || {
      id: 'membership', name: '소속증명서', kind: 'church', title: '소속증명서',
      rows: [{ label: '교회명', src: 'church' }, { label: '주소', src: 'churchAddress' },
             { label: '대표자', src: 'rep' }, { label: '직분', src: 'position' }],
      body: ['위 교회는 대한예수교장로회(백석) 서울강동노회 산하에', '속한 교회임을 증명합니다.'], extra: []
    };
  }
  function extraOf(typeId) {
    if (!state.extras[typeId]) state.extras[typeId] = {};
    return state.extras[typeId];
  }

  function personById(id) {
    return people.filter(function (p) { return p.id === id; })[0] || null;
  }
  function personByName(q) {
    var n = normalize(q);
    if (!n) return null;
    var exact = people.filter(function (p) { return normalize(p.name) === n; })[0];
    if (exact) return exact;
    if (n.length >= 2) {
      var cands = people.filter(function (p) { return normalize(p.name).indexOf(n) > -1; });
      if (cands.length === 1) return cands[0];
    }
    return null;
  }
  function personByPosition(pos) {
    var n = normalize(pos);
    if (!n) return null;
    var cands = people.filter(function (p) { return normalize(p.position) === n; });
    return cands.length === 1 ? cands[0] : null;
  }

  function applyPerson(p, keepTypedName) {
    if (!p) return;
    state.personId = p.id || '';
    if (!keepTypedName) state.name = p.name || '';
    state.position = p.position || '';
    state.birth = p.birth || '';
    state.church = p.church || '';
    state.churchAddress = p.churchAddress || '';
    state.representative = p.representative || '';
    state.address = p.address || '';
    if (p.plantDate) extraOf('church-plant').plantDate = p.plantDate;
    if (p.foundDate) extraOf('church-found').foundDate = p.foundDate;
    saveState();
    render();
    if (el.person) el.person.value = state.personId;
  }

  /* --------------------------------------------------------------- 값 채우기 */
  /* 받침에 맞춰 조사를 고른다: {name:은} → 박재용은 / 이용동은 */
  function josa(word, kind) {
    var w = String(word || '');
    var c = w.charCodeAt(w.length - 1);
    var hasJong = false;
    if (c >= 0xAC00 && c <= 0xD7A3) hasJong = ((c - 0xAC00) % 28) !== 0;
    var jong = (c >= 0xAC00 && c <= 0xD7A3) ? ((c - 0xAC00) % 28) : 0;
    switch (kind) {
      case '은': case '는': return hasJong ? '은' : '는';
      case '이': case '가': return hasJong ? '이' : '가';
      case '을': case '를': return hasJong ? '을' : '를';
      case '과': case '와': return hasJong ? '과' : '와';
      case '으로': case '로': return (!hasJong || jong === 8) ? '로' : '으로';
      default: return '';
    }
  }

  function fillMap() {
    var ex = extraOf(currentDef().id);
    var m = {
      church: state.church,
      churchAddress: state.churchAddress,
      rep: state.representative,
      representative: state.representative,
      position: state.position,
      name: state.name,
      birth: fmtDate(state.birth),
      address: state.address,
      presbytery: state.fmt.presbytery,
      date: fmtDate(state.date)
    };
    Object.keys(ex).forEach(function (k) {
      var v = ex[k];
      m[k] = /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? fmtDate(v) : (v || '');
    });
    return m;
  }

  function fill(text) {
    var map = fillMap();
    return String(text).replace(/\{(\w+)(?::([가-힣]+))?\}/g, function (m, k, j) {
      var v = map[k];
      if (v === undefined || v === null) return m;
      v = String(v);
      return j ? v + josa(v, j) : v;
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

  /* 한 줄로만 찍히는 머리글 줄이 폭을 넘으면 그 줄만 조금씩 줄인다(두 줄로 접히지 않게) */
  function fitOneLine(node, minMm) {
    if (!node) return;
    node.style.fontSize = '';
    node.style.letterSpacing = '';
    for (var i = 0; i < 30; i++) {
      if (node.scrollWidth <= node.clientWidth + 1) return;
      var fs = parseFloat(getComputedStyle(node).fontSize) / MM;   /* mm */
      if (fs <= minMm) return;
      node.style.fontSize = (fs - 0.06).toFixed(2) + 'mm';
    }
  }
  function fitHead() {
    fitOneLine($('pOrgLine'), 3.6);
    fitOneLine($('pAddrRow'), 2.2);
  }

  function layoutTitle() {
    var t = el.pTitle, n = t.textContent.replace(/\s/g, '').length || 1;
    t.style.letterSpacing = '0mm'; t.style.paddingLeft = '0mm'; t.style.fontSize = '';
    if (!t.offsetWidth) return;          /* 지면이 화면에 없을 때는 폭을 재지 않는다(다시 그릴 때 계산) */
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
    var map = {
      birth: fmtDate(state.birth),
      church: state.church,
      churchAddress: state.churchAddress,
      address: state.address,
      name: state.name,
      position: state.position,
      rep: state.representative,
      representative: state.representative,
      presbytery: state.fmt.presbytery
    };
    if (map[row.src] !== undefined) return map[row.src];
    var v = extraOf(currentDef().id)[row.src] || '';
    if (row.fmt === 'date' || /^\d{4}-\d{2}-\d{2}$/.test(v)) return fmtDate(v);
    return v;
  }

  function renderPaper() {
    var F = state.fmt, def = currentDef(), T = typeText(def);

    el.pOrg.textContent = F.org || '';
    el.pPresb.textContent = F.presbytery || '';
    el.pPresb.hidden = !String(F.presbytery || '').trim();
    $('pOrgGap').hidden = el.pPresb.hidden || !String(F.org || '').trim();
    el.pHq.textContent = F.hqAddress || '';
    el.pHq.hidden = !String(F.hqAddress || '').trim();
    el.paper.classList.toggle('has-hq', !el.pHq.hidden);
    el.pNohoeAddr.textContent = F.presbyteryAddress || '';
    el.pNohoeAddr.hidden = !String(F.presbyteryAddress || '').trim();
    var tel = String(F.tel || '').trim(), fax = String(F.fax || '').trim();
    el.pTel.textContent = tel;
    el.pFax.textContent = fax;
    el.pTel.hidden = !tel;
    el.pFax.hidden = !fax;
    $('pTelGap').hidden = !(tel && fax);
    $('pTelRow').hidden = !tel && !fax;

    el.pNo.textContent = state.no || '';
    el.pTitle.textContent = T.title;
    layoutTitle();
    el.pDate.textContent = fmtDateWide(state.date);
    el.pSignOrg.textContent = F.org + ' ' + (F.presbytery || '');
    el.pSignChairTitle.textContent = F.chairTitle || '';
    el.pSignChair.textContent = F.chairName || '';
    el.pSignTitle.textContent = T.signTitle;
    el.pSigner.textContent = T.signerName;
    el.pNote1.textContent = F.note1;
    el.pNote2.textContent = F.note2;
    el.pInet.textContent = state.inet || '';

    // 엠블럼 워터마크: 종류별 켜기·끄기 + 지면 전체 시안(네이비·회청·먹색·없음)
    var wmVariant = F.watermark || 'navy';
    if (WM_VARIANTS.indexOf(wmVariant) < 0) wmVariant = 'navy';
    var wm = el.paper.querySelector('.wm');
    if (wm) {
      el.paper.dataset.wm = wmVariant;
      if (wmVariant !== 'none') {
        var src = 'assets/emblem-' + wmVariant + '.png';
        if (wm.getAttribute('src') !== src) wm.setAttribute('src', src);
      }
      wm.style.display = (def.watermark === false || wmVariant === 'none') ? 'none' : '';
    }

    // 증명사진 (있을 때만 자리를 차지한다)
    var photo = photoFor(state.personId);
    if (photo) {
      el.pPhoto.src = photo;
      el.pPhoto.hidden = false;
      el.paper.classList.add('has-photo');
    } else {
      el.pPhoto.hidden = true;
      el.pPhoto.removeAttribute('src');
      el.paper.classList.remove('has-photo');
    }

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
    var rowH = n >= 5 ? 8.9 : 9.1;
    Array.prototype.forEach.call(el.pFields.children, function (f) { f.style.height = rowH + 'mm'; });
    el.pBody.style.top = Math.max(119.0, 64.6 + n * rowH + 7.4).toFixed(1) + 'mm';

    // 본문
    el.pBody.innerHTML = T.body.map(fill).map(function (l, i) {
      return '<span class="bl' + (i === 0 ? ' first' : '') + '">' + esc(l) + '</span>';
    }).join('');
    setFit(el.pBody, 12);

    Array.prototype.forEach.call(el.pFields.querySelectorAll('.vl'), function (v) { setFit(v, 9.5); });
    applySeal();
    fitHead();
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
    var isChurch = def.kind === 'church';
    el.nameLabel.textContent = isChurch ? '대표자' : '성명';

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

    var mainVal = isChurch ? state.representative : state.name;
    if (el.name.value !== mainVal) el.name.value = mainVal || '';
    if (el.position.value !== state.position) el.position.value = state.position || '';
    if (el.birth.value !== state.birth) el.birth.value = state.birth || '';
    if (el.church.value !== state.church) el.church.value = state.church;
    if (el.churchAddr.value !== state.churchAddress) el.churchAddr.value = state.churchAddress;
    if (el.addr.value !== state.address) el.addr.value = state.address;
    if (el.sender.value !== state.sender) el.sender.value = state.sender;
    if (el.recipient.value !== state.recipient) el.recipient.value = state.recipient;
    if (el.date.value !== state.date) el.date.value = state.date;
    if (el.no.value !== state.no) el.no.value = state.no;
    if (el.inet.value !== state.inet) el.inet.value = state.inet;
    if (el.person) el.person.value = state.personId || '';
    Array.prototype.forEach.call(document.querySelectorAll('input[name="sealOnOff"]'), function (r) {
      r.checked = (r.value === 'on') === !!state.sealsOn;
    });
  }

  function render() { renderForm(); renderPaper(); }

  function typeNameOf(id) {
    var t = TYPE_BY_ID[id];
    return t ? t.name : (id || '증명서');
  }

  /* 관리자 화면 채우기 */
  function renderFmtForm() {
    var F = state.fmt;
    Array.prototype.forEach.call(document.querySelectorAll('[data-fmt]'), function (inp) {
      if (document.activeElement === inp) return;
      inp.value = F[inp.dataset.fmt] == null ? '' : F[inp.dataset.fmt];
    });
    var wmV = WM_VARIANTS.indexOf(F.watermark) > -1 ? F.watermark : 'navy';
    Array.prototype.forEach.call(document.querySelectorAll('input[name="wmChoice"]'), function (r) {
      r.checked = r.value === wmV;
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

  /* 사람 명단 (관리자) */
  function renderPeopleList() {
    var box = $('peList');
    if (!box) return;
    if (!people.length) {
      box.innerHTML = '<p class="empty">명단이 비어 있습니다. ‘새로 넣기’로 사람을 더해 두세요.</p>';
      return;
    }
    box.innerHTML = people.map(function (p) {
      var sub = [p.position, p.church].filter(Boolean).join(' · ');
      var sub2 = [p.birth, p.address].filter(Boolean).join(' · ');
      return '<div class="hitem" data-person="' + esc(p.id) + '">' +
        '<div class="who"><b>' + esc(p.name) + '</b>' +
        '<small>' + esc(sub) + (sub2 ? ' · ' + esc(sub2) : '') + '</small></div>' +
        '<button type="button" class="mini" data-pedit="' + esc(p.id) + '">고치기</button>' +
        '<button type="button" class="del" data-pdel="' + esc(p.id) + '" aria-label="명단에서 지우기">✕</button>' +
        '</div>';
    }).join('');
  }

  var PE_FIELDS = ['Name', 'Position', 'Birth', 'Church', 'ChurchAddr', 'Address', 'Rep', 'Plant', 'Found'];

  function renderPersonForm() {
    var f = $('peForm');
    if (!f) return;
    var p = editingPersonId ? personById(editingPersonId) : null;
    f.hidden = false;
    $('peName').value = p ? (p.name || '') : '';
    $('pePosition').value = p ? (p.position || '') : '';
    $('peBirth').value = p ? (p.birth || '') : '';
    $('peChurch').value = p ? (p.church || '') : '';
    $('peChurchAddr').value = p ? (p.churchAddress || '') : '';
    $('peAddress').value = p ? (p.address || '') : '';
    $('peRep').value = p ? (p.representative || '') : '';
    $('pePlant').value = p ? (p.plantDate || '') : '';
    $('peFound').value = p ? (p.foundDate || '') : '';
    newPhotoData = p ? photoFor(p.id) : '';
    var thumb = $('pePhotoThumb');
    thumb.innerHTML = newPhotoData ? '<img src="' + newPhotoData + '" alt="">' : '없음';
  }

  function savePersonFromForm() {
    var name = $('peName').value.trim();
    if (!name) { toast('이름을 먼저 적어 주세요.'); return; }
    var rec = {
      id: editingPersonId || '',
      name: name,
      position: $('pePosition').value.trim(),
      birth: $('peBirth').value,
      church: $('peChurch').value.trim(),
      churchAddress: $('peChurchAddr').value.trim(),
      representative: $('peRep').value.trim(),
      address: $('peAddress').value.trim(),
      plantDate: $('pePlant').value,
      foundDate: $('peFound').value
    };
    var idx = -1;
    if (rec.id) idx = people.map(function (p) { return p.id; }).indexOf(rec.id);
    if (idx < 0) {
      var same = people.map(function (p) { return normalize(p.name); }).indexOf(normalize(name));
      if (same > -1) idx = same;
    }
    if (idx > -1) {
      rec.id = people[idx].id;
      people[idx] = rec;
    } else {
      rec.id = 'p' + Date.now();
      people.push(rec);
    }
    if (newPhotoData) setPhoto(rec.id, newPhotoData);
    if (rec.id === state.personId) { state.name = rec.name; state.position = rec.position; state.birth = rec.birth; state.church = rec.church; state.churchAddress = rec.churchAddress; state.representative = rec.representative; state.address = rec.address; }
    editingPersonId = rec.id;
    syncPeople();
    renderPersonForm();
    render();
    toast('명단에 저장했습니다.');
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
    var mainVal = def.kind === 'church' ? state.representative : state.name;
    if (!String(mainVal || '').trim()) {
      warnForm((def.kind === 'church' ? '대표자 이름' : '성명') + '을 먼저 적어 주세요.');
      el.name.classList.add('bad');
      el.name.focus();
      return false;
    }
    var missing = (def.extra || []).filter(function (f) {
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
    var def = currentDef();
    var who = def.kind === 'church' ? state.representative : state.name;
    if (!String(who || '').trim()) return false;
    var list = loadHistory(), last = list[0];
    if (last && last.no === state.no && last.name === who && last.typeId === def.id &&
        (Date.now() - new Date(last.at).getTime()) < 60000) return true;
    var ex = {};
    Object.keys(extraOf(def.id)).forEach(function (k) { ex[k] = extraOf(def.id)[k]; });
    list.unshift({
      id: 'c' + Date.now() + Math.random().toString(36).slice(2, 6),
      at: new Date().toISOString(),
      date: state.date,
      no: state.no, typeId: def.id, type: typeText(def).title || def.name,
      name: who, birth: state.birth, address: state.address,
      church: state.church, position: state.position,
      sender: state.sender, recipient: state.recipient, inet: state.inet, extras: ex
    });
    saveHistory(list);
    renderHistory();
    return true;
  }

  function renderHistory() {
    var list = loadHistory();
    var q = normalize(el.hSearch.value);
    var curType = el.hType.value, curMonth = el.hMonth.value;

    var typesInList = {};
    list.forEach(function (h) { typesInList[typeNameOf(h.typeId) || h.type] = true; });
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
      if (el.hType.value && (typeNameOf(h.typeId) || h.type) !== el.hType.value) return false;
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
        '<div class="who"><b>' + esc(h.name) + ' <em class="badge">' + esc(typeNameOf(h.typeId) || h.type) + '</em></b>' +
        '<small>' + esc(h.no) + ' · ' + esc(h.church || '') +
        (h.date ? ' · 발급일 ' + esc(fmtDate(h.date)) : '') +
        (h.recipient ? ' · 수신 ' + esc(h.recipient) : '') + '</small></div>' +
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
    state.church = h.church || state.church;
    state.position = h.position || state.position;
    state.sender = h.sender || state.sender;
    state.recipient = h.recipient || '';
    state.no = h.no; state.noEdited = true;
    state.date = h.date || todayISO();
    state.inet = makeInet();
    var p = personByName(h.name);
    state.personId = p ? p.id : '';
    extraOf(state.typeId);
    state.extras[state.typeId] = Object.assign({}, h.extras || {});
    saveState(); render(); switchView('issue'); fitPreview();
    toast('이력의 ' + (typeNameOf(state.typeId)) + '를 불러왔습니다. 그대로 다시 받을 수 있습니다.');
  }

  function csvDownload() {
    var list = loadHistory();
    if (!list.length) { toast('내려받을 이력이 없습니다.'); return; }
    var head = ['발급일시', '발급일', '증명서 종류', '증명서 번호', 'Internet No.', '이름', '생년월일', '주소', '교회명', '직분', '발신처', '수신처'];
    var lines = [head.join(',')];
    list.forEach(function (h) {
      lines.push([fmtStampFull(h.at), h.date || '', typeNameOf(h.typeId) || h.type, h.no, h.inet || '', h.name, h.birth || '', h.address || '',
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
  /* 받은 뒤에는 다음 번호로 넘어간다(번호를 직접 고친 경우는 그대로 둠) */
  function advanceNo() {
    if (state.noEdited) return;
    state.no = nextNo(state.date);
    el.no.value = state.no;
    if (!state.inetEdited) { state.inet = makeInet(); el.inet.value = state.inet; }
    saveState();
    renderPaper();
  }

  function doPrint() {
    if (!ensure()) return;
    recordIssue();
    window.print();
    advanceNo();
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
          var who = currentDef().kind === 'church' ? state.representative : state.name;
          downloadBlob(blob, typeText(currentDef()).title.replace(/\s/g, '') + '_' + (who || '').trim() + '_' + state.date + '.png');
          toast('이미지(PNG)로 저장했습니다.');
          done();
          advanceNo();
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
    if (name === 'format') { renderFmtForm(); renderPeopleList(); renderSealSlots(); }
    if (name === 'issue') { renderPaper(); fitPreview(); }
  }

  /* ------------------------------------------------------------------ 설정 파일 */
  function exportSettings() {
    var data = { app: 'certificate', version: 1, exported: new Date().toISOString(), fmt: state.fmt, people: people };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, '증명서-설정-' + todayISO() + '.json');
    toast('설정과 명단을 내려받았습니다. (사진은 기기에만 남습니다)');
  }
  function importSettings(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (data && data.fmt) {
          state.fmt = data.fmt;
          state.fmt.types = state.fmt.types || {};
        }
        if (data && Array.isArray(data.people) && data.people.length) {
          people = data.people;
          savePeople();
          renderPeopleOptions();
          renderPeopleList();
        }
        saveState(); render(); renderFmtForm();
        toast('설정을 가져왔습니다.');
      } catch (e) { toast('파일을 읽지 못했습니다. JSON 파일인지 확인해 주세요.'); }
    };
    reader.readAsText(file);
  }

  /* ------------------------------------------------------------------ 연결 */
  function bind() {
    /* 탭 */
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
      b.addEventListener('click', function () { switchView(b.dataset.view); });
    });

    /* 발급 폼 */
    el.type.addEventListener('change', function () {
      state.typeId = el.type.value;
      if (!state.noEdited) state.no = nextNo(state.date);
      if (!state.inetEdited) state.inet = makeInet();
      saveState(); render(); fitPreview();
    });

    el.person.addEventListener('change', function () {
      var p = personById(el.person.value);
      if (!p) { state.personId = ''; saveState(); render(); return; }
      applyPerson(p);
      if (el.nameHint) {
        el.nameHint.textContent = p.name + ' 님의 정보를 불러왔습니다.';
        el.nameHint.classList.add('on');
      }
    });

    el.name.addEventListener('input', function () {
      var def = currentDef();
      var v = el.name.value;
      if (def.kind === 'church') state.representative = v; else state.name = v;
      var hit = personByName(v);
      if (hit && hit.id !== state.personId) {
        applyPerson(hit, true);
        el.nameHint.textContent = hit.name + ' 님의 정보를 불러왔습니다.';
        el.nameHint.classList.add('on');
        return;
      }
      if (!hit && people.length && el.nameHint) {
        // 명단에 없는 이름이면 사진·연결을 끊어 다른 사람 사진이 찍히지 않게 한다
        if (String(v || '').trim()) state.personId = '';
        el.nameHint.textContent = '명단에 있는 이름을 고르면 직분·생년월일·교회·주소가 저절로 채워집니다.';
        el.nameHint.classList.remove('on');
      }
      if (!state.noEdited) state.no = nextNo(state.date);
      if (!state.inetEdited) state.inet = makeInet();
      saveState(); render();
    });

    el.position.addEventListener('input', function () {
      state.position = el.position.value;
      if (!state.personId) {
        var p = personByPosition(el.position.value);
        if (p && !String(state.name || '').trim()) {
          applyPerson(p);
          el.nameHint.textContent = p.name + ' 님의 정보를 불러왔습니다.';
          el.nameHint.classList.add('on');
          return;
        }
      }
      saveState(); renderPaper();
    });

    el.birth.addEventListener('change', function () { state.birth = el.birth.value; saveState(); render(); });
    el.church.addEventListener('input', function () { state.church = el.church.value; saveState(); renderPaper(); });
    el.churchAddr.addEventListener('input', function () { state.churchAddress = el.churchAddr.value; saveState(); renderPaper(); });
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
    Array.prototype.forEach.call(document.querySelectorAll('input[name="sealOnOff"]'), function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        state.sealsOn = r.value === 'on';
        saveState(); applySeal();
      });
    });
    function sealClick(e, inputId) {
      var pick = e.target.closest('[data-pick]');
      if (pick) { pendingSealKey = pick.dataset.pick; pendingSealInput = inputId; $(inputId).click(); return; }
      var drop = e.target.closest('[data-drop]');
      if (drop) {
        var key = drop.dataset.drop;
        var meta = SEALS.filter(function (s) { return s.key === key; })[0];
        if (!confirm((meta ? meta.name : '직인') + '을(를) 기본 직인으로 되돌릴까요?')) return;
        setSeal(key, null);
        renderSealSlots(); applySeal();
        toast('기본 직인으로 되돌렸습니다.');
      }
    }
    if (el.sealSlots) el.sealSlots.addEventListener('click', function (e) { sealClick(e, 'sealFile'); });
    if (el.sealSlotsAdmin) el.sealSlotsAdmin.addEventListener('click', function (e) { sealClick(e, 'sealFileAdmin'); });
    ['sealFile', 'sealFileAdmin'].forEach(function (id) {
      var inp = $(id);
      if (!inp) return;
      inp.addEventListener('change', function () {
        saveSealFromFile(pendingSealKey || 'secretary', this.files && this.files[0]);
        this.value = '';
      });
    });

    /* 관리자: 양식 글자 */
    Array.prototype.forEach.call(document.querySelectorAll('input[name="wmChoice"]'), function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        state.fmt.watermark = r.value;
        saveState(); renderPaper();
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-fmt]'), function (inp) {
      inp.addEventListener('input', function () {
        var key = inp.dataset.fmt;
        state.fmt[key] = inp.value;
        if (key === 'noPrefix' && !state.noEdited) state.no = nextNo(state.date);
        saveState(); renderPaper();
        if (key === 'signerTitle' || key === 'signerName' || key === 'chairTitle' || key === 'chairName') renderFmtForm();
        if (key === 'noPrefix') el.no.value = state.no;
      });
    });

    $('fmType').addEventListener('change', function () {
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
      if (!confirm('양식 글자를 모두 처음 상태로 되돌릴까요?\n(발급 이력·직인·명단은 그대로 남습니다)')) return;
      state.fmt = defaultFmt();
      if (!state.noEdited) state.no = nextNo(state.date);
      saveState(); renderFmtForm(); render(); el.no.value = state.no;
      toast('기본값으로 복원했습니다.');
    });

    /* 관리자: 사람 명단 */
    $('peNew').addEventListener('click', function () {
      editingPersonId = null; newPhotoData = null;
      renderPersonForm();
      $('peName').focus();
    });
    $('peSave').addEventListener('click', savePersonFromForm);
    $('peReset').addEventListener('click', function () {
      if (!confirm('이 기기에 저장한 명단을 지우고 기본 명단으로 돌아갈까요?')) return;
      try { localStorage.removeItem(KEY_PEOPLE); } catch (e) {}
      people = deepCopy(basePeople);
      editingPersonId = null; newPhotoData = null;
      syncPeople(); renderPersonForm(); render();
      toast('기본 명단으로 돌아갔습니다.');
    });
    $('peList').addEventListener('click', function (e) {
      var ed = e.target.closest('[data-pedit]');
      if (ed) { editingPersonId = ed.dataset.pedit; newPhotoData = null; renderPersonForm(); return; }
      var del = e.target.closest('[data-pdel]');
      if (del) {
        var id = del.dataset.pdel;
        var p = personById(id);
        if (!p) return;
        if (!confirm('명단에서 ' + p.name + ' 님을 지울까요?')) return;
        people = people.filter(function (x) { return x.id !== id; });
        try { localStorage.removeItem(photoKey(id)); } catch (err) {}
        if (state.personId === id) state.personId = '';
        if (editingPersonId === id) editingPersonId = null;
        syncPeople(); renderPersonForm(); render();
        toast('명단에서 지웠습니다.');
      }
    });
    $('pePhotoBtn').addEventListener('click', function () { $('pePhotoFile').click(); });
    $('pePhotoFile').addEventListener('change', function () {
      var id = editingPersonId || 'tmp';
      savePhotoFromFile(id, this.files && this.files[0]);
      this.value = '';
      if (!editingPersonId) toast('먼저 명단에 저장하면 사진이 그 사람 것으로 남습니다.');
    });
    $('pePhotoDel').addEventListener('click', function () {
      if (!editingPersonId) { newPhotoData = null; $('pePhotoThumb').innerHTML = '없음'; return; }
      if (!confirm('이 사람의 증명사진을 지울까요?')) return;
      setPhoto(editingPersonId, null);
      newPhotoData = null;
      $('pePhotoThumb').innerHTML = '없음';
      renderPaper();
      toast('사진을 지웠습니다.');
    });

    /* 설정 백업 */
    $('expBtn').addEventListener('click', exportSettings);
    $('impBtn').addEventListener('click', function () { $('impFile').click(); });
    $('impFile').addEventListener('change', function () {
      importSettings(this.files && this.files[0]);
      this.value = '';
    });

    $('resetBtn').addEventListener('click', function () {
      if (!confirm('입력한 값을 지우고 처음 상태로 돌아갈까요?\n(발급 이력·양식·명단은 지워지지 않습니다)')) return;
      var keepFmt = state.fmt, keepSeals = state.sealsOn;
      state = blankState();
      state.fmt = keepFmt; state.sealsOn = keepSeals;
      state.no = nextNo(state.date);
      el.nameHint.textContent = '명단에 있는 이름을 고르면 직분·생년월일·교회·주소가 저절로 채워집니다.';
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
        if (!confirm('이 발급 기록을 지울까요?\n\n' + (typeNameOf(row.typeId) || row.type) + ' · ' + row.name + ' · ' + row.no)) return;
        saveHistory(loadHistory().filter(function (x) { return x.id !== id; }));
        renderHistory();
        toast('기록을 지웠습니다.');
        return;
      }
      var item = e.target.closest('.hitem');
      if (item && item.dataset.id) loadFromHistory(item.dataset.id);
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
    renderSealSlots();

    Promise.all([loadTypes(), loadPeople()]).then(function () {
      if (!TYPE_BY_ID[state.typeId]) state.typeId = (TYPES[0] && TYPES[0].id) || 'membership';

      // 앱을 열면 관리자에 들어가지 않아도 기본 사람·교회 정보로 채워 둔다
      var savedPerson = personById(state.personId);
      var mainVal = currentDef().kind === 'church' ? state.representative : state.name;
      if (savedPerson) {
        // 이름은 그대로 두고 명단에 있는 직분·생년월일·교회·주소를 다시 맞춘다
        applyPerson(savedPerson, true);
      } else if (!String(mainVal || '').trim() && people.length) {
        applyPerson(people[0]);
      } else if (people.length) {
        var hit = personByName(state.name) || personByPosition(state.position);
        if (hit) state.personId = hit.id;
      }
      state.no = state.no || nextNo(state.date);
      saveState();
      render();
      // 개척일·설립일처럼 명단에 있는 값을 빈 칸에 채운다
      fillExtrasFromPerson();
      renderHistory();
      renderFmtForm();
      renderPeopleList();
      renderPersonForm();
      fitPreview();
      registerSW();
    });
  }

  function fillExtrasFromPerson() {
    var p = personById(state.personId);
    if (!p) return;
    if (p.plantDate && !extraOf('church-plant').plantDate) extraOf('church-plant').plantDate = p.plantDate;
    if (p.foundDate && !extraOf('church-found').foundDate) extraOf('church-found').foundDate = p.foundDate;
    saveState();
    renderForm();
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      navigator.serviceWorker.register('sw.js');
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
