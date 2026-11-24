/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

export const PICKUP_STATIONS = {
    hadaba: { ar: "الهضبة", en: "Al-Hadaba", it: "Hadaba", ru: "Хадаба" },
    naama: { ar: "خليج نعمة", en: "Naama Bay", it: "Naama Bay", ru: "Наама-Бей" },
    conference: { ar: "قاعة المؤتمرات", en: "Conference Center", it: "Centro Congressi", ru: "Конференц-центр" },
    airport: { ar: "خلف المطار", en: "Behind Airport", it: "Zona Aeroporto", ru: "За аэропортом" },
    gharqana: { ar: "الغرقانة", en: "Al-Gharqana", it: "Al-Gharqana", ru: "Эль-Гаркана" }
};

export const MOSA_RULES = {
    ar: {
        title: "📌 تعليمات هامة",
        items: [
            "يرجى التواجد في نقطة الاستلام قبل موعد التحرك بـ 10 دقائق.",
            "في حال التأخير، تتحمل الشركة حق تعديل أو إلغاء الحجز وفقًا لجدول التشغيل.",
            "نتمنى لكم رحلة ممتعة مع شركة موسى سفاري."
        ]
    },
    en: {
        title: "📌 Important Pickup Instructions",
        items: [
            "Please be present at your pickup point 10 minutes before departure time.",
            "In case of delay, the company reserves the right to reschedule or cancel the booking according to the operating timetable.",
            "We wish you a wonderful trip with Mosa Safari."
        ]
    },
    it: {
        title: "📌 Istruzioni Importanti per il Ritiro",
        items: [
            "Si prega di presentarsi al punto di ritiro 10 minuti prima dell'orario di partenza.",
            "In caso di ritardo, l'azienda si riserva il diritto di modificare o annullare la prenotazione in base al programma operativo.",
            "Vi auguriamo un piacevole viaggio con Mosa Safari."
        ]
    },
    ru: {
        title: "📌 Важные правила посадки",
        items: [
            "Пожалуйста, будьте на месте посадки за 10 минут до времени отправления.",
            "В случае опоздания компания оставляет за собой право изменить или отменить бронь согласно графику движения.",
            "Желаем вам приятного путешествия с компанией Mosa Safari."
        ]
    }
};

export const HERO_SLIDES = [
    {
        img: "assets/images/safari-sunrise.jpg",
        tag: {
            ar: "شرم الشيخ · تحرك من 04:00 ص",
            en: "Sharm El Sheikh · Departs 04:00 AM",
            it: "Sharm El Sheikh · Partenza 04:00 AM",
            ru: "Шарм-эль-Шейх · Выезд 04:00"
        },
        title: {
            ar: "🌅 رحلة الشروق — جبال سيناء الذهبية",
            en: "🌅 Sunrise Safari — Dawn Desert Trails",
            it: "🌅 Safari all'Alba — Prime Luci nel Deserto",
            ru: "🌅 Рассветное сафари — Встреча рассвета"
        }
    },
    {
        img: "assets/images/safari-morning.jpg",
        tag: {
            ar: "شرم الشيخ · تحرك من 08:00 ص",
            en: "Sharm El Sheikh · Departs 08:00 AM",
            it: "Sharm El Sheikh · Partenza 08:00 AM",
            ru: "Шарм-эль-Шейх · Выезд 08:00"
        },
        title: {
            ar: "☀️ الرحلة الصباحية — بيتش باجي وباجي صحراوي",
            en: "☀️ Morning Safari — ATV Quad & Dune Buggy",
            it: "☀️ Safari del Mattino — Quad ATV & Buggy",
            ru: "☀️ Утреннее сафари — Квадроциклы и Багги"
        }
    },
    {
        img: "assets/images/safari-standard.jpg",
        tag: {
            ar: "شرم الشيخ · تحرك من 14:15",
            en: "Sharm El Sheikh · Departs 14:15",
            it: "Sharm El Sheikh · Partenza 14:15",
            ru: "Шарм-эль-Шейх · Выезд 14:15"
        },
        title: {
            ar: "🌄 الرحلات العادية — مغامرة الظهيرة الكلاسيكية",
            en: "🌄 Standard Afternoon Safari — Echo Mountains",
            it: "🌄 Safari Pomeridiano — Montagne dell'Eco",
            ru: "🌄 Дневное сафари — Классический маршрут"
        }
    },
    {
        img: "assets/images/safari-dinner.jpg",
        tag: {
            ar: "شرم الشيخ · تحرك من 15:30",
            en: "Sharm El Sheikh · Departs 15:30",
            it: "Sharm El Sheikh · Partenza 15:30",
            ru: "Шарм-эль-Шейх · Выезд 15:30"
        },
        title: {
            ar: "🌙 رحلة العشاء — القرية البدوية والنجوم",
            en: "🌙 Dinner Safari — Bedouin BBQ Camp & Show",
            it: "🌙 Safari con Cena — Campo Beduino & Spettacolo",
            ru: "🌙 Ужин-сафари — Бедуинский лагерь и шоу"
        }
    }
];

