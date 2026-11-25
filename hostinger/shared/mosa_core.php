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
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 4,
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

function mosa_clean_mail_header(string $val): string
{
    return trim((string)preg_replace('/[\r\n]+/', ' ', $val));
}

function mosa_encode_rfc2047(string $text): string
{
    $clean = mosa_clean_mail_header($text);
    if ($clean === '') {
        return '';
    }
    if (preg_match('/^[\x20-\x7E]+$/', $clean) && !preg_match('/[()<>@,;:\\\\"\/\[\]?=]/', $clean)) {
        return $clean;
    }
    return '=?UTF-8?B?' . base64_encode($clean) . '?=';
}

function mosa_default_mail_config(): array
{
    return [
        'provider' => 'gmail_smtp',
        'enabled' => false,
        'gmailAddress' => '',
        'appPassword' => '',
        'senderName' => 'Mosa Safari · موسى سفاري',
        'replyTo' => '',
        'bccOwner' => true,
        'fallbackResend' => true,
        'appsScriptUrl' => '',
        'scriptSecret' => '',
        'updatedAt' => ''
    ];
}

function mosa_get_mail_config(string $vaultDir): array
{
    $base = mosa_default_mail_config();
    if ($vaultDir === '') {
        return $base;
    }
    $saved = mosa_kv_get($vaultDir, 'mail_config', null);
    return is_array($saved) ? array_merge($base, $saved) : $base;
}

function mosa_sanitize_mail_config(array $cfg): array
{
    $m = array_merge(mosa_default_mail_config(), $cfg);
    $pass = (string)($m['appPassword'] ?? '');
    $hasPass = strlen($pass) >= 8;
    $hasSecret = trim((string)($m['scriptSecret'] ?? '')) !== '';
    $gmailOk = filter_var((string)$m['gmailAddress'], FILTER_VALIDATE_EMAIL) !== false;
    $provider = ($m['provider'] ?? '') === 'google_script' ? 'google_script' : 'gmail_smtp';
    $connected = !empty($m['enabled']) && $gmailOk && (
        ($provider === 'google_script' && trim((string)$m['appsScriptUrl']) !== '') ||
        ($provider !== 'google_script' && $hasPass)
    );

    return [
        'provider' => $provider,
        'enabled' => !empty($m['enabled']),
        'gmailAddress' => (string)$m['gmailAddress'],
        'senderName' => (string)($m['senderName'] ?: 'Mosa Safari · موسى سفاري'),
        'replyTo' => (string)$m['replyTo'],
        'bccOwner' => ($m['bccOwner'] ?? true) !== false,
        'fallbackResend' => ($m['fallbackResend'] ?? true) !== false,
        'appsScriptUrl' => (string)$m['appsScriptUrl'],
        'hasAppPassword' => $hasPass,
        'appPasswordMask' => $hasPass ? ('•••• •••• •••• ' . substr($pass, -4)) : '',
        'hasScriptSecret' => $hasSecret,
        'connected' => $connected,
        'updatedAt' => (string)($m['updatedAt'] ?? '')
    ];
}

