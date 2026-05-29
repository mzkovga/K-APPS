// ==========================================================================
// VARIABLES DE CONTROL GLOBAL
// ==========================================================================
let idEnEsperaEliminar = null;
let liveSessionInterval = null;
let liveStartTime = null;
let isSleepingLive = false;

let circularChartInstance = null;
let trendChartInstance = null;

// Instancia global nativa para el audio (.mp3 en la raíz del proyecto)
const sleepAudio = new Audio("lluvia.mp3");
sleepAudio.loop = true;

// Variables de control para el Modo Hipnosis Inmersivo
let hypnoActive = false;
let currentHypnoCycle = 0;
let hypnoTimeouts = [];

// ==========================================================================
// UNIFICACIÓN: INICIALIZACIÓN ÚNICA AL CARGAR EL DOM
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();         // 1. Control de Modo Claro / Oscuro
    initDateTimeInputs();      // 2. Configuración de fechas en formulario
    initLiveSessionControls(); // 3. Motor de monitoreo en tiempo real
    initAudioPlayer();         // 4. Motor de reproducción de sonido (.mp3)
    initBreathingCards();      // 5. Motor unificado de Respiración (Tarjeta + Modal Inmersivo)
    renderDashboard();         // 6. Carga inicial de tablas e historial
    
    // Captura del envío del formulario manual
    document.getElementById("sleepForm").addEventListener("submit", (e) => {
        e.preventDefault();
        guardarRegistroManual();
    });
});

// ==========================================================================
// 1. INTERRUPTOR MODO CLARO / OSCURO (THEME CONTROL)
// ==========================================================================
function initThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    const themeLabel = document.getElementById("themeLabel");
    const currentTheme = localStorage.getItem("sleep_theme") || "dark";
    
    if (currentTheme === "light") {
        document.body.setAttribute("data-theme", "light");
        if (themeToggle) themeToggle.checked = false;
        if (themeLabel) themeLabel.innerText = "Light";
    } else {
        document.body.removeAttribute("data-theme");
        if (themeToggle) themeToggle.checked = true;
        if (themeLabel) themeLabel.innerText = "Dark";
    }

    if (themeToggle) {
        themeToggle.addEventListener("change", () => {
            if (!themeToggle.checked) {
                document.body.setAttribute("data-theme", "light");
                themeLabel.innerText = "Light";
                localStorage.setItem("sleep_theme", "light");
            } else {
                document.body.removeAttribute("data-theme");
                themeLabel.innerText = "Dark";
                localStorage.setItem("sleep_theme", "dark");
            }
            renderDashboard();
        });
    }
}

