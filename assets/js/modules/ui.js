/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { HERO_SLIDES } from "../data/trips.js";
import { I18N } from "../data/i18n.js";
import { state, safeGetStorage } from "../state.js";

export function showToast(msg, type = "success") {
    const c = document.getElementById("toast-container");
    if (!c) return;
    const el = document.createElement("div");
    el.className = `${type === "error" ? "bg-rose-600 text-white" : "bg-champagne text-carbon-950"} px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-black pointer-events-auto`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

export function setHeroPreview(idx) {
    const s = HERO_SLIDES[idx];
    if (!s) return;
    document.getElementById("hero-showcase-img").src = s.img;
    document.getElementById("hero-showcase-tag").textContent = s.tag;
    document.getElementById("hero-showcase-title").textContent = s.title;
    document.querySelectorAll(".hero-thumb").forEach((el, i) => {
        el.classList.toggle("border-champagne", i === idx);
        el.classList.toggle("border-transparent", i !== idx);
        el.classList.toggle("opacity-70", i !== idx);
    });
}

export function switchHubTab(tab) {
    document.getElementById("hub-panel-prices").classList.toggle("hidden", tab !== "prices");
    document.getElementById("hub-panel-faq").classList.toggle("hidden", tab !== "faq");
    document.getElementById("hub-tab-prices").className = tab === "prices"
        ? "px-4 py-2 rounded-lg text-xs font-extrabold bg-champagne text-carbon-950 transition"
        : "px-4 py-2 rounded-lg text-xs font-extrabold border border-carbon-900/15 dark:border-white/15 transition";
    document.getElementById("hub-tab-faq").className = tab === "faq"
        ? "px-4 py-2 rounded-lg text-xs font-extrabold bg-champagne text-carbon-950 transition"
        : "px-4 py-2 rounded-lg text-xs font-extrabold border border-carbon-900/15 dark:border-white/15 transition";
}

export function openSeoModal() {
    document.getElementById("schema-preview").textContent = document.getElementById("schema-agency").textContent.trim();
    document.getElementById("seo-modal").classList.remove("hidden");
}

export function initParticles() {
    const c = document.getElementById("desert-particles");
    if (!c) return;
    const ctx = c.getContext("2d");
    let w, h, pts;

    function resize() {
        w = c.width = c.offsetWidth;
        h = c.height = c.offsetHeight;
        pts = Array.from({ length: 36 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.8 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.2,
            a: Math.random() * 0.4 + 0.15
        }));
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);
        for (const p of pts) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x > w) p.x = 0;
            if (p.x < 0) p.x = w;
            if (p.y > h) p.y = 0;
            if (p.y < 0) p.y = h;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(217,179,108,${p.a})`;
            ctx.fill();
        }
        requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    resize();
    tick();
}

export function initObservers() {
    const r = new IntersectionObserver(
        es => es.forEach(e => {
            if (e.isIntersecting) e.target.classList.add("visible");
        }),
        { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(el => r.observe(el));

    const cnt = new IntersectionObserver(
        es => es.forEach(e => {
            if (!e.isIntersecting || e.target.dataset.done) return;
            e.target.dataset.done = "1";
            const t = +e.target.dataset.target;
            const sfx = e.target.dataset.suffix || "";
            let cur = 0;
            const step = Math.max(1, Math.ceil(t / 40));
            const tm = setInterval(() => {
                cur += step;
                if (cur >= t) {
                    cur = t;
                    clearInterval(tm);
                }
                e.target.textContent = cur.toLocaleString() + sfx;
            }, 24);
        }),
        { threshold: 0.3 }
    );
    document.querySelectorAll(".counter").forEach(el => cnt.observe(el));
}

export function applyLanguage(lang, onLanguageApplied) {
    if (!I18N[lang]) lang = "en";
    state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (I18N[lang].doc_title) document.title = I18N[lang].doc_title;
    const sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const k = el.dataset.i18n;
        if (I18N[lang][k]) el.textContent = I18N[lang][k];
    });
    if (onLanguageApplied) onLanguageApplied();
}

export function detectLanguageByCountry(onLanguageApplied) {
    const saved = safeGetStorage("mosa_lang");
    if (saved && I18N[saved]) {
        applyLanguage(saved, onLanguageApplied);
        return;
    }
    const nav = (navigator.language || "ar").slice(0, 2).toLowerCase();
    applyLanguage(I18N[nav] ? nav : "ar", onLanguageApplied);
}
