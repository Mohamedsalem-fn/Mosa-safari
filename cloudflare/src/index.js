/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

async function sendResendEmail(env, { to, subject, html, text }) {
    const apiKey = env.RESEND_API_KEY || "";
    if (!apiKey || !to) return { ok: false };

    const senders = [
        env.EMAIL_FROM || "Mosa Safari <bookings@mosasafari.com>",
        "Mosa Safari <onboarding@resend.dev>"
    ];

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
        } catch {
            // Try fallback sender
        }
    }
    return { ok: false };
}

async function handleNotifyBooking(request, env) {
    try {
        const body = await request.json();
        const { payload, subject, text, html, whatsappAlreadySent } = body || {};
        let whatsappSent = Boolean(whatsappAlreadySent);
        let emailSent = false;

        // 1. Send Owner WhatsApp via Green API if not already sent by client
        const greenUrl = env.GREEN_API_URL || "https://7107.api.greenapi.com";
        const greenInstance = env.GREEN_ID_INSTANCE || "710722810410";
        const greenToken = env.GREEN_API_TOKEN || "";
        const ownerPhones = (env.OWNER_WHATSAPP_PHONES || "201207823884,201118748922").split(",");

        if (!whatsappSent && payload && greenToken) {
            const endpoint = `${greenUrl}/waInstance${greenInstance}/sendMessage/${greenToken}`;
            for (const rawPhone of ownerPhones) {
                const digits = String(rawPhone).replace(/\D/g, "");
                if (!digits) continue;
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chatId: `${digits}@c.us`,
                        message: text || `New Booking ${payload.ref} - ${payload.name} (${payload.phone})`
                    })
                });
                if (res.ok) whatsappSent = true;
            }
        }

        // 2. Send Customer Confirmation Email via Resend API
        if (payload && payload.email && env.RESEND_API_KEY) {
            const emailRes = await sendResendEmail(env, {
                to: payload.email,
                subject: subject || `Booking Confirmation ${payload.ref}`,
                html: html || `<pre>${text}</pre>`,
                text: text || ""
            });
            if (emailRes.ok) emailSent = true;
        }

        return new Response(JSON.stringify({ ok: true, whatsappSent, emailSent }), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store"
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err?.message || "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Handle booking notification POST endpoint (matches frontend path)
        if (
            request.method === "POST" &&
            (url.pathname === "/.netlify/functions/notify-booking" || url.pathname === "/api/notify-booking")
        ) {
            return handleNotifyBooking(request, env);
        }

        // Serve static website assets with security headers
        const response = await env.ASSETS.fetch(request);
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
