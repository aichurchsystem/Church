/* ==========================================================================
   GV청소년선교회 — 컨퍼런스 등록 게시판 (v4)
   - 등록 교회 명단: 구글 시트의 '웹에 게시된 CSV'를 읽어 표로 그립니다.
   - 등록 폼: 시트 열과 1:1로 맞춘 입력칸. 전송 주소(Apps Script)를 넣으면 동작합니다.
   - 가짜 등록 데이터는 넣지 않습니다. 읽지 못하면 '등록된 교회가 없습니다' 빈 상태만 보입니다.

   [백엔드 필요] GitHub Pages 는 정적 호스팅이라 접수 내용을 저장할 서버가 없습니다.
   접수 저장과 명단 공개는 구글 시트 + Apps Script 백엔드가 맡습니다(아래 설정 두 줄).
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     설정 — 이 두 값만 채우면 등록이 살아납니다.
     1) SHEET_ID      : 접수용 구글 시트 (탭: 바이블컨퍼런스 / 비전컨퍼런스)
     2) SHEET_PUBLISHED: 시트를 '웹에 게시'(또는 링크 공개)한 뒤 true 로 바꿉니다.
        → false 인 동안에는 CSV 를 부르지 않고 빈 상태만 보여 줍니다.
          (게시 전에는 구글이 401 을 돌려주고 브라우저 콘솔에 CORS 오류가 남습니다)
     3) FORM_ENDPOINT : Apps Script 웹앱 URL. 비어 있으면 폼은 '오픈 준비 중'으로 잠깁니다.
     ---------------------------------------------------------------------- */
  var CONFIG = {
    SHEET_ID: '14_mDaBQnm38T_3qeFjhYw7mX6965g8Pd7qUsv55eVw0',
    SHEET_PUBLISHED: false,
    FORM_ENDPOINT: ''
  };

  /* 검증용 덮어쓰기(테스트에서만 사용) */
  var OVERRIDE = window.GV_REGISTER_CONFIG || {};
  if (OVERRIDE.published !== undefined) CONFIG.SHEET_PUBLISHED = !!OVERRIDE.published;
  if (OVERRIDE.formEndpoint) CONFIG.FORM_ENDPOINT = OVERRIDE.formEndpoint;

  /* 시트 1행 헤더와 같은 순서·이름 */
  var HEADERS = ['접수시각', '교회명', '담당자', '직분', '연락처', '이메일', '참가인원', '참가자명단', '문의사항', '상태'];

  function csvUrl(sheet) {
    return 'https://docs.google.com/spreadsheets/d/' + CONFIG.SHEET_ID +
      '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(sheet);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 따옴표·줄바꿈을 처리하는 최소 CSV 파서 (RFC 4180 기준) */
  function parseCSV(text) {
    var rows = [], row = [], cell = '', inQuotes = false, i = 0;
    text = String(text).replace(/^\uFEFF/, '');
    while (i < text.length) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i += 2; continue; }
          inQuotes = false; i += 1; continue;
        }
        cell += ch; i += 1; continue;
      }
      if (ch === '"') { inQuotes = true; i += 1; continue; }
      if (ch === ',') { row.push(cell); cell = ''; i += 1; continue; }
      if (ch === '\r') { i += 1; continue; }
      if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i += 1; continue; }
      cell += ch; i += 1;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
  }

  /* 헤더 이름으로 열 위치를 찾아 객체로 바꿉니다(열 순서가 바뀌어도 동작). */
  function toRecords(rows) {
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return String(h).trim(); });
    var idx = {};
    HEADERS.forEach(function (name) {
      var at = head.indexOf(name);
      if (at !== -1) idx[name] = at;
    });
    /* 헤더가 없고 데이터만 있는 시트도 받아 줍니다 */
    if (Object.keys(idx).length < 2) {
      HEADERS.forEach(function (name, i) { idx[name] = i; });
      return rows.map(function (r) { return pick(r, idx); });
    }
    return rows.slice(1).map(function (r) { return pick(r, idx); });
  }

  function pick(row, idx) {
    var o = {};
    HEADERS.forEach(function (name) {
      var at = idx[name];
      o[name] = at === undefined ? '' : String(row[at] == null ? '' : row[at]).trim();
    });
    return o;
  }

  function shortDate(v) {
    var s = String(v || '').trim();
    if (!s) return '';
    var m = s.match(/^(\d{4})[-.\/]\s*(\d{1,2})[-.\/]\s*(\d{1,2})/);
    if (m) return m[1] + '.' + ('0' + m[2]).slice(-2) + '.' + ('0' + m[3]).slice(-2);
    return s.length > 16 ? s.slice(0, 16) : s;
  }

  function renderBoard(board, records) {
    var tbody = board.querySelector('[data-register-rows]');
    var empty = board.querySelector('[data-register-empty]');
    var count = board.querySelector('[data-register-count]');
    if (!tbody) return;

    var list = records.filter(function (r) { return r['교회명']; });

    if (count) count.textContent = list.length + '곳';
    if (empty) empty.hidden = list.length > 0;

    tbody.innerHTML = list.map(function (r, i) {
      var who = [r['직분'], r['담당자']].filter(Boolean).join(' ');
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td><strong>' + esc(r['교회명']) + '</strong></td>' +
        '<td>' + esc(who || '-') + '</td>' +
        '<td>' + esc(r['참가인원'] || '-') + '</td>' +
        '<td>' + esc(shortDate(r['접수시각']) || '-') + '</td>' +
        '<td>' + esc(r['상태'] || '접수') + '</td>' +
        '</tr>';
    }).join('');
  }

  function renderEmpty(board) {
    var tbody = board.querySelector('[data-register-rows]');
    var empty = board.querySelector('[data-register-empty]');
    var count = board.querySelector('[data-register-count]');
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.hidden = false;
    if (count) count.textContent = '0곳';
  }

  function loadBoard(board) {
    var sheet = board.getAttribute('data-sheet');
    if (!sheet) { renderEmpty(board); return; }
    if (!CONFIG.SHEET_PUBLISHED) { renderEmpty(board); return; }

    var done = false;
    var timer = null;
    try {
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      if (ctrl) timer = window.setTimeout(function () { ctrl.abort(); }, 8000);
      fetch(csvUrl(sheet), { mode: 'cors', credentials: 'omit', signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (text) {
          done = true;
          if (text.indexOf('<!DOCTYPE') !== -1 || text.indexOf('<html') !== -1) throw new Error('not csv');
          renderBoard(board, toRecords(parseCSV(text)));
        })
        .catch(function () { if (!done) renderEmpty(board); })
        .then(function () { if (timer) window.clearTimeout(timer); });
    } catch (e) {
      renderEmpty(board);
    }
  }

  /* ----------------------------------------------------------------------
     등록 폼 — FORM_ENDPOINT 가 비어 있으면 '오픈 준비 중' 상태로 잠급니다.
     ---------------------------------------------------------------------- */
  function setupForm() {
    var form = document.getElementById('registerForm');
    if (!form) return;

    var fieldset = form.querySelector('fieldset');
    var submit = form.querySelector('button[type="submit"]');
    var note = document.getElementById('registerOpenNote');

    if (!CONFIG.FORM_ENDPOINT) {
      if (fieldset) fieldset.disabled = true;
      if (submit) { submit.disabled = true; submit.textContent = '등록 오픈 준비 중'; }
      if (note) note.hidden = false;
      return;
    }

    /* 엔드포인트가 있으면 폼을 열고, 페이지를 떠나지 않도록 숨은 iframe 으로 전송합니다. */
    form.setAttribute('action', CONFIG.FORM_ENDPOINT);
    form.setAttribute('target', 'registerSink');
    var sink = document.createElement('iframe');
    sink.name = 'registerSink';
    sink.style.display = 'none';
    sink.setAttribute('title', '등록 전송 결과');
    document.body.appendChild(sink);

    if (fieldset) fieldset.disabled = false;
    if (!document.getElementById('registerConfig')) {
      var conf = document.createElement('input');
      conf.type = 'hidden';
      conf.name = 'conference';
      conf.id = 'registerConfig';
      conf.value = form.getAttribute('data-conference') || '';
      form.appendChild(conf);
    }
    if (submit) {
      submit.disabled = false;
      submit.classList.remove('btn--soon');
      submit.classList.add('btn--primary');
      submit.textContent = '등록 신청 보내기';
    }
    if (note) note.hidden = true;

    var status = document.createElement('p');
    status.className = 'reg-form__note';
    status.setAttribute('role', 'status');
    status.hidden = true;
    form.parentNode.appendChild(status);

    form.addEventListener('submit', function () {
      status.hidden = false;
      status.textContent = '등록 신청을 보내는 중입니다…';
      window.setTimeout(function () {
        status.textContent = '등록 신청이 접수되면 담당자가 확인 후 연락드립니다. 명단 반영까지 잠시 걸릴 수 있습니다.';
        form.reset();
      }, 1200);
    });
  }

  var boards = document.querySelectorAll('[data-sheet]');
  Array.prototype.forEach.call(boards, loadBoard);
  setupForm();
})();
