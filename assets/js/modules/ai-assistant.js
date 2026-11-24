/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "../data/trips.js";
import { I18N, BADGE_I18N, AI_GREETINGS } from "../data/i18n.js";
import { state, fmtPrice } from "../state.js";
import { getTripTitle, getTripDesc, getTripDuration } from "./trips.js";
import { openBookingWithTrip, findActivePromo } from "./booking.js";
import { showToast } from "./ui.js";

function escHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getAiLang() {
    const sel = typeof document !== "undefined" ? document.getElementById("ai-lang-select") : null;
    return (sel && I18N[sel.value]) ? sel.value : (I18N[state.lang] ? state.lang : "ar");
}

function getCopy(lang = getAiLang()) {
    return AI_COPY[lang] || AI_COPY.en;
}

const AI_COPY = {
    ar: {
        ctx_guests: (a, c) => `${a} بالغ${c ? ` + ${c} طفل` : ""}`,
        ctx_morning: "الفترة الصباحية",
        ctx_evening: "الفترة المسائية",
        ctx_budget: b => `حتى ${b}`,
        ctx_clear: "مسح التفضيلات",
        book_btn: "احجز الآن",
        book_prefilled: "احجز بهذه الإعدادات",
        compare_btn: "قارن",
        calc_btn: "احسب",
        from_lbl: "من",
        adult_lbl: "للفرد",
        applied_prefill: "تم تجهيز الحجز ببياناتك تلقائياً ✓",
        promo_copied: code => `تم نسخ وتفعيل كود ${code} على حجزك ✓`,
        compare_title: "مقارنة ذكية جنباً إلى جنب",
        quote_card_title: "حسبة السعر المخصصة لك",
        quote_tours: "البرامج:",
        quote_guests: "الضيوف:",
        quote_base: "السعر الأساسي:",
        quote_group: pct => `خصم المجموعات (-${pct}%)`,
        quote_promo: (code, pct) => `كود الخصم ${code} (-${pct}%)`,
        quote_net: "الإجمالي الصافي:",
        quote_saved: s => `توفّر ${s}!`,
        quote_book_btn: "ثبّت هذا السعر واحجز الآن ←",
        quote_edit_btn: "تعديل في الحاسبة",
        promo_ticket_title: "قسيمة خصم موسى سفاري الحصرية",
        promo_ticket_sub: "خصم 20% فوري + 10% تلقائي لـ 5 أفراد فأكثر",
        promo_ticket_btn: "نسخ وتفعيل الكود في الحجز",
        quiz_step_lbl: (s, tot) => `الخطوة ${s} من ${tot}`,
        quiz_q1: "مع من تسافر إلى شرم الشيخ؟",
        quiz_q1_opts: [
            { id: "solo", title: "مسافر بمفردي", sub: "مغامرة سريعة وحماسية (فرد 1)", icon: "🏍️", adults: 1, children: 0 },
            { id: "couple", title: "شخصين / شهر عسل", sub: "أجواء غروب أو تجربة VIP (2 كبار)", icon: "🌅", adults: 2, children: 0 },
            { id: "family", title: "عائلة مع أطفال", sub: "باجي آمن ومناسب للأطفال (2 كبار + 2 طفل)", icon: "👨‍👩‍👧‍👦", adults: 2, children: 2 },
            { id: "group", title: "مجموعة أصدقاء 5+", sub: "خصم 10% تلقائي للمجموعات (5 كبار)", icon: "🎉", adults: 5, children: 0 }
        ],
        quiz_q2: "ما هو التوقيت الأفضل ليومك؟",
        quiz_q2_opts: [
            { id: "morning", title: "شروق الشمس والصباح", sub: "هواء نقي ودرجة حرارة منعشة", icon: "☀️" },
            { id: "sunset", title: "وقت الغروب الذهبي", sub: "صور بانورامية وسط الجبال", icon: "🌄" },
            { id: "night", title: "سهرة ليلية ونجوم", sub: "عشاء مشوي وتلسكوب وعرض بدوي", icon: "✨" },
            { id: "fullday", title: "رحلة اليوم الكامل", sub: "دهب والوادي الملون والبلو هول", icon: "🏝️" }
        ],
        quiz_q3: "ما نوع التجربة التي تفضلها؟",
        quiz_q3_opts: [
            { id: "scenic", title: "طبيعة واستجمام متوازن", sub: "جولات هادئة وشاي بدوي", icon: "🐪" },
            { id: "thrill", title: "إثارة وسرعة قصوى", sub: "دراجات ATV + Dune Buggy", icon: "⚡" },
            { id: "vip", title: "فخامة VIP وعشاء بحري", sub: "محمية نبق أو مأكولات بحرية", icon: "👑" }
        ],
        quiz_result_title: "الترشيح الذكي الأنسب لك",
        quiz_best_badge: "التطابق الأفضل · 98%",
        quiz_runner_badge: "خيار بديل مميز · 91%",
        quiz_group_tip: "ملاحظة: مجموعتك مؤهلة لخصم 10% إضافي + 20% بكود MOSA20!",
        quiz_book_cta: "احجز هذه التوصية الآن ←",
        quiz_chat_cta: "أضف للمحادثة",
        quiz_retake: "إعادة الاستبيان",
        qb_title: "حاسبة التكلفة الفورية بالعملة الحية",
        qb_sub: "اختر برامجك وعدد الضيوف لتعرف السعر الصافي والخصومات قبل الحجز",
        qb_pick_tours: "1. البرامج المشمولة في الحسبة:",
        qb_guests: "2. عدد المسافرين:",
        qb_adults: "البالغين (12+)",
        qb_children: "الأطفال (6-11 · 50% خصم)",
        qb_slot: "3. ميعاد الرحلة المفضل:",
        qb_morning: "صباحاً (AM)",
        qb_evening: "مساءً / الغروب (PM)",
        qb_promo_lbl: "تطبيق كود الخصم الفوري MOSA20 (-20%)",
        qb_cta: "تثبيت هذا السعر والمتابعة للحجز ←",
        voice_unsupported: "الإدخال الصوتي غير مدعوم في هذا المتصفح",
        voice_listening: "تحدث الآن... أستمع إليك",
        voice_err: "تعذر التقاط الصوت، تأكد من صلاحية الميكروفون",
        reset_done: "تم بدء محادثة ذكية جديدة مع مسح الذاكرة المؤقتة.",
        slot_morning: "الفترة الصباحية (شروق/صباح)",
        slot_evening: "الفترة المسائية (غروب/ليل)",
        msgs: {
            greeting: "أهلاً بك! يسعدني مساعدتك في تخطيط مغامرة مثالية في شرم الشيخ. أخبرني فقط: كم عددكم؟ وهل تفضلون الصباح أم الغروب؟",
            compare_intro: "إليك مقارنة مباشرة لأفضل خيارين مطابقين لطلبك بالأسعار اللحظية:",
            quote_intro: (title, guestsText) => `حسبت لك التكلفة الدقيقة لـ **${title}** (${guestsText}):`,
            booking_intro: (title) => `ممتاز! جهزت لك طلب الحجز لـ **${title}** مع كافة التفضيلات التي ذكرتها. اضغط الزر بالأسفل لفتح الاستمارة فوراً:`,
            budget_intro: (maxText) => `بحثت في كل برامج شرم الشيخ المتاحة بميزانية حتى **${maxText}** ورتبتها لك حسب القيمة والتقييم:`,
            family: "للعائلات والأطفال: الدراجات أوتوماتيك بالكامل وتُعقد تجربة قيادة قصيرة قبل التحرك، والأطفال (6-11 سنة) يحصلون على **خصم 50%** ويمكنهم الركوب بالباجي العائلي أو خلف مرافق بالغ بأمان تام:",
            couple: "للأزواج وشهر العسل أنصحكم بلحظة الغروب الذهبية في **جبال الصدى** أو تجربة **غسق نبق مع عشاء المأكولات البحرية** على ساحل البحر الأحمر:",
            thrill: "لعشاق السرعة والإثارة القصوى: تجربة **الإثارة المزدوجة (ATV + باجي صحراوي)** بتقييم **4.8★** تمنحك قيادة مركبتين في مسارات مفتوحة، أو جولة **VIP أسرار الصحراء** في نبق:",
            nabq: "محمية نبق الطبيعية تمتد وسط غابات المانجروف الساحلية وتصاريح الدخول مشمولة بالكامل. اختر بين البريميوم أو VIP أسرار الصحراء أو غسق نبق مع عشاء سي فود:",
            night: "سفاري شرم الشيخ الليلية **5 في 1** (6 ساعات) هي الأشهر للعائلات والسهرات: بيتش باجي + ركوب جمال + عشاء بدوي مشوي + عرض شرقي + مراقبة النجوم بالتلسكوب:",
            canyon: "مغامرة اليوم الكامل إلى **الوادي الملون والبلو هول ودهب** (10 ساعات) بسيارات جيب 4×4 تشمل المشي داخل الأخاديد، السنوركلينج في البلو هول، والغداء على البحر:",
            morning: "الرحلات الصباحية مثالية للأجواء المنعشة والنسيم النقي في صحراء سيناء! نوصي بـ **شروق الشمس بالبيتش باجي** أو انطلاق **الوادي الملون ودهب**:",
            safety: "الأمان هو أولويتنا في موسى سفاري:\n• جميع الدراجات أوتوماتيك بالكامل — **لا يُشترط رخصة قيادة** وتُعقد حصة تدريب قبل الانطلاق.\n• توفير خوذات ونظارات واقية من الرمال مع مرشد مرافق.\n• للأطفال (من 6 سنوات) يتوفر مقعد مزدوج آمن أو باجي عائلي.\n• للحوامل أو أصحاب آلام الظهر الشديدة نوصي بسيارة **جيب 4×4 مكيفة** بدلاً من الـ ATV.",
            packing: "ماذا ترتدي وتحضر معك للرحلة؟\n• **حذاء رياضي مغلق** وملابس مريحة (يفضل قطنية).\n• **نظارة شمسية + كوفية/شال بدوي** (متوفرة أيضاً عند نقطة الانطلاق).\n• **واقي شمس** وزجاجة مياه إضافية، ومعطف خفيف في ليالي الشتاء (نوفمبر–مارس).\n• لرحلة البلو هول ودهب: لا تنسَ **ملابس السباحة والمنشفة**!",
            pickup: "الاستلام والتوصيل **مجاني 100%** بسيارات مكيفة من وإلى باب جميع فنادق ومنتجعات شرم الشيخ:\nخليج نعمة · سوهو سكوير · خليج القرش (Sharks Bay) · هضبة أم السيد · محمية نبق · غاردنز باي.\nنؤكد لك ساعة التحرك الدقيقة عبر واتساب قبل الرحلة.",
            payment: "الدفع في موسى سفاري بأقصى درجات المرونة:\n• **الدفع عند الوصول (Pay on Arrival):** احجز بـ **0 مقدم** وادفع لمندوبنا يوم الرحلة كاش أو بالبطاقة.\n• **Visa / Mastercard:** متاح عبر الاستمارة الإلكترونية.\n• **إلغاء وتعديل مجاني** حتى ساعتين قبل موعد التحرك.",
            promo: code => `فعّل كود الخصم **${code}** للحصول على **خصم 20% فوري** على جميع البرامج، وعند حجز **5 أفراد فأكثر** يضيف النظام **10% خصم مجموعات تلقائياً**! اضغط على التذكرة بالأسفل لتفعيل الكود:`,
            price: "إليك أحدث الأسعار اللحظية اليوم شاملة الانتقالات من الفندق. كل البطاقات بالأسفل تتحول فوراً حسب عملتك المختارة (USD / EGP / EUR):",
            fallback: "إليك أفضل ترشيحاتنا في شرم الشيخ حالياً! يمكنك كتابة طلب أدق مثل: **\"4 كبار وطفلين مساءً\"** أو **\"ميزانية تحت 20 دولار\"** أو **\"قارن جبال الصدى ونبق\"**:"
        },
        chips: {
            default: ["احسب السعر لـ 4 أفراد", "قارن بين جبال الصدى ونبق", "ما هي نصائح الأمان والملابس؟", "فعّل خصم 20% MOSA20"],
            family: ["احسبها لـ 2 كبار وطفلين", "أرخص رحلة عائلية؟", "الاستلام من الفندق مجاني؟", "تفاصيل الدفع عند الوصول"],
            compare: ["احسب سعر الفائز لـ 3 أفراد", "أيهما أفضل للأطفال؟", "مواعيد الصباح أم المساء؟", "فعّل كود MOSA20"],
            quote: ["أضف كود MOSA20 للحسبة", "قارنها مع رحلة أخرى", "سياسة الإلغاء المجاني", "تواصل واتساب مع مرشد"]
        }
    },
    en: {
        ctx_guests: (a, c) => `${a} Adult${a > 1 ? "s" : ""}${c ? ` + ${c} Child${c > 1 ? "ren" : ""}` : ""}`,
        ctx_morning: "Morning Slot",
        ctx_evening: "Evening Slot",
        ctx_budget: b => `Under ${b}`,
        ctx_clear: "Clear Memory",
        book_btn: "Book Now",
        book_prefilled: "Book With My Setup",
        compare_btn: "Compare",
        calc_btn: "Quote",
        from_lbl: "From",
        adult_lbl: "Adult",
        applied_prefill: "Booking modal pre-filled with your choices ✓",
        promo_copied: code => `Promo ${code} copied & activated on your booking ✓`,
        compare_title: "Side-by-Side Tour Comparison",
        quote_card_title: "Your Custom Live Quote",
        quote_tours: "Tours:",
        quote_guests: "Guests:",
        quote_base: "Standard Total:",
        quote_group: pct => `Group Discount (-${pct}%)`,
        quote_promo: (code, pct) => `Promo ${code} (-${pct}%)`,
        quote_net: "Final Net Total:",
        quote_saved: s => `You save ${s}!`,
        quote_book_btn: "Lock This Price & Book ←",
        quote_edit_btn: "Customize in Calculator",
        promo_ticket_title: "Exclusive Mosa Safari Voucher",
        promo_ticket_sub: "Instant 20% OFF + automatic 10% for 5+ guests",
        promo_ticket_btn: "Copy & Apply to Booking",
        quiz_step_lbl: (s, tot) => `Step ${s} of ${tot}`,
        quiz_q1: "Who is traveling with you to Sharm El Sheikh?",
        quiz_q1_opts: [
            { id: "solo", title: "Solo Explorer", sub: "Fast-paced desert freedom (1 Adult)", icon: "🏍️", adults: 1, children: 0 },
            { id: "couple", title: "Couple / Honeymoon", sub: "Golden sunset or VIP dining (2 Adults)", icon: "🌅", adults: 2, children: 0 },
            { id: "family", title: "Family With Kids", sub: "Automatic quads & 50% kid discount (2+2)", icon: "👨‍👩‍👧‍👦", adults: 2, children: 2 },
            { id: "group", title: "Friends Group (5+)", sub: "Unlocks automatic 10% group discount", icon: "🎉", adults: 5, children: 0 }
        ],
        quiz_q2: "What is your ideal time of day?",
        quiz_q2_opts: [
            { id: "morning", title: "Sunrise & Cool Morning", sub: "Crisp desert breeze & dawn views", icon: "☀️" },
            { id: "sunset", title: "Golden Hour Sunset", sub: "Iconic mountain canyon light", icon: "🌄" },
            { id: "night", title: "Night BBQ & Stargazing", sub: "Bedouin dinner, show & telescope", icon: "✨" },
            { id: "fullday", title: "Full-Day Expedition", sub: "Colored Canyon, Blue Hole & Dahab", icon: "🏝️" }
        ],
        quiz_q3: "Pick your preferred adventure pace:",
        quiz_q3_opts: [
            { id: "scenic", title: "Scenic & Relaxed", sub: "Echo Mountains, camel trek & tea", icon: "🐪" },
            { id: "thrill", title: "Pure Adrenaline", sub: "ATV Quad + High-Speed Dune Buggy", icon: "⚡" },
            { id: "vip", title: "VIP Nature & Seafood", sub: "Nabq Mangroves or Red Sea seafood", icon: "👑" }
        ],
        quiz_result_title: "Your Tailored Safari Matches",
        quiz_best_badge: "98% Top Match",
        quiz_runner_badge: "91% Runner-Up",
        quiz_group_tip: "Bonus: Your party qualifies for 10% Group Discount + 20% MOSA20!",
        quiz_book_cta: "Book This Recommendation ←",
        quiz_chat_cta: "Send to Chat",
        quiz_retake: "Retake Quiz",
        qb_title: "Live Multi-Currency Price Builder",
        qb_sub: "Mix tours, guests & promo discounts to see your exact net price before booking",
        qb_pick_tours: "1. Included Safari Tours:",
        qb_guests: "2. Number of Travelers:",
        qb_adults: "Adults (12+)",
        qb_children: "Children (6–11 · 50% OFF)",
        qb_slot: "3. Preferred Departure Slot:",
        qb_morning: "Morning (AM)",
        qb_evening: "Evening / Sunset (PM)",
        qb_promo_lbl: "Apply instant promo code MOSA20 (-20%)",
        qb_cta: "Lock Quote & Continue to Booking ←",
        voice_unsupported: "Voice input is not supported in this browser",
        voice_listening: "Listening... speak now",
        voice_err: "Could not capture audio. Please check microphone permissions",
        reset_done: "Fresh concierge session started with cleared preferences.",
        slot_morning: "Morning Slot (Sunrise / AM)",
        slot_evening: "Evening Slot (Sunset / PM)",
        msgs: {
            greeting: "Hi there! I'd love to plan your Sinai desert adventure. Tell me your group size, morning/evening preference, or budget — or try the **Trip Matcher** tab above!",
            compare_intro: "Here is a live side-by-side comparison of the top 2 matching tours:",
            quote_intro: (title, guestsText) => `Here is your exact live calculation for **${title}** (${guestsText}):`,
            booking_intro: (title) => `All set! I pre-loaded **${title}** with your group preferences. Tap below to open the booking form at Traveler Details:`,
            budget_intro: maxText => `Here are the best Sharm El Sheikh safaris matching your budget up to **${maxText}**:`,
            family: "For families & kids: all quads are fully automatic with a safety briefing before departure. Kids aged **6–11 enjoy 50% OFF** and can ride a family dune buggy or double quad with an adult:",
            couple: "For couples & honeymoons, golden hour at **Echo Mountains** or the **Nabq Twilight Seafood Dusk** creates unforgettable Red Sea sunset memories:",
            thrill: "For adrenaline lovers: **Double Thrill (4.8★)** lets you drive both an ATV Quad and a high-speed Dune Buggy, or upgrade to **Nabq Desert Secrets VIP**:",
            nabq: "**Nabq Protected Area** tours include coastal mangroves and official reserve permits — choose Classic Reserve, VIP Desert Secrets, or Twilight Seafood Dusk:",
            night: "Our **Night 5-in-1 Safari & Stargazing** (6 hours) combines quad biking, camel trek, BBQ Bedouin dinner, folkloric show, and telescope stargazing:",
            canyon: "The full-day **Colored Canyon, Blue Hole & Dahab** 4x4 Jeep tour (10 hours) includes canyon hiking, Blue Hole snorkeling, seaside lunch, and Dahab bazaar:",
            morning: "Morning tours offer crisp air and quieter desert trails! We recommend **Sunrise ATV & Camel Trek** or the early departure to **Colored Canyon & Dahab**:",
            safety: "Safety & Comfort Guarantees:\n• **No driver's license needed** — automatic ATV quads with a practice test before riding.\n• **Helmets, goggles & pro guides** are included on every tour.\n• Kids 6+ can ride safely as a passenger or inside a 4x4 / Dune Buggy.\n• Pregnant travelers or back conditions should pick our **A/C 4x4 Jeep** tours.",
            packing: "What to wear & bring:\n• **Closed-toe sneakers** and breathable casual clothing.\n• **Sunglasses & Bedouin desert scarf** (also available at base camp).\n• Sunscreen, light jacket on winter evenings (Nov–Mar), plus **swimwear & towel** for Dahab/Blue Hole.",
            pickup: "**Free round-trip hotel transfers** in A/C vehicles across all Sharm El Sheikh areas:\nNaama Bay · Sharks Bay · Soho Square · Nabq Bay · Hadaba · Gardens Bay.\nExact pickup time is sent via WhatsApp before departure.",
            payment: "Flexible Checkout Options:\n• **Pay on Arrival:** Reserve with **$0 upfront** and pay cash or card at hotel pickup.\n• **Visa / Mastercard** checkout available online.\n• **Free cancellation & rescheduling** up to 2 hours before pickup.",
            promo: code => `Apply promo code **${code}** for an instant **20% OFF** any tour — plus parties of **5+ guests** receive an automatic **10% group discount** on top! Tap the voucher below:`,
            price: "Here are today's live rates in your active currency including free hotel pickup. Tap any card to book or calculate:",
            fallback: "Here are Sharm El Sheikh's top-rated tours right now! Try asking e.g. **\"Quote 4 adults sunset\"**, **\"Under $20\"**, or **\"Compare Echo vs Double Thrill\"**:"
        },
        chips: {
            default: ["Quote 4 adults & 2 kids", "Compare Echo vs Double Thrill", "Safety & what to wear?", "Activate 20% MOSA20"],
            family: ["Calculate 2 adults + 2 kids", "Cheapest family tour?", "Free hotel pickup zones?", "How Pay on Arrival works"],
            compare: ["Quote the winner for 3 adults", "Best one for kids?", "Morning vs Sunset slot?", "Apply MOSA20 code"],
            quote: ["Apply MOSA20 to my quote", "Compare with another tour", "Cancellation policy", "Chat on WhatsApp"]
        }
    },
    it: {
        ctx_guests: (a, c) => `${a} Adult${a > 1 ? "i" : "o"}${c ? ` + ${c} Bambin${c > 1 ? "i" : "o"}` : ""}`,
        ctx_morning: "Turno Mattina",
        ctx_evening: "Turno Sera",
        ctx_budget: b => `Fino a ${b}`,
        ctx_clear: "Cancella",
        book_btn: "Prenota Ora",
        book_prefilled: "Prenota Con Scelte",
        compare_btn: "Confronta",
        calc_btn: "Calcola",
        from_lbl: "Da",
        adult_lbl: "Adulto",
        applied_prefill: "Modulo precompilato con le tue preferenze ✓",
        promo_copied: code => `Codice ${code} copiato e attivato ✓`,
        compare_title: "Confronto Diretto dei Tour",
        quote_card_title: "Il Tuo Preventivo Live",
        quote_tours: "Tour:",
        quote_guests: "Ospiti:",
        quote_base: "Totale Standard:",
        quote_group: pct => `Sconto Gruppo (-${pct}%)`,
        quote_promo: (code, pct) => `Codice ${code} (-${pct}%)`,
        quote_net: "Totale Netto:",
        quote_saved: s => `Risparmi ${s}!`,
        quote_book_btn: "Blocca Prezzo e Prenota ←",
        quote_edit_btn: "Modifica nel Calcolatore",
        promo_ticket_title: "Voucher Esclusivo Mosa Safari",
        promo_ticket_sub: "20% subito + 10% automatico per 5+ ospiti",
        promo_ticket_btn: "Copia e Applica alla Prenotazione",
        quiz_step_lbl: (s, tot) => `Passo ${s} di ${tot}`,
        quiz_q1: "Con chi viaggi a Sharm El Sheikh?",
        quiz_q1_opts: [
            { id: "solo", title: "Viaggiatore Singolo", sub: "Libertà nel deserto (1 Adulto)", icon: "🏍️", adults: 1, children: 0 },
            { id: "couple", title: "Coppia / Luna di Miele", sub: "Tramonto romantico o VIP (2 Adulti)", icon: "🌅", adults: 2, children: 0 },
            { id: "family", title: "Famiglia con Bambini", sub: "Quad automatici e -50% bimbi (2+2)", icon: "👨‍👩‍👧‍👦", adults: 2, children: 2 },
            { id: "group", title: "Gruppo Amici (5+)", sub: "Sconto gruppo automatico 10%", icon: "🎉", adults: 5, children: 0 }
        ],
        quiz_q2: "Qual è il momento migliore della giornata?",
        quiz_q2_opts: [
            { id: "morning", title: "Alba e Mattina", sub: "Aria fresca nel deserto", icon: "☀️" },
            { id: "sunset", title: "Ora d'Oro al Tramonto", sub: "Luci spettacolari tra i canyon", icon: "🌄" },
            { id: "night", title: "Notte BBQ & Stelle", sub: "Cena beduina e telescopio", icon: "✨" },
            { id: "fullday", title: "Giornata Intera", sub: "Canyon Colorato, Blue Hole e Dahab", icon: "🏝️" }
        ],
        quiz_q3: "Scegli lo stile di avventura:",
        quiz_q3_opts: [
            { id: "scenic", title: "Natura & Relax", sub: "Montagne dell'Eco e tè beduino", icon: "🐪" },
            { id: "thrill", title: "Adrenalina Pura", sub: "Quad ATV + Dune Buggy veloce", icon: "⚡" },
            { id: "vip", title: "VIP & Cena di Pesce", sub: "Riserva di Nabq sul Mar Rosso", icon: "👑" }
        ],
        quiz_result_title: "I Tour Perfetti Per Te",
        quiz_best_badge: "98% Scelta Ideale",
        quiz_runner_badge: "91% Ottima Alternativa",
        quiz_group_tip: "Bonus: Hai diritto al 10% Gruppo + 20% con MOSA20!",
        quiz_book_cta: "Prenota Questo Tour ←",
        quiz_chat_cta: "Invia in Chat",
        quiz_retake: "Rifai il Test",
        qb_title: "Calcolatore Prezzo in Tempo Reale",
        qb_sub: "Seleziona tour, ospiti e sconti prima di prenotare",
        qb_pick_tours: "1. Tour Inclusi:",
        qb_guests: "2. Numero Ospiti:",
        qb_adults: "Adulti (12+)",
        qb_children: "Bambini (6–11 · -50%)",
        qb_slot: "3. Orario Preferito:",
        qb_morning: "Mattina (AM)",
        qb_evening: "Sera / Tramonto (PM)",
        qb_promo_lbl: "Applica codice sconto MOSA20 (-20%)",
        qb_cta: "Blocca Prezzo e Prenota ←",
        voice_unsupported: "Input vocale non supportato dal browser",
        voice_listening: "Ti ascolto... parla ora",
        voice_err: "Errore microfono. Verifica i permessi",
        reset_done: "Nuova sessione concierge avviata.",
        slot_morning: "Turno Mattutino (AM)",
        slot_evening: "Turno Serale / Tramonto (PM)",
        msgs: {
            greeting: "Ciao! Sono felice di aiutarti a organizzare il tuo safari a Sharm. Quanti siete e preferite mattina o tramonto?",
            compare_intro: "Ecco il confronto diretto dei due tour migliori per la tua richiesta:",
            quote_intro: (title, guestsText) => `Ecco il calcolo live per **${title}** (${guestsText}):`,
            booking_intro: title => `Perfetto! Ho preparato **${title}** con le tue preferenze. Tocca qui sotto per completare i dati:`,
            budget_intro: maxText => `I migliori tour a Sharm El Sheikh entro **${maxText}**:`,
            family: "Per famiglie e bambini: quad automatici con breve prova pratica prima di partire. I bambini **6–11 anni hanno il 50% di sconto**:",
            couple: "Per coppie e luna di miele: il **Tramonto nelle Montagne dell'Eco** o la **Cena di Pesce a Nabq** sono impareggiabili:",
            thrill: "Per chi ama la velocità: **Doppia Emozione (4.8★)** unisce Quad ATV e Dune Buggy, oppure scegli **Nabq VIP Segreti**:",
            nabq: "La **Riserva di Nabq** include permessi ufficiali e foreste di mangrovie — disponibile in versione Premium, VIP o Cena di Pesce:",
            night: "Il **Safari Notturno 5-in-1** (6 ore) include quad ATV, cammello, cena BBQ beduina, spettacolo e telescopio:",
            canyon: "La gita di un giorno al **Canyon Colorato, Blue Hole e Dahab** (10 ore) in Jeep 4x4 include trekking, snorkeling e pranzo:",
            morning: "I tour mattutini offrono aria fresca nel deserto! Consigliamo **Alba in Quad ATV** o **Canyon Colorato & Dahab**:",
            safety: "Sicurezza Garantita:\n• **Nessuna patente richiesta** — quad automatici con test di prova.\n• Caschi, occhiali e guide esperte inclusi.\n• Bambini 6+ viaggiano con un adulto o in Buggy familiare.\n• Per donne in gravidanza consigliamo Jeep 4x4.",
            packing: "Cosa indossare e portare:\n• **Scarpe sportive chiuse**, occhiali da sole e kefiah.\n• Crema solare, felpa leggera nelle sere invernali e **costume** per il Blue Hole.",
            pickup: "**Trasferimento hotel gratuito A/R** in veicoli climatizzati in tutta Sharm El Sheikh: Naama Bay, Soho Square, Sharks Bay, Nabq Bay e Hadaba.",
            payment: "Metodi Flessibili:\n• **Paga all'arrivo:** Zero acconto, contanti o carta alla guida.\n• **Visa / Mastercard** disponibile.\n• **Cancellazione gratuita** fino a 2 ore prima.",
            promo: code => `Usa **${code}** per avere subito il **20% di sconto**, più **10% extra** per gruppi di 5+ persone! Tocca qui:`,
            price: "Ecco i prezzi aggiornati in tempo reale con transfer incluso:",
            fallback: "Ecco i tour più richiesti a Sharm El Sheikh! Prova a scrivere **\"Preventivo 4 adulti\"**, **\"Sotto 20$\"** o **\"Confronta Eco e Nabq\"**:"
        },
        chips: {
            default: ["Preventivo 4 adulti e 2 bimbi", "Confronta Eco e Doppia Emozione", "Sicurezza e cosa portare?", "Attiva 20% MOSA20"],
            family: ["Calcola 2 adulti + 2 bimbi", "Tour più economico?", "Transfer hotel gratis?", "Paga all'arrivo"],
            compare: ["Calcola per 3 adulti", "Migliore per bambini?", "Mattina o Tramonto?", "Applica MOSA20"],
            quote: ["Applica MOSA20", "Confronta con altro tour", "Cancellazione gratuita", "Supporto WhatsApp"]
        }
    },
    ru: {
        ctx_guests: (a, c) => `${a} взр.${c ? ` + ${c} дет.` : ""}`,
        ctx_morning: "Утро",
        ctx_evening: "Вечер / Закат",
        ctx_budget: b => `До ${b}`,
        ctx_clear: "Очистить",
        book_btn: "Забронировать",
        book_prefilled: "Бронь с настройками",
        compare_btn: "Сравнить",
        calc_btn: "Расчёт",
        from_lbl: "От",
        adult_lbl: "Взрослый",
        applied_prefill: "Форма бронирования заполнена автоматически ✓",
        promo_copied: code => `Промокод ${code} скопирован и активирован ✓`,
        compare_title: "Умное сравнение туров",
        quote_card_title: "Персональный расчёт цены",
        quote_tours: "Туры:",
        quote_guests: "Гости:",
        quote_base: "Базовая сумма:",
        quote_group: pct => `Групповая скидка (-${pct}%)`,
        quote_promo: (code, pct) => `Промокод ${code} (-${pct}%)`,
        quote_net: "Итого со скидками:",
        quote_saved: s => `Выгода ${s}!`,
        quote_book_btn: "Зафиксировать цену и бронь ←",
        quote_edit_btn: "Изменить в калькуляторе",
        promo_ticket_title: "Эксклюзивный купон Mosa Safari",
        promo_ticket_sub: "Скидка 20% сразу + 10% для групп от 5 чел.",
        promo_ticket_btn: "Применить промокод к броне",
        quiz_step_lbl: (s, tot) => `Шаг ${s} из ${tot}`,
        quiz_q1: "С кем вы путешествуете в Шарм-эль-Шейх?",
        quiz_q1_opts: [
            { id: "solo", title: "Один / Соло", sub: "Драйв в пустыне (1 взрослый)", icon: "🏍️", adults: 1, children: 0 },
            { id: "couple", title: "Пара / Медовый месяц", sub: "Романтический закат или VIP (2 взр.)", icon: "🌅", adults: 2, children: 0 },
            { id: "family", title: "Семья с детьми", sub: "Безопасный багги и -50% детям (2+2)", icon: "👨‍👩‍👧‍👦", adults: 2, children: 2 },
            { id: "group", title: "Компания 5+ друзей", sub: "Автоматическая скидка 10% группе", icon: "🎉", adults: 5, children: 0 }
        ],
        quiz_q2: "Какое время суток вам ближе?",
        quiz_q2_opts: [
            { id: "morning", title: "Рассвет и утро", sub: "Прохлада и свежий воздух", icon: "☀️" },
            { id: "sunset", title: "Золотой закат", sub: "Панорамные фото в Горах Эхо", icon: "🌄" },
            { id: "night", title: "Ночь BBQ и звёзды", sub: "Бедуинский ужин и телескоп", icon: "✨" },
            { id: "fullday", title: "Экскурсия на весь день", sub: "Цветной каньон, Голубая дыра и Дахаб", icon: "🏝️" }
        ],
        quiz_q3: "Какой формат впечатлений вы ищете?",
        quiz_q3_opts: [
            { id: "scenic", title: "Природа и комфорт", sub: "Спокойный маршрут и чай бедуинов", icon: "🐪" },
            { id: "thrill", title: "Максимум адреналина", sub: "Квадроцикл ATV + скоростной багги", icon: "⚡" },
            { id: "vip", title: "VIP Набк и морепродукты", sub: "Заповедник Набк на закате", icon: "👑" }
        ],
        quiz_result_title: "Идеальные туры для вас",
        quiz_best_badge: "98% Совпадение",
        quiz_runner_badge: "91% Альтернатива",
        quiz_group_tip: "Бонус: Вашей группе доступна скидка 10% + 20% по MOSA20!",
        quiz_book_cta: "Забронировать этот тур ←",
        quiz_chat_cta: "Показать в чате",
        quiz_retake: "Пройти заново",
        qb_title: "Живой калькулятор стоимости",
        qb_sub: "Выберите туры, гостей и скидки для расчёта точной суммы",
        qb_pick_tours: "1. Включённые туры:",
        qb_guests: "2. Количество гостей:",
        qb_adults: "Взрослые (12+)",
        qb_children: "Дети (6–11 · скидка 50%)",
        qb_slot: "3. Удобное время выезда:",
        qb_morning: "Утром (AM)",
        qb_evening: "Вечером / Закат (PM)",
        qb_promo_lbl: "Применить промокод MOSA20 (-20%)",
        qb_cta: "Зафиксировать расчёт и перейти к броне ←",
        voice_unsupported: "Голосовой ввод не поддерживается в этом браузере",
        voice_listening: "Говорите сейчас...",
        voice_err: "Не удалось распознать речь",
        reset_done: "Начат новый диалог, параметры сброшены.",
        slot_morning: "Утренний выезд (AM)",
        slot_evening: "Вечерний выезд / Закат (PM)",
        msgs: {
            greeting: "Рад помочь спланировать ваше сафари в Шарм-эль-Шейхе! Напишите состав компании, бюджет или выберите вкладку **Подбор тура** выше.",
            compare_intro: "Сравнение двух наиболее подходящих программ по актуальным ценам:",
            quote_intro: (title, guestsText) => `Точный расчёт стоимости для **${title}** (${guestsText}):`,
            booking_intro: title => `Готово! Я предзаполнил **${title}** вашими параметрами. Нажмите ниже, чтобы открыть бронирование:`,
            budget_intro: maxText => `Лучшие туры в Шарм-эль-Шейхе в бюджете до **${maxText}**:`,
            family: "Для семей с детьми: все квадроциклы автоматические с инструктажем перед стартом, а для детей **6–11 лет действует скидка 50%**:",
            couple: "Для пар и медового месяца идеально подойдут **Закат в Горах Эхо** или **Ужин из морепродуктов в Набке**:",
            thrill: "Для любителей скорости: **Двойной драйв (4.8★)** объединяет квадроцикл ATV и мощный багги, или выберите **VIP Тайны пустыни**:",
            nabq: "Туры в **Заповедник Набк** включают входные разрешения и мангровые рощи — доступны Премиум, VIP и закат с морепродуктами:",
            night: "**Ночное сафари 5-в-1** (6 часов): квадроциклы ATV, верблюды, ужин-барбекю у бедуинов, шоу и телескоп:",
            canyon: "Экскурсия на весь день **Цветной каньон, Голубая дыра и Дахаб** (10 часов) на джипах 4x4 со снорклингом и обедом:",
            morning: "Утренние выезды комфортны прохладой пустыни! Рекомендуем **Рассвет на квадроциклах** или выезд в **Дахаб и Каньон**:",
            safety: "Гарантия безопасности:\n• **Права не требуются** — автоматические квадроциклы и тест-заезд.\n• Шлемы, очки и сопровождение гида включены.\n• Дети 6+ едут безопасно со взрослым или в семейном багги.\n• Беременным рекомендуем джип 4x4.",
            packing: "Что надеть и взять:\n• **Закрытую удобную обувь**, солнечные очки и арафатку.\n• Солнцезащитный крем, кофту на зимний вечер и **купальник** для Голубой дыры.",
            pickup: "**Бесплатный трансфер туда-обратно** на авто с кондиционером из любого отеля Шарма: Наама-Бей, Сохо-сквер, Шаркс-Бей, Набк-Бей, Хадаба.",
            payment: "Удобная оплата:\n• **Оплата при получении:** 0% предоплаты, наличные или карта при выезде.\n• **Visa / Mastercard** на сайте.\n• **Бесплатная отмена** за 2 часа до выезда.",
            promo: code => `Промокод **${code}** даёт **скидку 20%** сразу, а для **5+ гостей** автоматически добавляется **10% групповая скидка**! Нажмите на купон:`,
            price: "Актуальные цены на сегодня в выбранной валюте с включённым трансфером:",
            fallback: "Популярные сафари-туры Шарм-эль-Шейха прямо сейчас! Попробуйте спросить **\"Расчёт 4 взрослых закат\"**, **\"До $20\"** или **\"Сравни Эхо и Набк\"**:"
        },
        chips: {
            default: ["Расчёт на 4 взрослых и 2 детей", "Сравни Закат Эхо и Двойной драйв", "Безопасность и что взять?", "Активировать MOSA20 (-20%)"],
            family: ["Посчитай 2 взр. + 2 реб.", "Самый выгодный тур?", "Бесплатный трансфер?", "Оплата при получении"],
            compare: ["Расчёт лидера на 3 взр.", "Что лучше для детей?", "Утром или на закат?", "Применить MOSA20"],
            quote: ["Добавить скидку MOSA20", "Сравнить с другим туром", "Условия отмены", "Написать в WhatsApp"]
        }
    }
};

