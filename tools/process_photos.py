# -*- coding: utf-8 -*-
# 一次性素材处理：裁掉右下角「AI生成」水印、转为 JPG、重命名到 assets/img/
import os
from PIL import Image

GEN = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img', 'gen')
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')

MAP = {
    'Black_and_white_fine_art_museu_2026-10-03T18-12-57.png': 'hero-h1.jpg',   # 博物馆藏瓶
    'Black_and_white_documentary_ph_2026-10-03T18-12-56.png': 'hero-h2.jpg',   # 馒头窑址
    'Black_and_white_macro_photogra_2026-10-03T18-12-57.png': 'hero-h3.jpg',   # 瓷片特写
    'Black_and_white_photography__t_2026-10-03T18-13-30.png': 'hero-h4.jpg',   # 匣钵堆
    'Black_and_white_documentary_ph_2026-10-03T18-13-25.png': 'hero-h5.jpg',   # 施化妆土
    'Black_and_white_close_up_photo_2026-10-03T18-13-25.png': 'cat-plant.jpg', # 植物装饰·牡丹
    'Black_and_white_close_up_photo_2026-10-03T18-13-36.png': 'cat-figure.jpg',# 人物装饰·婴戏
    'Black_and_white_documentary_ph_2026-10-03T18-14-05.png': 'craft-kiln.jpg',# 窑址拱门(竖)
    'Black_and_white_photography__a_2026-10-03T18-14-04.png': 'craft-wheel.jpg',
    'Black_and_white_photography__d_2026-10-03T18-14-09.png': 'craft-glaze.jpg',
    'Black_and_white_photography__a_2026-10-03T18-14-06.png': 'scene-museum.jpg',
    'Very_dark_moody_black_and_whit_2026-10-03T18-12-52.png': 'profile-head.jpg',
    'Black_and_white_flat_lay_artif_2026-10-03T18-15-53.png': 'watch-mudan.jpg',
    'Black_and_white_flat_lay_artif_2026-10-03T18-14-36.png': 'watch-juancao.jpg',
    'Black_and_white_flat_lay_artif_2026-10-03T18-14-33.png': 'watch-lianhua.jpg',
}

MAX_SIDE = 1280
CROP_BOTTOM = 0.08  # 裁掉底部 8% 的水印带

total = 0
for src_name, dst_name in MAP.items():
    src = os.path.join(GEN, src_name)
    dst = os.path.join(OUT, dst_name)
    im = Image.open(src).convert('RGB')
    w, h = im.size
    im = im.crop((0, 0, w, int(h * (1 - CROP_BOTTOM))))
    w, h = im.size
    if max(w, h) > MAX_SIDE:
        k = MAX_SIDE / max(w, h)
        im = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
    kb = os.path.getsize(dst) / 1024
    total += kb
    print(f'{dst_name:20s} {im.size[0]}x{im.size[1]}  {kb:.0f} KB')
print(f'{"合计":20s} {"":12s} {total/1024:.1f} MB')
