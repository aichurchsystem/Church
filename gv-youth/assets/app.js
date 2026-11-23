/* ==========================================================================
   GV청소년선교회 — 시안 v1 인터랙션
   - 청소년 정보 허브: 탭 필터 + 키워드 검색
   - 컨퍼런스 상세 모달
   - 모바일 메뉴 / 드롭다운 / 등장 애니메이션
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. 정보 허브 데이터
     ※ 시안 샘플입니다. 자동 수집 에이전트가 연결되면 이 배열만 교체하면 됩니다.
       (실제 기사·정책과 제목이 다를 수 있고, 링크는 각 기관 공식 홈페이지입니다.)
     ---------------------------------------------------------------------- */
  var CATS = {
    news: { label: '국내외 청소년 뉴스', chip: 'chip--news' },
    paper: { label: '청소년 신문기사', chip: 'chip--paper' },
    policy: { label: '한국 청소년정책', chip: 'chip--policy' },
    benefit: { label: '청소년 정부혜택', chip: 'chip--benefit' },
    edu: { label: '교육부 소식', chip: 'chip--edu' }
  };

  var ARTICLES = [
    /* --- 국내외 청소년 뉴스 --- */
    {
      cat: 'news',
      title: '청소년 미디어 이용, 숏폼·AI 콘텐츠 중심으로 이동',
      desc: '영상 콘텐츠 소비 방식이 짧고 빠르게 바뀌면서, 학교와 가정에서 미디어 리터러시 교육이 함께 논의되고 있습니다.',
      source: '한국청소년정책연구원',
      url: 'https://www.nypi.re.kr'
    },
    {
      cat: 'news',
      title: '해외 청소년 사역, 예배·소그룹 \u2018관계 중심\u2019으로 재편',
      desc: '행사 중심에서 벗어나 소그룹과 멘토링으로 사역 구조를 바꾸는 해외 교회 사례가 늘고 있습니다. 국내 다음 세대 사역에도 시사점이 큽니다.',
      source: '해외 교회·선교 동향',
      url: 'https://www.korea.kr'
    },
    {
      cat: 'news',
      title: '학령인구 감소, 청소년 사역의 새로운 과제로',
      desc: '청소년 인구가 줄면서 지역 교회와 청소년 기관이 소수 정예 사역, 지역 연합 사역을 모색하고 있습니다.',
      source: '국가통계포털(KOSIS)·언론 보도',
      url: 'https://kosis.kr'
    },

    /* --- 청소년 신문기사 --- */
    {
      cat: 'paper',
      title: '고교생 진로\u00B7진학, \u2018학과 선택\u2019보다 \u2018경험 설계\u2019가 관건',
      desc: '학생부와 세부능력특기사항 중심의 대입 변화 속에, 청소년이 스스로 경험을 쌓고 기록하는 활동의 중요성이 커지고 있습니다.',
      source: '에듀동아',
      url: 'https://edu.donga.com'
    },
    {
      cat: 'paper',
      title: '청소년 기자가 본 학교 현장 \u2014 교실 안 마음 건강',
      desc: '학생 기자들이 또래의 스트레스와 상담 접근성 문제를 취재한 기획 기사가 이어지고 있습니다.',
      source: '소년한국일보',
      url: 'https://kids.hankooki.com'
    },
    {
      cat: 'paper',
      title: '지역 청소년 문화 공간, \u2018방과 후 거실\u2019로 주목',
      desc: '청소년 문화의 집과 자유공간이 방과 후 돌봄과 활동의 거점으로 다시 조명받고 있습니다.',
      source: '한국일보',
      url: 'https://www.hankookilbo.com'
    },

    /* --- 한국 청소년정책 --- */
    {
      cat: 'policy',
      title: '청소년정책기본계획, 청소년 참여와 권리 보장 강조',
      desc: '정책 결정 과정에 청소년이 직접 참여하는 구조와, 청소년의 권리 보장이 정책의 중심 과제로 다뤄지고 있습니다.',
      source: '여성가족부',
      url: 'https://www.mogef.go.kr'
    },
    {
      cat: 'policy',
      title: '학교 밖 청소년 지원 \u2014 꿈드림 센터 안내',
      desc: '검정고시, 진로 탐색, 자립 지원을 학교 밖 청소년에게 연결하는 지역 꿈드림 센터의 역할이 커지고 있습니다.',
      source: '여성가족부 꿈드림',
      url: 'https://www.mogef.go.kr'
    },
    {
      cat: 'policy',
      title: '청소년 활동, 지역 중심으로 \u2014 e청소년에서 한눈에',
      desc: '지역별 청소년 활동 프로그램과 동아리, 수련시설 정보를 한곳에서 확인할 수 있습니다.',
      source: 'e청소년 (청소년활동정보서비스)',
      url: 'https://www.youth.go.kr'
    },

    /* --- 청소년 정부혜택 --- */
    {
      cat: 'benefit',
      title: '청소년상담 1388 \u2014 24시간 전화\u00B7문자\u00B7카톡 상담',
      desc: '고민이 있거나 위기 상황일 때 청소년과 보호자가 무료로 상담받을 수 있는 채널입니다. 급하면 먼저 1388로 연락하세요.',
      source: '청소년상담복지 1388',
      url: 'https://www.1388.go.kr'
    },
    {
      cat: 'benefit',
      title: '학교 밖\u00B7취약계층 청소년 지원 \u2014 검정고시\u00B7자립\u00B7건강검진',
      desc: '꿈드림 센터를 통해 검정고시 지원, 자립 지원, 건강검진 등 본인에게 맞는 지원을 안내받을 수 있습니다.',
      source: '여성가족부',
      url: 'https://www.mogef.go.kr'
    },
    {
      cat: 'benefit',
      title: '문화누리카드\u00B7청소년 할인 \u2014 문화\u00B7체험 혜택 모아보기',
      desc: '공연\u00B7전시\u00B7도서\u00B7여행 할인과 청소년 대상 문화 지원 제도를 신청 자격과 함께 확인할 수 있습니다.',
      source: '문화체육관광부\u00B7한국문화예술위원회',
      url: 'https://www.mcst.go.kr'
    },

    /* --- 교육부 소식 --- */
    {
      cat: 'edu',
      title: '고교학점제 안착 지원 \u2014 선택과목\u00B7진로 설계',
      desc: '학생이 자신의 진로에 맞춰 과목을 고르는 고교학점제의 운영 지원과 진로\u00B7학업 설계 자료가 이어지고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    },
    {
      cat: 'edu',
      title: '학생 마음건강 \u2014 위기학생 지원\u00B7상담 연계 강화',
      desc: '학교 상담 인력 확대와 지역 상담기관 연계, 마음건강 검사 등 학생 정서 지원 정책 소식입니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    },
    {
      cat: 'edu',
      title: '늘봄학교\u00B7방과후 프로그램 운영 확대',
      desc: '초등 돌봄과 방과후 프로그램을 지역과 연계해 넓히는 운영 사례와 지원 계획이 안내되고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr'
    }
  ];

  /* ----------------------------------------------------------------------
     2. 정보 허브 렌더링
     ---------------------------------------------------------------------- */
  var grid = document.getElementById('cardGrid');
  var statusEl = document.getElementById('hubStatus');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var searchInput = document.getElementById('infoSearch');
  var searchWrap = document.getElementById('searchWrap');
  var searchClear = document.getElementById('searchClear');

  var state = { tab: 'all', q: '' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cardHTML(a) {
    var c = CATS[a.cat];
    return '' +
      '<article class="info-card reveal">' +
        '<div class="info-card__top">' +
          '<span class="chip ' + c.chip + '">' + esc(c.label) + '</span>' +
          '<span class="chip chip--sample">시안 예시</span>' +
        '</div>' +
        '<h3>' + esc(a.title) + '</h3>' +
        '<p class="info-card__desc">' + esc(a.desc) + '</p>' +
        '<div class="info-card__foot">' +
          '<span class="src">' + esc(a.source) + '</span>' +
          '<a class="info-card__link" href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer">출처 바로가기 ' +
            '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.6 3.5h3.9v3.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</a>' +
        '</div>' +
      '</article>';
  }

  function matches(a, q) {
    if (!q) return true;
    var hay = (a.title + ' ' + a.desc + ' ' + a.source + ' ' + CATS[a.cat].label).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function render() {
    var q = state.q.trim().toLowerCase();
    var list = ARTICLES.filter(function (a) {
      return (state.tab === 'all' || a.cat === state.tab) && matches(a, q);
    });

    grid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : '<div class="empty"><strong>조건에 맞는 소식이 없습니다.</strong>' +
        '다른 키워드로 찾아보시거나, ‘전체’ 탭에서 다시 확인해 주세요.</div>';

    var where = state.tab === 'all' ? '전체' : CATS[state.tab].label;
    statusEl.innerHTML = '<b>' + list.length + '</b>개의 시안 카드 · ' + esc(where) +
      (q ? ' · 검색어 “' + esc(state.q.trim()) + '”' : '');

    // 새 카드 등장 처리
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(grid.querySelectorAll('.reveal'), function (el) {
        el.classList.add('is-in');
      });
    });
    observeReveals(grid);
  }

  /* 탭 개수 표시 (전체 기준) */
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

  tabs.forEach(function (t) {
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

  searchInput.addEventListener('input', function () {
    state.q = searchInput.value;
    searchWrap.classList.toggle('has-value', !!searchInput.value);
    // 검색 중에는 전체에서 찾는 편이 자연스럽습니다.
    if (searchInput.value.trim() && state.tab !== 'all') { state.tab = 'all'; selectTab('all'); }
    render();
  });

  searchClear.addEventListener('click', function () {
    searchInput.value = '';
    state.q = '';
    searchWrap.classList.remove('has-value');
    render();
    searchInput.focus();
  });

  paintCounts();
  render();

  /* 메뉴에서 특정 분류로 바로 가기 */
  Array.prototype.forEach.call(document.querySelectorAll('[data-goto-tab]'), function (el) {
    el.addEventListener('click', function () {
      selectTab(el.getAttribute('data-goto-tab'));
      closeMobileMenu();
    });
  });

  /* ----------------------------------------------------------------------
     3. 컨퍼런스 모달
     ---------------------------------------------------------------------- */
  var modal = document.getElementById('confModal');
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-open-modal]'), function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      closeMobileMenu();
      openModal();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal]'), function (btn) {
    btn.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modal.classList.contains('is-open')) closeModal();
      else closeMobileMenu();
    }
    if (e.key === 'Tab' && modal.classList.contains('is-open')) {
      var f = modal.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ----------------------------------------------------------------------
     4. 모바일 메뉴
     ---------------------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  function openMobileMenu() {
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
    document.body.style.overflow = '';
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
    if (window.innerWidth > 940) closeMobileMenu();
  });

  /* ----------------------------------------------------------------------
     5. 데스크톱 드롭다운 (클릭 + 키보드 + 마우스 오버)
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
      if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 940) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        closeDropdowns(item);
      }
    });
    item.addEventListener('mouseleave', function () {
      if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 940) {
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
     6. 헤더 그림자 & 등장 애니메이션
     ---------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
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
