/* 상담 일지 */
App.PCATS=[
  {id:'youth',name:'청소년',color:'#57ce93'},
  {id:'parent',name:'학부모',color:'#e8b04b'},
  {id:'pastor',name:'목회자',color:'#82a9e6'},
  {id:'etc',name:'기타',color:'#b79cff'}
];
App.PCAT=id=>App.PCATS.find(c=>c.id===id)||App.PCATS[3];
App.personRecords=function(pid){
  return App.D.records.filter(r=>r.personId===pid).sort((a,b)=>b.date.localeCompare(a.date));
};

function renderCounsel(){
  const D=App.D;
  const q=(D.ui.counselQ||'').trim();
  const pf=D.ui.counselFilter||'all';
  const sel=D.ui.counselId;
  const people=D.people.slice().sort((a,b)=>{
    const la=App.personRecords(a.id)[0], lb=App.personRecords(b.id)[0];
    return (lb?lb.date:'').localeCompare(la?la.date:'')||a.name.localeCompare(b.name);
  }).filter(p=>(pf==='all'||p.category===pf)&&(!q||p.name.includes(q)||(p.note||'').includes(q)||(p.contact||'').includes(q)));
  const person=sel?D.people.find(p=>p.id===sel):null;
  const recs=person?App.personRecords(person.id):[];
  const total=D.records.length;

  const el=document.getElementById('sc-counsel');
  el.innerHTML=`
  <div class="split">
    <div class="sticky">
      <div class="privacy">${App.ICON.lock}<span><b>이 기기에만 저장됩니다.</b> 상담 기록은 서버로 보내지 않고 이 브라우저에만 남습니다. 내보낼 때만 파일로 나갑니다.</span></div>
      <div class="card mt12">
        <div class="card-h"><h2>상담 대상자</h2><span class="hint">${D.people.length}명 · 기록 ${total}건</span></div>
        <div class="card-b">
          <input id="pSearch" placeholder="이름·메모 검색" value="${App.esc(q)}">
          <div class="chips mt8">
            <button class="chip ${pf==='all'?'sel':''}" data-pf="all">전체</button>
            ${App.PCATS.map(c=>`<button class="chip ${pf===c.id?'sel':''}" data-pf="${c.id}" style="${pf===c.id?'':'color:'+c.color}"><span class="pt"></span>${c.name}</button>`).join('')}
          </div>
          <div class="people mt12">
            ${people.length?people.map(p=>{
              const c=App.PCAT(p.category), rs=App.personRecords(p.id);
              return `<button class="person ${sel===p.id?'sel':''}" data-p="${p.id}">
                <span class="avatar ${p.category}">${App.esc((p.name||'?').slice(0,1))}</span>
                <span><span class="nm">${App.esc(p.name)}</span><span class="mt">${c.name}${rs.length?' · 최근 '+rs[0].date.slice(5).replace('-','/')+'' :' · 기록 없음'}</span></span>
                <span class="cnt">${rs.length}</span>
              </button>`}).join('')
            :`<div class="empty small">${q||pf!=='all'?'조건에 맞는 대상자가 없습니다.':'상담 대상자를 먼저 등록해 주세요.'}</div>`}
          </div>
          <button class="btn primary mt12" style="width:100%" data-padd>${App.ICON.plus} 대상자 추가</button>
          <div class="ctools"><button class="btn sm ghost" data-pexport>상담 기록만 내보내기</button></div>
        </div>
      </div>
    </div>

    <div>
      ${person?`
      <div class="card">
        <div class="card-h">
          <button class="btn sm ghost counsel-back" data-back>← 목록</button>
          <h2>${App.esc(person.name)}</h2>
          <span class="chip" style="color:${App.PCAT(person.category).color}"><span class="pt"></span>${App.PCAT(person.category).name}</span>
          <span class="hint"></span>
          <button class="btn sm ghost" data-pedit>수정</button>
        </div>
        <div class="card-b">
          <div class="pinfo">
            ${person.contact?`<a href="tel:${App.esc(person.contact.replace(/[^0-9+]/g,''))}" class="pcontact">☎ ${App.esc(person.contact)}</a>`:'<span class="muted">연락처 없음</span>'}
            ${person.note?`<div class="pnote">${App.nl(person.note)}</div>`:''}
          </div>
          <div class="sec-title">상담 기록 <span class="count">${recs.length}건</span></div>
          <div class="timeline">
            ${recs.length?recs.map(r=>`<article class="rec" data-rid="${r.id}">
              <div class="rh"><span class="rd">${App.fmtDate(r.date)}</span><span class="rt">${App.esc(r.topic||'상담')}</span></div>
              ${r.content?`<div class="rc">${App.nl(r.content)}</div>`:''}
              ${r.next?`<div class="rn">다음 약속 · ${App.esc(r.next)}</div>`:''}
            </article>`).join('')
            :App.empty('기록이 없습니다','첫 상담 내용을 아래에 남겨 보세요.')}
          </div>
          <button class="btn primary rec-toggle" data-rtoggle>${App.ICON.plus} 새 상담 기록</button>
          <div class="recform" style="display:${D.ui.recOpen?'block':'none'}">
            <div class="row2">
              <label class="fld"><span>날짜</span><input id="rDate" type="date" value="${App.todayKey()}"></label>
              <label class="fld"><span>주제</span><input id="rTopic" placeholder="예: 진로 고민"></label>
            </div>
            <label class="fld"><span>내용</span><textarea id="rContent" placeholder="상담한 내용·반응·기도제목"></textarea></label>
            <label class="fld"><span>다음 약속</span><input id="rNext" placeholder="예: 12/3 오후 2시, 교회"></label>
            <button class="btn primary" data-radd style="width:100%">${App.ICON.plus} 기록 저장</button>
          </div>
        </div>
      </div>`
      :`<div class="card"><div class="card-b">${App.empty('상담 대상자를 선택해 주세요','왼쪽 목록에서 대상을 누르면 상담 기록이 시간순으로 쌓입니다.','<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12.2c0 4-3.8 7.1-8.5 7.1-1 0-2-.1-2.9-.4L4 20.5l1.2-3.2A6.6 6.6 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z"/></svg>')}</div></div>`}
    </div>
  </div>`;

  el.classList.toggle('person-open',!!person);
  const s=el.querySelector('#pSearch');
  s.oninput=()=>{D.ui.counselQ=s.value;renderCounsel();const n=el.querySelector('#pSearch');n.focus();n.setSelectionRange(n.value.length,n.value.length)};
  el.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{D.ui.counselFilter=b.dataset.pf;App.save();renderCounsel()});
  el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{D.ui.counselId=b.dataset.p;D.ui.recOpen=false;App.save();renderCounsel()});
  el.querySelector('[data-padd]').onclick=()=>personEdit(null);
  el.querySelector('[data-pexport]').onclick=exportCounsel;
  const pe=el.querySelector('[data-pedit]');if(pe)pe.onclick=()=>personEdit(person.id);
  const ra=el.querySelector('[data-radd]');
  if(ra)ra.onclick=()=>{
    const content=el.querySelector('#rContent').value.trim(), topic=el.querySelector('#rTopic').value.trim();
    if(!content&&!topic){App.toast('내용을 적어 주세요');return}
    D.records.push({id:App.uid('r'),personId:person.id,date:el.querySelector('#rDate').value||App.todayKey(),
      topic,content,next:el.querySelector('#rNext').value.trim()});
    D.ui.recOpen=false;App.save();renderCounsel();App.toast('상담 기록을 저장했습니다');
  };
  el.querySelectorAll('.rec').forEach(n=>n.onclick=()=>recordEdit(n.dataset.rid));
  const back=el.querySelector('[data-back]');if(back)back.onclick=()=>{D.ui.counselId=null;D.ui.recOpen=false;App.save();renderCounsel()};
  const rt=el.querySelector('[data-rtoggle]');if(rt)rt.onclick=()=>{D.ui.recOpen=true;App.save();renderCounsel();const f=document.querySelector('#rTopic');if(f)f.focus()};
}

