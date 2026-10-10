// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert("Please login to view your profile.");
        window.location.href = "login.html";
        return;
    }

    // Identify user by Email (for Profile info) and ID (for Orders)
    const userEmail = currentUser.email || localStorage.getItem('userEmail');
    const userId = currentUser._id || currentUser.id;

    // 2. Load Profile Info
    async function loadUserProfile() {
        try {
            const response = await fetch(`http://localhost:5001/api/users/profile/${userEmail}`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('email').value = data.email;
                document.getElementById('username').value = data.username || currentUser.fullname || '';
                document.getElementById('phone').value = data.phone || '';
                document.getElementById('address').value = data.address || '';
            } else {
                // If API fails, at least show the email we know
                document.getElementById('email').value = userEmail;
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            document.getElementById('email').value = userEmail;
        }
    }

    // 3. Load Order History
    async function loadUserOrders() {
        const tableBody = document.getElementById('userOrdersBody');
        
        try {
            const response = await fetch(`http://localhost:5001/api/orders/user/${userId}`);
            const orders = await response.json();

            tableBody.innerHTML = ''; // Clear loading text

            if (!response.ok || orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">You have no order history yet.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                const orderDate = new Date(order.createdAt).toLocaleDateString();
                const totalPrice = order.totalPrice || order.totalAmount || 0;
                const status = order.status || 'Pending';

                // Determine badge color
                let badgeColor = '#64748b'; // Pending
                if (status.toLowerCase() === 'processing') badgeColor = '#f59e0b';
                if (status.toLowerCase() === 'shipped') badgeColor = '#3b82f6';
                if (status.toLowerCase() === 'delivered' || status.toLowerCase() === 'completed') badgeColor = '#10b981';
                if (status.toLowerCase() === 'cancelled') badgeColor = '#ef4444';

                row.innerHTML = `
                    <td style="font-weight: bold; color: #475569;">#${order._id.substring(0, 8).toUpperCase()}</td>
                    <td>${orderDate}</td>
                    <td style="color: #dc2626; font-weight: bold;">$${totalPrice.toLocaleString()}</td>
                    <td>
                        <span class="status-badge" style="background-color: ${badgeColor};">
                            ${status}
                        </span>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error("Error loading orders:", error);
            tableBody.innerHTML = '<tr><td colspan="4" style="color: red; text-align: center;">Error connecting to server to load orders.</td></tr>';
        }
    }

    // 4. Handle Profile Update
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            username: document.getElementById('username').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        try {
            const response = await fetch(`http://localhost:5001/api/users/profile/${userEmail}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert("Profile updated successfully!");
                // Optionally update localStorage if fullname changed
                currentUser.fullname = updatedData.username;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                alert("Update failed: " + result.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });

    // Run functions on load
    loadUserProfile();
    if (userId) {
        loadUserOrders();
    }
});