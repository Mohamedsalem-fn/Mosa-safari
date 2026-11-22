/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

/**
 * Green API & Booking Notification Configuration
 * Instance Phone (Sender): 201207823884
 * Owner WhatsApp (Recipient): Receives instant booking alerts via Green API
 */
export const NOTIFICATION_CONFIG = {
    greenApi: {
        apiUrl: "https://7107.api.greenapi.com",
        mediaUrl: "https://7107.api.greenapi.com",
        idInstance: "710722810410",
        apiTokenInstance: "e31928ad1ee743c2a88c7c3e40b62da24cb618dd4e3549d984",
        instancePhone: "201207823884"
    },
    // Owner WhatsApp number(s) that receive new booking notifications
    ownerPhones: ["201207823884", "201118748922"],
    ownerEmail: "info@mosasafari.com"
};

/**
 * Normalize a phone number into Green API chatId format (e.g. "201207823884@c.us")
 * @param {string} rawPhone
 * @returns {string|null}
 */
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

    return [
        "🐪 *حجز سفاري جديد — موسى سفاري (mosasafari.com)*",
        "━━━━━━━━━━━━━━━━━━━━",
        `🔖 *رقم الحجز:* ${payload.ref}`,
        `📅 *تاريخ الرحلة:* ${payload.tripDate || "غير محدد"}`,
        `🏜️ *البرامج المختارة:* ${payload.selectedTours}`,
        `🚐 *نوع المركبة:* ${payload.vehicleDisplay}`,
        `👥 *عدد الضيوف:* ${payload.adults} بالغين · ${payload.children} أطفال`,
        "━━━━━━━━━━━━━━━━━━━━",
        `👤 *اسم العميل:* ${payload.name}`,
        `📱 *واتساب العميل:* ${payload.phone}`,
        `📧 *إيميل العميل:* ${payload.email || "غير متوفر"}`,
        `🌍 *الجنسية:* ${payload.nationality || "غير محدد"}`,
        `🏨 *فندق الاستلام:* ${payload.pickupHotel || "سيتم التحديد لاحقاً"}`,
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

    const subject = isAr
        ? `تأكيد حجزك في موسى سفاري شرم الشيخ — رقم ${payload.ref}`
        : `Your Mosa Safari Booking Confirmation — Ref ${payload.ref}`;

    const text = isAr
        ? [
            `أهلاً بك يا ${payload.name} في موسى سفاري (mosasafari.com)!`,
            "",
            `تم استلام وتأكيد طلب حجزك بنجاح. تفاصيل الحجز:`,
            `• رقم المرجع: ${payload.ref}`,
            `• البرامج: ${payload.selectedTours}`,
            `• التاريخ: ${payload.tripDate}`,
            `• الضيوف: ${payload.adults} بالغين، ${payload.children} أطفال`,
            `• المركبة: ${payload.vehicleDisplay}`,
            `• فندق الاستلام: ${payload.pickupHotel || "شرم الشيخ"}`,
            `• طريقة الدفع: ${payTextAr}`,
            `• الإجمالي: ${payload.totalFormatted}`,
            "",
            "سيتواصل معك فريق العمليات في شرم الشيخ لتأكيد موعد التحرك الدقيق من الفندق.",
            "للتواصل السريع عبر واتساب: +201207823884",
            "شكراً لاختيارك موسى سفاري!"
        ].join("\n")
        : [
            `Hello ${payload.name}, welcome to Mosa Safari (mosasafari.com)!`,
            "",
            `Your desert safari booking has been confirmed. Booking Summary:`,
            `• Reference ID: ${payload.ref}`,
            `• Safari Programs: ${payload.selectedTours}`,
            `• Tour Date: ${payload.tripDate}`,
            `• Guests: ${payload.adults} Adults, ${payload.children} Children`,
            `• Vehicle: ${payload.vehicleDisplay}`,
            `• Pickup Hotel: ${payload.pickupHotel || "Sharm El Sheikh"}`,
            `• Payment Method: ${payTextEn}`,
            `• Total Amount: ${payload.totalFormatted}`,
            "",
            "Our Sharm El Sheikh operations team will contact you to confirm your exact hotel pickup time.",
            "24/7 WhatsApp Support: +201207823884",
            "Thank you for choosing Mosa Safari!"
        ].join("\n");

    const html = `
    <div style="font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0E1015; color: #F4EFE6; border-radius: 16px; overflow: hidden; border: 1px solid rgba(217,179,108,0.3); direction: ${isAr ? "rtl" : "ltr"};">
      <div style="background: linear-gradient(135deg, #161922, #08090C); padding: 24px; border-bottom: 1px solid rgba(217,179,108,0.2); text-align: center;">
        <div style="color: #D9B36C; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">MOSASAFARI.COM · SHARM EL SHEIKH</div>
        <h1 style="margin: 8px 0 4px; font-size: 22px; color: #FFFFFF;">${isAr ? "تم تأكيد حجزك في موسى سفاري" : "Booking Confirmed — Mosa Safari"}</h1>
        <div style="display: inline-block; margin-top: 6px; padding: 4px 14px; border-radius: 99px; background: rgba(44,181,160,0.18); color: #2CB5A0; font-weight: 800; font-size: 13px;">${payload.ref}</div>
      </div>
      <div style="padding: 24px; line-height: 1.7; font-size: 14px;">
        <p style="margin-top: 0;">${isAr ? `مرحباً <strong>${payload.name}</strong>، يسعدنا تأكيد استلام حجزك لرحلة السفاري في شرم الشيخ:` : `Dear <strong>${payload.name}</strong>, we are delighted to confirm your Sharm El Sheikh desert safari booking:`}</p>
        <div style="background: #161922; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="margin: 6px 0;"><strong>${isAr ? "البرامج:" : "Programs:"}</strong> ${payload.selectedTours}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "تاريخ الرحلة:" : "Tour Date:"}</strong> ${payload.tripDate}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "عدد الضيوف:" : "Guests:"}</strong> ${payload.adults} ${isAr ? "بالغين" : "Adults"} · ${payload.children} ${isAr ? "أطفال" : "Children"}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "نوع المركبة:" : "Vehicle:"}</strong> ${payload.vehicleDisplay}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "فندق الاستلام:" : "Pickup Hotel:"}</strong> ${payload.pickupHotel || "-"}</p>
          <p style="margin: 6px 0;"><strong>${isAr ? "طريقة الدفع:" : "Payment Method:"}</strong> ${isAr ? payTextAr : payTextEn}</p>
          <p style="margin: 10px 0 4px; font-size: 16px; color: #D9B36C;"><strong>${isAr ? "الإجمالي:" : "Total:"} ${payload.totalFormatted}</strong></p>
        </div>
        <p style="font-size: 13px; color: #B5B0A8;">${isAr ? "سيتواصل معك مندوبنا عبر الواتساب لتأكيد موعد التحرك الدقيق من الفندق. لأي استفسار فوري يمكنك مراسلتنا على واتساب: +201207823884" : "Our representative will contact you via WhatsApp with your exact hotel pickup time. For immediate assistance, message us on WhatsApp: +201207823884"}</p>
      </div>
    </div>`;

    return { subject, text, html };
}