function mosa_save_mail_config(string $vaultDir, array $incoming): array
{
    $prev = mosa_get_mail_config($vaultDir);
    $provider = ($incoming['provider'] ?? '') === 'google_script' ? 'google_script' : 'gmail_smtp';
    $enabled = ($incoming['enabled'] ?? true) !== false;
    $gmail = strtolower(mosa_clean_mail_header((string)($incoming['gmailAddress'] ?? $prev['gmailAddress'])));
    $senderName = mosa_clean_mail_header((string)($incoming['senderName'] ?? $prev['senderName'])) ?: 'Mosa Safari · موسى سفاري';
    $replyTo = mosa_clean_mail_header((string)($incoming['replyTo'] ?? $prev['replyTo']));
    $bccOwner = array_key_exists('bccOwner', $incoming) ? !empty($incoming['bccOwner']) : (($prev['bccOwner'] ?? true) !== false);
    $fallbackResend = array_key_exists('fallbackResend', $incoming) ? !empty($incoming['fallbackResend']) : (($prev['fallbackResend'] ?? true) !== false);

    $rawPass = (string)preg_replace('/\s+/', '', (string)($incoming['appPassword'] ?? ''));
    $appPassword = $rawPass !== '' ? $rawPass : (string)($prev['appPassword'] ?? '');
    $appsScriptUrl = mosa_clean_mail_header((string)($incoming['appsScriptUrl'] ?? $prev['appsScriptUrl']));
    $rawSecret = trim((string)($incoming['scriptSecret'] ?? ''));
    $scriptSecret = !empty($incoming['clearScriptSecret']) ? '' : ($rawSecret !== '' ? $rawSecret : (string)($prev['scriptSecret'] ?? ''));

    if ($enabled && !filter_var($gmail, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('يرجى إدخال بريد جوجل صحيح (مثال: name@gmail.com)');
    }
    if ($replyTo !== '' && !filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('عنوان الرد (Reply-To) غير صحيح');
    }
    if ($enabled && $provider === 'gmail_smtp' && strlen($appPassword) < 8) {
        throw new RuntimeException('يرجى إدخال كلمة مرور التطبيقات من جوجل (16 حرفاً)');
    }
    if ($enabled && $provider === 'google_script' && !preg_match('#^https://script\.google\.com/macros/s/.+#', $appsScriptUrl)) {
        throw new RuntimeException('رابط Google Apps Script يجب أن يبدأ بـ https://script.google.com/macros/s/');
    }

    $next = [
        'provider' => $provider,
        'enabled' => $enabled,
        'gmailAddress' => $gmail,
        'appPassword' => $appPassword,
        'senderName' => $senderName,
        'replyTo' => $replyTo,
        'bccOwner' => $bccOwner,
        'fallbackResend' => $fallbackResend,
        'appsScriptUrl' => $appsScriptUrl,
        'scriptSecret' => $scriptSecret,
        'updatedAt' => gmdate('c')
    ];
    mosa_kv_put($vaultDir, 'mail_config', $next);
    return $next;
}

function mosa_clear_mail_config(string $vaultDir): array
{
    $blank = mosa_default_mail_config();
    $path = mosa_kv_path($vaultDir, 'mail_config');
    if (is_file($path)) {
        @unlink($path);
    }
    return $blank;
}

function mosa_smtp_read_reply($fp): array
{
    $lines = [];
    while (($line = fgets($fp, 2048)) !== false) {
        $clean = rtrim($line, "\r\n");
        $lines[] = $clean;
        if (preg_match('/^\d{3}(?: |$)/', $clean)) {
            return ['code' => (int)substr($clean, 0, 3), 'lines' => $lines, 'raw' => implode("\n", $lines)];
        }
    }
    return ['code' => 0, 'lines' => $lines, 'raw' => implode("\n", $lines)];
}

function mosa_smtp_cmd($fp, string $cmd, array $expectedCodes): array
{
    fwrite($fp, $cmd . "\r\n");
    $reply = mosa_smtp_read_reply($fp);
    if (!in_array($reply['code'], $expectedCodes, true)) {
        $msg = end($reply['lines']) ?: ('SMTP error ' . $reply['code']);
        if ($reply['code'] === 535) {
            throw new RuntimeException('فشل توثيق جوجل (535): تأكد من تفعيل التحقق بخطوتين وإدخال كلمة مرور التطبيقات (16 حرفاً)');
        }
        throw new RuntimeException($msg);
    }
    return $reply;
}

function mosa_send_gmail_smtp(array $cfg, string $to, string $subject, string $html, string $text): array
{
    $user = mosa_clean_mail_header((string)($cfg['gmailAddress'] ?? ''));
    $pass = (string)preg_replace('/\s+/', '', (string)($cfg['appPassword'] ?? ''));
    $safeTo = mosa_clean_mail_header($to);
    if (!filter_var($user, FILTER_VALIDATE_EMAIL) || $pass === '') {
        return ['ok' => false, 'provider' => 'gmail_smtp', 'reason' => 'Missing Gmail credentials'];
    }
    if (!filter_var($safeTo, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'provider' => 'gmail_smtp', 'reason' => 'Invalid recipient email'];
    }

    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'peer_name' => 'smtp.gmail.com'
        ]
    ]);
    $fp = @stream_socket_client('ssl://smtp.gmail.com:465', $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) {
        return ['ok' => false, 'provider' => 'gmail_smtp', 'reason' => "Gmail SMTP connect failed: {$errstr} ({$errno})"];
    }
    stream_set_timeout($fp, 12);

    try {
        $greet = mosa_smtp_read_reply($fp);
        if ($greet['code'] !== 220) {
            throw new RuntimeException($greet['raw'] ?: 'Gmail SMTP greeting rejected');
        }
        mosa_smtp_cmd($fp, 'EHLO mosasafari.com', [250]);
        $authToken = base64_encode("\0{$user}\0{$pass}");
        mosa_smtp_cmd($fp, "AUTH PLAIN {$authToken}", [235]);
        mosa_smtp_cmd($fp, "MAIL FROM:<{$user}>", [250]);
        mosa_smtp_cmd($fp, "RCPT TO:<{$safeTo}>", [250, 251]);
        if (($cfg['bccOwner'] ?? true) !== false && strcasecmp($user, $safeTo) !== 0) {
            mosa_smtp_cmd($fp, "RCPT TO:<{$user}>", [250, 251]);
        }
        mosa_smtp_cmd($fp, 'DATA', [354]);

        $boundary = 'mosa_alt_' . bin2hex(random_bytes(8));
        $senderName = mosa_clean_mail_header((string)($cfg['senderName'] ?? 'Mosa Safari'));
        $replyTo = mosa_clean_mail_header((string)($cfg['replyTo'] ?? '')) ?: $user;
        $headers = [
            'From: ' . mosa_encode_rfc2047($senderName) . " <{$user}>",
            "To: <{$safeTo}>",
            "Reply-To: <{$replyTo}>",
            'Subject: ' . mosa_encode_rfc2047($subject),
            'Date: ' . gmdate('D, d M Y H:i:s +0000'),
            'Message-ID: <' . bin2hex(random_bytes(8)) . '@mosasafari.com>',
            'MIME-Version: 1.0',
            "Content-Type: multipart/alternative; boundary=\"{$boundary}\""
        ];

        $plainB64 = rtrim(chunk_split(base64_encode($text !== '' ? $text : $subject), 76, "\r\n"));
        $htmlB64 = rtrim(chunk_split(base64_encode($html !== '' ? $html : ('<pre>' . htmlspecialchars($text, ENT_QUOTES, 'UTF-8') . '</pre>')), 76, "\r\n"));

        $mime = implode("\r\n", $headers) . "\r\n\r\n"
            . "--{$boundary}\r\n"
            . "Content-Type: text/plain; charset=\"UTF-8\"\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . "{$plainB64}\r\n"
            . "--{$boundary}\r\n"
            . "Content-Type: text/html; charset=\"UTF-8\"\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . "{$htmlB64}\r\n"
            . "--{$boundary}--";

        $stuffed = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], "\n", $mime));
        $stuffed = str_replace("\n", "\r\n", (string)$stuffed);
        fwrite($fp, $stuffed . "\r\n.\r\n");
        $dataReply = mosa_smtp_read_reply($fp);
        if ($dataReply['code'] !== 250) {
            throw new RuntimeException($dataReply['raw'] ?: 'SMTP DATA rejected');
        }
        @fwrite($fp, "QUIT\r\n");
        @fclose($fp);
        return ['ok' => true, 'provider' => 'gmail_smtp', 'from' => $user, 'id' => $dataReply['lines'][0] ?? 'gmail-ok'];
    } catch (Throwable $e) {
        @fclose($fp);
        return ['ok' => false, 'provider' => 'gmail_smtp', 'reason' => $e->getMessage()];
    }
}

