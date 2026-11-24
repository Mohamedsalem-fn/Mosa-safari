/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { connect } from "cloudflare:sockets";

export const MAIL_KV_KEY = "mosa:mail_config";

export function defaultMailConfig() {
    return {
        provider: "gmail_smtp",
        enabled: false,
        gmailAddress: "",
        appPassword: "",
        senderName: "Mosa Safari · موسى سفاري",
        replyTo: "",
        bccOwner: true,
        fallbackResend: true,
        appsScriptUrl: "",
        scriptSecret: "",
        updatedAt: ""
    };
}

function cleanHeaderValue(val) {
    return String(val ?? "").replace(/[\r\n]+/g, " ").trim();
}

export function isValidEmail(email) {
    return /^[^\s@<>()[\]\\,;:\s@"]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(String(email || "").trim());
}

function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(String(str ?? ""));
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

function wrapBase64Lines(b64) {
    return b64.replace(/(.{76})/g, "$1\r\n");
}

function encodeRfc2047(text) {
    const clean = cleanHeaderValue(text);
    if (!clean) return "";
    if (/^[\x20-\x7E]+$/.test(clean) && !/[()<>@,;:\\"/[\]?=]/.test(clean)) {
        return clean;
    }
    return `=?UTF-8?B?${utf8ToBase64(clean)}?=`;
}

export async function getMailConfig(env) {
    const base = defaultMailConfig();
    if (!env?.MOSA_KV) return base;
    try {
        const saved = await env.MOSA_KV.get(MAIL_KV_KEY, { type: "json" });
        if (saved && typeof saved === "object") {
            return { ...base, ...saved };
        }
    } catch {
        // Fallback to default config
    }
    return base;
}

export function sanitizeMailConfigForClient(cfg) {
    const merged = { ...defaultMailConfig(), ...(cfg || {}) };
    const pass = String(merged.appPassword || "");
    const hasAppPassword = pass.length >= 8;
    const hasScriptSecret = Boolean(String(merged.scriptSecret || "").trim());
    const gmailOk = isValidEmail(merged.gmailAddress);
    const connected = Boolean(
        merged.enabled &&
        gmailOk &&
        ((merged.provider === "google_script" && merged.appsScriptUrl) ||
            (merged.provider !== "google_script" && hasAppPassword))
    );

    return {
        provider: merged.provider === "google_script" ? "google_script" : "gmail_smtp",
        enabled: Boolean(merged.enabled),
        gmailAddress: merged.gmailAddress || "",
        senderName: merged.senderName || "Mosa Safari · موسى سفاري",
        replyTo: merged.replyTo || "",
        bccOwner: merged.bccOwner !== false,
        fallbackResend: merged.fallbackResend !== false,
        appsScriptUrl: merged.appsScriptUrl || "",
        hasAppPassword,
        appPasswordMask: hasAppPassword ? `•••• •••• •••• ${pass.slice(-4)}` : "",
        hasScriptSecret,
        connected,
        updatedAt: merged.updatedAt || ""
    };
}

export async function saveMailConfig(env, incoming, existing = null) {
    const prev = existing || (await getMailConfig(env));
    const provider = incoming?.provider === "google_script" ? "google_script" : "gmail_smtp";
    const enabled = incoming?.enabled !== false;
    const gmailAddress = cleanHeaderValue(incoming?.gmailAddress ?? prev.gmailAddress).toLowerCase();
    const senderName = cleanHeaderValue(incoming?.senderName ?? prev.senderName) || "Mosa Safari · موسى سفاري";
    const replyTo = cleanHeaderValue(incoming?.replyTo ?? prev.replyTo);
    const bccOwner = incoming?.bccOwner !== undefined ? Boolean(incoming.bccOwner) : prev.bccOwner !== false;
    const fallbackResend = incoming?.fallbackResend !== undefined ? Boolean(incoming.fallbackResend) : prev.fallbackResend !== false;
    const rawPass = String(incoming?.appPassword || "").replace(/\s+/g, "").trim();
    const appPassword = rawPass !== "" ? rawPass : (prev.appPassword || "");
    const appsScriptUrl = cleanHeaderValue(incoming?.appsScriptUrl ?? prev.appsScriptUrl);
    const rawSecret = String(incoming?.scriptSecret ?? "").trim();
    const scriptSecret = incoming?.clearScriptSecret ? "" : (rawSecret !== "" ? rawSecret : (prev.scriptSecret || ""));

    if (enabled && !isValidEmail(gmailAddress)) {
        throw new Error("يرجى إدخال بريد جوجل صحيح (مثال: name@gmail.com)");
    }
    if (replyTo && !isValidEmail(replyTo)) {
        throw new Error("عنوان الرد (Reply-To) غير صحيح");
    }
    if (enabled && provider === "gmail_smtp" && appPassword.length < 8) {
        throw new Error("يرجى إدخال كلمة مرور التطبيقات من جوجل (Google App Password — 16 حرفاً)");
    }
    if (enabled && provider === "google_script" && !/^https:\/\/script\.google\.com\/macros\/s\/.+/.test(appsScriptUrl)) {
        throw new Error("رابط Google Apps Script يجب أن يبدأ بـ https://script.google.com/macros/s/");
    }

    const next = {
        provider,
        enabled,
        gmailAddress,
        appPassword,
        senderName,
        replyTo,
        bccOwner,
        fallbackResend,
        appsScriptUrl,
        scriptSecret,
        updatedAt: new Date().toISOString()
    };

    if (env?.MOSA_KV) {
        await env.MOSA_KV.put(MAIL_KV_KEY, JSON.stringify(next));
    }
    return next;
}

export async function clearMailConfig(env) {
    const blank = defaultMailConfig();
    if (env?.MOSA_KV) {
        await env.MOSA_KV.delete(MAIL_KV_KEY);
    }
    return blank;
}

export function buildMimeMessage({ fromEmail, senderName, to, replyTo, subject, html, text }) {
    const boundary = `mosa_alt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const safeTo = cleanHeaderValue(to);
    const safeFrom = cleanHeaderValue(fromEmail);
    const safeReply = cleanHeaderValue(replyTo) || safeFrom;
    const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2, 10)}@mosasafari.com>`;

    const headers = [
        `From: ${encodeRfc2047(senderName || "Mosa Safari")} <${safeFrom}>`,
        `To: <${safeTo}>`,
        `Reply-To: <${safeReply}>`,
        `Subject: ${encodeRfc2047(subject)}`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: ${msgId}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`
    ];

    const plainBody = wrapBase64Lines(utf8ToBase64(text || subject || ""));
    const htmlBody = wrapBase64Lines(utf8ToBase64(html || `<pre>${text || ""}</pre>`));

    const parts = [
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        plainBody,
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        htmlBody,
        `--${boundary}--`
    ];

    const full = `${headers.join("\r\n")}\r\n\r\n${parts.join("\r\n")}`;
    // SMTP transparency dot-stuffing
    return full.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out (${ms}ms)`)), ms))
    ]);
}

