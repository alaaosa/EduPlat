# تقرير تدقيق جاهزية MVP

**تاريخ المراجعة:** 20 أكتوبر 2026  
**النطاق:** كود الخادم الموجود في هذا المستودع. لم يظهر في الملفات المفحوصة كود واجهة frontend؛ لذلك لا يمكن تأكيد تدفقات الواجهة الكاملة. الاستنتاجات هنا عن backend ومسارات API الفعلية. لم يتم تعديل كود التطبيق.

## 1. نظرة عامة

### التقنية والبنية

- **Backend:** TypeScript مع NestJS، REST API تحت `/api`، مع GraphQL وWebSocket لمزايا إضافية.
- **Database:** SQL Server عبر Sequelize للكيانات الأساسية، وMongoDB عبر Mongoose لبعض بيانات المجموعات والمحادثات. استخدام قاعدتين يزيد متطلبات التشغيل والتناسق.
- **Auth:** JWT Bearer token مع bcrypt، تفعيل حساب عبر OTP، وRoleGuard للأدوار.
- **Video:** Mux؛ رابط رفع مباشر وwebhook لتسجيل الفيديو بعد جاهزيته، مع signed playback tokens.
- **Payments:** Stripe Checkout وStripe Connect.
- **Other services:** Redis/BullMQ للـcache والـqueues، Meilisearch للبحث، Nodemailer عبر SMTP Gmail، Cloudinary لخدمات الصور.
- **Hosting:** لا يوجد في الملفات الظاهرة إعداد نشر إنتاجي كامل (مثل Dockerfile أو إعداد منصة hosting). يوجد `src/redis-ha/docker-compose.yml` لجزء Redis فقط. المشروع يحتوي backend فقط حسب الملفات المتاحة.

### هيكل المجلدات باختصار

`src/auth`, `src/user`, `src/admin`, `src/instructer`: حسابات وأدوار؛ `src/learning/course`, `src/lesson`, `src/enrollment`: محتوى الدورات والتسجيل؛ `src/mux`: الفيديو؛ `src/assessment`: الاختبارات؛ `src/payment`, `src/checkout`: الدفع؛ `src/community/group`: المجموعات؛ `src/db`, `src/redis`, `src/queue`, `src/notification`, `src/meilisearch`: البنية والتكاملات.

### التشغيل والإعدادات

من الجذر: `npm install` ثم `npm run start:dev` للتطوير، أو `npm run build` ثم `npm run start:prod` للإنتاج. README هو قالب Nest الافتراضي ولا يوثق إعداد قواعد البيانات أو الخدمات.

لم أجد ملف `.env` ضمن الملفات المعروضة. المتغيرات المقروءة مباشرة من الكود:

- SQL Server: `SQL_HOST`, `SQL_PORT`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB`.
- MongoDB: `MONGO_URI`.
- Auth/session: `JWT_SECRET`, `EMAIL` (يُستخدم أيضًا سرًا لـJWT في أجزاء من auth)، `SESSION_SECRET`.
- SMTP: `EMAIL`, `PASS`.
- Mux: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` على الأرجح لعميل Mux، و`MUX_SIGNING_KEY_ID`, `MUX_PRIVATE_KEY`, `MUX_WEBHOOK_SECRET`.
- Redis: `REDIS_HOST`, `REDIS_PORT`.
- Meilisearch: `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`.
- Stripe: `STRIPE_SECRET_KEY` وفق provider، `STRIPE_WEBHOOK_SECRET`, `STRIPE_CLIENT_ID`, `BASE_URL`.
- `PORT` اختياري ويكون الافتراضي 3000؛ و`NODE_ENV` يؤثر في cookie secure.

الأسماء مستنتجة من مراجع `process.env` في الكود؛ لا توجد وثيقة إعداد رسمية أو تحقق startup مركزي يثبت قائمة متطلبات كاملة. الخدمات الخارجية وقواعد البيانات يجب أن تكون متاحة قبل تشغيل التطبيق. `synchronize: true` مفعّل لـSequelize، وهذا ليس بديلًا عن خطة migrations واضحة للإنتاج.

## 2. التكاملات

