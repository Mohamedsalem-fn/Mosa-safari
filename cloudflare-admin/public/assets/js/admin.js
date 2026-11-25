/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import {
    SAFARI_TRIPS,
    BUILTIN_GALLERY_LIBRARY,
    PICKUP_STATIONS,
    getTripDetails,
    getTripRoutes
} from "./data/trips.js";

const STORAGE_LANG_KEY = "mosa_admin_lang_v1";
const STORAGE_THEME_KEY = "mosa_admin_theme_v1";

const IMAGE_CHOICES = BUILTIN_GALLERY_LIBRARY;

const AT = {
    ar: {
        brand_title: "موسى سفاري",
        brand_sub: "مركز القيادة والتحكم",
        nav_overview: "نظرة عامة والتحليلات",
        nav_bookings: "إدارة الحجوزات",
        nav_tours: "الرحلات والأسعار",
        nav_promos: "أكواد الخصم",
        nav_customers: "قاعدة العملاء",
        nav_analytics: "التحليلات المتقدمة",
        nav_email: "ربط بريد جوجل",
        nav_settings: "إعدادات المنصة",
        nav_audit: "النظام وسجل النشاط",
        open_site: "فتح الموقع المباشر",
        logout: "تسجيل الخروج",
        refresh: "تحديث",
        add_booking: "حجز يدوي",
        synced_at: "آخر تحديث:",
        status_pending: "قيد الانتظار",
        status_confirmed: "مؤكد",
        status_completed: "مكتمل",
        status_cancelled: "ملغي",
        pay_arrival: "عند الوصول",
        pay_visa: "فيزا / بطاقة",
        slot_morning: "صباحاً",
        slot_evening: "مساءً",
        src_web: "الموقع",
        src_manual: "يدوي",
        save: "حفظ التغييرات",
        cancel: "إلغاء",
        delete_btn: "حذف",
        edit_btn: "تعديل",
        view_btn: "تفاصيل",
        export_csv: "تصدير Excel (CSV)",
        reset_defaults: "استعادة الافتراضي",
        add_tour: "إضافة رحلة جديدة",
        add_promo: "إضافة كود خصم",
        no_data: "لا توجد بيانات مطابقة حتى الآن.",
        confirm_delete_bk: "هل أنت متأكد من حذف هذا الحجز نهائياً؟",
        confirm_reset_tours: "استعادة الـ 4 رحلات الرسمية الافتراضية وحذف التعديلات المخصصة؟",
        confirm_reset_analytics: "تصفير جميع عدادات الزيارات والتحليلات؟"
    },
    en: {
        brand_title: "Mosa Safari",
        brand_sub: "Command Center",
        nav_overview: "Overview & KPIs",
        nav_bookings: "Bookings CRM",
        nav_tours: "Tours & Pricing",
        nav_promos: "Promo Codes",
        nav_customers: "Customers",
        nav_analytics: "Deep Analytics",
        nav_email: "Google Email (Gmail)",
        nav_settings: "Platform Settings",
        nav_audit: "System & Audit Log",
        open_site: "Open Live Site",
        logout: "Sign Out",
        refresh: "Refresh",
        add_booking: "Manual Booking",
        synced_at: "Synced:",
        status_pending: "Pending",
        status_confirmed: "Confirmed",
        status_completed: "Completed",
        status_cancelled: "Cancelled",
        pay_arrival: "Pay on Arrival",
        pay_visa: "Visa / Card",
        slot_morning: "Morning",
        slot_evening: "Evening",
        src_web: "Web",
        src_manual: "Manual",
        save: "Save Changes",
        cancel: "Cancel",
        delete_btn: "Delete",
        edit_btn: "Edit",
        view_btn: "Inspect",
        export_csv: "Export CSV",
        reset_defaults: "Reset Defaults",
        add_tour: "Add New Tour",
        add_promo: "New Promo Code",
        no_data: "No matching records yet.",
        confirm_delete_bk: "Permanently delete this booking?",
        confirm_reset_tours: "Reset catalog to built-in 8 tours?",
        confirm_reset_analytics: "Reset all visitor and funnel analytics?"
    }
};

const adminState = {
    csrfToken: "",
    lang: "ar",
    activeTab: "overview",
    chartDays: 14,
    searchQuery: "",
    bkFilters: { status: "all", payment: "all", slot: "all", source: "all" },
    overview: {
        bookings: [],
        trips: null,
        promos: [],
        settings: {},
        mailConfig: {
            provider: "gmail_smtp",
            enabled: false,
            gmailAddress: "",
            senderName: "Mosa Safari · موسى سفاري",
            replyTo: "",
            bccOwner: true,
            fallbackResend: true,
            appsScriptUrl: "",
            hasAppPassword: false,
            appPasswordMask: "",
            hasScriptSecret: false,
            connected: false,
            updatedAt: ""
        },
        analytics: {
            totalViews: 0,
            uniqueSessions: 0,
            modalOpens: 0,
            bookingsCompleted: 0,
            byLang: { ar: 0, en: 0, it: 0, ru: 0 },
            byCurrency: { USD: 0, EGP: 0, EUR: 0 },
            byDevice: { mobile: 0, desktop: 0 },
            tourClicks: {},
            daily: {}
        },
        auditLog: [],
        health: {}
    },
    charts: {}
};

function t(k) {
    return (AT[adminState.lang] && AT[adminState.lang][k]) || AT.en[k] || k;
}

function esc(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function effectiveTrips() {
    if (Array.isArray(adminState.overview.trips) && adminState.overview.trips.length > 0) {
        return adminState.overview.trips;
    }
    return SAFARI_TRIPS.map(item => ({ ...item, active: item.active !== false }));
}

function showAdminToast(msg, type = "ok") {
    const c = document.getElementById("admin-toast-container");
    if (!c) return;
    const el = document.createElement("div");
    el.className = `pointer-events-auto px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-black backdrop-blur-lg transition-all ${
        type === "err"
            ? "bg-rose-600 text-white border-rose-400/50"
            : "bg-carbon-900 text-champagne border-champagne/40"
    }`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => {
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 250);
    }, 3200);
}

async function apiFetch(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = { ...(options.headers || {}) };
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && adminState.csrfToken) {
        headers["X-CSRF-Token"] = adminState.csrfToken;
    }
    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(path, {
        ...options,
        method,
        headers,
        credentials: "same-origin"
    });
    if (res.status === 401 && path !== "/api/admin/login" && path !== "/api/admin/session") {
        await handleLogout(false, false);
        showAdminToast(adminState.lang === "ar" ? "انتهت الجلسة، يرجى تسجيل الدخول مجدداً" : "Session expired", "err");
        throw new Error("Unauthorized");
    }
    const data = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
    if (!res.ok || data.ok === false) {
        throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
}

function applyAdminTheme(mode) {
    if (mode === "light") {
        document.documentElement.classList.remove("dark");
    } else {
        document.documentElement.classList.add("dark");
    }
    try { localStorage.setItem(STORAGE_THEME_KEY, mode); } catch { /* ignore */ }
}

function applyAdminLang(lang) {
    adminState.lang = lang === "en" ? "en" : "ar";
    document.documentElement.lang = adminState.lang;
    document.documentElement.dir = adminState.lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem(STORAGE_LANG_KEY, adminState.lang); } catch { /* ignore */ }
    document.querySelectorAll("[data-at]").forEach(el => {
        const k = el.getAttribute("data-at");
        if (k) el.textContent = t(k);
    });
    const srch = document.getElementById("admin-global-search");
    if (srch) {
        srch.placeholder = adminState.lang === "ar"
            ? "بحث سريع (رقم حجز، اسم، هاتف)..."
            : "Quick search (Ref, name, phone)...";
    }
    updateTopbarTitle();
    renderActiveTab();
}

function updateTopbarTitle() {
    const el = document.getElementById("topbar-title");
    if (el) el.textContent = t("nav_" + adminState.activeTab);
}

function updateNavBadges() {
    const bookings = adminState.overview.bookings || [];
    const pendingCount = bookings.filter(b => b.status === "pending").length;
    const tripsCount = effectiveTrips().filter(tr => tr.active !== false).length;
    const promosCount = (adminState.overview.promos || []).filter(p => p.active !== false).length;

    const pEl = document.getElementById("nav-badge-pending");
    const tEl = document.getElementById("nav-badge-tours");
    const prEl = document.getElementById("nav-badge-promos");
    const emEl = document.getElementById("nav-badge-email");
    if (pEl) pEl.textContent = String(pendingCount);
    if (tEl) tEl.textContent = String(tripsCount);
    if (prEl) prEl.textContent = String(promosCount);
    if (emEl) {
        const mc = adminState.overview.mailConfig || {};
        const connected = Boolean(mc.connected);
        const isAr = adminState.lang === "ar";
        emEl.textContent = connected ? (isAr ? "متصل ✓" : "Connected") : (isAr ? "غير مربوط" : "Setup");
        emEl.className = connected
            ? "px-2 py-0.5 rounded-full bg-sea/20 text-sea text-[10px] font-black"
            : "px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black";
    }
}

function computeStats() {
    const bookings = adminState.overview.bookings || [];
    const analytics = adminState.overview.analytics || {};
    const egpRate = Number(adminState.overview.settings?.manualEgpRate) || 50.5;

    let totalRevUsd = 0;
    let confirmedRevUsd = 0;
    let pendingRevUsd = 0;
    let cancelledRevUsd = 0;
    let totalGuests = 0;
    let morningCount = 0;
    let eveningCount = 0;
    let arrivalCount = 0;
    let visaCount = 0;

    const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    const tourRev = {};
    const tourBookCount = {};

    for (const b of bookings) {
        const usd = Number(b.totalUsd) || 0;
        const st = statusCounts[b.status] !== undefined ? b.status : "pending";
        statusCounts[st]++;

        if (st === "cancelled") {
            cancelledRevUsd += usd;
        } else {
            totalRevUsd += usd;
            if (st === "confirmed" || st === "completed") confirmedRevUsd += usd;
            if (st === "pending") pendingRevUsd += usd;
        }

        totalGuests += (Number(b.adults) || 0) + (Number(b.children) || 0);
        if (b.tripTime === "evening") eveningCount++;
        else morningCount++;
        if (b.paymentMethod === "visa") visaCount++;
        else arrivalCount++;

        const ids = Array.isArray(b.selectedIds) && b.selectedIds.length
            ? b.selectedIds
            : ["other"];
        const shareUsd = st === "cancelled" ? 0 : usd / ids.length;
        for (const id of ids) {
            tourRev[id] = (tourRev[id] || 0) + shareUsd;
            tourBookCount[id] = (tourBookCount[id] || 0) + 1;
        }
    }

    const activeCount = bookings.length - statusCounts.cancelled;
    const aovUsd = activeCount > 0 ? totalRevUsd / activeCount : 0;
    const totalViews = Number(analytics.totalViews) || 0;
    const modalOpens = Number(analytics.modalOpens) || 0;
    const bookingsDone = Math.max(Number(analytics.bookingsCompleted) || 0, bookings.length);
    const convRate = totalViews > 0 ? ((bookingsDone / totalViews) * 100) : 0;

    return {
        totalBookings: bookings.length,
        activeCount,
        statusCounts,
        totalRevUsd,
        totalRevEgp: totalRevUsd * egpRate,
        confirmedRevUsd,
        pendingRevUsd,
        cancelledRevUsd,
        aovUsd,
        totalGuests,
        morningCount,
        eveningCount,
        arrivalCount,
        visaCount,
        totalViews,
        modalOpens,
        bookingsDone,
        convRate,
        tourRev,
        tourBookCount
    };
}

function statusBadgeHtml(status) {
    const map = {
        pending: "bg-amber-500/15 text-amber-500 border-amber-500/35",
        confirmed: "bg-sea/15 text-sea border-sea/35",
        completed: "bg-champagne/20 text-champagne-dark dark:text-champagne border-champagne/40",
        cancelled: "bg-rose-500/15 text-rose-500 border-rose-500/35"
    };
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-black ${map[status] || map.pending}">${esc(t("status_" + status))}</span>`;
}

function destroyCharts() {
    for (const k of Object.keys(adminState.charts)) {
        try { adminState.charts[k].destroy(); } catch { /* ignore */ }
        delete adminState.charts[k];
    }
}

function renderOverviewTab(root) {
    const s = computeStats();
    const isAr = adminState.lang === "ar";
    const recent = (adminState.overview.bookings || []).slice(0, 6);

    root.innerHTML = `
        <!-- KPI GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div class="admin-kpi-card rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold opacity-70">${isAr ? "إجمالي الإيرادات (النشطة)" : "Active Revenue (USD)"}</span>
                    <span class="w-9 h-9 rounded-2xl bg-champagne/15 text-champagne grid place-items-center text-base">💰</span>
                </div>
                <div class="text-3xl font-black text-champagne-dark dark:text-champagne mt-2">$${s.totalRevUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div class="text-[11px] opacity-70 mt-1.5 flex flex-wrap gap-3">
                    <span>≈ ${Math.round(s.totalRevEgp).toLocaleString()} ج.م</span>
                    <span class="text-sea font-bold">${isAr ? "مؤكد:" : "Confirmed:"} $${s.confirmedRevUsd.toFixed(0)}</span>
                    <span class="text-amber-500 font-bold">${isAr ? "انتظار:" : "Pending:"} $${s.pendingRevUsd.toFixed(0)}</span>
                </div>
            </div>

            <div class="admin-kpi-card rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold opacity-70">${isAr ? "إجمالي الحجوزات" : "Total Bookings"}</span>
                    <span class="w-9 h-9 rounded-2xl bg-sea/15 text-sea grid place-items-center text-base">📅</span>
                </div>
                <div class="text-3xl font-black mt-2">${s.totalBookings}</div>
                <div class="text-[11px] mt-1.5 flex flex-wrap gap-2 font-bold">
                    <span class="text-sea">${s.statusCounts.confirmed + s.statusCounts.completed} ${isAr ? "مؤكد/مكتمل" : "Confirmed"}</span> ·
                    <span class="text-amber-500">${s.statusCounts.pending} ${isAr ? "انتظار" : "Pending"}</span> ·
                    <span class="text-rose-500">${s.statusCounts.cancelled} ${isAr ? "ملغي" : "Cancelled"}</span>
                </div>
            </div>

            <div class="admin-kpi-card rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold opacity-70">${isAr ? "معدل التحويل والزيارات" : "Traffic & Conversion"}</span>
                    <span class="w-9 h-9 rounded-2xl bg-copper/15 text-copper grid place-items-center text-base">🚀</span>
                </div>
                <div class="text-3xl font-black text-sea mt-2">${s.convRate.toFixed(2)}%</div>
                <div class="text-[11px] opacity-75 mt-1.5 flex flex-wrap gap-2">
                    <span>${s.totalViews.toLocaleString()} ${isAr ? "زيارة" : "views"}</span> ·
                    <span>${adminState.overview.analytics?.uniqueSessions || 0} ${isAr ? "جلسة" : "sessions"}</span> ·
                    <span>${s.modalOpens} ${isAr ? "فتح حجز" : "modal opens"}</span>
                </div>
            </div>

            <div class="admin-kpi-card rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold opacity-70">${isAr ? "متوسط قيمة الحجز (AOV)" : "Average Order Value"}</span>
                    <span class="w-9 h-9 rounded-2xl bg-champagne/15 text-champagne grid place-items-center text-base">📈</span>
                </div>
                <div class="text-3xl font-black mt-2">$${s.aovUsd.toFixed(2)}</div>
                <div class="text-[11px] opacity-75 mt-1.5">${s.totalGuests} ${isAr ? "إجمالي الضيوف المسجلين" : "total registered guests"}</div>
            </div>

            <div class="admin-kpi-card rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold opacity-70">${isAr ? "توزيع المواعيد والدفع" : "Slots & Payments Split"}</span>
                    <span class="w-9 h-9 rounded-2xl bg-sea/15 text-sea grid place-items-center text-base">💳</span>
                </div>
                <div class="text-sm font-black mt-3 space-y-1.5">
                    <div class="flex justify-between"><span>☀️ ${t("slot_morning")} / 🌙 ${t("slot_evening")}</span><span class="text-champagne-dark dark:text-champagne">${s.morningCount} / ${s.eveningCount}</span></div>
                    <div class="flex justify-between"><span>💵 ${t("pay_arrival")} / 💳 ${t("pay_visa")}</span><span class="text-sea">${s.arrivalCount} / ${s.visaCount}</span></div>
                </div>
            </div>

            <div class="admin-kpi-card rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold opacity-70">${isAr ? "صحة البنية والخصومات" : "System & Promo Usage"}</span>
                    <span class="w-9 h-9 rounded-2xl bg-sea/15 text-sea grid place-items-center text-base">⚡</span>
                </div>
                <div class="text-sm font-black mt-3 space-y-1.5">
                    <div class="flex justify-between"><span>Cloudflare KV</span><span class="${adminState.overview.health?.kvBound ? 'text-sea' : 'text-rose-500'}">${adminState.overview.health?.kvBound ? '● Connected' : '○ Offline'}</span></div>
                    <div class="flex justify-between"><span>${isAr ? "استخدامات الأكواد" : "Promo Uses"}</span><span class="text-champagne-dark dark:text-champagne">${(adminState.overview.promos || []).reduce((a, p) => a + (p.uses || 0), 0)}</span></div>
                </div>
            </div>
        </div>

        <!-- CHARTS ROW -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div class="lg:col-span-8 rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 class="text-sm sm:text-base font-black">${isAr ? "الإيرادات والحجوزات اليومية" : "Daily Revenue & Bookings"}</h2>
                        <p class="text-[11px] opacity-65">${isAr ? "تتبع فوري للإيرادات ($USD) وعدد الحجوزات" : "Real-time USD revenue & booking velocity"}</p>
                    </div>
                    <div class="flex gap-1.5">
                        ${[7, 14, 30].map(d => `<button type="button" data-chart-days="${d}" class="chart-range-btn px-2.5 py-1 rounded-lg text-xs font-black ${adminState.chartDays === d ? 'bg-champagne text-carbon-950' : 'bg-carbon-900/5 dark:bg-white/10'}">${d}${isAr ? 'ي' : 'D'}</button>`).join("")}
                    </div>
                </div>
                <div class="chart-box"><canvas id="chart-revenue-daily"></canvas></div>
            </div>

            <div class="lg:col-span-4 rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <h2 class="text-sm sm:text-base font-black mb-1">${isAr ? "أداء البرامج والحصص" : "Revenue by Safari Program"}</h2>
                <p class="text-[11px] opacity-65 mb-4">${isAr ? "توزيع الإيرادات حسب الرحلة" : "Share of active USD revenue"}</p>
                <div class="chart-box"><canvas id="chart-tours-share"></canvas></div>
            </div>
        </div>

        <!-- RECENT BOOKINGS -->
        <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
            <div class="flex items-center justify-between gap-3 mb-4">
                <h2 class="text-sm sm:text-base font-black">${isAr ? "أحدث الحجوزات المسجلة" : "Latest Bookings"}</h2>
                <button type="button" id="overview-all-bk-btn" class="px-3 py-1.5 rounded-xl bg-champagne/15 text-champagne-dark dark:text-champagne text-xs font-black hover:bg-champagne/25 transition">${isAr ? "عرض كل الحجوزات ←" : "View All Bookings →"}</button>
            </div>
            ${recent.length ? `
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-start">
                    <thead class="border-b border-carbon-900/10 dark:border-white/10 opacity-70 font-black">
                        <tr>
                            <th class="py-2.5 px-3 text-start">${isAr ? "المرجع" : "Ref"}</th>
                            <th class="py-2.5 px-3 text-start">${isAr ? "العميل" : "Customer"}</th>
                            <th class="py-2.5 px-3 text-start">${isAr ? "الرحلة والموعد" : "Tour & Date"}</th>
                            <th class="py-2.5 px-3 text-start">${isAr ? "الإجمالي" : "Total"}</th>
                            <th class="py-2.5 px-3 text-start">${isAr ? "الحالة" : "Status"}</th>
                            <th class="py-2.5 px-3 text-end">${isAr ? "إجراء" : "Action"}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                        ${recent.map(b => `
                        <tr class="hover:bg-champagne/5">
                            <td class="py-3 px-3 font-mono font-black text-champagne-dark dark:text-champagne">${esc(b.ref)}</td>
                            <td class="py-3 px-3">
                                <div class="font-bold">${esc(b.name)}</div>
                                <div class="opacity-65 font-mono text-[11px]">${esc(b.phone)}</div>
                            </td>
                            <td class="py-3 px-3 max-w-[240px] truncate">
                                <div class="font-bold truncate">${esc(b.selectedTours)}</div>
                                <div class="opacity-65 text-[11px]">${esc(b.tripDate)} · ${b.tripTime === "evening" ? t("slot_evening") : t("slot_morning")}</div>
                            </td>
                            <td class="py-3 px-3 font-black text-sea">$${Number(b.totalUsd || 0).toFixed(2)}</td>
                            <td class="py-3 px-3">${statusBadgeHtml(b.status)}</td>
                            <td class="py-3 px-3 text-end">
                                <button type="button" data-inspect-bk="${esc(b.ref)}" class="px-2.5 py-1 rounded-lg bg-carbon-900/10 dark:bg-white/10 hover:bg-champagne hover:text-carbon-950 font-black transition">${t("view_btn")}</button>
                            </td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>` : `<div class="py-8 text-center text-xs opacity-60">${t("no_data")}</div>`}
        </div>
    `;

    root.querySelectorAll(".chart-range-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            adminState.chartDays = Number(btn.dataset.chartDays) || 14;
            renderActiveTab();
        });
    });
    document.getElementById("overview-all-bk-btn")?.addEventListener("click", () => switchTab("bookings"));
    root.querySelectorAll("[data-inspect-bk]").forEach(btn => {
        btn.addEventListener("click", () => openBookingDetailModal(btn.dataset.inspectBk));
    });

    initOverviewCharts(s);
}

function initOverviewCharts(stats) {
    if (typeof window.Chart !== "function") return;
    const isDark = document.documentElement.classList.contains("dark");
    const gridCol = isDark ? "rgba(255,255,255,0.08)" : "rgba(14,16,21,0.08)";
    const textCol = isDark ? "#B5B0A8" : "#4A4E58";
    const isAr = adminState.lang === "ar";

    const dailyCanvas = document.getElementById("chart-revenue-daily");
    if (dailyCanvas) {
        const labels = [];
        const revSeries = [];
        const bkSeries = [];
        const dailyMap = adminState.overview.analytics?.daily || {};

        for (let i = adminState.chartDays - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const iso = d.toISOString().split("T")[0];
            labels.push(iso.slice(5));
            const day = dailyMap[iso] || { revenueUsd: 0, bookings: 0 };
            revSeries.push(Number(day.revenueUsd || 0));
            bkSeries.push(Number(day.bookings || 0));
        }

        adminState.charts.daily = new window.Chart(dailyCanvas, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: isAr ? "الإيرادات ($)" : "Revenue ($)",
                        data: revSeries,
                        borderColor: "#D9B36C",
                        backgroundColor: "rgba(217,179,108,0.18)",
                        fill: true,
                        tension: 0.35,
                        yAxisID: "y"
                    },
                    {
                        label: isAr ? "الحجوزات" : "Bookings",
                        data: bkSeries,
                        borderColor: "#2CB5A0",
                        backgroundColor: "rgba(44,181,160,0.22)",
                        tension: 0.35,
                        yAxisID: "y1"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textCol, font: { family: "Cairo, Inter, sans-serif", weight: "bold" } } } },
                scales: {
                    x: { grid: { color: gridCol }, ticks: { color: textCol } },
                    y: { position: "left", grid: { color: gridCol }, ticks: { color: textCol } },
                    y1: { position: "right", grid: { drawOnChartArea: false }, ticks: { color: textCol, precision: 0 } }
                }
            }
        });
    }

    const toursCanvas = document.getElementById("chart-tours-share");
    if (toursCanvas) {
        const trips = effectiveTrips();
        const entries = Object.entries(stats.tourRev).filter(([, v]) => v > 0);
        const labels = entries.length
            ? entries.map(([id]) => {
                const match = trips.find(x => x.id === id);
                return match ? (isAr ? match.titleAr : match.titleEn).slice(0, 26) : id;
            })
            : [isAr ? "لا توجد إيرادات بعد" : "No revenue yet"];
        const vals = entries.length ? entries.map(([, v]) => Number(v.toFixed(2))) : [1];
        const colors = ["#D9B36C", "#2CB5A0", "#D96B38", "#EDD29B", "#1D8A79", "#3B82F6", "#A855F7", "#EC4899"];

        adminState.charts.tours = new window.Chart(toursCanvas, {
            type: "doughnut",
            data: {
                labels,
                datasets: [{ data: vals, backgroundColor: entries.length ? colors : ["rgba(150,150,150,0.25)"], borderWidth: 0 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "66%",
                plugins: { legend: { position: "bottom", labels: { color: textCol, boxWidth: 10, font: { size: 11 } } } }
            }
        });
    }
}

function getFilteredBookings() {
    const q = adminState.searchQuery.trim().toLowerCase();
    const { status, payment, slot, source } = adminState.bkFilters;
    return (adminState.overview.bookings || []).filter(b => {
        if (status !== "all" && b.status !== status) return false;
        if (payment !== "all" && b.paymentMethod !== payment) return false;
        if (slot !== "all" && (b.tripTime || "morning") !== slot) return false;
        if (source !== "all" && (b.source || "web") !== source) return false;
        if (q) {
            const hay = `${b.ref} ${b.name} ${b.phone} ${b.email} ${b.pickupHotel} ${b.selectedTours}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });
}