const TOUR_KEYWORDS = {
    "sharm-sunrise-atv": ["شروق", "فجر", "صبح", "صباح", "sunrise", "dawn", "alba", "рассвет", "утро"],
    "sharm-sunset-echo": ["غروب", "صدى", "الصدى", "جبال", "sunset", "echo", "tramonto", "eco", "закат", "эхо"],
    "sharm-double-thrill": ["مزدوج", "مزدوجة", "باجي", "اثاره", "إثارة", "سريع", "ثريل", "double", "thrill", "buggy", "doppia", "emozione", "двойн", "драйв", "багги"],
    "sharm-night-5in1": ["ليل", "ليليه", "ليلية", "نجوم", "عشاء", "بدوي", "5 في 1", "سهره", "night", "star", "stargazing", "dinner", "bbq", "5-in-1", "notte", "stelle", "ноч", "звезд", "ужин", "5-в-1"],
    "sharm-canyon-bluehole": ["ملون", "وادي", "الوادي", "بلو", "هول", "دهب", "جيب", "يوم كامل", "سنوركل", "canyon", "colored", "blue hole", "dahab", "snorkel", "jeep", "colorato", "цветн", "каньон", "голуб", "дахаб", "сноркл"],
    "sharm-nabq-premium": ["نبق", "محمية", "مانجروف", "nabq", "mangrove", "reserve", "riserva", "набк", "заповед", "мангр"],
    "sharm-nabq-secrets": ["اسرار", "أسرار", "موتو", "في اي بي", "vip", "secrets", "moto", "segreti", "тайн", "вип"],
    "sharm-nabq-seafood": ["سمك", "بحري", "بحرية", "سي فود", "غسق", "اسماك", "seafood", "fish", "dusk", "pesce", "морепрод", "рыб"]
};

