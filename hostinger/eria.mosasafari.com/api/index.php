<?php
/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

declare(strict_types=1);

require_once __DIR__ . '/_lib/mosa_core.php';

$siteRoot = dirname(__DIR__);
mosa_require_host(['eria.mosasafari.com']);

// Emit strict security headers on every Admin API response
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive, nosnippet');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');

$vaultDir = mosa_vault_dir($siteRoot);
$secrets = mosa_load_secrets($vaultDir, [__DIR__ . '/.mosa_secrets.php']);

$path = parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

function mosa_verify_origin_headers(): bool
{
    $secFetch = strtolower((string)($_SERVER['HTTP_SEC_FETCH_SITE'] ?? ''));
    if ($secFetch === 'cross-site') {
        return false;
    }
    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin !== '') {
        $originHost = strtolower((string)(parse_url($origin, PHP_URL_HOST) ?: ''));
        $reqHost = strtolower(explode(':', (string)($_SERVER['HTTP_HOST'] ?? ''))[0]);
        if ($originHost === '' || $originHost !== $reqHost) {
            return false;
        }
    }
    return true;
}

function mosa_set_session_cookie(string $token, int $maxAge): void
{
    setcookie(mosa_session_cookie_name(), $token, [
        'expires' => $maxAge > 0 ? (time() + $maxAge) : (time() - 3600),
        'path' => '/',
        'secure' => mosa_is_https(),
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
}

function mosa_require_authenticated_admin(string $vaultDir, array $secrets): array
{
    $hash = (string)($secrets['ADMIN_PASSWORD_HASH'] ?? '');
    $jwtSecret = (string)($secrets['ADMIN_JWT_SECRET'] ?? '');
    if ($hash === '' || $jwtSecret === '') {
        mosa_send_json(['ok' => false, 'error' => 'Admin secrets are not configured in vault'], 500);
    }

    $cookieName = mosa_session_cookie_name();
    $token = (string)($_COOKIE[$cookieName] ?? '');
    $payload = $token !== '' ? mosa_verify_session($jwtSecret, $token) : null;
    if ($payload === null) {
        mosa_send_json(['ok' => false, 'error' => 'Unauthorized'], 401);
    }

    $revoked = mosa_kv_get($vaultDir, 'revoked', []);
    if (is_array($revoked) && !empty($revoked[$payload['jti']])) {
        mosa_send_json(['ok' => false, 'error' => 'Session revoked'], 401);
    }
    return $payload;
}

// 1. POST /api/admin/login
if ($path === '/api/admin/login' && $method === 'POST') {
    if (!mosa_verify_origin_headers()) {
        mosa_send_json(['ok' => false, 'error' => 'Forbidden origin'], 403);
    }

    $hash = (string)($secrets['ADMIN_PASSWORD_HASH'] ?? '');
    $jwtSecret = (string)($secrets['ADMIN_JWT_SECRET'] ?? '');
    if ($hash === '' || $jwtSecret === '') {
        mosa_send_json(['ok' => false, 'error' => 'Server auth secrets are not configured'], 500);
    }

    $ip = mosa_client_ip();
    $now = time();
    $limits = mosa_kv_get($vaultDir, 'ratelimits', []);
    if (!is_array($limits)) {
        $limits = [];
    }
    $rec = $limits[$ip] ?? ['count' => 0, 'first' => $now];

    if (($rec['count'] ?? 0) >= MOSA_RATE_LIMIT_MAX_FAILS && ($now - (int)($rec['first'] ?? 0)) < MOSA_RATE_LIMIT_WINDOW_SEC) {
        $retryAfter = max(1, MOSA_RATE_LIMIT_WINDOW_SEC - ($now - (int)$rec['first']));
        mosa_send_json(
            ['ok' => false, 'error' => "تم حظر المحاولات مؤقتاً ({$retryAfter}s) — Too many failed attempts", 'retryAfter' => $retryAfter],
            429,
            ['Retry-After' => (string)$retryAfter]
        );
    }

    $body = mosa_read_json_body(16384);
    $password = is_array($body) ? (string)($body['password'] ?? '') : '';

    if ($password === '' || !password_verify($password, $hash)) {
        $lockedOutNow = false;
        mosa_kv_mutate($vaultDir, 'ratelimits', [], function ($all) use ($ip, $now, &$lockedOutNow) {
            $map = is_array($all) ? $all : [];
            foreach ($map as $k => $v) {
                if (($now - (int)($v['first'] ?? 0)) >= MOSA_RATE_LIMIT_WINDOW_SEC) {
                    unset($map[$k]);
                }
            }
            $prev = $map[$ip] ?? null;
            if (!$prev || ($now - (int)$prev['first']) >= MOSA_RATE_LIMIT_WINDOW_SEC) {
                $map[$ip] = ['count' => 1, 'first' => $now];
            } else {
                $map[$ip]['count'] = (int)$prev['count'] + 1;
            }
            if ((int)$map[$ip]['count'] === MOSA_RATE_LIMIT_MAX_FAILS) {
                $lockedOutNow = true;
            }
            return $map;
        });
        if ($lockedOutNow) {
            mosa_append_audit($vaultDir, 'LOGIN_LOCKOUT', 'Rate-limited IP ' . mosa_mask_ip($ip) . ' after 5 failed attempts');
        }
        mosa_send_json(['ok' => false, 'error' => 'Invalid credentials'], 401);
    }

    // Clear IP failure record on success
    mosa_kv_mutate($vaultDir, 'ratelimits', [], function ($all) use ($ip) {
        $map = is_array($all) ? $all : [];
        unset($map[$ip]);
        return $map;
    });

    $jti = bin2hex(random_bytes(16));
    $csrf = bin2hex(random_bytes(16));
    $payload = ['sub' => 'admin', 'jti' => $jti, 'csrf' => $csrf, 'iat' => $now, 'exp' => $now + MOSA_SESSION_TTL_SEC];
    $token = mosa_sign_session($jwtSecret, $payload);

    mosa_append_audit($vaultDir, 'ADMIN_LOGIN', 'Authenticated Hostinger session from ' . mosa_mask_ip($ip));
    mosa_set_session_cookie($token, MOSA_SESSION_TTL_SEC);
    mosa_send_json(['ok' => true, 'csrfToken' => $csrf, 'expiresIn' => MOSA_SESSION_TTL_SEC]);
}

// Protect all other /api/admin/* endpoints
$session = mosa_require_authenticated_admin($vaultDir, $secrets);

// 2. GET /api/admin/session
if ($path === '/api/admin/session' && $method === 'GET') {
    mosa_send_json(['ok' => true, 'csrfToken' => $session['csrf'], 'expiresAt' => $session['exp']]);
}

// Strict Origin + X-CSRF-Token on all state-mutating requests
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    $csrfHdr = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if (!mosa_verify_origin_headers() || $csrfHdr === '' || !hash_equals((string)$session['csrf'], $csrfHdr)) {
        mosa_append_audit($vaultDir, 'CSRF_BLOCKED', "Blocked {$method} {$path} (invalid CSRF or Origin)");
        mosa_send_json(['ok' => false, 'error' => 'CSRF or Origin validation failed'], 403);
    }
}

// 3. POST /api/admin/logout
if ($path === '/api/admin/logout' && $method === 'POST') {
    $now = time();
    mosa_kv_mutate($vaultDir, 'revoked', [], function ($rev) use ($session, $now) {
        $map = is_array($rev) ? $rev : [];
        foreach ($map as $k => $exp) {
            if ((int)$exp <= $now) {
                unset($map[$k]);
            }
        }
        $map[$session['jti']] = (int)$session['exp'];
        return $map;
    });
    mosa_append_audit($vaultDir, 'ADMIN_LOGOUT', 'Session revoked and cookie cleared');
    mosa_set_session_cookie('', 0);
    mosa_send_json(['ok' => true]);
}

// 4. POST /api/admin/password (Rotate Admin Password & JWT Secret in Private Vault)
if ($path === '/api/admin/password' && $method === 'POST') {
    $body = mosa_read_json_body(16384);
    $currentPw = (string)($body['currentPassword'] ?? '');
    $newPw = (string)($body['newPassword'] ?? '');
    if (!password_verify($currentPw, (string)$secrets['ADMIN_PASSWORD_HASH'])) {
        mosa_send_json(['ok' => false, 'error' => 'كلمة المرور الحالية غير صحيحة'], 401);
    }
    if (strlen($newPw) < 8) {
        mosa_send_json(['ok' => false, 'error' => 'كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف'], 400);
    }

    $secrets['ADMIN_PASSWORD_HASH'] = password_hash($newPw, PASSWORD_BCRYPT, ['cost' => 12]);
    $secrets['ADMIN_JWT_SECRET'] = bin2hex(random_bytes(32));
    if (!mosa_save_secrets($vaultDir, $secrets)) {
        mosa_send_json(['ok' => false, 'error' => 'Failed to save secrets to vault'], 500);
    }

    $now = time();
    $jti = bin2hex(random_bytes(16));
    $csrf = bin2hex(random_bytes(16));
    $token = mosa_sign_session($secrets['ADMIN_JWT_SECRET'], [
        'sub' => 'admin',
        'jti' => $jti,
        'csrf' => $csrf,
        'iat' => $now,
        'exp' => $now + MOSA_SESSION_TTL_SEC
    ]);
    mosa_append_audit($vaultDir, 'PASSWORD_CHANGED', 'Rotated bcrypt password hash & HMAC signing key');
    mosa_set_session_cookie($token, MOSA_SESSION_TTL_SEC);
    mosa_send_json(['ok' => true, 'csrfToken' => $csrf]);
}

// 5. GET /api/admin/overview
if ($path === '/api/admin/overview' && $method === 'GET') {
    $bookings = mosa_kv_get($vaultDir, 'bookings', []);
    $trips = mosa_kv_get($vaultDir, 'trips', null);
    $promos = mosa_get_promos($vaultDir);
    $settings = mosa_get_settings($vaultDir, $secrets);
    $mailConfig = mosa_sanitize_mail_config(mosa_get_mail_config($vaultDir));
    $analytics = mosa_get_analytics($vaultDir);
    $audit = mosa_kv_get($vaultDir, 'audit', []);

    mosa_send_json([
        'ok' => true,
        'bookings' => is_array($bookings) ? $bookings : [],
        'trips' => is_array($trips) ? $trips : null,
        'promos' => $promos,
        'settings' => $settings,
        'mailConfig' => $mailConfig,
        'analytics' => $analytics,
        'auditLog' => is_array($audit) ? $audit : [],
        'health' => [
            'isolatedWorker' => true,
            'httpOnlyCookie' => true,
            'csrfProtected' => true,
            'kvBound' => is_dir($vaultDir) && is_writable($vaultDir),
            'greenApiConfigured' => !empty($secrets['GREEN_API_TOKEN']),
            'gmailConfigured' => !empty($mailConfig['connected']),
            'resendConfigured' => !empty($secrets['RESEND_API_KEY']),
            'adminSecretSet' => !empty($secrets['ADMIN_PASSWORD_HASH']),
            'jwtSecretSet' => !empty($secrets['ADMIN_JWT_SECRET']),
            'serverTime' => gmdate('c')
        ]
    ]);
}

// 6. POST /api/admin/bookings (Manual CRM Entry)
if ($path === '/api/admin/bookings' && $method === 'POST') {
    $body = mosa_read_json_body(65536);
    if (!is_array($body)) {
        mosa_send_json(['ok' => false, 'error' => 'Invalid JSON'], 400);
    }
    $ref = !empty($body['ref']) ? (string)$body['ref'] : ('MOSA-' . random_int(100000, 999999));
    $totalUsd = round((float)($body['totalUsd'] ?? 0), 2);
    $createdAt = gmdate('c');
    $today = substr($createdAt, 0, 10);

    $record = [
        'ref' => $ref,
        'createdAt' => $createdAt,
        'status' => (string)($body['status'] ?? 'confirmed'),
        'source' => 'manual',
        'lang' => (string)($body['lang'] ?? 'ar'),
        'currency' => 'USD',
        'name' => trim((string)($body['name'] ?? '')),
        'phone' => trim((string)($body['phone'] ?? '')),
        'email' => trim((string)($body['email'] ?? '')),
        'nationality' => trim((string)($body['nationality'] ?? '')),
        'adults' => max(1, (int)($body['adults'] ?? 2)),
        'children' => max(0, (int)($body['children'] ?? 0)),
        'vehicleOpt' => (string)($body['vehicleOpt'] ?? 'Double ATV Quad'),
        'vehicleDisplay' => (string)($body['vehicleDisplay'] ?? ($body['vehicleOpt'] ?? 'Double ATV Quad')),
        'pickupHotel' => (string)($body['pickupHotel'] ?? 'Sharm El Sheikh'),
        'tripDate' => (string)($body['tripDate'] ?? $today),
        'tripTime' => ($body['tripTime'] ?? '') === 'evening' ? 'evening' : 'morning',
        'tripTimeDisplay' => ($body['tripTime'] ?? '') === 'evening' ? 'مساءً (الغروب)' : 'صباحاً',
        'paymentMethod' => (string)($body['paymentMethod'] ?? 'arrival'),
        'cardMask' => '',
        'promoCode' => strtoupper(trim((string)($body['promoCode'] ?? ''))),
        'selectedIds' => is_array($body['selectedIds'] ?? null) ? array_values($body['selectedIds']) : [],
        'selectedTours' => (string)($body['selectedTours'] ?? ''),
        'totalUsd' => $totalUsd,
        'totalFormatted' => (string)($body['totalFormatted'] ?? ('$' . number_format($totalUsd, 2))),
        'whatsappSent' => false,
        'emailSent' => false,
        'adminNotes' => (string)($body['adminNotes'] ?? '')
    ];

    mosa_kv_mutate($vaultDir, 'bookings', [], function ($arr) use ($record) {
        $list = is_array($arr) ? $arr : [];
        array_unshift($list, $record);
        return $list;
    });

    mosa_kv_mutate($vaultDir, 'analytics', mosa_default_analytics(), function ($saved) use ($today, $totalUsd) {
        $a = is_array($saved) ? $saved : mosa_default_analytics();
        $a['daily'] = is_array($a['daily'] ?? null) ? $a['daily'] : [];
        $a['bookingsCompleted'] = (int)($a['bookingsCompleted'] ?? 0) + 1;
        if (!isset($a['daily'][$today])) {
            $a['daily'][$today] = ['views' => 0, 'modalOpens' => 0, 'bookings' => 0, 'revenueUsd' => 0];
        }
        $a['daily'][$today]['bookings'] = (int)$a['daily'][$today]['bookings'] + 1;
        $a['daily'][$today]['revenueUsd'] = round((float)$a['daily'][$today]['revenueUsd'] + $totalUsd, 2);
        $a['daily'] = mosa_prune_daily($a['daily']);
        return $a;
    });

    mosa_append_audit($vaultDir, 'BOOKING_CREATE', "Manual booking {$ref} for {$record['name']} (\${$totalUsd})");
    mosa_send_json(['ok' => true, 'booking' => $record]);
}

// 7. POST /api/admin/bookings/:ref/resend
if (preg_match('#^/api/admin/bookings/([^/]+)/resend$#', $path, $m) && $method === 'POST') {
    $ref = urldecode($m[1]);
    $body = mosa_read_json_body(16384);
    $target = (string)($body['target'] ?? '');
    $bookings = mosa_kv_get($vaultDir, 'bookings', []);
    $bk = null;
    foreach (is_array($bookings) ? $bookings : [] as $item) {
        if (($item['ref'] ?? '') === $ref) {
            $bk = $item;
            break;
        }
    }
    if ($bk === null) {
        mosa_send_json(['ok' => false, 'error' => 'Booking not found'], 404);
    }
    $settings = mosa_get_settings($vaultDir, $secrets);

    if ($target === 'whatsapp') {
        $msg = "🐪 *إشعار حجز (إعادة إرسال) — {$bk['ref']}*\n"
            . "👤 العميل: {$bk['name']} ({$bk['phone']})\n"
            . "🏜️ البرامج: {$bk['selectedTours']}\n"
            . "📅 الموعد: {$bk['tripDate']} ({$bk['tripTimeDisplay']})\n"
            . "🏨 الفندق: {$bk['pickupHotel']}\n"
            . "💰 الإجمالي: {$bk['totalFormatted']} ({$bk['paymentMethod']})";
        $res = mosa_send_whatsapp($secrets, $msg, (string)($settings['ownerPhones'] ?? ''));
        if ($res['ok']) {
            mosa_kv_mutate($vaultDir, 'bookings', [], function ($arr) use ($ref) {
                foreach ($arr as &$item) {
                    if (($item['ref'] ?? '') === $ref) {
                        $item['whatsappSent'] = true;
                    }
                }
                return $arr;
            });
        }
        mosa_append_audit($vaultDir, 'BOOKING_RESEND_WA', "Resent WhatsApp for {$ref}: " . ($res['ok'] ? 'OK' : ($res['reason'] ?? 'Fail')));
        mosa_send_json(['ok' => $res['ok'], 'error' => $res['reason'] ?? '']);
    }

    if ($target === 'email') {
        if (empty($bk['email'])) {
            mosa_send_json(['ok' => false, 'error' => 'Booking has no customer email'], 400);
        }
        $html = "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0E1015;color:#F4EFE6;padding:24px;border-radius:16px;\">"
            . "<h2 style=\"color:#D9B36C;\">Mosa Safari — Booking Confirmation ({$bk['ref']})</h2>"
            . "<p>Hello <strong>" . htmlspecialchars((string)$bk['name'], ENT_QUOTES, 'UTF-8') . "</strong>,</p>"
            . "<ul><li><strong>Tours:</strong> " . htmlspecialchars((string)$bk['selectedTours'], ENT_QUOTES, 'UTF-8') . "</li>"
            . "<li><strong>Date:</strong> " . htmlspecialchars((string)$bk['tripDate'], ENT_QUOTES, 'UTF-8') . "</li>"
            . "<li><strong>Hotel:</strong> " . htmlspecialchars((string)$bk['pickupHotel'], ENT_QUOTES, 'UTF-8') . "</li>"
            . "<li><strong>Total:</strong> " . htmlspecialchars((string)$bk['totalFormatted'], ENT_QUOTES, 'UTF-8') . "</li></ul>"
            . "<p style=\"color:#9E9990;font-size:12px;\">WhatsApp Support: +201023355550 · mosasafari.com</p></div>";
        $res = mosa_send_email(
            $secrets,
            (string)$bk['email'],
            "Mosa Safari Booking Confirmation — Ref {$bk['ref']}",
            $html,
            "Mosa Safari Confirmation {$bk['ref']} - {$bk['selectedTours']} - {$bk['totalFormatted']}",
            $vaultDir
        );
        if ($res['ok']) {
            mosa_kv_mutate($vaultDir, 'bookings', [], function ($arr) use ($ref) {
                foreach ($arr as &$item) {
                    if (($item['ref'] ?? '') === $ref) {
                        $item['emailSent'] = true;
                    }
                }
                return $arr;
            });
        }
        mosa_append_audit($vaultDir, 'BOOKING_RESEND_EMAIL', "Resent via " . ($res['provider'] ?? 'email') . " to {$bk['email']} for {$ref}");
        mosa_send_json(['ok' => $res['ok'], 'provider' => $res['provider'] ?? '', 'error' => $res['reason'] ?? '']);
    }

    mosa_send_json(['ok' => false, 'error' => 'Invalid target'], 400);
}

// 8. PATCH / DELETE /api/admin/bookings/:ref
if (preg_match('#^/api/admin/bookings/([^/]+)$#', $path, $m)) {
    $ref = urldecode($m[1]);
    if ($method === 'PATCH') {
        $patch = mosa_read_json_body(65536);
        if (!is_array($patch)) {
            mosa_send_json(['ok' => false, 'error' => 'Invalid JSON'], 400);
        }
        $allowed = ['status', 'adminNotes', 'tripDate', 'tripTime', 'tripTimeDisplay', 'pickupHotel', 'totalUsd', 'totalFormatted', 'paymentMethod', 'name', 'phone', 'email', 'adults', 'children', 'vehicleOpt', 'vehicleDisplay'];
        $updatedRecord = null;
        mosa_kv_mutate($vaultDir, 'bookings', [], function ($arr) use ($ref, $patch, $allowed, &$updatedRecord) {
            $list = is_array($arr) ? $arr : [];
            foreach ($list as &$item) {
                if (($item['ref'] ?? '') === $ref) {
                    foreach ($allowed as $k) {
                        if (array_key_exists($k, $patch)) {
                            $item[$k] = $patch[$k];
                        }
                    }
                    $item['updatedAt'] = gmdate('c');
                    $updatedRecord = $item;
                    break;
                }
            }
            return $list;
        });
        if ($updatedRecord === null) {
            mosa_send_json(['ok' => false, 'error' => 'Booking not found'], 404);
        }
        mosa_append_audit($vaultDir, 'BOOKING_UPDATE', "Updated booking {$ref} (status: {$updatedRecord['status']})");
        mosa_send_json(['ok' => true, 'booking' => $updatedRecord]);
    }

    if ($method === 'DELETE') {
        $deleted = false;
        mosa_kv_mutate($vaultDir, 'bookings', [], function ($arr) use ($ref, &$deleted) {
            $list = is_array($arr) ? $arr : [];
            $next = array_values(array_filter($list, fn($b) => ($b['ref'] ?? '') !== $ref));
            $deleted = count($next) !== count($list);
            return $next;
        });
        if (!$deleted) {
            mosa_send_json(['ok' => false, 'error' => 'Booking not found'], 404);
        }
        mosa_append_audit($vaultDir, 'BOOKING_DELETE', "Deleted booking {$ref}");
        mosa_send_json(['ok' => true]);
    }
}

// 9. PUT /api/admin/trips
if ($path === '/api/admin/trips' && $method === 'PUT') {
    $body = mosa_read_json_body(262144);
    if (!is_array($body)) {
        mosa_send_json(['ok' => false, 'error' => 'Invalid JSON'], 400);
    }
    if (($body['trips'] ?? null) === null) {
        @unlink(mosa_kv_path($vaultDir, 'trips'));
        mosa_append_audit($vaultDir, 'TRIPS_RESET', 'Reset catalog to built-in 8 default safari tours');
        mosa_send_json(['ok' => true, 'trips' => null]);
    }
    if (!is_array($body['trips'])) {
        mosa_send_json(['ok' => false, 'error' => 'Expected trips array'], 400);
    }
    mosa_kv_put($vaultDir, 'trips', array_values($body['trips']));
    mosa_append_audit($vaultDir, 'TRIPS_UPDATE', 'Saved ' . count($body['trips']) . ' safari programs');
    mosa_send_json(['ok' => true, 'trips' => array_values($body['trips'])]);
}

// 10. PUT /api/admin/promos
if ($path === '/api/admin/promos' && $method === 'PUT') {
    $body = mosa_read_json_body(65536);
    if (!is_array($body) || !is_array($body['promos'] ?? null)) {
        mosa_send_json(['ok' => false, 'error' => 'Expected promos array'], 400);
    }
    $norm = [];
    foreach ($body['promos'] as $p) {
        $code = strtoupper(trim((string)($p['code'] ?? '')));
        if ($code === '') {
            continue;
        }
        $norm[] = [
            'code' => $code,
            'discount' => max(1, min(90, (float)($p['discount'] ?? 10))),
            'active' => ($p['active'] ?? true) !== false,
            'uses' => (int)($p['uses'] ?? 0),
            'maxUses' => (int)($p['maxUses'] ?? 0),
            'expiresAt' => (string)($p['expiresAt'] ?? ''),
            'note' => (string)($p['note'] ?? '')
        ];
    }
    mosa_kv_put($vaultDir, 'promos', $norm);
    mosa_append_audit($vaultDir, 'PROMOS_UPDATE', 'Updated promo catalog (' . count($norm) . ' codes)');
    mosa_send_json(['ok' => true, 'promos' => $norm]);
}

// 11. PUT /api/admin/settings
if ($path === '/api/admin/settings' && $method === 'PUT') {
    $body = mosa_read_json_body(65536);
    if (!is_array($body)) {
        mosa_send_json(['ok' => false, 'error' => 'Invalid JSON'], 400);
    }
    $current = mosa_get_settings($vaultDir, $secrets);
    $updated = array_merge($current, is_array($body['settings'] ?? null) ? $body['settings'] : []);
    mosa_kv_put($vaultDir, 'settings', $updated);
    mosa_append_audit($vaultDir, 'SETTINGS_UPDATE', 'Updated platform configuration and integration controls');
    mosa_send_json(['ok' => true, 'settings' => $updated]);
}

// 11b. PUT / DELETE /api/admin/mail-config (Personal Google Gmail SMTP / Apps Script Connection)
if ($path === '/api/admin/mail-config') {
    if ($method === 'PUT') {
        $body = mosa_read_json_body(65536);
        if (!is_array($body)) {
            mosa_send_json(['ok' => false, 'error' => 'Invalid JSON'], 400);
        }
        try {
            $incoming = is_array($body['mailConfig'] ?? null) ? $body['mailConfig'] : $body;
            $updated = mosa_save_mail_config($vaultDir, $incoming);
            $sanitized = mosa_sanitize_mail_config($updated);
            mosa_append_audit($vaultDir, 'MAIL_CONFIG_UPDATE', 'Google email ' . ($sanitized['enabled'] ? 'enabled' : 'disabled') . " ({$sanitized['provider']}: {$sanitized['gmailAddress']})");
            mosa_send_json(['ok' => true, 'mailConfig' => $sanitized]);
        } catch (Throwable $e) {
            mosa_send_json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }
    if ($method === 'DELETE') {
        $blank = mosa_clear_mail_config($vaultDir);
        mosa_append_audit($vaultDir, 'MAIL_CONFIG_DISCONNECT', 'Disconnected personal Google email credentials');
        mosa_send_json(['ok' => true, 'mailConfig' => mosa_sanitize_mail_config($blank)]);
    }
}

// 12. POST /api/admin/test-notification
if ($path === '/api/admin/test-notification' && $method === 'POST') {
    $body = mosa_read_json_body(16384);
    $target = (string)($body['target'] ?? '');
    $to = trim((string)($body['to'] ?? ''));
    $settings = mosa_get_settings($vaultDir, $secrets);

    if ($target === 'whatsapp') {
        $res = mosa_send_whatsapp(
            $secrets,
            "✅ *اختبار نظام التنبيهات — موسى سفاري*\nتم الاتصال بنجاح من eria.mosasafari.com (" . gmdate('Y-m-d H:i') . " UTC)",
            $to !== '' ? $to : (string)($settings['ownerPhones'] ?? '')
        );
        mosa_append_audit($vaultDir, 'TEST_WHATSAPP', $res['ok'] ? 'Test WhatsApp sent' : ('Failed: ' . ($res['reason'] ?? '')));
        mosa_send_json(['ok' => $res['ok'], 'sentCount' => $res['sentCount'] ?? 0, 'error' => $res['reason'] ?? '']);
    }

    if ($target === 'email') {
        $recipient = $to !== '' ? $to : 'info@mosasafari.com';
        $res = mosa_send_email(
            $secrets,
            $recipient,
            'Mosa Safari (eria.mosasafari.com) — Email Integration Test',
            '<div style="font-family:Cairo,Arial,sans-serif;direction:rtl;max-width:540px;margin:0 auto;background:#0E1015;color:#F4EFE6;padding:24px;border-radius:16px;border:1px solid rgba(217,179,108,0.35);"><h2 style="color:#D9B36C;">تم ربط البريد بنجاح — Mosa Safari</h2><p>هذه رسالة اختبار من لوحة التحكم للتأكد من أن إشعارات العملاء تصدر من حسابك بنجاح.</p><p style="font-size:12px;color:#2CB5A0;">' . gmdate('c') . '</p></div>',
            'Mosa Safari email integration test succeeded at ' . gmdate('c'),
            $vaultDir
        );
        mosa_append_audit($vaultDir, 'TEST_EMAIL', $res['ok'] ? "Sent via " . ($res['provider'] ?? 'email') . " to {$recipient}" : ('Failed: ' . ($res['reason'] ?? '')));
        mosa_send_json(['ok' => $res['ok'], 'provider' => $res['provider'] ?? '', 'from' => $res['from'] ?? '', 'id' => $res['id'] ?? '', 'error' => $res['reason'] ?? '']);
    }

    mosa_send_json(['ok' => false, 'error' => 'Invalid target'], 400);
}

// 13. POST /api/admin/analytics/reset
if ($path === '/api/admin/analytics/reset' && $method === 'POST') {
    $blank = mosa_default_analytics();
    mosa_kv_put($vaultDir, 'analytics', $blank);
    mosa_append_audit($vaultDir, 'ANALYTICS_RESET', 'Reset visitor and funnel analytics counters');
    mosa_send_json(['ok' => true, 'analytics' => $blank]);
}

mosa_send_json(['ok' => false, 'error' => 'Endpoint not found'], 404);
