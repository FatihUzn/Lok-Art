#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lok-Art — veri derleyici.

Ne yapar:
  1. data/products.json dosyasini okur ve dogrular.
  2. Eski sema (tek "image" alani) varsa yeni semaya ("images" dizisi) tasir.
  3. data/products.json dosyasini duzenli bicimde geri yazar.
  4. data/products.js dosyasini uretir (tarayiciya gomulen surum).

Kullanim:
    python3 tools/build.py            # dogrula + uret
    python3 tools/build.py --check    # sadece dogrula, dosya yazma

Urun ekledikten veya fiyat degistirdikten sonra BU KOMUTU CALISTIRIN.
products.js dosyasini elle duzenlemeyin — bu script uretir.
"""
import datetime
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, 'data', 'products.json')
JS_PATH = os.path.join(ROOT, 'data', 'products.js')          # eski tek dosya (uyumluluk)
INDEX_PATH = os.path.join(ROOT, 'data', 'index.js')          # hafif: kart + arama + sepet
DETAILS_PATH = os.path.join(ROOT, 'data', 'details.js')      # agir: yalniz urun sayfasi

# Kart/arama/sepet icin gereken alanlar. description, tastingNote ve pairing
# verinin ~%63'u ve yalnizca urun detay sayfasinda lazim -> ayri dosyaya gider.
INDEX_FIELDS = ['id', 'slug', 'name', 'price', 'category', 'categorySlug',
                'categoryOrder', 'weight', 'grams', 'badges', 'shortDesc',
                'featured', 'signature']
DETAIL_FIELDS = ['description', 'tastingNote', 'pairing', 'allergens', 'ingredients']

IMG_DIR = 'assets/urunler/'
IMG_WIDTHS = [480, 800, 1200]
APP_PATH = os.path.join(ROOT, 'app.js')
SITEMAP_PATH = os.path.join(ROOT, 'sitemap.xml')

# Sitemap'teki sabit sayfalar: (yol, degisim sikligi, oncelik)
STATIC_PAGES = [
    ('',                  'weekly',  '1.0'),
    ('urunler.html',      'weekly',  '0.9'),
    ('kutunu-yarat.html', 'monthly', '0.8'),
    ('kurumsal.html',     'monthly', '0.8'),
    ('hakkimizda.html',   'monthly', '0.6'),
    ('iletisim.html',     'monthly', '0.6'),
    ('kvkk.html',         'yearly',  '0.3'),
]

REQUIRED = ['id', 'slug', 'name', 'price', 'category', 'categorySlug',
            'shortDesc', 'description', 'tastingNote', 'pairing', 'badges']

def js_header(what):
    return ('/* %s\n'
            '   Otomatik uretilir — kaynak: data/products.json\n'
            '   ELLE DUZENLEMEYIN: python3 tools/build.py\n'
            '   -------------------------------------------------------------- */\n' % what)


def pack_images(p):
    """Gorsel yollarini sikistirir.

    tools/images.py dosyalari sabit bir kurala gore yaziyor:
        assets/urunler/<slug>-<sira>-<genislik>.<format>
    Kurala uyuyorsa yalnizca fotograf sayisini sakla ({'g': 3}); srcset
    metinlerini tarayicida uret. 500 urunde bu, urun basina ~1 KB yerine
    ~15 bayt demek. Kurala uymayan (gecici/ozel) gorseller oldugu gibi durur.
    """
    imgs = p.get('images') or []
    if not imgs:
        return {'s': [p.get('image', '')]}
    expected = [IMG_DIR + '%s-%d-800.webp' % (p['slug'], i + 1) for i in range(len(imgs))]
    if [im['src'] for im in imgs] == expected:
        return {'g': len(imgs)}
    return {'s': [im['src'] for im in imgs]}


def site_url():
    """Alan adini app.js icindeki CONFIG.siteUrl'den okur — tek kaynak olsun."""
    try:
        with io.open(APP_PATH, encoding='utf-8') as f:
            m = re.search(r"siteUrl:\s*'([^']+)'", f.read())
        if m:
            return m.group(1).rstrip('/')
    except IOError:
        pass
    print('uyari: app.js icinde CONFIG.siteUrl bulunamadi, varsayilan kullanildi')
    return 'https://www.lokart.com.tr'


def write_sitemap(products, categories):
    """sitemap.xml'i urun verisinden uretir — elle guncellemek gerekmesin."""
    base = site_url()
    today = datetime.date.today().isoformat()
    rows = []

    def add(path, freq, prio):
        loc = base + '/' + path
        loc = loc.replace('&', '&amp;')
        rows.append('  <url><loc>%s</loc><lastmod>%s</lastmod>'
                    '<changefreq>%s</changefreq><priority>%s</priority></url>'
                    % (loc, today, freq, prio))

    for path, freq, prio in STATIC_PAGES:
        add(path, freq, prio)
    for c in sorted(categories, key=lambda x: x.get('categoryOrder', 0) or 0):
        if c.get('count'):
            add('urunler.html?kategori=' + c['slug'], 'weekly', '0.8')
    for p in products:
        add('urun.html?u=' + p['slug'], 'monthly', '0.7')

    with io.open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        f.write('\n'.join(rows))
        f.write('\n</urlset>\n')
    return len(rows)


def fail(msg):
    print('HATA: ' + msg)
    sys.exit(1)


