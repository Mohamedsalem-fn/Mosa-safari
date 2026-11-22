/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

import { SAFARI_TRIPS } from "../data/trips.js";
import { I18N, STEP_TITLES_I18N, BOOKING_I18N } from "../data/i18n.js";
import { state, fmtPrice } from "../state.js";
import { getTripTitle, getTripDuration } from "./trips.js";
import { showToast } from "./ui.js";
import { dispatchBookingNotifications } from "./notifications.js";

export const UI_EXTRAs = {
    ar: {
        step_pills: ["1. الرحلات", "2. المسافر", "3. الضيوف", "4. الفندق والدفع", "5. التأكيد"],
        email_req: "البريد الإلكتروني * (لإرسال تذكرة التأكيد)",
        email_hint: "سيتم إرسال تفاصيل وتأكيد الحجز فوراً على هذا الإيميل",
        pay_section_title: "اختر طريقة الدفع",
        pay_arrival_title: "الدفع عند الوصول (Pay on Arrival)",
        pay_arrival_desc: "ادفع نقداً أو بالبطاقة لمندوبنا يوم الرحلة عند الاستلام من الفندق بدون أي دفعة مقدمة.",
        pay_Arrival_badge: "الأكثر مرونة · 0% مقدم",
        pay_visa_title: "الدفع بالفيزا / البطاقة البنكية (Visa / Mastercard)",
        pay_visa_desc: "دفع إلكتروني آمن ومباشر بالبطاقة البنكية (بوابة الدفع قيد التفعيل المباشر).",
        pay_visa_badge: "بوابة الفيزا · Placeholder جاهز للربط",
        visa_box_header: "بيانات بطاقة الفيزا / ماستركارد (وضع المعاينة — Placeholder)",
        visa_box_notice: "بوابة الدفع الإلكتروني بالفيزا مجهزة برمجياً كـ Placeholder؛ يمكنك إتمام الحجز الآن وسيتم تسجيل طلبك وإرسال التأكيد فوراً بدون خصم مالي حتى ربط البوابة البنكية.",
        card_holder: "الاسم على البطاقة",
        card_number: "رقم البطاقة (16 رقم)",
        card_expiry: "تاريخ الانتهاء (MM/YY)",
        card_cvv: "رمز الأمان (CVV)",
        group_disc_badge: "🎉 تم تطبيق خصم المجموعات التلقائي (10% لـ 5 أفراد أو أكثر)!",
        promo_applied_badge: "✓ كود الخصم MOSA20 مفعّل (خصم 20%)",
        sending_booking: "جاري تأكيد الحجز...",
        conf_title: "تم تأكيد حجزك بنجاح!",
        conf_email_ok: "✓ تم إرسال تفاصيل وتأكيد الحجز إلى بريدك الإلكتروني",
        conf_new_btn: "حجز جديد / إغلاق",
        err_invalid_email: "يرجى إدخال بريد إلكتروني صحيح لإرسال رسالة التأكيد"
    },
    en: {
        step_pills: ["1. Tours", "2. Traveler", "3. Guests", "4. Hotel & Payment", "5. Review"],
        email_req: "Email Address * (For Booking Confirmation)",
        email_hint: "Your instant booking confirmation ticket will be sent to this email",
        pay_section_title: "Select Payment Method",
        pay_arrival_title: "Pay on Arrival",
        pay_arrival_desc: "Pay cash or card directly to our representative at hotel pickup on tour day with zero deposit.",
        pay_Arrival_badge: "Most Flexible · $0 Upfront",
        pay_visa_title: "Pay with Visa / Mastercard",
        pay_visa_desc: "Direct credit/debit card checkout (Gateway integration placeholder ready).",
        pay_visa_badge: "Visa Gateway · Placeholder Ready",
        visa_box_header: "Visa / Mastercard Checkout (Gateway Placeholder)",
        visa_box_notice: "The Visa payment gateway is currently in placeholder mode. Complete your booking now to lock in your reservation and receive instant confirmation without an immediate charge.",
        card_holder: "Cardholder Name",
        card_number: "Card Number (16 digits)",
        card_expiry: "Expiry Date (MM/YY)",
        card_cvv: "Security Code (CVV)",
        group_disc_badge: "🎉 Automatic 10% Group Discount Applied (5+ Guests)!",
        promo_applied_badge: "✓ Promo Code MOSA20 Active (20% OFF)",
        sending_booking: "Confirming your booking...",
        conf_title: "Booking Confirmed Successfully!",
        conf_email_ok: "✓ Booking confirmation sent to your email",
        conf_new_btn: "Done / Close",
        err_invalid_email: "Please enter a valid email address to receive your confirmation"
    },
    it: {
        step_pills: ["1. Tour", "2. Viaggiatore", "3. Ospiti", "4. Hotel & Pagamento", "5. Conferma"],
        email_req: "Indirizzo Email * (Per Conferma Prenotazione)",
        email_hint: "Il voucher di conferma verrà inviato istantaneamente a questa email",
        pay_section_title: "Scegli il Metodo di Pagamento",
        pay_arrival_title: "Pagamento all'Arrivo (Pay on Arrival)",
        pay_arrival_desc: "Paga in contanti o carta direttamente alla guida il giorno del tour in hotel senza anticipo.",
        pay_Arrival_badge: "Più Flessibile · Zero Acconto",
        pay_visa_title: "Paga con Visa / Mastercard",
        pay_visa_desc: "Pagamento elettronico con carta (Gateway Visa in modalità placeholder).",
        pay_visa_badge: "Gateway Visa · Placeholder",
        visa_box_header: "Dati Carta Visa / Mastercard (Placeholder)",
        visa_box_notice: "Il gateway Visa è predisposto come placeholder: puoi confermare ora la prenotazione senza addebito immediato e ricevere subito la conferma.",
        card_holder: "Titolare della Carta",
        card_number: "Numero Carta",
        card_expiry: "Scadenza (MM/AA)",
        card_cvv: "Codice CVV",
        group_disc_badge: "🎉 Sconto Gruppo 10% Applicato (5+ Ospiti)!",
        promo_applied_badge: "✓ Codice MOSA20 Attivo (20% di Sconto)",
        sending_booking: "Conferma in corso...",
        conf_title: "Prenotazione Confermata!",
        conf_email_ok: "✓ Conferma inviata alla tua email",
        conf_new_btn: "Chiudi",
        err_invalid_email: "Inserisci un indirizzo email valido per ricevere la conferma"
    },
    ru: {
        step_pills: ["1. Туры", "2. Турист", "3. Гости", "4. Отель и Оплата", "5. Подтверждение"],
        email_req: "Эл. почта * (для отправки подтверждения)",
        email_hint: "Ваучер подтверждения бронирования будет отправлен на этот email",
        pay_section_title: "Выберите способ оплаты",
        pay_arrival_title: "Оплата при получении (Pay on Arrival)",
        pay_arrival_desc: "Оплата наличными или картой гиду в день тура при выезде из отеля без предоплаты.",
        pay_Arrival_badge: "Без предоплаты · 0%",
        pay_visa_title: "Оплата картой Visa / Mastercard",
        pay_visa_desc: "Онлайн-оплата банковской картой (платёжный шлюз в режиме Placeholder).",
        pay_visa_badge: "Шлюз Visa · Placeholder",
        visa_box_header: "Данные карты Visa / Mastercard (Placeholder)",
        visa_box_notice: "Платёжный шлюз Visa подготовлен для прямой интеграции. Вы можете завершить бронирование сейчас без списания средств и мгновенно получить подтверждение.",
        card_holder: "Имя владельца карты",
        card_number: "Номер карты",
        card_expiry: "Срок (MM/YY)",
        card_cvv: "Код CVV",
        group_disc_badge: "🎉 Применена групповая скидка 10% (5+ гостей)!",
        promo_applied_badge: "✓ Промокод MOSA20 активен (скидка 20%)",
        sending_booking: "Подтверждение брони...",
        conf_title: "Бронирование успешно подтверждено!",
        conf_email_ok: "✓ Подтверждение отправлено на ваш email",
        conf_new_btn: "Закрыть",
        err_invalid_email: "Пожалуйста, введите корректный email для получения подтверждения"
    }
};

