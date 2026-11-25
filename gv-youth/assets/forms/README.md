# 신청서 파일 자리 (assets/forms)

컨퍼런스 페이지의 「신청서 내려받기」 카드가 이 폴더의 파일을 가리킵니다.

| 파일 이름 | 파일 | 연결된 페이지 | 상태 |
|---|---|---|---|
| `bible-conference-application.hwpx` | 2027 제46차 바이블컨퍼런스 **교회**참가신청서 (1쪽, 20명 칸, 0.3MB) | `bible-conference.html` | 2026-11-25 게시 → 같은 날 밤 목사님 최신본(HWPX)으로 교체 |
| `bible-conference-staff-application.hwpx` | 2027 제46차 바이블컨퍼런스 **스탭**참가신청서 (1쪽, 0.3MB) | `bible-conference.html` | 2026-11-25 게시 → 같은 날 밤 목사님 최신본(HWPX)으로 교체 |
| `vision-conference-application.hwp` | 비전컨퍼런스 참가신청서 | `vision-conference.html` | 아직 없음 (준비 중) |

교회용은 처음 올린 HWP(2쪽·26명 칸·8.1MB)를 걷어 내고, 목사님이 보내신 HWPX(1쪽·20명 칸)로 바꿨습니다.
20명이 넘는 교회는 같은 신청서를 한 장 더 작성한다는 안내가 신청서 안에 들어 있습니다.
스탭용도 HWP(1쪽·1.0MB)에서 HWPX(1쪽·0.3MB)로 바뀌었습니다.

웹에 올린 사본은 목사님이 보내신 원본과 바이트까지 같습니다(md5 일치).
- 교회용 `57f3a51662da6ea0fddcd59d5062ffd9`
- 스탭용 `b199a60b131db7cfb18bc05ca7f73ba9`

## 카드가 '준비 중'으로 잠겨 있을 때

각 페이지의 `.bc-apply__card` 에서
`aria-disabled="true" tabindex="-1"` 두 속성을 지우고,
`<span class="bc-apply__state">서류 준비 중 · 곧 올라갑니다</span>` 한 줄을
`<span class="bc-apply__meta">내려받기 · N쪽 · N.NMB</span>` 로 바꿉니다.
그러면 카드가 링크로 동작하고 `download` 속성으로 바로 내려받힙니다.

> `download="…"` 값에 한글 파일 이름을 넣어 두어서, 내려받으면
> `2027_제46차_바이블컨퍼런스_교회참가신청서.hwpx` 처럼 원래 이름으로 저장됩니다.
