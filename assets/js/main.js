/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { I18N, AI_GREETINGS } from "./data/i18n.js";
import { SAFARI_TRIPS } from "./data/trips.js";
import {
    state,
    fmtPrice,
    getActiveRateText,
    fetchLiveExchangeRates,
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
    getTripTitle,
    toggleFav,
    toggleCompare,
    openCompareModal
} from "./modules/trips.js";
import {
    calcBookingTotal,
    openBookingWithTrip,
    openBookingModal,
    closeBookingModal,
    toggleBookingTrip,
    applyPromoCode,
    renderBookingStep
} from "./modules/booking.js";
import {
    appendAiMsg,
    handleAiQuery,
    toggleAiWidget
} from "./modules/ai-assistant.js";
import { initCinematic } from "./cinematic.js";

// Expose handlers used by inline HTML attributes
window.state = state;
window.showToast = showToast;
window.setHeroPreview = setHeroPreview;
window.switchHubTab = switchHubTab;
window.toggleFav = toggleFav;
window.toggleCompare = toggleCompare;
window.openBookingWithTrip = openBookingWithTrip;
window.toggleBookingTrip = toggleBookingTrip;
window.applyPromoCode = applyPromoCode;
window.renderBookingStep = renderBookingStep;
window.openBookingModal = openBookingModal;
window.toggleAiWidget = toggleAiWidget;

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

window.addEventListener("DOMContentLoaded", () => {
    loadSavedState();
    initParticles();
    initObservers();
    detectLanguageByCountry(() => {
        refreshAllCurrencyViews();
    });
    initCinematic();

    // Fetch today's live exchange rates on initial load
    fetchLiveExchangeRates(false).then(() => {
        refreshAllCurrencyViews();
    });

    bindEvent("theme-toggle", "click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        safeSetStorage("mosa_theme", isDark ? "dark" : "light");
    });

    bindEvent("lang-select", "change", e => {
        safeSetStorage("mosa_lang", e.target.value);
        applyLanguage(e.target.value, () => {
            refreshAllCurrencyViews();
        });
    });

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
        if (state.booking.step > 1) {
            state.booking.step--;
            renderBookingStep();
        }
    });

    bindEvent("booking-next-btn", "click", () => {
        const b = state.booking;
        if (b.step === 2) {
            b.name = document.getElementById("bk-name")?.value.trim() || "";
            b.phone = document.getElementById("bk-phone")?.value.trim() || "";
            const em = document.getElementById("bk-email");
            const nt = document.getElementById("bk-nat");
            if (em) b.email = em.value.trim();
            if (nt) b.nationality = nt.value.trim();
            if (!b.name || !b.phone) {
                showToast(I18N[state.lang].toast_req_info, "error");
                return;
            }
        }
        if (b.step === 4) {
            b.pickupHotel = document.getElementById("bk-hotel")?.value.trim() || "";
            b.tripDate = document.getElementById("bk-date")?.value || "";
        }
        if (b.step < 5) {
            b.step++;
            renderBookingStep();
        } else {
            const ref = "MOSA-" + Math.floor(100000 + Math.random() * 900000);
            const selectedTours = SAFARI_TRIPS.filter(t => b.selectedIds.includes(t.id))
                .map(t => getTripTitle(t))
                .join(" + ");
            const totalStr = fmtPrice(calcBookingTotal());
            const waText = encodeURIComponent(
                `مرحباً موسى سفاري، أود تأكيد حجزي (${ref}):\n` +
                `• البرامج: ${selectedTours}\n` +
                `• الاسم: ${b.name}\n` +
                `• الهاتف: ${b.phone}\n` +
                `• الضيوف: ${b.adults} بالغين، ${b.children} أطفال\n` +
                `• المركبة: ${b.vehicleOpt}\n` +
                (b.pickupHotel ? `• الفندق: ${b.pickupHotel}\n` : "") +
                (b.tripDate ? `• التاريخ: ${b.tripDate}\n` : "") +
                `• الإجمالي: ${totalStr}`
            );
            closeBookingModal();
            showToast(`${I18N[state.lang].toast_bk_ok} ${ref}`);
            window.open(`https://wa.me/201118748922?text=${waText}`, "_blank", "noopener,noreferrer");
            state.booking.step = 1;
        }
    });

    // Close modals on Escape key or backdrop click
    window.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeBookingModal();
            document.getElementById("compare-modal")?.classList.add("hidden");
        }
    });
    ["booking-modal", "compare-modal"].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener("click", e => {
                if (e.target === modal) modal.classList.add("hidden");
            });
        }
    });

    bindEvent("ai-fab", "click", () => toggleAiWidget());
    bindEvent("ai-close-btn", "click", () => toggleAiWidget(false));
    bindEvent("ai-lang-select", "change", e => appendAiMsg(AI_GREETINGS[e.target.value], "bot"));
    document.querySelectorAll(".ai-chip").forEach(c => c.addEventListener("click", () => handleAiQuery(c.textContent)));
    bindEvent("ai-form", "submit", e => {
        e.preventDefault();
        const i = document.getElementById("ai-input");
        if (!i || !i.value.trim()) return;
        handleAiQuery(i.value.trim());
        i.value = "";
    });

    bindEvent("open-compare-btn", "click", openCompareModal);
    bindEvent("close-compare-btn", "click", () => document.getElementById("compare-modal")?.classList.add("hidden"));
    bindEvent("mobile-menu-btn", "click", () => document.getElementById("mobile-menu")?.classList.toggle("hidden"));
    document.querySelectorAll("#mobile-menu a").forEach(link => {
        link.addEventListener("click", () => document.getElementById("mobile-menu")?.classList.add("hidden"));
    });
});
