<?php
session_start();
if (!isset($_SESSION['sleep_user'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SleepTrack - Panel de Control</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <div class="profile-section">
                <div class="avatar-icon">
                    <img src="icon.png" alt="Icono" class="custom-avatar-img">
                </div>
                <div>
                    <h1>Mzk Sleep</h1>
                    <p>Monitor de sueño</p>
                </div>
            </div>
            
            <div class="theme-switch-container">
                <div class="switch-row">
                    <span class="theme-label" id="themeLabel">Dark</span>
                    <label class="switch">
                        <input type="checkbox" id="themeToggle" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <a href="logout.php" class="btn-logout">Cerrar Sesión</a>
            </div>
        </header>

        <main class="dashboard-grid">
            
            <div class="bento-metrics-group">
                <div class="metric-card main-hours">
                    <span class="metric-title">Time asleep</span>
                    <h2 id="txtTotalAsleep">0h 0m</h2>
                </div>
                <div class="sub-metrics-grid">
                    <div class="metric-card">
                        <span class="metric-title">Deep sleep</span>
                        <p id="txtDeepSleep">0.0h</p>
                    </div>
                    <div class="metric-card">
                        <span class="metric-title">Light sleep</span>
                        <p id="txtLightSleep">0.0h</p>
                    </div>
                    <div class="metric-card">
                        <span class="metric-title">REM sleep</span>
                        <p id="txtRemSleep">0.0h</p>
                    </div>
                    <div class="metric-card">
                        <span class="metric-title">Awake</span>
                        <p id="txtAwake">0m</p>
                    </div>
                </div>
            </div>

            <section class="card card-live">
                <div class="card-header">
                    <h3>Monitoreo en Tiempo Real</h3>
                    <span id="timerBadge" class="badge-status">Espera</span>
                </div>
                <div class="chart-circular-container">
                    <canvas id="circularChart"></canvas>
                    <div class="chart-overlay">
                        <span id="hoursCountTxt">0.0</span>
                        <small>Horas de Sueño</small>
                    </div>
                </div>
                <div class="live-controls">
                    <button id="btnSleepAction" class="btn-sleep-action">Comenzar a Dormir 🛌</button>
                    <button id="btnResetSession" class="btn-secondary">Reiniciar</button>
                </div>
            </section>

            <section class="card card-manual-form">
                <h3>Registrar Periodo Manual</h3>
                <form id="sleepForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Hora de Acostarse</label>
                            <input type="datetime-local" id="sleepStart" required>
                        </div>
                        <div class="form-group">
                            <label>Hora de Levantarse</label>
                            <input type="datetime-local" id="sleepEnd" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Calidad del Descanso</label>
                            <select id="sleepQuality">
                                <option value="Excelente">Excelente (Profundo) ⭐⭐⭐</option>
                                <option value="Bueno" selected>Bueno (Reparador) ⭐确定</option>
                                <option value="Regular">Regular (Interrumpido) ⭐</option>
                                <option value="Malo">Malo (Insomnio) ❌</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Notas / Factores</label>
                            <input type="text" id="sleepContext" placeholder="Ej. Sin pantallas, cafeína...">
                        </div>
                    </div>
                    <button type="submit" class="btn-submit-form">Guardar Muestra en Historial</button>
                </form>
            </section>

            <section class="card card-sleep-sounds">
                <div class="card-header">
                    <h3>Sonidos Ambientales</h3>
                    <span id="soundStatusBadge" class="badge-status">Apagado</span>
                </div>
                <div class="sounds-bento-container">
                    <button id="btnPlaySound" class="sound-circular-btn" type="button">
                        <span class="sound-icon">🌧️</span>
                        <div class="sound-wave-indicator"></div>
                    </button>
                    <div class="sound-details">
                        <h4>Lluvia Relajante</h4>
                        <p>Sonido ambiente en bucle para inducir el sueño profundo</p>
                        <div class="volume-control">
                            <label for="volumeSlider">Volumen</label>
                            <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.5">
                        </div>
                    </div>
                </div>
            </section>

  <!-- TARJETA DE RESPIRACIÓN MODIFICADA -->
<section class="card card-breathing">
    <div class="card-header">
        <h3>Técnica de Relajación 4-7-8</h3>
        <span id="breathingCycleBadge" class="badge-status">Ciclo: 0/4</span>
    </div>
    <div class="breathing-bento-container">
        <div class="breathing-circle-wrapper">
            <div id="breathingCircle" class="breathing-circle"></div>
            <span id="breathingText" class="breathing-action-text">Listo</span>
        </div>
        <div class="breathing-details">
            <h4>Control del Sistema Nervioso</h4>
            <p id="breathingSubtext">Regula tu ritmo cardíaco y relaja la mente antes de acostarte.</p>
            <div class="breathing-controls-row" style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap;">
                <button id="btnStartBreathing" class="btn-submit-form" type="button" style="flex: 1; min-width: 120px;">Guía en Tarjeta</button>
                <!-- NUEVO: Botón interactivo inspirado en image_f23e7c.png -->
                <button id="btnOpenInmersive" class="btn-organic-sleep" type="button" style="flex: 1; min-width: 120px;">
                    <span>Modo Inmersivo 🔮</span>
                </button>
            </div>
        </div>
    </div>
</section>

<!-- ==========================================================================
     NUEVO: MODAL ESTILO SWEETALERT INMERSIVO DE SUEÑO (Al final del body)
     ========================================================================== */ -->
<div id="sleepInmersiveModal" class="sweet-sleep-overlay">
    <div class="sweet-sleep-alert glass">
        <button id="btnCloseInmersive" class="sweet-close-btn">✕</button>
        <div class="sweet-alert-header">
            <h2 class="purple-glow-text">Modo Hipnosis Rápida</h2>
            <p id="sweetBreathingCycle">Preparando entorno...</p>
        </div>
        
        <!-- Esfera orgánica gigante inspirada en image_f23e7c.png -->
        <div class="organic-hypno-wrapper">
            <div id="hypnoBlobBackend" class="hypno-blob-bg"></div>
            <div id="hypnoCircle" class="hypno-main-circle">
                <span id="hypnoActionText">SLEEP</span>
            </div>
        </div>
        
        <p id="hypnoSubtext" class="hypno-instruction">Haz clic en iniciar para sincronizar tu mente.</p>
        <button id="btnStartHypno" class="btn-hypno-start">Iniciar Sesión 4-7-8</button>
    </div>
</div>

            <section class="card card-analytics">
                <h3>Análisis de Tendencia Semanal (Horas Reales vs Meta)</h3>
                <div class="chart-container-line">
                    <canvas id="trendChart"></canvas>
                </div>
            </section>

            <section class="card card-table-history">
                <h3>Registros Almacenados</h3>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Periodo Analizado</th>
                                <th>Duración</th>
                                <th>Calidad</th>
                                <th>Notas Contextuales</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="historyData">
                            </tbody>
                    </table>
                </div>
            </section>

        </main>
    </div>
    <script src="js/app.js"></script>
</body>
</html>