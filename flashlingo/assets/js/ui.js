/**
 * ui.js
 * Maneja la renderización del Dashboard, control de UI (tema oscuro) y carga de datos.
 */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Protección de ruta: Verificar que el usuario esté logueado
    const currentUser = window.getCurrentUser();
    
    // Si no hay sesión y no estamos en login.html, redirigir al login
    if (!currentUser && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Control de Tema Oscuro/Claro (Modo local)
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        // Cargar preferencia guardada
        const savedTheme = localStorage.getItem('flashlingo_theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        }

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('flashlingo_theme', 'light');
                themeToggleBtn.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('flashlingo_theme', 'dark');
                themeToggleBtn.textContent = '☀️';
            }
        });
    }

    // 3. Inicializar Dashboard (solo si estamos en index.html)
    const modulesContainer = document.getElementById('modules-container');
    if (modulesContainer && currentUser) {
        await initDashboard(currentUser);
    }
});

/**
 * Carga la información del usuario y los módulos disponibles en el Dashboard
 */
async function initDashboard(user) {
    // Saludar al usuario
    document.getElementById('user-greeting').textContent = `Hola, ${user.username}`;

    // Obtener progreso del usuario desde la base de datos (db.js)
    const progress = await window.api.getUserProgress(user.userId);
    
    if (progress) {
        document.getElementById('stat-streak').textContent = `${progress.streak}🔥`;
        document.getElementById('stat-sessions').textContent = progress.totalSessions;
    }

    // Cargar los módulos disponibles desde el JSON
    const data = await window.api.fetchModules();
    const modulesContainer = document.getElementById('modules-container');
    
    modulesContainer.innerHTML = ''; // Limpiar contenedor

    if (!data.modules || data.modules.length === 0) {
        modulesContainer.innerHTML = '<p>No se encontraron módulos de aprendizaje.</p>';
        return;
    }

    // Renderizar cada módulo como una tarjeta Bento
    data.modules.forEach(mod => {
        // Buscar el progreso específico de este módulo, si existe
        const modProgress = progress && progress.modules[mod.id] ? progress.modules[mod.id] : { mastery: 0, views: 0 };
        
        const card = document.createElement('div');
        card.className = 'bento-card module-card';
        card.innerHTML = `
            <div class="module-icon">${mod.icon}</div>
            <h3 style="margin-bottom: 8px;">${mod.title}</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem;">${mod.description}</p>
            <div class="module-progress">
                <strong>Dominio: ${modProgress.mastery}%</strong> (Tarjetas vistas: ${modProgress.views})
            </div>
            <button class="btn btn-primary" style="margin-top: 16px;">Practicar</button>
        `;

        // Al hacer clic, redirigir a la pantalla de práctica pasando el ID del módulo en la URL
        card.addEventListener('click', () => {
            window.location.href = `practice.html?module=${mod.id}`;
        });

        modulesContainer.appendChild(card);
    });
}