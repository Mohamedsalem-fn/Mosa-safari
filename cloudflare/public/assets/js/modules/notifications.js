/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

/**
 * Public support contacts (notifications & API secrets are handled strictly server-side).
 */
export const NOTIFICATION_CONFIG = {
    supportPhone: "201023355550",
    ownerEmail: "info@mosasafari.com"
};

/**
 * Normalize a phone number into Green API chatId format (e.g. "201023355550@c.us")
 * @param {string} rawPhone
 * @returns {string|null}
 */
function escHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function formatWhatsAppChatId(rawPhone) {
    if (!rawPhone) return null;
    let digits = String(rawPhone).replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("00")) {
        digits = digits.slice(2);
    } else if (digits.startsWith("01") && digits.length === 11) {
        // Egyptian local mobile format 01XXXXXXXXX -> 201XXXXXXXXX
        digits = "2" + digits;
    }
    if (digits.length < 10) return null;
    return `${digits}@c.us`;
}

/**
 * Build the WhatsApp message sent to the owner when a new booking is completed.
 * @param {object} payload
 * @returns {string}
 */
export function buildOwnerWhatsAppMessage(payload) {
    const payLabel = payload.paymentMethod === "visa"
        ? `💳 بالفيزا / البطاقة البنكية (Placeholder — ${payload.cardMask || "جاهز للبوابة"})`
        : "💵 الدفع عند الوصول (Pay on Arrival)";
    const pickupText = payload.pickupPointDisplay || payload.tripTimeDisplay || (payload.tripTime === "evening" ? "مساءً" : "صباحاً");

    return [
        "🐪 *حجز سفاري جديد — شركة موسى سفاري (mosasafari.com)*",
        "━━━━━━━━━━━━━━━━━━━━",
        `🔖 *رقم الحجز:* ${payload.ref}`,
        `📅 *تاريخ الرحلة:* ${payload.tripDate || "غير محدد"}`,
        `📍 *نقطة الاستلام والميعاد:* ${pickupText}`,
        `🏜️ *البرنامج المختار:* ${payload.selectedTours}`,
        `🚐 *نوع المركبة:* ${payload.vehicleDisplay}`,
        `👥 *عدد الضيوف:* ${payload.adults} بالغين · ${payload.children} أطفال`,
        "━━━━━━━━━━━━━━━━━━━━",
        `👤 *اسم العميل:* ${payload.name}`,
        `📱 *واتساب العميل:* ${payload.phone}`,
        `📧 *إيميل العميل:* ${payload.email || "غير متوفر"}`,
        `🌍 *الجنسية:* ${payload.nationality || "غير محدد"}`,
        `🏨 *نقطة الاستلام / الفندق:* ${payload.pickupHotel || "سيتم التحديد لاحقاً"}`,
        "━━━━━━━━━━━━━━━━━━━━",
        `💳 *طريقة الدفع:* ${payLabel}`,
        payload.promoCode ? `🏷️ *كود الخصم:* ${payload.promoCode}` : null,
        `💰 *الإجمالي:* ${payload.totalFormatted}`,
        "━━━━━━━━━━━━━━━━━━━━",
        `⏰ *وقت التسجيل:* ${new Date().toLocaleString("ar-EG")}`
    ].filter(Boolean).join("\n");
}

/**
 * Build a confirmation message for the customer (used for customer WhatsApp & Email).
 * @param {object} payload
 * @returns {{subject: string, text: string, html: string}}
 */
