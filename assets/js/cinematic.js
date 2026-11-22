/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 *
 * Cinematic motion layer. Purely additive: it never touches state, i18n or the
 * booking flow, it only reacts to DOM changes made by main.js. Everything runs on
 * transform / opacity / translate with passive listeners and rAF throttling.
 */

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Run `fn` at most once per animation frame. */
function frameThrottle(fn) {
    let queued = false;
    return (...args) => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            fn(...args);
        });
    };
}

/* ------------------------------------------------------------------ */
/* 1. Floating glass header: shrink on scroll                          */
/* ------------------------------------------------------------------ */
function initNavbar() {
    const nav = document.getElementById("main-navbar");
    if (!nav) return;
    const update = frameThrottle(() => nav.classList.toggle("is-scrolled", window.scrollY > 24));
    window.addEventListener("scroll", update, { passive: true });
    update();
}

/* ------------------------------------------------------------------ */
/* 2. Magnetic controls                                                */
/* ------------------------------------------------------------------ */
function initMagnetic() {
    if (!finePointer || reduce) return;
    $$(".magnetic").forEach(el => {
        const strength = el.tagName === "SELECT" ? 0.14 : 0.28;
        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width / 2)) * strength;
            const y = (e.clientY - (r.top + r.height / 2)) * strength;
            el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
        });
        el.addEventListener("pointerleave", () => { el.style.translate = ""; });
    });
}

/* ------------------------------------------------------------------ */
/* 3. Hero depth: mouse parallax + scroll parallax banner image        */
/* ------------------------------------------------------------------ */
function initHeroDepth() {
    const hero = document.getElementById("hero");
    if (!hero || !finePointer || reduce) return;
    $$(".float-glass", hero).forEach(el => { el.dataset.depth = el.dataset.depth || "8"; });
    const layers = $$("[data-depth]", hero).map(el => ({ el, d: parseFloat(el.dataset.depth) || 0 }));
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;

    function step() {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        for (const { el, d } of layers) {
            el.style.translate = `${(cx * d).toFixed(2)}px ${(cy * d).toFixed(2)}px`;
        }
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
            requestAnimationFrame(step);
        } else {
            running = false;
        }
    }
    hero.addEventListener("pointermove", e => {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!running) {
            running = true;
            requestAnimationFrame(step);
        }
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
        tx = ty = 0;
        if (!running) {
            running = true;
            requestAnimationFrame(step);
        }
    });
}

function initScrollParallax() {
    if (reduce) return;
    const items = $$(".parallax-img");
    if (!items.length) return;
    const update = frameThrottle(() => {
        const vh = window.innerHeight;
        for (const el of items) {
            const r = el.parentElement.getBoundingClientRect();
            if (r.bottom < -100 || r.top > vh + 100) continue;
            const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1
            el.style.translate = `0 ${Math.max(-1, Math.min(1, p)) * -38}px`;
        }
    });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
}

/* ------------------------------------------------------------------ */
/* 4. Pointer glow + 3D tilt (delegated, survives re-renders)          */
/* ------------------------------------------------------------------ */
function initPointerEffects() {
    if (!finePointer) return;
    const TILT = 6;
    const sel = ".glow-card, #trips-grid > article";
    let active = null;

    const onMove = frameThrottle(e => {
        const card = e.target.closest ? e.target.closest(sel) : null;
        if (active && active !== card) resetTilt(active);
        active = card;
        if (!card) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        if (!reduce && card.matches("#trips-grid > article")) {
            card.style.setProperty("--ry", `${((px - 0.5) * 2 * TILT).toFixed(2)}deg`);
            card.style.setProperty("--rx", `${((0.5 - py) * 2 * TILT).toFixed(2)}deg`);
            card.style.setProperty("--ty", "-6px");
        }
    });
    function resetTilt(card) {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--ty", "0px");
    }
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", () => active && resetTilt(active));
}

/* ------------------------------------------------------------------ */
/* 5. Trip cards injected by main.js: staggered scroll reveal          */
/* ------------------------------------------------------------------ */
function initTripReveal() {
    const grid = document.getElementById("trips-grid");
    if (!grid) return;
    const io = "IntersectionObserver" in window
        ? new IntersectionObserver(entries => {
            const visible = entries.filter(e => e.isIntersecting);
            visible.forEach((e, i) => {
                e.target.style.setProperty("--si", i);
                e.target.classList.add("in");
                io.unobserve(e.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
        : null;

    const arm = () => {
        $$(":scope > article:not([data-cine])", grid).forEach(card => {
            card.dataset.cine = "1";
            if (io) io.observe(card);
            else card.classList.add("in");
        });
    };
    new MutationObserver(arm).observe(grid, { childList: true });
    arm();
}

/* ------------------------------------------------------------------ */
/* 6. Sliding active pill behind the city filter                       */
/* ------------------------------------------------------------------ */
function initFilterPill() {
    const wrap = $(".filter-pills");
    if (!wrap) return;
    const pill = $(".filter-pill-bg", wrap);
    const btns = $$(".city-filter-btn", wrap);
    const place = () => {
        const active = btns.find(b => b.classList.contains("bg-champagne")) || btns[0];
        if (!active || !pill) return;
        wrap.style.setProperty("--x", `${active.offsetLeft}px`);
        wrap.style.setProperty("--w", `${active.offsetWidth}px`);
        wrap.classList.add("pill-ready");
    };
    const queue = frameThrottle(place);
    const mo = new MutationObserver(queue);
    btns.forEach(b => mo.observe(b, { attributes: true, attributeFilter: ["class"] }));
    if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(queue);
        ro.observe(wrap);
        btns.forEach(b => ro.observe(b));
    }
    window.addEventListener("resize", queue);
    place();
    // First placement must not animate from x=0.
    pill.style.transition = "none";
    requestAnimationFrame(() => requestAnimationFrame(() => { pill.style.transition = ""; }));
}

/* ------------------------------------------------------------------ */
/* 7. Misc: keyboard access for the destination banner                 */
/* ------------------------------------------------------------------ */
function initA11y() {
    $$(".dest-card[role='button']").forEach(el => {
        el.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                el.click();
            }
        });
    });
}

function boot() {
    root.classList.add("cine-on");
    initNavbar();
    initMagnetic();
    initHeroDepth();
    initScrollParallax();
    initPointerEffects();
    initTripReveal();
    initFilterPill();
    initA11y();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
