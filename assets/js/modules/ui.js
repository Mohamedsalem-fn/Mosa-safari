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
    state.heroSlideIdx = idx;
    const img = document.getElementById("hero-showcase-img");
    if (!img) return;
    const nextSrc = new URL(s.img, document.baseURI).href;
    if (img.src !== nextSrc) {
        const ghost = img.cloneNode();
        ghost.removeAttribute("id");
        ghost.className = "hero-xfade";
        ghost.setAttribute("aria-hidden", "true");
        ghost.style.transform = getComputedStyle(img).transform;
        img.parentNode.insertBefore(ghost, img.nextSibling);
        ghost.addEventListener("animationend", () => ghost.remove(), { once: true });
        setTimeout(() => ghost.remove(), 1600);

        img.classList.remove("is-switching");
        void img.offsetWidth;
        img.src = s.img;
        img.classList.add("is-switching");
    }
    const tag = document.getElementById("hero-showcase-tag");
    const title = document.getElementById("hero-showcase-title");
    const lang = state.lang || "ar";
    if (tag) tag.textContent = typeof s.tag === "object" ? (s.tag[lang] || s.tag.en) : s.tag;
    if (title) title.textContent = typeof s.title === "object" ? (s.title[lang] || s.title.en) : s.title;
    [tag, title].forEach(el => {
        if (!el) return;
        el.classList.remove("caption-in");
        void el.offsetWidth;
        el.classList.add("caption-in");
    });
    document.querySelectorAll(".hero-thumb").forEach((el, i) => {
        el.classList.toggle("border-champagne", i === idx);
        el.classList.toggle("border-transparent", i !== idx);
        el.classList.toggle("opacity-70", i !== idx);
    });
}

export function switchHubTab(tab) {
    document.getElementById("hub-panel-prices")?.classList.toggle("hidden", tab !== "prices");
    document.getElementById("hub-panel-faq")?.classList.toggle("hidden", tab !== "faq");
    const pBtn = document.getElementById("hub-tab-prices");
    const fBtn = document.getElementById("hub-tab-faq");
    if (pBtn) {
        pBtn.className = tab === "prices"
            ? "px-4 py-2 rounded-lg text-xs font-extrabold bg-champagne text-carbon-950 transition"
            : "px-4 py-2 rounded-lg text-xs font-extrabold border border-carbon-900/15 dark:border-white/15 transition";
    }
    if (fBtn) {
        fBtn.className = tab === "faq"
            ? "px-4 py-2 rounded-lg text-xs font-extrabold bg-champagne text-carbon-950 transition"
            : "px-4 py-2 rounded-lg text-xs font-extrabold border border-carbon-900/15 dark:border-white/15 transition";
    }
}

export function initParticles() {
    const c = document.getElementById("desert-particles");
    if (!c) return;
    const ctx = c.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hero = c.parentElement;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, dpr = 1, motes = [], running = false, inView = true, raf = 0;

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 48;
    const sctx = sprite.getContext("2d");
    const g = sctx.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, "rgba(255,236,190,1)");
    g.addColorStop(0.25, "rgba(237,210,155,0.55)");
    g.addColorStop(1, "rgba(217,179,108,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 48, 48);

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = c.offsetWidth;
        h = c.offsetHeight;
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.max(36, Math.min(110, Math.round((w * h) / 15000)));
        motes = Array.from({ length: count }, () => {
            const z = Math.random() * 0.8 + 0.2;
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                z,
                size: (Math.random() * 7 + 4) * z,
                bx: (Math.random() * 0.22 + 0.04) * z,
                by: -(Math.random() * 0.12 + 0.02) * z,
                vx: 0,
                vy: 0,
                a: Math.random() * 0.5 + 0.25,
                ph: Math.random() * Math.PI * 2
            };
        });
        if (reduce) draw(0);
    }

    function draw(t) {
        ctx.clearRect(0, 0, w, h);
        const R = 150;
        for (const m of motes) {
            const dx = m.x - mouse.x;
            const dy = m.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R && d2 > 1) {
                const d = Math.sqrt(d2);
                const f = (1 - d / R) * 0.55 * m.z;
                m.vx += (dx / d) * f;
                m.vy += (dy / d) * f;
            }
            m.vx *= 0.94;
            m.vy *= 0.94;
            m.x += m.bx + m.vx + Math.sin(t / 1800 + m.ph) * 0.12 * m.z;
            m.y += m.by + m.vy + Math.cos(t / 2300 + m.ph) * 0.08 * m.z;
            if (m.x > w + 20) m.x = -20;
            if (m.x < -20) m.x = w + 20;
            if (m.y < -20) m.y = h + 20;
            if (m.y > h + 20) m.y = -20;
            ctx.globalAlpha = m.a * (0.65 + 0.35 * Math.sin(t / 900 + m.ph));
            ctx.drawImage(sprite, m.x - m.size, m.y - m.size, m.size * 2, m.size * 2);
        }
        ctx.globalAlpha = 1;
    }

    function loop(t) {
        if (!running) return;
        draw(t);
        raf = requestAnimationFrame(loop);
    }
    function start() {
        if (running || reduce || !inView || document.hidden) return;
        running = true;
        raf = requestAnimationFrame(loop);
    }
    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }

    hero.addEventListener("pointermove", e => {
        const r = c.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => {
            inView = e.isIntersecting;
            inView ? start() : stop();
        }).observe(hero);
    }
    window.addEventListener("resize", resize);
    resize();
    start();
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
    if (!I18N[lang]) lang = "ar";
    state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (I18N[lang].doc_title) document.title = I18N[lang].doc_title;

    const sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;
    const aiSel = document.getElementById("ai-lang-select");
    if (aiSel) aiSel.value = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const k = el.dataset.i18n;
        if (I18N[lang][k]) el.textContent = I18N[lang][k];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const k = el.dataset.i18nPlaceholder;
        if (I18N[lang][k]) el.placeholder = I18N[lang][k];
    });

    // Sync active hero slide caption with the selected language
    const slide = HERO_SLIDES[state.heroSlideIdx || 0];
    if (slide) {
        const tag = document.getElementById("hero-showcase-tag");
        const title = document.getElementById("hero-showcase-title");
        if (tag && typeof slide.tag === "object") tag.textContent = slide.tag[lang] || slide.tag.en;
        if (title && typeof slide.title === "object") title.textContent = slide.title[lang] || slide.title.en;
    }

    if (onLanguageApplied) onLanguageApplied();
}

export function detectLanguageByCountry(onLanguageApplied) {
    const saved = safeGetStorage("mosa_lang");
    if (saved && I18N[saved]) {
        applyLanguage(saved, onLanguageApplied);
        return;
    }
    applyLanguage("ar", onLanguageApplied);
}
