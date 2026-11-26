/* 메인 — 큰 타일 메뉴 (문서 발급 앱형 첫 화면)
   원칙: 화면 골격은 데이터 없이 먼저 그리고, 숫자는 항목별로 따로 채운다.
   그래서 데이터나 다른 스크립트 하나가 잘못돼도 메인은 절대 빈 화면이 되지 않는다. */
/* 2026-11-26 목사님 지시: 캘린더·메모 타일을 내리고, 그 자리에 운동일지를 넣었다 */
var MN_TILES=[
  {tab:'journal', name:'오늘 일지', color:'#57ce93', icon:'journal', hint:'오늘 한 일 한눈에'},
  {tab:'schedule',name:'스케줄',   color:'#82a9e6', icon:'schedule',hint:'앞으로의 일정'},
  {tab:'counsel', name:'상담 일지', color:'#6fd2d2', icon:'counsel', hint:'성도·심방 기록'},
  {tab:'sermons', name:'설교 준비', color:'#b79cff', icon:'sermons', hint:'설교 노트'},
  {tab:'vehicle', name:'차량 관리', color:'#f0a86b', icon:'car',     hint:'주유·정비·보험'},
  {tab:'food',    name:'다녀온 곳', color:'#a9b6d4', icon:'food',    hint:'식당·숙소 기록'},
  {tab:'workout', name:'운동일지',  color:'#f0564a', icon:'dumbbell',hint:'종목·세트·무게'}
];

function mnSafe(fn,alt){try{var v=fn();return (v===0||v)?v:alt}catch(e){return alt}}

/* 타일 이름·부제 — 관리자에서 고친 문구가 있으면 그것을 먼저 쓴다 */
function mnName(t){return mnSafe(function(){return App.tx('tile.'+t.tab+'.name',t.name)},t.name)}
function mnHint(t){return mnSafe(function(){return App.tx('tile.'+t.tab+'.hint',t.hint)},t.hint)}
function mnCustom(k){return mnSafe(function(){return App.txHas(k)?'1':''},'')}

/* 오늘 기준 숫자들 — 하나씩 따로 계산한다 */
function mnData(){
  var D=App.D||{}, today=App.todayKey(), out={};
  out.evToday=mnSafe(function(){return D.events.filter(function(e){return App.evDate(e)===today}).length},0);
  out.evWeek=mnSafe(function(){var n=0;for(var i=0;i<7;i++){var k=App.addDays(today,i);
    n+=D.events.filter(function(e){return App.evDate(e)===k}).length}return n},0);
  out.evMonth=mnSafe(function(){var m=today.slice(0,7);
    return D.events.filter(function(e){return App.inMonth(App.evDate(e),m)}).length},0);
  out.journalToday=mnSafe(function(){return D.journal.filter(function(j){return j.date===today}).length},0);
  out.journalMonth=mnSafe(function(){var m=today.slice(0,7);
    return D.journal.filter(function(j){return App.inMonth(j.date,m)}).length},0);
  out.money=mnSafe(function(){var m=today.slice(0,7);
    return D.journal.filter(function(j){return App.inMonth(j.date,m)}).reduce(function(a,j){return a+(+j.amount||0)},0)},0);
  out.people=mnSafe(function(){return D.people.length},0);
  out.records=mnSafe(function(){return D.records.length},0);
  out.sermons=mnSafe(function(){return D.sermons.length},0);
  out.notes=mnSafe(function(){return D.notes.length},0);
  out.food=mnSafe(function(){return D.restaurants.length},0);
  out.car=mnSafe(function(){var c=App.car&&App.car();return c&&(c.name||c.model)?(c.name||'내 차'):'등록 전'},'등록 전');
  out.wo=mnSafe(function(){
    var list=JSON.parse(localStorage.getItem('workoutlog.v1')||'[]')||[];
    var mon=App.mondayOf(today),end=App.addDays(mon,6);
    var days={};list.forEach(function(r){if(r&&r.date>=mon&&r.date<=end)days[r.date]=1});
    var n=Object.keys(days).length;
    return n?(n+'일 운동'):'기록 없음';
  },'기록하기');
  return out;
}
function mnNext(){
  return mnSafe(function(){
    var now=new Date();
    var list=App.D.events.filter(function(e){
      return e.start&&e.start.length>10&&new Date(e.start.replace(' ','T'))>now;});
    list.sort(function(a,b){return a.start.localeCompare(b.start)});
    return list[0]||null;
  },null);
}
function mnTime(start){
  if(!start)return '';
  return start.length<=10?'종일':start.slice(11,16);
}
function mnLeft(start){
  if(!start||start.length<=10)return '';
  var t=new Date(start.replace(' ','T'));
  var diff=Math.round((t-new Date())/60000);
  if(diff<-1)return '지난 일정';
  if(diff<=0)return '지금';
  if(diff<60)return diff+'분 후';
  var h=Math.floor(diff/60), m=diff%60;
  return m?(h+'시간 '+m+'분 후'):(h+'시간 후');
}
function mnTileSub(tab,d){
  switch(tab){
    case 'journal': return d.journalToday?('오늘 '+d.journalToday+'건 기록'):'오늘 기록 없음';
    case 'schedule':return d.evWeek?('앞으로 7일 '+d.evWeek+'건'):'앞으로 7일 한가함';
    case 'workout': return d.wo;
    case 'counsel': return d.people+'명 · '+d.records+'건';
    case 'sermons': return d.sermons+'편 준비';
    case 'vehicle': return d.car;
    case 'notes':   return d.notes+'개 메모';
    case 'food':    return d.food+'곳 등록';
    case 'report':  return '명령·수행·보류 한눈에';
    default:        return '열기';
  }
}
function mnTileBadge(tab,d){
  if(tab==='journal'&&d.journalToday)return String(d.journalToday);
  return '';
}

