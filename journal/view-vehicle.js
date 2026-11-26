/* 차량 관리 */
App.CTYPES=[
  {id:'fuel',name:'주유',color:'#e8b04b'},
  {id:'repair',name:'정비·수리',color:'#82a9e6'},
  {id:'wash',name:'세차',color:'#6fd2d2'},
  {id:'park',name:'주차·톨게이트',color:'#b79cff'},
  {id:'tax',name:'보험·세금',color:'#f08ba8'},
  {id:'insp',name:'검사',color:'#57ce93'},
  {id:'etc',name:'기타',color:'#9aa8bd'}
];
App.CTYPE=id=>App.CTYPES.find(c=>c.id===id)||App.CTYPES[6];
App.car=function(){
  if(!App.D.vehicles||!App.D.vehicles.length){
    App.D.vehicles=[{id:'v1',name:'카니발',model:'기아 카니발 4세대 하이브리드',color:'검은색',roof:true,plate:'',year:'',mileage:'',insurance:'',inspection:'',tire:'',image:''}];
    App.save();
  }
  return App.D.vehicles[0];
};
App.carExp=D=>App.D.carExpenses.filter(e=>e.date.slice(0,7)===(D||App.todayKey().slice(0,7)));
App.nextDue=function(){
  const v=App.car(), t=App.dateObj(App.todayKey());
  const list=[['정기검사',v.inspection],['보험 만기',v.insurance],['타이어 교체',v.tire]]
    .filter(([n,d])=>d).map(([n,d])=>({n,d,dday:Math.round((App.dateObj(d)-t)/86400000)}))
    .filter(x=>x.dday>=0).sort((a,b)=>a.dday-b.dday);
  return list[0]||null;
};

