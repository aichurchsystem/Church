/* ==========================================================================
   GV청소년선교회 — 시안 v3 인터랙션
   - 청소년 소식·정보 허브: 분류 탭 + 검색 + 헤드라인/주요 소식/최신 카드
   - 소식 상세 모달 / 컨퍼런스 모달
   - 모바일 메뉴 / 드롭다운 / 등장 애니메이션
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. 소식 데이터
     ※ 시안 샘플입니다. 자동 수집 에이전트가 연결되면 이 배열만 교체하면 됩니다.
       (카드 제목은 한국 청소년·교육 정책 흐름을 참고해 작성한 예시이며,
        링크는 각 기관의 공식 홈페이지입니다.)
     ---------------------------------------------------------------------- */
  var CATS = {
    news:    { label: '국내·해외 청소년 뉴스', chip: 'chip--news' },
    paper:   { label: '청소년 신문기사', chip: 'chip--paper' },
    policy:  { label: '한국 청소년정책', chip: 'chip--policy' },
    benefit: { label: '정부혜택·지원', chip: 'chip--benefit' },
    edu:     { label: '교육부·수능 소식', chip: 'chip--edu' }
  };

  var ARTICLES = [
    {
      id: 'edu-2028-admission',
      cat: 'edu',
      title: '2028학년도 대입 개편 — 통합형 수능과 심화수학 선택',
      desc: '수능·내신 체제 변화와 선택과목 구조가 발표되면서, 고교 교육과정과 진로 설계가 함께 조정되고 있습니다. 학생과 학부모가 확인해야 할 핵심 변화를 정리했습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    },
    {
      id: 'news-media-literacy',
      cat: 'news',
      title: '숏폼·AI 콘텐츠 시대, 청소년 미디어 리터러시 교육 확대',
      desc: '짧은 영상과 생성형 AI가 일상이 되면서, 비판적으로 읽고 책임 있게 쓰는 힘을 기르는 교육이 학교와 가정에서 함께 논의되고 있습니다.',
      source: '한국청소년정책연구원',
      url: 'https://www.nypi.re.kr'
    },
    {
      id: 'paper-career-experience',
      cat: 'paper',
      title: '고교생 진로·진학, ‘학과 선택’보다 ‘경험 설계’가 관건',
      desc: '학생부 중심의 대입 변화 속에 청소년이 스스로 경험을 쌓고 기록하는 활동의 중요성이 커지고 있습니다.',
      source: '에듀동아',
      url: 'https://edu.donga.com'
    },
    {
      id: 'policy-7th-plan',
      cat: 'policy',
      title: '제7차 청소년정책기본계획, 청소년 참여와 권리 보장 중심',
      desc: '정책 결정 과정에 청소년이 직접 참여하는 구조와 청소년의 권리 보장이 정책의 중심 과제로 다뤄지고 있습니다.',
      source: '여성가족부',
      url: 'https://www.mogef.go.kr'
    },
    {
      id: 'benefit-1388',
      cat: 'benefit',
      title: '청소년상담 1388 — 24시간 전화·문자·카톡 상담',
      desc: '고민이 있거나 위기 상황일 때 청소년과 보호자가 무료로 상담받을 수 있는 채널입니다. 급하면 먼저 1388로 연락하세요.',
      source: '청소년상담복지 1388',
      url: 'https://www.1388.go.kr'
    },
    {
      id: 'edu-credit-system',
      cat: 'edu',
      title: '고교학점제 안착 지원 — 선택과목·진로 설계 자료',
      desc: '학생이 자신의 진로에 맞춰 과목을 고르는 고교학점제의 운영 지원과 진로·학업 설계 자료가 이어지고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    },
    {
      id: 'news-school-age',
      cat: 'news',
      title: '학령인구 감소, 지역 청소년 사역의 새로운 과제로',
      desc: '청소년 인구가 줄면서 지역 교회와 청소년 기관이 소수 정예 사역과 지역 연합 사역을 모색하고 있습니다.',
      source: '국가통계포털(KOSIS)·언론 보도',
      url: 'https://kosis.kr'
    },
    {
      id: 'paper-student-mind',
      cat: 'paper',
      title: '학생 기자가 본 교실 안 마음 건강 — 또래 상담의 문턱',
      desc: '학생 기자들이 또래의 스트레스와 상담 접근성 문제를 취재한 기획 기사가 이어지고 있습니다.',
      source: '소년한국일보',
      url: 'https://kids.hankooki.com'
    },
    {
      id: 'policy-dream',
      cat: 'policy',
      title: '학교 밖 청소년 지원 — 꿈드림 센터의 검정고시·자립 지원',
      desc: '검정고시, 진로 탐색, 자립 지원을 학교 밖 청소년에게 연결하는 지역 꿈드림 센터의 역할이 커지고 있습니다.',
      source: '여성가족부 꿈드림',
      url: 'https://www.mogef.go.kr'
    },
    {
      id: 'benefit-out-of-school',
      cat: 'benefit',
      title: '학교 밖·취약계층 청소년 — 검정고시·자립·건강검진 지원',
      desc: '꿈드림 센터를 통해 검정고시 지원, 자립 지원, 건강검진 등 본인에게 맞는 지원을 안내받을 수 있습니다.',
      source: '여성가족부',
      url: 'https://www.mogef.go.kr'
    },
    {
      id: 'edu-csat-after',
      cat: 'edu',
      title: '수능 이후 진학 일정 — 정시·수시 지원 전략 점검',
      desc: '수험생과 학부모가 놓치기 쉬운 원서 접수 일정과 지원 전략을 교육청·학교 진학 자료에서 확인할 수 있습니다.',
      source: '교육부·한국교육과정평가원',
      url: 'https://www.moe.go.kr'
    },
    {
      id: 'news-overseas-relation',
      cat: 'news',
      title: '해외 청소년 사역, 행사 중심에서 ‘관계 중심’으로',
      desc: '대규모 집회에서 소그룹·멘토링으로 사역 구조를 바꾸는 해외 교회 사례가 늘고 있습니다. 국내 다음 세대 사역에도 시사점이 큽니다.',
      source: '해외 교회·선교 동향',
      url: 'https://www.korea.kr'
    },
    {
      id: 'paper-culture-space',
      cat: 'paper',
      title: '지역 청소년 문화 공간, ‘방과 후 거실’로 다시 주목',
      desc: '청소년 문화의 집과 자유공간이 방과 후 돌봄과 활동의 거점으로 다시 조명받고 있습니다.',
      source: '한국일보',
      url: 'https://www.hankookilbo.com'
    },
    {
      id: 'policy-echung',
      cat: 'policy',
      title: '청소년 활동 정보, e청소년에서 지역별로 한눈에',
      desc: '지역별 청소년 활동 프로그램과 동아리, 수련시설 정보를 한곳에서 확인할 수 있습니다.',
      source: 'e청소년 (청소년활동정보서비스)',
      url: 'https://www.youth.go.kr'
    },
    {
      id: 'benefit-culture-card',
      cat: 'benefit',
      title: '문화누리카드 — 청소년 문화·체험비 지원 신청 안내',
      desc: '공연·전시·도서·여행 할인과 청소년 대상 문화 지원 제도를 신청 자격과 함께 확인할 수 있습니다.',
      source: '문화체육관광부·한국문화예술위원회',
      url: 'https://www.mcst.go.kr'
    },
    {
      id: 'edu-mind-health',
      cat: 'edu',
      title: '학생 마음건강 — 위기학생 지원·상담 연계 강화',
      desc: '학교 상담 인력 확대와 지역 상담기관 연계, 마음건강 검사 등 학생 정서 지원 정책 소식입니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    },
    {
      id: 'news-counseling-access',
      cat: 'news',
      title: '청소년 마음건강, 학교 밖 상담 접근성 높이는 지역 협력',
      desc: '학교 상담과 지역 청소년상담복지센터를 잇는 협력이 늘면서, 위기 신호를 일찍 발견하려는 시도가 이어지고 있습니다.',
      source: '청소년상담복지 1388·지자체',
      url: 'https://www.1388.go.kr'
    },
    {
      id: 'paper-exam-season',
      cat: 'paper',
      title: '입시 앞둔 고3, 수면·식사 무너지면 먼저 몸을 챙기세요',
      desc: '수험 생활이 길어지면서 수면과 식사를 지키는 기본 관리가 학습 효율과 컨디션을 좌우한다는 조언이 이어집니다.',
      source: '소년한국일보',
      url: 'https://kids.hankooki.com'
    },
    {
      id: 'policy-digital-safety',
      cat: 'policy',
      title: '청소년 유해환경 개선 — 디지털 성범죄·불법촬영물 대응 강화',
      desc: '청소년이 온라인에서 안전하도록 불법촬영물 삭제 지원과 예방 교육, 신고 체계가 함께 강화되고 있습니다.',
      source: '여성가족부·디지털성범죄피해자지원센터',
      url: 'https://www.mogef.go.kr'
    },
    {
      id: 'benefit-scholarship',
      cat: 'benefit',
      title: '국가장학금·교육비 지원 — 신청 시기와 자격 확인',
      desc: '대학 진학을 앞둔 청소년과 학부모가 놓치기 쉬운 장학금과 교육비 지원 제도를 한곳에서 확인할 수 있습니다.',
      source: '교육부·한국장학재단',
      url: 'https://www.kosaf.go.kr'
    },
    {
      id: 'edu-neulbom',
      cat: 'edu',
      title: '늘봄학교·방과후 프로그램 운영 확대',
      desc: '초등 돌봄과 방과후 프로그램을 지역과 연계해 넓히는 운영 사례와 지원 계획이 안내되고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    },
    {
      id: 'edu-school-violence',
      cat: 'edu',
      title: '학교폭력 예방 — 관계 중심 생활교육과 회복 지원',
      desc: '사후 처벌 중심에서 벗어나 관계 회복과 예방 교육을 함께 다루는 학교 현장의 시도가 이어지고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    }
  ];

  /* ----------------------------------------------------------------------
     2. 유틸
     ---------------------------------------------------------------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function byId(id) { return document.getElementById(id); }

  function articleById(id) {
    for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].id === id) return ARTICLES[i];
    return null;
  }

  /* ----------------------------------------------------------------------
     3. 정보 허브
     ---------------------------------------------------------------------- */
  var leadSlot = byId('leadSlot');
  var newsLead = byId('newsLead');
  var headlineList = byId('headlineList');
  var headlineCount = byId('headlineCount');
  var latestBlock = byId('latestBlock');
  var latestCount = byId('latestCount');
  var grid = byId('cardGrid');
  var statusEl = byId('hubStatus');
  var emptyEl = byId('newsEmpty');
  var loadMore = byId('loadMore');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var searchInput = byId('infoSearch');
  var searchWrap = byId('searchWrap');
  var searchClear = byId('searchClear');

  var PAGE = 6;
  var state = { tab: 'all', q: '', shown: PAGE };

  /* 정보 허브가 있는 페이지(index)에서만 허브 스크립트를 켭니다. */
  var HUB = !!(leadSlot && newsLead && headlineList && headlineCount && latestBlock &&
    latestCount && grid && statusEl && emptyEl && loadMore && searchInput && searchWrap && searchClear);

  function leadHTML(a) {
    var c = CATS[a.cat];
    return '' +
      '<article class="lead-card" data-article="' + esc(a.id) + '">' +
        '<div>' +
          '<div class="lead-card__top">' +
            '<span class="chip ' + c.chip + '">' + esc(c.label) + '</span>' +
            '<span class="chip chip--sample">시안 예시</span>' +
          '</div>' +
          '<h3>' + esc(a.title) + '</h3>' +
          '<p class="lead-card__desc">' + esc(a.desc) + '</p>' +
        '</div>' +
        '<div class="lead-card__foot">' +
          '<span class="lead-card__source">' + esc(a.source) + '</span>' +
          '<button class="lead-card__more" type="button" data-article="' + esc(a.id) + '">자세히 보기 <span aria-hidden="true">→</span></button>' +
        '</div>' +
      '</article>';
  }

  function headlineHTML(a, i) {
    var c = CATS[a.cat];
    return '' +
      '<li>' +
        '<button class="headline-item" type="button" data-article="' + esc(a.id) + '">' +
          '<span class="headline-item__rank">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
          '<span class="headline-item__body">' +
            '<span class="headline-item__cat-row"><span class="chip ' + c.chip + '">' + esc(c.label) + '</span></span>' +
            '<span class="headline-item__title">' + esc(a.title) + '</span>' +
            '<span class="headline-item__src">' + esc(a.source) + '</span>' +
          '</span>' +
        '</button>' +
      '</li>';
  }

  function cardHTML(a) {
    var c = CATS[a.cat];
    return '' +
      '<article class="info-card reveal" data-article="' + esc(a.id) + '" tabindex="0" role="button" aria-label="' + esc(a.title) + ' — 소식 요약 보기">' +
        '<div class="info-card__top">' +
          '<span class="chip ' + c.chip + '">' + esc(c.label) + '</span>' +
          '<span class="chip chip--sample">시안 예시</span>' +
        '</div>' +
        '<h4>' + esc(a.title) + '</h4>' +
        '<p class="info-card__desc">' + esc(a.desc) + '</p>' +
        '<div class="info-card__foot">' +
          '<span class="src">' + esc(a.source) + '</span>' +
          '<span class="info-card__link">자세히 보기 <span aria-hidden="true">→</span></span>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var q = state.q.trim().toLowerCase();
    var list = ARTICLES.filter(function (a) {
      var okTab = state.tab === 'all' || a.cat === state.tab;
      var hay = (a.title + ' ' + a.desc + ' ' + a.source + ' ' + CATS[a.cat].label).toLowerCase();
      return okTab && (!q || hay.indexOf(q) !== -1);
    });

    var searching = !!q;

    if (searching) {
      newsLead.hidden = true;
      leadSlot.innerHTML = '';
      headlineList.innerHTML = '';
      latestBlock.hidden = list.length === 0;
      emptyEl.hidden = list.length !== 0;
      latestCount.textContent = list.length + '건';
      grid.innerHTML = list.map(cardHTML).join('');
      loadMore.hidden = true;
      statusEl.innerHTML = '검색어 “' + esc(state.q.trim()) + '” · <b>' + list.length + '</b>건';
    } else {
      newsLead.hidden = false;
      emptyEl.hidden = true;
      latestBlock.hidden = false;

      var lead = list[0];
      var heads = list.slice(1, 6);
      var rest = list.slice(6);

      leadSlot.innerHTML = lead ? leadHTML(lead) : '';
      newsLead.hidden = !lead;

      headlineList.innerHTML = heads.map(headlineHTML).join('');
      headlineCount.textContent = heads.length ? heads.length + '건' : '';
      newsLead.classList.toggle('is-single', !heads.length);

      grid.innerHTML = rest.slice(0, state.shown).map(cardHTML).join('');
      latestCount.textContent = list.length + '건';
      latestBlock.hidden = rest.length === 0;
      loadMore.hidden = state.shown >= rest.length;
      loadMore.textContent = '소식 더 보기 (' + Math.max(0, rest.length - state.shown) + ')';

      var where = state.tab === 'all' ? '전체' : CATS[state.tab].label;
      statusEl.innerHTML = '<b>' + list.length + '</b>개의 소식 · ' + esc(where);
    }

    requestAnimationFrame(function () {
      Array.prototype.forEach.call(grid.querySelectorAll('.reveal'), function (el) {
        el.classList.add('is-in');
      });
    });
    observeReveals(grid);
  }

  function paintCounts() {
    var counts = { all: ARTICLES.length };
    ARTICLES.forEach(function (a) { counts[a.cat] = (counts[a.cat] || 0) + 1; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
      var k = el.getAttribute('data-count');
      el.textContent = counts[k] || 0;
    });
  }

  function selectTab(key, focusTab) {
    state.tab = key;
    state.shown = PAGE;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on && focusTab) t.focus();
      if (on && !focusTab && t.parentElement) {
        var wrap = t.parentElement;
        wrap.scrollTo({ left: t.offsetLeft - (wrap.clientWidth - t.clientWidth) / 2, behavior: 'smooth' });
      }
    });
    render();
  }

  if (HUB) tabs.forEach(function (t) {
    t.addEventListener('click', function () { selectTab(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(next.getAttribute('data-tab'), true);
      }
    });
  });

  if (HUB) loadMore.addEventListener('click', function () {
    state.shown += PAGE;
    render();
  });

  if (HUB) searchInput.addEventListener('input', function () {
    state.q = searchInput.value;
    state.shown = PAGE;
    searchWrap.classList.toggle('has-value', !!searchInput.value);
    if (searchInput.value.trim() && state.tab !== 'all') {
      state.tab = 'all';
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.getAttribute('data-tab') === 'all' ? 'true' : 'false');
      });
    }
    render();
  });

  if (HUB) searchClear.addEventListener('click', function () {
    searchInput.value = '';
    state.q = '';
    state.shown = PAGE;
    searchWrap.classList.remove('has-value');
    render();
    searchInput.focus();
  });

  if (HUB) {
    render();

    /* 다른 페이지의 메뉴에서 index.html?tab=news#info 로 들어오면 그 분류를 펼칩니다. */
    var wantTab = '';
    try {
      wantTab = new URLSearchParams(window.location.search).get('tab') || '';
    } catch (e) { wantTab = ''; }
    if (wantTab && (wantTab === 'all' || CATS[wantTab])) selectTab(wantTab);
  }

  /* ----------------------------------------------------------------------
     3-b. 메인 '오늘의 브리핑' — 정리된 소식 가운데 최근 3건만 카드로
     (전체 목록·검색은 청소년 정보 아카이브 archive.html 이 맡는다)
     ---------------------------------------------------------------------- */
  var briefingGrid = byId('briefingGrid');
  if (briefingGrid) {
    briefingGrid.innerHTML = ARTICLES.slice(0, 3).map(cardHTML).join('');
  }

  /* ----------------------------------------------------------------------
     3-c. 청소년 정보 아카이브(archive.html) — 분류 탭 + 키워드 검색 + 더 보기
     ---------------------------------------------------------------------- */
  var arcRoot = byId('archiveRoot');
  var ARC = !!(arcRoot && grid && statusEl && emptyEl && loadMore && searchInput && searchWrap && searchClear);

  if (ARC) {
    var ARC_PAGE = 9;
    var arcState = { tab: 'all', q: '', shown: ARC_PAGE };

    function arcList() {
      var q = arcState.q.trim().toLowerCase();
      return ARTICLES.filter(function (a) {
        var okTab = arcState.tab === 'all' || a.cat === arcState.tab;
        var hay = (a.title + ' ' + a.desc + ' ' + a.source + ' ' + CATS[a.cat].label).toLowerCase();
        return okTab && (!q || hay.indexOf(q) !== -1);
      });
    }

    /* 고른 분류를 주소에 남겨 그대로 공유·즐겨찾기할 수 있게 한다 */
    function syncArcUrl() {
      if (!window.history || !window.history.replaceState) return;
      var url = window.location.pathname +
        (arcState.tab === 'all' ? '' : '?cat=' + encodeURIComponent(arcState.tab));
      try { window.history.replaceState(null, '', url); } catch (e) {}
    }

    function paintArcTabs() {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.getAttribute('data-tab') === arcState.tab ? 'true' : 'false');
      });
    }

    function renderArchive() {
      var list = arcList();
      var q = arcState.q.trim();
      var rest = Math.max(0, list.length - arcState.shown);

      grid.innerHTML = list.slice(0, arcState.shown).map(cardHTML).join('');
      emptyEl.hidden = list.length !== 0;
      loadMore.hidden = rest === 0;
      loadMore.textContent = '소식 더 보기 (' + rest + ')';

      var where = arcState.tab === 'all' ? '전체' : CATS[arcState.tab].label;
      statusEl.innerHTML = '<b>' + list.length + '</b>건 · ' + esc(where) +
        (q ? ' · 검색어 “' + esc(q) + '”' : '');

      requestAnimationFrame(function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.reveal'), function (el) {
          el.classList.add('is-in');
        });
      });
      syncArcUrl();
    }

    function selectArcTab(key, focusTab) {
      arcState.tab = key;
      arcState.shown = ARC_PAGE;
      paintArcTabs();
      tabs.forEach(function (t) {
        if (focusTab && t.getAttribute('data-tab') === key) t.focus();
        if (!focusTab && t.getAttribute('data-tab') === key && t.parentElement) {
          var wrap = t.parentElement;
          wrap.scrollTo({ left: t.offsetLeft - (wrap.clientWidth - t.clientWidth) / 2, behavior: 'smooth' });
        }
      });
      renderArchive();
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { selectArcTab(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var i = tabs.indexOf(t);
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectArcTab(next.getAttribute('data-tab'), true);
      });
    });

    loadMore.addEventListener('click', function () {
      arcState.shown += ARC_PAGE;
      renderArchive();
    });

    searchInput.addEventListener('input', function () {
      arcState.q = searchInput.value;
      arcState.shown = ARC_PAGE;
      searchWrap.classList.toggle('has-value', !!searchInput.value);
      renderArchive();
    });

    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      arcState.q = '';
      arcState.shown = ARC_PAGE;
      searchWrap.classList.remove('has-value');
      renderArchive();
      searchInput.focus();
    });

    /* 메인 주제 칸이 보내는 archive.html?cat=policy 같은 주소로 바로 열기 */
    var wantCat = '';
    try {
      wantCat = new URLSearchParams(window.location.search).get('cat') || '';
    } catch (e) { wantCat = ''; }
    if (wantCat && CATS[wantCat]) arcState.tab = wantCat;

    paintArcTabs();
    renderArchive();
  }

  /* 분류별 개수를 화면의 [data-count] 자리에 채운다 (탭·메인 안내 문구 공통) */
  paintCounts();

  /* 메뉴·푸터에서 특정 분류로 바로 가기 */
  if (HUB) Array.prototype.forEach.call(document.querySelectorAll('[data-goto-tab]'), function (el) {
    el.addEventListener('click', function () {
      selectTab(el.getAttribute('data-goto-tab'));
      closeMobileMenu();
    });
  });

  /* 헤더의 검색 아이콘은 청소년 정보 아카이브로 가는 링크입니다(HTML). */

  /* ----------------------------------------------------------------------
     4. 모달 공통
     ---------------------------------------------------------------------- */
  var lastFocused = null;

  var confModal = byId('confModal');
  var newsModal = byId('newsModal');

  function trapFocus(e) {
    var open = (confModal && !confModal.hidden) ? confModal : ((newsModal && !newsModal.hidden) ? newsModal : null);
    if (!open) return;
    if (e.key === 'Tab') {
      var f = open.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function anyOpen() {
    return !!((confModal && !confModal.hidden) || (newsModal && !newsModal.hidden));
  }

  function openModal(el) {
    if (!el || anyOpen()) return;
    lastFocused = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    var closeBtn = el.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(el) {
    el.hidden = true;
    if (!anyOpen()) document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-open-modal]'), function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      closeMobileMenu();
      if (confModal) openModal(confModal);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal]'), function (btn) {
    btn.addEventListener('click', function () { if (confModal) closeModal(confModal); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-close-news]'), function (btn) {
    btn.addEventListener('click', function () { if (newsModal) closeModal(newsModal); });
  });

  if (confModal) confModal.addEventListener('click', function (e) { if (e.target === confModal) closeModal(confModal); });
  if (newsModal) newsModal.addEventListener('click', function (e) { if (e.target === newsModal) closeModal(newsModal); });

  /* 소식 상세 열기 */
  function openNews(id) {
    var a = articleById(id);
    if (!a) return;
    var c = CATS[a.cat];
    var chip = byId('newsModalChip');
    chip.className = 'chip ' + c.chip;
    chip.textContent = c.label;
    byId('newsModalTitle').textContent = a.title;
    byId('newsModalDesc').textContent = a.desc;
    byId('newsModalSource').textContent = '출처 · ' + a.source;
    byId('newsModalLink').href = a.url;
    openModal(newsModal);
  }

  Array.prototype.forEach.call(document.querySelectorAll('#info, #archiveRoot, #newsModal'), function (root) {
    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-article]');
      if (el) openNews(el.getAttribute('data-article'));
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target.closest('[data-article]');
      if (!el || el.tagName === 'BUTTON') return;
      e.preventDefault();
      openNews(el.getAttribute('data-article'));
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (confModal && !confModal.hidden) closeModal(confModal);
      else if (newsModal && !newsModal.hidden) closeModal(newsModal);
      else closeMobileMenu();
    }
    if (anyOpen()) trapFocus(e);
  });

  /* ----------------------------------------------------------------------
     5. 모바일 메뉴
     ---------------------------------------------------------------------- */
  var burger = byId('burger');
  var mobileMenu = byId('mobileMenu');

  function openMobileMenu() {
    /* 헤더가 sticky라서 스크롤 위치에 따라 헤더 아래 끝이 달라진다. 드로어를 그 바로 아래에 붙여
       상단 로고가 헤더에 가리지 않게 한다. */
    var header = document.querySelector('.site-header');
    if (header) {
      mobileMenu.style.top = Math.round(header.getBoundingClientRect().bottom) + 'px';
    }
    mobileMenu.hidden = false;
    requestAnimationFrame(function () { mobileMenu.classList.add('is-open'); });
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '메뉴 열기');
    if (!anyOpen()) document.body.style.overflow = '';
    window.setTimeout(function () {
      if (burger.getAttribute('aria-expanded') === 'false') mobileMenu.hidden = true;
    }, 200);
  }

  burger.addEventListener('click', function () {
    if (burger.getAttribute('aria-expanded') === 'true') closeMobileMenu();
    else openMobileMenu();
  });

  Array.prototype.forEach.call(mobileMenu.querySelectorAll('.mobile-group__title'), function (btn) {
    btn.addEventListener('click', function () {
      var g = btn.parentElement;
      var open = g.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function (a) {
    a.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1180) closeMobileMenu();
  });

  /* ----------------------------------------------------------------------
     6. 데스크톱 드롭다운 (클릭 + 키보드 + 마우스 오버)
     ---------------------------------------------------------------------- */
  var ddItems = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));

  function closeDropdowns(except) {
    ddItems.forEach(function (it) {
      if (it === except) return;
      it.classList.remove('is-open');
      var b = it.querySelector('.nav__link');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  ddItems.forEach(function (item) {
    var btn = item.querySelector('.nav__link');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      closeDropdowns(item);
    });
    item.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 980) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        closeDropdowns(item);
      }
    });
    item.addEventListener('mouseleave', function () {
      if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 980) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    Array.prototype.forEach.call(item.querySelectorAll('.dropdown a'), function (a) {
      a.addEventListener('click', function () {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  document.addEventListener('click', function () { closeDropdowns(null); });

  /* ----------------------------------------------------------------------
     8. 포스터 크게 보기 (컨퍼런스 페이지)
     ---------------------------------------------------------------------- */
  var posterModal = byId('posterModal');
  var zoomTriggers = document.querySelectorAll('[data-poster-zoom]');
  if (posterModal && zoomTriggers.length) {
    var lastZoomFocus = null;
    var zoomImg = posterModal.querySelector('img');

    function openPoster(src) {
      if (zoomImg && src) zoomImg.src = src;
      lastZoomFocus = document.activeElement;
      posterModal.hidden = false;
      document.body.classList.add('zoom-open');
      var closeBtn = posterModal.querySelector('[data-close-poster]');
      if (closeBtn) closeBtn.focus();
    }

    function closePoster() {
      posterModal.hidden = true;
      document.body.classList.remove('zoom-open');
      if (lastZoomFocus && lastZoomFocus.focus) lastZoomFocus.focus();
    }

    Array.prototype.forEach.call(zoomTriggers, function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var inner = el.querySelector('img');
        openPoster(el.getAttribute('data-zoom-src') || (inner ? inner.getAttribute('src') : ''));
      });
    });

    posterModal.addEventListener('click', function (e) {
      if (e.target === posterModal || (e.target.closest && e.target.closest('[data-close-poster]'))) closePoster();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !posterModal.hidden) closePoster();
    });
  }

  /* ----------------------------------------------------------------------
     7. 헤더 그림자 & 등장 애니메이션
     ---------------------------------------------------------------------- */
  var header = byId('siteHeader');
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var io = null;
  function observeReveals(root) {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(root.querySelectorAll('.reveal'), function (el) {
        el.classList.add('is-in');
      });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    Array.prototype.forEach.call(root.querySelectorAll('.reveal:not(.is-in)'), function (el) {
      io.observe(el);
    });
  }
  observeReveals(document);
})();

