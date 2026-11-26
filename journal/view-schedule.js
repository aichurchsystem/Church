/* 스케줄 */
function renderSchedule(){
  const D=App.D;
  const ch=D.ui.chapter||'dawn';
  const tasks=D.tasks.filter(t=>t.chapter===ch).sort((a,b)=>(a.order??0)-(b.order??0));
  const remain=tasks.filter(t=>!t.done).length;
  const chInfo=App.chapter(ch);
  const today=App.todayKey();
  const verses=D.verses.slice().sort((a,b)=>b.date.localeCompare(a.date));

  const el=document.getElementById('sc-schedule');
  el.innerHTML=`
  <div class="split">
    <div class="sticky">
      <div class="chapter-list">
        ${App.CHAPTERS.map(c=>{
          const ts=D.tasks.filter(t=>t.chapter===c.id);
          const r=ts.filter(t=>!t.done).length;
          return `<button class="chapter ${c.id===ch?'sel':''}" data-ch="${c.id}" style="--c:${c.color}">
            <span class="bullet"></span><span class="nm">${c.name}</span>
            <span class="badge ${r?'':'zero'}">${r}</span>
          </button>`}).join('')}
      </div>
    </div>

    <div>
      <div class="card">
        <div class="card-h">
          <span class="hic" style="color:${chInfo.color}">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 4.5h12v15H6z"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <h2>${chInfo.name}</h2>
          <span class="hint">남은 일 ${remain} · 전체 ${tasks.length}</span>
        </div>
        <div class="card-b">
          ${ch==='dawn'?`
          <div class="sec-title" style="margin-top:0">이번 주 본문 <span class="count">${verses.filter(v=>v.date>=App.mondayOf(today)&&v.date<=App.addDays(App.mondayOf(today),6)).length}건</span></div>
          <div class="dawn-grid">
            ${verses.length?verses.map(v=>`<div class="verse" data-vid="${v.id}">
              <div class="dt"><b>${App.dateObj(v.date).getDate()}</b><span>${App.dateObj(v.date).getMonth()+1}월 ${App.DW[App.dow(v.date)]}</span></div>
              <div class="bd"><div class="p">${App.esc(v.passage)}</div>${v.note?`<div class="n">${App.nl(v.note)}</div>`:''}</div>
            </div>`).join(''):`<div class="empty small">아직 새벽예배 본문이 없습니다.<span>아래에 날짜와 본문을 적어 두면 이 목록에 쌓입니다.</span></div>`}
          </div>
          <div class="inline-form">
            <input class="date" type="date" id="vDate" value="${today}">
            <input id="vPassage" placeholder="본문  예) 빌립보서 4:4-9">
            <input id="vNote" class="place" placeholder="한 줄 메모 (선택)">
            <button class="btn sm primary" id="vAdd">본문 추가</button>
          </div>`:''}

          <div class="sec-title">할 일 <span class="count">${tasks.filter(t=>t.done).length}/${tasks.length} 완료</span></div>
          <div class="task-list" id="taskList">
            ${tasks.length?tasks.map(t=>{
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
              </div>`}).join(''):`<div class="empty small"><b>${chInfo.name} 할 일이 비어 있습니다</b><span>아래에서 하나씩 추가해 순서를 잡아 두세요.</span></div>`}
          </div>
          <div class="inline-form">
            <input class="tx" id="tText" placeholder="할 일  예) 노회 월례회 참석 준비">
            <input class="date" type="date" id="tDate">
            <input class="time" type="time" id="tTime">
            <input class="place" id="tPlace" placeholder="장소 (선택)">
            <button class="btn sm primary" id="tAdd">추가</button>
          </div>
        </div>
      </div>
      <p class="muted" style="margin:10px 3px 0">⠿ 손잡이를 끌어 순서를 바꿀 수 있습니다. 모바일에서는 ↑↓ 버튼을 쓰세요.</p>
    </div>
  </div>`;

  el.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{D.ui.chapter=b.dataset.ch;App.save();renderSchedule()});

  const vAdd=el.querySelector('#vAdd');
  if(vAdd)vAdd.onclick=()=>{
    const date=el.querySelector('#vDate').value, passage=el.querySelector('#vPassage').value.trim();
    if(!passage){App.toast('본문을 적어 주세요');return}
    D.verses.push({id:App.uid('v'),date,passage,note:el.querySelector('#vNote').value.trim()});
    App.save();App.render();App.toast('본문을 기록했습니다');
  };
  const tAdd=el.querySelector('#tAdd');
  tAdd.onclick=()=>{
    const text=el.querySelector('#tText').value.trim();
    if(!text){App.toast('할 일을 적어 주세요');return}
    const max=Math.max(-1,...D.tasks.filter(t=>t.chapter===ch).map(t=>t.order??0));
    D.tasks.push({id:App.uid('t'),chapter:ch,text,date:el.querySelector('#tDate').value,time:el.querySelector('#tTime').value,
      place:el.querySelector('#tPlace').value.trim(),done:false,order:max+1});
    App.save();App.render();App.toast('추가했습니다');
  };
  el.querySelector('#tText').addEventListener('keydown',e=>{if(e.key==='Enter')tAdd.click()});

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
  el.querySelectorAll('.verse').forEach(n=>n.onclick=()=>verseEdit(n.dataset.vid));
  enableTaskDrag(el.querySelector('#taskList'),ch);
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