| التكامل | مكان الاستخدام | الحالة | إعدادات/نواقص ظاهرة |
|---|---|---|---|
| SQL Server / Sequelize | `src/db/sequelize.module.ts` ومعظم models/repositories | موصول جزئيًا؛ إعداد الاتصال موجود لكن التشغيل يعتمد على env وقاعدة متاحة | متغيرات SQL أعلاه؛ schema synchronization تلقائي |
| MongoDB / Mongoose | `src/db/mongo/mongoose.module.ts`, مجموعات `src/community/group` | موصول جزئيًا | `MONGO_URI` إلزامي؛ لا يوجد fallback |
| JWT / bcrypt | `src/auth`, `src/common/security`, guards | جزئي/معطوب محتمل: التسجيل يوقع activation token بـ`EMAIL`، وlogin يوقع token بـ`EMAIL`، لكن `AuthGuard` يتحقق بـ`JWT_SECRET`؛ قد يفشل كل تسجيل دخول محمي إذا اختلفت القيمتان. بوابة الاختبار تستخدم `JWT_SECRET` | يلزم secret موحد وموجود، وضبطه دون fallback غير آمن |
| Email SMTP | `src/common/providers/email.provider.ts`, `src/notification/channels/email` | موصول جزئيًا؛ إعداد Gmail وNodemailer موجود، لكن يتطلب بيانات صحيحة وقبول SMTP | `EMAIL`, `PASS`; إرسال OTP عبر event/queue ويعتمد على worker وRedis |
| Mux | `src/mux`, `src/lesson` | رفع ومعالجة webhook وتشغيل signed URL موصولة جزئيًا. endpoint إعداد signed token موجود؛ endpoint playback الحالي لا يظهر أنه يتحقق enrollment بنفسه | بيانات Mux المذكورة أعلاه؛ webhook عام مع توقيع، لكن أصول Mux CRUD مكشوفة كما هو موضح أدناه |
| Stripe | `src/payment`, `src/common/utils/stripe.ts` | Checkout/webhook/Connect موجودة جزئيًا. نجاح webhook يتحول إلى event للتسجيل بحسب service؛ redirect URLs ثابتة وغير مناسبة (`facebook.com`, `google.com`) | Stripe secret وwebhook secret وConnect client ID و`BASE_URL`; لا يظهر تحقق حماية `state` في OAuth callback |
| Redis + BullMQ | `src/redis`, `src/queue`, workers | موصول جزئيًا؛ caching/queues مستخدمة لمسارات متعددة، دون readiness/تعامل موحد مع غياب Redis | `REDIS_HOST`, `REDIS_PORT`; ملف Docker الموجود فقط Redis HA |
| Meilisearch | `src/meilisearch/meilisearch.service.ts` | موصول جزئيًا؛ بدء التطبيق ينشئ/يضبط index الدورات، ويستخدم للبحث والمزامنة | `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`; توقف الخدمة قد يؤثر على بدء التطبيق |
| Cloudinary | `src/interceptor/service/cloudinary.service.ts`, `src/common/config/cloudinary.ts` | غير مؤكد/جزئي؛ تكامل صور موجود لكن لا يمكن إثبات دورة رفع كاملة ضمن تدفق الدورة | بيانات Cloudinary المطلوبة حسب config؛ لم توثق في README |
| Google Auth | dependency `google-auth-library` | لا دليل على استعمال فعلي في المسارات المفحوصة؛ اعتبره غير موصول | لا دليل على إعداد مستخدم |

لم أجد تكاملًا فعليًا مع Vimeo أو YouTube أو S3 أو Cloudflare Stream. ملفات الاختبارات قليلة جدًا (ملف e2e قالب فقط)، ولا تكفي لإثبات قبول end-to-end.

## 3. تدفقات MVP

الحالات تصف الكود الموجود، لا تجربة UI؛ لا توجد واجهة في هذا المستودع لتتبعها.

