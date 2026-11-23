import json
import sys
from playwright.sync_api import sync_playwright

URL = "file:///workspace/work/Church/gv-youth/index.html"
tag = sys.argv[1] if len(sys.argv) > 1 else "before"

VIEWS = [
    ("desktop", 1440, 900),
    ("mobile", 390, 844),
]

out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, w, h in VIEWS:
        pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        pg.goto(URL, wait_until="load")
        pg.wait_for_timeout(1200)
        info = pg.evaluate(
            """() => {
          const r = (s) => { const e = document.querySelector(s); if (!e) return null;
            const b = e.getBoundingClientRect(); return {top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), height: Math.round(b.height), width: Math.round(b.width)}; };
          const stats = document.querySelectorAll('.hero__stats > li');
          const cards = [...document.querySelectorAll('.hero__stats > li')].map(li => Math.round(li.getBoundingClientRect().height));
          return {
            docHeight: Math.round(document.documentElement.scrollHeight),
            header: r('header'), hero: r('.hero'), inner: r('.hero__inner'),
            statsWrap: r('.hero__stats-wrap'), statsGrid: r('.hero__stats'),
            briefing: r('.briefing'), ministryOld: r('#ministryTitle'),
            cells: stats.length, cellHeights: cards,
            vh: window.innerHeight
          };
        }"""
        )
        out[name] = info
        pg.screenshot(path=f"/workspace/work/Church/gv-youth/_preview/{tag}-{name}.png", full_page=False)
        pg.screenshot(path=f"/workspace/work/Church/gv-youth/_preview/{tag}-{name}-full.png", full_page=True)
        pg.close()
    b.close()
print(json.dumps(out, ensure_ascii=False, indent=1))
