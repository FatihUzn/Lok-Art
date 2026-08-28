/* ==========================================================================
   LOK-ART — Uygulama katmanı
   Tek dosya, modül yok: her tarayıcıda ve her hostingde build gerektirmeden çalışır.
   Bölümler: 0 Ayarlar · 1 Yardımcılar · 2 Veri · 3 Arayüz kabuğu · 4 Sepet
             5 Ürün kartları · 6 Sayfa mantıkları · 7 Başlatma
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------ 0. AYARLAR ----------------------------- */
  /* !!! CANLIYA ALMADAN ÖNCE BU BLOĞU GÜNCELLEYİN !!!
     Buradaki bilgiler sitenin tamamında (footer, iletişim, WhatsApp sipariş,
     yapılandırılmış veri) tek noktadan kullanılır. */
  const CONFIG = {
    brand: 'Lok-Art',
    siteUrl: 'https://www.lokart.com.tr',
    whatsapp: '908502551818',            // Sadece rakam, başında ülke kodu
    phoneDisplay: '+90 850 255 18 18',
    phoneHref: '+908502551818',
    email: 'info@lokart.com.tr',
    address: 'Mehmet Akif Mah. Cahit Sıtkı Sk. No:20, Şerifali, Ümraniye / İstanbul',
    instagram: 'https://www.instagram.com/lokum_sanati/',
    freeShippingLimit: 2000,             // TL — bu tutarın üzerinde kargo bedava
    boxBasePrice: 220,                   // TL — kendi kutunu yarat: metal kutu + paketleme
    boxSlotStandard: 140,
    boxSlotPremium: 180,
    boxSize: 6
  };

  const NAV = [
    { href: 'index.html',        label: 'Ana Sayfa',        key: 'home' },
    { href: 'urunler.html',      label: 'Koleksiyon',       key: 'catalog' },
    { href: 'kutunu-yarat.html', label: 'Kutunu Yarat',     key: 'box' },
    { href: 'kurumsal.html',     label: 'Kurumsal',         key: 'b2b' },
    { href: 'hakkimizda.html',   label: 'Hakkımızda',       key: 'about' },
    { href: 'iletisim.html',     label: 'İletişim',         key: 'contact' }
  ];

  const ICONS = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.8-.9-2-1-.3-.1-.5-.15-.7.15-.2.3-.75 1-.9 1.15-.2.2-.35.2-.65.05-.3-.15-1.25-.45-2.4-1.5-.9-.8-1.5-1.75-1.65-2.05-.15-.3 0-.45.15-.6.15-.15.3-.35.45-.55.15-.2.2-.3.3-.5.1-.2.05-.4-.02-.55-.08-.15-.7-1.65-.95-2.25-.25-.6-.5-.5-.7-.5h-.6c-.2 0-.55.07-.83.37-.28.3-1.08 1.05-1.08 2.55s1.1 2.95 1.25 3.15c.15.2 2.17 3.3 5.25 4.63.73.32 1.3.5 1.75.64.74.23 1.4.2 1.93.12.59-.09 1.8-.73 2.06-1.44.25-.71.25-1.32.18-1.44-.08-.13-.28-.2-.58-.35Z"/><path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.87c0 1.92.53 3.72 1.46 5.26L2 22.5l5.5-1.6a9.83 9.83 0 0 0 4.54 1.12h.01c5.44 0 9.86-4.42 9.86-9.87C21.91 6.42 17.49 2 12.04 2Zm0 17.98a8.1 8.1 0 0 1-4.16-1.15l-.3-.18-3.1.9.83-3.02-.2-.31a8.1 8.1 0 0 1-1.24-4.35c0-4.49 3.66-8.14 8.17-8.14a8.14 8.14 0 0 1 .01 16.25Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.42-4.03 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.5-2.5 1.5-3.5Z"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5" rx="1"/><path d="M10 12h4"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m8.2 13.9-1.4 7L12 18l5.2 2.9-1.4-7"/></svg>'
  };

  /* ---------------------------- 1. YARDIMCILAR --------------------------- */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const priceFmt = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (n) => priceFmt.format(Number(n) || 0) + ' TL';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const param = (key) => new URLSearchParams(location.search).get(key);

  function debounce(fn, wait) {
    let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), wait); };
  }

  /* Bildirimler */
  let toastHost;
  function toast(message, tone) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'toasts';
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastHost);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    if (tone === 'error') el.style.borderLeftColor = '#9C3B2E';
    el.textContent = message;
    toastHost.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 3200);
  }

  /* Görünüme girince belirme */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
    items.forEach(i => io.observe(i));
  }

  /* ------------------------------- 2. VERİ ------------------------------- */
  let DB = null;             // { categories:[], products:[] }
  let dbPromise = null;

  function loadData() {
    if (dbPromise) return dbPromise;
    /* data/products.js sayfaya gömülüyse onu kullan — böylece site dosya olarak
       (file://) açıldığında da çalışır ve bir ağ isteği tasarruf edilir. */
    if (window.__LOKART_DATA) {
      DB = window.__LOKART_DATA;
      dbPromise = Promise.resolve(DB);
      return dbPromise;
    }
    dbPromise = fetch('data/products.json', { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(json => { DB = json; return json; })
      .catch(err => {
        console.error('[Lok-Art] Ürün verisi yüklenemedi:', err);
        toast('Ürünler yüklenemedi. Sayfayı yenilemeyi deneyin.', 'error');
        DB = { categories: [], products: [] };
        return DB;
      });
    return dbPromise;
  }

  const productById = (id) => (DB.products || []).find(p => String(p.id) === String(id));
  const productBySlug = (slug) => (DB.products || []).find(p => p.slug === slug);

  /* -------------------------- 3. ARAYÜZ KABUĞU --------------------------- */
  function buildShell() {
    const page = document.body.dataset.page || '';

    /* Mobil menü */
    const mnav = document.createElement('nav');
    mnav.className = 'mobile-nav';
    mnav.id = 'mobileNav';
    mnav.setAttribute('aria-label', 'Mobil menü');
    mnav.innerHTML =
      '<div class="mobile-nav__head">' +
        '<span class="brand"><span class="brand__name" style="color:#fff">LOK-ART</span></span>' +
        '<button class="icon-btn" type="button" data-close-mnav aria-label="Menüyü kapat">' + ICONS.close + '</button>' +
      '</div><ul>' +
      NAV.map(n => '<li><a href="' + n.href + '"' + (n.key === page ? ' aria-current="page"' : '') + '>' + n.label + '</a></li>').join('') +
      '</ul>' +
      '<div class="mobile-nav__foot">' +
        '<a href="tel:' + CONFIG.phoneHref + '">' + CONFIG.phoneDisplay + '</a>' +
        '<a href="mailto:' + CONFIG.email + '">' + CONFIG.email + '</a>' +
      '</div>';
    document.body.appendChild(mnav);

    /* Sepet çekmecesi */
    const drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.id = 'cartDrawer';
    drawer.setAttribute('aria-label', 'Sepet');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML =
      '<div class="drawer__head">' +
        '<h2 class="drawer__title">Sepetiniz</h2>' +
        '<button class="icon-btn" type="button" data-close-cart aria-label="Sepeti kapat">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="drawer__body" id="cartBody"></div>' +
      '<div class="drawer__foot" id="cartFoot"></div>';
    document.body.appendChild(drawer);

    /* Ortak karartma katmanı */
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.id = 'overlay';
    document.body.appendChild(ov);

    /* WhatsApp yüzen buton */
    if (!$('.wa-float')) {
      const wa = document.createElement('a');
      wa.className = 'wa-float';
      wa.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Merhaba, Lok-Art ürünleri hakkında bilgi almak istiyorum.');
      wa.target = '_blank';
      wa.rel = 'noopener';
      wa.setAttribute('aria-label', 'WhatsApp ile yazın');
      wa.innerHTML = ICONS.wa;
      document.body.appendChild(wa);
    }

    /* Olaylar */
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-mnav]')) { openPanel(mnav); }
      else if (e.target.closest('[data-close-mnav]')) { closePanels(); }
      else if (e.target.closest('[data-open-cart]')) { e.preventDefault(); Cart.open(); }
      else if (e.target.closest('[data-close-cart]')) { closePanels(); }
      else if (e.target === ov) { closePanels(); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanels(); });

    /* Sticky header gölgesi */
    const header = $('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Footer ve iletişim alanlarını ayarlardan doldur */
    $$('[data-cfg]').forEach(el => {
      const key = el.dataset.cfg;
      if (!(key in CONFIG)) return;
      if (el.tagName === 'A') {
        if (key === 'email') { el.href = 'mailto:' + CONFIG.email; el.textContent = CONFIG.email; }
        else if (key === 'phoneDisplay') { el.href = 'tel:' + CONFIG.phoneHref; el.textContent = CONFIG.phoneDisplay; }
        else if (key === 'instagram') { el.href = CONFIG.instagram; }
        else el.textContent = CONFIG[key];
      } else {
        el.textContent = CONFIG[key];
      }
    });
    $$('[data-wa-link]').forEach(a => {
      a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(a.dataset.waLink || 'Merhaba, bilgi almak istiyorum.');
    });
    const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  }

  let lastFocus = null;
  function openPanel(el) {
    lastFocus = document.activeElement;
    $('#overlay').classList.add('is-open');
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    const focusable = el.querySelector('button, a, input');
    if (focusable) setTimeout(() => focusable.focus(), 60);
  }
  function closePanels() {
    const ov = $('#overlay'); if (ov) ov.classList.remove('is-open');
    $$('.drawer, .mobile-nav').forEach(el => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); });
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
  }

  /* ------------------------------- 4. SEPET ------------------------------ */
  const Cart = {
    KEY: 'lokart.cart.v1',
    items: [],

    load() {
      try {
        const raw = localStorage.getItem(this.KEY);
        this.items = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(this.items)) this.items = [];
      } catch (e) { this.items = []; }
    },
    save() {
      try { localStorage.setItem(this.KEY, JSON.stringify(this.items)); }
      catch (e) { console.warn('[Lok-Art] Sepet kaydedilemedi', e); }
      this.paint();
    },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },

    add(entry, qty) {
      qty = qty || 1;
      const key = entry.key || ('p-' + entry.id);
      const found = this.items.find(i => i.key === key);
      if (found) found.qty += qty;
      else this.items.push({
        key, id: entry.id || null, name: entry.name, price: entry.price,
        image: entry.image, meta: entry.meta || '', qty
      });
      this.save();
      toast(entry.name + ' sepete eklendi.');
    },
    setQty(key, qty) {
      const it = this.items.find(i => i.key === key);
      if (!it) return;
      it.qty = Math.max(0, qty);
      if (it.qty === 0) this.items = this.items.filter(i => i.key !== key);
      this.save();
    },
    remove(key) { this.items = this.items.filter(i => i.key !== key); this.save(); },
    clear() { this.items = []; this.save(); },

    open() { this.render(); openPanel($('#cartDrawer')); },

    paint() {
      const n = this.count();
      $$('[data-cart-count]').forEach(el => {
        el.textContent = n;
        el.classList.toggle('is-visible', n > 0);
      });
      if ($('#cartDrawer') && $('#cartDrawer').classList.contains('is-open')) this.render();
    },

    render() {
      const body = $('#cartBody'), foot = $('#cartFoot');
      if (!body || !foot) return;

      if (!this.items.length) {
        body.innerHTML =
          '<div class="empty">' + ICONS.cart +
          '<p>Sepetiniz henüz boş.</p>' +
          '<a class="btn btn--outline btn--sm" href="urunler.html">Koleksiyonu keşfet</a></div>';
        foot.innerHTML = '';
        return;
      }

      body.innerHTML = this.items.map(i =>
        '<article class="line-item">' +
          '<img class="line-item__img" src="' + esc(i.image) + '" alt="" loading="lazy" width="72" height="72">' +
          '<div>' +
            '<h3 class="line-item__name">' + esc(i.name) + '</h3>' +
            (i.meta ? '<p class="line-item__meta">' + esc(i.meta) + '</p>' : '') +
            '<div class="qty">' +
              '<button type="button" data-qty="-1" data-key="' + esc(i.key) + '" aria-label="Adet azalt">&minus;</button>' +
              '<span>' + i.qty + '</span>' +
              '<button type="button" data-qty="1" data-key="' + esc(i.key) + '" aria-label="Adet artır">+</button>' +
            '</div>' +
            '<button type="button" class="line-item__remove" data-remove="' + esc(i.key) + '">Kaldır</button>' +
          '</div>' +
          '<span class="line-item__price">' + money(i.price * i.qty) + '</span>' +
        '</article>'
      ).join('');

      const total = this.total();
      const remaining = CONFIG.freeShippingLimit - total;
      foot.innerHTML =
        '<div class="totals">' +
          '<div class="totals__row"><span>Ara toplam</span><span>' + money(total) + '</span></div>' +
          '<div class="totals__row"><span>Kargo</span><span>' +
            (remaining <= 0 ? 'Ücretsiz' : money(CONFIG.freeShippingLimit) + ' üzerine ücretsiz') + '</span></div>' +
          '<div class="totals__row totals__row--grand"><span>Toplam</span><span>' + money(total) + '</span></div>' +
        '</div>' +
        (remaining > 0
          ? '<p class="small muted" style="margin-bottom:1rem">Ücretsiz kargoya <strong>' + money(remaining) + '</strong> kaldı.</p>'
          : '<p class="small" style="color:var(--success);margin-bottom:1rem">Kargonuz ücretsiz.</p>') +
        '<button class="btn btn--wa btn--block" type="button" data-checkout>' + ICONS.wa + ' WhatsApp ile siparişi tamamla</button>' +
        '<button class="btn btn--outline btn--block btn--sm" type="button" data-mail-order style="margin-top:.6rem">E-posta ile gönder</button>' +
        '<p class="small muted text-center" style="margin-top:.9rem">Siparişiniz WhatsApp üzerinden onaylanır; ödeme ve kargo detayları ekibimizce iletilir.</p>';
    },

    orderText() {
      const lines = ['*LOK-ART SİPARİŞ TALEBİ*', ''];
      this.items.forEach((i, idx) => {
        lines.push((idx + 1) + '. ' + i.name + (i.meta ? ' (' + i.meta + ')' : ''));
        lines.push('   ' + i.qty + ' adet × ' + money(i.price) + ' = ' + money(i.price * i.qty));
      });
      lines.push('', '*Toplam: ' + money(this.total()) + '*', '',
        'Ad Soyad: ', 'Teslimat adresi: ', 'Notunuz: ');
      return lines.join('\n');
    },

    checkout() {
      if (!this.items.length) { toast('Sepetiniz boş.', 'error'); return; }
      window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(this.orderText()), '_blank', 'noopener');
    },
    mailOrder() {
      if (!this.items.length) { toast('Sepetiniz boş.', 'error'); return; }
      location.href = 'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent('Lok-Art Sipariş Talebi') +
        '&body=' + encodeURIComponent(this.orderText().replace(/\*/g, ''));
    }
  };

  /* Sepet olayları (olay delegasyonu) */
  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    if (q) { const it = Cart.items.find(i => i.key === q.dataset.key); if (it) Cart.setQty(q.dataset.key, it.qty + Number(q.dataset.qty)); return; }
    const r = e.target.closest('[data-remove]');
    if (r) { Cart.remove(r.dataset.remove); return; }
    if (e.target.closest('[data-checkout]')) { Cart.checkout(); return; }
    if (e.target.closest('[data-mail-order]')) { Cart.mailOrder(); return; }
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      const p = productById(add.dataset.add);
      if (!p) return;
      const qtyInput = add.dataset.qtyFrom ? $(add.dataset.qtyFrom) : null;
      Cart.add({ id: p.id, name: p.name, price: p.price, image: p.image, meta: p.weight || '' },
        qtyInput ? Number(qtyInput.textContent) || 1 : 1);
    }
  });

  /* --------------------------- 5. ÜRÜN KARTLARI -------------------------- */
  function cardHTML(p, opts) {
    opts = opts || {};
    return '<article class="card' + (opts.reveal ? ' reveal' : '') + '">' +
      '<div class="card__media">' +
        (p.signature ? '<span class="card__flag">İmza</span>' : '') +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="400" height="500">' +
      '</div>' +
      '<div class="card__body">' +
        '<span class="card__cat">' + esc(p.category) + '</span>' +
        '<h3 class="card__title">' + esc(p.name) + '</h3>' +
        (p.weight ? '<p class="card__meta">' + esc(p.weight) + '</p>' : '') +
        '<div class="card__foot">' +
          '<span class="card__price">' + money(p.price) + '</span>' +
          '<button class="card__add" type="button" data-add="' + p.id + '" aria-label="' + esc(p.name) + ' ürününü sepete ekle">' + ICONS.plus + '</button>' +
        '</div>' +
      '</div>' +
      '<a class="card__link" href="urun.html?u=' + encodeURIComponent(p.slug) + '"><span class="sr-only">' + esc(p.name) + ' detayları</span></a>' +
    '</article>';
  }

  /* -------------------------- 6. SAYFA MANTIKLARI ------------------------ */
  const Pages = {

    /* ---------- Ana sayfa ---------- */
    home() {
      const sig = $('#signatureShelf');
      if (sig) {
        const items = DB.products.filter(p => p.signature).concat(
          DB.products.filter(p => p.featured && !p.signature)).slice(0, 10);
        sig.innerHTML = items.map(p => cardHTML(p)).join('');
      }

      const featured = $('#featuredGrid');
      if (featured) {
        const picks = DB.products.filter(p => p.featured).slice(0, 8);
        featured.innerHTML = picks.map((p, i) => cardHTML(p, { reveal: true })).join('');
      }

      const cats = $('#categoryGrid');
      if (cats) {
        const pick = ['sarma-lokum', 'cifte-kavrulmus', 'hediye-kutulari', 'parmak-lokum'];
        cats.innerHTML = pick.map(slug => {
          const c = DB.categories.find(x => x.slug === slug);
          if (!c) return '';
          const sample = DB.products.find(p => p.categorySlug === slug);
          return '<a class="cat-card reveal" href="urunler.html?kategori=' + slug + '">' +
            '<img src="' + esc(sample ? sample.image : 'assets/lok_art_1.avif') + '" alt="" loading="lazy" width="400" height="300">' +
            '<h3>' + esc(c.name) + '</h3>' +
            '<span>' + c.count + ' ürün</span></a>';
        }).join('');
      }
      initReveal();
    },

    /* ---------- Koleksiyon ---------- */
    catalog() {
      const grid = $('#catalogGrid');
      if (!grid) return;
      const chipsHost = $('#catChips');
      const sortSel = $('#sortSelect');
      const searchIn = $('#searchInput');
      const countEl = $('#resultCount');
      const moreBtn = $('#loadMore');
      const PAGE = 24;
      let shown = PAGE;

      const state = {
        cat: param('kategori') || 'all',
        q: param('ara') || '',
        sort: param('sirala') || 'default'
      };
      if (searchIn) searchIn.value = state.q;
      if (sortSel) sortSel.value = state.sort;

      if (chipsHost) {
        chipsHost.innerHTML =
          '<button class="chip" type="button" data-cat="all">Tümü</button>' +
          DB.categories.map(c => '<button class="chip" type="button" data-cat="' + c.slug + '">' + esc(c.name) + '</button>').join('');
      }

      function filtered() {
        let list = DB.products.slice();
        if (state.cat !== 'all') list = list.filter(p => p.categorySlug === state.cat);
        if (state.q.trim()) {
          const q = state.q.toLocaleLowerCase('tr');
          list = list.filter(p =>
            p.name.toLocaleLowerCase('tr').indexOf(q) > -1 ||
            p.category.toLocaleLowerCase('tr').indexOf(q) > -1);
        }
        if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
        else if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
        else if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        return list;
      }

      function syncUrl() {
        const u = new URLSearchParams();
        if (state.cat !== 'all') u.set('kategori', state.cat);
        if (state.q.trim()) u.set('ara', state.q.trim());
        if (state.sort !== 'default') u.set('sirala', state.sort);
        const qs = u.toString();
        history.replaceState(null, '', qs ? '?' + qs : location.pathname);
      }

      function render(resetPage) {
        if (resetPage) shown = PAGE;
        const list = filtered();
        $$('.chip', chipsHost).forEach(c => c.classList.toggle('is-active', c.dataset.cat === state.cat));

        if (!list.length) {
          grid.innerHTML = '';
          grid.insertAdjacentHTML('beforeend',
            '<div class="empty" style="grid-column:1/-1">' + ICONS.search +
            '<p>Aramanıza uygun ürün bulunamadı.</p>' +
            '<button class="btn btn--outline btn--sm" type="button" id="resetFilters">Filtreleri temizle</button></div>');
        } else {
          grid.innerHTML = list.slice(0, shown).map(p => cardHTML(p)).join('');
        }
        if (countEl) countEl.textContent = list.length + ' ürün';
        if (moreBtn) moreBtn.classList.toggle('hidden', shown >= list.length);
        const activeCatName = state.cat === 'all' ? null : (DB.categories.find(c => c.slug === state.cat) || {}).name;
        const h = $('#catalogHeading');
        if (h) h.textContent = activeCatName || 'Tüm Koleksiyon';
        syncUrl();
      }

      if (chipsHost) chipsHost.addEventListener('click', (e) => {
        const c = e.target.closest('[data-cat]'); if (!c) return;
        state.cat = c.dataset.cat; render(true);
      });
      if (sortSel) sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(true); });
      if (searchIn) searchIn.addEventListener('input', debounce(() => { state.q = searchIn.value; render(true); }, 220));
      if (moreBtn) moreBtn.addEventListener('click', () => { shown += PAGE; render(false); });
      grid.addEventListener('click', (e) => {
        if (e.target.id === 'resetFilters') {
          state.cat = 'all'; state.q = ''; state.sort = 'default';
          if (searchIn) searchIn.value = ''; if (sortSel) sortSel.value = 'default';
          render(true);
        }
      });

      render(true);
    },

    /* ---------- Ürün detay ---------- */
    product() {
      const host = $('#pdp');
      if (!host) return;
      const slug = param('u');
      const p = slug ? productBySlug(slug) : productById(param('id'));

      if (!p) {
        host.innerHTML = '<div class="empty" style="grid-column:1/-1">' + ICONS.search +
          '<h1 class="h3">Ürün bulunamadı</h1>' +
          '<p>Aradığınız ürün kaldırılmış veya bağlantı hatalı olabilir.</p>' +
          '<a class="btn btn--outline btn--sm" href="urunler.html">Koleksiyona dön</a></div>';
        return;
      }

      document.title = p.name + ' | ' + CONFIG.brand;
      const md = $('meta[name="description"]');
      if (md) md.setAttribute('content', p.shortDesc + ' ' + money(p.price) + '. Glikozsuz, el yapımı.');

      const crumb = $('#crumbCurrent');
      if (crumb) crumb.textContent = p.name;
      const crumbCat = $('#crumbCat');
      if (crumbCat) { crumbCat.textContent = p.category; crumbCat.href = 'urunler.html?kategori=' + p.categorySlug; }

      host.innerHTML =
        '<div class="pdp__media"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" width="800" height="800" fetchpriority="high"></div>' +
        '<div>' +
          '<span class="eyebrow">' + esc(p.category) + '</span>' +
          '<h1 class="h2 pdp__title">' + esc(p.name) + '</h1>' +
          '<p class="pdp__price">' + money(p.price) + '</p>' +
          '<p class="small muted">KDV dahil' + (p.weight ? ' · ' + esc(p.weight) : '') + '</p>' +
          '<div class="pdp__badges" style="margin-top:1.25rem">' + p.badges.map(b => '<span class="badge">' + esc(b) + '</span>').join('') + '</div>' +
          '<p class="pdp__desc">' + esc(p.description) + '</p>' +
          '<div class="pdp__buy">' +
            '<div class="qty" id="pdpQty">' +
              '<button type="button" data-pdp-qty="-1" aria-label="Adet azalt">&minus;</button>' +
              '<span id="pdpQtyVal">1</span>' +
              '<button type="button" data-pdp-qty="1" aria-label="Adet artır">+</button>' +
            '</div>' +
            '<button class="btn btn--gold" type="button" data-add="' + p.id + '" data-qty-from="#pdpQtyVal" style="flex:1">Sepete ekle</button>' +
            '<a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/' + CONFIG.whatsapp + '?text=' +
              encodeURIComponent(p.name + ' ürünü hakkında bilgi almak istiyorum.') + '">' + ICONS.wa + ' Sor</a>' +
          '</div>' +
          '<div class="pdp__note"><span>' + ICONS.leaf + '</span><span><strong>Tadım notu</strong>' + esc(p.tastingNote) + '</span></div>' +
          '<div class="pdp__note"><span>&#9749;</span><span><strong>Eşleştirme önerisi</strong>' + esc(p.pairing) + '</span></div>' +
          '<table class="spec"><tbody>' +
            '<tr><th>Kategori</th><td>' + esc(p.category) + '</td></tr>' +
            (p.weight ? '<tr><th>Net ağırlık</th><td>' + esc(p.weight) + '</td></tr>' : '') +
            '<tr><th>İçerik</th><td>Doğal kaynak suyu, nişasta, şeker, hakiki bal, doğal aroma. Glikoz şurubu içermez.</td></tr>' +
            '<tr><th>Üretim</th><td>Odun ateşinde bakır kazanda, el yapımı</td></tr>' +
            '<tr><th>Saklama</th><td>Serin ve kuru ortamda, doğrudan güneş ışığından uzakta</td></tr>' +
            '<tr><th>Raf ömrü</th><td>Üretim tarihinden itibaren 6 ay</td></tr>' +
            '<tr><th>Kargo</th><td>' + money(CONFIG.freeShippingLimit) + ' üzeri siparişlerde ücretsiz</td></tr>' +
          '</tbody></table>' +
        '</div>';

      host.addEventListener('click', (e) => {
        const b = e.target.closest('[data-pdp-qty]'); if (!b) return;
        const el = $('#pdpQtyVal');
        el.textContent = Math.max(1, (Number(el.textContent) || 1) + Number(b.dataset.pdpQty));
      });

      /* Benzer ürünler */
      const rel = $('#relatedGrid');
      if (rel) {
        let list = DB.products.filter(x => x.categorySlug === p.categorySlug && x.id !== p.id);
        if (list.length < 4) list = list.concat(DB.products.filter(x => x.id !== p.id && x.categorySlug !== p.categorySlug));
        rel.innerHTML = list.slice(0, 4).map(x => cardHTML(x)).join('');
      }

      /* Yapılandırılmış veri (SEO) */
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Product',
        name: p.name, description: p.shortDesc,
        image: CONFIG.siteUrl + '/' + p.image,
        category: p.category,
        brand: { '@type': 'Brand', name: CONFIG.brand },
        offers: {
          '@type': 'Offer', priceCurrency: 'TRY', price: p.price.toFixed(2),
          availability: 'https://schema.org/InStock',
          url: CONFIG.siteUrl + '/urun.html?u=' + p.slug
        }
      });
      document.head.appendChild(ld);
    },

    /* ---------- Kendi kutunu yarat ---------- */
    box() {
      const picker = $('#boxPicker'), grid = $('#boxGrid');
      if (!picker || !grid) return;

      const LOKUM = ['sarma-lokum', 'parmak-lokum', 'cifte-kavrulmus', 'sade-lokum', 'fitil-lokum'];
      const pool = DB.products.filter(p => LOKUM.indexOf(p.categorySlug) > -1);
      const slotPrice = (p) => (p.price >= 240 ? CONFIG.boxSlotPremium : CONFIG.boxSlotStandard);
      let slots = [];

      picker.innerHTML = pool.map(p =>
        '<button class="picker__item" type="button" data-pick="' + p.id + '">' +
          '<img src="' + esc(p.image) + '" alt="" loading="lazy" width="46" height="46">' +
          '<span>' + esc(p.name) + '<b>+' + money(slotPrice(p)) + '</b></span>' +
        '</button>').join('');

      function paint() {
        grid.innerHTML = Array.from({ length: CONFIG.boxSize }, (_, i) => {
          const s = slots[i];
          return s
            ? '<div class="box-slot is-filled"><img src="' + esc(s.image) + '" alt="' + esc(s.name) + '">' +
              '<button class="box-slot__x" type="button" data-unpick="' + i + '" aria-label="' + esc(s.name) + ' çıkar">&times;</button></div>'
            : '<div class="box-slot" aria-hidden="true">+</div>';
        }).join('');

        const sum = slots.reduce((t, s) => t + slotPrice(s), 0);
        const total = slots.length ? CONFIG.boxBasePrice + sum : 0;
        $('#boxCount').textContent = slots.length;
        $('#boxTotal').textContent = money(total);
        $('#boxAdd').disabled = slots.length === 0;
        const list = $('#boxList');
        if (list) {
          list.innerHTML = slots.length
            ? slots.map(s => '<li class="small muted">• ' + esc(s.name) + '</li>').join('')
            : '<li class="small muted">Henüz çeşit seçilmedi.</li>';
        }
      }

      picker.addEventListener('click', (e) => {
        const b = e.target.closest('[data-pick]'); if (!b) return;
        if (slots.length >= CONFIG.boxSize) { toast('Kutunuz dolu. Önce bir çeşit çıkarın.', 'error'); return; }
        slots.push(productById(b.dataset.pick));
        paint();
      });
      grid.addEventListener('click', (e) => {
        const b = e.target.closest('[data-unpick]'); if (!b) return;
        slots.splice(Number(b.dataset.unpick), 1);
        paint();
      });
      $('#boxClear').addEventListener('click', () => { slots = []; paint(); });
      $('#boxAdd').addEventListener('click', () => {
        if (!slots.length) return;
        const total = CONFIG.boxBasePrice + slots.reduce((t, s) => t + slotPrice(s), 0);
        Cart.add({
          key: 'box-' + Date.now(),
          name: 'İmza Kutu (' + slots.length + ' çeşit)',
          price: total,
          image: slots[0].image,
          meta: slots.map(s => s.name).join(', ')
        });
        slots = []; paint();
      });

      $('#boxBase').textContent = money(CONFIG.boxBasePrice);
      paint();
    },

    /* ---------- Formlar (kurumsal + iletişim) ---------- */
    forms() {
      $$('form[data-order-form]').forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!form.reportValidity()) return;

          const data = new FormData(form);
          const title = form.dataset.orderForm || 'Form';
          const lines = ['*LOK-ART — ' + title.toUpperCase() + '*', ''];
          for (const [k, v] of data.entries()) {
            if (k === 'kvkk' || !String(v).trim()) continue;
            const label = (form.querySelector('[name="' + k + '"]')?.dataset.label) || k;
            lines.push('*' + label + ':* ' + v);
          }
          const text = lines.join('\n');
          const mode = e.submitter && e.submitter.dataset.send === 'mail' ? 'mail' : 'wa';

          if (mode === 'mail') {
            location.href = 'mailto:' + CONFIG.email +
              '?subject=' + encodeURIComponent('Lok-Art — ' + title) +
              '&body=' + encodeURIComponent(text.replace(/\*/g, ''));
          } else {
            window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
          }
          toast('Talebiniz iletilmek üzere hazırlandı.');
          form.reset();
        });
      });
    },

    /* ---------- SSS akordiyonu ---------- */
    accordion() {
      $$('.acc__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!open));
        });
      });
    }
  };

  /* ------------------------------ 7. BAŞLATMA ---------------------------- */
  function init() {
    buildShell();
    Cart.load();
    Cart.paint();
    Pages.forms();
    Pages.accordion();
    initReveal();

    const page = document.body.dataset.page;
    const needsData = ['home', 'catalog', 'product', 'box'].indexOf(page) > -1;
    if (!needsData) return;

    loadData().then(() => {
      if (page === 'home') Pages.home();
      else if (page === 'catalog') Pages.catalog();
      else if (page === 'product') Pages.product();
      else if (page === 'box') Pages.box();
      initReveal();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* Dışarıya açılan küçük yüzey (konsol / ileride entegrasyon için) */
  window.LokArt = { Cart, CONFIG, get data() { return DB; } };
})();
