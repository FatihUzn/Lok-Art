let allProducts = []; // Tüm ürünleri hafızada tutacağız

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Şeffaf Navigasyon Efekti
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Ürünleri JSON'dan Çekme
    fetch('data/products.json')
        .then(response => response.json())
        .then(products => {
            allProducts = products; // Global değişkene kaydet
            renderProducts(allProducts); // İlk açılışta tümünü göster
        })
        .catch(error => {
            console.error('Veri Hatası:', error);
            document.getElementById('products-container').innerHTML = '<p>Ürünler yüklenemedi.</p>';
        });

    // 3. Kategori Filtreleme Dinamikleri
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Aktif buton stilini değiştir
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Hangi kategoriye tıklandı?
            const category = e.target.getAttribute('data-filter');
            
            if (category === 'all') {
                renderProducts(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category === category);
                renderProducts(filtered);
            }
        });
    });
});

// Ürünleri Ekrana Çizen ve Animasyon Ekleyen Fonksiyon
function renderProducts(productsToRender) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Önceki ürünleri temizle

    // Maksimum 24 ürün gösterelim ki sayfa sunumda yormasın (İstersen limiti kaldırabilirsin)
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
                    <button class="btn-secondary" onclick="addToCart()">Sepete Ekle</button>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });

    // Aşağı Kaydırdıkça Süzülerek Gelme (Scroll Reveal) Animasyonu
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 }); // Ürünün %10'u göründüğünde animasyonu başlat

    revealElements.forEach(el => observer.observe(el));
}

// Sepet Simülasyonu
let cartTotal = 0;
function addToCart() {
    cartTotal++;
    document.getElementById('cart-count').innerText = cartTotal;
}
// --- KENDİ KUTUNU YARAT MODÜLÜ (SANAL KUTU) ---
let boxItems = []; // Kutudaki lokumları tutan dizi
const MAX_BOX_SIZE = 6; // Kutu kapasitesi
const BOX_BASE_PRICE = 150.00; // Metal kutunun kendi boş fiyatı

// Ana fetch işleminden (sayfa yüklendiğinde) sonra çağrılır
function setupBoxBuilder(products) {
    const optionsContainer = document.getElementById('box-options');
    
    // Kutuya girmeye uygun ürünleri filtrele (Örn: Sarmalar ve Çifte Kavrulmuşlar)
    const boxEligibleProducts = products.filter(p => p.category.includes('Sarma') || p.category.includes('Parmak') || p.category.includes('Çifte Kavrulmuş'));

    // Sunum için temsili 20 lokumu sağ panele diz
    boxEligibleProducts.slice(0, 20).forEach(product => {
        // Demo amaçlı: Kg fiyatından tekil dilim fiyatı simülasyonu
        const rawPrice = parseFloat(product.price.replace(/\./g, '').replace(',', '.'));
        const piecePrice = (rawPrice / 35).toFixed(2); // Kaba bir birim fiyat hesabı

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
    
    updateBoxUI(); // İlk fiyatı (boş kutu) yazdır
}

// Ürün Kartına tıklandığında kutuya ekler
function addToBox(name, image, price) {
    if (boxItems.length >= MAX_BOX_SIZE) {
        alert("Sanat eseriniz tamamlandı! Kutunuzda boş yer kalmadı.");
        return;
    }
    boxItems.push({ name, image, price });
    updateBoxUI();
}

// Kutudaki çarpıya (X) basıldığında çıkarır
window.removeFromBox = function(index) {
    boxItems.splice(index, 1);
    updateBoxUI();
}

// Ekranı ve Fiyatları Günceller
function updateBoxUI() {
    const grid = document.getElementById('box-grid');
    const slots = grid.querySelectorAll('.box-slot');
    
    let currentTotal = BOX_BASE_PRICE; // Metal kutu ücreti ile başlar

    // 1. Önce tüm slotları sıfırla
    slots.forEach(slot => {
        slot.className = 'box-slot empty';
        slot.innerHTML = '';
    });

    // 2. Dolu olanları yerleştir ve fiyatı topla
    boxItems.forEach((item, index) => {
        currentTotal += parseFloat(item.price);
        const slot = slots[index];
        slot.className = 'box-slot filled';
        slot.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="remove-item" onclick="removeFromBox(${index})">✕</div>
        `;
    });

    // 3. Arayüz Rakamlarını Güncelle
    document.getElementById('box-count').innerText = boxItems.length;
    document.getElementById('box-price').innerText = currentTotal.toFixed(2).replace('.', ',') + ' TL';

    // 4. Sepete Ekle Butonunu Yönet (Sadece doluysa aktif olur)
    const btn = document.getElementById('add-box-to-cart');
    if (boxItems.length > 0) {
        btn.removeAttribute('disabled');
    } else {
        btn.setAttribute('disabled', 'true');
    }
}
