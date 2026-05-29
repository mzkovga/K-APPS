<?php
/**
 * Configuración global del proyecto GlucuTrack
 */

// 1. Detectar si estamos en producción (Railway) o en entorno local
// Railway asigna automáticamente variables de entorno como RAILWAY_ENVIRONMENT o el HOST externo
if (getenv('RAILWAY_ENVIRONMENT') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) {
    
    // EN PRODUCCIÓN (Railway):
    // La forma más segura y limpia para que el navegador web encuentre el CSS 
    // sin importar los proxies o protocolos es usar la raíz relativa del dominio.
    define('BASE_URL', '/');

} else {
    
    // EN ENTORNO LOCAL (Tu computadora):
    // Reconstrucción dinámica clásica para XAMPP / Laragon
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    
    // Obtenemos la subcarpeta (ej: /GlucuTrack)
    $base_dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
    
    // Aseguramos que termine en una sola barra diagonal si está en la raíz local
    $base_dir = rtrim($base_dir, '/') . '/';
    
    define('BASE_URL', $protocol . '://' . $host . $base_dir);
}
?>