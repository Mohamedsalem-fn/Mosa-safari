# دليل الرفع والتشغيل على استضافة Hostinger (`mosasafari.com` و `eria.mosasafari.com`)

يحتوي هذا الدليل على الخطوات الكاملة لرفع منصة **موسى سفاري** على استضافة Hostinger بأعلى معايير الأمان وتصدر محركات البحث (SEO).

---

## حزم الرفع الجاهزة (تم بناؤها عبر `npm run build:hostinger`)

بعد تشغيل الأمر:

```bash
npm run build:hostinger
```

سيتم إنشاء ملفين مضغوطين جاهزين للرفع مباشرة داخل مجلد `dist/hostinger/`:

1. **`dist/hostinger/mosasafari.com-public_html.zip`** ← حزمة الموقع العام للعملاء على الدومين الرئيسي `https://mosasafari.com` (خالية تماماً من أي ملفات أو مسارات إدارية).
2. **`dist/hostinger/eria.mosasafari.com-subdomain.zip`** ← حزمة لوحة التحكم المعزولة والمحصنة على الدومين الفرعي `https://eria.mosasafari.com`.

> [!IMPORTANT]
> تعمل الحزمتان عبر نواة PHP 8 مشتركة تتشارك تلقائياً خزنة بيانات خاصة معزولة خارج مجلد الويب الرئيسي (`/home/uXXXX/mosa_private_vault`)، بحيث تنعكس أي تعديلات في الأسعار أو الرحلات أو الأكواد أو الإعدادات فوراً من لوحة التحكم إلى الموقع، وتسجل الحجوزات مباشرة.

---

## الخطوة 1: إعداد الدومين الفرعي وشهادات SSL في Hostinger hPanel

1. افتح لوحة **Hostinger hPanel** ← **Websites** ← اختر موقع **mosasafari.com**.
2. من القائمة الجانبية ادخل إلى **Domains → Subdomains**:
   - أنشئ الدومين الفرعي: **`eria`** ليصبح النطاق الكامل: `eria.mosasafari.com`.
   - تأكد من أن شهادة **SSL (HTTPS)** مفعلة لكلا النطاقين: `mosasafari.com` و`eria.mosasafari.com` (تُفعّل تلقائياً خلال دقائق).
3. تأكد أن إصدار **PHP Version** من **Advanced → PHP Configuration** هو **PHP 8.1 أو 8.2 أو 8.3** مع تفعيل إضافة `curl`.

---

## الخطوة 2: رفع ملفات الموقع العام (`https://mosasafari.com`)

1. في hPanel افتح **Files → File Manager**.
2. ادخل إلى مجلد **`domains/mosasafari.com/public_html`** (تأكد أن المجلد نظيف تماماً قبل الاستخراج، باستثناء مجلد `eria` إن وجد).
3. ارفع الملف **`dist/hostinger/mosasafari.com-public_html.zip`** واستخرجه (**Extract**) مباشرة داخل `public_html`.
4. تأكد من ظهور الملفات المخفية مثل **`.htaccess`** داخل `public_html`.

---

## الخطوة 3: رفع ملفات لوحة التحكم المعزولة (`https://eria.mosasafari.com`)

1. في **File Manager** افتح مجلد الدومين الفرعي:
   - إما `domains/eria.mosasafari.com/public_html` أو `domains/mosasafari.com/public_html/eria` (حسب إعداد Hostinger عندك).
2. ارفع الملف **`dist/hostinger/eria.mosasafari.com-subdomain.zip`** واستخرجه (**Extract**) داخل جذر الدومين الفرعي مباشرة.
3. افتح الرابط **`https://eria.mosasafari.com`** وسجل الدخول بكلمة المرور المبدئية: **`Mosa@2026`**.
4. فور الدخول: انتقل إلى تبويب **إعدادات المنصة → تغيير كلمة مرور الإدارة وتدوير مفاتيح الأمان** وضع كلمة مرور قوية خاصة بك (يتم تشفيرها فوراً بـ `Bcrypt cost=12` وتدوير مفتاح الجلسة `ADMIN_JWT_SECRET` داخل الخزنة خارج `public_html`).

---

## الخطوة 4: تفعيل Google Search Console للتصدر السريع

1. افتح **Google Search Console** وأضف النطاق: **`https://mosasafari.com/`**.
2. من قسم **Sitemaps** أرسل الرابط:
   ```
   https://mosasafari.com/sitemap.xml
   ```
3. استخدم أداة **URL Inspection** لاختبار الروابط التالية وطلب الفهرسة:
   - `https://mosasafari.com/`
   - `https://mosasafari.com/?lang=ar`
   - `https://mosasafari.com/?lang=en`
   - `https://mosasafari.com/?lang=it`
   - `https://mosasafari.com/?lang=ru`
4. اختبر صحة المخططات والأسعار والتقييمات عبر **Google Rich Results Test** على `https://mosasafari.com/`.

---

## التحقق الأمني المطبّق تلقائياً

- عزل مادي ومنطقي كامل عبر نطاقين مستقلين، مع منع الوصول لمجلد `/eria` أو `/admin` من النطاق الرئيسي (`404 Not Found`).
- ترويسات حماية صارمة على `eria.mosasafari.com`: `Content-Security-Policy` (بدون inline scripts)، `Strict-Transport-Security`، `X-Frame-Options: DENY`، `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`، و`Referrer-Policy: no-referrer`.
- جلسات `__Host-mosa_admin_session` بخصائص `HttpOnly; Secure; SameSite=Strict` + حماية `X-CSRF-Token` + حظر التخمين 15 دقيقة بعد 5 محاولات + إبطال فوري للجلسة عند الخروج.
- ملفات البيانات والمفاتيح محمية داخل `mosa_private_vault/` خارج `public_html` بأذونات `0700`/`0600` وقفل ذري للملفات (`flock`).

---

## Credits / Author

- **Author:** Mohamed Salem — *Expert AI Engineer & Automation Architect*
- **Focus:** AI Engineering | Automation | Agentic Systems
- **Copyright:** © 2026 Mohamed Salem. All Rights Reserved.
