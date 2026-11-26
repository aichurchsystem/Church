/* 스케줄 — 앞으로의 일정 (2026-11-26 목사님 지시)
   · 캘린더 탭을 없애고 그 역할을 이 화면이 맡는다: 날짜 띠·작은 월간 달력·구글 캘린더 동기화.
   · 예배(새벽·주일·수요·금요·줌 등)는 이 화면에 넣지 않는다 — 일지에는 그대로 남는다.
   · 지난 일정은 기본으로 감추고, 필요할 때만 펼친다.
   · 일정은 노회·총회·교회·상담 챕터로 묶어 보여 준다(분류는 App.chapterOf). */

/* 예배·기도회 성격 — 스케줄표에서 뺀다 (일지 자동 채움에는 그대로 들어간다) */
function schIsWorship(e){
  const s=((e&&e.summary)||'')+' '+((e&&e.location)||'');
  return /예배|기도회|기도\s*모임|새벽|성찬|축도|찬양|주일\s*(낮|저녁)?\s*예배/.test(s);
}
function schEvents(dk){
  return (App.D.events||[]).filter(e=>App.evDate(e)===dk&&!schIsWorship(e))
    .sort((a,b)=>(a.start||'').localeCompare(b.start||''));
}
function schChapterFilter(){return App.D.ui.schCh||'all'}
function schPass(e){
  const f=schChapterFilter();
  if(f==='all')return true;
  return (App.chapterOf(e)||'other')===f;
}
function schDayCount(dk){return schEvents(dk).filter(schPass).length}

