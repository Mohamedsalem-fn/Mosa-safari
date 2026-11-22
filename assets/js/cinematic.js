/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

function initScrollNavbar() {
    const nav = document.getElementById("main-navbar");
    if (!nav) return;
    const onScrollChange = () => {
        nav.classList.toggle("is-scrolled", window.scrollY > 28);
    };
    window.addEventListener("scroll", onScrollChange, { passive: true });
    onScrollChange();
}

function initMagneticControls() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".magnetic").forEach(el => {
        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
            const dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
            el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        });
        el.addEventListener("pointerleave", () => {
            el.style.translate = "0px 0px";
        });
    });
}

function initCardGlowAndTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bindGlow = selector => {
        document.querySelectorAll(selector).forEach(card => {
            if (card.dataset.glowBound) return;
            card.dataset.glowBound = "1";
            card.addEventListener("pointermove", e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                card.style.setProperty("--gx", `${x}px`);
                card.style.setProperty("--gy", `${y}px`);
                if (card.classList.contains("trip-card")) {
                    const rx = ((y / r.height) - 0.5) * -5;
                    const ry = ((x / r.width) - 0.5) * 5;
                    card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
                    card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
                    card.style.setProperty("--ty", "-4px");
                }
            });
            card.addEventListener("pointerleave", () => {
                if (card.classList.contains("trip-card")) {
                    card.style.setProperty("--rx", "0deg");
                    card.style.setProperty("--ry", "0deg");
                    card.style.setProperty("--ty", "0px");
                }
            });
        });
    };

    bindGlow(".glow-card");
    bindGlow("#trips-grid > article");
    document.addEventListener("mosa:trips-rendered", () => bindGlow("#trips-grid > article"));
}

async function initAnimeV4Layer() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
        const { animate, stagger } = await import("animejs");

        // 1. Navbar & Hero entrance choreography
        animate("#main-navbar", {
            translateY: [-32, 0],
            opacity: [0, 1],
            duration: 750,
            ease: "outExpo"
        });

        animate(".hero-badge, #hero-search-form", {
            translateY: [28, 0],
            opacity: [0, 1],
            duration: 850,
            delay: stagger(140, { start: 180 }),
            ease: "outExpo"
        });

        // 2. Subtle breathing pulse on primary CTAs
        animate("#nav-book-btn, #ai-fab", {
            scale: [1, 1.035],
            duration: 2100,
            loop: true,
            alternate: true,
            ease: "inOutSine"
        });

        // 3. Staggered reveal whenever trip cards render or filter
        const animateTripCards = () => {
            const cards = document.querySelectorAll("#trips-grid > article");
            if (!cards.length) return;
            animate(cards, {
                opacity: [0, 1],
                translateY: [34, 0],
                scale: [0.97, 1],
                duration: 720,
                delay: stagger(75),
                ease: "outExpo"
            });
        };

        animateTripCards();
        document.addEventListener("mosa:trips-rendered", animateTripCards);
    } catch {
        // Fallback to CSS-only animations if offline or CDN blocked
    }
}

export function initCinematic() {
    document.documentElement.classList.add("cine-on");
    initScrollNavbar();
    initMagneticControls();
    initCardGlowAndTilt();
    initAnimeV4Layer();
}
