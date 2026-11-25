/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { dispatchPlatformEmail } from "./mail.js";

const KV_KEYS = {
    BOOKINGS: "mosa:bookings",
    TRIPS: "mosa:trips",
    PROMOS: "mosa:promos",
    SETTINGS: "mosa:settings",
    ANALYTICS: "mosa:analytics"
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

function defaultPromos() {
    return [
        {
            code: "MOSA20",
            discount: 20,
            active: true,
            uses: 0,
            maxUses: 0,
            expiresAt: "2026-12-31",
            note: "Default 20% launch promo code"
        }
    ];
}

function defaultSettings(env) {
    return {
        siteAnnouncement: "",
        ownerPhones: env.OWNER_WHATSAPP_PHONES || "201023355550",
        whatsappEnabled: true,
        emailEnabled: true,
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
    };
}

function defaultAnalytics() {
    return {
        totalViews: 0,
        uniqueSessions: 0,
        modalOpens: 0,
        bookingsCompleted: 0,
        byLang: { ar: 0, en: 0, it: 0, ru: 0 },
        byCurrency: { USD: 0, EGP: 0, EUR: 0 },
        byDevice: { mobile: 0, desktop: 0 },
        tourClicks: {},
        daily: {}
    };
}

async function kvGetJson(env, key, fallbackValue) {
    if (!env.MOSA_KV) return typeof fallbackValue === "function" ? fallbackValue() : fallbackValue;
    try {
        const val = await env.MOSA_KV.get(key, { type: "json" });
        if (val !== null && val !== undefined) return val;
    } catch {
        // Fallback on malformed or transient KV error
    }
    return typeof fallbackValue === "function" ? fallbackValue() : fallbackValue;
}

async function kvPutJson(env, key, value) {
    if (!env.MOSA_KV) return false;
    await env.MOSA_KV.put(key, JSON.stringify(value));
    return true;
}

async function getSettings(env) {
    const saved = await kvGetJson(env, KV_KEYS.SETTINGS, null);
    return { ...defaultSettings(env), ...(saved && typeof saved === "object" ? saved : {}) };
}

async function getPromos(env) {
    const saved = await kvGetJson(env, KV_KEYS.PROMOS, null);
    return Array.isArray(saved) ? saved : defaultPromos();
}

async function getAnalytics(env) {
    const saved = await kvGetJson(env, KV_KEYS.ANALYTICS, null);
    const base = defaultAnalytics();
    if (!saved || typeof saved !== "object") return base;
    return {
        ...base,
        ...saved,
        byLang: { ...base.byLang, ...(saved.byLang || {}) },
        byCurrency: { ...base.byCurrency, ...(saved.byCurrency || {}) },
        byDevice: { ...base.byDevice, ...(saved.byDevice || {}) },
        tourClicks: saved.tourClicks && typeof saved.tourClicks === "object" ? saved.tourClicks : {},
        daily: saved.daily && typeof saved.daily === "object" ? saved.daily : {}
    };
}

function pruneDailyAnalytics(daily) {
    const keys = Object.keys(daily).sort();
    if (keys.length <= 60) return daily;
    const trimmed = {};
    for (const k of keys.slice(keys.length - 60)) {
        trimmed[k] = daily[k];
    }
    return trimmed;
}

async function sendOwnerWhatsApp(env, text, ownerPhonesStr) {
    const greenUrl = env.GREEN_API_URL || "https://7107.api.greenapi.com";
    const greenInstance = env.GREEN_ID_INSTANCE || "710722810425";
    const greenToken = env.GREEN_API_TOKEN || "";
    if (!greenToken || !text) return { ok: false, reason: "Missing GREEN_API_TOKEN" };

    const phones = String(ownerPhonesStr || env.OWNER_WHATSAPP_PHONES || "201023355550")
        .split(",")
        .map(p => p.replace(/\D/g, ""))
        .filter(Boolean);

    let sentCount = 0;
    const endpoint = `${greenUrl}/waInstance${greenInstance}/sendMessage/${greenToken}`;
    for (const digits of phones) {
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId: `${digits}@c.us`, message: text })
            });
            if (res.ok) sentCount++;
        } catch {
            // Continue notifying remaining owner phones
        }
    }
    return { ok: sentCount > 0, sentCount };
}

