/* 맛집·숙소 리스트 */
App.foodVisits=function(r){return (r.visits||[]).slice().sort((a,b)=>b.date.localeCompare(a.date))};
App.foodOn=function(dk){
  return App.D.restaurants.filter(r=>(r.visits||[]).some(v=>v.date===dk));
};
/* 다녀온 곳 종류 — 식당 · 숙소 · 명소 (2026-11-26 목사님 지시로 명소 추가) */
App.foodType=r=>{const t=(r&&(r.type||r.kind))||'식당';return t==='숙소'?'숙소':(t==='명소'?'명소':'식당')};
App.foodPhone=r=>String(r.phone||'').split(/[\/,·]/)[0].trim();
App.foodStars=function(n){
  n=Math.max(0,Math.min(5,Math.round(+n||0)));
  let s='';
  for(let i=1;i<=5;i++)s+=`<span class="fs ${i<=n?'on':''}">★</span>`;
  return `<span class="fstars" aria-label="${n}점">${s}</span>`;
};
App.foodMapUrl=function(r){
  if(r.mapUrl)return r.mapUrl;
  return 'https://map.naver.com/p/search/'+encodeURIComponent([r.name,r.address||r.region].filter(Boolean).join(' '));
};
App.foodSeed=function(){
  if(!window.SEED_RESTAURANTS||!window.SEED_RESTAURANTS.length)return 0;
  let n=0;
  window.SEED_RESTAURANTS.forEach(s=>{
    const key=(s.name||'').trim()+'|'+(s.address||'').trim();
    if(App.D.restaurants.some(r=>(r.name||'').trim()+'|'+(r.address||'').trim()===key))return;
    App.D.restaurants.push({
      id:App.uid('f'),name:s.name||'',alias:s.alias||'',type:s.type||s.kind||'식당',region:s.region||'',address:s.address||'',
      menu:s.menu||'',price:s.price||'',hours:s.hours||'',rating:+s.rating||0,
      reviews:s.reviews||'',phone:s.phone||'',mapUrl:s.mapUrl||'',website:s.website||'',note:s.note||'',
      pick:!!s.pick,visited:s.visited===true,
      photo:'',photoType:'',visits:(Array.isArray(s.visited)?s.visited:[]).filter(Boolean).map(d=>({id:App.uid('fv'),date:d,memo:''}))
    });
    n++;
  });
  if(n)App.save();
  return n;
};

