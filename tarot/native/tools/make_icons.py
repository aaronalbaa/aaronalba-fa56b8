#!/usr/bin/env python3
"""Genera los iconos de Arcana (iOS y macOS) y el color de lanzamiento. Requiere Pillow: pip3 install pillow"""
import json, math, os, random
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
S = 2048  # lienzo de trabajo (se reduce para suavizar bordes)

def artwork():
    img = Image.new('RGB', (S, S), (13, 11, 20))
    px = img.load()
    cx = cy = S / 2
    for y in range(S):
        for x in range(S):
            d = math.hypot(x - cx, y - cy) / (S * 0.72)
            t = max(0.0, 1 - d)
            px[x, y] = (int(13 + 30 * t * t), int(11 + 22 * t * t), int(20 + 58 * t * t))
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse((S * 0.17, S * 0.17, S * 0.83, S * 0.83), fill=(139, 108, 255, 46))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.05))
    img = Image.alpha_composite(img.convert('RGBA'), glow)
    moon = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    m = ImageDraw.Draw(moon)
    r = S * 0.30
    m.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(230, 201, 122, 255))
    cut = Image.new('L', (S, S), 0)
    ImageDraw.Draw(cut).ellipse((cx - r * 0.92 - S * 0.115, cy - r * 0.98 - S * 0.02, cx + r * 1.08 - S * 0.115, cy + r * 1.02 - S * 0.02), fill=255)
    alpha = moon.split()[3]
    alpha = Image.composite(Image.new('L', (S, S), 0), alpha, cut)
    moon.putalpha(alpha)
    img = Image.alpha_composite(img, moon)
    d = ImageDraw.Draw(img)
    random.seed(7)
    for (sx, sy, sr) in [(0.24, 0.24, 14), (0.74, 0.20, 10), (0.80, 0.70, 12), (0.20, 0.72, 9), (0.60, 0.12, 8), (0.88, 0.40, 8)]:
        x, y = sx * S, sy * S
        d.ellipse((x - sr, y - sr, x + sr, y + sr), fill=(236, 220, 160, 255))
        d.line((x - sr * 3, y, x + sr * 3, y), fill=(236, 220, 160, 120), width=3)
        d.line((x, y - sr * 3, x, y + sr * 3), fill=(236, 220, 160, 120), width=3)
    ring = ImageDraw.Draw(img)
    ring.ellipse((S * 0.08, S * 0.08, S * 0.92, S * 0.92), outline=(230, 201, 122, 40), width=6)
    return img

def write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f: json.dump(obj, f, indent=2)

def main():
    art = artwork()
    # iOS: cuadrado completo de 1024
    ios = os.path.join(ROOT, 'iOS', 'Assets.xcassets')
    icon = art.resize((1024, 1024), Image.LANCZOS).convert('RGB')
    os.makedirs(os.path.join(ios, 'AppIcon.appiconset'), exist_ok=True)
    icon.save(os.path.join(ios, 'AppIcon.appiconset', 'icon-1024.png'))
    write_json(os.path.join(ios, 'AppIcon.appiconset', 'Contents.json'), {"images": [{"filename": "icon-1024.png", "idiom": "universal", "platform": "ios", "size": "1024x1024"}], "info": {"author": "xcode", "version": 1}})
    write_json(os.path.join(ios, 'LaunchBG.colorset', 'Contents.json'), {"colors": [{"idiom": "universal", "color": {"color-space": "srgb", "components": {"red": "0.051", "green": "0.043", "blue": "0.078", "alpha": "1.000"}}}], "info": {"author": "xcode", "version": 1}})
    write_json(os.path.join(ios, 'Contents.json'), {"info": {"author": "xcode", "version": 1}})
    # macOS: placa redondeada de 824 sobre lienzo de 1024 con sombra
    mac = os.path.join(ROOT, 'macOS', 'Assets.xcassets')
    os.makedirs(os.path.join(mac, 'AppIcon.appiconset'), exist_ok=True)
    big = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    plate = art.resize((824, 824), Image.LANCZOS).convert('RGBA')
    mask = Image.new('L', (824, 824), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 823, 823), radius=185, fill=255)
    shadow = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((100, 112, 924, 936), radius=185, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    big = Image.alpha_composite(big, shadow)
    big.paste(plate, (100, 100), mask)
    images = []
    for size in (16, 32, 128, 256, 512):
        for scale in (1, 2):
            px = size * scale
            name = f'icon_{size}x{size}@{scale}x.png'
            big.resize((px, px), Image.LANCZOS).save(os.path.join(mac, 'AppIcon.appiconset', name))
            images.append({"filename": name, "idiom": "mac", "scale": f"{scale}x", "size": f"{size}x{size}"})
    write_json(os.path.join(mac, 'AppIcon.appiconset', 'Contents.json'), {"images": images, "info": {"author": "xcode", "version": 1}})
    write_json(os.path.join(mac, 'Contents.json'), {"info": {"author": "xcode", "version": 1}})
    print('Iconos generados en', ios, 'y', mac)

if __name__ == '__main__':
    main()
