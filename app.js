let allProducts = []; 
let currentFilteredProducts = []; // Sıralama yapmak için aktif listeyi tutar

document.addEventListener('DOMContentLoaded', () => {
    
    
    // --- PRELOADER (AÇILIŞ EKRANI) KONTROLÜ ---
    // Sitenin tam yüklenmesini beklemek için window.onload kullanıyoruz
    window.addEventListener('load', () => {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if(preloader) {
                preloader.classList.add('hide');
                // DOM'dan temizlemek istersen (isteğe bağlı):
                // setTimeout(() => preloader.remove(), 1000); 
            }
        }, 1200); // 1.2 saniye logo ve çizgiyi izletip sonra perdeyi kaldır
    });
    
    // 1. Şeffaf Navigasyon Efekti
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
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
            document.getElementById('products-container').innerHTML = '<p>Ürünler yüklenemedi.</p>';
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
    document.getElementById('sortSelect').addEventListener('change', applySortingAndRender);
});

// Fiyatları sayısal değere çeviren yardımcı fonksiyon (Sıralama için)
function parsePrice(priceStr) {
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

// Ürünleri Ekrana Çizme
function renderProducts(productsToRender) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; 

    const displayProducts = productsToRender.slice(0, 24); 

    displayProducts.forEach(product => {
        const productCard = `
            <div class="product-card reveal">
                <div class="img-container">
                    <div class="product-img" style="background-image: url('${product.image}');"></div>
                </div>
                <div class="product-info">
                    <span class="category-tag">${product.category}</span>
                    <h3>${product.name}</h3>
                    <span class="price">${product.price}</span>
                    <div style="display:flex; gap:10px; justify-content:center; width: 80%; margin: 0 auto;">
        <button class="btn-secondary magnetic-btn" style="flex:1; padding:10px;" onclick="openModal('${product.name}', '${product.price}', '${product.image}', '${product.category}')">İncele</button>
        <button class="btn-primary magnetic-btn" style="flex:1; padding:10px; font-size: 0.8rem;" onclick="addToCart('${product.name}')">Sepete</button>
    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });

    // Animasyon Gözlemcisi
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 }); 

    revealElements.forEach(el => observer.observe(el));
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
const originalAddToBox = window.addToBox; // Eski fonksiyonu yedekle
window.addToBox = function(name, image, price) {
    if (boxItems.length < MAX_BOX_SIZE) {
        // Yeni lokum eklenirken ASMR sesini çal
        dropSound.currentTime = 0; 
        dropSound.play().catch(e => console.log("Tarayıcı ses kısıtlaması"));
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

    // 3. PARALAKS GEZİNİM (Mekanik Kaydırma Derinliği)
    // Sayfa aşağı kaydıkça arkadaki elementlerin farklı hızlarda hareket etmesini sağlar.
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content-left');
        
        if (heroContent) {
            // 0.4 çarpanı vites dişlisi gibidir. Sayfa inince yazılar yavaşça yukarı çıkar.
            heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
            // Aşağı indikçe yazı zarifçe flulaşır
            heroContent.style.opacity = 1 - (scrolled * 0.0025); 
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
    window.fireGoldRain = function() {
        // 100 adet altın parçacık oluştur
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height, // Ekranın üstünden başlar
                size: Math.random() * 6 + 2,
                speedY: Math.random() * 4 + 2, // Yerçekimi ivmesi
                speedX: Math.random() * 2 - 1,  // Rüzgar etkisi
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