function mnTileHTML(t){
  var icon=(App.ICON&&App.ICON[t.icon])||'';
  return '<button class="mtile" type="button" data-action="tab" data-tab="'+t.tab+'"'
    +' style="--c:'+t.color+'" aria-label="'+App.esc(mnName(t))+'" data-edit="tile.'+t.tab+'">'
    +'<span class="mt-ico">'+icon+'</span>'
    +'<span class="mt-wm" aria-hidden="true">'+icon+'</span>'
    +'<b>'+App.esc(mnName(t))+'</b>'
    +'<span class="mt-sub">'+App.esc(mnHint(t))+'</span>'
    +'<i class="mt-arrow" aria-hidden="true">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 5.5 15 12l-6.5 6.5"/></svg>'
    +'</i>'
  +'</button>';
}

/* 에스더 보고 일지 — 8개 타일 위에 놓는 넓은 타일 (2026-11-26 목사님 지시로 앱 안에 합침) */
function mnReportHTML(){
  var icon=(App.ICON&&App.ICON.report)||'';
  return '<button class="mtile mtile-feature" type="button" data-action="tab" data-tab="report"'
    +' style="--c:#ecc970" aria-label="에스더 보고 일지">'
    +'<span class="mt-ico">'+icon+'</span>'
    +'<span class="mt-wm" aria-hidden="true">'+icon+'</span>'
    +'<span class="mtf-t">'
      +'<b>'+App.esc(App.tx('tile.report.name','에스더 보고 일지'))+'</b>'
      +'<span class="mt-sub" id="mtfSub">'+App.esc(App.tx('tile.report.hint','명령·수행·보류 한눈에'))+'</span>'
    +'</span>'
    +'<i class="mtf-badge" id="mtfBadge" hidden></i>'
    +'<i class="mt-arrow" aria-hidden="true">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 5.5 15 12l-6.5 6.5"/></svg>'
    +'</i>'
  +'</button>';
}

function mnHeroHTML(){
  return '<div class="mnh">'
    +'<div class="mnh-top">'
      +'<div class="mnh-kicker">'+App.esc(App.tx('home.kicker','글로벌비전교회 · 목회 일지'))+'</div>'
      +'<button class="mnh-sync" type="button" data-action="gcal-sync" title="구글 캘린더 연동"><i></i><span id="mnhSync">연동</span></button>'
    +'</div>'
    +'<h2 class="mnh-hello" id="mnhHello">목사님, 오늘도 평안하시지요</h2>'
    +'<div class="mnh-now" id="mnhNow"><span class="lb">오늘</span><span class="tx">일정을 확인하고 있습니다</span></div>'
  +'</div>';
}

