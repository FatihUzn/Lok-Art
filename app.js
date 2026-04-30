let allProducts = []; 
let currentFilteredProducts = []; // Sıralama yapmak için aktif listeyi tutar

// --- 1. ANA SİSTEM BAŞLATICI (TÜM KODLAR GÜVENLİ BLOKTA) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- PRELOADER (OPTİMİZE EDİLMİŞ) ---
    const preloader = document.getElementById('preloader');
    // Sayfa iskeleti yüklendiğinde, ağır videoları beklemeden perdeyi aç
    setTimeout(() => {
        if(preloader) {
            preloader.classList.add('hide');
            // Perde kalktıktan sonra HTML'den tamamen sil ki RAM'de yer kaplamasın
            setTimeout(() => preloader.remove(), 1000); 
        }
    }, 800);
    
    // 1. Şeffaf Navigasyon Efekti
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar?.classList.add('scrolled'); // Güvenli çağrı
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

    // 2. Ürünleri Çekme
    fetch('data/products.json')
        .then(response => response.json())
        .then(products => {
            allProducts = products; 
            currentFilteredProducts = [...allProducts]; // Başlangıçta hepsi var
            applySortingAndRender(); // Sıralayıp ekrana bas
            setupBoxBuilder(allProducts); 
        })
        .catch(error => {
            console.error('Veri Hatası:', error);
            const container = document.getElementById('products-container');
            if(container) container.innerHTML = '<p>Ürünler yüklenemedi. Lütfen internet bağlantınızı kontrol edin.</p>';
        });

    // 3. Kategori Filtreleme
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.getAttribute('data-filter');
            
            if (category === 'all') {
                currentFilteredProducts = [...allProducts];
            } else {
                currentFilteredProducts = allProducts.filter(p => p.category === category);
            }
            // Filtre değiştikten sonra mevcut sıralama kuralını tekrar uygula
            applySortingAndRender();
        });
    });

    // 4. Sıralama (Dropdown) Dinleyicisi
    const sortSelect = document.getElementById('sortSelect');
    if(sortSelect) sortSelect.addEventListener('change', applySortingAndRender);
}); 
// ANA BLOK BURADA KUSURSUZCA KAPANIR. HATA ÇÖZÜLDÜ!

// ==========================================
// YARDIMCI FONKSİYONLAR (GÜVENLİK YAMALI)
// ==========================================

// Fiyatları sayısal değere çeviren zırhlı fonksiyon
function parsePrice(priceStr) {
    if (!priceStr) return 0; // Boş gelirse sistemi çökertme
    if (typeof priceStr === 'number') return priceStr; // Eğer JSON'da zaten sayıysa doğrudan al
    // "1.343,00 TL" -> 1343.00 formatına çevirir
    return parseFloat(priceStr.replace(/\./g, '').replace(',', '.').replace(' TL', ''));
}

