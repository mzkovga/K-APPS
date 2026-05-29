<?php
require_once 'config.php';
session_start();

// Si ya está logueado, redirigir al dashboard
if (isset($_SESSION['user'])) {
    header("Location: dashboard.php");
    exit;
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Credenciales estáticas para desarrollo rápido con sesión PHP
    if (strtolower($username) === 'eduardo' && strtolower($password) === 'edu') {
        $_SESSION['user'] = $username;
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Credenciales incorrectas.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GlucuTrack - Iniciar Sesión</title>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="login-body">
    <div class="login-card">
        <h2>¡Hola de nuevo!</h2>
        <p class="subtitle"></p>
        
        <?php if (!empty($error)): ?>
            <div class="alert-error"><?php echo $error; ?></div>
        <?php endif; ?>

        <form action="" method="POST">
            <div class="form-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" required placeholder="">
            </div>
             <br>
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required placeholder="">
            </div>
            <br>
            <button type="submit" class="btn-primary">Ingresar</button>
            <br>
            <!-- Botón elástico para regresar al Hub Central -->
            <a href="../index.php" class="btn-back-hub">Volver al Panel Central</a>
        </form>
    </div>
</body>
</html>