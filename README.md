# Lok-Art — Kurumsal Web Sitesi

Statik, çok sayfalı, build gerektirmeyen bir site. Vanilla HTML + CSS + JavaScript.
Node, npm, derleme adımı yok: dosyaları herhangi bir web sunucusuna kopyalamak yeterli.
(Ürün verisi ve fotoğraflar için iki küçük Python script'i var — aşağıda.)

---

## Hızlı başlangıç

**En kolay yol** — `index.html` dosyasına çift tıklayın. Site tarayıcıda açılır ve
ürün listesi dâhil her şey çalışır.

**Geliştirirken (önerilen)** — proje klasöründe bir yerel sunucu çalıştırın:

```bash
python3 -m http.server 8000
# ardından http://localhost:8000 adresini açın
```

VS Code kullanıyorsanız *Live Server* eklentisi de aynı işi görür.

---

## Dosya yapısı

```
index.html            Ana sayfa
urunler.html          Koleksiyon — filtre, arama, sıralama, sayfalama
urun.html             Ürün detay (?u=urun-slug ile çalışır) — galerili
kutunu-yarat.html     6 bölmeli kişiye özel kutu tasarlayıcı
kurumsal.html         B2B / toplu sipariş + teklif formu
hakkimizda.html       Marka ve üretim hikâyesi
iletisim.html         İletişim, harita, form, sipariş & kargo SSS
kvkk.html             KVKK, çerez ve iade metni (ŞABLON — hukukçuya okutulmalı)
404.html              Sayfa bulunamadı (noindex)

style.css             Tüm tasarım sistemi (tek dosya, bölümlere ayrılmış)
app.js                Tüm uygulama mantığı (tek dosya, bölümlere ayrılmış)

data/products.json    Ürün veritabanı — ASIL KAYNAK, elle düzenlenen tek dosya
data/index.js         Kart/arama/sepet verisi, her sayfada — OTOMATİK ÜRETİLİR
data/details.js       Uzun açıklamalar, yalnız urun.html — OTOMATİK ÜRETİLİR

tools/build.py        products.json'u doğrular; products.js ve sitemap.xml'i üretir
tools/images.py       Ham fotoğrafları kareye kırpar, AVIF/WebP üretir, veriyi günceller

assets/               Site görselleri
assets/urunler/       Üretilmiş ürün fotoğrafları (tools/images.py yazar)
assets/atmosfer.*     Ana sayfadaki dikey atmosfer videosu (sessiz döngü)
_ham/                 Ham fotoğraflar (git'e girmez, sadece girdi klasörü)

favicon.ico           Eski tarayıcılar için ikon
apple-touch-icon.png  iOS ana ekran ikonu (180×180, SVG desteklenmiyor)
robots.txt            Arama motoru yönergeleri
sitemap.xml           OTOMATİK ÜRETİLİR — tools/build.py yazar
.nojekyll             GitHub Pages'in Jekyll'i atlaması için (boş dosya)
.htaccess             Apache/cPanel: 404, HTTPS, sıkıştırma, önbellek, güvenlik başlıkları
_eski/                Önceki denemenin yedeği — SİLİNEBİLİR
```

---

## ⚠️ CANLIYA ALMADAN ÖNCE

### 1. `app.js` içindeki `CONFIG` bloğunu güncelleyin

Dosyanın en üstündedir. Telefon, WhatsApp, e-posta, adres, Instagram ve kargo limiti
sitenin tamamında **buradan** okunur — HTML dosyalarında tek tek değiştirmeye gerek yoktur.

```js
const CONFIG = {
  whatsapp: '908502551818',   // sipariş buraya düşer — MUTLAKA doğrulayın
  phoneDisplay: '+90 850 255 18 18',
  email: 'info@lokart.com.tr',
  address: '...',
  instagram: '...',
  freeShippingLimit: 2000,    // TL
  boxBasePrice: 220,          // kutu tasarlayıcı: metal kutu + paketleme
  boxSlotStandard: 140,
  boxSlotPremium: 180
};
```

Şu an bu bilgiler `lokart.com.tr` sitesinden alınmıştır; **doğruluğunu firmayla teyit edin.**

### 2. Gramajları tamamlayın — en acil veri eksiği

**101 üründen 74'ünde ağırlık bilgisi yok.** Müşteri fiyatı görüyor ama neyin
karşılığı olduğunu göremiyor. `grams` (sayı, gram cinsinden) ve `weight` (ekranda
görünen metin, örn. "500 gr") alanlarını doldurun; kilogram fiyatı otomatik hesaplanır.

`python3 tools/build.py` her çalıştığında eksik olanların sayısını söyler.

### 3. Fiyatları teyit edin

`data/products.json` içindeki 101 fiyat da eski siteden geldi. Sunumdan önce
en az 10 ürünü firmayla karşılaştırın.

### 4. Alerjen listelerini girin

Ürün adından 60 üründe alerjen olduğu belli (fıstık, badem, ceviz, fındık, süt) ama
gıdada tahminle yazılmaz. Her ürüne `allergens` alanı ekleyin:

```json
"allergens": ["antep fıstığı", "süt"],
"ingredients": "Doğal kaynak suyu, nişasta, şeker, hakiki bal, antep fıstığı."
```

Girildiğinde ürün sayfasında kırmızı uyarı kutusu ve teknik tabloda ayrı satır olarak
görünür. Girilmezse hiçbir şey gösterilmez — uydurma yapılmaz.

### 5. `kvkk.html` metnini hukuk danışmanına okutun

Sayfadaki metin genel bir şablondur. Sayfanın başında bunu belirten bir uyarı kutusu
vardır — **yayına almadan önce o kutuyu kaldırın.**

### 6. Alan adını değiştirin

Önce `app.js` içindeki `CONFIG.siteUrl` alanını değiştirin — `sitemap.xml`
alan adını buradan okur. Sonra:

```bash
python3 tools/build.py     # sitemap yeni alan adıyla yeniden üretilir
```

Kalan yerler elle: `robots.txt` ve her sayfadaki `canonical` / `og:url` etiketleri
(ürün ve kategori sayfaları kendi etiketlerini JS ile yazdığı için onlara dokunmayın).

---

## Ürün fotoğrafları

### Çekim standardı

| | |
|---|---|
| **Oran** | **1:1 (kare)** — hem kartlar hem ürün sayfası kare kullanır |
| Çözünürlük | en az 1200×1200 px (2000 px tercih edilir) |
| Zemin | düz, açık (krem / kırık beyaz) |
| Işık | yumuşak yandan ışık, sert gölge yok |
| Kare sayısı | ürün başına 1–3 (kapalı kutu, açık kutu, kesit) |

### Fotoğrafları siteye alma

```bash
pip install pillow                     # bir kez

# 1) Slug listesini alın — dosya adları bu slug'lar olacak
python3 tools/images.py --slugs

# 2) Ham fotoğrafları _ham/ klasörüne koyun:
#    _ham/karisik-sarma-lokum-1-kg.jpg      -> 1. görsel
#    _ham/karisik-sarma-lokum-1-kg-2.jpg    -> 2. görsel
#    _ham/karisik-sarma-lokum-1-kg-3.jpg    -> 3. görsel

# 3) İşleyin — kareye kırpar, 480/800/1200 px AVIF + WebP üretir,
#    paylaşım önizlemesi için ayrıca bir JPEG üretir, products.json'u günceller
python3 tools/images.py

# 4) Tarayıcı verisini yeniden derleyin
python3 tools/build.py
```

`--fit=pad` kırpmak yerine boşluğu zemin rengiyle doldurur.
`--dry` hiçbir dosya yazmadan ne olacağını gösterir.

Kalan geçici görsel sayısını her derlemede `tools/build.py` söyler.

---

## Ürün ekleme / düzenleme

Kaynak dosya `data/products.json`. Bir ürün şöyle görünür:

```json
{
  "id": 9,
  "slug": "karisik-sarma-lokum-1-kg",
  "name": "Karışık Sarma Lokum - 1 Kg",
  "price": 1020.00,
  "category": "Sarma Lokum",
  "categorySlug": "sarma-lokum",
  "categoryOrder": 2,
  "image": "assets/urunler/karisik-sarma-lokum-1-kg-1-800.webp",
  "images": [
    {
      "src": "assets/urunler/karisik-sarma-lokum-1-kg-1-800.webp",
      "srcset": {
        "avif": "assets/urunler/...-480.avif 480w, ...-800.avif 800w, ...-1200.avif 1200w",
        "webp": "assets/urunler/...-480.webp 480w, ...-800.webp 800w, ...-1200.webp 1200w"
      },
      "og": "assets/urunler/karisik-sarma-lokum-1-kg-1-og.jpg",
      "alt": "Karışık Sarma Lokum - 1 Kg"
    }
  ],
  "weight": "1 kg",
  "grams": 1000,
  "shortDesc": "...",
  "description": "...",
  "tastingNote": "...",
  "pairing": "Sade Türk kahvesi",
  "badges": ["Glikozsuz", "El Yapımı", "Odun Ateşi"],
  "featured": false,
  "signature": false
}
```

| Alan | Açıklama |
|---|---|
| `slug` | Ürün sayfasının adresi: `urun.html?u=<slug>`. Benzersiz olmalı, küçük harf, Türkçe karaktersiz. |
| `price` | **Sayı**, metin değil. Ondalık ayıracı nokta (`1020.00`). Ekranda `1.020,00 TL` görünür. |
| `images` | Görsel dizisi. İlki ana görsel; birden fazlaysa ürün sayfasında galeri çıkar. |
| `image` | `images[0].src` ile aynı. `tools/build.py` otomatik doldurur, elle yazmayın. |
| `featured` | Ana sayfadaki "En çok tercih edilenler" bölümünde gösterilir. |
| `signature` | Ana sayfa "İmza Koleksiyon" şeridinde ve kartta "İmza" etiketiyle gösterilir. |
| `categoryOrder` | Koleksiyon sayfasındaki kategori sırası. |

**Her değişiklikten sonra:**

```bash
python3 tools/build.py
```

Script şunları yapar: zorunlu alanları kontrol eder, slug/id tekrarını yakalar,
eksik görsel dosyalarını bildirir, kategori sayaçlarını tazeler, `data/products.js`
dosyasını üretir ve **`sitemap.xml`'i yeniden yazar** (sabit sayfalar + 10 kategori
+ tüm ürünler). Hata varsa hiçbir dosyayı yazmaz.