function downloadCsv(filename, rows) {
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function renderBookingsTab(root) {
    const isAr = adminState.lang === "ar";
    const list = getFilteredBookings();
    const f = adminState.bkFilters;

    root.innerHTML = `
        <div class="rounded-3xl p-4 sm:p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 flex-1">
                    <select id="bk-flt-status" class="px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-extrabold">
                        <option value="all">${isAr ? "كل الحالات" : "All Statuses"}</option>
                        <option value="pending" ${f.status === "pending" ? "selected" : ""}>${t("status_pending")}</option>
                        <option value="confirmed" ${f.status === "confirmed" ? "selected" : ""}>${t("status_confirmed")}</option>
                        <option value="completed" ${f.status === "completed" ? "selected" : ""}>${t("status_completed")}</option>
                        <option value="cancelled" ${f.status === "cancelled" ? "selected" : ""}>${t("status_cancelled")}</option>
                    </select>
                    <select id="bk-flt-pay" class="px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-extrabold">
                        <option value="all">${isAr ? "كل طرق الدفع" : "All Payments"}</option>
                        <option value="arrival" ${f.payment === "arrival" ? "selected" : ""}>${t("pay_arrival")}</option>
                        <option value="visa" ${f.payment === "visa" ? "selected" : ""}>${t("pay_visa")}</option>
                    </select>
                    <select id="bk-flt-slot" class="px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-extrabold">
                        <option value="all">${isAr ? "كل المواعيد" : "All Slots"}</option>
                        <option value="morning" ${f.slot === "morning" ? "selected" : ""}>${t("slot_morning")}</option>
                        <option value="evening" ${f.slot === "evening" ? "selected" : ""}>${t("slot_evening")}</option>
                    </select>
                    <select id="bk-flt-src" class="px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-extrabold">
                        <option value="all">${isAr ? "كل المصادر" : "All Sources"}</option>
                        <option value="web" ${f.source === "web" ? "selected" : ""}>${t("src_web")}</option>
                        <option value="manual" ${f.source === "manual" ? "selected" : ""}>${t("src_manual")}</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <button id="bk-export-csv" type="button" class="px-3.5 py-2 rounded-xl bg-sea/15 text-sea hover:bg-sea/25 text-xs font-black transition">${t("export_csv")}</button>
                    <button id="bk-add-manual" type="button" class="px-3.5 py-2 rounded-xl bg-champagne text-carbon-950 hover:bg-champagne-light text-xs font-black transition">+ ${t("add_booking")}</button>
                </div>
            </div>

            ${list.length ? `
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-start">
                    <thead class="bg-[#F6F3EC] dark:bg-carbon-800 font-black">
                        <tr>
                            <th class="p-3 text-start">${isAr ? "المرجع / المصدر" : "Ref / Src"}</th>
                            <th class="p-3 text-start">${isAr ? "العميل" : "Customer"}</th>
                            <th class="p-3 text-start">${isAr ? "البرامج والفندق" : "Tours & Hotel"}</th>
                            <th class="p-3 text-start">${isAr ? "التاريخ والميعاد" : "Date & Slot"}</th>
                            <th class="p-3 text-start">${isAr ? "الدفع والإجمالي" : "Pay & Total"}</th>
                            <th class="p-3 text-start">${isAr ? "الحالة" : "Status"}</th>
                            <th class="p-3 text-end">${isAr ? "تحكم" : "Controls"}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                        ${list.map(b => `
                        <tr class="hover:bg-champagne/5">
                            <td class="p-3">
                                <div class="font-mono font-black text-champagne-dark dark:text-champagne">${esc(b.ref)}</div>
                                <span class="text-[10px] opacity-60 font-bold">${b.source === "manual" ? t("src_manual") : t("src_web")} · ${esc((b.lang || "ar").toUpperCase())}</span>
                            </td>
                            <td class="p-3">
                                <div class="font-black">${esc(b.name)}</div>
                                <div class="text-[11px] opacity-75 font-mono">${esc(b.phone)}</div>
                                <div class="text-[10px] opacity-60 truncate max-w-[170px]">${esc(b.email)}</div>
                            </td>
                            <td class="p-3 max-w-[230px]">
                                <div class="font-bold line-clamp-2">${esc(b.selectedTours)}</div>
                                <div class="text-[11px] opacity-65 mt-0.5">🏨 ${esc(b.pickupHotel)} · 👥 ${b.adults}+${b.children}</div>
                            </td>
                            <td class="p-3 whitespace-nowrap">
                                <div class="font-bold">${esc(b.tripDate)}</div>
                                <div class="text-[11px] opacity-80">${esc(b.pickupPointDisplay || b.tripTimeDisplay || (b.tripTime === "evening" ? "🌙 " + t("slot_evening") : "☀️ " + t("slot_morning")))}</div>
                            </td>
                            <td class="p-3 whitespace-nowrap">
                                <div class="font-black text-sea">$${Number(b.totalUsd || 0).toFixed(2)}</div>
                                <div class="text-[11px] opacity-70">${b.paymentMethod === "visa" ? "💳 " + t("pay_visa") : "💵 " + t("pay_arrival")}</div>
                            </td>
                            <td class="p-3">
                                <select data-quick-status="${esc(b.ref)}" class="px-2 py-1 rounded-lg bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 text-[11px] font-black cursor-pointer">
                                    ${["pending", "confirmed", "completed", "cancelled"].map(st => `<option value="${st}" ${b.status === st ? "selected" : ""}>${t("status_" + st)}</option>`).join("")}
                                </select>
                            </td>
                            <td class="p-3 text-end whitespace-nowrap space-x-1 rtl:space-x-reverse">
                                <button type="button" data-inspect-bk="${esc(b.ref)}" class="px-2.5 py-1.5 rounded-lg bg-champagne/15 text-champagne-dark dark:text-champagne hover:bg-champagne hover:text-carbon-950 font-black transition">${t("view_btn")}</button>
                                <button type="button" data-del-bk="${esc(b.ref)}" class="px-2 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black transition">✕</button>
                            </td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>` : `<div class="py-12 text-center text-xs opacity-60">${t("no_data")}</div>`}
        </div>
    `;

    const bindSel = (id, key) => {
        document.getElementById(id)?.addEventListener("change", e => {
            adminState.bkFilters[key] = e.target.value;
            renderBookingsTab(root);
        });
    };
    bindSel("bk-flt-status", "status");
    bindSel("bk-flt-pay", "payment");
    bindSel("bk-flt-slot", "slot");
    bindSel("bk-flt-src", "source");

    document.getElementById("bk-add-manual")?.addEventListener("click", openManualBookingModal);
    document.getElementById("bk-export-csv")?.addEventListener("click", () => {
        const headers = ["Ref", "CreatedAt", "Status", "Source", "Name", "Phone", "Email", "Nationality", "Tours", "Hotel", "TripDate", "Slot", "Adults", "Children", "Vehicle", "Payment", "Promo", "TotalUSD", "Notes"];
        const rows = [headers, ...list.map(b => [b.ref, b.createdAt, b.status, b.source, b.name, b.phone, b.email, b.nationality, b.selectedTours, b.pickupHotel, b.tripDate, b.tripTime, b.adults, b.children, b.vehicleDisplay, b.paymentMethod, b.promoCode, b.totalUsd, b.adminNotes])];
        downloadCsv(`mosa-safari-bookings-${new Date().toISOString().split("T")[0]}.csv`, rows);
        showAdminToast(isAr ? "تم تصدير ملف الحجوزات" : "CSV exported");
    });

    root.querySelectorAll("[data-quick-status]").forEach(sel => {
        sel.addEventListener("change", async () => {
            const ref = sel.dataset.quickStatus;
            try {
                await apiFetch(`/api/admin/bookings/${encodeURIComponent(ref)}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: sel.value })
                });
                const item = adminState.overview.bookings.find(x => x.ref === ref);
                if (item) item.status = sel.value;
                updateNavBadges();
                showAdminToast(`${ref} -> ${t("status_" + sel.value)}`);
            } catch (err) {
                showAdminToast(err.message, "err");
                renderBookingsTab(root);
            }
        });
    });

    root.querySelectorAll("[data-inspect-bk]").forEach(btn => {
        btn.addEventListener("click", () => openBookingDetailModal(btn.dataset.inspectBk));
    });
    root.querySelectorAll("[data-del-bk]").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!window.confirm(t("confirm_delete_bk"))) return;
            const ref = btn.dataset.delBk;
            try {
                await apiFetch(`/api/admin/bookings/${encodeURIComponent(ref)}`, { method: "DELETE" });
                adminState.overview.bookings = adminState.overview.bookings.filter(x => x.ref !== ref);
                updateNavBadges();
                renderBookingsTab(root);
                showAdminToast(isAr ? "تم حذف الحجز" : "Booking deleted");
            } catch (err) {
                showAdminToast(err.message, "err");
            }
        });
    });
}

