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
mosa_require_host(['mosasafari.com', 'www.mosasafari.com']);

$vaultDir = mosa_vault_dir($siteRoot);
$secrets = mosa_load_secrets($vaultDir, [__DIR__ . '/.mosa_secrets.php']);

$path = parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

// Block any admin route attempts on main storefront domain
if (strpos($path, '/api/admin') === 0 || $path === '/admin' || strpos($path, '/admin/') === 0) {
    mosa_send_json(['ok' => false, 'error' => 'Not Found'], 404);
}

// 1. GET /api/public/config
if ($path === '/api/public/config' && $method === 'GET') {
    $trips = mosa_kv_get($vaultDir, 'trips', null);
    $promos = mosa_get_promos($vaultDir);
    $settings = mosa_get_settings($vaultDir, $secrets);

    $today = gmdate('Y-m-d');
    $activePromos = [];
    foreach ($promos as $p) {
        if (($p['active'] ?? true) === false) {
            continue;
        }
        $maxUses = (int)($p['maxUses'] ?? 0);
        $uses = (int)($p['uses'] ?? 0);
        if ($maxUses > 0 && $uses >= $maxUses) {
            continue;
        }
        $exp = (string)($p['expiresAt'] ?? '');
        if ($exp !== '' && $exp < $today) {
            continue;
        }
        $activePromos[] = ['code' => (string)$p['code'], 'discount' => (float)($p['discount'] ?? 0)];
    }

    mosa_send_json([
        'ok' => true,
        'trips' => is_array($trips) ? $trips : null,
        'promos' => $activePromos,
        'settings' => [
            'siteAnnouncement' => (string)($settings['siteAnnouncement'] ?? ''),
            'groupDiscountMin' => (int)($settings['groupDiscountMin'] ?? 5),
            'groupDiscountPct' => (float)($settings['groupDiscountPct'] ?? 10),
            'exchangeMode' => (string)($settings['exchangeMode'] ?? 'auto'),
            'manualEgpRate' => (float)($settings['manualEgpRate'] ?? 50.5),
            'manualEurRate' => (float)($settings['manualEurRate'] ?? 0.92),
            'enableMorningSlot' => ($settings['enableMorningSlot'] ?? true) !== false,
            'enableEveningSlot' => ($settings['enableEveningSlot'] ?? true) !== false,
            'enablePayArrival' => ($settings['enablePayArrival'] ?? true) !== false,
            'enablePayVisa' => ($settings['enablePayVisa'] ?? true) !== false,
            'maintenanceNotice' => (string)($settings['maintenanceNotice'] ?? '')
        ]
    ]);
}

