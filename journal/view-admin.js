/* 관리자 — 앱 글자 관리 (2026-11-26 목사님 지시)
   "관리자 페이지 안에 들어가서 하는 걸 해줘."
   목록·저장 기능은 text.js(App.txAdminHTML · App.txAdminSave)가 맡고,
   이 파일은 화면에 붙이고 저장·되돌리기 버튼을 연결하는 역할만 한다. */
function renderAdmin(){
  var el=document.getElementById('sc-admin');
  if(!el)return;
  try{
    el.innerHTML=(window.App&&App.txAdminHTML)?App.txAdminHTML():'<div class="ad-none">관리자 화면을 불러오지 못했습니다.</div>';
  }catch(e){
    console.warn('[admin]',e);
    el.innerHTML='<div class="ad-none">관리자 화면을 그리지 못했습니다. 앱을 다시 열어 주세요.</div>';
  }
}

/* 저장 뒤 입력칸과 '고친 문구 N개' 표시를 지금 저장된 값에 맞춘다 (화면을 다시 그리지 않아 접힘이 풀리지 않는다) */
function adSyncPanel(){
  var box=document.getElementById('sc-admin');
  if(!box)return;
  Array.prototype.forEach.call(box.querySelectorAll('[data-txk]'),function(el){
    var k=el.dataset.txk;
    var meta=(App.TXTREG||[]).filter(function(x){return x.k===k})[0]||{};
    el.value=App.txHas(k)?App.tx(k):(meta.auto?'':App.txDefault(k));
  });
  var c=box.querySelector('.ad-cnt'), n=App.txCount();
  if(c){
    c.textContent=n?('고친 문구 '+n+'개'):'모든 문구가 처음 그대로입니다';
    c.classList.toggle('on',!!n);
  }
}

(function(){
  if(!window.App)return;
  App.ACT=App.ACT||{};
  /* 상단 톱니 → 관리자 */
  App.ACT['admin']=function(){ App.go('admin') };
  /* 전체 저장 */
  App.ACT['tx-save']=function(){
    var n=0;
    try{ n=App.txAdminSave(document.getElementById('sc-admin')) || 0 }catch(e){ console.warn('[admin save]',e); App.toast('저장하지 못했습니다'); return }
    adSyncPanel();
    App.toast(n?'고친 글자를 저장했습니다':'저장했습니다');
  };
  /* 처음 값으로 되돌리기 */
  App.ACT['tx-reset']=function(){
    App.ask('관리자에서 고친 문구를 모두 처음 상태로 되돌릴까요?\n일지·일정 같은 기록은 지워지지 않습니다.','되돌리기').then(function(ok){
      if(!ok)return;
      App.txResetAll();
      renderAdmin();
      App.toast('모든 문구를 처음 값으로 되돌렸습니다');
    });
  };
})();