/**
 * Send a WhatsApp message directly via Green API (supports browser CORS).
 * @param {string} chatId - Format: "201207823884@c.us"
 * @param {string} message
 * @returns {Promise<{ok: boolean, idMessage?: string, error?: string}>}
 */
export async function sendGreenApiWhatsApp(chatId, message) {
    const { apiUrl, idInstance, apiTokenInstance } = NOTIFICATION_CONFIG.greenApi;
    const endpoint = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId, message })
        });
        if (!res.ok) {
            return { ok: false, error: `HTTP ${res.status}` };
        }
        const data = await res.json();
        return { ok: Boolean(data && data.idMessage), idMessage: data?.idMessage };
    } catch (err) {
        return { ok: false, error: err?.message || "Network error" };
    }
}

/**
 * Dispatch booking notifications:
 * 1) Direct Green API dispatch to Owner WhatsApp (+ customer WhatsApp confirmation)
 * 2) Server-side endpoint (/.netlify/functions/notify-booking) on Netlify or dev_server.py for Resend Email (zero browser CORS errors)
 * 3) Client-side FormSubmit AJAX fallback if running on a basic static server without backend POST support
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

    // 1. Send WhatsApp notification to Owner via Green API
    const uniqueOwnerPhones = [...new Set(NOTIFICATION_CONFIG.ownerPhones)];
    for (const phone of uniqueOwnerPhones) {
        const chatId = formatWhatsAppChatId(phone);
        if (!chatId) continue;
        const waRes = await sendGreenApiWhatsApp(chatId, ownerMessage);
        if (waRes.ok) {
            result.whatsappSent = true;
        }
    }

    // 2. Also send a polite WhatsApp booking confirmation copy to the customer's WhatsApp via Green API
    const customerChatId = formatWhatsAppChatId(payload.phone);
    if (customerChatId) {
        const custWaRes = await sendGreenApiWhatsApp(customerChatId, customerContent.text);
        if (custWaRes.ok) {
            result.customerWaSent = true;
        }
    }

    // 3. Trigger server-side endpoint (/.netlify/functions/notify-booking) for Resend Email
    try {
        const srvRes = await fetch("/.netlify/functions/notify-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payload,
                subject: customerContent.subject,
                text: customerContent.text,
                html: customerContent.html,
                whatsappAlreadySent: result.whatsappSent
            })
        });
        if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData.emailSent) result.emailSent = true;
            if (srvData.whatsappSent) result.whatsappSent = true;
        }
    } catch {
        // Fallback below if running on a static server without POST handler
    }

    // 4. Fallback client-side email relay (CORS-friendly) if server endpoint was not active
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

    return result;
}