`data/index.js`, `data/details.js` ve `sitemap.xml` dosyalarını **elle düzenlemeyin** —
üretiliyorlar.

### Neden veri ikiye ayrılıyor?

Sepet çekmecesi her sayfada açılabildiği ve fiyatların güncel kalması gerektiği için
ürün verisi her sayfada yükleniyor. Ama verinin ~%63'ü (`description`, `tastingNote`,
`pairing`) yalnızca ürün detay sayfasında lazım. 101 üründe fark küçük; 500 üründe
her sayfaya 394 KB yerine 144 KB düşüyor.

Aynı sebeple görsel yolları veride açık açık yazılmaz. `tools/images.py` dosyaları
sabit bir kurala göre üretir (`<slug>-<sıra>-<genişlik>.<format>`), veri yalnızca
fotoğraf sayısını taşır (`"im": {"g": 3}`), `srcset` metinleri tarayıcıda kurulur.
Açık yazılsaydı 500 üründe sadece dosya adları ~500 KB tutardı.

Sadece kontrol için: `python3 tools/build.py --check`

---

## Sipariş akışı nasıl çalışıyor?

Sitede ödeme alınmaz. Akış şöyledir:

1. Müşteri ürünleri sepete ekler — sepet tarayıcısında (`localStorage`) saklanır,
   sayfa yenilense de kaybolmaz. Fiyatlar her açılışta veriden tazelenir, yani
   fiyat güncellerseniz eski sepetler de doğru tutarı gösterir.
