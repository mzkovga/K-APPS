/**
 * engine.js
 * Motor lógico de FlashLingo. Controla el flujo de la sesión de estudio,
 * los tipos de tarjetas, validación de respuestas y registro de resultados.
 */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Validar sesión
    const currentUser = window.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Obtener el ID del módulo desde la URL (?module=wh-questions)
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module');

    if (!moduleId) {
        window.location.href = 'index.html';
        return;
    }

    // Configurar botón de regreso
    document.getElementById('btn-back').addEventListener('click', () => {
        if(confirm('¿Seguro que quieres salir? El progreso de esta sesión se perderá.')) {
            window.location.href = 'index.html';
        }
    });

    // 3. Inicializar el motor
    await initEngine(moduleId, currentUser);
});

// Variables de estado de la sesión
let currentModule = null;
let sessionCards = [];
let currentIndex = 0;
let sessionStats = {
    correct: 0,
    incorrect: 0,
    startTime: 0
};
let isAnswerChecked = false; 
let userSelectedOption = null; 

async function initEngine(moduleId, user) {
    const data = await window.api.fetchModules();
    currentModule = data.modules.find(m => m.id === moduleId);

    if (!currentModule || !currentModule.cards || currentModule.cards.length === 0) {
        alert("Error: No se pudo cargar el contenido del módulo.");
        window.location.href = 'index.html';
        return;
    }

    // Configurar UI inicial
    document.getElementById('module-title').textContent = currentModule.title;
    
    // Preparar las tarjetas (Clonamos y mezclamos aleatoriamente)
    sessionCards = shuffleArray([...currentModule.cards]);
    sessionStats.startTime = Date.now();
    
    // Configurar el botón de acción principal
    const btnAction = document.getElementById('btn-action');
    btnAction.style.display = 'block';
    btnAction.addEventListener('click', handleActionButton);

    // Permitir enviar con la tecla Enter
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleActionButton();
        }
    });

    // Renderizar la primera tarjeta
    renderCard();
}

/**
 * Dibuja la tarjeta actual en pantalla según su tipo
 */
function renderCard() {
    if (currentIndex >= sessionCards.length) {
        finishSession();
        return;
    }

    const card = sessionCards[currentIndex];
    const contentDiv = document.getElementById('card-content');
    const feedbackDiv = document.getElementById('feedback');
    const btnAction = document.getElementById('btn-action');
    
    // Reiniciar estado visual
    isAnswerChecked = false;
    userSelectedOption = null;
    feedbackDiv.style.display = 'none';
    feedbackDiv.className = 'feedback-area';
    btnAction.textContent = 'Comprobar';
    btnAction.className = 'btn btn-primary';
    btnAction.style.display = 'block'; // Asegurarnos de que el botón principal es visible

    // Actualizar progreso
    document.getElementById('progress-text').textContent = `Tarjeta ${currentIndex + 1} de ${sessionCards.length}`;

    // Construir HTML basado en el tipo de tarjeta
    let html = `<div class="card-prompt">${card.prompt}</div>`;

    if (card.type === 'multiple-choice') {
        html += `<div class="options-grid" id="options-container">`;
        const shuffledOptions = shuffleArray([...card.options]);
        shuffledOptions.forEach((opt) => {
            html += `<button class="option-btn" data-value="${opt.replace(/"/g, '&quot;')}">${opt}</button>`;
        });
        html += `</div>`;
        contentDiv.innerHTML = html;

        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (isAnswerChecked) return; 
                optionButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                userSelectedOption = e.target.getAttribute('data-value');
            });
        });

    } else if (card.type === 'flashcard-flip') {
        // --- NUEVO TIPO: FLASHCARD DE MEMORIZACIÓN ---
        html += `
            <div id="flip-answer-area" style="display: none; margin-top: 24px; padding-top: 24px; border-top: 2px dashed var(--border-color);">
                <div style="font-size: 1.4rem; color: var(--accent-color); font-weight: bold; margin-bottom: 20px;">${card.answer}</div>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">¿Recordabas la respuesta correcta?</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn self-rate-btn" data-correct="true" style="background-color: var(--success-color); color: white; width: auto; padding: 12px 24px;">Lo sabía</button>
                    <button class="btn self-rate-btn" data-correct="false" style="background-color: var(--danger-color); color: white; width: auto; padding: 12px 24px;">No lo sabía</button>
                </div>
            </div>
        `;
        contentDiv.innerHTML = html;
        btnAction.textContent = 'Revelar Respuesta';

    } else {
        // Tipos de escritura ('translation', 'fill-in', 'correction')
        let placeholder = "Escribe tu respuesta en inglés...";
        if (card.type === 'correction') placeholder = "Escribe la frase corregida...";
        
        html += `
            <div class="form-group">
                <input type="text" id="answer-input" class="form-control" placeholder="${placeholder}" autocomplete="off" autofocus>
            </div>
        `;
        contentDiv.innerHTML = html;
        setTimeout(() => document.getElementById('answer-input').focus(), 50);
    }
}