function renderFood(){
  const D=App.D;
  const q=(D.ui.foodQ||'').trim(), rg=D.ui.foodRegion||'', tp=D.ui.foodType||'';
  const regions=Array.from(new Set(D.restaurants.map(r=>r.region).filter(Boolean))).sort();
  const nStay=D.restaurants.filter(r=>App.foodType(r)==='숙소').length;
  const nSpot=D.restaurants.filter(r=>App.foodType(r)==='명소').length;
  const nEat=D.restaurants.length-nStay-nSpot;
  const list=D.restaurants.filter(r=>{
    if(tp&&App.foodType(r)!==tp)return false;
    if(rg&&r.region!==rg)return false;
    if(q){const hay=[r.name,r.alias,r.region,r.menu,r.address,r.note,r.reviews,'맛집','숙소','명소'].filter(Boolean).join(' ');if(!hay.includes(q))return false}
    return true;
  }).sort((a,b)=>{
    if(!!b.pick!==!!a.pick)return b.pick?1:-1;
    const va=App.foodVisits(a)[0], vb=App.foodVisits(b)[0];
    const da=(va&&va.date)?String(va.date):'', db=(vb&&vb.date)?String(vb.date):'';
    return db.localeCompare(da)||((b.rating||0)-(a.rating||0))||String(a.name||'').localeCompare(String(b.name||''));
  });

  const el=document.getElementById('sc-food');
  el.innerHTML=`
  <div class="food-top">
    <div class="food-title">
      <h2>다녀온 곳 <span class="ftype-note">맛집 · 숙소 · 명소</span></h2>
      <span class="muted">${nEat}곳 맛집 · ${nStay}곳 숙소 · ${nSpot}곳 명소 · 방문 ${D.restaurants.reduce((a,r)=>a+(r.visits||[]).length,0)}회</span>
    </div>
    <button class="btn primary" data-fadd>${App.ICON.plus} 추가</button>
  </div>
  <div class="food-tools">
    <input id="fQ" placeholder="맛집·숙소·명소·이름 검색" value="${App.esc(q)}">
    <div class="chips scroll">
      <button class="chip ${!tp?'sel':''}" data-ft="">전체</button>
      <button class="chip ${tp==='식당'?'sel':''}" data-ft="식당">식당</button>
      <button class="chip ${tp==='숙소'?'sel':''}" data-ft="숙소">숙소</button>
      <button class="chip ${tp==='명소'?'sel':''}" data-ft="명소">명소</button>
    </div>
  </div>
  ${regions.length?`<div class="chips scroll mb12">
      <button class="chip ${!rg?'sel':''}" data-fr="">전체 지역</button>
      ${regions.map(x=>`<button class="chip ${rg===x?'sel':''}" data-fr="${App.esc(x)}">${App.esc(x)}</button>`).join('')}
    </div>`:''}

  ${list.length?`<div class="food-grid">
    ${list.map(r=>{
      const vs=App.foodVisits(r), last=vs[0], isStay=App.foodType(r)==='숙소', isSpot=App.foodType(r)==='명소';
      return `<article class="food" data-f="${r.id}">
        <div class="food-img ${r.photo?'':'noimg'}" ${r.photo?`style="background-image:url('${r.photo}')"`:''}>
          ${r.photo?'':`<span class="ph-initial">${App.esc((r.name||'?').slice(0,1))}</span><span class="ph-label">${isStay?'STAY':isSpot?'SPOT':'TABLE'}</span>`}
          <div class="food-badges">
            ${r.pick?'<span class="fb pick">목사님 지정</span>':''}
            ${isStay?'<span class="fb stay">숙소</span>':''}
            ${isSpot?'<span class="fb spot">명소</span>':''}
            ${r.photo&&r.photoType==='card'?'<span class="fb card">명함 있음</span>':''}
            ${r.photo&&r.photoType==='sign'?'<span class="fb card">간판 사진</span>':''}
            ${vs.length?`<span class="fb">방문 ${vs.length}회</span>`:(r.visited?'<span class="fb">방문</span>':'')}
          </div>
        </div>
        <div class="food-b">
          <div class="food-r1">
            <b>${App.esc(r.name)}</b>
            ${r.rating?`<span class="fscore">★ ${(+r.rating).toFixed(1)}</span>`:''}
          </div>
          <div class="food-region">${App.esc(r.region||'')}${r.region&&r.address?' · ':''}${App.esc(r.address||'')}${r.alias?` <i class="falias">(${App.esc(r.alias)})</i>`:''}</div>
          ${isStay
            ? `<div class="food-menu">${[r.hours?'체크인 '+App.esc(r.hours):'',r.phone?App.esc(r.phone):''].filter(Boolean).join(' · ')||'위치·연락처는 카드에서 확인'}</div>`
            : isSpot
              ? `<div class="food-menu">${[r.menu,r.hours].filter(Boolean).map(App.esc).join(' · ')||'볼거리·관람시간은 카드에서 확인'}</div>`
              : (r.menu?`<div class="food-menu">${App.esc(r.menu)}${r.price?` · ${App.esc(r.price)}`:''}</div>`:'')}
          <div class="food-foot">
            <span class="food-last">${last?'최근 방문 '+App.fmtDate(last.date):(r.visited?'방문한 곳':'방문 기록 없음')}</span>
            <span class="food-acts">
              <a class="fbtn" href="${App.foodMapUrl(r)}" target="_blank" rel="noopener" title="지도" onclick="event.stopPropagation()">지도</a>
              ${r.phone?`<a class="fbtn" href="tel:${App.esc(App.foodPhone(r).replace(/[^0-9+]/g,''))}" title="전화" onclick="event.stopPropagation()">전화</a>`:''}
              ${isStay&&r.website?`<a class="fbtn" href="${App.esc(r.website)}" target="_blank" rel="noopener" title="홈페이지" onclick="event.stopPropagation()">홈페이지</a>`:''}
            </span>
          </div>
        </div>
      </article>`}).join('')}
  </div>`
  :`<div class="card"><div class="card-b">${App.empty('등록된 곳이 없습니다','명함이나 간판 사진을 올려 다녀온 곳을 기록해 보세요.<br>사진이 카드 썸네일이 되고 <b>명함 있음</b> 표시가 붙습니다.')}</div></div>`}
  <p class="muted" style="margin:12px 3px 0">카드를 누르면 방문 기록과 메모를 볼 수 있습니다. 사진은 자동으로 줄여 이 기기에만 저장합니다.</p>`;

  el.querySelector('[data-fadd]').onclick=()=>foodEdit(null);
  const qi=el.querySelector('#fQ');
  qi.oninput=()=>{D.ui.foodQ=qi.value;renderFood();const n=document.querySelector('#fQ');n.focus();n.setSelectionRange(n.value.length,n.value.length)};
  el.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>{D.ui.foodRegion=b.dataset.fr;App.save();renderFood()});
  el.querySelectorAll('[data-ft]').forEach(b=>b.onclick=()=>{D.ui.foodType=b.dataset.ft;App.save();renderFood()});
  el.querySelectorAll('[data-f]').forEach(n=>n.onclick=e=>{
    if(e.target.closest('a'))return;
    foodDetail(n.dataset.f);
  });
}

