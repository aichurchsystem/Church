/* 캘린더 */
let calOpen=null;

function renderCalendar(){
  const D=App.D;
  const m=D.ui.calMonth||App.todayKey().slice(0,7);
  const tab=D.ui.calTab||'month';
  const monthName=`${+m.slice(0,4)}년 ${+m.slice(5,7)}월`;
  const el=document.getElementById('sc-calendar');
  const mEvents=D.events.filter(e=>App.inMonth(App.evDate(e),m));
  const counts={done:0,hold:0,todo:0,plan:0};
  mEvents.forEach(e=>counts[e.status||'plan']++);

  el.innerHTML=`
  <div class="cal-top">
    <div class="cal-row1">
      <button class="icon-btn" data-mv="-1" aria-label="이전 달">‹</button>
      <span class="mon">${monthName}<span>${mEvents.length}건</span></span>
      <button class="icon-btn" data-mv="1" aria-label="다음 달">›</button>
      <button class="btn sm ghost" data-mtoday>오늘</button>
    </div>
    <div class="cal-row2">
      <div class="cal-subtabs">
        <button class="chip ${tab==='month'?'sel':''}" data-caltab="month">월간 달력</button>
        <button class="chip ${tab==='lecture'?'sel':''}" data-caltab="lecture">강의 목록</button>
      </div>
      <div class="cal-acts">
        <button class="btn sm" data-ics>${App.ICON.down} ICS</button>
        <button class="btn sm primary" data-evadd>${App.ICON.plus} 일정</button>
      </div>
    </div>
  </div>
  ${tab==='month'?`
    <div class="cal-sum">
      <span class="pill"><i class="pt" style="background:#57ce93"></i>완성 <b>${counts.done}</b></span>
      <span class="pill"><i class="pt" style="background:#e8b04b"></i>보류 <b>${counts.hold}</b></span>
      <span class="pill"><i class="pt" style="background:#ef7373"></i>미완성 <b>${counts.todo}</b></span>
      <span class="pill"><i class="pt" style="background:#82a9e6"></i>예정 <b>${counts.plan}</b></span>
      <span class="pill">강의 <b>${mEvents.filter(App.lectureLike).length}</b></span>
    </div>
    <div class="split wide">
      <div>${monthGrid(m)}${legend()}</div>
      <div class="day-panel card sticky" id="dayPanel">${dayPanel(D.ui.calDate)}</div>
    </div>`
  :`<div id="lectureList">${lectureList()}</div>`}
  `;

  el.querySelectorAll('[data-caltab]').forEach(b=>b.onclick=()=>{D.ui.calTab=b.dataset.caltab;App.save();renderCalendar()});
  el.querySelectorAll('[data-mv]').forEach(b=>b.onclick=()=>{
    const [y,mm]=m.split('-').map(Number);const dt=new Date(y,mm-1+ +b.dataset.mv,1);
    D.ui.calMonth=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;App.save();renderCalendar();
  });
  const mt=el.querySelector('[data-mtoday]');
  if(mt)mt.onclick=()=>{D.ui.calMonth=App.todayKey().slice(0,7);D.ui.calDate=App.todayKey();App.save();renderCalendar()};
  el.querySelector('[data-ics]').onclick=openIcs;
  el.querySelector('[data-evadd]').onclick=()=>eventEdit(null,D.ui.calDate);

  el.querySelectorAll('[data-cell]').forEach(c=>c.onclick=()=>{
    D.ui.calDate=c.dataset.cell;App.save();calOpen=null;renderCalendar();
    if(window.innerWidth<880){
      const p=document.getElementById('dayPanel');
      if(p)setTimeout(()=>p.scrollIntoView({behavior:'smooth',block:'center'}),40);
    }
  });
  bindDayPanel(el);
  el.querySelectorAll('[data-evcard]').forEach(n=>n.onclick=e=>{
    if(e.target.closest('button,textarea,input'))return;
    calOpen=calOpen===n.dataset.evcard?null:n.dataset.evcard;
    renderCalendar();
  });
  el.querySelectorAll('[data-lecture]').forEach(n=>n.onclick=()=>lectureEdit(n.dataset.lecture));
}

function monthGrid(m){
  const [y,mm]=m.split('-').map(Number);
  const first=new Date(y,mm-1,1);
  const startMonday=App.mondayOf(App.todayKey(first));
  const cells=[];
  for(let i=0;i<42;i++){
    const k=App.addDays(startMonday,i);
    cells.push(k);
  }
  const today=App.todayKey();
  return `<div class="cal">
    <div class="cal-wd">${['월','화','수','목','금','토','일'].map(d=>`<div>${d}</div>`).join('')}</div>
    <div class="cal-grid">
      ${cells.map(k=>{
        const inM=App.inMonth(k,m);
        const dow=App.dow(k);
        const evs=App.D.events.filter(e=>App.evDate(e)===k).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
        const shown=evs.slice(0,3);
        const foods=App.foodOn(k);
        return `<button class="cell ${inM?'':'out'} ${dow===0||dow===6?'we':''} ${k===today?'today':''} ${k===App.D.ui.calDate?'sel':''}" data-cell="${k}">
          <span class="dn">${App.dateObj(k).getDate()}</span>
          <span class="minis">
            ${shown.map(e=>`<span class="mini" style="--c:${(App.STATUS[e.status||'plan']).color}" title="${App.esc(e.summary)}"><i class="bar"></i><span>${App.esc(e.summary)}</span></span>`).join('')}
            ${evs.length>3?`<span class="more">+${evs.length-3}</span>`:''}
          </span>
          ${foods.length?`<span class="food-mark ${foods.every(f=>App.foodType(f)==='숙소')?'stay':''}" title="다녀온 곳 ${foods.length}곳 · ${foods.map(f=>f.name).join(', ')}"></span>`:''}
        </button>`}).join('')}
    </div>
  </div>`;
}