function renderVehicle(){
  const D=App.D, v=App.car(), today=App.todayKey(), month=today.slice(0,7);
  const exps=D.carExpenses.filter(e=>(e.vehicleId||'v1')===v.id).sort((a,b)=>b.date.localeCompare(a.date)||(b.id||'').localeCompare(a.id||''));
  const mExps=exps.filter(e=>e.date.slice(0,7)===month);
  const mSum=mExps.reduce((a,e)=>a+(+e.amount||0),0);
  const week=['일','월','화','수','목','금','토'];
  const dues=[
    ['정기검사',v.inspection],['보험 만기',v.insurance],['타이어 교체',v.tire]
  ].map(([n,d])=>({n,d,dday:d?Math.round((App.dateObj(d)-App.dateObj(today))/86400000):null}))
   .sort((a,b)=>(a.dday==null?9e9:a.dday)-(b.dday==null?9e9:b.dday));
  const next=dues.find(d=>d.dday!=null&&d.dday>=0);

  const el=document.getElementById('sc-vehicle');
  el.innerHTML=`
  <div class="car-hero">
    <div class="car-img" style="background-image:url('${v.image||'assets/carnival.jpg'}')">
      <div class="car-shade"></div>
      <div class="car-top">
        <span class="car-badge">${App.ICON.check} MY VEHICLE</span>
        <span class="car-tools">
          <button class="car-btn" type="button" data-action="car-vimg" title="사진 교체">사진 교체</button>
          <button class="car-btn" type="button" data-action="car-vedit">정보 수정</button>
        </span>
      </div>
      <div class="car-info">
        <div class="car-name">${App.esc(v.name||'내 차량')}<span>${App.esc(v.color||'')}</span></div>
        <div class="car-model">${App.esc(v.model||'차종 미입력')}</div>
        <div class="car-chips">
          ${v.plate?`<span class="car-chip">${App.esc(v.plate)}</span>`:`<span class="car-chip dim">번호판 미입력</span>`}
          ${v.year?`<span class="car-chip">${App.esc(v.year)}년식</span>`:''}
          ${v.roof?`<span class="car-chip amber">루프 캐리어 장착</span>`:''}
          ${v.mileage?`<span class="car-chip">${App.money(v.mileage)} km</span>`:''}
        </div>
      </div>
    </div>
  </div>

  <div class="car-stats">
    <div class="cstat">
      <span class="cl">이번 달 차량 지출</span>
      <span class="cv">${App.money(mSum)}<small>원</small></span>
      <span class="cs">${mExps.length}건 · 전체 ${exps.length}건</span>
    </div>
    <div class="cstat">
      <span class="cl">${next?next.n+'까지':'다음 정비·검사'}</span>
      <span class="cv ${next&&next.dday<=30?'soon':''}">${next?(next.dday===0?'오늘':next.dday+'일 남음'):'미입력'}</span>
      <span class="cs">${next?(next.d?App.fmtDate(next.d):''):(v.inspection||v.insurance||v.tire?'만기일 확인':'만기일 입력')}</span>
    </div>
    <div class="cstat">
      <span class="cl">최근 주유</span>
      <span class="cv">${(exps.find(e=>e.type==='fuel')||{}).liters?App.money(exps.find(e=>e.type==='fuel').liters)+'<small>L</small>':'—'}</span>
      <span class="cs">${(exps.find(e=>e.type==='fuel')||{}).date?App.fmtDate(exps.find(e=>e.type==='fuel').date):'기록 없음'}</span>
    </div>
  </div>

  <div class="car-quick">
    <div class="cq-h">빠른 기록 <span>누르면 바로 입력창이 열립니다</span></div>
    <div class="cq-row">
      ${[['fuel','⛽','주유'],['repair','🛠','정비·수리'],['wash','🧼','세차'],['park','🅿','주차·통행료'],['tax','🛡','보험·세금'],['insp','🔍','검사'],['etc','⋯','기타']].map(([id,ic,nm])=>
        `<button class="cq" type="button" data-action="car-add" data-type="${id}" style="--c:${App.CTYPE(id).color}"><i>${ic}</i><b>${nm}</b><span>＋ 기록</span></button>`).join('')}
    </div>
  </div>

  <div class="car-grid">
    <div class="card">
      <div class="card-h"><span class="hic">${App.ICON.calendar}</span><h2>만기 · 정비 일정</h2><span class="hint">30일 이내는 빨간색</span></div>
      <div class="card-b">
        <div class="dues">
          ${dues.map(d=>`<div class="due">
            <span class="dn">${d.n}</span>
            <span class="dd">${d.d?App.fmtDate(d.d,true):'미입력'}</span>
            ${!d.d?'<span class="dbadge none">＋</span>':`<span class="dbadge ${d.dday<0?'over':d.dday<=30?'soon':'ok'}">${d.dday<0?'만료':(d.dday===0?'오늘':'D-'+d.dday)}</span>`}
          </div>`).join('')}
        </div>
        <button class="btn sm ghost mt12" style="width:100%" data-action="car-vedit">만기일 입력·수정</button>
      </div>
    </div>
    <div class="card">
      <div class="card-h"><span class="hic">${App.ICON.notes}</span><h2>최근 기록</h2><span class="hint">${exps.length}건</span></div>
      <div class="card-b">
        ${exps.length?`<div class="cexp-mini">${exps.slice(0,3).map(e=>{
          const t=App.CTYPE(e.type);
          return `<div class="cm">
            <span class="cmdot" style="background:${t.color}"></span>
            <span class="cmm"><b>${App.esc(e.place||t.name)}</b><i>${App.fmtDate(e.date)} · ${t.name}${e.liters?' · '+e.liters+'L':''}</i></span>
            <span class="cmv">${App.money(e.amount)}</span>
          </div>`}).join('')}</div>`
        :`<div class="hempty">아직 차량 기록이 없습니다.<span>주유·정비 내역을 추가해 보세요.</span></div>`}
        <button class="btn primary mt12" style="width:100%" data-action="car-add">${App.ICON.plus} 차량 기록 추가</button>
      </div>
    </div>
  </div>

  <div class="sec-title">지출 기록 <span class="count">${month.replace('-','년 ')}월 ${App.money(mSum)}원</span></div>
  <div class="chips scroll mb10">
    <button class="chip ${!D.ui.carFilter?'sel':''}" type="button" data-action="car-filter" data-cf="">전체 보기</button>
    ${App.CTYPES.map(t=>`<button class="chip ${D.ui.carFilter===t.id?'sel':''}" type="button" data-action="car-filter" data-cf="${t.id}" style="${D.ui.carFilter===t.id?'':'color:'+t.color}"><span class="pt"></span>${t.name}</button>`).join('')}
  </div>
  <div class="cexps">
    ${exps.filter(e=>!D.ui.carFilter||e.type===D.ui.carFilter).length?exps.filter(e=>!D.ui.carFilter||e.type===D.ui.carFilter).map(e=>{
      const t=App.CTYPE(e.type);
      return `<article class="cexp" type="button" data-action="car-open" data-ce="${e.id}" style="--c:${t.color}">
        <div class="cexp-l">
          <span class="ctype">${t.name}</span>
          <span class="cdate">${App.fmtDate(e.date)} ${week[App.dow(e.date)]}</span>
        </div>
        <div class="cexp-m">
          <b>${App.esc(e.place||'—')}</b>
          <span>${[e.liters?e.liters+'L':'',e.unit?App.money(e.unit)+'원/L':'',e.mileage?App.money(e.mileage)+'km':'',e.note].filter(Boolean).join(' · ')||''}</span>
        </div>
        <div class="cexp-r">${App.money(e.amount)}<small>원</small></div>
      </article>`}).join('')
    :App.empty('기록이 없습니다','주유·정비·세차·검사 내역을 추가하면 여기에 쌓입니다.')}
  </div>`;

  // 버튼 동작은 core.js의 문서 단위 위임 리스너가 처리한다(data-action)
}