export function calcBookingTotal() {
    const sel = SAFARI_TRIPS.filter(t => state.booking.selectedIds.includes(t.id));
    let total = sel.reduce((s, t) => s + t.adultPrice, 0) * Math.max(1, state.booking.adults + state.booking.children * 0.5);
    if (state.booking.adults + state.booking.children >= 5) total *= 0.9;
    if (state.booking.promoCode.trim().toUpperCase() === "MOSA20") total *= 0.8;
    return total;
}

export function openBookingWithTrip(id) {
    const t = SAFARI_TRIPS.find(x => x.id === id);
    if (t) {
        state.booking.selectedIds = [t.id];
    }
    state.booking.lastConfirmation = null;
    state.booking.step = 2;
    openBookingModal();
}

export function openBookingModal() {
    state.booking.lastConfirmation = null;
    document.getElementById("booking-modal")?.classList.remove("hidden");
    renderBookingStep();
}

export function closeBookingModal() {
    document.getElementById("booking-modal")?.classList.add("hidden");
    state.booking.lastConfirmation = null;
    state.booking.isSubmitting = false;
}

export function toggleBookingTrip(id) {
    const a = state.booking.selectedIds;
    const i = a.indexOf(id);
    if (i > -1) {
        if (a.length > 1) a.splice(i, 1);
    } else {
        a.push(id);
    }
    renderBookingStep();
}

