# الدليل الكامل للنشر والتشغيل الآمن على استضافة Hostinger (`mosasafari.com` و `eria.mosasafari.com`)

يوضح هذا الدليل الخطوات التفصيلية الكاملة لرفع منصة **موسى سفاري** على استضافة **Hostinger** مع فصل لوحة التحكم على دومين فرعي مستقل، وتطبيق أعلى معايير الأمان وتصدّر نتائج البحث (SEO) للسياحة في شرم الشيخ.

---

## المعمارية الهندسية على Hostinger

```text
/home/uXXXX/                                  <── حساب Hostinger الخاص بك
├── mosa_private_vault/                       <── خزنة البيانات والمفاتيح (خارج الويب تماماً - 0700)
│   ├── secrets.php                           <── كلمة مرور Bcrypt + ADMIN_JWT_SECRET + Green API + Resend
│   ├── kv_bookings.json                      <── قاعدة الحجوزات المشتركة (بقفل ذري flock)
│   ├── kv_trips.json                         <── برامج السفاري والأسعار المخصصة
│   ├── kv_promos.json                        <── أكواد الخصم الترويجية
│   ├── kv_settings.json                      <── إعدادات الموقع وسعر الصرف والتنبيهات
│   ├── kv_analytics.json                     <── تحليلات الزوار وقمع التحويل (آخر 60 يوماً)
│   └── kv_audit.json                         <── سجل الأمان الإداري (آخر 100 عملية)
│
└── domains/
    ├── mosasafari.com/public_html/           <── الدومين الرئيسي https://mosasafari.com (واجهة العملاء فقط)
    │   ├── index.php                         <── محرّك تصيير مسبق لوسوم SEO بـ 4 لغات + حماية من /admin
    │   ├── .htaccess                         <── HTTPS + حظر /eria و /admin بـ 404 + ضغط وكاش + .well-known
    │   ├── api/index.php                     <── واجهات العملاء فقط (/api/public/config, /api/track, /api/notify-booking)
    │   └── sitemap.xml / robots.txt / manifest.webmanifest / assets/
    │
    └── eria.mosasafari.com/public_html/      <── الدومين الفرعي المعزول https://eria.mosasafari.com
        ├── index.php                         <── بوابة الإدارة مع ترويسات CSP و HSTS و DENY و noindex
        ├── .htaccess                         <── قفل الدومين الفرعي + منع الفهرسة + ترويسات الأمان
        ├── robots.txt                        <── Disallow: / (منع الزواحف تماماً)
        └── api/index.php                     <── API الإدارة (Bcrypt + HttpOnly Cookie + CSRF + Rate Limit)
```

---

## أولاً: تجهيز حزم الرفع المضغوطة محلياً

شغّل الأمر التالي من جذر المشروع لبناء CSS، فحص جميع ملفات JavaScript وPHP، وتوليد الحزمتين المضغوطتين:

```bash
npm run build:hostinger
```

ينتج عن ذلك ملفان مضغوطان داخل المجلد `dist/hostinger/`:

| الملف | النطاق المستهدف | المسار على Hostinger |
| :--- | :--- | :--- |
| `dist/hostinger/mosasafari.com-public_html.zip` | `https://mosasafari.com` | `domains/mosasafari.com/public_html/` |
| `dist/hostinger/eria.mosasafari.com-subdomain.zip` | `https://eria.mosasafari.com` | جذر الدومين الفرعي (`domains/eria.mosasafari.com/public_html/` أو `public_html/eria/`) |

---

## ثانياً: إعداد النطاق والدومين الفرعي وPHP في Hostinger hPanel

1. سجّل الدخول إلى **Hostinger hPanel** ← **Websites** ← اختر **`mosasafari.com`**.
2. **إنشاء الدومين الفرعي للوحة التحكم:**
   - من القائمة الجانبية ادخل إلى **Domains → Subdomains**.
   - أنشئ نطاقاً فرعياً باسم: **`eria`** ليصبح: **`eria.mosasafari.com`**.
   - اترك مسار المجلد الافتراضي كما هو (أو خصّص مساراً مستقلاً)، وتأكد من ملاحظة المسار الظاهر أمامه في hPanel لاستخدامه عند الرفع.