export function buildCustomerConfirmationContent(payload) {
    const lang = payload.lang || "ar";
    const isAr = lang === "ar";
    const payTextAr = payload.paymentMethod === "visa"
        ? "بطاقة فيزا / ماستركارد (تم تسجيل الطلب — سيتم تأكيد عملية الدفع)"
        : "الدفع عند الوصول يوم الرحلة";
    const payTextEn = payload.paymentMethod === "visa"
        ? "Visa / Mastercard (Order registered — payment gateway confirmation pending)"
        : "Pay on Arrival on tour day";

    const pickupDisplay = payload.pickupPointDisplay || payload.tripTimeDisplay || (payload.tripTime === "evening" ? (isAr ? "مساءً" : "Evening (PM)") : (isAr ? "صباحاً" : "Morning (AM)"));

    const subject = isAr
        ? `تأكيد حجزك في شركة موسى سفاري شرم الشيخ — رقم ${payload.ref}`
        : `Your Mosa Safari Booking Confirmation — Ref ${payload.ref}`;

    const text = isAr
        ? [
            `أهلاً بك يا ${payload.name} في شركة موسى سفاري (mosasafari.com)!`,
            "",
            `تم استلام وتأكيد طلب حجزك بنجاح. تفاصيل الحجز:`,
            `• رقم المرجع: ${payload.ref}`,
            `• الرحلة: ${payload.selectedTours}`,
            `• التاريخ: ${payload.tripDate}`,
            `• نقطة الاستلام وموعد التحرك: ${pickupDisplay}`,
            `• الفندق / المنطقة: ${payload.pickupHotel || "شرم الشيخ"}`,
            `• الضيوف: ${payload.adults} بالغين، ${payload.children} أطفال`,
            `• المركبة: ${payload.vehicleDisplay}`,
            `• طريقة الدفع: ${payTextAr}`,
            `• الإجمالي: ${payload.totalFormatted}`,
            "",
            "📌 تعليمات هامة:",
            "- يرجى التواجد في نقطة الاستلام قبل موعد التحرك بـ 10 دقائق.",
            "- في حال التأخير، تتحمل الشركة حق تعديل أو إلغاء الحجز وفقًا لجدول التشغيل.",
            "- نتمنى لكم رحلة ممتعة مع شركة موسى سفاري.",
            "",
            "للتواصل السريع عبر واتساب: +201023355550"
        ].join("\n")
        : [
            `Hello ${payload.name}, welcome to Mosa Safari (mosasafari.com)!`,
            "",
            `Your desert safari booking has been confirmed. Booking Summary:`,
            `• Reference ID: ${payload.ref}`,
            `• Safari Program: ${payload.selectedTours}`,
            `• Tour Date: ${payload.tripDate}`,
            `• Pickup Point & Departure Time: ${pickupDisplay}`,
            `• Pickup Hotel / Area: ${payload.pickupHotel || "Sharm El Sheikh"}`,
            `• Guests: ${payload.adults} Adults, ${payload.children} Children`,
            `• Vehicle: ${payload.vehicleDisplay}`,
            `• Payment Method: ${payTextEn}`,
            `• Total Amount: ${payload.totalFormatted}`,
            "",
            "📌 Important Instructions:",
            "- Please be present at your pickup point 10 minutes before departure time.",
            "- In case of delay, the company reserves the right to reschedule or cancel the booking according to the operating timetable.",
            "- We wish you a wonderful trip with Mosa Safari.",
            "",
            "24/7 WhatsApp Support: +201023355550"
        ].join("\n");

    const safeName = escHtml(payload.name);
    const safeRef = escHtml(payload.ref);
    const safeTours = escHtml(payload.selectedTours);
    const safeDate = escHtml(payload.tripDate);
    const safeTime = escHtml(pickupDisplay);
    const safeVehicle = escHtml(payload.vehicleDisplay);
    const safeHotel = escHtml(payload.pickupHotel || "-");
    const safeTotal = escHtml(payload.totalFormatted);

    const html = `
    <div style="font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0E1015; color: #F4EFE6; border-radius: 16px; overflow: hidden; border: 1px solid rgba(217,179,108,0.3); direction: ${isAr ? "rtl" : "ltr"};">
      <div style="background: linear-gradient(135deg, #161922, #08090C); padding: 24px; border-bottom: 1px solid rgba(217,179,108,0.2); text-align: center;">
        <div style="color: #D9B36C; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">MOSASAFARI.COM · SHARM EL SHEIKH</div>
        <h1 style="margin: 8px 0 4px; font-size: 22px; color: #FFFFFF;">${isAr ? "تم تأكيد حجزك — شركة موسى سفاري" : "Booking Confirmed — Mosa Safari"}</h1>
        <div style="display: inline-block; margin-top: 6px; padding: 4px 14px; border-radius: 99px; background: rgba(44,181,160,0.18); color: #2CB5A0; font-weight: 800; font-size: 13px;">${safeRef}</div>
      </div>
      <div style="padding: 24px; line-height: 1.7; font-size: 14px;">
        <p style="margin-top: 0;">${isAr ? `مرحباً <strong>${safeName}</strong>، يسعدنا تأكيد استلام حجزك مع شركة موسى سفاري:` : `Dear <strong>${safeName}</strong>, we are delighted to confirm your Mosa Safari booking:`}</p>
        <div style="background: #161922; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="margin: 6px 0;"><strong>${isAr ? "الرحلة:" : "Program:"}</strong> ${safeTours}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "تاريخ الرحلة:" : "Tour Date:"}</strong> ${safeDate}</p>
          <p style="margin: 6px 0; color: #D9B36C;"><strong>${isAr ? "نقطة الاستلام وموعد التحرك:" : "Pickup Point & Departure:"}</strong> ${safeTime}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "نقطة التجمع / الفندق:" : "Pickup Hotel / Area:"}</strong> ${safeHotel}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "عدد الضيوف:" : "Guests:"}</strong> ${Number(payload.adults) || 1} ${isAr ? "بالغين" : "Adults"} · ${Number(payload.children) || 0} ${isAr ? "أطفال" : "Children"}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "نوع المركبة:" : "Vehicle:"}</strong> ${safeVehicle}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "طريقة الدفع:" : "Payment Method:"}</strong> ${isAr ? payTextAr : payTextEn}</p>
          <p style="margin: 10px 0 4px; font-size: 16px; color: #D9B36C;"><strong>${isAr ? "الإجمالي:" : "Total:"} ${safeTotal}</strong></p>
        </div>
        <div style="background: rgba(217,179,108,0.12); border: 1px solid rgba(217,179,108,0.4); border-radius: 12px; padding: 14px; margin: 16px 0; font-size: 13px;">
          <div style="color: #D9B36C; font-weight: 800; margin-bottom: 6px;">${isAr ? "📌 تعليمات هامة" : "📌 Important Pickup Instructions"}</div>
          <p style="margin: 4px 0;">• ${isAr ? "يرجى التواجد في نقطة الاستلام قبل موعد التحرك بـ 10 دقائق." : "Please be present at your pickup point 10 minutes before departure time."}</p>
          <p style="margin: 4px 0;">• ${isAr ? "في حال التأخير، تتحمل الشركة حق تعديل أو إلغاء الحجز وفقًا لجدول التشغيل." : "In case of delay, the company reserves the right to reschedule or cancel the booking according to the operating timetable."}</p>
          <p style="margin: 4px 0;">• ${isAr ? "نتمنى لكم رحلة ممتعة مع شركة موسى سفاري." : "We wish you a wonderful trip with Mosa Safari."}</p>
        </div>
        <p style="font-size: 13px; color: #B5B0A8;">${isAr ? "لأي استفسار فوري يمكنك مراسلتنا عبر واتساب: +201023355550" : "For immediate assistance, message us on WhatsApp: +201023355550"}</p>
      </div>
    </div>`;

    return { subject, text, html };
}

