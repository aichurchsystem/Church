/* 표지 — 문서 표지처럼 첫 화면을 한 장으로 (2026-11-26 목사님 지시)
   "문서 양식 앱 메인 화면처럼, 내 목회일지라 바탕 화면에 첨부한 사진을 넣고,
     표지 들어가는 메인 화면을 넣고, 그걸 누르면 지금 화면이 보였으면 좋겠어."
   표지를 누르면 지금의 큰 타일 메인으로 들어간다. 타일 메인·상세 화면은 손대지 않는다. */

/* 사진 두 판 — 기본은 책상에 앉은 사진, ?photo=stand 로 서서 강의하는 사진 판을 연다
   (2026-11-26 목사님 지시 "그럼 이 사진으로 적용. 시켜줘. 앉아 있는 사진으로.") */
var CV_PHOTOS={
  stand:{src:'assets/cover-stand.jpg', pos:'62% 20%', alt:'박재용 목사 — 강단에서 설교하는 모습'},
  desk :{src:'assets/cover-desk.jpg',  pos:'50% 34%', alt:'박재용 목사 — 책상에 앉아 이야기하는 모습'}
};
function cvPhotoKey(){
  try{var m=/[?&]photo=([a-z]+)/.exec(location.search);if(m&&CV_PHOTOS[m[1]])return m[1]}catch(e){}
  return 'desk';
}
function cvNum(fn,alt){try{var v=fn();return (v===0||v)?v:alt}catch(e){return alt}}
function cvEsc(s){return App.esc?App.esc(s):String(s==null?'':s)}
/* 관리자에서 고친 값이 있으면 그것을(글자 그대로), 없으면 자동으로 만든 표를 쓴다 */
function cvTv(key,autoHTML){
  try{if(window.App&&App.txHas&&App.txHas(key))return cvEsc(App.tx(key))}catch(e){}
  return autoHTML;
}
function cvT(key,auto){return (window.App&&App.tx)?App.tx(key,auto):auto}

/* 표지에 들어갈 오늘 숫자 — 하나씩 따로 계산해서 하나가 틀려도 나머지는 나온다 */
function cvData(){
  var o={}, D=(window.App&&App.D)||{}, today='';
  try{today=App.todayKey()}catch(e){today=''}
  var month=today.slice(0,7);
  o.date=cvNum(function(){return App.fmtDateLong(today)},today);
  o.evToday=cvNum(function(){return D.events.filter(function(x){return App.evDate(x)===today}).length},0);
  o.evMonth=cvNum(function(){return D.events.filter(function(x){return App.inMonth(App.evDate(x),month)}).length},0);
  o.jToday=cvNum(function(){return D.journal.filter(function(x){return x.date===today}).length},0);
  o.jMonth=cvNum(function(){return D.journal.filter(function(x){return App.inMonth(x.date,month)}).length},0);
  o.people=cvNum(function(){return D.people.length},0);
  o.sermons=cvNum(function(){return D.sermons.length},0);
  o.next=cvNum(function(){
    var now=new Date();
    var list=D.events.filter(function(x){return x.start&&x.start.length>10&&new Date(x.start.replace(' ','T'))>now});
    list.sort(function(a,b){return a.start.localeCompare(b.start)});
    var n=list[0];
    if(!n)return '';
    return n.start.slice(11,16)+' '+n.summary;
  },'');
  return o;
}