3. **التحقق من إعدادات DNS (Domains → DNS / Nameservers):**
   - تأكد أن سجل `A` للدومين `@` (`mosasafari.com`) وسجل `A` أو `CNAME` للدومين الفرعي `eria` يشيران إلى IP استضافة Hostinger.
   - يُفضّل أن يشير سجل `www` بـ `CNAME` إلى `mosasafari.com` (حيث يقوم `.htaccess` بتحويل `www` تلقائياً إلى `https://mosasafari.com`).
4. **تفعيل شهادة SSL (HTTPS):**
   - ادخل إلى **Security → SSL**.
   - تأكد من تفعيل وتثبيت الشهادة لكلا النطاقين: **`mosasafari.com`** و **`eria.mosasafari.com`**.
   - قواعد `.htaccess` تُبقي المسار `/.well-known/` مفتوحاً حتى تتجدد شهادات Let's Encrypt تلقائياً بدون أي تعطل.
5. **إعداد إصدار PHP والامتدادات:**
   - من **Advanced → PHP Configuration** اختر **PHP 8.2** أو **PHP 8.3** (الحد الأدنى PHP 8.1).
   - من تبويب **PHP Extensions** تأكد من تفعيل الإضافات الأساسية (`curl`، `json`، `mbstring`، `openssl`).

---

## ثالثاً: رفع واستخراج الملفات عبر File Manager

### 1) رفع الواجهة الرئيسية (`https://mosasafari.com`)
1. من hPanel ادخل إلى **Files → File Manager** ثم انتقل إلى `domains/mosasafari.com/public_html/`.
2. احذف أي ملف ترحيبي افتراضي مثل `default.php` إن وجد (تجنّب حذف مجلد `eria` إذا كان بداخله).
3. اضغط **Upload** ← اختر الملف **`dist/hostinger/mosasafari.com-public_html.zip`**.
4. اضغط بزر الفأرة الأيمن على الملف المضغوط ← **Extract** داخل `.` (مباشرة في `public_html`).
5. تأكد من تفعيل إظهار الملفات المخفية من أيقونة الإعدادات في File Manager للتحقق من وجود **`.htaccess`** و**`api/.htaccess`** و**`api/.mosa_secrets.php`**.
6. احذف الملف المضغوط `.zip` بعد التأكد من الاستخراج لتوفير المساحة.

### 2) رفع لوحة التحكم المعزولة (`https://eria.mosasafari.com`)
1. انتقل في **File Manager** إلى جذر الدومين الفرعي (`domains/eria.mosasafari.com/public_html/` أو `public_html/eria/`).
2. ارفع الملف **`dist/hostinger/eria.mosasafari.com-subdomain.zip`** واضغط **Extract** مباشرة داخله.
3. تأكد من وجود `.htaccess` و`api/.htaccess` و`robots.txt` و`index.php` ثم احذف ملف `.zip`.

---

## رابعاً: التشغيل الأول وتدوير كلمة المرور ومفاتيح الأمان

1. افتح المتصفح على: **`https://mosasafari.com`** ثم **`https://eria.mosasafari.com`**.
   - عند أول زيارة، يقوم النظام تلقائياً بترحيل ملف المفاتيح إلى **`/home/uXXXX/mosa_private_vault/secrets.php`** بأذونات `0600` خارج مجلد الويب تماماً.
2. سجّل الدخول إلى `https://eria.mosasafari.com` بكلمة المرور المبدئية: **`Mosa@2026`**.
3. **إجراء أمني إلزامي فور الدخول الأول:**
   - انتقل من القائمة الجانبية إلى **إعدادات المنصة**.
   - انزل إلى بطاقة **تغيير كلمة مرور الإدارة وتدوير مفاتيح الأمان**.
   - أدخل كلمة المرور الحالية (`Mosa@2026`) وكلمة مرور قوية جديدة (حروف كبيرة وصغيرة وأرقام ورموز)، واضغط **تحديث كلمة المرور وتدوير المفاتيح**.
   - سيقوم الخادم بتشفيرها بـ **`Bcrypt (cost=12)`** وتجديد **`ADMIN_JWT_SECRET`** وإصدار جلسة جديدة فوراً.
