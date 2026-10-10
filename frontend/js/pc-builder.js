// State to hold the prices of selected components
const selectedComponents = {
    CPU: 0,
    Mainboard: 0,
    RAM: 0,
    VGA: 0,
    PSU: 0
};

document.addEventListener('DOMContentLoaded', () => {
    // Check user authentication state to sync Navbar
    checkAuthState();
    console.log("PC Builder initialized!");
});

// Function to handle Navbar state and display User Name / Avatar
function checkAuthState() {
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('userAvatar');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is logged in (from local storage)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // Hide Login/SignUp, Show Avatar & User Name
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
        // Show Login/SignUp, Hide Avatar & User Name
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

// Fetch products from backend and open the modal
async function openComponentModal(category) {
    const modal = document.getElementById('component-modal');
    const modalTitle = document.getElementById('modal-title');
    const productListContainer = document.getElementById('modal-product-list');

    // Reset modal content
    modalTitle.innerText = `Select ${category}`;
    productListContainer.innerHTML = '<p>Loading products from database...</p>';
    modal.style.display = 'block';

    try {
        // Fetch data from Node.js API
        const response = await fetch(`http://localhost:5001/api/products/category/${category}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        
        // Clear the loading text
        productListContainer.innerHTML = '';

        if (products.length === 0) {
            productListContainer.innerHTML = `<p>No ${category} found in the database.</p>`;
            return;
        }

        // Render each product into the modal
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            
            productElement.innerHTML = `
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>$${product.price}</p>
                </div>
                <button class="btn-select-product" onclick="selectComponent('${category}', '${product.name.replace(/'/g, "\\'")}', ${product.price})">
                    Select
                </button>
            `;
            
            productListContainer.appendChild(productElement);
        });

    } catch (error) {
        console.error("Failed to fetch products:", error);
        productListContainer.innerHTML = '<p>Error fetching data. Is the backend server running?</p>';
    }
}

// Handle component selection
function selectComponent(category, productName, price) {
    // 1. Update the UI text to show the selected product
    const targetElementId = `selected-${category.toLowerCase()}`;
    const targetElement = document.getElementById(targetElementId);
    
    if (targetElement) {
        targetElement.innerText = `${productName} ($${price})`;
        targetElement.style.color = '#1e293b';
        targetElement.style.fontWeight = 'bold';
    }

    // 2. Update internal state and recalculate total price
    selectedComponents[category] = price;
    updateTotalPrice();

    // 3. Close the modal
    closeModal();
}

// Calculate and render the total price
function updateTotalPrice() {
    let total = 0;
    for (const key in selectedComponents) {
        total += selectedComponents[key];
    }
    
    document.getElementById('total-price').innerText = total;
}

// Close the modal manually
function closeModal() {
    document.getElementById('component-modal').style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('component-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Final checkout validation
function checkoutBuild() {
    const totalPrice = document.getElementById('total-price').innerText;
    
    if (totalPrice === "0") {
        alert("Your build is empty! Please select some components first.");
        return;
    }
    
    alert(`Checkout successful! Your custom PC total is $${totalPrice}`);
}