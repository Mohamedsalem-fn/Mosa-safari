<?php
/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

declare(strict_types=1);

$reqPath = parse_url((string)($_SERVER['REQUEST_URI'] ?? '/tour.html'), PHP_URL_PATH) ?: '/tour.html';
$tourId = strtolower(trim((string)($_GET['id'] ?? '')));
if ($tourId === '' && preg_match('#^/tour/([a-z0-9_-]+)/?$#i', $reqPath, $m)) {
    $tourId = strtolower($m[1]);
}

$allowedLangs = ['ar', 'en', 'it', 'ru'];
$lang = strtolower(trim((string)($_GET['lang'] ?? 'ar')));
if (!in_array($lang, $allowedLangs, true)) {
    $lang = 'ar';
}

$toursMeta = [
    'mosa-sunrise' => [
        'img' => 'https://mosasafari.com/assets/images/safari-sunrise.jpg',
        'ar' => ['title' => '🌅 رحلة الشروق — شرم الشيخ (4–5 ساعات) | موسى سفاري', 'desc' => 'تفاصيل رحلة الشروق (4–5 ساعات) بالبيتش باجي وركوب الجمال والشاي البدوي عبر مسارين من الهضبة وخليج نعمة وقاعة المؤتمرات وخلف المطار والغرقانة.'],
        'en' => ['title' => '🌅 Sunrise Safari Sharm El Sheikh (4–5 Hours) | Mosa Safari', 'desc' => 'Complete 4–5 hour Sunrise Safari itinerary with ATV Quad riding, camel trek, and 2-route pickup times starting 04:00 AM.'],
        'it' => ['title' => '🌅 Safari all\'Alba Sharm El Sheikh (4–5 Ore) | Mosa Safari', 'desc' => 'Itinerario completo di 4–5 ore con Quad ATV, cammelli e ritiro puntuale dalle 04:00 AM.'],
        'ru' => ['title' => '🌅 Рассветное сафари Шарм-эль-Шейх (4–5 часов) | Mosa Safari', 'desc' => 'Полная программа 4–5 часов на квадроциклах и верблюдах с выездом от 04:00.']
    ],
    'mosa-morning' => [
        'img' => 'https://mosasafari.com/assets/images/safari-morning.jpg',
        'ar' => ['title' => '☀️ الرحلة الصباحية — شرم الشيخ (4–5 ساعات) | موسى سفاري', 'desc' => 'تفاصيل الرحلة الصباحية (4–5 ساعات) بالبيتش باجي والباجي الصحراوي عبر مسارين الساعة 08:00 ص من شرم الشيخ.'],
        'en' => ['title' => '☀️ Morning Safari Sharm El Sheikh (4–5 Hours) | Mosa Safari', 'desc' => 'Full 4–5 hour Morning Safari combining ATV Quads and Dune Buggies with pickups from 08:00 AM across 2 routes.'],
        'it' => ['title' => '☀️ Safari del Mattino Sharm El Sheikh (4–5 Ore) | Mosa Safari', 'desc' => 'Tour completo di 4–5 ore in Quad ATV e Dune Buggy dalle 08:00 AM.'],
        'ru' => ['title' => '☀️ Утреннее сафари Шарм-эль-Шейх (4–5 часов) | Mosa Safari', 'desc' => 'Утренний тур 4–5 часов на квадроциклах и багги с выездом от 08:00.']
    ],
    'mosa-standard' => [
        'img' => 'https://mosasafari.com/assets/images/safari-standard.jpg',
        'ar' => ['title' => '🌄 الرحلات العادية — شرم الشيخ (4–5 ساعات) | موسى سفاري', 'desc' => 'تفاصيل الرحلات العادية بعد الظهر (4–5 ساعات) وسط جبال الصدى والقرية البدوية تحرك 14:15 على مسارين في شرم الشيخ.'],
        'en' => ['title' => '🌄 Standard Afternoon Safari Sharm El Sheikh (4–5 Hours) | Mosa Safari', 'desc' => 'Classic 4–5 hour Echo Mountains desert safari starting 14:15 across Route 1 & Route 2.'],
        'it' => ['title' => '🌄 Safari Pomeridiano Sharm El Sheikh (4–5 Ore) | Mosa Safari', 'desc' => 'Safari classico di 4–5 ore nelle Montagne dell\'Eco con partenza alle 14:15.'],
        'ru' => ['title' => '🌄 Дневное сафари Шарм-эль-Шейх (4–5 часов) | Mosa Safari', 'desc' => 'Классическое дневное сафари 4–5 часов в горах Эхо с выездом в 14:15.']
    ],
    'mosa-dinner' => [
        'img' => 'https://mosasafari.com/assets/images/safari-dinner.jpg',
        'ar' => ['title' => '🌙 رحلة العشاء والغروب — شرم الشيخ (4–5 ساعات) | موسى سفاري', 'desc' => 'تفاصيل رحلة العشاء الساحرة (4–5 ساعات): بيتش باجي عند الغروب، جمال، عشاء بدوي باربكيو وعروض تحت النجوم تحرك 15:30 – 16:15.'],
        'en' => ['title' => '🌙 Dinner Safari, BBQ & Show Sharm El Sheikh (4–5 Hours) | Mosa Safari', 'desc' => 'Full 4–5 hour sunset desert safari with BBQ buffet dinner and live Bedouin show departing 15:30–16:15.'],
        'it' => ['title' => '🌙 Safari con Cena e Show Sharm El Sheikh (4–5 Ore) | Mosa Safari', 'desc' => 'Esperienza serale completa di 4–5 ore con cena BBQ beduina e spettacolo sotto le stelle.'],
        'ru' => ['title' => '🌙 Ужин-сафари и шоу Шарм-эль-Шейх (4–5 часов) | Mosa Safari', 'desc' => 'Вечерний тур 4–5 часов: закат на квадроциклах, ужин-барбекю и восточное шоу под звёздами.']
    ]
];

