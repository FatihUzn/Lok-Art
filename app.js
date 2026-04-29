document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar Scroll Efekti
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 35) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // JSON'dan Ürünleri Çekme İşlemi (Fetch API)
    fetch('data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Veri çekilemedi.');
            }
            return response.json();
        })
        .then(products => {
            const container = document.getElementById('products-container');
            container.innerHTML = ''; // "Yükleniyor..." yazısını temizle

            // Her bir ürün için HTML kartı oluştur
            products.forEach(product => {
                const productCard = `
                    <div class="product-card">
                        <div class="product-img" style="background-image: url('${product.image}');"></div>
                        <div class="product-info">
                            <span class="category-tag">${product.category.toUpperCase()}</span>
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <span class="price">${product.price}</span>
                            <button class="btn-secondary" onclick="addToCart()">Sepete Ekle</button>
                        </div>
                    </div>
                `;
                container.innerHTML += productCard;
            });
        })
        .catch(error => {
            console.error('Hata:', error);
            document.getElementById('products-container').innerHTML = '<p>Ürünler yüklenirken bir hata oluştu.</p>';
        });

});

// Basit bir Sepete Ekle Simülasyonu
let cartTotal = 0;
function addToCart() {
    cartTotal++;
    document.getElementById('cart-count').innerText = cartTotal;
    alert("Ürün sepete eklendi!");
}
