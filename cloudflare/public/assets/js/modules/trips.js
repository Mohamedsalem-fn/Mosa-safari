/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "../data/trips.js";
import { I18N, BADGE_I18N } from "../data/i18n.js";
import { state, fmtPrice, safeSetStorage } from "../state.js";
import { showToast } from "./ui.js";

export function getTripTitle(trip, lang = state.lang) {
    if (lang === "ar") return trip.titleAr;
    if (lang === "it") return trip.titleIt || trip.titleEn;
    if (lang === "ru") return trip.titleRu || trip.titleEn;
    return trip.titleEn;
}

export function getTripDesc(trip, lang = state.lang) {
    if (lang === "ar") return trip.descAr;
    if (lang === "it") return trip.descIt || trip.descEn;
    if (lang === "ru") return trip.descRu || trip.descEn;
    return trip.descEn;
}

export function getTripDuration(trip, lang = state.lang) {
    if (lang === "ar") return trip.duration;
    if (lang === "it") return trip.durationIt || trip.durationEn;
    if (lang === "ru") return trip.durationRu || trip.durationEn;
    return trip.durationEn;
}

export function renderPriceTable() {
    const tbody = document.getElementById("price-table-body");
    if (!tbody) return;

    const L = I18N[state.lang];
    tbody.innerHTML = SAFARI_TRIPS.filter(t => t.active !== false).map(trip => {
        const title = getTripTitle(trip);
        const dur = getTripDuration(trip);
        return `
            <tr class="hover:bg-champagne/5 transition">
                <td data-label="${L.tbl_prog}" class="p-3.5 font-bold">${title}</td>
                <td data-label="${L.tbl_veh}" class="p-3.5 text-xs text-carbon-900/70 dark:text-[#B5B0A8]">${trip.vehicle}</td>
                <td data-label="${L.tbl_price}" class="p-3.5 text-sea font-extrabold whitespace-nowrap">${fmtPrice(trip.fromPrice)} <span class="text-[11px] font-normal text-carbon-900/55 dark:text-[#9E9990]">(${fmtPrice(trip.adultPrice)})</span></td>
                <td data-label="${L.tbl_dur}" class="p-3.5 whitespace-nowrap">${dur}</td>
                <td data-label="${L.tbl_rate}" class="p-3.5 font-bold text-champagne-dark dark:text-champagne whitespace-nowrap">${trip.rating} ★</td>
                <td class="p-3.5">
                    <button type="button" onclick="openBookingWithTrip('${trip.id}')" class="px-3 py-1.5 rounded-lg bg-champagne hover:bg-champagne-light text-carbon-950 font-black text-xs transition whitespace-nowrap">
                        ${L.book_now}
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

export function renderTrips() {
    const grid = document.getElementById("trips-grid");
    if (!grid) return;

    let list = SAFARI_TRIPS.filter(t => t.active !== false);
    if (state.categoryFilter !== "all") {
        list = list.filter(t => t.category === state.categoryFilter);
    }
    if (state.sortBy === "price-asc") list.sort((a, b) => a.fromPrice - b.fromPrice);
    if (state.sortBy === "price-desc") list.sort((a, b) => b.fromPrice - a.fromPrice);
    if (state.sortBy === "rating") list.sort((a, b) => b.rating - a.rating);

    grid.innerHTML = list.map((trip, idx) => {
        const isFav = state.favorites.has(trip.id);
        const isCmp = state.compareIds.includes(trip.id);
        const title = getTripTitle(trip);
        const cityLabel = I18N[state.lang].city_sharm || trip.city;
        const dur = getTripDuration(trip);
        const badgeText = state.lang === "ar"
            ? trip.badge
            : ((BADGE_I18N[state.lang] && BADGE_I18N[state.lang][trip.badge]) || trip.badge);
        const descText = getTripDesc(trip);

        return `
          <article style="--si:${idx}" class="trip-card in group rounded-2xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 hover:border-champagne/60 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
            <div class="relative h-52 overflow-hidden bg-carbon-900">
              <img src="${trip.img}" alt="${title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-carbon-950/90 via-transparent to-carbon-950/30"></div>
              <span class="absolute top-3 start-3 px-2.5 py-1 rounded-md bg-carbon-950/75 backdrop-blur-md border border-white/15 text-champagne text-[11px] font-extrabold">${badgeText}</span>
              <div class="absolute top-3 end-3 flex gap-1.5">
                <button type="button" onclick="toggleCompare('${trip.id}')" title="${I18N[state.lang].compare_btn}" aria-label="${I18N[state.lang].compare_btn}" class="p-2 rounded-lg ${isCmp ? 'bg-champagne text-carbon-950' : 'bg-carbon-950/60 text-white hover:bg-carbon-950'} backdrop-blur-md transition"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg></button>
                <button type="button" onclick="toggleFav('${trip.id}')" aria-label="Favorite" class="p-2 rounded-lg ${isFav ? 'bg-rose-500 text-white' : 'bg-carbon-950/60 text-white hover:bg-carbon-950'} backdrop-blur-md transition"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></button>
              </div>
              <div class="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
                <div>
                  <span class="text-[10px] text-[#B5B0A8] block">${I18N[state.lang].from_label}</span>
                  <span class="text-lg font-black text-champagne">${fmtPrice(trip.fromPrice)}</span>
                  <span class="text-[10px] text-[#B5B0A8]">(${fmtPrice(trip.adultPrice)})</span>
                </div>
                <span class="px-2 py-1 rounded-md bg-carbon-950/75 text-champagne text-xs font-black flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 fill-champagne"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${trip.rating}
                </span>
              </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div class="flex items-center gap-2.5 text-[11px] font-bold text-sea-dark dark:text-sea mb-2 flex-wrap">
                  <span>${cityLabel}</span>
                  <span>•</span>
                  <span>${dur}</span>
                  <span>•</span>
                  <span class="text-carbon-900/60 dark:text-[#9E9990]">${trip.vehicle}</span>
                </div>
                <h3 class="text-base font-black leading-snug mb-2">${title}</h3>
                <p class="text-xs text-carbon-900/70 dark:text-[#9E9990] leading-relaxed">${descText}</p>
              </div>
              <button type="button" onclick="openBookingWithTrip('${trip.id}')" class="w-full py-2.5 px-4 rounded-xl bg-carbon-900 dark:bg-champagne hover:bg-champagne hover:text-carbon-950 text-white dark:text-carbon-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition">
                <span>${I18N[state.lang].book_now}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 ${state.lang !== 'ar' ? 'rotate-180' : ''}"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              </button>
            </div>
          </article>`;
    }).join("");

    renderPriceTable();
    document.dispatchEvent(new CustomEvent("mosa:trips-rendered"));
}

export function toggleFav(id) {
    if (state.favorites.has(id)) {
        state.favorites.delete(id);
        showToast(I18N[state.lang].toast_fav_rem);
    } else {
        state.favorites.add(id);
        showToast(I18N[state.lang].toast_fav_add);
    }
    safeSetStorage("mosa_favs", JSON.stringify([...state.favorites]));
    renderTrips();
}

export function toggleCompare(id) {
    const i = state.compareIds.indexOf(id);
    if (i > -1) {
        state.compareIds.splice(i, 1);
    } else {
        if (state.compareIds.length >= 3) {
            showToast(I18N[state.lang].toast_cmp_max, "error");
            return;
        }
        state.compareIds.push(id);
    }
    const cnt = document.getElementById("compare-count");
    if (cnt) cnt.textContent = state.compareIds.length;
    renderTrips();
}

export function openCompareModal() {
    const b = document.getElementById("compare-body");
    if (!b) return;
    const items = SAFARI_TRIPS.filter(t => state.compareIds.includes(t.id));
    b.innerHTML = !items.length
        ? `<p class="text-center text-sm opacity-60 py-8">${I18N[state.lang].cmp_empty}</p>`
        : `<table class="w-full text-xs sm:text-sm text-start">
            <thead>
                <tr class="border-b border-carbon-900/10 dark:border-white/10">
                    <th class="p-3">${I18N[state.lang].cmp_crit}</th>
                    ${items.map(i => `<th class="p-3 font-black text-champagne-dark dark:text-champagne">${getTripTitle(i)}</th>`).join("")}
                </tr>
            </thead>
            <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                <tr>
                    <td class="p-3 font-bold">${I18N[state.lang].cmp_veh}</td>
                    ${items.map(i => `<td class="p-3">${i.vehicle}</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[state.lang].cmp_price}</td>
                    ${items.map(i => `<td class="p-3 font-black text-sea">${fmtPrice(i.fromPrice)} (${fmtPrice(i.adultPrice)})</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[state.lang].tbl_dur}</td>
                    ${items.map(i => `<td class="p-3">${getTripDuration(i)}</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[state.lang].tbl_rate}</td>
                    ${items.map(i => `<td class="p-3 font-bold text-champagne-dark dark:text-champagne">${i.rating} ★</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[state.lang].tbl_action}</td>
                    ${items.map(i => `<td class="p-3"><button type="button" onclick="document.getElementById('compare-modal').classList.add('hidden'); openBookingWithTrip('${i.id}')" class="px-3 py-1.5 rounded-lg bg-champagne text-carbon-950 font-black text-xs">${I18N[state.lang].book_now}</button></td>`).join("")}
                </tr>
            </tbody>
           </table>`;
    document.getElementById("compare-modal")?.classList.remove("hidden");
}
