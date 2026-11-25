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
            ar: "شرم الشيخ · 4–5 ساعات · تحرك 04:00 ص",
            en: "Sharm El Sheikh · 4–5 Hours · Departs 04:00 AM",
            it: "Sharm El Sheikh · 4–5 Ore · Partenza 04:00 AM",
            ru: "Шарм-эль-Шейх · 4–5 часов · Выезд 04:00"
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
            ar: "شرم الشيخ · 4–5 ساعات · تحرك 08:00 ص",
            en: "Sharm El Sheikh · 4–5 Hours · Departs 08:00 AM",
            it: "Sharm El Sheikh · 4–5 Ore · Partenza 08:00 AM",
            ru: "Шарм-эль-Шейх · 4–5 часов · Выезд 08:00"
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
            ar: "شرم الشيخ · 4–5 ساعات · تحرك 14:15",
            en: "Sharm El Sheikh · 4–5 Hours · Departs 14:15",
            it: "Sharm El Sheikh · 4–5 Ore · Partenza 14:15",
            ru: "Шарм-эль-Шейх · 4–5 часов · Выезд 14:15"
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
            ar: "شرم الشيخ · 4–5 ساعات · تحرك 15:30",
            en: "Sharm El Sheikh · 4–5 Hours · Departs 15:30",
            it: "Sharm El Sheikh · 4–5 Ore · Partenza 15:30",
            ru: "Шарм-эль-Шейх · 4–5 часов · Выезд 15:30"
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
        subtitleAr: "شروق الشمس بين جبال الصدى، قيادة البيتش باجي، ركوب الجمال، والضيافة البدوية الأصيلة لمدة 4–5 ساعات.",
        subtitleEn: "Witness dawn breaking over Sinai's Echo Mountains with ATV Quad riding, camel trekking, and Bedouin tea across a complete 4–5 hour expedition.",
        subtitleIt: "Ammira l'alba sulle Montagne dell'Eco tra Quad ATV, cammelli e tè beduino in un'esperienza completa di 4–5 ore.",
        subtitleRu: "Встречайте рассвет в горах Эхо на квадроциклах ATV, с катанием на верблюдах и бедуинским чаем (4–5 часов).",
        fromPrice: 12.00,
        adultPrice: 20.00,
        duration: "4–5 ساعات",
        durationEn: "4–5 hours",
        durationIt: "4–5 ore",
        durationRu: "4–5 часов",
        departureWindow: {
            ar: "تحرك 04:00 – 04:30 ص",
            en: "Departs 04:00 – 04:30 AM",
            it: "Partenza 04:00 – 04:30 AM",
            ru: "Выезд 04:00 – 04:30"
        },
        rating: 4.9,
        badge: "رحلة الشروق",
        vehicle: "ATV Quad + Camel + Bedouin Tea",
        img: "assets/images/safari-sunrise.jpg",
        gallery: [
            "assets/images/safari-sunrise.jpg",
            "assets/images/safari-morning.jpg",
            "assets/images/safari-standard.jpg"
        ],
        descAr: "عِش سحر شروق الشمس بين جبال سيناء على مدار 4 إلى 5 ساعات مع قيادة البيتش باجي وركوب الجمال والشاي البدوي، مع تحرك دقيق عبر مسارين يومياً من كافة مناطق شرم الشيخ.",
        descEn: "Enjoy a full 4–5 hour Sinai sunrise safari with automatic ATV Quads, Echo Mountains photo stops, camel trekking, and Bedouin tea across 2 scheduled routes.",
        descIt: "Vivi 4–5 ore di pura magia all'alba nel Sinai in Quad ATV con cammello, foto panoramiche e tè beduino su 2 percorsi dedicati.",
        descRu: "Полноценное 4–5-часовое рассветное сафари на Синае: квадроциклы, верблюды, каньон Эхо и бедуинский чай с трансфером по 2 маршрутам.",
        highlights: {
            ar: ["جولة 4–5 ساعات متكاملة", "قيادة بيتش باجي أوتوماتيك", "توقف جبال الصدى عند الفجر", "ركوب الجمال والشاي البدوي"],
            en: ["Full 4–5h Dawn Expedition", "Automatic ATV Quad Ride", "Echo Mountains Sunrise Stop", "Camel Trek & Bedouin Tea"],
            it: ["Tour Completo 4–5 Ore", "Quad ATV Automatico", "Alba sulle Montagne dell'Eco", "Cammellata & Tè Beduino"],
            ru: ["Маршрут 4–5 часов", "Автомат-квадроциклы ATV", "Рассвет в горах Эхо", "Верблюды и бедуинский чай"]
        },
        itinerary: {
            ar: [
                { step: "01", time: "04:00 – 04:30 ص", title: "الاستلام والتحرك من نقطتك", desc: "التجمع عبر المسار الأول (الهضبة، خليج نعمة، قاعة المؤتمرات) أو المسار الثاني (خلف المطار، الغرقانة) بباصات مكيفة." },
                { step: "02", time: "04:45 ص", title: "الوصول لسنتر السفاري والتدريب", desc: "استلام خوذة الأمان وتجربة القيادة السريعة مع شرح قواعد الأمان للمبتدئين والمحترفين." },
                { step: "03", time: "05:15 ص", title: "الانطلاق بالبيتش باجي ومشهد الشروق", desc: "عبور الوديان الصحراوية حتى قمة جبال الصدى لمشاهدة شروق شمس سيناء والتقاط الصور الذهبية." },
                { step: "04", time: "06:30 ص", title: "القرية البدوية وركوب الجمال", desc: "استراحة داخل الخيمة البدوية مع الشاي بالأعشاب وجولة ركوب الجمال الأصيلة وسط الطبيعة." },
                { step: "05", time: "07:45 – 08:30 ص", title: "رحلة العودة والتوصيل للفندق", desc: "العودة بالبيتش باجي لمركز السفاري ثم التوصيل المريح لنفس نقطة الاستلام (إجمالي 4–5 ساعات)." }
            ],
            en: [
                { step: "01", time: "04:00 – 04:30 AM", title: "Air-Conditioned Route Pickup", desc: "Boarding at Route 1 (Hadaba, Naama Bay, Conference Center) or Route 2 (Behind Airport, Al-Gharqana)." },
                { step: "02", time: "04:45 AM", title: "Safari Base & Safety Briefing", desc: "Helmet fitting, quick practice loop on automatic ATV Quads, and route instructions from our lead guide." },
                { step: "03", time: "05:15 AM", title: "Dawn Quad Ride & Sunrise Ridge", desc: "Convoy ride through Sinai canyons to the Echo Mountains viewpoint to watch the golden sunrise." },
                { step: "04", time: "06:30 AM", title: "Bedouin Camp & Camel Ride", desc: "Authentic Bedouin habak tea hospitality inside the desert tent plus a serene morning camel ride." },
                { step: "05", time: "07:45 – 08:30 AM", title: "Return Trail & Drop-off", desc: "Quad return ride back to the station followed by comfortable drop-off at your pickup hub (4–5 hours total)." }
            ],
            it: [
                { step: "01", time: "04:00 – 04:30 AM", title: "Ritiro Climatizzato", desc: "Partenza puntuale dal Percorso 1 o Percorso 2 nei 5 punti ufficiali di Sharm." },
                { step: "02", time: "04:45 AM", title: "Base Safari & Briefing", desc: "Consegna caschi e giro di prova sui Quad ATV automatici." },
                { step: "03", time: "05:15 AM", title: "Alba sulle Montagne dell'Eco", desc: "Percorso tra i canyon fino al belvedere dell'alba per foto indimenticabili." },
                { step: "04", time: "06:30 AM", title: "Villaggio Beduino & Cammelli", desc: "Sosta relax con tè beduino alle erbe e passeggiata in cammello." },
                { step: "05", time: "07:45 – 08:30 AM", title: "Rientro in Hotel", desc: "Ritorno alla base e trasferimento al punto di partenza (durata totale 4–5 ore)." }
            ],
            ru: [
                { step: "01", time: "04:00 – 04:30", title: "Трансфер из вашей зоны", desc: "Посадка на комфортабельный автобус по Маршруту 1 или Маршруту 2." },
                { step: "02", time: "04:45", title: "Инструктаж на базе сафари", desc: "Выдача шлемов и короткий тест-драйв автоматических квадроциклов." },
                { step: "03", time: "05:15", title: "Заезд к горам Эхо на рассвет", desc: "Живописный маршрут по пустыне и остановка на панорамной площадке к восходу солнца." },
                { step: "04", time: "06:30", title: "Бедуинская деревня и верблюды", desc: "Отдых в шатре с традиционным чаем и катание на верблюдах." },
                { step: "05", time: "07:45 – 08:30", title: "Возвращение в отель", desc: "Обратная поездка на базу и трансфер в ваш район (всего 4–5 часов)." }
            ]
        },
        includes: {
            ar: ["انتقالات مكيفة ذهاب وعودة من نقاط الاستلام الرسمية", "قيادة البيتش باجي الأوتوماتيك + خوذة أمان", "جولة ركوب الجمال في الصحراء", "ضيافة الشاي البدوي الأصيل", "مرشد سفاري محترف طوال الـ 4–5 ساعات"],
            en: ["Two-way AC transfer from official pickup points", "Automatic ATV Quad + safety helmet", "Desert camel riding experience", "Traditional Bedouin herbal tea hospitality", "Experienced safari guide throughout all 4–5 hours"],
            it: ["Trasferimento A/R climatizzato dai punti ufficiali", "Quad ATV automatico + casco", "Giro in cammello nel deserto", "Tè beduino tradizionale", "Guida esperta per tutte le 4–5 ore"],
            ru: ["Трансфер туда и обратно от официальных остановок", "Квадроцикл ATV + защитный шлем", "Прогулка на верблюдах", "Традиционный бедуинский чай", "Опытный гид на всём маршруте (4–5 часов)"]
        },
        excludes: {
            ar: ["الوشاح البدوي (الكوفية) ونظارة الغبار الاختيارية", "جلسة التصوير الفوتوغرافي والفيديو الاحترافية (اختياري)", "المشروبات المعبأة أو المشتريات الشخصية"],
            en: ["Optional Bedouin scarf & desert goggles", "Optional professional photo & video package", "Personal purchases & extra bottled drinks"],
            it: ["Kefiah e occhiali antipolvere facoltativi", "Servizio foto/video professionale", "Spese personali"],
            ru: ["Арафатка и защитные очки (по желанию)", "Профессиональная фото- и видеосъёмка", "Личные расходы"]
        },
        bring: {
            ar: ["حذاء رياضي مغلق ومريح", "جاكيت خفيف لأجواء الفجر المنعشة", "نظارة شمسية", "هاتف أو كاميرا مشحونة بالكامل"],
            en: ["Closed-toe sneakers", "Light jacket for crisp dawn air", "Sunglasses", "Fully charged phone or camera"],
            it: ["Scarpe da ginnastica chiuse", "Giacca leggera per l'alba", "Occhiali da sole", "Telefono o fotocamera carica"],
            ru: ["Закрытая спортивная обувь", "Лёгкая куртка для утренней прохлады", "Солнцезащитные очки", "Заряженный телефон или камера"]
        },
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
        subtitleAr: "مغامرة صباحية مليئة بالحماس بين الكثبان الرملية بالبيتش باجي والباجي الصحراوي مع الخيمة البدوية لمدة 4–5 ساعات.",
        subtitleEn: "High-energy 4–5 hour morning desert drive combining ATV Quads, open Dune Buggies, Echo Canyon views, and Bedouin camp relaxation.",
        subtitleIt: "Avventura mattutina di 4–5 ore tra dune, Quad ATV, Dune Buggy e ospitalità beduina.",
        subtitleRu: "Активная 4–5-часовая утренняя экспедиция на квадроциклах и багги по каньонам Южного Синая.",
        fromPrice: 11.00,
        adultPrice: 18.00,
        duration: "4–5 ساعات",
        durationEn: "4–5 hours",
        durationIt: "4–5 ore",
        durationRu: "4–5 часов",
        departureWindow: {
            ar: "تحرك 08:00 – 08:40 ص",
            en: "Departs 08:00 – 08:40 AM",
            it: "Partenza 08:00 – 08:40 AM",
            ru: "Выезд 08:00 – 08:40"
        },
        rating: 4.8,
        badge: "الرحلة الصباحية",
        vehicle: "ATV Quad + Dune Buggy",
        img: "assets/images/safari-morning.jpg",
        gallery: [
            "assets/images/safari-morning.jpg",
            "assets/images/safari-standard.jpg",
            "assets/images/safari-sunrise.jpg"
        ],
        descAr: "جولة صباحية متكاملة (4–5 ساعات) في قلب صحراء شرم الشيخ بقيادة البيتش باجي والباجي الصحراوي مع توقف في الخيمة البدوية وركوب الجمال، تنطلق الساعة 08:00 ص على مسارين.",
        descEn: "Full 4–5 hour morning desert expedition riding ATV Quads and Dune Buggies across South Sinai trails with Echo Canyon & Bedouin camp stops across 2 scheduled routes.",
        descIt: "Escursione mattutina completa di 4–5 ore dalle 08:00 tra le piste del deserto in Quad ATV e Dune Buggy con sosta alla tenda beduina.",
        descRu: "Насыщенное утреннее 4–5-часовое сафари с 08:00 на квадроциклах и багги с остановкой у бедуинов по 2 маршрутам сбора.",
        highlights: {
            ar: ["مغامرة 4–5 ساعات صباحية", "بيتش باجي + باجي صحراوي", "مناسبة للعائلات والأطفال", "توقف الخيمة البدوية والجمال"],
            en: ["4–5h Morning Expedition", "ATV Quad + Dune Buggy", "Family & Beginner Friendly", "Bedouin Tent & Camel Stop"],
            it: ["Spedizione di 4–5 Ore", "Quad ATV + Dune Buggy", "Ideale per Famiglie", "Sosta Tenda Beduina"],
            ru: ["Тур 4–5 часов", "Квадроциклы + Багги", "Подходит семьям и детям", "Бедуинский шатёр и верблюды"]
        },
        itinerary: {
            ar: [
                { step: "01", time: "08:00 – 08:40 ص", title: "الاستلام عبر المسار الأول أو الثاني", desc: "التحرك من الهضبة، خليج نعمة، خلف المطار، والغرقانة وفق جدول التشغيل المعتمد." },
                { step: "02", time: "09:00 ص", title: "تجهيز المركبات وحصة التدريب", desc: "استلام معدات الأمان والبدء بجولة اختبار قصيرة لضمان قيادة واثقة وممتعة للجميع." },
                { step: "03", time: "09:30 ص", title: "انطلاق قافلة البيتش باجي والباجي", desc: "القيادة عبر المسارات الرملية المفتوحة وجبال الصدى مع محطات تصوير بانورامية." },
                { step: "04", time: "10:45 ص", title: "استراحة القرية البدوية والجمال", desc: "تذوق الشاي البدوي، التعرف على صناعة الخبز التقليدي، وركوب الجمال." },
                { step: "05", time: "12:15 – 12:50 م", title: "العودة والوصول لمحطات شرم الشيخ", desc: "قيادة مسار العودة ثم التوصيل المريح إلى نقطة الاستلام بعد 4–5 ساعات من المغامرة." }
            ],
            en: [
                { step: "01", time: "08:00 – 08:40 AM", title: "Morning Route Pickup", desc: "Scheduled AC pickup across Route 1 (Hadaba, Naama Bay, Airport) and Route 2 (Behind Airport, Gharqana)." },
                { step: "02", time: "09:00 AM", title: "Vehicle Assignment & Briefing", desc: "Full safety walkthrough and automatic Quad/Buggy practice track before hitting the open trails." },
                { step: "03", time: "09:30 AM", title: "Deep Canyon Trail Drive", desc: "High-fun desert ride through flat plains, dunes, and Echo Mountains with guided photo pauses." },
                { step: "04", time: "10:45 AM", title: "Bedouin Oasis & Camel Experience", desc: "Rest at our Bedouin village for traditional tea, cultural hospitality, and camel riding." },
                { step: "05", time: "12:15 – 12:50 PM", title: "Return Ride & Drop-off", desc: "Cruise back to base and transfer to your hotel area (4–5 hours total experience)." }
            ],
            it: [
                { step: "01", time: "08:00 – 08:40 AM", title: "Ritiro Mattutino", desc: "Partenza dai punti ufficiali di Hadaba, Naama Bay, Zona Aeroporto e Gharqana." },
                { step: "02", time: "09:00 AM", title: "Briefing & Prova", desc: "Istruzioni di sicurezza e test pratico dei veicoli automatici." },
                { step: "03", time: "09:30 AM", title: "Corsa tra Dune e Canyon", desc: "Itinerario panoramico con soste fotografiche tra le montagne." },
                { step: "04", time: "10:45 AM", title: "Villaggio Beduino & Cammelli", desc: "Pausa tè beduino tradizionale e giro in cammello." },
                { step: "05", time: "12:15 – 12:50 PM", title: "Rientro in Hotel", desc: "Ritorno alla base e trasferimento al punto di ritiro (4–5 ore totali)." }
            ],
            ru: [
                { step: "01", time: "08:00 – 08:40", title: "Утренний трансфер", desc: "Сбор туристов по Маршруту 1 и Маршруту 2 строго по расписанию." },
                { step: "02", time: "09:00", title: "Подготовка и тест-драйв", desc: "Инструктаж по технике безопасности и пробный круг на базе." },
                { step: "03", time: "09:30", title: "Заезд по пустыне и каньону", desc: "Динамичное катание на квадроциклах и багги с остановками для фото." },
                { step: "04", time: "10:45", title: "Бедуинский лагерь", desc: "Отдых в оазисе, бедуинский чай и прогулка на верблюдах." },
                { step: "05", time: "12:15 – 12:50", title: "Обратный трансфер", desc: "Возвращение на базу и доставка к месту посадки (4–5 часов)." }
            ]
        },
        includes: {
            ar: ["انتقالات مكيفة ذهاب وعودة", "البيتش باجي أو الباجي حسب الاختيار", "خوذة الأمان والتدريب العملي", "ركوب الجمال والشاي البدوي", "مرشد سفاري مرافق لمدة 4–5 ساعات"],
            en: ["Round-trip AC hotel area pickup", "ATV Quad or Dune Buggy driving", "Helmet & practical safety briefing", "Bedouin camp stop, tea & camel ride", "Professional guide for all 4–5 hours"],
            it: ["Trasferimento A/R", "Quad ATV o Dune Buggy", "Casco e briefing di sicurezza", "Tè beduino e cammello", "Guida esperta (4–5 ore)"],
            ru: ["Трансфер в обе стороны", "Квадроцикл или багги", "Шлем и инструктаж", "Чай у бедуинов и верблюды", "Сопровождение гида (4–5 часов)"]
        },
        excludes: {
            ar: ["الوشاح البدوي ونظارة الغبار", "التصوير الاحترافي الاختياري", "المشتريات والمشروبات الإضافية"],
            en: ["Scarf & goggles (available on site)", "Optional photo/video album", "Personal expenses"],
            it: ["Kefiah e occhiali", "Foto e video opzionali", "Spese personali"],
            ru: ["Арафатка и очки", "Фото- и видеоуслуги", "Личные расходы"]
        },
        bring: {
            ar: ["نظارة شمسية وواقي شمس", "حذاء رياضي مريح", "ملابس قطنية خفيفة", "مياه شرب وهاتف مشحون"],
            en: ["Sunglasses & sunscreen", "Comfortable closed sneakers", "Breathable daytime wear", "Water & charged camera"],
            it: ["Occhiali da sole e crema solare", "Scarpe chiuse", "Abbigliamento comodo", "Acqua e fotocamera"],
            ru: ["Солнцезащитные очки и крем", "Удобные кроссовки", "Лёгкая одежда", "Вода и заряженный телефон"]
        },
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
        subtitleAr: "تجربة الظهيرة الكلاسيكية لمدة 4–5 ساعات وسط جبال الصدى، تجربة صدى الصوت، ركوب الجمال، وضوء الغروب الذهبي.",
        subtitleEn: "Classic 4–5 hour afternoon safari starting 14:15 through Echo Mountains canyon with voice-echo stop, camel ride, and Bedouin hospitality before sunset.",
        subtitleIt: "Il grande classico pomeridiano di 4–5 ore dalle 14:15 tra le Montagne dell'Eco, cammelli e luce dorata.",
        subtitleRu: "Классическое 4–5-часовое дневное сафари с выездом в 14:15: горы Эхо, верблюды и мягкий свет предзаката.",
        fromPrice: 10.00,
        adultPrice: 17.00,
        duration: "4–5 ساعات",
        durationEn: "4–5 hours",
        durationIt: "4–5 ore",
        durationRu: "4–5 часов",
        departureWindow: {
            ar: "تحرك 14:15 – 14:30",
            en: "Departs 14:15 – 14:30",
            it: "Partenza 14:15 – 14:30",
            ru: "Выезд 14:15 – 14:30"
        },
        rating: 4.8,
        badge: "الرحلات العادية",
        vehicle: "ATV Quad + Echo Mountains",
        img: "assets/images/safari-standard.jpg",
        gallery: [
            "assets/images/safari-standard.jpg",
            "assets/images/safari-morning.jpg",
            "assets/images/safari-dinner.jpg"
        ],
        descAr: "رحلة السفاري الكلاسيكية بعد الظهر لمدة 4 إلى 5 ساعات وسط جبال الصدى ووديان شرم الشيخ مع الشاي البدوي وركوب الجمال بأفضل قيمة سعرية بدءاً من 14:15.",
        descEn: "Best-value 4–5 hour classic afternoon desert safari starting at 14:15 through Echo Mountains with scenic golden-hour views, camel ride, and Bedouin tea.",
        descIt: "Safari pomeridiano classico di 4–5 ore dalle 14:15 nelle Montagne dell'Eco con cammello e tè beduino al miglior prezzo.",
        descRu: "Лучшее по цене 4–5-часовое дневное сафари с выездом в 14:15: каньон Гор Эхо, катание на верблюдах и бедуинский чай.",
        highlights: {
            ar: ["البرنامج الكلاسيكي (4–5 ساعات)", "أفضل قيمة تبدأ من $10", "توقف صدى الصوت بجبال الصدى", "ركوب الجمال والشاي البدوي"],
            en: ["Full 4–5h Classic Route", "Best Value From $10", "Echo Canyon Sound Stop", "Camel Ride & Bedouin Tea"],
            it: ["Classico 4–5 Ore", "Miglior Prezzo da $10", "Sosta Canyon dell'Eco", "Cammello & Tè Beduino"],
            ru: ["Классика 4–5 часов", "Выгодная цена от $10", "Остановка в горах Эхо", "Верблюды и чай"]
        },
        itinerary: {
            ar: [
                { step: "01", time: "14:15 – 14:30", title: "التجمع عبر مساري الظهيرة", desc: "الاستلام الدقيق من الهضبة، خليج نعمة، قاعة المؤتمرات، خلف المطار، والغرقانة." },
                { step: "02", time: "15:00", title: "الإعداد والتدريب العملي", desc: "ارتداء الخوذة والتدريب السريع على البيتش باجي وسط إشراف فريق موسى سفاري." },
                { step: "03", time: "15:30", title: "مسار وادي الصدى والتلال الرملية", desc: "قيادة ممتعة وصولاً لمنطقة جبال الصدى حيث يرتد صوتك بين الجبال مع استراحة تصوير." },
                { step: "04", time: "16:45", title: "الواحة البدوية ومشهد العصر الذهبي", desc: "تقديم الشاي البدوي، ركوب الجمال، والاستمتاع بألوان الصحراء الدافئة قبل الغروب." },
                { step: "05", time: "18:15 – 18:45", title: "العودة المريحة لنفس المحطة", desc: "الرجوع لمركز السفاري ثم التوصيل الآمن لنقطة الاستلام (المدة الإجمالية 4–5 ساعات)." }
            ],
            en: [
                { step: "01", time: "14:15 – 14:30", title: "Afternoon Station Pickups", desc: "Prompt AC collection from Route 1 (Hadaba, Naama Bay, Conference Center) or Route 2 (Behind Airport, Al-Gharqana)." },
                { step: "02", time: "15:00", title: "Safari Briefing & Practice", desc: "Gear up with safety helmets and practice controls before entering the desert convoy." },
                { step: "03", time: "15:30", title: "Echo Mountains Canyon Run", desc: "Trail ride deep into the valley for natural canyon echoes and panoramic photography." },
                { step: "04", time: "16:45", title: "Bedouin Camp & Camel Ride", desc: "Enjoy authentic Bedouin tea and camel trekking as warm golden-hour shadows sweep the dunes." },
                { step: "05", time: "18:15 – 18:45", title: "Base Return & Hotel Drop-off", desc: "Return drive to the center followed by drop-off at your pickup zone (4–5 hours total)." }
            ],
            it: [
                { step: "01", time: "14:15 – 14:30", title: "Ritiro Pomeridiano", desc: "Raccolta da Hadaba, Naama Bay, Centro Congressi, Zona Aeroporto e Gharqana." },
                { step: "02", time: "15:00", title: "Briefing & Partenza", desc: "Consegna caschi e giro di prova." },
                { step: "03", time: "15:30", title: "Canyon dell'Eco", desc: "Sosta panoramica nella valle dell'eco per fotografie." },
                { step: "04", time: "16:45", title: "Campo Beduino & Cammello", desc: "Tè beduino e cammellata con la luce del tardo pomeriggio." },
                { step: "05", time: "18:15 – 18:45", title: "Rientro", desc: "Ritorno alla base e trasferimento al punto di partenza (4–5 ore totali)." }
            ],
            ru: [
                { step: "01", time: "14:15 – 14:30", title: "Дневной трансфер", desc: "Выезд из Хадабы, Наама-Бей, Конференц-центра, За аэропортом и Эль-Гарканы." },
                { step: "02", time: "15:00", title: "Инструктаж на базе", desc: "Проверка шлемов и короткий тренировочный круг." },
                { step: "03", time: "15:30", title: "Каньон Гор Эхо", desc: "Маршрут по пустынной долине с эффектом эха и панорамными фото." },
                { step: "04", time: "16:45", title: "Бедуинский шатёр", desc: "Традиционный чай, прогулка на верблюдах и мягкие закатные краски." },
                { step: "05", time: "18:15 – 18:45", title: "Возвращение в город", desc: "Возврат к точке посадки (общая длительность 4–5 часов)." }
            ]
        },
        includes: {
            ar: ["انتقالات مكيفة ذهاب وعودة بالمسارين", "جولة البيتش باجي الأوتوماتيك + خوذة", "تجربة ركوب الجمال", "ضيافة الشاي البدوي التقليدي", "مرشد سفاري محترف (4–5 ساعات)"],
            en: ["Two-way AC route transfers", "Automatic ATV Quad + helmet", "Camel ride session", "Authentic Bedouin tea", "Guided 4–5 hour expedition"],
            it: ["Trasferimenti A/R", "Quad ATV + casco", "Cammellata", "Tè beduino", "Guida professionale (4–5 ore)"],
            ru: ["Трансфер в обе стороны", "Квадроцикл + шлем", "Катание на верблюдах", "Бедуинский чай", "Сопровождение гида (4–5 часов)"]
        },
        excludes: {
            ar: ["وشاح الرأس ونظارة الغبار", "التصوير الاحترافي", "المشروبات الإضافية"],
            en: ["Optional scarf & goggles", "Professional photographer add-on", "Extra drinks / personal items"],
            it: ["Kefiah e occhiali", "Foto professionali", "Extra personali"],
            ru: ["Арафатка и очки", "Фотосессия", "Дополнительные напитки"]
        },
        bring: {
            ar: ["نظارة شمسية", "حذاء مغلق", "ملابس مريحة لقيادة الباجي", "كاميرا أو هاتف مشحون"],
            en: ["Sunglasses", "Closed-toe shoes", "Comfortable riding clothes", "Charged camera / phone"],
            it: ["Occhiali da sole", "Scarpe chiuse", "Abbigliamento comodo", "Fotocamera carica"],
            ru: ["Солнцезащитные очки", "Закрытая обувь", "Удобная одежда", "Телефон или камера"]
        },
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
        subtitleAr: "مغامرة الغروب الذهبية لمدة 4–5 ساعات تجمع البيتش باجي، ركوب الجمال، بوفيه عشاء الباربكيو المشوي، والعروض البدوية والنار.",
        subtitleEn: "Signature 4–5 hour sunset-to-starlight experience featuring ATV Quads, camel riding, an open-buffet Bedouin BBQ feast, and live Tanoura & fire shows.",
        subtitleIt: "Esperienza serale di 4–5 ore dal tramonto alle stelle: Quad ATV, cammelli, cena BBQ beduina e spettacolo dal vivo.",
        subtitleRu: "Вечернее 4–5-часовое приключение от заката до звёзд: квадроциклы, верблюды, ужин-барбекю и восточное огненное шоу.",
        fromPrice: 18.00,
        adultPrice: 28.00,
        duration: "4–5 ساعات",
        durationEn: "4–5 hours",
        durationIt: "4–5 ore",
        durationRu: "4–5 часов",
        departureWindow: {
            ar: "تحرك 15:30 – 16:15",
            en: "Departs 15:30 – 16:15",
            it: "Partenza 15:30 – 16:15",
            ru: "Выезд 15:30 – 16:15"
        },
        rating: 4.9,
        badge: "رحلة العشاء",
        vehicle: "ATV Quad + Camel + BBQ Dinner & Show",
        img: "assets/images/safari-dinner.jpg",
        gallery: [
            "assets/images/safari-dinner.jpg",
            "assets/images/safari-standard.jpg",
            "assets/images/safari-sunrise.jpg"
        ],
        descAr: "التجربة المسائية الأكثر طلباً في شرم الشيخ (4–5 ساعات): بيتش باجي عند الغروب، ركوب الجمال، بوفيه عشاء بدوي فاخر مشوي، وعروض فنية وتنورة تحت النجوم مع مسارين للعشاء.",
        descEn: "Our top-rated 4–5 hour sunset desert safari: sunset ATV Quad riding, camel trek, open-buffet Bedouin BBQ dinner, and live Tanoura & fire show under Sinai stars.",
        descIt: "Il nostro tour serale più richiesto (4–5 ore): Quad ATV al tramonto, cammello, cena BBQ beduina a buffet e spettacolo sotto le stelle.",
        descRu: "Самый популярный вечерний тур (4–5 часов): квадроциклы на закате, верблюды, богатый ужин-барбекю и шоу-программа под звёздами.",
        highlights: {
            ar: ["بوفيه عشاء بدوي باربكيو", "حفلة التنورة وعروض النار", "بيتش باجي عند الغروب + جمال", "مدة السهرة الكاملة 4–5 ساعات"],
            en: ["Open Bedouin BBQ Dinner", "Live Tanoura & Fire Show", "Sunset Quad + Camel Trek", "4–5h Evening Experience"],
            it: ["Cena BBQ Beduina a Buffet", "Spettacolo Tanoura & Fuoco", "Quad al Tramonto & Cammelli", "Esperienza 4–5 Ore"],
            ru: ["Ужин-барбекю у бедуинов", "Шоу Танура и фаер-шоу", "Квадроциклы на закате", "Полная программа 4–5 часов"]
        },
        itinerary: {
            ar: [
                { step: "01", time: "15:30 – 16:15", title: "التحرك عبر مساري رحلة العشاء", desc: "المسار الأول (الهضبة، خليج نعمة، قاعة المؤتمرات) والمسار الثاني للعشاء (خلف المطار 16:00، الغرقانة 16:15)." },
                { step: "02", time: "16:30", title: "استلام البيتش باجي وقيادة الغروب", desc: "انطلاق القافلة في أجواء الغروب الذهبية نحو جبال الصدى لالتقاط أجمل الصور الساحرة." },
                { step: "03", time: "17:45", title: "ركوب الجمال والوصول للمخيم البدوي", desc: "جولة الجمال على رمال سيناء ثم الترحيب بالشاي البدوي الدافئ والقهوة العربية." },
                { step: "04", time: "18:30", title: "بوفيه العشاء المشوي والعروض الفلكلورية", desc: "مشاوي شيش طاووق وكفتة وأرز وسلطات وخبز بدوي طازج مع عروض التنورة المصرية والنار." },
                { step: "05", time: "19:45 – 20:30", title: "تأمل النجوم والعودة لنقطة الاستلام", desc: "أجواء سكون النجوم ثم العودة المريحة إلى شرم الشيخ (البرنامج الكامل 4–5 ساعات)." }
            ],
            en: [
                { step: "01", time: "15:30 – 16:15", title: "Dinner Safari Route Pickups", desc: "Route 1 (Hadaba 15:30, Naama Bay 15:45, Conference 16:00) and Route 2 Dinner (Behind Airport 16:00, Gharqana 16:15)." },
                { step: "02", time: "16:30", title: "Sunset ATV Quad Expedition", desc: "Ride through red desert canyons bathed in warm sunset light with an Echo Mountains photo stop." },
                { step: "03", time: "17:45", title: "Camel Trek & Camp Welcome", desc: "Enjoy a classic sunset camel ride followed by Bedouin mint tea in our lantern-lit desert camp." },
                { step: "04", time: "18:30", title: "BBQ Dinner Buffet & Live Desert Show", desc: "Freshly grilled BBQ chicken, kofta, rice, salads & Bedouin bread with Tanoura and fire performances." },
                { step: "05", time: "19:45 – 20:30", title: "Starlight Finale & Return Transfer", desc: "Short stargazing pause in the tranquil desert before smooth drop-off at your pickup hub (4–5 hours)." }
            ],
            it: [
                { step: "01", time: "15:30 – 16:15", title: "Ritiro Pomeridiano Dedicato", desc: "Percorso 1 (Hadaba, Naama Bay, Centro Congressi) e Percorso 2 Cena (Aeroporto 16:00, Gharqana 16:15)." },
                { step: "02", time: "16:30", title: "Quad ATV al Tramonto", desc: "Guida tra le rocce rosse del Sinai con vista tramonto." },
                { step: "03", time: "17:45", title: "Cammellata & Campo illuminato", desc: "Passeggiata in cammello e accoglienza con tè beduino." },
                { step: "04", time: "18:30", title: "Cena BBQ & Spettacolo", desc: "Buffet alla griglia, pane beduino fresco, danza Tanoura e spettacolo del fuoco." },
                { step: "05", time: "19:45 – 20:30", title: "Stelle & Rientro", desc: "Ammirazione del cielo stellato e ritorno al punto di ritiro (4–5 ore)." }
            ],
            ru: [
                { step: "01", time: "15:30 – 16:15", title: "Сбор на ужин-сафари", desc: "Маршрут 1 (Хадаба, Наама-Бей, Конференц-центр) и Маршрут 2 Ужин (За аэропортом 16:00, Эль-Гаркана 16:15)." },
                { step: "02", time: "16:30", title: "Квадроциклы на закате", desc: "Заезд к горам Эхо в золотых лучах заходящего солнца." },
                { step: "03", time: "17:45", title: "Верблюды и вечерний лагерь", desc: "Прогулка на верблюдах и встреча с бедуинским чаем при свете фонарей." },
                { step: "04", time: "18:30", title: "Ужин-барбекю и восточное шоу", desc: "Гриль на углях, салаты, свежие лепёшки, танец Танура и огненное шоу." },
                { step: "05", time: "19:45 – 20:30", title: "Звёздное небо и возвращение", desc: "Минуты тишины под звёздами Синая и обратный трансфер (4–5 часов)." }
            ]
        },
        includes: {
            ar: ["انتقالات مكيفة ذهاب وعودة", "قيادة البيتش باجي عند الغروب + خوذة", "جولة ركوب الجمال", "بوفيه عشاء باربكيو مفتوح ومشروب غازي/مياه", "حفلة وعروض التنورة والنار والشاي البدوي (4–5 ساعات)"],
            en: ["Round-trip AC pickup & drop-off", "Sunset ATV Quad ride + safety helmet", "Camel trekking experience", "Open Bedouin BBQ dinner buffet + soft drink/water", "Live Tanoura & fire show + Bedouin tea (4–5 hours)"],
            it: ["Trasferimenti A/R climatizzati", "Quad ATV al tramonto + casco", "Giro in cammello", "Cena BBQ a buffet + acqua/soft drink", "Spettacolo Tanoura e fuoco + tè (4–5 ore)"],
            ru: ["Трансфер в обе стороны", "Квадроциклы на закате + шлем", "Катание на верблюдах", "Шведский стол барбекю + вода/напиток", "Шоу Танура, фаер-шоу и бедуинский чай (4–5 часов)"]
        },
        excludes: {
            ar: ["الشال البدوي ونظارة الغبار الاختيارية", "التصوير الفوتوغرافي والفيديو", "المشروبات الخاصة الإضافية"],
            en: ["Optional Bedouin scarf & goggles", "Optional professional photos/video", "Specialty extra beverages"],
            it: ["Kefiah e occhiali opzionali", "Foto/video professionali", "Bevande extra"],
            ru: ["Арафатка и защитные очки", "Профессиональная фотосъёмка", "Дополнительные напитки"]
        },
        bring: {
            ar: ["جاكيت خفيف لمساء الصحراء", "حذاء رياضي مغلق", "نظارة شمسية لأول الرحلة", "كاميرا لتصوير الغروب والعشاء"],
            en: ["Light evening layer / hoodie", "Closed-toe sneakers", "Sunglasses for sunset trail", "Camera for sunset & show photos"],
            it: ["Felpa leggera per la sera", "Scarpe chiuse", "Occhiali da sole", "Fotocamera per tramonto e show"],
            ru: ["Лёгкая кофта на вечер", "Закрытая обувь", "Солнцезащитные очки", "Камера для заката и шоу"]
        },
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
    routes: t.routes,
    departureWindow: t.departureWindow,
    gallery: t.gallery,
    subtitleAr: t.subtitleAr,
    subtitleEn: t.subtitleEn,
    subtitleIt: t.subtitleIt,
    subtitleRu: t.subtitleRu,
    highlights: t.highlights,
    itinerary: t.itinerary,
    includes: t.includes,
    excludes: t.excludes,
    bring: t.bring
}));

