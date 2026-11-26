/* 설교 준비 */
function sermNext(theme){
  const today=App.todayKey();
  const pool=App.D.sermons.filter(s=>s.date&&s.date>=today&&(!theme||s.theme===theme));
  pool.sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||''));
  return pool[0]||null;
}

function renderSermons(){
  const D=App.D;
  const th=D.ui.sermonTheme||'dawn';
  const theme=App.THEME(th);
  const all=D.sermons.filter(s=>s.theme===th);
  const next=sermNext(th);
  const today=App.todayKey();
  const list=all.slice().sort((a,b)=>{
    const fa=a.date&&a.date>=today, fb=b.date&&b.date>=today;
    if(fa&&fb)return a.date.localeCompare(b.date);
    if(fa!==fb)return fa?-1:1;
    if(a.date&&b.date)return b.date.localeCompare(a.date);
    return (b.created||'').localeCompare(a.created||'');
  });

  const el=document.getElementById('sc-sermons');
  el.innerHTML=`
  <div class="theme-tabs mb12">
    ${App.THEMES.map(t=>{
      const n=D.sermons.filter(s=>s.theme===t.id).length;
      return `<button class="theme-card ${t.id===th?'sel':''}" data-th="${t.id}" style="--c:${t.color}">
        <span class="ic">${t.id==='ext'?App.ICON.sermons:App.ICON.book}</span>
        <span class="nm">${t.name}</span><span class="ct">${n}</span>
      </button>`}).join('')}
  </div>

  <div class="split">
    <div class="sticky">
      ${next?`<div class="next-card">
        <div class="lb">다음 ${theme.name}</div>
        <div class="tt">${App.esc(next.title)}</div>
        ${next.passage?`<div class="mt" style="color:#f7d189;font-weight:600">${App.esc(next.passage)}</div>`:''}
        <div class="mt">${[next.date?App.fmtDate(next.date,true):'',next.time,next.place].filter(Boolean).map(App.esc).join(' · ')}</div>
        <div class="mt" style="margin-top:9px"><span class="dday">${ddLabel(next.date)}</span></div>
      </div>`:`<div class="card"><div class="card-b">${App.empty('예정된 설교가 없습니다',theme.name+' 설교를 준비해 두면 가장 가까운 설교가 여기 뜹니다.')}</div></div>`}
      <div class="card mt12">
        <div class="card-h"><h2>${theme.name}</h2><span class="hint">${all.length}편</span></div>
        <div class="card-b">
          <div class="mini-stats">
            <div><b>${all.filter(s=>s.status==='done').length}</b><span>완성</span></div>
            <div><b>${all.filter(s=>s.status==='prep').length}</b><span>준비중</span></div>
            <div><b>${all.filter(s=>s.status==='hold').length}</b><span>보류</span></div>
          </div>
          <button class="btn primary mt12" style="width:100%" data-sadd>${App.ICON.plus} 설교 준비 추가</button>
        </div>
      </div>
    </div>
    <div>
      <div class="sec-title" style="margin-top:0">${theme.name} 준비 목록 <span class="count">${list.length}편</span></div>
      <div class="slist">
        ${list.length?list.map(s=>{
          const st=App.SSTATUS[s.status]||App.SSTATUS.prep;
          return `<article class="sermon" data-s="${s.id}">
            <div class="sid">${s.date?`<span class="dday ${s.date<today?'past':''}">${ddLabel(s.date)}</span>`:`<span class="dday past">미정</span>`}</div>
            <div class="body">
              <div class="tt">${App.esc(s.title||'제목 없음')}</div>
              ${s.passage?`<div class="ps">${App.esc(s.passage)}</div>`:''}
              <div class="mt">
                ${s.date?`<i>${App.fmtDate(s.date)}${s.time?' '+s.time:''}</i>`:''}
                ${s.place?`<i>${App.esc(s.place)}</i>`:''}
                ${s.audience?`<i>${App.esc(s.audience)}</i>`:''}
              </div>
            </div>
            <span class="chip st-${s.status==='prep'?'plan':s.status}" class="st">${st.label}</span>
          </article>`}).join('')
        :App.empty('아직 준비 중인 설교가 없습니다','설교를 추가하고 3단 개요(도입·본문 3대지·적용)를 채워 보세요.')}
      </div>
    </div>
  </div>`;

  el.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{D.ui.sermonTheme=b.dataset.th;App.save();renderSermons()});
  el.querySelector('[data-sadd]').onclick=()=>sermonEdit(null,th);
  el.querySelectorAll('[data-s]').forEach(n=>n.onclick=()=>sermonEdit(n.dataset.s));
}

