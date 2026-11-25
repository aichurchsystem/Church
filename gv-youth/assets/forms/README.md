# 신청서 파일 자리 (assets/forms)

컨퍼런스 페이지의 「신청서 내려받기」 카드가 이 폴더의 파일을 가리킵니다.

| 파일 이름 | 파일 | 연결된 페이지 | 상태 |
|---|---|---|---|
| `bible-conference-application.hwp` | 2027 제46차 바이블컨퍼런스 **교회**참가신청서 (2쪽, 8.1MB) | `bible-conference.html` | 2026-11-25 게시 |
| `bible-conference-staff-application.hwp` | 2027 제46차 바이블컨퍼런스 **스탭**참가신청서 (1쪽, 1.0MB) | `bible-conference.html` | 2026-11-25 게시 |
| `vision-conference-application.hwp` | 비전컨퍼런스 참가신청서 | `vision-conference.html` | 아직 없음 (준비 중) |

원본은 `documents/bible-conference-46-forms/`에서 온 파일이고, 웹에 올린 사본은 바이트까지 같습니다(md5 일치).

## 카드가 '준비 중'으로 잠겨 있을 때

각 페이지의 `.bc-apply__card` 에서
`aria-disabled="true" tabindex="-1"` 두 속성을 지우고,
`<span class="bc-apply__state">서류 준비 중 · 곧 올라갑니다</span>` 한 줄을
`<span class="bc-apply__meta">내려받기 · N쪽 · N.NMB</span>` 로 바꿉니다.
그러면 카드가 링크로 동작하고 `download` 속성으로 바로 내려받힙니다.

> `download="…"` 값에 한글 파일 이름을 넣어 두어서, 내려받으면
> `2027_제46차_바이블컨퍼런스_교회참가신청서.hwp` 처럼 원래 이름으로 저장됩니다.
