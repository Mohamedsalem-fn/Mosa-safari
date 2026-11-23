/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "../data/trips.js";
import { I18N, BADGE_I18N } from "../data/i18n.js";
import { state, fmtPrice, getActiveRateText } from "../state.js";
import { getTripTitle, getTripDuration } from "./trips.js";
import { showToast } from "./ui.js";

const MOBILE_UI_I18N = {
    ar: {
        location: "شرم الشيخ · جنوب سيناء",
        hero_kicker: "خصم 20% بكود MOSA20",
        hero_h1: "اكتشف سحر صحراء شرم الشيخ",
        hero_sub: "رحلات سفاري فاخرة · دفع عند الوصول · استلام مجاني من الفندق",
        cta_explore: "احجز رحلتك الآن",
        cta_ai: "اسأل MOSA AI",
        sec_stories: "استكشف حسب المغامرة",
        sec_featured: "الأكثر طلباً في شرم الشيخ",
        sec_all: "جميع برامج السفاري",
        sec_why: "لماذا موسى سفاري؟",
        sec_faq: "الأسئلة الشائعة",
        promo_title: "كود خصم حصري 20%",
        promo_sub: "اضغط لنسخ الكود واستخدامه عند الحجز",
        promo_copied: "تم نسخ كود الخصم MOSA20 ✓",
        trust_1: "دفع عند الوصول",
        trust_2: "إلغاء مجاني",
        trust_3: "توصيل للفندق",
        book_short: "احجز",
        nav_home: "الرئيسية",
        nav_tours: "الرحلات",
        nav_ai: "MOSA AI",
        nav_book: "احجز الآن",
        cat_all: "الكل",
        cat_atv: "بيتش باجي",
        cat_nabq: "محمية نبق",
        cat_night: "نجوم وليل",
        cat_canyon: "الوادي الملون"
    },
    en: {
        location: "Sharm El Sheikh · South Sinai",
        hero_kicker: "20% OFF with code MOSA20",
        hero_h1: "Discover Sharm's Desert Magic",
        hero_sub: "Luxury Safaris · Pay on Arrival · Free Hotel Pickup",
        cta_explore: "Book Your Safari",
        cta_ai: "Ask MOSA AI",
        sec_stories: "Explore by Experience",
        sec_featured: "Trending in Sharm El Sheikh",
        sec_all: "All Safari Programs",
        sec_why: "Why Mosa Safari?",
        sec_faq: "Quick FAQ",
        promo_title: "Exclusive 20% Promo Code",
        promo_sub: "Tap to copy & apply at checkout",
        promo_copied: "Promo code MOSA20 copied ✓",
        trust_1: "Pay on Arrival",
        trust_2: "Free Cancel",
        trust_3: "Hotel Pickup",
        book_short: "Book",
        nav_home: "Home",
        nav_tours: "Tours",
        nav_ai: "MOSA AI",
        nav_book: "Book Now",
        cat_all: "All",
        cat_atv: "ATV Quad",
        cat_nabq: "Nabq VIP",
        cat_night: "Stargazing",
        cat_canyon: "Canyon"
    },
    it: {
        location: "Sharm El Sheikh · Sinai del Sud",
        hero_kicker: "20% Sconto con codice MOSA20",
        hero_h1: "Scopri la Magia del Deserto",
        hero_sub: "Safari di Lusso · Paga all'Arrivo · Transfer Incluso",
        cta_explore: "Prenota Ora",
        cta_ai: "Chiedi a MOSA AI",
        sec_stories: "Esplora per Esperienza",
        sec_featured: "Più Richiesti a Sharm",
        sec_all: "Tutti i Tour Safari",
        sec_why: "Perché Mosa Safari?",
        sec_faq: "Domande Frequenti",
        promo_title: "Codice Sconto 20%",
        promo_sub: "Tocca per copiare e usare al checkout",
        promo_copied: "Codice MOSA20 copiato ✓",
        trust_1: "Paga all'Arrivo",
        trust_2: "Cancell. Gratuita",
        trust_3: "Ritiro Hotel",
        book_short: "Prenota",
        nav_home: "Home",
        nav_tours: "Tour",
        nav_ai: "MOSA AI",
        nav_book: "Prenota",
        cat_all: "Tutti",
        cat_atv: "Quad ATV",
        cat_nabq: "Riserva Nabq",
        cat_night: "Stelle",
        cat_canyon: "Canyon"
    },
    ru: {
        location: "Шарм-эль-Шейх · Южный Синай",
        hero_kicker: "Скидка 20% по коду MOSA20",
        hero_h1: "Магия пустыни Шарм-эль-Шейха",
        hero_sub: "Премиум сафари · Оплата при получении · Трансфер",
        cta_explore: "Забронировать тур",
        cta_ai: "Спросить MOSA AI",
        sec_stories: "Категории сафари",
        sec_featured: "Популярные в Шарме",
        sec_all: "Все сафари-программы",
        sec_why: "Почему Mosa Safari?",
        sec_faq: "Частые вопросы",
        promo_title: "Промокод на скидку 20%",
        promo_sub: "Нажмите, чтобы скопировать код",
        promo_copied: "Промокод MOSA20 скопирован ✓",
        trust_1: "Оплата на месте",
        trust_2: "Беспл. отмена",
        trust_3: "Трансфер",
        book_short: "Бронь",
        nav_home: "Главная",
        nav_tours: "Туры",
        nav_ai: "MOSA AI",
        nav_book: "Бронь",
        cat_all: "Все",
        cat_atv: "Квадроциклы",
        cat_nabq: "Набк VIP",
        cat_night: "Звёзды",
        cat_canyon: "Каньон"
    }
};

