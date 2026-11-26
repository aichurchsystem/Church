/* 캘린더 — 월간 / 주간 타임라인 / 강의 목록, 구글 캘린더 자동 연동 */
let calOpen=null;

function calView(){return App.D.ui.calTab||'month'}
function calSelected(){return App.D.ui.calDate||App.todayKey()}
function eventsOn(dk){
  return App.D.events.filter(e=>App.evDate(e)===dk)
    .sort((a,b)=>(a.start||'').localeCompare(b.start||''));
}
function timed(e){return (e.start||'').length>10}
function mins(t){const s=t.slice(11,16).split(':').map(Number);return s[0]*60+s[1]}
function hhmm(m){const h=Math.floor(m/60),mm=Math.round(m%60);return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`}
function durMin(e){
  if(!timed(e))return 60;
  const a=mins(e.start);
  const b=(e.end&&e.end.length>10)?mins(e.end):a+60;
  return Math.max(30,Math.min(24*60,(b>a?b:a+60)-a));
}
function eventEnd(e){
  if(!timed(e))return '';
  const a=mins(e.start), d=durMin(e);
  return hhmm(a+d);
}
function catBadge(e){const c=App.calCat(e);return `<span class="kbadge" style="--c:${c.color}">${c.name}</span>`}
function nextEventAfterNow(){
  const now=new Date();
  return App.D.events.filter(e=>timed(e)&&new Date(e.start.replace(' ','T'))>now)
    .sort((a,b)=>a.start.localeCompare(b.start))[0]||null;
}
function syncLine(){
  const s=window.GCal&&window.GCal.state;
  if(!s||(!s.last&&!s.err))return `<span class="sync-chip">구글 캘린더 연결 중…</span>`;
  if(s.err)return `<span class="sync-chip err" title="${App.esc(s.err)}">연동 오류 · 다시 시도</span>`;
  const d=new Date(s.last);
  const t=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  return `<span class="sync-chip ok" title="구글 캘린더에서 ${s.count}건을 받았습니다">자동 연동 ${t}</span>`;
}

function renderCalendar(){
  const D=App.D;
  const v=calView();
  const m=D.ui.calMonth||App.todayKey().slice(0,7);
  const el=document.getElementById('sc-calendar');
  const today=App.todayKey();
  const monthEvents=D.events.filter(e=>App.inMonth(App.evDate(e),m));
  const todayEvents=eventsOn(today);
  const wkMon=App.mondayOf(today);
  const weekEvents=D.events.filter(e=>{const d=App.evDate(e);return d>=wkMon&&d<=App.addDays(wkMon,6)});
  const next=nextEventAfterNow();

  el.innerHTML=`
  <div class="cal-top">
    <div class="cal-row1">
      <button class="icon-btn" type="button" data-action="cal-move" data-step="-1" aria-label="이전 달">‹</button>
      <span class="mon">${+m.slice(0,4)}년 ${+m.slice(5,7)}월<span>${monthEvents.length}건</span></span>
      <button class="icon-btn" type="button" data-action="cal-move" data-step="1" aria-label="다음 달">›</button>
      <button class="btn sm ghost" type="button" data-action="cal-today">오늘</button>
      <button class="btn sm primary cal-add" type="button" data-action="ev-add" data-date="${calSelected()}">＋ 일정</button>
    </div>
    <div class="cal-row2">
      <div class="cal-subtabs">
        <button class="chip ${v==='month'?'sel':''}" type="button" data-action="cal-tab" data-view="month">월간</button>
        <button class="chip ${v==='week'?'sel':''}" type="button" data-action="cal-tab" data-view="week">주간</button>
        <button class="chip ${v==='lecture'?'sel':''}" type="button" data-action="cal-tab" data-view="lecture">강의</button>
      </div>
      <div class="cal-sync">${syncLine()}<button class="icon-btn sm" type="button" data-action="gcal-sync" aria-label="구글 캘린더 새로고침">${App.ICON.down}</button></div>
    </div>
  </div>

  <div class="cal-sum2">
    <div class="cs"><span class="l">오늘</span><b>${todayEvents.length}<i>건</i></b></div>
    <div class="cs wide"><span class="l">다음 일정</span><b class="nx">${next?`${mnTime(next.start)} ${App.esc(next.summary.slice(0,16))}${next.summary.length>16?'…':''}`:'없음'}</b><span class="m">${next?mnLeft(next.start):'오늘 일정 없음'}</span></div>
    <div class="cs"><span class="l">이번 주</span><b>${weekEvents.length}<i>건</i></b></div>
  </div>

  ${v==='lecture'?`<div id="lectureList">${lectureList()}</div>`:`<div class="cal-body">
    <div class="cal-main">${v==='month'?monthBlock(m):weekBlock()}</div>
    <div class="cal-daycards">${dayPanel(calSelected())}</div>
  </div>`}
  `;

  el.querySelectorAll('[data-cell]').forEach(c=>c.onclick=()=>{
    D.ui.calDate=c.dataset.cell;App.save();calOpen=null;renderCalendar();
    if(window.innerWidth<980){
      const p=document.querySelector('.cal-daycards');
      if(p&&p.getBoundingClientRect().top>window.innerHeight*0.55)setTimeout(()=>p.scrollIntoView({behavior:'smooth',block:'start'}),50);
    }
  });
  bindDayPanel(el);
  el.querySelectorAll('[data-evcard]').forEach(n=>n.onclick=e=>{
    if(e.target.closest('button,textarea,input'))return;
    calOpen=calOpen===n.dataset.evcard?null:n.dataset.evcard;renderCalendar();
    if(calOpen&&window.innerWidth<980){const o=document.querySelector('.ev.open');if(o)setTimeout(()=>o.scrollIntoView({behavior:'smooth',block:'center'}),60);}
  });
  el.querySelectorAll('[data-lecture]').forEach(n=>n.onclick=()=>lectureEdit(n.dataset.lecture));
}

/* ── 월간 ── */
function monthBlock(m){
  return `<div class="cal-month-wrap">${monthGrid(m)}${legend()}</div>`;
}
function monthGrid(m){
  const first=new Date(+m.slice(0,4),+m.slice(5,7)-1,1);
  const start=App.mondayOf(App.todayKey(first));
  const today=App.todayKey(), sel=calSelected();
  let cells='';
  for(let i=0;i<42;i++){
    const k=App.addDays(start,i);
    const evs=eventsOn(k);
    const dow=App.dow(k);
    const dots=evs.slice(0,3).map(e=>{const c=App.calCat(e);return `<i class="cdot" style="background:${c.color}"></i>`}).join('');
    cells+=`<button class="cell ${App.inMonth(k,m)?'':'out'} ${dow===0?'sun':''} ${dow===6?'sat':''} ${k===today?'today':''} ${k===sel?'sel':''}" type="button" data-cell="${k}" aria-label="${App.fmtDate(k)} ${evs.length}건">
      <span class="dn">${App.dateObj(k).getDate()}</span>
      ${evs.length?`<span class="dots">${dots}${evs.length>3?`<i class="cmore">+${evs.length-3}</i>`:''}</span>`:''}
      ${evs.length&&evs.some(e=>timed(e))?`<span class="cbars">${evs.filter(timed).slice(0,2).map(e=>`<i style="background:${App.calCat(e).color}"></i>`).join('')}</span>`:''}
    </button>`;
  }
  return `<div class="cal">
    <div class="cal-wd">${['월','화','수','목','금','토','일'].map((d,i)=>`<div class="${i===5?'sat':i===6?'sun':''}">${d}</div>`).join('')}</div>
    <div class="cal-grid">${cells}</div>
  </div>`;
}
function legend(){
  return `<div class="cal-legend">
    ${App.CALCATS.map(c=>`<i><b style="background:${c.color}"></b>${c.name}</i>`).join('')}
  </div>`;
}

/* ── 주간 타임라인 ── */
function weekBlock(){
  const base=App.D.ui.calWeek||App.mondayOf(App.todayKey());
  const days=[];for(let i=0;i<7;i++)days.push(App.addDays(base,i));
  const sel=calSelected();
  const selDay=days.includes(sel)?sel:(days.includes(App.todayKey())?App.todayKey():days[0]);
  // 보이는 시간대 — 폰에서는 그 날 일정에 맞춰 좁게, 넓은 화면에서는 그 주 전체
  const wide=(window.innerWidth||390)>=760;
  const basis=wide?days:[selDay];
  let lo=24,hi=0,any=false;
  basis.forEach(k=>eventsOn(k).filter(timed).forEach(e=>{
    any=true;
    lo=Math.min(lo,mins(e.start)/60);
    hi=Math.max(hi,(mins(e.start)+durMin(e))/60);
  }));
  if(!any){lo=9;hi=15}
  else{lo=Math.max(5,Math.floor(lo)-1);hi=Math.min(23,Math.ceil(hi)+1)}
  if(hi-lo<4)hi=Math.min(23,lo+4);
  if(hi-lo>11)hi=lo+11;
  const H=42,total=(hi-lo)*H;
  const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  const nowTop=(nowMin-lo*60)/60*H;
  const labels=[];for(let h=lo;h<=hi;h++)labels.push(`<span style="top:${(h-lo)*H}px">${String(h).padStart(2,'0')}</span>`);
  const cols=days.map(k=>{
    const evs=eventsOn(k).filter(timed);
    const groups=[];
    evs.forEach(e=>{
      const a=mins(e.start),b=a+durMin(e);
      const g=groups.find(g=>g.some(x=>a<mins(x.start)+durMin(x)&&b>mins(x.start)));
      if(g)g.push(e);else groups.push([e]);
    });
    const pos=new Map();
    groups.forEach(g=>g.sort((x,y)=>x.start.localeCompare(y.start)).forEach((e,i)=>pos.set(e,{i,n:g.length})));
    return `<div class="wk-col ${k===selDay?'sel':''} ${k===App.todayKey()?'today':''}" data-cell="${k}">
      <div class="tl-in" style="height:${total}px">
        ${evs.map(e=>{
          const p=pos.get(e)||{i:0,n:1};
          const top=Math.max(0,(mins(e.start)-lo*60)/60*H);
          const h=Math.max(26,durMin(e)/60*H);
          const c=App.calCat(e);
          const w=100/p.n-3;
          return `<button class="tev" type="button" data-evcard-on="${e.id}" style="--c:${c.color};top:${top}px;height:${h}px;left:${p.i*(100/p.n)+1}%;width:${w}%">
            <b>${App.esc(e.summary)}</b><i>${mnTime(e.start)}–${eventEnd(e)}${e.location?' · '+App.esc(e.location.slice(0,16)):''}</i>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
  const allDay=days.map(k=>{
    const ads=eventsOn(k).filter(e=>!timed(e));
    return `<div class="ad-col ${k===selDay?'sel':''}">${ads.map(e=>`<button class="wad" type="button" data-evcard-on="${e.id}" style="--c:${App.calCat(e).color}">${App.esc(e.summary.slice(0,16))}</button>`).join('')}</div>`;
  }).join('');
  const hasAd=days.some(k=>eventsOn(k).some(e=>!timed(e)));
  return `<div class="wk">
    <div class="wk-top">
      <button class="icon-btn" type="button" data-action="cal-weekmove" data-step="-1" aria-label="이전 주">‹</button>
      <b>${App.fmtDate(days[0])} – ${App.fmtDate(days[6])}</b>
      <button class="icon-btn" type="button" data-action="cal-weekmove" data-step="1" aria-label="다음 주">›</button>
      <button class="btn sm ghost" type="button" data-action="cal-day" data-date="${App.todayKey()}">이번 주</button>
    </div>
    <div class="wk-days">
      ${days.map(k=>{const c=eventsOn(k).length;return `<button class="wk-d ${k===selDay?'sel':''} ${k===App.todayKey()?'today':''} ${App.dow(k)===0?'sun':''}" type="button" data-action="cal-day" data-date="${k}">
        <span>${App.DW[App.dow(k)]}</span><b>${App.dateObj(k).getDate()}</b><i class="${c?'has':''}">${c||''}</i></button>`}).join('')}
    </div>
    ${hasAd?`<div class="wk-ad"><span class="ad-lb">종일</span><div class="ad-cols">${allDay}</div></div>`:''}
    <div class="tl" style="--H:${H}px">
      <div class="tl-labels" style="height:${total}px">${labels.join('')}</div>
      <div class="tl-cols" data-date="${selDay}">${cols}</div>
      ${selDay===App.todayKey()&&nowTop>0&&nowTop<total?`<div class="tl-now" style="top:${nowTop+8}px"></div>`:''}
    </div>
    <div class="tl-hint">${App.fmtDate(selDay)} ${App.DW[App.dow(selDay)]}요일 · ${eventsOn(selDay).length}건 · ${String(lo).padStart(2,'0')}시~${String(hi).padStart(2,'0')}시</div>
  </div>`;
}

/* ── 날짜별 카드 ── */
function dayPanel(dk){
  const evs=eventsOn(dk);
  const d=App.dateObj(dk);
  return `<div class="dp">
    <div class="dp-h">
      <span class="dt">${d.getMonth()+1}월 ${d.getDate()}일</span>
      <span class="dw">${App.DW[d.getDay()]}요일</span>
      <span class="n">${evs.length}건</span>
      <button class="btn sm ghost" type="button" data-action="ev-add" data-date="${dk}">＋ 추가</button>
    </div>
    ${evs.length?evs.map(e=>{
      const open=calOpen===e.id, c=App.calCat(e), st=App.STATUS[e.status||'plan'];
      return `<div class="ev ${open?'open':''}" data-evcard="${e.id}" style="--c:${c.color}">
        <div class="ev-h">
          <span class="ev-t">${timed(e)?`<b>${mnTime(e.start)}</b><i>${eventEnd(e)}</i>`:'<b class="ad">종일</b>'}</span>
          <span class="ei">
            <span class="et">${App.esc(e.summary)}</span>
            <span class="em">${catBadge(e)}${e.location?`<i>· ${App.esc(e.location.slice(0,30))}</i>`:''}</span>
          </span>
          <span class="chev">${App.ICON.chev}</span>
        </div>
        ${open?`<div class="ev-b">
          <div class="status-pick">${Object.entries(App.STATUS).map(([k,s])=>`<button class="chip ${(e.status||'plan')===k?'st-'+k:''}" type="button" data-action="ev-status" data-set="${e.id}|${k}" style="${(e.status||'plan')===k?'':'color:'+s.color}"><span class="pt"></span>${s.label}</button>`).join('')}</div>
          ${e.location?`<div class="lbl mt8">장소</div><div class="desc">${App.esc(e.location)}</div>`:''}
          ${e.desc?`<div class="lbl mt8">설명</div><div class="desc clamp">${App.nl(e.desc)}</div>`:''}
          <div class="lbl mt8">메모</div>
          <textarea data-action="ev-note" data-ev="${e.id}" placeholder="이 일정에 대한 메모" style="min-height:56px;font-size:13.5px">${App.esc(e.note||'')}</textarea>
          <div class="acts">
            <button class="btn sm primary" type="button" data-action="ev-tojournal" data-ev="${e.id}">일지에 기록</button>
            <button class="btn sm" type="button" data-action="ev-edit" data-ev="${e.id}">수정</button>
          </div>
        </div>`:''}
      </div>`}).join('')
    :`<div class="dp-none"><b>이 날은 일정이 없습니다</b><span>＋ 추가로 직접 넣거나, 구글 캘린더에 넣으면 자동으로 들어옵니다.</span></div>`}
    ${(function(){const fs=App.foodOn?App.foodOn(dk):[];return fs.length?`<div class="dp-food"><div class="dp-food-h">🍽 이 날 다녀온 맛집</div>${fs.map(r=>`<button class="dp-food-i" type="button" data-action="food-open" data-food="${r.id}"><b>${App.esc(r.name)}</b><span>${App.esc([r.region,r.menu].filter(Boolean).join(' · '))}</span></button>`).join('')}</div>`:''})()}
  </div>`;
}
function bindDayPanel(el){
  // 상세 카드의 시간/장소는 카드 전체 클릭으로 열고 닫는다 (위임 리스너가 나머지를 처리)
  el.querySelectorAll('.tev,[data-evcard-on]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();
    const id=b.dataset.evcardOn;
    App.D.ui.calDate=App.evDate(App.D.events.find(x=>x.id===id)||{start:calSelected()});
    calOpen=id;App.save();renderCalendar();
  });
  el.querySelectorAll('[data-action="ev-note"]').forEach(t=>{
    t.onclick=e=>e.stopPropagation();
  });
}

/* ── 일지로 ── */
function eventToJournal(id){
  const ev=App.D.events.find(x=>x.id===id);if(!ev)return;
  const dk=App.evDate(ev);
  const cat=/강의|특강|교육|세미나|강연|포럼/.test(ev.summary)?'lecture':/선교/.test(ev.summary)?'mission':'church';
  App.D.journal.push({id:App.uid('j'),date:dk,time:timed(ev)?mnTime(ev.start):'',
    title:ev.summary,place:ev.location||'',amount:0,cat,status:'done',note:ev.note||'',by:''});
  ev.status='done';
  App.save();renderCalendar();
  App.toast('오늘 일지에 기록했습니다');
}

/* ── 일정 편집 ── */
function eventEdit(id,date){
  const D=App.D;
  const e=id?D.events.find(x=>x.id===id):{id:'',uid:'',start:(date||App.todayKey())+'T09:00:00',end:'',summary:'',location:'',desc:'',status:'plan',note:'',lecture:false,org:'',audience:'',fee:''};
  if(!e)return;
  const dk=App.evDate(e), tm=timed(e)?e.start.slice(11,16):'';
  App.sheet({
    title:id?'일정 수정':'일정 추가',
    body:`<label class="fld"><span>일정 이름</span><input id="eSum" value="${App.esc(e.summary)}" placeholder="예: 노회 월례회"></label>
      <div class="row2">
        <label class="fld"><span>날짜</span><input id="eDate" type="date" value="${dk}"></label>
        <label class="fld"><span>시간 (비우면 종일)</span><input id="eTime" type="time" value="${tm}"></label>
      </div>
      <label class="fld"><span>장소</span><input id="eLoc" value="${App.esc(e.location)}"></label>
      <label class="fld"><span>설명</span><textarea id="eDesc">${App.esc(e.desc)}</textarea></label>
      <label class="fld"><span>상태</span><div class="chips" id="eStat">${Object.entries(App.STATUS).map(([k,s])=>`<button class="chip ${(e.status||'plan')===k?'st-'+k:''}" type="button" data-st="${k}" style="${(e.status||'plan')===k?'':'color:'+s.color}"><span class="pt"></span>${s.label}</button>`).join('')}</div></label>
      <label class="fld"><span>강의로 표시</span><div class="chips"><button class="chip ${e.lecture?'sel':''}" type="button" id="eLec"><span class="pt"></span>강의·특강·교육</button></div></label>
      <div id="lecFields" style="display:${e.lecture?'block':'none'}">
        <div class="row2">
          <label class="fld"><span>기관</span><input id="eOrg" value="${App.esc(e.org)}"></label>
          <label class="fld"><span>대상</span><input id="eAud" value="${App.esc(e.audience)}"></label>
        </div>
        <label class="fld"><span>강사료</span><input id="eFee" value="${App.esc(e.fee)}" placeholder="예: 30만원"></label>
      </div>`,
    footer:`${id?'<button class="btn danger" data-del>삭제</button>':''}<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  let st=e.status||'plan', lec=!!e.lecture;
  document.querySelectorAll('#eStat [data-st]').forEach(b=>b.onclick=()=>{
    st=b.dataset.st;
    document.querySelectorAll('#eStat [data-st]').forEach(x=>{x.className='chip';x.style.color=App.STATUS[x.dataset.st].color});
    b.className='chip st-'+st;b.style.color='';
  });
  const lb=document.getElementById('eLec');
  lb.onclick=()=>{lec=!lec;lb.classList.toggle('sel',lec);document.getElementById('lecFields').style.display=lec?'block':'none'};
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    const sum=document.getElementById('eSum').value.trim();
    if(!sum){App.toast('일정 이름을 적어 주세요');return}
    const d=document.getElementById('eDate').value, t=document.getElementById('eTime').value;
    const rec={summary:sum,start:d+(t?'T'+t+':00':'T00:00:00'),end:'',
      location:document.getElementById('eLoc').value.trim(),
      desc:document.getElementById('eDesc').value.trim(),status:st,lecture:lec,
      org:document.getElementById('eOrg')?document.getElementById('eOrg').value.trim():'',
      audience:document.getElementById('eAud')?document.getElementById('eAud').value.trim():'',
      fee:document.getElementById('eFee')?document.getElementById('eFee').value.trim():''};
    if(id)Object.assign(e,rec);
    else D.events.push(Object.assign({id:App.uid('ev'),uid:'local-'+Date.now(),note:'',src:'local'},rec));
    App.save();App.closeSheet();D.ui.calDate=d;App.save();renderCalendar();App.toast('저장했습니다');
  };
  const del=document.querySelector('[data-del]');
  if(del)del.onclick=async()=>{
    if(await App.ask('이 일정을 지울까요? 구글 캘린더에는 영향이 없습니다.','삭제')){
      D.events=D.events.filter(x=>x.id!==id);App.save();App.closeSheet();renderCalendar();
    }
  };
}

/* ── 강의 목록 ── */
function lectureList(){
  const lecs=App.D.events.filter(App.lectureLike).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  if(!lecs.length)return `<div class="card"><div class="card-b">${App.empty('강의 기록이 없습니다','캘린더 일정에 <b>강의로 표시</b>를 켜면 이곳에 월별로 모입니다.')}</div></div>`;
  const groups={};
  lecs.forEach(e=>{const k=App.evDate(e).slice(0,7);(groups[k]=groups[k]||[]).push(e)});
  return Object.keys(groups).sort().map(k=>`
    <div class="sec-title" style="margin-top:${k===Object.keys(groups)[0]?'0':'18px'}">${+k.slice(0,4)}년 ${+k.slice(5,7)}월
      <span class="count">${groups[k].length}건 · 강사료 ${App.money(groups[k].reduce((a,e)=>a+(parseInt(String(e.fee).replace(/[^\d]/g,''))||0),0))}원</span></div>
    <div class="lec-grid">
      ${groups[k].map(e=>{
        const st=App.STATUS[e.status||'plan'];
        return `<article class="lec" data-lecture="${e.id}" style="--c:${st.color}">
          <div class="lec-h">
            <span class="lec-d">${App.fmtDate(App.evDate(e))} <i>${App.DW[App.dow(App.evDate(e))]}</i></span>
            <span class="chip st-${e.status||'plan'}"><span class="pt"></span>${st.label}</span>
          </div>
          <div class="lec-t">${App.esc(e.summary)}</div>
          <div class="lec-m">
            <span><b>시간</b> ${timed(e)?mnTime(e.start):'종일'}</span>
            <span><b>장소</b> ${App.esc(e.location||'—')}</span>
            <span><b>기관</b> ${App.esc(e.org||'미입력')}</span>
            <span><b>대상</b> ${App.esc(e.audience||'미입력')}</span>
            <span><b>강사료</b> ${App.esc(e.fee||'미입력')}</span>
          </div>
        </article>`}).join('')}
    </div>`).join('');
}

function lectureEdit(id){
  const e=App.D.events.find(x=>x.id===id);if(!e)return;
  App.sheet({
    title:'강의 정보',
    body:`<p class="muted" style="margin:0 0 10px">${App.esc(e.summary)} · ${App.fmtDate(App.evDate(e))}</p>
      <div class="row2">
        <label class="fld"><span>기관</span><input id="lOrg" value="${App.esc(e.org)}" placeholder="예: 정명고등학교"></label>
        <label class="fld"><span>대상</span><input id="lAud" value="${App.esc(e.audience)}" placeholder="예: 고3 200명"></label>
      </div>
      <div class="row2">
        <label class="fld"><span>강사료</span><input id="lFee" value="${App.esc(e.fee)}" placeholder="예: 30만원"></label>
        <label class="fld"><span>상태</span><select id="lStat">${Object.entries(App.STATUS).map(([k,s])=>`<option value="${k}" ${(e.status||'plan')===k?'selected':''}>${s.label}</option>`).join('')}</select></label>
      </div>
      <label class="fld"><span>메모</span><textarea id="lNote">${App.esc(e.note)}</textarea></label>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    Object.assign(e,{org:document.getElementById('lOrg').value.trim(),audience:document.getElementById('lAud').value.trim(),
      fee:document.getElementById('lFee').value.trim(),status:document.getElementById('lStat').value,
      note:document.getElementById('lNote').value.trim()});
    App.save();App.closeSheet();renderCalendar();App.toast('저장했습니다');
  };
}

/* ── ICS 가져오기(수동 보조 수단) ── */
function openIcs(){
  App.sheet({
    title:'ICS 파일로 가져오기',
    body:`<p class="muted" style="margin:0 0 10px">보통은 구글 캘린더와 자동으로 맞춰집니다. 다른 캘린더의 <b style="color:#a9b7ca">.ics</b> 파일만 따로 넣고 싶을 때 쓰세요. 같은 일정(UID)은 두 번 들어가지 않습니다.</p>
      <input type="file" id="icsFile" accept=".ics,text/calendar" style="padding:8px;font-size:13px">
      <textarea id="icsText" style="min-height:120px;margin-top:8px;font-size:12.5px" placeholder="BEGIN:VCALENDAR … END:VCALENDAR"></textarea>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-save>가져오기</button>`
  });
  const file=document.getElementById('icsFile');
  file.onchange=()=>{const f=file.files[0];if(!f)return;const r=new FileReader();
    r.onload=()=>{document.getElementById('icsText').value=r.result};r.readAsText(f)};
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    const text=document.getElementById('icsText').value;
    if(!text.trim()){App.toast('ICS 내용이 없습니다');return}
    const res=importICS(text);
    App.closeSheet();
    App.toast(res.added?`${res.added}건을 가져왔습니다${res.dup?` (중복 ${res.dup}건 건너뜀)`:''}`:(res.dup?'이미 모두 들어 있는 일정입니다':'읽을 수 있는 일정이 없습니다'));
    renderCalendar();
  };
}
function unescICal(s){
  return String(s||'').replace(/\\n/gi,'\n').replace(/\\,/g,',').replace(/\\;/g,';').replace(/\\\\/g,'\\').trim();
}
function icsDate(key,val){
  val=val.trim();
  if(/^\d{8}$/.test(val))return `${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}`;
  const m=val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if(!m)return val.slice(0,10);
  if(m[7]){
    const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)));
    const p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
  }
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`;
}
function parseICS(text){
  const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').replace(/\n[ \t]/g,'').split('\n');
  const out=[];let cur=null;
  for(const ln of lines){
    if(/^BEGIN:VEVENT/i.test(ln)){cur={};continue}
    if(/^END:VEVENT/i.test(ln)){if(cur)out.push(cur);cur=null;continue}
    if(!cur)continue;
    const i=ln.indexOf(':');if(i<0)continue;
    const key=ln.slice(0,i), val=ln.slice(i+1);
    const name=key.split(';')[0].toUpperCase();
    if(name==='UID')cur.uid=val.trim();
    else if(name==='SUMMARY')cur.summary=unescICal(val);
    else if(name==='LOCATION')cur.location=unescICal(val);
    else if(name==='DESCRIPTION')cur.desc=unescICal(val);
    else if(name==='DTSTART')cur.start=icsDate(key,val);
    else if(name==='DTEND')cur.end=icsDate(key,val);
  }
  return out.filter(v=>v.summary&&v.start);
}
function importICS(text){
  const list=parseICS(text);
  let added=0,dup=0;
  const known=new Set(App.D.events.map(e=>e.uid).filter(Boolean));
  const knownKey=new Set(App.D.events.map(e=>(e.summary||'').trim()+'|'+App.evDate(e)));
  list.forEach(v=>{
    const uid=v.uid||('ics-'+Math.abs(hash(v.summary+v.start)));
    const key=(v.summary||'').trim()+'|'+v.start.slice(0,10);
    if(known.has(uid)||knownKey.has(key)){dup++;return}
    known.add(uid);knownKey.add(key);
    App.D.events.push({id:App.uid('ev'),uid,src:'ics',start:v.start,end:v.end||v.start,summary:v.summary,
      location:v.location||'',desc:v.desc||'',status:'plan',note:'',lecture:false,org:'',audience:'',fee:''});
    added++;
  });
  if(added)App.save();
  return {added,dup};
}
function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0}return h}