/* 차량 사진 교체 */
function carPhoto(){
  const v=App.car();
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.onchange=()=>{
    const f=inp.files[0];if(!f)return;
    if(f.size>2.2*1024*1024){App.toast('2MB 이하 사진을 써 주세요');return}
    const r=new FileReader();r.onload=()=>{v.image=r.result;App.save();renderVehicle();App.toast('차량 사진을 바꿨습니다')};
    r.readAsDataURL(f);
  };
  inp.click();
}

function vehicleEdit(id){
  const D=App.D, v=D.vehicles.find(x=>x.id===id)||App.car();
  App.sheet({
    title:'차량 정보',
    body:`<div class="row2">
        <label class="fld"><span>이름 / 별칭</span><input id="cName" value="${App.esc(v.name)}" placeholder="예: 카니발"></label>
        <label class="fld"><span>색상</span><input id="cColor" value="${App.esc(v.color)}" placeholder="예: 검은색"></label>
      </div>
      <label class="fld"><span>차종</span><input id="cModel" value="${App.esc(v.model)}" placeholder="예: 기아 카니발 4세대 하이브리드"></label>
      <div class="row2">
        <label class="fld"><span>번호판</span><input id="cPlate" value="${App.esc(v.plate)}" placeholder="예: 12가 3456"></label>
        <label class="fld"><span>연식</span><input id="cYear" value="${App.esc(v.year)}" placeholder="예: 2021"></label>
      </div>
      <label class="fld"><span>현재 주행거리 (km)</span><input id="cMile" type="number" inputmode="numeric" value="${App.esc(v.mileage)}"></label>
      <div class="row2">
        <label class="fld"><span>보험 만기일</span><input id="cIns" type="date" value="${v.insurance||''}"></label>
        <label class="fld"><span>정기검사 만기일</span><input id="cInsp" type="date" value="${v.inspection||''}"></label>
      </div>
      <label class="fld"><span>타이어 교체 시점</span><input id="cTire" type="date" value="${v.tire||''}"></label>
      <label class="fld"><span>루프 캐리어</span><div class="chips"><button class="chip ${v.roof?'sel':''}" id="cRoof"><span class="pt"></span>장착</button></div></label>`,
    footer:`<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  let roof=!!v.roof;
  const rb=document.getElementById('cRoof');
  rb.onclick=()=>{roof=!roof;rb.classList.toggle('sel',roof)};
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    Object.assign(v,{name:document.getElementById('cName').value.trim()||'내 차량',
      color:document.getElementById('cColor').value.trim(),
      model:document.getElementById('cModel').value.trim(),
      plate:document.getElementById('cPlate').value.trim(),
      year:document.getElementById('cYear').value.trim(),
      mileage:document.getElementById('cMile').value.replace(/[^\d]/g,''),
      insurance:document.getElementById('cIns').value,
      inspection:document.getElementById('cInsp').value,
      tire:document.getElementById('cTire').value,roof});
    App.save();App.closeSheet();renderVehicle();App.toast('차량 정보를 저장했습니다');
  };
}

function carExpenseEdit(id,defType){
  const D=App.D, v=App.car();
  const e=id?D.carExpenses.find(x=>x.id===id):{id:'',vehicleId:v.id,date:App.todayKey(),type:defType||'fuel',amount:'',mileage:'',place:'',liters:'',unit:'',note:''};
  if(!e)return;
  App.sheet({
    title:id?'차량 기록 수정':'차량 기록 추가',
    body:`<label class="fld"><span>구분</span><div class="chips" id="tTypes">${App.CTYPES.map(t=>`<button class="chip ${e.type===t.id?'sel':''}" data-t="${t.id}" style="${e.type===t.id?'':'color:'+t.color}"><span class="pt"></span>${t.name}</button>`).join('')}</div></label>
      <div class="row2">
        <label class="fld"><span>날짜</span><input id="cvDate" type="date" value="${e.date}"></label>
        <label class="fld"><span>금액 (원)</span><input id="cvAmount" type="number" inputmode="numeric" value="${e.amount||''}" placeholder="0"></label>
      </div>
      <div id="fuelFields" style="display:${e.type==='fuel'?'block':'none'}">
        <div class="row2">
          <label class="fld"><span>주유량 (L)</span><input id="cvLiters" type="number" step="0.01" inputmode="decimal" value="${e.liters||''}"></label>
          <label class="fld"><span>단가 (원/L)</span><input id="cvUnit" type="number" inputmode="numeric" value="${e.unit||''}"></label>
        </div>
      </div>
      <div class="row2">
        <label class="fld"><span>주행거리 (km)</span><input id="cvMile" type="number" inputmode="numeric" value="${e.mileage||''}"></label>
        <label class="fld"><span>장소</span><input id="cvPlace" value="${App.esc(e.place)}" placeholder="예: SK주유소 구의점"></label>
      </div>
      <label class="fld"><span>메모</span><textarea id="cvNote" placeholder="정비 내용·교체 부품 등">${App.esc(e.note)}</textarea></label>`,
    footer:`${id?'<button class="btn danger" data-del>삭제</button>':''}<button class="btn" data-x>취소</button><button class="btn primary" data-save>저장</button>`
  });
  let type=e.type;
  const syncFuel=()=>{document.getElementById('fuelFields').style.display=type==='fuel'?'block':'none'};
  document.querySelectorAll('#tTypes [data-t]').forEach(b=>b.onclick=()=>{
    type=b.dataset.t;document.querySelectorAll('#tTypes [data-t]').forEach(x=>x.classList.toggle('sel',x===b));syncFuel();
  });
  const lEl=document.getElementById('cvLiters'), uEl=document.getElementById('cvUnit'), aEl=document.getElementById('cvAmount');
  const calc=()=>{const l=+lEl.value,u=+uEl.value;if(l&&u)aEl.value=Math.round(l*u)};
  lEl.oninput=calc;uEl.oninput=calc;
  document.querySelector('[data-x]').onclick=App.closeSheet;
  document.querySelector('[data-save]').onclick=()=>{
    const amount=+aEl.value||0;
    if(!amount&&!document.getElementById('cvLiters').value){App.toast('금액을 입력해 주세요');return}
    const rec={vehicleId:v.id,date:document.getElementById('cvDate').value||App.todayKey(),type,
      amount,mileage:document.getElementById('cvMile').value.replace(/[^\d]/g,''),
      place:document.getElementById('cvPlace').value.trim(),
      liters:document.getElementById('cvLiters').value,unit:document.getElementById('cvUnit').value,
      note:document.getElementById('cvNote').value.trim()};
    if(id)Object.assign(e,rec);else D.carExpenses.push(Object.assign({id:App.uid('c')},rec));
    if(rec.mileage&&(+rec.mileage>+v.mileage||!v.mileage))v.mileage=rec.mileage;
    App.save();App.closeSheet();renderVehicle();App.toast('저장했습니다');
  };
  const del=document.querySelector('[data-del]');
  if(del)del.onclick=async()=>{
    if(await App.ask('이 차량 기록을 지울까요?','삭제')){D.carExpenses=D.carExpenses.filter(x=>x.id!==id);App.save();App.closeSheet();renderVehicle()}
  };
}
