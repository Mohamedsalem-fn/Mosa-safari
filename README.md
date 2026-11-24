# Mosa Safari (`mosasafari.com`) — Sharm El Sheikh & Sinai Desert Safari Platform

A modern, multilingual, launch-ready web platform for booking luxury desert safari experiences in Sharm El Sheikh, South Sinai. Designed with a modular vanilla ES Modules architecture, Tailwind CSS theming, Anime.js v4 cinematic animations, multi-currency conversion, a streamlined 5-step booking flow with direct WhatsApp confirmation, tour comparison, and an integrated 4-language MOSA AI concierge widget.

---

## Project Architecture

```text
Mosa-safari/
├── index.html                        # Clean Arabic-first semantic entry point (SEO, JSON-LD, UI layout)
├── admin.html                        # Isolated Executive Admin Dashboard UI (Chart.js & CRM modals)
├── package.json                      # Project metadata, dev server, CSS build, and JS check scripts
├── tailwind.config.js                # Tailwind CSS configuration (custom theme & content paths)
├── netlify.toml                      # Static hosting headers, caching, and security policy
├── robots.txt                        # Search engine crawler directives
├── sitemap.xml                       # XML sitemap for production indexing
├── .gitignore                        # Repository ignore rules
├── cloudflare/
│   ├── wrangler.jsonc                # Public storefront Worker configuration (ASSETS + MOSA_KV + vars)
│   ├── package.json                  # Sync, local dev, and Wrangler deploy scripts (storefront only)
│   ├── src/index.js                  # Public Worker API (/api/public/config, /api/track, /api/notify-booking)
│   └── public/                       # Storefront production static assets (zero admin files)
├── cloudflare-admin/
│   ├── wrangler.jsonc                # Isolated hardened Admin Worker configuration (run_worker_first + MOSA_KV)
│   ├── package.json                  # Sync & deploy scripts for isolated admin Worker (mosa-safari-admin)
│   ├── src/index.js                  # Hardened Admin API (HttpOnly cookies, CSRF, IP rate limit, CSP, HSTS)
│   └── public/                       # Isolated admin static assets + strict Disallow robots.txt
├── hostinger/
│   ├── shared/                       # Shared PHP 8 private vault, flock KV store, crypto, Green API & Resend
│   ├── mosasafari.com/               # Hostinger public_html package (PHP SEO pre-renderer, API, .htaccess)
│   └── eria.mosasafari.com/          # Hostinger isolated admin subdomain package (bcrypt, CSRF, hardened .htaccess)
├── scripts/
│   └── build-hostinger.sh            # Turnkey CSS/JS/PHP check & Hostinger ZIP packager (dist/hostinger/)
├── HOSTINGER_DEPLOY.md               # Step-by-step Hostinger deployment & Search Console guide
├── manifest.webmanifest              # Progressive Web App manifest for mosasafari.com
├── netlify/
│   └── functions/
│       └── notify-booking.js         # Serverless webhook for Green API WhatsApp & Email dispatch
└── assets/
    ├── css/
    │   ├── input.css                 # Tailwind CSS entry source
    │   ├── tailwind.css              # Pre-compiled & minified Tailwind CSS bundle (zero CDN dependency)
    │   ├── styles.css                # Custom keyframe animations, scrollbars, reveal transitions
    │   └── admin.css                 # Luxury executive dashboard glassmorphism & Chart.js styling
    ├── images/
    │   ├── logo.jpg                  # Brand logo
    │   ├── hero-atv-sunset.jpg       # Hero & ATV Quad sunset photography
    │   ├── safari-nabq-buggy.jpg     # Nabq Reserve & Dune Buggy photography
    │   ├── safari-night-stars.jpg    # Night safari & stargazing photography
    │   └── safari-canyon-dahab.jpg   # Colored Canyon & Dahab photography
    └── js/
        ├── main.js                   # Application entry point, live KV config sync & tracking beacon
        ├── admin.js                  # Executive Admin Dashboard logic (KPIs, CRM, Tours, Promos, Settings)
        ├── cinematic.js              # Anime.js v4 motion layer, 3D card tilt & magnetic controls
        ├── state.js                  # Reactive app state, live exchange rate fetcher, storage helpers
        ├── data/
        │   ├── trips.js              # HERO_SLIDES & SAFARI_TRIPS catalog (4 languages: ar, en, it, ru)
        │   └── i18n.js               # Complete translations for Arabic, English, Italian, Russian
        └── modules/
            ├── ui.js                 # Particles canvas, scroll reveal, counters, toasts, language switching
            ├── trips.js              # Dynamic trip grid, category filtering, live price table & comparison
            ├── booking.js            # Upgraded 5-step booking UI, Pay on Arrival + Visa placeholder gateway
            ├── notifications.js      # Green API WhatsApp owner alerts & Resend customer email dispatch
            ├── mobile-app.js         # Dedicated luxury native-app mobile shell (< 640px)
            └── ai-assistant.js       # MOSA AI floating concierge widget & mobile bottom sheet
```