if (!isset($toursMeta[$tourId])) {
    $tourId = 'mosa-sunrise';
}

$tMeta = $toursMeta[$tourId];
$m = $tMeta[$lang];
$dir = $lang === 'ar' ? 'rtl' : 'ltr';
$canonicalUrl = 'https://mosasafari.com/tour.html?id=' . urlencode($tourId);

$htmlFile = __DIR__ . '/tour.html';
$html = is_file($htmlFile) ? file_get_contents($htmlFile) : '';
if ($html === false || $html === '') {
    http_response_code(500);
    echo 'Tour template missing';
    exit;
}

$replaceOnce = static function (string $pattern, string $replacement, string $subject): string {
    return (string)preg_replace_callback($pattern, static fn() => $replacement, $subject, 1);
};

$safeTitle = htmlspecialchars($m['title'], ENT_QUOTES, 'UTF-8');
$safeDesc = htmlspecialchars($m['desc'], ENT_QUOTES, 'UTF-8');
$safeImg = htmlspecialchars($tMeta['img'], ENT_QUOTES, 'UTF-8');

$html = $replaceOnce('/<html\s+lang="[^"]*"\s+dir="[^"]*"/i', '<html lang="' . $lang . '" dir="' . $dir . '"', $html);
$html = $replaceOnce('/<title>.*?<\/title>/is', '<title>' . $safeTitle . '</title>', $html);
$html = $replaceOnce('/<meta\s+name="title"\s+content="[^"]*"/i', '<meta name="title" content="' . $safeTitle . '"', $html);
$html = $replaceOnce('/<meta\s+name="description"\s+content="[^"]*"/is', '<meta name="description" content="' . $safeDesc . '"', $html);
$html = $replaceOnce('/<link\s+rel="canonical"\s+href="[^"]*"/i', '<link rel="canonical" href="' . $canonicalUrl . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:url"\s+content="[^"]*"/i', '<meta property="og:url" content="' . $canonicalUrl . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:title"\s+content="[^"]*"/i', '<meta property="og:title" content="' . $safeTitle . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:description"\s+content="[^"]*"/is', '<meta property="og:description" content="' . $safeDesc . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:image"\s+content="[^"]*"/i', '<meta property="og:image" content="' . $safeImg . '"', $html);
$html = $replaceOnce('/<meta\s+name="twitter:title"\s+content="[^"]*"/i', '<meta name="twitter:title" content="' . $safeTitle . '"', $html);
$html = $replaceOnce('/<meta\s+name="twitter:description"\s+content="[^"]*"/is', '<meta name="twitter:description" content="' . $safeDesc . '"', $html);
$html = $replaceOnce('/<meta\s+name="twitter:image"\s+content="[^"]*"/i', '<meta name="twitter:image" content="' . $safeImg . '"', $html);

header('Content-Type: text/html; charset=utf-8');
header('Content-Language: ' . $lang);
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
echo $html;
