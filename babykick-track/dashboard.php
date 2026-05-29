<?php
session_start();
if (!isset($_SESSION['mom_user'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BabyKick - Panel de Control</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <div class="profile-section">
                <div class="avatar">🍼</div>
                <div>
                    <h1>¡Hola, Mamá!</h1>
                    <p>Lleva el registro de bienestar de tu pequeño.</p>
                </div>
            </div>
            
            <!-- NUEVO: Contenedor del Toggle de Color -->
            <div class="theme-switch-container">
                <div class="switch-row">
                    <span class="theme-label" id="themeLabel">Modo Rosa 🌸</span>
                    <label class="switch">
                        <input type="checkbox" id="themeToggle">
                        <span class="slider round"></span>
                    </label>
                </div>
                
                <a href="logout.php" class="btn-logout">Cerrar Sesión</a>
            </div>
        </header>

        <main class="dashboard-grid">
            <!-- TARJETA 1: Contador Interactivo de Patadas en Vivo (Estilo Anillo de Progreso) -->
            <section class="card card-progress">
                <div class="card-header">
                    <h3>Sesión en Vivo</h3>
                    <span id="timerBadge" class="badge bg-blue">00:00</span>
                </div>
                <div class="chart-circular-container">
                    <canvas id="circularChart"></canvas>
                    <div class="chart-overlay">
                        <span id="kickCountTxt">0</span>
                        <small>de 10 Patadas</small>
                    </div>
                </div>
                <div class="live-controls">
                    <button id="btnKick" class="btn-kick-action">+1 Patada 🦶🏼</button>
                    <button id="btnResetSession" class="btn-secondary">Reiniciar</button>
                </div>
            </section>

            <!-- TARJETA 2: Formulario Manual / Guardado de Contexto -->
            <section class="card card-form">
                <h3>Guardar Sesión</h3>
                <form id="kickForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="displayKicks">Patadas Contadas</label>
                            <input type="number" id="displayKicks" value="0" readonly>
                        </div>
                        <div class="form-group">
                            <label for="displayTime">Tiempo Total (Minutos)</label>
                            <input type="number" id="displayTime" value="0" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="kickContext">Estado / Nota</label>
                            <input type="text" id="kickContext" list="contextOptions" placeholder="Ej. Después de cenar, acostada de lado...">
                            <datalist id="contextOptions">
                                <option value="Después de comer">
                                <option value="Acostada de lado izquierdo">
                                <option value="En el sofá descansando">
                                <option value="Por la noche (activo)">
                                <option value="Antes de dormir">
                            </datalist>
                        </div>
                    </div>
                    <button type="submit" id="btnSaveRecord" class="btn-primary" disabled>Registrar en Historial</button>
                </form>
            </section>

            <!-- TARJETA 3: Gráfico de Tendencia Temporal (Minutos para llegar a 10 patadas) -->
            <section class="card card-trend">
                <h3>Tiempo promedio para notar 10 movimientos (Minutos)</h3>
                <div class="chart-line-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </section>

            <!-- TARJETA 4: Historial de Sesiones -->
            <section class="card card-history">
                <h3>Historial de Movimientos</h3>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha y Hora</th>
                                <th>Movimientos</th>
                                <th>Duración</th>
                                <th>Estado/Nota</th>
                                <th>Condición</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="historyData">
                            <!-- JS inyectará los datos -->
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>
    <script src="js/app.js"></script>
</body>
</html>