function renderToursTab(root) {
    const isAr = adminState.lang === "ar";
    const trips = effectiveTrips();
    const clicks = adminState.overview.analytics?.tourClicks || {};
    const stats = computeStats();

    root.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
                <h2 class="text-sm sm:text-base font-black">${isAr ? "كتالوج برامج السفاري والأسعار الحية" : "Live Safari Catalog & Pricing"}</h2>
                <p class="text-xs opacity-65">${isAr ? "أي تعديل هنا يتزامن فوراً مع الموقع الرئيسي والهاتف" : "Changes sync immediately to live Desktop & Mobile storefronts"}</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button id="tours-reset-btn" type="button" class="px-3.5 py-2 rounded-xl border border-rose-500/35 text-rose-500 hover:bg-rose-500/10 text-xs font-black transition">${t("reset_defaults")}</button>
                <button id="tours-add-btn" type="button" class="px-4 py-2 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black transition">+ ${t("add_tour")}</button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            ${trips.map((trip, idx) => {
                const isActive = trip.active !== false;
                const cCount = clicks[trip.id] || 0;
                const bkCount = stats.tourBookCount[trip.id] || 0;
                const rev = stats.tourRev[trip.id] || 0;
                const det = getTripDetails(trip, adminState.lang);
                const photoCnt = (det.gallery && det.gallery.length) ? det.gallery.length : 1;
                const routesCnt = getTripRoutes(trip).length;
                const storeUrl = (adminState.overview.settings?.storefrontUrl || "https://mosasafari.com") + `/tour.html?id=${encodeURIComponent(trip.id)}`;
                return `
                <article class="rounded-3xl bg-white dark:bg-carbon-900 border ${isActive ? 'border-carbon-900/10 dark:border-white/10' : 'border-rose-500/40 opacity-75'} overflow-hidden flex flex-col">
                    <div class="relative h-44 bg-carbon-950">
                        <img src="${esc(trip.img)}" alt="${esc(trip.titleEn)}" class="w-full h-full object-cover opacity-85">
                        <div class="absolute inset-0 bg-gradient-to-t from-carbon-950 via-transparent to-carbon-950/30"></div>
                        <div class="absolute top-3 start-3 flex items-center gap-1.5">
                            <span class="px-2.5 py-1 rounded-lg text-[10px] font-black ${isActive ? 'bg-sea text-carbon-950' : 'bg-rose-600 text-white'}">${isActive ? (isAr ? 'مفعّل بالموقع' : 'LIVE') : (isAr ? 'مخفي' : 'HIDDEN')}</span>
                            <span class="px-2 py-1 rounded-lg bg-carbon-950/80 text-white text-[10px] font-black">📷 ${photoCnt}</span>
                        </div>
                        <span class="absolute top-3 end-3 px-2.5 py-1 rounded-lg bg-carbon-950/80 text-champagne text-xs font-black">★ ${trip.rating}</span>
                        <div class="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
                            <div>
                                <div class="text-[10px] opacity-75">${esc(trip.vehicle)} · ${routesCnt} ${isAr ? "مسارات" : "routes"}</div>
                                <div class="text-lg font-black text-champagne">$${Number(trip.fromPrice).toFixed(2)} <span class="text-xs text-white/75">/ $${Number(trip.adultPrice).toFixed(2)}</span></div>
                            </div>
                            <span class="px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold">${esc(isAr ? trip.duration : trip.durationEn)}</span>
                        </div>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                            <h3 class="text-sm font-black leading-snug">${esc(isAr ? trip.titleAr : trip.titleEn)}</h3>
                            <p class="text-[11px] opacity-70 mt-1 line-clamp-2">${esc(isAr ? trip.descAr : trip.descEn)}</p>
                        </div>
                        <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 text-center text-[11px]">
                            <div><span class="block opacity-60">${isAr ? "نقرات" : "Clicks"}</span><strong class="font-black">${cCount}</strong></div>
                            <div><span class="block opacity-60">${isAr ? "حجوزات" : "Bookings"}</span><strong class="font-black">${bkCount}</strong></div>
                            <div><span class="block opacity-60">${isAr ? "إيرادات" : "Rev"}</span><strong class="font-black text-sea">$${rev.toFixed(0)}</strong></div>
                        </div>
                        <div class="space-y-2 pt-1">
                            <button type="button" data-edit-tour="${idx}" class="w-full py-2.5 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 font-black text-xs transition">${isAr ? "✨ تخصيص كامل (الصور · الصفحة · اللغات)" : "✨ Full Tour & Page Studio"}</button>
                            <div class="grid grid-cols-4 gap-1.5 text-[11px]">
                                <a href="${esc(storeUrl)}" target="_blank" rel="noopener noreferrer" title="Preview" class="py-1.5 rounded-lg border border-carbon-900/15 dark:border-white/15 font-extrabold text-center hover:border-champagne transition">↗ ${isAr ? "معاينة" : "View"}</a>
                                <button type="button" data-dup-tour="${idx}" title="Duplicate" class="py-1.5 rounded-lg border border-carbon-900/15 dark:border-white/15 font-extrabold hover:border-champagne transition">${isAr ? "نسخ" : "Copy"}</button>
                                <button type="button" data-toggle-tour="${idx}" class="py-1.5 rounded-lg border border-carbon-900/15 dark:border-white/15 font-extrabold hover:border-champagne transition">${isActive ? (isAr ? "إخفاء" : "Hide") : (isAr ? "تفعيل" : "Show")}</button>
                                <button type="button" data-del-tour="${idx}" class="py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black transition">✕</button>
                            </div>
                        </div>
                    </div>
                </article>`;
            }).join("")}
        </div>
    `;

    document.getElementById("tours-add-btn")?.addEventListener("click", () => openTourEditorModal(-1));
    document.getElementById("tours-reset-btn")?.addEventListener("click", async () => {
        if (!window.confirm(t("confirm_reset_tours"))) return;
        try {
            await apiFetch("/api/admin/trips", { method: "PUT", body: JSON.stringify({ trips: null }) });
            await loadOverviewData();
            showAdminToast(isAr ? "تمت استعادة الرحلات الافتراضية" : "Defaults restored");
        } catch (err) { showAdminToast(err.message, "err"); }
    });

    root.querySelectorAll("[data-edit-tour]").forEach(btn => {
        btn.addEventListener("click", () => openTourEditorModal(Number(btn.dataset.editTour)));
    });
    root.querySelectorAll("[data-dup-tour]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const idx = Number(btn.dataset.dupTour);
            const list = effectiveTrips().map(item => structuredClone(item));
            const copy = structuredClone(list[idx]);
            copy.id = `${copy.id || "mosa-tour"}-${Date.now().toString(36).slice(-4)}`;
            copy.titleAr = (copy.titleAr || copy.titleEn) + " (نسخة)";
            copy.titleEn = (copy.titleEn || copy.titleAr) + " (Copy)";
            list.push(copy);
            try {
                const res = await apiFetch("/api/admin/trips", { method: "PUT", body: JSON.stringify({ trips: list }) });
                adminState.overview.trips = res.trips;
                updateNavBadges();
                renderToursTab(root);
                showAdminToast(isAr ? "تم نسخ الرحلة ✓" : "Tour duplicated ✓");
            } catch (err) { showAdminToast(err.message, "err"); }
        });
    });
    root.querySelectorAll("[data-toggle-tour]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const idx = Number(btn.dataset.toggleTour);
            const list = effectiveTrips().map(item => ({ ...item }));
            list[idx].active = list[idx].active === false ? true : false;
            try {
                const res = await apiFetch("/api/admin/trips", { method: "PUT", body: JSON.stringify({ trips: list }) });
                adminState.overview.trips = res.trips;
                updateNavBadges();
                renderToursTab(root);
                showAdminToast(isAr ? "تم تحديث حالة الرحلة" : "Tour visibility updated");
            } catch (err) { showAdminToast(err.message, "err"); }
        });
    });
    root.querySelectorAll("[data-del-tour]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const list = effectiveTrips().map(item => ({ ...item }));
            if (list.length <= 1) {
                showAdminToast(isAr ? "يجب بقاء رحلة واحدة على الأقل" : "Keep at least 1 tour", "err");
                return;
            }
            if (!window.confirm(isAr ? "حذف هذا البرنامج نهائياً؟" : "Delete this tour permanently?")) return;
            const idx = Number(btn.dataset.delTour);
            list.splice(idx, 1);
            try {
                const res = await apiFetch("/api/admin/trips", { method: "PUT", body: JSON.stringify({ trips: list }) });
                adminState.overview.trips = res.trips;
                updateNavBadges();
                renderToursTab(root);
                showAdminToast(isAr ? "تم حذف البرنامج" : "Tour deleted");
            } catch (err) { showAdminToast(err.message, "err"); }
        });
    });
}

function renderPromosTab(root) {
    const isAr = adminState.lang === "ar";
    const promos = adminState.overview.promos || [];

    root.innerHTML = `
        <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 class="text-sm sm:text-base font-black">${isAr ? "أكواد الخصم والحملات الترويجية" : "Promo Codes & Campaigns"}</h2>
                    <p class="text-xs opacity-65">${isAr ? "تحكم فوري في نسب الخصم، تاريخ الانتهاء، وحدود الاستخدام" : "Live discounts synced directly to checkout"}</p>
                </div>
                <button id="promo-add-btn" type="button" class="px-4 py-2 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black transition">+ ${t("add_promo")}</button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-xs text-start">
                    <thead class="bg-[#F6F3EC] dark:bg-carbon-800 font-black">
                        <tr>
                            <th class="p-3 text-start">${isAr ? "الكود" : "Code"}</th>
                            <th class="p-3 text-start">${isAr ? "الخصم %" : "Discount"}</th>
                            <th class="p-3 text-start">${isAr ? "الاستخدام" : "Uses"}</th>
                            <th class="p-3 text-start">${isAr ? "تاريخ الانتهاء" : "Expires"}</th>
                            <th class="p-3 text-start">${isAr ? "الحالة" : "Status"}</th>
                            <th class="p-3 text-end">${isAr ? "تحكم" : "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                        ${promos.map((p, idx) => `
                        <tr>
                            <td class="p-3 font-mono font-black text-champagne-dark dark:text-champagne">${esc(p.code)}</td>
                            <td class="p-3 font-black text-sea">${p.discount}%</td>
                            <td class="p-3 font-bold">${p.uses || 0}${p.maxUses > 0 ? ` / ${p.maxUses}` : " / ∞"}</td>
                            <td class="p-3">${esc(p.expiresAt || "—")}</td>
                            <td class="p-3"><span class="px-2.5 py-0.5 rounded-full text-[11px] font-black ${p.active !== false ? 'bg-sea/15 text-sea' : 'bg-rose-500/15 text-rose-500'}">${p.active !== false ? (isAr ? "مفعّل" : "Active") : (isAr ? "متوقف" : "Paused")}</span></td>
                            <td class="p-3 text-end space-x-1 rtl:space-x-reverse">
                                <button type="button" data-toggle-promo="${idx}" class="px-2.5 py-1 rounded-lg bg-carbon-900/10 dark:bg-white/10 font-black">${p.active !== false ? (isAr ? "إيقاف" : "Pause") : (isAr ? "تفعيل" : "Enable")}</button>
                                <button type="button" data-edit-promo="${idx}" class="px-2.5 py-1 rounded-lg bg-champagne/15 text-champagne-dark dark:text-champagne font-black">${t("edit_btn")}</button>
                                <button type="button" data-del-promo="${idx}" class="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-black">✕</button>
                            </td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("promo-add-btn")?.addEventListener("click", () => openPromoModal(-1));
    root.querySelectorAll("[data-edit-promo]").forEach(btn => btn.addEventListener("click", () => openPromoModal(Number(btn.dataset.editPromo))));
    root.querySelectorAll("[data-toggle-promo]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const idx = Number(btn.dataset.togglePromo);
            const next = promos.map(x => ({ ...x }));
            next[idx].active = next[idx].active === false ? true : false;
            await savePromosList(next);
        });
    });
    root.querySelectorAll("[data-del-promo]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const idx = Number(btn.dataset.delPromo);
            const next = promos.filter((_, i) => i !== idx);
            await savePromosList(next);
        });
    });
}

async function savePromosList(next) {
    try {
        const res = await apiFetch("/api/admin/promos", { method: "PUT", body: JSON.stringify({ promos: next }) });
        adminState.overview.promos = res.promos;
        updateNavBadges();
        renderActiveTab();
        showAdminToast(adminState.lang === "ar" ? "تم حفظ أكواد الخصم" : "Promos updated");
    } catch (err) {
        showAdminToast(err.message, "err");
    }
}

function buildCustomersDirectory() {
    const map = new Map();
    const q = adminState.searchQuery.trim().toLowerCase();
    for (const b of adminState.overview.bookings || []) {
        const key = (b.phone || "").replace(/\D/g, "") || (b.email || "").toLowerCase() || b.name;
        if (!key) continue;
        const cur = map.get(key) || {
            name: b.name,
            phone: b.phone,
            email: b.email,
            nationality: b.nationality,
            lastHotel: b.pickupHotel,
            bookingsCount: 0,
            ltvUsd: 0,
            lastDate: b.tripDate || b.createdAt?.split("T")[0] || ""
        };
        cur.bookingsCount += 1;
        if (b.status !== "cancelled") cur.ltvUsd += Number(b.totalUsd || 0);
        if (!cur.email && b.email) cur.email = b.email;
        if (!cur.lastHotel && b.pickupHotel) cur.lastHotel = b.pickupHotel;
        map.set(key, cur);
    }
    return [...map.values()].filter(c => {
        if (!q) return true;
        return `${c.name} ${c.phone} ${c.email} ${c.nationality} ${c.lastHotel}`.toLowerCase().includes(q);
    });
}

function renderCustomersTab(root) {
    const isAr = adminState.lang === "ar";
    const customers = buildCustomersDirectory();

    root.innerHTML = `
        <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 class="text-sm sm:text-base font-black">${isAr ? "قاعدة بيانات العملاء (CRM)" : "Customers Directory (LTV)"}</h2>
                    <p class="text-xs opacity-65">${customers.length} ${isAr ? "عميل مسجل ومجمّع تلقائياً من الحجوزات" : "unique customers deduplicated from bookings"}</p>
                </div>
                <button id="cust-export-btn" type="button" class="px-3.5 py-2 rounded-xl bg-sea/15 text-sea text-xs font-black">${t("export_csv")}</button>
            </div>
            ${customers.length ? `
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-start">
                    <thead class="bg-[#F6F3EC] dark:bg-carbon-800 font-black">
                        <tr>
                            <th class="p-3 text-start">${isAr ? "العميل" : "Customer"}</th>
                            <th class="p-3 text-start">${isAr ? "التواصل" : "Contact"}</th>
                            <th class="p-3 text-start">${isAr ? "الجنسية والفندق" : "Nat / Hotel"}</th>
                            <th class="p-3 text-start">${isAr ? "الحجوزات" : "Bookings"}</th>
                            <th class="p-3 text-start">${isAr ? "القيمة (LTV)" : "LTV ($USD)"}</th>
                            <th class="p-3 text-end">WhatsApp</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                        ${customers.map(c => {
                            const digits = String(c.phone || "").replace(/\D/g, "");
                            return `
                            <tr>
                                <td class="p-3 font-black">${esc(c.name)}</td>
                                <td class="p-3"><div class="font-mono">${esc(c.phone)}</div><div class="opacity-65 text-[11px]">${esc(c.email)}</div></td>
                                <td class="p-3"><div>${esc(c.nationality || "—")}</div><div class="opacity-65 text-[11px]">🏨 ${esc(c.lastHotel)}</div></td>
                                <td class="p-3 font-black">${c.bookingsCount}</td>
                                <td class="p-3 font-black text-sea">$${c.ltvUsd.toFixed(2)}</td>
                                <td class="p-3 text-end">${digits ? `<a href="https://wa.me/${digits}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-sea/15 text-sea font-black">💬 Chat</a>` : "—"}</td>
                            </tr>`;
                        }).join("")}
                    </tbody>
                </table>
            </div>` : `<div class="py-10 text-center text-xs opacity-60">${t("no_data")}</div>`}
        </div>
    `;

    document.getElementById("cust-export-btn")?.addEventListener("click", () => {
        const rows = [["Name", "Phone", "Email", "Nationality", "Hotel", "Bookings", "LTV_USD", "LastDate"], ...customers.map(c => [c.name, c.phone, c.email, c.nationality, c.lastHotel, c.bookingsCount, c.ltvUsd.toFixed(2), c.lastDate])];
        downloadCsv(`mosa-safari-customers-${new Date().toISOString().split("T")[0]}.csv`, rows);
    });
}

