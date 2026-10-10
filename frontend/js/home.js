// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Check Authentication State
    checkAuthState();

    // 2. Load products automatically when the page opens
    loadProducts();

    // 3. Update the floating cart badge on load
    updateCartBadge();
});

// Function to handle Navbar state based on login status
function checkAuthState() {
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('userAvatar');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is logged in (from local storage)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        console.log(`Welcome back, ${currentUser.fullname}`);
        
        // Hide Login/SignUp, Show Avatar & Name
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        
        // Dynamically update avatar with the first letter of user's name
        if (userAvatar && currentUser.fullname) {
            const firstLetter = currentUser.fullname.charAt(0).toUpperCase();
            userAvatar.src = `https://ui-avatars.com/api/?name=${firstLetter}&background=2563eb&color=fff`;
        }
        
        // Dynamically display user name
        if (userNameDisplay && currentUser.fullname) {
            userNameDisplay.textContent = currentUser.fullname;
        }

    } else {
        // Show Login/SignUp, Hide Avatar & Name
        if (guestMenu) guestMenu.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }

    // Handle Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link redirection
            
            // Clear user data from local storage
            localStorage.removeItem('currentUser');
            
            alert('You have been logged out successfully.');
            // Reload the page to reflect changes
            window.location.reload(); 
        });
    }
}

// Function to fetch and display products
async function loadProducts() {
    const productListContainer = document.getElementById('product-list');

    // Make sure the container exists
    if (!productListContainer) {
        console.error("Error: Cannot find div with id 'product-list' in home.html.");
        return; 
    }

    // Show loading state
    productListContainer.innerHTML = '<p style="text-align: center; font-size: 1.2rem; grid-column: 1 / -1;">Loading products...</p>';

    try {
        // Fetch products from Node.js Backend API
        const response = await fetch('http://localhost:5001/api/products');
        
        // Check if HTTP request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const products = await response.json();
        displayProducts(products, productListContainer);

    } catch (error) {
        console.error('Error connecting to server:', error);
        productListContainer.innerHTML = '<p style="color: #ef4444; text-align: center; grid-column: 1 / -1;">Server is not responding. Please make sure the backend is running.</p>';
    }
}

// Function to render products in the DOM
function displayProducts(products, container) {
    // Clear loading text
    container.innerHTML = ''; 
    
    // Check if database is empty
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No products available at the moment. Please add data in the Admin Dashboard.</p>';
        return;
    }

    // Generate HTML for each product using template literals
    products.forEach(product => {
        // Fallback image in case the database doesn't have an image URL
        const imageUrl = product.image ? product.image : 'https://placehold.co/400x300/e9ecef/495057?text=No+Image';
        const productPriceRaw = product.price || 0;
        const productPriceFormatted = productPriceRaw.toLocaleString();
        
        // Create the product card strictly matching the CSS classes in home.css
        // Included real logic to pass data to addToCart function
        const productCardHTML = `
            <div class="product-card">
                <img src="${imageUrl}" alt="${product.name}">
                <div class="product-info">
                    ${product.category ? `<p class="category">${product.category}</p>` : ''}
                    <h4>${product.name}</h4>
                    <p class="price">$${productPriceFormatted}</p>
                    <button class="btn-add-cart" onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${productPriceRaw}, '${imageUrl}')">Add to Cart</button>
                </div>
            </div>
        `;
        
        // Append the product card HTML to the container
        container.insertAdjacentHTML('beforeend', productCardHTML);
    });
}

// Function to handle adding items to cart and saving to Local Storage
function addToCart(productId, productName, price, image) {
    // Get existing cart or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('smartpc_cart')) || [];
    
    // Check if the item is already in the cart
    let existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    // Save back to local storage
    localStorage.setItem('smartpc_cart', JSON.stringify(cart));
    
    alert(`Successfully added "${productName}" to your cart!`);
    
    // Automatically update the floating cart badge
    updateCartBadge();
}

// Function to calculate and update the floating cart badge number
function updateCartBadge() {
    const badge = document.getElementById('floating-cart-badge');
    if (badge) {
        const cart = JSON.parse(localStorage.getItem('smartpc_cart')) || [];
        
        let totalItems = 0;
        cart.forEach(item => {
            totalItems += parseInt(item.quantity || 1);
        });

        badge.textContent = totalItems;
        
        if (totalItems > 0) {
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}