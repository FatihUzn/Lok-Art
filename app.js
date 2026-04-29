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
