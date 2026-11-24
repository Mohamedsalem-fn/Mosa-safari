<?php
/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

declare(strict_types=1);

const MOSA_SESSION_TTL_SEC = 43200; // 12 hours
const MOSA_RATE_LIMIT_WINDOW_SEC = 900; // 15 minutes
const MOSA_RATE_LIMIT_MAX_FAILS = 5;

function mosa_client_ip(): string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $raw = trim(explode(',', (string)$_SERVER[$key])[0]);
            if (filter_var($raw, FILTER_VALIDATE_IP)) {
                return $raw;
            }
        }
    }
    return '0.0.0.0';
}

function mosa_mask_ip(string $ip): string
{
    if (strpos($ip, '.') !== false) {
        $parts = explode('.', $ip);
        return count($parts) === 4 ? "{$parts[0]}.{$parts[1]}.x.x" : 'ipv4';
    }
    if (strpos($ip, ':') !== false) {
        return implode(':', array_slice(explode(':', $ip), 0, 3)) . '::xxxx';
    }
    return 'unknown';
}

function mosa_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) {
        return true;
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
        return true;
    }
    return false;
}

function mosa_session_cookie_name(): string
{
    return mosa_is_https() ? '__Host-mosa_admin_session' : 'mosa_admin_session';
}

function mosa_require_host(array $allowedHosts): void
{
    if (php_sapi_name() === 'cli-server') {
        return;
    }
    $hostHeader = strtolower(trim((string)($_SERVER['HTTP_HOST'] ?? '')));
    $hostOnly = explode(':', $hostHeader)[0];
    if ($hostOnly === '' || !in_array($hostOnly, $allowedHosts, true)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Not Found';
        exit;
    }
}

function mosa_protect_local_dir(string $dir): void
{
    $ht = $dir . '/.htaccess';
    if (!is_file($ht)) {
        @file_put_contents(
            $ht,
            "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n"
        );
    }
    $idx = $dir . '/index.php';
    if (!is_file($idx)) {
        @file_put_contents($idx, "<?php\nhttp_response_code(403);\nexit;\n");
    }
}

/**
 * Resolve shared private vault directory outside web root on Hostinger,
 * or via MOSA_VAULT_DIR environment variable for local verification.
 */
function mosa_vault_dir(string $siteRoot): string
{
    $envVault = trim((string)getenv('MOSA_VAULT_DIR'));
    if ($envVault !== '') {
        if (!is_dir($envVault)) {
            @mkdir($envVault, 0700, true);
        }
        if (is_dir($envVault) && is_writable($envVault)) {
            return rtrim($envVault, '/');
        }
    }

    $realRoot = realpath($siteRoot) ?: rtrim($siteRoot, '/');
    $candidates = [];

    // Standard Hostinger layout: /home/uXXXX/domains/domain.com/public_html or /home/uXXXX/public_html(/sub)
    if (preg_match('#^(/home/[^/]+)/(?:domains/[^/]+/)?public_html(?:/.*)?$#', $realRoot, $m)) {
        $candidates[] = $m[1] . '/mosa_private_vault';
    }
    $candidates[] = dirname($realRoot) . '/mosa_private_vault';
    $candidates[] = dirname($realRoot, 2) . '/mosa_private_vault';

    foreach ($candidates as $cand) {
        if ($cand === '/mosa_private_vault' || $cand === '//mosa_private_vault') {
            continue;
        }
        if (!is_dir($cand)) {
            @mkdir($cand, 0700, true);
        }
        if (is_dir($cand) && is_writable($cand)) {
            @chmod($cand, 0700);
            return $cand;
        }
    }

    // Fallback inside protected hidden folder if open_basedir restricts parent
    $localVault = $realRoot . '/.mosa_vault';
    if (!is_dir($localVault)) {
        @mkdir($localVault, 0700, true);
    }
    @chmod($localVault, 0700);
    mosa_protect_local_dir($localVault);
    return $localVault;
}

