/* 앱 글자 관리 — 화면에 박힌 문구를 목사님이 '관리자' 화면에서 직접 고치는 저장소
   ──────────────────────────────────────────────────────────────
   2026-11-26 목사님 지시: "텍스트는 수정 가능할 수 있도록. 내가 하는 모든 앱은
   텍스트 자체를 수정 가능하게끔 만들어 줬으면 좋겠어. 관리자 페이지 안에 들어가서
   하는 걸 해줘."

   다른 앱에 그대로 옮겨 쓰는 방법 (이 파일 하나만 복사하면 된다)
   1) 이 파일(text.js)을 새 앱 폴더에 복사하고 <script>로 core.js 다음에 넣는다.
   2) 화면 스크립트에서 문구를 등록한다:  App.txDef('표지.제목','박재용 목사 목회일지','제목','표지')
      — 세 번째 인자는 관리자 화면에 보일 이름, 네 번째는 묶음 이름.
   3) 화면에서 그 문구를 쓸 때:  App.tx('표지.제목')  (등록한 기본값이 나온다)
   4) 관리자 화면을 만들 때:  App.txAdminHTML() 로 목록을 그리고,
      저장 버튼에서 App.txAdminSave(화면요소) 를 부르면 된다.
   5) 묶음 설명은 App.txSection('표지','표지','첫 화면에 크게 들어가는 글자') 로 붙인다.
   저장 위치는 이 앱의 localStorage 하나뿐이라 다른 앱과 섞이지 않는다.
   같은 주소(origin)에 여러 앱을 두는 경우에는 앱마다 이름을 달리 준다:
      <script>window.App=window.App||{};App.TXTS_KEY='앱이름.txt.v1';</script>
   를 text.js보다 먼저 넣으면 그 이름으로 저장된다.
   값이 비어 있으면 언제나 기본 문구로 돌아간다. */
