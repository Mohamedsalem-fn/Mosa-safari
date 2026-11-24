/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

const LIVE_RATES_APIS = [
    "https://open.er-api.com/v6/latest/USD",
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
    "https://latest.currency-api.pages.dev/v1/currencies/usd.min.json"
];

const CACHE_KEY = "mosa_live_rates_v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes fresh cache

export const state = {
    lang: "ar",
    currency: "USD",
    rates: { USD: 1, EGP: 49.5, EUR: 0.92 },
    ratesUpdatedAt: null,
    ratesIsLive: false,
    symbols: { USD: "$", EGP: "ج.م ", EUR: "€" },
    categoryFilter: "all",
    sortBy: "featured",
    heroSlideIdx: 0,
    favorites: new Set(),
    compareIds: [],
    platformConfig: {
        promos: [{ code: "MOSA20", discount: 20, active: true }],
        settings: {
            siteAnnouncement: "",
            groupDiscountMin: 5,
            groupDiscountPct: 10,
            exchangeMode: "auto",
            manualEgpRate: 50.5,
            manualEurRate: 0.92,
            enableMorningSlot: true,
            enableEveningSlot: true,
            enablePayArrival: true,
            enablePayVisa: true,
            maintenanceNotice: ""
        }
    },
    booking: {
        step: 1,
        selectedIds: ["mosa-sunrise"],
        name: "",
        phone: "",
        email: "",
        nationality: "Egyptian",
        adults: 2,
        children: 0,
        vehicleOpt: "Double ATV Quad",
        pickupRoute: "route1",
        pickupStation: "naama",
        pickupTime: "04:15 ص",
        pickupHotel: "",
        tripDate: "",
        tripTime: "morning",
        paymentMethod: "arrival",
        promoCode: "",
        cardHolder: "",
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        isSubmitting: false,
        lastConfirmation: null
    }
};

/**
 * Format a USD price into the currently selected currency.
 * @param {number} usd - Price in USD.
 * @returns {string}
 */
export function fmtPrice(usd) {
    const rate = state.rates[state.currency] || 1;
    const val = usd * rate;
    const sym = state.symbols[state.currency] || "$";
    return state.currency === "EGP" ? `${Math.round(val).toLocaleString()} ${sym}` : `${sym}${val.toFixed(2)}`;
}

/**
 * Format the current exchange rate badge text for 1 USD.
 * @returns {string}
 */
export function getActiveRateText() {
    if (state.currency === "USD") return "1 USD = $1.00";
    const r = state.rates[state.currency];
    if (!r) return "";
    const formatted = state.currency === "EGP" ? r.toFixed(2) : r.toFixed(3);
    return `1 USD = ${formatted} ${state.currency}`;
}

export function trackEvent(event, extra = {}) {
    try {
        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event,
                lang: state.lang || "ar",
                currency: state.currency || "USD",
                device: typeof window !== "undefined" && window.innerWidth < 640 ? "mobile" : "desktop",
                ...extra
            }),
            keepalive: true
        }).catch(() => {});
    } catch {
        // Silent analytics failure
    }
}

export function safeGetStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function safeSetStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage errors in restricted environments
    }
}

function parseRatesPayload(data) {
    if (!data || typeof data !== "object") return null;
    // Format 1: open.er-api.com -> { rates: { EGP: ..., EUR: ... } }
    if (data.rates && typeof data.rates.EGP === "number" && typeof data.rates.EUR === "number") {
        return {
            EGP: data.rates.EGP,
            EUR: data.rates.EUR
        };
    }
    // Format 2: fawazahmed0 currency-api -> { usd: { egp: ..., eur: ... } }
    if (data.usd && typeof data.usd.egp === "number" && typeof data.usd.eur === "number") {
        return {
            EGP: data.usd.egp,
            EUR: data.usd.eur
        };
    }
    return null;
}

/**
 * Fetch live USD -> EGP & EUR exchange rates with multi-CDN fallback and caching.
 * @param {boolean} [forceRefresh=false] - Bypass cache TTL and fetch live immediately.
 * @returns {Promise<{USD: number, EGP: number, EUR: number, isLive: boolean}>}
 */
export async function fetchLiveExchangeRates(forceRefresh = false) {
    if (state.platformConfig?.settings?.exchangeMode === "manual") {
        state.rates.EGP = Number(state.platformConfig.settings.manualEgpRate) || state.rates.EGP;
        state.rates.EUR = Number(state.platformConfig.settings.manualEurRate) || state.rates.EUR;
        state.ratesIsLive = false;
        return { ...state.rates, isLive: false };
    }
    if (!forceRefresh) {
        const cachedRaw = safeGetStorage(CACHE_KEY);
        if (cachedRaw) {
            try {
                const cached = JSON.parse(cachedRaw);
                if (
                    cached &&
                    cached.ts &&
                    Date.now() - cached.ts < CACHE_TTL_MS &&
                    typeof cached.EGP === "number" &&
                    typeof cached.EUR === "number"
                ) {
                    state.rates.EGP = cached.EGP;
                    state.rates.EUR = cached.EUR;
                    state.ratesUpdatedAt = cached.ts;
                    state.ratesIsLive = true;
                    return { ...state.rates, isLive: true };
                }
            } catch {
                // Ignore corrupted cache
            }
        }
    }

    for (const url of LIVE_RATES_APIS) {
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 4500);
            const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
            clearTimeout(timer);
            if (!res.ok) continue;
            const data = await res.json();
            const parsed = parseRatesPayload(data);
            if (parsed && parsed.EGP > 1 && parsed.EUR > 0.1) {
                state.rates.EGP = parsed.EGP;
                state.rates.EUR = parsed.EUR;
                state.ratesUpdatedAt = Date.now();
                state.ratesIsLive = true;
                safeSetStorage(
                    CACHE_KEY,
                    JSON.stringify({
                        EGP: parsed.EGP,
                        EUR: parsed.EUR,
                        ts: state.ratesUpdatedAt
                    })
                );
                return { ...state.rates, isLive: true };
            }
        } catch {
            // Try next fallback endpoint
        }
    }

    return { ...state.rates, isLive: state.ratesIsLive };
}
