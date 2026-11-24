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

const SESSION_COOKIE_NAME = "__Host-mosa_admin_session";
const SESSION_TTL_SEC = 43200; // 12 hours
const RATE_LIMIT_WINDOW_SEC = 900; // 15 minutes
const RATE_LIMIT_MAX_FAILS = 5;

function withSecurityHeaders(response) {
    const h = new Headers(response.headers);
    h.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
    );
    h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    h.set("X-Frame-Options", "DENY");
    h.set("X-Content-Type-Options", "nosniff");
    h.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    h.set("Referrer-Policy", "no-referrer");
    h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    h.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: h
    });
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        ...extraHeaders
    };
    return withSecurityHeaders(new Response(JSON.stringify(data), { status, headers }));
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

async function kvPutJson(env, key, value, options = {}) {
    if (!env.MOSA_KV) return false;
    await env.MOSA_KV.put(key, JSON.stringify(value), options);
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

function maskIp(ip) {
    const s = String(ip || "unknown");
    if (s.includes(".")) {
        const parts = s.split(".");
        return parts.length === 4 ? `${parts[0]}.${parts[1]}.x.x` : "ipv4";
    }
    if (s.includes(":")) {
        return s.split(":").slice(0, 3).join(":") + "::xxxx";
    }
    return "unknown";
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

function getCookie(request, name) {
    const raw = request.headers.get("Cookie") || "";
    const parts = raw.split(";");
    for (const part of parts) {
        const eqIdx = part.indexOf("=");
        if (eqIdx === -1) continue;
        const k = part.slice(0, eqIdx).trim();
        if (k === name) return part.slice(eqIdx + 1).trim();
    }
    return "";
}

async function signSessionToken(env, ttlSeconds = SESSION_TTL_SEC) {
    const now = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();
    const csrf = crypto.randomUUID();
    const payload = { sub: "admin", jti, csrf, iat: now, exp: now + ttlSeconds };
    const payloadB64 = toBase64Url(JSON.stringify(payload));
    const key = await getHmacKey(env.ADMIN_JWT_SECRET);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
    return { token: `${payloadB64}.${toBase64Url(sig)}`, payload };
}

async function verifyAdminSession(request, env) {
    if (!env.ADMIN_PASSWORD || !env.ADMIN_JWT_SECRET) {
        return { ok: false, error: "Server auth secrets are not configured", status: 500 };
    }
    const token = getCookie(request, SESSION_COOKIE_NAME);
    if (!token || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
        return { ok: false, error: "Unauthorized", status: 401 };
    }

    const [payloadB64, sigB64] = token.split(".");
    try {
        const key = await getHmacKey(env.ADMIN_JWT_SECRET);
        const validSig = await crypto.subtle.verify(
            "HMAC",
            key,
            fromBase64Url(sigB64),
            new TextEncoder().encode(payloadB64)
        );
        if (!validSig) return { ok: false, error: "Invalid session signature", status: 401 };

        const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
        const now = Math.floor(Date.now() / 1000);
        if (!payload.exp || payload.exp <= now || !payload.jti || !payload.csrf) {
            return { ok: false, error: "Session expired", status: 401 };
        }

        if (env.MOSA_KV) {
            const revoked = await env.MOSA_KV.get(`mosa:revoked:${payload.jti}`);
            if (revoked) return { ok: false, error: "Session revoked", status: 401 };
        }
        return { ok: true, payload };
    } catch {
        return { ok: false, error: "Malformed session token", status: 401 };
    }
}

function verifyOriginHeaders(request, url) {
    const secFetchSite = (request.headers.get("Sec-Fetch-Site") || "").toLowerCase();
    if (secFetchSite === "cross-site") return false;
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) return false;
    return true;
}

async function verifyCsrfAndOrigin(request, url, sessionPayload) {
    if (!verifyOriginHeaders(request, url)) return false;
    const csrfHdr = request.headers.get("X-CSRF-Token") || "";
    if (!csrfHdr || !sessionPayload?.csrf) return false;
    return timingSafeStringMatch(csrfHdr, sessionPayload.csrf);
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
            // Continue remaining owner phones
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
                body: JSON.stringify({ from: fromAddr, to: [to], subject, html, text })
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

async function handleLogin(request, env, url) {
    if (!verifyOriginHeaders(request, url)) {
        return jsonResponse({ ok: false, error: "Forbidden origin" }, 403);
    }
    if (!env.ADMIN_PASSWORD || !env.ADMIN_JWT_SECRET) {
        return jsonResponse({ ok: false, error: "Auth secrets are not configured" }, 500);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rlKey = `mosa:ratelimit:${ip}`;
    const nowMs = Date.now();
    const rlState = env.MOSA_KV ? await kvGetJson(env, rlKey, { count: 0, firstAttemptMs: nowMs }) : { count: 0, firstAttemptMs: nowMs };

    if (rlState.count >= RATE_LIMIT_MAX_FAILS && (nowMs - rlState.firstAttemptMs) < RATE_LIMIT_WINDOW_SEC * 1000) {
        const retryAfter = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_SEC * 1000 - (nowMs - rlState.firstAttemptMs)) / 1000));
        return jsonResponse(
            { ok: false, error: `تم حظر المحاولات مؤقتاً (${retryAfter}s) — Too many failed attempts`, retryAfter },
            429,
            { "Retry-After": String(retryAfter) }
        );
    }

    try {
        const body = await request.json();
        const matched = await timingSafeStringMatch(body?.password || "", env.ADMIN_PASSWORD);

        if (!matched) {
            const freshWindow = (nowMs - rlState.firstAttemptMs) >= RATE_LIMIT_WINDOW_SEC * 1000;
            const nextState = {
                count: freshWindow ? 1 : rlState.count + 1,
                firstAttemptMs: freshWindow ? nowMs : rlState.firstAttemptMs
            };
            if (env.MOSA_KV) {
                await kvPutJson(env, rlKey, nextState, { expirationTtl: RATE_LIMIT_WINDOW_SEC });
                if (nextState.count === RATE_LIMIT_MAX_FAILS) {
                    await appendAudit(env, "LOGIN_LOCKOUT", `Rate-limited IP ${maskIp(ip)} after 5 failed attempts`);
                }
            }
            return jsonResponse({ ok: false, error: "Invalid credentials" }, 401);
        }

        if (env.MOSA_KV) await env.MOSA_KV.delete(rlKey);

        const { token, payload } = await signSessionToken(env, SESSION_TTL_SEC);
        await appendAudit(env, "ADMIN_LOGIN", `Authenticated isolated session from ${maskIp(ip)}`);

        return jsonResponse(
            { ok: true, csrfToken: payload.csrf, expiresIn: SESSION_TTL_SEC },
            200,
            {
                "Set-Cookie": `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SEC}`
            }
        );
    } catch {
        return jsonResponse({ ok: false, error: "Invalid request payload" }, 400);
    }
}

