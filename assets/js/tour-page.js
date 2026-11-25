/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import {
    SAFARI_TRIPS,
    MOSA_RULES,
    getStationLabel,
    getTripRoutes,
    getRouteLabel,
    getTripDetails,
    getTripBadge
} from "./data/trips.js";
import { I18N, BADGE_I18N, BOOKING_I18N } from "./data/i18n.js";
import {
    state,
    fmtPrice,
    fetchLiveExchangeRates,
    trackEvent,
    safeGetStorage,
    safeSetStorage
} from "./state.js";
import {
    showToast,
    applyLanguage,
    detectLanguageByCountry
} from "./modules/ui.js";
import {
    getTripTitle,
    getTripDesc,
    getTripDuration,
    getStopClock
} from "./modules/trips.js";
import {
    openBookingWithTrip,
    openBookingWithStop,
    openBookingModal,
    closeBookingModal,
    toggleBookingTrip,
    adjustGuests,
    selectPickupStop,
    selectTripTime,
    selectPaymentMethod,
    formatCardNumberInput,
    formatCardExpiryInput,
    applyPromoCode,
    saveCurrentStepInputs,
    submitBookingOrder,
    renderBookingStep,
    UI_EXTRAs,
    findActivePromo
} from "./modules/booking.js";
import {
    toggleAiWidget,
    initAiAssistant,
    refreshAiAssistantUI
} from "./modules/ai-assistant.js";

function esc(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function assetUrl(p) {
    const clean = String(p || "assets/images/safari-sunrise.jpg");
    return clean.startsWith("/") || clean.startsWith("http") ? clean : "/" + clean;
}

const TOUR_PAGE_COPY = {
    ar: {
        home: "الرئيسية",
        programs: "البرامج",
        back_all: "كل الرحلات",
        dur_lbl: "مدة البرنامج",
        dep_lbl: "نافذة التحرك",
        veh_lbl: "المركبات والأنشطة",
        routes_lbl: "تغطية الاستلام",
        routes_val: "5 محطات · مسارين",
        pay_badge: "الدفع عند الوصول · 0% مقدم",
        overview_title: "تفاصيل البرنامج وأبرز المميزات",
        itinerary_title: "خط سير الرحلة بالتفصيل (4–5 ساعات)",
        schedule_title: "مواعيد التحرك ونقاط الاستلام المعتمدة",
        schedule_hint: "اختر محطتك من المسار الأول أو الثاني وسيتم تثبيتها فوراً في الحجز",
        inc_title: "ما يشمله السعر",
        exc_title: "اختياري / غير مشمول",
        bring_title: "ماذا تحضر معك؟",
        book_box_title: "احجز رحلتك أو احسب السعر الآن",
        from_shared: "يبدأ من (عرض خاص)",
        full_adult: "للفرد",
        adults_lbl: "البالغين (12+)",
        children_lbl: "الأطفال (6–11 · 50%)",
        pick_stop_lbl: "نقطة وميعاد الاستلام",
        vehicle_lbl: "نوع المركبة",
        promo_toggle: "تفعيل كود خصم MOSA20 (-20%)",
        group_badge: "خصم 10% للمجموعات (5+) مفعّل تلقائياً",
        est_total: "الإجمالي التقديري بالعملة الحية",
        cta_book: "متابعة وتأكيد الحجز الآن",
        cta_ai: "اسأل MOSA AI عن الرحلة",
        cta_wa: "استفسار فوري واتساب",
        other_tours: "استكشف باقي رحلات موسى سفاري الرسمية",
        view_btn: "عرض البرنامج الكامل",
        selected_tag: "مختارة ✓"
    },
    en: {
        home: "Home",
        programs: "Programs",
        back_all: "All Tours",
        dur_lbl: "Total Duration",
        dep_lbl: "Departure Window",
        veh_lbl: "Vehicles & Fun",
        routes_lbl: "Pickup Network",
        routes_val: "5 Hubs · 2 Routes",
        pay_badge: "Pay on Arrival · $0 Upfront",
        overview_title: "Program Overview & Highlights",
        itinerary_title: "Step-by-Step 4–5 Hour Itinerary",
        schedule_title: "Official Pickup Routes & Exact Times",
        schedule_hint: "Select your stop from Route 1 or Route 2 to lock that exact departure time",
        inc_title: "What's Included",
        exc_title: "Optional / Not Included",
        bring_title: "What to Bring",
        book_box_title: "Instant Price Quote & Booking",
        from_shared: "From (Promo Rate)",
        full_adult: "per adult",
        adults_lbl: "Adults (12+)",
        children_lbl: "Children (6–11 · 50%)",
        pick_stop_lbl: "Pickup Route & Time",
        vehicle_lbl: "Preferred Vehicle",
        promo_toggle: "Apply Promo Code MOSA20 (-20%)",
        group_badge: "Automatic 10% Group Discount (5+) Applied",
        est_total: "Estimated Live Total",
        cta_book: "Continue & Confirm Booking",
        cta_ai: "Ask MOSA AI About This Tour",
        cta_wa: "WhatsApp Direct Concierge",
        other_tours: "Explore More Official Mosa Safari Tours",
        view_btn: "View Full Details",
        selected_tag: "Selected ✓"
    },
    it: {
        home: "Home",
        programs: "Programmi",
        back_all: "Tutti i Tour",
        dur_lbl: "Durata Totale",
        dep_lbl: "Fascia Partenza",
        veh_lbl: "Veicoli & Attività",
        routes_lbl: "Rete di Ritiro",
        routes_val: "5 Fermate · 2 Percorsi",
        pay_badge: "Paga all'Arrivo · Zero Acconto",
        overview_title: "Panoramica e Punti Salienti",
        itinerary_title: "Itinerario Passo-Passo (4–5 Ore)",
        schedule_title: "Percorsi e Orari Ufficiali di Ritiro",
        schedule_hint: "Seleziona la tua fermata dal Percorso 1 o 2 per bloccare l'orario esatto",
        inc_title: "Cosa Include",
        exc_title: "Opzionale / Escluso",
        bring_title: "Cosa Portare",
        book_box_title: "Preventivo & Prenotazione Rapida",
        from_shared: "Da (Tariffa Promo)",
        full_adult: "adulto",
        adults_lbl: "Adulti (12+)",
        children_lbl: "Bambini (6–11 · 50%)",
        pick_stop_lbl: "Punto & Orario di Ritiro",
        vehicle_lbl: "Tipo di Veicolo",
        promo_toggle: "Applica Codice MOSA20 (-20%)",
        group_badge: "Sconto Gruppo 10% (5+) Applicato",
        est_total: "Totale Stimato Live",
        cta_book: "Procedi e Conferma Prenotazione",
        cta_ai: "Chiedi a MOSA AI",
        cta_wa: "Contatto WhatsApp Diretto",
        other_tours: "Scopri gli Altri Tour Ufficiali Mosa Safari",
        view_btn: "Vedi Dettagli",
        selected_tag: "Selezionato ✓"
    },
    ru: {
        home: "Главная",
        programs: "Программы",
        back_all: "Все туры",
        dur_lbl: "Длительность",
        dep_lbl: "Выезд",
        veh_lbl: "Транспорт",
        routes_lbl: "Зоны сбора",
        routes_val: "5 точек · 2 маршрута",
        pay_badge: "Оплата на месте · 0% аванса",
        overview_title: "Описание программы и ключевые моменты",
        itinerary_title: "Подробный маршрут на 4–5 часов",
        schedule_title: "Официальные маршруты и время посадки",
        schedule_hint: "Выберите удобную остановку в Маршруте 1 или 2 для мгновенной фиксации времени",
        inc_title: "Что включено",
        exc_title: "Дополнительно / Не включено",
        bring_title: "Что взять с собой",
        book_box_title: "Быстрый расчёт и бронирование",
        from_shared: "От (Спецтариф)",
        full_adult: "за взрослого",
        adults_lbl: "Взрослые (12+)",
        children_lbl: "Дети (6–11 · 50%)",
        pick_stop_lbl: "Остановка и время",
        vehicle_lbl: "Выбор транспорта",
        promo_toggle: "Применить промокод MOSA20 (-20%)",
        group_badge: "Групповая скидка 10% (5+) активна",
        est_total: "Итоговая стоимость",
        cta_book: "Перейти к оформлению брони",
        cta_ai: "Спросить MOSA AI о туре",
        cta_wa: "Написать в WhatsApp",
        other_tours: "Другие официальные туры Mosa Safari",
        view_btn: "Подробнее",
        selected_tag: "Выбрано ✓"
    }
};

const tourState = {
    tripId: "mosa-sunrise",
    activeImgIdx: 0,
    adults: 2,
    children: 0,
    vehicleOpt: "Single ATV Quad",
    pickupRoute: "",
    pickupStation: "",
    usePromo: true
};

function resolveRequestedTripId() {
    const params = new URLSearchParams(window.location.search);
    const qId = (params.get("id") || "").trim();
    if (qId) {
        const found = SAFARI_TRIPS.find(t => t.id === qId || t.category === qId);
        if (found) return found.id;
    }
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "tour" && parts[1]) {
        const slug = decodeURIComponent(parts[1]);
        const found = SAFARI_TRIPS.find(t => t.id === slug || t.category === slug);
        if (found) return found.id;
    }
    return SAFARI_TRIPS[0]?.id || "mosa-sunrise";
}