function mosa_load_secrets(string $vaultDir, array $seedPaths = []): array
{
    $vaultSecrets = $vaultDir . '/secrets.php';
    if (!is_file($vaultSecrets)) {
        foreach ($seedPaths as $seed) {
            if ($seed && is_file($seed)) {
                $loaded = @include $seed;
                if (is_array($loaded)) {
                    mosa_save_secrets($vaultDir, $loaded);
                    break;
                }
            }
        }
    }
    if (is_file($vaultSecrets)) {
        $data = @include $vaultSecrets;
        if (is_array($data)) {
            return $data;
        }
    }
    return [
        'ADMIN_PASSWORD_HASH' => '',
        'ADMIN_JWT_SECRET' => '',
        'GREEN_API_URL' => 'https://7107.api.greenapi.com',
        'GREEN_ID_INSTANCE' => '710722810425',
        'GREEN_API_TOKEN' => '',
        'OWNER_WHATSAPP_PHONES' => '201023355550',
        'RESEND_API_KEY' => '',
        'EMAIL_FROM' => 'Mosa Safari <bookings@mosasafari.com>'
    ];
}

function mosa_save_secrets(string $vaultDir, array $secrets): bool
{
    $target = $vaultDir . '/secrets.php';
    $content = "<?php\n/**\n * Protected Runtime Secrets — Do Not Edit Manually\n */\nreturn " . var_export($secrets, true) . ";\n";
    $tmp = $vaultDir . '/secrets.php.' . bin2hex(random_bytes(6)) . '.tmp';
    if (@file_put_contents($tmp, $content, LOCK_EX) === false) {
        return false;
    }
    @chmod($tmp, 0600);
    if (!@rename($tmp, $target)) {
        @unlink($tmp);
        return false;
    }
    @chmod($target, 0600);
    return true;
}

function mosa_kv_path(string $vaultDir, string $name): string
{
    $safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
    return $vaultDir . '/kv_' . $safe . '.json';
}

function mosa_kv_get(string $vaultDir, string $name, $default)
{
    $path = mosa_kv_path($vaultDir, $name);
    if (!is_file($path)) {
        return is_callable($default) ? $default() : $default;
    }
    $fp = @fopen($path, 'rb');
    if (!$fp) {
        return is_callable($default) ? $default() : $default;
    }
    @flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    @flock($fp, LOCK_UN);
    @fclose($fp);

    if ($raw === false || $raw === '') {
        return is_callable($default) ? $default() : $default;
    }
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return is_callable($default) ? $default() : $default;
    }
    return $decoded;
}

function mosa_kv_put(string $vaultDir, string $name, $value): bool
{
    $path = mosa_kv_path($vaultDir, $name);
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }
    $tmp = $path . '.' . bin2hex(random_bytes(6)) . '.tmp';
    if (@file_put_contents($tmp, $json, LOCK_EX) === false) {
        return false;
    }
    @chmod($tmp, 0600);
    if (!@rename($tmp, $path)) {
        @unlink($tmp);
        return false;
    }
    @chmod($path, 0600);
    return true;
}

function mosa_kv_mutate(string $vaultDir, string $name, $default, callable $mutator)
{
    $lockPath = mosa_kv_path($vaultDir, $name) . '.lock';
    $lockFp = @fopen($lockPath, 'c+');
    if ($lockFp) {
        @flock($lockFp, LOCK_EX);
    }
    try {
        $current = mosa_kv_get($vaultDir, $name, $default);
        $updated = $mutator($current);
        mosa_kv_put($vaultDir, $name, $updated);
        return $updated;
    } finally {
        if ($lockFp) {
            @flock($lockFp, LOCK_UN);
            @fclose($lockFp);
        }
    }
}

function mosa_default_promos(): array
{
    return [
        [
            'code' => 'MOSA20',
            'discount' => 20,
            'active' => true,
            'uses' => 0,
            'maxUses' => 0,
            'expiresAt' => '2026-12-31',
            'note' => 'Default 20% launch promo code'
        ]
    ];
}

function mosa_default_settings(array $secrets): array
{
    return [
        'siteAnnouncement' => '',
        'ownerPhones' => (string)($secrets['OWNER_WHATSAPP_PHONES'] ?? '201023355550'),
        'whatsappEnabled' => true,
        'emailEnabled' => true,
        'groupDiscountMin' => 5,
        'groupDiscountPct' => 10,
        'exchangeMode' => 'auto',
        'manualEgpRate' => 50.5,
        'manualEurRate' => 0.92,
        'enableMorningSlot' => true,
        'enableEveningSlot' => true,
        'enablePayArrival' => true,
        'enablePayVisa' => true,
        'maintenanceNotice' => ''
    ];
}

