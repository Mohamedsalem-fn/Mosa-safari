# Mosa Safari (`mosasafari.com`) — Sharm El Sheikh & Sinai Desert Safari Platform

A modern, multilingual, launch-ready web platform for booking luxury desert safari experiences in Sharm El Sheikh, South Sinai. Designed with a modular vanilla ES Modules architecture, Tailwind CSS theming, multi-currency conversion, a 6-step booking flow, tour comparison, and an integrated 4-language MOSA AI concierge widget.

---

## Project Architecture

```text
Mosa-safari/
├── index.html                        # Clean semantic entry point (SEO, JSON-LD, UI layout)
├── package.json                      # Project metadata, dev server, and JS syntax check scripts
├── netlify.toml                      # Static hosting headers, caching, and security policy
├── robots.txt                        # Search engine crawler directives
├── sitemap.xml                       # XML sitemap for production indexing
├── .gitignore                        # Repository ignore rules
└── assets/
    ├── css/
    │   └── styles.css                # Custom keyframe animations, scrollbars, reveal transitions
    ├── images/
    │   ├── logo.jpg                  # Brand logo
    │   ├── hero-atv-sunset.jpg       # Hero & ATV Quad sunset photography
    │   ├── safari-nabq-buggy.jpg     # Nabq Reserve & Dune Buggy photography
    │   ├── safari-night-stars.jpg    # Night safari & stargazing photography
    │   └── safari-canyon-dahab.jpg   # Colored Canyon & Dahab photography
    └── js/
        ├── main.js                   # Application entry point & DOM event bindings
        ├── state.js                  # Reactive app state, currency formatting, storage helpers
        ├── tailwind-config.js        # Custom Tailwind theme (champagne, copper, sea, carbon)
        ├── data/
        │   ├── trips.js              # HERO_SLIDES & SAFARI_TRIPS catalog (single source of truth)
        │   └── i18n.js               # Translations for Arabic (ar), English (en), Italian (it), Russian (ru)
        └── modules/
            ├── ui.js                 # Particles canvas, scroll reveal, counters, toasts, language detection
            ├── trips.js              # Dynamic trip grid rendering, filtering, sorting, favorites, comparison
            ├── booking.js            # 6-step booking modal, pricing, group & MOSA20 promo discounts
            └── ai-assistant.js       # MOSA AI floating concierge widget & quick prompts
```

---

## Key Features

- **4-Language Support (`ar`, `en`, `it`, `ru`):** Automatic RTL/LTR direction switching, country-based language detection, and persistent user preference.
- **Multi-Currency Pricing (`USD`, `EGP`, `EUR`):** Live price conversion across trip cards, comparison tables, and booking totals.
- **6-Step Interactive Booking Modal:** City selection, multi-tour selection, traveler details validation, guest count & vehicle type, hotel pickup & payment method (Pay on Arrival / Online), and promo code (`MOSA20` for 20% off, plus automatic 10% group discount for 5+ guests).
- **Tour Comparison & Favorites:** Side-by-side comparison of up to 3 safari programs.
- **MOSA AI Concierge Widget:** Interactive 4-language assistant with quick-action chips and direct WhatsApp handoff.
- **SEO & Structured Data Ready:** Embedded JSON-LD schemas (`TravelAgency`, `ItemList`, `FAQPage`, `BreadcrumbList`), Open Graph metadata, `robots.txt`, and `sitemap.xml`.

---

## Prerequisites & Local Setup

- **Python 3** (for zero-dependency local HTTP serving) or **Node.js 18+** (for syntax verification and `serve`).

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

### Verify JavaScript Modules

```bash
npm run check
```

---

## Customization & Scaling Guide

- **Add or Edit Safari Programs:** Update `SAFARI_TRIPS` in `assets/js/data/trips.js`. All trip cards, booking step 2 options, and comparison tables render automatically from this array.
- **Add or Update Translations:** Edit `I18N`, `BADGE_I18N`, `STEP_TITLES_I18N`, and `AI_GREETINGS` in `assets/js/data/i18n.js`.
- **Replace or Optimize Images:** Place new images in `assets/images/` and reference them in `index.html` or `assets/js/data/trips.js`.
- **Adjust Theme Colors / Typography:** Edit `assets/js/tailwind-config.js` and `assets/css/styles.css`.

---

## Deployment

The project is a static web application with zero build step required:

- **Netlify:** Connect the GitHub repository; `netlify.toml` is preconfigured with security and asset-caching headers.
- **Vercel / GitHub Pages / Cloudflare Pages:** Set the publish directory to `/` (root).

---

## Credits / Author

- **Author:** Mohamed Salem — *Expert AI Engineer & Automation Architect*
- **Focus:** AI Engineering | Automation | Agentic Systems
- **Copyright:** © 2026 Mohamed Salem. All Rights Reserved.
