/* 메인 — 박재용 목사 목회 일지 / 앱을 열면 처음 보이는 화면 */
function mnEventsOn(dk){
  return App.D.events.filter(e=>App.evDate(e)===dk)
    .sort((a,b)=>(a.start||'').localeCompare(b.start||''));
}
function mnTime(start){
  if(!start)return '';
  return start.length<=10?'종일':start.slice(11,16);
}
function mnLeft(start){
  if(!start||start.length<=10)return '';
  const t=new Date(start.replace(' ','T'));
  let diff=Math.round((t-new Date())/60000);
  if(diff<-1)return '지난 일정';
  if(diff<=0)return '지금';
  if(diff<60)return `${diff}분 후`;
  const h=Math.floor(diff/60), m=diff%60;
  return m?`${h}시간 ${m}분 후`:`${h}시간 후`;
}
function mnNextEvent(){
  const now=new Date();
  return App.D.events
    .filter(e=>e.start&&e.start.length>10&&new Date(e.start.replace(' ','T'))>now)
    .sort((a,b)=>a.start.localeCompare(b.start))[0]||null;
}
function mnRow(e,i){
  const c=App.calCat(e), tm=mnTime(e.start);
  return `<button class="mn-ev" type="button" data-action="go-cal-day" data-date="${App.evDate(e)}" style="--c:${c.color}">
    <span class="t">${tm}</span>
    <span class="b"><b>${App.esc(e.summary)}</b>
      <i>${e.location?App.esc(e.location.slice(0,42)):'—'}</i></span>
    <span class="k" style="color:${c.color}">${c.name}</span>
  </button>`;
}

