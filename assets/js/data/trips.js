/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

export const HERO_SLIDES = [
    {
        img: "assets/images/hero-atv-sunset.jpg",
        tag: {
            ar: "شرم الشيخ · جبال الصدى",
            en: "Sharm El Sheikh · Echo Mountains",
            it: "Sharm El Sheikh · Montagne dell'Eco",
            ru: "Шарм-эль-Шейх · Горы Эхо"
        },
        title: {
            ar: "مغامرات البيتش باجي والغروب",
            en: "Quad ATV & Sunset Adventures",
            it: "Avventure Quad ATV & Tramonto",
            ru: "Приключения на квадроциклах и закат"
        }
    },
    {
        img: "assets/images/safari-nabq-buggy.jpg",
        tag: {
            ar: "محمية نبق · شرم الشيخ",
            en: "Nabq Reserve · Sharm El Sheikh",
            it: "Riserva di Nabq · Sharm El Sheikh",
            ru: "Заповедник Набк · Шарм-эль-Шейх"
        },
        title: {
            ar: "سفاري الدفع الرباعي والباجي",
            en: "4x4 Off-Road & Dune Buggy Safari",
            it: "Safari 4x4 & Dune Buggy",
            ru: "Сафари 4x4 и багги по дюнам"
        }
    },
    {
        img: "assets/images/safari-night-stars.jpg",
        tag: {
            ar: "القرية البدوية · سيناء",
            en: "Bedouin Camp · South Sinai",
            it: "Campo Beduino · Sinai del Sud",
            ru: "Бедуинский лагерь · Южный Синай"
        },
        title: {
            ar: "سفاري ليلية ومراقبة النجوم",
            en: "Night Safari & Stargazing Experience",
            it: "Safari Notturno & Osservazione Stelle",
            ru: "Ночное сафари и наблюдение за звёздами"
        }
    },
    {
        img: "assets/images/safari-canyon-dahab.jpg",
        tag: {
            ar: "دهب والوادي الملون",
            en: "Colored Canyon & Dahab",
            it: "Canyon Colorato & Dahab",
            ru: "Цветной каньон и Дахаб"
        },
        title: {
            ar: "الوادي الملون والثقب الأزرق",
            en: "Colored Canyon & Blue Hole Expedition",
            it: "Spedizione Canyon Colorato & Blue Hole",
            ru: "Экспедиция в Цветной каньон и Голубую дыру"
        }
    }
];

