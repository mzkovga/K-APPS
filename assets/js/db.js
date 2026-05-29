/**
 * db.js
 * Capa de abstracción de base de datos para FlashLingo.
 * Actualmente usa localStorage. Arquitectura lista para migrar a PHP/MySQL.
 */

const DB_KEY = 'flashlingo_db';

// Inicializar la base de datos local si está vacía
async function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        const initialDB = {
            users: [],
            progress: {} // Estructura: progress[userId] = { streak, totalSessions, totalTime, modules: {} }
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    }
}

// Funciones privadas de utilidad para manejar el Storage
function getDB() {
    return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ============================================================================
// API SIMULADA (Estas funciones son las que consumirás desde otros archivos)
// ============================================================================

/**
 * Obtiene los módulos desde el JSON estático (Simula un GET a una API)
 */
async function fetchModules() {
    try {
        const response = await fetch('./data/modules.json');
        if (!response.ok) throw new Error('Error de red al cargar módulos');
        return await response.json();
    } catch (error) {
        console.error("Error cargando modules.json:", error);
        return { modules: [] };
    }
}

/**
 * Autentica un usuario existente
 */
async function loginUser(username, password) {
    await initDB();
    const db = getDB();
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        return { success: true, userId: user.id, username: user.username };
    }
    return { success: false, message: "Usuario o contraseña incorrectos." };
}

/**
 * Registra un nuevo usuario y crea su estructura de progreso
 */
async function registerUser(username, password) {
    await initDB();
    const db = getDB();
    
    if (db.users.some(u => u.username === username)) {
        return { success: false, message: "El usuario ya existe." };
    }

    const newUser = {
        id: 'user_' + Date.now(), // Generación de ID único simple
        username,
        password // IMPORTANTE: En el backend PHP real, esto debe usar password_hash()
    };
    
    db.users.push(newUser);
    
    // Inicializar el progreso en 0 para el nuevo usuario
    db.progress[newUser.id] = {
        streak: 0,
        lastSessionDate: null,
        totalSessions: 0,
        totalTime: 0, // En segundos
        history: [],
        modules: {}
    };
    
    saveDB(db);
    return { success: true, userId: newUser.id, username: newUser.username };
}

/**
 * Obtiene todo el progreso de un usuario específico
 */
async function getUserProgress(userId) {
    const db = getDB();
    return db.progress[userId] || null;
}

/**
 * Guarda los resultados al finalizar una sesión de práctica
 * sessionData debe contener: { duration, totalCards, correct, incorrect }
 */
async function saveSessionResults(userId, moduleId, sessionData) {
    const db = getDB();
    if (!db.progress[userId]) return { success: false, message: "Usuario no encontrado en progreso." };

    const progress = db.progress[userId];
    const today = new Date().toDateString();

    // 1. Lógica para calcular la Racha (Streak)
    if (progress.lastSessionDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (progress.lastSessionDate === yesterday.toDateString()) {
            progress.streak += 1; // Practicó ayer y hoy
        } else {
            progress.streak = 1; // Perdió la racha, vuelve a empezar
        }
        progress.lastSessionDate = today;
    }

    // 2. Actualizar totales globales
    progress.totalSessions += 1;
    progress.totalTime += sessionData.duration;

    // 3. Actualizar estadísticas específicas del módulo
    if (!progress.modules[moduleId]) {
        progress.modules[moduleId] = { views: 0, correct: 0, incorrect: 0, mastery: 0 };
    }
    
    const mod = progress.modules[moduleId];
    mod.views += sessionData.totalCards;
    mod.correct += sessionData.correct;
    mod.incorrect += sessionData.incorrect;
    
    // Calcular porcentaje de dominio (mastery) del módulo
    mod.mastery = Math.round((mod.correct / mod.views) * 100);

    // 4. Guardar registro en el historial general
    progress.history.push({
        date: new Date().toISOString(),
        moduleId: moduleId,
        score: sessionData.correct,
        total: sessionData.totalCards,
        duration: sessionData.duration
    });

    saveDB(db);
    return { success: true };
}

// Exponer la API globalmente para que auth.js, ui.js y engine.js puedan usarla
window.api = {
    fetchModules,
    loginUser,
    registerUser,
    getUserProgress,
    saveSessionResults
};