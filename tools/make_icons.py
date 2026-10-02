# 生成应用图标（添加到主屏幕用）：python tools/make_icons.py
# 不依赖浏览器：用 Pillow 直接绘制「团花」图标，输出 512 / 192 / 180 三种尺寸。
import math
import os

from PIL import Image, ImageDraw, ImageFilter

S = 512
INK = (20, 19, 18)
PAPER = (246, 245, 242)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img')


def build():
    img = Image.new('RGB', (S, S), '#f7f6f4')
    d = ImageDraw.Draw(img)

    # 背景：中心偏亮的柔和径向渐变
    cx = cy = S / 2
    for i in range(int(S * 0.72), 0, -1):
        t = i / (S * 0.72)
        c = int(255 - 22 * t ** 1.6)
        d.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(c, c - 1, c - 4))

    # 投影
    shadow = Image.new('L', (S, S), 0)
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([cx - 176, cy - 150 + 14, cx + 176, cy + 168 + 14], fill=70)
    shadow = shadow.filter(ImageFilter.GaussianBlur(26))
    img.paste(Image.new('RGB', (S, S), (60, 56, 50)), (0, 0), shadow)

    d = ImageDraw.Draw(img)

    # 团花：多层花瓣（圆叠圆，白色描边形成「留白间隙」）
    rings = [
        (10, 152, 68, 0),
        (9, 106, 55, 20),
        (7, 64, 43, 12),
        (5, 28, 30, 34),
    ]
    for n, R, pr, rot in rings:
        for k in range(n):
            a = math.radians(rot + k * 360.0 / n)
            x = cx + math.cos(a) * R
            y = cy + math.sin(a) * R
            d.ellipse([x - pr, y - pr, x + pr, y + pr], fill=INK, outline=PAPER, width=4)

    # 花心
    d.ellipse([cx - 32, cy - 32, cx + 32, cy + 32], fill=INK, outline=PAPER, width=4)
    d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=PAPER)
    for k in range(6):
        a = math.radians(k * 60 + 30)
        x = cx + math.cos(a) * 21
        y = cy + math.sin(a) * 21
        d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=PAPER)

    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    base = build()
    for size in (512, 192, 180):
        path = os.path.join(OUT, 'icon-%d.png' % size)
        base.resize((size, size), Image.LANCZOS).save(path, 'PNG', optimize=True)
        print('wrote', os.path.normpath(path))


if __name__ == '__main__':
    main()
