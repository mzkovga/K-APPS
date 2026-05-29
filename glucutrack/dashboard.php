<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GlucuTrack - Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <div class="profile-section">
                <div class="avatar">H</div>
                <div>
                    <h1>¡Hola, <?php echo ucfirst($_SESSION['user']); ?>!</h1>
                    <p>Tus niveles se ven estables hoy.</p>
                </div>
            </div>
            <a href="logout.php" class="btn-logout">Cerrar Sesión</a>
        </header>

        <main class="dashboard-grid">
            
            <section class="card card-progress">
                <div class="card-header">
                    <h3>Progreso General</h3>
                    <span class="badge">91% Óptimo</span>
                </div>
                <div class="chart-circular-container">
                    <canvas id="circularChart"></canvas>
                    <div class="chart-overlay">
                        <span id="avgGlucoseTxt">0</span>
                        <small>Promedio mg/dL</small>
                    </div>
                </div>
            </section>

            <section class="card card-form">
                <h3>Nuevo Registro</h3>
                <form id="glucoseForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="glucoseLevel">Nivel (mg/dL)</label>
                            <input type="number" id="glucoseLevel" required min="20" max="600" placeholder="Ej. 105">
                        </div>
                        <div class="form-group">
                            <label for="periodContext">Momento / Contexto</label>
                            <input type="text" id="periodContext" list="momentoOptions" placeholder="Ej. Ayunas o personalizado">
                            <datalist id="momentoOptions">
                                <option value="Ayunas">
                                <option value="Antes de desayunar">
                                <option value="2h después de desayunar">
                                <option value="Antes de almorzar">
                                <option value="2h después de almorzar">
                                <option value="Antes de cenar">
                                <option value="2h después de cenar">
                                <option value="Antes de dormir">
                            </datalist>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="recordDate">Fecha</label>
                            <input type="date" id="recordDate" required>
                        </div>
                        <div class="form-group">
                            <label for="recordTime">Hora</label>
                            <input type="time" id="recordTime" required>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary">+ Guardar Muestra</button>
                </form>
            </section>

            <section class="card card-trend">
                <h3>Tendencia Semanal</h3>
                <div class="chart-line-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </section>

            <section class="card card-history">
                <h3>Historial de Registros</h3>
                <div class="table-responsive">
                    <table id="historyTable">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Momento</th>
                                <th>Nivel</th>
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