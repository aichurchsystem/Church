/* 운동 탭 — 따로 쓰던 운동일지 앱(work/Church/index.html)을 목회일지 안으로 옮긴 것 (2026-11-26 목사님 지시)
   · 저장 키(workoutlog.v1)를 그대로 써서 기존 운동 기록이 그대로 보인다.
   · 스타일은 workout.css 안에서 #wlog 아래로만 걸린다(목회일지 화면은 건드리지 않는다).
   · 화면 구성·동작(세트별 무게·횟수, 종목 추가, 기구 사진, 이번 주/연속 운동일, 통계)은 원래 앱 그대로. */
(function(){
var BUILT=false;
function bootOnce(){
  if(BUILT)return true;
  BUILT=true;
var WLOG_HTML="<div id=\"wlog\">\n<header>\n  <h1>운동일지 <span class=\"wtag\">이 기기에만 저장</span></h1>\n  <div class=\"sub\" id=\"today\"></div>\n</header>\n\n<div class=\"wrap\">\n  <div class=\"tabs\">\n    <button id=\"tabHome\" class=\"on\">홈</button>\n    <button id=\"tabWrite\">기록하기</button>\n    <button id=\"tabStat\">통계</button>\n  </div>\n\n  <!-- 홈 -->\n  <section id=\"viewHome\">\n    <div class=\"tcard\" id=\"todayCard\"></div>\n    <div class=\"wsum\">\n      <div class=\"w1\"><span>이번 주 볼륨</span><b id=\"hWeek\">0kg</b></div>\n      <div class=\"w2\"><span>이번 주 운동일</span><b id=\"hDays\">0일</b></div>\n      <div class=\"w3\"><span>연속 운동일</span><b id=\"hStreak\">0일</b></div>\n    </div>\n    <div class=\"card\" style=\"padding:13px 14px 11px\">\n      <div class=\"cardhead\" style=\"margin-bottom:9px\"><b>최근 기록</b><span>눌러서 수정</span></div>\n      <div class=\"tlist\" id=\"hRecent\" style=\"margin-bottom:0\"></div>\n    </div>\n    <div class=\"footnote\">기록은 이 폰에만 저장됩니다</div>\n  </section>\n\n  <!-- 기록 -->\n  <section id=\"viewWrite\">\n    <div class=\"card\">\n      <div class=\"chiplabel\">부위</div>\n      <div class=\"chips\" id=\"partChips\"></div>\n    </div>\n\n    <div class=\"card\" id=\"recoCard\">\n      <div class=\"cardhead\"><b>추천 종목</b><span>눌러서 담기</span></div>\n\n      <div class=\"sec hide\" id=\"favWrap\">\n        <div class=\"seclabel\">내 운동</div>\n        <div class=\"favgrid\" id=\"favBox\"></div>\n      </div>\n\n      <div class=\"sec hide\" id=\"mineWrap\">\n        <div class=\"seclabel\">내 기록에서</div>\n        <div class=\"minichips\" id=\"mineBox\"></div>\n      </div>\n\n      <div class=\"pband\" id=\"recoBand\"><b id=\"recoLabel\">가슴 추천</b><span id=\"recoCount\">10종목</span></div>\n      <div class=\"reco\" id=\"recoBox\"></div>\n      <div class=\"hint\" style=\"margin-top:11px\">종목을 누르면 아래 기록 칸에 채워집니다. 무게는 지난 기록 보시고 맞춰 올리세요.</div>\n    </div>\n\n    <div class=\"card\" id=\"formCard\">\n      <div class=\"wprog\" id=\"wProg\">\n        <div class=\"wprow\"><span>오늘 <b id=\"wProgPart\">가슴</b></span><span><em id=\"wProgNum\">0</em> / <span id=\"wProgGoal\">12</span><span id=\"wProgUnit\">세트</span></span></div>\n        <div class=\"wbar\"><i id=\"wProgBar\"></i></div>\n      </div>\n      <div class=\"cardhead\"><b id=\"formTitle\">기록 입력</b><span id=\"formPart\">가슴</span></div>\n      <div class=\"row hide\" id=\"dateRow\" style=\"margin-bottom:10px\">\n        <div><label>날짜</label><input id=\"date\" type=\"date\"></div>\n      </div>\n      <div style=\"margin-bottom:11px\">\n        <label>종목</label>\n        <input id=\"ex\" list=\"exList\" placeholder=\"벤치프레스\" autocomplete=\"off\">\n        <datalist id=\"exList\"></datalist>\n      </div>\n      <div style=\"margin-bottom:12px\">\n        <label>세트별 무게·횟수</label>\n        <div class=\"setlist\" id=\"setRows\"></div>\n        <button class=\"addset\" id=\"addSet\" type=\"button\"><b>+</b> 세트 추가</button>\n        <div class=\"volprev\">총 볼륨 <b id=\"volPrev\">0</b>kg <em>· <span id=\"volSets\">1세트</span></em></div>\n      </div>\n      <div style=\"margin-bottom:12px\">\n        <label>메모 (선택)</label>\n        <input id=\"m\" placeholder=\"컨디션, 자세 등\">\n      </div>\n      <div class=\"btnrow\">\n        <button class=\"btn\" id=\"save\">저장</button>\n        <button class=\"btn ghost hide\" id=\"cancelEdit\" type=\"button\">취소</button>\n      </div>\n      <div class=\"hint\" id=\"lastHint\"></div>\n    </div>\n\n    <div id=\"list\"></div>\n\n    <div class=\"footnote\">기록은 이 폰에만 저장됩니다 · <a class=\"link\" href=\"#\" id=\"exportBtn\">파일로 내보내기</a></div>\n  </section>\n\n  <!-- 통계 -->\n  <section id=\"viewStat\" class=\"hide\">\n    <div class=\"stat\">\n      <div><span>이번 주 볼륨</span><b id=\"sWeek\">0</b></div>\n      <div class=\"s2\"><span>이번 주 운동일</span><b id=\"sDays\">0</b></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"cardhead\"><b>부위별 볼륨</b><span>최근 30일</span></div>\n      <div id=\"partStat\"></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"cardhead\"><b>최근 6주</b><span>주간 볼륨</span></div>\n      <div id=\"weekStat\"></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"cardhead\"><b>종목별 최고 무게</b><span>상위 12개</span></div>\n      <div id=\"prStat\"></div>\n    </div>\n  </section>\n</div>\n\n<div class=\"wtoast\" id=\"wtoast\" aria-live=\"polite\"></div>\n</div>";

const KEY='workoutlog.v1';
const PARTS=['가슴','등','하체','어깨','팔','복부','유산소'];

/* ── 부위별 색: c=기본, cd=진한색(흰 글씨용), cl=연한 배경 ── */
const PART_COLOR={
  '가슴':{c:'#f0564a',cd:'#c9342a',cl:'#ffedea'},
  '등'  :{c:'#0fb39c',cd:'#067a6b',cl:'#e3f8f3'},
  '하체':{c:'#7b5cf5',cd:'#573bd6',cl:'#eeebff'},
  '어깨':{c:'#f59b2e',cd:'#9c5705',cl:'#fff3e0'},
  '팔'  :{c:'#3b82f6',cd:'#1c5ccc',cl:'#e8f1ff'},
  '복부':{c:'#2fb45e',cd:'#17793f',cl:'#e7f8ed'},
  '유산소':{c:'#1fa9e0',cd:'#0a7099',cl:'#e4f6fd'}
};
const PC=p=>PART_COLOR[p]||PART_COLOR['가슴'];
function paintColor(el,p){
  const k=PC(p);
  el.style.setProperty('--c',k.c);
  el.style.setProperty('--cd',k.cd);
  el.style.setProperty('--cl',k.cl);
}

/* ── 기구 사전: 이름, 모양 설명, 그림(선 도해) ── */
const EQUIP={
  barbell:{n:'바벨',d:'양쪽에 원판을 끼우는 긴 쇠막대. 봉만 보통 20kg.',
    s:'<path d="M7 24h34"/><rect x="9" y="15" width="5" height="18" rx="1.6"/><rect x="34" y="15" width="5" height="18" rx="1.6"/>'},
  dumbbell:{n:'덤벨',d:'한 손에 하나씩 드는 짧은 막대. 양 끝에 무게 뭉치.',
    s:'<path d="M19 24h10"/><rect x="10" y="16" width="6" height="16" rx="2"/><rect x="32" y="16" width="6" height="16" rx="2"/>'},
  bench:{n:'플랫 벤치',d:'바닥에 누워 쓰는 평평한 의자. 등받이 각도 없음.',
    s:'<path d="M8 25h32"/><path d="M15 25v9"/><path d="M33 25v9"/><path d="M10 34h10"/><path d="M28 34h10"/>'},
  incline:{n:'인클라인 벤치',d:'등받이가 30~45도로 올라간 벤치. 윗가슴 운동에 씀.',
    s:'<path d="M11 34l9-17"/><path d="M24 31h14"/><path d="M18 31v7"/><path d="M33 31v7"/>'},
  rack:{n:'스쿼트 랙',d:'바벨을 걸어 두는 두 기둥 틀. 서서 스쿼트할 때 씀.',
    s:'<path d="M14 41V7"/><path d="M34 41V7"/><path d="M14 17h20"/><path d="M17 17v5"/><path d="M31 17v5"/>'},
  cable:{n:'케이블 머신',d:'도르래에 줄이 달린 기둥 기구. 손잡이를 당겨 씀.',
    s:'<rect x="9" y="8" width="9" height="32" rx="2"/><circle cx="20" cy="14" r="2.4"/><path d="M22.4 14H32"/><path d="M32 14v12"/><path d="M28 26h8"/>'},
  latpull:{n:'랫풀다운',d:'머리 위 긴 바를 아래로 당기는 기구. 앉아서 함.',
    s:'<path d="M12 41V8h24"/><path d="M16 13h16"/><path d="M16 13v4"/><path d="M32 13v4"/><path d="M19 32h10"/>'},
  row:{n:'시티드 로우',d:'앉아서 가슴 쪽으로 손잡이를 당기는 기구.',
    s:'<rect x="7" y="28" width="13" height="7" rx="2"/><path d="M20 31.5h7"/><circle cx="30" cy="31.5" r="2.6"/><path d="M30 29V18"/><path d="M23 18h14"/>'},
  legpress:{n:'레그프레스',d:'앉아서 두 발로 판을 앞으로 미는 기구. 하체 전체.',
    s:'<path d="M8 41V28a2 2 0 012-2h8v7"/><path d="M18 25h9"/><path d="M35 11l-6 26"/><path d="M40 13l-6 26"/>'},
  legcurl:{n:'레그컬',d:'앉거나 엎드려 다리 뒤꿈치를 말아 올리는 기구.',
    s:'<path d="M6 22h19"/><path d="M10 22v10"/><path d="M19 22v10"/><path d="M25 22h9"/><circle cx="34" cy="28" r="5"/>'},
  dip:{n:'평행봉',d:'두 개의 평행한 봉. 팔로 몸을 지지하고 내려갔다 올라옴.',
    s:'<path d="M12 41V15"/><path d="M12 15h8"/><path d="M28 15h8"/><path d="M36 41V15"/>'},
  pullup:{n:'풀업 바',d:'머리 위 가로 막대. 매달려 몸을 끌어올림.',
    s:'<path d="M6 15h36"/><path d="M11 7v8"/><path d="M37 7v8"/><path d="M18 15v6"/><path d="M30 15v6"/>'},
  machine:{n:'웨이트 머신',d:'무게추가 쌓인 기구. 핀을 꽂아 무게를 정함.',
    s:'<rect x="9" y="7" width="10" height="34" rx="2"/><path d="M11 14h6"/><path d="M11 20h6"/><path d="M11 26h6"/><path d="M22 33h13"/><path d="M28 33v5"/>'},
  treadmill:{n:'트레드밀',d:'돌아가는 벨트 위를 걷거나 뛰는 기구. 속도 조절 가능.',
    s:'<path d="M7 36h22l8-6"/><path d="M30 30h9"/><path d="M35 30V16"/><path d="M30 16h10"/><path d="M11 36v5"/><path d="M26 36v5"/>'},
  bike:{n:'실내 사이클',d:'앉아서 페달을 밟는 자전거. 무릎 부담이 적음.',
    s:'<circle cx="15" cy="33" r="6.5"/><circle cx="35" cy="33" r="6.5"/><path d="M15 33l7-13h8l5 13"/><path d="M22 20h7"/><path d="M30 20l-4-6"/>'},
  rower:{n:'로잉머신',d:'노젓듯 앉아서 손잡이를 당기는 기구. 전신 운동.',
    s:'<path d="M6 38h36"/><rect x="14" y="31" width="11" height="5" rx="2"/><path d="M9 34v-9"/><path d="M9 25h7"/><path d="M27 21l9 5"/>'},
  bodyweight:{n:'맨몸',d:'기구 없이 체중으로 하는 운동. 푸시업·스쿼트 등.',
    s:'<circle cx="24" cy="11" r="4"/><path d="M24 15v12"/><path d="M24 20l-7 4"/><path d="M24 20l7 4"/><path d="M24 27l-6 11"/><path d="M24 27l6 11"/>'}
};

const RECO={
  가슴:[
    ['벤치프레스','bench','바벨 + 플랫 벤치','3세트 8~12회'],
    ['인클라인 벤치프레스','barbell','바벨 + 인클라인 벤치','3세트 8~10회'],
    ['인클라인 덤벨프레스','incline','덤벨 + 인클라인 벤치','3세트 10회'],
    ['덤벨 벤치프레스','dumbbell','덤벨 + 플랫 벤치','3세트 10~12회'],
    ['덤벨 플라이','dumbbell','덤벨 + 플랫 벤치','3세트 12회'],
    ['펙덱 플라이','machine','펙덱 머신','3세트 12~15회'],
    ['케이블 크로스오버','cable','케이블 머신','3세트 12~15회'],
    ['딥스','dip','평행봉','3세트 8~10회'],
    ['푸시업','bodyweight','맨몸','3세트 15회'],
    ['인클라인 푸시업','bodyweight','맨몸(손을 높은 곳에)','3세트 12회']
  ],
  등:[
    ['랫풀다운','latpull','랫풀다운 머신','3세트 10~12회'],
    ['바벨 로우','barbell','바벨','3세트 8~12회'],
    ['시티드 로우','row','시티드 로우 머신','3세트 12회'],
    ['풀업','pullup','풀업 바','3세트 6~10회'],
    ['원암 덤벨로우','dumbbell','덤벨 + 플랫 벤치','3세트 12회'],
    ['스트레이트 암 풀다운','cable','케이블 머신','3세트 15회'],
    ['덤벨 풀오버','dumbbell','덤벨 + 플랫 벤치','3세트 12회'],
    ['인버티드 로우','bodyweight','맨몸(가로 막대)','3세트 10~12회'],
    ['백 익스텐션','machine','백 익스텐션 머신','3세트 15회'],
    ['슈퍼맨','bodyweight','맨몸','3세트 15회']
  ],
  하체:[
    ['스쿼트','rack','스쿼트 랙 + 바벨','3세트 8~12회'],
    ['레그프레스','legpress','레그프레스 머신','3세트 12회'],
    ['런지','dumbbell','덤벨(없어도 됨)','3세트 10회'],
    ['레그컬','legcurl','레그컬 머신','3세트 12~15회'],
    ['레그 익스텐션','machine','레그 익스텐션 머신','3세트 12~15회'],
    ['카프레이즈','machine','웨이트 머신(또는 맨몸)','3세트 15~20회'],
    ['루마니안 데드리프트','barbell','바벨','3세트 8~10회'],
    ['고블릿 스쿼트','dumbbell','덤벨','3세트 12회'],
    ['스텝업','bench','플랫 벤치(또는 계단)','3세트 10회'],
    ['힙 브리지','bodyweight','맨몸','3세트 15회']
  ],
  어깨:[
    ['숄더프레스','dumbbell','덤벨 + 인클라인 벤치','3세트 8~12회'],
    ['숄더프레스 머신','machine','숄더프레스 머신','3세트 10~12회'],
    ['아놀드 프레스','dumbbell','덤벨','3세트 10회'],
    ['사이드 레터럴 레이즈','dumbbell','덤벨','3세트 12~15회'],
    ['케이블 레터럴 레이즈','cable','케이블 머신','3세트 15회'],
    ['프론트 레이즈','dumbbell','덤벨','3세트 12회'],
    ['리어 델트 플라이','machine','펙덱 머신(뒤로)','3세트 15회'],
    ['페이스풀','cable','케이블 머신','3세트 15회'],
    ['업라이트 로우','barbell','바벨(또는 케이블)','3세트 12회'],
    ['파이크 푸시업','bodyweight','맨몸','3세트 10회']
  ],
  팔:[
    ['바벨 컬','barbell','바벨','3세트 10~12회'],
    ['덤벨 컬','dumbbell','덤벨','3세트 12회'],
    ['해머 컬','dumbbell','덤벨','3세트 12회'],
    ['프리처 컬','machine','프리처 컬 머신','3세트 10~12회'],
    ['케이블 컬','cable','케이블 머신','3세트 12~15회'],
    ['리스트 컬','dumbbell','덤벨','3세트 15회'],
    ['트라이셉스 푸시다운','cable','케이블 머신','3세트 12~15회'],
    ['오버헤드 익스텐션','dumbbell','덤벨','3세트 12회'],
    ['클로즈 그립 벤치프레스','bench','바벨 + 플랫 벤치','3세트 8~10회'],
    ['벤치 딥스','dip','플랫 벤치','3세트 12회']
  ],
  복부:[
    ['플랭크','bodyweight','맨몸','3세트 40초'],
    ['사이드 플랭크','bodyweight','맨몸','3세트 좌우 30초'],
    ['크런치','bodyweight','맨몸','3세트 20회'],
    ['바이시클 크런치','bodyweight','맨몸','3세트 20회'],
    ['레그레이즈','bodyweight','맨몸','3세트 12회'],
    ['행잉 레그레이즈','pullup','풀업 바','3세트 10회'],
    ['러시안 트위스트','bodyweight','맨몸','3세트 20회'],
    ['데드버그','bodyweight','맨몸','3세트 10회'],
    ['마운틴 클라이머','bodyweight','맨몸','3세트 30초'],
    ['케이블 크런치','cable','케이블 머신','3세트 15회']
  ],
  유산소:[
    ['빠르게 걷기','treadmill','트레드밀','20~30분'],
    ['조깅','treadmill','트레드밀','20분'],
    ['인터벌 러닝','treadmill','트레드밀','15분(1분 달리기·2분 걷기)'],
    ['경사 걷기','treadmill','트레드밀(경사 5~8%)','20분'],
    ['실내 사이클','bike','실내 사이클','20분 중간 강도'],
    ['사이클 인터벌','bike','실내 사이클','15분(1분 빠르게·1분 천천히)'],
    ['로잉머신','rower','로잉머신','15분'],
    ['로잉 인터벌','rower','로잉머신','10분(250m씩 6번)'],
    ['줄넘기','bodyweight','맨몸(줄넘기)','10분'],
    ['계단 오르기','bodyweight','맨몸(계단)','15분']
  ]
};

let data=JSON.parse(localStorage.getItem(KEY)||'[]');
let part='가슴';

const $=id=>{const r=document.getElementById('wlog');return (r&&r.querySelector('[id="'+id+'"]'))||document.getElementById(''+id)};
const won=n=>Math.round(n).toLocaleString('ko-KR');
const todayStr=()=>{const d=new Date();const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());};
const wd=['일','월','화','수','목','금','토'];
const icon=(k,cls)=>'<svg class="ico'+(cls?' '+cls:'')+'" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+((EQUIP[k]||{}).s||'')+'</svg>';

/* 기구 사진(240x240 실제 사진) 경로 */
for(const k in EQUIP){EQUIP[k].img='assets/workout/'+k+'.png';}

/* 내 운동 — 사용자가 직접 지정한 종목: [종목명, 기구key, 세트·횟수, (선택)기구 표기] */
const MY_FAV=[
  ['딥스','dip','3세트 8~10회'],
  ['랫풀다운','latpull','3세트 10~12회'],
  ['풀업','pullup','3세트 6~10회'],
  ['바벨 오버헤드 프레스','barbell','3세트 8~10회'],
  ['숄더프레스 머신','machine','3세트 10~12회'],
  ['시티드 로우','row','3세트 10~12회'],
  ['벤치프레스','bench','3세트 8~12회','바벨 + 플랫 벤치']
];

/* 종목명 → 기구key / 부위 (색상용) */
const EX_EQ={},EX_PART={};
Object.keys(RECO).forEach(p=>RECO[p].forEach(([n,eq])=>{EX_EQ[n]=eq;EX_PART[n]=p;}));
/* 내 운동 중 추천 목록에 없는 종목의 부위 */
EX_PART['바벨 오버헤드 프레스']='어깨';
EX_PART['숄더프레스 머신']='어깨';
function eqOf(name){
  if(EX_EQ[name])return EX_EQ[name];
  for(const k in EQUIP){if(name.indexOf(EQUIP[k].n)>=0)return k;}
  return null;
}
function partOf(name,fallback){
  if(EX_PART[name])return EX_PART[name];
  const eq=eqOf(name);
  for(const p in RECO){if(RECO[p].some(r=>r[1]===eq&&r[0]===name))return p;}
  return fallback||part;
}

function save(){localStorage.setItem(KEY,JSON.stringify(data));}

/* ── 기록 형식 호환 ──
   새 형식: {setList:[{kg,reps},...]}
   옛 형식: {w? kg, reps, sets} → 같은 무게·횟수를 sets개 행으로 펼칩니다. */
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function recSetList(r){
  if(Array.isArray(r.setList)&&r.setList.length){
    return r.setList.map(s=>({kg:+s.kg||0,reps:+s.reps||0}));
  }
  /* 옛 형식: {w,r,s} (원래 저장 형식) 또는 {kg,reps,sets} */
  const nRaw=(r.s!=null?r.s:(r.sets!=null?r.sets:1));
  const n=Math.max(1,+nRaw||1);
  const kg=+(r.kg!=null?r.kg:(r.w!=null?r.w:0))||0;
  const reps=+(r.reps!=null?r.reps:(r.r!=null?r.r:0))||0;
  const out=[];
  for(let i=0;i<n;i++)out.push({kg:kg,reps:reps});
  return out;
}
const recSets=r=>recSetList(r).length;
const recVolOf=list=>list.reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0);
const recVol=r=>recVolOf(recSetList(r));
const recKg=r=>Math.max.apply(null,[0].concat(recSetList(r).map(s=>s.kg)));
function setDetail(r){
  return recSetList(r).map((s,i)=>(i+1)+'세트 '+s.kg+'kg×'+s.reps).join(' · ');
}
function setShort(r){
  const l=recSetList(r);
  if(l.length>1&&l.every(s=>s.kg===l[0].kg&&s.reps===l[0].reps))
    return l[0].kg+'kg × '+l[0].reps+'회 × '+l.length+'세트';
  return l.map(s=>s.kg+'kg×'+s.reps).join(' · ');
}

/* ── 입력 폼: 세트 행 ── */
let editingId=null;
let formSets=[{kg:'',reps:''}];
function setFormSets(list){
  formSets=list.map(s=>({kg:(s.kg==null?'':String(s.kg)),reps:(s.reps==null?'':String(s.reps))}));
  if(!formSets.length)formSets=[{kg:'',reps:''}];
  renderSets();updateVolPrev();
}
function readSetInputs(){
  const rows=$('setRows');
  if(!rows)return;
  [...rows.children].forEach((row,i)=>{
    if(!formSets[i])return;
    formSets[i].kg=row.querySelector('.kg').value;
    formSets[i].reps=row.querySelector('.reps').value;
  });
}
function renderSets(focusIdx){
  const box=$('setRows');
  if(!box)return;
  box.innerHTML=formSets.map((s,i)=>
    '<div class="setrow"><span class="sn">'+(i+1)+'세트</span>'
    +'<input class="kg" type="number" inputmode="decimal" step="0.5" min="0" placeholder="40" value="'+esc(s.kg)+'">'
    +'<span class="u">kg</span>'
    +'<input class="reps" type="number" inputmode="numeric" step="1" min="0" placeholder="10" value="'+esc(s.reps)+'">'
    +'<span class="u">회</span>'
    +'<button class="rm'+(formSets.length<2?' off':'')+'" type="button" data-i="'+i+'" aria-label="'+(i+1)+'세트 삭제">×</button></div>').join('');
  box.querySelectorAll('.kg,.reps').forEach(inp=>inp.addEventListener('input',()=>{readSetInputs();updateVolPrev();}));
  box.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{
    readSetInputs();
    formSets.splice(+b.dataset.i,1);
    if(!formSets.length)formSets=[{kg:'',reps:''}];
    renderSets();updateVolPrev();
  });
  if(focusIdx!=null){
    const r=box.children[focusIdx];
    if(r){const inp=r.querySelector('.kg');if(inp){inp.focus();if(inp.select)inp.select();}}
  }
}
function updateVolPrev(){
  let v=0;
  formSets.forEach(s=>{
    const kg=parseFloat(s.kg),r=parseInt(s.reps);
    if(s.kg!==''&&s.reps!==''&&isFinite(kg)&&isFinite(r)&&kg>=0&&r>0)v+=kg*r;
  });
  if($('volPrev'))$('volPrev').textContent=won(v);
  if($('volSets'))$('volSets').textContent=formSets.length+'세트';
}
function collectSets(){
  readSetInputs();
  const out=[];
  for(let i=0;i<formSets.length;i++){
    const ks=formSets[i].kg,rs=formSets[i].reps;
    if(ks===''&&rs==='')continue;                 /* 남은 빈 행은 무시 */
    const kg=parseFloat(ks),r=parseInt(rs);
    if(!isFinite(kg)||kg<0||!isFinite(r)||r<=0)return null;
    out.push({kg:kg,reps:Math.round(r)});
  }
  return out.length?out:null;
}
function applySets(rec,list){
  rec.setList=list.map(s=>({kg:s.kg,reps:s.reps}));
  rec.s=rec.sets=rec.setList.length;
  rec.vol=recVolOf(rec.setList);
  rec.kg=Math.max.apply(null,rec.setList.map(s=>s.kg));
  rec.reps=rec.setList[0].reps;
  return rec;
}
const addSetRow=()=>{
  readSetInputs();
  const last=formSets[formSets.length-1]||{kg:'',reps:''};
  formSets.push({kg:last.kg,reps:last.reps});
  renderSets(formSets.length-1);updateVolPrev();
};
function resetForm(){
  $('ex').value='';$('m').value='';$('date').value=todayStr();
  $('lastHint').innerHTML='';
  setFormSets([{kg:'',reps:''}]);
}
function updateFormMode(){
  const card=$('formCard');
  if(!card)return;
  card.classList.toggle('editing',!!editingId);
  $('formTitle').textContent=editingId?'기록 수정 중':'기록 입력';
  $('save').textContent=editingId?'수정 저장':'저장';
  $('cancelEdit').classList.toggle('hide',!editingId);
  $('dateRow').classList.toggle('hide',!editingId);
  if(!editingId)$('date').value=todayStr();
}
function setLastHint(name,eqLine){
  const l=name?lastOf(name):null;
  const box=$('lastHint');
  if(!box)return;
  if(!l){box.innerHTML=eqLine||'';return;}
  box.innerHTML=(eqLine||'')+'지난 기록: '+setShort(l)+' <span style="color:var(--faint)">('+l.date+')</span> '
    +'<button type="button" class="lastload" id="useLast">불러오기</button>';
  const b=$('useLast');
  if(b)b.onclick=()=>{setFormSets(recSetList(l));updateVolPrev();};
}
function startEdit(id){
  const r=data.find(x=>x.id===id);
  if(!r)return;
  editingId=id;
  part=r.part;
  $('ex').value=r.ex;
  $('m').value=r.m||'';
  $('date').value=r.date;
  setFormSets(recSetList(r));
  $('lastHint').innerHTML='';
  updateFormMode();
  markChips();renderReco();
  showTab('write');
  const card=$('formCard');
  if(card){
    card.classList.remove('flash');void card.offsetWidth;card.classList.add('flash');
    const y=card.getBoundingClientRect().top+window.scrollY-8;
    window.scrollTo({top:y,behavior:reduced()?'auto':'smooth'});
  }
  $('ex').focus({preventScroll:true});
}
function cancelEdit(){
  editingId=null;
  resetForm();
  updateFormMode();
}