// ==========================================================================
// 2. CONFIGURACIÓN DE FECHAS
// ==========================================================================
function initDateTimeInputs() {
    const ahora = new Date();
    const localAhora = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const haceOchoHoras = new Date(ahora.getTime() - 8 * 60 * 60 * 1000);
    const localPasado = new Date(haceOchoHoras.getTime() - haceOchoHoras.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    document.getElementById("sleepStart").value = localPasado;
    document.getElementById("sleepEnd").value = localAhora;
}

// ==========================================================================
// 3. CRONÓMETRO DE SUEÑO EN VIVO
// ==========================================================================
function initLiveSessionControls() {
    const btnAction = document.getElementById("btnSleepAction");
    const btnReset = document.getElementById("btnResetSession");
    const timerBadge = document.getElementById("timerBadge");
    const hoursCountTxt = document.getElementById("hoursCountTxt");

    btnAction.addEventListener("click", () => {
        if (!isSleepingLive) {
            isSleepingLive = true;
            liveStartTime = new Date();
            localStorage.setItem("sleep_live_start", liveStartTime.toISOString());
            
            btnAction.innerText = "¡Despertar! ⏰";
            btnAction.style.backgroundColor = "#b45309";
            timerBadge.innerText = "Durmiendo";
            timerBadge.className = "badge-status bg-amber";
            
            liveSessionInterval = setInterval(updateLiveTimer, 1000);
        } else {
            clearInterval(liveSessionInterval);
            const fin = new Date();
            const diffMs = fin - new Date(liveStartTime);
            const horasTotales = (diffMs / (1000 * 60 * 60)).toFixed(1);
            
            if (parseFloat(horasTotales) >= 0.01) {
                const nuevoRegistro = {
                    id: Date.now(),
                    inicio: new Date(liveStartTime).toLocaleString(),
                    fin: fin.toLocaleString(),
                    duracion: parseFloat(horasTotales),
                    calidad: document.getElementById("sleepQuality").value,
                    notas: document.getElementById("sleepContext").value || "Calculado en sesión en vivo"
                };
                let r = obtenerRegistros();
                r.unshift(nuevoRegistro);
                localStorage.setItem("sleep_records", JSON.stringify(r));
            }
            
            isSleepingLive = false;
            localStorage.removeItem("sleep_live_start");
            btnAction.innerText = "Comenzar a Dormir 🛌";
            btnAction.style.backgroundColor = "var(--slate-button)";
            timerBadge.innerText = "Espera";
            timerBadge.className = "badge-status";
            hoursCountTxt.innerText = "0.0";
            renderDashboard();
        }
    });

    btnReset.addEventListener("click", () => {
        clearInterval(liveSessionInterval);
        isSleepingLive = false;
        localStorage.removeItem("sleep_live_start");
        btnAction.innerText = "Comenzar a Dormir 🛌";
        btnAction.style.backgroundColor = "var(--slate-button)";
        timerBadge.innerText = "Espera";
        timerBadge.className = "badge-status";
        hoursCountTxt.innerText = "0.0";
    });

    const savedLiveStart = localStorage.getItem("sleep_live_start");
    if (savedLiveStart) {
        isSleepingLive = true;
        liveStartTime = new Date(savedLiveStart);
        btnAction.innerText = "¡Despertar! ⏰";
        btnAction.style.backgroundColor = "#b45309";
        timerBadge.innerText = "Durmiendo";
        timerBadge.className = "badge-status bg-amber";
        liveSessionInterval = setInterval(updateLiveTimer, 1000);
    }
}

function updateLiveTimer() {
    if (!liveStartTime) return;
    const diffMs = new Date() - new Date(liveStartTime);
    const totalSeconds = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    
    document.getElementById("timerBadge").innerText = `${hrs}:${mins}:${secs}`;
    document.getElementById("hoursCountTxt").innerText = (diffMs / (1000 * 60 * 60)).toFixed(2);
}

// ==========================================================================
// 4. CONTROLADOR REPRODUCTOR DE AUDIO (.MP3)
// ==========================================================================
function initAudioPlayer() {
    const btnPlaySound = document.getElementById("btnPlaySound");
    const soundStatusBadge = document.getElementById("soundStatusBadge");
    const volumeSlider = document.getElementById("volumeSlider");

    sleepAudio.volume = volumeSlider.value;

    btnPlaySound.addEventListener("click", () => {
        if (sleepAudio.paused) {
            sleepAudio.play()
                .then(() => {
                    btnPlaySound.classList.add("playing");
                    soundStatusBadge.innerText = "Reproduciendo";
                    soundStatusBadge.className = "badge-status bg-green";
                })
                .catch(err => {
                    console.log("Audio bloqueado o ausente: ", err);
                    alert("Asegúrate de tener el archivo 'lluvia.mp3' en la raíz del proyecto para habilitar el sonido ambiente.");
                });
        } else {
            sleepAudio.pause();
            btnPlaySound.classList.remove("playing");
            soundStatusBadge.innerText = "Apagado";
            soundStatusBadge.className = "badge-status";
        }
    });

    volumeSlider.addEventListener("input", (e) => {
        sleepAudio.volume = e.target.value;
    });
}

// ==========================================================================
// 5. MOTOR UNIFICADO DE RESPIRACIÓN (TARJETA + MODAL DE HIPNOSIS EN VIVO)
// ==========================================================================
function initBreathingCards() {
    // Componentes de la Guía Tradicional en Tarjeta
    const btnStartCard = document.getElementById("btnStartBreathing");
    const circleCard = document.getElementById("breathingCircle");
    const textCard = document.getElementById("breathingText");
    const subtextCard = document.getElementById("breathingSubtext");
    const badgeCard = document.getElementById("breathingCycleBadge");

    let cardActive = false;
    let cardCycle = 0;
    let cardTimeouts = [];

    // Componentes del Modal Inmersivo Pop-up (Inspirado en image_f23e7c.png)
    const overlay = document.getElementById("sleepInmersiveModal");
    const btnOpenInmersive = document.getElementById("btnOpenInmersive");
    const btnCloseInmersive = document.getElementById("btnCloseInmersive");
    const btnStartHypno = document.getElementById("btnStartHypno");
    
    const hypnoCircle = document.getElementById("hypnoCircle");
    const hypnoBlob = document.getElementById("hypnoBlobBackend");
    const textHypno = document.getElementById("hypnoActionText");
    const cycleTextHypno = document.getElementById("sweetBreathingCycle");
    const subtextHypno = document.getElementById("hypnoSubtext");

    // --- LÓGICA 4-7-8 OPCIÓN A: CONTROL EN TARJETA ---
    function ejecutarCicloTarjeta() {
        if (!cardActive) return;
        cardCycle++;
        badgeCard.innerText = `Ciclo: ${cardCycle}/4`;
        badgeCard.className = "badge-status bg-amber";

        circleCard.className = "breathing-circle inhale";
        textCard.innerText = "Inhala";
        subtextCard.innerText = "Inhala suavemente por la nariz (4 segundos)...";

        let t1 = setTimeout(() => {
            if (!cardActive) return;
            circleCard.className = "breathing-circle hold";
            textCard.innerText = "Retén";
            subtextCard.innerText = "Mantén el aire en tus pulmones (7 segundos)...";
        }, 4000);
        cardTimeouts.push(t1);

        let t2 = setTimeout(() => {
            if (!cardActive) return;
            circleCard.className = "breathing-circle exhale";
            textCard.innerText = "Exhala";
            subtextCard.innerText = "Suelta todo el aire por la boca de golpe (8 segundos)...";
        }, 11000);
        cardTimeouts.push(t2);

        let t3 = setTimeout(() => {
            if (!cardActive) return;
            if (cardCycle < 4) {
                ejecutarCicloTarjeta();
            } else {
                finalizarEjercicioTarjeta(true);
            }
        }, 19000);
        cardTimeouts.push(t3);
    }

    function finalizarEjercicioTarjeta(completado) {
        cardActive = false;
        cardCycle = 0;
        cardTimeouts.forEach(t => clearTimeout(t));
        cardTimeouts = [];
        
        circleCard.className = "breathing-circle";
        textCard.innerText = "Listo";
        btnStartCard.innerText = "Guía en Tarjeta";
        btnStartCard.style.backgroundColor = "var(--slate-button)";
        badgeCard.innerText = completado ? "¡Completado!" : "Ciclo: 0/4";
        badgeCard.className = completado ? "badge-status bg-green" : "badge-status";
        subtextCard.innerText = completado ? "Tu cuerpo está listo para el descanso." : "Ejercicio en tarjeta detenido.";
    }

    btnStartCard.addEventListener("click", () => {
        if (!cardActive) {
            cardActive = true;
            btnStartCard.innerText = "Detener";
            btnStartCard.style.backgroundColor = "var(--danger)";
            ejecutarCicloTarjeta();
        } else {
            finalizarEjercicioTarjeta(false);
        }
    });

    // --- LÓGICA 4-7-8 OPCIÓN B: MODO HIPNOSIS INMERSIVO (SWEETALERT CUSTOM) ---
    btnOpenInmersive.addEventListener("click", () => {
        overlay.classList.add("active");
        resetearEstadosModalInmersivo();
    });

    const cerrarModalInmersivo = () => {
        overlay.classList.remove("active");
        resetearEstadosModalInmersivo();
    };

    btnCloseInmersive.addEventListener("click", cerrarModalInmersivo);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrarModalInmersivo(); });

    function resetearEstadosModalInmersivo() {
        hypnoActive = false;
        currentHypnoCycle = 0;
        hypnoTimeouts.forEach(t => clearTimeout(t));
        hypnoTimeouts = [];
        
        hypnoCircle.className = "hypno-main-circle";
        hypnoBlob.className = "hypno-blob-bg";
        textHypno.innerText = "SLEEP";
        cycleTextHypno.innerText = "Preparado para iniciar";
        subtextHypno.innerText = "Haz clic en iniciar para sincronizar tu mente.";
        btnStartHypno.innerText = "Iniciar Sesión 4-7-8";
        btnStartHypno.style.backgroundColor = "#475569";
    }

    function loopCicloInmersivo() {
        if (!hypnoActive) return;
        currentHypnoCycle++;
        cycleTextHypno.innerText = `Ciclo de Relajación: ${currentHypnoCycle} de 4`;

        // Fase 1: Inhalación (4s) -> Crece en azul vibrante
        hypnoCircle.className = "hypno-main-circle inhale-mode";
        hypnoBlob.className = "hypno-blob-bg inhale-mode";
        textHypno.innerText = "INHALA";
        subtextHypno.innerText = "Toma aire por la nariz de manera constante.";

        // Fase 2: Retención (7s) -> Se estabiliza en dorado
        let t1 = setTimeout(() => {
            if (!hypnoActive) return;
            hypnoCircle.className = "hypno-main-circle hold-mode";
            hypnoBlob.className = "hypno-blob-bg hold-mode";
            textHypno.innerText = "RETÉN";
            subtextHypno.innerText = "Mantén los pulmones llenos. Siente la calma.";
        }, 4000);
        hypnoTimeouts.push(t1);

        // Fase 3: Exhalación (8s) -> Se comprime en rosa/magenta profundo
        let t2 = setTimeout(() => {
            if (!hypnoActive) return;
            hypnoCircle.className = "hypno-main-circle exhale-mode";
            hypnoBlob.className = "hypno-blob-bg exhale-mode";
            textHypno.innerText = "EXHALA";
            subtextHypno.innerText = "Suelta todo el aire por la boca de forma ruidosa.";
        }, 11000);
        hypnoTimeouts.push(t2);

        // Bucle del siguiente ciclo o conclusión exitosa
        let t3 = setTimeout(() => {
            if (!hypnoActive) return;
            if (currentHypnoCycle < 4) {
                loopCicloInmersivo();
            } else {
                hypnoActive = false;
                resetearEstadosModalInmersivo();
                cycleTextHypno.innerText = "¡Ejercicio Completado con Éxito!";
                subtextHypno.innerText = "Tu sistema nervioso se encuentra equilibrado y óptimo para un sueño profundo.";
                textHypno.innerText = "ÉXITO";
            }
        }, 19000);
        hypnoTimeouts.push(t3);
    }

    btnStartHypno.addEventListener("click", () => {
        if (!hypnoActive) {
            hypnoActive = true;
            btnStartHypno.innerText = "Interrumpir Ejercicio";
            btnStartHypno.style.backgroundColor = "var(--danger)";
            loopCicloInmersivo();
        } else {
            resetearEstadosModalInmersivo();
        }
    });
}

