<?php
/**
 * enviar.php — Recibe el formulario de comentarios de la guía de artes
 * y lo envía por correo. Pensado para el hosting compartido (PHP mail()).
 *
 * Responde siempre JSON: { "ok": true } o { "ok": false, "error": "..." }.
 * Si algo falla, el front-end abre el cliente de correo como respaldo.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* --- Configuración ------------------------------------------------------- */
const DESTINO       = 'hola@commandigital.biz';
const REMITENTE     = 'no-reply@commandigital.biz';   // debe existir en el dominio
const ASUNTO        = 'Comentarios · Guía de artes Swarovski';
const MIN_LONGITUD  = 5;
const MAX_LONGITUD  = 4000;
const ESPERA_SEG    = 30;                             // anti-flood por IP

function responder(bool $ok, ?string $error = null, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode(
        $ok ? ['ok' => true] : ['ok' => false, 'error' => $error],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

/* --- Solo POST ----------------------------------------------------------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(false, 'Método no permitido', 405);
}

/* --- Trampa antispam ----------------------------------------------------- */
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    responder(true); // fingimos éxito para no dar pistas al bot
}

/* --- Validación del mensaje ---------------------------------------------- */
$mensaje = trim((string) ($_POST['mensaje'] ?? ''));

if (mb_strlen($mensaje) < MIN_LONGITUD) {
    responder(false, 'El comentario está vacío');
}
if (mb_strlen($mensaje) > MAX_LONGITUD) {
    $mensaje = mb_substr($mensaje, 0, MAX_LONGITUD) . "\n\n[…mensaje recortado]";
}

/* --- Anti-flood sencillo por IP ------------------------------------------ */
$ip    = (string) ($_SERVER['REMOTE_ADDR'] ?? 'desconocida');
$marca = sys_get_temp_dir() . '/swa_' . md5($ip);

if (is_file($marca) && (time() - (int) filemtime($marca)) < ESPERA_SEG) {
    responder(false, 'Espera unos segundos antes de enviar otro comentario', 429);
}
@touch($marca);

/* --- Composición del correo ---------------------------------------------- */
$origen = filter_var((string) ($_POST['origen'] ?? ''), FILTER_SANITIZE_URL);

$cuerpo = "Nuevo comentario desde la guía de artes Swarovski\n"
        . str_repeat('-', 56) . "\n\n"
        . $mensaje . "\n\n"
        . str_repeat('-', 56) . "\n"
        . 'Fecha:  ' . date('d/m/Y H:i:s') . "\n"
        . 'Página: ' . ($origen !== '' ? $origen : 'n/d') . "\n"
        . 'IP:     ' . $ip . "\n";

// Cabeceras fijas: no se construyen con datos del usuario, así que no hay
// riesgo de inyección de encabezados.
$cabeceras = implode("\r\n", [
    'From: Guía de artes Swarovski <' . REMITENTE . '>',
    'Reply-To: ' . DESTINO,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . phpversion(),
]);

$asunto = '=?UTF-8?B?' . base64_encode(ASUNTO) . '?=';

if (@mail(DESTINO, $asunto, $cuerpo, $cabeceras, '-f' . REMITENTE)) {
    responder(true);
}

responder(false, 'El servidor de correo no aceptó el mensaje', 500);