function renderSchedule(){
  const D=App.D;
  const today=App.todayKey();
  const dk=D.ui.calDate||today;
  const mth=(D.ui.calMonth||dk.slice(0,7));
  const wkMon=App.mondayOf(dk);
  const days=[0,1,2,3,4,5,6].map(i=>App.addDays(wkMon,i));
  const ch=D.ui.chapter||'presby';
  const past=!!D.ui.schPast;
  const limit=D.ui.schLimit||30;
  const from=past?App.addDays(today,-30):(dk>today?dk:today);

  /* 앞으로의 일정 — 날짜별로 묶는다 */
  const all=(D.events||[]).filter(e=>{
    const d=App.evDate(e);
    return d&&d>=from&&!schIsWorship(e)&&schPass(e);
  }).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  const list=all.slice(0,limit);
  const rest=all.length-list.length;
  const byDate={};
  list.forEach(e=>{const d=App.evDate(e);(byDate[d]=byDate[d]||[]).push(e)});
  const dates=Object.keys(byDate).sort();

  const el=document.getElementById('sc-schedule');
  el.innerHTML=`
  <div class="sch">
    <div class="sch-left">
      <div class="card pad sch-cal">
        <div class="sch-mh">
          <button class="icon-btn sm" type="button" data-sch="wmove" data-step="-1" aria-label="지난 주">‹</button>
          <b>${App.dateObj(dk).getFullYear()}년 ${App.dateObj(dk).getMonth()+1}월</b>
          <button class="icon-btn sm" type="button" data-sch="wmove" data-step="1" aria-label="다음 주">›</button>
          <button class="btn sm ghost" type="button" data-sch="today">오늘</button>
          <button class="btn sm ghost ${D.ui.schMonth?'on':''}" type="button" data-sch="month">${D.ui.schMonth?'주간':'월간'}</button>
        </div>
        <div class="week sch-week">
          <button class="nav" type="button" data-sch="wmove" data-step="-1">‹</button>
          ${days.map((k,i)=>{
            const n=schDayCount(k), dow=App.dow(k);
            return `<button class="wday ${dow===0?'sun':dow===6?'sat':''} ${k===today?'today':''} ${k===dk?'sel':''}" type="button" data-sch="day" data-date="${k}">
              <span class="dw">${App.DW[dow]}</span><span class="dn">${App.dateObj(k).getDate()}</span>
              <span class="amt">${n?n+'건':''}</span><span class="dot" style="opacity:${n?1:0}"></span>
            </button>`}).join('')}
          <button class="nav" type="button" data-sch="wmove" data-step="1">›</button>
        </div>
        ${D.ui.schMonth?`<div class="sch-mini">${schMonthGrid(mth)}</div>`:''}
        <div class="sch-sync">${syncLine()} <button class="icon-btn sm" type="button" data-action="gcal-sync" aria-label="구글 캘린더 새로고침">${App.ICON.down}</button></div>
      </div>

      <div class="card sch-tasks">
        <div class="card-h"><h2>챕터 할 일</h2><span class="hint">${(D.tasks||[]).filter(t=>!t.done&&t.chapter===ch).length}개 남음</span></div>
        <div class="card-b">
          <div class="chips sch-ch">
            ${App.CHAPTERS.filter(c=>c.id!=='dawn').map(c=>{
              const n=(D.tasks||[]).filter(t=>t.chapter===c.id&&!t.done).length;
              return `<button class="chip ${c.id===ch?'sel':''}" type="button" data-ch="${c.id}" style="${c.id===ch?'':'color:'+c.color}"><span class="pt"></span>${c.name}${n?' '+n:''}</button>`}).join('')}
          </div>
          <div class="task-list mt12" id="taskList">${taskListHTML(ch)}</div>
          <div class="inline-form">
            <input class="tx" id="tText" placeholder="할 일  예) 노회 월례회 참석 준비">
            <input class="date" type="date" id="tDate">
            <input class="time" type="time" id="tTime">
            <input class="place" id="tPlace" placeholder="장소 (선택)">
            <button class="btn sm primary" id="tAdd">추가</button>
          </div>
        </div>
      </div>

      <div class="card sch-verses">
        <div class="card-h"><h2>새벽 예배 본문</h2><span class="hint">${(D.verses||[]).length}건</span></div>
        <div class="card-b">
          ${(D.verses||[]).length?`<div class="dawn-grid">${D.verses.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(v=>`
            <div class="verse" data-vid="${v.id}">
              <div class="dt"><b>${App.dateObj(v.date).getDate()}</b><span>${App.dateObj(v.date).getMonth()+1}월 ${App.DW[App.dow(v.date)]}</span></div>
              <div class="bd"><div class="p">${App.esc(v.passage)}</div>${v.note?`<div class="n">${App.nl(v.note)}</div>`:''}</div>
            </div>`).join('')}</div>`:`<div class="empty small">아직 새벽예배 본문이 없습니다.<span>아래에 날짜와 본문을 적어 두면 여기 쌓입니다.</span></div>`}
          <div class="inline-form">
            <input class="date" type="date" id="vDate" value="${today}">
            <input id="vPassage" placeholder="본문  예) 빌립보서 4:4-9">
            <input id="vNote" class="place" placeholder="한 줄 메모 (선택)">
            <button class="btn sm primary" id="vAdd">본문 추가</button>
          </div>
        </div>
      </div>
    </div>

    <div class="sch-right">
      <div class="sch-h">
        <div class="sh-l">
          <b>앞으로의 일정</b>
          <span>${past?'지난 30일 포함':'오늘부터'} · 예배 제외 · ${all.length}건</span>
        </div>
        <div class="sh-r">
          <button class="btn sm ${past?'ghost':'ghost'}" type="button" data-sch="past">${past?'지난 일정 접기':'지난 일정'}</button>
          <button class="btn sm primary" type="button" data-action="ev-add" data-date="${dk}">＋ 일정</button>
        </div>
      </div>

      <div class="chips sch-filter">
        <button class="chip ${schChapterFilter()==='all'?'sel':''}" type="button" data-sch="ch" data-ch="all">전체</button>
        ${App.CHAPTERS.filter(c=>c.id!=='dawn').map(c=>`<button class="chip ${schChapterFilter()===c.id?'sel':''}" type="button" data-sch="ch" data-ch="${c.id}" style="${schChapterFilter()===c.id?'':'color:'+c.color}"><span class="pt"></span>${c.name}</button>`).join('')}
        <button class="chip ${schChapterFilter()==='other'?'sel':''}" type="button" data-sch="ch" data-ch="other">미분류</button>
      </div>

      ${dates.length?dates.map(d=>schDayGroup(d,byDate[d])).join(''):`<div class="card"><div class="card-b">${App.empty('앞으로 잡힌 일정이 없습니다','구글 캘린더에 넣으면 자동으로 이곳에 들어옵니다.','')}</div></div>`}
      ${rest>0?`<button class="btn ghost sch-more" type="button" data-sch="more">${rest}건 더 보기</button>`:''}
      <p class="muted sch-foot">예배(새벽·주일·수요·금요·줌)는 스케줄표에서 뺐습니다. 그날 예배는 <b>일지</b>에 자동으로 남습니다.</p>
    </div>
  </div>`;

  /* ── 동작 ── */
  el.querySelectorAll('[data-sch]').forEach(b=>{
    const a=b.dataset.sch;
    b.onclick=()=>{
      if(a==='wmove'){
        const step=+(b.dataset.step||0)*7;
        D.ui.calDate=App.addDays(dk,step);
        D.ui.calMonth=D.ui.calDate.slice(0,7);
      }else if(a==='day'){D.ui.calDate=b.dataset.date;D.ui.calMonth=b.dataset.date.slice(0,7)}
      else if(a==='today'){D.ui.calDate=today;D.ui.calMonth=today.slice(0,7)}
      else if(a==='month'){D.ui.schMonth=!D.ui.schMonth}
      else if(a==='past'){D.ui.schPast=!D.ui.schPast}
      else if(a==='ch'){D.ui.schCh=b.dataset.ch}
      else if(a==='more'){D.ui.schLimit=(D.ui.schLimit||30)+30}
      else if(a==='mmove'){
        const [y,mm]=mth.split('-').map(Number);
        const d=new Date(y,mm-1+(+b.dataset.step),1);
        D.ui.calMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      }
      App.save();renderSchedule();
    };
  });
  el.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{
    D.ui.chapter=b.dataset.ch;App.save();renderSchedule();
  });
  /* 일정 펼치기 */
  el.querySelectorAll('[data-evc]').forEach(n=>n.onclick=e=>{
    if(e.target.closest('button,textarea,input'))return;
    calOpen=calOpen===n.dataset.evc?null:n.dataset.evc;renderSchedule();
  });
  el.querySelectorAll('[data-evtoggle]').forEach(b=>b.onclick=()=>{
    calOpen=calOpen===b.dataset.evtoggle?null:b.dataset.evtoggle;renderSchedule();
  });

  bindScheduleTasks(el,ch);
  bindScheduleVerses(el,today);
}