function foodDetail(id){
  const r=App.D.restaurants.find(x=>x.id===id);if(!r)return;
  const vs=App.foodVisits(r), isStay=App.foodType(r)==='숙소', isSpot=App.foodType(r)==='명소';
  App.sheet({
    title:isStay?'숙소 정보':isSpot?'명소 정보':'맛집 정보',
    body:`${r.photo?`<div class="fd-img" style="background-image:url('${r.photo}')"></div>`:''}
      <div class="fd-head">
        <div><b class="fd-name">${App.esc(r.name)}</b>${r.alias?` <span class="falias">${App.esc(r.alias)}</span>`:''}
          <div class="food-region" style="margin-top:3px">${App.esc([r.region,r.address].filter(Boolean).join(' · '))}</div></div>
        <div>${r.rating?App.foodStars(r.rating):'<span class="muted">별점 없음</span>'}</div>
      </div>
      <div class="fd-grid">
        ${isStay?`<div><span>위치</span><b>${App.esc([r.region,r.address].filter(Boolean).join(' ')||'—')}</b></div>`:''}
        ${r.menu?`<div><span>${isSpot?'볼거리':'대표 메뉴'}</span><b>${App.esc(r.menu)}</b></div>`:''}
        ${r.price?`<div><span>가격</span><b>${App.esc(r.price)}</b></div>`:''}
        ${r.hours?`<div><span>${isStay?'체크인·영업':'영업시간'}</span><b>${App.esc(r.hours)}</b></div>`:''}
        ${r.phone?`<div><span>전화</span><b>${App.esc(r.phone)}</b></div>`:''}
        ${r.website?`<div><span>홈페이지</span><b><a href="${App.esc(r.website)}" target="_blank" rel="noopener" style="color:#f7d189">바로가기</a></b></div>`:''}
        ${typeof r.reviews==='number'?`<div><span>평점</span><b>${(+r.rating||0).toFixed(1)} · 리뷰 ${r.reviews}개</b></div>`:''}
      </div>
      ${r.reviews&&typeof r.reviews!=='number'?`<div class="fd-review">${App.nl(r.reviews)}</div>`:''}
      ${r.note?`<div class="fd-note">${App.nl(r.note)}</div>`:''}
      <div class="fd-btns">
        <a class="btn sm" href="${App.foodMapUrl(r)}" target="_blank" rel="noopener">지도 열기</a>
        ${r.phone?`<a class="btn sm" href="tel:${App.esc(App.foodPhone(r).replace(/[^0-9+]/g,''))}">전화 걸기</a>`:''}
        ${r.website?`<a class="btn sm" href="${App.esc(r.website)}" target="_blank" rel="noopener">홈페이지</a>`:''}
        <button class="btn sm" data-fedit>수정</button>
      </div>
      <div class="sec-title">방문 기록 <span class="count">${vs.length}회</span></div>
      <div class="fvisits">
        ${vs.length?vs.map(v=>`<div class="fvisit"><span class="fd">${App.fmtDate(v.date)}</span><span class="fm">${App.esc(v.memo||'방문')}</span></div>`).join('')
        :'<div class="muted">아직 방문 기록이 없습니다.</div>'}
      </div>
      <div class="inline-form">
        <input class="date" type="date" id="fvDate" value="${App.todayKey()}">
        <input id="fvMemo" placeholder="오늘의 한 줄">
        <button class="btn sm primary" id="fvAdd">방문 추가</button>
      </div>`,
    footer:`<button class="btn danger" data-del>삭제</button><button class="btn primary" data-x>닫기</button>`
  });
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-fedit]').onclick=()=>foodEdit(id);
  document.querySelector('#fvAdd').onclick=()=>{
    const d=document.getElementById('fvDate').value||App.todayKey();
    const m=document.getElementById('fvMemo').value.trim();
    r.visits=r.visits||[];
    const ex=r.visits.find(v=>v.date===d);
    if(ex){ex.memo=[ex.memo,m].filter(Boolean).join(' / ')}
    else r.visits.push({id:App.uid('fv'),date:d,memo:m});
    App.save();App.closeSheet();renderFood();App.toast('방문을 기록했습니다');
  };
  document.querySelector('[data-del]').onclick=async()=>{
    if(await App.ask(`${r.name} 을(를) 목록에서 지울까요?`,'삭제')){
      App.D.restaurants=App.D.restaurants.filter(x=>x.id!==id);App.save();App.closeSheet();renderFood();
    }
  };
}

