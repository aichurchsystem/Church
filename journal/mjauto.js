/* 일지 자동 채움 — 앱이 이미 아는 자료로 그날 일지를 미리 채운다 (2026-11-26 목사님 지시)

   원칙
   1) 근거 있는 것만 넣는다. 자료가 없는 날은 비워 둔다(지어내지 않는다).
   2) 자동 항목은 auto:true + ref(출처 열쇠)로 표시한다. 같은 출처로 두 번 들어가지 않는다.
   3) 목사님이 일지에서 그 항목을 열어 저장하면 auto:false 로 잠긴다 — 이후 동기화가 덮어쓰지 않는다.
   4) 출처가 사라지면(일정 삭제 등) 자동 항목도 따라 사라진다. 사람이 손댄 항목은 남긴다.
   5) '자동 기록 지우기'로 지운 출처는 D.autoOff 에 남겨 다시 채우지 않는다.
   출처: 일정 · 차량 · 상담 · 설교 · 맛집 · 보고 · 운동 */
(function(){
const App=window.App;
if(!App)return;
const KEY_WORKOUT='workoutlog.v1';
const RP_BASE='../report/data/';
const FROM=-60, TO=120;             /* 미리 채우는 날 범위: 지난 60일 ~ 앞으로 120일 */
const SYNCABLE={ev:1,car:1,cs:1,fd:1,sr:1,wo:1};   /* 이번 계산으로 지울 수 있는 출처(보고는 따로) */

function pad(n){return String(n).padStart(2,'0')}
function num(n){n=+n||0;return n}
function hash(s){let h=0;s=String(s||'');for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0}return Math.abs(h).toString(36)}
function timed(e){return (e.start||'').length>10}
function money(n){try{return App.money(n)}catch(e){return String(n)}}
/* 쓴 글에서 앞부분을 줄여 요약문으로 쓴다 (지어내지 않고 적힌 말만 쓴다) */
function summarize(text,n){
  text=String(text||'').replace(/\s+/g,' ').trim();
  if(!text)return '';
  const cut=text.split(/(?:\.\s|\n|。|·\s)/)[0]||text;
  const s=cut.length<=n?cut:cut.slice(0,n-1).replace(/[\s,]+$/,'')+'…';
  return s;
}

/* ── 운동 기록(운동일지 앱과 같은 저장 키) ── */
function woSets(r){
  if(Array.isArray(r.setList)&&r.setList.length)return r.setList.reduce((a,s)=>a+((+s.reps)>0?1:0),0);
  const n=(r.s!=null?r.s:(r.sets!=null?r.sets:1));
  return Math.max(1,+n||1);
}
function woVol(r){
  if(Array.isArray(r.setList)&&r.setList.length)
    return r.setList.reduce((a,s)=>a+(num(s.kg)*num(s.reps)),0);
  if(r.vol!=null)return num(r.vol);
  return num(r.kg!=null?r.kg:r.w)*num(r.reps!=null?r.reps:r.r)*woSets(r);
}
function woFacts(){
  const out=[];
  let list=[];
  try{list=JSON.parse(localStorage.getItem(KEY_WORKOUT)||'[]')||[]}catch(e){list=[]}
  if(!Array.isArray(list))return out;
  const by={};
  list.forEach(r=>{if(r&&r.date)(by[r.date]=by[r.date]||[]).push(r)});
  Object.keys(by).forEach(dk=>{
    const rows=by[dk];
    const parts=[];rows.forEach(r=>{if(r.part&&parts.indexOf(r.part)<0)parts.push(r.part)});
    const exs=[];rows.forEach(r=>{if(r.ex&&exs.indexOf(r.ex)<0)exs.push(r.ex)});
    const sets=rows.reduce((a,r)=>a+woSets(r),0);
    const vol=rows.reduce((a,r)=>a+woVol(r),0);
    out.push({ref:'wo:'+dk,date:dk,time:'',title:'운동 · '+parts.join('·')+' '+exs.length+'종목',
      place:'',amount:0,cat:'etc',status:'done',src:'운동',
      note:exs.join(', ')+(sets?' — '+sets+'세트':'')+(vol?' · 총 볼륨 '+money(vol)+'kg':'')});
  });
  return out;
}

/* ── 보고 일지 분류 ── */
function rpCat(kind){
  const s=String(kind||'');
  if(/인쇄|발주|명함/.test(s))return 'print';
  if(/영상|쇼츠|썸네일|편집/.test(s))return 'video';
  if(/강의|교육|특강/.test(s))return 'lecture';
  if(/선교|청소년/.test(s))return 'mission';
  if(/앱|홈페이지|사이트|제작|디자인/.test(s))return 'admin';
  return 'etc';
}

/* ── 이번에 채울 사실 모으기 ── */
function collect(){
  const D=App.D||{};
  const F=[];
  /* 1) 일정 — 그날 구글 캘린더 일정 전부(예배 포함: 일지는 전체를 모은다) */
  (D.events||[]).forEach(e=>{
    if(!e||!e.summary||!e.start)return;
    const dk=App.evDate(e); if(!dk)return;
    const ch=App.chapterOf(e);
    F.push({ref:'ev:'+(e.uid||e.id),date:dk,
      time:timed(e)?(e.start||'').slice(11,16):'',
      title:e.summary,place:e.location||'',amount:0,
      cat:(ch?'church':'etc'),status:e.status||'plan',note:e.note||'',src:'일정'});
  });
  /* 2) 차량 — 그날 등록한 주유·정비·주차 등 (금액은 근거가 있을 때만) */
  (D.carExpenses||[]).forEach(c=>{
    if(!c||!c.date)return;
    const t=(App.CTYPE&&App.CTYPE(c.type))||{name:'차량'};
    const notes=[c.note,c.mileage?('주행 '+c.mileage+'km'):'',c.liters?(c.liters+'L'):''].filter(Boolean);
    F.push({ref:'car:'+(c.id||hash(c.date+c.type+c.amount)),date:c.date.slice(0,10),time:'',
      title:t.name,place:c.place||'',amount:num(c.amount),cat:'admin',status:'done',
      src:'차량',note:notes.join(' · ')});
  });
  /* 3) 상담 — 그날 상담 일지의 요약(대상 이름 · 주제 · 핵심 한두 줄). 원문을 통째로 붙이지 않는다 */
  (D.records||[]).forEach(r=>{
    if(!r||!r.date)return;
    const person=(D.people||[]).find(p=>p.id===r.personId);
    const body=String(r.content||'').replace(/\s+/g,' ').trim();
    const topic=String(r.topic||'').trim();
    if(!body&&!topic)return;                       /* 아무 글도 없으면 넣지 않는다 */
    const sum=summarize(body,90);
    const ttl=topic||summarize(body,26)||'상담';
    const note=[sum,r.next?('다음: '+String(r.next).trim()):''].filter(Boolean).join(' · ');
    F.push({ref:'cs:'+(r.id||hash(r.date+(person?person.name:'')+body)),date:r.date.slice(0,10),time:'',
      title:ttl,place:person?person.name:'',amount:0,cat:'church',status:'done',
      src:'상담',note:note});
  });
  /* 4) 설교 준비 — 그날 날짜가 잡힌 설교 */
  (D.sermons||[]).forEach(s=>{
    if(!s||!s.date)return;
    const th=(App.THEME&&App.THEME(s.theme))||{name:'설교'};
    F.push({ref:'sr:'+(s.id||hash(s.date+(s.title||''))),date:s.date,time:s.time||'',
      title:(s.title||th.name),place:s.place||'',amount:0,cat:'church',
      status:s.status==='done'?'done':'plan',src:'설교',
      note:[s.passage,s.status==='done'?'완성':'준비 중'].filter(Boolean).join(' · ')});
  });
  /* 5) 다녀온 곳 — 그날 남긴 방문 기록 */
  (D.restaurants||[]).forEach(r=>{
    if(!r)return;
    (r.visits||[]).forEach(v=>{
      if(!v||!v.date)return;
      F.push({ref:'fd:'+(v.id||hash(r.name+v.date)),date:v.date,time:'',
        title:(r.name||'다녀온 곳'),place:r.region||'',amount:0,cat:'etc',status:'done',src:'맛집',
        note:[r.menu,v.memo].filter(Boolean).join(' · ')});
    });
  });
  /* 6) 운동 — 그날 운동 기록 요약 한 줄 */
  woFacts().forEach(f=>F.push(f));
  return F;
}

/* ── 자동 채움 실행 ── */
App.autoFill=function(){
  const D=App.D; if(!D)return 0;
  D.journal=D.journal||[];
  D.autoOff=Array.isArray(D.autoOff)?D.autoOff:[];
  const off={};D.autoOff.forEach(r=>off[r]=1);
  const today=App.todayKey();
  const from=App.addDays(today,FROM), to=App.addDays(today,TO);
  const F=collect();
  const alive={};F.forEach(f=>{alive[f.ref]=1});
  let changed=0;
  F.forEach(f=>{
    if(!f.date||off[f.ref])return;
    if(f.date<from||f.date>to)return;              /* 범위 밖은 새로 만들지 않는다 */
    let it=D.journal.find(j=>j.ref===f.ref&&j.auto);
    if(it){
      const keys=['date','time','title','place','amount','cat','note'];
      keys.forEach(k=>{
        const a=(k==='amount')?(num(it[k])):(it[k]||'');
        const b=(k==='amount')?(num(f[k])):(f[k]||'');
        if(a!==b){it[k]=f[k];changed++}
      });
      if(f.src==='일정'&&f.status&&it.status!==f.status){it.status=f.status;changed++}
    }else{
      D.journal.push({id:App.uid('j'),date:f.date,time:f.time,title:f.title,place:f.place,
        amount:num(f.amount),cat:f.cat,status:f.status||'done',note:f.note||'',by:'',
        auto:true,ref:f.ref,srcName:f.src});
      changed++;
    }
  });
  /* 출처가 사라진 자동 항목 정리 (사람이 손댄 auto:false 항목은 그대로 둔다) */
  const keep=D.journal.length;
  D.journal=D.journal.filter(j=>{
    if(!j.auto||!j.ref)return true;
    const p=j.ref.slice(0,j.ref.indexOf(':'));
    if(!SYNCABLE[p])return true;                   /* 보고(rp:)는 보고 쪽 계산에서 따로 정리 */
    if(off[j.ref])return true;
    return !!alive[j.ref];
  });
  if(D.journal.length!==keep)changed++;
  if(changed)App.save();
  /* 일지 화면이 떠 있으면 숫자만 새로 그린다 */
  try{if(changed&&D.ui&&D.ui.tab==='journal'&&window.renderJournal)renderJournal()}catch(e){}
  return changed;
};

/* ── 보고 일지(에스더 보고)에서 그날 한 일을 가져온다 — 오늘·어제만 ── */
App.autoFillReport=function(){
  if(App._rpBusy)return;App._rpBusy=true;
  const today=App.todayKey(), yday=App.addDays(today,-1);
  let pending=0;
  const done=()=>{if(pending>0)pending--;if(pending<=0)App._rpBusy=false};
  fetch(RP_BASE+'index.json?t='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.json():[])
    .then(idx=>{
      const has=Array.isArray(idx)?idx:[];
      const days=[today,yday].filter(d=>!has.length||has.indexOf(d)>=0);
      pending=days.length||1;
      if(!days.length){App._rpBusy=false;return}
      days.forEach(dk=>fetchDay(dk));
    })
    .catch(()=>{App._rpBusy=false});
  function fetchDay(dk){
    fetch(RP_BASE+dk+'.json?t='+Date.now(),{cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(x=>{
        if(!x||!x.date){done();return}
        const D=App.D;let changed=0;
        const off={};(D.autoOff||[]).forEach(r=>off[r]=1);
        const seen={};
        (x.done||[]).forEach(it=>{
          if(!it||!it.title)return;
          const ref='rp:'+dk+':'+hash(it.title+'|'+(it.result||''));
          seen[ref]=1;
          if(off[ref])return;
          let j=D.journal.find(v=>v.ref===ref&&v.auto);
          if(j){
            if((j.note||'')!==(it.result||'')){j.note=it.result||'';changed++}
            if((j.title||'')!==it.title){j.title=it.title;changed++}
          }else{
            D.journal.push({id:App.uid('j'),date:dk,time:'',title:it.title,place:'',amount:0,
              cat:rpCat(it.kind),status:'done',note:it.result||'',by:'',auto:true,ref:ref,srcName:'보고'});
            changed++;
          }
        });
        /* 보고에서 빠진 자동 항목 정리 */
        const keep=D.journal.length;
        D.journal=D.journal.filter(j=>!(j.auto&&j.ref&&j.ref.indexOf('rp:'+dk+':')===0&&!seen[j.ref]));
        if(D.journal.length!==keep)changed++;
        if(changed){App.save();try{if(D.ui&&D.ui.tab==='journal'&&window.renderJournal)renderJournal()}catch(e){}}
        done();
      })
      .catch(()=>done());
  }
};

/* ── 일지 화면용 도움말 ── */
/* 그날 운동 요약 — 일지 한 줄 요약에 '운동 12세트'로 쓰인다 */
App.woSummary=function(dk){
  const out={sets:0,vol:0,exs:[],parts:[]};
  let list=[];
  try{list=JSON.parse(localStorage.getItem(KEY_WORKOUT)||'[]')||[]}catch(e){list=[]}
  if(!Array.isArray(list))return out;
  list.forEach(r=>{
    if(!r||r.date!==dk)return;
    out.sets+=woSets(r);out.vol+=woVol(r);
    if(r.ex&&out.exs.indexOf(r.ex)<0)out.exs.push(r.ex);
    if(r.part&&out.parts.indexOf(r.part)<0)out.parts.push(r.part);
  });
  return out;
};
App.autoInfo=function(dk){
  const out={n:0,by:{},sum:0};
  (App.D.journal||[]).forEach(j=>{
    if(j.date!==dk||!j.auto)return;
    out.n++;
    const s=j.srcName||'자동';
    out.by[s]=(out.by[s]||0)+1;
    out.sum+=num(j.amount);
  });
  return out;
};
/* 그날 자동 항목만 지우기 — 지운 출처는 다시 채우지 않는다 */
App.autoClear=function(dk){
  const D=App.D;
  D.autoOff=D.autoOff||[];
  let n=0;
  D.journal=(D.journal||[]).filter(j=>{
    if(j.date!==dk||!j.auto)return true;
    if(j.ref&&D.autoOff.indexOf(j.ref)<0)D.autoOff.push(j.ref);
    n++;return false;
  });
  if(n)App.save();
  return n;
};
})();