(function(){
const App=window.App||(window.App={});
const KEY=(App.TXTS_KEY||'mj.txt.v1');
const LIMIT=90;                 /* 한 줄 입력 길이 제한 — 레이아웃이 깨지지 않게 */

App.TXTDEF=App.TXTDEF||{};      /* 기본 문구 */
App.TXTOVER=null;               /* 사용자가 고친 문구 (없으면 null) */

function load(){
  if(App.TXTOVER)return App.TXTOVER;
  try{App.TXTOVER=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){App.TXTOVER={}}
  return App.TXTOVER;
}
function persist(){
  try{localStorage.setItem(KEY,JSON.stringify(App.TXTOVER||{}))}catch(e){}
}

/* ── 등록 ─────────────────────────────────────────────── */
App.TXTSECTIONS=App.TXTSECTIONS||[];
App.TXTREG=App.TXTREG||[];
App.txSection=function(id,name,desc,open){
  let s=App.TXTSECTIONS.find(x=>x.id===id);
  if(!s){s={id:id,name:name||id,desc:desc||'',open:!!open,items:[]};App.TXTSECTIONS.push(s)}
  else{if(name)s.name=name;if(desc)s.desc=desc;if(open)s.open=true}
  return s;
};
App.txDef=function(key,def,label,section,opts){
  App.TXTDEF[key]=def==null?'':String(def);
  if(label){
    const s=App.txSection(section||'기타');
    if(!s.items.some(i=>i.k===key))s.items.push({k:key,label:label,auto:!!(opts&&opts.auto),hint:(opts&&opts.hint)||'',rows:(opts&&opts.rows)||1});
    if(!App.TXTREG.some(i=>i.k===key))App.TXTREG.push({k:key,label:label,section:s.id});
  }
};

/* ── 읽기·쓰기 ─────────────────────────────────────────── */
App.tx=function(key,auto){
  const map=load();
  const v=map[key];
  if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v);
  if(auto!==undefined&&auto!==null)return String(auto);
  const d=App.TXTDEF[key];
  return d===undefined?'':d;
};
App.txHas=function(key){const v=load()[key];return v!==undefined&&v!==null&&String(v).trim()!==''};
App.txDefault=function(key){const d=App.TXTDEF[key];return d===undefined?'':d};
App.txSet=function(key,val){
  load();
  const t=String(val==null?'':val).replace(/\s+$/,'').slice(0,LIMIT);
  if(t.trim()==='')delete App.TXTOVER[key];
  else App.TXTOVER[key]=t;
};
App.txResetAll=function(){App.TXTOVER={};persist()};
App.txCount=function(){return Object.keys(load()).length};

/* ── 관리자 화면 만들기 (다른 앱에서도 이 함수 하나로 같은 화면이 나온다) ── */
function esc(s){return App.esc?App.esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

App.txAdminHTML=function(){
  const secs=App.TXTSECTIONS.filter(s=>s.items.length);
  if(!secs.length)return '<div class="ad-none">아직 등록된 문구가 없습니다.</div>';
  const body=secs.map((s,i)=>{
    const rows=s.items.map(it=>{
      const cur=App.txHas(it.k)?App.tx(it.k):(it.auto?'':App.txDefault(it.k));
      const def=App.txDefault(it.k);
      const ph=it.auto?'자동 값 — 비우면 오늘 날짜·건수가 들어갑니다':esc('비우면 기본 문구: '+(def||'없음'));
      const tag=it.auto?'<i class="ad-tag">자동</i>':'';
      const cls='ad-row'+(it.auto?' is-auto':'');
      if(it.rows>1)return '<div class="'+cls+'"><label for="tx_'+i+'_'+it.k+'">'+esc(it.label)+tag+'</label>'
        +'<textarea id="tx_'+i+'_'+it.k+'" data-txk="'+esc(it.k)+'" rows="'+it.rows+'" placeholder="'+esc(ph)+'" maxlength="'+LIMIT+'">'+esc(cur)+'</textarea></div>';
      return '<div class="'+cls+'"><label for="tx_'+i+'_'+it.k+'">'+esc(it.label)+tag+'</label>'
        +'<input id="tx_'+i+'_'+it.k+'" data-txk="'+esc(it.k)+'" type="text" value="'+esc(cur)+'" placeholder="'+esc(ph)+'" maxlength="'+LIMIT+'" autocomplete="off" spellcheck="false"></div>';
    }).join('');
    return '<details class="ad-sec"'+(s.open?' open':'')+'>'
      +'<summary><span class="ad-sec-n">'+esc(s.name)+'</span>'
      +(s.desc?'<span class="ad-sec-d">'+esc(s.desc)+'</span>':'')
      +'<i class="ad-sec-c">'+s.items.length+'</i></summary>'
      +'<div class="ad-rows">'+rows+'</div></details>';
  }).join('');
  const n=App.txCount();
  return '<div class="ad">'
    +'<div class="ad-h"><span class="ad-k">관리자</span>'
      +'<h2>앱 글자 관리</h2>'
      +'<p>화면에 보이는 문구를 여기서 고칩니다. 고친 글자는 이 기기에 저장되어 앱을 다시 열어도 그대로 남습니다.</p>'
      +'<p class="ad-guide">묶음을 눌러 펼치면 그 안의 문구를 바로 고칠 수 있습니다.</p>'
      +'<div class="ad-hb"><span class="ad-cnt'+(n?' on':'')+'">'+(n?('고친 문구 '+n+'개'):'모든 문구가 처음 그대로입니다')+'</span></div>'
    +'</div>'
    +'<div class="ad-save"><button class="btn primary" type="button" data-action="tx-save">전체 저장</button>'
      +'<span class="ad-hint">고친 뒤 이 버튼을 누르면 앱 전체에 바로 들어갑니다</span></div>'
    +body
    +'<div class="ad-foot"><button class="btn danger" type="button" data-action="tx-reset">처음 값으로 되돌리기</button>'
      +'<p>되돌리면 모든 문구가 처음 상태로 돌아갑니다. 이 기기에 저장된 글자만 지워지고 일지·일정 같은 기록은 그대로입니다.</p></div>'
  +'</div>';
};

/* 저장 — 화면 안의 입력칸을 모두 읽어 저장한다. 기본 문구와 같으면 고친 것으로 치지 않는다 */
App.txAdminSave=function(root){
  const box=root||document;
  let n=0;
  Array.prototype.forEach.call(box.querySelectorAll('[data-txk]'),function(el){
    const k=el.dataset.txk;
    const meta=App.TXTREG.filter(function(x){return x.k===k})[0]||{};
    const v=String(el.value==null?'':el.value).trim();
    if(!meta.auto&&v===(App.txDefault(k)||'').trim())App.txSet(k,'');   /* 기본 그대로면 저장하지 않는다 */
    else App.txSet(k,el.value);
  });
  persist();
  n=App.txCount();
  return n;
};
})();