function mnShellHTML(){
  return '<div class="mnhome">'
    + mnHeroHTML()
    +'<div class="mntiles">'
      + mnReportHTML()
      + MN_TILES.map(mnTileHTML).join('')
    +'</div>'
    +'<div class="mn-foot2">'+App.esc(App.tx('home.foot','박재용 목사 · 글로벌비전교회 담임 · GV청소년선교회 대표'))+'</div>'
  +'</div>';
}

/* 데이터가 들어오면 숫자만 다시 채운다 — 골격은 그대로 둔다 */
function mnRefresh(){
  var el=document.getElementById('sc-home');
  if(!el||!el.querySelector('.mntiles'))return;
  var d=mnData();
  Array.prototype.forEach.call(el.querySelectorAll('.mtile'),function(b){
    var tab=b.dataset.tab;
    var t=MN_TILES.filter(function(x){return x.tab===tab})[0];
    if(!t)return;
    var sub=b.querySelector('.mt-sub');
    if(sub&&!mnCustom('tile.'+tab+'.hint'))sub.textContent=mnSafe(function(){return mnTileSub(tab,d)},t.hint);
  });
  var hello=document.getElementById('mnhHello');
  if(hello)hello.innerHTML=mnSafe(function(){
    return d.evToday?('목사님, 오늘 일정 <b>'+d.evToday+'건</b>입니다'):'목사님, 오늘은 일정이 없는 하루입니다';
  },'목사님, 오늘도 평안하시지요');
  var now=document.getElementById('mnhNow');
  if(now)now.innerHTML=mnSafe(function(){
    var n=mnNext();
    if(n){
      var when=mnLeft(n.start);
      return '<span class="lb">다음</span><span class="tx"><b>'+App.esc(n.summary)+'</b>'
        +'<i>'+mnTime(n.start)+(when?' · '+when:'')+'</i></span>';
    }
    return '<span class="lb">오늘</span><span class="tx">오늘 일정은 모두 마쳤습니다'
      +'<i>이번 주 '+d.evWeek+'건</i></span>';
  },'<span class="lb">오늘</span><span class="tx">일정은 캘린더에서 볼 수 있습니다</span>');
  var sync=document.getElementById('mnhSync');
  if(sync)sync.textContent=mnSafe(function(){
    var s=window.GCal&&window.GCal.state;
    if(!s||!s.last)return '연동';
    return s.err?'연동 확인':'연동됨';
  },'연동');
  /* 보고 일지 타일 부제 — 오늘·어제 건수 (자료가 없으면 안내 문구 그대로) */
  var fs=document.getElementById('mtfSub');
  if(fs&&window.ReportPeek&&!mnCustom('tile.report.hint')){
    try{window.ReportPeek(function(txt,L){
      var cur=document.getElementById('mtfSub');
      if(cur&&txt)cur.textContent=txt;
      var bg=document.getElementById('mtfBadge');
      if(bg){ if(L&&L.mine>0){bg.textContent='결정 '+L.mine;bg.hidden=false}else bg.hidden=true }
    })}catch(e){}
  }
}

function renderHome(){
  var el=document.getElementById('sc-home');
  if(!el)return;
  el.innerHTML=mnShellHTML();   /* 1) 골격 먼저 — 무슨 일이 있어도 타일 8개가 그려진다 */
  try{mnRefresh()}catch(e){console.warn('[home] 숫자 채우기',e)}  /* 2) 숫자는 따로 */
}

/* ── 관리자 화면에 올릴 메인 문구 등록 (2026-11-26: 타일 이름·부제도 고칠 수 있게) ── */
(function(){
  if(!window.App||!App.txDef)return;
  App.txSection('tiles','메인 타일','큰 타일 9개의 이름과 부제');
  MN_TILES.forEach(function(t){
    App.txDef('tile.'+t.tab+'.name',t.name,t.name+' · 이름','tiles');
    App.txDef('tile.'+t.tab+'.hint',t.hint,t.name+' · 부제','tiles');
  });
  App.txDef('tile.report.name','에스더 보고 일지','에스더 보고 · 이름','tiles');
  App.txDef('tile.report.hint','명령·수행·보류 한눈에','에스더 보고 · 부제','tiles');

  App.txSection('guide','안내 문구','인사 띠와 맨 아래 명함줄');
  App.txDef('home.kicker','글로벌비전교회 · 목회 일지','인사 띠 머리말','guide');
  App.txDef('home.foot','박재용 목사 · 글로벌비전교회 담임 · GV청소년선교회 대표','맨 아래 명함줄','guide');
})();
