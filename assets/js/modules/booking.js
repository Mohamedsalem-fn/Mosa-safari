/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "../data/trips.js";
import { I18N, STEP_TITLES_I18N, BOOKING_I18N } from "../data/i18n.js";
import { state, fmtPrice } from "../state.js";
import { getTripTitle, getTripDuration } from "./trips.js";
import { showToast } from "./ui.js";

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
        state.booking.selectedIds = [t.id];
    }
    state.booking.step = 2;
    openBookingModal();
}

export function openBookingModal() {
    document.getElementById("booking-modal")?.classList.remove("hidden");
    renderBookingStep();
}

export function closeBookingModal() {
    document.getElementById("booking-modal")?.classList.add("hidden");
}

export function toggleBookingTrip(id) {
    const a = state.booking.selectedIds;
    const i = a.indexOf(id);
    if (i > -1) {
        if (a.length > 1) a.splice(i, 1);
    } else {
        a.push(id);
    }
    renderBookingStep();
}

export function applyPromoCode() {
    const input = document.getElementById("bk-promo");
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    state.booking.promoCode = code;
    renderBookingStep();
    if (code === "MOSA20") {
        showToast(I18N[state.lang].toast_promo_ok);
    } else {
        showToast(I18N[state.lang].toast_promo_err, "error");
    }
}