function mosa_default_analytics(): array
{
    return [
        'totalViews' => 0,
        'uniqueSessions' => 0,
        'modalOpens' => 0,
        'bookingsCompleted' => 0,
        'byLang' => ['ar' => 0, 'en' => 0, 'it' => 0, 'ru' => 0],
        'byCurrency' => ['USD' => 0, 'EGP' => 0, 'EUR' => 0],
        'byDevice' => ['mobile' => 0, 'desktop' => 0],
        'tourClicks' => new stdClass(),
        'daily' => []
    ];
}

function mosa_get_settings(string $vaultDir, array $secrets): array
{
    $saved = mosa_kv_get($vaultDir, 'settings', null);
    $base = mosa_default_settings($secrets);
    return is_array($saved) ? array_merge($base, $saved) : $base;
}

function mosa_get_promos(string $vaultDir): array
{
    $saved = mosa_kv_get($vaultDir, 'promos', null);
    return is_array($saved) ? $saved : mosa_default_promos();
}

function mosa_get_analytics(string $vaultDir): array
{
    $saved = mosa_kv_get($vaultDir, 'analytics', null);
    $base = mosa_default_analytics();
    if (!is_array($saved)) {
        return $base;
    }
    return [
        'totalViews' => (int)($saved['totalViews'] ?? 0),
        'uniqueSessions' => (int)($saved['uniqueSessions'] ?? 0),
        'modalOpens' => (int)($saved['modalOpens'] ?? 0),
        'bookingsCompleted' => (int)($saved['bookingsCompleted'] ?? 0),
        'byLang' => array_merge($base['byLang'], is_array($saved['byLang'] ?? null) ? $saved['byLang'] : []),
        'byCurrency' => array_merge($base['byCurrency'], is_array($saved['byCurrency'] ?? null) ? $saved['byCurrency'] : []),
        'byDevice' => array_merge($base['byDevice'], is_array($saved['byDevice'] ?? null) ? $saved['byDevice'] : []),
        'tourClicks' => is_array($saved['tourClicks'] ?? null) ? $saved['tourClicks'] : [],
        'daily' => is_array($saved['daily'] ?? null) ? $saved['daily'] : []
    ];
}

function mosa_prune_daily(array $daily): array
{
    ksort($daily);
    if (count($daily) > 60) {
        $daily = array_slice($daily, -60, 60, true);
    }
    return $daily;
}

function mosa_append_audit(string $vaultDir, string $action, string $details): void
{
    mosa_kv_mutate($vaultDir, 'audit', [], function ($arr) use ($action, $details) {
        $list = is_array($arr) ? $arr : [];
        array_unshift($list, [
            'id' => 'AUD-' . strtoupper(base_convert((string)time(), 10, 36)),
            'timestamp' => gmdate('c'),
            'action' => $action,
            'details' => $details
        ]);
        return array_slice($list, 0, 100);
    });
}

function mosa_b64u_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function mosa_b64u_decode(string $str): string
{
    $pad = strlen($str) % 4;
    if ($pad > 0) {
        $str .= str_repeat('=', 4 - $pad);
    }
    $bin = base64_decode(strtr($str, '-_', '+/'), true);
    return $bin === false ? '' : $bin;
}

function mosa_sign_session(string $jwtSecret, array $payload): string
{
    $payloadB64 = mosa_b64u_encode((string)json_encode($payload, JSON_UNESCAPED_SLASHES));
    $sig = hash_hmac('sha256', $payloadB64, $jwtSecret, true);
    return $payloadB64 . '.' . mosa_b64u_encode($sig);
}

function mosa_verify_session(string $jwtSecret, string $token): ?array
{
    if ($jwtSecret === '' || !preg_match('/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/', $token)) {
        return null;
    }
    [$payloadB64, $sigB64] = explode('.', $token, 2);
    $expectedSig = hash_hmac('sha256', $payloadB64, $jwtSecret, true);
    $actualSig = mosa_b64u_decode($sigB64);
    if ($actualSig === '' || !hash_equals($expectedSig, $actualSig)) {
        return null;
    }
    $json = mosa_b64u_decode($payloadB64);
    $payload = json_decode($json, true);
    if (!is_array($payload)) {
        return null;
    }
    $now = time();
    if (empty($payload['exp']) || (int)$payload['exp'] <= $now || empty($payload['jti']) || empty($payload['csrf'])) {
        return null;
    }
    return $payload;
}