const aiSession = {
    adults: null,
    children: null,
    slot: null,
    vibe: null,
    maxBudgetUsd: null,
    promoCode: "",
    lastTripIds: [],
    lastChipKey: "default",
    mode: "chat",
    expanded: false,
    quizStep: 1,
    quizAnswers: { party: null, time: null, style: null },
    quote: {
        tripIds: ["sharm-sunset-echo"],
        adults: 2,
        children: 0,
        slot: "morning",
        usePromo: true
    }
};

let activeRecognition = null;
let initialized = false;

export function normalizeAiText(str) {
    return String(str || "")
        .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .trim();
}

function activeCatalog() {
    const list = SAFARI_TRIPS.filter(t => t.active !== false);
    return list.length ? list : SAFARI_TRIPS;
}

export function computeAiQuote(tripIds, adults, children, promoCode) {
    const catalog = activeCatalog();
    let trips = catalog.filter(t => tripIds.includes(t.id));
    if (!trips.length && catalog.length) trips = [catalog[0]];

    const cfg = state.platformConfig?.settings || {};
    const minGroup = Number(cfg.groupDiscountMin) > 0 ? Number(cfg.groupDiscountMin) : 5;
    const groupPct = Number(cfg.groupDiscountPct) >= 0 ? Number(cfg.groupDiscountPct) : 10;

    const a = Math.max(1, Math.min(30, Number(adults) || 1));
    const c = Math.max(0, Math.min(20, Number(children) || 0));
    const equivGuests = Math.max(1, a + c * 0.5);

    const baseUsd = trips.reduce((s, t) => s + Number(t.adultPrice || 0), 0) * equivGuests;
    const qualifiesGroup = a + c >= minGroup && groupPct > 0;
    const afterGroupUsd = qualifiesGroup ? baseUsd * (1 - groupPct / 100) : baseUsd;
    const groupSavedUsd = Math.max(0, baseUsd - afterGroupUsd);

    const promo = findActivePromo(promoCode);
    const netUsd = promo && promo.discount > 0 ? afterGroupUsd * (1 - promo.discount / 100) : afterGroupUsd;
    const promoSavedUsd = Math.max(0, afterGroupUsd - netUsd);

    return {
        trips,
        adults: a,
        children: c,
        baseUsd,
        groupPct: qualifiesGroup ? groupPct : 0,
        groupSavedUsd,
        promo,
        promoSavedUsd,
        totalSavedUsd: groupSavedUsd + promoSavedUsd,
        netUsd
    };
}

