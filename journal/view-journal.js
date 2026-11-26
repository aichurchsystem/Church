/* 일지 */
function renderJournal(){
  const D=App.D, dk=D.ui.journalDate||App.todayKey();
  const wk=App.mondayOf(dk);
  const month=dk.slice(0,7);
  const items=D.journal.filter(j=>j.date===dk).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  const daySum=items.reduce((a,j)=>a+(+j.amount||0),0);
  const mItems=D.journal.filter(j=>App.inMonth(j.date,month));
  const mSum=mItems.reduce((a,j)=>a+(+j.amount||0),0);
  const carSum=App.D.carExpenses.filter(e=>e.date.slice(0,7)===month).reduce((a,e)=>a+(+e.amount||0),0);
  const today=App.todayKey();
  const wdName=['월','화','수','목','금','토','일'];
  const days=[0,1,2,3,4,5,6].map(i=>App.addDays(wk,i));
  const dd=App.dateObj(dk);

  const el=document.getElementById('sc-journal');
  el.innerHTML=`
  <div class="split">
    <div class="sticky">
      <div class="card pad">
        <div class="week-head">
          <span class="m">${App.dateObj(wk).getFullYear()}년 ${App.dateObj(wk).getMonth()+1}월</span>
          <button class="btn sm ghost today-btn" data-today>오늘</button>
        </div>
        <div class="week">
          <button class="nav" data-nav="-7">‹</button>
          ${days.map((k,i)=>{
            const its=D.journal.filter(j=>j.date===k);
            const sum=its.reduce((a,j)=>a+(+j.amount||0),0);
            return `<button class="wday ${i===6?'sun':i===5?'sat':''} ${k===today?'today':''} ${k===dk?'sel':''}" data-d="${k}">
              <span class="dw">${wdName[i]}</span><span class="dn">${App.dateObj(k).getDate()}</span>
              <span class="amt">${its.length&&sum?wonShort(sum):''}</span>
              <span class="dot" style="opacity:${its.length?1:0}"></span>
            </button>`}).join('')}
          <button class="nav" data-nav="7">›</button>
        </div>
        <div class="stats mt12">
          ${App.stat('오늘 기록',items.length+'건')}
          ${App.stat('하루 합계',App.money(daySum)+'<small>원</small>','amber')}
          ${App.stat('이번 달',App.money(mSum)+'<small>원</small>')}
        </div>
        <div class="jhint">${+month.slice(5,7)}월 · 이번 달 ${mItems.length}건 기록${carSum?`<span class="jhint-car">차량 지출 ${App.money(carSum)}원 (별도)</span>`:''}</div>
      </div>
    </div>

    <div>
      <div class="day-head">
        <span class="d">${dd.getMonth()+1}월 ${dd.getDate()}일<span>${App.DW[dd.getDay()]}요일</span></span>
        <span class="acts">
          <button class="btn sm" data-batch>일괄 추가</button>
          <button class="btn sm primary" data-add>${App.ICON.plus} 기록</button>
        </span>
      </div>
      <div class="jlist">
        ${items.length?items.map(j=>{
          const c=App.CAT(j.cat), st=App.STATUS[j.status]||App.STATUS.done;
          return `<article class="jitem ${j.status==='done'?'done':''}" style="--c:${c.color}" data-id="${j.id}">
            <div class="body">
              <div class="t">${App.esc(j.title)}</div>
              <div class="meta">
                ${j.place?`<i>📍 ${App.esc(j.place)}</i>`:''}
                ${j.time?`<i>🕘 ${App.esc(j.time)}</i>`:''}
                <i>${c.name}</i>
                ${j.by?`<i>· ${App.esc(j.by)}</i>`:''}
              </div>
              ${j.note?`<div class="note">${App.nl(j.note)}</div>`:''}
            </div>
            <div class="right">
              ${+j.amount?`<span class="money">${App.money(j.amount)}원</span>`:''}
              <span class="chip st-${j.status||'done'}"><span class="pt"></span>${st.label}</span>
            </div>
          </article>`}).join('')
        :App.empty('아직 기록이 없습니다','오늘 한 일을 한 줄씩 남겨 보세요.<br><b>＋ 기록</b>으로 바로 추가할 수 있습니다.',
          `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/><path d="M8.5 8.2h6M8.5 11.4h4"/></svg>`)}
      </div>
      ${items.length?`<div class="day-total"><span>${App.fmtDate(dk)} 합계</span><b>${App.money(daySum)}원</b><span class="muted">· ${items.length}건</span></div>`:''}
    </div>
  </div>`;

  el.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{D.ui.journalDate=App.addDays(dk,+b.dataset.nav);App.save();renderJournal()});
  el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{D.ui.journalDate=b.dataset.d;App.save();renderJournal()});
  el.querySelector('[data-today]').onclick=()=>{D.ui.journalDate=today;App.save();renderJournal()};
  el.querySelector('[data-add]').onclick=()=>journalEdit(null,dk);
  el.querySelector('[data-batch]').onclick=()=>journalBatch(dk);
  el.querySelectorAll('.jitem').forEach(n=>n.onclick=()=>journalEdit(n.dataset.id,dk));
}

