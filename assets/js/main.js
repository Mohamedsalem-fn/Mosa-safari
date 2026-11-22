/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { I18N, AI_GREETINGS } from "./data/i18n.js";
import { state, safeSetStorage } from "./state.js";
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
    toggleFav,
    toggleCompare,
    openCompareModal
} from "./modules/trips.js";
import {
    openBookingWithTrip,
    openBookingModal,
    closeBookingModal,
    toggleBookingTrip,
    renderBookingStep
} from "./modules/booking.js";
import {
    appendAiMsg,
    handleAiQuery,
    toggleAiWidget
} from "./modules/ai-assistant.js";

// Expose handlers used by inline HTML attributes
window.state = state;
window.showToast = showToast;
window.setHeroPreview = setHeroPreview;
window.switchHubTab = switchHubTab;
window.toggleFav = toggleFav;
window.toggleCompare = toggleCompare;
window.openBookingWithTrip = openBookingWithTrip;
window.toggleBookingTrip = toggleBookingTrip;
window.renderBookingStep = renderBookingStep;
window.openBookingModal = openBookingModal;
window.toggleAiWidget = toggleAiWidget;

function bindEvent(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

window.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initObservers();
    renderTrips();

    bindEvent("theme-toggle", "click", () => {
        document.documentElement.classList.toggle("dark");
        if (window.lucide) window.lucide.createIcons();
    });

    detectLanguageByCountry(renderTrips);

    bindEvent("lang-select", "change", e => {
        safeSetStorage("mosa_lang", e.target.value);
        applyLanguage(e.target.value, renderTrips);
    });

    bindEvent("currency-select", "change", e => {
        state.currency = e.target.value;
        renderTrips();
    });

    document.querySelectorAll(".city-filter-btn, .hero-tab, .dest-card").forEach(btn => {
        btn.addEventListener("click", () => {
            const city = btn.dataset.cityBtn || btn.dataset.quickCat || btn.dataset.filterCity;
            state.cityFilter = city;
            document.querySelectorAll(".city-filter-btn").forEach(b => {
                b.className = b.dataset.cityBtn === city
                    ? "city-filter-btn px-3.5 py-2 rounded-lg text-xs font-extrabold bg-champagne text-carbon-950 transition"
                    : "city-filter-btn px-3.5 py-2 rounded-lg text-xs font-extrabold border border-carbon-900/15 dark:border-white/15 hover:border-champagne transition";
            });
            renderTrips();
            if (btn.classList.contains("dest-card") || btn.classList.contains("hero-tab")) {
                document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    bindEvent("sort-select", "change", e => {
        state.sortBy = e.target.value;
        renderTrips();
    });

    bindEvent("hero-search-form", "submit", e => {
        e.preventDefault();
        state.cityFilter = document.getElementById("search-where")?.value || "all";
        state.booking.adults = +(document.getElementById("search-who")?.value || 2);
        renderTrips();
        document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
        showToast(I18N[state.lang].toast_filtered);
    });

    document.querySelectorAll(".faq-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.nextElementSibling) btn.nextElementSibling.classList.toggle("hidden");
            const icon = btn.querySelector("i, svg");
            if (icon) icon.classList.toggle("rotate-180");
        });
    });

    bindEvent("nav-book-btn", "click", openBookingModal);
    bindEvent("mobile-book-btn", "click", openBookingModal);
    bindEvent("close-booking-btn", "click", closeBookingModal);
    bindEvent("booking-prev-btn", "click", () => {
        if (state.booking.step > 1) {
            state.booking.step--;
            renderBookingStep();
        }
    });

    bindEvent("booking-next-btn", "click", () => {
        const b = state.booking;
        if (b.step === 3) {
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
        if (b.step === 5) b.pickupHotel = document.getElementById("bk-hotel")?.value.trim() || "";
        if (b.step < 6) {
            b.step++;
            renderBookingStep();
        } else {
            const ref = "MOSA-" + Math.floor(100000 + Math.random() * 900000);
            closeBookingModal();
            showToast(`${I18N[state.lang].toast_bk_ok} ${ref}`);
            state.booking.step = 1;
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

    if (window.lucide) window.lucide.createIcons();
});