function extractBudgetUsd(norm) {
    const currPattern = /(?:تحت|اقل من|بحدود|ميزاني(?:تي|ه)|بـ|سعر|under|max|below|budget|within|sotto|meno di|до|бюджет)\s*(\d+(?:\.\d+)?)\s*(\$|دولار|usd|جنيه|ج\.م|egp|le|يورو|eur)?|(\d+(?:\.\d+)?)\s*(دولار|usd|\$|جنيه|ج\.م|egp|يورو|eur)/i;
    const m = norm.match(currPattern);
    if (!m) return null;
    const rawNum = Number(m[1] || m[3]);
    if (!Number.isFinite(rawNum) || rawNum <= 0) return null;
    const unitRaw = (m[2] || m[4] || "").toLowerCase();
    let unit = state.currency || "USD";
    if (/جنيه|ج\.م|egp|le/.test(unitRaw)) unit = "EGP";
    else if (/يورو|eur/.test(unitRaw)) unit = "EUR";
    else if (/دولار|usd|\$/.test(unitRaw)) unit = "USD";

    const rate = state.rates?.[unit] || 1;
    return unit === "USD" ? rawNum : rawNum / rate;
}

function extractEntities(raw) {
    const norm = normalizeAiText(raw);
    const ent = {
        norm,
        adults: null,
        children: null,
        slot: null,
        maxBudgetUsd: null,
        wantsPromo: false,
        promoCode: null
    };

    // Numeric Adults
    const adultMatch = norm.match(/(\d{1,2})\s*(?:كبار|بالغ(?:ين|ون|ين)?|افراد|فرد|اشخاص|شخص|adults?|guests?|pax|persone|adulti|взросл\w*|чел\w*|гост\w*)/i);
    if (adultMatch) {
        ent.adults = Math.max(1, Math.min(30, parseInt(adultMatch[1], 10)));
    } else if (/شخصين|فردين|زوجين|زوجتي|مراتي|two adults|2 pax|couple|honeymoon|coppia|пара|двое|вдвоем/.test(norm)) {
        ent.adults = 2;
    } else if (/لوحدي|بمفردي|\bsolo\b|1 guest|один/.test(norm)) {
        ent.adults = 1;
    }

    // Numeric / word Children
    const childMatch = norm.match(/(\d{1,2})\s*(?:اطفال|طفل|اولاد|عيال|kids?|child(?:ren)?|bambin[oi]|дет\w*|ребен\w*|детей)/i);
    if (childMatch) {
        ent.children = Math.max(0, Math.min(20, parseInt(childMatch[1], 10)));
    } else if (/طفلين|ولدين|2 kids|two kids|due bambini/.test(norm)) {
        ent.children = 2;
    } else if (/(?:معي|معنا|لدي|عندي|و)\s*طفل\b|\b1 child\b|\b1 kid\b/.test(norm)) {
        ent.children = 1;
    }

    // Time Slot
    if (/صباح|شروق|فجر|\bmorning\b|\bsunrise\b|\bdawn\b|\bmattin|\balba\b|утр|рассвет/.test(norm)) {
        ent.slot = "morning";
    } else if (/مساء|غروب|ليل|عشاء|نجوم|غسق|\bevening\b|\bsunset\b|\bdusk\b|\bnight\b|\bstar|ser[ae]|tramont|notte|вечер|закат|ноч/.test(norm)) {
        ent.slot = "evening";
    }

    // Budget
    ent.maxBudgetUsd = extractBudgetUsd(norm);

    // Promo codes (active admin codes or MOSA20 keyword)
    const activePromos = state.platformConfig?.promos?.filter(p => p.active !== false) || [{ code: "MOSA20", discount: 20 }];
    for (const p of activePromos) {
        if (p.code && norm.includes(String(p.code).toLowerCase())) {
            ent.promoCode = String(p.code).toUpperCase();
            ent.wantsPromo = true;
            break;
        }
    }
    if (!ent.promoCode && /خصم|كود|برومو|كوبون|promo|discount|coupon|sconto|codice|скид|промокод/.test(norm)) {
        ent.promoCode = String(activePromos[0]?.code || "MOSA20").toUpperCase();
        ent.wantsPromo = true;
    }

    return ent;
}

function rankTripsForQuery(norm, budgetUsd = null) {
    const catalog = activeCatalog();
    const scored = catalog.map(trip => {
        let score = 0;
        const kws = TOUR_KEYWORDS[trip.id] || [];
        for (const kw of kws) {
            const nkw = normalizeAiText(kw);
            if (nkw && norm.includes(nkw)) score += nkw.length > 4 ? 4 : 3;
        }
        const hay = normalizeAiText(`${trip.titleAr} ${trip.titleEn} ${trip.titleIt} ${trip.titleRu} ${trip.vehicle}`);
        norm.split(/\s+/).forEach(tok => {
            if (tok.length >= 3 && hay.includes(tok)) score += 1;
        });
        if (budgetUsd !== null) {
            if (trip.fromPrice <= budgetUsd) score += 2;
            else score -= 3;
        }
        return { trip, score };
    });

    scored.sort((a, b) => b.score - a.score || b.trip.rating - a.trip.rating);
    return scored;
}