// Sıralamayı Uygulayıp Ekrana Basan Ana Fonksiyon
function applySortingAndRender() {
    const sortVal = document.getElementById('sortSelect').value;
    let productsToRender = [...currentFilteredProducts];

    if (sortVal === 'price-asc') {
        productsToRender.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortVal === 'price-desc') {
        productsToRender.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    // 'default' ise orijinal JSON sırasıyla kalır

    renderProducts(productsToRender);
}

// ==========================================
// THE MASTER ROUTER (AKILLI DAĞITICI)
// ==========================================

function renderProducts(productsToRender) {
    // 1. İSTASYONLARI (HTML KONTEYNERLERİNİ) SEÇ VE TEMİZLE
    const containerFullList = document.getElementById('list-container');
    const containerCoverflow = document.getElementById('coverflow-container');
    const containerShelfSarma = document.getElementById('shelf-sarmalar');
    const containerShelfParmak = document.getElementById('shelf-parmak');
    const containerHauteCouture = document.getElementById('haute-couture-container');
    
    if (containerFullList) containerFullList.innerHTML = '';
    if (containerCoverflow) containerCoverflow.innerHTML = '';
    if (containerShelfSarma) containerShelfSarma.innerHTML = '';
    if (containerShelfParmak) containerShelfParmak.innerHTML = '';
    if (containerHauteCouture) containerHauteCouture.innerHTML = '';

    // ==========================================
    // MODÜL 5: SATIR VE İKON (TÜM LİSTE)
    // ==========================================
    const displayProducts = productsToRender.slice(0, 100); 
    displayProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'list-item reveal';
        item.innerHTML = `
            <div class="list-img-wrapper">
                <img src="${product.image}" class="list-img" alt="${product.name}">
            </div>
            <div class="list-info">
                <span class="list-category">${product.category}</span>
                <h3 class="list-title">${product.name}</h3>
            </div>
            <div class="list-action-group">
                <span class="list-price">${product.price}</span>
                <button class="list-add-btn">+</button>
            </div>
        `;
        item.addEventListener('click', () => openAppleSheet(product));
        if (containerFullList) containerFullList.appendChild(item);
    });

    // ==========================================
    // MODÜL 4: NETFLIX RAFLARI (YATAY AKIŞ)
    // ==========================================
    const sarmalar = allProducts.filter(p => p.category.toLowerCase().includes('sarma'));
    sarmalar.slice(0, 10).forEach(product => {
        const card = createNetflixCard(product);
        if (containerShelfSarma) containerShelfSarma.appendChild(card);
    });

    const parmaklar = allProducts.filter(p => p.category.toLowerCase().includes('parmak'));
    parmaklar.slice(0, 10).forEach(product => {
        const card = createNetflixCard(product);
        if (containerShelfParmak) containerShelfParmak.appendChild(card);
    });

    // ==========================================
    // MODÜL 2: COVERFLOW (PRESTİJ VİTRİNİ)
    // ==========================================
    const premiumProducts = [...allProducts].sort((a, b) => parsePrice(b.price) - parsePrice(a.price)).slice(0, 5);
    premiumProducts.forEach((product, index) => {
        const cCard = document.createElement('div');
        let cClass = 'hidden-card';
        if(index === 0) cClass = 'active';
        else if(index === 1) cClass = 'next';
        else if(index === premiumProducts.length - 1) cClass = 'prev';
        
        cCard.className = `coverflow-card ${cClass}`;
        cCard.innerHTML = `
            <div class="coverflow-img" style="background-image: url('${product.image}')"></div>
            <div class="coverflow-info">
                <h3>${product.name}</h3>
                <span class="price">${product.price}</span>
            </div>
        `;
        cCard.addEventListener('click', () => openAppleSheet(product));
        if(containerCoverflow) containerCoverflow.appendChild(cCard);
    });
    initCoverflowLogic();

    // ==========================================
    // MODÜL 3: HAUTE COUTURE (SANATSAL BLOK)
    // ==========================================
    if (containerHauteCouture) {
        const coutureProducts = allProducts.filter(p => p.name.includes('Gül') || p.category.includes('Hediye')).slice(0, 3);
        coutureProducts.forEach(product => {
            const coutureItem = document.createElement('div');
            coutureItem.className = 'couture-item reveal';
            coutureItem.innerHTML = `
                <div class="couture-img-wrapper">
                    <img src="${product.image}" class="couture-img" alt="${product.name}">
                </div>
                <div class="couture-info">
                    <div class="couture-tag">${product.category}</div>
                    <h3 class="couture-title">${product.name}</h3>
                    <div class="couture-subtitle">Özel Seri</div>
                    <div class="couture-price-row">
                        <div class="couture-line"></div>
                        <span class="couture-price">${product.price}</span>
                    </div>
                </div>
            `;
            coutureItem.addEventListener('click', () => openAppleSheet(product));
            containerHauteCouture.appendChild(coutureItem);
        });
    }

    // ==========================================
    // REVEAL ANİMASYONUNU TETİKLE
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 }); 
    revealElements.forEach(el => observer.observe(el));
}