2. Sepette **sipariş bilgileri** doldurulur: ad soyad, telefon, teslimat adresi,
   teslim tarihi, sipariş notu, hediye paketi ve karta yazılacak not. Bunlar da
   tarayıcıda saklanır; sunucuya hiçbir şey gitmez.
3. "WhatsApp ile siparişi tamamla" butonu, sepeti **ve bu bilgileri** tek bir
   biçimlendirilmiş mesaja çevirip `CONFIG.whatsapp` numarasına yönlendirir — yani
   sipariş tek mesajda tamamlanır, karşılıklı yazışmaya gerek kalmaz. Liste WhatsApp
   bağlantı sınırını aşacak kadar uzunsa otomatik olarak e-postaya düşer.
3. Alternatif olarak "E-posta ile gönder" aynı özeti `CONFIG.email` adresine hazırlar.
4. Kurumsal ve iletişim formları da aynı mantıkla çalışır — sunucu tarafı kod gerekmez.

Bu yaklaşımın avantajı: sanal POS, KVKK/mesafeli satış altyapısı ve sipariş veritabanı
olmadan bugün canlıya alınabilir. Gerçek e-ticaret (iyzico/PayTR + sipariş paneli)
ayrı bir aşamadır; bu yapı ona geçişi engellemez.

---

## Gizlilik ve çerezler

- Site kendi çerezini kullanmaz. Sepet ve çerez tercihi `localStorage`'da durur;
  sunucuya hiçbir veri gitmez.
- **Google Haritalar** iletişim sayfasında yalnızca kullanıcı "Haritayı göster"e
  bastığında veya çerez bildiriminde "Kabul et"i seçtiğinde yüklenir. Onaya kadar
  Google'a hiçbir istek gitmez.