export async function sendGmailSmtpWorker(cfg, { to, subject, html, text }) {
    const user = cleanHeaderValue(cfg?.gmailAddress);
    const pass = String(cfg?.appPassword || "").replace(/\s+/g, "");
    const safeTo = cleanHeaderValue(to);
    if (!isValidEmail(user) || !pass) {
        return { ok: false, reason: "Missing Gmail address or App Password" };
    }
    if (!isValidEmail(safeTo)) {
        return { ok: false, reason: "Invalid recipient email" };
    }

    const socket = connect(
        { hostname: "smtp.gmail.com", port: 465 },
        { secureTransport: "on" }
    );
    const reader = socket.readable.getReader();
    const writer = socket.writable.getWriter();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    async function readReply() {
        const lines = [];
        while (true) {
            const idx = buffer.indexOf("\n");
            if (idx === -1) {
                const { value, done } = await withTimeout(reader.read(), 12000, "SMTP read");
                if (done && !buffer) throw new Error("SMTP connection closed unexpectedly");
                if (value) buffer += decoder.decode(value, { stream: true });
                if (done && buffer.indexOf("\n") === -1) {
                    const tail = buffer.trim();
                    buffer = "";
                    if (tail) lines.push(tail);
                    break;
                }
                continue;
            }
            const line = buffer.slice(0, idx).replace(/\r$/, "");
            buffer = buffer.slice(idx + 1);
            lines.push(line);
            if (/^\d{3}(?: |$)/.test(line)) {
                return { code: parseInt(line.slice(0, 3), 10), lines, raw: lines.join("\n") };
            }
        }
        const last = lines[lines.length - 1] || "";
        return { code: parseInt(last.slice(0, 3), 10) || 0, lines, raw: lines.join("\n") };
    }

    async function sendCmd(cmd, expectedCodes) {
        await withTimeout(writer.write(encoder.encode(`${cmd}\r\n`)), 10000, "SMTP write");
        const reply = await readReply();
        if (!expectedCodes.includes(reply.code)) {
            const detail = reply.lines[reply.lines.length - 1] || `SMTP ${reply.code}`;
            if (reply.code === 535) {
                throw new Error("فشل توثيق جوجل (535): تأكد من تفعيل التحقق بخطوتين وإدخال كلمة مرور التطبيقات (App Password) المكونة من 16 حرفاً");
            }
            throw new Error(detail);
        }
        return reply;
    }

    try {
        const greet = await readReply();
        if (greet.code !== 220) throw new Error(greet.raw || "Gmail SMTP greeting rejected");

        await sendCmd("EHLO mosasafari.com", [250]);
        const authToken = utf8ToBase64(`\0${user}\0${pass}`);
        await sendCmd(`AUTH PLAIN ${authToken}`, [235]);
        await sendCmd(`MAIL FROM:<${user}>`, [250]);
        await sendCmd(`RCPT TO:<${safeTo}>`, [250, 251]);

        if (cfg.bccOwner !== false && user.toLowerCase() !== safeTo.toLowerCase()) {
            await sendCmd(`RCPT TO:<${user}>`, [250, 251]);
        }

        await sendCmd("DATA", [354]);
        const mime = buildMimeMessage({
            fromEmail: user,
            senderName: cfg.senderName || "Mosa Safari",
            to: safeTo,
            replyTo: cfg.replyTo || user,
            subject,
            html,
            text
        });
        await withTimeout(writer.write(encoder.encode(`${mime}\r\n.\r\n`)), 15000, "SMTP DATA");
        const dataReply = await readReply();
        if (dataReply.code !== 250) {
            throw new Error(dataReply.raw || `DATA rejected (${dataReply.code})`);
        }

        try {
            await sendCmd("QUIT", [221]);
        } catch {
            // Ignore benign QUIT close
        }

        return { ok: true, provider: "gmail_smtp", from: user, id: dataReply.lines[0] || "gmail-ok" };
    } catch (err) {
        return { ok: false, provider: "gmail_smtp", reason: err?.message || "Gmail SMTP failed" };
    } finally {
        try { reader.releaseLock(); } catch { /* ignore */ }
        try { writer.releaseLock(); } catch { /* ignore */ }
        try { await socket.close(); } catch { /* ignore */ }
    }
}

