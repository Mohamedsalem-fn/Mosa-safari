/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

const SUPPORTED_LANGS = ["ar", "en", "it", "ru"];
function normalizeSafariTerms(text, targetLang) {
    let out = String(text || "");
    if (!out) return out;
    if (targetLang === "en") {
        out = out
            .replace(/\bBeach Buggy\b/gi, "ATV Quad")
            .replace(/^Move\s+(\d{1,2}:\d{2})/i, "Departs $1")
            .replace(/(\d{1,2}:\d{2})\s*ص\b/g, "$1 AM")
            .replace(/(\d{1,2}:\d{2})\s*م\b/g, "$1 PM");
    } else if (targetLang === "it") {
        out = out
            .replace(/\bBeach Buggy\b/gi, "Quad ATV")
            .replace(/^Spostati\s+(\d{1,2}:\d{2})/i, "Partenza $1")
            .replace(/(\d{1,2}:\d{2})\s*ص\b/g, "$1 AM")
            .replace(/(\d{1,2}:\d{2})\s*م\b/g, "$1 PM");
    } else if (targetLang === "ru") {
        out = out
            .replace(/\bBeach Buggy\b/gi, "квадроцикл ATV")
            .replace(/^Двигаться\s+(\d{1,2}:\d{2})/iu, "Выезд $1")
            .replace(/(\d{1,2}:\d{2})\s*ص\b/g, "$1")
            .replace(/(\d{1,2}:\d{2})\s*م\b/g, "$1");
    }
    return out.trim();
}

async function translateSingleText(text, sourceLang, targetLang) {
    const raw = String(text ?? "").trim();
    if (!raw) return "";
    if (/^[\d\s.,:%+\-–—$€★🕒🕓🕟🕠🕗🕣🕒🕞🕔🕠]+$/u.test(raw)) return raw;

    try {
        const q = encodeURIComponent(raw);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${q}`;
        const res = await fetch(url, { headers: { "User-Agent": "MosaSafariStudio/1.0" } });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data?.[0])) {
                const combined = data[0].map(seg => seg?.[0] || "").join("");
                if (combined.trim()) return normalizeSafariTerms(combined, targetLang);
            }
        }
    } catch {
        // Fallback to MyMemory below
    }

    try {
        const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(raw)}&langpair=${encodeURIComponent(sourceLang)}|${encodeURIComponent(targetLang)}`;
        const mmRes = await fetch(mmUrl);
        if (mmRes.ok) {
            const mmData = await mmRes.json();
            const txt = mmData?.responseData?.translatedText;
            if (txt) return normalizeSafariTerms(txt, targetLang);
        }
    } catch {
        // Return original as ultimate fallback
    }
    return raw;
}

async function translateStringArrayBatch(strings, sourceLang, targetLang) {
    if (!strings.length) return [];
    try {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}`;
        const body = strings.map(s => `q=${encodeURIComponent(s)}`).join("&");
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "MosaSafariStudio/1.0"
            },
            body
        });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length === strings.length) {
                return data.map((item, idx) => {
                    const txt = Array.isArray(item) ? String(item[0] ?? "") : String(item ?? "");
                    return txt.trim() ? normalizeSafariTerms(txt, targetLang) : strings[idx];
                });
            }
        }
    } catch {
        // Fall through to single-text calls
    }

    return Promise.all(strings.map(s => translateSingleText(s, sourceLang, targetLang)));
}

function collectTranslatableStrings(items) {
    const unique = [];
    const indexMap = new Map();
    const register = val => {
        const s = String(val ?? "").trim();
        if (!s || /^[\d\s.,:%+\-–—$€★🕒🕓🕟🕠🕗🕣🕒🕞🕔🕠]+$/u.test(s)) return null;
        if (!indexMap.has(s)) {
            indexMap.set(s, unique.length);
            unique.push(s);
        }
        return indexMap.get(s);
    };

    register(items.title);
    register(items.badge);
    register(items.duration);
    register(items.departureWindow);
    register(items.subtitle);
    register(items.desc);
    register(items.seoTitle);
    register(items.seoDesc);
    for (const key of ["highlights", "includes", "excludes", "bring", "routeLabels"]) {
        if (Array.isArray(items[key])) items[key].forEach(register);
    }
    if (Array.isArray(items.itinerary)) {
        for (const st of items.itinerary) {
            register(st?.time);
            register(st?.title);
            register(st?.desc);
        }
    }
    return { unique, indexMap };
}

export async function translateTourItems(sourceLang, targetLangs, items) {
    const src = SUPPORTED_LANGS.includes(sourceLang) ? sourceLang : "ar";
    const targets = (Array.isArray(targetLangs) ? targetLangs : SUPPORTED_LANGS)
        .filter(l => SUPPORTED_LANGS.includes(l) && l !== src);

    const { unique, indexMap } = collectTranslatableStrings(items || {});
    const translations = {};

    await Promise.all(targets.map(async tl => {
        const translatedList = [];
        for (let i = 0; i < unique.length; i += 30) {
            const slice = unique.slice(i, i + 30);
            const resSlice = await translateStringArrayBatch(slice, src, tl);
            translatedList.push(...resSlice);
        }

        const lookup = val => {
            const s = String(val ?? "").trim();
            if (!s) return "";
            const idx = indexMap.get(s);
            return idx !== undefined ? (translatedList[idx] ?? s) : s;
        };

        const out = {
            title: lookup(items.title),
            badge: lookup(items.badge),
            duration: lookup(items.duration),
            departureWindow: lookup(items.departureWindow),
            subtitle: lookup(items.subtitle),
            desc: lookup(items.desc),
            seoTitle: lookup(items.seoTitle),
            seoDesc: lookup(items.seoDesc),
            highlights: Array.isArray(items.highlights) ? items.highlights.map(lookup).filter(Boolean) : [],
            includes: Array.isArray(items.includes) ? items.includes.map(lookup).filter(Boolean) : [],
            excludes: Array.isArray(items.excludes) ? items.excludes.map(lookup).filter(Boolean) : [],
            bring: Array.isArray(items.bring) ? items.bring.map(lookup).filter(Boolean) : [],
            routeLabels: Array.isArray(items.routeLabels) ? items.routeLabels.map(lookup) : [],
            itinerary: Array.isArray(items.itinerary)
                ? items.itinerary.map((st, idx) => ({
                    step: String(st?.step || String(idx + 1).padStart(2, "0")),
                    time: lookup(st?.time),
                    title: lookup(st?.title),
                    desc: lookup(st?.desc)
                }))
                : []
        };
        translations[tl] = out;
    }));

    return translations;
}

export function decodeBase64ToBytes(b64) {
    const clean = String(b64 || "").replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
    const bin = atob(clean);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
}