/* ── 작은 월간 달력 (예배 빼고 표시) ── */
function schMonthGrid(m){
  const first=new Date(+m.slice(0,4),+m.slice(5,7)-1,1);
  const start=App.mondayOf(App.todayKey(first));
  const today=App.todayKey(), sel=App.D.ui.calDate||today;
  let cells='';
  for(let i=0;i<42;i++){
    const k=App.addDays(start,i);
    const evs=schEvents(k).filter(schPass);
    const dow=App.dow(k);
    cells+=`<button class="cell ${App.inMonth(k,m)?'':'out'} ${dow===0?'sun':''} ${dow===6?'sat':''} ${k===today?'today':''} ${k===sel?'sel':''}" type="button" data-sch="day" data-date="${k}" aria-label="${App.fmtDate(k)} ${evs.length}건">
      <span class="dn">${App.dateObj(k).getDate()}</span>
      ${evs.length?`<span class="dots">${evs.slice(0,3).map(e=>`<i class="cdot" style="background:${App.chapterInfo(App.chapterOf(e)).color}"></i>`).join('')}${evs.length>3?`<i class="cmore">+${evs.length-3}</i>`:''}</span>`:''}
    </button>`;
  }
  return `<div class="cal">
    <div class="cal-wd">${['월','화','수','목','금','토','일'].map((d,i)=>`<div class="${i===5?'sat':i===6?'sun':''}">${d}</div>`).join('')}</div>
    <div class="cal-grid">${cells}</div>
  </div>`;
}

/* ── 날짜 한 묶음 ── */
function schDayGroup(dk,list){
  const today=App.todayKey();
  const rel=dk===today?'오늘':(dk===App.addDays(today,1)?'내일':(dk===App.addDays(today,-1)?'어제':''));
  const dd=App.dateObj(dk);
  return `<div class="sch-day">
    <div class="sch-dh ${dk===today?'on':''}">
      <span class="d">${rel?`<b>${rel}</b> `:''}${dd.getMonth()+1}월 ${dd.getDate()}일</span>
      <span class="w">${App.DW[dd.getDay()]}요일</span>
      <span class="n">${list.length}건</span>
    </div>
    ${list.map(e=>schEventRow(e)).join('')}
  </div>`;
}