export function renderBookingStep() {
    const b = state.booking;
    const t = BOOKING_I18N[state.lang] || BOOKING_I18N.en;
    const stepTitles = STEP_TITLES_I18N[state.lang] || STEP_TITLES_I18N.en;

    const lbl = document.getElementById("booking-step-label");
    if (lbl) lbl.textContent = stepTitles[b.step - 1];

    const tot = document.getElementById("booking-total-display");
    if (tot) tot.textContent = fmtPrice(calcBookingTotal());

    const bars = document.getElementById("booking-progress-bars");
    if (bars) {
        bars.innerHTML = [1, 2, 3, 4, 5]
            .map(n => `<div class="h-1.5 rounded-full ${n <= b.step ? 'bg-champagne' : 'bg-carbon-900/15 dark:bg-white/10'}"></div>`)
            .join("");
    }

    const prevBtn = document.getElementById("booking-prev-btn");
    if (prevBtn) prevBtn.classList.toggle("hidden", b.step === 1);

    const nextBtn = document.getElementById("booking-next-btn");
    if (nextBtn) nextBtn.textContent = b.step === 5 ? I18N[state.lang].bk_confirm : I18N[state.lang].bk_next;

    const body = document.getElementById("booking-body");
    if (!body) return;

    if (b.step === 1) {
        body.innerHTML = `<div class="space-y-2">${SAFARI_TRIPS.map(trip => {
            const checked = b.selectedIds.includes(trip.id);
            return `<label class="flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition ${checked ? 'border-champagne bg-champagne/10' : 'border-carbon-900/10 dark:border-white/10 hover:border-champagne/50'}">
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleBookingTrip('${trip.id}')" class="accent-champagne w-4 h-4" />
                    <div>
                        <div class="text-sm font-black">${getTripTitle(trip)}</div>
                        <div class="text-xs opacity-60">${getTripDuration(trip)} · ${trip.vehicle}</div>
                    </div>
                </div>
                <span class="font-black text-champagne-dark dark:text-champagne whitespace-nowrap">${fmtPrice(trip.adultPrice)}</span>
            </label>`;
        }).join("")}</div>`;
    } else if (b.step === 2) {
        body.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
                <label class="block text-xs font-bold mb-1.5">${t.full_name}</label>
                <input id="bk-name" type="text" value="${b.name}" required class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm focus:border-champagne focus:outline-none" />
            </div>
            <div>
                <label class="block text-xs font-bold mb-1.5">${t.whatsapp}</label>
                <input id="bk-phone" type="tel" value="${b.phone}" required placeholder="+20..." class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm focus:border-champagne focus:outline-none" />
            </div>
            <div>
                <label class="block text-xs font-bold mb-1.5">${t.email}</label>
                <input id="bk-email" type="email" value="${b.email}" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm focus:border-champagne focus:outline-none" />
            </div>
            <div>
                <label class="block text-xs font-bold mb-1.5">${t.nationality}</label>
                <input id="bk-nat" type="text" value="${b.nationality}" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm focus:border-champagne focus:outline-none" />
            </div>
        </div>`;
    } else if (b.step === 3) {
        const vehicleKeys = Object.keys(t.vehicles);
        body.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
                <label class="block text-xs font-bold mb-1.5">${t.adults}</label>
                <input type="number" min="1" max="30" value="${b.adults}" onchange="state.booking.adults=Math.max(1,+this.value); renderBookingStep();" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm font-bold focus:outline-none" />
            </div>
            <div>
                <label class="block text-xs font-bold mb-1.5">${t.children}</label>
                <input type="number" min="0" max="20" value="${b.children}" onchange="state.booking.children=Math.max(0,+this.value); renderBookingStep();" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm font-bold focus:outline-none" />
            </div>
            <div class="sm:col-span-2">
                <label class="block text-xs font-bold mb-1.5">${t.vehicle_type}</label>
                <select onchange="state.booking.vehicleOpt=this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm font-bold focus:outline-none">
                    ${vehicleKeys.map(v => `<option value="${v}" ${b.vehicleOpt === v ? 'selected' : ''}>${t.vehicles[v]}</option>`).join("")}
                </select>
            </div>
        </div>`;
    } else if (b.step === 4) {
        const today = new Date().toISOString().split("T")[0];
        body.innerHTML = `<div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label class="block text-xs font-bold mb-1.5">${t.pickup_hotel}</label>
                    <input id="bk-hotel" type="text" value="${b.pickupHotel}" placeholder="${t.hotel_placeholder}" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm focus:border-champagne focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1.5">${t.trip_date}</label>
                    <input id="bk-date" type="date" min="${today}" value="${b.tripDate || today}" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm focus:border-champagne focus:outline-none" />
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onclick="state.booking.paymentMethod='arrival'; renderBookingStep();" class="p-4 rounded-xl border text-start transition ${b.paymentMethod === 'arrival' ? 'border-sea bg-sea/10' : 'border-carbon-900/10 dark:border-white/10'}">
                    <div class="font-black text-sea">${t.pay_arrival}</div>
                    <div class="text-xs opacity-70 mt-1">${t.pay_arrival_sub}</div>
                </button>
                <button type="button" onclick="state.booking.paymentMethod='online'; renderBookingStep();" class="p-4 rounded-xl border text-start transition ${b.paymentMethod === 'online' ? 'border-champagne bg-champagne/10' : 'border-carbon-900/10 dark:border-white/10'}">
                    <div class="font-black text-champagne-dark dark:text-champagne">${t.pay_online}</div>
                    <div class="text-xs opacity-70 mt-1">${t.pay_online_sub}</div>
                </button>
            </div>
        </div>`;
    } else if (b.step === 5) {
        const ch = SAFARI_TRIPS.filter(trip => b.selectedIds.includes(trip.id));
        const vehicleDisplay = t.vehicles[b.vehicleOpt] || b.vehicleOpt;
        body.innerHTML = `<div class="space-y-3.5">
            <div class="p-4 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-xs sm:text-sm space-y-2">
                <div><strong>${t.sum_tours}</strong> ${ch.map(c => getTripTitle(c)).join(" + ")}</div>
                <div><strong>${t.sum_guests}</strong> ${b.adults} ${t.adults_lbl}${b.children ? ` · ${b.children} ${t.children_lbl}` : ""}</div>
                <div><strong>${t.sum_vehicle}</strong> ${vehicleDisplay}</div>
                ${b.pickupHotel ? `<div><strong>${t.sum_hotel}</strong> ${b.pickupHotel} ${b.tripDate ? `(${b.tripDate})` : ""}</div>` : ""}
                <div><strong>${t.sum_payment}</strong> ${b.paymentMethod === 'arrival' ? t.pay_arrival : t.pay_online}</div>
            </div>
            <div class="flex gap-2">
                <input id="bk-promo" type="text" value="${b.promoCode}" placeholder="${t.promo_placeholder}" class="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-sm font-bold uppercase focus:border-champagne focus:outline-none" />
                <button type="button" onclick="applyPromoCode()" class="px-4 py-2.5 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black transition">${t.promo_apply}</button>
            </div>
        </div>`;
    }
}