4. من تبويب **ربط بريد جوجل (`Google Email / Gmail`)** الجديد في القائمة الجانبية، أدخل بريدك الشخصي على جوجل + كلمة مرور التطبيقات (**Google App Password** المكوّنة من 16 حرفاً) واضغط **حفظ وربط حساب جوجل ✓** ثم **إرسال تجربة الآن 📧** لتصدر جميع تأكيدات حجز العملاء من بريدك الشخصي مباشرة.
5. من تبويب **إعدادات المنصة**، اضغط على زر **اختبار واتساب المالك** للتأكد من وصول تنبيهات الواتساب بنجاح.

> [!TIP]
> يمكنك التحقق في File Manager من ظهور المجلد `mosa_private_vault/` داخل مجلد حسابك الرئيسي (أعلى من `domains/`) وبأذونات `0700`، مما يعني نجاح العزل التام لبياناتك ومفاتيحك عن أي مسار ويب عام.

---

## خامساً: خطوات تصدر جوجل بعد الإطلاق (`Google Search Console`)

1. افتح **[Google Search Console](https://search.google.com/search-console)** وأضف خاصية النطاق (`Domain Property`): **`mosasafari.com`**.
2. أرسل خريطة الموقع من قسم **Sitemaps**:
   ```text
   https://mosasafari.com/sitemap.xml
   ```
3. استخدم أداة **URL Inspection** واطلب الفهرسة (`Request Indexing`) للروابط الخمسة التالية:
   - `https://mosasafari.com/`
   - `https://mosasafari.com/?lang=ar`
   - `https://mosasafari.com/?lang=en`
   - `https://mosasafari.com/?lang=it`
   - `https://mosasafari.com/?lang=ru`
4. اختبر صحة المخططات الغنية (الأسعار `$10.13–$27.71` والتقييمات `4.3–4.9★` والأسئلة الشائعة `FAQPage`) عبر **[Google Rich Results Test](https://search.google.com/test/rich-results)** على رابط `https://mosasafari.com/`.
5. **لا تقم أبداً** بإضافة أو إرسال `eria.mosasafari.com` في Search Console (فهو محمي بـ `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` و`Disallow: /`).

---

## سادساً: الصلاحيات واستكشاف الأخطاء الشائعة

| العرض | السبب والحل |
| :--- | :--- |
| ظهور `404` عند زيارة `https://eria.mosasafari.com` مباشرة | تأكد أن الدومين الفرعي `eria` مربوط في hPanel وأن استخراج `.htaccess` و`index.php` تم في جذر مجلد الدومين الفرعي نفسه وليس داخل مجلد فرعي باسم `.zip`. |
| عدم تطبيق قواعد `.htaccess` | في File Manager، افتح الإعدادات وتأكد من نقل `.htaccess` إلى المستوى الأول، وأن `mod_rewrite` و`mod_headers` مفعّلان (مفعلان افتراضياً على خوادم LiteSpeed/Apache في Hostinger). |
| تعذر كتابة البيانات في الخزنة | تأكد من أذونات المجلد `/home/uXXXX/mosa_private_vault` (`0700`) وأن `PHP 8.1+` نشط. |
| عدم وصول بريد إلكتروني عبر Resend | تحقق من ربط سجلات SPF وDKIM لنطاق `mosasafari.com` داخل لوحة Resend؛ وفي حال عدم الربط يوفّر النظام مسار احتياطي تلقائي عبر `mail()` في Hostinger. |
| الحاجة لتحديث الملفات مستقبلاً | شغّل `npm run build:hostinger` محلياً وأعد رفع ملفات الواجهة/البرمجة **دون حذف** مجلد `mosa_private_vault/` فتحتفظ بجميع حجوزاتك وإعداداتك وكلمة مرورك الجديدة كما هي. |

---

## Credits / Author

- **Author:** Mohamed Salem — *Expert AI Engineer & Automation Architect*
- **Focus:** AI Engineering | Automation | Agentic Systems
- **Copyright:** © 2026 Mohamed Salem. All Rights Reserved.
