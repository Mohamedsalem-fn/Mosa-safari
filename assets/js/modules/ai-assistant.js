/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "../data/trips.js";
import { I18N, AI_GREETINGS } from "../data/i18n.js";
import { state, fmtPrice } from "../state.js";
import { openBookingWithTrip } from "./booking.js";

function escHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function liveTripPrice(id, fallbackUsd) {
    const trip = SAFARI_TRIPS.find(x => x.id === id);
    return fmtPrice(trip && typeof trip.fromPrice === "number" ? trip.fromPrice : fallbackUsd);
}

function getAiReplies(lang) {
    const pSunrise = liveTripPrice("sharm-sunrise-atv", 10.13);
    const pEcho = liveTripPrice("sharm-sunset-echo", 12.42);
    const pCanyon = liveTripPrice("sharm-canyon-bluehole", 20.60);
    const pNight = liveTripPrice("sharm-night-5in1", 22.93);
    const pDouble = liveTripPrice("sharm-double-thrill", 23.81);
    const pNabq = liveTripPrice("sharm-nabq-premium", 26.18);
    const pNabqVip = liveTripPrice("sharm-nabq-secrets", 27.71);

    const replies = {
        ar: {
            family: `للعائلات والأطفال أنصحك بـ **سفاري الغروب في جبال الصدى** (${pEcho}) أو **سفاري محمية نبق الفاخرة** (${pNabq}). الدراجات أوتوماتيك بالكامل وآمنة مع خوذات وتدريب قبل الانطلاق.`,
            payment: "نوفر لك طريقتين للدفع:\n• **الدفع عند الوصول** يوم الرحلة بدون أي مقدم.\n• **الدفع بالفيزا / ماستركارد**.\nمع إلغاء مجاني حتى ساعتين قبل موعد التحرك.",
            nabq: `رحلات **محمية نبق الطبيعية** تشمل المانجروف وتصاريح الدخول وتبدأ من **${pNabq}**، كما تتوفر جولة **VIP أسرار الصحراء** و**غسق نبق + عشاء سي فود** بسعر **${pNabqVip}**.`,
            night: `تجربة **سفاري شرم الشيخ الليلية 5 في 1** (${pNight}) تشمل: بيتش باجي + ركوب جمال + عشاء بدوي مشوي + عرض شرقي + مراقبة النجوم بالتلسكوب لمدة 6 ساعات.`,
            canyon: `رحلة اليوم الكامل إلى **الوادي الملون والبلو هول ودهب** (${pCanyon}) تمتد 10 ساعات بسيارات جيب 4x4 مع السنوركلينج والغداء على البحر.`,
            promo: `استخدم كود الخصم **MOSA20** في الخطوة الأخيرة من الحجز لتحصل على **خصم 20% فوري**! وللمجموعات من 5 أفراد فأكثر تحصل على **خصم إضافي 10%** تلقائياً.`,
            price: `تبدأ الأسعار اليوم من **${pSunrise}** (شروق الشمس ATV) و**${pEcho}** (غروب جبال الصدى) و**${pDouble}** (بيتش باجي + باجي صحراوي) حتى **${pNabqVip}** لرحلات نبق VIP — شاملة الانتقالات من الفندق.`,
            default: `أشهر برامج شرم الشيخ حالياً:\n• **غروب جبال الصدى ATV** (${pEcho})\n• **الإثارة المزدوجة ATV + باجي** (${pDouble})\n• **محمية نبق** (${pNabq})\nولا تنسَ كود الخصم **MOSA20**!`
        },
        en: {
            family: `For families & kids, we recommend **Sunset ATV in Echo Mountains** (${pEcho}) or **Nabq Protected Area Safari** (${pNabq}). All quads are automatic with full safety briefing.`,
            payment: "We offer two payment methods:\n• **Pay on Arrival** with $0 upfront deposit.\n• **Visa / Mastercard** checkout.\nFree cancellation up to 2 hours before pickup.",
            nabq: `**Nabq Protected Area** tours include mangroves & official permits starting at **${pNabq}**, plus **VIP Desert Secrets** and **Seafood Dusk** at **${pNabqVip}**.`,
            night: `Our **5-in-1 Night Safari & Stargazing** (${pNight}) includes ATV quad, camel ride, BBQ Bedouin dinner, live show, and telescope stargazing (6 hours).`,
            canyon: `The full-day **Colored Canyon, Blue Hole & Dahab** 4x4 Jeep expedition (${pCanyon}) runs 10 hours including snorkeling and seaside lunch.`,
            promo: `Apply promo code **MOSA20** at checkout for an instant **20% OFF**! Groups of 5+ guests also receive an automatic **10% group discount**.`,
            price: `Today's live prices start from **${pSunrise}** (Sunrise ATV), **${pEcho}** (Echo Sunset), and **${pDouble}** (ATV + Buggy) up to **${pNabqVip}** for VIP Nabq — hotel transfers included.`,
            default: `Top Sharm El Sheikh tours today:\n• **Echo Mountains Sunset ATV** (${pEcho})\n• **Double Thrill ATV + Buggy** (${pDouble})\n• **Nabq Reserve Safari** (${pNabq})\nUse code **MOSA20** for 20% OFF!`
        },
        it: {
            family: `Per famiglie e bambini consigliamo **Tramonto nelle Montagne dell'Eco** (${pEcho}) o **Riserva di Nabq** (${pNabq}), con quad automatici e caschi inclusi.`,
            payment: "Due metodi di pagamento:\n• **Pagamento all'arrivo** senza acconto.\n• **Visa / Mastercard**.\nCancellazione gratuita fino a 2 ore prima.",
            nabq: `I tour nella **Riserva di Nabq** partono da **${pNabq}** (permessi inclusi), con opzione **VIP** e **Cena di Pesce** a **${pNabqVip}**.`,
            night: `Il **Safari Notturno 5-in-1** (${pNight}) include Quad ATV, cammello, cena beduina BBQ, spettacolo e osservazione stelle al telescopio.`,
            canyon: `La gita **Canyon Colorato, Blue Hole e Dahab** (${pCanyon}) dura 10 ore in Jeep 4x4 con snorkeling e pranzo.`,
            promo: `Usa il codice **MOSA20** per ottenere subito il **20% di sconto**! I gruppi di 5+ persone ricevono anche il **10% extra**.`,
            price: `I prezzi di oggi partono da **${pSunrise}** (Alba ATV) e **${pEcho}** (Tramonto Eco) fino a **${pNabqVip}** per Nabq VIP, trasferimento incluso.`,
            default: `I tour più richiesti a Sharm El Sheikh:\n• **Tramonto Montagne dell'Eco** (${pEcho})\n• **Doppia Emozione ATV + Buggy** (${pDouble})\n• **Riserva di Nabq** (${pNabq})\nCodice sconto: **MOSA20**!`
        },
        ru: {
            family: `Для семей с детьми рекомендуем **Закат в Горах Эхо** (${pEcho}) или **Заповедник Набк** (${pNabq}). Все квадроциклы автоматические и безопасные.`,
            payment: "Два способа оплаты:\n• **Оплата при получении** без предоплаты.\n• **Картой Visa / Mastercard**.\nБесплатная отмена за 2 часа до выезда.",
            nabq: `Туры в **Заповедник Набк** начинаются от **${pNabq}** (разрешения включены), а **VIP Набк / Морепродукты** — **${pNabqVip}**.`,
            night: `**Ночное сафари 5-в-1** (${pNight}) включает квадроцикл, верблюдов, бедуинский ужин-барбекю, шоу и телескоп (6 часов).`,
            canyon: `Экскурсия на весь день **Цветной каньон, Голубая дыра и Дахаб** (${pCanyon}) — 10 часов на джипах 4x4 со снорклингом.`,
            promo: `Используйте промокод **MOSA20** для мгновенной **скидки 20%**! Группам от 5 человек — автоматическая **скидка 10%**.`,
            price: `Актуальные цены сегодня от **${pSunrise}** (Рассвет ATV) и **${pEcho}** (Закат Эхо) до **${pNabqVip}** за VIP Набк (трансфер включён).`,
            default: `Популярные туры в Шарм-эль-Шейхе:\n• **Закат в Горах Эхо** (${pEcho})\n• **Двойной драйв ATV + Багги** (${pDouble})\n• **Заповедник Набк** (${pNabq})\nПромокод: **MOSA20**!`
        }
    };

    return replies[lang] || replies.en;
}

