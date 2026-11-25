/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import {
    SAFARI_TRIPS,
    MOSA_RULES,
    getStationLabel,
    getTripRoutes,
    getRouteLabel,
    getTripDetails,
    getTripPageUrl,
    getTripBadge
} from "../data/trips.js";
import { I18N, BADGE_I18N } from "../data/i18n.js";
import { state, fmtPrice, safeSetStorage } from "../state.js";
import { showToast } from "./ui.js";

const cardGalleryIdx = {};

if (typeof window !== "undefined") {
    window.cycleCardGallery = function (ev, cardKey, deltaOrIdx, isDirectIdx = false) {
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        const imgEl = document.querySelector(`[data-card-img="${cardKey}"]`);
        if (!imgEl) return;
        let list = [];
        try { list = JSON.parse(imgEl.dataset.gallery || "[]"); } catch { list = []; }
        if (list.length < 2) return;
        const cur = cardGalleryIdx[cardKey] || 0;
        const next = isDirectIdx
            ? Math.max(0, Math.min(list.length - 1, Number(deltaOrIdx) || 0))
            : (cur + Number(deltaOrIdx) + list.length) % list.length;
        cardGalleryIdx[cardKey] = next;
        imgEl.src = list[next];
        document.querySelectorAll(`[data-card-dot="${cardKey}"]`).forEach((dot, i) => {
            dot.classList.toggle("w-4", i === next);
            dot.classList.toggle("bg-champagne", i === next);
            dot.classList.toggle("w-1.5", i !== next);
            dot.classList.toggle("bg-white/50", i !== next);
        });
    };
}