// ==========================================================================
// 6. OPERACIONES DE PERSISTENCIA Y REGISTROS HISTÓRICOS
// ==========================================================================
function obtenerRegistros() {
    const data = localStorage.getItem("sleep_records");
    return data ? JSON.parse(data) : [
        { id: 1, inicio: "26/05/2026 22:00:00", fin: "27/05/2026 05:30:00", duracion: 7.5, calidad: "Excelente", notas: "Sin pantallas antes de acostarse" },
        { id: 2, inicio: "27/05/2026 23:30:00", fin: "28/05/2026 06:15:00", duracion: 6.8, calidad: "Regular", notas: "Ruidos externos en la madrugada" },
        { id: 3, inicio: "28/05/2026 21:45:00", fin: "29/05/2026 06:00:00", duracion: 8.2, calidad: "Excelente", notas: "Cena ligera e infusión de manzanilla" }
    ];
}

function guardarRegistroManual() {
    const startVal = new Date(document.getElementById("sleepStart").value);
    const endVal = new Date(document.getElementById("sleepEnd").value);
    
    if (endVal <= startVal) {
        alert("Inconsistencia temporal: La hora de levantarse debe ser posterior a la de acostarse.");
        return;
    }

    const horas = ((endVal - startVal) / (1000 * 60 * 60)).toFixed(1);
    const nuevo = {
        id: Date.now(),
        inicio: startVal.toLocaleString(),
        fin: endVal.toLocaleString(),
        duracion: parseFloat(horas),
        calidad: document.getElementById("sleepQuality").value,
        notas: document.getElementById("sleepContext").value || "Añadido manualmente"
    };

    let r = obtenerRegistros();
    r.unshift(nuevo);
    localStorage.setItem("sleep_records", JSON.stringify(r));
    
    document.getElementById("sleepForm").reset();
    initDateTimeInputs();
    renderDashboard();
}

