<?php

declare(strict_types=1);

const UNIXSEE_RUNTIME_PROBE_SECRET_SHA256 = '__UNIXSEE_RUNTIME_PROBE_SECRET_SHA256__';
const UNIXSEE_RUNTIME_PROBE_HEADER = 'HTTP_X_UNIXSEE_PROBE_SECRET';

function unixsee_probe_json(int $statusCode, array $payload): never
{
    http_response_code($statusCode);
    header_remove('X-Powered-By');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function unixsee_probe_valid_version(mixed $value): ?string
{
    if (!is_string($value)) {
        return null;
    }

    $value = trim($value);
    if ($value === '' || strlen($value) > 64) {
        return null;
    }

    if (!preg_match('/^[0-9][0-9A-Za-z.+_~:-]*(?:-[0-9A-Za-z.+_~:-]+)*$/', $value)) {
        return null;
    }

    return $value;
}

function unixsee_probe_document_root(): ?string
{
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? null;
    if (is_string($documentRoot) && $documentRoot !== '') {
        $normalized = rtrim($documentRoot, '/');
        if ($normalized !== '' && $normalized !== '/opt/unixsee-agent/probe') {
            return $normalized;
        }
    }

    // The DirectAdmin OLS context installed by Unixsee sets context-level
    // open_basedir with the target vhost document root as its first entry.
    // This gives the probe a deterministic fallback even when OLS reports the
    // mapped probe directory as DOCUMENT_ROOT for a static context.
    $openBasedir = ini_get('open_basedir');
    if (is_string($openBasedir) && $openBasedir !== '') {
        $parts = explode(PATH_SEPARATOR, $openBasedir);
        $first = trim((string)($parts[0] ?? ''));
        if ($first !== '') {
            return rtrim($first, '/');
        }
    }

    return null;
}

function unixsee_probe_wordpress_version(?string $documentRoot): ?string
{
    if ($documentRoot === null || $documentRoot === '') {
        return null;
    }

    $versionFile = $documentRoot . '/wp-includes/version.php';
    if (!is_file($versionFile) || !is_readable($versionFile)) {
        return null;
    }

    // WordPress' version.php is intentionally loaded inside the target site's
    // PHP request. The Node agent never opens this file itself.
    $wp_version = null;
    /** @noinspection PhpIncludeInspection */
    include $versionFile;

    return unixsee_probe_valid_version($wp_version);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    unixsee_probe_json(405, ['error' => 'method_not_allowed']);
}

$providedSecret = $_SERVER[UNIXSEE_RUNTIME_PROBE_HEADER] ?? '';
if (!is_string($providedSecret) || $providedSecret === '') {
    unixsee_probe_json(403, ['error' => 'forbidden']);
}

$providedSecretHash = hash('sha256', $providedSecret);
if (!hash_equals(UNIXSEE_RUNTIME_PROBE_SECRET_SHA256, $providedSecretHash)) {
    unixsee_probe_json(403, ['error' => 'forbidden']);
}

$documentRoot = unixsee_probe_document_root();
$wordpressVersion = unixsee_probe_wordpress_version($documentRoot);
$phpVersion = unixsee_probe_valid_version(PHP_VERSION);
$imagickVersion = unixsee_probe_valid_version(phpversion('imagick'));
$checkedAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
    ->format('Y-m-d\\TH:i:s.v\\Z');

unixsee_probe_json(200, [
    'wordpressVersion' => $wordpressVersion,
    'phpVersion' => $phpVersion,
    'imagickVersion' => $imagickVersion,
    'checkedAt' => $checkedAt,
]);
