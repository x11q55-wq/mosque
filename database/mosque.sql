-- ====================================================
-- جمعية رفد المساجد للعناية بالمساجد — قاعدة البيانات الكاملة
-- الإصدار 1.0 | أبريل 2026
-- ====================================================
-- طريقة الاستخدام:
-- 1. أنشئ قاعدة البيانات في cPanel
-- 2. افتح phpMyAdmin
-- 3. اختر قاعدة البيانات
-- 4. انقر Import ثم اختر هذا الملف
-- ====================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+03:00";
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ====================================================
-- 1. جدول المستخدمين (لوحة التحكم)
-- ====================================================
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL COMMENT 'الاسم الكامل',
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','editor','viewer') NOT NULL DEFAULT 'viewer' COMMENT 'admin=كامل، editor=تحرير، viewer=قراءة فقط',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 2. جدول إعدادات الموقع
-- ====================================================
CREATE TABLE `site_settings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(191) NOT NULL COMMENT 'مفتاح الإعداد',
  `value` longtext DEFAULT NULL COMMENT 'قيمة الإعداد',
  `type` enum('text','color','image','json','boolean','number') NOT NULL DEFAULT 'text',
  `group` varchar(100) NOT NULL DEFAULT 'general' COMMENT 'التصنيف: general/hero/footer/colors',
  `label` varchar(191) DEFAULT NULL COMMENT 'الاسم المعروض في لوحة التحكم',
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 3. جدول الإنجازات (الهيدر المباشر)
-- ====================================================
CREATE TABLE `achievements` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `icon` varchar(10) NOT NULL DEFAULT '🕌',
  `label` varchar(191) NOT NULL COMMENT 'المسمى مثل: المساجد المخدومة',
  `value` varchar(50) NOT NULL COMMENT 'القيمة مثل: 1,240',
  `unit` varchar(50) NOT NULL COMMENT 'الوحدة مثل: مسجد',
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 4. جدول الأرقام الإحصائية (الشريط)
-- ====================================================
CREATE TABLE `stats` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` varchar(50) NOT NULL COMMENT 'مثل: 1,240',
  `label` varchar(191) NOT NULL COMMENT 'مثل: مسجد تمت خدمته',
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 5. جدول المشاريع
-- ====================================================
CREATE TABLE `projects` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `icon` varchar(10) NOT NULL DEFAULT '💡',
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `bg_color` varchar(20) NOT NULL DEFAULT '#e8f2ec',
  `progress_pct` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT 'نسبة الإنجاز 0-100',
  `goal_amount` decimal(15,2) DEFAULT NULL COMMENT 'المبلغ المستهدف',
  `current_amount` decimal(15,2) DEFAULT NULL COMMENT 'المبلغ الحالي',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 6. جدول الشركاء
-- ====================================================
CREATE TABLE `partners` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `icon` varchar(10) DEFAULT '⭐',
  `logo_path` varchar(500) DEFAULT NULL COMMENT 'مسار الصورة في storage',
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'رابط خارجي للشعار',
  `name_color` varchar(20) NOT NULL DEFAULT '#1a5c3a',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 7. جدول الأخبار
-- ====================================================
CREATE TABLE `news` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL COMMENT 'المحتوى الكامل للخبر',
  `category` varchar(100) NOT NULL DEFAULT 'خبر',
  `category_icon` varchar(10) DEFAULT '📰',
  `category_color` varchar(20) NOT NULL DEFAULT '#c9a227',
  `category_text_color` varchar(20) NOT NULL DEFAULT '#0f3d26',
  `bg_color` varchar(20) NOT NULL DEFAULT '#1a5c3a',
  `image_path` varchar(500) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `views_count` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 8. جدول الفعاليات
-- ====================================================
CREATE TABLE `events` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `event_day` varchar(5) NOT NULL COMMENT 'اليوم: 22',
  `event_month` varchar(20) NOT NULL COMMENT 'الشهر: أبر',
  `event_date` date DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `status` enum('upcoming','live','done') NOT NULL DEFAULT 'upcoming',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 9. جدول آراء المستفيدين
