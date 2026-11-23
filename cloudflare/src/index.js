/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

const KV_KEYS = {
    BOOKINGS: "mosa:bookings",
    TRIPS: "mosa:trips",
    PROMOS: "mosa:promos",
    SETTINGS: "mosa:settings",
    ANALYTICS: "mosa:analytics",
    AUDIT: "mosa:audit"
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

async function appendAudit(env, action, details) {
    const list = await kvGetJson(env, KV_KEYS.AUDIT, []);
    const arr = Array.isArray(list) ? list : [];
    arr.unshift({
        id: "AUD-" + Date.now().toString(36).toUpperCase(),
        timestamp: new Date().toISOString(),
        action,
        details
    });
    await kvPutJson(env, KV_KEYS.AUDIT, arr.slice(0, 100));
}

function toBase64Url(bytesOrString) {
    const bytes = typeof bytesOrString === "string"
        ? new TextEncoder().encode(bytesOrString)
        : new Uint8Array(bytesOrString);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str) {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
}

async function getHmacKey(secret) {
    return crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

async function timingSafeStringMatch(a, b) {
    const enc = new TextEncoder();
    const ha = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(String(a))));
    const hb = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(String(b))));
    let diff = 0;
    for (let i = 0; i < ha.length; i++) {
        diff |= ha[i] ^ hb[i];
    }
    return diff === 0;
}

async function signAdminToken(env, ttlSeconds = 86400) {
    const now = Math.floor(Date.now() / 1000);
    const payload = { sub: "admin", iat: now, exp: now + ttlSeconds };
    const payloadB64 = toBase64Url(JSON.stringify(payload));
    const key = await getHmacKey(env.ADMIN_PASSWORD);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
    return `${payloadB64}.${toBase64Url(sig)}`;
}

async function verifyAdminToken(request, env) {
    if (!env.ADMIN_PASSWORD) return { ok: false, error: "Admin password secret is not configured" };
    const auth = request.headers.get("Authorization") || "";
    const match = auth.match(/^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/);
    if (!match) return { ok: false, error: "Unauthorized" };

    const [payloadB64, sigB64] = match[1].split(".");
    try {
        const key = await getHmacKey(env.ADMIN_PASSWORD);
        const validSig = await crypto.subtle.verify(
            "HMAC",
            key,
            fromBase64Url(sigB64),
            new TextEncoder().encode(payloadB64)
        );
        if (!validSig) return { ok: false, error: "Invalid token" };

        const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
        if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
            return { ok: false, error: "Session expired" };
        }
        return { ok: true, payload };
    } catch {
        return { ok: false, error: "Invalid token" };
    }
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

async function sendResendEmail(env, { to, subject, html, text }) {
    const apiKey = env.RESEND_API_KEY || "";
    if (!apiKey || !to) return { ok: false, reason: "Missing RESEND_API_KEY or recipient" };

    const senders = [
        env.EMAIL_FROM || "Mosa Safari <bookings@mosasafari.com>",
        "Mosa Safari <onboarding@resend.dev>"
    ];

    let lastErr = "Email send failed";
    for (const fromAddr of senders) {
        try {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: fromAddr,
                    to: [to],
                    subject,
                    html,
                    text
                })
            });
            if (res.ok) {
                const data = await res.json();
                return { ok: true, id: data?.id };
            }
            lastErr = `HTTP ${res.status}`;
        } catch (err) {
            lastErr = err?.message || "Network error";
        }
    }
    return { ok: false, reason: lastErr };
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
            if (body?.isNewSession) {
                analytics.uniqueSessions = (analytics.uniqueSessions || 0) + 1;
            }
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

        if (payload && payload.email && settings.emailEnabled !== false && env.RESEND_API_KEY) {
            const emailRes = await sendResendEmail(env, {
                to: payload.email,
                subject: subject || `Booking Confirmation ${payload.ref}`,
                html: html || `<pre>${text}</pre>`,
                text: text || ""
            });
            if (emailRes.ok) emailSent = true;
        }

        // Persist booking, promo usage & daily metrics to KV
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

