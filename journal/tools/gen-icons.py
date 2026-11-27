#!/usr/bin/env python3
"""목회일지 앱 아이콘 생성기 — 2026-11-27 교회 로고에서 목회일지 심볼로 교체하며 새로 작성.
   심볼: 크림색 일지 페이지 + 금색 책등 + 금색 십자가 + 남색 글줄 (남색 바탕 위)
   100x100 좌표계로 그리고 4배 슈퍼샘플링한 뒤 줄여서 매끄럽게 만든다.
   사용: python3 tools/gen-icons.py [출력폴더]   (기본: journal/icons)
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter

S = 4
NAVY, NAVY2 = (10, 16, 23), (20, 31, 44)
GOLD, GOLD_D = (232, 176, 75), (188, 133, 45)
CREAM, INK = (247, 240, 226), (36, 49, 66)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'icons')
ASSE = os.path.join(HERE, '..', 'assets')

class C:
    def __init__(self, size):
        self.size, self.k = size, size * S / 100.0
        self.im = Image.new('RGBA', (size*S, size*S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)
    def rrect(self, box, r, fill):
        x0, y0, x1, y1 = box
        self.d.rounded_rectangle([x0*self.k, y0*self.k, x1*self.k, y1*self.k], radius=r*self.k, fill=fill)

def symbol(c):
    c.rrect((22, 11, 78, 89), 9, CREAM)                     # 페이지
    c.rrect((22, 11, 32.5, 89), 9, GOLD)                    # 책등
    c.rrect((27.5, 11, 32.5, 89), 0, GOLD)
    vw, hw, vt, ht, hh = 8.8, 29, 21.5, 34.6, 8.8           # 십자가
    c.rrect((50-vw/2, vt, 50+vw/2, vt+37.5), 2.4, GOLD)
    c.rrect((50-hw/2, ht, 50+hw/2, ht+hh), 2.4, GOLD)
    for i, (x0, x1) in enumerate([(41, 69), (41, 63), (41, 54)]):   # 글줄
        c.rrect((x0, 66.5+i*8.2, x1, 66.5+i*8.2+3.2), 1.6, INK)

def bg(size):
    w = size*S
    im = Image.new('RGB', (w, w), NAVY)
    d = ImageDraw.Draw(im)
    for i in range(w):
        t = i / w
        d.line([(0, i), (w, i)], fill=tuple(int(NAVY[j] + (NAVY2[j]-NAVY[j]) * (1-t)**1.3) for j in range(3)))
    glow = Image.new('L', (w, w), 0)
    r = int(w*0.60)
    ImageDraw.Draw(glow).ellipse([int(w*0.55)-r, int(w*0.68)-r, int(w*0.55)+r, int(w*0.68)+r], fill=62)
    glow = glow.filter(ImageFilter.GaussianBlur(w*0.11))
    return Image.composite(Image.new('RGB', (w, w), GOLD), im, glow.point(lambda v: int(v*0.36)))

def compose(size, scale, transparent=False, radius=0.0):
    cc = C(size); symbol(cc)
    inner = max(1, int(size*S*scale))
    sym = cc.im.resize((inner, inner), Image.LANCZOS)
    canvas = Image.new('RGBA', (size*S, size*S), (0, 0, 0, 0)) if transparent else bg(size).convert('RGBA')
    off = (size*S - inner)//2
    canvas.alpha_composite(sym, (off, off))
    im = canvas.resize((size, size), Image.LANCZOS)
    if radius:
        m = Image.new('L', (size*4, size*4), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, size*4-1, size*4-1], radius=int(size*4*radius), fill=255)
        im.putalpha(m.resize((size, size), Image.LANCZOS))
    return im

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    compose(192, 0.86).convert('RGB').save(os.path.join(OUT, 'icon-192.png'))
    compose(512, 0.86).convert('RGB').save(os.path.join(OUT, 'icon-512.png'))
    compose(192, 0.78).convert('RGB').save(os.path.join(OUT, 'maskable-192.png'))
    compose(512, 0.78).convert('RGB').save(os.path.join(OUT, 'maskable-512.png'))
    compose(180, 0.80).convert('RGB').save(os.path.join(OUT, 'apple-180.png'))
    compose(32, 0.94, radius=0.22).save(os.path.join(OUT, 'favicon-32.png'))
    compose(64, 0.90, radius=0.20).save(os.path.join(OUT, 'favicon-64.png'))
    compose(192, 0.86, radius=0.225).save(os.path.join(OUT, 'icon-preview.png'))
    mk = compose(512, 1.0, transparent=True)
    bb = mk.getbbox(); pad = int((bb[2]-bb[0])*0.02)
    mk.crop((max(0, bb[0]-pad), max(0, bb[1]-pad), bb[2]+pad, bb[3]+pad)).save(os.path.join(ASSE, 'journal-mark.png'))
    print('아이콘 생성 완료:', os.path.abspath(OUT))
