let count = 0;
let startTime = null;
let timerInterval = null;
let elapsedMinutes = 0;

let circularChart = null;
let trendChart = null;

document.addEventListener("DOMContentLoaded", () => {
    initCircularChart();
    renderDashboard();

    document.getElementById("btnKick").addEventListener("click", registrarPatadaEnVivo);
    document.getElementById("btnResetSession").addEventListener("click", reiniciarSesion);
    document.getElementById("kickForm").addEventListener("submit", guardarRegistroHistorial);
});

// Lógica del contador interactivo
function registrarPatadaEnVivo() {
    if (count === 0) {
        startTime = new Date();
        iniciarCronometro();
    }

    if (count < 10) {
        count++;
        actualizarContadorUI();
    }

    if (count === 10) {
        clearInterval(timerInterval);
        document.getElementById("btnKick").disabled = true;
        document.getElementById("btnSaveRecord").disabled = false;
        
        // Calcular minutos finales transcurridos
        const endTime = new Date();
        const diffMs = endTime - startTime;
        elapsedMinutes = Math.max(1, Math.round(diffMs / 60000)); // mínimo 1 minuto para evitar 0s
        
        document.getElementById("displayTime").value = elapsedMinutes;
    }
}

function iniciarCronometro() {
    timerInterval = setInterval(() => {
        const ahora = new Date();
        const diffMs = ahora - startTime;
        const diffSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(diffSecs / 60).toString().padStart(2, '0');
        const secs = (diffSecs % 60).toString().padStart(2, '0');
        
        document.getElementById("timerBadge").innerText = `${mins}:${secs}`;
        // Pasar estimación de minutos flotantes al input del formulario mientras corre
        document.getElementById("displayTime").value = Math.ceil(diffSecs / 60);
    }, 1000);
}

function actualizarContadorUI() {
    document.getElementById("kickCountTxt").innerText = count;
    document.getElementById("displayKicks").value = count;
    
    // Actualizar anillo visual (Azul se llena, gris retrocede)
    circularChart.data.datasets[0].data = [count, 10 - count];
    circularChart.update();
}

function reiniciarSesion() {
    clearInterval(timerInterval);
    count = 0;
    startTime = null;
    elapsedMinutes = 0;
    document.getElementById("btnKick").disabled = false;
    document.getElementById("btnSaveRecord").disabled = true;
    document.getElementById("timerBadge").innerText = "00:00";
    document.getElementById("kickForm").reset();
    actualizarContadorUI();
}

// Inicializar el Anillo de Progreso Estilo Bento
function initCircularChart() {
    const ctx = document.getElementById('circularChart').getContext('2d');
    circularChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 10],
                backgroundColor: ['#0288d1', '#f5f5f5'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '80%',
            plugins: { tooltip: { enabled: false } }
        }
    });
}

// LocalStorage CRUD
function obtenerRegistros() {
    const data = localStorage.getItem("baby_kicks");
    return data ? JSON.parse(data) : [];
}

function guardarRegistroHistorial(e) {
    e.preventDefault();
    
    let nota = document.getElementById("kickContext").value.trim();
    if (!nota) nota = "Sin observaciones";
    
    const nuevoRegistro = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patadas: count,
        duracion: parseInt(document.getElementById("displayTime").value),
        nota: nota
    };

    const registros = obtenerRegistros();
    registros.push(nuevoRegistro);
    localStorage.setItem("baby_kicks", JSON.stringify(registros));
    
    reiniciarSesion();
    renderDashboard();
}

// function eliminarRegistro(id) {
//     let registros = obtenerRegistros();
//     registros = registros.filter(r => r.id !== id);
//     localStorage.setItem("baby_kicks", JSON.stringify(registros));
//     renderDashboard();
// }
function eliminarRegistro(id) {
    Swal.fire({
        title: '¿Eliminar registro?',
        text: "Esta acción no se puede deshacer y se borrará de tu historial.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f08080', // Color rosa acorde a tu app
        cancelButtonColor: '#cccccc',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true // Pone el botón de cancelar a la izquierda
    }).then((result) => {
        // Si la mamá confirma la acción
        if (result.isConfirmed) {
            let registros = obtenerRegistros();
            registros = registros.filter(r => r.id !== id);
            localStorage.setItem("baby_kicks", JSON.stringify(registros));
            renderDashboard();

            // Opcional: Alerta de éxito sutil
            Swal.fire({
                title: 'Eliminado',
                text: 'El registro ha sido borrado.',
                icon: 'success',
                confirmButtonColor: '#0288d1',
                timer: 1500
            });
        }
    });
}