export function analyzeUserPrompt(raw) {
    const ent = extractEntities(raw);
    const n = ent.norm;

    // Update persistent conversation memory
    if (ent.adults !== null) aiSession.adults = ent.adults;
    if (ent.children !== null) aiSession.children = ent.children;
    if (ent.slot) aiSession.slot = ent.slot;
    if (ent.maxBudgetUsd !== null) aiSession.maxBudgetUsd = ent.maxBudgetUsd;
    if (ent.promoCode) aiSession.promoCode = ent.promoCode;

    // Sync quote builder defaults gently with conversation memory
    if (aiSession.adults) aiSession.quote.adults = aiSession.adults;
    if (aiSession.children !== null) aiSession.quote.children = aiSession.children;
    if (aiSession.slot) aiSession.quote.slot = aiSession.slot;
    if (aiSession.promoCode) aiSession.quote.usePromo = true;

    const ranked = rankTripsForQuery(n, ent.maxBudgetUsd);
    const explicitMatches = ranked.filter(r => r.score >= 3).map(r => r.trip);

    if (explicitMatches.length) {
        aiSession.lastTripIds = explicitMatches.slice(0, 3).map(t => t.id);
        aiSession.quote.tripIds = [explicitMatches[0].id];
    }

    const hasRecVerb = /رشح|اقترح|افضل|احسن|\brecommend\b|\bsuggest\b|\bbest\b|miglior|consigl|подбер|посовет|лучш/.test(n);
    const hasBookVerb = /احجز|حجز|اريد ان احجز|\bbook\b|\breserve\b|prenot|забронир|брон/.test(n);
    const hasCompareVerb = /قارن|مقارنه|الفرق|ايهما|افضل بين|\bcompare\b|\bvs\b|versus|differen|confront|сравн|разниц|лучше между/.test(n);
    const hasCalcVerb = /احسب|حاسبه|كم السعر|بكام|تكلفه|اجمالي|توتال|total|quote|calculat|how much|quanto costa|preventiv|посчита|сколько стоит|расчет/.test(n)
        || (ent.adults !== null && !hasRecVerb && explicitMatches.length > 0);

    let intent = "fallback";
    if (hasCompareVerb) {
        intent = "compare";
    } else if (hasBookVerb && (explicitMatches.length > 0 || aiSession.lastTripIds.length > 0)) {
        intent = "book";
    } else if (hasCalcVerb && !hasBookVerb) {
        intent = "quote";
    } else if (ent.maxBudgetUsd !== null) {
        intent = "budget";
    } else if (/عائل|اطفال|طفل|بنت|ولد|اسره|عرس|family|kids?|child|famigl|bambin|сем|дет/.test(n)) {
        intent = "family";
        aiSession.vibe = "family";
    } else if (/زوج|زوجين|شهر عسل|رومانس|خطيب|couple|honeymoon|romantic|coppia|viaggio di nozze|пара|медов|романт/.test(n)) {
        intent = "couple";
        aiSession.vibe = "couple";
    } else if (/امان|آمن|مبتد|رخصه|سواقه|حامل|سن|كبير|ضهر|ظهر|تامين|safe|beginner|licen[cs]|pregnant|sicur|patente|безопас|нович|прав|беремен/.test(n)) {
        intent = "safety";
    } else if (/ملابس|البس|حذاء|نظار|كوفيه|جو|طقس|برد|حر|اخد معايا|اجيب|wear|pack|bring|clothes|shoes|weather|abbigliam|scarpe|одеж|взять|погод|обув/.test(n)) {
        intent = "packing";
    } else if (/فندق|توصيل|استلام|نعمة|سوهو|هضب|قرش|مكان|فين|pickup|hotel|transfer|location|naama|sharks|ritiro|trasfer|трансфер|отель|наама/.test(n)) {
        intent = "pickup";
    } else if (/دفع|فيزا|كاش|مقدم|الغاء|تعديل|استرداد|pay|visa|cash|deposit|cancel|pagam|contanti|оплат|налич|отмен/.test(n)) {
        intent = "payment";
    } else if (ent.wantsPromo) {
        intent = "promo";
    } else if (/سعر|اسعار|ارخص|رخيص|بكام|قائمه|عرض|price|cost|cheap|list|prezz|cost[ao]|цен|прайс|дешев/.test(n)) {
        intent = "price";
    } else if (explicitMatches.length) {
        const topId = explicitMatches[0].id;
        if (topId === "sharm-night-5in1") intent = "night";
        else if (topId === "sharm-canyon-bluehole") intent = "canyon";
        else if (topId.includes("nabq")) intent = "nabq";
        else if (topId === "sharm-double-thrill") intent = "thrill";
        else if (topId === "sharm-sunrise-atv") intent = "morning";
        else intent = "matched_tours";
    } else if (ent.slot === "morning") {
        intent = "morning";
    } else if (/اهلا|مرحبا|سلام|هاي|الو|\bhi\b|\bhello\b|\bhey\b|\bciao\b|привет|здравств/.test(n)) {
        intent = "greeting";
    }

    return { ent, intent, ranked, explicitMatches };
}

function getSelectedBadgeLabel(trip, lang) {
    if (lang === "ar") return trip.badge || "";
    return (BADGE_I18N[lang] && BADGE_I18N[lang][trip.badge]) || trip.badge || "";
}

function renderTourCardHtml(trip, lang, compact = false) {
    const c = getCopy(lang);
    const title = getTripTitle(trip, lang);
    const dur = getTripDuration(trip, lang);
    const badge = getSelectedBadgeLabel(trip, lang);
    return `
        <div class="ai-tour-card rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/15 p-2.5 shadow-sm flex flex-col gap-2">
            <div class="flex items-start gap-2.5 min-w-0">
                <img src="${escHtml(trip.img)}" alt="${escHtml(title)}" class="w-14 h-14 rounded-lg object-cover shrink-0 border border-champagne/25" />
                <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-1 mb-0.5">
                        <span class="px-1.5 py-0.5 rounded bg-champagne/15 text-champagne-dark dark:text-champagne text-[9px] font-black truncate">${escHtml(badge)}</span>
                        <span class="text-[10px] font-black text-champagne shrink-0">★ ${Number(trip.rating || 4.5).toFixed(1)}</span>
                    </div>
                    <div class="text-xs font-black leading-snug line-clamp-2 text-carbon-950 dark:text-white">${escHtml(title)}</div>
                    <div class="text-[10px] opacity-70 mt-0.5 truncate">${escHtml(dur)} · ${escHtml(trip.vehicle)}</div>
                </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-carbon-900/10 dark:border-white/10">
                <div class="leading-tight">
                    <span class="text-[9px] opacity-60 block">${escHtml(c.from_lbl)}</span>
                    <span class="text-xs font-black text-sea-dark dark:text-sea">${escHtml(fmtPrice(trip.fromPrice))}</span>
                    <span class="text-[10px] opacity-65">(${escHtml(fmtPrice(trip.adultPrice))})</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                    ${!compact ? `
                    <button type="button" data-ai-action="open-quote-trip" data-trip-id="${escHtml(trip.id)}"
                        class="px-2 py-1.5 rounded-lg border border-carbon-900/15 dark:border-white/15 hover:border-champagne text-[10px] font-extrabold transition">${escHtml(c.calc_btn)}</button>
                    <button type="button" data-ai-action="compare-trip" data-trip-id="${escHtml(trip.id)}"
                        class="px-2 py-1.5 rounded-lg border border-carbon-900/15 dark:border-white/15 hover:border-sea text-[10px] font-extrabold transition">${escHtml(c.compare_btn)}</button>
                    ` : ""}
                    <button type="button" data-ai-action="book-trip" data-trip-id="${escHtml(trip.id)}"
                        class="px-2.5 py-1.5 rounded-lg bg-champagne hover:bg-champagne-light text-carbon-950 text-[10px] font-black shadow-sm transition">${escHtml(c.book_btn)}</button>
                </div>
            </div>
        </div>
    `;
}

function renderComparisonCardHtml(t1, t2, lang) {
    const c = getCopy(lang);
    const cols = [t1, t2].map(t => {
        const title = getTripTitle(t, lang);
        const dur = getTripDuration(t, lang);
        return `
            <div class="p-2 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 flex flex-col justify-between gap-2 min-w-0">
                <div>
                    <img src="${escHtml(t.img)}" alt="${escHtml(title)}" class="w-full h-16 rounded-lg object-cover mb-1.5" />
                    <div class="text-[11px] font-black leading-tight line-clamp-2 mb-1">${escHtml(title)}</div>
                    <div class="space-y-0.5 text-[10px]">
                        <div class="font-black text-sea-dark dark:text-sea">${escHtml(fmtPrice(t.fromPrice))} <span class="font-normal opacity-70">(${escHtml(fmtPrice(t.adultPrice))})</span></div>
                        <div class="opacity-75">⏱ ${escHtml(dur)}</div>
                        <div class="font-bold text-champagne-dark dark:text-champagne">★ ${Number(t.rating || 4.5).toFixed(1)}</div>
                        <div class="opacity-70 truncate">🚘 ${escHtml(t.vehicle)}</div>
                    </div>
                </div>
                <button type="button" data-ai-action="book-trip" data-trip-id="${escHtml(t.id)}"
                    class="w-full py-1.5 rounded-lg bg-champagne hover:bg-champagne-light text-carbon-950 text-[10px] font-black transition">${escHtml(c.book_btn)}</button>
            </div>
        `;
    }).join("");

    return `
        <div class="rounded-xl border border-champagne/30 bg-white dark:bg-carbon-800 p-2.5 mt-2">
            <div class="text-[10px] font-black text-champagne-dark dark:text-champagne uppercase tracking-wide mb-2">${escHtml(c.compare_title)}</div>
            <div class="grid grid-cols-2 gap-2">${cols}</div>
        </div>
    `;
}

function renderQuoteCardHtml(quote, lang, slot, inCalculator = false) {
    const c = getCopy(lang);
    const titles = quote.trips.map(t => getTripTitle(t, lang)).join(" + ");
    const guestsStr = c.ctx_guests(quote.adults, quote.children);
    const tripIdsAttr = quote.trips.map(t => t.id).join(",");

    return `
        <div class="rounded-xl border border-champagne/40 bg-gradient-to-br from-carbon-950 to-carbon-900 text-white p-3 mt-2 shadow-lg space-y-2">
            <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                <span class="text-[11px] font-black text-champagne">${escHtml(c.quote_card_title)}</span>
                ${quote.totalSavedUsd > 0 ? `<span class="px-1.5 py-0.5 rounded bg-sea/20 text-sea text-[10px] font-black">${escHtml(c.quote_saved(fmtPrice(quote.totalSavedUsd)))}</span>` : ""}
            </div>
            <div class="space-y-1 text-[11px]">
                <div class="flex justify-between gap-2"><span class="text-[#B5B0A8]">${escHtml(c.quote_tours)}</span><span class="font-black text-end line-clamp-1">${escHtml(titles)}</span></div>
                <div class="flex justify-between gap-2"><span class="text-[#B5B0A8]">${escHtml(c.quote_guests)}</span><span class="font-bold">${escHtml(guestsStr)}${slot ? ` · ${escHtml(slot === "evening" ? c.ctx_evening : c.ctx_morning)}` : ""}</span></div>
                <div class="flex justify-between gap-2"><span class="text-[#B5B0A8]">${escHtml(c.quote_base)}</span><span class="${quote.totalSavedUsd > 0 ? "line-through opacity-60" : "font-bold"}">${escHtml(fmtPrice(quote.baseUsd))}</span></div>
                ${quote.groupPct > 0 ? `<div class="flex justify-between gap-2 text-sea"><span>${escHtml(c.quote_group(quote.groupPct))}</span><span class="font-bold">-${escHtml(fmtPrice(quote.groupSavedUsd))}</span></div>` : ""}
                ${quote.promo ? `<div class="flex justify-between gap-2 text-champagne"><span>${escHtml(c.quote_promo(quote.promo.code, quote.promo.discount))}</span><span class="font-bold">-${escHtml(fmtPrice(quote.promoSavedUsd))}</span></div>` : ""}
                <div class="flex justify-between items-center gap-2 pt-1.5 border-t border-white/15 text-xs">
                    <span class="font-black">${escHtml(c.quote_net)}</span>
                    <span class="text-sm font-black text-champagne">${escHtml(fmtPrice(quote.netUsd))}</span>
                </div>
            </div>
            <div class="flex gap-1.5 pt-1">
                <button type="button" data-ai-action="book-chat-quote" data-trip-ids="${escHtml(tripIdsAttr)}" data-adults="${quote.adults}" data-children="${quote.children}" data-slot="${escHtml(slot || "morning")}" data-promo="${escHtml(quote.promo?.code || "")}"
                    class="flex-1 py-2 px-2.5 rounded-lg bg-champagne hover:bg-champagne-light text-carbon-950 text-[11px] font-black transition">${escHtml(inCalculator ? c.qb_cta : c.quote_book_btn)}</button>
                ${inCalculator ? "" : `<button type="button" data-ai-action="open-quote-trip" data-trip-id="${escHtml(quote.trips[0]?.id || "")}"
                    class="px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-extrabold transition">${escHtml(c.quote_edit_btn)}</button>`}
            </div>
        </div>
    `;
}

function renderPromoTicketHtml(code, lang) {
    const c = getCopy(lang);
    const safeCode = escHtml(code || "MOSA20");
    return `
        <div class="mt-2 p-3 rounded-xl border border-dashed border-champagne/60 bg-champagne/10 flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                    <div class="text-[11px] font-black text-champagne-dark dark:text-champagne">${escHtml(c.promo_ticket_title)}</div>
                    <div class="text-[10px] opacity-75">${escHtml(c.promo_ticket_sub)}</div>
                </div>
                <span class="px-2.5 py-1 rounded-lg bg-carbon-950 text-champagne font-mono text-xs font-black tracking-wider shrink-0">${safeCode}</span>
            </div>
            <button type="button" data-ai-action="apply-promo" data-code="${safeCode}"
                class="w-full py-1.5 px-3 rounded-lg bg-champagne hover:bg-champagne-light text-carbon-950 text-[11px] font-black transition">${escHtml(c.promo_ticket_btn)}</button>
        </div>
    `;
}

