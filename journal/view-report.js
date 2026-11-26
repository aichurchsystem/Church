/* 에스더 보고 일지 — 목회 일지 앱 안 화면 (2026-11-26 목사님 지시: 앱 하나로 합치기)
   데이터는 같은 저장소의 report/data/*.json 을 그대로 읽는다(아침 7시 예약이 갱신하는 구조 그대로).
   원칙: 화면 골격은 데이터 없이 먼저 그리고, 내용은 따로 채운다.
   네트워크가 끊겨도 마지막으로 받은 내용은 보여 준다(localStorage 보관). */
(function(){
var BASE='../report/data/';
var LS_IDX='mj.rp.idx', LS_DAY='mj.rp.day.', LS_LAT='mj.rp.latest';
var RP={dates:[],date:null,data:null,view:'done',filt:'',open:{},all:false,
        booted:false,req:0,err:'',stale:false,latest:null};
window.RP=RP;

function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null}
function jget(k){try{var s=ls(k);return s?JSON.parse(s):null}catch(e){return null}}

function fetchJSON(name){
  return fetch(BASE+name+'.json?t='+Date.now(),{cache:'no-store'}).then(function(r){
    if(!r.ok)throw new Error(name+' '+r.status);
    return r.json();
  });
}

/* ── 날짜 표기 ── */
function relDay(k){
  var t=App.todayKey();
  if(k===t)return '오늘';
  if(k===App.addDays(t,-1))return '어제';
  return '';
}
function md(k){var p=String(k||'').split('-');return p.length===3?((+p[1])+'월 '+(+p[2])+'일'):(k||'')}
function shortMd(k){var p=String(k||'').split('-');return p.length===3?((+p[1])+'/'+(+p[2])):(k||'')}
function dowOf(k){try{return App.DW[App.dow(k)]}catch(e){return ''}}
function chipLabel(k){
  var r=relDay(k);
  return r||(shortMd(k)+' '+dowOf(k));
}
/* 상태 나눔 (2026-11-26 목사님 지시로 확정)
   수행 = 끝낸 일 / 작업 진행 중 = 에스더가 하는 중 / 목사님 결재 대기 = 목사님 확인·사인을 기다리는 일
   나누는 기준은 담당(owner) 값이고, 목사님이 앱에서 '확인함'을 누르면 그 표시를 저장해 다음에도 지킨다. */
function rpMarks(){try{var s=ls('mj.rp.mark');return s?JSON.parse(s):{}}catch(e){return {}}}
function rpKey(it){return (RP.date||'')+'|'+(it&&it.title||'')}
function rpMark(it){return rpMarks()[rpKey(it)]||''}
function rpSetMark(it,v){
  var m=rpMarks(),k=rpKey(it);
  if(v)m[k]=v;else delete m[k];
  try{ls('mj.rp.mark',JSON.stringify(m))}catch(e){}
}
function splitPending(x){
  var p=(x&&x.pending)||[];
  var doing=[],hold=[],doneMarked=[];
  p.forEach(function(it){
    var mk=rpMark(it);
    if(mk==='done'){doneMarked.push(it);return}
    if(it.owner==='에스더')doing.push(it);else hold.push(it);
  });
  return {doing:doing,hold:hold,doneMarked:doneMarked};
}
function counts(x){
  x=x||{};
  var sp=splitPending(x);
  return {order:(x.ordered||[]).length,
          done:(x.done||[]).length+sp.doneMarked.length,
          doing:sp.doing.length,hold:sp.hold.length,
          holdList:sp.hold,doingList:sp.doing};
}

/* ── 데이터 ── */
function setLatest(x){
  if(!x)return;
  var c=counts(x);
  var mine=c.hold;
  RP.latest={date:x.date||RP.dates[0],label:x.label||'',order:c.order,done:c.done,
             doing:c.doing,hold:c.hold,mine:mine};
  ls(LS_LAT,JSON.stringify(RP.latest));
}
function boot(cb){
  if(RP.booted){if(cb)cb();return}
  RP.booted=true;
  var cached=jget(LS_IDX)||[];
  fetchJSON('index').then(function(list){
    RP.dates=(list||[]).slice().sort().reverse();
    ls(LS_IDX,JSON.stringify(RP.dates));
  }).catch(function(){
    RP.dates=cached.map(function(x){return x}).sort().reverse();
    RP.err=RP.dates.length?'':'index';
  }).then(function(){
    var today=App.todayKey();
    /* index.json에 오늘 것이 아직 없어도 오늘 파일이 있으면 먼저 보여 준다 */
    if(RP.dates.length&&RP.dates[0]!==today){
      return fetchJSON(today).then(function(x){
        if(x&&x.date){RP.dates.unshift(today);ls(LS_IDX,JSON.stringify(RP.dates));RP.data=x;RP.date=today;setLatest(x)}
      }).catch(function(){});
    }
  }).then(function(){
    if(RP.data&&RP.date){renderReport();if(cb)cb();return}
    if(!RP.dates.length){RP.err='empty';renderReport();if(cb)cb();return}
    loadDay(RP.date||RP.dates[0],cb);
  });
}
function loadDay(d,cb){
  var req=++RP.req;
  fetchJSON(d).then(function(x){
    if(req!==RP.req)return;
    if(!x||!x.date)throw new Error('empty');
    RP.date=d;RP.data=x;RP.stale=false;RP.err='';RP.open={};
    ls(LS_DAY+d,JSON.stringify(x));
    if(d===RP.dates[0]||!RP.latest)setLatest(x);
    renderReport();if(cb)cb();
  }).catch(function(){
    if(req!==RP.req)return;
    var c=jget(LS_DAY+d);
    RP.date=d;RP.data=c||null;RP.stale=!!c;RP.err=c?'stale':'day';RP.open={};
    if(c)setLatest(c);
    renderReport();if(cb)cb();
  });
}
function selectDate(d){
  if(!d||d===RP.date)return;
  RP.req++;                       /* 늦게 도착한 응답은 무시 */
  RP.date=d;RP.open={};RP.all=false;
  RP.data=jget(LS_DAY+d);RP.stale=!!RP.data;RP.err='';
  renderReport();
  window.scrollTo({top:0,behavior:'instant'});
  loadDay(d);
}

/* ── 화면 ── */
var ICON_REP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 17 21.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M8.6 8.4h6.8M8.6 12h6.8M8.6 15.6h4"/></svg>';
var CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9.5 6 6 6-6"/></svg>';

function tabBtn(id,num,label,on){
  return '<button class="rp-tab'+(on?' on '+id:'')+'" type="button" data-action="rp-view" data-view="'+id+'">'
    +'<b>'+num+'</b><span>'+label+'</span></button>';
}
/* 매일 하는 일 — 앱 안에 두고 나중에 고칠 수 있습니다 */
var ROUTINE=[
  ['05:00','모닝콜 — 오늘 일정·메일 보고'],
  ['06:30','청소년 소식 수집·검증·초안'],
  ['07:00','아침 보고 일지 + 쇼츠 점검·승인 확인'],
  ['08:30','아침 쇼츠 한 편 업로드'],
  ['17:15','16:9 영상 순차 업로드'],
  ['19:00','저녁 쇼츠 한 편 업로드'],
  ['2시간마다','목회일지 ↔ 구글 캘린더 동기화'],
  ['월 09·10·20시','앱 소식 · 홈페이지 점검 · 영상 주간 보고'],
  ['화 09:00','기획 회의 — 다음에 할 일 세 가지'],
  ['매달 20·22일','미용실 정기 예약 확인'],
  ['메일','지메일·네이버 함께 · 학교·관공서는 꼭 확인']
];
function routineHTML(){
  var t=App.todayKey();
  var ev=0;
  try{ev=(App.D.events||[]).filter(function(e){return App.evDate(e)===t}).length}catch(e){}
  var g=window.GCal&&window.GCal.state;
  var syn=g&&g.last?(function(){var d=new Date(g.last);
    return (d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')})():'확인 안 됨';
  var c=counts(RP.data||{});
  return '<section class="rp-routine">'
    +'<div class="rp-rh"><b>매일 하는 일</b><span>오늘 일정 '+ev+'건 · 캘린더 연동 '+App.esc(syn)+'</span></div>'
    +'<ul class="rp-rlist">'+ROUTINE.map(function(r){
        return '<li><b>'+App.esc(r[0])+'</b><span>'+App.esc(r[1])+'</span></li>'
      }).join('')+'</ul>'
    +'<div class="rp-cards">'
      +'<button class="rp-card done'+(RP.view==='done'?' on':'')+'" type="button" data-action="rp-view" data-view="done" data-filt="">'
        +'<b>'+c.done+'</b><span>수행</span><i>끝낸 일</i></button>'
      +'<button class="rp-card doing'+(RP.view==='doing'&&RP.filt!=='pastor'?' on':'')+'" type="button" data-action="rp-view" data-view="doing" data-filt="es">'
        +'<b>'+c.doing+'</b><span>작업 진행 중</span><i>에스더가 하는 중</i></button>'
      +'<button class="rp-card hold'+(RP.view==='doing'&&RP.filt==='pastor'?' on':'')+'" type="button" data-action="rp-view" data-view="doing" data-filt="pastor">'
        +'<b>'+c.hold+'</b><span>목사님 결재 대기</span><i>목사님 확인을 기다립니다</i></button>'
    +'</div></section>';
}
function headHTML(){
  var c=counts(RP.data);
  var day='불러오는 중';
  if(RP.date){
    var rel=relDay(RP.date);
    day=(rel?'<b>'+rel+'</b>':'')+md(RP.date)+' '+dowOf(RP.date)+'요일';
  }
  return '<div class="rp-h">'
    +'<div class="rp-kicker">'+ICON_REP+'<span>에스더 보고 일지</span></div>'
    +'<div class="rp-day">'+day+'</div>'
  +'</div>'
  +'<div class="rp-tabs">'
    +tabBtn('done',c.done,'수행한 일',RP.view==='done')
    +tabBtn('doing',c.doing+c.hold,'작업 진행 중',RP.view==='doing')
  +'</div>';
}
function datesHTML(){
  /* 날짜가 하나뿐이면 위쪽 날짜 표시와 겹치므로 생략한다(스크롤을 줄인다) */
  if(!RP.dates||RP.dates.length<2)return '';
  return '<div class="rp-dates">'+RP.dates.map(function(d){
    return '<button class="rp-chip'+(d===RP.date?' on':'')+'" type="button" data-action="rp-date" data-date="'+App.esc(d)+'">'
      +App.esc(chipLabel(d))+'</button>';
  }).join('')+'</div>';
}
function detHTML(it){
  var rows=(it.detail||[]).slice();
  if(it.link&&!/^https?:\/\//i.test(String(it.result||'')))rows.push({k:'증빙·링크',v:it.link,link:1});
  if(!rows.length)return '';
  return '<dl class="rp-det">'+rows.map(function(x){
    var v=String(x.v==null?'':x.v);
    var body=x.link?'<a href="'+App.esc(v)+'" target="_blank" rel="noopener">'+App.esc(v)+'</a>':App.esc(v);
    return '<dt>'+App.esc(x.k)+'</dt><dd>'+body+'</dd>';
  }).join('')+'</dl>';
}
function doneLi(it,i){
  var open=RP.all||!!RP.open[i];
  return '<li class="rp-li done'+(open?' on':'')+'">'
    +'<button class="rp-row" type="button" data-action="rp-open" data-i="'+i+'" aria-expanded="'+(open?'true':'false')+'">'
      +'<span class="rp-rt"><b>'+(it.kind?'<span class="rp-kind">'+App.esc(it.kind)+'</span>':'')+App.esc(it.title)+'</b>'
        +(it.result?'<span class="rp-res">'+App.esc(it.result)+'</span>':'')+'</span>'
      +'<i class="rp-ch" aria-hidden="true">'+CHEV+'</i>'
    +'</button>'
    +(open?detHTML(it):'')
  +'</li>';
}
function orderLi(it){
  return '<li class="rp-li order">'
    +'<div class="rp-row static">'
      +'<span class="rp-time">'+App.esc(it.time||'')+'</span>'
      +'<span class="rp-rt"><b>'+App.esc(it.title)+'</b>'
        +(it.note?'<span class="rp-res">'+App.esc(it.note)+'</span>':'')+'</span>'
    +'</div></li>';
}
/* 작업 진행 중 목록의 한 줄 — 담당에 따라 배지가 달라진다 */
function pendingLi(it){
  var mine=it.owner==='에스더';
  return '<li class="rp-li '+(mine?'doing':'hold sign')+'">'
    +'<div class="rp-row static">'
      +'<span class="rp-rt"><b>'+App.esc(it.title)+'</b>'
        +(it.note?'<span class="rp-res">'+App.esc(it.note)+'</span>':'')+'</span>'
      +'<i class="rp-owner '+(mine?'me':'')+'">'+(mine?'진행 중':'목사님 보류 중')+'</i>'
      +'<button class="rp-ok" type="button" data-action="rp-mark" data-key="'+App.esc(rpKey(it))+'">확인함</button>'
    +'</div></li>';
}
function holdLi(it){
  var mine=false;   /* 이 목록은 결재 대기(목사님 담당)만 모은다 */
  return '<li class="rp-li hold sign">'
    +'<div class="rp-row static">'
      +'<span class="rp-rt"><b>'+App.esc(it.title)+'</b>'
        +(it.note?'<span class="rp-res">'+App.esc(it.note)+'</span>':'')+'</span>'
      +(it.owner?'<i class="rp-owner'+(mine?' me':'')+'">'+App.esc(it.owner)+'</i>':'')
    +'</div></li>';
}
function listHTML(){
  var d=RP.data;
  if(!d){
    if(RP.err==='empty')return '<div class="rp-none">아직 정리된 보고가 없습니다.<br><span>매일 아침 7시에 어제 하루를 정리해 올립니다.</span></div>';
    if(RP.err==='index')return '<div class="rp-none">보고 일지를 불러오지 못했습니다.<br><span>잠시 뒤 다시 열어 주세요.</span></div>';
    return '<div class="rp-none">불러오는 중…</div>';
  }
  var html='';
  var sp=splitPending(d);
  if(RP.view==='done'){
    html=(d.done||[]).map(doneLi).join('')
      +(sp.doneMarked||[]).map(function(it){
        return '<li class="rp-li done on"><div class="rp-row static">'
          +'<span class="rp-rt"><b><span class="rp-kind">확인함</span>'+App.esc(it.title)+'</b>'
          +(it.note?'<span class="rp-res">'+App.esc(it.note)+'</span>':'')+'</span>'
          +'<i class="rp-owner me">목사님 확인</i></div></li>'}).join('');
  }
  else{
    var list=(d.pending||[]).filter(function(it){return rpMark(it)!=='done'});
    if(RP.filt==='es')list=list.filter(function(it){return it.owner==='에스더'});
    else if(RP.filt==='pastor')list=list.filter(function(it){return it.owner!=='에스더'});
    html=list.map(pendingLi).join('');
  }
  if(!html)return '<div class="rp-none">해당하는 항목이 없습니다.</div>';
  return '<ul class="rp-list '+RP.view+'">'+html+'</ul>';
}
function bodyHTML(){
  var d=RP.data;
  var out=routineHTML()+headHTML()+datesHTML();
  if(d){
    if(d.summary)out+='<p class="rp-sum">'+App.esc(d.summary)+'</p>';
    if(RP.err==='stale')out+='<p class="rp-cau">네트워크가 없어 마지막으로 받은 내용을 보여 줍니다.</p>';
    if(RP.view==='done'){
      out+='<div class="rp-tools"><b>'+(d.done||[]).length+'건</b>'
        +(RP.date!==App.todayKey()?'<span class="rp-when">'+relDay(RP.date)+' 정리</span>':'')
        +'<button type="button" data-action="rp-all">'+(RP.all?'모두 접기':'모두 펼치기')+'</button></div>';
    }
  }
  out+=listHTML();
  out+='<div class="rp-foot">에스더가 매일 아침 7시에 어제 하루를 정리해 올립니다.</div>';
  return out;
}

function renderReport(){
  var el=document.getElementById('sc-report');
  if(!el)return;
  el.innerHTML='<div class="rp">'+bodyHTML()+'</div>';
  if(!RP.booted)boot();
}

/* 기존 클릭 위임(App.ACT)에 보고 일지 동작을 더한다 */
App.ACT['rp-view']=function(el){
  var v=el.dataset.view;
  if(v==='order')v='doing';
  if(v==='hold')v='doing';
  if(!v)return;
  RP.view=v;RP.filt=el.dataset.filt||'';RP.all=false;
  renderReport();
};
/* 목사님이 '확인함'을 누르면 그 항목은 수행으로 넘어가고, 그 표시는 다음 보고에도 남는다 */
App.ACT['rp-mark']=function(el){
  var key=el.dataset.key;if(!key)return;
  var m=rpMarks();
  if(m[key]==='done')delete m[key];else m[key]='done';
  try{ls('mj.rp.mark',JSON.stringify(m))}catch(e){}
  renderReport();
  App.toast(m[key]==='done'?'확인함으로 표시했습니다':'되돌렸습니다');
};
App.ACT['rp-date']=function(el){selectDate(el.dataset.date)};
App.ACT['rp-open']=function(el){
  var i=el.dataset.i;if(i==null)return;
  RP.open[i]=!RP.open[i];
  renderReport();
};
App.ACT['rp-all']=function(){RP.all=!RP.all;renderReport()};

/* 메인 타일 부제 — 「오늘 · 수행 8건 · 보류 9건」 */
window.ReportPeek=function(cb){
  boot(function(){
    var L=RP.latest||jget(LS_LAT);
    var txt='명령·수행·보류 한눈에';
    if(L&&L.date){
      var rel=relDay(L.date)||('최근 '+shortMd(L.date));
      txt=rel+' · 수행 '+L.done+' · 진행 '+(L.doing||0)+' · 결재 '+(L.hold||0);
    }
    try{if(cb)cb(txt,L)}catch(e){}
  });
};
window.renderReport=renderReport;
})();