export function adjustGuests(field, delta) {
    if (field === "adults") {
        state.booking.adults = Math.max(1, Math.min(30, state.booking.adults + delta));
    } else if (field === "children") {
        state.booking.children = Math.max(0, Math.min(20, state.booking.children + delta));
    }
    renderBookingStep();
}

export function selectPaymentMethod(method) {
    saveCurrentStepInputs();
    state.booking.paymentMethod = method;
    renderBookingStep();
}

export function formatCardNumberInput(input) {
    const digits = input.value.replace(/\D/g, "").slice(0, 16);
    const groups = digits.match(/.{1,4}/g) || [];
    input.value = groups.join(" ");
    state.booking.cardNumber = input.value;
}

export function formatCardExpiryInput(input) {
    const digits = input.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
        input.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
        input.value = digits;
    }
    state.booking.cardExpiry = input.value;
}

export function applyPromoCode() {
    const input = document.getElementById("bk-promo");
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    state.booking.promoCode = code;
    renderBookingStep();
    if (code === "MOSA20") {
        showToast(I18N[state.lang].toast_promo_ok);
    } else {
        showToast(I18N[state.lang].toast_promo_err, "error");
    }
}

export function saveCurrentStepInputs() {
    const b = state.booking;
    const nm = document.getElementById("bk-name");
    const ph = document.getElementById("bk-phone");
    const em = document.getElementById("bk-email");
    const nt = document.getElementById("bk-nat");
    if (nm) b.name = nm.value.trim();
    if (ph) b.phone = ph.value.trim();
    if (em) b.email = em.value.trim();
    if (nt) b.nationality = nt.value.trim();

    const ht = document.getElementById("bk-hotel");
    const dt = document.getElementById("bk-date");
    if (ht) b.pickupHotel = ht.value.trim();
    if (dt) b.tripDate = dt.value;

    const ch = document.getElementById("bk-card-holder");
    const cn = document.getElementById("bk-card-number");
    const ce = document.getElementById("bk-card-expiry");
    const cv = document.getElementById("bk-card-cvv");
    if (ch) b.cardHolder = ch.value.trim();
    if (cn) b.cardNumber = cn.value.trim();
    if (ce) b.cardExpiry = ce.value.trim();
    if (cv) b.cardCvv = cv.value.trim();
}

