/* 박재용 목사님 전자명함 — 공통 동작 (5종 시안 공용)
   연락처 저장(vCard) · 팩스번호 복사 · QR 확대 · 주소 복사 · 토스트 */
(function () {
  "use strict";

  var META = document.querySelector('meta[name="card-url"]');
  var CARD_URL = (META && META.content) || "https://aichurchsystem.github.io/Church/card/";
  var FAX = "02-429-1319";

  var VCF = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:박;재용;;;",
    "FN:박재용",
    "ORG:글로벌비전교회",
    "TITLE:담임목사",
    "ROLE:Senior Pastor",
    "TEL;TYPE=CELL,VOICE:+821053283683",
    "TEL;TYPE=WORK,VOICE:+8224291318",
    "TEL;TYPE=WORK,FAX:+8224291319",
    "EMAIL;TYPE=WORK,INTERNET:pjy53283683@gmail.com",
    "ADR;TYPE=WORK:;;서울 광진구 구의강변로3가길 33 상가 2층;서울특별시;;;대한민국",
    "URL:" + CARD_URL,
    "NOTE:박재용 Th.D · 글로벌비전교회 담임목사",
    "END:VCARD"
  ].join("\r\n") + "\r\n";

  var toastEl = document.querySelector("[data-toast]");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.setAttribute("data-show", "true");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.setAttribute("data-show", "false"); }, 2300);
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); },
        function () { legacyCopy(text, okMsg); });
      return;
    }
    legacyCopy(text, okMsg);
  }
  function legacyCopy(text, okMsg) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      toast(ok ? okMsg : text);
    } catch (e) {
      toast(text);
    }
  }

  // ── 연락처 저장 ──────────────────────────────
  Array.prototype.forEach.call(document.querySelectorAll("[data-save]"), function (btn) {
    btn.addEventListener("click", function () {
      // 카카오톡·인스타그램 등 인앱 브라우저는 blob 내려받기를 막는 경우가 많아
      // 정적 .vcf 파일로 넘깁니다.
      if (/KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\//i.test(navigator.userAgent)) {
        toast("연락처 파일을 여는 중입니다");
        window.location.href = "parkjaeyong.vcf";
        return;
      }
      try {
        var blob = new Blob(["\ufeff" + VCF], { type: "text/vcard;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "박재용_글로벌비전교회.vcf";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          if (a.parentNode) a.parentNode.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
        toast("연락처 파일을 내려받았습니다");
      } catch (e) {
        window.location.href = "parkjaeyong.vcf";
      }
    });
  });

  // ── 팩스 번호 복사 ───────────────────────────
  Array.prototype.forEach.call(document.querySelectorAll("[data-fax]"), function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      copyText(FAX, "팩스 번호를 복사했습니다");
    });
  });

  // ── QR 확대 ─────────────────────────────────
  var modal = document.querySelector("[data-qr-modal]");
  var lastFocus = null;
  function openQr() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.setAttribute("data-open", "true");
    var c = modal.querySelector("[data-close-qr]");
    if (c) c.focus();
    document.documentElement.style.overflow = "hidden";
  }
  function closeQr() {
    if (!modal) return;
    modal.setAttribute("data-open", "false");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-qr]"), function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openQr(); });
  });
  if (modal) {
    var closer = modal.querySelector("[data-close-qr]");
    if (closer) closer.addEventListener("click", closeQr);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeQr(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.getAttribute("data-open") === "true") closeQr();
    });
  }

  // ── 주소 복사 ───────────────────────────────
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy-url]"), function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      copyText(CARD_URL, "주소를 복사했습니다");
    });
  });

  // 화면 높이에 맞춘 축소 (아주 작은 화면에서 스크롤 방지)
  function fit() {
    var page = document.querySelector("[data-fit]");
    if (!page) return;
    page.style.zoom = "";
    var over = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (over > 0 && document.documentElement.scrollHeight > 0) {
      var z = Math.max(0.82, 1 - over / document.documentElement.scrollHeight - 0.005);
      page.style.zoom = z;
    }
  }
  window.addEventListener("load", fit);
  window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