-- ====================================================
CREATE TABLE `testimonials` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `role` varchar(191) DEFAULT NULL COMMENT 'مثل: إمام مسجد · أبها',
  `quote` text NOT NULL,
  `initials` varchar(10) DEFAULT NULL COMMENT 'الأحرف الأولى',
  `avatar_color` varchar(20) NOT NULL DEFAULT '#1a5c3a',
  `avatar_text_color` varchar(20) NOT NULL DEFAULT '#ffffff',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 10. جدول القوائم والقوائم المنسدلة
-- ====================================================
CREATE TABLE `nav_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` varchar(191) NOT NULL,
  `url` varchar(500) DEFAULT '#',
  `has_dropdown` tinyint(1) NOT NULL DEFAULT 0,
  `is_donate_btn` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nav_dropdown_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nav_item_id` bigint UNSIGNED NOT NULL,
  `label` varchar(191) NOT NULL,
  `url` varchar(500) DEFAULT '#',
  `icon` varchar(10) DEFAULT '🔗',
  `content_type` enum('text','pdf','pdfgroup','image','page') NOT NULL DEFAULT 'text',
  `content` longtext DEFAULT NULL COMMENT 'النص أو الرابط حسب content_type',
  `page_key` varchar(100) DEFAULT NULL COMMENT 'docs/complaints/register',
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `nav_dropdown_items_nav_item_id_foreign` (`nav_item_id`),
  CONSTRAINT `nav_dropdown_items_nav_item_id_foreign`
    FOREIGN KEY (`nav_item_id`) REFERENCES `nav_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 11. جدول الاستطلاعات
-- ====================================================
CREATE TABLE `surveys` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(10) DEFAULT '📋',
  `icon_bg` varchar(20) DEFAULT '#e8f2ec',
  `category` varchar(100) DEFAULT 'عام',
  `status` enum('open','closed') NOT NULL DEFAULT 'open',
  `responses_count` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `survey_questions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` bigint UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('likert','radio','dropdown','text','checkbox') NOT NULL DEFAULT 'likert',
  `options` json DEFAULT NULL COMMENT 'الخيارات كـ JSON array',
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `survey_questions_survey_id_foreign` (`survey_id`),
  CONSTRAINT `survey_questions_survey_id_foreign`
    FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `survey_responses` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `survey_id` bigint UNSIGNED NOT NULL,
  `respondent_name` varchar(191) DEFAULT NULL,
  `respondent_phone` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `answers` json DEFAULT NULL COMMENT 'الإجابات كـ JSON',
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `survey_responses_survey_id_foreign` (`survey_id`),
  CONSTRAINT `survey_responses_survey_id_foreign`
    FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 12. جدول تقارير التحليل
-- ====================================================
CREATE TABLE `analysis_reports` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `related_survey_id` bigint UNSIGNED DEFAULT NULL,
  `analysis_text` longtext DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `analysis_reports_related_survey_id_foreign` (`related_survey_id`),
  CONSTRAINT `analysis_reports_related_survey_id_foreign`
    FOREIGN KEY (`related_survey_id`) REFERENCES `surveys` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `report_files` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` bigint UNSIGNED NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `report_files_report_id_foreign` (`report_id`),
  CONSTRAINT `report_files_report_id_foreign`
    FOREIGN KEY (`report_id`) REFERENCES `analysis_reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 13. جدول توصيات مجلس الإدارة
-- ====================================================
CREATE TABLE `board_decisions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` enum('recommendation','decision','action') NOT NULL DEFAULT 'recommendation',
  `title` varchar(500) NOT NULL,
  `body` longtext DEFAULT NULL,
  `responsible` varchar(191) DEFAULT NULL,
  `deadline` varchar(100) DEFAULT NULL,
  `decision_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','done') NOT NULL DEFAULT 'pending',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `decision_files` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `decision_id` bigint UNSIGNED NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `decision_files_decision_id_foreign` (`decision_id`),
  CONSTRAINT `decision_files_decision_id_foreign`
    FOREIGN KEY (`decision_id`) REFERENCES `board_decisions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 14. جدول الوثائق العامة (صفحة الحوكمة)
