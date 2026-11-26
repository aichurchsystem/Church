/* 박재용 목사 목회 일지 — core */
(function(){
const KEY='mj.v1';
const App={};
window.App=App;

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
        calTab:'month',noteTheme:'',noteTag:'',noteQ:'',sermonTheme:'dawn',carFilter:'',
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
  if(!D.restaurants.length&&window.SEED_RESTAURANTS&&window.SEED_RESTAURANTS.length){try{App.foodSeed()}catch(e){console.warn(e)}}
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
App.TABS=[
  {id:'home',name:'메인'},{id:'journal',name:'일지'},{id:'schedule',name:'스케줄'},
  {id:'counsel',name:'상담'},{id:'calendar',name:'캘린더'},{id:'notes',name:'메모'},
  {id:'sermons',name:'설교'},{id:'vehicle',name:'차량'},{id:'food',name:'다녀온 곳'}
];
App.TAB=id=>App.TABS.find(t=>t.id===id)||App.TABS[0];
/* 하단 바에 늘 보이는 탭 — 나머지는 '더보기' 안에 */
App.PRIMARY=['home','journal','schedule','calendar','counsel'];
App.MORE=['notes','sermons','vehicle','food'];
App.TABICON={home:'home',journal:'journal',schedule:'schedule',counsel:'counsel',calendar:'calendar',notes:'notes',sermons:'sermons',vehicle:'car',food:'food'};
App.go=function(tab){
  if(!App.TABS.some(t=>t.id===tab))tab='home';
  if(App._tab&&App._tab!==tab)App._scroll[App._tab]=window.scrollY||0;
  D.ui.tab=tab;App.save();
  App._tab=tab;
  App.syncTabs();
  App.$$('.screen').forEach(s=>s.classList.toggle('on',s.id==='sc-'+tab));
  App.render();
  const y=App._scroll[tab]||0;
  window.scrollTo({top:y,behavior:'instant'});
  if(tab==='calendar'&&window.GCal)window.GCal.maybeSync();
};
App.render=function(){
  const t=D.ui.tab;
  try{
    if(t==='home')renderHome();
    else if(t==='journal')renderJournal();
    else if(t==='schedule')renderSchedule();
    else if(t==='counsel')renderCounsel();
    else if(t==='calendar')renderCalendar();
    else if(t==='notes')renderNotes();
    else if(t==='sermons')renderSermons();
    else if(t==='vehicle')renderVehicle();
    else if(t==='food')renderFood();
  }catch(e){console.error(e);}
};

/* ── shared small builders ── */
App.statusChip=function(st){const s=App.STATUS[st]||App.STATUS.plan;return `<span class="chip st-${st}"><span class="pt"></span>${s.label}</span>`};
App.catChip=function(id){const c=App.CAT(id);return `<span class="chip" style="color:${c.color}"><span class="pt"></span>${c.name}</span>`};
App.stat=function(label,value,cls){return `<div class="stat ${cls||''}"><span class="l">${label}</span><span class="v">${value}</span></div>`};
App.empty=function(title,sub,icon){
  return `<div class="empty">${icon||''}<b>${App.esc(title)}</b><span>${App.esc(sub||'')}</span></div>`;
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
function tabHTML(id){
  const t=App.TAB(id);
  return `<button class="tab" type="button" data-action="tab" data-tab="${id}" aria-label="${t.name}">
    <span class="ti">${App.ICON[App.TABICON[id]||id]||''}</span><span class="tl">${t.name}</span><i class="dotb"></i>
  </button>`;
}
function buildTabs(){
  const bar=document.getElementById('tabs');
  bar.innerHTML=App.PRIMARY.map(tabHTML).join('')
    +`<button class="tab" type="button" data-action="more" aria-label="더보기"><span class="ti">${ICON_MORE}</span><span class="tl">더보기</span></button>`;
  App._tabs=[...App.PRIMARY,'more'];
}
App.syncTabs=function(){
  const cur=D.ui.tab;
  App.$$('#tabs .tab').forEach(b=>{
    const id=b.dataset.tab||'more';
    const on=id==='more'?App.MORE.includes(cur):id===cur;
    b.classList.toggle('on',on);
    b.setAttribute('aria-current',on?'page':'false');
  });
};
App.moreSheet=function(){
  const rows=App.MORE.map(id=>{
    const t=App.TAB(id);
    return `<button class="more-i" type="button" data-action="tab" data-tab="${id}">
      <span class="mi">${App.ICON[App.TABICON[id]||id]||''}</span><b>${t.name}</b>
      <span class="mhint">${({notes:'목회 메모·아이디어',sermons:'설교 준비 노트',vehicle:'주유·정비·보험 기록',food:'다녀온 식당·숙소'})[id]||''}</span>
    </button>`;
  }).join('');
  App.sheet({title:'더보기',body:`<div class="more-grid">${rows}</div>`,
    footer:`<button class="btn" data-action="install-guide">홈 화면에 추가</button><button class="btn primary" data-action="sheet-close">닫기</button>`});
};

/* ── 이벤트 위임 — 화면을 다시 그려도 핸들러가 사라지지 않는다 ── */
App.ACT={
  tab:el=>{const id=el.dataset.tab;App.closeSheet();App.go(id)},
  more:()=>App.moreSheet(),
  'sheet-close':()=>App.closeSheet(),
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
  'ev-open':el=>{calOpen=calOpen===el.dataset.ev?null:el.dataset.ev;renderCalendar()},
  'ev-edit':el=>eventEdit(el.dataset.ev),
  'ev-tojournal':el=>eventToJournal(el.dataset.ev),
  'ev-status':el=>{const [id,st]=el.dataset.set.split('|');const ev=App.D.events.find(x=>x.id===id);if(!ev)return;
    ev.status=st;App.save();renderCalendar();App.toast(App.STATUS[st].label+'으로 바뀔습니다')},
  'ev-note':el=>{const ev=App.D.events.find(x=>x.id===el.dataset.ev);if(ev){ev.note=el.value;App.save();App.toast('메모를 저장했습니다')}},
  ledger:()=>{},
  'car-add':el=>carExpenseEdit(null,el.dataset.type||''),
  'car-filter':el=>{App.D.ui.carFilter=el.dataset.cf;App.save();renderVehicle()},
  'car-open':el=>carExpenseEdit(el.dataset.ce),
  'car-vedit':()=>vehicleEdit(App.car().id),
  'car-vimg':()=>carPhoto(),
  'lecture-edit':el=>lectureEdit(el.dataset.ev),
  'go-cal-day':el=>{App.D.ui.calDate=el.dataset.date;App.D.ui.calMonth=(el.dataset.date||'').slice(0,7);App.save();App.go('calendar')},
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
  App.load();
  App._scroll={};App._tab=null;
  buildTabs();
  App.go('home');            // 앱을 열면 언제나 메인 화면부터
  const d=new Date();
  document.getElementById('barDate').textContent=`${d.getMonth()+1}월 ${d.getDate()}일 ${App.DW[d.getDay()]}요일`;
  document.getElementById('btnExport').onclick=App.exportAll;
  document.getElementById('btnImport').onclick=()=>document.getElementById('fileImport').click();
  document.getElementById('fileImport').onchange=e=>{const f=e.target.files[0];if(f)App.importAll(f);e.target.value=''};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')App.closeSheet()});
  document.addEventListener('change',e=>{
    const t=e.target.closest&&e.target.closest('[data-action="ev-note"]');
    if(!t)return;
    const ev=App.D.events.find(x=>x.id===t.dataset.ev);
    if(ev){ev.note=t.value;App.save();App.toast('메모를 저장했습니다')}
  });
  if(window.GCal)window.GCal.sync();          // 구글 캘린더 자동 연동
  document.documentElement.classList.add('ready');
};
document.addEventListener('DOMContentLoaded',App.init);
})();
