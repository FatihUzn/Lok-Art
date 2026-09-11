#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lok-Art — icerik etiketi uretici.

Kategoriler urunun BICIMINI soyler (sarma, parmak, cifte kavrulmus).
Musteri ise icerige gore arar: "fistikli olan", "cevizli var mi".
Bu script urun adlarindan ikinci ekseni uretir; katalog sayfasindaki
"Icerik" filtresi bu alani kullanir.

Uretilen etiketler ONERIDIR. products.json'a yazilir, sonra elle duzeltilir.
Elle duzeltilmis bir etiketi ezmemek icin varsayilan olarak yalnizca
"tags" alani BOS olan urunlere yazar.

Kullanim:
    python3 tools/tags.py            # etiketi olmayanlari doldur
    python3 tools/tags.py --dry      # yazmadan goster
    python3 tools/tags.py --force    # hepsini yeniden uret (elle duzeltmeler gider)
    python3 tools/tags.py --rapor    # hangi etikette kac urun var
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, 'data', 'products.json')

# etiket -> urun adinda/kisa aciklamasinda aranacak parcalar
SOZLUK = [
    ('Fıstıklı',      ['fıstık']),
    ('Cevizli',       ['ceviz']),
    ('Bademli',       ['badem']),
    ('Fındıklı',      ['fındık']),
    ('Kajulu',        ['kaju']),
    ('Çikolatalı',    ['çikolata', 'brownie', 'nutella', 'kakao']),
    ('Sütlü',         ['sütlü', 'süt ']),
    ('Narlı',         ['nar']),
    ('Güllü',         ['gül']),
    ('Damla sakızlı', ['damla sakız', 'sakızlı']),
    ('Kadayıflı',     ['kadayıf']),
    ('Baklavalı',     ['baklava']),
    ('Kahveli',       ['kahve']),
    ('Meyveli',       ['portakal', 'elma', 'incir', 'karadut', 'vişne', 'kayısı',
                       'çilek', 'orman meyve', 'mango', 'dut', 'muz', 'limon',
                       'üzüm', 'pestil']),
    ('Sade',          ['sade']),
    ('Karışık',       ['karışık', 'seçki', 'gurme', 'şöleni', 'dünyası', 'imza kutusu',
                       'aromatik']),
]

ARGS = sys.argv[1:]
DRY = '--dry' in ARGS
FORCE = '--force' in ARGS


# Turkce kucultme tuzagi: 'İ'.lower() birlesik nokta uretir, 'imza' eslesmez.
TR_FOLD = {'ı': 'i', 'İ': 'i', 'I': 'i', 'Ş': 'ş', 'Ğ': 'ğ', 'Ü': 'ü', 'Ö': 'ö', 'Ç': 'ç'}


def kucult(s):
    return ''.join(TR_FOLD.get(ch, ch) for ch in s).lower()


def etiketle(p):
    metin = kucult(p.get('name', '') + ' ' + (p.get('shortDesc') or ''))
    out = [ad for ad, parcalar in SOZLUK
           if any(kucult(x) in metin for x in parcalar)]
    # "Sade" ile baska bir icerik birlikte cikarsa sade yanlistir
    if len(out) > 1 and 'Sade' in out:
        out.remove('Sade')
    return out


def main():
    with io.open(JSON_PATH, encoding='utf-8') as f:
        db = json.load(f)
    products = db['products']

    if '--rapor' in ARGS:
        import collections
        say = collections.Counter()
        for p in products:
            say.update(p.get('tags') or [])
        etiketsiz = [p['name'] for p in products if not p.get('tags')]
        print('%-18s %s' % ('ETIKET', 'URUN'))
        for k, v in say.most_common():
            print('%-18s %3d' % (k, v))
        print('\netiketsiz: %d' % len(etiketsiz))
        for n in etiketsiz[:15]:
            print('   ' + n)
        return

    yazilan, atlanan = 0, 0
    for p in products:
        if p.get('tags') and not FORCE:
            atlanan += 1
            continue
        t = etiketle(p)
        if DRY:
            print('%-48s -> %s' % (p['slug'][:48], ', '.join(t) or '(yok)'))
        else:
            p['tags'] = t
        yazilan += 1

    if DRY:
        print('\n--dry: dosya yazilmadi. %d urun islenecekti.' % yazilan)
        return

    with io.open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        f.write('\n')

    bos = sum(1 for p in products if not p.get('tags'))
    print('%d urune etiket yazildi, %d urun elle duzeltilmis oldugu icin atlandi.'
          % (yazilan, atlanan))
    print('Etiket cikmayan %d urun var (genelde karma kutular).' % bos)
    print('Etiketler ONERIDIR — products.json icinde gozden gecirin.')
    print('Sonra calistirin:  python3 tools/build.py')


if __name__ == '__main__':
    main()