// ------------------------------------------
// YARDIMCI FABRİKA FONKSİYONU: NETFLIX KARTI ÜRETİCİSİ
function createNetflixCard(product) {
    const card = document.createElement('div');
    card.className = 'netflix-card';
    card.innerHTML = `
        <div class="netflix-img-container">
            <img src="${product.image}" class="netflix-img" alt="${product.name}">
        </div>
        <div class="netflix-info">
            <div>
                <div class="netflix-category">${product.category}</div>
                <h3 class="netflix-title">${product.name}</h3>
            </div>
            <div class="netflix-price">${product.price}</div>
        </div>
    `;
    card.addEventListener('click', () => openAppleSheet(product));
    return card;
}

// ------------------------------------------
// MODÜL 1: APPLE SHEET (ALT ÇEKMECE) KONTROLCÜSÜ
function openAppleSheet(product) {
    const sheet = document.getElementById('apple-sheet-modal');
    const sheetContent = document.getElementById('sheet-content');
    
    if(!sheet || !sheetContent) return;

    // Eğer arkada karanlık overlay yoksa oluştur (Sadece 1 kere)
    let overlay = document.getElementById('sheet-overlay-bg');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sheet-overlay-bg';
        overlay.className = 'sheet-overlay';
        document.body.appendChild(overlay);
        // Boşluğa tıklayınca çekmeceyi kapat
        overlay.addEventListener('click', closeAppleSheet);
    }

    // Çekmece içeriğini ürüne göre dinamik doldur
    sheetContent.innerHTML = `
        <div class="sheet-img" style="background-image: url('${product.image}')"></div>
        <div class="sheet-info">
            <span class="list-category" style="margin-bottom:0;">${product.category}</span>
            <h3>${product.name}</h3>
            <p>1. Sınıf %100 doğal içerik, glikozsuz üretim.</p>
            <div class="sheet-action">
                <span class="sheet-price">${product.price}</span>
                <button class="sheet-add-btn" onclick="addToCart('${product.name}'); closeAppleSheet();">Sepete Ekle</button>
            </div>
        </div>
    `;

    // Çekmeceyi ve perdeyi yukarı çek
    sheet.classList.add('active');
    overlay.classList.add('active');
    
    if (typeof triggerHaptic === 'function') triggerHaptic(30);
}

function closeAppleSheet() {
    const sheet = document.getElementById('apple-sheet-modal');
    const overlay = document.getElementById('sheet-overlay-bg');
    if(sheet) sheet.classList.remove('active');
    if(overlay) overlay.classList.remove('active');
}

// Çekmeceyi üst çizgisinden (Grabber) tutup aşağı çekerek kapatma fizikleri
document.addEventListener('DOMContentLoaded', () => {
    const sheet = document.getElementById('apple-sheet-modal');
    const grabber = document.querySelector('.sheet-grabber');
    
    if(sheet && grabber) {
        let isDragging = false;
        let startY = 0;

        grabber.addEventListener('mousedown', (e) => { isDragging = true; startY = e.clientY; });
        grabber.addEventListener('touchstart', (e) => { isDragging = true; startY = e.touches[0].clientY; });
        
        window.addEventListener('mouseup', () => { isDragging = false; sheet.style.transform = ''; });
        window.addEventListener('touchend', () => { isDragging = false; sheet.style.transform = ''; });

        window.addEventListener('mousemove', (e) => handleDrag(e.clientY));
        window.addEventListener('touchmove', (e) => handleDrag(e.touches[0].clientY));

        function handleDrag(clientY) {
            if(!isDragging) return;
            const deltaY = clientY - startY;
            if(deltaY > 0) { // Sadece aşağı çekmeye izin ver
                sheet.style.transform = `translateY(${deltaY}px)`;
                if(deltaY > 100) { // Yeterince aşağı çekildiyse kapat
                    isDragging = false;
                    sheet.style.transform = '';
                    closeAppleSheet();
                }
            }
        }
    }
});