function pickLocalized(obj, lang = "ar", fallbackVal = []) {
    if (!obj) return fallbackVal;
    if (Array.isArray(obj) || typeof obj === "string") return obj;
    return obj[lang] || obj.en || obj.ar || fallbackVal;
}

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
 * Resolve full localized details (itinerary, highlights, inclusions, exclusions, gallery) for a tour.
 * @param {object} trip
 * @param {string} [lang="ar"]
 * @returns {object}
 */
export function getTripDetails(trip, lang = "ar") {
    const base = DEFAULT_TRIPS_SNAPSHOT.find(x => x.id === trip?.id || x.category === trip?.category) || DEFAULT_TRIPS_SNAPSHOT[0];
    const src = { ...base, ...(trip || {}) };
    const subKey = lang === "it" ? "subtitleIt" : lang === "ru" ? "subtitleRu" : lang === "en" ? "subtitleEn" : "subtitleAr";
    const depWin = pickLocalized(src.departureWindow, lang, pickLocalized(base.departureWindow, lang, ""));
    return {
        subtitle: src[subKey] || src.subtitleEn || src.subtitleAr || "",
        departureWindow: depWin,
        gallery: Array.isArray(src.gallery) && src.gallery.length ? src.gallery : [src.img || "assets/images/safari-sunrise.jpg", ...(base.gallery || []).slice(1)],
        highlights: pickLocalized(src.highlights, lang, pickLocalized(base.highlights, lang, [])),
        itinerary: pickLocalized(src.itinerary, lang, pickLocalized(base.itinerary, lang, [])),
        includes: pickLocalized(src.includes, lang, pickLocalized(base.includes, lang, [])),
        excludes: pickLocalized(src.excludes, lang, pickLocalized(base.excludes, lang, [])),
        bring: pickLocalized(src.bring, lang, pickLocalized(base.bring, lang, []))
    };
}

/**
 * Build dedicated tour page URL with safe static + rewrite compatibility.
 * @param {string} tripId
 * @param {string} [lang=""]
 * @returns {string}
 */
export function getTripPageUrl(tripId, lang = "") {
    const cleanId = encodeURIComponent(tripId || "mosa-sunrise");
    const suffix = lang ? `&lang=${encodeURIComponent(lang)}` : "";
    return `tour.html?id=${cleanId}${suffix}`;
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