export function copyMosaPromo() {
    const m = MOBILE_UI_I18N[state.lang] || MOBILE_UI_I18N.en;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("MOSA20").catch(() => {});
    }
    state.booking.promoCode = "MOSA20";
    showToast(m.promo_copied);
}

export function setMobileCategory(cat) {
    state.categoryFilter = cat;
    renderMobileApp();
    document.getElementById("m-tours-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function setMobileSort(val) {
    state.sortBy = val;
    renderMobileApp();
}

export function toggleMobileFaq(btn) {
    const body = btn.nextElementSibling;
    const icon = btn.querySelector("svg");
    if (body) body.classList.toggle("hidden");
    if (icon) icon.classList.toggle("rotate-180");
}

export function renderMobileApp() {
    const root = document.getElementById("mobile-app-shell");
    if (!root) return;

    const lang = state.lang || "ar";
    const m = MOBILE_UI_I18N[lang] || MOBILE_UI_I18N.en;
    const g = I18N[lang] || I18N.en;

    const stories = [
        { id: "all", label: m.cat_all, img: "assets/images/hero-atv-sunset.jpg" },
        { id: "atv", label: m.cat_atv, img: "assets/images/hero-atv-sunset.jpg" },
        { id: "nabq", label: m.cat_nabq, img: "assets/images/safari-nabq-buggy.jpg" },
        { id: "night", label: m.cat_night, img: "assets/images/safari-night-stars.jpg" },
        { id: "canyon", label: m.cat_canyon, img: "assets/images/safari-canyon-dahab.jpg" }
    ];

    const activeTrips = SAFARI_TRIPS.filter(t => t.active !== false);
    const trendingTrips = [activeTrips[2], activeTrips[4], activeTrips[7], activeTrips[1]].filter(Boolean);

    let filtered = [...activeTrips];
    if (state.categoryFilter !== "all") {
        filtered = filtered.filter(t => t.category === state.categoryFilter);
    }
    if (state.sortBy === "price-asc") filtered.sort((a, b) => a.fromPrice - b.fromPrice);
    if (state.sortBy === "price-desc") filtered.sort((a, b) => b.fromPrice - a.fromPrice);
    if (state.sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

    const ratePill = state.currency !== "USD"
        ? `<span class="px-2 py-0.5 rounded-full bg-sea/20 border border-sea/40 text-sea text-[10px] font-black">${getActiveRateText()}</span>`
        : "";

    root.innerHTML = `
        <!-- 1. IMMERSIVE FULL-BLEED EDITORIAL MOBILE HERO -->
        <section id="m-hero" class="relative w-full overflow-hidden rounded-b-[2rem] bg-carbon-950 text-white shadow-2xl">
            <img src="assets/images/hero-atv-sunset.jpg" alt="Mosa Safari Sharm El Sheikh"
                class="absolute inset-0 w-full h-full object-cover opacity-80 scale-105" />
            <div class="absolute inset-0 bg-gradient-to-b from-carbon-950/85 via-carbon-950/35 to-carbon-950"></div>

            <!-- Transparent Integrated App Top Bar -->
            <header class="relative z-20 flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
                <a href="#m-hero" class="flex items-center shrink-0 bg-[#F6F3EC]/95 px-2.5 py-1 rounded-xl shadow-md">
                    <img src="assets/images/logo.svg" alt="Mosa Safari" class="h-7 w-auto object-contain" />
                </a>
                <div class="flex items-center gap-1.5">
                    <select onchange="handleMobileLangChange(this.value)" aria-label="Language"
                        class="m-glass-pill px-2 py-1.5 rounded-xl text-[11px] font-extrabold text-white focus:outline-none">
                        <option value="ar" ${lang === "ar" ? "selected" : ""} class="text-carbon-950">AR</option>
                        <option value="en" ${lang === "en" ? "selected" : ""} class="text-carbon-950">EN</option>
                        <option value="it" ${lang === "it" ? "selected" : ""} class="text-carbon-950">IT</option>
                        <option value="ru" ${lang === "ru" ? "selected" : ""} class="text-carbon-950">RU</option>
                    </select>
                    <select onchange="handleMobileCurrencyChange(this.value)" aria-label="Currency"
                        class="m-glass-pill px-2 py-1.5 rounded-xl text-[11px] font-extrabold text-champagne focus:outline-none">
                        <option value="USD" ${state.currency === "USD" ? "selected" : ""} class="text-carbon-950">$ USD</option>
                        <option value="EGP" ${state.currency === "EGP" ? "selected" : ""} class="text-carbon-950">ج.م EGP</option>
                        <option value="EUR" ${state.currency === "EUR" ? "selected" : ""} class="text-carbon-950">€ EUR</option>
                    </select>
                    <button type="button" onclick="toggleMobileTheme()" aria-label="Theme"
                        class="m-glass-pill w-8 h-8 rounded-xl grid place-items-center text-champagne">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    </button>
                </div>
            </header>

            <!-- Hero Editorial Content -->
            <div class="relative z-10 px-4 pt-6 pb-5 space-y-3">
                <div class="flex flex-wrap items-center gap-1.5">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-champagne/20 border border-champagne/40 backdrop-blur-md text-champagne text-[10.5px] font-black">
                        <span class="w-1.5 h-1.5 rounded-full bg-sea animate-ping"></span>
                        ${m.hero_kicker}
                    </span>
                    <span class="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10.5px] font-extrabold">4.9 ★ (1,240+)</span>
                    ${ratePill}
                </div>

                <div>
                    <div class="text-[11px] font-bold text-champagne/90 tracking-wide">${m.location}</div>
                    <h1 class="text-2xl font-black leading-tight mt-0.5 text-white">${m.hero_h1}</h1>
                    <p class="text-xs text-white/80 mt-1.5 leading-relaxed">${m.hero_sub}</p>
                </div>

                <!-- Dual Action Pills -->
                <div class="grid grid-cols-12 gap-2 pt-1">
                    <button type="button" onclick="openBookingModal()"
                        class="col-span-7 py-3 px-3 rounded-2xl bg-champagne text-carbon-950 font-black text-xs shadow-lg shadow-champagne/30 flex items-center justify-center gap-1.5 active:scale-95 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                        <span>${m.cta_explore}</span>
                    </button>
                    <button type="button" onclick="toggleAiWidget(true)"
                        class="col-span-5 py-3 px-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
                        <span>${m.cta_ai}</span>
                    </button>
                </div>

                <!-- Micro Trust Strip -->
                <div class="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/15 text-[10px] font-bold text-white/85 text-center">
                    <div class="py-1 rounded-lg bg-white/5">✓ ${m.trust_1}</div>
                    <div class="py-1 rounded-lg bg-white/5">✓ ${m.trust_2}</div>
                    <div class="py-1 rounded-lg bg-white/5">✓ ${m.trust_3}</div>
                </div>
            </div>
        </section>

        <!-- 2. SAFARI EXPERIENCE STORIES (Circular Avatar Strip) -->
        <section class="px-4 pt-5">
            <div class="flex items-center justify-between mb-2.5">
                <h2 class="text-sm font-black">${m.sec_stories}</h2>
                <span class="text-[11px] font-bold text-champagne-dark dark:text-champagne">8 ${lang === "ar" ? "برامج" : "Tours"}</span>
            </div>
            <div class="m-hscroll flex items-center gap-3 overflow-x-auto pb-1">
                ${stories.map(s => {
                    const active = state.categoryFilter === s.id;
                    return `<button type="button" onclick="setMobileCategory('${s.id}')" class="flex flex-col items-center gap-1.5 shrink-0 w-[4.4rem] active:scale-95 transition">
                        <div class="w-14 h-14 rounded-2xl p-[2px] ${active ? 'bg-gradient-to-tr from-champagne via-copper to-sea shadow-md' : 'bg-carbon-900/15 dark:bg-white/15'}">
                            <img src="${s.img}" alt="${s.label}" class="w-full h-full object-cover rounded-[14px]" />
                        </div>
                        <span class="text-[11px] font-extrabold truncate max-w-full ${active ? 'text-champagne-dark dark:text-champagne' : 'opacity-75'}">${s.label}</span>
                    </button>`;
                }).join("")}
            </div>
        </section>

        <!-- 3. TRENDING HORIZONTAL SNAP CAROUSEL -->
        <section class="pt-5">
            <div class="px-4 flex items-center justify-between mb-2.5">
                <h2 class="text-sm font-black">${m.sec_featured}</h2>
                <a href="#m-tours-section" class="text-[11px] font-extrabold text-sea">${m.sec_all} →</a>
            </div>
            <div class="m-hscroll flex items-stretch gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
                ${trendingTrips.map(trip => {
                    const title = getTripTitle(trip);
                    const dur = getTripDuration(trip);
                    const badge = lang === "ar" ? trip.badge : ((BADGE_I18N[lang] && BADGE_I18N[lang][trip.badge]) || trip.badge);
                    return `<article onclick="openBookingWithTrip('${trip.id}')" class="snap-start shrink-0 w-[14.5rem] rounded-2xl overflow-hidden bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 shadow-md active:scale-[0.98] transition cursor-pointer">
                        <div class="relative h-28 bg-carbon-900">
                            <img src="${trip.img}" alt="${title}" loading="lazy" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-gradient-to-t from-carbon-950/85 via-transparent to-carbon-950/20"></div>
                            <span class="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-carbon-950/75 text-champagne text-[9.5px] font-black">${badge}</span>
                            <span class="absolute top-2 end-2 px-1.5 py-0.5 rounded-md bg-carbon-950/75 text-white text-[10px] font-black">★ ${trip.rating}</span>
                            <div class="absolute bottom-2 start-2 text-white">
                                <span class="text-sm font-black text-champagne">${fmtPrice(trip.fromPrice)}</span>
                                <span class="text-[9.5px] opacity-80"> / ${dur}</span>
                            </div>
                        </div>
                        <div class="p-2.5">
                            <h3 class="text-xs font-black leading-snug line-clamp-2 min-h-[2rem]">${title}</h3>
                            <div class="mt-2 flex items-center justify-between text-[10px] font-bold text-sea-dark dark:text-sea">
                                <span class="truncate">${trip.vehicle}</span>
                                <span class="px-2 py-0.5 rounded-md bg-champagne text-carbon-950 font-black shrink-0">${m.book_short}</span>
                            </div>
                        </div>
                    </article>`;
                }).join("")}
            </div>
        </section>

        <!-- 4. INTERACTIVE PROMO BANNER (Tap to Copy MOSA20) -->
        <section class="px-4 pt-4">
            <button type="button" onclick="copyMosaPromo()"
                class="w-full p-3.5 rounded-2xl bg-gradient-to-r from-carbon-900 via-carbon-800 to-carbon-900 text-white border border-champagne/40 shadow-lg flex items-center justify-between gap-3 text-start active:scale-[0.99] transition">
                <div class="min-w-0">
                    <div class="text-xs font-black text-champagne">${m.promo_title}</div>
                    <div class="text-[11px] text-white/75 mt-0.5">${m.promo_sub}</div>
                </div>
                <span class="px-3 py-1.5 rounded-xl bg-champagne text-carbon-950 font-black text-xs tracking-wider shrink-0">MOSA20</span>
            </button>
        </section>

        <!-- 5. HIGH-DENSITY HORIZONTAL TRIP LIST (3-4 Tours Visible Per Screen) -->
        <section id="m-tours-section" class="px-4 pt-5">
            <div class="flex items-center justify-between gap-2 mb-3">
                <h2 class="text-sm font-black">${m.sec_all} (${filtered.length})</h2>
                <select onchange="setMobileSort(this.value)" aria-label="Sort"
                    class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 text-[11px] font-extrabold focus:outline-none">
                    <option value="featured" ${state.sortBy === "featured" ? "selected" : ""}>${g.sort_featured}</option>
                    <option value="price-asc" ${state.sortBy === "price-asc" ? "selected" : ""}>${g.sort_asc}</option>
                    <option value="price-desc" ${state.sortBy === "price-desc" ? "selected" : ""}>${g.sort_desc}</option>
                    <option value="rating" ${state.sortBy === "rating" ? "selected" : ""}>${g.sort_rating}</option>
                </select>
            </div>

            <div class="space-y-2.5">
                ${filtered.map(trip => {
                    const title = getTripTitle(trip);
                    const dur = getTripDuration(trip);
                    const isFav = state.favorites.has(trip.id);
                    return `<article class="flex items-stretch gap-3 p-2.5 rounded-2xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 shadow-sm">
                        <div class="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-carbon-900">
                            <img src="${trip.img}" alt="${title}" loading="lazy" class="w-full h-full object-cover" />
                            <span class="absolute bottom-1 start-1 px-1.5 py-0.5 rounded bg-carbon-950/80 text-champagne text-[9.5px] font-black">★ ${trip.rating}</span>
                            <button type="button" onclick="toggleFav('${trip.id}')" aria-label="Favorite"
                                class="absolute top-1 end-1 w-6 h-6 rounded-lg grid place-items-center ${isFav ? 'bg-rose-500 text-white' : 'bg-carbon-950/65 text-white'}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            </button>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                                <div class="text-[10px] font-extrabold text-sea-dark dark:text-sea truncate">${dur} · ${trip.vehicle}</div>
                                <h3 class="text-xs font-black leading-snug line-clamp-2 mt-0.5">${title}</h3>
                            </div>
                            <div class="flex items-end justify-between gap-2 pt-1.5">
                                <div class="leading-none">
                                    <span class="text-[9.5px] opacity-60 block">${g.from_label}</span>
                                    <span class="text-sm font-black text-champagne-dark dark:text-champagne">${fmtPrice(trip.fromPrice)}</span>
                                </div>
                                <button type="button" onclick="openBookingWithTrip('${trip.id}')"
                                    class="px-3.5 py-1.5 rounded-xl bg-carbon-950 dark:bg-champagne text-white dark:text-carbon-950 font-black text-[11px] active:scale-95 transition">
                                    ${g.book_now}
                                </button>
                            </div>
                        </div>
                    </article>`;
                }).join("")}
            </div>
        </section>

        <!-- 6. COMPACT STATS & WHY US STRIP -->
        <section class="px-4 pt-6">
            <h2 class="text-sm font-black mb-2.5">${m.sec_why}</h2>
            <div class="grid grid-cols-4 gap-1.5 text-center mb-3">
                <div class="p-2.5 rounded-xl bg-carbon-900 text-white border border-white/10">
                    <div class="text-base font-black text-champagne">15+</div>
                    <div class="text-[9.5px] text-white/70 font-bold mt-0.5">${lang === "ar" ? "سنة خبرة" : "Years"}</div>
                </div>
                <div class="p-2.5 rounded-xl bg-carbon-900 text-white border border-white/10">
                    <div class="text-base font-black text-champagne">10K+</div>
                    <div class="text-[9.5px] text-white/70 font-bold mt-0.5">${lang === "ar" ? "مسافر" : "Guests"}</div>
                </div>
                <div class="p-2.5 rounded-xl bg-carbon-900 text-white border border-white/10">
                    <div class="text-base font-black text-sea">8</div>
                    <div class="text-[9.5px] text-white/70 font-bold mt-0.5">${lang === "ar" ? "برامج" : "Tours"}</div>
                </div>
                <div class="p-2.5 rounded-xl bg-carbon-900 text-white border border-white/10">
                    <div class="text-base font-black text-sea">4.9★</div>
                    <div class="text-[9.5px] text-white/70 font-bold mt-0.5">${lang === "ar" ? "التقييم" : "Rating"}</div>
                </div>
            </div>
        </section>

        <!-- 7. COMPACT MOBILE FAQ ACCORDION -->
        <section class="px-4 pt-3 pb-6">
            <h2 class="text-sm font-black mb-2.5">${m.sec_faq}</h2>
            <div class="space-y-2">
                ${[1, 2, 3, 4].map(n => `
                    <div class="rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 overflow-hidden">
                        <button type="button" onclick="toggleMobileFaq(this)"
                            class="w-full p-3 text-start text-xs font-extrabold flex items-center justify-between gap-2">
                            <span>${g["faq_q" + n]}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div class="hidden px-3 pb-3 text-[11.5px] opacity-75 leading-relaxed">${g["faq_a" + n]}</div>
                    </div>
                `).join("")}
            </div>
        </section>

        <!-- 8. COMPACT MOBILE FOOTER -->
        <footer class="px-4 py-5 text-center text-[11px] opacity-70 border-t border-carbon-900/10 dark:border-white/10">
            <div class="font-black text-carbon-900 dark:text-white">${g.footer_brand}</div>
            <div class="mt-0.5">${g.footer_addr}</div>
            <div class="mt-1">© 2026 mosasafari.com</div>
        </footer>

        <!-- 9. FLOATING GLASS PILL BOTTOM NAVIGATION BAR -->
        <nav aria-label="Mobile Navigation"
            class="fixed bottom-3 inset-x-3 z-40 rounded-2xl bg-carbon-950/95 backdrop-blur-xl border border-white/15 px-2 py-1.5 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.65)]">
            <div class="grid grid-cols-4 items-center gap-1">
                <a href="#m-hero" class="flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-extrabold text-white/80 hover:text-champagne active:scale-95 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    <span>${m.nav_home}</span>
                </a>
                <a href="#m-tours-section" class="flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-extrabold text-white/80 hover:text-champagne active:scale-95 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mb-0.5 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                    <span>${m.nav_tours}</span>
                </a>
                <button type="button" onclick="toggleAiWidget()" class="flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-extrabold text-white/80 hover:text-sea active:scale-95 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mb-0.5 text-sea" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
                    <span>${m.nav_ai}</span>
                </button>
                <button type="button" onclick="openBookingModal()" class="py-2.5 px-2 rounded-xl bg-champagne text-carbon-950 font-black text-[11px] shadow-md shadow-champagne/30 active:scale-95 transition">
                    ${m.nav_book}
                </button>
            </div>
        </nav>
    `;
}