export const SAFARI_TRIPS = [
    {
        id: "mosa-sunrise",
        category: "sunrise",
        slotType: "morning",
        icon: "🌅",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleAr: "🌅 رحلة الشروق — شرم الشيخ",
        titleEn: "🌅 Sunrise Safari — Sharm El Sheikh",
        titleIt: "🌅 Safari all'Alba — Sharm El Sheikh",
        titleRu: "🌅 Рассветное сафари — Шарм-эль-Шейх",
        fromPrice: 12.00,
        adultPrice: 20.00,
        duration: "3 ساعات",
        durationEn: "3 hours",
        durationIt: "3 ore",
        durationRu: "3 часа",
        rating: 4.9,
        badge: "رحلة الشروق",
        vehicle: "ATV Quad + Camel + Bedouin Tea",
        img: "assets/images/safari-sunrise.jpg",
        descAr: "عِش سحر شروق الشمس بين جبال سيناء مع قيادة البيتش باجي وركوب الجمال والشاي البدوي، مع تحرك دقيق عبر مسارين يومياً من كافة مناطق شرم الشيخ.",
        descEn: "Witness the magic of Sinai sunrise across Echo Mountains on an automatic ATV Quad with camel trek and Bedouin tea via 2 scheduled pickup routes.",
        descIt: "Vivi la magia dell'alba tra le montagne del Sinai in Quad ATV con cammello e tè beduino, con partenza puntuale su 2 percorsi dedicati.",
        descRu: "Встретьте рассвет в горах Синая на квадроциклах ATV с прогулкой на верблюдах и бедуинским чаем. Два чётких маршрута трансфера.",
        routes: [
            {
                id: "route1",
                label: { ar: "المسار الأول", en: "Route 1", it: "Percorso 1", ru: "Маршрут 1" },
                stops: [
                    { station: "hadaba", timeAr: "04:00 ص", timeEn: "04:00 AM", emoji: "🕓" },
                    { station: "naama", timeAr: "04:15 ص", timeEn: "04:15 AM", emoji: "🕟" },
                    { station: "conference", timeAr: "04:30 ص", timeEn: "04:30 AM", emoji: "🕠" }
                ]
            },
            {
                id: "route2",
                label: { ar: "المسار الثاني", en: "Route 2", it: "Percorso 2", ru: "Маршрут 2" },
                stops: [
                    { station: "airport", timeAr: "04:00 ص", timeEn: "04:00 AM", emoji: "🕓" },
                    { station: "gharqana", timeAr: "04:30 ص", timeEn: "04:30 AM", emoji: "🕟" }
                ]
            }
        ],
        active: true
    },
    {
        id: "mosa-morning",
        category: "morning",
        slotType: "morning",
        icon: "☀️",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleAr: "☀️ الرحلة الصباحية — شرم الشيخ",
        titleEn: "☀️ Morning Safari — Sharm El Sheikh",
        titleIt: "☀️ Safari del Mattino — Sharm El Sheikh",
        titleRu: "☀️ Утреннее сафари — Шарм-эль-Шейх",
        fromPrice: 11.00,
        adultPrice: 18.00,
        duration: "3 ساعات",
        durationEn: "3 hours",
        durationIt: "3 ore",
        durationRu: "3 часа",
        rating: 4.8,
        badge: "الرحلة الصباحية",
        vehicle: "ATV Quad + Dune Buggy",
        img: "assets/images/safari-morning.jpg",
        descAr: "جولة صباحية منعشة في قلب صحراء شرم الشيخ بقيادة البيتش باجي والباجي الصحراوي مع توقف في الخيمة البدوية، وتنطلق الساعة 08:00 صباحاً على مسارين.",
        descEn: "Fresh 8 AM desert expedition riding ATV Quads and Dune Buggies across open South Sinai trails with a Bedouin camp stop across 2 scheduled pickup routes.",
        descIt: "Escursione mattutina dalle 08:00 tra le piste del deserto in Quad ATV e Dune Buggy con sosta alla tenda beduina su 2 percorsi organizzati.",
        descRu: "Бодрящее утреннее сафари с 08:00 по открытым трассам Синая на квадроциклах и багги с остановкой у бедуинов по 2 маршрутам сбора.",
        routes: [
            {
                id: "route1",
                label: { ar: "المسار الأول", en: "Route 1", it: "Percorso 1", ru: "Маршрут 1" },
                stops: [
                    { station: "hadaba", timeAr: "08:00 ص", timeEn: "08:00 AM", emoji: "🕗" },
                    { station: "naama", timeAr: "08:30 ص", timeEn: "08:30 AM", emoji: "🕣" },
                    { station: "airport", timeAr: "08:40 ص", timeEn: "08:40 AM", emoji: "🕣" }
                ]
            },
            {
                id: "route2",
                label: { ar: "المسار الثاني", en: "Route 2", it: "Percorso 2", ru: "Маршрут 2" },
                stops: [
                    { station: "airport", timeAr: "08:00 ص", timeEn: "08:00 AM", emoji: "🕗" },
                    { station: "gharqana", timeAr: "08:30 ص", timeEn: "08:30 AM", emoji: "🕣" }
                ]
            }
        ],
        active: true
    },
    {
        id: "mosa-standard",
        category: "standard",
        slotType: "evening",
        icon: "🌄",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleAr: "🌄 الرحلات العادية — شرم الشيخ",
        titleEn: "🌄 Standard Afternoon Safari — Sharm El Sheikh",
        titleIt: "🌄 Safari Classico Pomeridiano — Sharm El Sheikh",
        titleRu: "🌄 Дневное классическое сафари — Шарм-эль-Шейх",
        fromPrice: 10.00,
        adultPrice: 17.00,
        duration: "2.5–3 ساعات",
        durationEn: "2.5–3 hours",
        durationIt: "2,5–3 ore",
        durationRu: "2.5–3 часа",
        rating: 4.8,
        badge: "الرحلات العادية",
        vehicle: "ATV Quad + Echo Mountains",
        img: "assets/images/safari-standard.jpg",
        descAr: "رحلة السفاري الكلاسيكية بعد الظهر وسط جبال الصدى ووديان شرم الشيخ مع الشاي البدوي وتوقيت مثالي قبل الغروب بدءاً من الساعة 14:15.",
        descEn: "Classic afternoon desert safari starting at 14:15 through the Echo Mountains canyon with scenic photo stops and Bedouin tea hospitality.",
        descIt: "Il safari classico pomeridiano con partenza alle 14:15 nelle Montagne dell'Eco, soste panoramiche e ospitalità beduina.",
        descRu: "Классическое дневное сафари с выездом в 14:15 через каньон Гор Эхо с фото-паузами и бедуинским чаем.",
        routes: [
            {
                id: "route1",
                label: { ar: "المسار الأول", en: "Route 1", it: "Percorso 1", ru: "Маршрут 1" },
                stops: [
                    { station: "hadaba", timeAr: "14:15", timeEn: "14:15", emoji: "🕒" },
                    { station: "naama", timeAr: "14:15", timeEn: "14:15", emoji: "🕞" },
                    { station: "conference", timeAr: "14:30", timeEn: "14:30", emoji: "🕒" }
                ]
            },
            {
                id: "route2",
                label: { ar: "المسار الثاني", en: "Route 2", it: "Percorso 2", ru: "Маршрут 2" },
                stops: [
                    { station: "airport", timeAr: "14:15", timeEn: "14:15", emoji: "🕒" },
                    { station: "gharqana", timeAr: "14:30", timeEn: "14:30", emoji: "🕞" }
                ]
            }
        ],
        active: true
    },
    {
        id: "mosa-dinner",
        category: "dinner",
        slotType: "evening",
        icon: "🌙",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleAr: "🌙 رحلة العشاء — السهرة البدوية والغروب",
        titleEn: "🌙 Dinner Safari — Sunset, Bedouin BBQ & Show",
        titleIt: "🌙 Safari con Cena — Tramonto, BBQ Beduino & Show",
        titleRu: "🌙 Ужин-сафари — Закат, ужин у бедуинов и шоу",
        fromPrice: 18.00,
        adultPrice: 28.00,
        duration: "5 ساعات",
        durationEn: "5 hours",
        durationIt: "5 ore",
        durationRu: "5 часов",
        rating: 4.9,
        badge: "رحلة العشاء",
        vehicle: "ATV Quad + Camel + BBQ Dinner & Show",
        img: "assets/images/safari-dinner.jpg",
        descAr: "التجربة المسائية المتكاملة في شرم الشيخ: بيتش باجي عند الغروب، ركوب الجمال، عشاء بدوي فاخر مشوي، وعروض فنية تحت النجوم مع مسارين مخصصين للعشاء.",
        descEn: "Complete evening desert experience starting at 15:30: sunset ATV Quad riding, camel trek, open-buffet Bedouin BBQ dinner, and live desert show under the stars.",
        descIt: "Esperienza serale completa dalle 15:30: Quad ATV al tramonto, cammello, cena BBQ beduina e spettacolo folcloristico sotto le stelle.",
        descRu: "Полная вечерняя программа с 15:30: квадроциклы на закате, верблюды, бедуинский ужин-барбекю и восточное шоу под звёздами.",
        routes: [
            {
                id: "route1",
                label: { ar: "المسار الأول", en: "Route 1", it: "Percorso 1", ru: "Маршрут 1" },
                stops: [
                    { station: "hadaba", timeAr: "15:30", timeEn: "15:30", emoji: "🕔" },
                    { station: "naama", timeAr: "15:45", timeEn: "15:45", emoji: "🕠" },
                    { station: "conference", timeAr: "16:00", timeEn: "16:00", emoji: "🕠" }
                ]
            },
            {
                id: "route2",
                label: { ar: "المسار الثاني (العشاء)", en: "Route 2 (Dinner)", it: "Percorso 2 (Cena)", ru: "Маршрут 2 (Ужин)" },
                stops: [
                    { station: "airport", timeAr: "16:00", timeEn: "16:00", emoji: "🕔" },
                    { station: "gharqana", timeAr: "16:15", timeEn: "16:15", emoji: "🕠" }
                ]
            }
        ],
        active: true
    }
];

