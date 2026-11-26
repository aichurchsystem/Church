/* 구글 캘린더 자동 연동 — Pickle이 주기적으로 갱신하는 calendar.json 을 읽어 반영 */
(function(){
const GCal={
  url:'calendar.json',
  state:{last:0,count:0,err:'',syncing:false,generated:''},

  async sync(manual){
    if(this.state.syncing)return;
    this.state.syncing=true;
    try{
      const r=await fetch(this.url+'?t='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const doc=await r.json();
      this.state.last=Date.now();
      this.state.count=(doc.events||[]).length;
      this.state.generated=doc.generated||'';
      this.state.range=doc.range||null;
      this.state.err='';
      const changed=this.merge(doc);
      if(changed)App.save();
      if(App.D.ui.tab==='calendar'||App.D.ui.tab==='home')App.render();
      if(manual)App.toast(changed?`구글 캘린더 ${this.state.count}건을 맞췄습니다`:'새로 바뀐 일정이 없습니다');
    }catch(e){
      this.state.err=String((e&&e.message)||e);
      if(App.D.ui.tab==='calendar')App.render();
      if(manual)App.toast('구글 캘린더를 불러오지 못했습니다. 잠시 후 다시 시도합니다');
    }finally{this.state.syncing=false}
  },

  /* 20분이 지났으면 앱을 다시 열 때 자동으로 한 번 더 맞춘다 */
  maybeSync(){
    if(!this.state.last||Date.now()-this.state.last>20*60*1000)this.sync();
  },

  merge(doc){
    const D=App.D, list=(doc&&doc.events)||[];
    const range=(doc&&doc.range)||{};
    let changed=false;
    const seen=new Set();

    list.forEach(r=>{
      if(!r||!r.summary||!r.start)return;
      let e=r.uid?D.events.find(x=>x.uid===r.uid):null;
      if(!e){
        // 같은 이름·같은 날짜의 옛 일정(초기 seed·수동 입력)은 그 기록을 살려 옮긴다
        const k=(r.summary||'').trim()+'|'+(r.start||'').slice(0,10);
        e=D.events.find(x=>x.src!=='gcal'&&((x.summary||'').trim()+'|'+App.evDate(x))===k);
      }
      if(e){
        const before=[e.summary,e.start,e.end,e.location,e.desc];
        Object.assign(e,{summary:r.summary,start:r.start,end:r.end||r.start,
          location:r.location||'',desc:r.desc||'',uid:r.uid||e.uid,src:'gcal',allDay:!!r.allDay});
        if(!e.id)e.id=App.uid('ev');
        if(before.join('\u0001')!==[e.summary,e.start,e.end,e.location,e.desc].join('\u0001'))changed=true;
        seen.add(e.id);
      }else{
        const ne={id:App.uid('ev'),uid:r.uid||('g-'+Math.random().toString(36).slice(2,8)),
          src:'gcal',start:r.start,end:r.end||r.start,summary:r.summary,
          location:r.location||'',desc:r.desc||'',status:'plan',note:'',
          lecture:false,org:'',audience:'',fee:'',allDay:!!r.allDay};
        D.events.push(ne);seen.add(ne.id);changed=true;
      }
    });

    // 구글에서 지워진 일정(받아온 기간 안)은 목록에서 뺀다
    const f=range.from,t=range.to;
    const gone=D.events.filter(e=>e.src==='gcal'&&!seen.has(e.id)
      &&(!f||App.evDate(e)>=f)&&(!t||App.evDate(e)<=t));
    if(gone.length){
      D.events=D.events.filter(e=>gone.indexOf(e)<0);
      App.D.events=D.events;
      changed=true;
    }
    return changed;
  }
};
window.GCal=GCal;
})();
