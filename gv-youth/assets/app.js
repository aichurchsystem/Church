/* ==========================================================================
   GV청소년선교회 — 시안 v3 인터랙션
   - 청소년 소식·정보 허브: 분류 탭 + 검색 + 헤드라인/주요 소식/최신 카드
   - 소식 상세 모달 / 컨퍼런스 모달
   - 모바일 메뉴 / 드롭다운 / 등장 애니메이션
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. 소식 데이터
     ※ 시안 샘플입니다. 자동 수집 에이전트가 연결되면 이 배열만 교체하면 됩니다.
       (카드 제목은 한국 청소년·교육 정책 흐름을 참고해 작성한 예시이며,
        링크는 각 기관의 공식 홈페이지입니다.)
     ---------------------------------------------------------------------- */
  var CATS = {
    news:    { label: '국내·해외 청소년 뉴스', chip: 'chip--news' },
    paper:   { label: '청소년 신문기사', chip: 'chip--paper' },
    policy:  { label: '한국 청소년정책', chip: 'chip--policy' },
    benefit: { label: '정부혜택·지원', chip: 'chip--benefit' },
    edu:     { label: '교육부·수능 소식', chip: 'chip--edu' }
  };

  var ARTICLES = [
    {
      id: 'benefit-national-scholarship-2027',
      cat: 'benefit',
      title: '2027학년도 1학기 국가장학금 1차 신청…합격 전 고3·예비 신입생도 가능',
      desc: '교육부와 한국장학재단이 11월 24일부터 내년 1월 7일 18시까지 2027학년도 1학기 국가장학금 1차 신청을 받습니다. 고3·재수생 등 입학예정자도 합격 전 신청이 가능하며, 내년 도입되는 지방국립대 전액 장학금 대상이 되려면 이번 신청이 필수입니다. 내년부터 지원구간이 10구간에서 (가)~(마) 5구간 체계로 개편되며 한국장학재단 누리집·앱에서 신청할 수 있습니다.',
      source: '대한민국 정책브리핑(교육부) (2026-11-25)',
      url: 'https://www.korea.kr/multi/visualNewsView.do?newsId=148976437'
    },
    {
      id: 'policy-kdca-youth-health-2026',
      cat: 'policy',
      title: '질병관리청 ‘2026년 청소년건강행태조사’…흡연·음주율 줄었으나 담배 중복사용·아침 결식 증가',
      desc: '질병관리청이 전국 중·고등학생 약 6만 명을 대상으로 조사한 결과, 담배제품 사용률(3.3%)과 음주율(5.5%)은 감소세를 이어갔습니다. 반면 흡연 청소년 중 일반·전자담배 등을 함께 쓰는 중복사용률은 65.1%로 높아졌고, 아침 결식률도 44.6%로 증가했습니다. 여학생은 음주자 중 위험음주율(54.5%)과 스트레스 인지율(50.1%)이 높게 나타나 성별·학교급별 맞춤 개입이 필요한 것으로 지적됐습니다.',
      source: '질병관리청·연합뉴스 (2026-11-26)',
      url: 'https://www.yna.co.kr/view/AKR20261126087300530'
    },
    {
      id: 'edu-daegu-drug-prevention-2026',
      cat: 'edu',
      title: '대구시교육청, 수능 이후 고3 대상 찾아가는 ‘유해약물 예방’ 순회 교육',
      desc: '대구시교육청이 수능을 마치고 사회 진출을 앞둔 고3 학생들을 위해 12월 18일까지 15개 고등학교에서 유해약물 예방 순회 교육을 진행합니다. 한국마약퇴치운동본부 대구지부와 연계해 강의, 체험 부스, 뮤지컬 중 학교 여건에 맞는 방식을 선택해 운영합니다. 마약류 등 유해약물의 위험성과 대처법을 알리고 실생활의 유혹에 스스로 판단·대응하는 역량을 기르는 데 초점을 맞췄습니다.',
      source: '대구시교육청·LG헬로비전 (2026-11-25)',
      url: 'http://news.lghellovision.net/news/articleView.html?idxno=563641'
    },
    {
      id: 'paper-chosun-csat-reform-2026',
      cat: 'paper',
      title: '“수능으론 학생 잠재력 평가 한계…대입 공정성 회복과 선발 다변화 필요”',
      desc: '배상훈 성균관대 교육학과 교수(국가교육위원회 위원)가 인터뷰에서 올해 수능 AI 부정행위 논란은 수능이 인생을 좌우하는 고위험 시험이 된 현실을 보여준다고 진단했습니다. 당장 첨단 기기 부정행위를 엄정히 적발해 시험 신뢰를 회복하되, 장기적으로는 수능 영향력을 줄이고 학교생활기록부 기반 평가의 전문성을 높여야 한다고 제언했습니다. 다만 서·논술형 도입 등 급격한 개편은 사교육을 키울 수 있어 단계적 논의가 필요하다고 강조했습니다.',
      source: '조선일보 (2026-11-27)',
      url: 'https://www.chosun.com/national/education/2026/11/27/NDSLY4VM4JGAVLCF36EPYQ77NA/'
    },
    {
      id: 'news-oecd-ecigarette-youth-2026',
      cat: 'news',
      title: 'OECD, 유럽 15~16세 청소년 전자담배 사용률 5년 새 14%→23% 급증 보고',
      desc: 'OECD가 발표한 ‘Health at a Glance: Europe 2026’ 보고서에서 유럽 15~16세 청소년의 일반 담배 흡연율은 감소세(18%)를 보인 반면, 최근 한 달 내 전자담배 사용률은 2019년 14%에서 2024년 23%로 크게 늘었습니다. 특히 여학생 전자담배 사용률(25%)이 남학생(19%)을 웃돌았으며, 가향 성분과 또래 영향이 주요 입문 요인으로 꼽혔습니다. OECD는 청소년 전자담배 사용이 일반 담배 흡연으로 이어질 위험이 크다며 디지털 홍보·가향 규제 강화를 촉구했습니다.',
      source: 'OECD (2026-11-25)',
      url: 'https://www.oecd.org/en/publications/health-at-a-glance-europe-2026_64707ff8-en/full-report/tobacco-and-electronic-cigarette-use-among-adolescents_045b7cc0.html'
    },
    {
      id: 'benefit-modu-card-youth-2026',
      cat: 'benefit',
      title: '12월부터 만 13~18세 청소년도 ‘모두의카드’ 대중교통비 20% 환급',
      desc: '오는 12월 1일부터 만 13~18세 청소년도 ‘모두의카드’로 대중교통비 환급 혜택을 받을 수 있습니다. 정률형 20% 또는 정액형(수도권 일반형 기준 6만 2천 원 초과분)이 적용되며, 12개 카드사에서 선불·체크카드를 발급받아 앱이나 누리집에 등록하면 됩니다. 내년 2월부터는 청소년·청년·외국인 특화 카드 상품 3종도 추가로 출시됩니다.',
      source: '국토교통부 (2026-11-25)',
      url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148976499'
    },
    {
      id: 'policy-mogef-outofschool-2026',
      cat: 'policy',
      title: '성평등가족부, 올해 학교 밖 청소년 1만 4,685명 학업 지원·내년 꿈드림센터 인력 119명 확충',
      desc: '성평등가족부가 올해 9월까지 전국 꿈드림센터 222곳을 통해 학교 밖 청소년 1만 4,685명의 학업과 3,117명의 취업·창업을 지원했습니다. 올해부터는 학교 밖 청소년의 수능 모의평가 응시료 지원 사업도 새롭게 시행하고 있습니다. 내년에는 꿈드림센터 인력을 119명 늘려 위기 조기 발굴과 진로·자립 맞춤형 지원을 강화합니다.',
      source: '성평등가족부·뉴스핌 (2026-11-25)',
      url: 'https://www.newspim.com/news/view/20261125000172'
    },
    {
      id: 'paper-seoul-g3-transition-2026',
      cat: 'paper',
      title: '서울시의회 고3 수능 이후 교육공백 포럼…“모든 학생에 생활금융 등 생애전환교육 필요”',
      desc: '서울시의회에서 수능을 마친 고3 학생들의 교육 공백을 줄이기 위한 생애전환교육 포럼이 열렸습니다. 참석자들은 학교별 프로그램 편차로 교육 격차가 커지지 않도록 금융·경제, 노동, 디지털 윤리 등을 고르게 가르쳐야 한다고 강조했습니다. 발제에서는 신용관리·금융사기 대응 등 생활금융 수업을 졸업 전 최소 10차시 편성하는 방안이 제안됐습니다.',
      source: '뉴스핌 (2026-11-25)',
      url: 'https://www.newspim.com/news/view/20261125000240'
    },
    {
      id: 'edu-gangwon-post-csat-2026',
      cat: 'edu',
      title: '강원도교육청, 수능 이후 고3 학사 운영·생활지도 강화 및 학교당 최대 1,500만 원 지원',
      desc: '강원특별자치도교육청이 수능 이후 학원 수강이나 미승인 교외 체험학습 등을 미인정 결석으로 처리해 학년말 출결 관리를 강화합니다. 고3 진학·취업 준비와 금융·취업 교육을 돕기 위해 학교당 최대 1,500만 원의 프로그램 운영비를 지원합니다. 12월 31일까지는 학생 안전 특별기간으로 정해 경찰·지자체와 합동으로 음주·무면허 운전 예방 등 생활지도를 이어갑니다.',
      source: 'G1TV·강원특별자치도교육청 (2026-11-24)',
      url: 'https://www.g1tv.co.kr/news/?mid=1_207_3&newscode=010100&newsid=351452'
    },
    {
      id: 'news-oecd-adolescent-screen-2026',
      cat: 'news',
      title: 'OECD, 유럽 13~18세 청소년 평일 4.5시간·주말 6.1시간 스크린 사용·신체활동 급감 보고',
      desc: 'OECD가 25일 발표한 ‘Health at a Glance: Europe 2026’ 보고서에서 유럽 13~18세 청소년의 하루 평균 스크린 사용 시간이 평일 4.5시간, 주말 6.1시간에 달했습니다. 유럽연합 15세 청소년 중 세계보건기구 권고치(하루 60분 이상 신체활동)를 채우는 비율은 15%에 그쳤습니다. 청소년의 절반 가까이는 SNS가 유익하다고 답했으나, 약 3분의 1은 SNS로 인해 스트레스나 우울, 소외감을 겪는다고 응답했습니다.',
      source: 'OECD (2026-11-25)',
      url: 'https://www.oecd.org/en/publications/health-at-a-glance-europe-2026_64707ff8-en/full-report/physical-activity-and-screen-time-among-children-and-adolescents_7679da85.html'
    },
    {
      id: 'policy-mogef-ai-1388-2026',
      cat: 'policy',
      title: '성평등가족부, 위기청소년 AI 조기 발굴·1388 상담 연계 강화',
      desc: '성평등가족부가 과기정통부와 함께 연말까지 SNS 속 위기 신호를 먼저 찾아내는 AI 발굴 체계를 구축하고, 청소년상담1388 온라인 상담원을 99명에서 115명으로 늘립니다. 정신건강복지센터·자살예방센터·가족센터를 청소년안전망 필수 연계기관으로 추가해 상담 이후 의료와 가족 회복 지원까지 잇고, 고위기 집중심리클리닉과 학교밖청소년 원스톱 지원도 확대합니다.',
      source: '성평등가족부·한국경제 (2026-11-24)',
      url: 'https://www.hankyung.com/article/2026112460101'
    },
    {
      id: 'edu-moe-exam-smartdevice-2026',
      cat: 'edu',
      title: '교육부, 내신 스마트기기 부정행위 시 당일 전과목 0점·최대 퇴학 권고',
      desc: '교육부가 고등학교 2학기 기말고사부터 스마트기기 활용 부정행위를 막기 위해 모든 전자기기 사전 수거, 타 교실 응시, 금속탐지기·통신신호 점검을 도입합니다. 스마트기기 소지나 사용이 적발되면 당일 모든 과목 성적을 0점 처리하고 최대 퇴학까지 징계하도록 기준을 강화하며, 6명 규모의 수능 부정행위 전담 대응팀도 본격 가동합니다.',
      source: '교육부·KTV 국민방송 (2026-11-24)',
      url: 'https://www.ktv.go.kr/news/major/view?content_id=764503'
    },
    {
      id: 'edu-goe-40day-growth-2026',
      cat: 'edu',
      title: '경기도교육청, 수능 이후 고3 대상 ‘40일 성장 프로그램’ 운영 지원',
      desc: '경기도교육청이 수능 이후 종업식까지 고3 학생들이 근로계약서 작성, 금융·전세사기 예방, 신용관리 등 실생활 법률·금융 교육을 받도록 지원합니다. 지자체·종교계·대학을 잇는 지역 협력 프로그램과 교과 융합 자료 ‘잇다 프로젝트’를 통해 건강관리와 자취생활, 진로 설계도 함께 다룹니다.',
      source: '경기도교육청 (2026-11-23)',
      url: 'https://www.goe.go.kr/goe/na/ntt/selectNttInfo.do?bbsId=1922&mi=10102&nttSn=2382457'
    },
    {
      id: 'paper-cbe-ai-school-safety-2026',
      cat: 'paper',
      title: '충북교육청, AI 서·논술형 평가 협력과 CCTV 학교폭력 감지 모델 실증',
      desc: '충북교육청이 서울·울산·충청권 교육청과 손잡고 AI 서·논술형 평가 공동 운영 및 교육부 AI 교수학습 공통모듈 시범 적용에 나섭니다. 행안부와 함께 기존 학교 CCTV 영상에서 단순 장난과 실제 폭력을 구분해 조기 개입하는 AI 감지 모델을 개발해 중학교 현장에서 실증하고 있습니다.',
      source: '충북교육청·연합뉴스 (2026-11-23)',
      url: 'https://www.yna.co.kr/view/AKR20261123078400064'
    },
    {
      id: 'news-who-europe-youth-inequity-2026',
      cat: 'news',
      title: '세계보건기구(WHO), 유럽 아동·청소년 3,500만 명 건강 불평등 경고',
      desc: 'WHO 유럽지역사무소 보고서에 따르면 유럽·중앙아시아 53개국 아동·청소년 약 3,500만 명이 빈곤과 교육·주거 격차 등 피할 수 있는 건강·사회적 불평등에 놓여 있습니다. 저소득 가정 청소년은 유년기부터 건강과 학업 기회가 뒤처지며 온·오프라인 괴롭힘의 영향도 크게 받아, WHO는 생애 초기 가족 지원과 무상 급식, 학교 괴롭힘 예방 프로그램 도입을 권고했습니다.',
      source: 'WHO 유럽지역사무소·유로뉴스 (2026-11-24)',
      url: 'https://www.euronews.com/2026/11/24/growing-health-inequalities-put-millions-of-european-children-at-risk-who-warns'
    },
    {
      id: 'benefit-sanitary-voucher-2026',
      cat: 'benefit',
      title: '여성청소년 생리용품 이용권, 12월 24일 신청·연말 사용 마감',
      desc: '만 9~24세 취약계층 여성청소년에게 월 1만 4천 원(연 최대 16만 8천 원)을 지원하는 이용권의 올해 잔액이 12월 31일 이후 자동 소멸합니다. 아직 신청하지 않은 대상자는 12월 24일까지 행정복지센터나 복지로에서 신청할 수 있으며, 사용처도 다이소·올리브영 등 104곳으로 확대되었습니다. 카드사별로 이용 가능한 온라인·오프라인 가맹점이 다르므로 결제 전 사용처를 확인하는 것이 좋습니다.',
      source: '성평등가족부·한겨레 (2026-11-22)',
      url: 'https://www.hani.co.kr/arti/society/society_general/1288472.html'
    },
    {
      id: 'policy-goe-youth-council-2026',
      cat: 'policy',
      title: '경기도교육청, ‘2026 지역청소년교육의회 정책 공유 온’ 개최',
      desc: '경기도 내 26개 지역청소년교육의회 학생의원과 교원·학부모 등 200여 명이 모여 1년간의 정책 제안과 사회참여 성과를 나눴습니다. 학생들은 교육격차 해소 배움다리, 학생참여단 확대, 지역 연계 청소년 문화공간 조성 등 현장에서 발굴한 정책을 직접 발표했습니다. 경기도교육청은 이번 제안들을 자료집으로 엮어 실제 경기교육 정책으로 이어지도록 지원할 계획입니다.',
      source: '경기도교육청 (2026-11-22)',
      url: 'https://www.goe.go.kr/goe/na/ntt/selectNttInfo.do?bbsId=1922&mi=10102&nttSn=2382412'
    },
    {
      id: 'paper-post-csat-depression-2026',
      cat: 'paper',
      title: '수능 이후 수험생 ‘시험 후유증’…2주 이상 우울감 지속 시 상담 필요',
      desc: '수능이 끝난 뒤 오랜 긴장이 풀리면서 허탈감이나 무기력, 우울감을 호소하는 수험생이 많아 가정의 세심한 관심이 필요한 시기입니다. 전문가는 성적 비교나 진학 재촉을 피하고 일정한 수면·일상 리듬을 유지하며 그동안의 노력을 충분히 인정해 줄 것을 권했습니다. 우울감이 2주 이상 이어지거나 일상생활이 어렵다면 전문의 상담이나 도움을 받는 것이 좋습니다.',
      source: '헬스조선 (2026-11-22)',
      url: 'https://health.chosun.com/site/data/html_dir/2026/11/20/2026112003054.html'
    },
    {
      id: 'edu-ulsan-wee-recovery-2026',
      cat: 'edu',
      title: '울산교육청, 수능 마친 고3 대상 찾아가는 마음 회복 지원',
      desc: '울산교육청 힐링 위(Wee) 센터가 11월 23일부터 12월 9일까지 지역 고3 27개 학급을 대상으로 맞춤형 체험 집단 상담을 운영합니다. 전문 강사가 학교를 찾아가 맞춤 색상 진단과 나만의 향수 만들기 활동을 진행하며 수험 생활 스트레스를 덜어 줍니다. 성인기로 넘어가는 시기에 자신을 돌아보고 정서적 안정을 찾도록 돕는 취지입니다.',
      source: '울산매일·울산교육청 (2026-11-22)',
      url: 'https://www.iusm.co.kr/news/articleView.html?idxno=1070844'
    },
    {
      id: 'news-unfpa-swp-2026',
      cat: 'news',
      title: '유엔인구기금(UNFPA), 아태지역 청년·청소년 기회 확대 촉구',
      desc: '유엔인구기금이 2026 세계인구현황 보고서 발표를 통해 아시아·태평양 지역 약 10억 명의 청년·청소년이 경제적 불안과 불평등에 놓여 있다고 밝혔습니다. 전 세계 청년 5명 중 1명이 교육·고용·훈련 밖에 있으며, 특히 여성 청년의 비중이 남성보다 두 배 이상 높은 것으로 나타났습니다. 보고서는 교육과 양질의 일자리 투자, 정책 결정 과정에서의 실질적인 청소년·청년 참여를 각국 정부에 요청했습니다.',
      source: '유엔인구기금 아시아태평양지역사무소 (2026-11-23)',
      url: 'https://asro.unfpa.org/en/news/unfpa-calls-urgent-action-protect-young-peoples-futures-asia-pacific'
    },
    {
      id: 'edu-2028-admission',
      cat: 'edu',
      title: '2028학년도 대입 개편 — 통합형 수능과 심화수학 선택',
      desc: '수능·내신 체제 변화와 선택과목 구조가 발표되면서, 고교 교육과정과 진로 설계가 함께 조정되고 있습니다. 학생과 학부모가 확인해야 할 핵심 변화를 정리했습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr',
      sample: true
    },
    {
      id: 'news-media-literacy',
      cat: 'news',
      title: '숏폼·AI 콘텐츠 시대, 청소년 미디어 리터러시 교육 확대',
      desc: '짧은 영상과 생성형 AI가 일상이 되면서, 비판적으로 읽고 책임 있게 쓰는 힘을 기르는 교육이 학교와 가정에서 함께 논의되고 있습니다.',
      source: '한국청소년정책연구원',
      url: 'https://www.nypi.re.kr',
      sample: true
    },
    {
      id: 'paper-career-experience',
      cat: 'paper',
      title: '고교생 진로·진학, ‘학과 선택’보다 ‘경험 설계’가 관건',
      desc: '학생부 중심의 대입 변화 속에 청소년이 스스로 경험을 쌓고 기록하는 활동의 중요성이 커지고 있습니다.',
      source: '에듀동아',
      url: 'https://edu.donga.com',
      sample: true
    },
    {
      id: 'policy-7th-plan',
      cat: 'policy',
      title: '제7차 청소년정책기본계획, 청소년 참여와 권리 보장 중심',
      desc: '정책 결정 과정에 청소년이 직접 참여하는 구조와 청소년의 권리 보장이 정책의 중심 과제로 다뤄지고 있습니다.',
      source: '여성가족부',
      url: 'https://www.mogef.go.kr',
      sample: true
    },
    {
      id: 'benefit-1388',
      cat: 'benefit',
      title: '청소년상담 1388 — 24시간 전화·문자·카톡 상담',
      desc: '고민이 있거나 위기 상황일 때 청소년과 보호자가 무료로 상담받을 수 있는 채널입니다. 급하면 먼저 1388로 연락하세요.',
      source: '청소년상담복지 1388',
      url: 'https://www.1388.go.kr',
      sample: true
    },
    {
      id: 'edu-credit-system',
      cat: 'edu',
      title: '고교학점제 안착 지원 — 선택과목·진로 설계 자료',
      desc: '학생이 자신의 진로에 맞춰 과목을 고르는 고교학점제의 운영 지원과 진로·학업 설계 자료가 이어지고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr',
      sample: true
    },
    {
      id: 'news-school-age',
      cat: 'news',
      title: '학령인구 감소, 지역 청소년 사역의 새로운 과제로',
      desc: '청소년 인구가 줄면서 지역 교회와 청소년 기관이 소수 정예 사역과 지역 연합 사역을 모색하고 있습니다.',
      source: '국가통계포털(KOSIS)·언론 보도',
      url: 'https://kosis.kr',
      sample: true
    },
    {
      id: 'paper-student-mind',
      cat: 'paper',
      title: '학생 기자가 본 교실 안 마음 건강 — 또래 상담의 문턱',
      desc: '학생 기자들이 또래의 스트레스와 상담 접근성 문제를 취재한 기획 기사가 이어지고 있습니다.',
      source: '소년한국일보',
      url: 'https://kids.hankooki.com',
      sample: true
    },
    {
      id: 'policy-dream',
      cat: 'policy',
      title: '학교 밖 청소년 지원 — 꿈드림 센터의 검정고시·자립 지원',
      desc: '검정고시, 진로 탐색, 자립 지원을 학교 밖 청소년에게 연결하는 지역 꿈드림 센터의 역할이 커지고 있습니다.',
      source: '여성가족부 꿈드림',
      url: 'https://www.mogef.go.kr',
      sample: true
    },
    {
      id: 'benefit-out-of-school',
      cat: 'benefit',
      title: '학교 밖·취약계층 청소년 — 검정고시·자립·건강검진 지원',
      desc: '꿈드림 센터를 통해 검정고시 지원, 자립 지원, 건강검진 등 본인에게 맞는 지원을 안내받을 수 있습니다.',
      source: '여성가족부',
      url: 'https://www.mogef.go.kr',
      sample: true
    },
    {
      id: 'edu-csat-after',
      cat: 'edu',
      title: '수능 이후 진학 일정 — 정시·수시 지원 전략 점검',
      desc: '수험생과 학부모가 놓치기 쉬운 원서 접수 일정과 지원 전략을 교육청·학교 진학 자료에서 확인할 수 있습니다.',
      source: '교육부·한국교육과정평가원',
      url: 'https://www.moe.go.kr',
      sample: true
    },
    {
      id: 'news-overseas-relation',
      cat: 'news',
      title: '해외 청소년 사역, 행사 중심에서 ‘관계 중심’으로',
      desc: '대규모 집회에서 소그룹·멘토링으로 사역 구조를 바꾸는 해외 교회 사례가 늘고 있습니다. 국내 다음 세대 사역에도 시사점이 큽니다.',
      source: '해외 교회·선교 동향',
      url: 'https://www.korea.kr',
      sample: true
    },
    {
      id: 'paper-culture-space',
      cat: 'paper',
      title: '지역 청소년 문화 공간, ‘방과 후 거실’로 다시 주목',
      desc: '청소년 문화의 집과 자유공간이 방과 후 돌봄과 활동의 거점으로 다시 조명받고 있습니다.',
      source: '한국일보',
      url: 'https://www.hankookilbo.com',
      sample: true
    },
    {
      id: 'policy-echung',
      cat: 'policy',
      title: '청소년 활동 정보, e청소년에서 지역별로 한눈에',
      desc: '지역별 청소년 활동 프로그램과 동아리, 수련시설 정보를 한곳에서 확인할 수 있습니다.',
      source: 'e청소년 (청소년활동정보서비스)',
      url: 'https://www.youth.go.kr',
      sample: true
    },
    {
      id: 'benefit-culture-card',
      cat: 'benefit',
      title: '문화누리카드 — 청소년 문화·체험비 지원 신청 안내',
      desc: '공연·전시·도서·여행 할인과 청소년 대상 문화 지원 제도를 신청 자격과 함께 확인할 수 있습니다.',
      source: '문화체육관광부·한국문화예술위원회',
      url: 'https://www.mcst.go.kr',
      sample: true
    },
    {
      id: 'edu-mind-health',
      cat: 'edu',
      title: '학생 마음건강 — 위기학생 지원·상담 연계 강화',
      desc: '학교 상담 인력 확대와 지역 상담기관 연계, 마음건강 검사 등 학생 정서 지원 정책 소식입니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr',
      sample: true
    },
    {
      id: 'news-counseling-access',
      cat: 'news',
      title: '청소년 마음건강, 학교 밖 상담 접근성 높이는 지역 협력',
      desc: '학교 상담과 지역 청소년상담복지센터를 잇는 협력이 늘면서, 위기 신호를 일찍 발견하려는 시도가 이어지고 있습니다.',
      source: '청소년상담복지 1388·지자체',
      url: 'https://www.1388.go.kr',
      sample: true
    },
    {
      id: 'paper-exam-season',
      cat: 'paper',
      title: '입시 앞둔 고3, 수면·식사 무너지면 먼저 몸을 챙기세요',
      desc: '수험 생활이 길어지면서 수면과 식사를 지키는 기본 관리가 학습 효율과 컨디션을 좌우한다는 조언이 이어집니다.',
      source: '소년한국일보',
      url: 'https://kids.hankooki.com',
      sample: true
    },
    {
      id: 'policy-digital-safety',
      cat: 'policy',
      title: '청소년 유해환경 개선 — 디지털 성범죄·불법촬영물 대응 강화',
      desc: '청소년이 온라인에서 안전하도록 불법촬영물 삭제 지원과 예방 교육, 신고 체계가 함께 강화되고 있습니다.',
      source: '여성가족부·디지털성범죄피해자지원센터',
      url: 'https://www.mogef.go.kr',
      sample: true
    },
    {
      id: 'benefit-scholarship',
      cat: 'benefit',
      title: '국가장학금·교육비 지원 — 신청 시기와 자격 확인',
      desc: '대학 진학을 앞둔 청소년과 학부모가 놓치기 쉬운 장학금과 교육비 지원 제도를 한곳에서 확인할 수 있습니다.',
      source: '교육부·한국장학재단',
      url: 'https://www.kosaf.go.kr',
      sample: true
    },
    {
      id: 'edu-neulbom',
      cat: 'edu',
      title: '늘봄학교·방과후 프로그램 운영 확대',
      desc: '초등 돌봄과 방과후 프로그램을 지역과 연계해 넓히는 운영 사례와 지원 계획이 안내되고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr',
      sample: true
    },
    {
      id: 'edu-school-violence',
      cat: 'edu',
      title: '학교폭력 예방 — 관계 중심 생활교육과 회복 지원',
      desc: '사후 처벌 중심에서 벗어나 관계 회복과 예방 교육을 함께 다루는 학교 현장의 시도가 이어지고 있습니다.',
      source: '교육부',
      url: 'https://www.moe.go.kr',
      sample: true
    }
  ];

  /* ----------------------------------------------------------------------
     2. 유틸
     ---------------------------------------------------------------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function byId(id) { return document.getElementById(id); }

  function articleById(id) {
    for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].id === id) return ARTICLES[i];
    return null;
  }

  /* ----------------------------------------------------------------------
     3. 정보 허브
     ---------------------------------------------------------------------- */
  var leadSlot = byId('leadSlot');
  var newsLead = byId('newsLead');
  var headlineList = byId('headlineList');
  var headlineCount = byId('headlineCount');
  var latestBlock = byId('latestBlock');
  var latestCount = byId('latestCount');
  var grid = byId('cardGrid');
  var statusEl = byId('hubStatus');
  var emptyEl = byId('newsEmpty');
  var loadMore = byId('loadMore');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var searchInput = byId('infoSearch');
  var searchWrap = byId('searchWrap');
  var searchClear = byId('searchClear');

  var PAGE = 6;
  var state = { tab: 'all', q: '', shown: PAGE };

  /* 정보 허브가 있는 페이지(index)에서만 허브 스크립트를 켭니다. */
  var HUB = !!(leadSlot && newsLead && headlineList && headlineCount && latestBlock &&
    latestCount && grid && statusEl && emptyEl && loadMore && searchInput && searchWrap && searchClear);

  function leadHTML(a) {
    var c = CATS[a.cat];
    return '' +
      '<article class="lead-card" data-article="' + esc(a.id) + '">' +
        '<div>' +
          '<div class="lead-card__top">' +
            '<span class="chip ' + c.chip + '">' + esc(c.label) + '</span>' +
            (a.sample ? '<span class="chip chip--sample">시안 예시</span>' : '') +
          '</div>' +
          '<h3>' + esc(a.title) + '</h3>' +
          '<p class="lead-card__desc">' + esc(a.desc) + '</p>' +
        '</div>' +
        '<div class="lead-card__foot">' +
          '<span class="lead-card__source">' + esc(a.source) + '</span>' +
          '<button class="lead-card__more" type="button" data-article="' + esc(a.id) + '">자세히 보기 <span aria-hidden="true">→</span></button>' +
        '</div>' +
      '</article>';
  }

  function headlineHTML(a, i) {
    var c = CATS[a.cat];
    return '' +
      '<li>' +
        '<button class="headline-item" type="button" data-article="' + esc(a.id) + '">' +
          '<span class="headline-item__rank">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
          '<span class="headline-item__body">' +
            '<span class="headline-item__cat-row"><span class="chip ' + c.chip + '">' + esc(c.label) + '</span></span>' +
            '<span class="headline-item__title">' + esc(a.title) + '</span>' +
            '<span class="headline-item__src">' + esc(a.source) + '</span>' +
          '</span>' +
        '</button>' +
      '</li>';
  }

  function cardHTML(a) {
    var c = CATS[a.cat];
    return '' +
      '<article class="info-card reveal" data-article="' + esc(a.id) + '" tabindex="0" role="button" aria-label="' + esc(a.title) + ' — 소식 요약 보기">' +
        '<div class="info-card__top">' +
          '<span class="chip ' + c.chip + '">' + esc(c.label) + '</span>' +
          (a.sample ? '<span class="chip chip--sample">시안 예시</span>' : '') +
        '</div>' +
        '<h4>' + esc(a.title) + '</h4>' +
        '<p class="info-card__desc">' + esc(a.desc) + '</p>' +
        '<div class="info-card__foot">' +
          '<span class="src">' + esc(a.source) + '</span>' +
          '<span class="info-card__link">자세히 보기 <span aria-hidden="true">→</span></span>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var q = state.q.trim().toLowerCase();
    var list = ARTICLES.filter(function (a) {
      var okTab = state.tab === 'all' || a.cat === state.tab;
      var hay = (a.title + ' ' + a.desc + ' ' + a.source + ' ' + CATS[a.cat].label).toLowerCase();
      return okTab && (!q || hay.indexOf(q) !== -1);
    });

    var searching = !!q;

    if (searching) {
      newsLead.hidden = true;
      leadSlot.innerHTML = '';
      headlineList.innerHTML = '';
      latestBlock.hidden = list.length === 0;
      emptyEl.hidden = list.length !== 0;
      latestCount.textContent = list.length + '건';
      grid.innerHTML = list.map(cardHTML).join('');
      loadMore.hidden = true;
      statusEl.innerHTML = '검색어 “' + esc(state.q.trim()) + '” · <b>' + list.length + '</b>건';
    } else {
      newsLead.hidden = false;
      emptyEl.hidden = true;
      latestBlock.hidden = false;

      var lead = list[0];
      var heads = list.slice(1, 6);
      var rest = list.slice(6);

      leadSlot.innerHTML = lead ? leadHTML(lead) : '';
      newsLead.hidden = !lead;

      headlineList.innerHTML = heads.map(headlineHTML).join('');
      headlineCount.textContent = heads.length ? heads.length + '건' : '';
      newsLead.classList.toggle('is-single', !heads.length);

      grid.innerHTML = rest.slice(0, state.shown).map(cardHTML).join('');
      latestCount.textContent = list.length + '건';
      latestBlock.hidden = rest.length === 0;
      loadMore.hidden = state.shown >= rest.length;
      loadMore.textContent = '소식 더 보기 (' + Math.max(0, rest.length - state.shown) + ')';

      var where = state.tab === 'all' ? '전체' : CATS[state.tab].label;
      statusEl.innerHTML = '<b>' + list.length + '</b>개의 소식 · ' + esc(where);
    }

    requestAnimationFrame(function () {
      Array.prototype.forEach.call(grid.querySelectorAll('.reveal'), function (el) {
        el.classList.add('is-in');
      });
    });
    observeReveals(grid);
  }

  function paintCounts() {
    var counts = { all: ARTICLES.length };
    ARTICLES.forEach(function (a) { counts[a.cat] = (counts[a.cat] || 0) + 1; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
      var k = el.getAttribute('data-count');
      el.textContent = counts[k] || 0;
    });
  }

  function selectTab(key, focusTab) {
    state.tab = key;
    state.shown = PAGE;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on && focusTab) t.focus();
      if (on && !focusTab && t.parentElement) {
        var wrap = t.parentElement;
        wrap.scrollTo({ left: t.offsetLeft - (wrap.clientWidth - t.clientWidth) / 2, behavior: 'smooth' });
      }
    });
    render();
  }

  if (HUB) tabs.forEach(function (t) {
    t.addEventListener('click', function () { selectTab(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(next.getAttribute('data-tab'), true);
      }
    });
  });

  if (HUB) loadMore.addEventListener('click', function () {
    state.shown += PAGE;
    render();
  });

  if (HUB) searchInput.addEventListener('input', function () {
    state.q = searchInput.value;
    state.shown = PAGE;
    searchWrap.classList.toggle('has-value', !!searchInput.value);
    if (searchInput.value.trim() && state.tab !== 'all') {
      state.tab = 'all';
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.getAttribute('data-tab') === 'all' ? 'true' : 'false');
      });
    }
    render();
  });

  if (HUB) searchClear.addEventListener('click', function () {
    searchInput.value = '';
    state.q = '';
    state.shown = PAGE;
    searchWrap.classList.remove('has-value');
    render();
    searchInput.focus();
  });

  if (HUB) {
    render();

    /* 다른 페이지의 메뉴에서 index.html?tab=news#info 로 들어오면 그 분류를 펼칩니다. */
    var wantTab = '';
    try {
      wantTab = new URLSearchParams(window.location.search).get('tab') || '';
    } catch (e) { wantTab = ''; }
    if (wantTab && (wantTab === 'all' || CATS[wantTab])) selectTab(wantTab);
  }

  /* ----------------------------------------------------------------------
     3-b. 메인 '오늘의 브리핑' — 왼쪽 주요 브리핑 2건 + 오른쪽 분야별 1건씩
     (전체 목록·분류 탭·검색은 청소년 정보 아카이브 archive.html 이 맡는다)
     ---------------------------------------------------------------------- */
  var briefLead = byId('briefLead');
  var briefCats = byId('briefCats');

  /* 대표 브리핑으로 세울 소식 — 실제 수집·게시된 소식 중 최신 두 건을 세우고,
     실제 소식이 모자라면 시안 예시로 채웁니다. */
  var BRIEF_LEAD_IDS = (function () {
    var live = [], sample = [];
    ARTICLES.forEach(function (a) { (a.sample ? sample : live).push(a.id); });
    return live.concat(sample).slice(0, 2);
  })();
  var BRIEF_CAT_ORDER = ['news', 'paper', 'policy', 'benefit', 'edu'];

  function briefCardHTML(a) {
    var c = CATS[a.cat];
    return '' +
      '<article class="brief-card" data-article="' + esc(a.id) + '" tabindex="0" role="button" aria-label="' + esc(a.title) + ' — 소식 요약 보기">' +
        '<div class="brief-card__top">' +
          '<span class="chip ' + c.chip + '">' + esc(c.label) + '</span>' +
          (a.sample ? '<span class="chip chip--sample">시안 예시</span>' : '') +
        '</div>' +
        '<h4>' + esc(a.title) + '</h4>' +
        '<p class="brief-card__desc">' + esc(a.desc) + '</p>' +
        '<div class="brief-card__foot">' +
          '<span>' + esc(a.source) + '</span>' +
          '<span class="brief-card__more">자세히 보기 <span aria-hidden="true">→</span></span>' +
        '</div>' +
      '</article>';
  }

  function briefRowHTML(a) {
    var c = CATS[a.cat];
    return '' +
      '<li>' +
        '<a class="brief-row" href="archive.html?cat=' + encodeURIComponent(a.cat) + '">' +
          '<span class="chip ' + c.chip + '">' + esc(c.label) + '</span>' +
          '<span class="brief-row__title">' + esc(a.title) + '</span>' +
        '</a>' +
      '</li>';
  }

  if (briefLead) {
    briefLead.innerHTML = BRIEF_LEAD_IDS.map(articleById).filter(Boolean).map(briefCardHTML).join('');
  }
  if (briefCats) {
    briefCats.innerHTML = BRIEF_CAT_ORDER.map(function (k) {
      for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].cat === k) return briefRowHTML(ARTICLES[i]);
      return '';
    }).join('');
  }

  /* ----------------------------------------------------------------------
     3-d. 공지사항(notices.html) — assets/notices.js 의 GV_NOTICES 로 목록을 그린다
     (공지를 더하거나 고칠 때는 notices.js 배열만 손보면 된다)
     ---------------------------------------------------------------------- */
  function noticeHTML(n) {
    var meta = '<span class="chip">' + esc(n.tag) + '</span>' +
      (n.datetime
        ? '<time datetime="' + esc(n.datetime) + '">' + esc(n.date) + '</time>'
        : '<span>' + esc(n.date) + '</span>');
    var body = n.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var go = n.link
      ? '<a class="notice-card__go" href="' + esc(n.link.href) + '">' + esc(n.link.label) +
        ' <span aria-hidden="true">→</span></a>'
      : '';
    return '' +
      '<details class="notice-card reveal" data-notice="' + esc(n.id) + '">' +
        '<summary class="notice-card__head">' +
          '<span class="notice-card__meta">' + meta + '</span>' +
          '<span class="notice-card__title">' + esc(n.title) + '</span>' +
          '<span class="notice-card__lead">' + esc(n.lead) + '</span>' +
          '<span class="notice-card__toggle" aria-hidden="true"></span>' +
        '</summary>' +
        '<div class="notice-card__body">' + body + go + '</div>' +
      '</details>';
  }

  var noticeList = byId('noticeList');
  if (noticeList && window.GV_NOTICES && window.GV_NOTICES.length) {
    noticeList.innerHTML = window.GV_NOTICES.map(noticeHTML).join('');
    var noticeCount = byId('noticeCount');
    if (noticeCount) noticeCount.textContent = window.GV_NOTICES.length;
  }

  /* ----------------------------------------------------------------------
     3-c. 청소년 정보 아카이브(archive.html) — 분류 탭 + 키워드 검색 + 더 보기
     ---------------------------------------------------------------------- */
  var arcRoot = byId('archiveRoot');
  var ARC = !!(arcRoot && grid && statusEl && emptyEl && loadMore && searchInput && searchWrap && searchClear);

  if (ARC) {
    var ARC_PAGE = 9;
    var arcState = { tab: 'all', q: '', shown: ARC_PAGE };

    function arcList() {
      var q = arcState.q.trim().toLowerCase();
      return ARTICLES.filter(function (a) {
        var okTab = arcState.tab === 'all' || a.cat === arcState.tab;
        var hay = (a.title + ' ' + a.desc + ' ' + a.source + ' ' + CATS[a.cat].label).toLowerCase();
        return okTab && (!q || hay.indexOf(q) !== -1);
      });
    }

    /* 고른 분류를 주소에 남겨 그대로 공유·즐겨찾기할 수 있게 한다 */
    function syncArcUrl() {
      if (!window.history || !window.history.replaceState) return;
      var url = window.location.pathname +
        (arcState.tab === 'all' ? '' : '?cat=' + encodeURIComponent(arcState.tab));
      try { window.history.replaceState(null, '', url); } catch (e) {}
    }

    function paintArcTabs() {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.getAttribute('data-tab') === arcState.tab ? 'true' : 'false');
      });
    }

    function renderArchive() {
      var list = arcList();
      var q = arcState.q.trim();
      var rest = Math.max(0, list.length - arcState.shown);

      grid.innerHTML = list.slice(0, arcState.shown).map(cardHTML).join('');
      emptyEl.hidden = list.length !== 0;
      loadMore.hidden = rest === 0;
      loadMore.textContent = '소식 더 보기 (' + rest + ')';

      var where = arcState.tab === 'all' ? '전체' : CATS[arcState.tab].label;
      statusEl.innerHTML = '<b>' + list.length + '</b>건 · ' + esc(where) +
        (q ? ' · 검색어 “' + esc(q) + '”' : '');

      requestAnimationFrame(function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.reveal'), function (el) {
          el.classList.add('is-in');
        });
      });
      syncArcUrl();
    }

    function selectArcTab(key, focusTab) {
      arcState.tab = key;
      arcState.shown = ARC_PAGE;
      paintArcTabs();
      tabs.forEach(function (t) {
        if (focusTab && t.getAttribute('data-tab') === key) t.focus();
        if (!focusTab && t.getAttribute('data-tab') === key && t.parentElement) {
          var wrap = t.parentElement;
          wrap.scrollTo({ left: t.offsetLeft - (wrap.clientWidth - t.clientWidth) / 2, behavior: 'smooth' });
        }
      });
      renderArchive();
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { selectArcTab(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var i = tabs.indexOf(t);
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectArcTab(next.getAttribute('data-tab'), true);
      });
    });

    loadMore.addEventListener('click', function () {
      arcState.shown += ARC_PAGE;
      renderArchive();
    });

    searchInput.addEventListener('input', function () {
      arcState.q = searchInput.value;
      arcState.shown = ARC_PAGE;
      searchWrap.classList.toggle('has-value', !!searchInput.value);
      renderArchive();
    });

    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      arcState.q = '';
      arcState.shown = ARC_PAGE;
      searchWrap.classList.remove('has-value');
      renderArchive();
      searchInput.focus();
    });

    /* 메인 주제 칸이 보내는 archive.html?cat=policy 같은 주소로 바로 열기 */
    var wantCat = '';
    try {
      wantCat = new URLSearchParams(window.location.search).get('cat') || '';
    } catch (e) { wantCat = ''; }
    if (wantCat && CATS[wantCat]) arcState.tab = wantCat;

    paintArcTabs();
    renderArchive();
  }

  /* 분류별 개수를 화면의 [data-count] 자리에 채운다 (탭·메인 안내 문구 공통) */
  paintCounts();

  /* 메뉴·푸터에서 특정 분류로 바로 가기 */
  if (HUB) Array.prototype.forEach.call(document.querySelectorAll('[data-goto-tab]'), function (el) {
    el.addEventListener('click', function () {
      selectTab(el.getAttribute('data-goto-tab'));
      closeMobileMenu();
    });
  });

  /* 헤더의 검색 아이콘은 청소년 정보 아카이브로 가는 링크입니다(HTML). */

  /* ----------------------------------------------------------------------
     4. 모달 공통
     ---------------------------------------------------------------------- */
  var lastFocused = null;

  var confModal = byId('confModal');
  var newsModal = byId('newsModal');

  function trapFocus(e) {
    var open = (confModal && !confModal.hidden) ? confModal : ((newsModal && !newsModal.hidden) ? newsModal : null);
    if (!open) return;
    if (e.key === 'Tab') {
      var f = open.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function anyOpen() {
    return !!((confModal && !confModal.hidden) || (newsModal && !newsModal.hidden));
  }

  function openModal(el) {
    if (!el || anyOpen()) return;
    lastFocused = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    var closeBtn = el.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(el) {
    el.hidden = true;
    if (!anyOpen()) document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-open-modal]'), function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      closeMobileMenu();
      if (confModal) openModal(confModal);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal]'), function (btn) {
    btn.addEventListener('click', function () { if (confModal) closeModal(confModal); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-close-news]'), function (btn) {
    btn.addEventListener('click', function () { if (newsModal) closeModal(newsModal); });
  });

  if (confModal) confModal.addEventListener('click', function (e) { if (e.target === confModal) closeModal(confModal); });
  if (newsModal) newsModal.addEventListener('click', function (e) { if (e.target === newsModal) closeModal(newsModal); });

  /* 소식 상세 열기 */
  var LIVE_NOTE = '※ 위 ‘원문 기사 바로가기’에서 원문과 게시 일자를 확인하실 수 있습니다.';
  var SAMPLE_NOTE = '※ 이 카드는 정보 구조를 보여 드리기 위한 시안 예시입니다. 자동 수집 에이전트가 연결되면 ' +
    '실제 기사 원문과 게시 일자가 이 자리에 표시됩니다. 기관의 최신 소식은 위 ‘출처 기관 바로가기’에서 확인하실 수 있습니다.';

  function openNews(id) {
    var a = articleById(id);
    if (!a) return;
    var c = CATS[a.cat];
    var chip = byId('newsModalChip');
    chip.className = 'chip ' + c.chip;
    chip.textContent = c.label;
    byId('newsModalTitle').textContent = a.title;
    byId('newsModalDesc').textContent = a.desc;
    byId('newsModalSource').textContent = '출처 · ' + a.source;
    var link = byId('newsModalLink');
    link.href = a.url;
    link.textContent = a.sample ? '출처 기관 바로가기' : '원문 기사 바로가기';
    if (newsModal) {
      var badge = newsModal.querySelector('.chip--sample');
      if (badge) badge.hidden = !a.sample;
      var note = newsModal.querySelector('.news-modal__note');
      if (note) note.textContent = a.sample ? SAMPLE_NOTE : LIVE_NOTE;
    }
    openModal(newsModal);
  }

  Array.prototype.forEach.call(document.querySelectorAll('#info, #archiveRoot, #newsModal'), function (root) {
    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-article]');
      if (el) openNews(el.getAttribute('data-article'));
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target.closest('[data-article]');
      if (!el || el.tagName === 'BUTTON') return;
      e.preventDefault();
      openNews(el.getAttribute('data-article'));
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (confModal && !confModal.hidden) closeModal(confModal);
      else if (newsModal && !newsModal.hidden) closeModal(newsModal);
      else closeMobileMenu();
    }
    if (anyOpen()) trapFocus(e);
  });

  /* ----------------------------------------------------------------------
     5. 모바일 메뉴
     ---------------------------------------------------------------------- */
  var burger = byId('burger');
  var mobileMenu = byId('mobileMenu');

  function openMobileMenu() {
    /* 헤더가 sticky라서 스크롤 위치에 따라 헤더 아래 끝이 달라진다. 드로어를 그 바로 아래에 붙여
       상단 로고가 헤더에 가리지 않게 한다. */
    var header = document.querySelector('.site-header');
    if (header) {
      mobileMenu.style.top = Math.round(header.getBoundingClientRect().bottom) + 'px';
    }
    mobileMenu.hidden = false;
    requestAnimationFrame(function () { mobileMenu.classList.add('is-open'); });
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '메뉴 열기');
    if (!anyOpen()) document.body.style.overflow = '';
    window.setTimeout(function () {
      if (burger.getAttribute('aria-expanded') === 'false') mobileMenu.hidden = true;
    }, 200);
  }

  burger.addEventListener('click', function () {
    if (burger.getAttribute('aria-expanded') === 'true') closeMobileMenu();
    else openMobileMenu();
  });

  Array.prototype.forEach.call(mobileMenu.querySelectorAll('.mobile-group__title'), function (btn) {
    btn.addEventListener('click', function () {
      var g = btn.parentElement;
      var open = g.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function (a) {
    a.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1180) closeMobileMenu();
  });

  /* ----------------------------------------------------------------------
     6. 데스크톱 드롭다운 (클릭 + 키보드 + 마우스 오버)
     ---------------------------------------------------------------------- */
  var ddItems = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));

  function closeDropdowns(except) {
    ddItems.forEach(function (it) {
      if (it === except) return;
      it.classList.remove('is-open');
      var b = it.querySelector('.nav__link');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  ddItems.forEach(function (item) {
    var btn = item.querySelector('.nav__link');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      closeDropdowns(item);
    });
    item.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 980) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        closeDropdowns(item);
      }
    });
    item.addEventListener('mouseleave', function () {
      if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 980) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    Array.prototype.forEach.call(item.querySelectorAll('.dropdown a'), function (a) {
      a.addEventListener('click', function () {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  document.addEventListener('click', function () { closeDropdowns(null); });

  /* ----------------------------------------------------------------------
     8. 포스터 크게 보기 (컨퍼런스 페이지)
     ---------------------------------------------------------------------- */
  var posterModal = byId('posterModal');
  var zoomTriggers = document.querySelectorAll('[data-poster-zoom]');
  if (posterModal && zoomTriggers.length) {
    var lastZoomFocus = null;
    var zoomImg = posterModal.querySelector('img');

    function openPoster(src) {
      if (zoomImg && src) zoomImg.src = src;
      lastZoomFocus = document.activeElement;
      posterModal.hidden = false;
      document.body.classList.add('zoom-open');
      var closeBtn = posterModal.querySelector('[data-close-poster]');
      if (closeBtn) closeBtn.focus();
    }

    function closePoster() {
      posterModal.hidden = true;
      document.body.classList.remove('zoom-open');
      if (lastZoomFocus && lastZoomFocus.focus) lastZoomFocus.focus();
    }

    Array.prototype.forEach.call(zoomTriggers, function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var inner = el.querySelector('img');
        openPoster(el.getAttribute('data-zoom-src') || (inner ? inner.getAttribute('src') : ''));
      });
    });

    posterModal.addEventListener('click', function (e) {
      if (e.target === posterModal || (e.target.closest && e.target.closest('[data-close-poster]'))) closePoster();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !posterModal.hidden) closePoster();
    });
  }

  /* ----------------------------------------------------------------------
     7. 헤더 그림자 & 등장 애니메이션
     ---------------------------------------------------------------------- */
  var header = byId('siteHeader');
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var io = null;
  function observeReveals(root) {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(root.querySelectorAll('.reveal'), function (el) {
        el.classList.add('is-in');
      });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    Array.prototype.forEach.call(root.querySelectorAll('.reveal:not(.is-in)'), function (el) {
      io.observe(el);
    });
  }
  observeReveals(document);
})();