function foodEdit(id){
  const D=App.D;
  const r=id?D.restaurants.find(x=>x.id===id):{id:'',name:'',alias:'',type:'식당',region:'',address:'',menu:'',price:'',hours:'',rating:0,reviews:'',phone:'',mapUrl:'',website:'',note:'',photo:'',photoType:'',visits:[]};
  if(!r)return;
  const regions=Array.from(new Set(D.restaurants.map(x=>x.region).filter(Boolean)));
  App.sheet({
    title:id?'수정':'다녀온 곳 추가',
    body:`<label class="fld"><span>종류</span><div class="chips" id="fType2">
        <button class="chip ${App.foodType(r)==='식당'?'sel':''}" data-ty="식당">식당</button>
        <button class="chip ${App.foodType(r)==='숙소'?'sel':''}" data-ty="숙소">숙소</button>
        <button class="chip ${App.foodType(r)==='명소'?'sel':''}" data-ty="명소">명소</button>
      </div></label>
      <label class="fld"><span>이름</span><input id="fName" value="${App.esc(r.name)}" placeholder="예: 고산수제갈비 · 아차산 고구려정"></label>
      <div class="row2">
        <label class="fld"><span>지역</span><input id="fRegion" value="${App.esc(r.region)}" list="regionList" placeholder="예: 의정부"></label>
        <label class="fld"><span>방문일</span><input id="fDate" type="date" value="${App.todayKey()}"></label>
      </div>
      <datalist id="regionList">${regions.map(x=>`<option value="${App.esc(x)}">`).join('')}</datalist>
      <label class="fld"><span>주소</span><input id="fAddr" value="${App.esc(r.address)}"></label>
      <div class="row2">
        <label class="fld"><span>대표 메뉴 · 볼거리</span><input id="fMenu" value="${App.esc(r.menu)}" placeholder="예: 수제 갈비 · 둘레길 산책"></label>
        <label class="fld"><span>가격대</span><input id="fPrice" value="${App.esc(r.price)}" placeholder="예: 저렴"></label>
      </div>
      <div class="row2">
        <label class="fld"><span>${App.foodType(r)==='숙소'?'체크인·영업시간':App.foodType(r)==='명소'?'관람시간':'영업시간'}</span><input id="fHours" value="${App.esc(r.hours)}" placeholder="예: 11:00~21:00"></label>
        <label class="fld"><span>전화</span><input id="fPhone" type="tel" value="${App.esc(r.phone)}"></label>
      </div>
      <label class="fld"><span>홈페이지</span><input id="fWeb" value="${App.esc(r.website||'')}" placeholder="http://"></label>
      <label class="fld"><span>한 줄 평가</span><input id="fReview" value="${App.esc(typeof r.reviews==='number'?'':r.reviews)}" placeholder="예: 국물이 진하고 가격 착함"></label>
      <label class="fld"><span>별점 (맛·가격·분위기 종합)</span><div class="chips" id="fStars">${[1,2,3,4,5].map(n=>`<button class="chip ${r.rating>=n?'sel':''}" data-r="${n}">★ ${n}</button>`).join('')}<button class="chip ${!r.rating?'sel':''}" data-r="0">없음</button></div></label>
      <label class="fld"><span>사진 (명함·간판·음식)</span>
        <div class="fphotosel">
          <span class="fprev" id="fPrev" ${r.photo?`style="background-image:url('${r.photo}')"`:''}>${r.photo?'':App.ICON.food}</span>
          <span class="fpside">
            <button class="btn sm" id="fPick" type="button">사진 올리기</button>
            <button class="btn sm ghost" id="fClear" type="button">지우기</button>
            <span class="muted" style="display:block;margin-top:4px">1280px·JPEG로 자동 축소</span>
          </span>
        </div>
      </label>
      <label class="fld"><span>사진 종류</span><div class="chips" id="fType">
        <button class="chip ${r.photoType==='card'?'sel':''}" data-t="card">명함</button>
        <button class="chip ${r.photoType==='sign'?'sel':''}" data-t="sign">간판</button>
        <button class="chip ${!r.photoType?'sel':''}" data-t="">음식·기타</button>
      </div></label>
      <label class="fld"><span>메모</span><textarea id="fNote">${App.esc(r.note)}</textarea></label>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  let rating=r.rating||0, photo=r.photo||'', ptype=r.photoType||'', type=App.foodType(r);
  document.querySelectorAll('#fType2 [data-ty]').forEach(b=>b.onclick=()=>{
    type=b.dataset.ty;document.querySelectorAll('#fType2 [data-ty]').forEach(x=>x.classList.toggle('sel',x===b));
  });
  document.querySelectorAll('#fStars [data-r]').forEach(b=>b.onclick=()=>{
    rating=+b.dataset.r;
    document.querySelectorAll('#fStars [data-r]').forEach(x=>{
      const v=+x.dataset.r;
      x.classList.toggle('sel',rating>0?(v<=rating&&v>0):v===0);
    });
  });
  document.querySelectorAll('#fType [data-t]').forEach(b=>b.onclick=()=>{
    ptype=b.dataset.t;document.querySelectorAll('#fType [data-t]').forEach(x=>x.classList.toggle('sel',x===b));
  });
  const prev=document.getElementById('fPrev');
  document.getElementById('fPick').onclick=()=>{
    const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.onchange=()=>{const f=inp.files[0];if(!f)return;compressImage(f,data=>{
      photo=data;prev.style.backgroundImage=`url('${data}')`;prev.innerHTML='';
      if(!ptype){ptype='card';document.querySelectorAll('#fType [data-t]').forEach(x=>x.classList.toggle('sel',x.dataset.t==='card'))}
      App.toast('사진을 붙였습니다');
    })};
    inp.click();
  };
  document.getElementById('fClear').onclick=()=>{photo='';prev.style.backgroundImage='';prev.innerHTML=App.ICON.food};
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    const name=document.getElementById('fName').value.trim();
    if(!name){App.toast('상호명을 적어 주세요');return}
    const rec={type,name,region:document.getElementById('fRegion').value.trim(),address:document.getElementById('fAddr').value.trim(),
      menu:document.getElementById('fMenu').value.trim(),price:document.getElementById('fPrice').value.trim(),
      hours:document.getElementById('fHours').value.trim(),phone:document.getElementById('fPhone').value.trim(),
      website:document.getElementById('fWeb').value.trim(),
      reviews:document.getElementById('fReview').value.trim(),rating,note:document.getElementById('fNote').value.trim(),
      photo,photoType:photo?ptype:'',mapUrl:r.mapUrl||'',alias:r.alias||'',
      pick:r.pick,visited:r.visited};
    const dkey=(x)=>(x.name||'').trim()+'|'+(x.address||'').trim();
    const dup=D.restaurants.find(x=>x.id!==r.id&&dkey(x)===rec.name+'|'+rec.address);
    if(dup){
      dup.visits=dup.visits||[];
      const vd=document.getElementById('fDate').value;
      if(vd&&!dup.visits.some(v=>v.date===vd))dup.visits.push({id:App.uid('fv'),date:vd,memo:''});
      Object.assign(dup,{menu:rec.menu||dup.menu,rating:rec.rating||dup.rating,note:rec.note||dup.note,photo:rec.photo||dup.photo,photoType:rec.photoType||dup.photoType});
      App.save();App.closeSheet();renderFood();App.toast('이미 있는 곳이라 방문 기록으로 합쳤습니다');return;
    }
    if(r.id){Object.assign(r,rec)}
    else{
      const nv=Object.assign({id:App.uid('f')},rec,{visits:[]});
      const vd=document.getElementById('fDate').value;
      if(vd)nv.visits.push({id:App.uid('fv'),date:vd,memo:''});
      D.restaurants.push(nv);
    }
    App.save();App.closeSheet();renderFood();App.toast('저장했습니다');
  };
}

function compressImage(file,cb){
  const rd=new FileReader();
  rd.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const max=1280;
      let w=img.width,h=img.height;
      if(w>h&&w>max){h=Math.round(h*max/w);w=max}
      else if(h>=w&&h>max){w=Math.round(w*max/h);h=max}
      const c=document.createElement('canvas');c.width=w;c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      cb(c.toDataURL('image/jpeg',0.8));
    };
    img.src=rd.result;
  };
  rd.readAsDataURL(file);
}
