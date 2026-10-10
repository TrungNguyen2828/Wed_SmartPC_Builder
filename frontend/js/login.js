// Wait for the DOM to fully load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Get the error message element from HTML
    const errorMessage = document.getElementById('error-message');

    // Handle form submission using async/await
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            // Prevent default form submission behavior (page reload)
            event.preventDefault();

            // Use .trim() to remove any accidental spaces at the beginning or end
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            try {
                // Call Node.js Backend API for login
                // FIXED: Changed endpoint from '/api/auth/login' to '/api/users/login' to match server.js
                const response = await fetch('http://localhost:5001/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                // Parse the JSON response
                const data = await response.json();

                // If login is successful (Status 200)
                if (response.ok) {
                    // Hide any existing error messages
                    if (errorMessage) {
                        errorMessage.style.display = "none";
                    }
                    
                    // Save user data to browser's Local Storage for session persistence
                    localStorage.setItem('currentUser', JSON.stringify(data.user));

                    // Show welcome alert with user's full name
                    alert(`Welcome back, ${data.user.fullname}!`);
                    
                    // Redirect to the home page
                    window.location.href = "home.html";
                } else {
                    // Display error from backend (e.g., Invalid credentials)
                    if (errorMessage) {
                        errorMessage.textContent = data.message;
                        errorMessage.style.display = "block";
                    } else {
                        alert(data.message); // Fallback if error-message ID is missing
                    }
                    
                    // Clear the password field and focus it for a new try
                    passwordInput.value = "";
                    passwordInput.focus();
                }
            } catch (error) {
                // Handle network or server errors
                console.error("Error connecting to server:", error);
                if (errorMessage) {
                    errorMessage.textContent = "Server is not responding. Please check your connection.";
                    errorMessage.style.display = "block";
                } else {
                    alert("Server is not responding. Please check your connection.");
                }
            }
        });
    }
});