function getCurrentTrip() {
    return SAFARI_TRIPS.find(t => t.id === tourState.tripId) || SAFARI_TRIPS[0];
}

function ensureDefaultStop(trip) {
    const routes = getTripRoutes(trip);
    const r = routes.find(x => x.id === tourState.pickupRoute) || routes[0];
    const st = r?.stops?.find(s => s.station === tourState.pickupStation) || r?.stops?.[0];
    if (r) tourState.pickupRoute = r.id;
    if (st) tourState.pickupStation = st.station;
}

function computeSidebarQuote(trip) {
    const cfg = state.platformConfig?.settings || {};
    const minGroup = Number(cfg.groupDiscountMin) > 0 ? Number(cfg.groupDiscountMin) : 5;
    const groupPct = Number(cfg.groupDiscountPct) >= 0 ? Number(cfg.groupDiscountPct) : 10;
    const units = Math.max(1, tourState.adults + tourState.children * 0.5);
    let total = Number(trip.adultPrice || 20) * units;
    const hasGroup = tourState.adults + tourState.children >= minGroup;
    if (hasGroup) total *= (1 - groupPct / 100);
    const promo = tourState.usePromo ? findActivePromo("MOSA20") : null;
    if (promo && promo.discount > 0) total *= (1 - promo.discount / 100);
    return { total, hasGroup, promo };
}

