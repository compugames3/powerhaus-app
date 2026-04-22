const fs = require('fs');

// --- 1. Modify punto de venta.html ---
let pos = fs.readFileSync('punto de venta.html', 'utf8');

const targetStr = '<button onclick="window.location.href=\\\'carrito.html\\\'"';
const replacementStr = '<button onclick="addToCart(this)"';
pos = pos.split(targetStr).join(replacementStr);

if(!pos.includes('function addToCart')) {
    const script = `
<script>
function addToCart(btn) {
    const card = btn.closest('.product-item');
    const name = card.querySelector('h3').innerText;
    const priceTxt = card.querySelector('.text-xl.font-black').innerText;
    const price = parseFloat(priceTxt.replace('$', ''));
    let img = '';
    const imgEl = card.querySelector('img');
    if (imgEl) img = imgEl.src;
    
    let catEl = card.querySelector('.text-\\\\[9px\\\\]');
    if (!catEl) catEl = card.querySelector('span:not(.material-symbols-outlined)'); // fallback
    const category = catEl ? catEl.innerText : 'ITEM';

    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price, img, category, quantity: 1 });
    }
    localStorage.setItem('cartItems', JSON.stringify(cart));
    
    // Animate to indicate added
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span>';
    btn.classList.add('bg-emerald-100', 'text-emerald-600');
    
    setTimeout(() => {
        window.location.href = 'carrito.html';
    }, 300);
}
</script>
</body>`;
    pos = pos.replace('</body>', script);
}
fs.writeFileSync('punto de venta.html', pos);

// --- 2. Modify carrito.html to be fully dynamic ---
let carrito = fs.readFileSync('carrito.html', 'utf8');

const dynamicScript = `
    <script>
    function renderCart() {
        const cartList = document.getElementById('cartList');
        const emptyState = document.getElementById('emptyState');
        const summaryBlock = document.getElementById('summaryBlock');
        
        let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        if(cart.length === 0) {
            cartList.innerHTML = '';
            emptyState.classList.remove('hidden');
            summaryBlock.style.opacity = '0.5';
            summaryBlock.style.pointerEvents = 'none';
            document.getElementById('subtotalLbl').innerText = '$0.00';
            document.getElementById('taxLbl').innerText = '$0.00';
            document.getElementById('totalLbl').innerText = '$0.00';
            return;
        }

        emptyState.classList.add('hidden');
        summaryBlock.style.opacity = '1';
        summaryBlock.style.pointerEvents = 'auto';

        let html = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;
            
            html += \`
                <div class="bg-white rounded-[24px] p-6 pr-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6 relative group hover:shadow-xl transition-all duration-300">
                    <button onclick="removeItem(\${index})" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                    
                    <div class="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 rounded-[18px] shrink-0 overflow-hidden flex items-center justify-center relative">
                        <img class="w-full h-full object-cover rounded-xl mix-blend-multiply" src="\${item.img}" />
                    </div>
                    
                    <div class="flex-1 min-w-0 flex flex-col gap-1 w-full">
                        <h3 class="font-black text-slate-800 text-lg sm:text-[22px] leading-tight font-headline tracking-tighter">\${item.name}</h3>
                        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">\${item.category}</p>
                    </div>

                    <div class="flex flex-wrap items-center gap-5 sm:gap-10 w-full sm:w-auto justify-between sm:justify-start mt-4 sm:mt-0 px-2 sm:px-0">
                        <div class="flex flex-col items-center">
                            <span class="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">Precio</span>
                            <span class="font-black text-slate-800 text-lg">\$\${item.price.toFixed(2)}</span>
                        </div>

                        <div class="flex items-center bg-[#eef2fe] rounded-full px-1 py-1 shadow-inner border border-blue-100">
                            <button onclick="updateQty(\${index}, -1)" class="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm transition-all text-lg font-medium">−</button>
                            <span class="w-8 text-center font-black text-sm text-[#004cf0]">\${item.quantity}</span>
                            <button onclick="updateQty(\${index}, 1)" class="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm transition-all text-lg font-medium">+</button>
                        </div>

                        <div class="flex flex-col items-end min-w-[80px]">
                            <span class="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">Subtotal</span>
                            <span class="text-[22px] font-black text-[#004cf0] tracking-tight">\$\${itemSubtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            \`;
        });

        cartList.innerHTML = html;

        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        document.getElementById('subtotalLbl').innerText = '$' + subtotal.toFixed(2);
        document.getElementById('taxLbl').innerText = '$' + tax.toFixed(2);
        document.getElementById('totalLbl').innerText = '$' + total.toFixed(2);
    }

    function updateQty(index, delta) {
        let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        if(cart[index]) {
            cart[index].quantity += delta;
            if(cart[index].quantity <= 0) cart.splice(index, 1);
            localStorage.setItem('cartItems', JSON.stringify(cart));
            renderCart();
        }
    }

    function removeItem(index) {
        let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        renderCart();
    }

    function proceedToCheckout() {
        let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        if(cart.length === 0) return;
        
        // Simular compra y agregar el ingreso a la contabilidad de Cierre (POS)
        // Guardando un histórico de compras en 'ventasPOS' o directamente registrando un cierre transaccional
        let transacciones = JSON.parse(localStorage.getItem('transaccionesVentas') || '[]');
        
        let total = 0;
        cart.forEach(i => total += (i.price * i.quantity));
        let tax = total * 0.08;
        let superTotal = total + tax;

        transacciones.push({
            id: Date.now(), fecha: new Date().toISOString(),
            tipo: 'POS', desc: 'Venta Suplementos (' + cart.length + ' items)',
            monto: superTotal
        });
        localStorage.setItem('transaccionesVentas', JSON.stringify(transacciones));
        
        alert("¡Compra procesada con éxito por $" + superTotal.toFixed(2) + "!");
        localStorage.removeItem('cartItems');
        window.location.href = 'punto de venta.html';
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderCart();
    });
    </script>
</body>`;

