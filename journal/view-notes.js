/* 목회 메모 */
function renderNotes(){
  const D=App.D;
  const q=(D.ui.noteQ||'').trim(), th=D.ui.noteTheme||'', tg=D.ui.noteTag||'', fav=D.ui.noteFav||false;
  const allTags=Array.from(new Set(D.notes.flatMap(n=>n.tags||[]))).sort();
  const list=D.notes.filter(n=>{
    if(th&&n.theme!==th)return false;
    if(tg&&!(n.tags||[]).includes(tg))return false;
    if(fav&&!n.fav)return false;
    if(q&&!(n.text||'').includes(q)&&!(n.tags||[]).join(' ').includes(q))return false;
    return true;
  }).sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)||(b.date||'').localeCompare(a.date||'')||(b.created||'').localeCompare(a.created||''));

  const el=document.getElementById('sc-notes');
  el.innerHTML=`
  <div class="card composer-card">
    <div class="card-h"><span class="hic">${App.ICON.bulb}</span><h2>새 목회 메모</h2><span class="hint">떠오를 때 바로</span></div>
    <div class="card-b">
      <div class="composer">
        <textarea id="nText" placeholder="목회 아이디어, 설교 아이디어, 기도제목… 한 칸에 바로 적으세요."></textarea>
        <div class="cf">
          <input class="tag" id="nTags" placeholder="태그  예: 청소년, 설교  (쉼표로 구분)">
          <select id="nTheme"><option value="">테마 선택 안 함</option>${App.THEMES.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select>
          <input id="nDate" type="date" value="${App.todayKey()}">
          <button class="btn primary" id="nSave">${App.ICON.plus} 저장</button>
        </div>
      </div>
    </div>
  </div>

  <div class="note-tools">
    <input id="nQ" placeholder="메모 검색" value="${App.esc(q)}">
    <button class="chip ${fav?'sel':''}" id="nFav">★ 즐겨찾기</button>
  </div>
  <div class="chips scroll mb10">
    <button class="chip ${!th?'sel':''}" data-th="">전체 테마</button>
    ${App.THEMES.map(t=>`<button class="chip ${th===t.id?'sel':''}" data-th="${t.id}" style="${th===t.id?'':'color:'+t.color}"><span class="pt"></span>${t.name}</button>`).join('')}
  </div>
  ${allTags.length?`<div class="chips scroll mb10">
    <button class="chip ${!tg?'sel':''}" data-tg="">모든 태그</button>
    ${allTags.map(t=>`<button class="chip ${tg===t?'sel':''}" data-tg="${App.esc(t)}">#${App.esc(t)}</button>`).join('')}
  </div>`:''}

  <div class="sec-title" style="margin-top:4px">메모 <span class="count">${list.length}개</span></div>
  <div class="note-grid">
    ${list.length?list.map(n=>`<article class="note ${n.fav?'fav':''}" data-note="${n.id}">
      <div class="txt">${App.nl(n.text)}</div>
      <div class="nf">
        ${n.theme?`<span class="chip" style="color:${App.THEME(n.theme).color}"><span class="pt"></span>${App.THEME(n.theme).name}</span>`:''}
        ${(n.tags||[]).map(t=>`<span class="tag-pill">#${App.esc(t)}</span>`).join('')}
        <span>${n.date?App.fmtDate(n.date):''}</span>
        <span class="acts">
          <button data-fav class="${n.fav?'star on':''}" title="즐겨찾기">${n.fav?App.ICON.starOn:App.ICON.star}</button>
          <button data-to class="nto" title="설교 준비로">설교로</button>
          <button data-edit title="수정">${App.ICON.edit}</button>
          <button data-del title="삭제">${App.ICON.trash}</button>
        </span>
      </div>
    </article>`).join('')
    :App.empty('메모가 없습니다','위 칸에 아이디어를 적고 저장을 누르면 카드로 쌓입니다.')}
  </div>`;

  const save=()=>{
    const text=el.querySelector('#nText').value.trim();
    if(!text){App.toast('메모 내용을 적어 주세요');return}
    const tags=el.querySelector('#nTags').value.split(/[,#]/).map(s=>s.trim()).filter(Boolean);
    D.notes.push({id:App.uid('n'),text,tags,theme:el.querySelector('#nTheme').value,
      date:el.querySelector('#nDate').value||App.todayKey(),fav:false,created:new Date().toISOString()});
    App.save();renderNotes();App.toast('메모를 저장했습니다');
  };
  el.querySelector('#nSave').onclick=save;
  el.querySelector('#nText').addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')save()});
  const qEl=el.querySelector('#nQ');
  qEl.oninput=()=>{D.ui.noteQ=qEl.value;renderNotes();const n=document.querySelector('#nQ');n.focus();n.setSelectionRange(n.value.length,n.value.length)};
  el.querySelector('#nFav').onclick=()=>{D.ui.noteFav=!D.ui.noteFav;App.save();renderNotes()};
  el.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{D.ui.noteTheme=b.dataset.th;App.save();renderNotes()});
  el.querySelectorAll('[data-tg]').forEach(b=>b.onclick=()=>{D.ui.noteTag=b.dataset.tg;App.save();renderNotes()});
  el.querySelectorAll('.note').forEach(n=>{
    const id=n.dataset.note, note=D.notes.find(x=>x.id===id);if(!note)return;
    n.querySelector('[data-fav]').onclick=e=>{e.stopPropagation();note.fav=!note.fav;App.save();renderNotes()};
    n.querySelector('[data-edit]').onclick=e=>{e.stopPropagation();noteEdit(id)};
    n.querySelector('[data-del]').onclick=async e=>{
      e.stopPropagation();
      if(await App.ask('이 메모를 지울까요?','삭제')){D.notes=D.notes.filter(x=>x.id!==id);App.save();renderNotes()}
    };
    n.querySelector('[data-to]').onclick=e=>{e.stopPropagation();noteToSermon(id)};
  });
}