async function handleAdminRoute(request, env, url) {
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
        return handleLogin(request, env, url);
    }

    const auth = await verifyAdminSession(request, env);
    if (!auth.ok) return jsonResponse({ ok: false, error: auth.error }, auth.status || 401);

    if (url.pathname === "/api/admin/session" && request.method === "GET") {
        return jsonResponse({ ok: true, csrfToken: auth.payload.csrf, expiresAt: auth.payload.exp });
    }

    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
    if (isMutating) {
        const csrfOk = await verifyCsrfAndOrigin(request, url, auth.payload);
        if (!csrfOk) {
            await appendAudit(env, "CSRF_BLOCKED", `Blocked ${request.method} ${url.pathname} (invalid CSRF or Origin)`);
            return jsonResponse({ ok: false, error: "CSRF or Origin validation failed" }, 403);
        }
    }

    if (url.pathname === "/api/admin/logout" && request.method === "POST") {
        const now = Math.floor(Date.now() / 1000);
        const remTtl = Math.max(60, (auth.payload.exp || now) - now);
        if (env.MOSA_KV) {
            await env.MOSA_KV.put(`mosa:revoked:${auth.payload.jti}`, "1", { expirationTtl: remTtl });
            await appendAudit(env, "ADMIN_LOGOUT", "Session revoked and cookie cleared");
        }
        return jsonResponse(
            { ok: true },
            200,
            { "Set-Cookie": `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` }
        );
    }

    if (url.pathname === "/api/admin/password" && request.method === "POST") {
        return jsonResponse({
            ok: false,
            error: "On Cloudflare Workers, rotate ADMIN_PASSWORD via: npx wrangler secret put ADMIN_PASSWORD"
        }, 501);
    }

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
                isolatedWorker: true,
                httpOnlyCookie: true,
                csrfProtected: true,
                kvBound: Boolean(env.MOSA_KV),
                greenApiConfigured: Boolean(env.GREEN_API_TOKEN),
                resendConfigured: Boolean(env.RESEND_API_KEY),
                adminSecretSet: Boolean(env.ADMIN_PASSWORD),
                jwtSecretSet: Boolean(env.ADMIN_JWT_SECRET),
                serverTime: new Date().toISOString()
            }
        });
    }

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

    if (url.pathname === "/api/admin/settings" && request.method === "PUT") {
        const body = await request.json();
        const current = await getSettings(env);
        const updated = { ...current, ...(body.settings || {}) };
        await kvPutJson(env, KV_KEYS.SETTINGS, updated);
        await appendAudit(env, "SETTINGS_UPDATE", "Updated platform configuration and integration controls");
        return jsonResponse({ ok: true, settings: updated });
    }

    if (url.pathname === "/api/admin/test-notification" && request.method === "POST") {
        const { target, to } = await request.json();
        const settings = await getSettings(env);
        if (target === "whatsapp") {
            const res = await sendOwnerWhatsApp(
                env,
                `✅ *اختبار نظام التنبيهات — موسى سفاري*\nتم الاتصال بنجاح من لوحة التحكم المعزولة (${new Date().toLocaleString("ar-EG")})`,
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
                html: `<p>Resend Email API test succeeded at <strong>${new Date().toISOString()}</strong>.</p>`,
                text: `Resend Email API test succeeded at ${new Date().toISOString()}.`
            });
            await appendAudit(env, "TEST_EMAIL", res.ok ? `Sent to ${recipient}` : `Failed: ${res.reason}`);
            return jsonResponse({ ok: res.ok, id: res.id, error: res.reason });
        }
        return jsonResponse({ ok: false, error: "Invalid target" }, 400);
    }

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

        if (url.pathname.startsWith("/api/admin")) {
            return handleAdminRoute(request, env, url);
        }

        if ((request.method === "GET" || request.method === "HEAD") && (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/admin" || url.pathname === "/admin/")) {
            const rewritten = new URL(url.toString());
            rewritten.pathname = "/";
            const res = await env.ASSETS.fetch(new Request(rewritten.toString(), request));
            return withSecurityHeaders(res);
        }

        if ((request.method === "GET" || request.method === "HEAD") && (url.pathname === "/robots.txt" || url.pathname.startsWith("/assets/"))) {
            const res = await env.ASSETS.fetch(request);
            return withSecurityHeaders(res);
        }

        return withSecurityHeaders(new Response("Not Found", { status: 404 }));
    }
};
