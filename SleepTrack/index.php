<?php
session_start();

if (isset($_SESSION['sleep_user'])) {
    header("Location: dashboard.php");
    exit;
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    if ($username === 'admin' && $password === 'sleep') {
        $_SESSION['sleep_user'] = $username;
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Credenciales incorrectas. Intenta con admin / sleep";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mzk Sleep - Iniciar Sesión</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="login-body">
    <div class="mesh-gradient">
        <div class="blob blob-slate"></div>
        <div class="blob blob-blue"></div>
    </div>

    <div class="login-card glass">
        <div class="theme-switch-container" style="position: absolute; top: 15px; right: 20px; box-shadow: none; background: transparent; padding: 0;">
            <div class="switch-row">
                <span class="theme-label" id="themeLabel" style="font-size: 0.75rem;">🌌</span>
                <label class="switch" style="transform: scale(0.8);">
                    <input type="checkbox" id="themeToggle" checked>
                    <span class="slider round"></span>
                </label>
            </div>
        </div>

        <div class="login-header" style="margin-top: 15px;">
            <div class="emoji-container">🌌</div>
            <h2>Mzk Sleep</h2>
            <p class="subtitle"></p>
        </div>
        
        <?php if (!empty($error)): ?>
            <div class="alert-error"><?php echo $error; ?></div>
        <?php endif; ?>

        <form action="" method="POST">
            <div class="form-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" required placeholder="admin">
            </div>
            <br>
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required placeholder="sleep">
            </div>
            <br>
            <button type="submit" class="btn-login">Ingresar</button>
            <br>
            <!-- Botón elástico para regresar al Hub Central -->
            <a href="../index.php" class="btn-back-hub">Volver al Panel Central</a>
        </form>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const toggle = document.getElementById("themeToggle");
            const label = document.getElementById("themeLabel");
            const currentTheme = localStorage.getItem("sleep_theme") || "dark";

            if (currentTheme === "light") {
                document.body.setAttribute("data-theme", "light");
                toggle.checked = false;
                label.innerText = "☀️";
            }

            toggle.addEventListener("change", () => {
                if (!toggle.checked) {
                    document.body.setAttribute("data-theme", "light");
                    label.innerText = "☀️";
                    localStorage.setItem("sleep_theme", "light");
                } else {
                    document.body.removeAttribute("data-theme");
                    label.innerText = "🌌";
                    localStorage.setItem("sleep_theme", "dark");
                }
            });
        });
    </script>
</body>
</html>