/* ==========================================================================
   히어로 사진 모자이크 — 지포커스 사역 현장 사진
   · 사진을 바꾸려면 아래 HERO_PHOTOS 목록만 고치면 됩니다.
     (assets/images/gallery/ 에 {이름}.jpg(1600) · {이름}-800.jpg · {이름}-400.jpg 세 판본)
   · scene 이 같은 사진은 한 칸에서 연달아 나오지 않습니다(같은 장면 연속 컷 방지).
   · needsLarge: true 인 사진(글자가 들어간 사진)은 큰 칸에만 나옵니다.
   · 칸 하나가 사진을 바꾸는 간격 = INTERVAL_MS, 겹쳐 바뀌는 시간 = FADE_MS
     (FADE_MS는 styles.css 의 --mosaic-fade 와 같게 맞춥니다)
   ========================================================================== */
(function () {
  'use strict';


  var HERO_PHOTOS = [
    { src: 'assets/images/gallery/gfocus-stand-group.jpg', srcset: 'assets/images/gallery/gfocus-stand-group-400.jpg 400w, assets/images/gallery/gfocus-stand-group-800.jpg 800w, assets/images/gallery/gfocus-stand-group.jpg 1600w', w: 1600, scene: 'stand', caption: 'STAND 비전 수련회 단체사진', priority: true },
    { src: 'assets/images/gallery/gfocus-prayer-1.jpg', srcset: 'assets/images/gallery/gfocus-prayer-1-400.jpg 400w, assets/images/gallery/gfocus-prayer-1-800.jpg 800w, assets/images/gallery/gfocus-prayer-1.jpg 1600w', w: 1600, scene: 'prayer', caption: '안수 기도', priority: true },
    { src: 'assets/images/gallery/gfocus-worship-panorama.jpg', srcset: 'assets/images/gallery/gfocus-worship-panorama-400.jpg 359w, assets/images/gallery/gfocus-worship-panorama-800.jpg 718w, assets/images/gallery/gfocus-worship-panorama.jpg 1435w', w: 1435, scene: 'worship', caption: '찬양하는 집회 전경', priority: true },
    { src: 'assets/images/gallery/gfocus-lecture-banner.jpg', srcset: 'assets/images/gallery/gfocus-lecture-banner-400.jpg 400w, assets/images/gallery/gfocus-lecture-banner-800.jpg 800w, assets/images/gallery/gfocus-lecture-banner.jpg 1600w', w: 1600, scene: 'lecture', caption: '강당 강의', priority: true },
    { src: 'assets/images/gallery/gfocus-media-team.jpg', srcset: 'assets/images/gallery/gfocus-media-team-400.jpg 359w, assets/images/gallery/gfocus-media-team-800.jpg 718w, assets/images/gallery/gfocus-media-team.jpg 1435w', w: 1435, scene: 'media', caption: '미디어 중계팀', priority: true },
    { src: 'assets/images/gallery/gfocus-counsel-group.jpg', srcset: 'assets/images/gallery/gfocus-counsel-group-400.jpg 400w, assets/images/gallery/gfocus-counsel-group-800.jpg 800w, assets/images/gallery/gfocus-counsel-group.jpg 1600w', w: 1600, scene: 'counsel', caption: '청소년을 위한 무료 상담소 운영', priority: true },
    { src: 'assets/images/gallery/gfocus-counsel-indoor.jpg', srcset: 'assets/images/gallery/gfocus-counsel-indoor-400.jpg 400w, assets/images/gallery/gfocus-counsel-indoor-800.jpg 800w, assets/images/gallery/gfocus-counsel-indoor.jpg 1600w', w: 1600, scene: 'counsel', caption: '무료 상담소 상담 장면', priority: true },
    { src: 'assets/images/gallery/gfocus-counsel-booth.jpg', srcset: 'assets/images/gallery/gfocus-counsel-booth-400.jpg 400w, assets/images/gallery/gfocus-counsel-booth-800.jpg 800w, assets/images/gallery/gfocus-counsel-booth.jpg 1600w', w: 1600, scene: 'counsel', caption: '야외 무료 상담 부스', priority: true },
    { src: 'assets/images/gallery/gfocus-forest-group.jpg', srcset: 'assets/images/gallery/gfocus-forest-group-400.jpg 400w, assets/images/gallery/gfocus-forest-group-800.jpg 800w, assets/images/gallery/gfocus-forest-group.jpg 1120w', w: 1120, scene: 'forest', caption: '숲속 단체사진' },
    { src: 'assets/images/gallery/gfocus-stage-band.jpg', srcset: 'assets/images/gallery/gfocus-stage-band-400.jpg 400w, assets/images/gallery/gfocus-stage-band-800.jpg 800w, assets/images/gallery/gfocus-stage-band.jpg 1600w', w: 1600, scene: 'worship', caption: '무대 밴드 찬양', priority: true },
    { src: 'assets/images/gallery/gfocus-sled-tube.jpg', srcset: 'assets/images/gallery/gfocus-sled-tube-400.jpg 359w, assets/images/gallery/gfocus-sled-tube-800.jpg 718w, assets/images/gallery/gfocus-sled-tube.jpg 1435w', w: 1435, scene: 'sled', caption: '눈썰매장' },
    { src: 'assets/images/gallery/gfocus-party.jpg', srcset: 'assets/images/gallery/gfocus-party-400.jpg 359w, assets/images/gallery/gfocus-party-800.jpg 718w, assets/images/gallery/gfocus-party.jpg 1435w', w: 1435, scene: 'party', caption: '친교 시간' },
    { src: 'assets/images/gallery/gfocus-lecture-christian.jpg', srcset: 'assets/images/gallery/gfocus-lecture-christian-400.jpg 400w, assets/images/gallery/gfocus-lecture-christian-800.jpg 800w, assets/images/gallery/gfocus-lecture-christian.jpg 1600w', w: 1600, scene: 'lecture', caption: '강당 강의', priority: true },
    { src: 'assets/images/gallery/gfocus-band-vocal-1.jpg', srcset: 'assets/images/gallery/gfocus-band-vocal-1-400.jpg 400w, assets/images/gallery/gfocus-band-vocal-1-800.jpg 800w, assets/images/gallery/gfocus-band-vocal-1.jpg 1600w', w: 1600, scene: 'band', caption: '밴드 보컬 연습' },
    { src: 'assets/images/gallery/gfocus-band-drum.jpg', srcset: 'assets/images/gallery/gfocus-band-drum-400.jpg 400w, assets/images/gallery/gfocus-band-drum-800.jpg 800w, assets/images/gallery/gfocus-band-drum.jpg 1600w', w: 1600, scene: 'band', caption: '드럼 연습' },
    { src: 'assets/images/gallery/gfocus-prayer-2.jpg', srcset: 'assets/images/gallery/gfocus-prayer-2-400.jpg 400w, assets/images/gallery/gfocus-prayer-2-800.jpg 800w, assets/images/gallery/gfocus-prayer-2.jpg 1600w', w: 1600, scene: 'prayer', caption: '안수 기도', priority: true },
    { src: 'assets/images/gallery/gfocus-prayer-3.jpg', srcset: 'assets/images/gallery/gfocus-prayer-3-400.jpg 400w, assets/images/gallery/gfocus-prayer-3-800.jpg 800w, assets/images/gallery/gfocus-prayer-3.jpg 1600w', w: 1600, scene: 'prayer', caption: '안수 기도', priority: true },
    { src: 'assets/images/gallery/gfocus-sled-group-1.jpg', srcset: 'assets/images/gallery/gfocus-sled-group-1-400.jpg 400w, assets/images/gallery/gfocus-sled-group-1-800.jpg 800w, assets/images/gallery/gfocus-sled-group-1.jpg 1600w', w: 1600, scene: 'sled', caption: '눈썰매장 단체사진' },
    { src: 'assets/images/gallery/gfocus-sled-group-2.jpg', srcset: 'assets/images/gallery/gfocus-sled-group-2-400.jpg 400w, assets/images/gallery/gfocus-sled-group-2-800.jpg 800w, assets/images/gallery/gfocus-sled-group-2.jpg 1600w', w: 1600, scene: 'sled', caption: '눈썰매장 단체사진' },
    { src: 'assets/images/gallery/gfocus-conference-stand.jpg', srcset: 'assets/images/gallery/gfocus-conference-stand-400.jpg 359w, assets/images/gallery/gfocus-conference-stand-800.jpg 718w, assets/images/gallery/gfocus-conference-stand.jpg 1435w', w: 1435, scene: 'conference', caption: 'STAND 비전컨퍼런스 강의', needsLarge: true },
    { src: 'assets/images/gallery/gfocus-conference-wide.jpg', srcset: 'assets/images/gallery/gfocus-conference-wide-400.jpg 400w, assets/images/gallery/gfocus-conference-wide-800.jpg 800w, assets/images/gallery/gfocus-conference-wide.jpg 1600w', w: 1600, scene: 'conference', caption: '강당 강의 전경', needsLarge: true }
  ];

  var INTERVAL_MS = 6000;   /* 칸 하나가 다음 사진으로 바뀌는 간격 (칸이 많아 길게) */
  var FADE_MS = 900;        /* 크로스페이드 길이 */

  var root = document.querySelector('[data-hero-mosaic]');
  if (!root || !HERO_PHOTOS.length) return;

  /* 움직임 줄이기를 켠 분에게는 정지된 모자이크(HTML에 있는 사진) 그대로 둔다. */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* 화면에서 감춘 칸(모바일 5칸 배치 등)은 빼고 돌린다 */
  var cellEls = Array.prototype.slice.call(root.querySelectorAll('.mosaic__cell')).filter(function (el) {
    return el.getClientRects().length > 0;
  });
  if (!cellEls.length) return;

  var rootRect = root.getBoundingClientRect();
  var rects = cellEls.map(function (el) { return el.getBoundingClientRect(); });
  var areas = rects.map(function (r) { return r.width * r.height; });
  var maxArea = Math.max.apply(null, areas);

  var cells = cellEls.map(function (el, ci) {
    var base = el.querySelector('img');
    var baseId = base && base.getAttribute('data-photo') !== null ? parseInt(base.getAttribute('data-photo'), 10) : 0;
    var isLarge = areas[ci] >= maxArea * 0.5;   /* 큰 칸에만 글자 들어간 사진 */
    /* 왼쪽(글자 뒤) 칸은 어두워서 사진이 거의 안 보인다 → 사역 장면 사진은 피한다 */
    var centerX = (rects[ci].left + rects[ci].width / 2 - rootRect.left) / (rootRect.width || 1);
    var isDim = window.innerWidth > 900 && centerX < 0.42;
    var pool = [];
    HERO_PHOTOS.forEach(function (p, i) {
      if (i === baseId) { pool.push(i); return; }
      if (p.needsLarge && !isLarge) return;
      if (isDim && p.priority) return;
      pool.push(i);
    });
    var layers = {};
    if (base) {
      base.classList.remove('is-top');
      base.classList.add('is-active');
      layers[baseId] = base;
    }
    return { el: el, pool: pool, layers: layers, cur: baseId, timer: null };
  });

  /* 사진 한 장을 그 칸에 올린다 (이미 있으면 그대로) — 처음 쓰일 때 받아 온다 */
  function layerFor(cell, id) {
    if (cell.layers[id]) return cell.layers[id];
    var p = HERO_PHOTOS[id];
    var img = document.createElement('img');
    img.decoding = 'async';
    img.alt = p.caption || '';
    img.setAttribute('data-photo', String(id));
    img.sizes = Math.round(cell.el.getBoundingClientRect().width) + 'px';
    img.srcset = p.srcset;
    img.src = p.src;
    cell.el.appendChild(img);
    cell.layers[id] = img;
    return img;
  }

  /* 다음 사진 고르기 — 다른 칸이 보여 주는 사진과 같은 장면의 사진은 피한다 */
  function nextId(cell) {
    var used = {};
    cells.forEach(function (c) {
      if (c !== cell) used[c.cur] = true;
    });
    var pool = cell.pool;
    var n = pool.length;
    var start = pool.indexOf(cell.cur);
    var curScene = HERO_PHOTOS[cell.cur].scene;
    var k, id;

    for (k = 1; k <= n; k++) {
      id = pool[(start + k) % n];
      if (!used[id] && HERO_PHOTOS[id].scene !== curScene) return id;
    }
    for (k = 1; k <= n; k++) {
      id = pool[(start + k) % n];
      if (!used[id]) return id;
    }
    return pool[(start + 1) % n];
  }

  function advance(cell) {
    var id = nextId(cell);
    var cur = cell.layers[cell.cur];
    var nxt = layerFor(cell, id);
    cell.cur = id;

    var started = false;
    function go() {
      if (started) return;
      started = true;
      nxt.classList.add('is-top');
      window.setTimeout(function () {
        if (cur && cur !== nxt) {
          cur.classList.remove('is-active');
          cur.classList.remove('is-top');
        }
        nxt.classList.remove('is-top');
        nxt.classList.add('is-active');
      }, FADE_MS + 60);
    }
    if (nxt.complete && nxt.naturalWidth) go();
    else {
      nxt.addEventListener('load', go);
      nxt.addEventListener('error', go);
      window.setTimeout(go, 1800);
    }

    /* 다음 차례 사진을 미리 받아 둔다 (바뀔 때 기다리지 않게) */
    window.setTimeout(function () { layerFor(cell, nextId(cell)); }, FADE_MS + 100);
  }

  var running = false;

  function runCell(cell, delay) {
    window.clearTimeout(cell.timer);
    cell.timer = window.setTimeout(function loop() {
      advance(cell);
      cell.timer = window.setTimeout(loop, INTERVAL_MS);
    }, delay);
  }

  function start() {
    if (running) return;
    running = true;
    var stagger = Math.round(INTERVAL_MS / cells.length);   /* 칸마다 시차 */
    /* 첫 화면은 잠깐 그대로 두고(3초), 그 뒤부터 한 칸뿐씩 바뀐다 */
    var first = 3000;
    cells.forEach(function (cell, i) { runCell(cell, first + i * stagger); });
  }

  function stop() {
    running = false;
    cells.forEach(function (cell) {
      window.clearTimeout(cell.timer);
      cell.timer = null;
    });
  }

  /* 화면 밖으로 나가거나 탭이 가려지면 멈춰서 배터리·CPU를 아낀다 */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0 }).observe(root.closest('.hero') || root);
  }

  /* 첫 사진이 다 받아진 뒤에 시작 (늦어도 2초 뒤) */
  var began = false;
  function begin() {
    if (began) return;
    began = true;
    if (!document.hidden) start();
  }

  var bases = cells.map(function (c) { return c.layers[c.cur]; }).filter(Boolean);
  var pending = bases.length;
  if (!pending) begin();
  else {
    bases.forEach(function (img) {
      function one() {
        pending -= 1;
        if (pending <= 0) begin();
      }
      if (img.complete && img.naturalWidth > 0) one();
      else {
        img.addEventListener('load', one);
        img.addEventListener('error', one);
      }
    });
    window.setTimeout(begin, 2000);
  }
})();