async function handlePublicConfig(env) {
    const [trips, promos, settings] = await Promise.all([
        kvGetJson(env, KV_KEYS.TRIPS, null),
        getPromos(env),
        getSettings(env)
    ]);

    const today = new Date().toISOString().split("T")[0];
    const activePromos = promos.filter(p => {
        if (p.active === false) return false;
        if (p.maxUses > 0 && (p.uses || 0) >= p.maxUses) return false;
        if (p.expiresAt && p.expiresAt < today) return false;
        return true;
    });

    return jsonResponse({
        ok: true,
        trips: Array.isArray(trips) ? trips : null,
        promos: activePromos.map(p => ({ code: p.code, discount: Number(p.discount) || 0 })),
        settings: {
            siteAnnouncement: settings.siteAnnouncement || "",
            groupDiscountMin: Number(settings.groupDiscountMin) || 5,
            groupDiscountPct: Number(settings.groupDiscountPct) || 10,
            exchangeMode: settings.exchangeMode || "auto",
            manualEgpRate: Number(settings.manualEgpRate) || 50.5,
            manualEurRate: Number(settings.manualEurRate) || 0.92,
            enableMorningSlot: settings.enableMorningSlot !== false,
            enableEveningSlot: settings.enableEveningSlot !== false,
            enablePayArrival: settings.enablePayArrival !== false,
            enablePayVisa: settings.enablePayVisa !== false,
            maintenanceNotice: settings.maintenanceNotice || ""
        }
    });
}

async function handleTrackEvent(request, env) {
    try {
        const body = await request.json();
        const event = body?.event || "pageview";
        const lang = ["ar", "en", "it", "ru"].includes(body?.lang) ? body.lang : "ar";
        const currency = ["USD", "EGP", "EUR"].includes(body?.currency) ? body.currency : "USD";
        const device = body?.device === "mobile" ? "mobile" : "desktop";
        const today = new Date().toISOString().split("T")[0];

        const analytics = await getAnalytics(env);
        if (!analytics.daily[today]) {
            analytics.daily[today] = { views: 0, modalOpens: 0, bookings: 0, revenueUsd: 0 };
        }

        if (event === "pageview") {
            analytics.totalViews = (analytics.totalViews || 0) + 1;
            if (body?.isNewSession) analytics.uniqueSessions = (analytics.uniqueSessions || 0) + 1;
            analytics.byLang[lang] = (analytics.byLang[lang] || 0) + 1;
            analytics.byCurrency[currency] = (analytics.byCurrency[currency] || 0) + 1;
            analytics.byDevice[device] = (analytics.byDevice[device] || 0) + 1;
            analytics.daily[today].views += 1;
        } else if (event === "modal_open") {
            analytics.modalOpens = (analytics.modalOpens || 0) + 1;
            analytics.daily[today].modalOpens += 1;
            if (body?.tripId) {
                const tid = String(body.tripId).slice(0, 64);
                analytics.tourClicks[tid] = (analytics.tourClicks[tid] || 0) + 1;
            }
        } else if (event === "tour_click" && body?.tripId) {
            const tid = String(body.tripId).slice(0, 64);
            analytics.tourClicks[tid] = (analytics.tourClicks[tid] || 0) + 1;
        }

        analytics.daily = pruneDailyAnalytics(analytics.daily);
        await kvPutJson(env, KV_KEYS.ANALYTICS, analytics);
        return jsonResponse({ ok: true });
    } catch {
        return jsonResponse({ ok: false }, 400);
    }
}

