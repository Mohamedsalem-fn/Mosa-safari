/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { I18N, AI_GREETINGS } from "../data/i18n.js";
import { state } from "../state.js";
import { openBookingWithTrip } from "./booking.js";

export function appendAiMsg(txt, sender = "bot", tripId = null) {
    const box = document.getElementById("ai-messages");
    if (!box) return;
    const wrap = document.createElement("div");
    wrap.className = sender === "user" ? "flex justify-end" : "flex justify-start";
    const b = document.createElement("div");
    b.className = sender === "user"
        ? "max-w-[85%] px-3 py-2 rounded-xl bg-champagne text-carbon-950 font-bold"
        : "max-w-[85%] px-3 py-2 rounded-xl bg-white dark:bg-carbon-800 border border-white/10";
    b.innerHTML = txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (tripId) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mt-2 block w-full py-1.5 px-3 rounded-lg bg-champagne text-carbon-950 text-xs font-black";
        btn.textContent = I18N[state.lang].book_now;
        btn.onclick = () => {
            toggleAiWidget(false);
            openBookingWithTrip(tripId);
        };
        b.appendChild(btn);
    }

    wrap.appendChild(b);
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
}

export function handleAiQuery(q) {
    appendAiMsg(q, "user");
    setTimeout(() => {
        const l = q.toLowerCase();
        if (l.includes("عائل") || l.includes("family")) {
            appendAiMsg("للعائلات أنصحك بـ **سفاري الغروب في جبال الصدى** ($12.42) أو **سفاري محمية نبق** ($26.18).", "bot", "sharm-sunset-echo");
        } else if (l.includes("دفع") || l.includes("pay")) {
            appendAiMsg("يتوفر **الدفع عند الوصول** بدون مقدم أو أونلاين بـ Visa / Mastercard / ميزة / المحافظ، مع إلغاء مجاني قبل ساعتين.", "bot");
        } else {
            appendAiMsg("أشهر رحلات شرم الشيخ: **شروق الشمس ATV** من **$10.13** و**سفاري محمية نبق** من **$26.18** (كود خصم **MOSA20**).", "bot", "sharm-sunrise-atv");
        }
    }, 280);
}

export function toggleAiWidget(force = null) {
    const p = document.getElementById("ai-chat-panel");
    const h = p.classList.contains("hidden");
    if (force === true || (force === null && h)) {
        p.classList.remove("hidden");
        if (!document.getElementById("ai-messages").children.length) {
            appendAiMsg(AI_GREETINGS[document.getElementById("ai-lang-select").value], "bot");
        }
    } else {
        p.classList.add("hidden");
    }
}