/**
 * Maneja la lógica al hacer clic en "Comprobar", "Revelar" o "Siguiente"
 */
function handleActionButton() {
    if (isAnswerChecked) {
        currentIndex++;
        renderCard();
    } else {
        checkAnswer();
    }
}

/**
 * Valida la entrada del usuario o revela la tarjeta
 */
function checkAnswer() {
    const card = sessionCards[currentIndex];
    
    // Si es tipo flip, solo revelamos y esperamos a que el usuario evalúe
    if (card.type === 'flashcard-flip') {
        document.getElementById('flip-answer-area').style.display = 'block';
        document.getElementById('btn-action').style.display = 'none'; // Ocultamos el botón principal

        // Asignar eventos a los botones de autoevaluación
        document.querySelectorAll('.self-rate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isCorrect = e.target.getAttribute('data-correct') === 'true';
                if (isCorrect) sessionStats.correct++;
                else sessionStats.incorrect++;
                
                // Pasar automáticamente a la siguiente tarjeta
                currentIndex++;
                renderCard();
            }, { once: true });
        });
        return; // Salir de la función aquí para no ejecutar la lógica de input de texto
    }

    // Lógica para tarjetas interactivas (opción múltiple o escritura)
    let userAnswer = "";

    if (card.type === 'multiple-choice') {
        if (!userSelectedOption) {
            alert("Por favor, selecciona una opción.");
            return;
        }
        userAnswer = userSelectedOption;
    } else {
        const inputEl = document.getElementById('answer-input');
        if (!inputEl.value.trim()) return;
        userAnswer = inputEl.value;
        inputEl.disabled = true; 
    }

    isAnswerChecked = true;
    
    const normalize = (str) => str.toLowerCase().trim().replace(/[.,!?¿¡]/g, '');
    const isCorrect = normalize(userAnswer) === normalize(card.answer);

    const feedbackDiv = document.getElementById('feedback');
    const btnAction = document.getElementById('btn-action');

    feedbackDiv.style.display = 'block';

    if (isCorrect) {
        sessionStats.correct++;
        feedbackDiv.className = 'feedback-area feedback-correct';
        feedbackDiv.innerHTML = `¡Correcto! 🎉`;
    } else {
        sessionStats.incorrect++;
        feedbackDiv.className = 'feedback-area feedback-incorrect';
        feedbackDiv.innerHTML = `
            Incorrecto
            <span class="correct-answer-text">La respuesta correcta era: <strong>${card.answer}</strong></span>
        `;
    }

    btnAction.textContent = 'Siguiente ➔';
    btnAction.className = 'btn btn-secondary';
}

/**
 * Finaliza la sesión, guarda en BD y muestra resumen
 */
async function finishSession() {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - sessionStats.startTime) / 1000);
    const totalCards = sessionCards.length;
    
    const user = window.getCurrentUser();
    
    await window.api.saveSessionResults(user.userId, currentModule.id, {
        duration: durationSeconds,
        totalCards: totalCards,
        correct: sessionStats.correct,
        incorrect: sessionStats.incorrect
    });

    const contentDiv = document.getElementById('card-content');
    const feedbackDiv = document.getElementById('feedback');
    const btnAction = document.getElementById('btn-action');
    
    feedbackDiv.style.display = 'none';
    btnAction.style.display = 'none';
    document.getElementById('progress-text').textContent = "Sesión Completada";

    const scorePercentage = Math.round((sessionStats.correct / totalCards) * 100);
    let message = scorePercentage >= 80 ? "¡Excelente trabajo! 🌟" : "¡Buena práctica! Sigue así. 💪";

    contentDiv.innerHTML = `
        <div class="card-prompt">${message}</div>
        <div class="options-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 32px;">
            <div class="bento-card" style="padding: 16px; border: 1px solid var(--success-color);">
                <div style="font-size: 2rem; color: var(--success-color);">${sessionStats.correct}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Correctas</div>
            </div>
            <div class="bento-card" style="padding: 16px; border: 1px solid var(--danger-color);">
                <div style="font-size: 2rem; color: var(--danger-color);">${sessionStats.incorrect}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Incorrectas</div>
            </div>
        </div>
        <button id="btn-finish" class="btn btn-primary">Volver al Dashboard</button>
    `;

    document.getElementById('btn-finish').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}