function mosa_send_google_script(array $cfg, string $to, string $subject, string $html, string $text): array
{
    $hook = mosa_clean_mail_header((string)($cfg['appsScriptUrl'] ?? ''));
    if ($hook === '') {
        return ['ok' => false, 'provider' => 'google_script', 'reason' => 'Missing Apps Script URL'];
    }
    $res = mosa_http_post_json($hook, [
        'secret' => (string)($cfg['scriptSecret'] ?? ''),
        'to' => mosa_clean_mail_header($to),
        'subject' => $subject,
        'html' => $html,
        'text' => $text,
        'senderName' => (string)($cfg['senderName'] ?? 'Mosa Safari'),
        'replyTo' => (string)($cfg['replyTo'] ?: ($cfg['gmailAddress'] ?? ''))
    ], [], 12);
    $decoded = json_decode((string)$res['body'], true);
    if ($res['ok'] && (!is_array($decoded) || ($decoded['ok'] ?? true) !== false)) {
        return ['ok' => true, 'provider' => 'google_script', 'from' => (string)($cfg['gmailAddress'] ?? 'google-script'), 'id' => $decoded['id'] ?? 'script-ok'];
    }
    return ['ok' => false, 'provider' => 'google_script', 'reason' => is_array($decoded) && !empty($decoded['error']) ? (string)$decoded['error'] : ('Apps Script HTTP ' . $res['status'])];
}