function esc(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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

export function getStopClock(stop, lang = state.lang) {
    if (!stop) return "";
    return lang === "ar" ? (stop.timeAr || stop.timeEn || "") : (stop.timeEn || stop.timeAr || "");
}

function buildClearRoutesGrid(trip, lang = state.lang) {
    const routes = getTripRoutes(trip);
    const L = I18N[lang] || I18N.en;
    return `
        <div class="rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 p-3.5 space-y-2.5">
            <div class="flex items-center justify-between gap-2 text-[11px] font-black text-champagne-dark dark:text-champagne">
                <span>📍 ${esc(L.routes_box_title || "Scheduled Pickup Routes")}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                ${routes.map(route => `
                    <div class="rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 p-2.5 space-y-1.5">
                        <div class="text-[11px] font-black text-carbon-950 dark:text-champagne border-b border-carbon-900/10 dark:border-white/10 pb-1">
                            ${esc(getRouteLabel(route, lang))}
                        </div>
                        <div class="space-y-1">
                            ${(route.stops || []).map(st => `
                                <button type="button" onclick="openBookingWithStop('${esc(trip.id)}', '${esc(route.id)}', '${esc(st.station)}')"
                                    class="w-full px-2 py-1.5 rounded-lg bg-[#F6F3EC]/75 dark:bg-carbon-900/90 hover:bg-champagne hover:text-carbon-950 text-xs font-bold flex items-center justify-between gap-2 transition">
                                    <span class="truncate">${esc(getStationLabel(st.station, lang))}</span>
                                    <span class="font-mono font-black text-[11px] text-champagne-dark dark:text-champagne shrink-0">${st.emoji || "🕒"} ${esc(getStopClock(st, lang))}</span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

export function renderScheduleMatrix() {
    const root = document.getElementById("schedule-matrix-root");
    if (!root) return;

    const lang = state.lang || "ar";
    const trips = SAFARI_TRIPS.filter(t => t.active !== false);
    const rules = MOSA_RULES[lang] || MOSA_RULES.en;
    const L = I18N[lang] || I18N.en;
    const tapHint = {
        ar: "اضغط على أي نقطة استلام للحجز الفوري على نفس الموعد، أو افتح صفحة التفاصيل الكاملة لكل رحلة",
        en: "Tap any pickup station to book that exact slot, or open any tour's dedicated full details page",
        it: "Tocca un punto di ritiro per prenotare quell'orario oppure apri la pagina dedicata del tour",
        ru: "Нажмите на любую остановку для быстрой брони или откройте полную страницу программы"
    }[lang] || "Tap any station to book";

    root.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-5">
            <p class="text-xs sm:text-sm text-carbon-900/75 dark:text-[#B5B0A8] font-bold">${esc(tapHint)}</p>
            <span class="px-3 py-1 rounded-full bg-sea/15 border border-sea/30 text-sea text-[11px] font-black">${trips.length} ${lang === "ar" ? "رحلات رسمية يومية · 4–5 ساعات" : "Official Tours · 4–5 Hours"}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${trips.map(trip => {
                const title = getTripTitle(trip, lang);
                const routes = getTripRoutes(trip);
                const detailsUrl = getTripPageUrl(trip.id);
                return `
                    <article class="rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 p-5 flex flex-col justify-between gap-4">
                        <div class="space-y-3">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <a href="${esc(detailsUrl)}" class="text-base font-black leading-snug text-carbon-950 dark:text-champagne hover:underline">${esc(title)}</a>
                                    <div class="text-[11px] font-bold opacity-70 mt-0.5">⏱ ${esc(getTripDuration(trip, lang))} · ${esc(trip.vehicle)}</div>
                                </div>
                                <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-carbon-800 border border-champagne/35 text-sea font-black text-xs shrink-0">${fmtPrice(trip.fromPrice)}</span>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                ${routes.map(route => `
                                    <div class="rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 p-3 space-y-2">
                                        <div class="text-xs font-black text-champagne-dark dark:text-champagne border-b border-carbon-900/10 dark:border-white/10 pb-1.5">${esc(getRouteLabel(route, lang))}</div>
                                        <div class="space-y-1.5">
                                            ${(route.stops || []).map(st => `
                                                <button type="button" onclick="openBookingWithStop('${esc(trip.id)}', '${esc(route.id)}', '${esc(st.station)}')"
                                                    class="w-full px-2.5 py-1.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 hover:bg-champagne hover:text-carbon-950 text-start text-xs font-bold flex items-center justify-between gap-2 transition">
                                                    <span>${st.emoji || "🕒"} <strong class="font-mono">${esc(getStopClock(st, lang))}</strong></span>
                                                    <span class="font-extrabold">${esc(getStationLabel(st.station, lang))}</span>
                                                </button>
                                            `).join("")}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2.5">
                            <a href="${esc(detailsUrl)}"
                                class="py-2.5 px-3 rounded-xl border border-carbon-900/15 dark:border-champagne/40 hover:border-champagne text-center font-black text-xs transition flex items-center justify-center">
                                ${esc(L.view_details || "Details")}
                            </a>
                            <button type="button" onclick="openBookingWithTrip('${esc(trip.id)}')"
                                class="py-2.5 px-3 rounded-xl bg-carbon-900 dark:bg-champagne hover:bg-champagne hover:text-carbon-950 text-white dark:text-carbon-950 font-black text-xs transition">
                                ${esc(L.book_now || "Book Now")}
                            </button>
                        </div>
                    </article>
                `;
            }).join("")}
        </div>

        <div class="mt-6 rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 via-champagne/10 to-carbon-900/5 dark:from-champagne/15 dark:to-carbon-900 border border-champagne/40 space-y-2.5">
            <div class="text-sm sm:text-base font-black text-champagne-dark dark:text-champagne">${esc(rules.title)}</div>
            <ul class="space-y-1.5 text-xs sm:text-sm font-bold text-carbon-900/85 dark:text-[#F4EFE6]">
                ${rules.items.map(line => `<li class="flex items-start gap-2"><span class="text-champagne-dark dark:text-champagne shrink-0">•</span><span>${esc(line)}</span></li>`).join("")}
            </ul>
        </div>
    `;
}

export function renderPriceTable() {
    const tbody = document.getElementById("price-table-body");
    if (!tbody) return;

    const L = I18N[state.lang];
    tbody.innerHTML = SAFARI_TRIPS.filter(t => t.active !== false).map(trip => {
        const title = getTripTitle(trip);
        const dur = getTripDuration(trip);
        const detailsUrl = getTripPageUrl(trip.id);
        return `
            <tr class="hover:bg-champagne/5 transition">
                <td data-label="${L.tbl_prog}" class="p-3.5 font-bold">
                    <a href="${esc(detailsUrl)}" class="hover:text-champagne-dark dark:hover:text-champagne underline-offset-4 hover:underline">${esc(title)}</a>
                </td>
                <td data-label="${L.tbl_veh}" class="p-3.5 text-xs text-carbon-900/70 dark:text-[#B5B0A8]">${esc(trip.vehicle)}</td>
                <td data-label="${L.tbl_price}" class="p-3.5 text-sea font-extrabold whitespace-nowrap">${fmtPrice(trip.fromPrice)} <span class="text-[11px] font-normal text-carbon-900/55 dark:text-[#9E9990]">(${fmtPrice(trip.adultPrice)})</span></td>
                <td data-label="${L.tbl_dur}" class="p-3.5 font-bold whitespace-nowrap">${esc(dur)}</td>
                <td data-label="${L.tbl_rate}" class="p-3.5 font-bold text-champagne-dark dark:text-champagne whitespace-nowrap">${trip.rating} ★</td>
                <td class="p-3.5 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                        <a href="${esc(detailsUrl)}" class="px-2.5 py-1.5 rounded-lg border border-carbon-900/15 dark:border-white/15 hover:border-champagne text-xs font-extrabold transition">
                            ${state.lang === "ar" ? "التفاصيل" : "Details"}
                        </a>
                        <button type="button" onclick="openBookingWithTrip('${esc(trip.id)}')" class="px-3 py-1.5 rounded-lg bg-champagne hover:bg-champagne-light text-carbon-950 font-black text-xs transition">
                            ${L.book_now}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

export function renderTrips() {
    const grid = document.getElementById("trips-grid");
    if (!grid) return;

    const lang = state.lang || "ar";
    const L = I18N[lang] || I18N.en;
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
        const cityLabel = L.city_sharm || trip.city;
        const dur = getTripDuration(trip);
        const details = getTripDetails(trip, lang);
        const galleryList = (details.gallery && details.gallery.length) ? details.gallery : [trip.img];
        const cardKey = `d-${trip.id}`;
        const curGalIdx = (cardGalleryIdx[cardKey] || 0) % galleryList.length;
        const activePhoto = galleryList[curGalIdx] || trip.img;
        const detailsUrl = getTripPageUrl(trip.id);
        const badgeText = getTripBadge(trip, lang, BADGE_I18N);
        const descText = getTripDesc(trip);

        return `
          <article style="--si:${idx}" class="trip-card in group rounded-3xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 hover:border-champagne/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
            <div class="relative h-64 sm:h-72 overflow-hidden bg-carbon-900">
              <a href="${esc(detailsUrl)}" class="block w-full h-full">
                <img data-card-img="${esc(cardKey)}" data-gallery="${esc(JSON.stringify(galleryList))}" src="${esc(activePhoto)}" alt="${esc(title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </a>
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-carbon-950/90 via-carbon-950/20 to-carbon-950/40"></div>

              ${galleryList.length > 1 ? `
                <button type="button" onclick="cycleCardGallery(event, '${esc(cardKey)}', -1)" aria-label="Previous photo"
                  class="absolute start-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-carbon-950/75 hover:bg-champagne hover:text-carbon-950 text-white border border-white/20 text-base font-black grid place-items-center transition opacity-90 sm:opacity-0 sm:group-hover:opacity-100">‹</button>
                <button type="button" onclick="cycleCardGallery(event, '${esc(cardKey)}', 1)" aria-label="Next photo"
                  class="absolute end-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-carbon-950/75 hover:bg-champagne hover:text-carbon-950 text-white border border-white/20 text-base font-black grid place-items-center transition opacity-90 sm:opacity-0 sm:group-hover:opacity-100">›</button>
                <div class="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-20">
                  ${galleryList.map((_, gi) => `<button type="button" data-card-dot="${esc(cardKey)}" onclick="cycleCardGallery(event, '${esc(cardKey)}', ${gi}, true)" aria-label="Photo ${gi + 1}" class="h-1.5 rounded-full transition-all ${gi === curGalIdx ? 'w-4 bg-champagne' : 'w-1.5 bg-white/50'}"></button>`).join("")}
                </div>
              ` : ""}

              <!-- Top Badges -->
              <div class="absolute top-3.5 start-3.5 flex flex-wrap items-center gap-1.5 z-10">
                <span class="px-3 py-1 rounded-full bg-carbon-950/80 backdrop-blur-md border border-champagne/40 text-champagne text-xs font-black">${esc(badgeText)}</span>
                <span class="px-3 py-1 rounded-full bg-sea/90 text-carbon-950 text-xs font-black flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${esc(dur)}
                </span>
                ${galleryList.length > 1 ? `<span class="px-2 py-1 rounded-full bg-carbon-950/80 border border-white/15 text-white text-[10.5px] font-black">📷 ${galleryList.length}</span>` : ""}
              </div>

              <!-- Compare & Favorite -->
              <div class="absolute top-3.5 end-3.5 flex gap-1.5 z-10">
                <button type="button" onclick="toggleCompare('${esc(trip.id)}')" title="${L.compare_btn}" aria-label="${L.compare_btn}" class="p-2.5 rounded-xl ${isCmp ? 'bg-champagne text-carbon-950' : 'bg-carbon-950/70 text-white hover:bg-carbon-950'} backdrop-blur-md border border-white/15 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
                </button>
                <button type="button" onclick="toggleFav('${esc(trip.id)}')" aria-label="Favorite" class="p-2.5 rounded-xl ${isFav ? 'bg-rose-500 text-white' : 'bg-carbon-950/70 text-white hover:bg-carbon-950'} backdrop-blur-md border border-white/15 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
              </div>

              <!-- Bottom Price & Departure Window Overlay -->
              <div class="pointer-events-none absolute bottom-4 inset-x-4 flex items-end justify-between gap-3 text-white z-10">
                <div>
                  <span class="text-[11px] font-bold text-white/80 block">${L.from_label}</span>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-black text-champagne">${fmtPrice(trip.fromPrice)}</span>
                    <span class="text-xs text-white/75 line-through/0">(${fmtPrice(trip.adultPrice)})</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="px-2.5 py-1 rounded-xl bg-carbon-950/80 backdrop-blur-md border border-white/15 text-xs font-extrabold">${esc(details.departureWindow)}</span>
                  <span class="px-2.5 py-1 rounded-xl bg-carbon-950/80 backdrop-blur-md border border-champagne/40 text-champagne text-xs font-black flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 fill-champagne"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ${trip.rating}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
              <div class="space-y-3.5">
                <div class="flex items-center justify-between gap-2 text-xs font-extrabold text-sea-dark dark:text-sea flex-wrap">
                  <span>📍 ${esc(cityLabel)} · ⏱ ${esc(dur)}</span>
                  <span class="text-carbon-900/65 dark:text-[#B5B0A8]">${esc(trip.vehicle)}</span>
                </div>

                <div>
                  <h3 class="text-lg sm:text-xl font-black leading-snug">
                    <a href="${esc(detailsUrl)}" class="hover:text-champagne-dark dark:hover:text-champagne transition">${esc(title)}</a>
                  </h3>
                  <p class="text-xs sm:text-sm text-carbon-900/75 dark:text-[#B5B0A8] leading-relaxed mt-1.5">${esc(descText)}</p>
                </div>

                <!-- Highlights Chips -->
                <div class="flex flex-wrap gap-1.5">
                  ${(details.highlights || []).slice(0, 4).map(hl => `
                    <span class="px-2.5 py-1 rounded-lg bg-champagne/10 border border-champagne/25 text-[11px] font-extrabold text-carbon-900 dark:text-champagne-light">✓ ${esc(hl)}</span>
                  `).join("")}
                </div>

                <!-- Crystal-Clear 2-Route Timetable -->
                ${buildClearRoutesGrid(trip, lang)}
              </div>

              <!-- Dual Editorial Footer Actions -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-carbon-900/10 dark:border-white/10">
                <a href="${esc(detailsUrl)}"
                  class="py-3 px-4 rounded-xl border-2 border-carbon-900/15 dark:border-champagne/40 hover:border-champagne hover:bg-champagne/10 text-carbon-950 dark:text-champagne font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span>${esc(L.view_details || "Full Details")}</span>
                </a>
                <button type="button" onclick="openBookingWithTrip('${esc(trip.id)}')"
                  class="py-3 px-4 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 font-black text-xs sm:text-sm shadow-lg shadow-champagne/20 flex items-center justify-center gap-2 transition">
                  <span>${esc(L.book_now)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 ${lang !== 'ar' ? 'rotate-180' : ''}"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </button>
              </div>
            </div>
          </article>`;
    }).join("");

    renderScheduleMatrix();
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
    const lang = state.lang || "ar";
    const items = SAFARI_TRIPS.filter(t => state.compareIds.includes(t.id));
    const routesLbl = {
        ar: "مواعيد التحرك والمسارات",
        en: "Pickup Routes & Times",
        it: "Percorsi e Orari Ritiro",
        ru: "Маршруты и время"
    }[lang] || "Pickup Routes";

    b.innerHTML = !items.length
        ? `<p class="text-center text-sm opacity-60 py-8">${I18N[lang].cmp_empty}</p>`
        : `<table class="w-full text-xs sm:text-sm text-start">
            <thead>
                <tr class="border-b border-carbon-900/10 dark:border-white/10">
                    <th class="p-3">${I18N[lang].cmp_crit}</th>
                    ${items.map(i => `<th class="p-3 font-black text-champagne-dark dark:text-champagne"><a href="${esc(getTripPageUrl(i.id))}" class="hover:underline">${esc(getTripTitle(i))}</a></th>`).join("")}
                </tr>
            </thead>
            <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                <tr>
                    <td class="p-3 font-bold">${I18N[lang].cmp_veh}</td>
                    ${items.map(i => `<td class="p-3">${esc(i.vehicle)}</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[lang].cmp_price}</td>
                    ${items.map(i => `<td class="p-3 font-black text-sea">${fmtPrice(i.fromPrice)} (${fmtPrice(i.adultPrice)})</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[lang].tbl_dur}</td>
                    ${items.map(i => `<td class="p-3 font-bold">${esc(getTripDuration(i))}</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${routesLbl}</td>
                    ${items.map(i => `<td class="p-3 text-xs space-y-1">${getTripRoutes(i).map(r => `<div><strong class="text-champagne-dark dark:text-champagne">${esc(getRouteLabel(r, lang))}:</strong> ${(r.stops || []).map(st => `${esc(getStopClock(st, lang))} ${esc(getStationLabel(st.station, lang))}`).join(" · ")}</div>`).join("")}</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[lang].tbl_rate}</td>
                    ${items.map(i => `<td class="p-3 font-bold text-champagne-dark dark:text-champagne">${i.rating} ★</td>`).join("")}
                </tr>
                <tr>
                    <td class="p-3 font-bold">${I18N[lang].tbl_action}</td>
                    ${items.map(i => `<td class="p-3"><div class="flex flex-wrap gap-1.5"><a href="${esc(getTripPageUrl(i.id))}" class="px-2.5 py-1.5 rounded-lg border border-carbon-900/15 dark:border-white/15 font-bold text-xs">${lang === "ar" ? "التفاصيل" : "Details"}</a><button type="button" onclick="document.getElementById('compare-modal').classList.add('hidden'); openBookingWithTrip('${esc(i.id)}')" class="px-3 py-1.5 rounded-lg bg-champagne text-carbon-950 font-black text-xs">${I18N[lang].book_now}</button></div></td>`).join("")}
                </tr>
            </tbody>
           </table>`;
    document.getElementById("compare-modal")?.classList.remove("hidden");
}