-- ====================================================
CREATE TABLE `documents` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `bg_color` varchar(20) NOT NULL DEFAULT '#e8f2ec',
  `icon` varchar(10) DEFAULT '📄',
  `views_count` int NOT NULL DEFAULT 0,
  `publish_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 15. جدول الشكاوى والمقترحات
-- ====================================================
CREATE TABLE `complaints` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` enum('complaint','suggestion') NOT NULL DEFAULT 'suggestion',
  `name` varchar(191) DEFAULT NULL,
  `contact` varchar(191) DEFAULT NULL COMMENT 'هاتف أو بريد',
  `complaint_type` varchar(100) DEFAULT NULL COMMENT 'نوع الشكوى',
  `message` text NOT NULL,
  `status` enum('new','in_progress','done') NOT NULL DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 16. جدول نماذج التسجيل (عضو/متطوع/متدرب)
-- ====================================================
CREATE TABLE `registration_forms` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `form_key` varchar(100) NOT NULL COMMENT 'member/volunteer/trainee',
  `label` varchar(191) NOT NULL,
  `icon` varchar(10) DEFAULT '📋',
  `description` text DEFAULT NULL,
  `fields` json DEFAULT NULL COMMENT 'حقول النموذج كـ JSON',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_forms_form_key_unique` (`form_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `registrations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `form_id` bigint UNSIGNED NOT NULL,
  `form_key` varchar(100) NOT NULL,
  `data` json NOT NULL COMMENT 'بيانات المتقدم كـ JSON',
  `attachment_path` varchar(500) DEFAULT NULL COMMENT 'مسار المرفق (سيرة/خطاب)',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `registrations_form_id_foreign` (`form_id`),
  CONSTRAINT `registrations_form_id_foreign`
    FOREIGN KEY (`form_id`) REFERENCES `registration_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 17. جدول التبرعات
-- ====================================================
CREATE TABLE `donations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `donor_name` varchar(191) DEFAULT NULL,
  `donor_phone` varchar(50) DEFAULT NULL,
  `donor_email` varchar(191) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(200) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `donated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `donations_project_id_foreign` (`project_id`),
  CONSTRAINT `donations_project_id_foreign`
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 18. جدول وسائل التواصل الاجتماعي (الفوتر)
-- ====================================================
CREATE TABLE `social_links` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `icon` varchar(10) NOT NULL DEFAULT '𝕏',
  `label` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 19. جدول روابط الفوتر السريعة
