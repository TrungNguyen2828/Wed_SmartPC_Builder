// Global variables
let allProductsList = [];
let editingProductId = null;

// Wait for HTML to load
document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. SIDEBAR NAVIGATION LOGIC (SPA)
    // ==========================================
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all menu items and hide all sections
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active-section'));

            // Add active class to clicked menu item and show corresponding section
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-section');

            // Fetch orders automatically when the Orders tab is clicked
            if (targetId === 'orders-section') {
                fetchAndRenderOrders();
            }
            // Fetch products if going back to inventory
            if (targetId === 'inventory-section') {
                fetchAndRenderProducts();
            }
        });
    });

    // ==========================================
    // 2. PRODUCTS MANAGEMENT LOGIC
    // ==========================================
    fetchAndRenderProducts(); // Load products by default on startup

    const addProductForm = document.getElementById('addProductForm');
    const submitButton = document.querySelector('.btn-submit');

    // Handle Form Submission (Add / Update Product)
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const name = document.getElementById('add-name').value;
            const category = document.getElementById('add-category').value;
            const price = Number(document.getElementById('add-price').value);
            const description = document.getElementById('add-description').value;
            
            const imageUrlInput = document.getElementById('add-image-url').value;
            const imageFileInput = document.getElementById('add-image-file').files[0];
            
            let finalImage = "";

            if (imageFileInput) {
                try {
                    finalImage = await convertBase64(imageFileInput);
                } catch (error) {
                    alert("Error reading the image file!");
                    return;
                }
            } else if (imageUrlInput) {
                finalImage = imageUrlInput;
            } else {
                alert("Please provide an image URL OR upload a file from your computer!");
                return;
            }

            const productData = {
                name: name,
                category: category,
                price: price,
                image: finalImage,
                description: description
            };

            const apiUrl = editingProductId 
                ? `http://localhost:5001/api/products/${editingProductId}` 
                : 'http://localhost:5001/api/products';
            const apiMethod = editingProductId ? 'PUT' : 'POST';

            try {
                const response = await fetch(apiUrl, {
                    method: apiMethod,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });

                if (response.ok) {
                    alert(editingProductId ? '✅ Product UPDATED successfully!' : '🎉 Product ADDED successfully!');
                    
                    // Reset form and state
                    addProductForm.reset();
                    editingProductId = null;
                    submitButton.textContent = 'Save Product';
                    submitButton.style.backgroundColor = '#2563eb'; 
                    
                    // Auto switch back to inventory tab after saving
                    document.querySelector('.menu-item[data-target="inventory-section"]').click();
                    
                } else {
                    const errorData = await response.json();
                    alert('Error: ' + errorData.message);
                }
            } catch (error) {
                console.error('Failed to fetch:', error);
                alert('Cannot connect to the server. Is backend running?');
            }
        });
    }

    // Handle Edit and Delete Product Buttons
    const productTableBody = document.getElementById('productListBody');
    if (productTableBody) {
        productTableBody.addEventListener('click', async (event) => {
            const productId = event.target.getAttribute('data-id');

            // DELETE PRODUCT
            if (event.target.classList.contains('btn-delete')) {
                const confirmDelete = confirm("Are you sure you want to delete this product?");
                if (confirmDelete) {
                    try {
                        const response = await fetch(`http://localhost:5001/api/products/${productId}`, { method: 'DELETE' });
                        const data = await response.json();
                        if (response.ok) {
                            alert('🗑️ ' + data.message);
                            if (editingProductId === productId) {
                                addProductForm.reset();
                                editingProductId = null;
                                submitButton.textContent = 'Save Product';
                                submitButton.style.backgroundColor = '#2563eb';
                            }
                            fetchAndRenderProducts(); 
                        } else {
                            alert('Error: ' + data.message);
                        }
                    } catch (error) {
                        alert('Cannot connect to the server.');
                    }
                }
            }

            // EDIT PRODUCT
            if (event.target.classList.contains('btn-edit')) {
                const selectedProduct = allProductsList.find(p => p._id === productId);
                if (selectedProduct) {
                    // Điền dữ liệu vào form
                    document.getElementById('add-name').value = selectedProduct.name;
                    document.getElementById('add-category').value = selectedProduct.category;
                    document.getElementById('add-price').value = selectedProduct.price;
                    document.getElementById('add-description').value = selectedProduct.description;
                    document.getElementById('add-image-url').value = selectedProduct.image || "";
                    
                    editingProductId = productId;
                    submitButton.textContent = 'Update Product';
                    submitButton.style.backgroundColor = '#10b981'; // Green for update
                    
                    // TỰ ĐỘNG CHUYỂN SANG TAB ADD/UPDATE
                    document.querySelector('.menu-item[data-target="add-product-section"]').click();
                }
            }
        });
    }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Fetch and render Products