function mosa_send_json($data, int $status = 200, array $extraHeaders = []): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, private');
    foreach ($extraHeaders as $k => $v) {
        header("{$k}: {$v}");
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function mosa_read_json_body(int $maxBytes = 65536): ?array
{
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) > $maxBytes) {
        return null;
    }
    if (trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function mosa_http_post_json(string $url, array $payload, array $headers = [], int $timeout = 8): array
{
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $hdrs = array_merge(['Content-Type: application/json'], $headers);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_HTTPHEADER => $hdrs,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2
        ]);
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        return ['ok' => ($code >= 200 && $code < 300), 'status' => $code, 'body' => (string)$body, 'error' => $err];
    }

    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $hdrs) . "\r\n",
            'content' => $json,
            'timeout' => $timeout,
            'ignore_errors' => true
        ]
    ]);
    $body = @file_get_contents($url, false, $ctx);
    return ['ok' => ($body !== false), 'status' => 0, 'body' => (string)$body, 'error' => ''];
}

function mosa_send_whatsapp(array $secrets, string $text, string $ownerPhonesOverride = ''): array
{
    $greenUrl = rtrim((string)($secrets['GREEN_API_URL'] ?? 'https://7107.api.greenapi.com'), '/');
    $greenInstance = trim((string)($secrets['GREEN_ID_INSTANCE'] ?? '710722810425'));
    $greenToken = trim((string)($secrets['GREEN_API_TOKEN'] ?? ''));
    if ($greenToken === '' || $text === '') {
        return ['ok' => false, 'reason' => 'Missing GREEN_API_TOKEN'];
    }

    $phonesRaw = $ownerPhonesOverride !== '' ? $ownerPhonesOverride : (string)($secrets['OWNER_WHATSAPP_PHONES'] ?? '201023355550');
    $phones = array_filter(array_map(fn($p) => preg_replace('/\D+/', '', $p), explode(',', $phonesRaw)));
    $endpoint = "{$greenUrl}/waInstance{$greenInstance}/sendMessage/{$greenToken}";
    $sent = 0;

    foreach ($phones as $digits) {
        $res = mosa_http_post_json($endpoint, [
            'chatId' => "{$digits}@c.us",
            'message' => $text
        ]);
        if ($res['ok']) {
            $sent++;
        }
    }
    return ['ok' => $sent > 0, 'sentCount' => $sent, 'reason' => $sent > 0 ? '' : 'Green API send failed'];
}

function mosa_send_email(array $secrets, string $to, string $subject, string $html, string $text): array
{
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'reason' => 'Invalid recipient email'];
    }

    $apiKey = trim((string)($secrets['RESEND_API_KEY'] ?? ''));
    $defaultFrom = (string)($secrets['EMAIL_FROM'] ?? 'Mosa Safari <bookings@mosasafari.com>');
    $lastErr = 'Missing RESEND_API_KEY';

    if ($apiKey !== '') {
        foreach ([$defaultFrom, 'Mosa Safari <onboarding@resend.dev>'] as $fromAddr) {
            $res = mosa_http_post_json(
                'https://api.resend.com/emails',
                ['from' => $fromAddr, 'to' => [$to], 'subject' => $subject, 'html' => $html, 'text' => $text],
                ['Authorization: Bearer ' . $apiKey]
            );
            if ($res['ok']) {
                $decoded = json_decode($res['body'], true);
                return ['ok' => true, 'id' => $decoded['id'] ?? 'resend-ok'];
            }
            $lastErr = 'Resend HTTP ' . $res['status'];
        }
    }

    // Native Hostinger PHP mail() fallback (skip in local cli-server so dev tests stay clean)
    if (php_sapi_name() !== 'cli-server' && function_exists('mail')) {
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $defaultFrom,
            'Reply-To: info@mosasafari.com'
        ];
        if (@mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html ?: nl2br($text), implode("\r\n", $headers))) {
            return ['ok' => true, 'id' => 'php-mail-fallback'];
        }
    }
    return ['ok' => false, 'reason' => $lastErr];
}