function initToday(){
  const d=new Date();
  $('today').textContent=d.getMonth()+1+'월 '+d.getDate()+'일 '+wd[d.getDay()]+'요일';
}
function markChips(){
  [...$('partChips').children].forEach(c=>c.classList.toggle('on',c.dataset.p===part));
  paintColor($('recoCard'),part);
  paintColor($('formCard'),part);
  $('recoLabel').textContent=part+' 추천';
  $('recoLabel').parentElement.style.setProperty('--c',PC(part).c);
  $('formPart').textContent=part;
  $('formPart').style.color=PC(part).cd;
}
function initChips(){
  const box=$('partChips');
  PARTS.forEach(p=>{
    const b=document.createElement('button');
    b.className='chip'+(p===part?' on':'');
    b.dataset.p=p;
    paintColor(b,p);
    b.innerHTML='<i></i>'+p;
    b.onclick=()=>{part=p;markChips();renderReco();};
    box.appendChild(b);
  });
}
function renderReco(){
  markChips();
  renderWriteProg();

  /* 내 운동 — 부위와 상관없이 항상 */
  $('favWrap').classList.toggle('hide',!MY_FAV.length);
  const favBox=$('favBox');favBox.innerHTML='';
  MY_FAV.forEach(([name,eq,sets,label])=>favBox.appendChild(favRow(name,eq,sets,label)));

  /* 내 기록에서 — 많이 한 순서 상위 5개 */
  const mine=myTop(5);
  $('mineWrap').classList.toggle('hide',!mine.length);
  $('mineBox').innerHTML=mine.map(([name,eq])=>'<button class="mrow" data-ex="'+name.replace(/"/g,'')+'" style="--c:'+PC(partOf(name)).c+'">'
    +(eq?'<img src="'+EQUIP[eq].img+'" alt="">':'')+'<span>'+name+'</span></button>').join('');
  $('mineBox').querySelectorAll('.mrow').forEach(b=>b.onclick=()=>{
    const n=b.dataset.ex;fillExercise(n,eqOf(n));
  });

  /* 부위별 추천 */
  const box=$('recoBox');
  box.innerHTML='';
  const list=RECO[part]||[];
  $('recoCount').textContent=list.length+'종목';
  if(!list.length){box.innerHTML='<div class="hint">이 부위 추천은 준비 중이에요.</div>';return;}
  list.forEach(([name,eq,desc,sets])=>box.appendChild(recoRow(name,eq,sets,desc)));
}
function recoRow(name,eq,sets,label){
  const e=EQUIP[eq]||{};
  const b=document.createElement('button');
  b.innerHTML=(e.img?'<img class="thumb" src="'+e.img+'" alt="">':icon(eq))
    +'<div class="txt"><b>'+name+'</b><small>'+(label||e.n||'')+' · '+sets+'</small></div>'
    +'<span class="plus">+</span>';
  b.onclick=()=>fillExercise(name,eq);
  return b;
}
function favRow(name,eq,sets,label){
  const e=EQUIP[eq]||{};
  const b=document.createElement('button');
  b.className='fav';
  b.style.setProperty('--c',PC(partOf(name)).c);
  b.innerHTML=(e.img?'<img src="'+e.img+'" alt="">':icon(eq))
    +'<div class="t"><b>'+name+'</b><small>'+sets+'</small></div>';
  b.onclick=()=>fillExercise(name,eq);
  return b;
}
function myTop(n){
  const agg={};
  data.forEach(x=>{const a=agg[x.ex]||(agg[x.ex]={c:0,last:''});a.c++;if(x.date>a.last)a.last=x.date;});
  return Object.keys(agg).sort((a,b)=>agg[b].c-agg[a].c||(agg[a].last<agg[b].last?1:-1))
    .slice(0,n).map(name=>[name,eqOf(name)]);
}
function fillExercise(name,eq){
  $('ex').value=name;
  if(EX_PART[name]){part=EX_PART[name];markChips();}
  const eqLine=eq&&EQUIP[eq]?('기구: '+EQUIP[eq].n+' — '+EQUIP[eq].d+' '):'';
  const l=lastOf(name);
  setLastHint(name,eqLine+(l?'':'처음이면 12회 가능한 무게부터.'));
  const card=$('formCard');
  if(card){
    card.classList.remove('flash');
    void card.offsetWidth;
    card.classList.add('flash');
    card.scrollIntoView({behavior:'smooth',block:'center'});
  }
  const first=$('setRows')&&$('setRows').querySelector('.kg');
  if(first&&!editingId)first.focus({preventScroll:true});
}
function refreshExList(){
  const names=[...new Set(data.map(x=>x.ex))];
  $('exList').innerHTML=names.map(n=>'<option value="'+n.replace(/"/g,'')+'">').join('');
}
function lastOf(name){
  const rows=data.filter(x=>x.ex===name).sort((a,b)=>(a.date<b.date?1:-1));
  return rows[0];
}
function addItem(){
  if(editingId){saveEdit();return;}
  const ex=$('ex').value.trim();
  if(!ex){alert('종목을 적어 주세요.');$('ex').focus();return;}
  const list=collectSets();
  if(!list){alert('세트마다 무게와 횟수를 숫자로 적어 주세요. 횟수는 1 이상.');return;}
  const id=Date.now()+''+Math.floor(Math.random()*99);
  const rec=applySets({id:id,date:todayStr(),part:part,ex:ex,m:$('m').value.trim()},list);
  data.push(rec);
  save();refreshExList();render();renderReco();clearHomeOverride();
  const pr=renderWriteProg();
  renderHome();
  const sb=$('save');
  if(sb){sb.classList.remove('onsave');void sb.offsetWidth;if(!reduced())sb.classList.add('onsave');}
  const row=document.querySelector('#list .item[data-id="'+id+'"]');
  if(row&&!reduced()){row.classList.add('newrow');setTimeout(()=>row.classList.remove('newrow'),900);}
  showToast('<b>'+esc(ex)+'</b> 저장 · '+won(rec.vol)+'kg<small>'+setDetail(rec)+' · 오늘 '+part+' '+(pr?pr.done+' / '+pr.goal+'세트':'')+'</small>');
  const keep=ex;
  resetForm();
  $('ex').value='';
  const l=lastOf(keep);
  setLastHint('',l?('「'+esc(keep)+'」 지난 기록: '+setShort(l)+' ('+l.date+')'):'');
  $('ex').focus();
}
function saveEdit(){
  const r=data.find(x=>x.id===editingId);
  if(!r){editingId=null;updateFormMode();return;}
  const ex=$('ex').value.trim();
  if(!ex){alert('종목을 적어 주세요.');$('ex').focus();return;}
  const list=collectSets();
  if(!list){alert('세트마다 무게와 횟수를 숫자로 적어 주세요. 횟수는 1 이상.');return;}
  r.ex=ex;r.part=part;r.m=$('m').value.trim();
  const d=$('date').value;
  if(d)r.date=d;
  applySets(r,list);
  const id=r.id,msg='<b>수정 저장 완료</b><small>'+esc(ex)+' · '+won(r.vol)+'kg · '+setDetail(r)+'</small>';
  save();refreshExList();render();renderReco();renderHome();
  editingId=null;
  resetForm();
  updateFormMode();
  renderWriteProg();
  showToast(msg);
  const row=document.querySelector('#list .item[data-id="'+id+'"]');
  if(row){row.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});
    if(!reduced()){row.classList.add('newrow');setTimeout(()=>row.classList.remove('newrow'),900);}}
}
function render(){
  const box=$('list');
  if(!data.length){box.innerHTML='<div class="empty">아직 기록이 없어요.<br>오늘 운동한 종목부터 하나씩 쌓아 보세요.</div>';return;}
  const byDate={};
  data.forEach(x=>{(byDate[x.date]=byDate[x.date]||[]).push(x);});
  const dates=Object.keys(byDate).sort().reverse();
  let html='';
  dates.forEach(d=>{
    const rows=byDate[d];
    const vol=rows.reduce((a,x)=>a+recVol(x),0);
    const dd=new Date(d+'T00:00:00');
    html+='<div class="day"><span>'+d+' '+wd[dd.getDay()]+'</span><span>'+won(vol)+'kg</span></div><div class="card" style="padding:2px 14px">';
    rows.forEach(x=>{
      const k=PC(x.part);
      html+='<div class="item" data-id="'+x.id+'"><div class="name"><b>'+esc(x.ex)+'</b><small><span class="ptag" style="--cl:'+k.cl+';--cd:'+k.cd+'">'+x.part+'</span>'
        +setDetail(x)+(x.m?' · '+esc(x.m):'')+'</small></div>'
        +'<div class="rt"><div class="vol">'+won(recVol(x))+'</div>'
        +'<div class="acts"><button class="btn-edit" data-id="'+x.id+'">수정</button><button class="del" data-id="'+x.id+'" aria-label="삭제">×</button></div></div></div>';
    });
    html+='</div>';
  });
  box.innerHTML=html;
  box.querySelectorAll('.del').forEach(b=>b.onclick=()=>{
    if(!confirm('이 기록을 지울까요?'))return;
    if(editingId===b.dataset.id){editingId=null;resetForm();updateFormMode();}
    data=data.filter(x=>x.id!==b.dataset.id);save();render();renderReco();renderHome();
  });
  box.querySelectorAll('.btn-edit').forEach(b=>b.onclick=()=>startEdit(b.dataset.id));
}
/* ══════════ 홈 =═════════ */
/* 요일별 부위 로테이션: getDay() 0=일 … 6=토. 이 배열만 고치면 로테이션이 바뀝니다. */
const ROTATION=[null,'가슴','등','하체','어깨','팔','복부'];
const HPKEY='workoutlog.homepart';
const RM=(window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null);
const reduced=()=>!!(RM&&RM.matches);

function todayRows(){const t=todayStr();return data.filter(x=>x.date===t);}
function weekStats(){
  const ws=weekStart(0).getTime(),en=ws+7*864e5;
  const rows=data.filter(x=>{const t=new Date(x.date+'T00:00:00').getTime();return t>=ws&&t<en;});
  return {rows:rows,vol:rows.reduce((a,x)=>a+recVol(x),0),days:new Set(rows.map(x=>x.date)).size};
}
function streakDays(){
  const days=new Set(data.map(x=>x.date));
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  const fm=dd=>dd.getFullYear()+'-'+p(dd.getMonth()+1)+'-'+p(dd.getDate());
  if(!days.has(fm(d)))d.setDate(d.getDate()-1);
  let n=0;
  for(let i=0;i<730;i++){if(!days.has(fm(d)))break;n++;d.setDate(d.getDate()-1);}
  return n;
}
function weekDoneParts(){return new Set(weekStats().rows.map(x=>x.part));}
function suggestedPart(){
  const w0=new Date().getDay(),done=weekDoneParts(),cur=ROTATION[w0];
  if(!cur)return {part:'유산소',rest:true};
  if(!done.has(cur))return {part:cur};
  for(let i=1;w0+i<=6;i++){
    const px=ROTATION[w0+i];
    if(px&&!done.has(px))return {part:px,movedFrom:cur};
  }
  return {part:'유산소',rest:true,allDone:true};
}
function homeOverride(){
  try{
    const o=JSON.parse(localStorage.getItem(HPKEY)||'null');
    if(o&&o.date===todayStr()&&PARTS.indexOf(o.part)>=0)return o.part;
  }catch(e){}
  return null;
}
function setHomeOverride(p){
  try{localStorage.setItem(HPKEY,JSON.stringify({date:todayStr(),part:p}));}catch(e){}
}
function clearHomeOverride(){try{localStorage.removeItem(HPKEY);}catch(e){}}
function modePart(rows){
  const c={};rows.forEach(x=>{c[x.part]=(c[x.part]||0)+1;});
  return Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||'가슴';
}
function homeDisplayPart(){
  const ov=homeOverride();
  if(ov)return ov;
  const t=todayRows();
  if(t.length)return modePart(t);
  return suggestedPart().part;
}
function setsNum(s){const m=/(\d+)\s*세트/.exec(s||'');return m?+m[1]:0;}
/* 오늘 할 종목: 내 운동(MY_FAV) 먼저, 부족하면 부위 추천으로 최대 4개 */
function todayList(p){
  const out=[],seen={};
  MY_FAV.forEach(f=>{
    const n=f[0],eq=f[1],sets=f[2],label=f[3];
    if(partOf(n,'')===p&&!seen[n]){seen[n]=1;out.push({n:n,eq:eq,sets:sets,label:label});}
  });
  (RECO[p]||[]).forEach(r=>{
    const n=r[0],eq=r[1],label=r[2],sets=r[3];
    if(out.length<4&&!seen[n]){seen[n]=1;out.push({n:n,eq:eq,sets:sets,label:label});}
  });
  return out.slice(0,4);
}
function planGoal(list){
  let s=0;list.forEach(r=>{s+=setsNum(r.sets);});
  return s||list.length||1;
}

/* 오늘의 운동 히어로: 링·그라데이션으로 움직임 (외부 이미지 없이) */

/* 숫자 카운트업(값은 즉시 확정, 연출만 부드럽게) */
function countUp(el,to,fmt){
  if(!el)return;
  const f=fmt||(v=>won(v));
  if(el._raf){cancelAnimationFrame(el._raf);el._raf=null;}
  if(reduced()||!isFinite(to)){el.textContent=f(to);return;}
  const t0=performance.now(),dur=650;
  const step=t=>{
    const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);
    el.textContent=f(to*e);
    if(k<1)el._raf=requestAnimationFrame(step);else el._raf=null;
  };
  el._raf=requestAnimationFrame(step);
}
/* 막대 게이지를 화면에 보일 때 왼쪽→오른쪽으로 순서대로 */
function growBars(root){
  if(!root)return;
  const els=[].slice.call(root.querySelectorAll('.bar i'));
  els.forEach((el,i)=>{
    const w=el.getAttribute('data-w')||'0%';
    el.style.width='0.01%';
    if(reduced()){el.style.width=w;return;}
    setTimeout(()=>{el.style.width=w;},30+i*70);
  });
}
let toastT=0;
function showToast(html){
  const t=$('wtoast');
  if(!t)return;
  t.innerHTML=html;t.classList.add('on');
  clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove('on'),2600);
}
function homeRowHTML(name,eq,sets,label,sub,done){
  const e=EQUIP[eq]||{};
  const right=done?'<span class="plus2 ok">✓</span>':'<span class="plus2">+</span>';
  return '<button class="hrow" data-ex="'+name.replace(/"/g,'')+'">'
    +(e.img?'<img src="'+e.img+'" alt="">':icon(eq))
    +'<div class="t"><b>'+name+'</b><small>'+(sub||((label||e.n||'')+' · '+sets))+'</small></div>'
    +right+'</button>';
}
function renderHome(){
  const card=$('todayCard');
  if(!card)return;
  const t=todayRows(),ov=homeOverride(),sug=suggestedPart();
  const p=homeDisplayPart();
  const restDay=!t.length&&!ov&&sug.rest;
  const plan=restDay
    ?RECO['유산소'].slice(0,2).map(r=>({n:r[0],eq:r[1],label:r[2],sets:r[3]}))
    :todayList(p);
  const goal=planGoal(plan);
  const hasSets=plan.some(r=>setsNum(r.sets)>0);
  const mine=t.filter(x=>x.part===p);
  const doneSets=mine.reduce((a,x)=>a+recSets(x),0);
  const mineVol=mine.reduce((a,x)=>a+recVol(x),0);
  const mineExs=[];mine.forEach(x=>{if(mineExs.indexOf(x.ex)<0)mineExs.push(x.ex);});
  const doneNum=hasSets?doneSets:mineExs.length;
  const pct=goal?Math.min(1,doneNum/goal):0;
  const complete=mine.length>0&&doneNum>=goal;
  const doing=mine.length>0&&!complete;
  paintColor(card,p);

  const dd=new Date();
  const dateTxt=(dd.getMonth()+1)+'월 '+dd.getDate()+'일 '+wd[dd.getDay()]+'요일';
  let title=p,tag='요일 로테이션',sub=plan.length+'종목'+(hasSets?' · '+goal+'세트 예정':' 예정');
  if(ov&&!t.length){tag='직접 고름';}
  if(restDay){
    title='휴식';tag='로테이션';
    sub=sug.allDone?'이번 주 로테이션은 다 도셨어요. 남은 날은 가볍게.':'오늘은 쉬는 날 — 가볍게 걷거나 스트레칭으로 몸을 풀어 주세요.';
  }else if(complete){
    tag='완료';
    sub=mineExs.length+'종목 · '+doneSets+'세트 · '+won(mineVol)+'kg';
  }else if(doing){
    tag='진행 중';
    sub=mineExs.length+'종목 · '+doneSets+'세트 · '+won(mineVol)+'kg';
  }

  const C=2*Math.PI*34;
  const center=complete
    ?'<svg class="chkpop" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l4.8 4.8L19.5 7"/></svg>'
    :'<b>'+doneNum+'</b><span>/'+goal+(hasSets?'세트':'개')+'</span>';
  const startOff=reduced()?C*(1-pct):C;
  const ringHTML=restDay?'':'<div class="hring"><svg class="rsvg" viewBox="0 0 86 86">'
    +'<circle class="rtrack" cx="43" cy="43" r="34" stroke-width="7"/>'
    +'<circle class="rfill" cx="43" cy="43" r="34" stroke-width="7" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+startOff.toFixed(1)+'" transform="rotate(-90 43 43)"/>'
    +'</svg><div class="rcenter">'+center+'</div></div>';

  let html='<div class="hero">'
    +'<div class="hrow1"><span>오늘의 운동</span><span>'+dateTxt+'</span></div>'
    +'<div class="hmain"><div class="hleft"><b>'+title+'</b><span class="htag">'+tag+'</span>'
    +'<div class="hsub">'+sub+'</div></div>'+ringHTML+'</div></div><div class="tbody">';

  if(complete){
    html+='<div class="tlist">'+mine.slice(0,3).map(x=>
      homeRowHTML(x.ex,eqOf(x.ex),recSets(x)+'세트',null,setShort(x),true)).join('')
      +(mine.length>3?'<div class="tmore">기록 '+(mine.length-3)+'건 더 있어요</div>':'')+'</div>';
  }else{
    const doneNames={};mine.forEach(x=>{doneNames[x.ex]=1;});
    if(doing)html+='<div class="tcnote">오늘 '+doneNum+' / '+goal+(hasSets?'세트':'개')+' 하셨어요. 남은 종목을 마저 해 보세요.</div>';
    else if(t.length)html+='<div class="tcnote">오늘 「'+modePart(t)+'」 기록이 이미 있어요. 부위를 바꿔 보는 중입니다.</div>';
    else if(sug.movedFrom&&!ov)html+='<div class="tcnote">이번 주에 「'+sug.movedFrom+'」 기록이 있어 오늘은 「'+p+'」로 당겼어요.</div>';
    html+='<div class="tlist">'+plan.map(r=>homeRowHTML(r.n,r.eq,r.sets,r.label,null,!!doneNames[r.n])).join('')+'</div>';
  }

  const btnLabel=complete?'오늘 기록 더 하기':(restDay?'가볍게 기록하기':'오늘 운동 기록하기');
  html+='<button class="btn tbtn" data-act="go" data-p="'+p+'">'+btnLabel+'</button>'
    +'<div class="hpick"><div class="hplabel">부위 바꾸기</div><div class="hchips">'
    +PARTS.map(x=>'<button class="hchip'+(x===p?' on':'')+'" data-p="'+x+'" style="--c:'+PC(x).c+';--cd:'+PC(x).cd+'"><i></i>'+x+'</button>').join('')
    +'</div></div></div>';

  card.innerHTML=html;

  const rf=card.querySelector('.rfill');
  if(rf&&!reduced())requestAnimationFrame(()=>{rf.style.strokeDashoffset=(C*(1-pct)).toFixed(1);});

  card.querySelectorAll('[data-ex]').forEach(b=>{
    b.onclick=()=>{
      const n=b.dataset.ex;
      part=partOf(n,homeDisplayPart());
      markChips();renderReco();
      showTab('write');
      fillExercise(n,eqOf(n));
    };
  });
  card.querySelectorAll('.hchip').forEach(b=>{
    b.onclick=()=>{
      setHomeOverride(b.dataset.p);
      part=b.dataset.p;markChips();renderReco();renderHome();
    };
  });
  const go=card.querySelector('[data-act="go"]');
  if(go)go.onclick=()=>{
    part=go.dataset.p;markChips();renderReco();showTab('write');
  };

  const w=weekStats();
  countUp($('hWeek'),w.vol,v=>won(v)+'kg');
  countUp($('hDays'),w.days,v=>Math.round(v)+'일');
  countUp($('hStreak'),streakDays(),v=>Math.round(v)+'일');
  renderRecent();
}
function renderRecent(){
  const box=$('hRecent');
  if(!box)return;
  const rows=data.slice().sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(a.id<b.id?1:-1)).slice(0,3);
  if(!rows.length){box.innerHTML='<div class="empty" style="padding:16px 6px">아직 기록이 없어요. 오늘부터 하나씩 쌓아 보세요.</div>';return;}
  box.innerHTML=rows.map(x=>{
    const dd=new Date(x.date+'T00:00:00');
    return '<button class="hrow" data-id="'+x.id+'" style="--c:'+PC(x.part).c+'" title="눌러서 수정">'
      +'<div class="t"><b>'+esc(x.ex)+'</b><small>'+x.part+' · '+(dd.getMonth()+1)+'월 '+dd.getDate()+'일 '+wd[dd.getDay()]+' · '+recSets(x)+'세트</small></div>'
      +'<span class="rdate">'+won(recVol(x))+'kg</span></button>';
  }).join('');
}
function renderWriteProg(){
  const list=todayList(part),goal=planGoal(list);
  const hasSets=list.some(r=>setsNum(r.sets)>0);
  const mine=data.filter(x=>x.date===todayStr()&&x.part===part);
  const doneSets=mine.reduce((a,x)=>a+recSets(x),0);
  const exs=[];mine.forEach(x=>{if(exs.indexOf(x.ex)<0)exs.push(x.ex);});
  const done=hasSets?doneSets:exs.length;
  const pp=$('wProgPart');
  if(!pp)return;
  pp.textContent=part;pp.style.color=PC(part).cd;
  $('wProgNum').textContent=done;$('wProgNum').style.color=PC(part).cd;
  $('wProgGoal').textContent=goal;
  if($('wProgUnit'))$('wProgUnit').textContent=hasSets?'세트':'개';
  const bar=$('wProgBar');
  bar.style.background=PC(part).c;
  bar.style.width=Math.min(100,goal?done/goal*100:0)+'%';
  return {done:done,goal:goal};
}
function openRecord(id){
  showTab('write');
  render();
  const el=document.querySelector('#list .item[data-id="'+id+'"]');
  if(!el)return;
  el.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});
  el.classList.add('rowflash');
  setTimeout(()=>el.classList.remove('rowflash'),1700);
}
const VIEWS={home:['tabHome','viewHome'],write:['tabWrite','viewWrite'],stat:['tabStat','viewStat']};
function showTab(k){
  Object.keys(VIEWS).forEach(x=>{
    $(VIEWS[x][0]).classList.toggle('on',x===k);
    $(VIEWS[x][1]).classList.toggle('hide',x!==k);
  });
  const v=$(VIEWS[k][1]);
  v.classList.remove('viewin');
  void v.offsetWidth;
  if(!reduced())v.classList.add('viewin');
  if(k==='stat')renderStat();
  if(k==='home')renderHome();
  try{const b=document.getElementById('wlog');if(b&&b.getBoundingClientRect().top<0)b.scrollIntoView({block:'start'})}catch(e){}
}

