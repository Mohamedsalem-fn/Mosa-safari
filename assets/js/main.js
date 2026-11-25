/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "./data/trips.js";
import { I18N } from "./data/i18n.js";
import {
    state,
    getActiveRateText,
    fetchLiveExchangeRates,
    trackEvent,
    safeGetStorage,
    safeSetStorage
} from "./state.js";
import {
    showToast,
    setHeroPreview,
    switchHubTab,
    initParticles,
    initObservers,
    applyLanguage,
    detectLanguageByCountry
} from "./modules/ui.js";
import {
    renderTrips,
    renderRealMoments,
    toggleFav,
    toggleCompare,
    openCompareModal,
    stepMomentLightbox,
    closeMomentLightbox
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
    UI_EXTRAs
} from "./modules/booking.js";
import {
    toggleAiWidget,
    initAiAssistant,
    refreshAiAssistantUI
} from "./modules/ai-assistant.js";
import {
    renderMobileApp,
    copyMosaPromo,
    setMobileCategory,
    setMobileSort,
    toggleMobileFaq
} from "./modules/mobile-app.js";
import { initCinematic } from "./cinematic.js";

// Expose handlers used by inline HTML attributes
window.state = state;
window.showToast = showToast;
window.setHeroPreview = setHeroPreview;
window.switchHubTab = switchHubTab;
window.toggleFav = toggleFav;
window.toggleCompare = toggleCompare;
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
window.copyMosaPromo = copyMosaPromo;
window.setMobileCategory = setMobileCategory;
window.setMobileSort = setMobileSort;
window.toggleMobileFaq = toggleMobileFaq;

window.handleMobileLangChange = function (val) {
    safeSetStorage("mosa_lang", val);
    const deskSel = document.getElementById("lang-select");
    if (deskSel) deskSel.value = val;
    applyLanguage(val, refreshAllCurrencyViews);
};

window.handleMobileCurrencyChange = async function (nextCurr) {
    state.currency = nextCurr;
    safeSetStorage("mosa_currency", nextCurr);
    const deskCurr = document.getElementById("currency-select");
    if (deskCurr) deskCurr.value = nextCurr;
    refreshAllCurrencyViews();

    if (nextCurr === "EGP" || nextCurr === "EUR") {
        await fetchLiveExchangeRates(true);
        refreshAllCurrencyViews();
        showToast(`${I18N[state.lang].toast_rate_live} ${getActiveRateText()}`);
    }
};

window.toggleMobileTheme = function () {
    const isDark = document.documentElement.classList.toggle("dark");
    safeSetStorage("mosa_theme", isDark ? "dark" : "light");
    renderMobileApp();
};

function bindEvent(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

function updateLiveRateBadge() {
    const badge = document.getElementById("live-rate-badge");
    const txt = document.getElementById("live-rate-text");
    if (!badge || !txt) return;
    if (state.currency === "USD") {
        badge.classList.add("hidden");
        badge.classList.remove("md:inline-flex");
    } else {
        txt.textContent = getActiveRateText();
        badge.title = `${I18N[state.lang].rate_live_lbl}: ${getActiveRateText()}`;
        badge.classList.remove("hidden");
        badge.classList.add("md:inline-flex");
    }
}

function refreshAllCurrencyViews() {
    updateLiveRateBadge();
    renderTrips();
    renderRealMoments();
    renderMobileApp();
    refreshAiAssistantUI();
    const bookingModal = document.getElementById("booking-modal");
    if (bookingModal && !bookingModal.classList.contains("hidden")) {
        renderBookingStep();
    }
    const compareModal = document.getElementById("compare-modal");
    if (compareModal && !compareModal.classList.contains("hidden")) {
        openCompareModal();
    }
}

function setActiveCategoryFilter(cat) {
    state.categoryFilter = cat;
    document.querySelectorAll(".cat-filter-btn").forEach(b => {
        const active = b.dataset.catBtn === cat;
        b.className = active
            ? "cat-filter-btn px-3 py-1.5 rounded-lg text-xs font-extrabold bg-champagne text-carbon-950 transition"
            : "cat-filter-btn px-3 py-1.5 rounded-lg text-xs font-extrabold border border-transparent hover:border-champagne transition";
    });
    const heroCat = document.getElementById("search-category");
    if (heroCat && heroCat.value !== cat) heroCat.value = cat;
    renderTrips();
}

function loadSavedState() {
    const savedTheme = safeGetStorage("mosa_theme");
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
    }

    const savedCurr = safeGetStorage("mosa_currency");
    if (savedCurr && state.rates[savedCurr]) {
        state.currency = savedCurr;
        const currSel = document.getElementById("currency-select");
        if (currSel) currSel.value = savedCurr;
    }

    const savedFavs = safeGetStorage("mosa_favs");
    if (savedFavs) {
        try {
            const arr = JSON.parse(savedFavs);
            if (Array.isArray(arr)) state.favorites = new Set(arr);
        } catch {
            // Ignore malformed JSON
        }
    }
}