async function fetchAndRenderProducts() {
    const tableBody = document.getElementById('productListBody');
    if (!tableBody) return;

    try {
        const response = await fetch('http://localhost:5001/api/products');
        allProductsList = await response.json(); 

        tableBody.innerHTML = '';
        if (allProductsList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-message">No products found in the database.</td></tr>';
            return;
        }

        allProductsList.forEach(product => {
            const row = document.createElement('tr');
            const imageUrl = product.image ? product.image : 'https://placehold.co/50x50?text=No+Img';
            row.innerHTML = `
                <td><img src="${imageUrl}" alt="${product.name}"></td>
                <td style="font-weight: 600;">${product.name}</td>
                <td>${product.category}</td>
                <td class="price-cell">$${product.price.toLocaleString()}</td>
                <td>
                    <button class="btn-edit" data-id="${product._id}">Edit</button>
                    <button class="btn-delete" data-id="${product._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="empty-message" style="color: red;">Error connecting to the server.</td></tr>';
    }
}

// Fetch and render Orders
async function fetchAndRenderOrders() {
    const tableBody = document.getElementById('orderListBody');
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-message">Loading orders from database...</td></tr>';

    try {
        const response = await fetch('http://localhost:5001/api/orders');
        const orders = await response.json();

        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-message">No orders have been placed yet.</td></tr>';
            return;
        }

        // Loop through orders and create rows
        orders.forEach(order => {
            const row = document.createElement('tr');
            
            // Format order date safely
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
            
            // Fallback for customer name if field varies
            const customerName = order.fullName || order.name || order.customerName || 'Guest Customer';
            
            // Fallback for total price
            const totalPrice = order.totalPrice || order.totalAmount || 0;
            
            // Get current status from DB, default to Pending
            const currentStatus = order.status || 'Pending';
            
            // Đổi màu trạng thái
            let statusBadgeColor = '#64748b'; 
            switch(currentStatus.toLowerCase()) {
                case 'pending': statusBadgeColor = '#64748b'; break;
                case 'processing': statusBadgeColor = '#f59e0b'; break;
                case 'shipped': statusBadgeColor = '#3b82f6'; break;
                case 'delivered':
                case 'completed': statusBadgeColor = '#10b981'; break;
                case 'cancelled': statusBadgeColor = '#ef4444'; break;
            }

            row.innerHTML = `
                <td style="font-weight: 600; color: #475569;">#${order._id.substring(0, 8).toUpperCase()}</td>
                <td>
                    <strong>${customerName}</strong><br>
                    <small style="color: #64748b;">${orderDate}</small>
                </td>
                <td class="price-cell">$${totalPrice.toLocaleString()}</td>
                
                <td>
                    <select class="status-dropdown" data-order-id="${order._id}" style="
                        padding: 6px; 
                        border-radius: 4px; 
                        border: 1px solid #cbd5e1;
                        background-color: #f8fafc;
                        font-weight: 600;
                        color: #334155;
                        outline: none;
                        cursor: pointer;
                    ">
                        <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${currentStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${currentStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${currentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${statusBadgeColor}; margin-left: 8px; box-shadow: 0 0 4px ${statusBadgeColor};" title="${currentStatus}"></span>
                </td>
                
                <td>
                    <button class="btn-action update-status-btn" data-order-id="${order._id}" style="background-color: #2563eb;">Update</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        const updateButtons = document.querySelectorAll('.update-status-btn');
        updateButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const orderId = event.target.getAttribute('data-order-id');
                const correspondingDropdown = document.querySelector(`.status-dropdown[data-order-id="${orderId}"]`);
                const newStatusValue = correspondingDropdown.value;

                try {
                    const response = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatusValue })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert(`✅ ${data.message}`);
                        fetchAndRenderOrders(); 
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                } catch (error) {
                    alert('Cannot connect to the server. Is backend running?');
                }
            });
        });

    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="5" class="empty-message" style="color: red;">Error connecting to the server to fetch orders.</td></tr>';
    }
}

// Convert image to Base64
function convertBase64(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
    });
}