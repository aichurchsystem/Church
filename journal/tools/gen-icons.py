from PIL import Image, ImageDraw, ImageFilter
import os
SRC='/workspace/output/썸네일/20261126-시안/assets/gvch-logo.png'
OUT='/workspace/work/Church/journal/icons'
os.makedirs(OUT,exist_ok=True)
NAVY=(10,16,23); GOLD=(232,176,75)
_base=Image.open(SRC).convert('RGBA').crop((10,25,125,155))
bb=_base.split()[-1].getbbox(); logo=_base.crop(bb)          # 심볼만, 여백 제거
def canvas(size, radius=0):
    im=Image.new('RGBA',(size,size),(0,0,0,0))
    d=ImageDraw.Draw(im); d.rounded_rectangle([0,0,size-1,size-1],radius=radius,fill=NAVY+(255,))
    # 위쪽 은은한 남색 광, 아래쪽 금색 광
    g=Image.new('RGBA',(size,size),(0,0,0,0)); gd=ImageDraw.Draw(g)
    gd.ellipse([-size*0.3,-size*0.5,size*1.0,size*0.55],fill=(38,64,110,110))
    gd.ellipse([size*0.1,size*0.55,size*1.2,size*1.35],fill=GOLD+(70,))
    g=g.filter(ImageFilter.GaussianBlur(size*0.16))
    mask=Image.new('L',(size,size),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,size-1,size-1],radius=radius,fill=255)
    im.alpha_composite(Image.composite(g,Image.new('RGBA',(size,size),(0,0,0,0)),mask))
    return im
def place(im, ratio, size):
    s=int(size*ratio); w=round(logo.width*s/logo.height)
    sym=logo.resize((w,s),Image.LANCZOS)
    # 그림자
    sh=Image.new('RGBA',(size,size),(0,0,0,0))
    sh.paste((0,0,0,110),( (size-w)//2+max(1,size//160), (size-s)//2+max(1,size//110)), sym)
    sh=sh.filter(ImageFilter.GaussianBlur(size*0.02))
    im.alpha_composite(sh)
    im.alpha_composite(sym,((size-w)//2,(size-s)//2)); return im
for s in (192,512):
    place(canvas(s),0.70,s).convert('RGB').save(f'{OUT}/icon-{s}.png')
for s in (192,512):
    place(canvas(s),0.56,s).convert('RGB').save(f'{OUT}/maskable-{s}.png')
place(canvas(180),0.70,180).convert('RGB').save(f'{OUT}/apple-180.png')
for s in (32,64):
    place(canvas(s,radius=int(s*0.24)),0.80,s).save(f'{OUT}/favicon-{s}.png')
place(canvas(512),0.62,512).resize((192,192),Image.LANCZOS).save(f'{OUT}/icon-preview.png')
print('ok')