async function loadPublicPlatformConfig() {
    try {
        const res = await fetch("/api/public/config", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.ok) return;

        if (Array.isArray(data.trips) && data.trips.length > 0) {
            SAFARI_TRIPS.splice(0, SAFARI_TRIPS.length, ...data.trips);
        }
        if (Array.isArray(data.promos)) {
            state.platformConfig.promos = data.promos;
        }
        if (data.settings && typeof data.settings === "object") {
            state.platformConfig.settings = { ...state.platformConfig.settings, ...data.settings };
            if (data.settings.exchangeMode === "manual") {
                state.rates.EGP = Number(data.settings.manualEgpRate) || state.rates.EGP;
                state.rates.EUR = Number(data.settings.manualEurRate) || state.rates.EUR;
            }
            if (data.settings.siteAnnouncement) {
                const badgeEl = document.querySelector('[data-i18n="hero_badge"]');
                if (badgeEl) badgeEl.textContent = data.settings.siteAnnouncement;
            }
            if (data.settings.maintenanceNotice && !document.getElementById("platform-maintenance-banner")) {
                const bar = document.createElement("div");
                bar.id = "platform-maintenance-banner";
                bar.className = "w-full bg-champagne text-carbon-950 text-xs font-black text-center py-2 px-4 shadow-md z-[55] relative";
                bar.textContent = data.settings.maintenanceNotice;
                document.body.prepend(bar);
            }
        }
        refreshAllCurrencyViews();
    } catch {
        // Silent offline fallback to built-in catalog
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadSavedState();
    initParticles();
    initObservers();
    detectLanguageByCountry(() => {
        refreshAllCurrencyViews();
    });
    initCinematic();

    // Sync live catalog, promos & platform settings from Cloudflare KV + record visit
    loadPublicPlatformConfig();
    let isNewSession = false;
    try {
        if (!sessionStorage.getItem("mosa_sess_tracked")) {
            sessionStorage.setItem("mosa_sess_tracked", "1");
            isNewSession = true;
        }
    } catch { /* ignore */ }
    trackEvent("pageview", { isNewSession });

    // Fetch today's live exchange rates on initial load
    fetchLiveExchangeRates(false).then(() => {
        refreshAllCurrencyViews();
    });

    document.addEventListener("mosa:trips-rendered", renderMobileApp);

    document.querySelectorAll("#theme-toggle, .js-theme-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const isDark = document.documentElement.classList.toggle("dark");
            safeSetStorage("mosa_theme", isDark ? "dark" : "light");
            renderMobileApp();
        });
    });

    const syncLangSelect = e => {
        safeSetStorage("mosa_lang", e.target.value);
        const otherId = e.target.id === "lang-select" ? "mobile-lang-select" : "lang-select";
        const other = document.getElementById(otherId);
        if (other) other.value = e.target.value;
        applyLanguage(e.target.value, () => {
            refreshAllCurrencyViews();
        });
    };
    bindEvent("lang-select", "change", syncLangSelect);
    bindEvent("mobile-lang-select", "change", syncLangSelect);

    bindEvent("currency-select", "change", async e => {
        const nextCurr = e.target.value;
        state.currency = nextCurr;
        safeSetStorage("mosa_currency", nextCurr);
        refreshAllCurrencyViews();

        if (nextCurr === "EGP" || nextCurr === "EUR") {
            await fetchLiveExchangeRates(true);
            refreshAllCurrencyViews();
            showToast(`${I18N[state.lang].toast_rate_live} ${getActiveRateText()}`);
        }
    });

    document.querySelectorAll(".cat-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            setActiveCategoryFilter(btn.dataset.catBtn || "all");
        });
    });

    bindEvent("sort-select", "change", e => {
        state.sortBy = e.target.value;
        renderTrips();
    });

    bindEvent("hero-search-form", "submit", e => {
        e.preventDefault();
        const cat = document.getElementById("search-category")?.value || "all";
        state.booking.adults = +(document.getElementById("search-who")?.value || 2);
        setActiveCategoryFilter(cat);
        document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
        showToast(I18N[state.lang].toast_filtered);
    });

    document.querySelectorAll(".faq-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.nextElementSibling) btn.nextElementSibling.classList.toggle("hidden");
            const icon = btn.querySelector("svg");
            if (icon) icon.classList.toggle("rotate-180");
        });
    });

    bindEvent("nav-book-btn", "click", () => {
        state.booking.step = 1;
        openBookingModal();
    });
    bindEvent("mobile-book-btn", "click", () => {
        document.getElementById("mobile-menu")?.classList.add("hidden");
        state.booking.step = 1;
        openBookingModal();
    });
    bindEvent("close-booking-btn", "click", closeBookingModal);
    bindEvent("booking-prev-btn", "click", () => {
        saveCurrentStepInputs();
        if (state.booking.step > 1) {
            state.booking.step--;
            renderBookingStep();
        }
    });

    bindEvent("booking-next-btn", "click", async () => {
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
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!b.email || !emailRegex.test(b.email)) {
                const u = UI_EXTRAs[state.lang] || UI_EXTRAs.en;
                showToast(u.err_invalid_email, "error");
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

    // Close modals & AI sheet on Escape key or backdrop click
    window.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeBookingModal();
            toggleAiWidget(false);
            closeMomentLightbox();
            document.getElementById("compare-modal")?.classList.add("hidden");
        }
        const mlb = document.getElementById("moments-lightbox");
        if (mlb && !mlb.classList.contains("hidden")) {
            if (e.key === "ArrowLeft") stepMomentLightbox(document.documentElement.dir === "rtl" ? 1 : -1);
            if (e.key === "ArrowRight") stepMomentLightbox(document.documentElement.dir === "rtl" ? -1 : 1);
        }
    });
    document.getElementById("moments-lightbox")?.addEventListener("click", e => {
        if (e.target?.id === "moments-lightbox") closeMomentLightbox();
    });
    ["booking-modal", "compare-modal"].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener("click", e => {
                if (e.target === modal) modal.classList.add("hidden");
            });
        }
    });

    initAiAssistant();

    bindEvent("open-compare-btn", "click", openCompareModal);
    bindEvent("close-compare-btn", "click", () => document.getElementById("compare-modal")?.classList.add("hidden"));
    bindEvent("mobile-menu-btn", "click", () => document.getElementById("mobile-menu")?.classList.toggle("hidden"));
    document.querySelectorAll("#mobile-menu a").forEach(link => {
        link.addEventListener("click", () => document.getElementById("mobile-menu")?.classList.add("hidden"));
    });
});