function updateTourSeo(trip, details) {
    const lang = state.lang || "ar";
    const title = getTripTitle(trip, lang);
    const dur = getTripDuration(trip, lang);
    const fullTitle = details.seoTitle || `${title} (${dur}) | Mosa Safari — mosasafari.com`;
    document.title = fullTitle;

    const descText = details.seoDesc || `${details.subtitle || getTripDesc(trip, lang)} (${dur})`;
    const setMeta = (selector, value) => {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute("content", value);
    };
    setMeta('meta[name="title"]', fullTitle);
    setMeta('meta[name="description"]', descText);
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', descText);
    setMeta('meta[property="og:image"]', `https://mosasafari.com${assetUrl(trip.img)}`);
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', descText);
    setMeta('meta[name="twitter:image"]', `https://mosasafari.com${assetUrl(trip.img)}`);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `https://mosasafari.com/tour.html?id=${encodeURIComponent(trip.id)}`);

    const ld = document.getElementById("tour-schema-jsonld");
    if (ld) {
        const allImgs = (details.gallery && details.gallery.length ? details.gallery : [trip.img])
            .map(gImg => gImg.startsWith("http") ? gImg : `https://mosasafari.com${assetUrl(gImg)}`);
        ld.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["Product", "TouristTrip"],
            name: title,
            description: descText,
            image: allImgs,
            sku: trip.id,
            url: `https://mosasafari.com/tour.html?id=${encodeURIComponent(trip.id)}`,
            brand: { "@type": "Brand", name: "Mosa Safari" },
            offers: {
                "@type": "Offer",
                price: Number(trip.fromPrice || 10).toFixed(2),
                priceCurrency: "USD",
                availability: "https://schema.org/InStock"
            },
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: String(trip.rating || 4.9),
                reviewCount: "320",
                bestRating: "5",
                worstRating: "1"
            }
        });
    }
}