function getAiLang() {
    const sel = document.getElementById("ai-lang-select");
    return (sel && I18N[sel.value]) ? sel.value : (I18N[state.lang] ? state.lang : "en");
}

function showTypingIndicator() {
    const box = document.getElementById("ai-messages");
    if (!box) return null;
    const wrap = document.createElement("div");
    wrap.className = "flex justify-start ai-typing-row";
    wrap.innerHTML = `<div class="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
        <span class="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce" style="animation-delay:0.15s"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce" style="animation-delay:0.3s"></span>
    </div>`;
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
    return wrap;
}

export function appendAiMsg(txt, sender = "bot", tripId = null) {
    const box = document.getElementById("ai-messages");
    if (!box) return;
    const aiLang = getAiLang();
    const wrap = document.createElement("div");
    wrap.className = sender === "user" ? "flex justify-end" : "flex justify-start";
    const b = document.createElement("div");
    b.className = sender === "user"
        ? "max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-ee-sm bg-champagne text-carbon-950 font-bold shadow-sm leading-relaxed"
        : "max-w-[88%] px-3.5 py-2.5 rounded-2xl rounded-es-sm bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 shadow-sm leading-relaxed";
    b.innerHTML = escHtml(txt)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");

    if (tripId) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mt-2.5 block w-full py-2 px-3 rounded-xl bg-carbon-950 dark:bg-champagne text-white dark:text-carbon-950 text-xs font-black hover:opacity-90 transition";
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
    const clean = String(q || "").trim();
    if (!clean) return;
    appendAiMsg(clean, "user");
    const typingEl = showTypingIndicator();

    setTimeout(() => {
        if (typingEl) typingEl.remove();
        const l = clean.toLowerCase();
        const replies = getAiReplies(getAiLang());

        if (l.includes("عائل") || l.includes("أطفال") || l.includes("اطفال") || l.includes("family") || l.includes("kid") || l.includes("famigl") || l.includes("сем")) {
            appendAiMsg(replies.family, "bot", "sharm-sunset-echo");
        } else if (l.includes("دفع") || l.includes("فيزا") || l.includes("كاش") || l.includes("pay") || l.includes("visa") || l.includes("pagam") || l.includes("оплат")) {
            appendAiMsg(replies.payment, "bot");
        } else if (l.includes("نبق") || l.includes("سمك") || l.includes("سي فود") || l.includes("nabq") || l.includes("seafood") || l.includes("набк")) {
            appendAiMsg(replies.nabq, "bot", "sharm-nabq-premium");
        } else if (l.includes("ليل") || l.includes("نجوم") || l.includes("عشاء") || l.includes("night") || l.includes("star") || l.includes("notte") || l.includes("ноч")) {
            appendAiMsg(replies.night, "bot", "sharm-night-5in1");
        } else if (l.includes("دهب") || l.includes("وادي") || l.includes("ملون") || l.includes("canyon") || l.includes("dahab") || l.includes("blue hole") || l.includes("дахаб")) {
            appendAiMsg(replies.canyon, "bot", "sharm-canyon-bluehole");
        } else if (l.includes("خصم") || l.includes("كود") || l.includes("mosa20") || l.includes("promo") || l.includes("discount") || l.includes("sconto") || l.includes("скид")) {
            appendAiMsg(replies.promo, "bot", "sharm-sunset-echo");
        } else if (l.includes("سعر") || l.includes("أسعار") || l.includes("اسعار") || l.includes("بكام") || l.includes("كم") || l.includes("price") || l.includes("cost") || l.includes("prezz") || l.includes("цен")) {
            appendAiMsg(replies.price, "bot", "sharm-sunrise-atv");
        } else {
            appendAiMsg(replies.default, "bot", "sharm-sunset-echo");
        }
    }, 340);
}

export function toggleAiWidget(force = null) {
    const p = document.getElementById("ai-chat-panel");
    const backdrop = document.getElementById("ai-backdrop");
    if (!p) return;
    const isHidden = p.classList.contains("hidden");
    const shouldOpen = force === true || (force === null && isHidden);

    if (shouldOpen) {
        const sel = document.getElementById("ai-lang-select");
        const msgs = document.getElementById("ai-messages");
        if (sel && msgs && !msgs.children.length) {
            sel.value = state.lang;
        }
        p.classList.remove("hidden");
        if (backdrop) backdrop.classList.remove("hidden");
        if (window.innerWidth < 640) {
            document.body.classList.add("ai-sheet-open");
        }
        if (msgs && !msgs.children.length) {
            appendAiMsg(AI_GREETINGS[getAiLang()], "bot");
        }
        setTimeout(() => document.getElementById("ai-input")?.focus({ preventScroll: true }), 120);
    } else {
        p.classList.add("hidden");
        if (backdrop) backdrop.classList.add("hidden");
        document.body.classList.remove("ai-sheet-open");
    }
}
