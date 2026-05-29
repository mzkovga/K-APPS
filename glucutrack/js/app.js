// Inicializadores y manejo del DOM
document.addEventListener("DOMContentLoaded", () => {
    establecerFechaActual();
    renderizarDashboard();

    // Evento del Formulario
    document.getElementById("glucoseForm").addEventListener("submit", guardarRegistro);
});

// Forzar fecha y hora actuales en los inputs para usabilidad ágil
function establecerFechaActual() {
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
    
    document.getElementById("recordDate").value = hoy;
    document.getElementById("recordTime").value = hora;
}

// CRUD: Obtener Datos
function obtenerRegistros() {
    const data = localStorage.getItem("glucose_records");
    return data ? JSON.parse(data) : [];
}

// CRUD: Guardar Registro
function guardarRegistro(e) {
    e.preventDefault();
    
    const nivel = parseInt(document.getElementById("glucoseLevel").value);
    // Captura lo que sea que el usuario haya escrito o seleccionado:
    let momento = document.getElementById("periodContext").value.trim(); 
    const fecha = document.getElementById("recordDate").value;
    const hora = document.getElementById("recordTime").value;

    // Si el usuario borró todo y lo dejó vacío, le asignamos un valor por defecto
    if (momento === "") {
        momento = "General";
    }

    const nuevoRegistro = {
        id: Date.now(),
        nivel,
        momento,
        fecha,
        hora
    };

    const registros = obtenerRegistros();
    registros.push(nuevoRegistro);
    registros.sort((a, b) => new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora));
    
    localStorage.setItem("glucose_records", JSON.stringify(registros));
    
    document.getElementById("glucoseForm").reset();
    establecerFechaActual();
    renderizarDashboard();
}

// CRUD: Eliminar Registro
// function eliminarRegistro(id) {
//     let registros = obtenerRegistros();
//     registros = registros.filter(r => r.id !== id);
//     localStorage.setItem("glucose_records", JSON.stringify(registros));
//     renderizarDashboard();
// }
function eliminarRegistro(id) {
    Swal.fire({
        title: '¿Eliminar registro de glucosa?',
        text: "Perderás este dato de tu historial médico.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f08080', 
        cancelButtonColor: '#cccccc',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            let registros = obtenerRegistros();
            registros = registros.filter(r => r.id !== id);
            localStorage.setItem("glucose_records", JSON.stringify(registros));
            renderizarDashboard();
        }
    });
}

// Renderización de Componentes y Gráficos
let circularChartInstance = null;
let trendChartInstance = null;

function renderizarDashboard() {
    const registros = obtenerRegistros();
    const tbody = document.getElementById("historyData");
    tbody.innerHTML = "";

    let totalGlucose = 0;
    const ultimosNiveles = [];
    const etiquetasFechas = [];

    // Renderizar la tabla de historial (Muestra los últimos primero)
    [...registros].reverse().forEach(reg => {
        totalGlucose += reg.nivel;
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${reg.fecha}</td>
            <td>${reg.hora}</td>
            <td><span class="badge" style="background:#e1f5fe">${reg.momento}</span></td>
            <td><strong>${reg.nivel} mg/dL</strong></td>
            <td><button class="btn-delete" onclick="eliminarRegistro(${reg.id})">✕</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Procesamiento para gráficos
    registros.slice(-7).forEach(reg => {
        ultimosNiveles.push(reg.nivel);
        etiquetasFechas.push(`${reg.fecha.substring(5)} (${reg.hora})`);
    });

    const promedio = registros.length > 0 ? Math.round(totalGlucose / registros.length) : 0;
    document.getElementById("avgGlucoseTxt").innerText = promedio;

    // --- GRÁFICO CIRCULAR (Progreso Estilo Anillo de la Imagen) ---
    const ctxCircular = document.getElementById('circularChart').getContext('2d');
    if (circularChartInstance) circularChartInstance.destroy();
    
    circularChartInstance = new Chart(ctxCircular, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [promedio, promedio > 150 ? 0 : 150 - promedio], 
                backgroundColor: ['#4fc3f7', '#f4f7f6'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '80%',
            plugins: { tooltip: { enabled: false } }
        }
    });

    // --- GRÁFICO DE TENDENCIA (Línea de la imagen) ---
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    if (trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: etiquetasFechas.length > 0 ? etiquetasFechas : ["Sin datos"],
            datasets: [{
                label: 'Nivel de Azúcar',
                data: ultimosNiveles.length > 0 ? ultimosNiveles : [0],
                borderColor: '#4fc3f7',
                backgroundColor: 'rgba(79, 195, 247, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 40, max: 250 }
            }
        }
    });
}