// ------------------------------------------
// MODÜL 2: COVERFLOW 3D HAREKET MOTORU
function initCoverflowLogic() {
    const cards = document.querySelectorAll('.coverflow-card');
    if(cards.length === 0) return;

    cards.forEach((card, index) => {
        card.addEventListener('click', function(e) {
            // Apple Sheet'in açılmasını (satır 104) engelleme, önce 3D dönüşü yap
            // Eğer kart zaten ortadaysa (active) hiçbir şey yapma, bırak Apple Sheet açılsın
            if (this.classList.contains('active')) return;
            
            // Eğer kart yanlardaysa, ortaya al (Apple Sheet açılmasını geçici olarak engelle)
            e.stopPropagation(); 

            cards.forEach(c => c.className = 'coverflow-card hidden-card'); // Hepsini gizle

            this.className = 'coverflow-card active'; // Tıklananı merkeze al
            
            // Sol ve sağdaki kartları ayarla
            const prevIndex = (index - 1 + cards.length) % cards.length;
            const nextIndex = (index + 1) % cards.length;

            cards[prevIndex].className = 'coverflow-card prev';
            cards[nextIndex].className = 'coverflow-card next';
            
            if (typeof triggerHaptic === 'function') triggerHaptic(20);
        });
    });
}
// ==========================================
    // MODÜL 3: HAUTE COUTURE (SANATSAL BLOK)
    // ==========================================
    const containerHauteCouture = document.getElementById('haute-couture-container');
    if (containerHauteCouture) {
        containerHauteCouture.innerHTML = '';
        
        // İsmi çok uzun olmayan, rastgele veya özel bir kategorideki 3 ürünü seçelim
        // Örnek: "Gül" geçenleri veya Hediye Kutularını alalım
        const coutureProducts = allProducts.filter(p => p.name.includes('Gül') || p.category.includes('Hediye')).slice(0, 3);
        
        coutureProducts.forEach(product => {
            const coutureItem = document.createElement('div');
            coutureItem.className = 'couture-item reveal';
            coutureItem.innerHTML = `
                <div class="couture-img-wrapper">
                    <img src="${product.image}" class="couture-img" alt="${product.name}">
                </div>
                <div class="couture-info">
                    <div class="couture-tag">${product.category}</div>
                    <h3 class="couture-title">${product.name}</h3>
                    <div class="couture-subtitle">Özel Seri</div>
                    <div class="couture-price-row">
                        <div class="couture-line"></div>
                        <span class="couture-price">${product.price}</span>
                    </div>
                </div>
            `;
            // Tıklayınca yine Apple Sheet açılsın
            coutureItem.addEventListener('click', () => openAppleSheet(product));
            containerHauteCouture.appendChild(coutureItem);
        });
    }

