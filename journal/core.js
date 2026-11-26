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
  {id:'home',name:'홈'},{id:'journal',name:'일지'},{id:'schedule',name:'스케줄'},
  {id:'counsel',name:'상담'},{id:'calendar',name:'캘린더'},{id:'notes',name:'메모'},
  {id:'sermons',name:'설교'},{id:'vehicle',name:'차량'},{id:'food',name:'다녀온 곳'}
];
App.TABICON={home:'home',journal:'journal',schedule:'schedule',counsel:'counsel',calendar:'calendar',notes:'notes',sermons:'sermons',vehicle:'car',food:'food'};
App.go=function(tab){
  if(!App.TABS.some(t=>t.id===tab))tab='home';
  D.ui.tab=tab;App.save();
  App.$$('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  App.$$('.screen').forEach(s=>s.classList.toggle('on',s.id==='sc-'+tab));
  App.render();
  const main=document.getElementById('main');
  window.scrollTo({top:0,behavior:'instant'});
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

/* ── boot ── */
App.init=function(){
  App.load();
  document.getElementById('tabs').innerHTML=App.TABS.map(t=>
    `<button class="tab" data-tab="${t.id}">${App.ICON[App.TABICON[t.id]||t.id]}<span>${t.name}</span><i class="dotb"></i></button>`).join('');
  App.$$('.tab').forEach(b=>b.onclick=()=>App.go(b.dataset.tab));
  App.go(D.ui.tab);
  const d=new Date();
  document.getElementById('barDate').textContent=`${d.getMonth()+1}월 ${d.getDate()}일 ${App.DW[d.getDay()]}요일`;
  document.getElementById('btnExport').onclick=App.exportAll;
  document.getElementById('btnImport').onclick=()=>document.getElementById('fileImport').click();
  document.getElementById('fileImport').onchange=e=>{const f=e.target.files[0];if(f)App.importAll(f);e.target.value=''};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')App.closeSheet()});
};
document.addEventListener('DOMContentLoaded',App.init);
})();
