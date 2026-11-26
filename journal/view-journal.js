/* 일지 — 그날 하루 전체를 한눈에 (2026-11-26 목사님 지시)
   섹션: 일정 · 상담 · 설교 · 운동 · 차량 · 맛집 · 보고 · 내 기록
   자동으로 채운 항목은 출처 태그가 붙고, 열어서 고치면 그때 사람이 쓴 기록이 된다. */
var J_OPEN={};      /* 섹션 펼치기 상태(이번 화면에서만) */

function jSecOrder(){return ['일정','상담','설교','운동','차량','맛집','보고']}
function jSecColor(k){
  return ({'일정':'#82a9e6','상담':'#6fd2d2','설교':'#b79cff','운동':'#f0564a',
    '차량':'#f0a86b','맛집':'#e8b04b','보고':'#ecc970','내 기록':'#a9b6d4'})[k]||'#9aa8bd';
}
function jTimeSort(a,b){return (a.time||'99:99').localeCompare(b.time||'99:99')||((a.id||'')<(b.id||'')?-1:1)}

function renderJournal(){
  const D=App.D, dk=D.ui.journalDate||App.todayKey();
  const today=App.todayKey();
  const wk=App.mondayOf(dk);
  const month=dk.slice(0,7);
  const items=D.journal.filter(j=>j.date===dk).sort(jTimeSort);
  const daySum=items.reduce((a,j)=>a+(+j.amount||0),0);
  const mItems=D.journal.filter(j=>App.inMonth(j.date,month));
  const mSum=mItems.reduce((a,j)=>a+(+j.amount||0),0);
  const carSum=App.D.carExpenses.filter(e=>e.date.slice(0,7)===month).reduce((a,e)=>a+(+e.amount||0),0);
  const wdName=['월','화','수','목','금','토','일'];
  const days=[0,1,2,3,4,5,6].map(i=>App.addDays(wk,i));
  const jcal=!!D.ui.jCal;                 /* 날짜 달력 펼침 (2026-11-27) */
  const gm=D.ui.jMonth||month;
  const dd=App.dateObj(dk);
  const info=App.autoInfo?App.autoInfo(dk):{n:0,by:{},sum:0};
  const wo=App.woSummary?App.woSummary(dk):{sets:0,exs:[]};
  /* 그날 일정·이번 주 흐름 (캘린더 요약) */
  const evToday=(D.events||[]).filter(e=>App.evDate(e)===dk).length;
  const wkMon=App.mondayOf(dk);
  const evWeek=(D.events||[]).filter(e=>{const d=App.evDate(e);return d>=wkMon&&d<=App.addDays(wkMon,6)}).length;

  /* 자동 항목을 출처별로 묶는다 */
  const groups={},manual=[];
  items.forEach(j=>{
    if(j.auto&&j.srcName){ (groups[j.srcName]=groups[j.srcName]||[]).push(j) }
    else manual.push(j);
  });
  const order=jSecOrder().filter(k=>groups[k]&&groups[k].length);

  /* 한 줄 요약 */
  const bits=[];
  if(evToday)bits.push('일정 '+evToday);
  if(groups['상담'])bits.push('상담 '+groups['상담'].length);
  if(wo.sets)bits.push('운동 '+wo.sets+'세트');
  if(groups['차량']){const s=groups['차량'].reduce((a,j)=>a+(+j.amount||0),0);if(s)bits.push('차량 '+wonShort(s)+'원')}
  if(groups['설교'])bits.push('설교 '+groups['설교'].length+'편');
  if(groups['보고'])bits.push('보고 '+groups['보고'].length);
  const autoAll=info.n;

  const el=document.getElementById('sc-journal');
  el.innerHTML=`
  <div class="split">
    <div class="sticky">
      <div class="card pad">
        <div class="week-head jh-head">
          <span class="m">${App.dateObj(wk).getFullYear()}년 ${App.dateObj(wk).getMonth()+1}월</span>
          <button class="btn sm ghost jh-calbtn ${jcal?'on':''}" type="button" data-jcal aria-expanded="${jcal?'true':'false'}">${jcal?'달력 접기':'날짜 달력'}</button>
          <button class="btn sm ghost today-btn" data-today>오늘</button>
        </div>
        <div class="week">
          <button class="nav" data-nav="-7">‹</button>
          ${days.map((k,i)=>{
            const its=D.journal.filter(j=>j.date===k);
            const sum=its.reduce((a,j)=>a+(+j.amount||0),0);
            const nEv=(D.events||[]).filter(e=>App.evDate(e)===k).length;
            return `<button class="wday ${i===6?'sun':i===5?'sat':''} ${k===today?'today':''} ${k===dk?'sel':''}" data-d="${k}">
              <span class="dw">${wdName[i]}</span><span class="dn">${App.dateObj(k).getDate()}</span>
              <span class="amt">${sum?wonShort(sum):(nEv?String(nEv):'')}</span>
              <span class="dot" style="opacity:${its.length||nEv?1:0}"></span>
            </button>`}).join('')}
          <button class="nav" data-nav="7">›</button>
        </div>
        ${jcal?`<div class="mini-cal j-mini">${jMonthGrid(gm)}</div>`:''}
        <div class="stats mt12">
          ${App.stat('그날 기록',items.length+'건')}
          ${App.stat('지출 합계',App.money(daySum)+'<small>원</small>','amber')}
          ${App.stat('이번 달',App.money(mSum)+'<small>원</small>')}
        </div>
        <div class="jhint">${+month.slice(5,7)}월 · 이번 달 ${mItems.length}건${carSum?`<span class="jhint-car">차량 지출 ${App.money(carSum)}원 (별도)</span>`:''}</div>
      </div>
    </div>

    <div>
      <div class="day-head">
        <span class="d">${dd.getMonth()+1}월 ${dd.getDate()}일<span>${App.DW[dd.getDay()]}요일${dk===today?' · 오늘':''}</span></span>
        <span class="acts">
          <button class="btn sm" data-batch>일괄 추가</button>
          <button class="btn sm primary" data-add>${App.ICON.plus} 기록</button>
        </span>
      </div>

      <div class="jsum">
        <span class="js-l">한눈에</span>
        <span class="js-t">${bits.length?bits.join(' · '):'오늘은 아직 모인 기록이 없습니다'}</span>
        ${autoAll?`<button class="js-clr" type="button" data-autoclear>자동 ${autoAll}건 지우기</button>`:''}
      </div>

      ${(order.length||manual.length)?'':`<div class="jsce">
        ${App.empty('이 날은 모인 기록이 없습니다','일정·상담·설교·운동·차량·보고에서 그날 자료가 생기면 여기에 자동으로 모입니다.<br><b>＋ 기록</b>으로 직접 남길 수도 있습니다.',
          `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/><path d="M8.5 8.2h6M8.5 11.4h4"/></svg>`)}
      </div>`}

      ${order.map(k=>jSection(k,groups[k])).join('')}

      ${manual.length?`<div class="jsec">
        <div class="jsec-h" style="--c:#a9b6d4">
          <span class="js-ico">${App.ICON.edit}</span><b>내 기록</b><span class="js-n">${manual.length}건</span>
        </div>
        <div class="jlist">
          ${manual.map(j=>{
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
            </article>`}).join('')}
        </div>
      </div>`:''}

      ${items.length?`<div class="day-total"><span>${App.fmtDate(dk)} 합계</span><b>${App.money(daySum)}원</b><span class="muted">· ${items.length}건</span></div>`:''}
    </div>
  </div>`;

  el.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{D.ui.journalDate=App.addDays(dk,+b.dataset.nav);D.ui.jMonth=D.ui.journalDate.slice(0,7);App.save();renderJournal()});
  el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{D.ui.journalDate=b.dataset.d;D.ui.jMonth=b.dataset.d.slice(0,7);App.save();renderJournal()});
  el.querySelector('[data-today]').onclick=()=>{D.ui.journalDate=today;D.ui.jMonth=today.slice(0,7);App.save();renderJournal()};
  /* 날짜 달력 — 펼치기, 달 넘기기, 날짜 한 번에 고르기 */
  el.querySelectorAll('[data-jcal]').forEach(b=>b.onclick=()=>{D.ui.jCal=!D.ui.jCal;App.save();renderJournal()});
  el.querySelectorAll('[data-jm]').forEach(b=>b.onclick=()=>{
    const [y,mm]=gm.split('-').map(Number);
    const d=new Date(y,mm-1+(+b.dataset.jm),1);
    D.ui.jMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    App.save();renderJournal();
  });
  el.querySelectorAll('[data-jday]').forEach(b=>b.onclick=()=>{
    D.ui.journalDate=b.dataset.jday;D.ui.jMonth=b.dataset.jday.slice(0,7);D.ui.jCal=false;
    App.save();renderJournal();
  });
  el.querySelector('[data-add]').onclick=()=>journalEdit(null,dk);
  el.querySelector('[data-batch]').onclick=()=>journalBatch(dk);
  const clr=el.querySelector('[data-autoclear]');
  if(clr)clr.onclick=async()=>{
    if(!await App.ask(`이 날 자동으로 채운 ${autoAll}건을 지울까요?\n직접 쓴 기록은 그대로 두고, 지운 자동 항목은 다시 채우지 않습니다.`,'지우기'))return;
    const n=App.autoClear(dk);App.render();App.toast(n+'건을 지웠습니다');
  };
  el.querySelectorAll('.jsec-toggle').forEach(b=>b.onclick=()=>{
    const k=b.dataset.sec;J_OPEN[k]=!J_OPEN[k];renderJournal();
  });
  el.querySelectorAll('.jitem').forEach(n=>n.onclick=()=>journalEdit(n.dataset.id,dk));
  el.querySelectorAll('.jrow').forEach(n=>n.onclick=()=>journalEdit(n.dataset.id,dk));
}

/* ── 날짜 고르기 달력 (2026-11-27 목사님 지시: 일지 맨 위에서 아무 날짜나 한 번에) ──
   스케줄 달력과 같은 모양이지만 상태는 D.ui.journalDate만 움직인다(서로 섞이지 않게 따로 둔다).
   점: 금색 = 일지 기록이 있는 날, 파랑 = 일정이 있는 날 */
function jMonthGrid(m){
  const D=App.D;
  const y=+m.slice(0,4), mo=+m.slice(5,7);
  const start=App.mondayOf(`${m}-01`);
  const today=App.todayKey(), sel=D.ui.journalDate||today;
  const jd={}, evd={};
  (D.journal||[]).forEach(j=>{jd[j.date]=(jd[j.date]||0)+1});
  (D.events||[]).forEach(e=>{const k=App.evDate(e);if(k)evd[k]=(evd[k]||0)+1});
  let cells='';
  for(let i=0;i<42;i++){
    const k=App.addDays(start,i);
    const nj=jd[k]||0, ne=evd[k]||0, dow=App.dow(k);
    cells+=`<button class="cell ${App.inMonth(k,m)?'':'out'} ${dow===0?'sun':''} ${dow===6?'sat':''} ${k===today?'today':''} ${k===sel?'sel':''}" type="button" data-jday="${k}" aria-label="${App.fmtDate(k)} 기록 ${nj}건 일정 ${ne}건">
      <span class="dn">${App.dateObj(k).getDate()}</span>
      ${(nj||ne)?`<span class="dots">${nj?`<i class="cdot" style="background:#e8b04b"></i>`:''}${ne?`<i class="cdot" style="background:#82a9e6"></i>`:''}</span>`:''}
    </button>`;
  }
  return `<div class="cal-h">
      <button class="nav" type="button" data-jm="-1" aria-label="지난 달">‹</button>
      <b>${y}년 ${mo}월</b>
      <button class="nav" type="button" data-jm="1" aria-label="다음 달">›</button>
    </div>
    <div class="cal">
      <div class="cal-wd">${['월','화','수','목','금','토','일'].map((d,i)=>`<div class="${i===5?'sat':i===6?'sun':''}">${d}</div>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
    </div>`;
}

/* 자동 항목 한 줄 */
function jRow(j){
  const t=j.time?`<span class="jr-t">${App.esc(j.time)}</span>`:'<span class="jr-t"></span>';
  const amt=+j.amount?`<span class="jr-amt">${App.money(j.amount)}원</span>`:'';
  const meta=[j.place,j.note].filter(Boolean).join(' · ');
  const tag=j.srcName?`<i class="jr-src" style="--c:${jSecColor(j.srcName)}">${App.esc(j.srcName)}</i>`:'';
  return `<button class="jrow" type="button" data-id="${j.id}">
    ${t}
    <span class="jr-b"><b>${App.esc(j.title)}</b>${meta?`<i>${App.esc(meta)}</i>`:''}</span>
    ${tag}${amt}
  </button>`;
}
function jSection(k,rows){
  const open=!!J_OPEN[k];
  const show=open?rows:rows.slice(0,3);
  const rest=rows.length-show.length;
  return `<div class="jsec">
    <div class="jsec-h" style="--c:${jSecColor(k)}">
      <span class="js-ico">${jSecIcon(k)}</span><b>${k}</b>
      <span class="js-n">${rows.length}건</span>
      ${rows.length>3?`<button class="jsec-toggle" type="button" data-sec="${k}">${open?'접기':'모두 보기'}</button>`:''}
    </div>
    <div class="jrows">${show.map(j=>jRow(j)).join('')}</div>
    ${rest>0?`<button class="jmore" type="button" data-sec="${k}" onclick="J_OPEN['${k}']=true;renderJournal()">＋${rest}건 더</button>`:''}
  </div>`;
}
function jSecIcon(k){
  const I=App.ICON;
  return ({'일정':I.schedule,'상담':I.counsel,'설교':I.sermons,'운동':I.dumbbell,
    '차량':I.car,'맛집':I.food,'보고':I.report,'내 기록':I.edit})[k]||I.journal;
}

function wonShort(n){
  n=+n||0;
  if(n>=10000){const v=Math.round(n/1000)/10;return (Number.isInteger(v)?v:v.toFixed(1))+'만'}
  if(n>=1000)return Math.round(n/1000)+'천';
  return n?String(n):'';
}

/* ── 기록 추가·수정 ─────────────────────────────────────────────
   자동으로 채운 항목을 열어 저장하면 그때부터 '사람이 쓴 기록'이 되어
   동기화가 덮어쓰지 않는다(auto:false 잠금). 지우면 그 출처는 다시 채우지 않는다. */
function journalEdit(id,date){
  const D=App.D;
  const j=id?D.journal.find(x=>x.id===id):{id:'',date:date,title:'',place:'',amount:'',time:'',cat:'admin',status:'done',note:'',by:''};
  if(!j)return;
  const cats=App.CATS.map(c=>`<button class="chip ${j.cat===c.id?'sel':''}" data-cat="${c.id}" style="${j.cat===c.id?'':`color:${c.color}`}"><span class="pt"></span>${c.name}</button>`).join('');
  const stats=Object.entries(App.STATUS).map(([k,s])=>`<button class="chip ${(j.status||'done')===k?'st-'+k:'sel'}" data-st="${k}" style="${(j.status||'done')===k?'':'color:'+s.color}"><span class="pt"></span>${s.label}</button>`).join('');
  App.sheet({
    title:id?'일지 수정':'일지 기록 추가',
    body:`${j.auto?`<p class="muted" style="margin:0 0 9px"><b style="color:#e8b04b">자동으로 채운 ${App.esc(j.srcName||'기록')}</b>입니다. 메모를 더하거나 고쳐 저장하면 내 기록이 되고, 그 뒤로는 자동으로 바뀌지 않습니다.</p>`:''}
      <label class="fld"><span>무슨 일</span><input id="jTitle" value="${App.esc(j.title)}" placeholder="예: 목회 일지 앱 제작·배포"></label>
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
    if(j.id){
      const cur=D.journal.find(x=>x.id===j.id);
      Object.assign(cur,rec);
      if(cur.auto){cur.auto=false;cur.srcName=cur.srcName||'';}   /* 손댄 항목은 잠근다 */
    }else{D.journal.push(rec)}
    App.save();App.closeSheet();D.ui.journalDate=rec.date;App.save();App.render();
    App.toast(j.id?(j.auto?'내 기록으로 저장했습니다':'수정했습니다'):'기록을 추가했습니다');
  };
  document.querySelector('[data-save]').onclick=save;
  document.querySelector('[data-x]').onclick=App.closeSheet;
  const del=document.querySelector('[data-del]');
  if(del)del.onclick=async()=>{
    if(await App.ask('이 기록을 삭제할까요?','삭제')){
      const cur=D.journal.find(x=>x.id===j.id);
      if(cur&&cur.auto&&cur.ref){D.autoOff=D.autoOff||[];if(D.autoOff.indexOf(cur.ref)<0)D.autoOff.push(cur.ref)}
      D.journal=D.journal.filter(x=>x.id!==j.id);App.save();App.render();App.toast('삭제했습니다');
    }
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