/**
 * Dispatch booking notifications strictly via server-side endpoint (/api/notify-booking):
 * 1) Primary server-side API on Hostinger (PHP) or Cloudflare Workers handles Green API + Resend safely without exposing keys.
 * 2) Secondary Netlify Function fallback & static FormSubmit email fallback if previewed on plain static HTTP.
 * @param {object} payload
 * @returns {Promise<{whatsappSent: boolean, customerWaSent: boolean, emailSent: boolean}>}
 */
export async function dispatchBookingNotifications(payload) {
    const result = {
        whatsappSent: false,
        customerWaSent: false,
        emailSent: false
    };

    const ownerMessage = buildOwnerWhatsAppMessage(payload);
    const customerContent = buildCustomerConfirmationContent(payload);

    // 1. Primary server-side endpoint (/api/notify-booking)
    let handledByServer = false;
    try {
        const srvRes = await fetch("/api/notify-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payload,
                ownerMessage,
                subject: customerContent.subject,
                text: customerContent.text,
                html: customerContent.html,
                whatsappAlreadySent: false
            })
        });
        if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData.managed || srvData.ok) {
                handledByServer = true;
                result.emailSent = Boolean(srvData.emailSent);
                result.whatsappSent = Boolean(srvData.whatsappSent);
            }
        }
    } catch {
        // Fallback below when previewed on plain static server
    }

    if (!handledByServer) {
        try {
            const srvRes = await fetch("/.netlify/functions/notify-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payload,
                    ownerMessage,
                    subject: customerContent.subject,
                    text: customerContent.text,
                    html: customerContent.html,
                    whatsappAlreadySent: false
                })
            });
            if (srvRes.ok) {
                const srvData = await srvRes.json();
                if (srvData.emailSent) result.emailSent = true;
                if (srvData.whatsappSent) result.whatsappSent = true;
            }
        } catch {
            // Ignored on plain static preview
        }

        if (!result.emailSent && payload.email) {
            try {
                const emailRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(payload.email)}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        _subject: customerContent.subject,
                        _template: "box",
                        _captcha: "false",
                        booking_reference: payload.ref,
                        customer_name: payload.name,
                        safari_programs: payload.selectedTours,
                        tour_date: payload.tripDate,
                        guests: `${payload.adults} Adults, ${payload.children} Children`,
                        vehicle: payload.vehicleDisplay,
                        pickup_hotel: payload.pickupHotel || "Sharm El Sheikh",
                        payment_method: payload.paymentMethod === "visa" ? "Visa / Card" : "Pay on Arrival",
                        total_amount: payload.totalFormatted,
                        message: customerContent.text
                    })
                });
                if (emailRes.ok) {
                    result.emailSent = true;
                }
            } catch {
                // Handled silently
            }
        }
    }

    return result;
}