async function handleNotifyBooking(request, env) {
    try {
        const body = await request.json();
        const { payload, ownerMessage, subject, text, html, whatsappAlreadySent } = body || {};
        const settings = await getSettings(env);

        let whatsappSent = Boolean(whatsappAlreadySent);
        let emailSent = false;

        if (!whatsappSent && payload && settings.whatsappEnabled !== false) {
            const waText = ownerMessage || text || `New Booking ${payload.ref} - ${payload.name} (${payload.phone})`;
            const waRes = await sendOwnerWhatsApp(env, waText, settings.ownerPhones);
            if (waRes.ok) whatsappSent = true;
        }

        if (payload && payload.email && settings.emailEnabled !== false) {
            const emailRes = await dispatchPlatformEmail(env, {
                to: payload.email,
                subject: subject || `Booking Confirmation ${payload.ref}`,
                html: html || `<pre>${text}</pre>`,
                text: text || ""
            });
            if (emailRes.ok) emailSent = true;
        }

        if (payload && payload.ref && env.MOSA_KV) {
            const bookings = await kvGetJson(env, KV_KEYS.BOOKINGS, []);
            const arr = Array.isArray(bookings) ? bookings : [];
            const exists = arr.some(b => b.ref === payload.ref);

            if (!exists) {
                const totalUsd = Number(payload.totalUsd) || 0;
                const record = {
                    ref: payload.ref,
                    createdAt: new Date().toISOString(),
                    status: "pending",
                    source: "web",
                    lang: payload.lang || "ar",
                    currency: payload.currency || "USD",
                    name: payload.name || "",
                    phone: payload.phone || "",
                    email: payload.email || "",
                    nationality: payload.nationality || "",
                    adults: Number(payload.adults) || 1,
                    children: Number(payload.children) || 0,
                    vehicleOpt: payload.vehicleOpt || "",
                    vehicleDisplay: payload.vehicleDisplay || payload.vehicleOpt || "",
                    pickupRoute: payload.pickupRoute || "",
                    pickupStation: payload.pickupStation || "",
                    pickupTime: payload.pickupTime || "",
                    pickupPointDisplay: payload.pickupPointDisplay || payload.tripTimeDisplay || "",
                    pickupHotel: payload.pickupHotel || "Sharm El Sheikh",
                    tripDate: payload.tripDate || new Date().toISOString().split("T")[0],
                    tripTime: payload.tripTime || "morning",
                    tripTimeDisplay: payload.tripTimeDisplay || "",
                    paymentMethod: payload.paymentMethod || "arrival",
                    cardMask: payload.cardMask || "",
                    promoCode: (payload.promoCode || "").toUpperCase(),
                    selectedIds: Array.isArray(payload.selectedIds) ? payload.selectedIds : [],
                    selectedTours: payload.selectedTours || "",
                    totalUsd,
                    totalFormatted: payload.totalFormatted || `$${totalUsd.toFixed(2)}`,
                    whatsappSent,
                    emailSent,
                    adminNotes: ""
                };
                arr.unshift(record);
                await kvPutJson(env, KV_KEYS.BOOKINGS, arr);

                if (record.promoCode) {
                    const promos = await getPromos(env);
                    let touched = false;
                    for (const p of promos) {
                        if (String(p.code).toUpperCase() === record.promoCode) {
                            p.uses = (p.uses || 0) + 1;
                            touched = true;
                        }
                    }
                    if (touched) await kvPutJson(env, KV_KEYS.PROMOS, promos);
                }

                const today = record.createdAt.split("T")[0];
                const analytics = await getAnalytics(env);
                analytics.bookingsCompleted = (analytics.bookingsCompleted || 0) + 1;
                if (!analytics.daily[today]) {
                    analytics.daily[today] = { views: 0, modalOpens: 0, bookings: 0, revenueUsd: 0 };
                }
                analytics.daily[today].bookings += 1;
                analytics.daily[today].revenueUsd = Number((analytics.daily[today].revenueUsd + totalUsd).toFixed(2));
                analytics.daily = pruneDailyAnalytics(analytics.daily);
                await kvPutJson(env, KV_KEYS.ANALYTICS, analytics);
            }
        }

        return jsonResponse({ ok: true, managed: true, whatsappSent, emailSent });
    } catch (err) {
        return jsonResponse({ ok: false, error: err?.message || "Server error" }, 500);
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/public/config" && request.method === "GET") {
            return handlePublicConfig(env);
        }

        if (url.pathname === "/api/track" && request.method === "POST") {
            return handleTrackEvent(request, env);
        }

        if (
            request.method === "POST" &&
            (url.pathname === "/.netlify/functions/notify-booking" || url.pathname === "/api/notify-booking")
        ) {
            return handleNotifyBooking(request, env);
        }

        let assetRequest = request;
        if (url.pathname === "/tour" || url.pathname.startsWith("/tour/")) {
            const rewritten = new URL(url.toString());
            rewritten.pathname = "/tour.html";
            assetRequest = new Request(rewritten.toString(), request);
        }

        const response = await env.ASSETS.fetch(assetRequest);
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Frame-Options", "SAMEORIGIN");
        newHeaders.set("X-Content-Type-Options", "nosniff");
        newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }
};
