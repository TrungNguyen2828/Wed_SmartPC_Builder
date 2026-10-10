document.addEventListener('DOMContentLoaded', function() {
    // ---------------------------------------------------------
    // 1. DOM Elements Selection
    // ---------------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    
    // Input Fields
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // UI Elements
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    // ---------------------------------------------------------
    // 2. Password Visibility Toggle Logic
    // ---------------------------------------------------------
    
    // Toggle main password
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            // Check current input type and swap
            const currentType = passwordInput.getAttribute('type');
            const newType = currentType === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', newType);
            
            // Toggle eye / eye-slash icons
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Toggle confirm password
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function () {
            // Check current input type and swap
            const currentType = confirmPasswordInput.getAttribute('type');
            const newType = currentType === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', newType);
            
            // Toggle eye / eye-slash icons
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // ---------------------------------------------------------
    // 3. Form Submission & Validation Logic
    // ---------------------------------------------------------
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            // Prevent page refresh on submit
            event.preventDefault(); 

            // Extract and trim values
            const fullname = fullnameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const address = addressInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            // Frontend Validation: Passwords must match
            if (password !== confirmPassword) {
                errorMessage.textContent = "Passwords do not match. Please try again.";
                errorMessage.style.display = "block";
                return; // Stop execution
            }

            // Hide error message before making request
            errorMessage.style.display = "none";

            try {
                // Backend API Call
                const response = await fetch('http://localhost:5001/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullname: fullname,
                        email: email,
                        phone: phone,
                        address: address,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Registration success handling
                    alert("Account created successfully! Redirecting to login...");
                    window.location.href = "login.html"; 
                } else {
                    // Backend Validation (e.g., Duplicate Email)
                    errorMessage.textContent = data.message || "Registration failed. Please try again.";
                    errorMessage.style.display = "block";
                }
            } catch (error) {
                // Server/Network Error Handling
                console.error("Server connection error:", error);
                errorMessage.textContent = "Cannot connect to the server. Please ensure the backend is running.";
                errorMessage.style.display = "block";
            }
        });
    }
});