function eliminarRegistro(id) {
    const boton = document.querySelector(`button[onclick="eliminarRegistro(${id})"]`);

    if (idEnEsperaEliminar !== id) {
        if (idEnEsperaEliminar !== null) restaurarBotonesEliminar();
        idEnEsperaEliminar = id;
        boton.innerText = "¿Seguro? ✕";
        boton.style.color = "#ffffff";
        boton.style.backgroundColor = "var(--slate-button)";
        boton.style.padding = "6px 10px";
        boton.style.borderRadius = "6px";
        boton.style.fontSize = "0.75rem";
        return;
    }

    let r = obtenerRegistros().filter(item => item.id !== id);
    localStorage.setItem("sleep_records", JSON.stringify(r));
    idEnEsperaEliminar = null;
    renderDashboard();
}

function restaurarBotonesEliminar() {
    idEnEsperaEliminar = null;
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.innerText = "✕";
        btn.style.color = "var(--danger)";
        btn.style.backgroundColor = "transparent";
        btn.style.padding = "";
        btn.style.borderRadius = "";
        btn.style.fontSize = "";
    });
}

document.addEventListener('click', (e) => {
    if (idEnEsperaEliminar !== null && !e.target.classList.contains('btn-delete')) {
        restaurarBotonesEliminar();
    }
});

