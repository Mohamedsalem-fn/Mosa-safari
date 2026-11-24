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
        'title' => 'موسى سفاري شرم الشيخ | رحلات سفاري وبيتش باجي ATV تبدأ من $10.13 (تقييم 4.9★) — Mosa Safari Sharm El Sheikh 2026',
        'desc' => 'احجز أفضل 8 رحلات سفاري وسياحة في شرم الشيخ مع موسى سفاري (mosasafari.com) بأسعار تبدأ من $10.13 وتقييم 4.9★: بيتش باجي ATV، جبال الصدى، محمية نبق، مراقبة النجوم، الوادي الملون ودهب مع الدفع عند الوصول.',
        'og_title' => 'موسى سفاري شرم الشيخ | رحلات سفاري وبيتش باجي ATV تبدأ من $10.13 (تقييم 4.9★)'
    ],
    'en' => [
        'dir' => 'ltr',
        'locale' => 'en_US',
        'title' => 'Mosa Safari Sharm El Sheikh | Desert Safari, ATV Quad & Tourism Tours from $10.13 (4.9★) 2026',
        'desc' => 'Book top-rated Sharm El Sheikh desert safari & Red Sea excursions from $10.13 (4.9★, 1,240+ reviews): Sunrise & Sunset ATV Quad in Echo Mountains, Dune Buggy, Nabq Reserve, Stargazing BBQ, Colored Canyon & Dahab. Free hotel pickup & Pay on Arrival.',
        'og_title' => 'Mosa Safari Sharm El Sheikh | ATV Quad & Desert Safari Tours from $10.13 (4.9★)'
    ],
    'it' => [
        'dir' => 'ltr',
        'locale' => 'it_IT',
        'title' => 'Mosa Safari Sharm El Sheikh | Escursioni Deserto, Quad ATV & Buggy da $10.13 (4.9★) 2026',
        'desc' => 'Prenota gli 8 migliori tour safari e turismo a Sharm El Sheikh da $10.13 (voto 4.9★, 1.240+ recensioni): Quad ATV alba e tramonto nelle Montagne dell\'Eco, Dune Buggy, Riserva di Nabq, Cena Beduina, Canyon Colorato e Dahab. Ritiro in hotel e pagamento all\'arrivo.',
        'og_title' => 'Mosa Safari Sharm El Sheikh | Safari Deserto & Quad ATV da $10.13 (4.9★)'
    ],
    'ru' => [
        'dir' => 'ltr',
        'locale' => 'ru_RU',
        'title' => 'Mosa Safari Шарм-эль-Шейх | Сафари, Квадроциклы ATV и Экскурсии от $10.13 (4.9★) 2026',
        'desc' => 'Забронируйте 8 лучших сафари-туров и экскурсий в Шарм-эль-Шейхе от $10.13 (рейтинг 4.9★, 1 240+ отзывов): квадроциклы на рассвете и закате в Горах Эхо, багги, заповедник Набк, ужин бедуинов и звёзды, Цветной каньон и Дахаб. Трансфер и оплата на месте.',
        'og_title' => 'Mosa Safari Шарм-эль-Шейх | Сафари-туры и квадроциклы от $10.13 (4.9★)'
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