| التدفق | الحالة | المسار الفعلي والملاحظات |
|---|---|---|
| 1. Auth والأدوار والحماية | **جزئي** | `src/auth/auth.controller.ts` يوفّر register/login/activate، و`AuthService` ينشئ الطالب الافتراضي ويرسل OTP. `Auth` decorator يربط `AuthGuard` و`RoleGuard`. اختلاف سر التوقيع والتحقق (`EMAIL` مقابل `JWT_SECRET`) قد يمنع حماية endpoints من قبول token. لا يوجد تسجيل ذاتي instructor/admin؛ ترقية instructor مرتبطة بطلب/اعتماد منفصل. |
| 2. إنشاء/تعديل/حذف/نشر الدورة | **جزئي** | `src/learning/course/presentation/controller/course.controller.ts` فيه draft، السعر، إرسال للمراجعة، status admin، والحذف. لا أرى endpoint لتعديل بيانات الدورة الأساسية. في `CourseService.updateCourseStatus` يتم استدعاء `changeStatusToRejected()` ثم `updateStatusToPublish()` دائمًا؛ مسار الرفض قد ينتهي بنشر الدورة. يلزم تحقق ownership في send-for-review/status، والحذف يمرر instructor ID إلى repository. |
| 3. الأقسام والدروس | **جزئي** | `section.controller.ts` ينشئ sections، و`lesson.controller.ts` ينشئ درسًا ويحدد order تلقائيًا. لا يظهر مسار تحرير/حذف/إعادة ترتيب lesson. إنشاء الدرس يزيد عداد الدورة؛ لا يوجد decrement ظاهر لأن الحذف غير موجود. إنشاء الدرس لا يتحقق بوضوح أن `sectionId` تابع لـ`courseId` وأن المستخدم مالك الدورة. |
| 4. رفع الفيديو وتشغيله والوصول | **جزئي** | `lesson/:lessonId/upload-url` محمي بدور instructor، و`MuxService.createUploadUrl` يتحقق من ملكية الدورة. Mux webhook يسجل playbackId والمدة عند `video.asset.ready`. لا توجد حدود حجم/نوع ظاهرة على الرفع المباشر أو validation upload واضحة؛ Mux هو التخزين والمعالجة. `UserEnrolled` يحمي endpoint lesson داخل course، لكن `VideoHandler.getLessonVideoPlayBackUrl` يأخذ lessonId ويولّد signed URL دون التحقق من enrollment، و`MuxController` يعرض get/delete asset دون Auth. endpoint الفيديو القديم معطل بالتعليق. |
| 5. عدد الدروس | **جزئي** | `LessonService.create` يستدعي `incrementLessonsCount` في transaction. لا يوجد حذف درس فعّال لتحديث العدد، ولا إعادة احتساب/تصحيح موثوق إذا فشل التناسق أو البيانات القديمة. |
| 6. مدة الدورة | **جزئي** | Mux `asset.duration` هو مصدر المدة في webhook. `CourseRepository.updateCourseDuration` يحدّث `total_duration` ويبدو أنه يضيف مدة كل فيديو جديدًا؛ حذف الفيديو/استبداله أو تكرار webhook قد يترك المجموع خاطئًا. استعلام course repository يحسب أحيانًا SUM من video durations، لذا هناك أكثر من مسار عرض/حفظ يحتاج تحقق. الدقة تعتمد على metadata من Mux. |
| 7. التسجيل/Enrollment | **جزئي** | enrollment controller وservices في `src/enrollment` و`src/learning/enrollment` فارغة تقريبًا. Enrollment فعلي يُنشأ عبر حدث `payment.course.successfully` بعد الدفع. لا أرى مسارًا مباشرًا للتسجيل المجاني أو اليدوي. Stripe checkout موجود لكن URLs الثابتة تعطل تجربة الدفع الواقعية؛ شرط الوصول يعتمد enrollment record وRedis cache. |
| 8. التقدم | **جزئي** | `VideoHandler` و`VideoRepository` يسجلان تقدم فيديو و`CourseProgressService` يحسب نسبة إنجاز الدورة من عناصر مطلوبة. لكن `src/learning/progress/ProgressController` وservice فارغان، فلا يوجد API ظاهر لتحديث التقدم من واجهة الفيديو. لا يمكن الجزم بأن تدفق الحفظ متاح للمستخدم من HTTP. |
| 9. الاختبارات/Quiz | **جزئي** | Quiz create يضيف MCQ/TF فقط ويشترط سؤالًا واحدًا على الأقل. لكن `QuizController.create` و`findById` غير محميين بـAuth/Role؛ يمكن لأي مستخدم إنشاء/قراءة إعداد quiz. `assessment2` يوفّر start/answer/submit محمية للطالب، مع مدة وانتهاء attempt. تعدد المحاولات غير مسموح بحسب فحص attempt الموجود. essay غير مدعوم في strategy الحالية. |
| 10. التصحيح | **جزئي** | `McqService.grade` يصحح MCQ/TF ويحسِب النسبة، والنتائج تحفظ في attempt عبر `AssessmentService`. لا يوجد essay/manual grading path واضح. توجد نسخة assessment ثانية ومسارات legacy، ما يصعب تحديد المسار الوحيد المعتمد. |
| 11. المجموعات | **جزئي** | `src/community/group` يوفّر CRUD للمجموعة والعضوية والمحادثة مع تحقق عضوية/إدارة. لا يظهر ربط المجموعات بالدورات أو الاختبارات أو تكليفها، ولا مسار واضح لعرض محتوى تعليمي بحسب المجموعة. هذه ليست مجموعات صفية مكتملة لـMVP. |
| 12. لوحات admin/instructor | **جزئي إلى مفقود** | توجد `StudentDashboardResolver` محمية بـAuthGuard. `src/instructer/instructer.controller.ts` ومسارات الدورات تعرض بيانات instructor جزئيًا. لا أجد لوحة admin متكاملة للطلاب والنتائج وإحصاءات الدورة. لا يوجد كود frontend في المستودع لإثبات العرض. |