function renderTourPage() {
    const root = document.getElementById("tour-page-root");
    if (!root) return;

    const lang = state.lang || "ar";
    const c = TOUR_PAGE_COPY[lang] || TOUR_PAGE_COPY.en;
    const g = I18N[lang] || I18N.en;
    const bkI18n = BOOKING_I18N[lang] || BOOKING_I18N.en;
    const rules = MOSA_RULES[lang] || MOSA_RULES.en;

    const trip = getCurrentTrip();
    ensureDefaultStop(trip);
    const title = getTripTitle(trip, lang);
    const desc = getTripDesc(trip, lang);
    const dur = getTripDuration(trip, lang);
    const details = getTripDetails(trip, lang);
    const routes = getTripRoutes(trip);
    const gallery = (details.gallery || [trip.img]).map(assetUrl);
    if (tourState.activeImgIdx >= gallery.length) tourState.activeImgIdx = 0;
    const heroImg = gallery[tourState.activeImgIdx] || gallery[0];
    const badgeText = getTripBadge(trip, lang, BADGE_I18N);
    const quote = computeSidebarQuote(trip);
    const otherTrips = SAFARI_TRIPS.filter(t => t.active !== false && t.id !== trip.id);

    updateTourSeo(trip, details);

    const backText = document.getElementById("back-home-text");
    if (backText) backText.textContent = c.back_all;
    const navBookLbl = document.getElementById("nav-book-label");
    if (navBookLbl) navBookLbl.textContent = g.book_now;
    const footerBrand = document.getElementById("tour-footer-brand");
    if (footerBrand) footerBrand.textContent = g.footer_brand;
    const footerAddr = document.getElementById("tour-footer-addr");
    if (footerAddr) footerAddr.textContent = g.footer_addr;
    const footerAll = document.getElementById("tour-footer-all");
    if (footerAll) footerAll.textContent = c.back_all;

    root.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
            <!-- 1. Breadcrumb + Quick 4-Tour Switcher -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs font-bold opacity-80">
                    <a href="/index.html" class="hover:text-champagne-dark dark:hover:text-champagne">${esc(c.home)}</a>
                    <span>/</span>
                    <a href="/index.html#programs" class="hover:text-champagne-dark dark:hover:text-champagne">${esc(c.programs)}</a>
                    <span>/</span>
                    <span class="font-black text-champagne-dark dark:text-champagne">${esc(title)}</span>
                </nav>
                <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5">
                    ${SAFARI_TRIPS.filter(t => t.active !== false).map(t => {
                        const isCur = t.id === trip.id;
                        const label = lang === "ar" ? t.badge : ((BADGE_I18N[lang] && BADGE_I18N[lang][t.badge]) || t.badge);
                        return `<a href="/tour.html?id=${encodeURIComponent(t.id)}"
                            class="px-3 py-1.5 rounded-xl text-xs font-black border text-center truncate transition ${isCur ? 'bg-champagne text-carbon-950 border-champagne shadow-md' : 'bg-white dark:bg-carbon-800 border-carbon-900/10 dark:border-white/10 hover:border-champagne'}">
                            ${esc(t.icon || "🏜️")} ${esc(label)}
                        </a>`;
                    }).join("")}
                </div>
            </div>

            <!-- 2. Tour Hero Showcase + Key Facts Bar -->
            <section class="rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 shadow-xl overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-12">
                    <div class="lg:col-span-7 relative bg-carbon-950 group">
                        <div class="aspect-[16/10] w-full overflow-hidden cursor-zoom-in" id="tour-hero-trigger">
                            <img id="tour-hero-img" src="${esc(heroImg)}" alt="${esc(title)}" class="w-full h-full object-cover transition duration-500">
                        </div>
                        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-carbon-950/85 via-transparent to-carbon-950/30"></div>
                        <div class="absolute top-4 start-4 flex flex-wrap gap-2">
                            <span class="px-3 py-1 rounded-full bg-carbon-950/80 border border-champagne/40 text-champagne text-xs font-black">${esc(badgeText)}</span>
                            <span class="px-3 py-1 rounded-full bg-sea text-carbon-950 text-xs font-black">⏱ ${esc(dur)}</span>
                        </div>
                        <div class="absolute top-4 end-4 flex items-center gap-1.5">
                            <span class="px-2.5 py-1 rounded-full bg-carbon-950/80 border border-white/15 text-white text-xs font-black">📷 <span dir="ltr">${tourState.activeImgIdx + 1} / ${gallery.length}</span></span>
                            <span class="px-3 py-1 rounded-full bg-carbon-950/80 border border-white/15 text-champagne text-xs font-black">★ ${trip.rating}</span>
                        </div>
                        ${gallery.length > 1 ? `
                            <button type="button" id="tour-hero-prev" aria-label="Previous image"
                                class="absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-carbon-950/75 hover:bg-champagne hover:text-carbon-950 text-white border border-white/20 text-lg font-black grid place-items-center transition">‹</button>
                            <button type="button" id="tour-hero-next" aria-label="Next image"
                                class="absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-carbon-950/75 hover:bg-champagne hover:text-carbon-950 text-white border border-white/20 text-lg font-black grid place-items-center transition">›</button>
                        ` : ""}
                        <!-- Scrollable Multi-Photo Thumbnails -->
                        <div class="absolute bottom-3 inset-x-4 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-2 overflow-x-auto m-hscroll pb-0.5 max-w-full">
                                ${gallery.map((gImg, idx) => `
                                    <button type="button" data-gallery-idx="${idx}"
                                        class="shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-xl overflow-hidden border-2 transition ${idx === tourState.activeImgIdx ? 'border-champagne scale-105' : 'border-white/40 opacity-75 hover:opacity-100'}">
                                        <img src="${esc(gImg)}" alt="Preview ${idx + 1}" class="w-full h-full object-cover">
                                    </button>
                                `).join("")}
                            </div>
                            <span class="hidden sm:inline-flex shrink-0 px-3 py-1.5 rounded-xl bg-carbon-950/80 backdrop-blur-md border border-white/15 text-white text-xs font-extrabold">${esc(c.pay_badge)}</span>
                        </div>
                    </div>

                    <div class="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-5">
                        <div class="space-y-3">
                            <div class="text-xs font-black text-sea-dark dark:text-sea">📍 ${esc(g.city_sharm)} · ${esc(details.departureWindow)}</div>
                            <h1 class="text-2xl sm:text-3xl font-black leading-tight">${esc(title)}</h1>
                            <p class="text-sm text-carbon-900/75 dark:text-[#B5B0A8] leading-relaxed">${esc(details.subtitle || desc)}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="p-3 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                                <span class="opacity-65 block font-bold">${esc(c.dur_lbl)}</span>
                                <strong class="text-sm font-black text-champagne-dark dark:text-champagne mt-0.5 block">⏱ ${esc(dur)}</strong>
                            </div>
                            <div class="p-3 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                                <span class="opacity-65 block font-bold">${esc(c.dep_lbl)}</span>
                                <strong class="text-sm font-black mt-0.5 block">${esc(details.departureWindow)}</strong>
                            </div>
                            <div class="p-3 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                                <span class="opacity-65 block font-bold">${esc(c.veh_lbl)}</span>
                                <strong class="text-xs font-black text-sea mt-0.5 block">${esc(trip.vehicle)}</strong>
                            </div>
                            <div class="p-3 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                                <span class="opacity-65 block font-bold">${esc(c.routes_lbl)}</span>
                                <strong class="text-xs font-black mt-0.5 block">${esc(c.routes_val)}</strong>
                            </div>
                        </div>

                        <div class="flex items-center justify-between gap-3 pt-3 border-t border-carbon-900/10 dark:border-white/10">
                            <div>
                                <span class="text-[11px] opacity-65 block font-bold">${esc(c.from_shared)}</span>
                                <span class="text-2xl font-black text-champagne-dark dark:text-champagne">${fmtPrice(trip.fromPrice)}</span>
                                <span class="text-xs opacity-65">(${fmtPrice(trip.adultPrice)} ${esc(c.full_adult)})</span>
                            </div>
                            <button type="button" id="hero-book-now-btn"
                                class="px-5 py-3 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 font-black text-xs sm:text-sm shadow-lg shadow-champagne/25 transition">
                                ${esc(g.book_now)}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. TWO-COLUMN DETAILS + STICKY BOOKING CALCULATOR -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                <!-- MAIN EDITORIAL CONTENT -->
                <div class="lg:col-span-8 space-y-7">
                    <!-- Overview & Highlights -->
                    <section class="p-5 sm:p-7 rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-4">
                        <h2 class="text-lg sm:text-xl font-black">${esc(c.overview_title)}</h2>
                        <p class="text-sm text-carbon-900/80 dark:text-[#CEC8BE] leading-relaxed">${esc(desc)}</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            ${(details.highlights || []).map(hl => `
                                <div class="p-3.5 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-champagne/25 flex items-center gap-2.5 text-xs sm:text-sm font-black">
                                    <span class="w-6 h-6 rounded-lg bg-sea/20 text-sea grid place-items-center shrink-0">✓</span>
                                    <span>${esc(hl)}</span>
                                </div>
                            `).join("")}
                        </div>
                    </section>

                    <!-- Step-by-Step 4-5h Itinerary Timeline -->
                    <section class="p-5 sm:p-7 rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-5">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <h2 class="text-lg sm:text-xl font-black">${esc(c.itinerary_title)}</h2>
                            <span class="px-3 py-1 rounded-full bg-champagne/15 text-champagne-dark dark:text-champagne text-xs font-black">⏱ ${esc(dur)}</span>
                        </div>
                        <div class="space-y-3.5">
                            ${(details.itinerary || []).map(item => `
                                <div class="tour-step-card p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 flex items-start gap-3.5">
                                    <div class="w-10 h-10 rounded-xl bg-champagne text-carbon-950 font-black text-sm grid place-items-center shrink-0">${esc(item.step)}</div>
                                    <div class="min-w-0 flex-1">
                                        <div class="flex flex-wrap items-center justify-between gap-2">
                                            <h3 class="text-sm sm:text-base font-black">${esc(item.title)}</h3>
                                            <span class="px-2.5 py-0.5 rounded-lg bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 font-mono text-[11px] font-black text-champagne-dark dark:text-champagne">${esc(item.time)}</span>
                                        </div>
                                        <p class="text-xs sm:text-sm text-carbon-900/75 dark:text-[#B5B0A8] leading-relaxed mt-1">${esc(item.desc)}</p>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </section>

                    <!-- Route 1 & Route 2 Interactive Station Picker + Important Rules -->
                    <section class="p-5 sm:p-7 rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-4">
                        <div>
                            <h2 class="text-lg sm:text-xl font-black">${esc(c.schedule_title)}</h2>
                            <p class="text-xs sm:text-sm opacity-75 mt-1 font-bold">${esc(c.schedule_hint)}</p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${routes.map(route => `
                                <div class="rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 p-4 space-y-2.5">
                                    <div class="text-sm font-black text-champagne-dark dark:text-champagne border-b border-carbon-900/10 dark:border-white/10 pb-2">
                                        ${esc(getRouteLabel(route, lang))}
                                    </div>
                                    <div class="space-y-2">
                                        ${(route.stops || []).map(st => {
                                            const active = tourState.pickupRoute === route.id && tourState.pickupStation === st.station;
                                            return `
                                                <button type="button" data-pick-route="${esc(route.id)}" data-pick-station="${esc(st.station)}"
                                                    class="w-full px-3 py-2.5 rounded-xl border text-start flex items-center justify-between gap-2 text-xs sm:text-sm font-bold transition ${active ? 'bg-champagne text-carbon-950 border-champagne shadow-md' : 'bg-white dark:bg-carbon-800 border-carbon-900/10 dark:border-white/10 hover:border-champagne'}">
                                                    <span>${st.emoji || "🕒"} <strong class="font-mono">${esc(getStopClock(st, lang))}</strong> — ${esc(getStationLabel(st.station, lang))}</span>
                                                    <span class="text-[11px] font-black">${active ? c.selected_tag : g.book_now}</span>
                                                </button>
                                            `;
                                        }).join("")}
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                        <div class="rounded-2xl p-4 sm:p-5 bg-amber-500/10 border border-champagne/40 space-y-2">
                            <div class="text-sm font-black text-champagne-dark dark:text-champagne">${esc(rules.title)}</div>
                            <ul class="space-y-1 text-xs sm:text-sm font-bold text-carbon-900/85 dark:text-[#F4EFE6]">
                                ${rules.items.map(line => `<li class="flex items-start gap-2"><span class="text-champagne-dark dark:text-champagne">•</span><span>${esc(line)}</span></li>`).join("")}
                            </ul>
                        </div>
                    </section>

                    <!-- Included / Excluded / What to Bring -->
                    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="p-5 rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-3">
                            <h3 class="text-sm font-black text-sea">✓ ${esc(c.inc_title)}</h3>
                            <ul class="space-y-2 text-xs font-bold opacity-85">
                                ${(details.includes || []).map(x => `<li class="flex items-start gap-1.5"><span class="text-sea shrink-0">✓</span><span>${esc(x)}</span></li>`).join("")}
                            </ul>
                        </div>
                        <div class="p-5 rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-3">
                            <h3 class="text-sm font-black text-copper">✕ ${esc(c.exc_title)}</h3>
                            <ul class="space-y-2 text-xs font-bold opacity-80">
                                ${(details.excludes || []).map(x => `<li class="flex items-start gap-1.5"><span class="text-copper shrink-0">•</span><span>${esc(x)}</span></li>`).join("")}
                            </ul>
                        </div>
                        <div class="p-5 rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-3">
                            <h3 class="text-sm font-black text-champagne-dark dark:text-champagne">🎒 ${esc(c.bring_title)}</h3>
                            <ul class="space-y-2 text-xs font-bold opacity-85">
                                ${(details.bring || []).map(x => `<li class="flex items-start gap-1.5"><span class="text-champagne-dark dark:text-champagne shrink-0">•</span><span>${esc(x)}</span></li>`).join("")}
                            </ul>
                        </div>
                    </section>
                </div>

                <!-- STICKY BOOKING CALCULATOR SIDEBAR -->
                <aside class="lg:col-span-4 lg:sticky lg:top-24 p-5 sm:p-6 rounded-3xl bg-white dark:bg-carbon-800 border border-champagne/35 shadow-xl space-y-4">
                    <div class="border-b border-carbon-900/10 dark:border-white/10 pb-3">
                        <span class="text-[11px] font-black uppercase text-champagne-dark dark:text-champagne">⏱ ${esc(dur)}</span>
                        <h2 class="text-lg font-black mt-0.5">${esc(c.book_box_title)}</h2>
                    </div>

                    <!-- Pickup Stop Selector -->
                    <div class="space-y-1.5">
                        <label for="side-stop-select" class="block text-xs font-black opacity-80">${esc(c.pick_stop_lbl)}</label>
                        <select id="side-stop-select" class="w-full px-3 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-xs font-bold focus:outline-none">
                            ${routes.flatMap(r => (r.stops || []).map(st => {
                                const val = `${r.id}::${st.station}`;
                                const isSel = tourState.pickupRoute === r.id && tourState.pickupStation === st.station;
                                return `<option value="${esc(val)}" ${isSel ? "selected" : ""} class="text-carbon-950">${esc(getRouteLabel(r, lang))} — ${esc(getStopClock(st, lang))} ${esc(getStationLabel(st.station, lang))}</option>`;
                            })).join("")}
                        </select>
                    </div>

                    <!-- Vehicle Selector -->
                    <div class="space-y-1.5">
                        <label for="side-veh-select" class="block text-xs font-black opacity-80">${esc(c.vehicle_lbl)}</label>
                        <select id="side-veh-select" class="w-full px-3 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-xs font-bold focus:outline-none">
                            ${Object.keys(bkI18n.vehicles || {}).map(vk => `
                                <option value="${esc(vk)}" ${tourState.vehicleOpt === vk ? "selected" : ""} class="text-carbon-950">${esc(bkI18n.vehicles[vk])}</option>
                            `).join("")}
                        </select>
                    </div>

                    <!-- Guests Steppers -->
                    <div class="grid grid-cols-2 gap-2.5">
                        <div class="p-3 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                            <span class="text-[11px] font-bold opacity-75 block mb-1.5">${esc(c.adults_lbl)}</span>
                            <div class="flex items-center justify-between">
                                <button type="button" data-side-guest="adults:-1" class="w-7 h-7 rounded-lg bg-white dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-black">-</button>
                                <span class="font-black text-sm">${tourState.adults}</span>
                                <button type="button" data-side-guest="adults:1" class="w-7 h-7 rounded-lg bg-champagne text-carbon-950 font-black">+</button>
                            </div>
                        </div>
                        <div class="p-3 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                            <span class="text-[11px] font-bold opacity-75 block mb-1.5">${esc(c.children_lbl)}</span>
                            <div class="flex items-center justify-between">
                                <button type="button" data-side-guest="children:-1" class="w-7 h-7 rounded-lg bg-white dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-black">-</button>
                                <span class="font-black text-sm">${tourState.children}</span>
                                <button type="button" data-side-guest="children:1" class="w-7 h-7 rounded-lg bg-champagne text-carbon-950 font-black">+</button>
                            </div>
                        </div>
                    </div>

                    <!-- Promo Toggle -->
                    <label class="flex items-center gap-2 p-3 rounded-xl bg-sea/10 border border-sea/25 cursor-pointer text-xs font-extrabold">
                        <input id="side-promo-chk" type="checkbox" ${tourState.usePromo ? "checked" : ""} class="rounded text-sea focus:ring-0">
                        <span>${esc(c.promo_toggle)}</span>
                    </label>

                    ${quote.hasGroup ? `<div class="p-2.5 rounded-xl bg-champagne/15 border border-champagne/30 text-[11px] font-black text-champagne-dark dark:text-champagne">🎉 ${esc(c.group_badge)}</div>` : ""}

                    <!-- Total -->
                    <div class="p-4 rounded-2xl bg-carbon-950 text-white flex items-center justify-between">
                        <span class="text-xs text-white/75 font-bold">${esc(c.est_total)}</span>
                        <span class="text-2xl font-black text-champagne">${fmtPrice(quote.total)}</span>
                    </div>

                    <!-- CTAs -->
                    <div class="space-y-2">
                        <button type="button" id="side-book-cta"
                            class="w-full py-3.5 px-4 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 font-black text-sm shadow-lg shadow-champagne/25 transition">
                            ${esc(c.cta_book)}
                        </button>
                        <button type="button" onclick="toggleAiWidget(true)"
                            class="w-full py-2.5 px-4 rounded-xl border border-carbon-900/15 dark:border-white/15 hover:border-champagne font-extrabold text-xs transition">
                            ✨ ${esc(c.cta_ai)}
                        </button>
                        <a href="https://wa.me/201023355550?text=${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer"
                            class="w-full py-2.5 px-4 rounded-xl bg-sea/15 text-sea-dark dark:text-sea font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-sea/25 transition">
                            💬 ${esc(c.cta_wa)}
                        </a>
                    </div>
                </aside>
            </div>

            <!-- 4. OTHER OFFICIAL TOURS CROSS-SELL -->
            <section class="pt-4 space-y-4">
                <h2 class="text-lg sm:text-xl font-black">${esc(c.other_tours)}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    ${otherTrips.map(ot => {
                        const oTitle = getTripTitle(ot, lang);
                        const oDur = getTripDuration(ot, lang);
                        const oDet = getTripDetails(ot, lang);
                        return `
                            <article class="rounded-2xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col">
                                <a href="/tour.html?id=${encodeURIComponent(ot.id)}" class="relative h-44 bg-carbon-900 block overflow-hidden">
                                    <img src="${esc(assetUrl(ot.img))}" alt="${esc(oTitle)}" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition duration-500">
                                    <span class="absolute top-3 start-3 px-2.5 py-1 rounded-full bg-sea text-carbon-950 text-[10px] font-black">⏱ ${esc(oDur)}</span>
                                    <span class="absolute bottom-3 end-3 px-2.5 py-1 rounded-lg bg-carbon-950/80 text-champagne text-xs font-black">${fmtPrice(ot.fromPrice)}</span>
                                </a>
                                <div class="p-4 flex-1 flex flex-col justify-between gap-3">
                                    <div>
                                        <div class="text-[11px] font-bold text-sea">${esc(oDet.departureWindow)} · ★ ${ot.rating}</div>
                                        <h3 class="text-sm font-black mt-1"><a href="/tour.html?id=${encodeURIComponent(ot.id)}" class="hover:text-champagne-dark dark:hover:text-champagne">${esc(oTitle)}</a></h3>
                                    </div>
                                    <a href="/tour.html?id=${encodeURIComponent(ot.id)}" class="w-full py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 hover:bg-champagne hover:text-carbon-950 font-black text-xs text-center transition">
                                        ${esc(c.view_btn)}
                                    </a>
                                </div>
                            </article>
                        `;
                    }).join("")}
                </div>
            </section>
        </div>
    `;

    // Bind Mobile Sticky Bottom Bar
    const mobBar = document.getElementById("tour-mobile-sticky");
    if (mobBar) {
        mobBar.innerHTML = `
            <div class="flex items-center justify-between gap-2.5">
                <div class="min-w-0 text-white">
                    <div class="text-[10px] text-champagne font-bold truncate">${esc(dur)} · ${esc(details.departureWindow)}</div>
                    <div class="text-base font-black leading-tight">${fmtPrice(quote.total)} <span class="text-[10px] font-normal text-white/65">(${tourState.adults}+${tourState.children})</span></div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button type="button" onclick="toggleAiWidget(true)" class="p-2.5 rounded-xl bg-white/10 text-sea border border-white/15 text-xs font-black">AI</button>
                    <button type="button" id="mob-sticky-book-btn" class="px-5 py-2.5 rounded-xl bg-champagne text-carbon-950 font-black text-xs shadow-md">${esc(g.book_now)}</button>
                </div>
            </div>
        `;
        document.getElementById("mob-sticky-book-btn")?.addEventListener("click", launchPrefilledBooking);
    }

    // Bind Interactive Controls inside #tour-page-root
    root.querySelectorAll("[data-gallery-idx]").forEach(btn => {
        btn.addEventListener("click", () => {
            tourState.activeImgIdx = Number(btn.dataset.galleryIdx) || 0;
            renderTourPage();
        });
    });
    document.getElementById("tour-hero-prev")?.addEventListener("click", e => {
        e.stopPropagation();
        tourState.activeImgIdx = (tourState.activeImgIdx - 1 + gallery.length) % gallery.length;
        renderTourPage();
    });
    document.getElementById("tour-hero-next")?.addEventListener("click", e => {
        e.stopPropagation();
        tourState.activeImgIdx = (tourState.activeImgIdx + 1) % gallery.length;
        renderTourPage();
    });
    const updateLightbox = () => {
        const lbImg = document.getElementById("lb-img");
        const lbCap = document.getElementById("lb-caption");
        if (lbImg) lbImg.src = gallery[tourState.activeImgIdx] || gallery[0];
        if (lbCap) lbCap.textContent = `${title} · ${tourState.activeImgIdx + 1} / ${gallery.length}`;
    };
    document.getElementById("tour-hero-trigger")?.addEventListener("click", () => {
        updateLightbox();
        document.getElementById("tour-lightbox")?.classList.remove("hidden");
    });
    const lb = document.getElementById("tour-lightbox");
    if (lb && !lb.dataset.bound) {
        lb.dataset.bound = "1";
        document.getElementById("lb-close")?.addEventListener("click", () => lb.classList.add("hidden"));
        document.getElementById("lb-prev")?.addEventListener("click", () => {
            const gLen = getTripDetails(getCurrentTrip(), state.lang).gallery.length || 1;
            tourState.activeImgIdx = (tourState.activeImgIdx - 1 + gLen) % gLen;
            renderTourPage();
            updateLightbox();
        });
        document.getElementById("lb-next")?.addEventListener("click", () => {
            const gLen = getTripDetails(getCurrentTrip(), state.lang).gallery.length || 1;
            tourState.activeImgIdx = (tourState.activeImgIdx + 1) % gLen;
            renderTourPage();
            updateLightbox();
        });
        lb.addEventListener("click", e => {
            if (e.target === lb) lb.classList.add("hidden");
        });
    }

    root.querySelectorAll("[data-pick-route]").forEach(btn => {
        btn.addEventListener("click", () => {
            tourState.pickupRoute = btn.dataset.pickRoute;
            tourState.pickupStation = btn.dataset.pickStation;
            renderTourPage();
            showToast(`${getStationLabel(tourState.pickupStation, lang)} ✓`);
        });
    });

    document.getElementById("side-stop-select")?.addEventListener("change", e => {
        const [rId, stKey] = String(e.target.value || "").split("::");
        if (rId && stKey) {
            tourState.pickupRoute = rId;
            tourState.pickupStation = stKey;
            renderTourPage();
        }
    });

    document.getElementById("side-veh-select")?.addEventListener("change", e => {
        tourState.vehicleOpt = e.target.value;
    });

    root.querySelectorAll("[data-side-guest]").forEach(btn => {
        btn.addEventListener("click", () => {
            const [kind, deltaStr] = btn.dataset.sideGuest.split(":");
            const delta = Number(deltaStr);
            if (kind === "adults") tourState.adults = Math.max(1, Math.min(30, tourState.adults + delta));
            if (kind === "children") tourState.children = Math.max(0, Math.min(20, tourState.children + delta));
            renderTourPage();
        });
    });

    document.getElementById("side-promo-chk")?.addEventListener("change", e => {
        tourState.usePromo = e.target.checked;
        renderTourPage();
    });

    document.getElementById("hero-book-now-btn")?.addEventListener("click", launchPrefilledBooking);
    document.getElementById("side-book-cta")?.addEventListener("click", launchPrefilledBooking);
}

function launchPrefilledBooking() {
    const trip = getCurrentTrip();
    ensureDefaultStop(trip);
    state.booking.selectedIds = [trip.id];
    state.booking.adults = tourState.adults;
    state.booking.children = tourState.children;
    state.booking.vehicleOpt = tourState.vehicleOpt;
    state.booking.promoCode = tourState.usePromo ? "MOSA20" : "";
    openBookingWithStop(trip.id, tourState.pickupRoute, tourState.pickupStation);
}

// Expose handlers required by shared booking & AI modules
window.state = state;
window.showToast = showToast;
window.openBookingWithTrip = openBookingWithTrip;
window.openBookingWithStop = openBookingWithStop;
window.toggleBookingTrip = toggleBookingTrip;
window.adjustGuests = adjustGuests;
window.selectPickupStop = selectPickupStop;
window.selectTripTime = selectTripTime;
window.selectPaymentMethod = selectPaymentMethod;
window.formatCardNumberInput = formatCardNumberInput;
window.formatCardExpiryInput = formatCardExpiryInput;
window.applyPromoCode = applyPromoCode;
window.renderBookingStep = renderBookingStep;
window.openBookingModal = openBookingModal;
window.toggleAiWidget = toggleAiWidget;

function refreshTourAllViews() {
    renderTourPage();
    refreshAiAssistantUI();
    const modal = document.getElementById("booking-modal");
    if (modal && !modal.classList.contains("hidden")) {
        renderBookingStep();
    }
}

async function syncPlatformConfig() {
    try {
        const res = await fetch("/api/public/config", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.ok) return;
        if (Array.isArray(data.trips) && data.trips.length > 0) {
            SAFARI_TRIPS.splice(0, SAFARI_TRIPS.length, ...data.trips);
        }
        if (Array.isArray(data.promos)) state.platformConfig.promos = data.promos;
        if (data.settings && typeof data.settings === "object") {
            state.platformConfig.settings = { ...state.platformConfig.settings, ...data.settings };
            if (data.settings.exchangeMode === "manual") {
                state.rates.EGP = Number(data.settings.manualEgpRate) || state.rates.EGP;
                state.rates.EUR = Number(data.settings.manualEurRate) || state.rates.EUR;
            }
        }
        tourState.tripId = resolveRequestedTripId();
        refreshTourAllViews();
    } catch { /* silent fallback */ }
}

window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = safeGetStorage("mosa_theme");
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
    else if (savedTheme === "light") document.documentElement.classList.remove("dark");

    const savedCurr = safeGetStorage("mosa_currency");
    if (savedCurr && state.rates[savedCurr]) {
        state.currency = savedCurr;
        const currSel = document.getElementById("tour-currency-select");
        if (currSel) currSel.value = savedCurr;
    }

    tourState.tripId = resolveRequestedTripId();
    detectLanguageByCountry(() => {
        const langSel = document.getElementById("tour-lang-select");
        if (langSel) langSel.value = state.lang;
        refreshTourAllViews();
    });

    syncPlatformConfig();
    trackEvent("tour_click", { tripId: tourState.tripId });
    fetchLiveExchangeRates(false).then(refreshTourAllViews);

    document.getElementById("tour-theme-toggle")?.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        safeSetStorage("mosa_theme", isDark ? "dark" : "light");
    });

    document.getElementById("tour-lang-select")?.addEventListener("change", e => {
        safeSetStorage("mosa_lang", e.target.value);
        applyLanguage(e.target.value, refreshTourAllViews);
    });

    document.getElementById("tour-currency-select")?.addEventListener("change", async e => {
        state.currency = e.target.value;
        safeSetStorage("mosa_currency", e.target.value);
        refreshTourAllViews();
        if (e.target.value === "EGP" || e.target.value === "EUR") {
            await fetchLiveExchangeRates(true);
            refreshTourAllViews();
            showToast(`${I18N[state.lang].toast_rate_live} ${state.currency}`);
        }
    });

    document.getElementById("tour-nav-book-btn")?.addEventListener("click", launchPrefilledBooking);
    document.getElementById("close-booking-btn")?.addEventListener("click", closeBookingModal);
    document.getElementById("booking-prev-btn")?.addEventListener("click", () => {
        saveCurrentStepInputs();
        if (state.booking.step > 1) {
            state.booking.step--;
            renderBookingStep();
        }
    });
    document.getElementById("booking-next-btn")?.addEventListener("click", async () => {
        const b = state.booking;
        if (b.lastConfirmation) {
            b.step = 1;
            closeBookingModal();
            return;
        }
        saveCurrentStepInputs();
        if (b.step === 2) {
            if (!b.name || !b.phone) {
                showToast(I18N[state.lang].toast_req_info, "error");
                return;
            }
            if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
                showToast((UI_EXTRAs[state.lang] || UI_EXTRAs.en).err_invalid_email, "error");
                return;
            }
        }
        if (b.step < 5) {
            b.step++;
            renderBookingStep();
        } else {
            await submitBookingOrder();
        }
    });

    window.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeBookingModal();
            toggleAiWidget(false);
            document.getElementById("tour-lightbox")?.classList.add("hidden");
        }
    });
    document.getElementById("booking-modal")?.addEventListener("click", e => {
        if (e.target?.id === "booking-modal") closeBookingModal();
    });

    initAiAssistant();
});