function personEdit(id){
  const D=App.D;
  const p=id?D.people.find(x=>x.id===id):{id:'',name:'',category:'youth',contact:'',note:''};
  if(!p)return;
  App.sheet({
    title:id?'대상자 수정':'상담 대상자 추가',
    body:`<label class="fld"><span>이름 / 별칭</span><input id="pName" value="${App.esc(p.name)}" placeholder="예: 김○○ (청년부)"></label>
      <label class="fld"><span>구분</span><div class="chips" id="pCats">${App.PCATS.map(c=>`<button class="chip ${p.category===c.id?'sel':''}" data-c="${c.id}" style="${p.category===c.id?'':'color:'+c.color}"><span class="pt"></span>${c.name}</button>`).join('')}</div></label>
      <label class="fld"><span>연락처</span><input id="pContact" type="tel" value="${App.esc(p.contact)}" placeholder="010-0000-0000"></label>
      <label class="fld"><span>메모</span><textarea id="pNote" placeholder="배경·기도제목·유의할 점">${App.esc(p.note)}</textarea></label>
      <p class="muted" style="margin:0">상담 관련 내용은 이 기기 브라우저에만 저장됩니다.</p>`,
    footer:`${id?'<button class="btn danger" data-del>삭제</button>':''}<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  let cat=p.category;
  document.querySelectorAll('#pCats [data-c]').forEach(b=>b.onclick=()=>{
    cat=b.dataset.c;
    document.querySelectorAll('#pCats [data-c]').forEach(x=>{x.classList.toggle('sel',x===b)});
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    const name=document.getElementById('pName').value.trim();
    if(!name){App.toast('이름을 적어 주세요');return}
    const rec={id:p.id||App.uid('p'),name,category:cat,
      contact:document.getElementById('pContact').value.trim(),
      note:document.getElementById('pNote').value.trim()};
    if(p.id){Object.assign(D.people.find(x=>x.id===p.id),rec)}else{D.people.push(rec);D.ui.counselId=rec.id}
    App.save();App.closeSheet();D.ui.counselId=rec.id;App.save();App.render();App.toast('저장했습니다');
  };
  const del=document.querySelector('[data-del]');
  if(del)del.onclick=async()=>{
    if(await App.ask(`${p.name} 님과 상담 기록 ${App.personRecords(p.id).length}건을 모두 지울까요?`,'삭제')){
      D.people=D.people.filter(x=>x.id!==p.id);D.records=D.records.filter(r=>r.personId!==p.id);
      D.ui.counselId=null;App.save();App.closeSheet();App.render();App.toast('삭제했습니다');
    }
  };
}

function recordEdit(id){
  const D=App.D, r=D.records.find(x=>x.id===id);if(!r)return;
  App.sheet({
    title:'상담 기록',
    body:`<div class="row2">
        <label class="fld"><span>날짜</span><input id="xDate" type="date" value="${r.date}"></label>
        <label class="fld"><span>주제</span><input id="xTopic" value="${App.esc(r.topic)}"></label>
      </div>
      <label class="fld"><span>내용</span><textarea id="xContent" style="min-height:130px">${App.esc(r.content)}</textarea></label>
      <label class="fld"><span>다음 약속</span><input id="xNext" value="${App.esc(r.next)}"></label>`,
    footer:`<button class="btn danger" data-del>삭제</button><button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    Object.assign(r,{date:document.getElementById('xDate').value,topic:document.getElementById('xTopic').value.trim(),
      content:document.getElementById('xContent').value.trim(),next:document.getElementById('xNext').value.trim()});
    App.save();App.closeSheet();App.render();
  };
  document.querySelector('[data-del]').onclick=async()=>{
    if(await App.ask('이 상담 기록을 지울까요?','삭제')){
      D.records=D.records.filter(x=>x.id!==id);App.save();App.closeSheet();App.render();
    }
  };
}

function exportCounsel(){
  const D=App.D;
  const payload={exported:new Date().toISOString(),kind:'상담일지',people:D.people.map(p=>Object.assign({},p,{records:App.personRecords(p.id)}))};
  App.download(`상담일지-${App.todayKey()}.json`,JSON.stringify(payload,null,1));
  App.toast('상담 기록을 파일로 내보냈습니다');
}