function mosa_send_email(array $secrets, string $to, string $subject, string $html, string $text, string $vaultDir = ''): array
{
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'reason' => 'Invalid recipient email'];
    }

    $cfg = $vaultDir !== '' ? mosa_get_mail_config($vaultDir) : mosa_default_mail_config();
    $primaryErr = '';
    if (!empty($cfg['enabled']) && !empty($cfg['gmailAddress'])) {
        if (($cfg['provider'] ?? '') === 'google_script' && trim((string)$cfg['appsScriptUrl']) !== '') {
            $gs = mosa_send_google_script($cfg, $to, $subject, $html, $text);
            if ($gs['ok']) {
                return $gs;
            }
            $primaryErr = (string)($gs['reason'] ?? 'Google Script error');
        } elseif (!empty($cfg['appPassword'])) {
            $smtp = mosa_send_gmail_smtp($cfg, $to, $subject, $html, $text);
            if ($smtp['ok']) {
                return $smtp;
            }
            $primaryErr = (string)($smtp['reason'] ?? 'Gmail SMTP error');
        }
    }

    if (!empty($cfg['enabled']) && ($cfg['fallbackResend'] ?? true) === false) {
        return ['ok' => false, 'provider' => (string)($cfg['provider'] ?? 'gmail_smtp'), 'reason' => $primaryErr ?: 'Google email credentials incomplete'];
    }

    $apiKey = trim((string)($secrets['RESEND_API_KEY'] ?? ''));
    $defaultFrom = (string)($secrets['EMAIL_FROM'] ?? 'Mosa Safari <bookings@mosasafari.com>');
    $lastErr = $primaryErr ?: 'Missing RESEND_API_KEY';

    if ($apiKey !== '') {
        foreach ([$defaultFrom, 'Mosa Safari <onboarding@resend.dev>'] as $fromAddr) {
            $res = mosa_http_post_json(
                'https://api.resend.com/emails',
                ['from' => $fromAddr, 'to' => [$to], 'subject' => $subject, 'html' => $html, 'text' => $text],
                ['Authorization: Bearer ' . $apiKey]
            );
            if ($res['ok']) {
                $decoded = json_decode($res['body'], true);
                return ['ok' => true, 'provider' => 'resend', 'from' => $fromAddr, 'id' => $decoded['id'] ?? 'resend-ok'];
            }
            $lastErr = 'Resend HTTP ' . $res['status'];
        }
    }

    // Native Hostinger PHP mail() fallback (skip in local cli-server so dev tests stay clean)
    if (php_sapi_name() !== 'cli-server' && function_exists('mail')) {
        $replyTo = mosa_clean_mail_header((string)($cfg['replyTo'] ?: ($cfg['gmailAddress'] ?: 'info@mosasafari.com')));
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $defaultFrom,
            'Reply-To: ' . $replyTo
        ];
        if (@mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html ?: nl2br($text), implode("\r\n", $headers))) {
            return ['ok' => true, 'provider' => 'php_mail', 'from' => $defaultFrom, 'id' => 'php-mail-fallback'];
        }
    }
    return ['ok' => false, 'provider' => (string)($cfg['provider'] ?? 'resend'), 'reason' => $primaryErr ?: $lastErr];
}

