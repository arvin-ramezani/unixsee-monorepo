<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$expected = '__UNIXSEE_PROBE_SECRET__';
$provided = $_SERVER['HTTP_X_UNIXSEE_PROBE_SECRET'] ?? '';
$remote = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($remote, ['127.0.0.1', '::1'], true) || !is_string($provided) || !hash_equals($expected, $provided)) {
    http_response_code(404);
    echo '{}';
    exit;
}

$wpVersion = null;
$versionFile = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), '/') . '/wp-includes/version.php';
if (is_file($versionFile) && is_readable($versionFile)) {
    $wp_version = null;
    include $versionFile;
    if (isset($wp_version) && is_string($wp_version)) {
        $wpVersion = $wp_version;
    }
}

$imagickVersion = null;
if (extension_loaded('imagick')) {
    $extensionVersion = phpversion('imagick');
    $imagickVersion = is_string($extensionVersion) ? $extensionVersion : null;
}

echo json_encode([
    'wordpressVersion' => $wpVersion,
    'phpVersion' => PHP_VERSION,
    'imagickVersion' => $imagickVersion,
    'checkedAt' => gmdate('c'),
], JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