-- ====================================================
CREATE TABLE `footer_links` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` varchar(191) NOT NULL,
  `url` varchar(500) NOT NULL DEFAULT '#',
  `page_key` varchar(100) DEFAULT NULL COMMENT 'docs/complaints/register',
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- البيانات الافتراضية (Seed Data)
-- ====================================================

-- المستخدم الإداري الافتراضي
-- كلمة المرور: Admin@1234 (مشفرة بـ bcrypt)
INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
('مدير النظام', 'admin@mosqueksa.org', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, NOW(), NOW());

-- إعدادات الموقع الافتراضية
INSERT INTO `site_settings` (`key`, `value`, `type`, `group`, `label`, `updated_at`) VALUES
('org_name', 'جمعية رفد المساجد للعناية بالمساجد', 'text', 'general', 'اسم المنظمة', NOW()),
('org_name_en', 'KSA Mosque Care Foundation', 'text', 'general', 'الاسم الإنجليزي', NOW()),
('org_phone', '920001234', 'text', 'general', 'رقم الهاتف', NOW()),
('org_email', 'info@mosqueksa.org', 'text', 'general', 'البريد الإلكتروني', NOW()),
('org_address', 'الرياض، المملكة العربية السعودية', 'text', 'general', 'العنوان', NOW()),
('org_about', 'جمعية رفد المساجد للعناية بالمساجد جمعية خيرية غير ربحية مرخصة من وزارة الموارد البشرية، تُعنى بصيانة وتطوير المساجد في جميع مناطق المملكة العربية السعودية منذ عام 1440 هـ.', 'text', 'general', 'نص التعريف', NOW()),
('license_number', '447/ص', 'text', 'general', 'رقم الترخيص', NOW()),
('map_url', 'https://maps.google.com/?q=24.7136,46.6753', 'text', 'general', 'رابط الخريطة', NOW()),
('map_label', 'الرياض · حي العليا', 'text', 'general', 'وصف الموقع', NOW()),
('color_primary', '#0f3d26', 'color', 'colors', 'اللون الأساسي', NOW()),
('color_secondary', '#1a5c3a', 'color', 'colors', 'اللون الثانوي', NOW()),
('color_accent', '#c9a227', 'color', 'colors', 'لون التمييز', NOW()),
('color_bg', '#f5f1ea', 'color', 'colors', 'لون الخلفية', NOW()),
('hero_badge', '🌙 منذ 1440 هـ · رعاية · تطوير · استدامة', 'text', 'hero', 'نص الشارة', NOW()),
('hero_title_em', 'بيوت الله', 'text', 'hero', 'الكلمة المميّزة', NOW()),
('hero_title_rest', 'لتبقى شامخةً بالعبادة', 'text', 'hero', 'باقي العنوان', NOW()),
('hero_subtitle', 'جمعية متخصصة في صيانة وتطوير المساجد عبر المملكة العربية السعودية', 'text', 'hero', 'النص التعريفي', NOW()),
('hero_btn1', '🏗 استعرض مشاريعنا', 'text', 'hero', 'نص الزر الأول', NOW()),
('hero_btn2', '📋 شارك في الاستطلاع', 'text', 'hero', 'نص الزر الثاني', NOW()),
('nav_donate_btn', '💚 تبرّع الآن', 'text', 'general', 'نص زر التبرع', NOW()),
('scroll_speed', '30', 'number', 'general', 'سرعة تمرير الآراء (ثانية)', NOW()),
('partner_logo_height', '40', 'number', 'general', 'ارتفاع شعار الشريك (بكسل)', NOW());

-- الإنجازات الافتراضية
INSERT INTO `achievements` (`icon`, `label`, `value`, `unit`, `sort_order`, `created_at`, `updated_at`) VALUES
('🕌', 'المساجد المخدومة', '1,240', 'مسجد', 1, NOW(), NOW()),
('💧', 'مشاريع المياه', '586', 'مشروع', 2, NOW(), NOW()),
('❄️', 'محطات التبريد', '11', 'محطة', 3, NOW(), NOW()),
('👥', 'المستفيدون', '25,000', 'مستفيد', 4, NOW(), NOW()),
('🏗', 'المتطوعون', '340', 'متطوع', 5, NOW(), NOW()),
('📍', 'المناطق', '15', 'منطقة', 6, NOW(), NOW());

-- الأرقام الإحصائية
INSERT INTO `stats` (`value`, `label`, `sort_order`, `created_at`, `updated_at`) VALUES
('1,240', 'مسجد تمت خدمته', 1, NOW(), NOW()),
('18,500', 'متبرع كريم', 2, NOW(), NOW()),
('340', 'مشروع مكتمل', 3, NOW(), NOW()),
('15', 'منطقة مغطاة', 4, NOW(), NOW());

-- مشاريع نموذجية
INSERT INTO `projects` (`icon`, `name`, `description`, `bg_color`, `progress_pct`, `goal_amount`, `current_amount`, `sort_order`, `created_at`, `updated_at`) VALUES
('💡', 'تركيب الطاقة الشمسية', 'تزويد 120 مسجداً بالطاقة النظيفة في منطقة عسير والجنوب', '#e8f2ec', 82, 100000.00, 82000.00, 1, NOW(), NOW()),
('💧', 'صيانة دورات المياه', 'ترميم وتجديد مرافق الوضوء في 60 مسجداً بالمناطق الريفية', '#fef6e4', 55, 80000.00, 44000.00, 2, NOW(), NOW()),
('📚', 'مكتبات رقمية', 'توفير محتوى رقمي وأجهزة ذكية لمكتبات 30 مسجداً في المدن', '#e6f0fb', 24, 50000.00, 12000.00, 3, NOW(), NOW());

-- شركاء نموذجيون
INSERT INTO `partners` (`name`, `icon`, `name_color`, `sort_order`, `created_at`, `updated_at`) VALUES
('وزارة الشؤون الإسلامية', '🏛', '#1a5c3a', 1, NOW(), NOW()),
('صندوق تطوير المساجد', '🏠', '#c9a227', 2, NOW(), NOW()),
('أرامكو السعودية', '💼', '#378ADD', 3, NOW(), NOW()),
('الهلال الأحمر السعودي', '🏥', '#E24B4A', 4, NOW(), NOW()),
('بنك التنمية الاجتماعية', '🏦', '#533AB7', 5, NOW(), NOW());

-- أخبار نموذجية
INSERT INTO `news` (`title`, `excerpt`, `category`, `category_icon`, `category_color`, `category_text_color`, `bg_color`, `publish_date`, `sort_order`, `created_at`, `updated_at`) VALUES
('اكتمال مشروع الطاقة الشمسية في 30 مسجداً بعسير', 'أعلنت الجمعية اكتمال المرحلة الأولى من مشروع الطاقة الشمسية بتمويل 3 ملايين ريال', 'إنجاز', '🏆', '#c9a227', '#0f3d26', '#1a5c3a', '2026-04-15', 1, NOW(), NOW()),
('توقيع اتفاقية شراكة مع صندوق تطوير المساجد', 'اتفاقية تعاون استراتيجية تشمل صيانة 500 مسجد سنوياً بتمويل مشترك', 'شراكة', '🤝', '#1a5c3a', '#ffffff', '#c9a227', '2026-04-10', 2, NOW(), NOW()),
('إطلاق مبادرة مساجد خضراء للحفاظ على البيئة', 'تستهدف تحويل 200 مسجد إلى منشآت صديقة للبيئة خلال 3 سنوات', 'مبادرة', '💡', '#c9a227', '#0f3d26', '#378add', '2026-04-05', 3, NOW(), NOW());

-- فعاليات نموذجية
INSERT INTO `events` (`title`, `description`, `event_day`, `event_month`, `event_date`, `location`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
('ورشة عمل: معايير الصيانة الوقائية للمساجد', 'ورشة متخصصة للمهندسين والفنيين', '22', 'أبر', '2026-04-22', 'مركز الملك عبدالله · الرياض · 10:00 ص', 'live', 1, NOW(), NOW()),
('حفل تكريم المتطوعين والشركاء لعام 1446 هـ', 'تكريم أكثر من 200 متطوع ومتبرع', '30', 'أبر', '2026-04-30', 'فندق الفيصلية · الرياض · 7:00 م', 'upcoming', 2, NOW(), NOW()),
('جولة ميدانية في مشاريع المنطقة الشرقية', 'زيارة ميدانية لمتابعة تقدم المشاريع', '8', 'مايو', '2026-05-08', 'الدمام والأحساء · يوم كامل', 'upcoming', 3, NOW(), NOW());

-- آراء المستفيدين
INSERT INTO `testimonials` (`name`, `role`, `quote`, `initials`, `avatar_color`, `sort_order`, `created_at`, `updated_at`) VALUES
('أحمد الغامدي', 'إمام مسجد · أبها', 'لقد تحوّل مسجدنا تماماً بعد مشروع الصيانة — بارك الله فيهم.', 'أح', '#1a5c3a', 1, NOW(), NOW()),
('سعد الحارثي', 'متبرع دائم · الرياض', 'الشفافية والمتابعة الميدانية جعلتني أثق بهم تماماً.', 'سع', '#c9a227', 2, NOW(), NOW()),
('منصور العتيبي', 'عضو مجلس بلدي · جدة', 'رأيت التحول بأم عيني — مبادرة تستحق الدعم.', 'من', '#378ADD', 3, NOW(), NOW()),
('فاطمة الأحمدي', 'ولية أمر · مكة', 'خدمة احترافية وفريق متميز.', 'فا', '#c9a227', 4, NOW(), NOW());

-- القوائم الرئيسية
INSERT INTO `nav_items` (`label`, `url`, `has_dropdown`, `sort_order`, `created_at`, `updated_at`) VALUES
('الرئيسية', '#home', 0, 1, NOW(), NOW()),
('من نحن', '#about', 1, 2, NOW(), NOW()),
('المشاريع', '#projects', 1, 3, NOW(), NOW()),
('استطلاعات الرأي', '#surveys', 1, 4, NOW(), NOW()),
('الأخبار', '#news', 0, 5, NOW(), NOW()),
('الحوكمة', '#governance', 1, 6, NOW(), NOW()),
('تواصل معنا', '#footer', 0, 7, NOW(), NOW());

-- القوائم المنسدلة
INSERT INTO `nav_dropdown_items` (`nav_item_id`, `label`, `url`, `icon`, `content_type`, `sort_order`, `created_at`, `updated_at`) VALUES
(2, 'الرؤية والرسالة', '#vision', '◈', 'text', 1, NOW(), NOW()),
(2, 'مجلس الإدارة', '#board', '👥', 'text', 2, NOW(), NOW()),
(2, 'الهيكل التنظيمي', '#structure', '📋', 'pdf', 3, NOW(), NOW()),
(3, 'الطاقة الشمسية', '#solar', '💡', 'text', 1, NOW(), NOW()),
(3, 'دورات المياه', '#water', '💧', 'text', 2, NOW(), NOW()),
(3, 'تقارير المشاريع', '#reports', '📊', 'pdfgroup', 3, NOW(), NOW()),
(4, 'قائمة الاستطلاعات', '#survey-list', '📋', 'text', 1, NOW(), NOW()),
(4, 'نتائج الاستطلاعات', '#survey-results', '📊', 'text', 2, NOW(), NOW()),
(4, 'تقارير التحليل', '#survey-analysis', '🔬', 'pdfgroup', 3, NOW(), NOW()),
(4, 'توصيات المجلس', '#board-decisions', '🏛', 'pdf', 4, NOW(), NOW()),
(6, 'الوثائق والتقارير', '#docs', '📄', 'page', 1, NOW(), NOW()),
(6, 'الشكاوى والمقترحات', '#complaints', '💬', 'page', 2, NOW(), NOW()),
(6, 'نماذج التسجيل', '#register', '📋', 'page', 3, NOW(), NOW());

-- الاستطلاعات الافتراضية
INSERT INTO `surveys` (`title`, `description`, `icon`, `icon_bg`, `category`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
('تقييم جودة خدمات الصيانة Q1 2026', 'استطلاع دوري لقياس رضا مستفيدي خدمات الصيانة', '📋', '#e8f2ec', 'جودة الخدمة', 'open', 1, NOW(), NOW()),
('رضا المستفيدين عن مشروع الطاقة الشمسية', 'قياس مدى رضا المساجد المستفيدة من مشروع الطاقة', '⚡', '#fef6e4', 'رضا المستفيدين', 'open', 2, NOW(), NOW());

INSERT INTO `survey_questions` (`survey_id`, `question_text`, `question_type`, `options`, `is_required`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'ما مدى رضاك عن جودة العمل المنجز؟', 'likert', '["ضعيف","مقبول","جيد","جيد جداً","ممتاز"]', 1, 1, NOW(), NOW()),
(1, 'ما نوع الخدمة التي استفدت منها؟', 'dropdown', '["صيانة كهربائية","سباكة","دهانات","تبريد","أخرى"]', 1, 2, NOW(), NOW()),
(1, 'هل التزم الفريق بالمواعيد المحددة؟', 'radio', '["دائماً","غالباً","أحياناً","نادراً"]', 1, 3, NOW(), NOW()),
(1, 'ملاحظاتك واقتراحاتك', 'text', NULL, 0, 4, NOW(), NOW());

-- وثائق نموذجية
INSERT INTO `documents` (`title`, `description`, `bg_color`, `icon`, `publish_date`, `sort_order`, `created_at`, `updated_at`) VALUES
('التقرير السنوي 1445 هـ', 'التقرير السنوي الشامل للجمعية — الإنجازات والمشاريع والبيانات المالية', '#e8f2ec', '📄', '2026-03-15', 1, NOW(), NOW()),
('دليل معايير الصيانة', 'المعايير والمواصفات التقنية المعتمدة لصيانة المساجد', '#fef6e4', '📋', '2026-01-10', 2, NOW(), NOW()),
('سياسة جمع التبرعات', 'الإطار المرجعي لسياسات جمع واستثمار التبرعات', '#e6f0fb', '📑', '2025-11-05', 3, NOW(), NOW()),
('نتائج استطلاع الرضا 2025', 'تقرير تفصيلي بنتائج استطلاعات الرأي السنوية', '#f0e8fb', '📊', '2025-12-20', 4, NOW(), NOW());

-- نماذج التسجيل الافتراضية
INSERT INTO `registration_forms` (`form_key`, `label`, `icon`, `description`, `fields`, `sort_order`, `created_at`, `updated_at`) VALUES
('member', 'عضو جمعية عمومية', '👤', 'للانضمام كعضو عمومي والتصويت في الجمعية العمومية', '[
  {"label":"الاسم الكامل الثلاثي","type":"text","required":true},
  {"label":"رقم الهوية الوطنية","type":"text","required":true},
  {"label":"رقم الهاتف","type":"tel","required":true},
  {"label":"البريد الإلكتروني","type":"email","required":false},
  {"label":"المنطقة","type":"select","options":["الرياض","مكة المكرمة","المدينة المنورة","المنطقة الشرقية","عسير","منطقة أخرى"],"required":true},
  {"label":"تاريخ الميلاد","type":"date","required":false}
]', 1, NOW(), NOW()),
('volunteer', 'متطوع', '🙋', 'للتطوع بوقتك ومهاراتك في خدمة بيوت الله', '[
  {"label":"الاسم الكامل","type":"text","required":true},
  {"label":"العمر","type":"number","required":true},
  {"label":"رقم الهاتف","type":"tel","required":true},
  {"label":"البريد الإلكتروني","type":"email","required":false},
  {"label":"المهارات والخبرات","type":"select","options":["صيانة كهربائية","سباكة وتمديدات","دهانات وديكور","برمجة وتقنية","إدارة وتنظيم"],"required":true},
  {"label":"السيرة الذاتية","type":"file","required":false}
]', 2, NOW(), NOW()),
('trainee', 'متدرب', '🎓', 'لبرنامج التدريب الصيفي والتعاوني', '[
  {"label":"الاسم الكامل","type":"text","required":true},
  {"label":"رقم الهاتف","type":"tel","required":true},
  {"label":"الجامعة / المعهد","type":"text","required":true},
  {"label":"التخصص","type":"text","required":true},
  {"label":"فترة التدريب","type":"select","options":["شهر","شهران","3 أشهر","6 أشهر"],"required":true},
  {"label":"البريد الإلكتروني","type":"email","required":false},
  {"label":"خطاب الجامعة","type":"file","required":false}
]', 3, NOW(), NOW());

-- روابط التواصل الاجتماعي
INSERT INTO `social_links` (`icon`, `label`, `url`, `sort_order`, `created_at`, `updated_at`) VALUES
('𝕏', 'تويتر', 'https://twitter.com/mosqueksa', 1, NOW(), NOW()),
('📷', 'إنستغرام', 'https://instagram.com/mosqueksa', 2, NOW(), NOW()),
('▶', 'يوتيوب', 'https://youtube.com/mosqueksa', 3, NOW(), NOW()),
('💬', 'واتساب', 'https://wa.me/966500000000', 4, NOW(), NOW()),
('✉', 'البريد', 'mailto:info@mosqueksa.org', 5, NOW(), NOW());

-- روابط الفوتر السريعة
INSERT INTO `footer_links` (`label`, `url`, `page_key`, `sort_order`, `created_at`, `updated_at`) VALUES
('الرئيسية', '#home', NULL, 1, NOW(), NOW()),
('المشاريع', '#projects', NULL, 2, NOW(), NOW()),
('الاستطلاعات', '#surveys', NULL, 3, NOW(), NOW()),
('الأخبار', '#news', NULL, 4, NOW(), NOW()),
('الوثائق والتقارير', '#', 'docs', 5, NOW(), NOW()),
('الشكاوى والمقترحات', '#', 'complaints', 6, NOW(), NOW()),
('نماذج التسجيل', '#', 'register', 7, NOW(), NOW());

-- توصية نموذجية لمجلس الإدارة
INSERT INTO `board_decisions` (`type`, `title`, `body`, `responsible`, `deadline`, `decision_date`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
('recommendation', 'تعزيز الالتزام بالمواعيد', 'تطبيق نظام إشعارات تلقائية 24 ساعة قبل كل زيارة صيانة مع نظام تتبع الفرق الميدانية.', 'م. فهد العمري', 'مايو 2026', '2026-04-20', 'pending', 1, NOW(), NOW()),
('decision', 'توسيع مشروع الطاقة الشمسية لـ 50 مسجداً', 'رصد ميزانية 1.5 مليون ريال للمرحلة الثانية مع الأولوية للمساجد الريفية.', 'د. عبدالله السلمان', 'يونيو 2026', '2026-04-18', 'in_progress', 2, NOW(), NOW());

COMMIT;
