/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { I18N, AI_GREETINGS } from "../data/i18n.js";
import { state, fmtPrice } from "../state.js";
import { openBookingWithTrip } from "./booking.js";

function getAiReplies(lang) {
    const pEcho = fmtPrice(12.42);
    const pNabq = fmtPrice(26.18);
    const pSunrise = fmtPrice(10.13);

    const replies = {
        ar: {
            family: `للعائلات أنصحك بـ **سفاري الغروب في جبال الصدى** (${pEcho}) أو **سفاري محمية نبق** (${pNabq}).`,
            payment: "يتوفر **الدفع عند الوصول** بدون مقدم أو أونلاين بـ Visa / Mastercard / ميزة / المحافظ، مع إلغاء مجاني قبل ساعتين.",
            default: `أشهر رحلات شرم الشيخ: **شروق الشمس ATV** من **${pSunrise}** و**سفاري محمية نبق** من **${pNabq}** (كود خصم **MOSA20**).`
        },
        en: {
            family: `For families, we recommend **Sunset ATV Quad Safari in the Echo Mountains** (${pEcho}) or **Nabq Protected Area Safari** (${pNabq}).`,
            payment: "**Pay on Arrival** is available with zero deposit, or pay online via Visa / Mastercard / e-wallets, with free cancellation up to 2 hours before.",
            default: `Top Sharm El Sheikh tours: **Sunrise ATV Quad** from **${pSunrise}** and **Nabq Protected Area Safari** from **${pNabq}** (promo code **MOSA20**).`
        },
        it: {
            family: `Per le famiglie consigliamo **Safari al Tramonto nelle Montagne dell'Eco** (${pEcho}) o **Safari nella Riserva di Nabq** (${pNabq}).`,
            payment: "È disponibile il **pagamento all'arrivo** senza anticipo, oppure online con Visa / Mastercard, con cancellazione gratuita fino a 2 ore prima.",
            default: `I tour più richiesti a Sharm El Sheikh: **Quad ATV Alba** da **${pSunrise}** e **Riserva di Nabq** da **${pNabq}** (codice **MOSA20**).`
        },
        ru: {
            family: `Для семей рекомендуем **Закат на квадроциклах в Горах Эхо** (${pEcho}) или **Сафари в заповеднике Набк** (${pNabq}).`,
            payment: "Доступна **оплата при получении** без предоплаты или онлайн картой Visa / Mastercard, с бесплатной отменой за 2 часа.",
            default: `Популярные туры в Шарм-эль-Шейхе: **Рассвет на квадроциклах ATV** от **${pSunrise}** и **Заповедник Набк** от **${pNabq}** (промокод **MOSA20**).`
        }
    };

    return replies[lang] || replies.en;
}

function getAiLang() {
    const sel = document.getElementById("ai-lang-select");
    return (sel && I18N[sel.value]) ? sel.value : (I18N[state.lang] ? state.lang : "en");
}

export function appendAiMsg(txt, sender = "bot", tripId = null) {
    const box = document.getElementById("ai-messages");
    if (!box) return;
    const aiLang = getAiLang();
    const wrap = document.createElement("div");
    wrap.className = sender === "user" ? "flex justify-end" : "flex justify-start";
    const b = document.createElement("div");
    b.className = sender === "user"
        ? "max-w-[85%] px-3 py-2 rounded-xl bg-champagne text-carbon-950 font-bold"
        : "max-w-[85%] px-3 py-2 rounded-xl bg-white dark:bg-carbon-800 border border-white/10";
    b.innerHTML = txt.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    if (tripId) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mt-2 block w-full py-1.5 px-3 rounded-lg bg-champagne text-carbon-950 text-xs font-black";
        btn.textContent = (I18N[aiLang] || I18N[state.lang]).book_now;
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
        const replies = getAiReplies(getAiLang());
        if (l.includes("عائل") || l.includes("family") || l.includes("famigl") || l.includes("сем")) {
            appendAiMsg(replies.family, "bot", "sharm-sunset-echo");
        } else if (l.includes("دفع") || l.includes("pay") || l.includes("pagam") || l.includes("оплат")) {
            appendAiMsg(replies.payment, "bot");
        } else {
            appendAiMsg(replies.default, "bot", "sharm-sunrise-atv");
        }
    }, 280);
}

export function toggleAiWidget(force = null) {
    const p = document.getElementById("ai-chat-panel");
    if (!p) return;
    const h = p.classList.contains("hidden");
    if (force === true || (force === null && h)) {
        const sel = document.getElementById("ai-lang-select");
        if (sel && !document.getElementById("ai-messages").children.length) {
            sel.value = state.lang;
        }
        p.classList.remove("hidden");
        if (!document.getElementById("ai-messages").children.length) {
            appendAiMsg(AI_GREETINGS[getAiLang()], "bot");
        }
    } else {
        p.classList.add("hidden");
    }
}
