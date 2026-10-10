document.addEventListener('DOMContentLoaded', () => {
    // 1. Sync Navbar Auth State
    checkAuthState();
    
    // 2. Load Cart Data
    renderCartItems();
});

// Sync Navbar based on login status
function checkAuthState() {
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('userAvatar');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex'; 
        
        if (userAvatar && currentUser.fullname) {
            const firstLetter = currentUser.fullname.charAt(0).toUpperCase();
            userAvatar.src = `https://ui-avatars.com/api/?name=${firstLetter}&background=2563eb&color=fff`;
        }
        
        if (userNameDisplay && currentUser.fullname) {
            userNameDisplay.textContent = currentUser.fullname;
        }
    } else {
        if (guestMenu) guestMenu.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); 
            localStorage.removeItem('currentUser');
            alert('You have been logged out successfully.');
            window.location.href = 'home.html'; 
        });
    }
}

// Render items from Local Storage
function renderCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    
    // Fetch cart from local storage, default to empty array if null
    let cart = JSON.parse(localStorage.getItem('smartpc_cart')) || [];
    
    // Empty Cart State
    if (cart.length === 0) {
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <h3>Your cart is currently empty</h3>
                    <p style="margin-top: 10px;">Looks like you haven't added any components yet.</p>
                    <a href="home.html" class="btn-primary" style="margin-top: 20px;">Start Shopping</a>
                </div>
            `;
        }
        updateOrderSummary(0);
        return;
    }

    // Render Items
    if (cartContainer) {
        cartContainer.innerHTML = '';
    }
    
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        // Fallback image
        const imgUrl = item.image ? item.image : 'https://placehold.co/100x100/e9ecef/495057?text=Component';

        const itemHTML = `
            <div class="cart-item">
                <div class="cart-item-info">
                    <img src="${imgUrl}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-title">${item.name}</div>
                </div>
                <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <input type="number" value="${item.quantity}" min="1" onchange="window.updateQuantity(${index}, this.value)">
                </div>
                <button class="btn-remove" onclick="window.removeItem(${index})" title="Remove item">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        
        if (cartContainer) {
            cartContainer.insertAdjacentHTML('beforeend', itemHTML);
        }
    });

    updateOrderSummary(subtotal);
}

// Update item quantity (Attached to window to ensure HTML can trigger it)
window.updateQuantity = function(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('smartpc_cart')) || [];
    if (newQuantity < 1) newQuantity = 1;
    
    cart[index].quantity = parseInt(newQuantity);
    localStorage.setItem('smartpc_cart', JSON.stringify(cart));
    
    // Re-render
    renderCartItems();
};

// Remove item from cart (Attached to window)
window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('smartpc_cart')) || [];
    
    // Ask for confirmation
    if(confirm("Are you sure you want to remove this item?")) {
        cart.splice(index, 1); 
        localStorage.setItem('smartpc_cart', JSON.stringify(cart));
        renderCartItems(); 
    }
};

// Update Subtotal, Tax, and Total
function updateOrderSummary(subtotal) {
    const taxRate = 0.10; // 10% Tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const subtotalEl = document.getElementById('cart-subtotal');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString();
    if (taxEl) taxEl.innerText = tax.toLocaleString();
    if (totalEl) totalEl.innerText = total.toLocaleString();
}

// Handle Checkout via API (Attached to window to ensure button click works)
window.proceedToCheckout = async function() {
    let cart = JSON.parse(localStorage.getItem('smartpc_cart')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // 1. Validation Checks
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    if (!currentUser) {
        alert("Please login to proceed to checkout.");
        return;
    }

    // Capture exact user ID whether it's _id (MongoDB) or id
    const userId = currentUser._id || currentUser.id;
    if (!userId) {
        alert("User session invalid. Please log in again.");
        return;
    }

    // 2. Calculate Total Price
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += (item.price * item.quantity);
    });
    const taxRate = 0.10;
    const totalPrice = subtotal + (subtotal * taxRate);

    // 3. Format Data for Backend 
    const orderData = {
        user: userId, 
        products: cart.map(item => ({
            product: item._id || item.id, 
            quantity: item.quantity,
            name: item.name, 
            price: item.price
        })),
        totalPrice: totalPrice
    };

    console.log("🚀 Sending checkout payload:", orderData);

    // 4. Send API Request
    try {
        const response = await fetch('http://localhost:5001/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        // Safeguard against HTML error pages being parsed as JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Server returned an invalid non-JSON response. Check API URL.");
        }

        const data = await response.json();

        if (response.ok) {
            // ĐÃ SỬA LỖI Ở DÒNG NÀY (Thêm .order)
            alert(`🎉 Order placed successfully! Order ID: ${data.order._id}`);
            
            // Clear cart upon successful order
            localStorage.removeItem('smartpc_cart');
            
            // Reload UI
            renderCartItems();
        } else {
            alert(`Checkout failed: ${data.message || 'Unknown error occurred.'}`);
            console.error('Backend rejection details:', data);
        }

    } catch (error) {
        console.error("❌ Error during checkout process:", error);
        alert("Server communication error! Please check the console log.");
    }
};