function renderHome(){
  const D=App.D, today=App.todayKey(), month=today.slice(0,7);
  const evs=mnEventsOn(today);
  const next=mnNextEvent();
  const jitems=D.journal.filter(j=>j.date===today);
  const mJournal=D.journal.filter(j=>App.inMonth(j.date,month));
  const mEvents=D.events.filter(e=>App.inMonth(App.evDate(e),month));
  const noteList=[...D.notes].sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)||(b.date||'').localeCompare(a.date||'')).slice(0,3);
  const places=D.restaurants.map(r=>({r,v:App.foodVisits?(App.foodVisits(r)[0]||null):null}))
    .filter(x=>x.v).sort((a,b)=>b.v.date.localeCompare(a.v.date)).slice(0,3);
  const later=[];
  for(let i=1;i<=10&&later.length<5;i++){
    const k=App.addDays(today,i);
    App.D.events.filter(e=>App.evDate(e)===k).forEach(e=>later.push(e));
  }
  const d=App.dateObj(today), now=new Date();
  const evCount=evs.length;
  const greet = evCount
    ? `목사님, 오늘 일정 <b>${evCount}건</b>입니다`
    : `목사님, 오늘은 일정이 없는 하루입니다`;
  const nextLine = next
    ? `<span class="nm">${esc(next.summary)}</span><span class="in">${mnLeft(next.start)}</span>`
    : (evs.length?`오늘 일정은 모두 마쳤습니다`:`이번 주 일정은 <b>${later.length}건</b> 남아 있습니다`);
  const synced=window.GCal&&window.GCal.state?window.GCal.state:null;
  const syncTxt=synced&&synced.last
    ? `구글 캘린더 연동 · ${new Date(synced.last).getHours()}시 ${String(new Date(synced.last).getMinutes()).padStart(2,'0')}분`
    : '구글 캘린더 연동 준비';

  const el=document.getElementById('sc-home');
  el.innerHTML=`
  <section class="mn-hero">
    <div class="mn-hero-tx">
      <div class="mn-brand">
        <img src="icons/icon-192.png" alt="글로벌비전교회" class="mn-logo">
        <div><b>박재용 목사</b><span>GLOBAL VISION CHURCH · 목회 일지</span></div>
        <button class="mn-sync" type="button" data-action="gcal-sync" title="${syncTxt}"><i></i>${synced&&synced.err?'연동 확인':'연동됨'}</button>
      </div>
      <div class="mn-date">${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${App.DW[d.getDay()]}요일 · ${now.getHours()}시 ${String(now.getMinutes()).padStart(2,'0')}분</div>
      <h2 class="mn-greet">${greet}</h2>
      <div class="mn-next"><span class="lb">${next?'다음':'오늘'}</span><span class="tx">${nextLine}</span></div>
      <div class="mn-chips">
        <span><b>${evCount}</b> 오늘 일정</span>
        <span><b>${jitems.length}</b> 일지</span>
        <span><b>${mEvents.length}</b> 이번 달</span>
        <span class="gold"><b>${App.money(mJournal.reduce((a,j)=>a+(+j.amount||0),0))}</b>원</span>
      </div>
    </div>
    <div class="mn-seal" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="57" fill="rgba(232,176,75,.05)" stroke="rgba(232,176,75,.55)" stroke-width=".9"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(232,176,75,.25)" stroke-width=".7" stroke-dasharray="1 3.6"/>
        <text x="60" y="72" text-anchor="middle" fill="#e8b04b" font-size="40" font-family="'Noto Serif KR',serif" font-weight="600">牧</text>
        <text x="60" y="96" text-anchor="middle" fill="#c08f38" font-size="5.6" letter-spacing="2.2" font-family="Helvetica,Arial">GLOBAL VISION</text>
      </svg>
    </div>
  </section>

  <nav class="mn-quick" aria-label="바로가기">
    <button type="button" data-action="tab" data-tab="journal"><span class="qi" style="--c:#57ce93">${App.ICON.journal}</span><b>오늘 일지 쓰기</b><i>${jitems.length?'기록 있음':'아직 없음'}</i></button>
    <button type="button" data-action="tab" data-tab="counsel"><span class="qi" style="--c:#6fd2d2">${App.ICON.counsel}</span><b>상담 일지</b><i>${D.people.length}명 · ${D.records.length}건</i></button>
    <button type="button" data-action="tab" data-tab="sermons"><span class="qi" style="--c:#e8b04b">${App.ICON.sermons}</span><b>설교 준비</b><i>${D.sermons.length}편</i></button>
    <button type="button" data-action="tab" data-tab="schedule"><span class="qi" style="--c:#82a9e6">${App.ICON.schedule}</span><b>스케줄</b><i>이번 주</i></button>
  </nav>

  <section class="mn-block">
    <div class="mn-bh"><h3>오늘 일정</h3><span>${evCount}건 · ${App.fmtDate(today)}</span>
      <button class="mn-more" type="button" data-action="tab" data-tab="calendar">캘린더 ›</button></div>
    <div class="mn-list">
      ${evs.length?evs.map(mnRow).join('')
      :`<div class="mn-none"><b>오늘은 등록된 일정이 없습니다</b><span>구글 캘린더에 일정을 넣으면 앱에 바로 나타납니다.</span></div>`}
    </div>
  </section>

  <section class="mn-block">
    <div class="mn-bh"><h3>이번 주 남은 일정</h3><span>${later.length}건</span>
      <button class="mn-more" type="button" data-action="tab" data-tab="calendar">주간 보기 ›</button></div>
    <div class="mn-list tight">
      ${later.length?later.map(e=>{const c=App.calCat(e);return `<button class="mn-ev sm" type="button" data-action="go-cal-day" data-date="${App.evDate(e)}" style="--c:${c.color}">
        <span class="t dt">${App.fmtDate(App.evDate(e)).replace('월 ','/').replace('일','')}<i>${App.DW[App.dow(App.evDate(e))]}</i></span>
        <span class="t">${mnTime(e.start)}</span>
        <span class="b"><b>${App.esc(e.summary)}</b></span>
        <span class="k" style="color:${c.color}">${c.name}</span>
      </button>`}).join('')
      :`<div class="mn-none sm"><b>앞으로 10일 일정이 비어 있습니다</b><span>캘린더에서 직접 추가할 수 있습니다.</span></div>`}
    </div>
  </section>

  <div class="mn-two">
    <section class="mn-block">
      <div class="mn-bh"><h3>최근 목회 메모</h3><span>${D.notes.length}개</span>
        <button class="mn-more" type="button" data-action="tab" data-tab="notes">전체 ›</button></div>
      <div class="mn-notes">
        ${noteList.length?noteList.map(n=>`<button class="mn-note" type="button" data-action="tab" data-tab="notes">
          <b>${n.fav?'★ ':''}${App.esc((n.text||'').slice(0,52))}${(n.text||'').length>52?'…':''}</b>
          <span>${n.date?App.fmtDate(n.date):''}${n.theme?' · '+App.THEME(n.theme).name:''}</span>
        </button>`).join('')
        :`<div class="mn-none sm"><b>메모가 아직 없습니다</b><span>설교 아이디어를 바로 적어 두세요.</span></div>`}
      </div>
    </section>
    <section class="mn-block">
      <div class="mn-bh"><h3>다녀온 곳</h3><span>등록 ${D.restaurants.length}곳</span>
        <button class="mn-more" type="button" data-action="tab" data-tab="food">전체 ›</button></div>
      <div class="mn-notes">
        ${places.length?places.map(({r,v})=>`<button class="mn-note" type="button" data-action="food-open" data-food="${r.id}">
          <b>${App.esc(r.name)}</b><span>${App.esc([r.region,r.menu].filter(Boolean).join(' · '))} · ${App.fmtDate(v.date)}</span>
        </button>`).join('')
        :`<div class="mn-none sm"><b>방문 기록이 아직 없습니다</b><span>다녀온 식당·숙소를 남기면 여기에 쌓입니다.</span></div>`}
      </div>
    </section>
  </div>

  ${(!App.standalone()&&!mnInstallHidden())?`<section class="mn-install">
    <div class="mi-tx"><b>홈 화면에 아이콘으로 두고 쓰세요</b>
      <span>아이콘을 누르면 앱처럼 바로 열립니다 · 폰·태블릿·PC 모두 같은 일지</span></div>
    <button class="btn sm primary" type="button" data-action="install-guide">설치 방법</button>
    <button class="mn-x" type="button" data-action="install-dismiss" aria-label="안내 닫기">✕</button>
  </section>`:''}

  <div class="mn-foot">박재용 목사 · 글로벌비전교회 담임 · GV청소년선교회 대표</div>`;
}
function esc(s){return App.esc(s)}
function mnInstallHidden(){try{return localStorage.getItem('mj.installHide')==='1'}catch(e){return false}}
