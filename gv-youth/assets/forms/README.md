# 신청서 파일 자리 (assets/forms)

목사님이 만들어 주시는 신청서 두 개를 아래 이름 그대로 이 폴더에 넣으면
컨퍼런스 페이지의 「신청서 내려받기」 버튼이 바로 살아납니다.

| 파일 이름 | 연결된 컨퍼런스 | 페이지 |
|---|---|---|
| `bible-conference-application.hwp` | 제46차 청소년 바이블컨퍼런스 (2027.1.14–16 · 승동기도원) | `bible-conference.html` |
| `vision-conference-application.hwp` | 비전컨퍼런스 | `vision-conference.html` |

## 파일을 넣은 뒤 할 일 (페이지 담당)

각 페이지의 `.apply-card` 에서
`aria-disabled="true" tabindex="-1"` 두 속성을 지우고,
`<span class="apply-card__state">서류 준비 중 · 곧 올라갑니다</span>` 한 줄을 지웁니다.
그러면 카드가 링크로 동작하고 `download` 속성으로 바로 내려받힙니다.

> 파일이 없는 지금은 어떤 더미 파일도 두지 않았습니다. 페이지에서는 버튼이 '준비 중' 상태로 잠겨 있습니다.