// Remove the hardcoded elements replacing them with dynamic containers
const regexTarget = /<!-- Item 1 -->[\s\S]*<!-- Back to catalog action -->/;

const replacementTemplate = `
                <!-- Empty State -->
                <div id="emptyState" class="hidden bg-white/50 backdrop-blur-sm rounded-[32px] p-16 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                    <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                        <span class="material-symbols-outlined text-[48px]">shopping_cart_off</span>
                    </div>
                    <h2 class="text-2xl font-black text-slate-800 font-headline mb-2">Tu carrito está vacío</h2>
                    <p class="text-slate-500 font-medium mb-8 max-w-sm">Explora nuestro catálogo para añadir suplementos, equipo e indumentaria.</p>
                    <a href="punto de venta.html" class="bg-[#004cf0] hover:bg-[#003de0] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-600/30 transition-all">Ir al Catálogo</a>
                </div>

                <!-- Dynamic Cart List -->
                <div id="cartList" class="flex flex-col gap-6 w-full"></div>

                <!-- Back to catalog action -->`;

carrito = carrito.replace(regexTarget, replacementTemplate);

// update labels with id
carrito = carrito.replace('<span class="font-black tracking-tight text-slate-800 text-[15px]">$133.00</span>', '<span id="subtotalLbl" class="font-black tracking-tight text-slate-800 text-[15px]">$0.00</span>');
carrito = carrito.replace('<span class="font-black tracking-tight text-slate-800 text-[15px]">$10.64</span>', '<span id="taxLbl" class="font-black tracking-tight text-slate-800 text-[15px]">$0.00</span>');
carrito = carrito.replace('<span class="text-[40px] font-headline font-black text-slate-800 leading-none tracking-tighter">$143.64</span>', '<span id="totalLbl" class="text-[40px] font-headline font-black text-slate-800 leading-none tracking-tighter">$0.00</span>');

// update checkout button
carrito = carrito.replace('<button class="w-full bg-[#004cf0]', '<button onclick="proceedToCheckout()" class="w-full bg-[#004cf0]');

carrito = carrito.replace('<!-- Right: Order Summary -->\n            <div class="w-full lg:w-[380px] shrink-0">', '<!-- Right: Order Summary -->\n            <div id="summaryBlock" class="w-full lg:w-[380px] shrink-0 transition-opacity duration-300">');

// Add the script at the end
carrito = carrito.replace('</body>', dynamicScript);

fs.writeFileSync('carrito.html', carrito);

console.log('Scripts injected successfully.');