function renderDashboard() {
    const registros = obtenerRegistros();
    const tbody = document.getElementById("historyData");
    tbody.innerHTML = "";
    
    let totalSumaHoras = 0;

    registros.forEach(r => {
        totalSumaHoras += r.duracion;
        
        let evalClass = "bg-green";
        let evalText = "Óptimo";
        if (r.duracion < 6) { evalClass = "bg-red"; evalText = "Déficit"; }
        else if (r.duracion < 7.5) { evalClass = "bg-amber"; evalText = "Aceptable"; }

        const fechaCortaInicio = r.inicio.split(' ')[0];
        const horaCortaInicio = r.inicio.split(' ')[1].substring(0, 5);
        const horaCortaFin = r.fin.split(' ')[1].substring(0, 5);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${fechaCortaInicio}</strong><br><small>${horaCortaInicio} ➔ ${horaCortaFin}</small></td>
            <td><strong>${r.duracion} hrs</strong></td>
            <td>${r.calidad}</td>
            <td><em>${r.notas}</em></td>
            <td><span class="badge-status ${evalClass}">${evalText}</span></td>
            <td><button class="btn-delete" onclick="eliminarRegistro(${r.id})">✕</button></td>
        `;
        tbody.appendChild(tr);
    });

    const totalMuestras = registros.length || 1;
    const promedioHoras = (totalSumaHoras / totalMuestras).toFixed(1);
    
    document.getElementById("txtTotalAsleep").innerText = `${Math.floor(promedioHoras)}h ${Math.round((promedioHoras % 1) * 60)}m`;
    document.getElementById("txtDeepSleep").innerText = `${(promedioHoras * 0.48).toFixed(1)}h`;
    document.getElementById("txtLightSleep").innerText = `${(promedioHoras * 0.32).toFixed(1)}h`;
    document.getElementById("txtRemSleep").innerText = `${(promedioHoras * 0.20).toFixed(1)}h`;
    document.getElementById("txtAwake").innerText = `${Math.round(promedioHoras * 5)}m`;

    renderCharts(registros, promedioHoras);
}

function renderCharts(registros, promedio) {
    const isLight = document.body.getAttribute("data-theme") === "light";
    const textColor = isLight ? "#0f172a" : "#f8fafc";
    const gridColor = isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.03)";

    // Gráfico circular
    const ctxCircle = document.getElementById('circularChart').getContext('2d');
    if (circularChartInstance) circularChartInstance.destroy();
    
    const porcentajeMeta = Math.min(100, Math.round((promedio / 8) * 100));

    circularChartInstance = new Chart(ctxCircle, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [porcentajeMeta, 100 - porcentajeMeta],
                backgroundColor: [isLight ? '#0288d1' : '#38bdf8', isLight ? '#e2e8f0' : '#2e3b4e'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '83%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });

    // Gráfico lineal de tendencias
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    if (trendChartInstance) trendChartInstance.destroy();

    const ultimosRegistros = [...registros].slice(0, 7).reverse();

    trendChartInstance = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: ultimosRegistros.map(r => r.inicio.split(' ')[0].substring(0, 5)),
            datasets: [
                {
                    label: 'Horas Durmiendo',
                    data: ultimosRegistros.map(r => r.duracion),
                    borderColor: isLight ? '#0288d1' : '#38bdf8',
                    backgroundColor: isLight ? 'rgba(2, 136, 209, 0.06)' : 'rgba(56, 189, 248, 0.08)',
                    fill: true,
                    tension: 0.25,
                    borderWidth: 3,
                    pointRadius: 4
                },
                {
                    label: 'Meta Mínima (7.5h)',
                    data: ultimosRegistros.map(() => 7.5),
                    borderColor: isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.15)',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 2, max: 12, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            },
            plugins: { legend: { labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } } }
        }
    });
}