function showTypingIndicator() {
    const box = document.getElementById("ai-messages");
    if (!box) return null;
    const wrap = document.createElement("div");
    wrap.className = "flex justify-start ai-typing-row ai-msg-enter";
    wrap.innerHTML = `<div class="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-carbon-800 border border-champagne/25 flex items-center gap-1.5 shadow-sm">
        <span class="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-sea animate-bounce" style="animation-delay:0.15s"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce" style="animation-delay:0.3s"></span>
    </div>`;
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
    return wrap;
}

function formatRichText(txt) {
    return escHtml(txt)
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-carbon-950 dark:text-champagne">$1</strong>')
        .replace(/\n/g, "<br>");
}

export function appendAiMsg(txt, sender = "bot", options = null) {
    const box = document.getElementById("ai-messages");
    if (!box) return;
    const aiLang = getAiLang();

    const wrap = document.createElement("div");
    wrap.className = (sender === "user" ? "flex justify-end" : "flex justify-start") + " ai-msg-enter";

    const bubble = document.createElement("div");
    bubble.className = sender === "user"
        ? "max-w-[86%] px-3.5 py-2.5 rounded-2xl rounded-ee-sm bg-gradient-to-br from-champagne to-champagne-light text-carbon-950 font-bold shadow-sm leading-relaxed"
        : "w-full max-w-[96%] px-3.5 py-2.5 rounded-2xl rounded-es-sm bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 shadow-sm leading-relaxed";

    let html = `<div>${formatRichText(txt)}</div>`;

    if (typeof options === "string") {
        // Backward compatible: tripId string passed as 3rd param
        const trip = activeCatalog().find(t => t.id === options);
        if (trip) {
            html += `<div class="mt-2.5 space-y-2">${renderTourCardHtml(trip, aiLang)}</div>`;
        }
    } else if (options && typeof options === "object") {
        if (options.comparePair && options.comparePair.length === 2) {
            html += renderComparisonCardHtml(options.comparePair[0], options.comparePair[1], aiLang);
        }
        if (options.quoteData) {
            html += renderQuoteCardHtml(options.quoteData, aiLang, options.slot);
        }
        if (options.promoCode) {
            html += renderPromoTicketHtml(options.promoCode, aiLang);
        }
        if (Array.isArray(options.trips) && options.trips.length) {
            html += `<div class="mt-2.5 space-y-2">${options.trips.slice(0, 3).map(t => renderTourCardHtml(t, aiLang)).join("")}</div>`;
        }
    }

    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
}

function renderContextMemoryBar() {
    const bar = document.getElementById("ai-context-bar");
    if (!bar) return;
    const lang = getAiLang();
    const c = getCopy(lang);
    const pills = [];

    if (aiSession.adults || aiSession.children) {
        pills.push(`<span class="px-2 py-0.5 rounded-md bg-white/80 dark:bg-carbon-800 border border-champagne/30 text-carbon-950 dark:text-champagne">👥 ${escHtml(c.ctx_guests(aiSession.adults || 2, aiSession.children || 0))}</span>`);
    }
    if (aiSession.slot) {
        const lbl = aiSession.slot === "evening" ? `🌙 ${c.ctx_evening}` : `☀️ ${c.ctx_morning}`;
        pills.push(`<span class="px-2 py-0.5 rounded-md bg-white/80 dark:bg-carbon-800 border border-champagne/30 text-carbon-950 dark:text-champagne">${escHtml(lbl)}</span>`);
    }
    if (aiSession.maxBudgetUsd) {
        pills.push(`<span class="px-2 py-0.5 rounded-md bg-sea/15 border border-sea/30 text-sea-dark dark:text-sea">💰 ${escHtml(c.ctx_budget(fmtPrice(aiSession.maxBudgetUsd)))}</span>`);
    }
    if (aiSession.promoCode) {
        pills.push(`<span class="px-2 py-0.5 rounded-md bg-champagne text-carbon-950">🏷️ ${escHtml(aiSession.promoCode)}</span>`);
    }

    if (!pills.length) {
        bar.classList.add("hidden");
        bar.innerHTML = "";
        return;
    }

    bar.classList.remove("hidden");
    bar.innerHTML = `
        <div class="flex items-center gap-1.5 flex-wrap min-w-0">${pills.join("")}</div>
        <button type="button" data-ai-action="clear-context" class="px-2 py-0.5 rounded bg-carbon-950/10 dark:bg-white/10 hover:bg-rose-500/20 text-[10px] font-black shrink-0 transition">${escHtml(c.ctx_clear)}</button>
    `;
}

function updateDynamicChips(categoryKey = "default") {
    aiSession.lastChipKey = categoryKey;
    const strip = document.getElementById("ai-chips-strip");
    if (!strip) return;
    const c = getCopy(getAiLang());
    const list = c.chips[categoryKey] || c.chips.default;
    const palette = [
        "bg-champagne/15 text-champagne-dark dark:text-champagne hover:bg-champagne/25",
        "bg-sea/15 text-sea-dark dark:text-sea hover:bg-sea/25",
        "bg-copper/15 text-copper hover:bg-copper/25",
        "bg-carbon-900/10 dark:bg-white/10 text-carbon-900 dark:text-[#E6E0D4] hover:border-champagne"
    ];
    strip.innerHTML = list.map((label, i) => `
        <button type="button" data-ai-action="chip-query"
            class="ai-chip shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-lg ${palette[i % palette.length]} border border-transparent text-[11px] font-extrabold transition">${escHtml(label)}</button>
    `).join("");
}

function syncWhatsAppConciergeLink() {
    const link = document.getElementById("ai-wa-link");
    if (!link) return;
    const parts = ["Hello Mosa Safari"];
    if (aiSession.lastTripIds.length) {
        const trip = activeCatalog().find(t => t.id === aiSession.lastTripIds[0]);
        if (trip) parts.push(`Tour: ${trip.titleEn}`);
    }
    if (aiSession.adults) parts.push(`Guests: ${aiSession.adults} Adults${aiSession.children ? ` + ${aiSession.children} Kids` : ""}`);
    if (aiSession.slot) parts.push(`Slot: ${aiSession.slot}`);
    if (aiSession.promoCode) parts.push(`Promo: ${aiSession.promoCode}`);
    link.href = `https://wa.me/201023355550?text=${encodeURIComponent(parts.join(" | "))}`;
}

function pickTripsByIds(ids) {
    const catalog = activeCatalog();
    return ids.map(id => catalog.find(t => t.id === id)).filter(Boolean);
}

function launchBookingWithPrefs({ tripIds = [], adults = null, children = null, slot = null, promoCode = "" }) {
    const b = state.booking;
    if (Array.isArray(tripIds) && tripIds.length) {
        b.selectedIds = [...tripIds];
    } else if (aiSession.lastTripIds.length) {
        b.selectedIds = [aiSession.lastTripIds[0]];
    }
    if (Number.isFinite(adults) && adults >= 1) b.adults = adults;
    else if (aiSession.adults) b.adults = aiSession.adults;

    if (Number.isFinite(children) && children >= 0) b.children = children;
    else if (aiSession.children !== null) b.children = aiSession.children;

    if (slot === "morning" || slot === "evening") b.tripTime = slot;
    else if (aiSession.slot) b.tripTime = aiSession.slot;

    if (promoCode) b.promoCode = promoCode;
    else if (aiSession.promoCode) b.promoCode = aiSession.promoCode;

    if ((b.adults + b.children) >= 3 && b.vehicleOpt === "Double ATV Quad" && b.adults > 2) {
        b.vehicleOpt = "Shared Dune Buggy";
    }

    const c = getCopy(getAiLang());
    toggleAiWidget(false);
    openBookingWithTrip(b.selectedIds[0]);
    showToast(c.applied_prefill);
}

export function handleAiQuery(q) {
    const clean = String(q || "").trim();
    if (!clean) return;
    if (aiSession.mode !== "chat") switchAiMode("chat");

    appendAiMsg(clean, "user");
    const typingEl = showTypingIndicator();

    setTimeout(() => {
        if (typingEl) typingEl.remove();

        const lang = getAiLang();
        const c = getCopy(lang);
        const m = c.msgs;
        const { ent, intent, ranked, explicitMatches } = analyzeUserPrompt(clean);
        const catalog = activeCatalog();

        renderContextMemoryBar();
        syncWhatsAppConciergeLink();

        const primaryId = explicitMatches[0]?.id || aiSession.lastTripIds[0] || "sharm-sunset-echo";

        if (intent === "greeting") {
            appendAiMsg(m.greeting, "bot");
            updateDynamicChips("default");
            return;
        }

        if (intent === "compare") {
            const pair = [];
            if (explicitMatches.length >= 2) {
                pair.push(explicitMatches[0], explicitMatches[1]);
            } else if (explicitMatches.length === 1) {
                pair.push(explicitMatches[0]);
                const fallbackSecond = catalog.find(t => t.id !== explicitMatches[0].id && (aiSession.lastTripIds.includes(t.id) || t.id === "sharm-double-thrill")) || catalog.find(t => t.id !== explicitMatches[0].id);
                if (fallbackSecond) pair.push(fallbackSecond);
            } else {
                const defaults = pickTripsByIds(["sharm-sunset-echo", "sharm-double-thrill"]);
                pair.push(...defaults.slice(0, 2));
            }
            if (pair.length === 2) {
                aiSession.lastTripIds = [pair[0].id, pair[1].id];
                appendAiMsg(m.compare_intro, "bot", { comparePair: pair });
                updateDynamicChips("compare");
                return;
            }
        }

        if (intent === "quote") {
            const targetTrip = catalog.find(t => t.id === primaryId) || catalog[0];
            const a = aiSession.adults || 2;
            const ch = aiSession.children || 0;
            const promoToUse = ent.promoCode || aiSession.promoCode || (a + ch >= 5 ? "MOSA20" : "");
            const quoteData = computeAiQuote([targetTrip.id], a, ch, promoToUse);
            appendAiMsg(m.quote_intro(getTripTitle(targetTrip, lang), c.ctx_guests(a, ch)), "bot", {
                quoteData,
                slot: aiSession.slot || "morning"
            });
            updateDynamicChips("quote");
            return;
        }

        if (intent === "book") {
            const targetTrip = catalog.find(t => t.id === primaryId) || catalog[0];
            appendAiMsg(m.booking_intro(getTripTitle(targetTrip, lang)), "bot", { trips: [targetTrip] });
            updateDynamicChips("quote");
            return;
        }

        if (intent === "budget") {
            const maxUsd = ent.maxBudgetUsd || aiSession.maxBudgetUsd || 25;
            let matches = catalog.filter(t => t.fromPrice <= maxUsd).sort((a, b) => a.fromPrice - b.fromPrice);
            if (!matches.length) matches = [...catalog].sort((a, b) => a.fromPrice - b.fromPrice).slice(0, 2);
            aiSession.lastTripIds = matches.slice(0, 3).map(t => t.id);
            appendAiMsg(m.budget_intro(fmtPrice(maxUsd)), "bot", { trips: matches.slice(0, 3) });
            updateDynamicChips("default");
            return;
        }

        if (intent === "family") {
            const trips = pickTripsByIds(["sharm-sunset-echo", "sharm-night-5in1", "sharm-nabq-premium"]);
            aiSession.lastTripIds = trips.map(t => t.id);
            appendAiMsg(m.family, "bot", { trips: trips.slice(0, 2) });
            updateDynamicChips("family");
            return;
        }

        if (intent === "couple") {
            const trips = pickTripsByIds(["sharm-sunset-echo", "sharm-nabq-seafood"]);
            aiSession.lastTripIds = trips.map(t => t.id);
            appendAiMsg(m.couple, "bot", { trips });
            updateDynamicChips("compare");
            return;
        }

        if (intent === "thrill") {
            const trips = pickTripsByIds(["sharm-double-thrill", "sharm-nabq-secrets"]);
            aiSession.lastTripIds = trips.map(t => t.id);
            appendAiMsg(m.thrill, "bot", { trips });
            updateDynamicChips("compare");
            return;
        }

        if (intent === "nabq") {
            const trips = pickTripsByIds(["sharm-nabq-premium", "sharm-nabq-secrets", "sharm-nabq-seafood"]);
            aiSession.lastTripIds = trips.map(t => t.id);
            appendAiMsg(m.nabq, "bot", { trips: trips.slice(0, 3) });
            updateDynamicChips("compare");
            return;
        }

        if (intent === "night") {
            const trips = pickTripsByIds(["sharm-night-5in1"]);
            aiSession.lastTripIds = trips.map(t => t.id);
            appendAiMsg(m.night, "bot", { trips });
            updateDynamicChips("quote");
            return;
        }

        if (intent === "canyon") {
            const trips = pickTripsByIds(["sharm-canyon-bluehole"]);
            aiSession.lastTripIds = trips.map(t => t.id);
            appendAiMsg(m.canyon, "bot", { trips });
            updateDynamicChips("quote");
            return;
        }

        if (intent === "morning") {
            const trips = pickTripsByIds(["sharm-sunrise-atv", "sharm-canyon-bluehole"]);
            aiSession.lastTripIds = trips.map(t => t.id);
            appendAiMsg(m.morning, "bot", { trips });
            updateDynamicChips("quote");
            return;
        }

        if (intent === "safety") {
            appendAiMsg(m.safety, "bot");
            updateDynamicChips("family");
            return;
        }

        if (intent === "packing") {
            appendAiMsg(m.packing, "bot");
            updateDynamicChips("default");
            return;
        }

        if (intent === "pickup") {
            appendAiMsg(m.pickup, "bot");
            updateDynamicChips("default");
            return;
        }

        if (intent === "payment") {
            appendAiMsg(m.payment, "bot");
            updateDynamicChips("quote");
            return;
        }

        if (intent === "promo") {
            const code = ent.promoCode || "MOSA20";
            aiSession.promoCode = code;
            renderContextMemoryBar();
            appendAiMsg(m.promo(code), "bot", { promoCode: code });
            updateDynamicChips("quote");
            return;
        }

        if (intent === "price") {
            const sorted = [...catalog].sort((a, b) => a.fromPrice - b.fromPrice);
            const featured = [sorted[0], catalog.find(t => t.id === "sharm-sunset-echo"), sorted[sorted.length - 1]].filter(Boolean);
            aiSession.lastTripIds = featured.map(t => t.id);
            appendAiMsg(m.price, "bot", { trips: featured });
            updateDynamicChips("quote");
            return;
        }

        if (intent === "matched_tours" && explicitMatches.length) {
            const top = explicitMatches[0];
            const desc = getTripDesc(top, lang);
            appendAiMsg(`**${getTripTitle(top, lang)}**\n${desc}`, "bot", { trips: explicitMatches.slice(0, 2) });
            updateDynamicChips("quote");
            return;
        }

        // Smart default: prioritize top rated / best seller, remember candidates
        const topFallback = ranked.slice(0, 2).map(r => r.trip);
        aiSession.lastTripIds = topFallback.map(t => t.id);
        appendAiMsg(m.fallback, "bot", { trips: topFallback });
        updateDynamicChips("default");
    }, 280);
}