function mosa_normalize_safari_terms(string $text, string $targetLang): string
{
    $out = trim($text);
    if ($out === '') {
        return '';
    }
    if ($targetLang === 'en') {
        $out = str_ireplace('Beach Buggy', 'ATV Quad', $out);
        $out = (string)preg_replace('/^Move\s+(\d{1,2}:\d{2})/iu', 'Departs $1', $out);
        $out = (string)preg_replace('/(\d{1,2}:\d{2})\s*ص\b/u', '$1 AM', $out);
        $out = (string)preg_replace('/(\d{1,2}:\d{2})\s*م\b/u', '$1 PM', $out);
    } elseif ($targetLang === 'it') {
        $out = str_ireplace('Beach Buggy', 'Quad ATV', $out);
        $out = (string)preg_replace('/^Spostati\s+(\d{1,2}:\d{2})/iu', 'Partenza $1', $out);
        $out = (string)preg_replace('/(\d{1,2}:\d{2})\s*ص\b/u', '$1 AM', $out);
        $out = (string)preg_replace('/(\d{1,2}:\d{2})\s*م\b/u', '$1 PM', $out);
    } elseif ($targetLang === 'ru') {
        $out = str_ireplace('Beach Buggy', 'квадроцикл ATV', $out);
        $out = (string)preg_replace('/^Двигаться\s+(\d{1,2}:\d{2})/iu', 'Выезд $1', $out);
        $out = (string)preg_replace('/(\d{1,2}:\d{2})\s*[صم]\b/u', '$1', $out);
    }
    return trim($out);
}

/**
 * Translate a slice of strings in a single POST call preserving exact 1:1 ordering.
 */
function mosa_translate_batch_post(array $strings, string $sourceLang, string $targetLang): ?array
{
    if ($strings === []) {
        return [];
    }
    $url = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl='
        . rawurlencode($sourceLang) . '&tl=' . rawurlencode($targetLang);
    $bodyParts = [];
    foreach ($strings as $s) {
        $bodyParts[] = 'q=' . rawurlencode((string)$s);
    }
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'timeout' => 10,
            'ignore_errors' => true,
            'header' => "Content-Type: application/x-www-form-urlencoded; charset=UTF-8\r\nUser-Agent: MosaSafariStudio/1.0\r\n",
            'content' => implode('&', $bodyParts)
        ]
    ]);
    $rawBody = @file_get_contents($url, false, $ctx);
    if (!is_string($rawBody) || $rawBody === '') {
        return null;
    }
    $decoded = json_decode($rawBody, true);
    if (!is_array($decoded) || count($decoded) !== count($strings)) {
        return null;
    }
    $out = [];
    foreach ($decoded as $idx => $item) {
        $txt = is_array($item) ? (string)($item[0] ?? '') : (string)$item;
        $out[] = trim($txt) !== '' ? mosa_normalize_safari_terms($txt, $targetLang) : (string)$strings[$idx];
    }
    return $out;
}