async function handleAdminRoute(request, env, url) {
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
        if (!env.ADMIN_PASSWORD) {
            return jsonResponse({ ok: false, error: "ADMIN_PASSWORD secret is not configured" }, 500);
        }
        try {
            const body = await request.json();
            const matched = await timingSafeStringMatch(body?.password || "", env.ADMIN_PASSWORD);
            if (!matched) return jsonResponse({ ok: false, error: "Invalid credentials" }, 401);
            const token = await signAdminToken(env, 86400);
            await appendAudit(env, "ADMIN_LOGIN", "Authenticated session issued");
            return jsonResponse({ ok: true, token, expiresIn: 86400 });
        } catch {
            return jsonResponse({ ok: false, error: "Invalid request payload" }, 400);
        }
    }

    const auth = await verifyAdminToken(request, env);
    if (!auth.ok) return jsonResponse({ ok: false, error: auth.error }, 401);

    // GET /api/admin/overview
    if (url.pathname === "/api/admin/overview" && request.method === "GET") {
        const [bookings, trips, promos, settings, analytics, auditLog] = await Promise.all([
            kvGetJson(env, KV_KEYS.BOOKINGS, []),
            kvGetJson(env, KV_KEYS.TRIPS, null),
            getPromos(env),
            getSettings(env),
            getAnalytics(env),
            kvGetJson(env, KV_KEYS.AUDIT, [])
        ]);

        return jsonResponse({
            ok: true,
            bookings: Array.isArray(bookings) ? bookings : [],
            trips: Array.isArray(trips) ? trips : null,
            promos,
            settings,
            analytics,
            auditLog: Array.isArray(auditLog) ? auditLog : [],
            health: {
                kvBound: Boolean(env.MOSA_KV),
                greenApiConfigured: Boolean(env.GREEN_API_TOKEN),
                resendConfigured: Boolean(env.RESEND_API_KEY),
                adminSecretSet: Boolean(env.ADMIN_PASSWORD),
                serverTime: new Date().toISOString()
            }
        });
    }

    // POST /api/admin/bookings (Manual Booking)
    if (url.pathname === "/api/admin/bookings" && request.method === "POST") {
        const body = await request.json();
        const bookings = await kvGetJson(env, KV_KEYS.BOOKINGS, []);
        const arr = Array.isArray(bookings) ? bookings : [];
        const ref = body.ref || ("MOSA-" + Math.floor(100000 + Math.random() * 900000));
        const totalUsd = Number(body.totalUsd) || 0;
        const createdAt = new Date().toISOString();
        const record = {
            ref,
            createdAt,
            status: body.status || "confirmed",
            source: "manual",
            lang: body.lang || "ar",
            currency: "USD",
            name: String(body.name || "").trim(),
            phone: String(body.phone || "").trim(),
            email: String(body.email || "").trim(),
            nationality: String(body.nationality || "").trim(),
            adults: Number(body.adults) || 2,
            children: Number(body.children) || 0,
            vehicleOpt: body.vehicleOpt || "Double ATV Quad",
            vehicleDisplay: body.vehicleDisplay || body.vehicleOpt || "Double ATV Quad",
            pickupHotel: body.pickupHotel || "Sharm El Sheikh",
            tripDate: body.tripDate || createdAt.split("T")[0],
            tripTime: body.tripTime || "morning",
            tripTimeDisplay: body.tripTime === "evening" ? "مساءً (الغروب)" : "صباحاً",
            paymentMethod: body.paymentMethod || "arrival",
            cardMask: "",
            promoCode: (body.promoCode || "").toUpperCase(),
            selectedIds: Array.isArray(body.selectedIds) ? body.selectedIds : [],
            selectedTours: body.selectedTours || "",
            totalUsd,
            totalFormatted: body.totalFormatted || `$${totalUsd.toFixed(2)}`,
            whatsappSent: false,
            emailSent: false,
            adminNotes: String(body.adminNotes || "")
        };
        arr.unshift(record);
        await kvPutJson(env, KV_KEYS.BOOKINGS, arr);

        const today = createdAt.split("T")[0];
        const analytics = await getAnalytics(env);
        analytics.bookingsCompleted = (analytics.bookingsCompleted || 0) + 1;
        if (!analytics.daily[today]) analytics.daily[today] = { views: 0, modalOpens: 0, bookings: 0, revenueUsd: 0 };
        analytics.daily[today].bookings += 1;
        analytics.daily[today].revenueUsd = Number((analytics.daily[today].revenueUsd + totalUsd).toFixed(2));
        analytics.daily = pruneDailyAnalytics(analytics.daily);
        await kvPutJson(env, KV_KEYS.ANALYTICS, analytics);

        await appendAudit(env, "BOOKING_CREATE", `Manual booking ${ref} for ${record.name} ($${totalUsd.toFixed(2)})`);
        return jsonResponse({ ok: true, booking: record });
    }

    // Match /api/admin/bookings/:ref and /api/admin/bookings/:ref/resend
    const resendMatch = url.pathname.match(/^\/api\/admin\/bookings\/([^/]+)\/resend$/);
    if (resendMatch && request.method === "POST") {
        const ref = decodeURIComponent(resendMatch[1]);
        const { target } = await request.json();
        const bookings = await kvGetJson(env, KV_KEYS.BOOKINGS, []);
        const arr = Array.isArray(bookings) ? bookings : [];
        const bk = arr.find(b => b.ref === ref);
        if (!bk) return jsonResponse({ ok: false, error: "Booking not found" }, 404);

        const settings = await getSettings(env);
        if (target === "whatsapp") {
            const msg = [
                `🐪 *إشعار حجز (إعادة إرسال) — ${bk.ref}*`,
                `👤 العميل: ${bk.name} (${bk.phone})`,
                `🏜️ البرامج: ${bk.selectedTours}`,
                `📅 الموعد: ${bk.tripDate} (${bk.tripTimeDisplay || bk.tripTime})`,
                `🏨 الفندق: ${bk.pickupHotel}`,
                `💰 الإجمالي: ${bk.totalFormatted} (${bk.paymentMethod})`
            ].join("\n");
            const res = await sendOwnerWhatsApp(env, msg, settings.ownerPhones);
            if (res.ok) {
                bk.whatsappSent = true;
                await kvPutJson(env, KV_KEYS.BOOKINGS, arr);
            }
            await appendAudit(env, "BOOKING_RESEND_WA", `Resent WhatsApp alert for ${ref}: ${res.ok ? "OK" : res.reason}`);
            return jsonResponse({ ok: res.ok, error: res.reason });
        }

        if (target === "email") {
            if (!bk.email) return jsonResponse({ ok: false, error: "Booking has no customer email" }, 400);
            const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0E1015;color:#F4EFE6;padding:24px;border-radius:16px;">
                <h2 style="color:#D9B36C;margin:0 0 12px;">Mosa Safari — Booking Confirmation (${bk.ref})</h2>
                <p>Hello <strong>${bk.name}</strong>,</p>
                <p>Your booking details:</p>
                <ul>
                    <li><strong>Tours:</strong> ${bk.selectedTours}</li>
                    <li><strong>Date &amp; Time:</strong> ${bk.tripDate} (${bk.tripTimeDisplay || bk.tripTime})</li>
                    <li><strong>Hotel:</strong> ${bk.pickupHotel}</li>
                    <li><strong>Guests:</strong> ${bk.adults} Adults${bk.children ? `, ${bk.children} Children` : ""}</li>
                    <li><strong>Total:</strong> ${bk.totalFormatted}</li>
                </ul>
                <p style="color:#9E9990;font-size:12px;">WhatsApp Support: +201023355550 · mosasafari.com</p>
            </div>`;
            const res = await sendResendEmail(env, {
                to: bk.email,
                subject: `Mosa Safari Booking Confirmation — Ref ${bk.ref}`,
                html,
                text: `Mosa Safari Confirmation ${bk.ref} - ${bk.selectedTours} on ${bk.tripDate} - Total ${bk.totalFormatted}`
            });
            if (res.ok) {
                bk.emailSent = true;
                await kvPutJson(env, KV_KEYS.BOOKINGS, arr);
            }
            await appendAudit(env, "BOOKING_RESEND_EMAIL", `Resent email to ${bk.email} for ${ref}: ${res.ok ? "OK" : res.reason}`);
            return jsonResponse({ ok: res.ok, error: res.reason });
        }

        return jsonResponse({ ok: false, error: "Invalid target" }, 400);
    }

    const bkMatch = url.pathname.match(/^\/api\/admin\/bookings\/([^/]+)$/);
    if (bkMatch && request.method === "PATCH") {
        const ref = decodeURIComponent(bkMatch[1]);
        const patch = await request.json();
        const bookings = await kvGetJson(env, KV_KEYS.BOOKINGS, []);
        const arr = Array.isArray(bookings) ? bookings : [];
        const idx = arr.findIndex(b => b.ref === ref);
        if (idx === -1) return jsonResponse({ ok: false, error: "Booking not found" }, 404);

        const allowed = ["status", "adminNotes", "tripDate", "tripTime", "tripTimeDisplay", "pickupHotel", "totalUsd", "totalFormatted", "paymentMethod", "name", "phone", "email", "adults", "children", "vehicleOpt", "vehicleDisplay"];
        for (const k of allowed) {
            if (patch[k] !== undefined) arr[idx][k] = patch[k];
        }
        arr[idx].updatedAt = new Date().toISOString();
        await kvPutJson(env, KV_KEYS.BOOKINGS, arr);
        await appendAudit(env, "BOOKING_UPDATE", `Updated booking ${ref} (status: ${arr[idx].status})`);
        return jsonResponse({ ok: true, booking: arr[idx] });
    }

    if (bkMatch && request.method === "DELETE") {
        const ref = decodeURIComponent(bkMatch[1]);
        const bookings = await kvGetJson(env, KV_KEYS.BOOKINGS, []);
        const arr = Array.isArray(bookings) ? bookings : [];
        const next = arr.filter(b => b.ref !== ref);
        if (next.length === arr.length) return jsonResponse({ ok: false, error: "Booking not found" }, 404);
        await kvPutJson(env, KV_KEYS.BOOKINGS, next);
        await appendAudit(env, "BOOKING_DELETE", `Deleted booking ${ref}`);
        return jsonResponse({ ok: true });
    }

    // PUT /api/admin/trips
    if (url.pathname === "/api/admin/trips" && request.method === "PUT") {
        const body = await request.json();
        if (body.trips === null && env.MOSA_KV) {
            await env.MOSA_KV.delete(KV_KEYS.TRIPS);
            await appendAudit(env, "TRIPS_RESET", "Reset catalog to built-in 8 default safari tours");
            return jsonResponse({ ok: true, trips: null });
        }
        if (!Array.isArray(body.trips)) return jsonResponse({ ok: false, error: "Expected trips array" }, 400);
        await kvPutJson(env, KV_KEYS.TRIPS, body.trips);
        await appendAudit(env, "TRIPS_UPDATE", `Saved ${body.trips.length} safari programs`);
        return jsonResponse({ ok: true, trips: body.trips });
    }

    // PUT /api/admin/promos
    if (url.pathname === "/api/admin/promos" && request.method === "PUT") {
        const body = await request.json();
        if (!Array.isArray(body.promos)) return jsonResponse({ ok: false, error: "Expected promos array" }, 400);
        const normalized = body.promos.map(p => ({
            code: String(p.code || "").trim().toUpperCase(),
            discount: Math.max(1, Math.min(90, Number(p.discount) || 10)),
            active: p.active !== false,
            uses: Number(p.uses) || 0,
            maxUses: Number(p.maxUses) || 0,
            expiresAt: String(p.expiresAt || ""),
            note: String(p.note || "")
        })).filter(p => p.code);
        await kvPutJson(env, KV_KEYS.PROMOS, normalized);
        await appendAudit(env, "PROMOS_UPDATE", `Updated promo catalog (${normalized.length} codes)`);
        return jsonResponse({ ok: true, promos: normalized });
    }

    // PUT /api/admin/settings
    if (url.pathname === "/api/admin/settings" && request.method === "PUT") {
        const body = await request.json();
        const current = await getSettings(env);
        const updated = { ...current, ...(body.settings || {}) };
        await kvPutJson(env, KV_KEYS.SETTINGS, updated);
        await appendAudit(env, "SETTINGS_UPDATE", "Updated platform configuration and integration controls");
        return jsonResponse({ ok: true, settings: updated });
    }

    // POST /api/admin/test-notification
    if (url.pathname === "/api/admin/test-notification" && request.method === "POST") {
        const { target, to } = await request.json();
        const settings = await getSettings(env);
        if (target === "whatsapp") {
            const res = await sendOwnerWhatsApp(
                env,
                `✅ *اختبار نظام التنبيهات — موسى سفاري*\nتم الاتصال بنجاح من لوحة التحكم (${new Date().toLocaleString("ar-EG")})`,
                to || settings.ownerPhones
            );
            await appendAudit(env, "TEST_WHATSAPP", res.ok ? `Sent to ${to || settings.ownerPhones}` : `Failed: ${res.reason}`);
            return jsonResponse({ ok: res.ok, sentCount: res.sentCount, error: res.reason });
        }
        if (target === "email") {
            const recipient = to || "info@mosasafari.com";
            const res = await sendResendEmail(env, {
                to: recipient,
                subject: "Mosa Safari Admin Dashboard — Email Integration Test",
                html: `<p>Resend Email API integration test succeeded at <strong>${new Date().toISOString()}</strong>.</p>`,
                text: `Resend Email API test succeeded at ${new Date().toISOString()}.`
            });
            await appendAudit(env, "TEST_EMAIL", res.ok ? `Sent to ${recipient}` : `Failed: ${res.reason}`);
            return jsonResponse({ ok: res.ok, id: res.id, error: res.reason });
        }
        return jsonResponse({ ok: false, error: "Invalid target" }, 400);
    }

    // POST /api/admin/analytics/reset
    if (url.pathname === "/api/admin/analytics/reset" && request.method === "POST") {
        const blank = defaultAnalytics();
        await kvPutJson(env, KV_KEYS.ANALYTICS, blank);
        await appendAudit(env, "ANALYTICS_RESET", "Reset visitor and funnel analytics counters");
        return jsonResponse({ ok: true, analytics: blank });
    }

    return jsonResponse({ ok: false, error: "Endpoint not found" }, 404);
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

        if (url.pathname.startsWith("/api/admin")) {
            return handleAdminRoute(request, env, url);
        }

        // Route clean /admin path directly to /admin.html static asset
        let assetRequest = request;
        if (request.method === "GET" && (url.pathname === "/admin" || url.pathname === "/admin/")) {
            const rewritten = new URL(url.toString());
            rewritten.pathname = "/admin.html";
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
