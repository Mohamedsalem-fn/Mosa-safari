<?php
/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

declare(strict_types=1);

$reqPath = parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
if ($reqPath === '/admin' || strpos($reqPath, '/admin/') === 0 || strpos($reqPath, '/eria') === 0) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}

$allowedLangs = ['ar', 'en', 'it', 'ru'];
$lang = strtolower(trim((string)($_GET['lang'] ?? 'ar')));
if (!in_array($lang, $allowedLangs, true)) {
    $lang = 'ar';
}
$hasExplicitLang = isset($_GET['lang']) && in_array(strtolower((string)$_GET['lang']), $allowedLangs, true);

$metaMap = [
    'ar' => [
        'dir' => 'rtl',
        'locale' => 'ar_EG',
        'title' => 'شركة موسى سفاري شرم الشيخ | مواعيد الرحلات الرسمية وأماكن الاستلام (تبدأ من $10) — Mosa Safari 2026',
        'desc' => 'احجز رحلات سفاري شرم الشيخ الرسمية مع شركة موسى سفاري (mosasafari.com) بدءاً من $10 وتقييم 4.9★: رحلة الشروق (04:00 ص)، الرحلة الصباحية (08:00 ص)، الرحلات العادية (14:15)، ورحلة العشاء البدوية (15:30) عبر مسارين من الهضبة، خليج نعمة، قاعة المؤتمرات، خلف المطار، والغرقانة.',
        'og_title' => 'شركة موسى سفاري شرم الشيخ | رحلة الشروق، الصباحية، العادية، والعشاء (تبدأ من $10)'
    ],
    'en' => [
        'dir' => 'ltr',
        'locale' => 'en_US',
        'title' => 'Mosa Safari Sharm El Sheikh | Official Safari Schedule, Pickup Routes & Prices from $10 (4.9★) 2026',
        'desc' => 'Book Mosa Safari Sharm El Sheikh official desert tours from $10 (4.9★, 1,240+ reviews): Sunrise Safari (04:00 AM), Morning Safari (08:00 AM), Standard Afternoon (14:15), and Dinner Safari (15:30). Punctual pickup routes across Al-Hadaba, Naama Bay, Conference Center, Behind Airport & Al-Gharqana.',
        'og_title' => 'Mosa Safari Sharm El Sheikh | Sunrise, Morning, Afternoon & Dinner Safaris from $10'
    ],
    'it' => [
        'dir' => 'ltr',
        'locale' => 'it_IT',
        'title' => 'Mosa Safari Sharm El Sheikh | Orari Ufficiali, Punti di Ritiro & Prezzi da $10 (4.9★) 2026',
        'desc' => 'Prenota i 4 tour safari ufficiali Mosa Safari a Sharm El Sheikh da $10 (4.9★): Alba (04:00 AM), Mattina (08:00 AM), Pomeriggio (14:15) e Cena Beduina (15:30). Ritiro puntuale da Hadaba, Naama Bay, Centro Congressi, Zona Aeroporto e Al-Gharqana.',
        'og_title' => 'Mosa Safari Sharm El Sheikh | Alba, Mattina, Pomeriggio & Cena Beduina da $10'
    ],
    'ru' => [
        'dir' => 'ltr',
        'locale' => 'ru_RU',
        'title' => 'Mosa Safari Шарм-эль-Шейх | Официальное расписание, точки сбора и цены от $10 (4.9★) 2026',
        'desc' => 'Бронируйте 4 официальных сафари-тура Mosa Safari в Шарм-эль-Шейхе от $10 (4.9★): Рассвет (04:00), Утро (08:00), Дневное (14:15) и Ужин-сафари (15:30). Точное время выезда из Хадабы, Наама-Бей, Конференц-центра, За аэропортом и Эль-Гарканы.',
        'og_title' => 'Mosa Safari Шарм-эль-Шейх | Рассвет, Утро, День и Ужин-сафари от $10'
    ]
];

$m = $metaMap[$lang];
$canonicalUrl = $hasExplicitLang ? "https://mosasafari.com/?lang={$lang}" : 'https://mosasafari.com/';

$htmlFile = __DIR__ . '/index.html';
$html = is_file($htmlFile) ? file_get_contents($htmlFile) : '';
if ($html === false || $html === '') {
    http_response_code(500);
    echo 'Storefront template missing';
    exit;
}

$replaceOnce = static function (string $pattern, string $replacement, string $subject): string {
    return (string)preg_replace_callback($pattern, static fn() => $replacement, $subject, 1);
};

$safeTitle = htmlspecialchars($m['title'], ENT_QUOTES, 'UTF-8');
$safeDesc = htmlspecialchars($m['desc'], ENT_QUOTES, 'UTF-8');
$safeOgTitle = htmlspecialchars($m['og_title'], ENT_QUOTES, 'UTF-8');

$html = $replaceOnce('/<html\s+lang="[^"]*"\s+dir="[^"]*"/i', '<html lang="' . $lang . '" dir="' . $m['dir'] . '"', $html);
$html = $replaceOnce('/<title>.*?<\/title>/is', '<title>' . $safeTitle . '</title>', $html);
$html = $replaceOnce('/<meta\s+name="title"\s+content="[^"]*"/i', '<meta name="title" content="' . $safeTitle . '"', $html);
$html = $replaceOnce('/<meta\s+name="description"\s+content="[^"]*"/is', '<meta name="description" content="' . $safeDesc . '"', $html);
$html = $replaceOnce('/<link\s+rel="canonical"\s+href="[^"]*"/i', '<link rel="canonical" href="' . $canonicalUrl . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:url"\s+content="[^"]*"/i', '<meta property="og:url" content="' . $canonicalUrl . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:title"\s+content="[^"]*"/i', '<meta property="og:title" content="' . $safeOgTitle . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:description"\s+content="[^"]*"/is', '<meta property="og:description" content="' . $safeDesc . '"', $html);
$html = $replaceOnce('/<meta\s+property="og:locale"\s+content="[^"]*"/i', '<meta property="og:locale" content="' . $m['locale'] . '"', $html);
$html = $replaceOnce('/<meta\s+name="twitter:title"\s+content="[^"]*"/i', '<meta name="twitter:title" content="' . $safeOgTitle . '"', $html);
$html = $replaceOnce('/<meta\s+name="twitter:description"\s+content="[^"]*"/is', '<meta name="twitter:description" content="' . $safeDesc . '"', $html);

header('Content-Type: text/html; charset=utf-8');
header('Content-Language: ' . $lang);
header('Vary: Accept-Encoding');
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
echo $html;