function mosa_translate_single(string $text, string $sourceLang, string $targetLang): string
{
    $raw = trim($text);
    if ($raw === '' || preg_match('/^[\d\s.,:%+\-–—$€★]+$/u', $raw)) {
        return $raw;
    }

    $url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' . rawurlencode($sourceLang)
        . '&tl=' . rawurlencode($targetLang) . '&dt=t&q=' . rawurlencode($raw);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 8,
            'ignore_errors' => true,
            'header' => "User-Agent: MosaSafariStudio/1.0\r\n"
        ]
    ]);
    $body = @file_get_contents($url, false, $ctx);
    if (is_string($body) && $body !== '') {
        $decoded = json_decode($body, true);
        if (is_array($decoded[0] ?? null)) {
            $acc = '';
            foreach ($decoded[0] as $seg) {
                $acc .= (string)($seg[0] ?? '');
            }
            if (trim($acc) !== '') {
                return mosa_normalize_safari_terms($acc, $targetLang);
            }
        }
    }

    $mmUrl = 'https://api.mymemory.translated.net/get?q=' . rawurlencode($raw)
        . '&langpair=' . rawurlencode($sourceLang . '|' . $targetLang);
    $mmBody = @file_get_contents($mmUrl, false, $ctx);
    if (is_string($mmBody) && $mmBody !== '') {
        $mm = json_decode($mmBody, true);
        $tr = trim((string)($mm['responseData']['translatedText'] ?? ''));
        if ($tr !== '') {
            return mosa_normalize_safari_terms($tr, $targetLang);
        }
    }
    return $raw;
}

function mosa_translate_tour_items(string $sourceLang, array $targetLangs, array $items): array
{
    $supported = ['ar', 'en', 'it', 'ru'];
    $src = in_array($sourceLang, $supported, true) ? $sourceLang : 'ar';
    $targets = array_values(array_filter($targetLangs, static fn($l) => in_array($l, $supported, true) && $l !== $src));

    $unique = [];
    $indexMap = [];
    $register = static function ($val) use (&$unique, &$indexMap) {
        $s = trim((string)$val);
        if ($s === '' || preg_match('/^[\d\s.,:%+\-–—$€★]+$/u', $s)) {
            return;
        }
        if (!array_key_exists($s, $indexMap)) {
            $indexMap[$s] = count($unique);
            $unique[] = $s;
        }
    };

    foreach (['title', 'badge', 'duration', 'departureWindow', 'subtitle', 'desc', 'seoTitle', 'seoDesc'] as $f) {
        $register($items[$f] ?? '');
    }
    foreach (['highlights', 'includes', 'excludes', 'bring', 'routeLabels'] as $arrKey) {
        foreach (is_array($items[$arrKey] ?? null) ? $items[$arrKey] : [] as $entry) {
            $register($entry);
        }
    }
    foreach (is_array($items['itinerary'] ?? null) ? $items['itinerary'] : [] as $st) {
        if (is_array($st)) {
            $register($st['time'] ?? '');
            $register($st['title'] ?? '');
            $register($st['desc'] ?? '');
        }
    }

    $translations = [];
    foreach ($targets as $tl) {
        $translatedList = [];
        foreach (array_chunk($unique, 30) as $chunk) {
            $batchRes = mosa_translate_batch_post($chunk, $src, $tl);
            if (is_array($batchRes)) {
                foreach ($batchRes as $p) {
                    $translatedList[] = $p;
                }
            } else {
                foreach ($chunk as $one) {
                    $translatedList[] = mosa_translate_single($one, $src, $tl);
                }
            }
        }

        $lookup = static function ($val) use ($indexMap, $translatedList): string {
            $s = trim((string)$val);
            if ($s === '') {
                return '';
            }
            return isset($indexMap[$s]) ? (string)($translatedList[$indexMap[$s]] ?? $s) : $s;
        };

        $mapArr = static function ($key) use ($items, $lookup): array {
            $out = [];
            foreach (is_array($items[$key] ?? null) ? $items[$key] : [] as $v) {
                $t = $lookup($v);
                if ($t !== '') {
                    $out[] = $t;
                }
            }
            return $out;
        };

        $itinOut = [];
        foreach (is_array($items['itinerary'] ?? null) ? $items['itinerary'] : [] as $idx => $st) {
            $itinOut[] = [
                'step' => (string)($st['step'] ?? str_pad((string)($idx + 1), 2, '0', STR_PAD_LEFT)),
                'time' => $lookup($st['time'] ?? ''),
                'title' => $lookup($st['title'] ?? ''),
                'desc' => $lookup($st['desc'] ?? '')
            ];
        }

        $translations[$tl] = [
            'title' => $lookup($items['title'] ?? ''),
            'badge' => $lookup($items['badge'] ?? ''),
            'duration' => $lookup($items['duration'] ?? ''),
            'departureWindow' => $lookup($items['departureWindow'] ?? ''),
            'subtitle' => $lookup($items['subtitle'] ?? ''),
            'desc' => $lookup($items['desc'] ?? ''),
            'seoTitle' => $lookup($items['seoTitle'] ?? ''),
            'seoDesc' => $lookup($items['seoDesc'] ?? ''),
            'highlights' => $mapArr('highlights'),
            'includes' => $mapArr('includes'),
            'excludes' => $mapArr('excludes'),
            'bring' => $mapArr('bring'),
            'routeLabels' => array_map($lookup, is_array($items['routeLabels'] ?? null) ? $items['routeLabels'] : []),
            'itinerary' => $itinOut
        ];
    }
    return $translations;
}