const DEFAULT_TRIPS_SNAPSHOT = SAFARI_TRIPS.map(t => ({
    id: t.id,
    category: t.category,
    slotType: t.slotType,
    routes: t.routes
}));

/**
 * Resolve localized pickup station display label.
 * @param {string} stationKey
 * @param {string} [lang="ar"]
 * @returns {string}
 */
export function getStationLabel(stationKey, lang = "ar") {
    const entry = PICKUP_STATIONS[stationKey];
    if (!entry) return String(stationKey || "");
    return entry[lang] || entry.en || entry.ar;
}

/**
 * Resolve structured pickup routes for a trip (with safe fallback to built-in catalog).
 * @param {object} trip
 * @returns {Array}
 */
export function getTripRoutes(trip) {
    if (trip && Array.isArray(trip.routes) && trip.routes.length) {
        return trip.routes;
    }
    if (trip) {
        const match = DEFAULT_TRIPS_SNAPSHOT.find(x => x.id === trip.id || x.category === trip.category);
        if (match) return match.routes;
    }
    return DEFAULT_TRIPS_SNAPSHOT[0].routes;
}

/**
 * Format route label in active language.
 * @param {object} route
 * @param {string} [lang="ar"]
 * @returns {string}
 */
export function getRouteLabel(route, lang = "ar") {
    if (!route) return "";
    if (typeof route.label === "string") return route.label;
    return route.label?.[lang] || route.label?.en || route.label?.ar || route.id || "";
}