function legend(){
  return `<div class="cal-legend">
    ${Object.entries(App.STATUS).map(([k,s])=>`<i><b style="background:${s.color}"></b>${s.label}</i>`).join('')}
    <i style="margin-left:auto;opacity:.8">일정을 누르면 상태를 바꿀 수 있습니다</i>
  </div>`;
}

function dayPanel(dk){
  const evs=App.D.events.filter(e=>App.evDate(e)===dk).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  const d=App.dateObj(dk);
  const wk=['일','월','화','수','목','금','토'][d.getDay()];
  return `<div class="dp-h">
      <span class="dt">${d.getMonth()+1}월 ${d.getDate()}일</span><span class="dw">${wk}요일</span>
      <span class="n">${evs.length}건</span>
    </div>
    ${evs.length?evs.map(e=>{
      const st=App.STATUS[e.status||'plan'];
      const open=calOpen===e.id;
      return `<div class="ev ${open?'open':''}" data-evcard="${e.id}" style="--c:${st.color}">
        <div class="ev-h">
          <span class="stripe"></span>
          <span class="ei">
            <span class="et">${App.esc(e.summary)}</span>
            <span class="em"><i>${App.evTime(e)}</i>${e.location?`<i>· ${App.esc(e.location)}</i>`:''}${open?'':`<i>· ${st.label}</i>`}</span>
          </span>
          <span class="chev">${App.ICON.chev}</span>
        </div>
        ${open?`<div class="ev-b">
          <div class="status-pick">${Object.entries(App.STATUS).map(([k,s])=>`<button class="chip ${(e.status||'plan')===k?'st-'+k:''}" data-setstatus="${e.id}|${k}" style="${(e.status||'plan')===k?'':'color:'+s.color}"><span class="pt"></span>${s.label}</button>`).join('')}</div>
          ${e.location?`<div class="lbl mt8">장소</div><div class="desc">${App.esc(e.location)}</div>`:''}
          ${e.desc?`<div class="lbl mt8">설명</div><div class="desc">${App.nl(e.desc)}</div>`:''}
          ${e.lecture?`<div class="lbl mt8">강의 정보</div><div class="desc">${[e.org?'기관 '+e.org:'',e.audience?'대상 '+e.audience:'',e.fee?'강사료 '+e.fee:''].filter(Boolean).map(App.esc).join(' · ')||'강의로 표시됨'}</div>`:''}
          <div class="lbl mt8">메모</div>
          <textarea data-note="${e.id}" placeholder="이 일정에 대한 메모" style="min-height:58px;font-size:13.5px">${App.esc(e.note||'')}</textarea>
          <div class="acts">
            <button class="btn sm primary" data-tojournal="${e.id}">일지에 기록</button>
            <button class="btn sm" data-evedit="${e.id}">수정</button>
          </div>
        </div>`:''}
      </div>`}).join('')
    :`<div class="empty small">이 날은 일정이 없습니다.<span>＋ 일정으로 직접 추가하거나 ICS로 가져올 수 있습니다.</span></div>`}
    <button class="btn sm ghost mt8" style="width:100%" data-evadd-day="${dk}">＋ 이 날에 일정 추가</button>
    ${(function(){const fs=App.foodOn(dk);return fs.length?`<div class="dp-food"><div class="dp-food-h">🍽 이 날 다녀온 맛집</div>${fs.map(r=>`<button class="dp-food-i" data-food="${r.id}"><b>${App.esc(r.name)}</b><span>${App.esc([r.region,r.menu].filter(Boolean).join(' · '))}</span></button>`).join('')}</div>`:''})()}`;
}

function bindDayPanel(el){
  el.querySelectorAll('[data-setstatus]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();
    const [id,st]=b.dataset.setstatus.split('|');
    const ev=App.D.events.find(x=>x.id===id);if(!ev)return;
    ev.status=st;App.save();renderCalendar();App.toast(App.STATUS[st].label+'으로 바꿨습니다');
  });
  el.querySelectorAll('[data-note]').forEach(t=>{
    t.onclick=e=>e.stopPropagation();
    t.onchange=()=>{const ev=App.D.events.find(x=>x.id===t.dataset.note);if(ev){ev.note=t.value;App.save();App.toast('메모를 저장했습니다')}};
  });
  el.querySelectorAll('[data-evedit]').forEach(b=>b.onclick=e=>{e.stopPropagation();eventEdit(b.dataset.evedit)});
  el.querySelectorAll('[data-tojournal]').forEach(b=>b.onclick=e=>{e.stopPropagation();eventToJournal(b.dataset.tojournal)});
  el.querySelectorAll('[data-evadd-day]').forEach(b=>b.onclick=e=>{e.stopPropagation();eventEdit(null,b.dataset.evaddDay)});
  el.querySelectorAll('[data-food]').forEach(b=>b.onclick=e=>{e.stopPropagation();App.go('food');setTimeout(()=>foodDetail(b.dataset.food),120)});
}

