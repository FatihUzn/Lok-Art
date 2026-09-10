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
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, 'data', 'products.json')
JS_PATH = os.path.join(ROOT, 'data', 'products.js')

REQUIRED = ['id', 'slug', 'name', 'price', 'category', 'categorySlug',
            'shortDesc', 'description', 'tastingNote', 'pairing', 'badges']

JS_HEADER = (
    '/* Otomatik uretilir — products.json ile ayni icerik.\n'
    '   Sitenin sunucusuz (file://) acildiginda da calismasini saglar.\n'
    '   ELLE DUZENLEMEYIN: python3 tools/build.py\n'
    '   ------------------------------------------------------------------ */\n'
)


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

    with io.open(JS_PATH, 'w', encoding='utf-8') as f:
        f.write(JS_HEADER)
        f.write('window.__LOKART_DATA = ')
        json.dump(db, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')

    print('yazildi: data/products.json, data/products.js')


if __name__ == '__main__':
    main()
