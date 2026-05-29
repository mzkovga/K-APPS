/**
 * auth.js
 * Maneja la lógica de inicio de sesión, registro y control de sesión activa.
 */

const SESSION_KEY = 'flashlingo_session';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Verificar si ya hay una sesión activa
    const currentSession = localStorage.getItem(SESSION_KEY);
    // Si estamos en login.html y hay sesión, redirigir al index
    if (currentSession && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Referencias al DOM (solo existen en login.html)
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Si no estamos en la página de login, detenemos la ejecución del resto del script
    if (!loginForm) return;

    // 3. Lógica para alternar entre vistas
    document.getElementById('go-to-register').addEventListener('click', () => {
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });

    document.getElementById('go-to-login').addEventListener('click', () => {
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    });

    // 4. Manejo del Submit: LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value.trim();
        const errorDiv = document.getElementById('login-error');
        
        errorDiv.style.display = 'none';

        // Usamos la API de db.js
        const result = await window.api.loginUser(user, pass);

        if (result.success) {
            iniciarSesionLocal(result.userId, result.username);
        } else {
            errorDiv.textContent = result.message;
            errorDiv.style.display = 'block';
        }
    });

    // 5. Manejo del Submit: REGISTRO
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('reg-username').value.trim();
        const pass = document.getElementById('reg-password').value.trim();
        const errorDiv = document.getElementById('register-error');
        
        errorDiv.style.display = 'none';

        if (user.length < 3 || pass.length < 4) {
            errorDiv.textContent = "El usuario debe tener al menos 3 caracteres y la contraseña 4.";
            errorDiv.style.display = 'block';
            return;
        }

        // Usamos la API de db.js
        const result = await window.api.registerUser(user, pass);

        if (result.success) {
            iniciarSesionLocal(result.userId, result.username);
        } else {
            errorDiv.textContent = result.message;
            errorDiv.style.display = 'block';
        }
    });

});

/**
 * Guarda los datos del usuario en la sesión local y redirige al dashboard.
 */
function iniciarSesionLocal(userId, username) {
    const sessionData = { userId, username, timestamp: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    window.location.href = 'index.html';
}

/**
 * Función pública para cerrar sesión (será usada desde el header de index.html)
 */
window.logout = function() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
};

/**
 * Función utilitaria para obtener el usuario actual desde otros scripts
 */
window.getCurrentUser = function() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
};