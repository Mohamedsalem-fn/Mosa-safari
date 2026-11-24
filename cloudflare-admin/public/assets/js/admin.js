/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "./data/trips.js";

const STORAGE_LANG_KEY = "mosa_admin_lang_v1";
const STORAGE_THEME_KEY = "mosa_admin_theme_v1";

const IMAGE_CHOICES = [
    { value: "assets/images/hero-atv-sunset.jpg", label: "ATV Quad Sunset (Hero)" },
    { value: "assets/images/safari-night-stars.jpg", label: "Night 5-in-1 & Stargazing" },
    { value: "assets/images/safari-nabq-buggy.jpg", label: "Nabq Reserve & Dune Buggy" },
    { value: "assets/images/safari-canyon-dahab.jpg", label: "Colored Canyon & Dahab" }
];

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
        confirm_reset_tours: "استعادة الـ 8 رحلات الافتراضية وحذف التعديلات المخصصة؟",
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
                                <div class="text-[11px] opacity-75">${b.tripTime === "evening" ? "🌙 " + t("slot_evening") : "☀️ " + t("slot_morning")}</div>
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
                return `
                <article class="rounded-3xl bg-white dark:bg-carbon-900 border ${isActive ? 'border-carbon-900/10 dark:border-white/10' : 'border-rose-500/40 opacity-75'} overflow-hidden flex flex-col">
                    <div class="relative h-40 bg-carbon-950">
                        <img src="${esc(trip.img)}" alt="${esc(trip.titleEn)}" class="w-full h-full object-cover opacity-85">
                        <div class="absolute inset-0 bg-gradient-to-t from-carbon-950 via-transparent to-carbon-950/30"></div>
                        <span class="absolute top-3 start-3 px-2.5 py-1 rounded-lg text-[10px] font-black ${isActive ? 'bg-sea text-carbon-950' : 'bg-rose-600 text-white'}">${isActive ? (isAr ? 'مفعّل بالموقع' : 'LIVE') : (isAr ? 'مخفي' : 'HIDDEN')}</span>
                        <span class="absolute top-3 end-3 px-2.5 py-1 rounded-lg bg-carbon-950/80 text-champagne text-xs font-black">★ ${trip.rating}</span>
                        <div class="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
                            <div>
                                <div class="text-[10px] opacity-75">${esc(trip.vehicle)}</div>
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
                        <div class="flex items-center gap-2 pt-1">
                            <button type="button" data-edit-tour="${idx}" class="flex-1 py-2 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 font-black text-xs transition">${t("edit_btn")}</button>
                            <button type="button" data-toggle-tour="${idx}" class="px-3 py-2 rounded-xl border border-carbon-900/15 dark:border-white/15 text-xs font-black hover:border-champagne transition">${isActive ? (isAr ? "إخفاء" : "Hide") : (isAr ? "تفعيل" : "Show")}</button>
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

function openModal(title, subtitle, bodyHtml, footerHtml) {
    const m = document.getElementById("admin-modal");
    if (!m) return;
    document.getElementById("admin-modal-title").textContent = title;
    document.getElementById("admin-modal-subtitle").textContent = subtitle || "";
    document.getElementById("admin-modal-body").innerHTML = bodyHtml;
    document.getElementById("admin-modal-footer").innerHTML = footerHtml;
    m.classList.remove("hidden");
}

function closeModal() {
    document.getElementById("admin-modal")?.classList.add("hidden");
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

function openTourEditorModal(idx) {
    const isAr = adminState.lang === "ar";
    const list = effectiveTrips().map(x => ({ ...x }));
    const isNew = idx < 0;
    const item = isNew ? {
        id: "sharm-custom-" + Date.now().toString(36),
        category: "atv",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleAr: "",
        titleEn: "",
        titleIt: "",
        titleRu: "",
        fromPrice: 15,
        adultPrice: 30,
        duration: "3 ساعات",
        durationEn: "3 hours",
        durationIt: "3 ore",
        durationRu: "3 часа",
        rating: 4.9,
        badge: "جديد",
        vehicle: "ATV Quad",
        img: IMAGE_CHOICES[0].value,
        descAr: "",
        descEn: "",
        descIt: "",
        descRu: "",
        active: true
    } : list[idx];

    const bodyHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div><label class="block font-extrabold mb-1">${isAr ? "العنوان (عربي)" : "Title (AR)"}</label><input id="tr-tar" type="text" value="${esc(item.titleAr)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">Title (EN)</label><input id="tr-ten" type="text" value="${esc(item.titleEn)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">Title (IT)</label><input id="tr-tit" type="text" value="${esc(item.titleIt)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">Title (RU)</label><input id="tr-tru" type="text" value="${esc(item.titleRu)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "السعر يبدأ من ($)" : "From Price ($)"}</label><input id="tr-from" type="number" step="0.01" value="${item.fromPrice}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "سعر الفرد الكامل ($)" : "Adult Price ($)"}</label><input id="tr-adult" type="number" step="0.01" value="${item.adultPrice}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الفئة" : "Category"}</label>
                <select id="tr-cat" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                    <option value="atv" ${item.category === "atv" ? "selected" : ""}>ATV & Buggy</option>
                    <option value="nabq" ${item.category === "nabq" ? "selected" : ""}>Nabq Reserve</option>
                    <option value="night" ${item.category === "night" ? "selected" : ""}>Night & Stars</option>
                    <option value="canyon" ${item.category === "canyon" ? "selected" : ""}>Canyon & Dahab</option>
                </select>
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "التقييم (★)" : "Rating"}</label><input id="tr-rate" type="number" step="0.1" max="5" min="1" value="${item.rating}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-black"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "المركبة" : "Vehicle"}</label><input id="tr-veh" type="text" value="${esc(item.vehicle)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">${isAr ? "الصورة" : "Cover Image"}</label>
                <select id="tr-img" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold">
                    ${IMAGE_CHOICES.map(ic => `<option value="${ic.value}" ${item.img === ic.value ? "selected" : ""}>${ic.label}</option>`).join("")}
                </select>
            </div>
            <div><label class="block font-extrabold mb-1">${isAr ? "المدة (عربي)" : "Duration (AR)"}</label><input id="tr-dur" type="text" value="${esc(item.duration)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div><label class="block font-extrabold mb-1">Duration (EN)</label><input id="tr-duren" type="text" value="${esc(item.durationEn)}" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 font-bold"></div>
            <div class="sm:col-span-2"><label class="block font-extrabold mb-1">${isAr ? "الوصف (عربي)" : "Description (AR)"}</label><textarea id="tr-dar" rows="2" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15">${esc(item.descAr)}</textarea></div>
            <div class="sm:col-span-2"><label class="block font-extrabold mb-1">Description (EN)</label><textarea id="tr-den" rows="2" class="w-full px-3 py-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15">${esc(item.descEn)}</textarea></div>
        </div>
    `;

    openModal(isNew ? t("add_tour") : t("edit_btn"), item.id, bodyHtml, `<button id="tr-save" type="button" class="px-5 py-2.5 rounded-xl bg-champagne text-carbon-950 font-black text-xs">${t("save")}</button>`);

    document.getElementById("tr-save")?.addEventListener("click", async () => {
        item.titleAr = document.getElementById("tr-tar").value.trim() || item.titleEn;
        item.titleEn = document.getElementById("tr-ten").value.trim() || item.titleAr;
        item.titleIt = document.getElementById("tr-tit").value.trim() || item.titleEn;
        item.titleRu = document.getElementById("tr-tru").value.trim() || item.titleEn;
        item.fromPrice = Number(document.getElementById("tr-from").value) || 10;
        item.adultPrice = Number(document.getElementById("tr-adult").value) || 20;
        item.category = document.getElementById("tr-cat").value;
        item.rating = Number(document.getElementById("tr-rate").value) || 4.8;
        item.vehicle = document.getElementById("tr-veh").value.trim();
        item.img = document.getElementById("tr-img").value;
        item.duration = document.getElementById("tr-dur").value.trim();
        item.durationEn = document.getElementById("tr-duren").value.trim();
        item.descAr = document.getElementById("tr-dar").value.trim();
        item.descEn = document.getElementById("tr-den").value.trim();

        if (isNew) list.push(item); else list[idx] = item;
        try {
            const res = await apiFetch("/api/admin/trips", { method: "PUT", body: JSON.stringify({ trips: list }) });
            adminState.overview.trips = res.trips;
            closeModal();
            updateNavBadges();
            renderActiveTab();
            showAdminToast(isAr ? "تم حفظ الرحلة ومزامنتها ✓" : "Tour saved & synced ✓");
        } catch (err) { showAdminToast(err.message, "err"); }
    });
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