// 2. POST /api/track
if ($path === '/api/track' && $method === 'POST') {
    $body = mosa_read_json_body(16384);
    if ($body === null) {
        mosa_send_json(['ok' => false], 400);
    }

    $event = (string)($body['event'] ?? 'pageview');
    $lang = in_array($body['lang'] ?? '', ['ar', 'en', 'it', 'ru'], true) ? $body['lang'] : 'ar';
    $currency = in_array($body['currency'] ?? '', ['USD', 'EGP', 'EUR'], true) ? $body['currency'] : 'USD';
    $device = ($body['device'] ?? '') === 'mobile' ? 'mobile' : 'desktop';
    $isNewSession = !empty($body['isNewSession']);
    $tripId = isset($body['tripId']) ? substr(preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$body['tripId']), 0, 64) : '';
    $today = gmdate('Y-m-d');

    mosa_kv_mutate($vaultDir, 'analytics', mosa_default_analytics(), function ($saved) use ($event, $lang, $currency, $device, $isNewSession, $tripId, $today) {
        $base = mosa_default_analytics();
        $a = is_array($saved) ? $saved : $base;
        $a['byLang'] = array_merge($base['byLang'], is_array($a['byLang'] ?? null) ? $a['byLang'] : []);
        $a['byCurrency'] = array_merge($base['byCurrency'], is_array($a['byCurrency'] ?? null) ? $a['byCurrency'] : []);
        $a['byDevice'] = array_merge($base['byDevice'], is_array($a['byDevice'] ?? null) ? $a['byDevice'] : []);
        $a['tourClicks'] = is_array($a['tourClicks'] ?? null) ? $a['tourClicks'] : [];
        $a['daily'] = is_array($a['daily'] ?? null) ? $a['daily'] : [];

        if (!isset($a['daily'][$today]) || !is_array($a['daily'][$today])) {
            $a['daily'][$today] = ['views' => 0, 'modalOpens' => 0, 'bookings' => 0, 'revenueUsd' => 0];
        }

        if ($event === 'pageview') {
            $a['totalViews'] = (int)($a['totalViews'] ?? 0) + 1;
            if ($isNewSession) {
                $a['uniqueSessions'] = (int)($a['uniqueSessions'] ?? 0) + 1;
            }
            $a['byLang'][$lang] = (int)($a['byLang'][$lang] ?? 0) + 1;
            $a['byCurrency'][$currency] = (int)($a['byCurrency'][$currency] ?? 0) + 1;
            $a['byDevice'][$device] = (int)($a['byDevice'][$device] ?? 0) + 1;
            $a['daily'][$today]['views'] = (int)$a['daily'][$today]['views'] + 1;
        } elseif ($event === 'modal_open') {
            $a['modalOpens'] = (int)($a['modalOpens'] ?? 0) + 1;
            $a['daily'][$today]['modalOpens'] = (int)$a['daily'][$today]['modalOpens'] + 1;
            if ($tripId !== '') {
                $a['tourClicks'][$tripId] = (int)($a['tourClicks'][$tripId] ?? 0) + 1;
            }
        } elseif ($event === 'tour_click' && $tripId !== '') {
            $a['tourClicks'][$tripId] = (int)($a['tourClicks'][$tripId] ?? 0) + 1;
        }

        $a['daily'] = mosa_prune_daily($a['daily']);
        return $a;
    });

    mosa_send_json(['ok' => true]);
}