function sermonEdit(id,themeId){
  const D=App.D;
  const s=id?D.sermons.find(x=>x.id===id):{id:'',theme:themeId||D.ui.sermonTheme||'dawn',title:'',passage:'',date:'',time:'',place:'',audience:'',
    outline:{intro:'',points:[{t:'',b:''},{t:'',b:''},{t:'',b:''}],apply:''},refs:'',status:'prep'};
  if(!s)return;
  if(!s.outline)s.outline={intro:'',points:[{t:'',b:''},{t:'',b:''},{t:'',b:''}],apply:''};
  if(!Array.isArray(s.outline.points)||s.outline.points.length<3)s.outline.points=[0,1,2].map(i=>s.outline.points[i]||{t:'',b:''});
  const pts=s.outline.points;
  App.sheet({
    title:id?'설교 준비 수정':'설교 준비 추가',
    body:`<label class="fld"><span>테마</span><div class="chips" id="mThemes">${App.THEMES.map(t=>`<button class="chip ${s.theme===t.id?'sel':''}" data-t="${t.id}" style="${s.theme===t.id?'':'color:'+t.color}"><span class="pt"></span>${t.name}</button>`).join('')}</div></label>
      <label class="fld"><span>제목</span><input id="sTitle" value="${App.esc(s.title)}" placeholder="예: 두려움 앞에서"></label>
      <label class="fld"><span>본문</span><input id="sPassage" value="${App.esc(s.passage)}" placeholder="예: 빌립보서 4:4-9"></label>
      <div class="row2">
        <label class="fld"><span>설교 날짜</span><input id="sDate" type="date" value="${s.date||''}"></label>
        <label class="fld"><span>예배 시간</span><input id="sTime" type="time" value="${s.time||''}"></label>
      </div>
      <div class="row2">
        <label class="fld"><span>장소 / 기관·주소</span><input id="sPlace" value="${App.esc(s.place)}"></label>
        <label class="fld"><span>대상</span><input id="sAud" value="${App.esc(s.audience)}" placeholder="예: 청년부, 고3"></label>
      </div>
      <label class="fld"><span>참고자료 링크</span><input id="sRefs" value="${App.esc(s.refs)}" placeholder="https://"></label>

      <div class="outline mt8">
        <h4>개요 — 도입 · 본문 3대지 · 적용</h4>
        <label class="sec"><span>도입</span><textarea id="oIntro" placeholder="들어가는 이야기·질문·사례">${App.esc(s.outline.intro||'')}</textarea></label>
        ${pts.slice(0,3).map((p,i)=>`<div class="point">
          <span class="no">${i+1}</span>
          <div class="pf">
            <input id="pT${i}" value="${App.esc(p.t||'')}" placeholder="${i+1}대지 제목">
            <textarea id="pB${i}" placeholder="설명·본문 적용">${App.esc(p.b||'')}</textarea>
          </div>
        </div>`).join('')}
        <label class="sec" style="margin-top:8px"><span>적용</span><textarea id="oApply" placeholder="삶으로 이어지는 한 가지">${App.esc(s.outline.apply||'')}</textarea></label>
      </div>

      <label class="fld"><span>상태</span><div class="chips" id="sStat">${Object.entries(App.SSTATUS).map(([k,v])=>`<button class="chip ${(s.status||'prep')===k?'st-'+(k==='prep'?'plan':k):''}" data-st="${k}" style="${(s.status||'prep')===k?'':'color:'+v.color}"><span class="pt"></span>${v.label}</button>`).join('')}</div></label>`,
    footer:`${id?'<button class="btn danger" data-del>삭제</button>':''}<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  let theme=s.theme, st=s.status||'prep';
  document.querySelectorAll('#mThemes [data-t]').forEach(b=>b.onclick=()=>{
    theme=b.dataset.t;document.querySelectorAll('#mThemes [data-t]').forEach(x=>x.classList.toggle('sel',x===b));
  });
  document.querySelectorAll('#sStat [data-st]').forEach(b=>b.onclick=()=>{
    st=b.dataset.st;
    document.querySelectorAll('#sStat [data-st]').forEach(x=>{x.className='chip';x.style.color=App.SSTATUS[x.dataset.st].color});
    b.className='chip st-'+(st==='prep'?'plan':st);b.style.color='';
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    const title=document.getElementById('sTitle').value.trim();
    if(!title){App.toast('제목을 적어 주세요');return}
    const rec={theme,title,passage:document.getElementById('sPassage').value.trim(),
      date:document.getElementById('sDate').value,time:document.getElementById('sTime').value,
      place:document.getElementById('sPlace').value.trim(),audience:document.getElementById('sAud').value.trim(),
      refs:document.getElementById('sRefs').value.trim(),status:st,
      outline:{intro:document.getElementById('oIntro').value,
        points:[0,1,2].map(i=>({t:document.getElementById('pT'+i).value,b:document.getElementById('pB'+i).value})),
        apply:document.getElementById('oApply').value}};
    if(id)Object.assign(s,rec);
    else D.sermons.push(Object.assign({id:App.uid('s'),created:new Date().toISOString()},rec));
    D.ui.sermonTheme=theme;App.save();App.closeSheet();renderSermons();App.toast('저장했습니다');
  };
  const del=document.querySelector('[data-del]');
  if(del)del.onclick=async()=>{
    if(await App.ask('이 설교 준비를 지울까요?','삭제')){D.sermons=D.sermons.filter(x=>x.id!==id);App.save();App.closeSheet();renderSermons()}
  };
}