function weekStart(offset){
  const d=new Date();const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day-(offset||0)*7);d.setHours(0,0,0,0);return d;
}
function renderStat(){
  const w0=weekStats();
  countUp($('sWeek'),w0.vol,v=>won(v)+'kg');
  countUp($('sDays'),w0.days,v=>Math.round(v)+'일');

  const from=Date.now()-30*864e5;
  const recent=data.filter(x=>new Date(x.date+'T00:00:00').getTime()>=from);
  const pm={};recent.forEach(x=>{pm[x.part]=(pm[x.part]||0)+recVol(x);});
  const max=Math.max(1,...Object.values(pm));
  $('partStat').innerHTML=Object.keys(pm).length?Object.entries(pm).sort((a,b)=>b[1]-a[1]).map(([p,v])=>
    '<div class="part" style="--c:'+PC(p).c+'"><div class="top"><span><i class="dotr"></i>'+p+'</span><span>'+won(v)+'kg</span></div>'
    +'<div class="bar"><i data-w="'+(v/max*100).toFixed(0)+'%" style="background:'+PC(p).c+';width:0.01%"></i></div></div>').join(''):'<div class="empty">최근 30일 기록이 없어요.</div>';

  let wh='';
  for(let i=5;i>=0;i--){
    const st=weekStart(i).getTime(), en=st+7*864e5;
    const v=data.filter(x=>{const t=new Date(x.date+'T00:00:00').getTime();return t>=st&&t<en;}).reduce((a,x)=>a+recVol(x),0);
    wh+='<div class="part"><div class="top"><span>'+(i===0?'이번 주':(i+'주 전'))+'</span><span>'+won(v)+'kg</span></div>'
      +'<div class="bar"><i data-w="'+Math.min(100,v/Math.max(1,20000)*100).toFixed(0)+'%" style="width:0.01%;background:linear-gradient(90deg,#8b6cf6,#5a45e8)"></i></div></div>';
  }
  $('weekStat').innerHTML=wh;
  growBars($('partStat'));growBars($('weekStat'));

  const pr={},prp={};data.forEach(x=>{const k=recKg(x);if(!pr[x.ex]||k>pr[x.ex]){pr[x.ex]=k;prp[x.ex]=x.part;}});
  $('prStat').innerHTML=Object.keys(pr).length?Object.entries(pr).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([e,v])=>
    '<div class="item"><div class="name"><b>'+esc(e)+'</b><small><span class="dotr" style="--c:'+PC(prp[e]).c+'"></span>'+prp[e]+'</small></div>'
    +'<div class="vol">'+v+'kg</div></div>').join(''):'<div class="empty">기록이 쌓이면 최고 무게가 보여요.</div>';
}
function exportFile(){
  if(!data.length){alert('내보낼 기록이 없어요.');return;}
  let csv='날짜,부위,종목,세트별,세트수,총볼륨,최고무게,메모\n';
  data.slice().sort((a,b)=>(a.date<b.date?-1:1)).forEach(x=>{
    const list=recSetList(x);
    const detail=list.map((s,i)=>(i+1)+'세트 '+s.kg+'kg×'+s.reps).join(' / ');
    csv+=[x.date,x.part,'"'+x.ex.replace(/"/g,'')+'"','"'+detail+'"',list.length,recVol(x),recKg(x),'"'+(x.m||'').replace(/"/g,'')+'"'].join(',')+'\n';
  });
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='운동일지_'+todayStr()+'.csv';a.click();
}
$('save').onclick=addItem;
$('addSet').onclick=addSetRow;
$('cancelEdit').onclick=()=>cancelEdit();
$('tabHome').onclick=()=>showTab('home');
$('tabWrite').onclick=()=>showTab('write');
$('tabStat').onclick=()=>showTab('stat');
$('hRecent').onclick=e=>{const b=e.target.closest('[data-id]');if(b&&$('hRecent').contains(b))startEdit(b.dataset.id);};
$('exportBtn').onclick=e=>{e.preventDefault();exportFile();};
$('ex').addEventListener('input',()=>{
  const n=$('ex').value.trim();
  if(!n){$('lastHint').innerHTML='';return;}
  setLastHint(n,'');
});


  initToday();initChips();refreshExList();render();
  setFormSets([{kg:'',reps:''}]);updateFormMode();
  part=homeDisplayPart();markChips();renderReco();
  showTab('home');
  return true;
}
window.renderWorkout=function(){
  var el=document.getElementById('sc-workout');
  if(!el)return;
  if(!el.querySelector('#wlog')){
    el.innerHTML=WLOG_HTML;
    BUILT=false;
  }
  try{
    if(!bootOnce())return;
    var k=document.querySelector('#wlog .tabs button.on');
    var cur=k?(k.id==='tabWrite'?'write':k.id==='tabStat'?'stat':'home'):'home';
    if(cur==='stat')renderStat();else if(cur==='write')renderReco();else renderHome();
  }catch(e){console.error('[workout]',e)}
};
})();