function scoreQuizCatalog() {
    const { party, time, style } = aiSession.quizAnswers;
    const catalog = activeCatalog();

    const ranked = catalog.map(trip => {
        let s = 50 + Number(trip.rating || 4.3) * 4;
        if (time === "morning" && trip.id === "sharm-sunrise-atv") s += 30;
        if (time === "sunset" && ["sharm-sunset-echo", "sharm-nabq-seafood", "sharm-double-thrill"].includes(trip.id)) s += 26;
        if (time === "night" && trip.id === "sharm-night-5in1") s += 38;
        if (time === "fullday" && trip.id === "sharm-canyon-bluehole") s += 42;

        if (party === "family" && ["sharm-sunset-echo", "sharm-night-5in1", "sharm-nabq-premium"].includes(trip.id)) s += 16;
        if (party === "couple" && ["sharm-sunset-echo", "sharm-nabq-seafood", "sharm-nabq-secrets"].includes(trip.id)) s += 16;
        if (party === "group" && ["sharm-double-thrill", "sharm-night-5in1", "sharm-canyon-bluehole"].includes(trip.id)) s += 15;
        if (party === "solo" && ["sharm-double-thrill", "sharm-sunrise-atv"].includes(trip.id)) s += 16;

        if (style === "thrill" && ["sharm-double-thrill", "sharm-nabq-secrets", "sharm-sunrise-atv"].includes(trip.id)) s += 24;
        if (style === "vip" && trip.category === "nabq") s += 26;
        if (style === "scenic" && ["sharm-sunset-echo", "sharm-canyon-bluehole", "sharm-night-5in1"].includes(trip.id)) s += 20;

        return { trip, score: s };
    }).sort((a, b) => b.score - a.score);

    return ranked;
}

function renderMatcherView() {
    const view = document.getElementById("ai-matcher-view");
    if (!view) return;
    const lang = getAiLang();
    const c = getCopy(lang);
    const step = aiSession.quizStep;

    if (step <= 3) {
        const question = step === 1 ? c.quiz_q1 : step === 2 ? c.quiz_q2 : c.quiz_q3;
        const opts = step === 1 ? c.quiz_q1_opts : step === 2 ? c.quiz_q2_opts : c.quiz_q3_opts;
        const pct = step === 1 ? 33 : step === 2 ? 66 : 100;

        view.innerHTML = `
            <div class="rounded-2xl bg-white dark:bg-carbon-800 border border-champagne/25 p-3.5 shadow-sm space-y-3 ai-msg-enter">
                <div class="flex items-center justify-between text-[11px] font-black">
                    <span class="text-champagne-dark dark:text-champagne">${escHtml(c.quiz_step_lbl(step, 3))}</span>
                    <span class="opacity-60">${pct}%</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-carbon-900/10 dark:bg-white/10 overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-champagne to-sea transition-all duration-300" style="width:${pct}%"></div>
                </div>
                <h4 class="text-sm font-black leading-snug">${escHtml(question)}</h4>
                <div class="grid grid-cols-1 gap-2">
                    ${opts.map(o => `
                        <button type="button" data-ai-action="quiz-pick" data-step="${step}" data-val="${escHtml(o.id)}"
                            class="w-full p-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 hover:border-champagne text-start flex items-center gap-3 transition">
                            <span class="w-9 h-9 rounded-lg bg-white dark:bg-carbon-800 flex items-center justify-center text-base shrink-0 shadow-sm">${o.icon}</span>
                            <span class="min-w-0 flex-1">
                                <span class="block text-xs font-black">${escHtml(o.title)}</span>
                                <span class="block text-[10px] opacity-70 truncate">${escHtml(o.sub)}</span>
                            </span>
                        </button>
                    `).join("")}
                </div>
                ${step > 1 ? `<button type="button" data-ai-action="quiz-reset" class="text-[11px] font-bold opacity-65 hover:opacity-100 underline">${escHtml(c.quiz_retake)}</button>` : ""}
            </div>
        `;
        return;
    }

    // Step 4: Personalized Results
    const ranked = scoreQuizCatalog();
    const top1 = ranked[0]?.trip;
    const top2 = ranked[1]?.trip;
    const partyOpt = c.quiz_q1_opts.find(o => o.id === aiSession.quizAnswers.party) || c.quiz_q1_opts[1];
    const adults = partyOpt.adults;
    const children = partyOpt.children;
    const slot = aiSession.quizAnswers.time === "morning" ? "morning" : "evening";
    const quote1 = top1 ? computeAiQuote([top1.id], adults, children, "MOSA20") : null;

    view.innerHTML = `
        <div class="space-y-2.5 ai-msg-enter">
            <div class="flex items-center justify-between">
                <h4 class="text-xs font-black text-champagne-dark dark:text-champagne">${escHtml(c.quiz_result_title)}</h4>
                <button type="button" data-ai-action="quiz-reset" class="px-2 py-1 rounded-lg bg-carbon-900/10 dark:bg-white/10 text-[10px] font-black">${escHtml(c.quiz_retake)}</button>
            </div>
            ${top1 && quote1 ? `
                <div class="rounded-2xl border-2 border-champagne bg-white dark:bg-carbon-800 p-3 shadow-lg space-y-2.5">
                    <div class="flex items-center justify-between gap-2">
                        <span class="px-2 py-0.5 rounded-md bg-champagne text-carbon-950 text-[10px] font-black">${escHtml(c.quiz_best_badge)}</span>
                        <span class="text-[11px] font-black text-sea-dark dark:text-sea">${escHtml(fmtPrice(quote1.netUsd))} <span class="text-[10px] opacity-70">(${escHtml(c.ctx_guests(adults, children))})</span></span>
                    </div>
                    <div class="flex items-center gap-2.5">
                        <img src="${escHtml(top1.img)}" alt="${escHtml(getTripTitle(top1, lang))}" class="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div class="min-w-0">
                            <div class="text-xs font-black leading-snug">${escHtml(getTripTitle(top1, lang))}</div>
                            <div class="text-[10px] opacity-70 mt-0.5">${escHtml(getTripDuration(top1, lang))} · ${escHtml(top1.vehicle)} · ★ ${top1.rating}</div>
                        </div>
                    </div>
                    ${(adults + children >= 5) ? `<div class="p-2 rounded-lg bg-sea/15 text-sea text-[10px] font-extrabold">${escHtml(c.quiz_group_tip)}</div>` : ""}
                    <button type="button" data-ai-action="book-chat-quote" data-trip-ids="${escHtml(top1.id)}" data-adults="${adults}" data-children="${children}" data-slot="${slot}" data-promo="MOSA20"
                        class="w-full py-2 px-3 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black transition">${escHtml(c.quiz_book_cta)}</button>
                </div>
            ` : ""}
            ${top2 ? `
                <div class="rounded-xl border border-carbon-900/10 dark:border-white/10 bg-white dark:bg-carbon-800 p-2.5">
                    <div class="text-[10px] font-black text-sea mb-1.5">${escHtml(c.quiz_runner_badge)}</div>
                    ${renderTourCardHtml(top2, lang, true)}
                </div>
            ` : ""}
        </div>
    `;
}

function renderQuoteBuilderView() {
    const view = document.getElementById("ai-quote-view");
    if (!view) return;
    const lang = getAiLang();
    const c = getCopy(lang);
    const catalog = activeCatalog();
    const q = aiSession.quote;
    const defaultPromo = state.platformConfig?.promos?.find(p => p.active !== false)?.code || "MOSA20";
    const calc = computeAiQuote(q.tripIds, q.adults, q.children, q.usePromo ? (aiSession.promoCode || defaultPromo) : "");

    view.innerHTML = `
        <div class="space-y-3 ai-msg-enter">
            <div>
                <h4 class="text-xs font-black text-champagne-dark dark:text-champagne">${escHtml(c.qb_title)}</h4>
                <p class="text-[10px] opacity-70">${escHtml(c.qb_sub)}</p>
            </div>

            <div class="p-2.5 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-2">
                <div class="text-[10px] font-black opacity-75">${escHtml(c.qb_pick_tours)}</div>
                <div class="flex flex-wrap gap-1.5">
                    ${catalog.map(t => {
                        const active = q.tripIds.includes(t.id);
                        const fullT = getTripTitle(t, lang);
                        const shortT = fullT.includes(":") ? fullT.split(":").slice(1).join(":").trim() : fullT;
                        return `<button type="button" data-ai-action="quote-toggle-trip" data-trip-id="${escHtml(t.id)}"
                            class="px-2 py-1 rounded-lg border text-[10px] font-extrabold text-start transition ${active ? "border-champagne bg-champagne text-carbon-950 font-black" : "border-carbon-900/10 dark:border-white/10 hover:border-champagne/50"}">
                            ${escHtml(shortT)} · ${escHtml(fmtPrice(t.adultPrice))}
                        </button>`;
                    }).join("")}
                </div>
            </div>

            <div class="p-2.5 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-2">
                <div class="text-[10px] font-black opacity-75">${escHtml(c.qb_guests)}</div>
                <div class="grid grid-cols-2 gap-2">
                    <div class="p-2 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 flex items-center justify-between">
                        <span class="text-[10px] font-extrabold">${escHtml(c.qb_adults)}</span>
                        <div class="flex items-center gap-1.5">
                            <button type="button" data-ai-action="quote-step" data-field="adults" data-delta="-1" class="w-6 h-6 rounded bg-white dark:bg-carbon-800 font-black text-xs border border-carbon-900/10 dark:border-white/10">−</button>
                            <span class="w-5 text-center font-black text-xs">${q.adults}</span>
                            <button type="button" data-ai-action="quote-step" data-field="adults" data-delta="1" class="w-6 h-6 rounded bg-champagne text-carbon-950 font-black text-xs">+</button>
                        </div>
                    </div>
                    <div class="p-2 rounded-lg bg-[#F6F3EC] dark:bg-carbon-900 flex items-center justify-between">
                        <span class="text-[10px] font-extrabold">${escHtml(c.qb_children)}</span>
                        <div class="flex items-center gap-1.5">
                            <button type="button" data-ai-action="quote-step" data-field="children" data-delta="-1" class="w-6 h-6 rounded bg-white dark:bg-carbon-800 font-black text-xs border border-carbon-900/10 dark:border-white/10">−</button>
                            <span class="w-5 text-center font-black text-xs">${q.children}</span>
                            <button type="button" data-ai-action="quote-step" data-field="children" data-delta="1" class="w-6 h-6 rounded bg-champagne text-carbon-950 font-black text-xs">+</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-2.5 rounded-xl bg-white dark:bg-carbon-800 border border-carbon-900/10 dark:border-white/10 space-y-2">
                <div class="text-[10px] font-black opacity-75">${escHtml(c.qb_slot)}</div>
                <div class="grid grid-cols-2 gap-2">
                    <button type="button" data-ai-action="quote-slot" data-slot="morning"
                        class="py-1.5 px-2 rounded-lg border text-[11px] font-black transition ${q.slot !== "evening" ? "border-champagne bg-champagne/15 text-champagne-dark dark:text-champagne" : "border-carbon-900/10 dark:border-white/10"}">☀️ ${escHtml(c.qb_morning)}</button>
                    <button type="button" data-ai-action="quote-slot" data-slot="evening"
                        class="py-1.5 px-2 rounded-lg border text-[11px] font-black transition ${q.slot === "evening" ? "border-champagne bg-champagne/15 text-champagne-dark dark:text-champagne" : "border-carbon-900/10 dark:border-white/10"}">🌙 ${escHtml(c.qb_evening)}</button>
                </div>
                <label class="flex items-center justify-between gap-2 pt-1 cursor-pointer">
                    <span class="text-[11px] font-extrabold text-sea-dark dark:text-sea">${escHtml(c.qb_promo_lbl)}</span>
                    <input type="checkbox" data-ai-action="quote-promo-toggle" ${q.usePromo ? "checked" : ""} class="accent-champagne w-4 h-4" />
                </label>
            </div>

            ${renderQuoteCardHtml(calc, lang, q.slot, true)}
        </div>
    `;
}