export const SAFARI_TRIPS = [
    {
        id: "sharm-sunrise-atv",
        category: "atv",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "Sharm El Sheikh: Sunrise ATV Quad Adventure & Camel Trek",
        titleAr: "شرم الشيخ: مغامرة شروق الشمس بالبيتش باجي وركوب الجمال",
        titleIt: "Sharm El Sheikh: Avventura all'Alba in Quad ATV e Cammello",
        titleRu: "Шарм-эль-Шейх: Рассвет на квадроциклах ATV и прогулка на верблюдах",
        fromPrice: 10.13,
        adultPrice: 20.26,
        duration: "4 ساعات",
        durationEn: "4 hours",
        durationIt: "4 ore",
        durationRu: "4 часа",
        rating: 4.3,
        badge: "شروق الشمس · خصم 20%",
        vehicle: "ATV Quad + Camel",
        img: "assets/images/hero-atv-sunset.jpg",
        descAr: "انطلق مع خيوط الفجر الأولى في صحراء شرم الشيخ بقيادة البيتش باجي وجولة جمال أصيلة مع الشاي البدوي.",
        descEn: "Ride across Sharm El Sheikh's golden desert at dawn on an automatic ATV Quad, combined with an authentic camel trek and Bedouin tea.",
        descIt: "Parti all'alba nel deserto di Sharm El Sheikh in Quad ATV automatico, con passeggiata in cammello e tè beduino nel canyon.",
        descRu: "Встретьте рассвет в пустыне Шарм-эль-Шейха на квадроцикле ATV с прогулкой на верблюдах и традиционным бедуинским чаем."
    },
    {
        id: "sharm-night-5in1",
        category: "night",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "Sharm El Sheikh Night: 5-in-1 ATV Safari & Stargazing Experience",
        titleAr: "سفاري شرم الشيخ الليلية: تجربة 5 في 1 ومراقبة النجوم",
        titleIt: "Sharm Notte: Safari 5-in-1 in Quad ATV e Osservazione Stelle",
        titleRu: "Ночной Шарм: Сафари 5-в-1 на квадроциклах и звёздное небо",
        fromPrice: 22.93,
        adultPrice: 27.14,
        duration: "6 ساعات",
        durationEn: "6 hours",
        durationIt: "6 ore",
        durationRu: "6 часов",
        rating: 4.3,
        badge: "5 في 1 · نجوم",
        vehicle: "ATV Quad + Stargazing",
        img: "assets/images/safari-night-stars.jpg",
        descAr: "رحلة مسائية متكاملة تشمل البيتش باجي، ركوب الجمال، العشاء البدوي المشوي، عرض شرقي، ورصد النجوم بالتلسكوب.",
        descEn: "Complete evening expedition featuring ATV quad riding, camel trek, BBQ Bedouin dinner, live folkloric show, and telescope stargazing.",
        descIt: "Esperienza serale completa: guida Quad ATV, cammello, cena beduina BBQ, spettacolo orientale e osservazione delle stelle al telescopio.",
        descRu: "Полный вечерний тур: квадроциклы ATV, верблюды, бедуинский ужин-барбекю, восточное шоу и наблюдение за звёздами в телескоп."
    },
    {
        id: "sharm-sunset-echo",
        category: "atv",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "Sharm El Sheikh: Sunset ATV Quad Safari in the Echo Mountains",
        titleAr: "شرم الشيخ: سفاري الغروب بالبيتش باجي في جبال الصدى",
        titleIt: "Sharm El Sheikh: Safari al Tramonto in Quad nelle Montagne dell'Eco",
        titleRu: "Шарм-эль-Шейх: Сафари на закате на квадроциклах в Горах Эхо",
        fromPrice: 12.42,
        adultPrice: 24.84,
        duration: "3 ساعات",
        durationEn: "3 hours",
        durationIt: "3 ore",
        durationRu: "3 часа",
        rating: 4.5,
        badge: "الأكثر مبيعاً",
        vehicle: "ATV Quad",
        img: "assets/images/hero-atv-sunset.jpg",
        descAr: "استمتع بساعة الغروب الذهبية وسط جبال الصدى الشهيرة في شرم الشيخ مع توقف لالتقاط الصور والشاي البدوي.",
        descEn: "Experience the golden hour across Sharm El Sheikh's iconic Echo Mountains with panoramic photo stops and Bedouin hospitality.",
        descIt: "Vivi l'ora d'oro del tramonto tra le famose Montagne dell'Eco a Sharm El Sheikh con soste fotografiche e tè beduino.",
        descRu: "Насладитесь золотым закатом среди знаменитых Гор Эхо в Шарм-эль-Шейхе с фото-остановками и бедуинским чаем."
    },
    {
        id: "sharm-canyon-bluehole",
        category: "canyon",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "From Sharm: Full-Day Adventure – Colored Canyon, Blue Hole & Dahab",
        titleAr: "من شرم الشيخ: يوم كامل إلى الوادي الملون، البلو هول، ودهب",
        titleIt: "Da Sharm: Giornata Intera – Canyon Colorato, Blue Hole e Dahab",
        titleRu: "Из Шарма: Весь день – Цветной каньон, Голубая дыра и Дахаб",
        fromPrice: 20.60,
        adultPrice: 29.43,
        duration: "10 ساعات",
        durationEn: "10 hours",
        durationIt: "10 ore",
        durationRu: "10 часов",
        rating: 4.3,
        badge: "يوم كامل",
        vehicle: "4x4 Jeep + Snorkeling",
        img: "assets/images/safari-canyon-dahab.jpg",
        descAr: "مغامرة تجمع بين صخور الوادي الملون الساحرة، السنوركلينج في البلو هول، وجولة تسوق في مدينة دهب.",
        descEn: "Full-day 4x4 Jeep adventure combining hiking through the Colored Canyon, snorkeling at Dahab's Blue Hole, seaside lunch, and bazaar tour.",
        descIt: "Avventura 4x4 di un giorno intero tra le rocce del Canyon Colorato, snorkeling al Blue Hole di Dahab, pranzo sul mare e shopping.",
        descRu: "Джип-сафари 4x4 на весь день: прогулка по Цветному каньону, снорклинг в Голубой дыре, обед у моря и прогулка по Дахабу."
    },
    {
        id: "sharm-double-thrill",
        category: "atv",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "Sharm El Sheikh: Double Thrill – ATV Quad & Dune Buggy Desert Safari",
        titleAr: "شرم الشيخ: الإثارة المزدوجة – بيتش باجي ATV وباجي صحراوي",
        titleIt: "Sharm El Sheikh: Doppia Emozione – Safari in Quad ATV e Dune Buggy",
        titleRu: "Шарм-эль-Шейх: Двойной драйв – квадроцикл ATV и багги по дюнам",
        fromPrice: 23.81,
        adultPrice: 34.01,
        duration: "3 ساعات",
        durationEn: "3 hours",
        durationIt: "3 ore",
        durationRu: "3 часа",
        rating: 4.8,
        badge: "تقييم 4.8★",
        vehicle: "ATV + Dune Buggy",
        img: "assets/images/safari-nabq-buggy.jpg",
        descAr: "جرّب قيادة الدراجة الرباعية وعربة الباجي السريعة في مسارات صحراوية مفتوحة بأعلى معايير الأمان.",
        descEn: "Double the adrenaline by driving both an automatic ATV Quad and a high-performance Dune Buggy across open desert trails.",
        descIt: "Raddoppia l'adrenalina guidando sia un Quad ATV che un potente Dune Buggy su piste desertiche aperte in totale sicurezza.",
        descRu: "Удвойте адреналин: управляйте квадроциклом ATV и скоростным багги по открытым пустынным трассам Синая."
    },
    {
        id: "sharm-nabq-premium",
        category: "nabq",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "Sharm El Sheikh: Nabq Protected Area Premium Safari – Mangroves & Trails",
        titleAr: "شرم الشيخ: سفاري محمية نبق الطبيعية الفاخرة",
        titleIt: "Sharm El Sheikh: Safari Premium nella Riserva di Nabq – Mangrovie",
        titleRu: "Шарм-эль-Шейх: Премиум-сафари в заповеднике Набк – Мангры и дюны",
        fromPrice: 26.18,
        adultPrice: 52.36,
        duration: "3–4 ساعات",
        durationEn: "3–4 hours",
        durationIt: "3–4 ore",
        durationRu: "3–4 часа",
        rating: 4.3,
        badge: "محمية نبق",
        vehicle: "4x4 + Buggy + Moto",
        img: "assets/images/safari-nabq-buggy.jpg",
        descAr: "استكشف غابات المانجروف والتنوع البيئي الفريد في محمية نبق الطبيعية شاملة تذاكر الدخول والتصاريح.",
        descEn: "Explore coastal mangrove forests and untouched dunes inside Nabq Protected Area, including all entry permits and multi-vehicle trails.",
        descIt: "Esplora le foreste di mangrovie e la natura incontaminata della Riserva di Nabq, inclusi biglietti d'ingresso e permessi ufficiali.",
        descRu: "Исследуйте мангровые рощи и дикие дюны заповедника Набк, включая все входные билеты и разрешения."
    },
    {
        id: "sharm-nabq-secrets",
        category: "nabq",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "Sharm El Sheikh: Nabq Protected Area Premium Safari – Desert Secrets",
        titleAr: "شرم الشيخ: سفاري محمية نبق – أسرار الصحراء (Desert Secrets)",
        titleIt: "Sharm El Sheikh: Riserva di Nabq Safari VIP – Segreti del Deserto",
        titleRu: "Шарм-эль-Шейх: VIP-сафари в заповеднике Набк – Тайны пустыни",
        fromPrice: 27.71,
        adultPrice: 55.42,
        duration: "3–4 ساعات",
        durationEn: "3–4 hours",
        durationIt: "3–4 ore",
        durationRu: "3–4 часа",
        rating: 4.5,
        badge: "VIP نبق",
        vehicle: "Golf Off-road + Double Moto",
        img: "assets/images/safari-nabq-buggy.jpg",
        descAr: "جولة خاصة في محمية نبق تشمل تصاريح الدخول، عربات أوف رود، وقيادة الموتو سفاري لمدة 40 دقيقة.",
        descEn: "VIP expedition inside Nabq Reserve including official permits, custom off-road vehicles, and a 40-minute double moto safari ride.",
        descIt: "Tour esclusivo nella Riserva di Nabq con permessi inclusi, veicoli off-road e 40 minuti di guida Moto Safari.",
        descRu: "Эксклюзивный тур по заповеднику Набк с разрешениями, внедорожниками и 40-минутным заездом на мото-сафари."
    },
    {
        id: "sharm-nabq-seafood",
        category: "nabq",
        city: "Sharm El Sheikh",
        cityAr: "شرم الشيخ",
        titleEn: "Sharm El Sheikh: Nabq Protected Area Premium Safari & Seafood Dusk",
        titleAr: "شرم الشيخ: سفاري محمية نبق حتى الغسق مع عشاء مأكولات بحرية",
        titleIt: "Sharm El Sheikh: Safari Riserva di Nabq al Tramonto con Cena di Pesce",
        titleRu: "Шарм-эль-Шейх: Сафари в заповеднике Набк на закате и ужин из морепродуктов",
        fromPrice: 27.71,
        adultPrice: 55.42,
        duration: "3–4 ساعات",
        durationEn: "3–4 hours",
        durationIt: "3–4 ore",
        durationRu: "3–4 часа",
        rating: 4.8,
        badge: "غسق + سي فود",
        vehicle: "4x4 + Sunset + Seafood",
        img: "assets/images/safari-canyon-dahab.jpg",
        descAr: "تجربة استثنائية تجمع بين مغامرة الصحراء في محمية نبق وعشاء مأكولات بحرية طازجة على ساحل البحر الأحمر.",
        descEn: "Signature twilight expedition combining off-road desert trails in Nabq Reserve with a fresh Red Sea seafood dinner by the shore.",
        descIt: "Esperienza esclusiva che unisce l'avventura nel deserto della Riserva di Nabq a una cena di pesce fresco sulla costa del Mar Rosso.",
        descRu: "Уникальное сочетание пустынного сафари в заповеднике Набк на закате и свежего ужина из морепродуктов на берегу Красного моря."
    }
];
