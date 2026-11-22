/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "../data/trips.js";
import { I18N, STEP_TITLES_I18N } from "../data/i18n.js";
import { state, fmtPrice } from "../state.js";

export function calcBookingTotal() {
    const sel = SAFARI_TRIPS.filter(t => state.booking.selectedIds.includes(t.id));
    let total = sel.reduce((s, t) => s + t.adultPrice, 0) * Math.max(1, state.booking.adults + state.booking.children * 0.5);
    if (state.booking.adults + state.booking.children >= 5) total *= 0.9;
    if (state.booking.promoCode.trim().toUpperCase() === "MOSA20") total *= 0.8;
    return total;
}

export function openBookingWithTrip(id) {
    const t = SAFARI_TRIPS.find(x => x.id === id);
    if (t) {
        state.booking.city = t.city;
        state.booking.selectedIds = [t.id];
    }
    state.booking.step = 3;
    openBookingModal();
}

export function openBookingModal() {
    document.getElementById("booking-modal").classList.remove("hidden");
    renderBookingStep();
}

export function closeBookingModal() {
    document.getElementById("booking-modal").classList.add("hidden");
}

export function toggleBookingTrip(id) {
    const a = state.booking.selectedIds;
    const i = a.indexOf(id);
    if (i > -1) a.splice(i, 1);
    else a.push(id);
    renderBookingStep();
}

