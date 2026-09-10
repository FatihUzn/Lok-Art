#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lok-Art — urun fotografi hatti.

Ham fotograflari kareye kirpar, 3 boyutta AVIF + WebP uretir ve
data/products.json icindeki gorsel alanlarini otomatik doldurur.

KURULUM (bir kez):
    pip install pillow

KULLANIM:
    1. Ham fotograflari _ham/ klasorune koyun. Dosya adi urunun slug'i olmali:
           _ham/karisik-sarma-lokum-1-kg.jpg          -> 1. gorsel
           _ham/karisik-sarma-lokum-1-kg-2.jpg        -> 2. gorsel
           _ham/karisik-sarma-lokum-1-kg-3.jpg        -> 3. gorsel
       (slug'lari gormek icin: python3 tools/images.py --slugs)

    2. python3 tools/images.py
    3. python3 tools/build.py

SECENEKLER:
    --fit=crop   (varsayilan) kareye ortadan kirpar
    --fit=pad    kirpmaz, bos alani zemin rengiyle doldurur
    --bg=#FCFAF6 pad zemin rengi
    --dry        dosya yazmadan ne yapacagini gosterir
    --slugs      urun slug listesini yazdirir ve cikar
"""
import io
import json
import os
import re
import sys

try:
    from PIL import Image, ImageOps, features
except ImportError:
    print('HATA: Pillow kurulu degil.  ->  pip install pillow')
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, '_ham')
OUT_DIR = os.path.join(ROOT, 'assets', 'urunler')
JSON_PATH = os.path.join(ROOT, 'data', 'products.json')

SIZES = [480, 800, 1200]
DEFAULT_SRC = 800                 # <img src> icin kullanilacak boyut
QUALITY = {'avif': 55, 'webp': 78}
RAW_EXT = ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp', '.heic')

ARGS = sys.argv[1:]


def arg(name, default=None):
    for a in ARGS:
        if a.startswith('--' + name + '='):
            return a.split('=', 1)[1]
    return default


FIT = arg('fit', 'crop')
BG = arg('bg', '#FCFAF6')
DRY = '--dry' in ARGS


def load_db():
    with io.open(JSON_PATH, encoding='utf-8') as f:
        return json.load(f)


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def square(im):
    im = ImageOps.exif_transpose(im)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGB')
    w, h = im.size
    if w == h:
        return im
    if FIT == 'pad':
        side = max(w, h)
        canvas = Image.new('RGB', (side, side), hex_rgb(BG))
        canvas.paste(im, ((side - w) // 2, (side - h) // 2))
        return canvas
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    return im.crop((left, top, left + side, top + side))


def collect_raw():
    """{slug: [dosya yolu, ...]} — numara sirasina gore."""
    if not os.path.isdir(RAW_DIR):
        return {}
    found = {}
    for fn in sorted(os.listdir(RAW_DIR)):
        base, ext = os.path.splitext(fn)
        if ext.lower() not in RAW_EXT:
            continue
        m = re.match(r'^(.*?)(?:-(\d+))?$', base)
        slug, num = m.group(1), int(m.group(2) or 1)
        found.setdefault(slug, []).append((num, os.path.join(RAW_DIR, fn)))
    return dict((s, [p for _, p in sorted(v)]) for s, v in found.items())


def render(path, slug, index):
    """Bir ham fotograftan tum boyut/formatlari uretir; gorsel kaydini dondurur."""
    im = square(Image.open(path))
    if im.width < max(SIZES):
        print('  uyari: %s sadece %dpx genisliginde (onerilen en az %dpx)'
              % (os.path.basename(path), im.width, max(SIZES)))

    have_avif = features.check('avif')
    sets = {'avif': [], 'webp': []}
    src = None

    for w in SIZES:
        if w > im.width and w != SIZES[0]:
            continue                                   # buyutme yapma
        resized = im.resize((w, w), Image.LANCZOS)
        stem = '%s-%d-%d' % (slug, index, w)
        for fmt in (('avif', 'webp') if have_avif else ('webp',)):
            rel = 'assets/urunler/%s.%s' % (stem, fmt)
            if not DRY:
                resized.save(os.path.join(ROOT, rel.replace('/', os.sep)),
                             quality=QUALITY[fmt])
            sets[fmt].append('%s %dw' % (rel, w))
            if fmt == 'webp' and (w == DEFAULT_SRC or src is None):
                src = rel

    # WhatsApp/Facebook onizlemeleri AVIF/WebP'yi guvenilir okumaz:
    # ilk gorsel icin ayrica 1200px JPEG uretilir (og:image).
    og = None
    if index == 1:
        og_w = min(1200, max(im.width, SIZES[0]))
        og = 'assets/urunler/%s-1-og.jpg' % slug
        if not DRY:
            im.resize((og_w, og_w), Image.LANCZOS).save(
                os.path.join(ROOT, og.replace('/', os.sep)), quality=86, optimize=True)

    entry = {'src': src}
    srcset = dict((k, ', '.join(v)) for k, v in sets.items() if v)
    if len(SIZES) > 1 and srcset:
        entry['srcset'] = srcset
    if og:
        entry['og'] = og
    return entry


def main():
    db = load_db()
    products = db['products']
    by_slug = dict((p['slug'], p) for p in products)

    if '--slugs' in ARGS:
        for p in products:
            print('%-46s %s' % (p['slug'], p['name']))
        return

    raw = collect_raw()
    if not raw:
        print('_ham/ klasorunde fotograf yok.')
        print('Fotograflari _ham/<slug>.jpg olarak koyun. Slug listesi: '
              'python3 tools/images.py --slugs')
        return

    if not DRY:
        os.makedirs(OUT_DIR, exist_ok=True)

    unknown = [s for s in raw if s not in by_slug]
    for s in unknown:
        print('uyari: "%s" adinda urun yok, atlandi' % s)

    done = 0
    for slug, files in sorted(raw.items()):
        if slug not in by_slug:
            continue
        p = by_slug[slug]
        print('%s (%d fotograf)' % (slug, len(files)))
        images = []
        for i, path in enumerate(files, start=1):
            e = render(path, slug, i)
            e['alt'] = p['name'] if i == 1 else '%s — gorsel %d' % (p['name'], i)
            images.append(e)
        p['images'] = images
        p['image'] = images[0]['src']
        done += 1

    if DRY:
        print('\n--dry: hicbir dosya yazilmadi. %d urun islenecekti.' % done)
        return

    with io.open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        f.write('\n')

    kalan = sum(1 for p in products
                if p['image'].startswith('assets/lok_art_')
                or p['image'].startswith('assets/gift_'))
    print('\n%d urunun gorseli guncellendi. Gecici gorselde kalan: %d' % (done, kalan))
    print('Simdi calistirin:  python3 tools/build.py')


if __name__ == '__main__':
    main()