def normalise_images(p):
    """Eski 'image' alanini yeni 'images' dizisine tasir, tutarli hale getirir."""
    imgs = p.get('images')
    if not imgs:
        src = p.get('image')
        if not src:
            return []
        imgs = [{'src': src}]
    out = []
    for i, im in enumerate(imgs):
        if isinstance(im, str):
            im = {'src': im}
        if not im.get('src'):
            continue
        entry = {'src': im['src']}
        if im.get('srcset'):
            entry['srcset'] = im['srcset']
        if im.get('og'):
            entry['og'] = im['og']
        # alt metni: yoksa urun adindan uret (ilk gorsel sade ad, digerleri numarali)
        alt = im.get('alt')
        if not alt:
            alt = p['name'] if i == 0 else '%s — gorsel %d' % (p['name'], i + 1)
        entry['alt'] = alt
        out.append(entry)
    return out


def main():
    check_only = '--check' in sys.argv

    if not os.path.exists(JSON_PATH):
        fail('data/products.json bulunamadi.')

    with io.open(JSON_PATH, encoding='utf-8') as f:
        db = json.load(f)

    products = db.get('products') or []
    categories = db.get('categories') or []
    if not products:
        fail('products dizisi bos.')

    errors = []
    warnings = []
    seen_slug, seen_id = {}, {}
    cat_slugs = set(c['slug'] for c in categories)

    for p in products:
        who = p.get('slug') or p.get('name') or '?'

        for k in REQUIRED:
            if k not in p or p[k] in (None, '', []):
                errors.append('%s: "%s" alani eksik' % (who, k))

        if not isinstance(p.get('price'), (int, float)) or isinstance(p.get('price'), bool):
            errors.append('%s: price sayi olmali (metin degil)' % who)

        s = p.get('slug', '')
        if s in seen_slug:
            errors.append('%s: slug tekrar ediyor' % who)
        seen_slug[s] = True
        if any(ch in s for ch in 'ıİşŞğĞüÜöÖçÇ ') or s != s.lower():
            errors.append('%s: slug kucuk harf ve Turkce karaktersiz olmali' % who)

        i = p.get('id')
        if i in seen_id:
            errors.append('%s: id tekrar ediyor (%s)' % (who, i))
        seen_id[i] = True

        if p.get('categorySlug') not in cat_slugs:
            errors.append('%s: categorySlug "%s" kategoriler arasinda yok'
                          % (who, p.get('categorySlug')))

        imgs = normalise_images(p)
        if not imgs:
            errors.append('%s: en az bir gorsel gerekli' % who)
        for im in imgs:
            path = os.path.join(ROOT, im['src'].replace('/', os.sep))
            if not os.path.exists(path):
                errors.append('%s: gorsel dosyasi yok -> %s' % (who, im['src']))
        p['images'] = imgs
        # geriye donuk uyumluluk: eski kod hala p.image okuyabilsin
        p['image'] = imgs[0]['src'] if imgs else ''

    # kategori sayaclarini urunlerden tazele
    for c in categories:
        n = sum(1 for p in products if p.get('categorySlug') == c['slug'])
        if c.get('count') != n:
            warnings.append('kategori "%s": count %s -> %s duzeltildi'
                            % (c['slug'], c.get('count'), n))
        c['count'] = n
        if n == 0:
            warnings.append('kategori "%s" bos' % c['slug'])

    eksik_gramaj = [p['slug'] for p in products if not p.get('grams')]
    if eksik_gramaj:
        warnings.append('%d urunde gramaj yok — fiyatin ne kadara ait oldugu belli degil '
                        '(ilk uc: %s)' % (len(eksik_gramaj), ', '.join(eksik_gramaj[:3])))
    eksik_alerjen = sum(1 for p in products if not p.get('allergens'))
    if eksik_alerjen:
        warnings.append('%d urunde alerjen listesi yok (allergens alani)' % eksik_alerjen)

    placeholder = sum(1 for p in products
                      if p['image'].startswith('assets/lok_art_')
                      or p['image'].startswith('assets/gift_'))
    if placeholder:
        warnings.append('%d urun hala gecici gorsel kullaniyor '
                        '(gercek fotograf bekleniyor)' % placeholder)

    for w in warnings:
        print('uyari: ' + w)

    if errors:
        for e in errors:
            print('HATA: ' + e)
        print('\n%d hata bulundu, dosya yazilmadi.' % len(errors))
        sys.exit(1)

    print('%d urun, %d kategori dogrulandi.' % (len(products), len(categories)))

    if check_only:
        print('--check: dosya yazilmadi.')
        return

    with io.open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        f.write('\n')

    index = {'categories': categories, 'products': []}
    details = {}
    for p in products:
        row = dict((k, p[k]) for k in INDEX_FIELDS if k in p)
        row['im'] = pack_images(p)
        index['products'].append(row)
        details[str(p['id'])] = dict((k, p[k]) for k in DETAIL_FIELDS if k in p)

    def dump(path, header, varname, obj):
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write(js_header(header))
            f.write('window.%s = ' % varname)
            json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
            f.write(';\n')
        return os.path.getsize(path)

    n_index = dump(INDEX_PATH, 'Kart, arama ve sepet verisi — her sayfada yuklenir.',
                   '__LOKART_INDEX', index)
    n_detail = dump(DETAILS_PATH, 'Urun detay metinleri — yalniz urun.html yukler.',
                    '__LOKART_DETAILS', details)

    # Eski tek dosya artik kullanilmiyor; kalmissa temizle
    if os.path.exists(JS_PATH):
        os.remove(JS_PATH)

    print('  data/index.js   %6.1f KB  (%d urun)' % (n_index / 1024.0, len(products)))
    print('  data/details.js %6.1f KB  (yalniz urun sayfasinda)' % (n_detail / 1024.0))

    n = write_sitemap(products, categories)
    print('  sitemap.xml     %6d URL' % n)
    print('yazildi: data/products.json, data/index.js, data/details.js, sitemap.xml')


if __name__ == '__main__':
    main()
