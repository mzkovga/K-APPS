<?php
session_start();
if (isset($_SESSION['mom_user'])) {
    header("Location: dashboard.php");
    exit;
}
$error = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    if (strtolower($username) === 'mama' && strtolower($password) === 'baby') {
        $_SESSION['mom_user'] = $username;
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Credenciales incorrectas. Prueba con mama / baby";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BabyKick - Iniciar Sesión</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="login-body">
    <div class="mesh-gradient">
        <div class="blob blob-pink"></div>
        <div class="blob blob-blue"></div>
    </div>

    <div class="login-card glass">
        <div class="login-header">
            <div class="emoji-container">
                <span class="emoji-boy">👶🏼</span>
                <span class="emoji-girl">👶🏻</span>
            </div>
            <h2>BabyKick Tracker</h2>
            <p class="subtitle">Monitorea los movimientos y pataditas de tu bebé</p>
        </div>
        
        <?php if (!empty($error)): ?>
            <div class="alert-error"><?php echo $error; ?></div>
        <?php endif; ?>

        <form action="" method="POST">
            <div class="form-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" required placeholder="mama">
            </div>
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required placeholder="baby">
            </div>
            <button type="submit" class="btn-primary-gradient">Entrar al Tracker</button>
            <br>
            <!-- Botón elástico para regresar al Hub Central -->
            <a href="../index.php" class="btn-back-hub">Volver al Panel Central</a>
        </form>
    </div>
</body>
</html>
