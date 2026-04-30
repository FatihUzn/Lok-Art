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
                    <button class="btn-secondary" onclick="addToCart('${product.name}')">Sepete Ekle</button>
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