function mosa_media_dir(string $vaultDir): string
{
    $dir = rtrim($vaultDir, '/') . '/media';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    mosa_protect_local_dir($dir);
    return $dir;
}

function mosa_list_media(string $vaultDir): array
{
    $list = mosa_kv_get($vaultDir, 'media_index', []);
    return is_array($list) ? $list : [];
}

function mosa_save_media(string $vaultDir, string $filename, string $mimeType, string $dataBase64): array
{
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($allowed[$mimeType])) {
        throw new InvalidArgumentException('Unsupported image format (use JPG, PNG, or WebP)');
    }
    $clean = preg_replace('/^data:[^;]+;base64,/', '', trim($dataBase64));
    $bin = base64_decode((string)$clean, true);
    if ($bin === false || $bin === '' || strlen($bin) > 1048576) {
        throw new InvalidArgumentException('Invalid or oversized image (max 1MB)');
    }
    $ext = $allowed[$mimeType];
    $id = 'img-' . base_convert((string)time(), 10, 36) . '-' . bin2hex(random_bytes(3)) . '.' . $ext;
    $path = mosa_media_dir($vaultDir) . '/' . $id;
    if (@file_put_contents($path, $bin, LOCK_EX) === false) {
        throw new RuntimeException('Failed to persist uploaded media');
    }
    @chmod($path, 0600);
    $item = [
        'id' => $id,
        'url' => '/api/media/' . $id,
        'filename' => substr(preg_replace('/[^a-zA-Z0-9_.\-]/', '', $filename), 0, 80) ?: $id,
        'mimeType' => $mimeType,
        'size' => strlen($bin),
        'createdAt' => gmdate('c')
    ];
    mosa_kv_mutate($vaultDir, 'media_index', [], static function ($cur) use ($item) {
        $arr = is_array($cur) ? $cur : [];
        array_unshift($arr, $item);
        return array_slice($arr, 0, 120);
    });
    return $item;
}

function mosa_delete_media(string $vaultDir, string $id): bool
{
    $safeId = preg_replace('/[^a-zA-Z0-9_.\-]/', '', $id);
    if ($safeId === '') {
        return false;
    }
    @unlink(mosa_media_dir($vaultDir) . '/' . $safeId);
    mosa_kv_mutate($vaultDir, 'media_index', [], static function ($cur) use ($safeId) {
        return array_values(array_filter(is_array($cur) ? $cur : [], static fn($x) => ($x['id'] ?? '') !== $safeId));
    });
    return true;
}

function mosa_serve_media(string $vaultDir, string $id): void
{
    $safeId = preg_replace('/[^a-zA-Z0-9_.\-]/', '', $id);
    $path = mosa_media_dir($vaultDir) . '/' . $safeId;
    if ($safeId === '' || !is_file($path)) {
        http_response_code(404);
        echo 'Media Not Found';
        exit;
    }
    $ext = strtolower(pathinfo($safeId, PATHINFO_EXTENSION));
    $mime = $ext === 'png' ? 'image/png' : ($ext === 'webp' ? 'image/webp' : 'image/jpeg');
    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=31536000, immutable');
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
}
