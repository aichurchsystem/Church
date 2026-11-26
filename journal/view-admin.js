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

/* ══════════════════════════════════════════════════════════
   배경 화면 (2026-11-26 목사님 지시: "배경 화면을 내가 수정할 수는 없는 거야?")
   기본 그라데이션 · 사진 · 색 중에서 고르고, 사진은 어둡게 덮는 정도를 조절한다.
   설정은 이 기기(localStorage 'mj.bg')에 저장되어 앱을 닫아도 그대로 남는다.
   ══════════════════════════════════════════════════════════ */
(function(){
  if(!window.App)return;
  var KEY='mj.bg';
  var PRESETS=[
    {name:'남색',c:'#0b1424'},{name:'먹색',c:'#0b0f14'},
    {name:'갈색',c:'#1a1410'},{name:'짙은 회색',c:'#14181d'}
  ];
  function load(){try{var s=localStorage.getItem(KEY);return s?JSON.parse(s):null}catch(e){return null}}
  function save(cfg){try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){App.toast('저장 공간이 부족합니다')}}
  function apply(cfg){
    var b=document.body;if(!b)return;
    b.style.backgroundImage='';b.style.backgroundColor='';
    b.style.backgroundSize='';b.style.backgroundAttachment='';b.style.backgroundPosition='';
    if(!cfg||!cfg.kind||cfg.kind==='default')return;
    if(cfg.kind==='color'){
      b.style.backgroundColor=cfg.color||'#0b1424';
      b.style.backgroundImage='radial-gradient(900px 420px at 8% -12%, rgba(255,255,255,.07), transparent 62%)';
      return;
    }
    if(cfg.kind==='photo'&&cfg.photo){
      var d=Math.max(0.15,Math.min(0.9,(cfg.dim==null?0.62:cfg.dim)));
      b.style.backgroundImage='linear-gradient(rgba(6,10,16,'+d.toFixed(2)+'),rgba(6,10,16,'+(d*0.92).toFixed(2)+')), url("'+cfg.photo+'")';
      b.style.backgroundSize='cover';b.style.backgroundPosition='center';
      b.style.backgroundAttachment='fixed';
    }
  }
  App.bgApply=function(){apply(load())};
  App.bgCurrent=load;

  function panelHTML(){
    var cfg=load()||{kind:'default'};
    var kind=cfg.kind||'default';
    return '<div class="card ad-bg" style="margin-top:12px">'
      +'<div class="card-h"><h2>배경 화면</h2><span class="hint">'
        +(kind==='photo'?'사진':kind==='color'?'색':'기본')+'</span></div>'
      +'<div class="card-b">'
      +'<p class="muted" style="margin:0 0 9px;line-height:1.55">앱 뒤에 깔리는 화면입니다. 기본 배경으로 언제든 되돌릴 수 있습니다.</p>'
      +'<div class="chips" id="bgKind">'
        +'<button class="chip '+(kind==='default'?'sel':'')+'" data-bgk="default" type="button">기본 배경</button>'
        +'<button class="chip '+(kind==='photo'?'sel':'')+'" data-bgk="photo" type="button">사진</button>'
        +'<button class="chip '+(kind==='color'?'sel':'')+'" data-bgk="color" type="button">색</button>'
      +'</div>'
      +'<div class="row2" style="margin-top:10px">'
        +'<button class="btn sm" id="bgPick" type="button">배경 사진 고르기</button>'
        +'<button class="btn sm ghost" id="bgDefault" type="button">기본 배경으로</button>'
      +'</div>'
      +'<p class="muted" style="margin:6px 0 10px;font-size:11.5px">사진은 폰에서 고르면 자동으로 줄여 이 기기에만 저장합니다.</p>'
      +'<div class="chips" id="bgColor" style="margin-bottom:8px">'
        +PRESETS.map(function(p){return '<button class="chip '+((kind==='color'&&(cfg.color||'')===p.c)?'sel':'')+'" type="button" data-bgc="'+p.c+'"><span class="pt" style="color:'+p.c+'"></span>'+p.name+'</button>'}).join('')
        +'<label class="chip" style="cursor:pointer">직접 고르기<input type="color" id="bgColorInput" value="'+(cfg.color||'#0b1424')+'" style="width:26px;height:22px;padding:0;border:0;background:none;margin-left:6px"></label>'
      +'</div>'
      +'<label class="fld"><span>사진을 어둡게 덮기 — 글자가 잘 보이게</span>'
        +'<input type="range" id="bgDim" min="15" max="90" step="5" value="'+Math.round((cfg.dim==null?0.62:cfg.dim)*100)+'">'
        +'<span class="muted" style="font-size:11.5px">오른쪽으로 갈수록 사진이 어두워지고 글자가 또렷해집니다.</span>'
      +'</label>'
      +'<p class="muted" style="margin:8px 0 0;font-size:11.5px">배경은 이 기기에만 저장됩니다. 폰과 태블릿은 따로 고르실 수 있습니다.</p>'
      +'</div></div>';
  }

  var _render=window.renderAdmin;
  window.renderAdmin=function(){
    if(_render)_render();
    var el=document.getElementById('sc-admin');
    if(!el)return;
    el.insertAdjacentHTML('beforeend',panelHTML());
    bind(el);
  };

  function bind(el){
    var cfg=load()||{kind:'default'};
    el.querySelectorAll('[data-bgk]').forEach(function(b){
      b.onclick=function(){
        var k=b.dataset.bgk;
        cfg=load()||{kind:'default'};
        cfg.kind=k;
        save(cfg);apply(cfg);renderAdmin();App.toast('배경을 바꿨습니다');
      };
    });
    var pick=el.querySelector('#bgPick');
    if(pick)pick.onclick=function(){
      var inp=document.createElement('input');inp.type='file';inp.accept='image/*';
      inp.onchange=function(){
        var f=inp.files&&inp.files[0];if(!f)return;
        compressImage(f,function(data){
          cfg=load()||{kind:'default'};
          cfg.kind='photo';cfg.photo=data;
          if(cfg.dim==null)cfg.dim=0.62;
          save(cfg);apply(cfg);renderAdmin();App.toast('배경 사진을 넣었습니다');
        });
      };
      inp.click();
    };
    var def=el.querySelector('#bgDefault');
    if(def)def.onclick=function(){save({kind:'default'});apply({kind:'default'});renderAdmin();App.toast('기본 배경으로 되돌렸습니다')};
    el.querySelectorAll('[data-bgc]').forEach(function(b){
      b.onclick=function(){
        cfg=load()||{kind:'default'};
        cfg.kind='color';cfg.color=b.dataset.bgc;
        save(cfg);apply(cfg);renderAdmin();App.toast('배경 색을 바꿨습니다');
      };
    });
    var ci=el.querySelector('#bgColorInput');
    if(ci)ci.onchange=function(){
      cfg=load()||{kind:'default'};
      cfg.kind='color';cfg.color=ci.value;
      save(cfg);apply(cfg);renderAdmin();App.toast('배경 색을 바꿨습니다');
    };
    var dim=el.querySelector('#bgDim');
    if(dim){
      dim.oninput=function(){
        cfg=load()||{kind:'photo'};
        cfg.dim=(+dim.value)/100;
        apply(cfg);
      };
      dim.onchange=function(){
        cfg=load()||{kind:'photo'};
        cfg.dim=(+dim.value)/100;
        save(cfg);apply(cfg);App.toast('사진 농도를 저장했습니다');
      };
    }
  }
})();
