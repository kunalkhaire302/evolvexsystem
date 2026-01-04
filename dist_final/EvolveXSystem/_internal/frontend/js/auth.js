/**
 * Authentication Logic
 * Handles login and registration
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const messageContainer = document.getElementById('messageContainer');

    // Switch between login and register forms
    showRegisterBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
        clearMessage();
    });

    showLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
        clearMessage();
    });

    // Handle login
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            showMessage('Logging in...', 'success');

            const response = await API.login(username, password);

            // Store token
            setToken(response.access_token);

            showMessage('Login successful! Redirecting...', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            showMessage(error.message || 'Login failed. Please try again.', 'error');
        }
    });

    // Handle registration
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            showMessage('Creating account...', 'success');

            const response = await API.register(username, email, password);

            // Store token
            setToken(response.access_token);

            showMessage('Account created! Redirecting...', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            showMessage(error.message || 'Registration failed. Please try again.', 'error');
        }
    });

    /**
     * Show message to user
     */
    function showMessage(message, type) {
        if (!messageContainer) return;

        messageContainer.textContent = message;
        messageContainer.className = `message-container show ${type}`;
    }

    /**
     * Clear message
     */
    function clearMessage() {
        if (!messageContainer) return;
        messageContainer.className = 'message-container';
    }
});