## 4. المشاكل التي ظهرت

### أخطاء منطقية وعيوب تشغيل

- **رفض الدورة قد ينشرها بدل رفضها:** `src/learning/course/application/course.service.ts`، داخل `updateCourseStatus`؛ بعد شرط `reject` ينفذ `course.updateStatusToPublish()` بدون `else`.
- **أسرار JWT غير متسقة:** `src/auth/auth.service.ts` يوقّع login token باستخدام `process.env.EMAIL`؛ `src/common/guard/auth.guard.ts` يتحقق باستخدام `process.env.JWT_SECRET`.
- **تنشيط المستخدم قد يرمي خطأ بدل NotFound عند email غير موجود:** `AuthService.activateAccount` يستعمل `user!.id` قبل التحقق من `user`، ثم يفحص null لاحقًا.
- **Course preview يشترط وجود final exam:** `CourseService.getCoursePreview` يعيد NotFound إذا لم يوجد `finalExam` أو coursePreview؛ هذا قد يمنع فتح دورة لا تحتوي امتحانًا نهائيًا.
- **Stripe يعيد المستخدم إلى مواقع ثابتة:** `src/payment/infrastructure/stripe/stripe.payment.gateway.ts` يضع `success_url` على Facebook و`cancel_url` على Google، فلا تكتمل تجربة دفع المنتج داخل المنصة.
- **إدارة دورة غير مكتملة:** لا يوجد تعديل بيانات دورة أساسي ظاهر؛ حالة السعر وحفظه موجودان كعملية منفصلة.
- **عداد lessons والمدة لا يعالجان الحذف/الاستبدال:** لا تظهر عمليات حذف درس/فيديو متكاملة تحدث counters والمجموع.
- **مسارات التقدم العامة فارغة:** `src/learning/progress/progress.controller.ts` و`progress.service.ts` لا يحتويان API فعليًا.
- **إعداد README غير كافٍ:** README قالب Nest الافتراضي ولا يذكر متطلبات SQL/Mongo/Redis/Mux/Stripe/SMTP/Meilisearch.

### أساسيات الأمان

- `src/mux/mux.controller.ts`: `GET mux/assets/:assetId` و`DELETE mux/assets/:assetId` غير محميين بـAuth أو permission check. delete endpoint يمكّن حذف أصل فيديو إذا عُرف asset ID.
- `src/payment/presentation/payment.controller.ts`: Stripe OAuth callback غير محمي ولا يظهر تحقق من state مقابل جلسة/مستخدم؛ احتمال ربط حساب instructor غير صحيح.
- `src/learning/course/application/course.service.ts`: إرسال دورة للمراجعة لا يتحقق في الخدمة من أن `course.instructerId` يطابق instructor المرسل، والـcontroller يسمح لأي instructor؛ يلزم التأكد من repository/query.
- `src/lesson/lesson.controller.ts`: إنشاء lesson يستقبل `courseId` و`sectionId` لكن service لا يتحقق من ملكية instructor أو تطابق section والدورة في المسار الظاهر.
- روابط الفيديو الموقعة جيدة من حيث انتهاء الصلاحية، لكن يجب أن يصدرها endpoint يتحقق من enrollment أو preview. `VideoHandler.getLessonVideoPlayBackUrl` نفسه لا يفعل ذلك؛ حماية المسار الأعلى ليست واضحة لكل الاستدعاءات.
- لم أجد secrets صريحة ثابتة ضمن المخرجات المقروءة؛ الأسرار تعتمد على env، لكن لا يوجد إعداد مركزي fail-fast يضمن عدم تشغيل الإنتاج بقيم ناقصة.

### TODO / أجزاء غير مكتملة

- `TODO.md` يذكر مهام غير منجزة مرتبطة بإنهاء attempts بعد 5 دقائق، اكتشاف فقدان الاتصال بالامتحان، وإشعار إتمام الاختبار بالبريد وداخل التطبيق.
- `TODO.md` يذكر أيضًا إضافة duration للـquiz، والتحقق من الضغط المزدوج على كود coupon.
- أجزاء كثيرة للميزات الإضافية (gamification, certificates, reviews, chat) موجودة، لكنها خارج الحد الأدنى ولا تثبت اكتمال رحلة MVP.
- هناك تعريفات/وحدات legacy أو متوازية (مثل `src/assessment` و`src/payment1` import في `app.module.ts` بجانب `src/payment`)؛ يلزم توضيح المعتمد، وبعض المسارات الفارغة أو القديمة قد تكون مضللة.

