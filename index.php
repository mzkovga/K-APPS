<?php
session_start();
// Control de sesión fija para mantener la persistencia local de koz159
$_SESSION['main_user'] = "k0z159"; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suite de Control Personal - k0z159</title>
    <link rel="stylesheet" href="style_hub.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="hub-container">
        
        <!-- Encabezado Principal del Hub -->
        <header class="hub-header">
            <div class="hub-profile">
                <div class="hub-avatar">🔥</div>
                <div>
                    <h1>hUb</h1>
                    <p>Mis Apps</p>
                </div>
            </div>
            
            <div class="theme-switch-container">
                <div class="switch-row">
                    <span class="theme-label" id="themeLabel">🌌</span>
                    <label class="switch">
                        <input type="checkbox" id="themeToggle" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        </header>

        <!-- Bento Grid del Ecosistema de Apps -->
        <main class="hub-bento-grid">
            
            <!-- TARJETA MAESTRA: Bienvenida y Resumen Técnico -->
            <section class="hub-card card-welcome">
                <h2>Mis Apps</h2>
                <p>Bienvenido<strong></strong>:</p>
                <div class="tech-stack-badges">
                    <span class="badge">JAVASCRIPT</span>    
                    <span class="badge">PHP NATIVO</span>
                    <span class="badge">CSS</span>
                    <span class="badge">LOCALSTORAGE</span>
                    <span class="badge">BENTO UI</span>
                </div>
            </section>

            <!-- APLICACIÓN 1: GlucuTrack (Diseño Compacto/Asimétrico) -->
            <a href="glucutrack/dashboard.php" class="hub-card app-launcher-card glucu-theme">
                <div class="app-card-header">
                    <span class="app-icon">🩸</span>
                    <span class="launcher-arrow">➔</span>
                </div>
                <div class="app-card-body">
                    <h3>GlucuTrack</h3>
                    <p>Control de niveles de glucosa, alertas métricas y reportes analíticos.</p>
                </div>
            </a>

            <!-- APLICACIÓN 2: BabyKick-Track (Diseño Extendido) -->
            <a href="babykick-track/dashboard.php" class="hub-card app-launcher-card baby-theme">
                <div class="app-card-header">
                    <span class="app-icon">👶</span>
                    <span class="launcher-arrow">➔</span>
                </div>
                <div class="app-card-body">
                    <h3>BabyKick-Track</h3>
                    <p>Monitoreo elástico de actividad fetal, registro de patadas en tiempo real e historial.</p>
                </div>
            </a>

            <!-- APLICACIÓN 3: SleepTrack (Diseño Centrado Nocturno) -->
            <a href="SleepTrack/dashboard.php" class="hub-card app-launcher-card sleep-theme">
                <div class="app-card-header">
                    <span class="app-icon">🌙</span>
                    <span class="launcher-arrow">➔</span>
                </div>
                <div class="app-card-body">
                    <h3>SleepTrack</h3>
                    <p>Análisis de ciclos de sueño, reproductor ambiental y relajación interactiva 4-7-8.</p>
                </div>
            </a>

            <!-- APLICACIÓN 4: Flashlingo -->
            <a href="flashlingo/login.html" class="hub-card app-launcher-card sleep-theme">
                <div class="app-card-header">
                    <span class="app-icon">📚</span>
                    <span class="launcher-arrow">➔</span>
                </div>
                <div class="app-card-body">
                    <h3>Flashlingo</h3>
                    <p>App para practicar ingles basico</p>
                </div>
            </a>

        </main>

        <!-- Pie de página unificado -->
        <footer class="hub-footer">
            <p>- 2026❤️KAI -</p>
        </footer>
    </div>

    <!-- Script único para gobernar el Modo Claro / Oscuro del Hub Completo -->
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const themeToggle = document.getElementById("themeToggle");
            const themeLabel = document.getElementById("themeLabel");
            const currentTheme = localStorage.getItem("sleep_theme") || "dark";
            
            if (currentTheme === "light") {
                document.body.setAttribute("data-theme", "light");
                if (themeToggle) themeToggle.checked = false;
                if (themeLabel) themeLabel.innerText = "☀️";
            } else {
                document.body.removeAttribute("data-theme");
                if (themeToggle) themeToggle.checked = true;
                if (themeLabel) themeLabel.innerText = "🌌";
            }

            if (themeToggle) {
                themeToggle.addEventListener("change", () => {
                    if (!themeToggle.checked) {
                        document.body.setAttribute("data-theme", "light");
                        themeLabel.innerText = "☀️";
                        localStorage.setItem("sleep_theme", "light");
                    } else {
                        document.body.removeAttribute("data-theme");
                        themeLabel.innerText = "🌌";
                        localStorage.setItem("sleep_theme", "dark");
                    }
                });
            }
        });
    </script>
</body>
</html>