function cvHTML(){
  var d=cvData();
  var ph=CV_PHOTOS[cvPhotoKey()];
  var no=cvNum(function(){return String(App.todayKey()).replace(/-/g,'.')},'');

  var vDate=cvTv('cover.v.date', cvEsc(d.date));
  var vToday=cvTv('cover.v.today', d.evToday
      ? ('<b>'+d.evToday+'</b>건'+(d.next?'<i class="cv-dot">·</i><span class="cv-mut">다음 '+cvEsc(d.next)+'</span>':''))
      : '<span class="cv-mut">오늘은 일정이 없습니다</span>');
  var vMonth=cvTv('cover.v.month', '<b>'+d.evMonth+'</b>건 일정<i class="cv-dot">·</i><b>'+d.jMonth+'</b>건 일지');
  var vRec  =cvTv('cover.v.rec', (d.people||d.sermons)
      ? ('<b>'+d.people+'</b>명 상담<i class="cv-dot">·</i><b>'+d.sermons+'</b>편 설교')
      : '<span class="cv-mut">아직 기록이 없습니다</span>');

  return '<div class="cv" data-action="enter" role="button" tabindex="0" aria-label="'+cvEsc(cvT('cover.title'))+' — 눌러서 들어가기">'
    /* ── 사진 ── */
    +'<div class="cv-photo">'
      +'<img src="'+ph.src+'" alt="'+cvEsc(ph.alt)+'" style="object-position:'+ph.pos+'" fetchpriority="high">'
      +'<span class="cv-shade" aria-hidden="true"></span>'
      +'<div class="cv-top">'
        +'<span class="cv-kick"><i></i>'+cvEsc(cvT('cover.kicker'))+'</span>'
        +'<span class="cv-no">No. '+cvEsc(no)+'</span>'
      +'</div>'
      +'<div class="cv-ttl">'
        +'<h1>'+cvEsc(cvT('cover.title'))+'</h1>'
        +'<p>'+cvEsc(cvT('cover.sub'))+'</p>'
      +'</div>'
    +'</div>'
    /* ── 문서 표 + 들어가기 + 로고 ── */
    +'<div class="cv-body">'
      +'<div class="cv-tbl">'
        +'<div class="cv-th"><b>'+cvEsc(cvT('cover.head'))+'</b><span>오늘 기준</span></div>'
        +'<dl class="cv-rows">'
          +'<div class="cv-r"><dt>'+cvEsc(cvT('cover.l.date'))+'</dt><dd>'+vDate+'</dd></div>'
          +'<div class="cv-r"><dt>'+cvEsc(cvT('cover.l.today'))+'</dt><dd>'+vToday+'</dd></div>'
          +'<div class="cv-r"><dt>'+cvEsc(cvT('cover.l.month'))+'</dt><dd>'+vMonth+'</dd></div>'
          +'<div class="cv-r"><dt>'+cvEsc(cvT('cover.l.rec'))+'</dt><dd>'+vRec+'</dd></div>'
        +'</dl>'
      +'</div>'
      +'<button class="cv-go" type="button" data-action="enter">'
        +'<span>'+cvEsc(cvT('cover.btn'))+'</span>'
        +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 5.5 15 12l-6.5 6.5"/></svg>'
      +'</button>'
      +'<p class="cv-hint">'+cvEsc(cvT('cover.hint'))+'</p>'
      /* ── 목회일지 심볼 + 교회 이름 (2026-11-27 교회 로고 그림을 심볼로 교체) ── */
      +'<div class="cv-brand">'
        +'<img src="assets/journal-mark.png" alt="" width="302" height="415">'
        +'<span class="cv-brand-tx"><b>글로벌비전교회</b><i>대한예수교 장로회</i></span>'
      +'</div>'
      +'<p class="cv-foot">'+cvEsc(cvT('cover.foot'))+'</p>'
    +'</div>'
  +'</div>';
}

function renderCover(){
  var el=document.getElementById('sc-cover');
  if(!el)return;
  var html='';
  try{html=cvHTML()}catch(e){
    console.warn('[cover]',e);
    html='<div class="cv"><div class="cv-body" style="padding-top:28px">'
      +'<div class="cv-tbl"><div class="cv-th"><b>박재용 목사 목회일지</b></div></div>'
      +'<button class="cv-go" type="button" data-action="enter"><span>들어가기</span></button>'
      +'</div></div>';
  }
  el.innerHTML=html;
}

/* ── 관리자 화면에 올릴 표지 문구 등록 ── */
(function(){
  if(!window.App||!App.txDef)return;
  App.txSection('cover','표지','첫 화면에 크게 들어가는 글자');
  App.txDef('cover.kicker','목회 일지','표지 머리말','cover');
  App.txDef('cover.title','박재용 목사 목회일지','표지 제목','cover',{rows:2,hint:'길면 두 줄로 나뉩니다'});
  App.txDef('cover.sub','글로벌비전교회 담임 · GV청소년선교회 대표','부제 (직함·소속)','cover');
  App.txDef('cover.head','오늘의 기록','표 머리말','cover');
  App.txDef('cover.hint','표지를 누르면 오늘의 일지로 들어갑니다','안내 한 줄','cover');
  App.txDef('cover.btn','들어가기','들어가기 버튼 글자','cover');
  App.txDef('cover.foot','글로벌비전교회 · 서울 광진구 구의강변로3가길 33 상가 2층 · gvch.kr','맨 아래 주소줄','cover');

  App.txSection('coverTable','표지 정보 표','표의 항목 이름과 값');
  App.txDef('cover.l.date','날짜','항목 이름 · 날짜','coverTable');
  App.txDef('cover.l.today','오늘 일정','항목 이름 · 오늘 일정','coverTable');
  App.txDef('cover.l.month','이번 달','항목 이름 · 이번 달','coverTable');
  App.txDef('cover.l.rec','목회 기록','항목 이름 · 목회 기록','coverTable');
  App.txDef('cover.v.date','','값 · 날짜','coverTable',{auto:true});
  App.txDef('cover.v.today','','값 · 오늘 일정','coverTable',{auto:true});
  App.txDef('cover.v.month','','값 · 이번 달','coverTable',{auto:true});
  App.txDef('cover.v.rec','','값 · 목회 기록','coverTable',{auto:true});
})();