export async function submitBookingOrder() {
    const b = state.booking;
    if (b.isSubmitting) return;
    saveCurrentStepInputs();

    const u = UI_EXTRAs[state.lang] || UI_EXTRAs.en;
    const t = BOOKING_I18N[state.lang] || BOOKING_I18N.en;

    b.isSubmitting = true;
    renderBookingStep();

    const ref = "MOSA-" + Math.floor(100000 + Math.random() * 900000);
    const selectedTrips = SAFARI_TRIPS.filter(trip => b.selectedIds.includes(trip.id));
    const selectedTours = selectedTrips.map(trip => getTripTitle(trip)).join(" + ");
    const vehicleDisplay = t.vehicles[b.vehicleOpt] || b.vehicleOpt;
    const totalFormatted = fmtPrice(calcBookingTotal());
    const today = new Date().toISOString().split("T")[0];
    const last4 = b.cardNumber ? b.cardNumber.replace(/\D/g, "").slice(-4) : "";

    const payload = {
        ref,
        lang: state.lang,
        name: b.name,
        phone: b.phone,
        email: b.email,
        nationality: b.nationality,
        adults: b.adults,
        children: b.children,
        vehicleOpt: b.vehicleOpt,
        vehicleDisplay,
        pickupHotel: b.pickupHotel || "Sharm El Sheikh",
        tripDate: b.tripDate || today,
        paymentMethod: b.paymentMethod,
        cardMask: last4 ? `**** ${last4}` : "Visa Placeholder",
        promoCode: b.promoCode,
        selectedTours,
        totalFormatted
    };

    const notifyStatus = await dispatchBookingNotifications(payload);

    b.isSubmitting = false;
    b.lastConfirmation = {
        ...payload,
        whatsappSent: notifyStatus.whatsappSent,
        customerWaSent: notifyStatus.customerWaSent,
        emailSent: notifyStatus.emailSent
    };

    showToast(`${I18N[state.lang].toast_bk_ok} ${ref}`);
    renderBookingStep();
}