function schEventRow(e){
  const open=calOpen===e.id;
  const ci=App.chapterInfo(App.chapterOf(e));
  const st=App.STATUS[e.status||'plan'];
  const t=timed(e)?`<b>${mnTime(e.start)}</b>`:'<b class="ad">종일</b>';
  return `<div class="ev sch-ev ${open?'open':''}" data-evc="${e.id}" style="--c:${ci.color}">
    <div class="ev-h">
      <span class="ev-t">${t}</span>
      <span class="ei">
        <span class="et">${App.esc(e.summary)}</span>
        <span class="em"><span class="kbadge" style="--c:${ci.color}">${ci.name}</span>${e.location?`<i>· ${App.esc(e.location.slice(0,26))}</i>`:''}</span>
      </span>
      <span class="chip st-${e.status||'plan'} sch-st"><span class="pt"></span>${st.label}</span>
      <button class="sch-chev" type="button" data-evtoggle="${e.id}" aria-label="자세히">${App.ICON.chev}</button>
    </div>
    ${open?`<div class="ev-b">
      <div class="status-pick">${Object.entries(App.STATUS).map(([k,s])=>`<button class="chip ${(e.status||'plan')===k?'st-'+k:''}" type="button" data-action="ev-status" data-set="${e.id}|${k}" style="${(e.status||'plan')===k?'':'color:'+s.color}"><span class="pt"></span>${s.label}</button>`).join('')}</div>
      <div class="lbl mt8">챕터</div>
      <div class="chips sch-evc">
        ${App.CHAPTERS.filter(c=>c.id!=='dawn').map(c=>`<button class="chip ${App.chapterOf(e)===c.id?'sel':''}" type="button" data-action="ev-chapter" data-set="${e.id}|${c.id}" style="${App.chapterOf(e)===c.id?'':'color:'+c.color}"><span class="pt"></span>${c.name}</button>`).join('')}
        <button class="chip ${e.chapter===''?'sel':''}" type="button" data-action="ev-chapter" data-set="${e.id}|">미분류</button>
      </div>
      ${e.location?`<div class="lbl mt8">장소</div><div class="desc">${App.esc(e.location)}</div>`:''}
      ${e.desc?`<div class="lbl mt8">설명</div><div class="desc clamp">${App.nl(e.desc)}</div>`:''}
      <div class="lbl mt8">메모</div>
      <textarea data-action="ev-note" data-ev="${e.id}" placeholder="이 일정에 대한 메모" style="min-height:52px;font-size:13.5px">${App.esc(e.note||'')}</textarea>
      <div class="acts">
        <button class="btn sm primary" type="button" data-action="ev-tojournal" data-ev="${e.id}">일지에 기록</button>
        <button class="btn sm" type="button" data-action="ev-edit" data-ev="${e.id}">수정</button>
      </div>
    </div>`:''}
  </div>`;
}

/* ── 챕터 할 일 ── */
function taskListHTML(ch){
  const today=App.todayKey();
  const tasks=(App.D.tasks||[]).filter(t=>t.chapter===ch).sort((a,b)=>(a.order??0)-(b.order??0));
  if(!tasks.length)return `<div class="empty small"><b>${App.chapterInfo(ch).name} 할 일이 비어 있습니다</b><span>아래에서 하나씩 추가해 순서를 잡아 두세요.</span></div>`;
  return tasks.map(t=>{
    const late=t.date&&t.date<today&&!t.done;
    return `<div class="task ${t.done?'done':''}" data-id="${t.id}">
      <span class="grip" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg></span>
      <button class="cb" data-done aria-label="완료">${App.ICON.check}</button>
      <div class="tx">
        <div class="tt">${App.esc(t.text)}</div>
        <div class="mt">
          ${t.date?`<i style="color:${late?'#ef7373':'#7b8aa0'}">${App.fmtDate(t.date)}${t.time?' '+t.time:''}</i>`:''}
          ${t.place?`<i>${App.esc(t.place)}</i>`:''}
        </div>
      </div>
      <span class="opic"><button data-up title="위로">↑</button><button data-down title="아래로">↓</button><button data-del title="삭제">✕</button></span>
    </div>`}).join('');
}

function bindScheduleTasks(el,ch){
  const D=App.D;
  const tAdd=el.querySelector('#tAdd');
  if(tAdd)tAdd.onclick=()=>{
    const text=el.querySelector('#tText').value.trim();
    if(!text){App.toast('할 일을 적어 주세요');return}
    const max=Math.max(-1,...(D.tasks||[]).filter(t=>t.chapter===ch).map(t=>t.order??0));
    D.tasks.push({id:App.uid('t'),chapter:ch,text,date:el.querySelector('#tDate').value,time:el.querySelector('#tTime').value,
      place:el.querySelector('#tPlace').value.trim(),done:false,order:max+1});
    App.save();App.render();App.toast('추가했습니다');
  };
  const tText=el.querySelector('#tText');
  if(tText)tText.addEventListener('keydown',e=>{if(e.key==='Enter')tAdd.click()});
  el.querySelectorAll('.task').forEach(n=>{
    const id=n.dataset.id;
    const t=D.tasks.find(x=>x.id===id);if(!t)return;
    n.querySelector('[data-done]').onclick=e=>{e.stopPropagation();t.done=!t.done;App.save();App.render()};
    n.querySelector('[data-del]').onclick=async e=>{
      e.stopPropagation();
      if(await App.ask(`"${t.text}" 를 지울까요?`,'삭제')){D.tasks=D.tasks.filter(x=>x.id!==id);App.save();App.render()}
    };
    n.querySelector('[data-up]').onclick=e=>{e.stopPropagation();moveTask(id,-1)};
    n.querySelector('[data-down]').onclick=e=>{e.stopPropagation();moveTask(id,1)};
  });
  enableTaskDrag(el.querySelector('#taskList'),ch);
}