function wonShort(n){
  n=+n||0;
  if(n>=10000){const v=Math.round(n/1000)/10;return (Number.isInteger(v)?v:v.toFixed(1))+'만'}
  if(n>=1000)return Math.round(n/1000)+'천';
  return n?String(n):'';
}

function journalEdit(id,date){
  const D=App.D;
  const j=id?D.journal.find(x=>x.id===id):{id:'',date:date,title:'',place:'',amount:'',time:'',cat:'admin',status:'done',note:'',by:''};
  if(!j)return;
  const cats=App.CATS.map(c=>`<button class="chip ${j.cat===c.id?'sel':''}" data-cat="${c.id}" style="${j.cat===c.id?'':`color:${c.color}`}"><span class="pt"></span>${c.name}</button>`).join('');
  const stats=Object.entries(App.STATUS).map(([k,s])=>`<button class="chip ${(j.status||'done')===k?'st-'+k:'sel'}" data-st="${k}" style="${(j.status||'done')===k?'':'color:'+s.color}"><span class="pt"></span>${s.label}</button>`).join('');
  App.sheet({
    title:id?'일지 수정':'일지 기록 추가',
    body:`<label class="fld"><span>무슨 일</span><input id="jTitle" value="${App.esc(j.title)}" placeholder="예: 목회 일지 앱 제작·배포"></label>
      <label class="fld"><span>분류</span><div class="chips" id="jCats">${cats}</div></label>
      <div class="row2">
        <label class="fld"><span>어디서 (장소·대상)</span><input id="jPlace" value="${App.esc(j.place)}" placeholder="예: 구의동 사무실"></label>
        <label class="fld"><span>얼마 (원)</span><input id="jAmount" type="number" inputmode="numeric" value="${j.amount||''}" placeholder="0"></label>
      </div>
      <div class="row2">
        <label class="fld"><span>날짜</span><input id="jDate" type="date" value="${j.date}"></label>
        <label class="fld"><span>시간</span><input id="jTime" type="time" value="${j.time||''}"></label>
      </div>
      <label class="fld"><span>상태</span><div class="chips" id="jStat">${stats}</div></label>
      <label class="fld"><span>메모</span><textarea id="jNote" placeholder="내용·결과·전달한 것">${App.esc(j.note)}</textarea></label>
      <p class="muted" style="margin:0">입력한 기록은 이 기기 브라우저에만 저장됩니다.</p>`,
    footer:`${id?'<button class="btn danger" data-del>삭제</button>':''}<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  let cat=j.cat, st=j.status||'done';
  document.querySelectorAll('#jCats [data-cat]').forEach(b=>b.onclick=()=>{
    cat=b.dataset.cat;document.querySelectorAll('#jCats [data-cat]').forEach(x=>{x.classList.toggle('sel',x===b)});
  });
  document.querySelectorAll('#jStat [data-st]').forEach(b=>b.onclick=()=>{
    st=b.dataset.st;
    document.querySelectorAll('#jStat [data-st]').forEach(x=>{x.className='chip';x.style.color=App.STATUS[x.dataset.st].color;});
    b.className='chip st-'+st;b.style.color='';
  });
  const save=()=>{
    const t=document.getElementById('jTitle').value.trim();
    if(!t){App.toast('무슨 일을 적어 주세요');return}
    const rec={id:j.id||App.uid('j'),title:t,cat,place:document.getElementById('jPlace').value.trim(),
      amount:+document.getElementById('jAmount').value||0,
      date:document.getElementById('jDate').value||date,time:document.getElementById('jTime').value,
      status:st,note:document.getElementById('jNote').value.trim(),by:j.by||''};
    if(j.id){Object.assign(D.journal.find(x=>x.id===j.id),rec)}else{D.journal.push(rec)}
    App.save();App.closeSheet();D.ui.journalDate=rec.date;App.save();App.render();App.toast(j.id?'수정했습니다':'기록을 추가했습니다');
  };
  document.querySelector('[data-save]').onclick=save;
  document.querySelector('[data-x]').onclick=App.closeSheet;
  const del=document.querySelector('[data-del]');
  if(del)del.onclick=async()=>{
    if(await App.ask('이 기록을 삭제할까요?','삭제')){D.journal=D.journal.filter(x=>x.id!==j.id);App.save();App.render();App.toast('삭제했습니다')}
  };
  setTimeout(()=>document.getElementById('jTitle').focus(),80);
}

function journalBatch(date){
  const sample=`09:00 | 주간 브리핑 정리 | 사무실 | 0 | 행정
14:30 | 주일 설교 원고 점검 | 구의동 | 0 | 교회
16:00 | 인쇄소 시안 전달 | 강변 인쇄 | 45000 | 인쇄`;
  App.sheet({
    title:'일괄 추가',
    body:`<p class="muted" style="margin:0 0 9px">한 줄에 하나씩 붙여넣으세요. <b style="color:#a9b7ca">시간 | 무슨 일 | 장소 | 금액 | 분류</b> 순서이고, 뒤쪽 항목은 비워도 됩니다.</p>
      <textarea id="bText" style="min-height:150px;font-size:14px" placeholder="${App.esc(sample)}"></textarea>
      <div class="batch-opt">
        <label class="fld" style="margin:10px 0 0"><span>날짜</span><input id="bDate" type="date" value="${date}"></label>
      </div>
      <p class="muted" style="margin:8px 0 0">분류: 교회 · 선교회 · 강의 · 행정 · 인쇄 · 영상 · 기타 (없으면 기타)</p>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-save>추가</button>`
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    const dk=document.getElementById('bDate').value||date;
    const rows=document.getElementById('bText').value.split('\n').map(s=>s.trim()).filter(Boolean);
    let n=0;
    rows.forEach(line=>{
      const parts=line.split(/\s*[|\t]\s*/).map(s=>s.trim()).filter(s=>s!=='');
      if(!parts.length)return;
      const rec={id:App.uid('j'),date:dk,time:'',title:'',place:'',amount:0,cat:'etc',status:'done',note:'',by:''};
      const rest=[];
      parts.forEach(p=>{
        if(/^\d{4}-\d{2}-\d{2}$/.test(p)){rec.date=p;return}
        if(/^\d{1,2}:\d{2}$/.test(p)){rec.time=p.padStart(5,'0');return}
        const cat=App.CATS.find(c=>c.name===p);
        if(cat){rec.cat=cat.id;return}
        if(/^[\d,\s원]+$/.test(p)&&/\d/.test(p)){rec.amount=+p.replace(/[^\d]/g,'');return}
        rest.push(p);
      });
      if(!rest.length)return;
      rec.title=rest[0];rec.place=rest[1]||'';
      if(rest.length>2&&!rec.note)rec.note=rest.slice(2).join(' ');
      App.D.journal.push(rec);n++;
    });
    App.D.ui.journalDate=dk;App.save();App.closeSheet();App.render();
    App.toast(n?`${n}건을 추가했습니다`:'추가할 줄이 없습니다');
  };
}