export function switchAiMode(mode) {
    if (!["chat", "matcher", "quote"].includes(mode)) mode = "chat";
    aiSession.mode = mode;

    document.querySelectorAll("#ai-mode-tabs .ai-mode-btn").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.aiMode === mode);
    });

    document.getElementById("ai-chat-view")?.classList.toggle("hidden", mode !== "chat");
    document.getElementById("ai-matcher-view")?.classList.toggle("hidden", mode !== "matcher");
    document.getElementById("ai-quote-view")?.classList.toggle("hidden", mode !== "quote");

    if (mode === "matcher") renderMatcherView();
    if (mode === "quote") renderQuoteBuilderView();
}

function toggleVoiceInput() {
    const btn = document.getElementById("ai-mic-btn");
    const input = document.getElementById("ai-input");
    const c = getCopy(getAiLang());
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
        showToast(c.voice_unsupported, "error");
        return;
    }

    if (activeRecognition) {
        activeRecognition.stop();
        return;
    }

    const langMap = { ar: "ar-EG", en: "en-US", it: "it-IT", ru: "ru-RU" };
    const rec = new SpeechRec();
    rec.lang = langMap[getAiLang()] || "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    activeRecognition = rec;

    btn?.classList.add("ai-mic-recording");
    if (input) input.placeholder = c.voice_listening;

    let finalTranscript = "";
    rec.onresult = ev => {
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const tr = ev.results[i][0]?.transcript || "";
            if (ev.results[i].isFinal) finalTranscript += tr;
            else interim += tr;
        }
        if (input) input.value = (finalTranscript || interim).trim();
    };

    rec.onerror = () => {
        showToast(c.voice_err, "error");
    };

    rec.onend = () => {
        activeRecognition = null;
        btn?.classList.remove("ai-mic-recording");
        if (input) {
            input.placeholder = (I18N[getAiLang()] || I18N.en).ai_placeholder;
            const text = (finalTranscript || input.value || "").trim();
            if (text) {
                input.value = "";
                handleAiQuery(text);
            }
        }
    };

    try {
        rec.start();
    } catch {
        activeRecognition = null;
        btn?.classList.remove("ai-mic-recording");
    }
}

function resetAiConversation() {
    aiSession.adults = null;
    aiSession.children = null;
    aiSession.slot = null;
    aiSession.vibe = null;
    aiSession.maxBudgetUsd = null;
    aiSession.promoCode = "";
    aiSession.lastTripIds = [];
    aiSession.quizStep = 1;
    aiSession.quizAnswers = { party: null, time: null, style: null };

    const box = document.getElementById("ai-messages");
    if (box) box.innerHTML = "";

    renderContextMemoryBar();
    updateDynamicChips("default");
    syncWhatsAppConciergeLink();

    const lang = getAiLang();
    appendAiMsg(AI_GREETINGS[lang] || AI_GREETINGS.en, "bot");
    if (aiSession.mode === "matcher") renderMatcherView();
    if (aiSession.mode === "quote") renderQuoteBuilderView();
}

export function refreshAiAssistantUI() {
    if (typeof document === "undefined") return;
    renderContextMemoryBar();
    updateDynamicChips(aiSession.lastChipKey || "default");
    syncWhatsAppConciergeLink();
    if (aiSession.mode === "matcher") renderMatcherView();
    if (aiSession.mode === "quote") renderQuoteBuilderView();
}

export function toggleAiWidget(force = null) {
    const p = document.getElementById("ai-chat-panel");
    const backdrop = document.getElementById("ai-backdrop");
    if (!p) return;
    const isHidden = p.classList.contains("hidden");
    const shouldOpen = force === true || (force === null && isHidden);

    if (shouldOpen) {
        const sel = document.getElementById("ai-lang-select");
        const msgs = document.getElementById("ai-messages");
        if (sel && msgs && !msgs.children.length) {
            sel.value = state.lang;
        }
        p.classList.remove("hidden");
        if (backdrop) backdrop.classList.remove("hidden");
        if (window.innerWidth < 640) {
            document.body.classList.add("ai-sheet-open");
        }
        if (msgs && !msgs.children.length) {
            appendAiMsg(AI_GREETINGS[getAiLang()], "bot");
            updateDynamicChips("default");
        }
        syncWhatsAppConciergeLink();
        setTimeout(() => document.getElementById("ai-input")?.focus({ preventScroll: true }), 120);
    } else {
        p.classList.add("hidden");
        if (backdrop) backdrop.classList.add("hidden");
        document.body.classList.remove("ai-sheet-open");
    }
}

export function initAiAssistant() {
    if (initialized || typeof document === "undefined") return;
    initialized = true;

    const micBtn = document.getElementById("ai-mic-btn");
    if (micBtn && !(window.SpeechRecognition || window.webkitSpeechRecognition)) {
        micBtn.classList.add("hidden");
    }

    document.getElementById("ai-fab")?.addEventListener("click", () => toggleAiWidget());
    document.getElementById("ai-close-btn")?.addEventListener("click", () => toggleAiWidget(false));
    document.getElementById("ai-lang-select")?.addEventListener("change", e => {
        const nextLang = e.target.value;
        appendAiMsg(AI_GREETINGS[nextLang] || AI_GREETINGS.en, "bot");
        refreshAiAssistantUI();
    });

    document.getElementById("ai-form")?.addEventListener("submit", e => {
        e.preventDefault();
        const input = document.getElementById("ai-input");
        if (!input || !input.value.trim()) return;
        const val = input.value.trim();
        input.value = "";
        handleAiQuery(val);
    });

    // Unified event delegation inside #ai-chat-panel
    const panel = document.getElementById("ai-chat-panel");
    panel?.addEventListener("change", e => {
        const promoToggle = e.target.closest('[data-ai-action="quote-promo-toggle"]');
        if (promoToggle) {
            aiSession.quote.usePromo = promoToggle.checked;
            renderQuoteBuilderView();
        }
    });

    panel?.addEventListener("click", e => {
        const modeBtn = e.target.closest("[data-ai-mode]");
        if (modeBtn) {
            switchAiMode(modeBtn.dataset.aiMode);
            return;
        }

        const actEl = e.target.closest("[data-ai-action]");
        if (!actEl) return;
        const action = actEl.dataset.aiAction;

        if (action === "toggle-expand") {
            aiSession.expanded = !aiSession.expanded;
            panel.classList.toggle("ai-expanded", aiSession.expanded);
        } else if (action === "reset-chat") {
            resetAiConversation();
            showToast(getCopy(getAiLang()).reset_done);
        } else if (action === "clear-context") {
            aiSession.adults = null;
            aiSession.children = null;
            aiSession.slot = null;
            aiSession.maxBudgetUsd = null;
            aiSession.promoCode = "";
            renderContextMemoryBar();
            syncWhatsAppConciergeLink();
        } else if (action === "toggle-voice") {
            toggleVoiceInput();
        } else if (action === "chip-query") {
            handleAiQuery(actEl.textContent.trim());
        } else if (action === "book-trip") {
            const id = actEl.dataset.tripId;
            if (id) launchBookingWithPrefs({ tripIds: [id] });
        } else if (action === "book-chat-quote") {
            const tripIds = String(actEl.dataset.tripIds || "").split(",").filter(Boolean);
            const adults = parseInt(actEl.dataset.adults, 10);
            const children = parseInt(actEl.dataset.children, 10);
            const slot = actEl.dataset.slot || "morning";
            const promoCode = actEl.dataset.promo || "";
            launchBookingWithPrefs({ tripIds, adults, children, slot, promoCode });
        } else if (action === "compare-trip") {
            const id = actEl.dataset.tripId;
            const catalog = activeCatalog();
            const first = catalog.find(t => t.id === id);
            if (!first) return;
            const secondId = aiSession.lastTripIds.find(x => x !== id) || (id === "sharm-sunset-echo" ? "sharm-double-thrill" : "sharm-sunset-echo");
            const second = catalog.find(t => t.id === secondId) || catalog.find(t => t.id !== id);
            if (second) {
                const c = getCopy(getAiLang());
                appendAiMsg(c.msgs.compare_intro, "bot", { comparePair: [first, second] });
                updateDynamicChips("compare");
            }
        } else if (action === "open-quote-trip") {
            const id = actEl.dataset.tripId;
            if (id) aiSession.quote.tripIds = [id];
            switchAiMode("quote");
        } else if (action === "apply-promo") {
            const code = actEl.dataset.code || "MOSA20";
            state.booking.promoCode = code;
            aiSession.promoCode = code;
            renderContextMemoryBar();
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(code).catch(() => {});
            }
            showToast(getCopy(getAiLang()).promo_copied(code));
        } else if (action === "quiz-pick") {
            const step = parseInt(actEl.dataset.step, 10);
            const val = actEl.dataset.val;
            if (step === 1) aiSession.quizAnswers.party = val;
            if (step === 2) aiSession.quizAnswers.time = val;
            if (step === 3) aiSession.quizAnswers.style = val;
            aiSession.quizStep = Math.min(4, step + 1);
            renderMatcherView();
        } else if (action === "quiz-reset") {
            aiSession.quizStep = 1;
            aiSession.quizAnswers = { party: null, time: null, style: null };
            renderMatcherView();
        } else if (action === "quote-toggle-trip") {
            const id = actEl.dataset.tripId;
            const list = aiSession.quote.tripIds;
            const idx = list.indexOf(id);
            if (idx > -1) {
                if (list.length > 1) list.splice(idx, 1);
            } else {
                list.push(id);
            }
            renderQuoteBuilderView();
        } else if (action === "quote-step") {
            const field = actEl.dataset.field;
            const delta = parseInt(actEl.dataset.delta, 10) || 0;
            if (field === "adults") {
                aiSession.quote.adults = Math.max(1, Math.min(30, aiSession.quote.adults + delta));
            } else if (field === "children") {
                aiSession.quote.children = Math.max(0, Math.min(20, aiSession.quote.children + delta));
            }
            renderQuoteBuilderView();
        } else if (action === "quote-slot") {
            aiSession.quote.slot = actEl.dataset.slot === "evening" ? "evening" : "morning";
            renderQuoteBuilderView();
        }
    });
}
