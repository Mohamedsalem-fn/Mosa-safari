/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

export const state = {
    lang: "ar",
    currency: "USD",
    rates: { USD: 1, EGP: 49.5, EUR: 0.92 },
    symbols: { USD: "$", EGP: "ج.م ", EUR: "€" },
    cityFilter: "all",
    sortBy: "featured",
    favorites: new Set(),
    compareIds: [],
    booking: {
        step: 1,
        city: "Sharm El Sheikh",
        selectedIds: ["sharm-sunset-echo"],
        name: "",
        phone: "",
        email: "",
        nationality: "Egyptian",
        adults: 2,
        children: 0,
        vehicleOpt: "Double ATV Quad",
        pickupHotel: "",
        paymentMethod: "arrival",
        promoCode: ""
    }
};

/**
 * Format a USD price into the currently selected currency.
 * @param {number} usd - Price in USD.
 * @returns {string}
 */
export function fmtPrice(usd) {
    const val = usd * state.rates[state.currency];
    const sym = state.symbols[state.currency];
    return state.currency === "EGP" ? `${Math.round(val)} ${sym}` : `${sym}${val.toFixed(2)}`;
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