function noteEdit(id){
  const D=App.D, n=D.notes.find(x=>x.id===id);if(!n)return;
  App.sheet({
    title:'메모 수정',
    body:`<label class="fld"><span>내용</span><textarea id="mText" style="min-height:150px">${App.esc(n.text)}</textarea></label>
      <div class="row2">
        <label class="fld"><span>태그 (쉼표 구분)</span><input id="mTags" value="${App.esc((n.tags||[]).join(', '))}"></label>
        <label class="fld"><span>날짜</span><input id="mDate" type="date" value="${n.date||App.todayKey()}"></label>
      </div>
      <label class="fld"><span>설교 테마</span><select id="mTheme"><option value="">선택 안 함</option>${App.THEMES.map(t=>`<option value="${t.id}" ${n.theme===t.id?'selected':''}>${t.name}</option>`).join('')}</select></label>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    n.text=document.getElementById('mText').value.trim();
    n.tags=document.getElementById('mTags').value.split(/[,#]/).map(s=>s.trim()).filter(Boolean);
    n.date=document.getElementById('mDate').value;
    n.theme=document.getElementById('mTheme').value;
    if(!n.text){App.toast('내용을 적어 주세요');return}
    App.save();App.closeSheet();renderNotes();
  };
}

function noteToSermon(id){
  const n=App.D.notes.find(x=>x.id===id);if(!n)return;
  App.sheet({
    title:'설교 준비로 보내기',
    body:`<p class="muted" style="margin:0 0 10px">메모 내용이 그 테마의 설교 준비 항목으로 넘어갑니다.</p>
      <label class="fld"><span>테마</span><select id="sTheme">${App.THEMES.map(t=>`<option value="${t.id}" ${n.theme===t.id?'selected':''}>${t.name}</option>`).join('')}</select></label>
      <label class="fld"><span>제목</span><input id="sTitle" value="${App.esc((n.text||'').split('\n')[0].slice(0,60))}"></label>
      <p class="muted" style="margin:0">본문·날짜는 설교 준비 화면에서 채우시면 됩니다.</p>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-ok>보내기</button>`
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-ok]').onclick=()=>{
    const theme=document.getElementById('sTheme').value;
    const title=document.getElementById('sTitle').value.trim()||'제목 없음';
    App.D.sermons.push({id:App.uid('s'),theme,title,passage:'',date:'',time:'',place:'',audience:'',
      outline:{intro:n.text,points:[{t:'',b:''},{t:'',b:''},{t:'',b:''}],apply:''},refs:'',status:'prep',
      sourceNote:n.id,created:new Date().toISOString()});
    App.D.ui.sermonTheme=theme;
    App.save();App.closeSheet();App.go('sermons');App.toast('설교 준비로 보냈습니다');
  };
}
