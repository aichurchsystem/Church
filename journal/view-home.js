/* 홈 — 박재용 목사 목회 일지 대시보드 */
function renderHome(){
  const D=App.D, today=App.todayKey(), month=today.slice(0,7);
  const evs=D.events.filter(e=>App.evDate(e)===today).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  const jitems=D.journal.filter(j=>j.date===today).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const jsum=jitems.reduce((a,j)=>a+(+j.amount||0),0);
  const mJournal=D.journal.filter(j=>App.inMonth(j.date,month));
  const msum=mJournal.reduce((a,j)=>a+(+j.amount||0),0);
  const mEvents=D.events.filter(e=>App.inMonth(App.evDate(e),month));
  const counts={done:0,hold:0,todo:0,plan:0};
  mEvents.forEach(e=>counts[e.status||'plan']++);
  const next=sermNext();
  const wkMon=App.mondayOf(today);
  const verses=D.verses.filter(v=>v.date>=wkMon&&v.date<=App.addDays(wkMon,6)).sort((a,b)=>a.date.localeCompare(b.date));
  const noteList=[...D.notes].sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)||(b.date||'').localeCompare(a.date||'')||(b.id||'').localeCompare(a.id||'')).slice(0,3);
  const carV=App.car(), nextDue=App.nextDue();
  const carSum=D.carExpenses.filter(e=>e.date.slice(0,7)===month).reduce((a,e)=>a+(+e.amount||0),0);
  const dueLabel=nextDue?`${nextDue.n} D-${nextDue.dday}`:'차량 관리';
  const d=new Date();
  const dd=App.dateObj(today);
  const evCount=evs.length, doCount=jitems.filter(j=>j.status==='done').length;

  const el=document.getElementById('sc-home');
  el.innerHTML=`
  <section class="hero">
    <div class="hero-l">
      <div class="eyebrow"><i></i>GLOBAL VISION CHURCH · MINISTRY</div>
      <h2>박재용 목사 목회 일지</h2>
      <div class="hdate">${dd.getFullYear()}년 ${dd.getMonth()+1}월 ${dd.getDate()}일 ${App.DW[dd.getDay()]}요일</div>
      <div class="hchips">
        <span class="hchip"><b>${evCount}</b> 오늘 일정</span>
        <span class="hchip"><b>${jitems.length}</b> 일지 기록</span>
        <span class="hchip"><b>${doCount}</b> 오늘 완료</span>
        <span class="hchip amber"><b>${App.money(msum)}</b> 원 · 이번 달</span>
      </div>
    </div>
    <div class="hero-seal" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f9dfa4"/><stop offset=".55" stop-color="#e8b04b"/><stop offset="1" stop-color="#a9781f"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="57" fill="rgba(232,176,75,.05)" stroke="url(#gold)" stroke-width=".9" opacity=".9"/>
        <circle cx="60" cy="60" r="50.5" fill="none" stroke="rgba(232,176,75,.28)" stroke-width=".7" stroke-dasharray="1 3.6"/>
        <path d="M60 22.5v8.5M56.8 25.5h6.4" stroke="rgba(232,176,75,.85)" stroke-width="1.1" stroke-linecap="round"/>
        <text x="60" y="71" text-anchor="middle" fill="url(#gold)" font-size="38" font-family="'Noto Serif KR','Apple SD Gothic Neo',serif" font-weight="600">牧</text>
        <text x="60" y="96" text-anchor="middle" fill="#c08f38" font-size="5.4" letter-spacing="2.4" font-family="Helvetica,Arial">GLOBAL VISION</text>
      </svg>
    </div>
  </section>

  <div class="home-grid">
    <section class="card hov halfd" data-go="calendar">
      <div class="card-h"><span class="hic">${App.ICON.calendar}</span><h2>오늘 일정</h2><span class="hint">${evs.length}건</span></div>
      <div class="card-b">
        ${evs.length?`<div class="hrows">${evs.slice(0,3).map(e=>{
          const st=App.STATUS[e.status||'plan'];
          return `<div class="hrow">
            <span class="htime">${App.evTime(e)}</span>
            <span class="hdot" style="background:${st.color}"></span>
            <span class="hmain"><b>${App.esc(e.summary)}</b>${e.location?`<i>${App.esc(e.location)}</i>`:''}</span>
          </div>`}).join('')}${evs.length>3?`<div class="hmore">외 ${evs.length-3}건 더</div>`:''}</div>`
        :`<div class="hempty">오늘은 등록된 일정이 없습니다.<span>캘린더에서 일정을 확인해 보세요.</span></div>`}
      </div>
    </section>

    <section class="card hov halfd" data-go="journal">
      <div class="card-h"><span class="hic">${App.ICON.journal}</span><h2>오늘의 일지</h2><span class="hint">${jitems.length}건 · ${App.money(jsum)}원</span></div>
      <div class="card-b">
        ${jitems.length?`<div class="hrows">${jitems.slice(0,3).map(j=>`<div class="hrow">
            <span class="hdot" style="background:${App.CAT(j.cat).color}"></span>
            <span class="hmain"><b>${App.esc(j.title)}</b><i>${[j.place,j.time].filter(Boolean).map(App.esc).join(' · ')||App.CAT(j.cat).name}</i></span>
            ${+j.amount?`<span class="hmono">${App.money(j.amount)}</span>`:''}
          </div>`).join('')}${jitems.length>3?`<div class="hmore">외 ${jitems.length-3}건 더</div>`:''}</div>`
        :`<div class="hempty">아직 오늘 기록이 없습니다.<span>오늘 한 일을 남겨 보세요.</span></div>`}
      </div>
    </section>

    <section class="card hov next-sermon span2" data-go="sermons">
      <div class="card-h"><span class="hic">${App.ICON.sermons}</span><h2>다가오는 설교</h2><span class="hint">${next?'가장 가까운 순서':'준비 중인 설교 없음'}</span></div>
      <div class="card-b">
        ${next?`<div class="ns">
          <div class="ns-day"><span class="dday">${ddLabel(next.date)}</span></div>
          <div class="ns-body">
            <div class="ns-theme">${App.THEME(next.theme).name}</div>
            <b>${App.esc(next.title||'(제목 없음)')}</b>
            <div class="ns-meta">${[next.passage,next.date?App.fmtDate(next.date):'',next.time].filter(Boolean).map(App.esc).join(' · ')}</div>
          </div>
        </div>`:`<div class="hempty">설교 준비 페이지에서 첫 설교를 준비해 보세요.<span>주일·수요·새벽 예배 테마별로 관리합니다.</span></div>`}
      </div>
    </section>

    <section class="card hov" data-go="calendar">
      <div class="card-h"><span class="hic">${App.ICON.check}</span><h2>이번 달 상태</h2><span class="hint">${mEvents.length}건</span></div>
      <div class="card-b">
        <div class="st3">
          <div class="stbox"><span class="stn" style="color:#57ce93">${counts.done}</span><span class="stl">완성</span></div>
          <div class="stbox"><span class="stn" style="color:#e8b04b">${counts.hold}</span><span class="stl">보류</span></div>
          <div class="stbox"><span class="stn" style="color:#ef7373">${counts.todo}</span><span class="stl">미완성</span></div>
        </div>
        <div class="stbar"><i style="width:${mEvents.length?Math.round(counts.done/mEvents.length*100):0}%"></i></div>
        <div class="stnote">이번 달 완성 ${mEvents.length?Math.round(counts.done/mEvents.length*100):0}%</div>
      </div>
    </section>

    <section class="card hov" data-go="schedule">
      <div class="card-h"><span class="hic">${App.ICON.book}</span><h2>새벽 본문</h2><span class="hint">이번 주</span></div>
      <div class="card-b">
        ${verses.length?`<div class="hrows tight">${verses.map(v=>`<div class="hrow">
            <span class="htime">${App.DW[App.dow(v.date)]}</span>
            <span class="hmain"><b>${App.esc(v.passage)}</b></span>
            <span class="hmono dim">${v.date.slice(5).replace('-','/')}</span>
          </div>`).join('')}</div>`
        :`<div class="hempty small">이번 주 본문이 아직 없습니다.<span>일정 탭에서 기록할 수 있습니다.</span></div>`}
      </div>
    </section>

    <section class="card hov car-mini-card span2" data-go="vehicle">
      <div class="card-h"><span class="hic">${App.ICON.car}</span><h2>차량</h2><span class="hint">${dueLabel}</span></div>
      <div class="card-b">
        <div class="car-mini">
          <span class="car-thumb" style="background-image:url('${(carV.image||'assets/carnival.jpg')}')"></span>
          <span class="cmm"><b>${App.esc(carV.name||'내 차량')}${carV.color?' · '+App.esc(carV.color):''}</b><i>${App.esc(carV.model||'차종 미입력')}${carV.roof?' · 루프 캐리어':''}</i></span>
          <span style="text-align:right;flex:0 0 auto">
            <span class="cmv" style="display:block">${App.money(carSum)}원</span>
            <i style="font-size:11.5px;color:${nextDue&&nextDue.dday<=30?'#ff8f8f':'#7b8aa0'};font-style:normal;font-weight:700">${nextDue?'D-'+nextDue.dday:'이번 달'}</i>
          </span>
        </div>
      </div>
    </section>

    <section class="card hov notes-mini span2" data-go="notes">
      <div class="card-h"><span class="hic">${App.ICON.bulb}</span><h2>최근 목회 메모</h2><span class="hint">${noteList.length}개</span></div>
      <div class="card-b">
        ${noteList.length?`<div class="nminis">${noteList.map(n=>`<div class="nmini">
            ${n.fav?'<span class="star-mini">★</span>':''}
            <span class="nt">${App.esc((n.text||'').slice(0,54))}${(n.text||'').length>54?'…':''}</span>
            <span class="nd">${n.theme?App.THEME(n.theme).name:'메모'}</span>
          </div>`).join('')}</div>`
        :`<div class="hempty small">떠오르는 아이디어를 바로 적어 두세요.<span>설교 준비로 보낼 수 있습니다.</span></div>`}
      </div>
    </section>
  </div>
  <div class="home-foot">박재용 목사 · 글로벌비전교회 담임 · GV청소년선교회 대표</div>`;

  el.querySelectorAll('[data-go]').forEach(c=>c.onclick=e=>{
    if(e.target.closest('button,a'))return;
    App.go(c.dataset.go);
  });
}

function ddLabel(k){
  if(!k)return 'D-?';
  const t=App.dateObj(App.todayKey()), d=App.dateObj(k);
  const n=Math.round((d-t)/86400000);
  if(n===0)return 'D-DAY';
  if(n>0)return 'D-'+n;
  return 'D+'+Math.abs(n);
}