---

## Key Features

- **Full 4-Language Support (`ar`, `en`, `it`, `ru`):** Clean Arabic-first default HTML with zero flash of unstyled/wrong-language text, full RTL/LTR switching, and complete translations across all 8 trip titles, descriptions, FAQs, booking steps, and AI quick chips.
- **Smart Safari Category Filtering:** Filter the 8 Sharm El Sheikh tours by adventure type (`ATV & Buggy`, `Nabq Reserve`, `Night & Stars`, `Canyon & Dahab`) from either the hero search console or the filter bar.
- **Live Real-Time Multi-Currency Pricing (`USD`, `EGP`, `EUR`):** Automatically fetches today's live `USD -> EGP` and `USD -> EUR` exchange rates from multi-CDN currency APIs (`open.er-api.com` and `@fawazahmed0/currency-api`) with local caching and offline fallback, dynamically converting all trip cards, the 8-tour price table, comparison modal, booking totals, and MOSA AI concierge quotes.
- **Streamlined 5-Step Interactive Booking Modal:** Direct tour selection, traveler details validation, guest count & localized vehicle type, hotel pickup & preferred tour date, promo code validation (`MOSA20` for 20% off + automatic 10% group discount for 5+ guests), and instant WhatsApp booking handoff.
- **Anime.js v4 Cinematic Motion Layer (`assets/js/cinematic.js`):** Staggered hero and card entrances, 3D interactive card tilt, magnetic header buttons, and scroll-reactive floating glass navigation.
- **Isolated Hardened Admin Worker (`mosa-safari-admin`) & Cloudflare KV Persistence:** Physically separated from the public storefront Worker (`mosa-safari` serves zero admin routes or secrets). Protected by a dedicated `ADMIN_JWT_SECRET`, `__Host-mosa_admin_session` `HttpOnly` + `Secure` + `SameSite=Strict` cookies, strict `X-CSRF-Token` & `Origin` checks, KV-backed IP brute-force rate limiting (5 fails / 15m), server-side session revocation (`jti`), strict CSP (no inline scripts), HSTS, `X-Frame-Options: DENY`, and `noindex` headers. Features real-time Chart.js analytics, Bookings CRM with UTF-8 CSV export, live Tours/Promos/Settings sync via `MOSA_KV`, Customers LTV directory, and Audit Log.
- **Multilingual SEO & Google Rich Results (`ar`, `en`, `it`, `ru`):** Comprehensive 4-language SEO metadata with dynamic `?lang=` URL routing (`hreflang` + canonical/Open Graph synchronization in `ui.js`), unified JSON-LD `@graph` schemas (`WebSite`, `TravelAgency`/`LocalBusiness`, dual-typed `Product` + `TouristTrip` `ItemList` for all 8 tours with USD offers & star ratings, 6-question `FAQPage`, `BreadcrumbList`), crawlable pre-rendered price rows, `robots.txt`, and `hreflang`/Image XML `sitemap.xml`.

---

## Prerequisites & Local Setup

- **Python 3** (for zero-dependency local HTTP serving) or **Node.js 18+** (for Tailwind CSS compilation, syntax verification, and `serve`).

### Run Locally

```bash
# Option 1: Using Python built-in HTTP server
npm run dev
# or directly:
python3 -m http.server 8080

# Option 2: Using Node.js serve
npm run preview
```

Then open `http://localhost:8080` in your browser.

### Build CSS & Verify JavaScript Modules

```bash
npm run build:css
npm run check
```

---

## Credits / Author

- **Author:** Mohamed Salem — *Expert AI Engineer & Automation Architect*
- **Focus:** AI Engineering | Automation | Agentic Systems
- **Copyright:** © 2026 Mohamed Salem. All Rights Reserved.