function renderAnalyticsTab(root) {
    const isAr = adminState.lang === "ar";
    const s = computeStats();
    const a = adminState.overview.analytics || {};
    const modalPct = s.totalViews > 0 ? Math.min(100, (s.modalOpens / s.totalViews) * 100) : 0;
    const bookPct = s.totalViews > 0 ? Math.min(100, (s.bookingsDone / s.totalViews) * 100) : 0;
    const trips = effectiveTrips();

    root.innerHTML = `
        <div class="space-y-5">
            <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 class="text-sm sm:text-base font-black">${isAr ? "قمع التحويل الفعلي (Conversion Funnel)" : "Live Storefront Conversion Funnel"}</h2>
                        <p class="text-xs opacity-65">${isAr ? "الزيارات ← فتح نموذج الحجز ← إتمام الحجز" : "Page Views → Booking Modal Opened → Completed Orders"}</p>
                    </div>
                    <button id="analytics-reset-btn" type="button" class="px-3 py-1.5 rounded-xl border border-rose-500/35 text-rose-500 text-xs font-black hover:bg-rose-500/10">${t("reset_defaults")}</button>
                </div>

                <div class="space-y-3">
                    <div>
                        <div class="flex justify-between text-xs font-extrabold mb-1"><span>1. ${isAr ? "زيارات المنصة" : "Total Page Views"} (${a.uniqueSessions || 0} ${isAr ? "جلسة فريدة" : "unique"})</span><span>${s.totalViews} (100%)</span></div>
                        <div class="h-3 rounded-full bg-carbon-900/10 dark:bg-white/10 overflow-hidden"><div class="h-full bg-champagne rounded-full" style="width:100%"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between text-xs font-extrabold mb-1"><span>2. ${isAr ? "فتح نافذة الحجز" : "Opened Booking Modal"}</span><span>${s.modalOpens} (${modalPct.toFixed(1)}%)</span></div>
                        <div class="h-3 rounded-full bg-carbon-900/10 dark:bg-white/10 overflow-hidden"><div class="h-full bg-copper rounded-full" style="width:${modalPct}%"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between text-xs font-extrabold mb-1"><span>3. ${isAr ? "حجوزات مكتملة" : "Completed Bookings"}</span><span>${s.bookingsDone} (${bookPct.toFixed(2)}%)</span></div>
                        <div class="h-3 rounded-full bg-carbon-900/10 dark:bg-white/10 overflow-hidden"><div class="h-full bg-sea rounded-full" style="width:${bookPct}%"></div></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                    <h3 class="text-sm font-black mb-3">${isAr ? "توزيع الزوار حسب اللغة" : "Visitors by Language"}</h3>
                    <div class="chart-box"><canvas id="chart-lang-bar"></canvas></div>
                </div>
                <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                    <h3 class="text-sm font-black mb-3">${isAr ? "الأجهزة والعملات المفضلة" : "Devices & Currencies"}</h3>
                    <div class="chart-box"><canvas id="chart-device-curr"></canvas></div>
                </div>
            </div>

            <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <h3 class="text-sm font-black mb-3">${isAr ? "مؤشرات الأداء لكل رحلة" : "Per-Tour Engagement & Revenue Matrix"}</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-start">
                        <thead class="bg-[#F6F3EC] dark:bg-carbon-800 font-black">
                            <tr>
                                <th class="p-3 text-start">${isAr ? "البرنامج" : "Program"}</th>
                                <th class="p-3 text-start">${isAr ? "نقرات الحجز" : "Clicks"}</th>
                                <th class="p-3 text-start">${isAr ? "الحجوزات" : "Bookings"}</th>
                                <th class="p-3 text-start">${isAr ? "معدل الإتمام" : "Click-to-Book"}</th>
                                <th class="p-3 text-start">${isAr ? "الإيرادات" : "Revenue"}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                            ${trips.map(tr => {
                                const cl = a.tourClicks?.[tr.id] || 0;
                                const bk = s.tourBookCount[tr.id] || 0;
                                const rv = s.tourRev[tr.id] || 0;
                                const rate = cl > 0 ? ((bk / cl) * 100).toFixed(1) + "%" : "—";
                                return `<tr>
                                    <td class="p-3 font-bold">${esc(isAr ? tr.titleAr : tr.titleEn)}</td>
                                    <td class="p-3 font-black">${cl}</td>
                                    <td class="p-3 font-black text-champagne-dark dark:text-champagne">${bk}</td>
                                    <td class="p-3 font-bold">${rate}</td>
                                    <td class="p-3 font-black text-sea">$${rv.toFixed(2)}</td>
                                </tr>`;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById("analytics-reset-btn")?.addEventListener("click", async () => {
        if (!window.confirm(t("confirm_reset_analytics"))) return;
        try {
            const res = await apiFetch("/api/admin/analytics/reset", { method: "POST" });
            adminState.overview.analytics = res.analytics;
            renderAnalyticsTab(root);
            showAdminToast(isAr ? "تم تصفير الإحصائيات" : "Analytics reset");
        } catch (err) { showAdminToast(err.message, "err"); }
    });

    if (typeof window.Chart === "function") {
        const isDark = document.documentElement.classList.contains("dark");
        const textCol = isDark ? "#B5B0A8" : "#4A4E58";
        const lc = document.getElementById("chart-lang-bar");
        if (lc) {
            adminState.charts.lang = new window.Chart(lc, {
                type: "bar",
                data: {
                    labels: ["العربية (AR)", "English (EN)", "Italiano (IT)", "Русский (RU)"],
                    datasets: [{ label: isAr ? "الزيارات" : "Views", data: [a.byLang?.ar || 0, a.byLang?.en || 0, a.byLang?.it || 0, a.byLang?.ru || 0], backgroundColor: ["#D9B36C", "#2CB5A0", "#D96B38", "#3B82F6"], borderRadius: 8 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: textCol } }, y: { ticks: { color: textCol, precision: 0 } } } }
            });
        }
        const dc = document.getElementById("chart-device-curr");
        if (dc) {
            adminState.charts.dc = new window.Chart(dc, {
                type: "bar",
                data: {
                    labels: ["Mobile", "Desktop", "USD", "EGP", "EUR"],
                    datasets: [{ label: isAr ? "العدد" : "Count", data: [a.byDevice?.mobile || 0, a.byDevice?.desktop || 0, a.byCurrency?.USD || 0, a.byCurrency?.EGP || 0, a.byCurrency?.EUR || 0], backgroundColor: ["#2CB5A0", "#D9B36C", "#EDD29B", "#D96B38", "#1D8A79"], borderRadius: 8 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: textCol } }, y: { ticks: { color: textCol, precision: 0 } } } }
            });
        }
    }
}

function buildAppsScriptSnippet() {
    return `function doPost(e) {
  var d = JSON.parse(e.postData.contents || "{}");
  var SECRET = ""; // ضع نفس الرمز السري هنا إذا أردت حماية إضافية
  if (SECRET && d.secret !== SECRET) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Forbidden" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  MailApp.sendEmail({
    to: d.to,
    subject: d.subject || "Mosa Safari",
    body: d.text || "",
    htmlBody: d.html || d.text || "",
    name: d.senderName || "Mosa Safari",
    replyTo: d.replyTo || Session.getEffectiveUser().getEmail()
  });
  return ContentService.createTextOutput(JSON.stringify({ ok: true, id: "gas-" + Date.now() }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
}

function renderEmailTab(root) {
    const isAr = adminState.lang === "ar";
    const mc = adminState.overview.mailConfig || {};
    const provider = mc.provider === "google_script" ? "google_script" : "gmail_smtp";
    const connected = Boolean(mc.connected);
    const previewAddr = mc.gmailAddress || "yourname@gmail.com";
    const previewSender = mc.senderName || "Mosa Safari · موسى سفاري";

    root.innerHTML = `
        <div class="space-y-5">
            <!-- Hero Connection Status Card -->
            <div class="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-carbon-950 via-carbon-900 to-carbon-950 text-white border ${connected ? "border-sea/40" : "border-champagne/30"} shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-start gap-3.5 min-w-0">
                    <div class="w-12 h-12 rounded-2xl ${connected ? "bg-sea/20 border-sea/40 text-sea" : "bg-champagne/15 border-champagne/35 text-champagne"} border flex items-center justify-center text-2xl shrink-0">
                        ${connected ? "✅" : "📧"}
                    </div>
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <h2 class="text-base sm:text-lg font-black">${isAr ? "إشعارات العملاء عبر حساب جوجل الشخصي (Gmail)" : "Customer Emails via Personal Google Account (Gmail)"}</h2>
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black ${connected ? "bg-sea text-carbon-950" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"}">
                                ${connected ? (isAr ? "متصل ويعمل الآن ✓" : "Connected & Live ✓") : (isAr ? "في انتظار الربط" : "Setup Required")}
                            </span>
                        </div>
                        <p class="text-xs text-[#B5B0A8] mt-1 leading-relaxed">
                            ${connected
                                ? (isAr
                                    ? `تصدر تأكيدات حجز العملاء تلقائياً من بريدك: <strong class="text-champagne">${esc(previewSender)} &lt;${esc(mc.gmailAddress)}&gt;</strong>`
                                    : `Booking confirmations are sent from: <strong class="text-champagne">${esc(previewSender)} &lt;${esc(mc.gmailAddress)}&gt;</strong>`)
                                : (isAr
                                    ? "اربط بريدك الشخصي على Gmail لتخرج جميع تذاكر تأكيد الحجز مباشرة باسمك وإيميلك بدون اشتراكات خارجية."
                                    : "Connect your personal Gmail account so booking tickets are dispatched directly from your Google inbox.")}
                        </p>
                        ${mc.hasAppPassword ? `<div class="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-champagne">🔐 App Password: ${esc(mc.appPasswordMask)}</div>` : ""}
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2 shrink-0">
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer"
                        class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-black transition">🔑 ${isAr ? "إنشاء App Password من جوجل ↗" : "Google App Passwords ↗"}</a>
                    ${(mc.gmailAddress || mc.hasAppPassword || mc.appsScriptUrl)
                        ? `<button id="gmail-disconnect-btn" type="button" class="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-black transition">${isAr ? "إلغاء الربط" : "Disconnect"}</button>`
                        : ""}
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <!-- Left 7 cols: Google Email Connection Form -->
                <form id="admin-gmail-form" class="xl:col-span-7 rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-4">
                    <div class="flex items-center justify-between gap-2 border-b border-carbon-900/10 dark:border-white/10 pb-3">
                        <div>
                            <h3 class="text-sm sm:text-base font-black">${isAr ? "بيانات الربط وإعدادات المرسل" : "Google Connection & Sender Profile"}</h3>
                            <p class="text-[11px] opacity-65">${isAr ? "يُحفظ المفتاح مشفراً داخل خزنة الخادم المعزولة ولا يظهر في الموقع العام إطلاقاً" : "Stored server-side inside isolated Vault/KV and never exposed publicly"}</p>
                        </div>
                    </div>

                    <!-- Provider Mode Switcher -->
                    <div>
                        <label class="block text-xs font-extrabold mb-2">${isAr ? "طريقة الربط مع جوجل" : "Google Connection Method"}</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button type="button" data-gmail-mode="gmail_smtp"
                                class="p-3 rounded-2xl border-2 text-start transition ${provider === "gmail_smtp" ? "border-champagne bg-champagne/10 shadow-sm" : "border-carbon-900/10 dark:border-white/10 hover:border-champagne/40"}">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="text-xs font-black text-champagne-dark dark:text-champagne">${isAr ? "Gmail SMTP المباشر" : "Direct Gmail SMTP"}</span>
                                    <span class="px-2 py-0.5 rounded bg-sea/20 text-sea text-[10px] font-black">${isAr ? "موصى به" : "Recommended"}</span>
                                </div>
                                <div class="text-[11px] opacity-70 mt-1">${isAr ? "اتصال مشفر عبر smtp.gmail.com باستخدام كلمة مرور التطبيقات (16 حرفاً)" : "Encrypted TLS on smtp.gmail.com using 16-char Google App Password"}</div>
                            </button>
                            <button type="button" data-gmail-mode="google_script"
                                class="p-3 rounded-2xl border-2 text-start transition ${provider === "google_script" ? "border-champagne bg-champagne/10 shadow-sm" : "border-carbon-900/10 dark:border-white/10 hover:border-champagne/40"}">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="text-xs font-black">${isAr ? "Google Apps Script" : "Google Apps Script"}</span>
                                    <span class="px-2 py-0.5 rounded bg-carbon-900/10 dark:bg-white/10 text-[10px] font-black">HTTPS</span>
                                </div>
                                <div class="text-[11px] opacity-70 mt-1">${isAr ? "بديل سحابي عبر Google Web App إذا كان السيرفر يحظر منافذ SMTP" : "Cloud HTTPS webhook option when SMTP ports are restricted"}</div>
                            </button>
                        </div>
                        <input id="gm-provider" type="hidden" value="${esc(provider)}">
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div>
                            <label class="block font-extrabold mb-1">${isAr ? "إيميل جوجل الخاص بك *" : "Your Google Email *"}</label>
                            <input id="gm-address" type="email" dir="ltr" required value="${esc(mc.gmailAddress || "")}" placeholder="yourname@gmail.com"
                                class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-mono font-bold focus:border-champagne focus:outline-none">
                        </div>
                        <div>
                            <label class="block font-extrabold mb-1">${isAr ? "اسم المرسل الظاهر للعميل" : "Display Sender Name"}</label>
                            <input id="gm-sender" type="text" value="${esc(previewSender)}" placeholder="Mosa Safari · موسى سفاري"
                                class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-bold focus:border-champagne focus:outline-none">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block font-extrabold mb-1">${isAr ? "بريد استلام ردود العملاء (Reply-To — اختياري)" : "Reply-To Address (Optional)"}</label>
                            <input id="gm-reply" type="email" dir="ltr" value="${esc(mc.replyTo || "")}" placeholder="${isAr ? "اتركه فارغاً لاستخدام نفس إيميل جوجل" : "Leave empty to use same Gmail address"}"
                                class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-mono font-bold focus:border-champagne focus:outline-none">
                        </div>
                    </div>

                    <!-- Mode A: Gmail App Password -->
                    <div id="gm-smtp-fields" class="${provider === "google_script" ? "hidden" : ""} p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-800 border border-champagne/25 space-y-2.5">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <label class="text-xs font-black text-champagne-dark dark:text-champagne">${isAr ? "كلمة مرور التطبيقات من جوجل (Google App Password) *" : "Google App Password (16 chars) *"}</label>
                            ${mc.hasAppPassword ? `<span class="text-[11px] font-black text-sea">✓ ${isAr ? "محفوظة بالخزنة" : "Stored in Vault"} (${esc(mc.appPasswordMask)})</span>` : ""}
                        </div>
                        <div class="relative">
                            <input id="gm-app-pass" type="password" dir="ltr" autocomplete="new-password"
                                placeholder="${mc.hasAppPassword ? (isAr ? "اتركه فارغاً للإبقاء على كلمة المرور الحالية، أو اكتب الجديدة" : "Leave blank to keep existing password") : "xxxx xxxx xxxx xxxx"}"
                                class="w-full px-3.5 py-2.5 pe-16 rounded-xl bg-white dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-mono text-xs font-bold focus:border-champagne focus:outline-none">
                            <button id="gm-toggle-pass" type="button" class="absolute inset-y-0 end-2 px-2 text-[11px] font-black opacity-70 hover:opacity-100">${isAr ? "عرض" : "Show"}</button>
                        </div>
                        <p class="text-[11px] opacity-70 leading-relaxed">${isAr ? "لا تستخدم كلمة سر جيميل العادية — أنشئ كلمة مرور تطبيقات (16 حرفاً) من إعدادات أمان جوجل وسيقوم النظام بإزالة المسافات تلقائياً." : "Do not use your normal Gmail login password. Generate a 16-character App Password in Google Account Security."}</p>
                    </div>

                    <!-- Mode B: Google Apps Script Relay -->
                    <div id="gm-script-fields" class="${provider === "google_script" ? "" : "hidden"} p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-800 border border-champagne/25 space-y-3">
                        <div>
                            <label class="block text-xs font-extrabold mb-1">${isAr ? "رابط نشر Google Apps Script Web App *" : "Google Apps Script Web App URL *"}</label>
                            <input id="gm-script-url" type="url" dir="ltr" value="${esc(mc.appsScriptUrl || "")}" placeholder="https://script.google.com/macros/s/.../exec"
                                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-mono text-xs font-bold">
                        </div>
                        <div>
                            <label class="block text-xs font-extrabold mb-1">${isAr ? "رمز أمان Webhook (اختياري)" : "Optional Webhook Secret"}</label>
                            <input id="gm-script-secret" type="password" dir="ltr" placeholder="${mc.hasScriptSecret ? (isAr ? "محفوظ — اتركه فارغاً للإبقاء عليه" : "Stored — leave blank to keep") : "Optional shared secret"}"
                                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-mono text-xs font-bold">
                        </div>
                        <div class="p-3 rounded-xl bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-2">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-[11px] font-black">${isAr ? "كود Apps Script الجاهز (انسخه في script.google.com):" : "Ready-to-paste Apps Script code:"}</span>
                                <button id="gm-copy-script" type="button" class="px-2.5 py-1 rounded-lg bg-champagne/20 text-champagne-dark dark:text-champagne text-[11px] font-black">📋 ${isAr ? "نسخ الكود" : "Copy Code"}</button>
                            </div>
                            <pre class="text-[10px] font-mono overflow-x-auto opacity-80 leading-relaxed" dir="ltr">${esc(buildAppsScriptSnippet())}</pre>
                        </div>
                    </div>

                    <!-- Delivery Switches -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-extrabold">
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="gm-enabled" type="checkbox" ${mc.enabled ? "checked" : ""} class="accent-sea"> ${isAr ? "تفعيل الإرسال من جوجل" : "Enable Google Mail"}</label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="gm-bcc" type="checkbox" ${mc.bccOwner !== false ? "checked" : ""} class="accent-champagne"> ${isAr ? "نسخة لبريدي الشخصي" : "Copy Owner (BCC)"}</label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="gm-fallback" type="checkbox" ${mc.fallbackResend !== false ? "checked" : ""} class="accent-champagne"> ${isAr ? "تفعيل الاحتياطي عند التعذر" : "Resend Fallback"}</label>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-carbon-900/10 dark:border-white/10">
                        <div class="text-[11px] opacity-70">
                            ${mc.updatedAt ? `${isAr ? "آخر تحديث:" : "Updated:"} ${new Date(mc.updatedAt).toLocaleString()}` : ""}
                        </div>
                        <button type="submit" class="px-5 py-2.5 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black shadow-lg shadow-champagne/25 transition">
                            ${isAr ? "حفظ وربط حساب جوجل ✓" : "Save & Connect Google Account ✓"}
                        </button>
                    </div>
                </form>

                <!-- Right 5 cols: Guide + Live Inbox Preview + Instant Test -->
                <div class="xl:col-span-5 space-y-5">
                    <!-- Instant Test Card -->
                    <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-3.5">
                        <h3 class="text-sm font-black">${isAr ? "اختبار الإرسال الفوري لبريدك" : "Send Live Test Confirmation"}</h3>
                        <p class="text-[11px] opacity-70 leading-relaxed">${isAr ? "بعد حفظ إعداداتك، أرسل رسالة اختبارية لأي بريد للتأكد من وصول إشعارات الحجز مباشرة من حساب جوجل." : "After saving, dispatch a live test email to verify delivery straight from your Google account."}</p>
                        <div class="flex flex-wrap gap-2">
                            <input id="gm-test-to" type="email" dir="ltr" value="${esc(mc.gmailAddress || "")}" placeholder="customer-test@gmail.com"
                                class="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-mono text-xs font-bold">
                            <button id="gm-test-btn" type="button" class="px-4 py-2 rounded-xl bg-sea hover:bg-sea-dark text-carbon-950 text-xs font-black transition">📧 ${isAr ? "إرسال تجربة الآن" : "Send Test"}</button>
                        </div>
                        <div id="gm-test-result" class="hidden p-3 rounded-xl text-xs font-bold leading-relaxed"></div>
                    </div>

                    <!-- Live Client Inbox Preview -->
                    <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-3">
                        <div class="text-xs font-black">${isAr ? "معاينة شكل الرسالة في بريد العميل (Gmail)" : "Customer Inbox Appearance Preview"}</div>
                        <div class="p-3.5 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-1.5 text-xs">
                            <div class="flex items-center justify-between gap-2">
                                <span id="gm-prev-sender" class="font-black text-champagne-dark dark:text-champagne truncate">${esc(previewSender)}</span>
                                <span class="text-[10px] opacity-60">10:30 AM</span>
                            </div>
                            <div id="gm-prev-email" class="text-[11px] font-mono opacity-75 truncate" dir="ltr">&lt;${esc(previewAddr)}&gt;</div>
                            <div class="font-bold text-[11.5px] pt-1">${isAr ? "تأكيد حجزك في موسى سفاري شرم الشيخ — رقم MOSA-849210" : "Your Mosa Safari Booking Confirmation — Ref MOSA-849210"}</div>
                        </div>
                    </div>

                    <!-- Quick 3-Step Guide -->
                    <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-3">
                        <h3 class="text-sm font-black">${isAr ? "خطوات الحصول على Google App Password في 30 ثانية" : "How to Get a Google App Password in 30s"}</h3>
                        <ol class="space-y-2 text-xs leading-relaxed list-decimal list-inside opacity-85">
                            <li>${isAr ? 'تأكد من تفعيل <strong>التحقق بخطوتين (2-Step Verification)</strong> في حساب جوجل الخاص بك.' : 'Ensure <strong>2-Step Verification</strong> is enabled in your Google Account.'}</li>
                            <li>${isAr ? 'افتح صفحة <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" class="text-champagne underline font-black">كلمات مرور التطبيقات (App Passwords)</a> واختر اسماً مثل <strong>Mosa Safari</strong>.' : 'Open <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" class="text-champagne underline font-black">Google App Passwords</a> and create a password named <strong>Mosa Safari</strong>.'}</li>
                            <li>${isAr ? 'انسخ الكود المكوّن من 16 حرفاً والصقه في الحقل واضغط <strong>حفظ وربط حساب جوجل</strong> ثم <strong>إرسال تجربة</strong>.' : 'Copy the generated 16-character code, paste it here, click <strong>Save & Connect</strong>, and send a test email.'}</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Live inbox preview update
    const addrIn = document.getElementById("gm-address");
    const sndIn = document.getElementById("gm-sender");
    addrIn?.addEventListener("input", () => {
        const el = document.getElementById("gm-prev-email");
        if (el) el.textContent = `<${addrIn.value.trim() || "yourname@gmail.com"}>`;
    });
    sndIn?.addEventListener("input", () => {
        const el = document.getElementById("gm-prev-sender");
        if (el) el.textContent = sndIn.value.trim() || "Mosa Safari · موسى سفاري";
    });

    // Mode toggle inside form
    root.querySelectorAll("[data-gmail-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
            const nextMode = btn.dataset.gmailMode;
            const hid = document.getElementById("gm-provider");
            if (hid) hid.value = nextMode;
            root.querySelectorAll("[data-gmail-mode]").forEach(b => {
                const active = b.dataset.gmailMode === nextMode;
                b.className = `p-3 rounded-2xl border-2 text-start transition ${active ? "border-champagne bg-champagne/10 shadow-sm" : "border-carbon-900/10 dark:border-white/10 hover:border-champagne/40"}`;
            });
            document.getElementById("gm-smtp-fields")?.classList.toggle("hidden", nextMode === "google_script");
            document.getElementById("gm-script-fields")?.classList.toggle("hidden", nextMode !== "google_script");
        });
    });

    document.getElementById("gm-toggle-pass")?.addEventListener("click", () => {
        const p = document.getElementById("gm-app-pass");
        if (p) p.type = p.type === "password" ? "text" : "password";
    });

    document.getElementById("gm-copy-script")?.addEventListener("click", () => {
        const code = buildAppsScriptSnippet();
        navigator.clipboard?.writeText(code).catch(() => {});
        showAdminToast(isAr ? "تم نسخ كود Google Apps Script ✓" : "Apps Script copied ✓");
    });

    document.getElementById("gmail-disconnect-btn")?.addEventListener("click", async () => {
        try {
            const res = await apiFetch("/api/admin/mail-config", { method: "DELETE" });
            adminState.overview.mailConfig = res.mailConfig;
            if (adminState.overview.health) adminState.overview.health.gmailConfigured = false;
            updateNavBadges();
            renderEmailTab(root);
            showAdminToast(isAr ? "تم فصل بريد جوجل وحذف بيانات الدخول من الخزنة" : "Google account disconnected");
        } catch (err) {
            showAdminToast(err.message, "err");
        }
    });

    document.getElementById("admin-gmail-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const payload = {
            provider: document.getElementById("gm-provider").value,
            enabled: document.getElementById("gm-enabled").checked,
            gmailAddress: document.getElementById("gm-address").value.trim(),
            senderName: document.getElementById("gm-sender").value.trim() || "Mosa Safari · موسى سفاري",
            replyTo: document.getElementById("gm-reply").value.trim(),
            appPassword: document.getElementById("gm-app-pass")?.value || "",
            appsScriptUrl: document.getElementById("gm-script-url")?.value.trim() || "",
            scriptSecret: document.getElementById("gm-script-secret")?.value.trim() || "",
            bccOwner: document.getElementById("gm-bcc").checked,
            fallbackResend: document.getElementById("gm-fallback").checked
        };
        try {
            const res = await apiFetch("/api/admin/mail-config", {
                method: "PUT",
                body: JSON.stringify({ mailConfig: payload })
            });
            adminState.overview.mailConfig = res.mailConfig;
            if (adminState.overview.health) adminState.overview.health.gmailConfigured = Boolean(res.mailConfig?.connected);
            updateNavBadges();
            renderEmailTab(root);
            showAdminToast(isAr ? "تم حفظ وربط حساب جوجل بنجاح ✓" : "Google account saved & connected ✓");
        } catch (err) {
            showAdminToast(err.message, "err");
        }
    });

    document.getElementById("gm-test-btn")?.addEventListener("click", async () => {
        const to = document.getElementById("gm-test-to").value.trim() || document.getElementById("gm-address").value.trim() || "info@mosasafari.com";
        const box = document.getElementById("gm-test-result");
        const btn = document.getElementById("gm-test-btn");
        if (btn) btn.disabled = true;
        if (box) {
            box.className = "p-3 rounded-xl bg-champagne/10 border border-champagne/30 text-xs font-bold";
            box.textContent = isAr ? "جاري الاتصال بخادم جوجل وإرسال رسالة الاختبار..." : "Connecting & dispatching test email...";
        }
        try {
            const res = await apiFetch("/api/admin/test-notification", {
                method: "POST",
                body: JSON.stringify({ target: "email", to })
            });
            if (box) {
                box.className = res.ok
                    ? "p-3 rounded-xl bg-sea/15 border border-sea/35 text-sea text-xs font-bold"
                    : "p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-500 text-xs font-bold";
                box.textContent = res.ok
                    ? (isAr ? `✓ تم الإرسال بنجاح إلى ${to} عبر (${res.provider || "email"}) من ${res.from || ""}` : `✓ Sent to ${to} via ${res.provider || "email"}`)
                    : (res.error || "Email dispatch failed");
            }
            showAdminToast(res.ok ? (isAr ? `تم إرسال إيميل تجريبي إلى ${to} ✓` : `Sent to ${to} ✓`) : (res.error || "Failed"), res.ok ? "ok" : "err");
        } catch (err) {
            if (box) {
                box.className = "p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-500 text-xs font-bold";
                box.textContent = err.message;
            }
            showAdminToast(err.message, "err");
        } finally {
            if (btn) btn.disabled = false;
        }
    });
}

function renderSettingsTab(root) {
    const isAr = adminState.lang === "ar";
    const st = adminState.overview.settings || {};
    const mc = adminState.overview.mailConfig || {};

    root.innerHTML = `
        <div class="mb-5 rounded-3xl p-4 bg-white dark:bg-carbon-900 border ${mc.connected ? "border-sea/35" : "border-champagne/35"} flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
                <span class="text-xl">📧</span>
                <div class="text-xs min-w-0">
                    <div class="font-black">${isAr ? "إشعارات العملاء ببريدك الشخصي من جوجل (Gmail)" : "Customer Emails via Personal Google Account"}</div>
                    <div class="opacity-75 truncate">${mc.connected ? `${isAr ? "متصل الآن:" : "Connected:"} ${esc(mc.gmailAddress)}` : (isAr ? "اربط إيميلك على جوجل لإرسال التذاكر مباشرة باسمك" : "Connect your personal Gmail account in the dedicated tab")}</div>
                </div>
            </div>
            <button id="go-email-tab-btn" type="button" class="px-4 py-2 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black transition">${isAr ? "فتح إعدادات ربط جوجل ←" : "Configure Google Email →"}</button>
        </div>
        <form id="admin-settings-form" class="space-y-5">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-4">
                    <h2 class="text-sm sm:text-base font-black">${isAr ? "إعدادات المتجر والحجز" : "Storefront & Checkout Controls"}</h2>
                    <div>
                        <label class="block text-xs font-extrabold mb-1">${isAr ? "نص شارة البانر العلوي (اختياري)" : "Hero Announcement Override (optional)"}</label>
                        <input id="set-announce" type="text" value="${esc(st.siteAnnouncement || "")}" placeholder="مثال: عرض الصيف خصم 20% كود MOSA20" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-bold">
                    </div>
                    <div>
                        <label class="block text-xs font-extrabold mb-1">${isAr ? "شريط تنبيه عام أعلى الموقع (اختياري)" : "Top Site Notice Banner (optional)"}</label>
                        <input id="set-maint" type="text" value="${esc(st.maintenanceNotice || "")}" placeholder="${isAr ? 'اتركه فارغاً لإخفائه' : 'Leave empty to hide'}" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-extrabold mb-1">${isAr ? "حد خصم المجموعات (أفراد)" : "Group Discount Min Guests"}</label>
                            <input id="set-grp-min" type="number" min="2" value="${Number(st.groupDiscountMin) || 5}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-black">
                        </div>
                        <div>
                            <label class="block text-xs font-extrabold mb-1">${isAr ? "نسبة خصم المجموعات %" : "Group Discount %"}</label>
                            <input id="set-grp-pct" type="number" min="0" max="50" value="${Number(st.groupDiscountPct) ?? 10}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-black">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2.5 text-xs font-extrabold pt-2">
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="set-slot-am" type="checkbox" ${st.enableMorningSlot !== false ? "checked" : ""} class="accent-champagne"> ☀️ ${t("slot_morning")}</label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="set-slot-pm" type="checkbox" ${st.enableEveningSlot !== false ? "checked" : ""} class="accent-champagne"> 🌙 ${t("slot_evening")}</label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="set-pay-arr" type="checkbox" ${st.enablePayArrival !== false ? "checked" : ""} class="accent-champagne"> 💵 ${t("pay_arrival")}</label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="set-pay-visa" type="checkbox" ${st.enablePayVisa !== false ? "checked" : ""} class="accent-champagne"> 💳 ${t("pay_visa")}</label>
                    </div>
                </div>

                <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-4">
                    <h2 class="text-sm sm:text-base font-black">${isAr ? "العملات وتنبيهات الواتساب والإيميل" : "Exchange Rates & Notifications"}</h2>
                    <div>
                        <label class="block text-xs font-extrabold mb-1">${isAr ? "أرقام واتساب المالك (Green API — مفصولة بفاصلة)" : "Owner WhatsApp Phones (comma-separated)"}</label>
                        <input id="set-phones" type="text" value="${esc(st.ownerPhones || "201023355550")}" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-mono font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-2.5 text-xs font-extrabold">
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="set-wa-on" type="checkbox" ${st.whatsappEnabled !== false ? "checked" : ""} class="accent-sea"> ${isAr ? "تنبيهات واتساب المالك" : "Owner WhatsApp Alerts"}</label>
                        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 cursor-pointer"><input id="set-em-on" type="checkbox" ${st.emailEnabled !== false ? "checked" : ""} class="accent-sea"> ${isAr ? "تأكيد إيميل العميل" : "Customer Email Confirm"}</label>
                    </div>
                    <div>
                        <label class="block text-xs font-extrabold mb-1">${isAr ? "وضع سعر الصرف" : "Exchange Rate Mode"}</label>
                        <select id="set-ex-mode" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-extrabold">
                            <option value="auto" ${st.exchangeMode !== "manual" ? "selected" : ""}>${isAr ? "تلقائي لحظي من API" : "Auto Live Currency API"}</option>
                            <option value="manual" ${st.exchangeMode === "manual" ? "selected" : ""}>${isAr ? "تثبيت يدوي من الإدارة" : "Manual Fixed Rate"}</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-extrabold mb-1">1 USD → EGP</label>
                            <input id="set-egp-rate" type="number" step="0.01" value="${Number(st.manualEgpRate) || 50.5}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-mono font-black">
                        </div>
                        <div>
                            <label class="block text-xs font-extrabold mb-1">1 USD → EUR</label>
                            <input id="set-eur-rate" type="number" step="0.001" value="${Number(st.manualEurRate) || 0.92}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-mono font-black">
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <div class="flex flex-wrap items-center gap-2">
                    <input id="test-em-addr" type="email" placeholder="test@example.com" class="px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-bold">
                    <button id="test-wa-btn" type="button" class="px-3 py-2 rounded-xl bg-sea/15 text-sea hover:bg-sea/25 text-xs font-black">💬 ${isAr ? "اختبار واتساب المالك" : "Test WhatsApp"}</button>
                    <button id="test-em-btn" type="button" class="px-3 py-2 rounded-xl bg-champagne/15 text-champagne-dark dark:text-champagne hover:bg-champagne/25 text-xs font-black">📧 ${isAr ? "اختبار Resend الإيميل" : "Test Email"}</button>
                </div>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black shadow-lg shadow-champagne/25">${t("save")}</button>
            </div>
        </form>

        <form id="admin-password-form" class="mt-5 rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-rose-500/25 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 class="text-sm sm:text-base font-black">${isAr ? "تغيير كلمة مرور الإدارة وتدوير مفاتيح الأمان" : "Rotate Admin Password & Session Signing Key"}</h2>
                    <p class="text-[11px] opacity-65">${isAr ? "يقوم بتشفير كلمة المرور الجديدة بـ Bcrypt وتجديد مفتاح التوقيع فوراً داخل الخزنة المعزولة" : "Re-hashes password with Bcrypt (cost=12) and rotates HMAC signing key in vault"}</p>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div><label class="block font-extrabold mb-1">${isAr ? "كلمة المرور الحالية" : "Current Password"}</label><input id="pw-current" type="password" required class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 font-bold"></div>
                <div><label class="block font-extrabold mb-1">${isAr ? "كلمة المرور الجديدة (8+ أحرف)" : "New Password (8+ chars)"}</label><input id="pw-new" type="password" minlength="8" required class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 font-bold"></div>
                <div><label class="block font-extrabold mb-1">${isAr ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</label><input id="pw-confirm" type="password" minlength="8" required class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 font-bold"></div>
            </div>
            <div class="flex justify-end">
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/20">${isAr ? "تحديث كلمة المرور وتدوير المفاتيح" : "Update Password & Rotate Keys"}</button>
            </div>
        </form>
    `;

    document.getElementById("go-email-tab-btn")?.addEventListener("click", () => switchTab("email"));

    document.getElementById("admin-password-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const currentPassword = document.getElementById("pw-current").value;
        const newPassword = document.getElementById("pw-new").value;
        const confirmPassword = document.getElementById("pw-confirm").value;
        if (newPassword.length < 8) {
            showAdminToast(isAr ? "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" : "New password must be 8+ chars", "err");
            return;
        }
        if (newPassword !== confirmPassword) {
            showAdminToast(isAr ? "تأكيد كلمة المرور غير متطابق" : "Passwords do not match", "err");
            return;
        }
        try {
            const res = await apiFetch("/api/admin/password", {
                method: "POST",
                body: JSON.stringify({ currentPassword, newPassword })
            });
            if (res.csrfToken) adminState.csrfToken = res.csrfToken;
            document.getElementById("admin-password-form").reset();
            showAdminToast(isAr ? "تم تحديث كلمة المرور وتدوير مفاتيح الجلسة بنجاح ✓" : "Password & keys rotated successfully ✓");
        } catch (err) {
            showAdminToast(err.message, "err");
        }
    });

    document.getElementById("admin-settings-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const next = {
            siteAnnouncement: document.getElementById("set-announce").value.trim(),
            maintenanceNotice: document.getElementById("set-maint").value.trim(),
            groupDiscountMin: Number(document.getElementById("set-grp-min").value) || 5,
            groupDiscountPct: Number(document.getElementById("set-grp-pct").value) || 10,
            enableMorningSlot: document.getElementById("set-slot-am").checked,
            enableEveningSlot: document.getElementById("set-slot-pm").checked,
            enablePayArrival: document.getElementById("set-pay-arr").checked,
            enablePayVisa: document.getElementById("set-pay-visa").checked,
            ownerPhones: document.getElementById("set-phones").value.trim() || "201023355550",
            whatsappEnabled: document.getElementById("set-wa-on").checked,
            emailEnabled: document.getElementById("set-em-on").checked,
            exchangeMode: document.getElementById("set-ex-mode").value,
            manualEgpRate: Number(document.getElementById("set-egp-rate").value) || 50.5,
            manualEurRate: Number(document.getElementById("set-eur-rate").value) || 0.92
        };
        try {
            const res = await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify({ settings: next }) });
            adminState.overview.settings = res.settings;
            showAdminToast(isAr ? "تم حفظ الإعدادات وتفعيلها بالموقع" : "Settings saved & synced live");
        } catch (err) { showAdminToast(err.message, "err"); }
    });

    document.getElementById("test-wa-btn")?.addEventListener("click", async () => {
        try {
            const phones = document.getElementById("set-phones").value.trim();
            const res = await apiFetch("/api/admin/test-notification", { method: "POST", body: JSON.stringify({ target: "whatsapp", to: phones }) });
            showAdminToast(res.ok ? (isAr ? "تم إرسال رسالة واتساب تجريبية للمالك ✓" : "Test WhatsApp sent ✓") : "WhatsApp failed", res.ok ? "ok" : "err");
        } catch (err) { showAdminToast(err.message, "err"); }
    });

    document.getElementById("test-em-btn")?.addEventListener("click", async () => {
        const to = document.getElementById("test-em-addr").value.trim() || "info@mosasafari.com";
        try {
            const res = await apiFetch("/api/admin/test-notification", { method: "POST", body: JSON.stringify({ target: "email", to }) });
            showAdminToast(res.ok ? (isAr ? `تم إرسال إيميل تجريبي إلى ${to} ✓` : `Test email sent to ${to} ✓`) : (res.error || "Email failed"), res.ok ? "ok" : "err");
        } catch (err) { showAdminToast(err.message, "err"); }
    });
}

function renderAuditTab(root) {
    const isAr = adminState.lang === "ar";
    const h = adminState.overview.health || {};
    const logs = adminState.overview.auditLog || [];

    const healthCard = (label, ok) => `
        <div class="rounded-2xl p-4 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 flex items-center justify-between">
            <span class="text-xs font-black">${label}</span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black ${ok ? 'bg-sea/15 text-sea' : 'bg-rose-500/15 text-rose-500'}">${ok ? (isAr ? 'متصل' : 'Ready') : (isAr ? 'ناقص' : 'Missing')}</span>
        </div>`;

    root.innerHTML = `
        <div class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                ${healthCard(isAr ? "عزل لوحة التحكم (eria.mosasafari.com)" : "Isolated Admin Origin", h.isolatedWorker)}
                ${healthCard(isAr ? "حماية الكوكيز + CSRF + Rate Limit" : "HttpOnly + CSRF + Rate Limit", h.httpOnlyCookie && h.csrfProtected)}
                ${healthCard(isAr ? "مفتاح التوقيع المنفصل (JWT Secret)" : "JWT Signing Secret", h.jwtSecretSet)}
                ${healthCard(isAr ? "خزنة البيانات المعزولة (Vault/KV)" : "Isolated Data Vault / KV", h.kvBound)}
                ${healthCard("Green API WhatsApp Secret", h.greenApiConfigured)}
                ${healthCard(isAr ? "ربط بريد جوجل الشخصي (Gmail)" : "Google Gmail Connected", h.gmailConfigured)}
                ${healthCard("Resend Email API Fallback", h.resendConfigured)}
            </div>

            <div class="rounded-3xl p-5 bg-white dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                <h2 class="text-sm sm:text-base font-black mb-3">${isAr ? "سجل نشاط لوحة التحكم (آخر 100 عملية)" : "Administrative Audit Log (Last 100 Events)"}</h2>
                ${logs.length ? `
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-start">
                        <thead class="bg-[#F6F3EC] dark:bg-carbon-800 font-black">
                            <tr>
                                <th class="p-3 text-start">${isAr ? "الوقت" : "Time"}</th>
                                <th class="p-3 text-start">${isAr ? "العملية" : "Action"}</th>
                                <th class="p-3 text-start">${isAr ? "التفاصيل" : "Details"}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-carbon-900/10 dark:divide-white/10">
                            ${logs.map(l => `
                            <tr>
                                <td class="p-3 font-mono text-[11px] whitespace-nowrap opacity-75">${new Date(l.timestamp).toLocaleString()}</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-md bg-champagne/15 text-champagne-dark dark:text-champagne font-mono font-black text-[11px]">${esc(l.action)}</span></td>
                                <td class="p-3 font-bold">${esc(l.details)}</td>
                            </tr>`).join("")}
                        </tbody>
                    </table>
                </div>` : `<div class="py-10 text-center text-xs opacity-60">${t("no_data")}</div>`}
            </div>
        </div>
    `;
}

// ---------- MODALS ----------

function openModal(title, subtitle, bodyHtml, footerHtml, opts = {}) {
    const m = document.getElementById("admin-modal");
    const card = document.getElementById("admin-modal-card");
    if (!m) return;
    if (card) {
        card.classList.toggle("max-w-5xl", Boolean(opts.wide));
        card.classList.toggle("max-w-2xl", !opts.wide);
    }
    document.getElementById("admin-modal-title").textContent = title;
    document.getElementById("admin-modal-subtitle").textContent = subtitle || "";
    document.getElementById("admin-modal-body").innerHTML = bodyHtml;
    document.getElementById("admin-modal-footer").innerHTML = footerHtml;
    m.classList.remove("hidden");
}

function closeModal() {
    document.getElementById("admin-modal")?.classList.add("hidden");
    const card = document.getElementById("admin-modal-card");
    if (card) {
        card.classList.remove("max-w-5xl");
        card.classList.add("max-w-2xl");
    }
}

function openBookingDetailModal(ref) {
    const b = (adminState.overview.bookings || []).find(x => x.ref === ref);
    if (!b) return;
    const isAr = adminState.lang === "ar";
    const digits = String(b.phone || "").replace(/\D/g, "");

    const bodyHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div><label class="block font-extrabold mb-1">${isAr ? "الحالة" : "Status"}</label>
                <select id="md-bk-status" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black">
                    ${["pending", "confirmed", "completed", "cancelled"].map(st => `<option value="${st}" ${b.status === st ? "selected" : ""}>${t("status_" + st)}</option>`).join("")}
                </select>
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الإجمالي ($USD)" : "Total ($USD)"}</label>
                <input id="md-bk-usd" type="number" step="0.01" value="${Number(b.totalUsd || 0).toFixed(2)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black">
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "تاريخ الرحلة" : "Tour Date"}</label>
                <input id="md-bk-date" type="date" value="${esc(b.tripDate)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الميعاد" : "Time Slot"}</label>
                <select id="md-bk-time" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                    <option value="morning" ${b.tripTime !== "evening" ? "selected" : ""}>☀️ ${t("slot_morning")}</option>
                    <option value="evening" ${b.tripTime === "evening" ? "selected" : ""}>🌙 ${t("slot_evening")}</option>
                </select>
            </div>
            <div class="sm:col-span-2"><label class="block font-extrabold mb-1">${isAr ? "فندق الاستلام" : "Pickup Hotel"}</label>
                <input id="md-bk-hotel" type="text" value="${esc(b.pickupHotel)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
            </div>
            <div class="sm:col-span-2 p-3 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 space-y-1">
                <div><strong>${isAr ? "العميل:" : "Customer:"}</strong> ${esc(b.name)} · ${esc(b.phone)} · ${esc(b.email)}</div>
                <div><strong>${isAr ? "البرامج:" : "Programs:"}</strong> ${esc(b.selectedTours)}</div>
                <div><strong>${isAr ? "الضيوف والمركبة:" : "Guests & Vehicle:"}</strong> ${b.adults} Adults, ${b.children} Children · ${esc(b.vehicleDisplay)}</div>
                <div><strong>${isAr ? "الدفع وكود الخصم:" : "Payment & Promo:"}</strong> ${esc(b.paymentMethod)} ${b.promoCode ? `(${esc(b.promoCode)})` : ""}</div>
            </div>
            <div class="sm:col-span-2"><label class="block font-extrabold mb-1">${isAr ? "ملاحظات الإدارة والعمليات" : "Internal Operations Notes"}</label>
                <textarea id="md-bk-notes" rows="2" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15">${esc(b.adminNotes || "")}</textarea>
            </div>
        </div>
    `;

    const footerHtml = `
        ${digits ? `<a href="https://wa.me/${digits}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-sea/15 text-sea font-black text-xs">💬 ${isAr ? "مراسلة العميل" : "WhatsApp Client"}</a>` : ""}
        <button id="md-bk-resend-wa" type="button" class="px-3 py-2 rounded-xl bg-carbon-900/10 dark:bg-white/10 font-black text-xs">🔔 ${isAr ? "إرسال تنبيه للمالك" : "Alert Owner WA"}</button>
        <button id="md-bk-resend-em" type="button" class="px-3 py-2 rounded-xl bg-carbon-900/10 dark:bg-white/10 font-black text-xs">📧 ${isAr ? "إعادة إرسال الإيميل" : "Resend Email"}</button>
        <button id="md-bk-save" type="button" class="px-4 py-2 rounded-xl bg-champagne text-carbon-950 font-black text-xs">${t("save")}</button>
    `;

    openModal(`${b.ref} — ${b.name}`, `${b.selectedTours}`, bodyHtml, footerHtml);

    document.getElementById("md-bk-save")?.addEventListener("click", async () => {
        const usd = Number(document.getElementById("md-bk-usd").value) || 0;
        const slot = document.getElementById("md-bk-time").value;
        try {
            const res = await apiFetch(`/api/admin/bookings/${encodeURIComponent(b.ref)}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: document.getElementById("md-bk-status").value,
                    totalUsd: usd,
                    totalFormatted: `$${usd.toFixed(2)}`,
                    tripDate: document.getElementById("md-bk-date").value,
                    tripTime: slot,
                    tripTimeDisplay: slot === "evening" ? t("slot_evening") : t("slot_morning"),
                    pickupHotel: document.getElementById("md-bk-hotel").value.trim(),
                    adminNotes: document.getElementById("md-bk-notes").value.trim()
                })
            });
            const idx = adminState.overview.bookings.findIndex(x => x.ref === b.ref);
            if (idx > -1) adminState.overview.bookings[idx] = res.booking;
            closeModal();
            updateNavBadges();
            renderActiveTab();
            showAdminToast(isAr ? "تم تحديث الحجز ✓" : "Booking saved ✓");
        } catch (err) { showAdminToast(err.message, "err"); }
    });

    document.getElementById("md-bk-resend-wa")?.addEventListener("click", async () => {
        try {
            const res = await apiFetch(`/api/admin/bookings/${encodeURIComponent(b.ref)}/resend`, { method: "POST", body: JSON.stringify({ target: "whatsapp" }) });
            showAdminToast(res.ok ? (isAr ? "تم إرسال التنبيه للمالك ✓" : "Owner alerted ✓") : (res.error || "Failed"), res.ok ? "ok" : "err");
        } catch (err) { showAdminToast(err.message, "err"); }
    });
    document.getElementById("md-bk-resend-em")?.addEventListener("click", async () => {
        try {
            const res = await apiFetch(`/api/admin/bookings/${encodeURIComponent(b.ref)}/resend`, { method: "POST", body: JSON.stringify({ target: "email" }) });
            showAdminToast(res.ok ? (isAr ? "تم إرسال تأكيد الإيميل ✓" : "Email sent ✓") : (res.error || "Failed"), res.ok ? "ok" : "err");
        } catch (err) { showAdminToast(err.message, "err"); }
    });
}

function openManualBookingModal() {
    const isAr = adminState.lang === "ar";
    const trips = effectiveTrips();
    const today = new Date().toISOString().split("T")[0];

    const bodyHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div><label class="block font-extrabold mb-1">${isAr ? "اسم العميل *" : "Customer Name *"}</label><input id="mb-name" type="text" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "واتساب / هاتف *" : "WhatsApp / Phone *"}</label><input id="mb-phone" type="tel" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الإيميل" : "Email"}</label><input id="mb-email" type="email" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "فندق الاستلام" : "Hotel"}</label><input id="mb-hotel" type="text" value="Sharm El Sheikh" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div class="sm:col-span-2"><label class="block font-extrabold mb-1">${isAr ? "الرحلة" : "Safari Tour"}</label>
                <select id="mb-tour" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                    ${trips.map(tr => `<option value="${esc(tr.id)}" data-price="${tr.adultPrice}">${esc(isAr ? tr.titleAr : tr.titleEn)} ($${tr.adultPrice})</option>`).join("")}
                </select>
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "التاريخ" : "Date"}</label><input id="mb-date" type="date" value="${today}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الميعاد" : "Time Slot"}</label>
                <select id="mb-time" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                    <option value="morning">☀️ ${t("slot_morning")}</option>
                    <option value="evening">🌙 ${t("slot_evening")}</option>
                </select>
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "البالغين / الأطفال" : "Adults / Children"}</label>
                <div class="flex gap-2">
                    <input id="mb-adults" type="number" min="1" value="2" class="w-1/2 px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black">
                    <input id="mb-children" type="number" min="0" value="0" class="w-1/2 px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black">
                </div>
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الإجمالي ($USD)" : "Total ($USD)"}</label><input id="mb-total" type="number" step="0.01" value="${(trips[0]?.adultPrice || 24.84) * 2}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black text-sea"></div>
        </div>
    `;

    openModal(t("add_booking"), "MOSA Manual CRM Entry", bodyHtml, `<button id="mb-save" type="button" class="px-5 py-2.5 rounded-xl bg-champagne text-carbon-950 font-black text-xs">${t("save")}</button>`);

    document.getElementById("mb-save")?.addEventListener("click", async () => {
        const name = document.getElementById("mb-name").value.trim();
        const phone = document.getElementById("mb-phone").value.trim();
        if (!name || !phone) { showAdminToast(isAr ? "أدخل الاسم والهاتف" : "Name & phone required", "err"); return; }
        const tourSel = document.getElementById("mb-tour");
        const trip = trips.find(x => x.id === tourSel.value);
        try {
            await apiFetch("/api/admin/bookings", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    phone,
                    email: document.getElementById("mb-email").value.trim(),
                    pickupHotel: document.getElementById("mb-hotel").value.trim() || "Sharm El Sheikh",
                    tripDate: document.getElementById("mb-date").value,
                    tripTime: document.getElementById("mb-time").value,
                    adults: Number(document.getElementById("mb-adults").value) || 2,
                    children: Number(document.getElementById("mb-children").value) || 0,
                    selectedIds: trip ? [trip.id] : [],
                    selectedTours: trip ? (isAr ? trip.titleAr : trip.titleEn) : "",
                    totalUsd: Number(document.getElementById("mb-total").value) || 0,
                    status: "confirmed"
                })
            });
            closeModal();
            await loadOverviewData();
            showAdminToast(isAr ? "تم إضافة الحجز اليدوي ✓" : "Manual booking created ✓");
        } catch (err) { showAdminToast(err.message, "err"); }
    });
}

const STUDIO_LANGS = [
    { id: "ar", label: "العربية AR" },
    { id: "en", label: "English EN" },
    { id: "it", label: "Italiano IT" },
    { id: "ru", label: "Русский RU" }
];

function capLang(l) {
    return l.charAt(0).toUpperCase() + l.slice(1);
}

function makeDefaultTripDraft() {
    const id = "mosa-tour-" + Date.now().toString(36);
    const stepTemplate = [
        { step: "01", time: "04:00", title: "الاستلام والتحرك من نقطتك", desc: "استلام مكيّف من نقطة التجمع المحددة." },
        { step: "02", time: "04:45", title: "التدريب واستلام الخوذات", desc: "شرح القيادة الآمنة قبل الانطلاق." },
        { step: "03", time: "05:30", title: "جولة السفاري في الصحراء", desc: "قيادة ممتعة عبر وديان وجبال شرم الشيخ." },
        { step: "04", time: "06:45", title: "القرية البدوية والجمال", desc: "ضيافة الشاي البدوي وتجربة ركوب الجمال." },
        { step: "05", time: "08:15", title: "العودة لنقطة الاستلام", desc: "رحلة عودة مريحة بعد 4–5 ساعات." }
    ];
    return {
        id,
        category: "sunrise",
        slotType: "morning",
        icon: "🏜️",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleAr: "🏜️ رحلة سفاري جديدة — شرم الشيخ",
        titleEn: "🏜️ New Safari Tour — Sharm El Sheikh",
        titleIt: "🏜️ Nuovo Tour Safari — Sharm El Sheikh",
        titleRu: "🏜️ Новый сафари-тур — Шарм-эль-Шейх",
        subtitleAr: "تجربة صحراوية متكاملة لمدة 4–5 ساعات في قلب سيناء.",
        subtitleEn: "Complete 4–5 hour Sinai desert adventure.",
        subtitleIt: "Avventura completa di 4–5 ore nel deserto del Sinai.",
        subtitleRu: "Полноценное 4–5-часовое приключение в пустыне Синая.",
        fromPrice: 12,
        adultPrice: 20,
        duration: "4–5 ساعات",
        durationEn: "4–5 hours",
        durationIt: "4–5 ore",
        durationRu: "4–5 часов",
        departureWindow: { ar: "تحرك 08:00 ص", en: "Departs 08:00 AM", it: "Partenza 08:00 AM", ru: "Выезд 08:00" },
        rating: 4.9,
        badge: "برنامج مخصص",
        badgeEn: "Featured Tour",
        badgeIt: "Tour in Evidenza",
        badgeRu: "Популярный тур",
        vehicle: "ATV Quad + Camel + Bedouin Tea",
        img: IMAGE_CHOICES[0].value,
        gallery: [IMAGE_CHOICES[0].value, IMAGE_CHOICES[1].value, IMAGE_CHOICES[2].value],
        descAr: "رحلة سفاري مميزة في شرم الشيخ لمدة 4–5 ساعات تشمل الانتقالات والقيادة والضيافة البدوية.",
        descEn: "Featured 4–5 hour Sharm El Sheikh safari including transfers, desert riding, and Bedouin tea.",
        descIt: "Safari di 4–5 ore a Sharm El Sheikh con trasferimenti, guida e tè beduino.",
        descRu: "Сафари-тур 4–5 часов в Шарм-эль-Шейхе с трансфером, катанием и бедуинским чаем.",
        highlights: {
            ar: ["مدة 4–5 ساعات", "انتقالات مكيفة ذهاب وعودة", "مرشد محترف وتدريب عملي"],
            en: ["4–5 Hours Duration", "Round-trip AC Transfers", "Pro Guide & Practice"],
            it: ["Durata 4–5 Ore", "Trasferimenti A/R", "Guida Esperta"],
            ru: ["Длительность 4–5 ч", "Трансфер туда-обратно", "Опытный гид"]
        },
        itinerary: { ar: stepTemplate, en: [], it: [], ru: [] },
        includes: { ar: ["انتقالات مكيفة ذهاب وعودة", "الخوذة والتدريب", "المرشد والشاي البدوي"], en: [], it: [], ru: [] },
        excludes: { ar: ["الوشاح والنظارة الاختيارية", "التصوير الاحترافي"], en: [], it: [], ru: [] },
        bring: { ar: ["حذاء رياضي مغلق", "نظارة شمسية", "كاميرا أو هاتف مشحون"], en: [], it: [], ru: [] },
        seoTitle: { ar: "", en: "", it: "", ru: "" },
        seoDesc: { ar: "", en: "", it: "", ru: "" },
        routes: structuredClone(SAFARI_TRIPS[0].routes),
        active: true
    };
}

function normalizeTripForStudio(raw) {
    const t = structuredClone(raw);
    const baseDet = {};
    for (const l of ["ar", "en", "it", "ru"]) {
        baseDet[l] = getTripDetails(t, l);
    }
    const baseRoutes = structuredClone(getTripRoutes(t));
    t.icon = t.icon || "🏜️";
    t.city = t.city || "Sharm El Sheikh";
    t.cityAr = t.cityAr || "شرم الشيخ";
    t.badgeEn = t.badgeEn || baseDet.en?.badge || "";
    t.badgeIt = t.badgeIt || "";
    t.badgeRu = t.badgeRu || "";
    t.subtitleAr = t.subtitleAr ?? baseDet.ar.subtitle;
    t.subtitleEn = t.subtitleEn ?? baseDet.en.subtitle;
    t.subtitleIt = t.subtitleIt ?? baseDet.it.subtitle;
    t.subtitleRu = t.subtitleRu ?? baseDet.ru.subtitle;
    t.durationEn = t.durationEn || t.duration || "4–5 hours";
    t.durationIt = t.durationIt || "4–5 ore";
    t.durationRu = t.durationRu || "4–5 часов";
    t.gallery = Array.isArray(t.gallery) && t.gallery.length ? [...t.gallery] : [t.img || IMAGE_CHOICES[0].value];
    if (!t.img) t.img = t.gallery[0];
    t.departureWindow = typeof t.departureWindow === "object" ? { ...t.departureWindow } : { ar: baseDet.ar.departureWindow, en: baseDet.en.departureWindow, it: baseDet.it.departureWindow, ru: baseDet.ru.departureWindow };
    t.highlights = { ar: baseDet.ar.highlights, en: baseDet.en.highlights, it: baseDet.it.highlights, ru: baseDet.ru.highlights };
    t.itinerary = { ar: baseDet.ar.itinerary, en: baseDet.en.itinerary, it: baseDet.it.itinerary, ru: baseDet.ru.itinerary };
    t.includes = { ar: baseDet.ar.includes, en: baseDet.en.includes, it: baseDet.it.includes, ru: baseDet.ru.includes };
    t.excludes = { ar: baseDet.ar.excludes, en: baseDet.en.excludes, it: baseDet.it.excludes, ru: baseDet.ru.excludes };
    t.bring = { ar: baseDet.ar.bring, en: baseDet.en.bring, it: baseDet.it.bring, ru: baseDet.ru.bring };
    t.seoTitle = { ar: t.seoTitle?.ar || "", en: t.seoTitle?.en || "", it: t.seoTitle?.it || "", ru: t.seoTitle?.ru || "" };
    t.seoDesc = { ar: t.seoDesc?.ar || "", en: t.seoDesc?.en || "", it: t.seoDesc?.it || "", ru: t.seoDesc?.ru || "" };
    t.routes = baseRoutes.map((r, idx) => ({
        id: r.id || `route${idx + 1}`,
        label: typeof r.label === "object" ? { ar: "", en: "", it: "", ru: "", ...r.label } : { ar: String(r.label || `المسار ${idx + 1}`), en: `Route ${idx + 1}`, it: `Percorso ${idx + 1}`, ru: `Маршрут ${idx + 1}` },
        stops: Array.isArray(r.stops) ? r.stops.map(s => ({ station: s.station || "naama", timeAr: s.timeAr || s.timeEn || "08:00", timeEn: s.timeEn || s.timeAr || "08:00", emoji: s.emoji || "🕒" })) : []
    }));
    return t;
}

function getLangValue(draft, field, lang) {
    if (field === "title") return draft[`title${capLang(lang)}`] || "";
    if (field === "subtitle") return draft[`subtitle${capLang(lang)}`] || "";
    if (field === "desc") return draft[`desc${capLang(lang)}`] || "";
    if (field === "badge") return lang === "ar" ? (draft.badge || "") : (draft[`badge${capLang(lang)}`] || "");
    if (field === "duration") return lang === "ar" ? (draft.duration || "") : (draft[`duration${capLang(lang)}`] || "");
    return draft[field]?.[lang] || "";
}

function setLangValue(draft, field, lang, value) {
    if (field === "title") draft[`title${capLang(lang)}`] = value;
    else if (field === "subtitle") draft[`subtitle${capLang(lang)}`] = value;
    else if (field === "desc") draft[`desc${capLang(lang)}`] = value;
    else if (field === "badge") {
        if (lang === "ar") draft.badge = value;
        else draft[`badge${capLang(lang)}`] = value;
    } else if (field === "duration") {
        if (lang === "ar") draft.duration = value;
        else draft[`duration${capLang(lang)}`] = value;
    } else {
        draft[field] = draft[field] || {};
        draft[field][lang] = value;
    }
}

async function compressImageToPayload(file) {
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
    });
    const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Invalid image"));
        el.src = dataUrl;
    });
    const maxW = 1440;
    const maxH = 960;
    const ratio = Math.min(1, maxW / img.width, maxH / img.height);
    const w = Math.max(1, Math.round(img.width * ratio));
    const h = Math.max(1, Math.round(img.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const compressed = canvas.toDataURL("image/jpeg", 0.85);
    return {
        filename: (file.name || "photo.jpg").replace(/\.[^.]+$/, "") + ".jpg",
        mimeType: "image/jpeg",
        dataBase64: compressed.split(",")[1]
    };
}

function buildTranslateItems(draft, srcLang) {
    return {
        title: getLangValue(draft, "title", srcLang),
        badge: getLangValue(draft, "badge", srcLang),
        duration: getLangValue(draft, "duration", srcLang),
        departureWindow: getLangValue(draft, "departureWindow", srcLang),
        subtitle: getLangValue(draft, "subtitle", srcLang),
        desc: getLangValue(draft, "desc", srcLang),
        seoTitle: getLangValue(draft, "seoTitle", srcLang),
        seoDesc: getLangValue(draft, "seoDesc", srcLang),
        highlights: draft.highlights?.[srcLang] || [],
        includes: draft.includes?.[srcLang] || [],
        excludes: draft.excludes?.[srcLang] || [],
        bring: draft.bring?.[srcLang] || [],
        routeLabels: (draft.routes || []).map(r => r.label?.[srcLang] || ""),
        itinerary: draft.itinerary?.[srcLang] || []
    };
}

function applyTranslationsToDraft(draft, translations) {
    for (const [tl, data] of Object.entries(translations || {})) {
        if (!["ar", "en", "it", "ru"].includes(tl) || !data) continue;
        if (data.title) setLangValue(draft, "title", tl, data.title);
        if (data.badge) setLangValue(draft, "badge", tl, data.badge);
        if (data.duration) setLangValue(draft, "duration", tl, data.duration);
        if (data.departureWindow) setLangValue(draft, "departureWindow", tl, data.departureWindow);
        if (data.subtitle) setLangValue(draft, "subtitle", tl, data.subtitle);
        if (data.desc) setLangValue(draft, "desc", tl, data.desc);
        if (data.seoTitle) setLangValue(draft, "seoTitle", tl, data.seoTitle);
        if (data.seoDesc) setLangValue(draft, "seoDesc", tl, data.seoDesc);
        if (Array.isArray(data.highlights)) draft.highlights[tl] = data.highlights;
        if (Array.isArray(data.includes)) draft.includes[tl] = data.includes;
        if (Array.isArray(data.excludes)) draft.excludes[tl] = data.excludes;
        if (Array.isArray(data.bring)) draft.bring[tl] = data.bring;
        if (Array.isArray(data.itinerary)) draft.itinerary[tl] = data.itinerary;
        if (Array.isArray(data.routeLabels)) {
            draft.routes.forEach((r, ri) => {
                if (data.routeLabels[ri]) r.label[tl] = data.routeLabels[ri];
            });
        }
    }
}

function openTourEditorModal(idx) {
    const isAr = adminState.lang === "ar";
    const list = effectiveTrips().map(x => structuredClone(x));
    const isNew = idx < 0;
    const draft = normalizeTripForStudio(isNew ? makeDefaultTripDraft() : list[idx]);

    const studio = {
        tab: "basics",
        editLang: adminState.lang === "en" ? "en" : "ar",
        sourceLang: adminState.lang === "en" ? "en" : "ar",
        autoTranslate: true,
        dirtyLangText: isNew,
        translating: false,
        uploading: false,
        uploadedMedia: []
    };

    const collectInputsIntoDraft = () => {
        const el = id => document.getElementById(id);
        const l = studio.editLang;
        if (studio.tab === "basics") {
            const newId = el("st-id")?.value.trim();
            if (newId) draft.id = newId.replace(/[^a-zA-Z0-9_-]/g, "-");
            draft.category = el("st-cat")?.value || draft.category;
            draft.slotType = el("st-slot")?.value || draft.slotType;
            draft.icon = el("st-icon")?.value.trim() || "🏜️";
            draft.fromPrice = Number(el("st-from")?.value) || 10;
            draft.adultPrice = Number(el("st-adult")?.value) || 20;
            draft.rating = Math.min(5, Math.max(1, Number(el("st-rate")?.value) || 4.8));
            draft.vehicle = el("st-veh")?.value.trim() || draft.vehicle;
            draft.active = el("st-active") ? el("st-active").checked : draft.active;
            if (el("st-title")) setLangValue(draft, "title", l, el("st-title").value.trim());
            if (el("st-badge")) setLangValue(draft, "badge", l, el("st-badge").value.trim());
            if (el("st-dur")) setLangValue(draft, "duration", l, el("st-dur").value.trim());
            if (el("st-dep")) setLangValue(draft, "departureWindow", l, el("st-dep").value.trim());
        } else if (studio.tab === "content") {
            if (el("st-sub")) setLangValue(draft, "subtitle", l, el("st-sub").value.trim());
            if (el("st-desc")) setLangValue(draft, "desc", l, el("st-desc").value.trim());
            draft.highlights[l] = [...document.querySelectorAll("[data-st-hl]")].map(inp => inp.value.trim()).filter(Boolean);
        } else if (studio.tab === "itinerary") {
            draft.itinerary[l] = [...document.querySelectorAll("[data-st-step-row]")].map((row, rIdx) => ({
                step: row.querySelector("[data-sf='step']")?.value.trim() || String(rIdx + 1).padStart(2, "0"),
                time: row.querySelector("[data-sf='time']")?.value.trim() || "",
                title: row.querySelector("[data-sf='title']")?.value.trim() || "",
                desc: row.querySelector("[data-sf='desc']")?.value.trim() || ""
            }));
            for (const lk of ["includes", "excludes", "bring"]) {
                draft[lk][l] = [...document.querySelectorAll(`[data-st-list='${lk}']`)].map(inp => inp.value.trim()).filter(Boolean);
            }
        } else if (studio.tab === "routes") {
            if (el("st-seot")) setLangValue(draft, "seoTitle", l, el("st-seot").value.trim());
            if (el("st-seod")) setLangValue(draft, "seoDesc", l, el("st-seod").value.trim());
            document.querySelectorAll("[data-st-route]").forEach(rBox => {
                const ri = Number(rBox.dataset.stRoute);
                if (!draft.routes[ri]) return;
                const lbl = rBox.querySelector("[data-r-label]")?.value.trim();
                if (lbl !== undefined) draft.routes[ri].label[l] = lbl;
                rBox.querySelectorAll("[data-st-stop]").forEach(stRow => {
                    const si = Number(stRow.dataset.stStop);
                    if (!draft.routes[ri].stops[si]) return;
                    draft.routes[ri].stops[si].emoji = stRow.querySelector("[data-sf='emoji']")?.value.trim() || "🕒";
                    draft.routes[ri].stops[si].station = stRow.querySelector("[data-sf='station']")?.value.trim() || "naama";
                    draft.routes[ri].stops[si].timeAr = stRow.querySelector("[data-sf='timeAr']")?.value.trim() || "08:00";
                    draft.routes[ri].stops[si].timeEn = stRow.querySelector("[data-sf='timeEn']")?.value.trim() || "08:00";
                });
            });
        }
        draft.img = draft.gallery[0] || IMAGE_CHOICES[0].value;
    };

    const runStudioTranslate = async (showToastMsg = true) => {
        collectInputsIntoDraft();
        studio.translating = true;
        renderStudioBody();
        try {
            const payload = {
                sourceLang: studio.sourceLang,
                targetLangs: ["ar", "en", "it", "ru"].filter(x => x !== studio.sourceLang),
                items: buildTranslateItems(draft, studio.sourceLang)
            };
            const res = await apiFetch("/api/admin/translate", { method: "POST", body: JSON.stringify(payload) });
            applyTranslationsToDraft(draft, res.translations);
            studio.dirtyLangText = false;
            if (showToastMsg) showAdminToast(isAr ? "تمت ترجمة وتحديث الـ 4 لغات تلقائياً ✓" : "Auto-translated all 4 languages ✓");
            return true;
        } catch (err) {
            showAdminToast(err.message, "err");
            return false;
        } finally {
            studio.translating = false;
            renderStudioBody();
        }
    };

    const renderListEditor = (lk, heading, colorCls) => {
        const arr = draft[lk][studio.editLang] || [];
        return `
            <div class="p-3.5 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-black ${colorCls}">${heading} (${arr.length})</span>
                    <button type="button" data-add-list="${lk}" class="px-2.5 py-1 rounded-lg bg-champagne text-carbon-950 font-black text-[11px]">+ ${isAr ? "إضافة" : "Add"}</button>
                </div>
                <div class="space-y-1.5">
                    ${arr.map((val, idx2) => `
                        <div class="flex items-center gap-1.5">
                            <input type="text" data-st-list="${lk}" value="${esc(val)}" class="flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 text-xs font-bold">
                            <button type="button" data-del-list="${lk}:${idx2}" class="px-2 py-1.5 rounded-lg bg-rose-500/15 text-rose-500 font-black text-xs">✕</button>
                        </div>
                    `).join("")}
                </div>
            </div>`;
    };

    const renderStudioBody = () => {
        const l = studio.editLang;
        const tabs = [
            { id: "basics", label: isAr ? "1. الأساسيات والأسعار" : "1. Basics & Pricing" },
            { id: "gallery", label: isAr ? `2. الصور (${draft.gallery.length})` : `2. Gallery (${draft.gallery.length})` },
            { id: "content", label: isAr ? "3. الوصف والمميزات" : "3. Content & Highlights" },
            { id: "itinerary", label: isAr ? "4. خط السير والشمول" : "4. Itinerary & Inclusions" },
            { id: "routes", label: isAr ? "5. المسارات و SEO" : "5. Routes & Page SEO" }
        ];

        let tabHtml = "";
        if (studio.tab === "basics") {
            tabHtml = `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div class="sm:col-span-2 lg:col-span-2"><label class="block font-extrabold mb-1">${isAr ? `عنوان البرنامج (${l.toUpperCase()}) *` : `Title (${l.toUpperCase()}) *`}</label><input id="st-title" type="text" value="${esc(getLangValue(draft, "title", l))}" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? `شارة البطاقة (${l.toUpperCase()})` : `Badge (${l.toUpperCase()})`}</label><input id="st-badge" type="text" value="${esc(getLangValue(draft, "badge", l))}" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? `المدة (${l.toUpperCase()})` : `Duration (${l.toUpperCase()})`}</label><input id="st-dur" type="text" value="${esc(getLangValue(draft, "duration", l))}" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? `نافذة التحرك (${l.toUpperCase()})` : `Departure Window (${l.toUpperCase()})`}</label><input id="st-dep" type="text" value="${esc(getLangValue(draft, "departureWindow", l))}" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? "الأيقونة (Emoji)" : "Icon"}</label><input id="st-icon" type="text" value="${esc(draft.icon)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? "السعر يبدأ من ($)" : "From Price ($)"}</label><input id="st-from" type="number" step="0.01" value="${draft.fromPrice}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? "سعر الفرد الكامل ($)" : "Adult Price ($)"}</label><input id="st-adult" type="number" step="0.01" value="${draft.adultPrice}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? "التقييم (★)" : "Rating"}</label><input id="st-rate" type="number" step="0.1" min="1" max="5" value="${draft.rating}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
                    <div><label class="block font-extrabold mb-1">${isAr ? "الفئة" : "Category"}</label>
                        <select id="st-cat" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                            <option value="sunrise" ${draft.category === "sunrise" ? "selected" : ""}>🌅 الشروق (sunrise)</option>
                            <option value="morning" ${draft.category === "morning" ? "selected" : ""}>☀️ الصباحية (morning)</option>
                            <option value="standard" ${draft.category === "standard" ? "selected" : ""}>🌄 العادية (standard)</option>
                            <option value="dinner" ${draft.category === "dinner" ? "selected" : ""}>🌙 العشاء (dinner)</option>
                        </select>
                    </div>
                    <div><label class="block font-extrabold mb-1">${isAr ? "الفترة" : "Time Slot"}</label>
                        <select id="st-slot" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                            <option value="morning" ${draft.slotType === "morning" ? "selected" : ""}>${t("slot_morning")}</option>
                            <option value="evening" ${draft.slotType === "evening" ? "selected" : ""}>${t("slot_evening")}</option>
                        </select>
                    </div>
                    <div><label class="block font-extrabold mb-1">${isAr ? "رابط الصفحة (Slug)" : "URL Slug ID"}</label><input id="st-id" type="text" value="${esc(draft.id)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-mono font-bold"></div>
                    <div class="sm:col-span-2"><label class="block font-extrabold mb-1">${isAr ? "ملخص المركبات والأنشطة" : "Vehicles Summary"}</label><input id="st-veh" type="text" value="${esc(draft.vehicle)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 font-black cursor-pointer self-end"><input id="st-active" type="checkbox" ${draft.active !== false ? "checked" : ""} class="accent-sea"> ${isAr ? "تفعيل البرنامج بالموقع" : "Show on Storefront"}</label>
                </div>`;
        } else if (studio.tab === "gallery") {
            const mediaPool = [
                ...studio.uploadedMedia.map(m => ({ value: m.url, label: `Uploaded: ${m.filename}` })),
                ...IMAGE_CHOICES
            ];
            tabHtml = `
                <div class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label class="p-4 rounded-2xl border-2 border-dashed border-champagne/50 bg-champagne/10 hover:bg-champagne/15 cursor-pointer flex items-center justify-center gap-2 font-black text-champagne-dark dark:text-champagne transition">
                            <input id="st-file-upload" type="file" accept="image/*" multiple class="hidden">
                            <span>${studio.uploading ? (isAr ? "جاري رفع الصور..." : "Uploading...") : (isAr ? "📤 رفع صور جديدة من جهازك (متعدد)" : "📤 Upload Photo(s) from Device")}</span>
                        </label>
                        <div class="flex items-center gap-2 p-2 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10">
                            <input id="st-img-url" type="url" placeholder="https://..." class="flex-1 px-2.5 py-2 bg-transparent font-bold focus:outline-none">
                            <button id="st-add-url" type="button" class="px-3 py-2 rounded-xl bg-carbon-900 dark:bg-champagne text-white dark:text-carbon-950 font-black">+ URL</button>
                        </div>
                    </div>

                    <div>
                        <div class="font-black mb-2">${isAr ? `معرض صور البرنامج الحالي (${draft.gallery.length} صورة — الأولى هي الصورة الرئيسية)` : `Tour Gallery (${draft.gallery.length} photos — #1 is Cover)`}</div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            ${draft.gallery.map((url, gi) => `
                                <div class="rounded-2xl overflow-hidden bg-[#F6F3EC] dark:bg-carbon-900 border ${gi === 0 ? "border-champagne ring-2 ring-champagne/40" : "border-carbon-900/10 dark:border-white/10"} flex flex-col">
                                    <div class="relative h-28 bg-carbon-950">
                                        <img src="${esc(url)}" alt="Photo ${gi + 1}" class="w-full h-full object-cover">
                                        ${gi === 0 ? `<span class="absolute top-1.5 start-1.5 px-2 py-0.5 rounded bg-champagne text-carbon-950 text-[10px] font-black">${isAr ? "الرئيسية ★" : "Cover ★"}</span>` : ""}
                                    </div>
                                    <div class="p-1.5 flex items-center justify-between gap-1 text-[10px]">
                                        <button type="button" data-gal-cover="${gi}" class="px-2 py-1 rounded bg-white dark:bg-carbon-800 font-black hover:bg-champagne hover:text-carbon-950">${gi === 0 ? "★" : (isAr ? "تعيين رئيسية" : "Cover")}</button>
                                        <div class="flex gap-1">
                                            ${gi > 0 ? `<button type="button" data-gal-move="${gi}:-1" class="px-1.5 py-1 rounded bg-white dark:bg-carbon-800 font-black">←</button>` : ""}
                                            ${gi < draft.gallery.length - 1 ? `<button type="button" data-gal-move="${gi}:1" class="px-1.5 py-1 rounded bg-white dark:bg-carbon-800 font-black">→</button>` : ""}
                                            <button type="button" data-gal-del="${gi}" class="px-1.5 py-1 rounded bg-rose-500/15 text-rose-500 font-black">✕</button>
                                        </div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>

                    <div>
                        <div class="font-black mb-2 opacity-80">${isAr ? "مكتبة صور موسى سفاري والصور المرفوعة (اضغط للإضافة للمعرض):" : "Media Library (Tap to add to tour gallery):"}</div>
                        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            ${mediaPool.map(mp => {
                                const used = draft.gallery.includes(mp.value);
                                return `
                                    <button type="button" data-lib-add="${esc(mp.value)}" class="relative rounded-xl overflow-hidden border ${used ? "border-sea ring-2 ring-sea/35" : "border-carbon-900/10 dark:border-white/10 opacity-85 hover:opacity-100"} text-start transition">
                                        <img src="${esc(mp.value)}" alt="${esc(mp.label)}" class="w-full h-16 object-cover">
                                        <div class="p-1 text-[9px] font-extrabold truncate bg-white dark:bg-carbon-800">${used ? "✓ " : "+ "}${esc(mp.label)}</div>
                                    </button>`;
                            }).join("")}
                        </div>
                    </div>
                </div>`;
        } else if (studio.tab === "content") {
            const hlArr = draft.highlights[l] || [];
            tabHtml = `
                <div class="space-y-4 text-xs">
                    <div>
                        <label class="block font-extrabold mb-1">${isAr ? `العنوان الفرعي بصفحة التفاصيل (${l.toUpperCase()})` : `Page Hero Subtitle (${l.toUpperCase()})`}</label>
                        <input id="st-sub" type="text" value="${esc(getLangValue(draft, "subtitle", l))}" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                    </div>
                    <div>
                        <label class="block font-extrabold mb-1">${isAr ? `الوصف الكامل للبرنامج (${l.toUpperCase()})` : `Full Description (${l.toUpperCase()})`}</label>
                        <textarea id="st-desc" rows="3" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-medium">${esc(getLangValue(draft, "desc", l))}</textarea>
                    </div>
                    <div class="p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="font-black text-champagne-dark dark:text-champagne">${isAr ? `أبرز المميزات (${l.toUpperCase()}) ✓` : `Highlights (${l.toUpperCase()}) ✓`}</span>
                            <button id="st-add-hl" type="button" class="px-3 py-1 rounded-lg bg-champagne text-carbon-950 font-black">+ ${isAr ? "ميزة" : "Add"}</button>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            ${hlArr.map((val, hi) => `
                                <div class="flex items-center gap-1.5">
                                    <input type="text" data-st-hl="${hi}" value="${esc(val)}" class="st-lang-inp flex-1 px-2.5 py-2 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 font-bold">
                                    <button type="button" data-del-hl="${hi}" class="px-2 py-2 rounded-lg bg-rose-500/15 text-rose-500 font-black">✕</button>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>`;
        } else if (studio.tab === "itinerary") {
            const steps = draft.itinerary[l] || [];
            tabHtml = `
                <div class="space-y-4 text-xs">
                    <div class="p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="font-black text-champagne-dark dark:text-champagne">${isAr ? `خط سير الرحلة بالتفصيل (${l.toUpperCase()})` : `Step-by-Step Itinerary (${l.toUpperCase()})`}</span>
                            <button id="st-add-step" type="button" class="px-3 py-1 rounded-lg bg-champagne text-carbon-950 font-black">+ ${isAr ? "مرحلة" : "Add Step"}</button>
                        </div>
                        <div class="space-y-2.5">
                            ${steps.map((st, si) => `
                                <div data-st-step-row="${si}" class="p-3 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 grid grid-cols-12 gap-2">
                                    <input type="text" data-sf="step" value="${esc(st.step || String(si + 1).padStart(2, "0"))}" class="col-span-2 px-2 py-1.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 font-black text-center">
                                    <input type="text" data-sf="time" value="${esc(st.time || "")}" placeholder="04:00" class="st-lang-inp col-span-3 px-2 py-1.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 font-mono font-bold">
                                    <input type="text" data-sf="title" value="${esc(st.title || "")}" placeholder="${isAr ? "عنوان المرحلة" : "Step title"}" class="st-lang-inp col-span-6 px-2.5 py-1.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 font-black">
                                    <button type="button" data-del-step="${si}" class="col-span-1 rounded-lg bg-rose-500/15 text-rose-500 font-black">✕</button>
                                    <input type="text" data-sf="desc" value="${esc(st.desc || "")}" placeholder="${isAr ? "تفاصيل المرحلة" : "Step details"}" class="st-lang-inp col-span-12 px-2.5 py-1.5 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900">
                                </div>
                            `).join("")}
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        ${renderListEditor("includes", isAr ? "✓ ما يشمله السعر" : "✓ Included", "text-sea")}
                        ${renderListEditor("excludes", isAr ? "✕ غير مشمول" : "✕ Excluded", "text-copper")}
                        ${renderListEditor("bring", isAr ? "🎒 ماذا تحضر معك؟" : "🎒 What to Bring", "text-champagne-dark dark:text-champagne")}
                    </div>
                </div>`;
        } else if (studio.tab === "routes") {
            tabHtml = `
                <div class="space-y-4 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="font-black">${isAr ? `مسارات ونقاط الاستلام (${draft.routes.length})` : `Pickup Routes (${draft.routes.length})`}</span>
                        <button id="st-add-route" type="button" class="px-3 py-1.5 rounded-xl bg-champagne text-carbon-950 font-black">+ ${isAr ? "مسار جديد" : "Add Route"}</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${draft.routes.map((rt, ri) => `
                            <div data-st-route="${ri}" class="p-3.5 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 space-y-2.5">
                                <div class="flex items-center gap-2">
                                    <input type="text" data-r-label value="${esc(rt.label?.[l] || "")}" class="st-lang-inp flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 font-black">
                                    <button type="button" data-add-stop="${ri}" class="px-2.5 py-1.5 rounded-lg bg-sea text-carbon-950 font-black">+ ${isAr ? "محطة" : "Stop"}</button>
                                    ${draft.routes.length > 1 ? `<button type="button" data-del-route="${ri}" class="px-2 py-1.5 rounded-lg bg-rose-500/15 text-rose-500 font-black">✕</button>` : ""}
                                </div>
                                <div class="space-y-1.5">
                                    ${(rt.stops || []).map((st, si) => `
                                        <div data-st-stop="${si}" class="grid grid-cols-12 gap-1.5 items-center">
                                            <input type="text" data-sf="emoji" value="${esc(st.emoji || "🕒")}" class="col-span-2 px-1.5 py-1.5 rounded-lg bg-white dark:bg-carbon-800 text-center">
                                            <input type="text" list="st-station-datalist" data-sf="station" value="${esc(st.station)}" class="col-span-4 px-2 py-1.5 rounded-lg bg-white dark:bg-carbon-800 font-bold">
                                            <input type="text" data-sf="timeAr" value="${esc(st.timeAr)}" placeholder="04:00 ص" class="col-span-3 px-2 py-1.5 rounded-lg bg-white dark:bg-carbon-800 font-mono">
                                            <input type="text" data-sf="timeEn" value="${esc(st.timeEn)}" placeholder="04:00 AM" class="col-span-2 px-1.5 py-1.5 rounded-lg bg-white dark:bg-carbon-800 font-mono">
                                            <button type="button" data-del-stop="${ri}:${si}" class="col-span-1 py-1.5 rounded-lg bg-rose-500/15 text-rose-500 font-black">✕</button>
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <datalist id="st-station-datalist">
                        ${Object.keys(PICKUP_STATIONS).map(k => `<option value="${k}">${PICKUP_STATIONS[k].ar} — ${PICKUP_STATIONS[k].en}</option>`).join("")}
                    </datalist>

                    <div class="p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-champagne/30 space-y-2.5">
                        <div class="font-black text-champagne-dark dark:text-champagne">🔍 ${isAr ? `إعدادات SEO لصفحة الرحلة (${l.toUpperCase()})` : `Dedicated Page SEO Meta (${l.toUpperCase()})`}</div>
                        <div><label class="block font-bold mb-1">${isAr ? "عنوان جوجل المخصص (اختياري)" : "Custom SEO Title (optional)"}</label><input id="st-seot" type="text" value="${esc(getLangValue(draft, "seoTitle", l))}" placeholder="${esc(getLangValue(draft, "title", l))}" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 font-bold"></div>
                        <div><label class="block font-bold mb-1">${isAr ? "وصف جوجل المخصص (اختياري)" : "Custom Meta Description (optional)"}</label><textarea id="st-seod" rows="2" placeholder="${esc(getLangValue(draft, "subtitle", l))}" class="st-lang-inp w-full px-3 py-2 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10">${esc(getLangValue(draft, "seoDesc", l))}</textarea></div>
                    </div>
                </div>`;
        }

        const bodyHtml = `
            <div class="space-y-4">
                <div class="p-3 rounded-2xl bg-carbon-950 text-white border border-champagne/30 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div class="flex flex-wrap items-center gap-1.5">
                        ${STUDIO_LANGS.map(sl => `
                            <button type="button" data-st-lang="${sl.id}"
                                class="px-3 py-1.5 rounded-xl font-black transition ${studio.editLang === sl.id ? "bg-champagne text-carbon-950 shadow-md" : "bg-white/10 hover:bg-white/20 text-white"}">
                                ${sl.label}${studio.sourceLang === sl.id && studio.dirtyLangText ? " *" : ""}
                            </button>
                        `).join("")}
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <label class="flex items-center gap-1.5 text-[11px] font-extrabold text-white/90 cursor-pointer">
                            <input id="st-auto-tr" type="checkbox" ${studio.autoTranslate ? "checked" : ""} class="accent-champagne">
                            <span>${isAr ? "ترجمة تلقائية للـ 4 لغات عند الحفظ" : "Auto-translate all 4 langs on save"}</span>
                        </label>
                        <button id="st-tr-now" type="button" ${studio.translating ? "disabled" : ""}
                            class="px-3 py-1.5 rounded-xl bg-sea text-carbon-950 hover:bg-sea-dark hover:text-white font-black transition disabled:opacity-60">
                            ${studio.translating ? (isAr ? "جاري الترجمة..." : "Translating...") : (isAr ? "✨ ترجم الآن لكل اللغات" : "✨ Auto-Translate All Now")}
                        </button>
                    </div>
                </div>

                <div class="flex flex-wrap gap-1.5 border-b border-carbon-900/10 dark:border-white/10 pb-2.5">
                    ${tabs.map(tb => `
                        <button type="button" data-st-tab="${tb.id}"
                            class="px-3 py-2 rounded-xl text-xs font-black transition ${studio.tab === tb.id ? "bg-carbon-950 dark:bg-champagne text-white dark:text-carbon-950" : "bg-[#F6F3EC] dark:bg-carbon-900 hover:border-champagne border border-transparent"}">
                            ${tb.label}
                        </button>
                    `).join("")}
                </div>

                <div>${tabHtml}</div>
            </div>`;

        const footerHtml = `
            <div class="w-full flex flex-wrap items-center justify-between gap-2 text-xs">
                <span class="opacity-70 font-bold">${isAr ? `لغة المصدر الحالية للتعديلات: ${studio.sourceLang.toUpperCase()}` : `Active source language: ${studio.sourceLang.toUpperCase()}`}</span>
                <div class="flex items-center gap-2">
                    <button type="button" id="st-cancel-btn" class="px-4 py-2.5 rounded-xl border border-carbon-900/15 dark:border-white/15 font-bold">${t("cancel")}</button>
                    <button id="tr-save" type="button" class="px-5 py-2.5 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 font-black shadow-lg shadow-champagne/25">${t("save")}</button>
                </div>
            </div>`;

        openModal(
            isNew ? t("add_tour") : (isAr ? "استوديو تخصيص البرنامج والصفحة" : "Full Tour & Page Studio"),
            `${draft.id} · /tour.html?id=${draft.id}`,
            bodyHtml,
            footerHtml,
            { wide: true }
        );

        bindStudioEvents();
    };

    const bindStudioEvents = () => {
        document.querySelectorAll(".st-lang-inp").forEach(inp => {
            inp.addEventListener("input", () => {
                studio.sourceLang = studio.editLang;
                studio.dirtyLangText = true;
            });
        });

        document.querySelectorAll("[data-st-lang]").forEach(btn => {
            btn.addEventListener("click", () => {
                collectInputsIntoDraft();
                studio.editLang = btn.dataset.stLang;
                renderStudioBody();
            });
        });

        document.querySelectorAll("[data-st-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                collectInputsIntoDraft();
                studio.tab = btn.dataset.stTab;
                renderStudioBody();
            });
        });

        document.getElementById("st-auto-tr")?.addEventListener("change", e => {
            studio.autoTranslate = e.target.checked;
        });

        document.getElementById("st-tr-now")?.addEventListener("click", () => runStudioTranslate(true));
        document.getElementById("st-cancel-btn")?.addEventListener("click", closeModal);

        // Gallery Handlers
        document.getElementById("st-file-upload")?.addEventListener("change", async e => {
            const files = [...(e.target.files || [])];
            if (!files.length) return;
            studio.uploading = true;
            renderStudioBody();
            try {
                for (const f of files) {
                    const payload = await compressImageToPayload(f);
                    const res = await apiFetch("/api/admin/media", { method: "POST", body: JSON.stringify(payload) });
                    if (res.url && !draft.gallery.includes(res.url)) draft.gallery.push(res.url);
                    if (res.media) studio.uploadedMedia.unshift(res.media);
                }
                draft.img = draft.gallery[0] || IMAGE_CHOICES[0].value;
                showAdminToast(isAr ? "تم رفع الصور وإضافتها للمعرض ✓" : "Photos uploaded to gallery ✓");
            } catch (err) {
                showAdminToast(err.message, "err");
            } finally {
                studio.uploading = false;
                renderStudioBody();
            }
        });

        document.getElementById("st-add-url")?.addEventListener("click", () => {
            const val = document.getElementById("st-img-url")?.value.trim();
            if (!val) return;
            if (!draft.gallery.includes(val)) draft.gallery.push(val);
            draft.img = draft.gallery[0];
            renderStudioBody();
        });

        document.querySelectorAll("[data-gal-cover]").forEach(b => b.addEventListener("click", () => {
            const i = Number(b.dataset.galCover);
            const [picked] = draft.gallery.splice(i, 1);
            if (picked) draft.gallery.unshift(picked);
            draft.img = draft.gallery[0] || IMAGE_CHOICES[0].value;
            renderStudioBody();
        }));
        document.querySelectorAll("[data-gal-move]").forEach(b => b.addEventListener("click", () => {
            const [iStr, dStr] = b.dataset.galMove.split(":");
            const i = Number(iStr);
            const j = i + Number(dStr);
            if (j >= 0 && j < draft.gallery.length) {
                [draft.gallery[i], draft.gallery[j]] = [draft.gallery[j], draft.gallery[i]];
                draft.img = draft.gallery[0];
                renderStudioBody();
            }
        }));
        document.querySelectorAll("[data-gal-del]").forEach(b => b.addEventListener("click", () => {
            if (draft.gallery.length <= 1) return showAdminToast(isAr ? "يجب بقاء صورة واحدة على الأقل" : "Keep at least 1 photo", "err");
            draft.gallery.splice(Number(b.dataset.galDel), 1);
            draft.img = draft.gallery[0];
            renderStudioBody();
        }));
        document.querySelectorAll("[data-lib-add]").forEach(b => b.addEventListener("click", () => {
            const url = b.dataset.libAdd;
            if (!draft.gallery.includes(url)) draft.gallery.push(url);
            draft.img = draft.gallery[0];
            renderStudioBody();
        }));

        // Content & Lists Handlers
        document.getElementById("st-add-hl")?.addEventListener("click", () => {
            collectInputsIntoDraft();
            draft.highlights[studio.editLang].push(studio.editLang === "ar" ? "ميزة جديدة" : "New highlight");
            studio.sourceLang = studio.editLang;
            studio.dirtyLangText = true;
            renderStudioBody();
        });
        document.querySelectorAll("[data-del-hl]").forEach(b => b.addEventListener("click", () => {
            collectInputsIntoDraft();
            draft.highlights[studio.editLang].splice(Number(b.dataset.delHl), 1);
            studio.sourceLang = studio.editLang;
            studio.dirtyLangText = true;
            renderStudioBody();
        }));

        document.getElementById("st-add-step")?.addEventListener("click", () => {
            collectInputsIntoDraft();
            const arr = draft.itinerary[studio.editLang];
            arr.push({ step: String(arr.length + 1).padStart(2, "0"), time: "08:00", title: "", desc: "" });
            studio.sourceLang = studio.editLang;
            studio.dirtyLangText = true;
            renderStudioBody();
        });
        document.querySelectorAll("[data-del-step]").forEach(b => b.addEventListener("click", () => {
            collectInputsIntoDraft();
            draft.itinerary[studio.editLang].splice(Number(b.dataset.delStep), 1);
            studio.sourceLang = studio.editLang;
            studio.dirtyLangText = true;
            renderStudioBody();
        }));

        document.querySelectorAll("[data-add-list]").forEach(b => b.addEventListener("click", () => {
            collectInputsIntoDraft();
            draft[b.dataset.addList][studio.editLang].push("");
            studio.sourceLang = studio.editLang;
            studio.dirtyLangText = true;
            renderStudioBody();
        }));
        document.querySelectorAll("[data-del-list]").forEach(b => b.addEventListener("click", () => {
            collectInputsIntoDraft();
            const [lk, idx2] = b.dataset.delList.split(":");
            draft[lk][studio.editLang].splice(Number(idx2), 1);
            studio.sourceLang = studio.editLang;
            studio.dirtyLangText = true;
            renderStudioBody();
        }));

        // Routes Handlers
        document.getElementById("st-add-route")?.addEventListener("click", () => {
            collectInputsIntoDraft();
            const n = draft.routes.length + 1;
            draft.routes.push({
                id: `route${n}`,
                label: { ar: `المسار ${n}`, en: `Route ${n}`, it: `Percorso ${n}`, ru: `Маршрут ${n}` },
                stops: [{ station: "naama", timeAr: "08:00 ص", timeEn: "08:00 AM", emoji: "🕗" }]
            });
            studio.sourceLang = studio.editLang;
            studio.dirtyLangText = true;
            renderStudioBody();
        });
        document.querySelectorAll("[data-del-route]").forEach(b => b.addEventListener("click", () => {
            collectInputsIntoDraft();
            draft.routes.splice(Number(b.dataset.delRoute), 1);
            renderStudioBody();
        }));
        document.querySelectorAll("[data-add-stop]").forEach(b => b.addEventListener("click", () => {
            collectInputsIntoDraft();
            draft.routes[Number(b.dataset.addStop)]?.stops.push({ station: "naama", timeAr: "08:00 ص", timeEn: "08:00 AM", emoji: "🕒" });
            renderStudioBody();
        }));
        document.querySelectorAll("[data-del-stop]").forEach(b => b.addEventListener("click", () => {
            collectInputsIntoDraft();
            const [ri, si] = b.dataset.delStop.split(":").map(Number);
            draft.routes[ri]?.stops.splice(si, 1);
            renderStudioBody();
        }));

        // Save & Sync
        document.getElementById("tr-save")?.addEventListener("click", async () => {
            const btn = document.getElementById("tr-save");
            if (btn) btn.disabled = true;
            collectInputsIntoDraft();
            if (studio.autoTranslate && studio.dirtyLangText) {
                await runStudioTranslate(false);
            }
            draft.img = draft.gallery[0] || IMAGE_CHOICES[0].value;
            if (isNew) list.push(draft);
            else list[idx] = draft;
            try {
                const res = await apiFetch("/api/admin/trips", { method: "PUT", body: JSON.stringify({ trips: list }) });
                adminState.overview.trips = res.trips;
                closeModal();
                updateNavBadges();
                renderActiveTab();
                showAdminToast(isAr ? "تم حفظ البرنامج وتحديث اللغات والصور بالموقع ✓" : "Tour, gallery & translations synced live ✓");
            } catch (err) {
                showAdminToast(err.message, "err");
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    };

    renderStudioBody();
    apiFetch("/api/admin/media").then(r => {
        if (Array.isArray(r.media)) {
            studio.uploadedMedia = r.media;
            if (studio.tab === "gallery") renderStudioBody();
        }
    }).catch(() => {});
}

function openPromoModal(idx) {
    const isAr = adminState.lang === "ar";
    const list = (adminState.overview.promos || []).map(x => ({ ...x }));
    const isNew = idx < 0;
    const item = isNew ? { code: "", discount: 15, active: true, uses: 0, maxUses: 0, expiresAt: "2026-12-31", note: "" } : list[idx];

    const bodyHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div><label class="block font-extrabold mb-1">${isAr ? "كود الخصم *" : "Code *"}</label><input id="pr-code" type="text" value="${esc(item.code)}" placeholder="VIP25" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-mono font-black uppercase"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "نسبة الخصم % *" : "Discount % *"}</label><input id="pr-disc" type="number" min="1" max="90" value="${item.discount}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الحد الأقصى (0 = غير محدود)" : "Max Uses (0 = unlimited)"}</label><input id="pr-max" type="number" min="0" value="${item.maxUses || 0}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "تاريخ الانتهاء" : "Expiry Date"}</label><input id="pr-exp" type="date" value="${esc(item.expiresAt || "")}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div class="sm:col-span-2"><label class="block font-extrabold mb-1">${isAr ? "ملاحظة" : "Note"}</label><input id="pr-note" type="text" value="${esc(item.note || "")}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15"></div>
        </div>
    `;

    openModal(isNew ? t("add_promo") : t("edit_btn"), item.code || "Promo", bodyHtml, `<button id="pr-save" type="button" class="px-5 py-2.5 rounded-xl bg-champagne text-carbon-950 font-black text-xs">${t("save")}</button>`);

    document.getElementById("pr-save")?.addEventListener("click", async () => {
        const code = document.getElementById("pr-code").value.trim().toUpperCase();
        if (!code) return;
        item.code = code;
        item.discount = Number(document.getElementById("pr-disc").value) || 10;
        item.maxUses = Number(document.getElementById("pr-max").value) || 0;
        item.expiresAt = document.getElementById("pr-exp").value;
        item.note = document.getElementById("pr-note").value.trim();
        if (isNew) list.push(item); else list[idx] = item;
        closeModal();
        await savePromosList(list);
    });
}

// ---------- NAVIGATION & BOOTSTRAP ----------

function renderActiveTab() {
    destroyCharts();
    const root = document.getElementById("admin-main");
    if (!root) return;
    if (adminState.activeTab === "overview") renderOverviewTab(root);
    else if (adminState.activeTab === "bookings") renderBookingsTab(root);
    else if (adminState.activeTab === "tours") renderToursTab(root);
    else if (adminState.activeTab === "promos") renderPromosTab(root);
    else if (adminState.activeTab === "customers") renderCustomersTab(root);
    else if (adminState.activeTab === "analytics") renderAnalyticsTab(root);
    else if (adminState.activeTab === "email") renderEmailTab(root);
    else if (adminState.activeTab === "settings") renderSettingsTab(root);
    else if (adminState.activeTab === "audit") renderAuditTab(root);
}

function switchTab(tab) {
    adminState.activeTab = tab;
    document.querySelectorAll(".admin-nav-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.tab === tab);
    });
    updateTopbarTitle();
    closeMobileSidebar();
    renderActiveTab();
}

function closeMobileSidebar() {
    const sb = document.getElementById("admin-sidebar");
    const bd = document.getElementById("sidebar-backdrop");
    if (sb) sb.classList.add("-translate-x-full", "rtl:translate-x-full");
    if (bd) bd.classList.add("hidden");
}

function openMobileSidebar() {
    const sb = document.getElementById("admin-sidebar");
    const bd = document.getElementById("sidebar-backdrop");
    if (sb) sb.classList.remove("-translate-x-full", "rtl:translate-x-full");
    if (bd) bd.classList.remove("hidden");
}

async function loadOverviewData() {
    const data = await apiFetch("/api/admin/overview");
    adminState.overview = data;
    const st = document.getElementById("topbar-sync-time");
    if (st) st.textContent = `${t("synced_at")} ${new Date().toLocaleTimeString()}`;
    updateNavBadges();
    renderActiveTab();
}

function showDashboardShell() {
    document.getElementById("admin-login-screen")?.classList.add("hidden");
    document.getElementById("admin-app")?.classList.remove("hidden");
}

async function handleLogout(toast = true, notifyServer = true) {
    if (notifyServer && adminState.csrfToken) {
        try {
            await apiFetch("/api/admin/logout", { method: "POST" });
        } catch {
            // Clear UI state regardless
        }
    }
    adminState.csrfToken = "";
    try { localStorage.removeItem("mosa_admin_token_v1"); } catch { /* ignore */ }
    document.getElementById("admin-app")?.classList.add("hidden");
    document.getElementById("admin-login-screen")?.classList.remove("hidden");
    if (toast) showAdminToast(adminState.lang === "ar" ? "تم تسجيل الخروج وإبطال الجلسة" : "Signed out & session revoked");
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        localStorage.removeItem("mosa_admin_token_v1");
        const th = localStorage.getItem(STORAGE_THEME_KEY) || "dark";
        applyAdminTheme(th);
        const lg = localStorage.getItem(STORAGE_LANG_KEY) || "ar";
        adminState.lang = lg === "en" ? "en" : "ar";
    } catch { /* ignore */ }

    applyAdminLang(adminState.lang);

    document.getElementById("toggle-pass-vis")?.addEventListener("click", () => {
        const inp = document.getElementById("login-password");
        if (inp) inp.type = inp.type === "password" ? "text" : "password";
    });

    document.getElementById("admin-login-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const errEl = document.getElementById("login-error");
        const btn = document.getElementById("login-submit-btn");
        const pw = document.getElementById("login-password")?.value || "";
        if (errEl) errEl.classList.add("hidden");
        if (btn) btn.disabled = true;

        try {
            const res = await apiFetch("/api/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) });
            adminState.csrfToken = res.csrfToken || "";
            const pwInput = document.getElementById("login-password");
            if (pwInput) pwInput.value = "";
            showDashboardShell();
            await loadOverviewData();
        } catch (err) {
            if (errEl) {
                errEl.textContent = err.message || (adminState.lang === "ar" ? "كلمة المرور غير صحيحة" : "Invalid credentials");
                errEl.classList.remove("hidden");
            }
        } finally {
            if (btn) btn.disabled = false;
        }
    });

    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.getElementById("sidebar-open-btn")?.addEventListener("click", openMobileSidebar);
    document.getElementById("sidebar-close-btn")?.addEventListener("click", closeMobileSidebar);
    document.getElementById("sidebar-backdrop")?.addEventListener("click", closeMobileSidebar);
    document.getElementById("admin-logout-btn")?.addEventListener("click", () => handleLogout(true, true));
    document.getElementById("admin-refresh-btn")?.addEventListener("click", () => loadOverviewData().catch(e => showAdminToast(e.message, "err")));
    document.getElementById("admin-lang-btn")?.addEventListener("click", () => applyAdminLang(adminState.lang === "ar" ? "en" : "ar"));
    document.getElementById("admin-theme-btn")?.addEventListener("click", () => applyAdminTheme(document.documentElement.classList.contains("dark") ? "light" : "dark"));
    document.getElementById("open-manual-booking-btn")?.addEventListener("click", openManualBookingModal);

    document.getElementById("admin-global-search")?.addEventListener("input", e => {
        adminState.searchQuery = e.target.value;
        if (adminState.activeTab === "bookings" || adminState.activeTab === "customers") {
            renderActiveTab();
        }
    });
    document.getElementById("admin-global-search")?.addEventListener("keydown", e => {
        if (e.key === "Enter" && adminState.activeTab !== "bookings" && adminState.activeTab !== "customers") {
            switchTab("bookings");
        }
    });

    document.getElementById("admin-modal-close")?.addEventListener("click", closeModal);
    document.getElementById("admin-modal-backdrop")?.addEventListener("click", closeModal);
    window.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

    // Restore HttpOnly session cleanly if active
    try {
        const sess = await apiFetch("/api/admin/session");
        if (sess && sess.ok && sess.csrfToken) {
            adminState.csrfToken = sess.csrfToken;
            showDashboardShell();
            await loadOverviewData();
        }
    } catch {
        // Stay cleanly on login screen
    }
});