- **Analytics** varsayılan olarak kapalı. Açmak için `app.js` içindeki
  `CONFIG.analytics` alanını doldurun:
  `{ provider: 'plausible', id: 'lokart.com.tr' }` veya `{ provider: 'ga4', id: 'G-XXXXXXX' }`.
  Dolu olsa bile yalnızca kullanıcı çerez bildiriminde "Kabul et" dedikten sonra yüklenir.
- **Google Fonts** hâlâ Google sunucularından yükleniyor. Tamamen bağımsız olmak
  isterseniz fontları indirip `assets/fonts/` altına koyup her sayfadaki
  `fonts.googleapis.com` bağlantısını yerel bir `@font-face` bloğuyla değiştirin
  (google-webfonts-helper bunu hazır verir). Gerekli ağırlıklar:
  Playfair Display 500/600, Inter 400/500/600/700, `latin` + `latin-ext` alt kümeleri.

---

## Yayınlama

Statik site olduğu için hepsi çalışır:

- **GitHub Pages** — depoyu push edin, Settings → Pages → Branch: `main`, klasör `/`. Ücretsiz.
- **Netlify / Cloudflare Pages** — klasörü sürükleyip bırakın. Ücretsiz, otomatik HTTPS.
- **Paylaşımlı hosting (cPanel)** — dosyaları `public_html` altına atın. `.htaccess`
  dosyası 404 sayfasını, HTTPS yönlendirmesini, sıkıştırmayı ve önbelleği ayarlar;
  gizli dosya olduğu için FTP'de "gizli dosyaları göster" açık olmalı.

`.nojekyll` GitHub Pages içindir: Jekyll `_` ile başlayan klasörleri yok sayar,
bu dosya onu devre dışı bırakır. Diğer hostinglerde zararsızdır.

---

## Teknik notlar

- **Erişilebilirlik**: klavye ile tam gezinme, "İçeriğe geç" bağlantısı, `aria` etiketleri,
  odak halkaları, `prefers-reduced-motion` desteği. Sepet çekmecesi ve mobil menü
  açıkken odak panelin içinde kalır (focus trap), Esc kapatır.
- **SEO**: her sayfada benzersiz `title` ve `description`; ürün **ve kategori**
  sayfaları kendi `canonical` ve Open Graph etiketlerini JS ile yazar (aksi hâlde
  101 ürün ve 10 kategori adresinin tamamı tek sayfaya işaret eder ve indexlenmez).
  `Store`, `Product` ve `BreadcrumbList` JSON-LD. Sitemap 118 URL ile veriden üretilir.
  Arama sonuçları ve bulunamayan ürün adresleri `noindex` alır.
- **Görseller**: `<picture>` ile AVIF → WebP → JPEG sırası, üç boyutlu `srcset`.
  Paylaşım önizlemeleri için ayrı JPEG (WhatsApp ve Facebook AVIF/WebP okumaz).
- **Katalog**: yapışkan kategori çubuğu, fiyat aralığı filtresi, numaralı sayfalama
  (`?sayfa=2`). Yüzlerce ürüne göre kurulmuştur.
- **Renk**: açık zeminde küçük metinler `--gold-ink` kullanır (kontrast 5.2:1).
  `--gold-dark` yalnızca çizgi ve kenarlık içindir — metinde kullanmayın, WCAG AA'dan kalır.
- **Arama**: Türkçe karakterden bağımsız ("fistik" araması "fıstık"ı bulur),
  çok kelimeli, ad + kategori + ağırlık + kısa açıklama + rozetlerde arar.
- **Performans**: harici kütüphane yok. Görseller `lazy` yükleniyor, hero için
  `srcset` var, 12 MB'lık tanıtım videosu `preload="none"` ile yalnızca kullanıcı
  oynattığında iniyor. Font isteği yalnızca gerçekten kullanılan 6 ağırlığı çeker.
- **Dayanıklılık**: JavaScript çalışmazsa içerik yine de görünür kalır.
- **Tarayıcı desteği**: Chrome, Safari, Firefox, Edge güncel sürümler; iOS ve Android.

## Sonraki aşamalar (isteğe bağlı)

1. Gerçek ürün fotoğrafçılığı *(en yüksek etki — hat hazır, sadece fotoğraf lazım)*
   Yüzlerce ürün varsa kademeli gidin: öne çıkan 30–40 ürün düzgün çekilsin,
   uzun kuyruk sade düz zemin karesiyle geçilsin.
2. Öne çıkan 20–30 ürün için firmanın kendi anlatımıyla açıklama metinleri
3. Fontları self-host etmek
4. İngilizce dil desteği
5. Gerçek ödeme entegrasyonu + sipariş yönetim paneli
6. Blog / tarif içerikleri (SEO trafiği için)
7. Gerçek müşteri yorumları — uydurma yorum koymayın; marka güvenini bitirir