// 3. POST /api/notify-booking or /.netlify/functions/notify-booking
if (($path === '/api/notify-booking' || $path === '/.netlify/functions/notify-booking') && $method === 'POST') {
    $body = mosa_read_json_body(65536);
    if ($body === null || empty($body['payload']) || !is_array($body['payload'])) {
        mosa_send_json(['ok' => false, 'error' => 'Invalid booking payload'], 400);
    }

    $payload = $body['payload'];
    $settings = mosa_get_settings($vaultDir, $secrets);
    $ref = trim((string)($payload['ref'] ?? ''));
    if ($ref === '') {
        mosa_send_json(['ok' => false, 'error' => 'Missing booking reference'], 400);
    }

    $whatsappSent = !empty($body['whatsappAlreadySent']);
    $emailSent = false;

    if (!$whatsappSent && ($settings['whatsappEnabled'] ?? true) !== false) {
        $waText = (string)($body['ownerMessage'] ?? $body['text'] ?? "New Booking {$ref}");
        $waRes = mosa_send_whatsapp($secrets, $waText, (string)($settings['ownerPhones'] ?? ''));
        if ($waRes['ok']) {
            $whatsappSent = true;
        }
    }

    if (!empty($payload['email']) && ($settings['emailEnabled'] ?? true) !== false) {
        $subject = (string)($body['subject'] ?? "Mosa Safari Booking Confirmation — {$ref}");
        $text = (string)($body['text'] ?? '');
        $html = (string)($body['html'] ?? nl2br(htmlspecialchars($text, ENT_QUOTES, 'UTF-8')));
        $emRes = mosa_send_email($secrets, (string)$payload['email'], $subject, $html, $text, $vaultDir);
        if ($emRes['ok']) {
            $emailSent = true;
        }
    }

    $totalUsd = round((float)($payload['totalUsd'] ?? 0), 2);
    $createdAt = gmdate('c');
    $today = substr($createdAt, 0, 10);
    $promoUsed = strtoupper(trim((string)($payload['promoCode'] ?? '')));

    $inserted = false;
    mosa_kv_mutate($vaultDir, 'bookings', [], function ($arr) use ($payload, $ref, $createdAt, $totalUsd, $whatsappSent, $emailSent, $promoUsed, &$inserted) {
        $list = is_array($arr) ? $arr : [];
        foreach ($list as $existing) {
            if (($existing['ref'] ?? '') === $ref) {
                return $list;
            }
        }
        $inserted = true;
        array_unshift($list, [
            'ref' => $ref,
            'createdAt' => $createdAt,
            'status' => 'pending',
            'source' => 'web',
            'lang' => (string)($payload['lang'] ?? 'ar'),
            'currency' => (string)($payload['currency'] ?? 'USD'),
            'name' => trim((string)($payload['name'] ?? '')),
            'phone' => trim((string)($payload['phone'] ?? '')),
            'email' => trim((string)($payload['email'] ?? '')),
            'nationality' => trim((string)($payload['nationality'] ?? '')),
            'adults' => max(1, (int)($payload['adults'] ?? 1)),
            'children' => max(0, (int)($payload['children'] ?? 0)),
            'vehicleOpt' => (string)($payload['vehicleOpt'] ?? ''),
            'vehicleDisplay' => (string)($payload['vehicleDisplay'] ?? ($payload['vehicleOpt'] ?? '')),
            'pickupHotel' => trim((string)($payload['pickupHotel'] ?? 'Sharm El Sheikh')),
            'tripDate' => (string)($payload['tripDate'] ?? substr($createdAt, 0, 10)),
            'tripTime' => ($payload['tripTime'] ?? '') === 'evening' ? 'evening' : 'morning',
            'tripTimeDisplay' => (string)($payload['tripTimeDisplay'] ?? ''),
            'paymentMethod' => ($payload['paymentMethod'] ?? '') === 'visa' ? 'visa' : 'arrival',
            'cardMask' => (string)($payload['cardMask'] ?? ''),
            'promoCode' => $promoUsed,
            'selectedIds' => is_array($payload['selectedIds'] ?? null) ? array_values($payload['selectedIds']) : [],
            'selectedTours' => (string)($payload['selectedTours'] ?? ''),
            'totalUsd' => $totalUsd,
            'totalFormatted' => (string)($payload['totalFormatted'] ?? ('$' . number_format($totalUsd, 2))),
            'whatsappSent' => $whatsappSent,
            'emailSent' => $emailSent,
            'adminNotes' => ''
        ]);
        return $list;
    });

    if ($inserted) {
        if ($promoUsed !== '') {
            mosa_kv_mutate($vaultDir, 'promos', mosa_default_promos(), function ($promos) use ($promoUsed) {
                $list = is_array($promos) ? $promos : mosa_default_promos();
                foreach ($list as &$p) {
                    if (strtoupper((string)($p['code'] ?? '')) === $promoUsed) {
                        $p['uses'] = (int)($p['uses'] ?? 0) + 1;
                    }
                }
                return $list;
            });
        }

        mosa_kv_mutate($vaultDir, 'analytics', mosa_default_analytics(), function ($saved) use ($today, $totalUsd) {
            $base = mosa_default_analytics();
            $a = is_array($saved) ? $saved : $base;
            $a['daily'] = is_array($a['daily'] ?? null) ? $a['daily'] : [];
            $a['bookingsCompleted'] = (int)($a['bookingsCompleted'] ?? 0) + 1;
            if (!isset($a['daily'][$today]) || !is_array($a['daily'][$today])) {
                $a['daily'][$today] = ['views' => 0, 'modalOpens' => 0, 'bookings' => 0, 'revenueUsd' => 0];
            }
            $a['daily'][$today]['bookings'] = (int)$a['daily'][$today]['bookings'] + 1;
            $a['daily'][$today]['revenueUsd'] = round((float)$a['daily'][$today]['revenueUsd'] + $totalUsd, 2);
            $a['daily'] = mosa_prune_daily($a['daily']);
            return $a;
        });
    }

    mosa_send_json(['ok' => true, 'managed' => true, 'whatsappSent' => $whatsappSent, 'emailSent' => $emailSent]);
}

mosa_send_json(['ok' => false, 'error' => 'Not Found'], 404);