export async function sendGoogleScriptWorker(cfg, { to, subject, html, text }) {
    const hook = cleanHeaderValue(cfg?.appsScriptUrl);
    if (!hook) return { ok: false, provider: "google_script", reason: "Missing Google Apps Script URL" };

    try {
        const res = await fetch(hook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            redirect: "follow",
            body: JSON.stringify({
                secret: cfg.scriptSecret || "",
                to: cleanHeaderValue(to),
                subject,
                html,
                text,
                senderName: cfg.senderName || "Mosa Safari",
                replyTo: cfg.replyTo || cfg.gmailAddress || ""
            })
        });
        const bodyText = await res.text();
        let data = null;
        try { data = JSON.parse(bodyText); } catch { /* text response */ }
        if (res.ok && (!data || data.ok !== false)) {
            return { ok: true, provider: "google_script", from: cfg.gmailAddress || "google-script", id: data?.id || "script-ok" };
        }
        return { ok: false, provider: "google_script", reason: data?.error || `Apps Script HTTP ${res.status}` };
    } catch (err) {
        return { ok: false, provider: "google_script", reason: err?.message || "Apps Script network error" };
    }
}

export async function sendResendEmail(env, { to, subject, html, text, replyTo = "", senderName = "" }) {
    const apiKey = env?.RESEND_API_KEY || "";
    if (!apiKey || !to) return { ok: false, provider: "resend", reason: "Missing RESEND_API_KEY or recipient" };

    const defaultSender = env.EMAIL_FROM || "Mosa Safari <bookings@mosasafari.com>";
    const customSender = senderName
        ? defaultSender.replace(/^[^<]*</, `${cleanHeaderValue(senderName)} <`)
        : defaultSender;

    const senders = [customSender, "Mosa Safari <onboarding@resend.dev>"];
    let lastErr = "Email send failed";
    for (const fromAddr of senders) {
        try {
            const payload = { from: fromAddr, to: [to], subject, html, text };
            if (isValidEmail(replyTo)) payload.reply_to = replyTo;
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                return { ok: true, provider: "resend", from: fromAddr, id: data?.id };
            }
            lastErr = `Resend HTTP ${res.status}`;
        } catch (err) {
            lastErr = err?.message || "Network error";
        }
    }
    return { ok: false, provider: "resend", reason: lastErr };
}

export async function dispatchPlatformEmail(env, { to, subject, html, text }) {
    const cfg = await getMailConfig(env);
    let primaryErr = "";

    if (cfg.enabled && cfg.gmailAddress) {
        if (cfg.provider === "google_script" && cfg.appsScriptUrl) {
            const gsRes = await sendGoogleScriptWorker(cfg, { to, subject, html, text });
            if (gsRes.ok) return gsRes;
            primaryErr = gsRes.reason || "Google Script error";
        } else if (cfg.appPassword) {
            const smtpRes = await sendGmailSmtpWorker(cfg, { to, subject, html, text });
            if (smtpRes.ok) return smtpRes;
            primaryErr = smtpRes.reason || "Gmail SMTP error";
        }
    }

    if (!cfg.enabled || cfg.fallbackResend !== false) {
        const resendRes = await sendResendEmail(env, {
            to,
            subject,
            html,
            text,
            replyTo: cfg.replyTo || cfg.gmailAddress,
            senderName: cfg.senderName
        });
        if (resendRes.ok) return resendRes;
        return {
            ok: false,
            provider: primaryErr ? cfg.provider : "resend",
            reason: primaryErr || resendRes.reason || "No email provider configured"
        };
    }

    return {
        ok: false,
        provider: cfg.provider,
        reason: primaryErr || "Google email is enabled but credentials are incomplete"
    };
}