function bindScheduleVerses(el,today){
  const D=App.D;
  const vAdd=el.querySelector('#vAdd');
  if(vAdd)vAdd.onclick=()=>{
    const date=el.querySelector('#vDate').value, passage=el.querySelector('#vPassage').value.trim();
    if(!passage){App.toast('본문을 적어 주세요');return}
    D.verses.push({id:App.uid('v'),date,passage,note:el.querySelector('#vNote').value.trim()});
    App.save();App.render();App.toast('본문을 기록했습니다');
  };
  el.querySelectorAll('.verse').forEach(n=>n.onclick=()=>verseEdit(n.dataset.vid));
}

function moveTask(id,dir){
  const D=App.D, t=D.tasks.find(x=>x.id===id);if(!t)return;
  const list=D.tasks.filter(x=>x.chapter===t.chapter).sort((a,b)=>(a.order??0)-(b.order??0));
  const i=list.indexOf(t), j=i+dir;
  if(j<0||j>=list.length)return;
  [list[i],list[j]]=[list[j],list[i]];
  list.forEach((x,k)=>x.order=k);
  App.save();App.render();
}

function enableTaskDrag(listEl,ch){
  if(!listEl)return;
  let dragged=null;
  const persist=()=>{
    const ids=Array.from(listEl.querySelectorAll('.task')).map(n=>n.dataset.id);
    ids.forEach((id,i)=>{const t=App.D.tasks.find(x=>x.id===id);if(t)t.order=i});
    App.save();
  };
  listEl.addEventListener('dragover',e=>{
    e.preventDefault();
    const over=e.target.closest('.task');
    if(!over||!dragged||over===dragged)return;
    const r=over.getBoundingClientRect();
    const after=e.clientY>r.top+r.height/2;
    listEl.insertBefore(dragged,after?over.nextSibling:over);
  });
  listEl.addEventListener('drop',e=>{e.preventDefault();persist()});
  listEl.querySelectorAll('.task').forEach(n=>{
    n.draggable=true;
    n.addEventListener('dragstart',()=>{dragged=n;n.style.opacity='.5'});
    n.addEventListener('dragend',()=>{n.style.opacity='';dragged=null;persist()});
    const grip=n.querySelector('.grip');
    if(!grip)return;
    grip.addEventListener('pointerdown',e=>{
      e.preventDefault();dragged=n;n.style.opacity='.7';
      grip.setPointerCapture(e.pointerId);
      const move=ev=>{
        const over=document.elementFromPoint(ev.clientX,ev.clientY);
        const target=over&&over.closest('.task');
        if(target&&target!==dragged&&target.parentElement===listEl){
          const r=target.getBoundingClientRect();
          listEl.insertBefore(dragged,ev.clientY>r.top+r.height/2?target.nextSibling:target);
        }
      };
      const up=()=>{
        grip.removeEventListener('pointermove',move);grip.removeEventListener('pointerup',up);
        n.style.opacity='';dragged=null;persist();
      };
      grip.addEventListener('pointermove',move);grip.addEventListener('pointerup',up);
    });
  });
}

function verseEdit(id){
  const D=App.D, v=D.verses.find(x=>x.id===id);if(!v)return;
  App.sheet({
    title:'새벽예배 본문',
    body:`<label class="fld"><span>날짜</span><input id="eDate" type="date" value="${v.date}"></label>
      <label class="fld"><span>본문</span><input id="ePassage" value="${App.esc(v.passage)}"></label>
      <label class="fld"><span>메모</span><textarea id="eNote">${App.esc(v.note)}</textarea></label>`,
    footer:`<button class="btn danger" data-del>삭제</button><button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    v.date=document.getElementById('eDate').value;v.passage=document.getElementById('ePassage').value.trim();
    v.note=document.getElementById('eNote').value.trim();
    if(!v.passage){App.toast('본문을 적어 주세요');return}
    App.save();App.closeSheet();App.render();
  };
  document.querySelector('[data-del]').onclick=async()=>{
    if(await App.ask('이 본문을 지울까요?','삭제')){D.verses=D.verses.filter(x=>x.id!==id);App.save();App.closeSheet();App.render()}
  };
}