## 5. الخلاصة

### جدول الحالة

| Workflow | Status | Notes |
|---|---|---|
| Auth والأدوار | Partial | التسجيل/الدخول موجودان؛ mismatch في JWT secret يهدد كل المسارات المحمية |
| إدارة الدورات | Partial | Draft/review/publish/delete جزئي؛ تعديل الدورة غير ظاهر، bug في رفض الدورة |
| الأقسام والدروس | Partial | الإنشاء والترتيب الأولي موجودان؛ edit/delete/reorder غير مكتملة |
| الفيديو | Partial | Mux upload/webhook متوفران؛ access check ورفع/تشغيل الواجهة غير مؤكدين، Mux CRUD مكشوف |
| Lesson count | Partial | يزيد عند الإنشاء؛ لا حذف أو إعادة احتساب ظاهر |
| Course duration | Partial | مدة Mux تتخزن؛ التحديث التزايدي قد يخطئ عند تكرار/حذف/استبدال الفيديو |
| Enrollment | Partial | التسجيل بعد الدفع فقط؛ free/manual endpoints فارغة، payment redirects خاطئة |
| Progress | Partial | منطق calculation موجود؛ API الحفظ الظاهر فارغ |
| Quizzes/exams | Partial | MCQ/TF وtimer/attempt موجودة؛ إنشاء quiz غير محمي، لا essay |
| Auto-grading | Partial | MCQ/TF تصحيح آلي؛ manual grading للـessay غير موجود |
| Groups | Partial | مجموعات عضوية ومحادثة؛ لا ربط بالدورات/الاختبارات |
| Admin/instructor dashboards | Partial | بيانات ومسارات متفرقة؛ لا لوحة كاملة مثبتة أو frontend هنا |

### يجب إصلاحه قبل الإطلاق

1. توحيد JWT signing/verification وإضافة تحقق startup للـsecrets الأساسية؛ اختبار register → activate → login → protected route.
2. إغلاق endpoints المكشوفة: Mux assets، إنشاء/قراءة quiz، والتحقق من صلاحيات مالك الدورة في إنشاء الدروس وإرسال المراجعة.
3. إصلاح تدفق رفض/نشر الدورة والتحقق من ownership للحالات.
4. استبدال Stripe success/cancel URLs بمسارات المنصة والتحقق من OAuth `state`، والتحقق من دفع فعلي ثم إنشاء enrollment.
5. توفير enrollment مجاني/يدوي إن كان ضمن نموذج الإطلاق، وربط كل الوصول للمحتوى بفحص موثوق غير قابل للتلاعب عبر cache.
6. توصيل endpoint تحديث progress والتحقق من تحديثه وحساب النسبة عبر رحلة الطالب.
7. إكمال تعديل محتوى الدورة والدروس الضرورية، أو توثيق ما هو مدعوم في واجهة MVP؛ معالجة عدادات الدروس والمدة عند الحذف والتعديل.
8. تأمين نقطة إصدار playback URL والتأكد من قصرها على الطالب المسجل أو preview صريح.
9. إعداد `.env.example` وتعليمات التشغيل للخدمات المطلوبة، والتأكد من إعدادات الإنتاج وقواعد البيانات والـwebhooks.

### يمكن أن ينتظر لما بعد الإطلاق

- Groups/chat وربط التكليفات الجماعية، gamification، leaderboard، quests، badges، certificates، reviews/coupons، وتوسعة الإشعارات.
- essay/manual grading إذا كان MVP سيقتصر صراحة على MCQ وTrue/False.
- تحسينات البحث المتقدم والتحليلات غير الأساسية.

### التقدير

**نحو 40% من جاهزية MVP** بحسب الكود المتاح. توجد لبنات backend فعلية للتسجيل والدورات والفيديو والدفع والاختبارات، لكن بعض المسارات المحورية متعارضة أو غير مكتملة: سر JWT، صلاحيات APIs، enrolment المجاني/اليدوي، progress API، إعدادات Stripe، وتكامل UI غير موجود في هذا المستودع. لا أعتبره جاهزًا للإطلاق قبل إغلاق البنود الحرجة أعلاه والتحقق يدويًا من تدفقات end-to-end على بيئة إعدادها مكتمل.