/* ==========================================================================
   히어로 사진 모자이크 — 지포커스 사역 현장 사진
   · 사진을 바꾸려면 아래 HERO_PHOTOS 목록만 고치면 됩니다.
     (assets/images/gallery/ 에 {이름}.jpg(1600) · {이름}-800.jpg · {이름}-400.jpg 세 판본)
   · scene 이 같은 사진은 한 칸에서 연달아 나오지 않습니다(같은 장면 연속 컷 방지).
   · needsLarge: true 인 사진(글자가 들어간 사진)은 큰 칸에만 나옵니다.
   · 칸 하나가 사진을 바꾸는 간격 = INTERVAL_MS, 겹쳐 바뀌는 시간 = FADE_MS
     (FADE_MS는 styles.css 의 --mosaic-fade 와 같게 맞춥니다)
   ========================================================================== */
(function () {
  'use strict';


  var HERO_PHOTOS = [
    { src: 'assets/images/gallery/gfocus-stand-group.jpg', srcset: 'assets/images/gallery/gfocus-stand-group-400.jpg 400w, assets/images/gallery/gfocus-stand-group-800.jpg 800w, assets/images/gallery/gfocus-stand-group.jpg 1600w', w: 1600, scene: 'stand', caption: 'STAND 비전 수련회 단체사진', priority: true },
    { src: 'assets/images/gallery/gfocus-prayer-1.jpg', srcset: 'assets/images/gallery/gfocus-prayer-1-400.jpg 400w, assets/images/gallery/gfocus-prayer-1-800.jpg 800w, assets/images/gallery/gfocus-prayer-1.jpg 1600w', w: 1600, scene: 'prayer', caption: '안수 기도', priority: true },
    { src: 'assets/images/gallery/gfocus-worship-panorama.jpg', srcset: 'assets/images/gallery/gfocus-worship-panorama-400.jpg 359w, assets/images/gallery/gfocus-worship-panorama-800.jpg 718w, assets/images/gallery/gfocus-worship-panorama.jpg 1435w', w: 1435, scene: 'worship', caption: '찬양하는 집회 전경', priority: true },
    { src: 'assets/images/gallery/gfocus-lecture-banner.jpg', srcset: 'assets/images/gallery/gfocus-lecture-banner-400.jpg 400w, assets/images/gallery/gfocus-lecture-banner-800.jpg 800w, assets/images/gallery/gfocus-lecture-banner.jpg 1600w', w: 1600, scene: 'lecture', caption: '강당 강의', priority: true },
    { src: 'assets/images/gallery/gfocus-media-team.jpg', srcset: 'assets/images/gallery/gfocus-media-team-400.jpg 359w, assets/images/gallery/gfocus-media-team-800.jpg 718w, assets/images/gallery/gfocus-media-team.jpg 1435w', w: 1435, scene: 'media', caption: '미디어 중계팀', priority: true },
    { src: 'assets/images/gallery/gfocus-counsel-group.jpg', srcset: 'assets/images/gallery/gfocus-counsel-group-400.jpg 400w, assets/images/gallery/gfocus-counsel-group-800.jpg 800w, assets/images/gallery/gfocus-counsel-group.jpg 1600w', w: 1600, scene: 'counsel', caption: '청소년을 위한 무료 상담소 운영', priority: true },
    { src: 'assets/images/gallery/gfocus-counsel-indoor.jpg', srcset: 'assets/images/gallery/gfocus-counsel-indoor-400.jpg 400w, assets/images/gallery/gfocus-counsel-indoor-800.jpg 800w, assets/images/gallery/gfocus-counsel-indoor.jpg 1600w', w: 1600, scene: 'counsel', caption: '무료 상담소 상담 장면', priority: true },
    { src: 'assets/images/gallery/gfocus-counsel-booth.jpg', srcset: 'assets/images/gallery/gfocus-counsel-booth-400.jpg 400w, assets/images/gallery/gfocus-counsel-booth-800.jpg 800w, assets/images/gallery/gfocus-counsel-booth.jpg 1600w', w: 1600, scene: 'counsel', caption: '야외 무료 상담 부스', priority: true },
    { src: 'assets/images/gallery/gfocus-forest-group.jpg', srcset: 'assets/images/gallery/gfocus-forest-group-400.jpg 400w, assets/images/gallery/gfocus-forest-group-800.jpg 800w, assets/images/gallery/gfocus-forest-group.jpg 1120w', w: 1120, scene: 'forest', caption: '숲속 단체사진' },
    { src: 'assets/images/gallery/gfocus-stage-band.jpg', srcset: 'assets/images/gallery/gfocus-stage-band-400.jpg 400w, assets/images/gallery/gfocus-stage-band-800.jpg 800w, assets/images/gallery/gfocus-stage-band.jpg 1600w', w: 1600, scene: 'worship', caption: '무대 밴드 찬양', priority: true },
    { src: 'assets/images/gallery/gfocus-sled-tube.jpg', srcset: 'assets/images/gallery/gfocus-sled-tube-400.jpg 359w, assets/images/gallery/gfocus-sled-tube-800.jpg 718w, assets/images/gallery/gfocus-sled-tube.jpg 1435w', w: 1435, scene: 'sled', caption: '눈썰매장' },
    { src: 'assets/images/gallery/gfocus-party.jpg', srcset: 'assets/images/gallery/gfocus-party-400.jpg 359w, assets/images/gallery/gfocus-party-800.jpg 718w, assets/images/gallery/gfocus-party.jpg 1435w', w: 1435, scene: 'party', caption: '친교 시간' },
    { src: 'assets/images/gallery/gfocus-lecture-christian.jpg', srcset: 'assets/images/gallery/gfocus-lecture-christian-400.jpg 400w, assets/images/gallery/gfocus-lecture-christian-800.jpg 800w, assets/images/gallery/gfocus-lecture-christian.jpg 1600w', w: 1600, scene: 'lecture', caption: '강당 강의', priority: true },
    { src: 'assets/images/gallery/gfocus-band-vocal-1.jpg', srcset: 'assets/images/gallery/gfocus-band-vocal-1-400.jpg 400w, assets/images/gallery/gfocus-band-vocal-1-800.jpg 800w, assets/images/gallery/gfocus-band-vocal-1.jpg 1600w', w: 1600, scene: 'band', caption: '밴드 보컬 연습' },
    { src: 'assets/images/gallery/gfocus-band-drum.jpg', srcset: 'assets/images/gallery/gfocus-band-drum-400.jpg 400w, assets/images/gallery/gfocus-band-drum-800.jpg 800w, assets/images/gallery/gfocus-band-drum.jpg 1600w', w: 1600, scene: 'band', caption: '드럼 연습' },
    { src: 'assets/images/gallery/gfocus-prayer-2.jpg', srcset: 'assets/images/gallery/gfocus-prayer-2-400.jpg 400w, assets/images/gallery/gfocus-prayer-2-800.jpg 800w, assets/images/gallery/gfocus-prayer-2.jpg 1600w', w: 1600, scene: 'prayer', caption: '안수 기도', priority: true },
    { src: 'assets/images/gallery/gfocus-prayer-3.jpg', srcset: 'assets/images/gallery/gfocus-prayer-3-400.jpg 400w, assets/images/gallery/gfocus-prayer-3-800.jpg 800w, assets/images/gallery/gfocus-prayer-3.jpg 1600w', w: 1600, scene: 'prayer', caption: '안수 기도', priority: true },
    { src: 'assets/images/gallery/gfocus-sled-group-1.jpg', srcset: 'assets/images/gallery/gfocus-sled-group-1-400.jpg 400w, assets/images/gallery/gfocus-sled-group-1-800.jpg 800w, assets/images/gallery/gfocus-sled-group-1.jpg 1600w', w: 1600, scene: 'sled', caption: '눈썰매장 단체사진' },
    { src: 'assets/images/gallery/gfocus-sled-group-2.jpg', srcset: 'assets/images/gallery/gfocus-sled-group-2-400.jpg 400w, assets/images/gallery/gfocus-sled-group-2-800.jpg 800w, assets/images/gallery/gfocus-sled-group-2.jpg 1600w', w: 1600, scene: 'sled', caption: '눈썰매장 단체사진' },
    { src: 'assets/images/gallery/gfocus-conference-stand.jpg', srcset: 'assets/images/gallery/gfocus-conference-stand-400.jpg 359w, assets/images/gallery/gfocus-conference-stand-800.jpg 718w, assets/images/gallery/gfocus-conference-stand.jpg 1435w', w: 1435, scene: 'conference', caption: 'STAND 비전컨퍼런스 강의', needsLarge: true },
    { src: 'assets/images/gallery/gfocus-conference-wide.jpg', srcset: 'assets/images/gallery/gfocus-conference-wide-400.jpg 400w, assets/images/gallery/gfocus-conference-wide-800.jpg 800w, assets/images/gallery/gfocus-conference-wide.jpg 1600w', w: 1600, scene: 'conference', caption: '강당 강의 전경', needsLarge: true }
  ];

  var INTERVAL_MS = 6000;   /* 칸 하나가 다음 사진으로 바뀌는 간격 (칸이 많아 길게) */
  var FADE_MS = 900;        /* 크로스페이드 길이 */

  var root = document.querySelector('[data-hero-mosaic]');
  if (!root || !HERO_PHOTOS.length) return;

  /* 움직임 줄이기를 켠 분에게는 정지된 모자이크(HTML에 있는 사진) 그대로 둔다. */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* 화면에서 감춘 칸(모바일 5칸 배치 등)은 빼고 돌린다 */
  var cellEls = Array.prototype.slice.call(root.querySelectorAll('.mosaic__cell')).filter(function (el) {
    return el.getClientRects().length > 0;
  });
  if (!cellEls.length) return;

  var rootRect = root.getBoundingClientRect();
  var rects = cellEls.map(function (el) { return el.getBoundingClientRect(); });
  var areas = rects.map(function (r) { return r.width * r.height; });
  var maxArea = Math.max.apply(null, areas);

  var cells = cellEls.map(function (el, ci) {
    var base = el.querySelector('img');
    var baseId = base && base.getAttribute('data-photo') !== null ? parseInt(base.getAttribute('data-photo'), 10) : 0;
    var isLarge = areas[ci] >= maxArea * 0.5;   /* 큰 칸에만 글자 들어간 사진 */
    /* 왼쪽(글자 뒤) 칸은 어두워서 사진이 거의 안 보인다 → 사역 장면 사진은 피한다 */
    var centerX = (rects[ci].left + rects[ci].width / 2 - rootRect.left) / (rootRect.width || 1);
    var isDim = window.innerWidth > 900 && centerX < 0.42;
    var pool = [];
    HERO_PHOTOS.forEach(function (p, i) {
      if (i === baseId) { pool.push(i); return; }
      if (p.needsLarge && !isLarge) return;
      if (isDim && p.priority) return;
      pool.push(i);
    });
    var layers = {};
    if (base) {
      base.classList.remove('is-top');
      base.classList.add('is-active');
      layers[baseId] = base;
    }
    return { el: el, pool: pool, layers: layers, cur: baseId, timer: null };
  });

  /* 사진 한 장을 그 칸에 올린다 (이미 있으면 그대로) — 처음 쓰일 때 받아 온다 */
  function layerFor(cell, id) {
    if (cell.layers[id]) return cell.layers[id];
    var p = HERO_PHOTOS[id];
    var img = document.createElement('img');
    img.decoding = 'async';
    img.alt = p.caption || '';
    img.setAttribute('data-photo', String(id));
    img.sizes = Math.round(cell.el.getBoundingClientRect().width) + 'px';
    img.srcset = p.srcset;
    img.src = p.src;
    cell.el.appendChild(img);
    cell.layers[id] = img;
    return img;
  }

  /* 다음 사진 고르기 — 다른 칸이 보여 주는 사진과 같은 장면의 사진은 피한다 */
  function nextId(cell) {
    var used = {};
    cells.forEach(function (c) {
      if (c !== cell) used[c.cur] = true;
    });
    var pool = cell.pool;
    var n = pool.length;
    var start = pool.indexOf(cell.cur);
    var curScene = HERO_PHOTOS[cell.cur].scene;
    var k, id;

    for (k = 1; k <= n; k++) {
      id = pool[(start + k) % n];
      if (!used[id] && HERO_PHOTOS[id].scene !== curScene) return id;
    }
    for (k = 1; k <= n; k++) {
      id = pool[(start + k) % n];
      if (!used[id]) return id;
    }
    return pool[(start + 1) % n];
  }

  function advance(cell) {
    var id = nextId(cell);
    var cur = cell.layers[cell.cur];
    var nxt = layerFor(cell, id);
    cell.cur = id;

    var started = false;
    function go() {
      if (started) return;
      started = true;
      nxt.classList.add('is-top');
      window.setTimeout(function () {
        if (cur && cur !== nxt) {
          cur.classList.remove('is-active');
          cur.classList.remove('is-top');
        }
        nxt.classList.remove('is-top');
        nxt.classList.add('is-active');
      }, FADE_MS + 60);
    }
    if (nxt.complete && nxt.naturalWidth) go();
    else {
      nxt.addEventListener('load', go);
      nxt.addEventListener('error', go);
      window.setTimeout(go, 1800);
    }

    /* 다음 차례 사진을 미리 받아 둔다 (바뀔 때 기다리지 않게) */
    window.setTimeout(function () { layerFor(cell, nextId(cell)); }, FADE_MS + 100);
  }

  var running = false;

  function runCell(cell, delay) {
    window.clearTimeout(cell.timer);
    cell.timer = window.setTimeout(function loop() {
      advance(cell);
      cell.timer = window.setTimeout(loop, INTERVAL_MS);
    }, delay);
  }

  function start() {
    if (running) return;
    running = true;
    var stagger = Math.round(INTERVAL_MS / cells.length);   /* 칸마다 시차 */
    /* 첫 화면은 잠깐 그대로 두고(3초), 그 뒤부터 한 칸뿐씩 바뀐다 */
    var first = 3000;
    cells.forEach(function (cell, i) { runCell(cell, first + i * stagger); });
  }

  function stop() {
    running = false;
    cells.forEach(function (cell) {
      window.clearTimeout(cell.timer);
      cell.timer = null;
    });
  }

  /* 화면 밖으로 나가거나 탭이 가려지면 멈춰서 배터리·CPU를 아낀다 */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0 }).observe(root.closest('.hero') || root);
  }

  /* 첫 사진이 다 받아진 뒤에 시작 (늦어도 2초 뒤) */
  var began = false;
  function begin() {
    if (began) return;
    began = true;
    if (!document.hidden) start();
  }

  var bases = cells.map(function (c) { return c.layers[c.cur]; }).filter(Boolean);
  var pending = bases.length;
  if (!pending) begin();
  else {
    bases.forEach(function (img) {
      function one() {
        pending -= 1;
        if (pending <= 0) begin();
      }
      if (img.complete && img.naturalWidth > 0) one();
      else {
        img.addEventListener('load', one);
        img.addEventListener('error', one);
      }
    });
    window.setTimeout(begin, 2000);
  }
})();
