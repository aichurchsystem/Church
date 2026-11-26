/* 박재용 목사 목회 일지 — core */
(function(){
const KEY='mj.v1';
const App={};
window.App=App;
/* 빌드 표시 — index.html의 <meta name="app-version"> 값과 다르면 옛 화면이므로 한 번 새로 연다 */
App.VERSION='20261126h1';

/* 일정 시간·남은 시간 — 메인과 캘린더가 함께 쓴다 */
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

App.CHAPTERS=[
  {id:'dawn',name:'새벽 예배',color:'#e8b04b'},
  {id:'presby',name:'노회',color:'#82a9e6'},
  {id:'assembly',name:'총회',color:'#b79cff'},
  {id:'church',name:'교회',color:'#57ce93'},
  {id:'counsel',name:'상담',color:'#6fd2d2'}
];
App.CATS=[
  {id:'church',name:'교회',color:'#57ce93'},
  {id:'mission',name:'선교회',color:'#6fd2d2'},
  {id:'lecture',name:'강의',color:'#b79cff'},
  {id:'admin',name:'행정',color:'#82a9e6'},
  {id:'print',name:'인쇄',color:'#f0a86b'},
  {id:'video',name:'영상',color:'#f08ba8'},
  {id:'etc',name:'기타',color:'#9aa8bd'}
];
App.STATUS={
  plan:{label:'예정',color:'#82a9e6'},
  done:{label:'완성',color:'#57ce93'},
  hold:{label:'보류',color:'#e8b04b'},
  todo:{label:'미완성',color:'#ef7373'}
};
App.SSTATUS={
  prep:{label:'준비중',color:'#82a9e6'},
  done:{label:'완성',color:'#57ce93'},
  hold:{label:'보류',color:'#e8b04b'}
};
App.THEMES=[
  {id:'dawn',name:'새벽 예배',color:'#e8b04b'},
  {id:'wed',name:'수요 예배',color:'#82a9e6'},
  {id:'night',name:'철야 예배',color:'#b79cff'},
  {id:'sun',name:'주일 예배',color:'#57ce93'},
  {id:'dream',name:'꿈이 있는 예배',color:'#f08ba8'},
  {id:'ext',name:'외부 강의',color:'#f0a86b'}
];
/* 캘린더 분류 — 일정 이름에서 종류를 읽어 색으로 구분 */
App.CALCATS=[
  {id:'worship',name:'설교·예배',color:'#e8b04b'},
  {id:'lecture',name:'강의',color:'#b79cff'},
  {id:'counsel',name:'상담·심방',color:'#6fd2d2'},
  {id:'move',name:'이동',color:'#82a9e6'},
  {id:'admin',name:'행정·모임',color:'#57ce93'},
  {id:'personal',name:'개인',color:'#e69ab4'}
];
App.calCatId=function(e){
  const s=(e&&e.summary)||'';
  if(e&&e.lecture)return 'lecture';
  if(/예배|설교|집회|부흥|성회|수련회|캠프|바이블|컨퍼런스/.test(s)){
    return /특강|강의|강연|세미나|포럼/.test(s)?'lecture':'worship';
  }
  if(/강의|특강|교육|세미나|훈련|포럼|강연|설명회|고시/.test(s))return 'lecture';
  if(/상담|심방|문병|면담|위로|장례|결혼|예식/.test(s))return 'counsel';
  if(/이동|출발|도착|비행|항공|기차|KTX|드라이브|픽업|샌딩|탑승|Flight|이동 중/.test(s))return 'move';
  if(/노회|총회|위원회|회의|임직|취임|위촉|간담회|협의|행정|준비|박람회|인쇄|촬영|영상|업무/.test(s))return 'admin';
  return 'personal';
};
App.calCat=function(e){const id=App.calCatId(e);return App.CALCATS.find(c=>c.id===id)||App.CALCATS[5]};
App.CAT=id=>App.CATS.find(c=>c.id===id)||App.CATS[6];
App.THEME=id=>App.THEMES.find(t=>t.id===id)||App.THEMES[0];
App.chapter=id=>App.CHAPTERS.find(c=>c.id===id)||App.CHAPTERS[0];
/* 챕터 표시 — 빈 값은 '미분류' (App.chapter는 빈 값을 새벽으로 돌려 주기 때문에 따로 쓴다) */
App.chapterInfo=id=>App.CHAPTERS.find(c=>c.id===id)||{id:'',name:'미분류',color:'#9aa8bd'};
/* ── 일정 → 챕터 분류 (2026-11-26 목사님 지시: 캘린더 일정을 스케줄의 챕터별로 모은다) ──
   일정에 chapter가 적혀 있으면 그 뜻을 먼저 존중한다(직접 넣은 것·미분류로 되돌린 것).
   아니면 제목·장소의 말로 알아보고, 챕터에 안 맞는 일(강의·인쇄·행정·개인 일정)은
   억지로 넣지 않고 '미분류'로 남긴다. */
const CH_RULES=[
  ['presby',/노회/],
  ['assembly',/총회|영성수련회|영성대회|스텝\s*모임/],
  ['counsel',/상담|심방|문병|면담|위로|장례|병원|입원|수술|시술|퇴원/],
  ['dawn',/새벽/],
  ['church',/예배|설교|주보|교회|성회|부흥|집회|수련회|캠프|바이블|컨퍼런스|임직|취임|장로|권사|안수|세례|성찬|구역|전도|제직|선교|기도회|목회|축도/]
];
App.chapterOf=function(e){
  if(!e)return '';
  if(e.chapter!==undefined&&e.chapter!==null)return e.chapter;
  const s=(e.summary||'')+' '+(e.location||'');
  for(let i=0;i<CH_RULES.length;i++){if(CH_RULES[i][1].test(s))return CH_RULES[i][0]}
  return '';
};

/* ── state ── */
function pad(n){return String(n).padStart(2,'0')}
App.todayKey=function(d){d=d||new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
App.dateObj=function(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
App.addDays=function(k,n){const d=App.dateObj(k);d.setDate(d.getDate()+n);return App.todayKey(d)};
App.DW=['일','월','화','수','목','금','토'];
App.dow=function(k){return App.dateObj(k).getDay()};
App.fmtDate=function(k,withYear){const d=App.dateObj(k);return `${withYear?d.getFullYear()+'년 ':''}${d.getMonth()+1}월 ${d.getDate()}일`};
App.fmtDateLong=function(k){const d=App.dateObj(k);return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${App.DW[d.getDay()]}요일`};
App.mondayOf=function(k){const d=App.dateObj(k);const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return App.todayKey(d)};
App.money=function(n){n=Number(n)||0;return n.toLocaleString('ko-KR')};
App.uid=function(p){return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
App.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
App.nl=function(s){return App.esc(s).replace(/\n/g,'<br>')};
App.ledger=function(s){return String(s||'').replace(/[^0-9-]/g,'')};

/* ── persisted data ── */
function blank(){
  return {
    v:1,
    journal:[], tasks:[], verses:[], people:[], records:[],
    events:(window.SEED_EVENTS||[]).map(e=>Object.assign({},e)),
    notes:[], sermons:[],
    vehicles:[{id:'v1',name:'카니발',model:'기아 카니발 4세대 하이브리드',color:'검은색',roof:true,
      plate:'',year:'',mileage:'',insurance:'',inspection:'',tire:'',image:''}],
    carExpenses:[], restaurants:[],
    ui:{tab:'home',journalDate:App.todayKey(),chapter:'dawn',counselId:null,
        calMonth:App.todayKey().slice(0,7),calDate:App.todayKey(),calFilter:'all',
        calTab:'month',schMonth:false,noteTheme:'',noteTag:'',noteQ:'',sermonTheme:'dawn',carFilter:'',
        foodQ:'',foodRegion:''}
  };
}
let D=null;
App.load=function(){
  try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);D=Object.assign(blank(),p);
    D.ui=Object.assign(blank().ui,p.ui||{});
    if(!Array.isArray(D.events)||!D.events.length)D.events=(window.SEED_EVENTS||[]).map(e=>Object.assign({},e));
  }else{D=blank()}}catch(e){console.warn(e);D=blank()}
  App.D=D;
  if(window.SEED_RESTAURANTS&&window.SEED_RESTAURANTS.length){
    /* 처음이거나, 초기 목록이 늘어난 새 버전이면 한 번만 더 심는다(같은 이름·주소는 건너뜀) */
    var _sv='';try{_sv=localStorage.getItem('mj.seedVer')||''}catch(e){}
    if(!D.restaurants.length||_sv!=='20261126h1'){
      try{App.foodSeed()}catch(e){console.warn(e)}
      try{localStorage.setItem('mj.seedVer','20261126h1')}catch(e){}
    }
  }
  return D;
};
App.save=function(){
  try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){App.toast('저장 공간이 부족합니다')}
};
App.resetEvents=function(){
  const keep={};D.events.forEach(e=>{if(e.uid)keep[e.uid]=e});
  D.events=(window.SEED_EVENTS||[]).map(e=>{
    const old=keep[e.uid];
    return old?Object.assign({},e,{status:old.status||'plan',note:old.note||'',lecture:old.lecture,org:old.org,audience:old.audience,fee:old.fee,id:old.id}):Object.assign({},e);
  });
  App.save();App.render();
};

/* ── dom helpers ── */
App.$=s=>document.querySelector(s);
App.$$=s=>Array.from(document.querySelectorAll(s));
App.h=function(html){const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild};

App.toast=function(msg){
  let t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('on');
  clearTimeout(App._tt);App._tt=setTimeout(()=>t.classList.remove('on'),2100);
};

App.sheet=function({title,body,footer,wide}){
  const sc=document.getElementById('scrim');
  sc.innerHTML=`<div class="sheet" role="dialog" aria-modal="true">
    <div class="sheet-h"><h3>${App.esc(title)}</h3><button class="x" data-x aria-label="닫기">✕</button></div>
    <div class="sheet-b">${body||''}</div>
    ${footer?`<div class="sheet-f">${footer}</div>`:''}
  </div>`;
  sc.classList.add('on');
  sc.querySelector('[data-x]').onclick=App.closeSheet;
  sc.onclick=e=>{if(e.target===sc)App.closeSheet()};
  document.body.style.overflow='hidden';
  return sc.querySelector('.sheet');
};
App.closeSheet=function(){
  const sc=document.getElementById('scrim');sc.classList.remove('on');sc.innerHTML='';
  document.body.style.overflow='';
};
App.ask=function(msg,okLabel){
  return new Promise(res=>{
    App.sheet({title:'확인',body:`<p style="margin:0;font-size:14.5px;line-height:1.6">${App.nl(msg)}</p>`,
      footer:`<button class="btn" data-no>취소</button><button class="btn danger" data-yes>${App.esc(okLabel||'삭제')}</button>`});
    document.querySelector('[data-no]').onclick=()=>{App.closeSheet();res(false)};
    document.querySelector('[data-yes]').onclick=()=>{App.closeSheet();res(true)};
  });
};

/* ── navigation ── */
/* 2026-11-26 목사님 지시로 탭 구성 정리: 캘린더·메모는 탭에서 내리고(화면·자료는 보존)
   그 자리에 운동(운동일지)을 넣었다. 순서: 홈·일지·스케줄·상담·설교·차량·다녀온 곳·보고·운동 */
App.TABS=[
  {id:'home',name:'홈'},{id:'journal',name:'일지'},{id:'schedule',name:'스케줄'},
  {id:'counsel',name:'상담'},{id:'sermons',name:'설교'},
  {id:'vehicle',name:'차량'},{id:'food',name:'다녀온 곳'},{id:'report',name:'보고'},
  {id:'workout',name:'운동'}
];
/* 탭에서 내렸지만 화면·자료는 살려 두는 것 (다시 올릴 때 여기서 꺼내 쓴다)
   calendar: 일정은 스케줄 화면이 맡는다 / notes: 목회 메모 */
App.HIDDEN=[{id:'calendar',name:'캘린더'},{id:'notes',name:'메모'}];
App.TAB=id=>App.TABS.find(t=>t.id===id)||App.HIDDEN.find(t=>t.id===id)||App.TABS[0];
/* 하단 바 탭 — 폰에서는 가로로 밀어서 본다(더보기 없음) */
App.PRIMARY=['home','journal','schedule','counsel','sermons','vehicle','food','report','workout'];
App.MORE=[];
App.TABICON={home:'home',journal:'journal',schedule:'schedule',counsel:'counsel',calendar:'calendar',notes:'notes',sermons:'sermons',vehicle:'car',food:'food',report:'report',workout:'dumbbell'};
/* 탭이 아닌 화면 — 표지(첫 화면)와 관리자, 그리고 내려 둔 화면 */
App.EXTRA=['cover','admin','calendar'];   /* 메모는 화면에서 완전히 내렸다(자료는 보존) */
App.isScreen=function(tab){return App.TABS.some(t=>t.id===tab)||App.EXTRA.indexOf(tab)>=0};
/* 이전 화면 이력 — ← 버튼과 폰의 뒤로 가기가 같은 길을 쓴다.
   화면을 옮길 때마다 App._stack에 쌓고, 실제 되돌아가기는 브라우저 history가 맡는다.
   (날짜 바꾸기·일정 펼치기 같은 화면 안의 변화는 이력에 쌓지 않는다) */
App._stack=[];
App.canBack=function(){return App._stack.length>0};
App.back=function(){
  if(!App._stack.length)return false;
  try{history.back();return true}catch(e){}
  const t=App._stack.pop();App.go(t,{back:true});return true;
};
App.go=function(tab,opt){
  opt=opt||{};
  if(!App.isScreen(tab))tab='home';
  const prev=App._tab;
  if(prev&&prev!==tab)App._scroll[prev]=window.scrollY||0;
  if(prev&&prev!==tab){
    if(!opt.back){App._stack.push(prev);if(App._stack.length>40)App._stack.shift();}
    try{if(!opt.back)history.pushState({mj:tab},'');}catch(e){}
  }
  if(tab==='cover')App._stack=[];
  D.ui.tab=tab;App.save();
  App._tab=tab;
  App.syncTabs();App.syncNav();
  document.body.classList.toggle('is-home',tab==='home');
  document.body.classList.toggle('is-cover',tab==='cover');
  document.body.classList.toggle('is-admin',tab==='admin');
  App.$$('.screen').forEach(s=>s.classList.toggle('on',s.id==='sc-'+tab));
  App.render();
  if(tab==='home'||tab==='cover'){window.scrollTo({top:0,behavior:'instant'})}
  else{const y=App._scroll[tab]||0;window.scrollTo({top:y,behavior:'instant'});}
  /* 구글 캘린더 연동은 캘린더 탭 대신 스케줄 화면을 열 때 돈다 */
  if(tab==='schedule'&&window.GCal)window.GCal.maybeSync();
};
window.addEventListener('popstate',function(){
  try{
    if(!App._stack.length){App.go('cover',{back:true});return}
    App.go(App._stack.pop(),{back:true});
  }catch(e){console.error('[back]',e)}
});
/* ← 이전 버튼 상태 — 첫 화면(이력 없음)에서는 흐리게 */
App.syncNav=function(){
  const b=document.getElementById('btnBack');
  if(!b)return;
  const on=App.canBack();
  b.classList.toggle('off',!on);
  b.setAttribute('aria-disabled',on?'false':'true');
};
/* 화면 하나를 그린다. 실패해도 빈 화면을 남기지 않고 안내와 다시 그리기를 보여 준다 */
App.render=function(){
  const t=D.ui.tab;
  const names={cover:'renderCover',home:'renderHome',journal:'renderJournal',schedule:'renderSchedule',counsel:'renderCounsel',
    calendar:'renderCalendar',notes:'renderNotes',sermons:'renderSermons',vehicle:'renderVehicle',food:'renderFood',
    report:'renderReport',workout:'renderWorkout',admin:'renderAdmin'};
  let err=null;
  try{
    const fn=window[names[t]||''];
    if(typeof fn!=='function'){
      if(t==='home')App.homeFallback();
      else throw new Error(t+' 화면 스크립트를 불러오지 못했습니다');
    }else fn();
  }catch(e){err=e;console.error('[render]',t,e)}
  try{
    const el=document.getElementById('sc-'+t);
    if(el&&!el.innerHTML.trim())App.screenFallback(el,t,err);
  }catch(e){console.error(e)}
};
/* 스크립트가 일부 빠져도 메인은 타일 메뉴로 그려진다 */
App.homeFallback=function(){
  const el=document.getElementById('sc-home');
  if(!el)return;
  try{document.body.classList.add('is-home');if(App.D&&App.D.ui)App.D.ui.tab='home'}catch(e){}
  const tiles=[['report','에스더 보고'],['journal','오늘 일지'],['schedule','스케줄'],['counsel','상담 일지'],
    ['sermons','설교 준비'],['vehicle','차량 관리'],['food','다녀온 곳'],['workout','운동일지']];
  el.innerHTML=`<div class="mnhome"><div class="mntiles">${tiles.map(([id,name])=>
    `<button class="mtile" type="button" data-action="tab" data-tab="${id}" style="--c:#82a9e6">
      <b>${name}</b><span class="mt-sub">열기</span></button>`).join('')}</div>
    <div class="mn-foot2">박재용 목사 · 글로벌비전교회 담임 · GV청소년선교회 대표</div></div>`;
};
App.screenFallback=function(el,tab,err){
  const name=(App.TAB(tab)||{}).name||tab;
  el.innerHTML=`<div class="mn-boot">
    <b>${App.esc(name)} 화면을 그리지 못했습니다</b>
    <span>잠시 뒤 다시 눌러 주세요. 계속 이러면 앱을 한 번 새로 열면 해결됩니다.</span>
    <div class="mn-boot-b">
      <button class="btn sm" type="button" data-action="tab" data-tab="home">메인으로</button>
      <button class="btn sm primary" type="button" data-action="reload">다시 열기</button>
    </div></div>`;
};

/* ── shared small builders ── */
App.statusChip=function(st){const s=App.STATUS[st]||App.STATUS.plan;return `<span class="chip st-${st}"><span class="pt"></span>${s.label}</span>`};
App.catChip=function(id){const c=App.CAT(id);return `<span class="chip" style="color:${c.color}"><span class="pt"></span>${c.name}</span>`};
App.stat=function(label,value,cls){return `<div class="stat ${cls||''}"><span class="l">${label}</span><span class="v">${value}</span></div>`};
App.empty=function(title,sub,icon){
  return `<div class="empty">${icon||''}<b>${App.esc(title)}</b><span>${sub||''}</span></div>`;
};
App.monthOf=function(k){return k.slice(0,7)};
App.inMonth=function(k,m){return (k||'').slice(0,7)===m};

/* ── events helpers ── */
App.evDate=function(e){return (e.start||'').slice(0,10)};
App.evTime=function(e){
  const s=e.start||'';
  if(s.length<=10)return '종일';
  return s.slice(11,16);
};
App.lectureLike=function(e){
  if(e.lecture)return true;
  return /강의|특강|교육|세미나|훈련|설명회|포럼|강연/.test(e.summary||'');
};

/* ── export / import ── */
App.download=function(name,text,type){
  const blob=new Blob([text],{type:type||'application/json;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
};
App.exportAll=function(){
  App.download(`목회일지-백업-${App.todayKey()}.json`,JSON.stringify(D,null,1));
  App.toast('백업 파일을 내보냈습니다');
};
App.importAll=function(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const p=JSON.parse(r.result);
      if(!p||typeof p!=='object')throw 0;
      D=Object.assign(blank(),p,{ui:Object.assign(blank().ui,p.ui||{})});
      App.D=D;App.save();App.go(D.ui.tab||'home');
      App.toast('데이터를 가져왔습니다');
    }catch(e){App.toast('파일을 읽을 수 없습니다')}
  };
  r.readAsText(file);
};

/* ── 하단 탭바 (아이콘과 글자 모두 누를 수 있게) ── */
const ICON_MORE=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h.01M4 12h.01M4 17h.01"/><path d="M9.5 7H20M9.5 12H20M9.5 17H20"/></svg>`;
/* 아이콘 스크립트가 빠져도 탭바는 그려지게 */
App.icon=function(name){try{return (App.ICON&&App.ICON[name])||''}catch(e){return ''}};
/* 탭 아이콘은 컬러 그림(없으면 선 아이콘) */
App.cicon=function(name){try{return (App.CICON&&App.CICON[name])||App.icon(name)}catch(e){return App.icon(name)}};
function tabHTML(id){
  const t=App.TAB(id);
  const k=App.TABICON[id]||id;
  return `<button class="tab" type="button" data-action="tab" data-tab="${id}" aria-label="${t.name}">
    <span class="ti">${App.cicon(k)}</span><span class="tl">${t.name}</span><i class="dotb"></i>
  </button>`;
}
function buildTabs(){
  const bar=document.getElementById('tabs');
  /* 더보기 안에 넣을 탭이 없으면 더보기 버튼도 만들지 않는다 (2026-11-26 탭 9개를 바로 보이게) */
  bar.innerHTML=App.PRIMARY.map(tabHTML).join('')
    +(App.MORE.length?`<button class="tab" type="button" data-action="more" aria-label="더보기"><span class="ti">${ICON_MORE}</span><span class="tl">더보기</span></button>`:'');
  App._tabs=App.MORE.length?[...App.PRIMARY,'more']:[...App.PRIMARY];
}
App.syncTabs=function(){
  const cur=D.ui.tab;
  App.$$('#tabs .tab').forEach(b=>{
    const id=b.dataset.tab||'more';
    const on=id==='more'?App.MORE.includes(cur):id===cur;
    b.classList.toggle('on',on);
    b.setAttribute('aria-current',on?'page':'false');
    /* 탭이 많아 폰에서는 가로로 밀어 본다 — 지금 화면의 탭이 보이게 맞춰 준다 */
    if(on&&b.scrollIntoView){
      try{const bar=document.getElementById('tabs');
        if(bar&&bar.scrollWidth>bar.clientWidth+4){
          const l=b.offsetLeft-bar.clientWidth/2+b.offsetWidth/2;
          bar.scrollTo({left:Math.max(0,l),behavior:'smooth'});
        }
      }catch(e){}
    }
  });
};
App.moreSheet=function(){
  const rows=App.MORE.map(id=>{
    const t=App.TAB(id);
    return `<button class="more-i" type="button" data-action="tab" data-tab="${id}">
      <span class="mi">${App.icon(App.TABICON[id]||id)}</span><b>${t.name}</b>
      <span class="mhint">${({notes:'목회 메모·아이디어',sermons:'설교 준비 노트',vehicle:'주유·정비·보험 기록',food:'다녀온 식당·숙소',report:'에스더가 매일 정리한 보고'})[id]||''}</span>
    </button>`;
  }).join('');
  App.sheet({title:'더보기',body:`<div class="more-grid">${rows}</div>`,
    footer:`<button class="btn" data-action="install-guide">홈 화면에 추가</button><button class="btn primary" data-action="sheet-close">닫기</button>`});
};

/* ── 이벤트 위임 — 화면을 다시 그려도 핸들러가 사라지지 않는다 ── */
App.ACT={
  tab:el=>{const id=el.dataset.tab;App.closeSheet();App.go(id)},
  'enter':()=>App.go('home'),      /* 표지를 눌러 타일 메인으로 */
  'cover':()=>App.go('cover'),     /* 메인에서 표지로 돌아가기 */
  more:()=>App.moreSheet(),
  'sheet-close':()=>App.closeSheet(),
  'reload':()=>location.reload(),
  'install-guide':()=>{App.closeSheet();App.installGuide()},
  'install-dismiss':()=>{try{localStorage.setItem('mj.installHide','1')}catch(e){};App.render()},
  'gcal-sync':()=>{if(window.GCal)window.GCal.sync(true)},
  'cal-tab':el=>{App.D.ui.calTab=el.dataset.view;App.save();renderCalendar()},
  'cal-move':el=>{const m=App.D.ui.calMonth;const [y,mm]=m.split('-').map(Number);
    const d=new Date(y,mm-1+ +el.dataset.step,1);
    App.D.ui.calMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;App.save();renderCalendar()},
  'cal-today':()=>{App.D.ui.calMonth=App.todayKey().slice(0,7);App.D.ui.calDate=App.todayKey();App.save();renderCalendar()},
  'cal-day':el=>{App.D.ui.calDate=el.dataset.date;App.save();renderCalendar()},
  'cal-weekmove':el=>{App.D.ui.calWeek=App.addDays(App.D.ui.calWeek||App.mondayOf(App.todayKey()),7*(+el.dataset.step));App.save();renderCalendar()},
  'ev-add':el=>eventEdit(null,el.dataset.date||App.D.ui.calDate),
  'ev-open':el=>{calOpen=calOpen===el.dataset.ev?null:el.dataset.ev;App.render()},
  'ev-edit':el=>eventEdit(el.dataset.ev),
  'ev-tojournal':el=>eventToJournal(el.dataset.ev),
  'ev-status':el=>{const [id,st]=el.dataset.set.split('|');const ev=App.D.events.find(x=>x.id===id);if(!ev)return;
    ev.status=st;App.save();App.render();App.toast(App.STATUS[st].label+'으로 바뀔습니다')},
  /* 일정을 챕터에 직접 넣기 / 미분류로 되돌리기 */
  'ev-chapter':el=>{const [id,ch]=el.dataset.set.split('|');const ev=App.D.events.find(x=>x.id===id);if(!ev)return;
    ev.chapter=ch||'';App.save();App.render();
    App.toast(ch?App.chapter(ch).name+'에 넣었습니다':'미분류로 되돌렸습니다')},
  'ev-note':el=>{const ev=App.D.events.find(x=>x.id===el.dataset.ev);if(ev){ev.note=el.value;App.save();App.toast('메모를 저장했습니다')}},
  ledger:()=>{},
  'car-add':el=>carExpenseEdit(null,el.dataset.type||''),
  'car-filter':el=>{App.D.ui.carFilter=el.dataset.cf;App.save();renderVehicle()},
  'car-open':el=>carExpenseEdit(el.dataset.ce),
  'car-vedit':()=>vehicleEdit(App.car().id),
  'car-vimg':()=>carPhoto(),
  'lecture-edit':el=>lectureEdit(el.dataset.ev),
  'go-cal-day':el=>{App.D.ui.calDate=el.dataset.date;App.D.ui.calMonth=(el.dataset.date||'').slice(0,7);App.save();App.go('schedule')},
  'ics':()=>openIcs(),
  'food-open':el=>{App.go('food');setTimeout(()=>foodDetail(el.dataset.food),120)}
};
document.addEventListener('click',function(e){
  const el=e.target.closest('[data-action]');
  if(!el)return;
  const fn=App.ACT[el.dataset.action];
  if(!fn)return;
  if(el.tagName==='BUTTON'||el.tagName==='A')e.preventDefault();
  try{fn(el)}catch(err){console.error('[action]',el.dataset.action,err)}
});

/* ── 설치·연동 안내 ── */
App.standalone=function(){
  return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;
};
App.installGuide=function(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  App.sheet({title:'홈 화면에 추가',body:`
    <div class="iguide">
      <div class="ig-row"><b>안드로이드 · Chrome</b><span>오른쪽 위 ⋮ 메뉴 → <b>앱 설치</b> (또는 홈 화면에 추가)를 누르면 바탕화면에 아이콘이 생깁니다.</span></div>
      <div class="ig-row"><b>아이폰 · 아이패드 · Safari</b><span>아래 <b>공유</b> 버튼 → <b>홈 화면에 추가</b> → 추가. 아이콘을 누르면 앱처럼 열립니다.</span></div>
      <div class="ig-row"><b>태블릿 · 갤럭시 · PC</b><span>Chrome 주소창의 <b>설치</b> 아이콘을 누르거나 메뉴에서 앱 설치를 고릅니다.</span></div>
      <p class="muted" style="margin:10px 0 0">같은 주소를 열면 폰·태블릿·PC 어디서나 같은 일지를 씁니다.</p>
    </div>`,footer:`<button class="btn primary" data-action="sheet-close">확인</button>`});
};

/* ── boot ── */
App.init=function(){
  /* 한 단계가 실패해도 나머지는 계속 진행한다 — 메인이 비지 않게 */
  const step=function(fn,name){try{fn()}catch(e){console.error('[boot]',name||'',e)}};
  step(App.load,'load');
  App._scroll={};App._tab=null;
  /* 메모 화면은 2026-11-26 내렸다. 남아 있던 자료는 지우지 않고 한 번 파일로 내려받게 한다 */
  step(()=>{
    try{
      const n=App.D.notes||[];
      if(n.length&&!localStorage.getItem('mj.notesBackup')){
        App.download('notes-backup-20261126.json',
          JSON.stringify({exportedAt:new Date().toISOString(),note:'목회 메모 화면을 내리며 남긴 백업',notes:n},null,1));
        localStorage.setItem('mj.notesBackup','1');
      }
    }catch(e){console.warn('[notes-backup]',e)}
  },'notes-backup');
  /* 앱이 이미 아는 자료로 그날 일지를 미리 채운다 (일정·차량·상담·설교·맛집·보고·운동) */
  step(()=>{if(App.autoFill)App.autoFill()},'autofill');
  /* 에스더 보고(오늘·어제)에서 그날 한 일도 가져온다 — 네트워크가 없으면 조용히 넘어간다 */
  step(()=>{if(App.autoFillReport)App.autoFillReport()},'autofill-report');
  /* 목사님이 고르신 배경 화면 (관리자 → 배경 화면) */
  step(()=>{if(App.bgApply)App.bgApply()},'bg');
  step(buildTabs,'tabs');
  step(()=>{
    /* 앱을 열면 언제나 표지부터. 표지를 눌러 들어간 뒤에는 탭 이동은 지금처럼.
       다만 주소에 ?tab=report 처럼 화면을 지정하면(보고 일지 안내용) 그 화면으로 바로 간다. */
    let want='cover';
    try{
      const q=/[?&]tab=([a-z]+)/.exec(location.search);
      const h=(location.hash||'').replace(/^#/,'');
      const t=(q&&q[1])||h;
      if(t&&App.isScreen(t))want=t;
    }catch(e){}
    App.go(want);
  },'home');
  step(()=>{
    const d=new Date();
    document.getElementById('barDate').textContent=`${d.getMonth()+1}월 ${d.getDate()}일 ${App.DW[d.getDay()]}요일`;
  },'date');
  step(()=>{
    const bb=document.getElementById('btnBack');
    if(bb)bb.onclick=()=>{if(App.canBack())App.back()};
    document.getElementById('btnExport').onclick=App.exportAll;
    document.getElementById('btnImport').onclick=()=>document.getElementById('fileImport').click();
    document.getElementById('fileImport').onchange=e=>{const f=e.target.files[0];if(f)App.importAll(f);e.target.value=''};
    const bh=document.getElementById('btnHome');
    if(bh)bh.onclick=()=>App.go('home');         /* 상세 화면 → 메인 */
  },'buttons');
  document.addEventListener('keydown',e=>{if(e.key==='Escape')App.closeSheet()});
  document.addEventListener('change',e=>{
    const t=e.target.closest&&e.target.closest('[data-action="ev-note"]');
    if(!t)return;
    const ev=App.D.events.find(x=>x.id===t.dataset.ev);
    if(ev){ev.note=t.value;App.save();App.toast('메모를 저장했습니다')}
  });
  step(()=>{if(window.GCal)window.GCal.sync()},'gcal');   // 구글 캘린더 자동 연동
  document.documentElement.classList.add('ready');
  window.__mjBooted=true;                     // 인라인 감시기가 빈 화면을 덮지 않게
};
/* 옛 index.html이 남아 있으면(버전 불일치) 캐시를 피해 한 번만 새로 연다 */
App.versionCheck=function(){
  try{
    const meta=document.querySelector('meta[name="app-version"]');
    const htmlV=(window.APP_VERSION||(meta&&meta.content)||'').trim();
    if(!htmlV||htmlV===App.VERSION)return false;
    const k='mj.reload.'+App.VERSION;
    if(sessionStorage.getItem(k))return false;
    sessionStorage.setItem(k,'1');
    location.replace(location.pathname+'?v='+App.VERSION+'&t='+Date.now());
    return true;
  }catch(e){return false}
};
document.addEventListener('DOMContentLoaded',function(){
  if(App.versionCheck())return;
  App.init();
});
})();