export function renderBookingStep() {
    const b = state.booking;
    document.getElementById("booking-step-label").textContent = (STEP_TITLES_I18N[state.lang] || STEP_TITLES_I18N.en)[b.step - 1];
    document.getElementById("booking-total-display").textContent = fmtPrice(calcBookingTotal());
    document.getElementById("booking-progress-bars").innerHTML = [1, 2, 3, 4, 5, 6]
        .map(n => `<div class="h-1 rounded-full ${n <= b.step ? 'bg-champagne' : 'bg-white/10'}"></div>`)
        .join("");
    document.getElementById("booking-prev-btn").classList.toggle("hidden", b.step === 1);
    document.getElementById("booking-next-btn").textContent = b.step === 6 ? I18N[state.lang].bk_confirm : I18N[state.lang].bk_next;

    const body = document.getElementById("booking-body");
    if (b.step === 1) {
        body.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${["Sharm El Sheikh"].map(c => `<button type="button" onclick="state.booking.city='${c}'; renderBookingStep();" class="p-4 rounded-xl border text-start ${b.city === c ? 'border-champagne bg-champagne/10' : 'border-white/10'}"><div class="font-black">${c === 'Sharm El Sheikh' ? 'شرم الشيخ' : c === 'Hurghada' ? 'الغردقة' : 'دهب'}</div><div class="text-xs opacity-60 mt-1">${c}</div></button>`).join("")}</div>`;
    } else if (b.step === 2) {
        body.innerHTML = `<div class="space-y-2">${SAFARI_TRIPS.filter(t => t.city === b.city).map(t => `<label class="flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer ${b.selectedIds.includes(t.id) ? 'border-champagne bg-champagne/10' : 'border-white/10'}"><div class="flex items-center gap-3"><input type="checkbox" ${b.selectedIds.includes(t.id) ? 'checked' : ''} onchange="toggleBookingTrip('${t.id}')" class="accent-champagne" /><div><div class="text-sm font-black">${state.lang === "ar" ? t.titleAr : t.titleEn}</div><div class="text-xs opacity-60">${state.lang === "ar" ? t.duration : t.durationEn}</div></div></div><span class="font-black text-champagne">${fmtPrice(t.adultPrice)}</span></label>`).join("")}</div>`;
    } else if (b.step === 3) {
        body.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label class="block text-xs font-bold mb-1">${{ ar: "الاسم الكامل *", en: "Full Name *", it: "Nome Completo *", ru: "Полное имя *" }[state.lang]}</label><input id="bk-name" type="text" value="${b.name}" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 border border-white/10 text-sm" /></div><div><label class="block text-xs font-bold mb-1">${{ ar: "رقم الواتساب *", en: "WhatsApp Number *", it: "Numero WhatsApp *", ru: "Номер WhatsApp *" }[state.lang]}</label><input id="bk-phone" type="tel" value="${b.phone}" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 border border-white/10 text-sm" /></div><div><label class="block text-xs font-bold mb-1">${{ ar: "البريد الإلكتروني", en: "Email", it: "Email", ru: "Эл. почта" }[state.lang]}</label><input id="bk-email" type="email" value="${b.email}" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 border border-white/10 text-sm" /></div><div><label class="block text-xs font-bold mb-1">${{ ar: "الجنسية", en: "Nationality", it: "Nazionalità", ru: "Гражданство" }[state.lang]}</label><input id="bk-nat" type="text" value="${b.nationality}" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 border border-white/10 text-sm" /></div></div>`;
    } else if (b.step === 4) {
        body.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label class="block text-xs font-bold mb-1">البالغين</label><input type="number" min="1" value="${b.adults}" onchange="state.booking.adults=Math.max(1,+this.value); renderBookingStep();" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 text-sm font-bold" /></div><div><label class="block text-xs font-bold mb-1">الأطفال (50%)</label><input type="number" min="0" value="${b.children}" onchange="state.booking.children=Math.max(0,+this.value); renderBookingStep();" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 text-sm font-bold" /></div><div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">نوع المركبة</label><select onchange="state.booking.vehicleOpt=this.value" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 text-sm font-bold">${["Single ATV Quad", "Double ATV Quad", "Shared Dune Buggy", "Private 4x4 Jeep"].map(v => `<option value="${v}" ${b.vehicleOpt === v ? 'selected' : ''}>${v}</option>`).join("")}</select></div></div>`;
    } else if (b.step === 5) {
        body.innerHTML = `<div class="space-y-4"><div><label class="block text-xs font-bold mb-1">${{ ar: "فندق الاستلام", en: "Pickup Hotel", it: "Hotel per il ritiro", ru: "Отель для трансфера" }[state.lang]}</label><input id="bk-hotel" type="text" value="${b.pickupHotel}" placeholder="مثال: Rixos Sharm" class="w-full px-3 py-2.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 text-sm" /></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><button type="button" onclick="state.booking.paymentMethod='arrival'; renderBookingStep();" class="p-4 rounded-xl border text-start ${b.paymentMethod === 'arrival' ? 'border-sea bg-sea/10' : 'border-white/10'}"><div class="font-black text-sea">الدفع عند الوصول</div><div class="text-xs opacity-70 mt-1">بدون مقدم</div></button><button type="button" onclick="state.booking.paymentMethod='online'; renderBookingStep();" class="p-4 rounded-xl border text-start ${b.paymentMethod === 'online' ? 'border-champagne bg-champagne/10' : 'border-white/10'}"><div class="font-black text-champagne">الدفع الإلكتروني</div><div class="text-xs opacity-70 mt-1">Visa · Mastercard · ميزة · محافظ</div></button></div></div>`;
    } else if (b.step === 6) {
        const ch = SAFARI_TRIPS.filter(t => b.selectedIds.includes(t.id));
        body.innerHTML = `<div class="space-y-3"><div class="p-4 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 text-xs sm:text-sm space-y-1.5"><div><strong>المدينة:</strong> ${b.city}</div><div><strong>البرامج:</strong> ${ch.map(c => state.lang === "ar" ? c.titleAr : c.titleEn).join(" + ")}</div><div><strong>الضيوف:</strong> ${b.adults} بالغين، ${b.children} أطفال</div><div><strong>الدفع:</strong> ${b.paymentMethod === 'arrival' ? 'عند الوصول' : 'إلكتروني'}</div></div><div class="flex gap-2"><input id="bk-promo" type="text" value="${b.promoCode}" placeholder="كود الخصم: MOSA20" class="flex-1 px-3 py-2 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 text-sm font-bold uppercase" /><button type="button" onclick="state.booking.promoCode=document.getElementById('bk-promo').value; renderBookingStep(); showToast('تم تطبيق الخصم!');" class="px-4 py-2 rounded-lg bg-champagne text-carbon-950 text-xs font-black">تطبيق</button></div></div>`;
    }

    if (window.lucide) window.lucide.createIcons();
}