export function renderBookingStep() {
    const b = state.booking;
    const t = BOOKING_I18N[state.lang] || BOOKING_I18N.en;
    const u = UI_EXTRAs[state.lang] || UI_EXTRAs.en;
    const stepTitles = STEP_TITLES_I18N[state.lang] || STEP_TITLES_I18N.en;

    const lbl = document.getElementById("booking-step-label");
    if (lbl) lbl.textContent = b.lastConfirmation ? u.conf_title : stepTitles[b.step - 1];

    const tot = document.getElementById("booking-total-display");
    if (tot) tot.textContent = fmtPrice(calcBookingTotal());

    // Interactive step pills bar
    const bars = document.getElementById("booking-progress-bars");
    if (bars) {
        bars.innerHTML = u.step_pills
            .map((pillLabel, idx) => {
                const n = idx + 1;
                const isDone = b.lastConfirmation || n < b.step;
                const isCurrent = !b.lastConfirmation && n === b.step;
                return `<div class="flex flex-col gap-1">
                    <div class="h-1.5 rounded-full transition-all duration-300 ${isDone ? 'bg-sea' : isCurrent ? 'bg-champagne' : 'bg-carbon-900/15 dark:bg-white/10'}"></div>
                    <span class="text-[10px] font-extrabold truncate ${isCurrent ? 'text-champagne-dark dark:text-champagne' : isDone ? 'text-sea' : 'opacity-45'}">${pillLabel}</span>
                </div>`;
            })
            .join("");
    }

    const prevBtn = document.getElementById("booking-prev-btn");
    const nextBtn = document.getElementById("booking-next-btn");

    const body = document.getElementById("booking-body");
    if (!body) return;

    // If booking was just confirmed, show the rich confirmation screen inside the modal
    if (b.lastConfirmation) {
        const c = b.lastConfirmation;
        if (prevBtn) prevBtn.classList.add("hidden");
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = u.conf_new_btn;
        }

        body.innerHTML = `<div class="py-3 space-y-4 text-center">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-sea/15 border border-sea/40 text-sea flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div>
                <span class="inline-block px-3 py-1 rounded-full bg-champagne/20 text-champagne-dark dark:text-champagne text-xs font-black tracking-wider">${c.ref}</span>
                <h4 class="text-xl font-black mt-2">${u.conf_title}</h4>
            </div>

            <div class="p-3 rounded-xl bg-champagne/15 border border-champagne/35 text-champagne-dark dark:text-champagne font-bold text-xs flex items-center justify-center gap-2">
                <span class="w-2 h-2 rounded-full bg-champagne shrink-0"></span>
                <span>${u.conf_email_ok} (${c.email})</span>
            </div>

            <div class="p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-start text-xs sm:text-sm space-y-2">
                <div class="flex justify-between gap-2 border-b border-carbon-900/10 dark:border-white/10 pb-2">
                    <span class="opacity-70">${t.sum_tours}</span>
                    <span class="font-black text-end">${c.selectedTours}</span>
                </div>
                <div class="flex justify-between gap-2">
                    <span class="opacity-70">${t.full_name.replace(" *", "")}:</span>
                    <span class="font-bold">${c.name} (${c.phone})</span>
                </div>
                <div class="flex justify-between gap-2">
                    <span class="opacity-70">${t.sum_guests}</span>
                    <span class="font-bold">${c.adults} ${t.adults_lbl}${c.children ? ` · ${c.children} ${t.children_lbl}` : ""}</span>
                </div>
                <div class="flex justify-between gap-2">
                    <span class="opacity-70">${t.sum_hotel}</span>
                    <span class="font-bold">${c.pickupHotel} (${c.tripDate})</span>
                </div>
                <div class="flex justify-between gap-2">
                    <span class="opacity-70">${t.sum_payment}</span>
                    <span class="font-black ${c.paymentMethod === 'visa' ? 'text-champagne-dark dark:text-champagne' : 'text-sea'}">${c.paymentMethod === 'visa' ? u.pay_visa_title : u.pay_arrival_title}</span>
                </div>
                <div class="flex justify-between gap-2 pt-2 border-t border-carbon-900/10 dark:border-white/10 text-base">
                    <span class="font-black">${I18N[state.lang].bk_est_total}:</span>
                    <span class="font-black text-champagne-dark dark:text-champagne">${c.totalFormatted}</span>
                </div>
            </div>
        </div>`;
        return;
    }

    if (prevBtn) prevBtn.classList.toggle("hidden", b.step === 1 || b.isSubmitting);
    if (nextBtn) {
        nextBtn.disabled = b.isSubmitting;
        nextBtn.textContent = b.isSubmitting
            ? u.sending_booking
            : (b.step === 5 ? I18N[state.lang].bk_confirm : I18N[state.lang].bk_next);
    }

    if (b.step === 1) {
        body.innerHTML = `<div class="grid grid-cols-1 gap-2.5">${SAFARI_TRIPS.map(trip => {
            const checked = b.selectedIds.includes(trip.id);
            return `<label class="flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${checked ? 'border-champagne bg-champagne/10 shadow-md' : 'border-carbon-900/10 dark:border-white/10 hover:border-champagne/50'}">
                <div class="flex items-center gap-3 min-w-0">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleBookingTrip('${trip.id}')" class="accent-champagne w-4 h-4 shrink-0" />
                    <img src="${trip.img}" alt="${getTripTitle(trip)}" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10" />
                    <div class="min-w-0">
                        <div class="text-xs sm:text-sm font-black truncate">${getTripTitle(trip)}</div>
                        <div class="text-[11px] opacity-65 mt-0.5">${getTripDuration(trip)} · ${trip.vehicle} · ★ ${trip.rating}</div>
                    </div>
                </div>
                <div class="text-end shrink-0">
                    <span class="block font-black text-sm text-champagne-dark dark:text-champagne">${fmtPrice(trip.adultPrice)}</span>
                    <span class="block text-[10px] opacity-60">${I18N[state.lang].from_label} ${fmtPrice(trip.fromPrice)}</span>
                </div>
            </label>`;
        }).join("")}</div>`;
    } else if (b.step === 2) {
        body.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-extrabold mb-1.5">${t.full_name}</label>
                <input id="bk-name" type="text" value="${b.name}" oninput="state.booking.name=this.value" onchange="state.booking.name=this.value" required placeholder="Mohamed..." class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-sm focus:border-champagne focus:outline-none" />
            </div>
            <div>
                <label class="block text-xs font-extrabold mb-1.5">${t.whatsapp}</label>
                <input id="bk-phone" type="tel" value="${b.phone}" oninput="state.booking.phone=this.value" onchange="state.booking.phone=this.value" required placeholder="+20 10..." class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-sm focus:border-champagne focus:outline-none" />
            </div>
            <div class="sm:col-span-2">
                <label class="block text-xs font-extrabold mb-1.5 text-champagne-dark dark:text-champagne">${u.email_req}</label>
                <input id="bk-email" type="email" value="${b.email}" oninput="state.booking.email=this.value" onchange="state.booking.email=this.value" required placeholder="name@example.com" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-champagne/40 text-sm focus:border-champagne focus:outline-none" />
                <span class="block text-[11px] opacity-65 mt-1">${u.email_hint}</span>
            </div>
            <div class="sm:col-span-2">
                <label class="block text-xs font-extrabold mb-1.5">${t.nationality}</label>
                <input id="bk-nat" type="text" value="${b.nationality}" oninput="state.booking.nationality=this.value" onchange="state.booking.nationality=this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-sm focus:border-champagne focus:outline-none" />
            </div>
        </div>`;
    } else if (b.step === 3) {
        const vehicleKeys = Object.keys(t.vehicles);
        const isGroup = b.adults + b.children >= 5;
        body.innerHTML = `<div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <div class="text-xs font-extrabold">${t.adults}</div>
                        <div class="text-[11px] opacity-60">12+</div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="adjustGuests('adults', -1)" class="w-8 h-8 rounded-lg bg-white dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-black text-base hover:border-champagne">−</button>
                        <span class="w-6 text-center font-black text-base">${b.adults}</span>
                        <button type="button" onclick="adjustGuests('adults', 1)" class="w-8 h-8 rounded-lg bg-champagne text-carbon-950 font-black text-base">+</button>
                    </div>
                </div>
                <div class="p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <div class="text-xs font-extrabold">${t.children}</div>
                        <div class="text-[11px] text-sea font-bold">6–11 (50% OFF)</div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="adjustGuests('children', -1)" class="w-8 h-8 rounded-lg bg-white dark:bg-carbon-800 border border-carbon-900/15 dark:border-white/15 font-black text-base hover:border-champagne">−</button>
                        <span class="w-6 text-center font-black text-base">${b.children}</span>
                        <button type="button" onclick="adjustGuests('children', 1)" class="w-8 h-8 rounded-lg bg-champagne text-carbon-950 font-black text-base">+</button>
                    </div>
                </div>
            </div>

            ${isGroup ? `<div class="p-3 rounded-xl bg-sea/15 border border-sea/30 text-sea text-xs font-extrabold">${u.group_disc_badge}</div>` : ""}

            <div>
                <label class="block text-xs font-extrabold mb-2">${t.vehicle_type}</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    ${vehicleKeys.map(v => {
                        const active = b.vehicleOpt === v;
                        return `<button type="button" onclick="state.booking.vehicleOpt='${v}'; renderBookingStep();" class="p-3.5 rounded-xl border text-start transition ${active ? 'border-champagne bg-champagne/15 font-black' : 'border-carbon-900/10 dark:border-white/10 hover:border-champagne/40'}">
                            <div class="text-xs sm:text-sm font-black">${t.vehicles[v]}</div>
                        </button>`;
                    }).join("")}
                </div>
            </div>
        </div>`;
    } else if (b.step === 4) {
        const today = new Date().toISOString().split("T")[0];
        const isArrival = b.paymentMethod === "arrival";
        const isVisa = b.paymentMethod === "visa";

        body.innerHTML = `<div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                    <label class="block text-xs font-extrabold mb-1.5">${t.pickup_hotel}</label>
                    <input id="bk-hotel" type="text" value="${b.pickupHotel}" oninput="state.booking.pickupHotel=this.value" onchange="state.booking.pickupHotel=this.value" placeholder="${t.hotel_placeholder}" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-sm focus:border-champagne focus:outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-extrabold mb-1.5">${t.trip_date}</label>
                    <input id="bk-date" type="date" min="${today}" value="${b.tripDate || today}" oninput="state.booking.tripDate=this.value" onchange="state.booking.tripDate=this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-sm focus:border-champagne focus:outline-none" />
                </div>
            </div>

            <div>
                <label class="block text-xs font-extrabold mb-2">${u.pay_section_title}</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <!-- Option 1: Pay on Arrival -->
                    <button type="button" onclick="selectPaymentMethod('arrival')" class="p-4 rounded-2xl border-2 text-start transition-all relative ${isArrival ? 'border-sea bg-sea/10 shadow-lg' : 'border-carbon-900/10 dark:border-white/10 hover:border-sea/50'}">
                        <div class="flex items-center justify-between gap-2 mb-1.5">
                            <span class="px-2 py-0.5 rounded-md bg-sea/20 text-sea text-[10px] font-black">${u.pay_Arrival_badge}</span>
                            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center ${isArrival ? 'border-sea bg-sea text-carbon-950' : 'border-white/30'}">${isArrival ? '✓' : ''}</span>
                        </div>
                        <div class="font-black text-sm text-sea">${u.pay_arrival_title}</div>
                        <div class="text-[11px] opacity-75 mt-1 leading-relaxed">${u.pay_arrival_desc}</div>
                    </button>

                    <!-- Option 2: Pay by Visa (Gateway Placeholder) -->
                    <button type="button" onclick="selectPaymentMethod('visa')" class="p-4 rounded-2xl border-2 text-start transition-all relative ${isVisa ? 'border-champagne bg-champagne/10 shadow-lg' : 'border-carbon-900/10 dark:border-white/10 hover:border-champagne/50'}">
                        <div class="flex items-center justify-between gap-2 mb-1.5">
                            <span class="px-2 py-0.5 rounded-md bg-champagne/20 text-champagne-dark dark:text-champagne text-[10px] font-black">${u.pay_visa_badge}</span>
                            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center ${isVisa ? 'border-champagne bg-champagne text-carbon-950' : 'border-white/30'}">${isVisa ? '✓' : ''}</span>
                        </div>
                        <div class="font-black text-sm text-champagne-dark dark:text-champagne">${u.pay_visa_title}</div>
                        <div class="text-[11px] opacity-75 mt-1 leading-relaxed">${u.pay_visa_desc}</div>
                    </button>
                </div>
            </div>

            ${isVisa ? `
            <!-- Interactive Visa Payment Gateway Placeholder Box (Ready for direct API hook) -->
            <div id="visa-gateway-placeholder" data-gateway-status="placeholder-ready" class="p-4 rounded-2xl bg-gradient-to-br from-carbon-900 to-carbon-950 text-white border border-champagne/40 space-y-3.5 shadow-xl">
                <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        <span class="text-xs font-black text-champagne">${u.visa_box_header}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-[10px] font-black">
                        <span class="px-2 py-0.5 rounded bg-blue-600 text-white">VISA</span>
                        <span class="px-2 py-0.5 rounded bg-amber-600 text-white">MC</span>
                    </div>
                </div>

                <div class="p-2.5 rounded-xl bg-champagne/10 border border-champagne/30 text-[11px] text-[#EDD29B] leading-relaxed">
                    ${u.visa_box_notice}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="sm:col-span-2">
                        <label class="block text-[11px] font-bold text-[#B5B0A8] mb-1">${u.card_holder}</label>
                        <input id="bk-card-holder" type="text" value="${b.cardHolder || b.name}" placeholder="MOHAMED SALEM" class="w-full px-3 py-2 rounded-lg bg-carbon-800 border border-white/15 text-xs font-bold uppercase tracking-wider text-white focus:border-champagne focus:outline-none" />
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-[11px] font-bold text-[#B5B0A8] mb-1">${u.card_number}</label>
                        <input id="bk-card-number" type="text" inputmode="numeric" maxlength="19" value="${b.cardNumber}" oninput="formatCardNumberInput(this)" placeholder="4532 •••• •••• ••••" class="w-full px-3 py-2 rounded-lg bg-carbon-800 border border-white/15 text-xs font-mono tracking-widest text-white focus:border-champagne focus:outline-none" />
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-[#B5B0A8] mb-1">${u.card_expiry}</label>
                        <input id="bk-card-expiry" type="text" inputmode="numeric" maxlength="5" value="${b.cardExpiry}" oninput="formatCardExpiryInput(this)" placeholder="08/28" class="w-full px-3 py-2 rounded-lg bg-carbon-800 border border-white/15 text-xs font-mono text-white focus:border-champagne focus:outline-none" />
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-[#B5B0A8] mb-1">${u.card_cvv}</label>
                        <input id="bk-card-cvv" type="password" inputmode="numeric" maxlength="4" value="${b.cardCvv}" placeholder="•••" class="w-full px-3 py-2 rounded-lg bg-carbon-800 border border-white/15 text-xs font-mono text-white focus:border-champagne focus:outline-none" />
                    </div>
                </div>
            </div>
            ` : ""}
        </div>`;
    } else if (b.step === 5) {
        const ch = SAFARI_TRIPS.filter(trip => b.selectedIds.includes(trip.id));
        const vehicleDisplay = t.vehicles[b.vehicleOpt] || b.vehicleOpt;
        const promoActive = b.promoCode.trim().toUpperCase() === "MOSA20";

        body.innerHTML = `<div class="space-y-3.5">
            <div class="p-4 rounded-2xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/10 dark:border-white/10 text-xs sm:text-sm space-y-2.5">
                <div class="flex justify-between gap-3 border-b border-carbon-900/10 dark:border-white/10 pb-2">
                    <span class="opacity-70 font-bold">${t.sum_tours}</span>
                    <span class="font-black text-end">${ch.map(c => getTripTitle(c)).join(" + ")}</span>
                </div>
                <div class="flex justify-between gap-3">
                    <span class="opacity-70 font-bold">${t.full_name.replace(" *", "")}:</span>
                    <span class="font-bold">${b.name} · ${b.phone}</span>
                </div>
                <div class="flex justify-between gap-3">
                    <span class="opacity-70 font-bold">Email:</span>
                    <span class="font-bold text-champagne-dark dark:text-champagne">${b.email}</span>
                </div>
                <div class="flex justify-between gap-3">
                    <span class="opacity-70 font-bold">${t.sum_guests}</span>
                    <span class="font-bold">${b.adults} ${t.adults_lbl}${b.children ? ` · ${b.children} ${t.children_lbl}` : ""}</span>
                </div>
                <div class="flex justify-between gap-3">
                    <span class="opacity-70 font-bold">${t.sum_vehicle}</span>
                    <span class="font-bold">${vehicleDisplay}</span>
                </div>
                <div class="flex justify-between gap-3">
                    <span class="opacity-70 font-bold">${t.sum_hotel}</span>
                    <span class="font-bold">${b.pickupHotel || "Sharm El Sheikh"} ${b.tripDate ? `(${b.tripDate})` : ""}</span>
                </div>
                <div class="flex justify-between gap-3 pt-2 border-t border-carbon-900/10 dark:border-white/10">
                    <span class="opacity-70 font-bold">${t.sum_payment}</span>
                    <span class="font-black ${b.paymentMethod === 'visa' ? 'text-champagne-dark dark:text-champagne' : 'text-sea'}">${b.paymentMethod === 'visa' ? u.pay_visa_title : u.pay_arrival_title}</span>
                </div>
            </div>

            ${promoActive ? `<div class="p-2.5 rounded-xl bg-sea/15 border border-sea/30 text-sea text-xs font-extrabold">${u.promo_applied_badge}</div>` : ""}

            <div class="flex gap-2">
                <input id="bk-promo" type="text" value="${b.promoCode}" placeholder="${t.promo_placeholder}" class="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F6F3EC] dark:bg-carbon-900 border border-carbon-900/15 dark:border-white/15 text-sm font-bold uppercase focus:border-champagne focus:outline-none" />
                <button type="button" onclick="applyPromoCode()" class="px-4 py-2.5 rounded-xl bg-champagne hover:bg-champagne-light text-carbon-950 text-xs font-black transition">${t.promo_apply}</button>
            </div>
        </div>`;
    }
}