// --- SEPET VE BİLDİRİM (TOAST) SİSTEMİ ---
let cartTotal = 0;
function addToCart(productName) {
    cartTotal++;
    document.getElementById('cart-count').innerText = cartTotal;
    showToast(`✓ ${productName} sepete eklendi.`);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;

    container.appendChild(toast);

    // 3 saniye sonra kaybolma animasyonu başlat
    setTimeout(() => {
        toast.classList.add('fade-out');
        // Animasyon bitince DOM'dan tamamen temizle (Performans için)
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// --- KENDİ KUTUNU YARAT MODÜLÜ ---
let boxItems = []; 
const MAX_BOX_SIZE = 6; 
const BOX_BASE_PRICE = 150.00; 

function setupBoxBuilder(products) {
    const optionsContainer = document.getElementById('box-options');
    const boxEligibleProducts = products.filter(p => p.category.includes('Sarma') || p.category.includes('Parmak') || p.category.includes('Çifte Kavrulmuş'));

    boxEligibleProducts.slice(0, 20).forEach(product => {
        const rawPrice = parsePrice(product.price);
        const piecePrice = (rawPrice / 35).toFixed(2); 

        const optionHTML = `
            <div class="option-card" onclick="addToBox('${product.name}', '${product.image}', ${piecePrice})">
                <div class="option-img" style="background-image: url('${product.image}')"></div>
                <div class="option-info">
                    <h4>${product.name}</h4>
                    <p>${piecePrice.replace('.', ',')} TL</p>
                </div>
            </div>
        `;
        optionsContainer.innerHTML += optionHTML;
    });
    
    updateBoxUI(); 
}

function addToBox(name, image, price) {
    if (boxItems.length >= MAX_BOX_SIZE) {
        showToast("⚠️ Kutunuzda boş yer kalmadı.");
        return;
    }
    boxItems.push({ name, image, price });
    updateBoxUI();
}

window.removeFromBox = function(index) {
    boxItems.splice(index, 1);
    updateBoxUI();
}

function updateBoxUI() {
    const grid = document.getElementById('box-grid');
    const slots = grid.querySelectorAll('.box-slot');
    
    let currentTotal = BOX_BASE_PRICE; 

    slots.forEach(slot => {
        slot.className = 'box-slot empty';
        slot.innerHTML = '';
    });

    boxItems.forEach((item, index) => {
        currentTotal += parseFloat(item.price);
        const slot = slots[index];
        slot.className = 'box-slot filled';
        slot.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="remove-item" onclick="removeFromBox(${index})">✕</div>
        `;
    });

    document.getElementById('box-count').innerText = boxItems.length;
    document.getElementById('box-price').innerText = currentTotal.toFixed(2).replace('.', ',') + ' TL';

    const btn = document.getElementById('add-box-to-cart');
    
    // 6. Ürün eklendiğinde buton parlasın, eksiği varsa düz kalsın
    if (boxItems.length > 0) {
        btn.removeAttribute('disabled');
        if(boxItems.length === MAX_BOX_SIZE) {
            btn.classList.add('glow-effect');
        } else {
            btn.classList.remove('glow-effect');
        }
    } else {
        btn.setAttribute('disabled', 'true');
        btn.classList.remove('glow-effect');
    }
}
// ==========================================
// MİKRO-ETKİLEŞİMLER (CURSOR & MAGNETIC)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. ÖZEL İMLEÇ MATEMATİĞİ
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    // Fare hareketini dinle
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Merkezdeki altın nokta fareyi "anında" takip eder
        if(cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    // Çemberin "yaylanarak" gelmesi için animasyon döngüsü (Linear Interpolation)
    function animateRing() {
        ringX += (mouseX - ringX) * 0.15; // 0.15 takip hızıdır.
        ringY += (mouseY - ringY) * 0.15;
        
        if(cursorRing) {
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
        }
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Tıklanabilir elementlerde imleci büyütme
    const interactables = document.querySelectorAll('a, button, .filter-btn, select, .option-card, .box-slot');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing?.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorRing?.classList.remove('hovered'));
    });

    // 2. MANYETİK BUTON FİZİĞİ
    const magneticElements = document.querySelectorAll('.magnetic-btn');
    
    magneticElements.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Farenin buton içindeki X ve Y koordinatları
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            // Butonun merkez noktasını bul
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Merkeze olan uzaklığa göre çekim gücünü hesapla (0.3 çarpanı gücü belirler)
            const deltaX = (x - centerX) * 0.3; 
            const deltaY = (y - centerY) * 0.3;
            
            // Butonu fareye doğru kaydır
            btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
        
        // Fare butondan çıkınca yaylanarak (CSS'teki cubic-bezier sayesinde) merkeze dönsün
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
        });
    });
});

// ==========================================
// YENİ PREMIUM EKLENTİLER (TILT, ASMR, MODAL)
// ==========================================

// 3. ASMR SES TASARIMI (Web Audio)
// assets klasörüne zarif, tok bir tık sesi (drop.mp3) eklediğini varsayıyoruz.
const dropSound = new Audio('assets/drop.mp3'); 
dropSound.volume = 0.3; // Çok bağırmasın, asil bir tok ses olsun

// Kutuyu Yarat kısmındaki addToBox fonksiyonunu modifiye ediyoruz:
// Kutuyu Yarat kısmındaki addToBox fonksiyonunu modifiye ediyoruz:
const originalAddToBox = addToBox; // DİKKAT: window.addToBox yerine doğrudan fonksiyonu yedekliyoruz
window.addToBox = function(name, image, price) {
    if (boxItems.length < MAX_BOX_SIZE) {
        // Yeni lokum eklenirken ASMR sesini çal
        if(typeof dropSound !== 'undefined') {
            dropSound.currentTime = 0; 
            dropSound.play().catch(e => console.log("Tarayıcı ses kısıtlaması"));
        }
    }
    // Asıl ekleme işlemini yap
    originalAddToBox(name, image, price);
}

// 4. HIZLI BAKIŞ MODALI FONKSİYONLARI
window.openModal = function(name, price, image, category) {
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-price').innerText = price;
    document.getElementById('modal-category').innerText = category;
    document.getElementById('modal-img').style.backgroundImage = `url('${image}')`;
    
    // Modal içindeki Sepete Ekle butonunu dinamik olarak bu ürüne bağla
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = function() {
        addToCart(name);
        closeModal();
    };

    document.getElementById('quick-modal').classList.add('active');
}

window.closeModal = function() {
    document.getElementById('quick-modal').classList.remove('active');
}

// 1. 3D TILT EFEKTİ (Fiziksel Derinlik Matematiği)
function initTiltEffect() {
    const cards = document.querySelectorAll('.product-card, .b2b-glass-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Farenin kart içindeki konumu
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Merkeze göre uzaklık hesaplama
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // X ve Y eksenindeki eğim derecesi (maksimum 12 derece)
            const rotateX = ((y - centerY) / centerY) * -12; 
            const rotateY = ((x - centerX) / centerX) * 12;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        // Fare çıkınca eski haline yaylanarak dön
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = `transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        });
        
        // Fare tekrar girince transition'ı kaldır ki anında takip etsin
        card.addEventListener('mouseenter', () => {
            card.style.transition = `none`;
        });
    });
}

// Ürünler ekrana çizildikten sonra tilt efektini başlatmak için 
// setTimeout ile küçük bir gecikme veriyoruz.
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initTiltEffect, 1000); 
});
// ==========================================
// 4 YENİ VİZYON: SENSÖRLER, PARALAKS VE GİZLİ KASA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. DİNAMİK IŞIKLANDIRMA (TEMA ŞALTERİ)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            // Buton metnini duruma göre değiştir
            themeToggle.innerText = isDark ? '☀️ Gündüz Modu' : '🌙 Gece Modu';
        });
    }

    // 3. PARALAKS GEZİNİM (Mekanik Kaydırma Derinliği - Sadece Masaüstü)
    window.addEventListener('scroll', () => {
        const heroContent = document.querySelector('.hero-content-left');
        
        // SADECE EKRAN BÜYÜKSE (Masaüstü) PARALAKS YAP
        if (window.innerWidth > 768) {
            const scrolled = window.scrollY;
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
                heroContent.style.opacity = 1 - (scrolled * 0.0025); 
            }
        } else {
            // MOBİLDE İSE DOĞAL AKIŞA BIRAK (Titremeyi engelle)
            if (heroContent) {
                heroContent.style.transform = `none`;
                heroContent.style.opacity = 1; 
            }
        }
    });

    // 4. ŞEFİN SIRRI (EASTER EGG KİLİDİ)
    let secretKeys = [];
    const secretCode = ['a', 'r', 't']; // A-R-T tuşlarına sırayla basılırsa
    
    window.addEventListener('keydown', (e) => {
        // Kullanıcının bastığı tuşu listeye ekle
        secretKeys.push(e.key.toLowerCase());
        
        // Listeyi her zaman şifrenin uzunluğunda (3 harf) tut
        secretKeys.splice(-secretCode.length - 1, secretKeys.length - secretCode.length);
        
        // Eğer basılan tuşlar "art" kelimesini oluşturursa:
        if (secretKeys.join('') === secretCode.join('')) {
            document.getElementById('easter-egg-modal').classList.add('active');
            secretKeys = []; // Şifreyi kırınca diziyi sıfırla
            
            // Eğer bir önceki adımda eklediğimiz tok ASMR sesi varsa onu çal
            if(typeof dropSound !== 'undefined') dropSound.play();
        }
    });

    // 2. LAZY LOAD (Bellek Optimizasyonu)
    // Zaten .reveal ile bir sistemimiz vardı. Şimdi bu mantığı resimlere (product-img) uyguluyoruz.
    // Tarayıcının belleğini yormamak için resim sadece ekrana girdiğinde görünür olur.
    setTimeout(() => {
        const lazyImages = document.querySelectorAll('.product-img, .option-img');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    observer.unobserve(entry.target); // Yüklendikten sonra takibi bırak (Performans)
                }
            });
        }, { threshold: 0.1 });
        
        lazyImages.forEach(img => {
            img.classList.add('lazy-image');
            imageObserver.observe(img);
        });
    }, 1500); // Ürünler ekrana basıldıktan sonra çalışması için küçük bir bekleme
});
// ==========================================
// ŞAHESER EKLENTİLERİ (FİZİK MOTORU & KESME RUTİNLERİ)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. SİSTEM KESMESİ (INTERRUPT) - Dinamik Sekme Başlığı
    const originalTitle = document.title;
    
    // Kullanıcı sekmeyi terk ettiğinde (blur)
    window.addEventListener('blur', () => {
        document.title = '✦ Bizi Unutmayın...';
    });
    // Kullanıcı sekmeye geri döndüğünde (focus)
    window.addEventListener('focus', () => {
        document.title = originalTitle;
    });

    // 3. ÖZEL SENSÖR ÇUBUĞU (Scroll Yüzde Hesaplama)
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });

    // 2. PARTİKÜL FİZİĞİ MOTORU (Canvas Altın Yağmuru)
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas boyutlarını ekran boyutuna eşitle
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let particles = [];

    // Partikül ateşleme fonksiyonu (Global yapılabilir, böylece her yerden çağrılır)
    // Altın Yağmuru (Mobil Optimizasyonlu)
    window.fireGoldRain = function() {
        // Ekran genişliğine göre partikül sayısını belirle (Mobilde işlemciyi koru)
        const particleCount = window.innerWidth > 768 ? 100 : 35; 

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 6 + 2,
                speedY: Math.random() * 4 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 6 - 3,
                opacity: 1
            });
        }
        animateParticles();
    };

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Ekranı temizle
        let activeParticles = 0;

        particles.forEach(p => {
            // Fiziksel hareket hesaplamaları
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.004; // Yavaşça yok ol

            // Partikülü çiz
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = `rgba(198, 168, 124, ${p.opacity})`; // Altın rengi
            // Kare şeklinde (altın yaprak gibi) çiz
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); 
            ctx.restore();

            if (p.opacity > 0) activeParticles++;
        });

        // Ekranda hala parçacık varsa animasyona devam et
        if (activeParticles > 0) {
            requestAnimationFrame(animateParticles);
        } else {
            particles = []; // Belleği boşalt
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Altın Yağmurunu ne zaman tetikleyelim? B2B Formu gönderildiğinde!
    const b2bForm = document.querySelector('.b2b-form');
    if(b2bForm) {
        b2bForm.addEventListener('submit', () => {
            window.fireGoldRain();
            
            // Eğer varsa o lüks "tık" sesini de çalalım
            if(typeof dropSound !== 'undefined') {
                dropSound.currentTime = 0;
                dropSound.play();
            }
        });
    }
});
// ==========================================
// DONANIM ETKİLEŞİMİ & UYKU MODU MİMARİSİ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. DONANIMSAL TİTREŞİM (Haptic Feedback API)
    // Sadece titreşim motoru olan mobil cihazlarda donanımsal tepki verir
    window.triggerHaptic = function(duration = 40) {
        if (navigator.vibrate) {
            navigator.vibrate(duration); // Milisaniye cinsinden donanımı titret
        }
    };

    // Tüm etkileşimli butonlara (Sepete Ekle, Kutuyu Tasarla vb.) bu donanım tepkisini bağlayalım
    const interactiveElements = document.querySelectorAll('.btn-primary, .btn-outline, .btn-secondary, .box-slot, .filter-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('click', () => triggerHaptic(30)); // 30ms tok, şık bir titreşim
    });

    // Daha önce yazdığımız Sepete Ekle gibi fonksiyonlara globalden erişebilmek için:
    // Eğer addToBox veya addToCart içinde titreşim istiyorsan içlerine triggerHaptic(40); ekleyebilirsin.

    // 3. UYKU MODU KONTROLCÜSÜ (Watchdog Timer)
    let idleSeconds = 0;
    const SLEEP_THRESHOLD = 30; // 30 saniye hareketsizlikte sistem uyur (Test için süreyi kısa tuttum)
    const sleepOverlay = document.getElementById('sleep-mode-overlay');

    // Uyandırma Kesmesi (Wake-up Interrupt)
    function resetIdleTimer() {
        if (idleSeconds >= SLEEP_THRESHOLD) {
            // Sistem Uyanıyor
            sleepOverlay.classList.remove('sleeping');
            triggerHaptic(50); // Uyanırken hafif bir motor tepkisi
        }
        idleSeconds = 0; // Sayacı sıfırla
    }

    // Sisteme bağlı sensörler (Mouse, Klavye, Dokunmatik Ekran, Kaydırma)
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);

    // Her saniye tık atan zamanlayıcı sayacı
    setInterval(() => {
        idleSeconds++;
        if (idleSeconds === SLEEP_THRESHOLD) {
            // Sistemi güç tasarrufuna al (Uyut)
            sleepOverlay.classList.add('sleeping');
        }
    }, 1000);
});
// ==========================================
// UX, TEMALAR VE AKILLI SEPET KONTROLCÜSÜ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // 3. TEMA ŞALTERİ KONTROLÜ
    const themeSelector = document.getElementById('theme-selector');
    if(themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const val = e.target.value;
            // Önce tüm temaları temizle
            document.body.classList.remove('theme-rose', 'theme-amber', 'dark-theme');
            
            // Seçilen temayı ekle (default değilse)
            if (val !== 'default') {
                document.body.classList.add(`theme-${val}`);
            }
        });
    }

    // 1. YÜZEN AKILLI SEPET (Dynamic Island) RADARI
    // Senin sisteminde zaten çalışan sepete ekleme mantığını sürekli izlemek için
    // basit bir interval (radar) kuruyoruz.
    const smartIsland = document.getElementById('smart-cart-island');
    const islandCount = document.getElementById('island-count');
    const islandTotal = document.getElementById('island-total');
    
    // Satış artırıcı hile: Toplam fiyatı görsel olarak hesaplama simülasyonu
    let currentFakeTotal = 0;

    setInterval(() => {
        // En üst menüdeki sepet sayacını oku
        const headerCartCountText = document.getElementById('cart-count')?.innerText || "0";
        const totalItems = parseInt(headerCartCountText);

        if (smartIsland) {
            if (totalItems > 0) {
                // Kapsülü ekrana çıkar
                smartIsland.classList.add('active');
                islandCount.innerText = `${totalItems} Ürün`;
                
                // Müşteriye fiyat göstermek satışı hızlandırır. 
                // Sisteminde fiyat hesaplaması yoksa diye ortalama bir sepet tutarı gösterelim:
                currentFakeTotal = totalItems * 450; // Örnek: Kutu başı 450 TL
                islandTotal.innerText = `${currentFakeTotal.toLocaleString('tr-TR')} TL`;
            } else {
                // Sepet boşsa kapsülü gizle
                smartIsland.classList.remove('active');
            }
        }
    }, 1000);

    // 2. GURME EŞLEŞTİRME (Dinamik İçerik)
    // Önceki openModal fonksiyonunu yakalayıp içine Gurme Notu ekliyoruz
    const existingOpenModal = window.openModal;
    if(existingOpenModal) {
        window.openModal = function(name, price, image, category) {
            // Eski fonksiyonu çalıştır (Pencere açılsın)
            existingOpenModal(name, price, image, category);
            
            // Ürün ismine göre yapay zeka tadım önerisi ataması
            const pairingText = document.getElementById('modal-pairing-text');
            if(pairingText) {
                if (name.toLowerCase().includes('sarma')) {
                    pairingText.innerText = "Tadım Önerisi: Yoğun Antep fıstığı içeren sarmalar, sade Filtre Kahve ile muazzam bir denge kurar.";
                } else if (name.toLowerCase().includes('gül')) {
                    pairingText.innerText = "Tadım Önerisi: Gül yapraklı hafif lokumlar, taze demlenmiş Beyaz Çay ile ruhunuzu dinlendirir.";
                } else {
                    pairingText.innerText = "Tadım Önerisi: Odun ateşinde kavrulmuş taze Türk Kahvesi ile asırlık geleneksel lezzet şöleni.";
                }
            }
        };
    }
});