function eventToJournal(id){
  const ev=App.D.events.find(x=>x.id===id);if(!ev)return;
  const dk=App.evDate(ev);
  const cat=/강의|특강|교육|세미나|강연|포럼/.test(ev.summary)?'lecture':/선교/.test(ev.summary)?'mission':'church';
  App.D.journal.push({id:App.uid('j'),date:dk,time:App.evTime(ev)==='종일'?'':App.evTime(ev),
    title:ev.summary,place:ev.location||'',amount:0,cat,status:'done',note:ev.note||'',by:''});
  ev.status='done';
  App.save();renderCalendar();
  App.toast('일지에 기록했습니다');
}

function eventEdit(id,date){
  const D=App.D;
  const e=id?D.events.find(x=>x.id===id):{id:'',uid:'',start:(date||App.todayKey())+'T09:00:00',end:'',summary:'',location:'',desc:'',status:'plan',note:'',lecture:false,org:'',audience:'',fee:''};
  if(!e)return;
  const dk=App.evDate(e), tm=e.start&&e.start.length>10?e.start.slice(11,16):'';
  App.sheet({
    title:id?'일정 수정':'일정 추가',
    body:`<label class="fld"><span>일정 이름</span><input id="eSum" value="${App.esc(e.summary)}" placeholder="예: 노회 월례회"></label>
      <div class="row2">
        <label class="fld"><span>날짜</span><input id="eDate" type="date" value="${dk}"></label>
        <label class="fld"><span>시간 (비우면 종일)</span><input id="eTime" type="time" value="${tm}"></label>
      </div>
      <label class="fld"><span>장소</span><input id="eLoc" value="${App.esc(e.location)}"></label>
      <label class="fld"><span>설명</span><textarea id="eDesc">${App.esc(e.desc)}</textarea></label>
      <label class="fld"><span>상태</span><div class="chips" id="eStat">${Object.entries(App.STATUS).map(([k,s])=>`<button class="chip ${(e.status||'plan')===k?'st-'+k:''}" data-st="${k}" style="${(e.status||'plan')===k?'':'color:'+s.color}"><span class="pt"></span>${s.label}</button>`).join('')}</div></label>
      <label class="fld"><span>강의로 표시</span><div class="chips"><button class="chip ${e.lecture?'sel':''}" id="eLec"><span class="pt"></span>강의·특강·교육</button></div></label>
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
    const rec={summary:sum,start:d+(t?'T'+t+':00':'T00:00:00'),end:'',location:document.getElementById('eLoc').value.trim(),
      desc:document.getElementById('eDesc').value.trim(),status:st,lecture:lec,
      org:document.getElementById('eOrg').value.trim(),audience:document.getElementById('eAud').value.trim(),fee:document.getElementById('eFee').value.trim()};
    if(id)Object.assign(e,rec);
    else D.events.push(Object.assign({id:App.uid('ev'),uid:'local-'+Date.now(),note:''},rec));
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
            <span><b>시간</b> ${App.evTime(e)}${e.start&&e.start.length>10?'':' (종일)'}</span>
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

/* ── ICS 가져오기 ── */
function openIcs(){
  App.sheet({
    title:'캘린더에서 새로 가져오기',
    body:`<p class="muted" style="margin:0 0 10px">구글 캘린더에서 내보낸 <b style="color:#a9b7ca">.ics</b> 파일을 올리거나, 내용을 붙여넣으세요. 같은 일정(UID)은 두 번 들어가지 않습니다.</p>
      <input type="file" id="icsFile" accept=".ics,text/calendar" style="padding:8px;font-size:13px">
      <textarea id="icsText" style="min-height:130px;margin-top:8px;font-size:12.5px" placeholder="BEGIN:VCALENDAR … END:VCALENDAR"></textarea>
      <p class="muted" style="margin:8px 0 0">구글 캘린더 앱 → 설정 → 캘린더 내보내기 로 .ics를 받을 수 있습니다.</p>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-save>가져오기</button>`
  });
  const file=document.getElementById('icsFile');
  file.onchange=()=>{
    const f=file.files[0];if(!f)return;
    const r=new FileReader();r.onload=()=>{document.getElementById('icsText').value=r.result};
    r.readAsText(f);
  };
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
    App.D.events.push({id:App.uid('ev'),uid,start:v.start,end:v.end||v.start,summary:v.summary,
      location:v.location||'',desc:v.desc||'',status:'plan',note:'',lecture:false,org:'',audience:'',fee:''});
    added++;
  });
  if(added)App.save();
  return {added,dup};
}
function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0}return h}