// Renderizado completo del Dashboard
function renderDashboard() {
    const registros = obtenerRegistros();
    const tbody = document.getElementById("historyData");
    tbody.innerHTML = "";

    const tiemposGrafico = [];
    const etiquetasFechas = [];

    // Llenar tabla e historial analítico
    [...registros].reverse().forEach(reg => {
        // Criterio médico WebMD/ACOG: 10 patadas en menos de 2 horas (120 minutos) es óptimo
        const esOptimo = reg.duracion <= 120;
        const condBadge = esOptimo ? '<span class="badge bg-green">Óptimo</span>' : '<span class="badge bg-warning">Lento (Consultar)</span>';

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${reg.fecha} - ${reg.hora}</td>
            <td><strong>${reg.patadas}</strong></td>
            <td>${reg.duracion} min</td>
            <td><span class="badge bg-pink">${reg.nota}</span></td>
            <td>${condBadge}</td>
            <td><button class="btn-delete" onclick="eliminarRegistro(${reg.id})">✕</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Cargar últimas 7 sesiones al gráfico de líneas
    registros.slice(-7).forEach(reg => {
        tiemposGrafico.push(reg.duracion);
        etiquetasFechas.push(`${reg.fecha} ${reg.hora}`);
    });

    // Dibujar gráfico de líneas de tendencia
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: etiquetasFechas.length > 0 ? etiquetasFechas : ["Sin registros"],
            datasets: [{
                label: 'Tiempo empleado (Minutos)',
                data: tiemposGrafico.length > 0 ? tiemposGrafico : [0],
                borderColor: '#f08080',
                backgroundColor: 'rgba(251, 196, 171, 0.2)',
                fill: true,
                tension: 0.3,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 130 } }
        }
    });

        // --- LÓGICA DEL TOGGLE DE COLOR ACTUALIZADA ---
        const themeToggle = document.getElementById('themeToggle');
        const themeLabel = document.getElementById('themeLabel');

        // Función para actualizar los colores del gráfico circular según el tema activo
        function actualizarColoresGraficoCircular() {
            if (!circularChart) return;
            
            const esAzul = document.body.classList.contains('theme-blue');
            // Si es azul: el arco relleno es Azul Oscuro (#0288d1). Si es rosa: es Rosa Oscuro (#f08080)
            circularChart.data.datasets[0].backgroundColor = esAzul ? ['#0288d1', '#f5f5f5'] : ['#f08080', '#f5f5f5'];
            circularChart.update();
        }

        // Verificar preferencia al cargar la página
        const temaGuardado = localStorage.getItem('babykick_theme');
        if (temaGuardado === 'blue') {
            document.body.classList.add('theme-blue');
            themeToggle.checked = true;
            themeLabel.innerText = "Modo Azul 💎";
            // Pequeño delay para asegurar que Chart.js se haya inicializado
            setTimeout(actualizarColoresGraficoCircular, 100);
        } else {
            setTimeout(actualizarColoresGraficoCircular, 100);
        }

        // Escuchar los cambios del switch
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('theme-blue');
                themeLabel.innerText = "Modo Azul 💎";
                localStorage.setItem('babykick_theme', 'blue');
            } else {
                document.body.classList.remove('theme-blue');
                themeLabel.innerText = "Modo Rosa 🌸";
                localStorage.setItem('babykick_theme', 'pink');
            }
            // Aplicar los nuevos colores al anillo al instante
            actualizarColoresGraficoCircular();
            // También refrescamos el dashboard para actualizar el gráfico de líneas de fondo
            renderDashboard();
        });
}