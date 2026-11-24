/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

const GREEN_API_URL = process.env.GREEN_API_URL || "https://7107.api.greenapi.com";
const GREEN_ID_INSTANCE = process.env.GREEN_ID_INSTANCE || "710722810425";
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN || "";
const OWNER_PHONES = (process.env.OWNER_WHATSAPP_PHONES || "201023355550").split(",");
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

async function sendResendEmail({ to, subject, html, text }) {
    const senders = [
        process.env.EMAIL_FROM || "Mosa Safari <bookings@mosasafari.com>",
        "Mosa Safari <onboarding@resend.dev>"
    ];

    for (const fromAddr of senders) {
        try {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${RESEND_API_KEY}`,
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

exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { payload, ownerMessage, subject, text, html, whatsappAlreadySent } = body;
        let whatsappSent = Boolean(whatsappAlreadySent);
        let emailSent = false;

        // 1. Send Owner WhatsApp via Green API if configured & not already sent
        if (!whatsappSent && payload && GREEN_API_TOKEN) {
            const endpoint = `${GREEN_API_URL}/waInstance${GREEN_ID_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`;
            const waText = ownerMessage || text || `New Booking ${payload.ref} - ${payload.name} (${payload.phone})`;
            for (const rawPhone of OWNER_PHONES) {
                const digits = String(rawPhone).replace(/\D/g, "");
                if (!digits) continue;
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chatId: `${digits}@c.us`,
                        message: waText
                    })
                });
                if (res.ok) whatsappSent = true;
            }
        }

        // 2. Send Customer Confirmation Email via Resend API
        if (payload && payload.email && RESEND_API_KEY) {
            const emailRes = await sendResendEmail({
                to: payload.email,
                subject: subject || `Booking Confirmation ${payload.ref}`,
                html: html || `<pre>${text}</pre>`,
                text: text
            });
            if (emailRes.ok) emailSent = true;
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ok: true, whatsappSent, emailSent })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ ok: false, error: err.message })
        };
    }
};
