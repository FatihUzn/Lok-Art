# Lok-Art — Kurumsal Web Sitesi

Statik, çok sayfalı, build gerektirmeyen bir site. Vanilla HTML + CSS + JavaScript.
Node, npm, derleme adımı yok: dosyaları herhangi bir web sunucusuna kopyalamak yeterli.

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
urun.html             Ürün detay (?u=urun-slug ile çalışır)
kutunu-yarat.html     6 bölmeli kişiye özel kutu tasarlayıcı
kurumsal.html         B2B / toplu sipariş + teklif formu
hakkimizda.html       Marka ve üretim hikâyesi
iletisim.html         İletişim, harita, form, sipariş & kargo SSS
kvkk.html             KVKK, çerez ve iade metni (ŞABLON — hukukçuya okutulmalı)
404.html              Sayfa bulunamadı

style.css             Tüm tasarım sistemi (tek dosya, bölümlere ayrılmış)
app.js                Tüm uygulama mantığı (tek dosya, bölümlere ayrılmış)

data/products.json    Ürün veritabanı (asıl kaynak)
data/products.js      Aynı verinin tarayıcıya gömülen sürümü
assets/               Görseller

robots.txt            Arama motoru yönergeleri
sitemap.xml           108 URL içeren site haritası
_eski/                Önceki denemenin yedeği (silinebilir)
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

### 2. `kvkk.html` metnini hukuk danışmanına okutun

Sayfadaki metin genel bir şablondur ve firmanın gerçek veri işleme süreçlerine göre
güncellenmelidir. Sayfanın başında bunu belirten bir uyarı kutusu vardır — yayına
almadan önce o kutuyu da kaldırın.

### 3. Gerçek ürün fotoğrafları çekilmeli — en yüksek öncelikli iş

Elde yalnızca 5 adet 279×279 piksel görsel var ve 101 ürün bunları paylaşıyor.
Site bu hâliyle çalışır ama **profesyonel görünmesini engelleyen tek şey budur.**

> Not: Devraldığım veride 101 üründen **70 tanesi Unsplash'ten dış link** ile görsel
> çekiyordu. Bu hem yavaşlatıyor hem de ticari bir sitede telif açısından risk
> oluşturuyordu; tamamı yerel görsellerle değiştirildi.

Önerilen çekim standardı: kare (1:1), en az 1200×1200 px, düz açık zemin,
yumuşak yandan ışık. Dosyaları `assets/` altına koyup `data/products.json` içindeki
`image` alanlarını güncelleyin.

### 4. Ürün açıklamaları

`description`, `shortDesc` ve `tastingNote` alanları kategori + ürün adı temel alınarak
üretilmiş şablon metinlerdir. Doğru ve satılabilir metinlerdir, ancak öne çıkan
20–30 ürün için firmanın kendi anlatımıyla yeniden yazılması dönüşümü belirgin artırır.

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
  "image": "assets/lok_art_1.avif",
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
| `slug` | Ürün sayfasının adresi: `urun.html?u=<slug>`. Benzersiz olmalı, Türkçe karakter içermemeli. |
| `price` | **Sayı**, metin değil. Ondalık ayıracı nokta (`1020.00`). Ekranda otomatik olarak `1.020,00 TL` biçiminde görünür. |
| `featured` | Ana sayfadaki "En çok tercih edilenler" bölümünde gösterilir. |
| `signature` | Ana sayfa "İmza Koleksiyon" şeridinde ve kartta "İmza" etiketiyle gösterilir. |
| `categoryOrder` | Koleksiyon sayfasındaki kategori sırası. |

**Önemli:** `data/products.json` dosyasını her değiştirdiğinizde `data/products.js`
dosyasını da güncelleyin — ikisi aynı içeriği taşır. Tek satırla:

```bash
python3 -c "import json,io; d=json.load(io.open('data/products.json',encoding='utf-8')); io.open('data/products.js','w',encoding='utf-8').write('window.__LOKART_DATA = '+json.dumps(d,ensure_ascii=False)+';\n')"
```

---

## Sipariş akışı nasıl çalışıyor?

Sitede ödeme alınmaz. Akış şöyledir:

1. Müşteri ürünleri sepete ekler — sepet tarayıcısında (`localStorage`) saklanır,
   sayfa yenilense de kaybolmaz.
2. "WhatsApp ile siparişi tamamla" butonu, sepeti biçimlendirilmiş bir mesaja çevirip
   `CONFIG.whatsapp` numarasına yönlendirir.
3. Alternatif olarak "E-posta ile gönder" aynı özeti `CONFIG.email` adresine hazırlar.
4. Kurumsal ve iletişim formları da aynı mantıkla çalışır — sunucu tarafı kod gerekmez.

Bu yaklaşımın avantajı: sanal POS, KVKK/mesafeli satış altyapısı ve sipariş veritabanı
olmadan bugün canlıya alınabilir. Gerçek e-ticaret (iyzico/PayTR + sipariş paneli)
ayrı bir aşamadır; bu yapı ona geçişi engellemez.

---

## Yayınlama

Statik site olduğu için hepsi çalışır:

- **GitHub Pages** — depoyu push edin, Settings → Pages → Branch: `main`, klasör `/`. Ücretsiz.
- **Netlify / Cloudflare Pages** — klasörü sürükleyip bırakın. Ücretsiz, otomatik HTTPS.
- **Paylaşımlı hosting (cPanel)** — dosyaları `public_html` altına atın. Yeterli.

Yayına aldıktan sonra `sitemap.xml`, `robots.txt` ve her sayfadaki `canonical` /
`og:url` etiketlerindeki `https://www.lokart.com.tr` adresini gerçek alan adıyla
değiştirmeyi unutmayın (şu an bu adres varsayılan olarak yazılıdır).

---

## Teknik notlar

- **Erişilebilirlik**: klavye ile tam gezinme, "İçeriğe geç" bağlantısı, `aria` etiketleri,
  odak halkaları, `prefers-reduced-motion` desteği.
- **SEO**: her sayfada benzersiz `title` ve `description`, Open Graph etiketleri,
  `Store` ve `Product` JSON-LD yapılandırılmış verisi, canonical, sitemap.
- **Performans**: harici kütüphane yok (yalnızca Google Fonts). Görseller `lazy`
  yükleniyor, hero için `srcset` var, 12 MB'lık tanıtım videosu `preload="none"` ile
  yalnızca kullanıcı oynattığında iniyor.
- **Dayanıklılık**: JavaScript çalışmazsa içerik yine de görünür kalır
  (giriş animasyonları yalnızca JS aktifken devreye girer).
- **Tarayıcı desteği**: Chrome, Safari, Firefox, Edge güncel sürümler; iOS ve Android.

## Sonraki aşamalar (isteğe bağlı)

1. Gerçek ürün fotoğrafçılığı *(en yüksek etki)*
2. İngilizce dil desteği
3. Gerçek ödeme entegrasyonu + sipariş yönetim paneli
4. Blog / tarif içerikleri (SEO trafiği için)
5. Google Analytics veya Plausible kurulumu
