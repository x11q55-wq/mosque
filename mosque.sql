-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- مضيف: localhost:3306
-- وقت الجيل: 15 مايو 2026 الساعة 19:47
-- إصدار الخادم: 10.6.24-MariaDB-cll-lve
-- نسخة PHP: 8.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- قاعدة بيانات: `mosque`
--

-- --------------------------------------------------------

--
-- بنية الجدول `achievements`
--

CREATE TABLE `achievements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `icon` varchar(10) NOT NULL DEFAULT '?',
  `label` varchar(191) NOT NULL COMMENT 'المسمى مثل: المساجد المخدومة',
  `value` varchar(50) NOT NULL COMMENT 'القيمة مثل: 1,240',
  `unit` varchar(50) NOT NULL COMMENT 'الوحدة مثل: مسجد',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `achievements`
--

INSERT INTO `achievements` (`id`, `icon`, `label`, `value`, `unit`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '🕌', 'المساجد المخدومة', '1,240', 'مسجد', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, '💧', 'مشاريع المياه', '586', 'مشروع', 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, '❄️', 'محطات التبريد', '11', 'محطة', 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, '👥', 'المستفيدون', '25,000', 'مستفيد', 4, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(5, '🏗', 'المتطوعون', '340', 'متطوع', 5, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(6, '📍', 'المناطق', '15', 'منطقة', 6, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `analysis_reports`
--

CREATE TABLE `analysis_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `related_survey_id` bigint(20) UNSIGNED DEFAULT NULL,
  `analysis_text` longtext DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `board_decisions`
--

CREATE TABLE `board_decisions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('recommendation','decision','action') NOT NULL DEFAULT 'recommendation',
  `title` varchar(500) NOT NULL,
  `body` longtext DEFAULT NULL,
  `responsible` varchar(191) DEFAULT NULL,
  `deadline` varchar(100) DEFAULT NULL,
  `decision_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','done') NOT NULL DEFAULT 'pending',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `board_decisions`
--

INSERT INTO `board_decisions` (`id`, `type`, `title`, `body`, `responsible`, `deadline`, `decision_date`, `status`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'recommendation', 'تعزيز الالتزام بالمواعيد', 'تطبيق نظام إشعارات تلقائية 24 ساعة قبل كل زيارة صيانة مع نظام تتبع الفرق الميدانية.', 'م. فهد العمري', 'مايو 2026', '2026-04-20', 'pending', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'decision', 'توسيع مشروع الطاقة الشمسية لـ 50 مسجداً', 'رصد ميزانية 1.5 مليون ريال للمرحلة الثانية مع الأولوية للمساجد الريفية.', 'د. عبدالله السلمان', 'يونيو 2026', '2026-04-18', 'in_progress', 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('complaint','suggestion') NOT NULL DEFAULT 'suggestion',
  `name` varchar(191) DEFAULT NULL,
  `contact` varchar(191) DEFAULT NULL COMMENT 'هاتف أو بريد',
  `complaint_type` varchar(100) DEFAULT NULL COMMENT 'نوع الشكوى',
  `message` text NOT NULL,
  `status` enum('new','in_progress','done') NOT NULL DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `decision_files`
--

CREATE TABLE `decision_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `decision_id` bigint(20) UNSIGNED NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `bg_color` varchar(20) NOT NULL DEFAULT '#e8f2ec',
  `icon` varchar(10) DEFAULT '?',
  `views_count` int(11) NOT NULL DEFAULT 0,
  `publish_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `documents`
--

INSERT INTO `documents` (`id`, `title`, `description`, `file_path`, `file_size`, `bg_color`, `icon`, `views_count`, `publish_date`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'التقرير السنوي 1445 هـ', 'التقرير السنوي الشامل للجمعية — الإنجازات والمشاريع والبيانات المالية', NULL, NULL, '#e8f2ec', '📄', 0, '2026-03-15', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'دليل معايير الصيانة', 'المعايير والمواصفات التقنية المعتمدة لصيانة المساجد', NULL, NULL, '#fef6e4', '📋', 0, '2026-01-10', 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'سياسة جمع التبرعات', 'الإطار المرجعي لسياسات جمع واستثمار التبرعات', NULL, NULL, '#e6f0fb', '📑', 0, '2025-11-05', 1, 3, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, 'نتائج استطلاع الرضا 2025', 'تقرير تفصيلي بنتائج استطلاعات الرأي السنوية', NULL, NULL, '#f0e8fb', '📊', 0, '2025-12-20', 1, 4, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `donations`
--

CREATE TABLE `donations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `donor_name` varchar(191) DEFAULT NULL,
  `donor_phone` varchar(50) DEFAULT NULL,
  `donor_email` varchar(191) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `project_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(200) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `donated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `event_day` varchar(5) NOT NULL COMMENT 'اليوم: 22',
  `event_month` varchar(20) NOT NULL COMMENT 'الشهر: أبر',
  `event_date` date DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `status` enum('upcoming','live','done') NOT NULL DEFAULT 'upcoming',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `event_day`, `event_month`, `event_date`, `location`, `status`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'ورشة عمل: معايير الصيانة الوقائية للمساجد', 'ورشة متخصصة للمهندسين والفنيين', '22', 'أبر', '2026-04-22', 'مركز الملك عبدالله · الرياض · 10:00 ص', 'live', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'حفل تكريم المتطوعين والشركاء لعام 1446 هـ', 'تكريم أكثر من 200 متطوع ومتبرع', '30', 'أبر', '2026-04-30', 'فندق الفيصلية · الرياض · 7:00 م', 'upcoming', 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'جولة ميدانية في مشاريع المنطقة الشرقية', 'زيارة ميدانية لمتابعة تقدم المشاريع', '8', 'مايو', '2026-05-08', 'الدمام والأحساء · يوم كامل', 'upcoming', 1, 3, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `footer_links`
--

CREATE TABLE `footer_links` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(191) NOT NULL,
  `url` varchar(500) NOT NULL DEFAULT '#',
  `page_key` varchar(100) DEFAULT NULL COMMENT 'docs/complaints/register',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `footer_links`
--

INSERT INTO `footer_links` (`id`, `label`, `url`, `page_key`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'الرئيسية', '#home', NULL, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'المشاريع', '#projects', NULL, 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'الاستطلاعات', '#surveys', NULL, 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, 'الأخبار', '#news', NULL, 4, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(5, 'الوثائق والتقارير', '#', 'docs', 5, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(6, 'الشكاوى والمقترحات', '#', 'complaints', 6, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(7, 'نماذج التسجيل', '#', 'register', 7, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `form_entries`
--

CREATE TABLE `form_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `form_key` varchar(191) NOT NULL,
  `form_label` varchar(500) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`entry_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `form_entries`
--

INSERT INTO `form_entries` (`id`, `form_key`, `form_label`, `data`, `ip_address`, `submitted_at`, `entry_data`) VALUES
(1, 'عضو جمعية عمومية', 'عضو جمعية عمومية', '{\"الاسم الكامل الثلاثي\":\"جوال٢\",\"رقم الهوية الوطنية\":\"٥٥٥\",\"رقم الهاتف\":\"855\",\"البريد الإلكتروني\":\"ddd@fff\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"\"}', '2a02:cb80:428e:c54:cc4c:dd23:9791:420', '2026-04-24 14:49:06', '{\"الاسم الكامل الثلاثي\":\"جوال٢\",\"رقم الهوية الوطنية\":\"٥٥٥\",\"رقم الهاتف\":\"855\",\"البريد الإلكتروني\":\"ddd@fff\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"\"}'),
(2, 'عضو جمعية عمومية', 'عضو جمعية عمومية', '{\"الاسم الكامل الثلاثي\":\"ئسيبشس\",\"رقم الهوية الوطنية\":\"بليبل\",\"رقم الهاتف\":\"شبيللبل\",\"البريد الإلكتروني\":\"1111ww@dsrg\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"\"}', '2a02:cb80:428e:c54:841e:8fc0:e08d:b461', '2026-04-24 14:50:41', '{\"الاسم الكامل الثلاثي\":\"ئسيبشس\",\"رقم الهوية الوطنية\":\"بليبل\",\"رقم الهاتف\":\"شبيللبل\",\"البريد الإلكتروني\":\"1111ww@dsrg\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"\"}'),
(3, 'عضو جمعية عمومية', 'عضو جمعية عمومية', '{\"الاسم الكامل الثلاثي\":\"ااا\",\"رقم الهوية الوطنية\":\"صصص\",\"رقم الهاتف\":\"صص\",\"البريد الإلكتروني\":\"1@xn--mhbaa\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"\"}', '2a02:cb80:428e:c54:5c5a:b6a:8e41:e2a8', '2026-04-25 02:47:10', '{\"الاسم الكامل الثلاثي\":\"ااا\",\"رقم الهوية الوطنية\":\"صصص\",\"رقم الهاتف\":\"صص\",\"البريد الإلكتروني\":\"1@xn--mhbaa\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"\"}'),
(4, 'عضو جمعية عمومية', 'عضو جمعية عمومية', '{\"الاسم الكامل الثلاثي\":\"مهميد\",\"رقم الهوية الوطنية\":\"8888\",\"رقم الهاتف\":\"055555\",\"البريد الإلكتروني\":\"dre@ggg\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"2026-05-21\"}', '2001:16a4:42:a:2:2:fb79:1681', '2026-05-09 17:21:30', '{\"الاسم الكامل الثلاثي\":\"مهميد\",\"رقم الهوية الوطنية\":\"8888\",\"رقم الهاتف\":\"055555\",\"البريد الإلكتروني\":\"dre@ggg\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"2026-05-21\"}'),
(5, 'طلب ترميم جامع', 'طلب ترميم جامع', '{\"موقع المسجد\":\"غرب\",\"اسم الإمام\":\"محمد\",\"حقل جديد\":\"برسب\"}', '2a02:cb80:4202:c7cf:4cb7:a32:3fdb:1915', '2026-05-10 01:19:44', '{\"موقع المسجد\":\"غرب\",\"اسم الإمام\":\"محمد\",\"حقل جديد\":\"برسب\"}'),
(6, 'طلب كهرباء', 'طلب كهرباء', '{\"اسم المسجد\":\"تجربة\",\"الاتجاه\":\"غرب\"}', '2a02:cb80:4202:c7cf:4cb7:a32:3fdb:1915', '2026-05-10 01:33:54', '{\"اسم المسجد\":\"تجربة\",\"الاتجاه\":\"غرب\"}'),
(7, 'عضو جمعية عمومية', 'عضو جمعية عمومية', '{\"الاسم الكامل الثلاثي\":\"أحمد\",\"رقم الهوية الوطنية\":\"888\",\"رقم الهاتف\":\"777\",\"البريد الإلكتروني\":\"jj@kk\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"2026-05-07\"}', '2a02:cb80:4202:c7cf:4cb7:a32:3fdb:1915', '2026-05-10 01:39:23', '{\"الاسم الكامل الثلاثي\":\"أحمد\",\"رقم الهوية الوطنية\":\"888\",\"رقم الهاتف\":\"777\",\"البريد الإلكتروني\":\"jj@kk\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"2026-05-07\"}'),
(8, 'طلب كهرباء', 'طلب كهرباء', '{\"اسم المسجد\":\"fgfg\",\"الاتجاه\":\"غرب\"}', '2a02:cb80:4202:c7cf:4cb7:a32:3fdb:1915', '2026-05-10 01:39:35', '{\"اسم المسجد\":\"fgfg\",\"الاتجاه\":\"غرب\"}'),
(9, 'طلب ترميم جامع', 'طلب ترميم جامع', '{\"موقع المسجد\":\"شرق\",\"اسم الإمام\":\"dfgdfgadfgd\",\"حقل جديد\":\"zsdfgafgdf\"}', '2a02:cb80:4202:c7cf:4cb7:a32:3fdb:1915', '2026-05-10 01:39:44', '{\"موقع المسجد\":\"شرق\",\"اسم الإمام\":\"dfgdfgadfgd\",\"حقل جديد\":\"zsdfgafgdf\"}'),
(11, 'طلب كهرباء', 'طلب كهرباء', '{\"اسم المسجد\":\"محمود\",\"الاتجاه\":\"شرق\"}', '2a02:cb80:4202:c7cf:4cb7:a32:3fdb:1915', '2026-05-10 02:07:41', '{\"اسم المسجد\":\"محمود\",\"الاتجاه\":\"شرق\"}'),
(12, 'عضو جمعية عمومية', 'عضو جمعية عمومية', '{\"الاسم الكامل الثلاثي\":\"محمد علي سالم\",\"رقم الهوية الوطنية\":\"87878878878\",\"رقم الهاتف\":\"6676767676\",\"البريد الإلكتروني\":\"hgkdkkk@kdfjkjskdfjk.com\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"2026-05-20\"}', '2a02:cb80:4202:c7cf:4cb7:a32:3fdb:1915', '2026-05-10 02:08:21', '{\"الاسم الكامل الثلاثي\":\"محمد علي سالم\",\"رقم الهوية الوطنية\":\"87878878878\",\"رقم الهاتف\":\"6676767676\",\"البريد الإلكتروني\":\"hgkdkkk@kdfjkjskdfjk.com\",\"المنطقة\":\"الرياض\",\"تاريخ الميلاد\":\"2026-05-20\"}'),
(13, 'طلب كهرباء', 'طلب كهرباء', '{\"اسم المسجد\":\"تتتتتتتتتت\",\"الاتجاه\":\"شرق\"}', '2a02:cb80:4202:c7cf:6dab:6fc3:c25b:5874', '2026-05-10 18:21:40', '{\"اسم المسجد\":\"تتتتتتتتتت\",\"الاتجاه\":\"شرق\"}'),
(14, 'survey_sv1778698976059', 'الرضا العامل', '{\"هل انت راضي\":\"راضي جدا\",\"تقييم العام للجمعية\":\"غير راضي تماما\"}', '2a02:cb80:4202:c7cf:d22:8b79:1750:7e42', '2026-05-13 19:25:06', '{\"هل انت راضي\":\"راضي جدا\",\"تقييم العام للجمعية\":\"غير راضي تماما\"}'),
(15, 'survey_sv1778700474104', 'عااام', '{\"اكتب وعبر\":\"عملكم ممتاز\"}', '2a02:cb80:4202:c7cf:d22:8b79:1750:7e42', '2026-05-13 19:28:47', '{\"اكتب وعبر\":\"عملكم ممتاز\"}'),
(16, 'survey_sv1778698976059', 'الرضا العامل', '{\"هل انت راضي\":\"راضي جدا\",\"تقييم العام للجمعية\":\"\",\"اكتب\":\"\"}', '2a02:cb80:428e:23a3:e499:770f:3fbe:1862', '2026-05-14 16:37:33', '{\"هل انت راضي\":\"راضي جدا\",\"تقييم العام للجمعية\":\"\",\"اكتب\":\"\"}'),
(17, 'survey_sv1778700474104', 'عااام', '{\"اكتب وعبر\":\"بيبليسبليسبليبليب\"}', '2a02:cb80:428e:23a3:e499:770f:3fbe:1862', '2026-05-14 16:37:41', '{\"اكتب وعبر\":\"بيبليسبليسبليبليب\"}'),
(18, 'survey_sv1778775657580', 'استطلاع جديد', '{\"تجربة 1\":\"\",\"سؤال جديد\":\"ممتاز\"}', '2a02:cb80:428e:23a3:e499:770f:3fbe:1862', '2026-05-14 16:37:48', '{\"تجربة 1\":\"\",\"سؤال جديد\":\"ممتاز\"}'),
(19, 'survey_sv1778776785340', '1', '{\"السؤال الأول\":\"لالىؤرلاىؤر\",\"سؤال جديد\":\"جيد\"}', '2a02:cb80:428e:23a3:e499:770f:3fbe:1862', '2026-05-14 16:42:25', '{\"السؤال الأول\":\"لالىؤرلاىؤر\",\"سؤال جديد\":\"جيد\"}'),
(20, 'survey_sv1778808726236', 'تجربة 55', '{\"رضاك عن خدماتنا\":\"جميل\",\"اختر نوع الخدمة التي ناسبتك\":\"\",\"ارفع مستند\":\"\"}', '2a02:cb80:428e:23a3:5cb6:e613:570f:548', '2026-05-15 01:34:36', '{\"رضاك عن خدماتنا\":\"جميل\",\"اختر نوع الخدمة التي ناسبتك\":\"\",\"ارفع مستند\":\"\"}'),
(21, 'survey_sv1778810705601', 'تجربة الفجر', '{\"مستوى الرضا\":\"ممتاز\",\"سؤال جديد\":\"\",\"ارفع ملاحظاتك\":\"\",\"اكتب\":\"ااااااااااا\"}', '2a02:cb80:428e:23a3:5cb6:e613:570f:548', '2026-05-15 02:08:13', '{\"مستوى الرضا\":\"ممتاز\",\"سؤال جديد\":\"\",\"ارفع ملاحظاتك\":\"\",\"اكتب\":\"ااااااااااا\"}'),
(22, 'survey_sv1778810705601', 'تجربة الفجر', '{\"مستوى الرضا\":\"ممتاز\",\"سؤال جديد\":\"\",\"ارفع ملاحظاتك\":\"[ملف: معلومات شهادة الترخيص.pdf]\",\"اكتب\":\"الأول\"}', '2a02:cb80:428e:23a3:5cb6:e613:570f:548', '2026-05-15 02:24:39', '{\"مستوى الرضا\":\"ممتاز\",\"سؤال جديد\":\"\",\"ارفع ملاحظاتك\":\"[ملف: معلومات شهادة الترخيص.pdf]\",\"اكتب\":\"الأول\"}'),
(23, 'survey_sv1778810705601', 'تجربة الفجر', '{\"مستوى الرضا\":\"جيد\",\"سؤال جديد\":\"\",\"ارفع ملاحظاتك\":\"[ملف: معلومات شهادة الترخيص.pdf]\",\"اكتب\":\"2\"}', '2a02:cb80:428e:23a3:5cb6:e613:570f:548', '2026-05-15 02:25:13', '{\"مستوى الرضا\":\"جيد\",\"سؤال جديد\":\"\",\"ارفع ملاحظاتك\":\"[ملف: معلومات شهادة الترخيص.pdf]\",\"اكتب\":\"2\"}'),
(24, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"كهرباء\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 13:31:43', '{\"نوع الخدمة\":\"كهرباء\",\"مستوى الخدمة\":\"ممتاز\"}'),
(25, 'survey_sv1778852029888', 'العصر 1', '{\"اكتب \":\"تجربة كتابة نص\",\"قم برفع المستند\":\"[ملف: شعار الوزارة.pdf]\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 13:35:33', '{\"اكتب \":\"تجربة كتابة نص\",\"قم برفع المستند\":\"[ملف: شعار الوزارة.pdf]\"}'),
(26, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"جيد\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:32:43', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"جيد\"}'),
(27, 'survey_sv1778852029888', 'العصر 1', '{\"اكتب \":\"اااااااااا\",\"قم برفع المستند\":\"\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:32:52', '{\"اكتب \":\"اااااااااا\",\"قم برفع المستند\":\"\"}'),
(28, 'survey_sv1778855438259', 'استطلاع جديد', '{\"السؤال الأول\":\"ضعيف\",\"سؤال جديد\":\"ضعيف\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:32:56', '{\"السؤال الأول\":\"ضعيف\",\"سؤال جديد\":\"ضعيف\"}'),
(29, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:33:19', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}'),
(30, 'survey_sv1778852029888', 'العصر 1', '{\"اكتب \":\"مممممممممم\",\"قم برفع المستند\":\"\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:33:23', '{\"اكتب \":\"مممممممممم\",\"قم برفع المستند\":\"\"}'),
(31, 'survey_sv1778855438259', 'استطلاع جديد', '{\"السؤال الأول\":\"ضعيف\",\"سؤال جديد\":\"ضعيف\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:33:28', '{\"السؤال الأول\":\"ضعيف\",\"سؤال جديد\":\"ضعيف\"}'),
(32, 'survey_test_1778856923831', 'اختبار تشخيصي', '{\"سؤال تجريبي\":\"إجابة تجريبية\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:55:24', '{\"سؤال تجريبي\":\"إجابة تجريبية\"}'),
(33, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:56:14', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}'),
(34, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:56:21', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}'),
(35, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 14:56:27', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}'),
(36, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 16:06:17', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}'),
(37, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 16:06:33', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}'),
(38, 'survey_sv1778855438259', 'استطلاع جديد', '{\"السؤال الأول\":\"ضعيف\",\"سؤال جديد\":\"ضعيف\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 16:07:13', '{\"السؤال الأول\":\"ضعيف\",\"سؤال جديد\":\"ضعيف\"}'),
(39, 'survey_sv1778851742210', 'العصر', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}', '2a02:cb80:428e:23a3:418b:8b1e:3331:8868', '2026-05-15 16:36:12', '{\"نوع الخدمة\":\"\",\"مستوى الخدمة\":\"ممتاز\"}');

-- --------------------------------------------------------

--
-- بنية الجدول `nav_dropdown_items`
--

CREATE TABLE `nav_dropdown_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nav_item_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(191) NOT NULL,
  `url` varchar(500) DEFAULT '#',
  `icon` varchar(10) DEFAULT '?',
  `content_type` enum('text','pdf','pdfgroup','image','page') NOT NULL DEFAULT 'text',
  `content` longtext DEFAULT NULL COMMENT 'النص أو الرابط حسب content_type',
  `page_key` varchar(100) DEFAULT NULL COMMENT 'docs/complaints/register',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `nav_dropdown_items`
--

INSERT INTO `nav_dropdown_items` (`id`, `nav_item_id`, `label`, `url`, `icon`, `content_type`, `content`, `page_key`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 'الرؤية والرسالة', '#vision', '◈', 'text', NULL, NULL, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 2, 'مجلس الإدارة', '#board', '👥', 'text', NULL, NULL, 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 2, 'الهيكل التنظيمي', '#structure', '📋', 'pdf', NULL, NULL, 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, 3, 'الطاقة الشمسية', '#solar', '💡', 'text', NULL, NULL, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(5, 3, 'دورات المياه', '#water', '💧', 'text', NULL, NULL, 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(6, 3, 'تقارير المشاريع', '#reports', '📊', 'pdfgroup', NULL, NULL, 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(7, 4, 'قائمة الاستطلاعات', '#survey-list', '📋', 'text', NULL, NULL, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(8, 4, 'نتائج الاستطلاعات', '#survey-results', '📊', 'text', NULL, NULL, 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(9, 4, 'تقارير التحليل', '#survey-analysis', '🔬', 'pdfgroup', NULL, NULL, 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(10, 4, 'توصيات المجلس', '#board-decisions', '🏛', 'pdf', NULL, NULL, 4, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(11, 6, 'الوثائق والتقارير', '#docs', '📄', 'page', NULL, NULL, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(12, 6, 'الشكاوى والمقترحات', '#complaints', '💬', 'page', NULL, NULL, 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(13, 6, 'نماذج التسجيل', '#register', '📋', 'page', NULL, NULL, 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `nav_items`
--

CREATE TABLE `nav_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(191) NOT NULL,
  `url` varchar(500) DEFAULT '#',
  `has_dropdown` tinyint(1) NOT NULL DEFAULT 0,
  `is_donate_btn` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `nav_items`
--

INSERT INTO `nav_items` (`id`, `label`, `url`, `has_dropdown`, `is_donate_btn`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'الرئيسية', '#home', 0, 0, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'من نحن', '#about', 1, 0, 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'المشاريع', '#projects', 1, 0, 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, 'استطلاعات الرأي', '#surveys', 1, 0, 4, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(5, 'الأخبار', '#news', 0, 0, 5, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(6, 'الحوكمة', '#governance', 1, 0, 6, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(7, 'تواصل معنا', '#footer', 0, 0, 7, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `news`
--

CREATE TABLE `news` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL COMMENT 'المحتوى الكامل للخبر',
  `category` varchar(100) NOT NULL DEFAULT 'خبر',
  `category_icon` varchar(10) DEFAULT '?',
  `category_color` varchar(20) NOT NULL DEFAULT '#c9a227',
  `category_text_color` varchar(20) NOT NULL DEFAULT '#0f3d26',
  `bg_color` varchar(20) NOT NULL DEFAULT '#1a5c3a',
  `image_path` varchar(500) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `views_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `news`
--

INSERT INTO `news` (`id`, `title`, `excerpt`, `content`, `category`, `category_icon`, `category_color`, `category_text_color`, `bg_color`, `image_path`, `publish_date`, `is_active`, `sort_order`, `views_count`, `created_at`, `updated_at`) VALUES
(1, 'اكتمال مشروع الطاقة الشمسية في 30 مسجداً بعسير', 'أعلنت الجمعية اكتمال المرحلة الأولى من مشروع الطاقة الشمسية بتمويل 3 ملايين ريال', NULL, 'إنجاز', '🏆', '#c9a227', '#0f3d26', '#1a5c3a', NULL, '2026-04-15', 1, 1, 0, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'توقيع اتفاقية شراكة مع صندوق تطوير المساجد', 'اتفاقية تعاون استراتيجية تشمل صيانة 500 مسجد سنوياً بتمويل مشترك', NULL, 'شراكة', '🤝', '#1a5c3a', '#ffffff', '#c9a227', NULL, '2026-04-10', 1, 2, 0, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'إطلاق مبادرة مساجد خضراء للحفاظ على البيئة', 'تستهدف تحويل 200 مسجد إلى منشآت صديقة للبيئة خلال 3 سنوات', NULL, 'مبادرة', '💡', '#c9a227', '#0f3d26', '#378add', NULL, '2026-04-05', 1, 3, 0, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `partners`
--

CREATE TABLE `partners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `icon` varchar(10) DEFAULT '⭐',
  `logo_path` varchar(500) DEFAULT NULL COMMENT 'مسار الصورة في storage',
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'رابط خارجي للشعار',
  `name_color` varchar(20) NOT NULL DEFAULT '#1a5c3a',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `partners`
--

INSERT INTO `partners` (`id`, `name`, `icon`, `logo_path`, `logo_url`, `name_color`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'وزارة الشؤون الإسلامية', '🏛', NULL, NULL, '#1a5c3a', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'صندوق تطوير المساجد', '🏠', NULL, NULL, '#c9a227', 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'أرامكو السعودية', '💼', NULL, NULL, '#378ADD', 1, 3, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, 'الهلال الأحمر السعودي', '🏥', NULL, NULL, '#E24B4A', 1, 4, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(5, 'بنك التنمية الاجتماعية', '🏦', NULL, NULL, '#533AB7', 1, 5, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `icon` varchar(10) NOT NULL DEFAULT '?',
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `bg_color` varchar(20) NOT NULL DEFAULT '#e8f2ec',
  `progress_pct` tinyint(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'نسبة الإنجاز 0-100',
  `goal_amount` decimal(15,2) DEFAULT NULL COMMENT 'المبلغ المستهدف',
  `current_amount` decimal(15,2) DEFAULT NULL COMMENT 'المبلغ الحالي',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `projects`
--

INSERT INTO `projects` (`id`, `icon`, `name`, `description`, `bg_color`, `progress_pct`, `goal_amount`, `current_amount`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, '💡', 'تركيب الطاقة الشمسية', 'تزويد 120 مسجداً بالطاقة النظيفة في منطقة عسير والجنوب', '#e8f2ec', 82, 100000.00, 82000.00, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, '💧', 'صيانة دورات المياه', 'ترميم وتجديد مرافق الوضوء في 60 مسجداً بالمناطق الريفية', '#fef6e4', 55, 80000.00, 44000.00, 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, '📚', 'مكتبات رقمية', 'توفير محتوى رقمي وأجهزة ذكية لمكتبات 30 مسجداً في المدن', '#e6f0fb', 24, 50000.00, 12000.00, 1, 3, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `registrations`
--

CREATE TABLE `registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `form_id` bigint(20) UNSIGNED NOT NULL,
  `form_key` varchar(100) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'بيانات المتقدم كـ JSON' CHECK (json_valid(`data`)),
  `attachment_path` varchar(500) DEFAULT NULL COMMENT 'مسار المرفق (سيرة/خطاب)',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `registration_forms`
--

CREATE TABLE `registration_forms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `form_key` varchar(100) NOT NULL COMMENT 'member/volunteer/trainee',
  `label` varchar(191) NOT NULL,
  `icon` varchar(10) DEFAULT '?',
  `description` text DEFAULT NULL,
  `fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'حقول النموذج كـ JSON' CHECK (json_valid(`fields`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `registration_forms`
--

INSERT INTO `registration_forms` (`id`, `form_key`, `label`, `icon`, `description`, `fields`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'member', 'عضو جمعية عمومية', '👤', 'للانضمام كعضو عمومي والتصويت في الجمعية العمومية', '[\n  {\"label\":\"الاسم الكامل الثلاثي\",\"type\":\"text\",\"required\":true},\n  {\"label\":\"رقم الهوية الوطنية\",\"type\":\"text\",\"required\":true},\n  {\"label\":\"رقم الهاتف\",\"type\":\"tel\",\"required\":true},\n  {\"label\":\"البريد الإلكتروني\",\"type\":\"email\",\"required\":false},\n  {\"label\":\"المنطقة\",\"type\":\"select\",\"options\":[\"الرياض\",\"مكة المكرمة\",\"المدينة المنورة\",\"المنطقة الشرقية\",\"عسير\",\"منطقة أخرى\"],\"required\":true},\n  {\"label\":\"تاريخ الميلاد\",\"type\":\"date\",\"required\":false}\n]', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'volunteer', 'متطوع', '🙋', 'للتطوع بوقتك ومهاراتك في خدمة بيوت الله', '[\n  {\"label\":\"الاسم الكامل\",\"type\":\"text\",\"required\":true},\n  {\"label\":\"العمر\",\"type\":\"number\",\"required\":true},\n  {\"label\":\"رقم الهاتف\",\"type\":\"tel\",\"required\":true},\n  {\"label\":\"البريد الإلكتروني\",\"type\":\"email\",\"required\":false},\n  {\"label\":\"المهارات والخبرات\",\"type\":\"select\",\"options\":[\"صيانة كهربائية\",\"سباكة وتمديدات\",\"دهانات وديكور\",\"برمجة وتقنية\",\"إدارة وتنظيم\"],\"required\":true},\n  {\"label\":\"السيرة الذاتية\",\"type\":\"file\",\"required\":false}\n]', 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'trainee', 'متدرب', '🎓', 'لبرنامج التدريب الصيفي والتعاوني', '[\n  {\"label\":\"الاسم الكامل\",\"type\":\"text\",\"required\":true},\n  {\"label\":\"رقم الهاتف\",\"type\":\"tel\",\"required\":true},\n  {\"label\":\"الجامعة / المعهد\",\"type\":\"text\",\"required\":true},\n  {\"label\":\"التخصص\",\"type\":\"text\",\"required\":true},\n  {\"label\":\"فترة التدريب\",\"type\":\"select\",\"options\":[\"شهر\",\"شهران\",\"3 أشهر\",\"6 أشهر\"],\"required\":true},\n  {\"label\":\"البريد الإلكتروني\",\"type\":\"email\",\"required\":false},\n  {\"label\":\"خطاب الجامعة\",\"type\":\"file\",\"required\":false}\n]', 1, 3, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `report_files`
--

CREATE TABLE `report_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `report_id` bigint(20) UNSIGNED NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `site_settings`
--

CREATE TABLE `site_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL COMMENT 'مفتاح الإعداد',
  `value` longtext DEFAULT NULL COMMENT 'قيمة الإعداد',
  `type` enum('text','color','image','json','boolean','number') NOT NULL DEFAULT 'text',
  `group` varchar(100) NOT NULL DEFAULT 'general' COMMENT 'التصنيف: general/hero/footer/colors',
  `label` varchar(191) DEFAULT NULL COMMENT 'الاسم المعروض في لوحة التحكم',
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `site_settings`
--

INSERT INTO `site_settings` (`id`, `key`, `value`, `type`, `group`, `label`, `updated_at`) VALUES
(1, 'org_name', 'جمعية رفد المساجد للعناية بالمساجد', 'text', 'general', 'اسم المنظمة', '2026-04-21 20:28:46'),
(2, 'org_name_en', 'KSA Mosque Care Foundation', 'text', 'general', 'الاسم الإنجليزي', '2026-04-21 20:28:46'),
(3, 'org_phone', '920001234', 'text', 'general', 'رقم الهاتف', '2026-04-21 20:28:46'),
(4, 'org_email', 'info@mosqueksa.org', 'text', 'general', 'البريد الإلكتروني', '2026-04-21 20:28:46'),
(5, 'org_address', 'الرياض، المملكة العربية السعودية', 'text', 'general', 'العنوان', '2026-04-21 20:28:46'),
(6, 'org_about', 'جمعية رفد المساجد للعناية بالمساجد جمعية خيرية غير ربحية مرخصة من وزارة الموارد البشرية، تُعنى بصيانة وتطوير المساجد في جميع مناطق المملكة العربية السعودية منذ عام 1440 هـ.', 'text', 'general', 'نص التعريف', '2026-04-21 20:28:46'),
(7, 'license_number', '447/ص', 'text', 'general', 'رقم الترخيص', '2026-04-21 20:28:46'),
(8, 'map_url', 'https://maps.google.com/?q=24.7136,46.6753', 'text', 'general', 'رابط الخريطة', '2026-04-21 20:28:46'),
(9, 'map_label', 'الرياض · حي العليا', 'text', 'general', 'وصف الموقع', '2026-04-21 20:28:46'),
(10, 'color_primary', '#0f3d26', 'color', 'colors', 'اللون الأساسي', '2026-04-21 20:28:46'),
(11, 'color_secondary', '#1a5c3a', 'color', 'colors', 'اللون الثانوي', '2026-04-21 20:28:46'),
(12, 'color_accent', '#c9a227', 'color', 'colors', 'لون التمييز', '2026-04-21 20:28:46'),
(13, 'color_bg', '#f5f1ea', 'color', 'colors', 'لون الخلفية', '2026-04-21 20:28:46'),
(14, 'hero_badge', '🌙 منذ 1440 هـ · رعاية · تطوير · استدامة', 'text', 'hero', 'نص الشارة', '2026-04-21 20:28:46'),
(15, 'hero_title_em', 'بيوت الله', 'text', 'hero', 'الكلمة المميّزة', '2026-04-21 20:28:46'),
(16, 'hero_title_rest', 'لتبقى شامخةً بالعبادة', 'text', 'hero', 'باقي العنوان', '2026-04-21 20:28:46'),
(17, 'hero_subtitle', 'جمعية متخصصة في صيانة وتطوير المساجد عبر المملكة العربية السعودية', 'text', 'hero', 'النص التعريفي', '2026-04-21 20:28:46'),
(18, 'hero_btn1', '🏗 استعرض مشاريعنا', 'text', 'hero', 'نص الزر الأول', '2026-04-21 20:28:46'),
(19, 'hero_btn2', '📋 شارك في الاستطلاع', 'text', 'hero', 'نص الزر الثاني', '2026-04-21 20:28:46'),
(20, 'nav_donate_btn', '💚 تبرّع الآن', 'text', 'general', 'نص زر التبرع', '2026-04-21 20:28:46'),
(21, 'scroll_speed', '30', 'number', 'general', 'سرعة تمرير الآراء (ثانية)', '2026-04-21 20:28:46'),
(22, 'partner_logo_height', '40', 'number', 'general', 'ارتفاع شعار الشريك (بكسل)', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `site_state`
--

CREATE TABLE `site_state` (
  `id` int(11) NOT NULL,
  `state_key` varchar(50) NOT NULL DEFAULT 'main',
  `state_json` longtext NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `site_state`
--

INSERT INTO `site_state` (`id`, `state_key`, `state_json`, `updated_at`, `updated_by`) VALUES
(1, 'main', '{\"nav\":{\"orgName\":\"جمعية رفد المساجد للعناية بالمساجد\",\"orgSub\":\"KSA Mosque Care Foundation\",\"donBtn\":\"تبرّع الآن\",\"donUrl\":\"#\",\"items\":[{\"label\":\"الرئيسية\",\"url\":\"home\",\"hasDrop\":false,\"dropItems\":[]},{\"label\":\"من نحن\",\"url\":\"about\",\"hasDrop\":true,\"dropItems\":[{\"label\":\"الرؤية والرسالة\",\"icon\":\"◈\",\"type\":\"text\"},{\"label\":\"مجلس الإدارة\",\"icon\":\"👥\",\"type\":\"text\"},{\"label\":\"الهيكل التنظيمي\",\"icon\":\"📋\",\"type\":\"pdf\"}]},{\"label\":\"المشاريع\",\"url\":\"projects\",\"hasDrop\":false,\"dropItems\":[]},{\"label\":\"استطلاعات الرأي\",\"url\":\"surveys-sec\",\"hasDrop\":true,\"dropItems\":[{\"label\":\"قائمة الاستطلاعات\",\"icon\":\"📋\",\"type\":\"text\",\"svTab\":\"list\"},{\"label\":\"نتائج الاستطلاعات\",\"icon\":\"📊\",\"type\":\"text\",\"svTab\":\"results\"},{\"label\":\"تقارير التحليل\",\"icon\":\"🔬\",\"type\":\"pdfgroup\",\"svTab\":\"analysis\"},{\"label\":\"توصيات المجلس\",\"icon\":\"🏛\",\"type\":\"pdf\",\"svTab\":\"board\"}]},{\"label\":\"الأخبار\",\"url\":\"news\",\"hasDrop\":false,\"dropItems\":[]},{\"label\":\"الحوكمة\",\"url\":\"#\",\"hasDrop\":true,\"dropItems\":[{\"label\":\"الوثائق والتقارير\",\"icon\":\"📄\",\"type\":\"pdf\",\"page\":\"docs\"},{\"label\":\"الشكاوى والمقترحات\",\"icon\":\"💬\",\"type\":\"text\",\"page\":\"complaints\"},{\"label\":\"نماذج التسجيل\",\"icon\":\"📋\",\"type\":\"text\",\"page\":\"register\"}]},{\"label\":\"تواصل معنا\",\"url\":\"p-ft-sec\",\"hasDrop\":false,\"dropItems\":[]}],\"donBtnText\":\"💚 تبرّع الآن\"},\"wa\":{\"phone\":\"966500000000\",\"label\":\"تواصل معنا\",\"show\":true},\"hero\":{\"badge\":\"🌙 منذ 1440 هـ · رعاية · تطوير · استدامة\",\"em\":\"بيوت الله\",\"rest\":\"لتبقى شامخةً بالعبادة\",\"sub\":\"جمعية متخصصة في صيانة وتطوير المساجد عبر المملكة العربية السعودية\",\"btn1\":\"🏗 استعرض مشاريعنا\",\"btn2\":\"📋 شارك في الاستطلاع\",\"bg1\":\"#082918\",\"bg2\":\"#1a5c3a\",\"dir\":\"145deg\"},\"achiev\":[{\"icon\":\"🕌\",\"label\":\"المساجد المخدومة\",\"val\":\"1,240\",\"unit\":\"مسجد\"},{\"icon\":\"💧\",\"label\":\"مشاريع المياه\",\"val\":\"586\",\"unit\":\"مشروع\"},{\"icon\":\"❄️\",\"label\":\"محطات التبريد\",\"val\":\"11\",\"unit\":\"محطة\"},{\"icon\":\"👥\",\"label\":\"المستفيدون\",\"val\":\"25,000\",\"unit\":\"مستفيد\"},{\"icon\":\"🏗\",\"label\":\"المتطوعون\",\"val\":\"340\",\"unit\":\"متطوع\"},{\"icon\":\"📍\",\"label\":\"المناطق\",\"val\":\"15\",\"unit\":\"منطقة\"}],\"stats\":[{\"val\":\"1,240\",\"label\":\"مسجد تمت خدمته\"},{\"val\":\"18,500\",\"label\":\"متبرع كريم\"},{\"val\":\"340\",\"label\":\"مشروع مكتمل\"},{\"val\":\"15\",\"label\":\"منطقة مغطاة\"}],\"projects\":[{\"icon\":\"💡\",\"bg\":\"#e8f2ec\",\"name\":\"تركيب الطاقة الشمسية\",\"desc\":\"تزويد 120 مسجداً بالطاقة النظيفة في منطقة عسير والجنوب\",\"pct\":82,\"goal\":100000,\"cur\":82000},{\"icon\":\"💧\",\"bg\":\"#fef6e4\",\"name\":\"صيانة دورات المياه\",\"desc\":\"ترميم وتجديد مرافق الوضوء في 60 مسجداً بالمناطق الريفية\",\"pct\":55,\"goal\":80000,\"cur\":44000},{\"icon\":\"📚\",\"bg\":\"#e6f0fb\",\"name\":\"مكتبات رقمية\",\"desc\":\"توفير محتوى رقمي وأجهزة ذكية لمكتبات 30 مسجداً في المدن\",\"pct\":24,\"goal\":50000,\"cur\":12000}],\"partners\":[{\"name\":\"وزارة الشؤون الإسلامية\",\"icon\":\"🏛\",\"img\":\"\",\"color\":\"#1a5c3a\"},{\"name\":\"صندوق تطوير المساجد\",\"icon\":\"🏠\",\"img\":\"\",\"color\":\"#c9a227\"},{\"name\":\"أرامكو السعودية\",\"icon\":\"💼\",\"img\":\"\",\"color\":\"#378ADD\"},{\"name\":\"الهلال الأحمر السعودي\",\"icon\":\"🏥\",\"img\":\"\",\"color\":\"#E24B4A\"},{\"name\":\"بنك التنمية الاجتماعية\",\"icon\":\"🏦\",\"img\":\"\",\"color\":\"#533AB7\"}],\"news\":[{\"cat\":\"إنجاز\",\"catIcon\":\"🏆\",\"catColor\":\"#c9a227\",\"catTx\":\"#0f3d26\",\"bg\":\"#1a5c3a\",\"title\":\"اكتمال مشروع الطاقة الشمسية في 30 مسجداً بعسير\",\"date\":\"2026-04-15\",\"excerpt\":\"أعلنت الجمعية اكتمال المرحلة الأولى من مشروع الطاقة الشمسية بتمويل 3 ملايين ريال\"},{\"cat\":\"شراكة\",\"catIcon\":\"🤝\",\"catColor\":\"#1a5c3a\",\"catTx\":\"#ffffff\",\"bg\":\"#c9a227\",\"title\":\"توقيع اتفاقية شراكة مع صندوق تطوير المساجد\",\"date\":\"2026-04-10\",\"excerpt\":\"اتفاقية تعاون استراتيجية تشمل صيانة 500 مسجد سنوياً بتمويل مشترك\"},{\"cat\":\"مبادرة\",\"catIcon\":\"💡\",\"catColor\":\"#c9a227\",\"catTx\":\"#0f3d26\",\"bg\":\"#378add\",\"title\":\"إطلاق مبادرة مساجد خضراء للحفاظ على البيئة\",\"date\":\"2026-04-05\",\"excerpt\":\"تستهدف تحويل 200 مسجد إلى منشآت صديقة للبيئة خلال 3 سنوات\"}],\"events\":[{\"day\":\"22\",\"month\":\"أبر\",\"title\":\"ورشة عمل: معايير الصيانة الوقائية للمساجد\",\"meta\":\"مركز الملك عبدالله · الرياض · 10:00 ص\",\"status\":\"live\"},{\"day\":\"30\",\"month\":\"أبر\",\"title\":\"حفل تكريم المتطوعين والشركاء لعام 1446 هـ\",\"meta\":\"فندق الفيصلية · الرياض · 7:00 م\",\"status\":\"upcoming\"},{\"day\":\"8\",\"month\":\"مايو\",\"title\":\"جولة ميدانية في مشاريع المنطقة الشرقية\",\"meta\":\"الدمام والأحساء · يوم كامل\",\"status\":\"upcoming\"}],\"testimonials\":[{\"name\":\"أحمد الغامدي\",\"role\":\"إمام مسجد · أبها\",\"quote\":\"لقد تحوّل مسجدنا تماماً بعد مشروع الصيانة — بارك الله فيهم.\",\"initials\":\"أح\",\"color\":\"#1a5c3a\"},{\"name\":\"سعد الحارثي\",\"role\":\"متبرع دائم · الرياض\",\"quote\":\"الشفافية والمتابعة الميدانية جعلتني أثق بهم تماماً.\",\"initials\":\"سع\",\"color\":\"#c9a227\"},{\"name\":\"منصور العتيبي\",\"role\":\"عضو مجلس بلدي · جدة\",\"quote\":\"رأيت التحول بأم عيني — مبادرة تستحق الدعم.\",\"initials\":\"من\",\"color\":\"#378ADD\"},{\"name\":\"فاطمة الأحمدي\",\"role\":\"ولية أمر · مكة\",\"quote\":\"خدمة احترافية وفريق متميز.\",\"initials\":\"فا\",\"color\":\"#c9a227\"}],\"scrollSpeed\":5,\"surveys\":[{\"id\":\"sv1778851742210\",\"icon\":\"📋\",\"iconBg\":\"#e8f2ec\",\"title\":\"العصر\",\"desc\":\"\",\"cat\":\"عام\",\"status\":\"active\",\"responses\":0,\"questions\":[{\"text\":\"نوع الخدمة\",\"type\":\"choice\",\"required\":true,\"opts\":[\"كهرباء\",\"سباكة\",\"بلاط\"]},{\"text\":\"مستوى الخدمة\",\"type\":\"likert\",\"required\":true,\"opts\":[\"ممتاز\",\"جيد\",\"صعيف\"]}]},{\"id\":\"sv1778852029888\",\"icon\":\"📋\",\"iconBg\":\"#e8f2ec\",\"title\":\"العصر 1\",\"desc\":\"\",\"cat\":\"عام\",\"status\":\"active\",\"responses\":0,\"questions\":[{\"text\":\"اكتب \",\"type\":\"text\",\"required\":true,\"opts\":[\"ضعيف\",\"مقبول\",\"جيد\",\"ممتاز\"]},{\"text\":\"قم برفع المستند\",\"type\":\"file\",\"required\":true,\"opts\":[\"ضعيف\",\"مقبول\",\"جيد\",\"ممتاز\"]}]},{\"id\":\"sv1778855438259\",\"icon\":\"📋\",\"iconBg\":\"#e8f2ec\",\"title\":\"استطلاع جديد\",\"desc\":\"\",\"cat\":\"عام\",\"status\":\"active\",\"responses\":0,\"questions\":[{\"text\":\"السؤال الأول\",\"type\":\"likert\",\"required\":true,\"opts\":[\"ضعيف\",\"مقبول\",\"جيد\",\"ممتاز\"]},{\"text\":\"سؤال جديد\",\"type\":\"likert\",\"required\":true,\"opts\":[\"ضعيف\",\"مقبول\",\"جيد\",\"ممتاز\"]},{\"text\":\"سؤال جديد\",\"type\":\"likert\",\"required\":true,\"opts\":[\"ضعيف\",\"مقبول\",\"جيد\",\"ممتاز\"]}]}],\"maintenance\":{\"enabled\":false,\"message\":\"الموقع قيد الصيانة — سنعود قريباً\",\"until\":\"2026-05-16T05:44\"},\"cmsUsers\":[],\"surveyResults\":{\"total\":847,\"complete\":798,\"incomplete\":49,\"avgTime\":\"4.2 دقيقة\",\"sat\":88,\"qRes\":[{\"text\":\"مدى الرضا عن جودة الصيانة\",\"opts\":[\"ضعيف\",\"مقبول\",\"جيد\",\"جيد جداً\",\"ممتاز\"],\"counts\":[14,52,189,267,325],\"colors\":[\"#e24b4a\",\"#f97316\",\"#f59e0b\",\"#22c55e\",\"#0f3d26\"],\"insight\":\"88% إيجابيون — \\\"ممتاز\\\" الأكثر اختياراً بنسبة 38.4%. النتائج السلبية في حدود 1.7%.\"},{\"text\":\"الالتزام بالمواعيد\",\"opts\":[\"لا أبداً\",\"أحياناً\",\"غالباً\",\"دائماً\"],\"counts\":[22,89,295,441],\"colors\":[\"#e24b4a\",\"#f97316\",\"#22c55e\",\"#0f3d26\"],\"insight\":\"86.9% راضون. 13% تأخر — يُوصى بمراجعة آلية الجدولة وإرسال إشعارات مسبقة.\"},{\"text\":\"التوصية بالجمعية\",\"opts\":[\"لا\",\"ربما\",\"نعم\",\"بكل تأكيد\"],\"counts\":[8,31,198,610],\"colors\":[\"#e24b4a\",\"#f97316\",\"#22c55e\",\"#0f3d26\"],\"insight\":\"98% يوصون أو يوصون بشدة — مؤشر ثقة استثنائي يعكس رضا المستفيدين.\"}]},\"analysisReports\":[{\"title\":\"تقرير جديد\",\"date\":\"\",\"survey\":\"\",\"text\":\"\",\"pdfs\":[]}],\"boardDecisions\":[{\"type\":\"rec\",\"title\":\"توصية جديدة\",\"survey\":\"\",\"body\":\"\",\"files\":[]}],\"footer\":{\"about\":\"جمعية رفد المساجد للعناية بالمساجد جمعية خيرية غير ربحية مرخصة من وزارة الموارد البشرية، تُعنى بصيانة وتطوير المساجد في جميع مناطق المملكة العربية السعودية منذ عام 1440 هـ.\",\"phone\":\"920001234\",\"email\":\"info@mosqueksa.org\",\"address\":\"الرياض، المملكة العربية السعودية\",\"mapUrl\":\"https://maps.google.com/?q=24.7136,46.6753\",\"mapLabel\":\"الرياض · حي العليا\",\"links\":[{\"label\":\"الرئيسية\",\"url\":\"#home\",\"page\":null},{\"label\":\"المشاريع\",\"url\":\"#projects\",\"page\":null},{\"label\":\"الاستطلاعات\",\"url\":\"#surveys\",\"page\":null},{\"label\":\"الأخبار\",\"url\":\"#news\",\"page\":null},{\"label\":\"الوثائق والتقارير\",\"url\":\"#\",\"page\":\"docs\"},{\"label\":\"الشكاوى والمقترحات\",\"url\":\"#\",\"page\":\"complaints\"},{\"label\":\"نماذج التسجيل\",\"url\":\"#\",\"page\":\"register\"}],\"socials\":[{\"icon\":\"𝕏\",\"label\":\"تويتر\",\"url\":\"https://twitter.com/mosqueksa\"},{\"icon\":\"📷\",\"label\":\"إنستغرام\",\"url\":\"https://instagram.com/mosqueksa\"},{\"icon\":\"▶\",\"label\":\"يوتيوب\",\"url\":\"https://youtube.com/mosqueksa\"},{\"icon\":\"💬\",\"label\":\"واتساب\",\"url\":\"https://wa.me/966500000000\"},{\"icon\":\"✉\",\"label\":\"البريد\",\"url\":\"mailto:info@mosqueksa.org\"}]},\"hiddenSections\":[],\"customPages\":[{\"id\":\"pg1778330676311\",\"title\":\"أدلة التحربة\",\"intro\":\"تجربة رفع الأدلة \",\"blocks\":[{\"type\":\"pdfs\",\"content\":\"\",\"url\":\"[{\\\"name\\\":\\\"الدليل-المختصر-لتجهيز-ملف-الحوكمة-2024.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778330721_____________-______________-____________-______-______________-2024.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_التنظيم_المالي.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778330731_____________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_الشفافية_والإفصاح.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778330732_____________________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_الامتثال_والالتزام.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778330734_____________________________________________________________________________________.pdf\\\"}]\",\"name\":\"\",\"desc\":\"\",\"caption\":\"\"},{\"type\":\"pdfs\",\"content\":\"\",\"url\":\"[]\",\"name\":\"\",\"desc\":\"\",\"caption\":\"\"}]},{\"id\":\"pg1778344651960\",\"title\":\"الصفحات التجريبية\",\"intro\":\"تجربة الشريط\",\"blocks\":[]},{\"id\":\"pg1778344933922\",\"title\":\"تجربة الشريط\",\"intro\":\"هل يعمل\",\"blocks\":[{\"type\":\"pdfs\",\"content\":\"\",\"url\":\"[{\\\"name\\\":\\\"جدول اعمال الجمعية العمومية.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778344980____________________________________________________.pdf\\\"},{\\\"name\\\":\\\"111.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778344981_111.pdf\\\"},{\\\"name\\\":\\\"الدليل-المختصر-لتجهيز-ملف-الحوكمة-2024.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778344984_____________-______________-____________-______-______________-2024.pdf\\\"},{\\\"name\\\":\\\"قواعد-حوكمة-المنظمات-غير-الربحية.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778344994___________-__________-________________-______-______________.pdf\\\"},{\\\"name\\\":\\\"دليل-معيارالشفافية-والإفصاح-للجمعيات-الأهلية-الإصدار-الخامس-2024.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778344997_________-__________________________-________________-________________-______________-______________-____________-2024.pdf\\\"},{\\\"name\\\":\\\"دليل-المعيار-الثالث-السلامة-المالية-للجمعيات-الأهلية-الإصدار-الخامس-2024.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345002_________-______________-____________-______________-______________-________________-______________-______________-____________-2024.pdf\\\"},{\\\"name\\\":\\\"دليل-معيار-الامتثال-والالتزام-للجمعيات-الأهلية-الإصدار-الخامس-2024.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345004_________-__________-________________-__________________-________________-______________-______________-____________-2024.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_الشفافية_والإفصاح.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345008_____________________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_الامتثال_والالتزام.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345008_____________________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"كتيب الاستعداد لحوكمة2024م.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345009_________________________________________2024__.pdf\\\"},{\\\"name\\\":\\\"دليل-التقييم-الذاتي-لمعيار-الشفافية-والإفصاح-للجمعيات-الأهلية-الإصدار-الأول-مايو-2025.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345010_________-______________-____________-____________-________________-________________-________________-______________-______________-__________-________-2025.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_التنظيم_المالي.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345015_____________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"دليل-التقييم-الذاتي-لمعيار-السلامة-المالية-للجمعيات-الأهلية-الإصدار-الأول-مايو-2025.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345018_________-______________-____________-____________-______________-______________-________________-______________-______________-__________-________-2025.pdf\\\"},{\\\"name\\\":\\\"دليل-التقييم-الذاتي-لمعيار-الامتثال-والالتزام-للجمعيات-الأهلية_الإصدار-الأول_مايو-2025.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778345021_________-______________-____________-____________-________________-__________________-________________-_____________________________-___________________-2025.pdf\\\"}]\",\"name\":\"\",\"desc\":\"\",\"caption\":\"\"}]},{\"id\":\"pg1778436949598\",\"title\":\"صفحة جديدة\",\"intro\":\"\",\"blocks\":[{\"type\":\"pdfs\",\"content\":\"\",\"url\":\"[{\\\"name\\\":\\\"جدول اعمال الجمعية العمومية.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778436970____________________________________________________.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_التنظيم_المالي.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778436976_____________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_الشفافية_والإفصاح.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778436977_____________________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"المختصر_لمؤشرات_وممارسات_الامتثال_والالتزام.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778436979_____________________________________________________________________________________.pdf\\\"},{\\\"name\\\":\\\"دليل-التقييم-الذاتي-لمعيار-الشفافية-والإفصاح-للجمعيات-الأهلية-الإصدار-الأول-مايو-2025.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778436980_________-______________-____________-____________-________________-________________-________________-______________-______________-__________-________-2025.pdf\\\"},{\\\"name\\\":\\\"دليل-التقييم-الذاتي-لمعيار-السلامة-المالية-للجمعيات-الأهلية-الإصدار-الأول-مايو-2025.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778436985_________-______________-____________-____________-______________-______________-________________-______________-______________-__________-________-2025.pdf\\\"},{\\\"name\\\":\\\"دليل-التقييم-الذاتي-لمعيار-الامتثال-والالتزام-للجمعيات-الأهلية_الإصدار-الأول_مايو-2025.pdf\\\",\\\"url\\\":\\\"/mosque/uploads/1778436988_________-______________-____________-____________-________________-__________________-________________-_____________________________-___________________-2025.pdf\\\"}]\",\"name\":\"\",\"desc\":\"\",\"caption\":\"\"}]}],\"customcustomPages\":[],\"pages\":{\"docs\":{\"pdfs\":[{\"title\":\"التقرير السنوي 1445 هـ\",\"desc\":\"التقرير السنوي الشامل للجمعية — الإنجازات والمشاريع والبيانات المالية\",\"date\":\"2026-03-15\",\"size\":null,\"bg\":\"#e8f2ec\",\"icon\":\"📄\",\"file\":null,\"fileUrl\":\"\"},{\"title\":\"دليل معايير الصيانة\",\"desc\":\"المعايير والمواصفات التقنية المعتمدة لصيانة المساجد\",\"date\":\"2026-01-10\",\"size\":null,\"bg\":\"#fef6e4\",\"icon\":\"📋\",\"file\":null,\"fileUrl\":\"\"},{\"title\":\"سياسة جمع التبرعات\",\"desc\":\"الإطار المرجعي لسياسات جمع واستثمار التبرعات\",\"date\":\"2025-11-05\",\"size\":null,\"bg\":\"#e6f0fb\",\"icon\":\"📑\",\"file\":null,\"fileUrl\":\"\"},{\"title\":\"نتائج استطلاع الرضا 2025\",\"desc\":\"تقرير تفصيلي بنتائج استطلاعات الرأي السنوية\",\"date\":\"2025-12-20\",\"size\":null,\"bg\":\"#f0e8fb\",\"icon\":\"📊\",\"file\":null,\"fileUrl\":\"\"}]},\"complaints\":{\"title\":\"الشكاوى والمقترحات\",\"sub\":\"مساهمتك تساعدنا على التطوير المستمر — نحن نسمعك ونتجاوب\"},\"register\":{\"forms\":[{\"label\":\"عضو جمعية عمومية\",\"icon\":\"👤\",\"desc\":\"للانضمام كعضو عمومي والتصويت في الجمعية العمومية\",\"fields\":[{\"label\":\"الاسم الكامل الثلاثي\",\"type\":\"text\",\"required\":true},{\"label\":\"رقم الهوية الوطنية\",\"type\":\"text\",\"required\":true},{\"label\":\"رقم الهاتف\",\"type\":\"tel\",\"required\":true},{\"label\":\"البريد الإلكتروني\",\"type\":\"email\",\"required\":false},{\"label\":\"المنطقة\",\"type\":\"select\",\"options\":[\"الرياض\",\"مكة المكرمة\",\"المدينة المنورة\",\"المنطقة الشرقية\",\"عسير\",\"منطقة أخرى\"],\"required\":true},{\"label\":\"تاريخ الميلاد\",\"type\":\"date\",\"required\":false}]},{\"label\":\"متطوع\",\"icon\":\"🙋\",\"desc\":\"للتطوع بوقتك ومهاراتك في خدمة بيوت الله\",\"fields\":[{\"label\":\"الاسم الكامل\",\"type\":\"text\",\"required\":true},{\"label\":\"العمر\",\"type\":\"number\",\"required\":true},{\"label\":\"رقم الهاتف\",\"type\":\"tel\",\"required\":true},{\"label\":\"البريد الإلكتروني\",\"type\":\"email\",\"required\":false},{\"label\":\"المهارات والخبرات\",\"type\":\"select\",\"options\":[\"صيانة كهربائية\",\"سباكة وتمديدات\",\"دهانات وديكور\",\"برمجة وتقنية\",\"إدارة وتنظيم\"],\"required\":true},{\"label\":\"السيرة الذاتية\",\"type\":\"file\",\"required\":false}]},{\"label\":\"متدرب\",\"icon\":\"🎓\",\"desc\":\"لبرنامج التدريب الصيفي والتعاوني\",\"fields\":[{\"label\":\"الاسم الكامل\",\"type\":\"text\",\"required\":true},{\"label\":\"رقم الهاتف\",\"type\":\"tel\",\"required\":true},{\"label\":\"الجامعة / المعهد\",\"type\":\"text\",\"required\":true},{\"label\":\"التخصص\",\"type\":\"text\",\"required\":true},{\"label\":\"فترة التدريب\",\"type\":\"select\",\"options\":[\"شهر\",\"شهران\",\"3 أشهر\",\"6 أشهر\"],\"required\":true},{\"label\":\"البريد الإلكتروني\",\"type\":\"email\",\"required\":false},{\"label\":\"خطاب الجامعة\",\"type\":\"file\",\"required\":false}]},{\"icon\":\"📝\",\"label\":\"طلب ترميم جامع\",\"desc\":\"نموذج لطلبات الترميم الخاصة الجوامع\",\"fields\":[{\"label\":\"موقع المسجد\",\"type\":\"select\",\"required\":true,\"placeholder\":\"\",\"options\":[\"شرق\",\"غرب\",\"شمال\",\"جنوب\"]},{\"label\":\"اسم الإمام\",\"type\":\"text\",\"required\":true,\"placeholder\":\"\"},{\"label\":\"حقل جديد\",\"type\":\"text\",\"required\":false,\"placeholder\":\"\"}]},{\"icon\":\"🎓\",\"label\":\"طلب كهرباء\",\"desc\":\"صيانة كهرباء المساجد\",\"fields\":[{\"label\":\"اسم المسجد\",\"type\":\"text\",\"required\":true,\"placeholder\":\"\"},{\"label\":\"الاتجاه\",\"type\":\"select\",\"required\":true,\"placeholder\":\"\",\"options\":[\"شرق\",\"شمال\",\"غرب\",\"جنوب\"]}]}]}},\"boardRecommendations\":[{\"text\":\"\",\"priority\":\"mid\",\"status\":\"pending\"},{\"text\":\"\",\"priority\":\"mid\",\"status\":\"pending\"}]}', '2026-05-16 02:44:03', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `social_links`
--

CREATE TABLE `social_links` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `icon` varchar(10) NOT NULL DEFAULT '?',
  `label` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `social_links`
--

INSERT INTO `social_links` (`id`, `icon`, `label`, `url`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '𝕏', 'تويتر', 'https://twitter.com/mosqueksa', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, '📷', 'إنستغرام', 'https://instagram.com/mosqueksa', 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, '▶', 'يوتيوب', 'https://youtube.com/mosqueksa', 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, '💬', 'واتساب', 'https://wa.me/966500000000', 4, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(5, '✉', 'البريد', 'mailto:info@mosqueksa.org', 5, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `stats`
--

CREATE TABLE `stats` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `value` varchar(50) NOT NULL COMMENT 'مثل: 1,240',
  `label` varchar(191) NOT NULL COMMENT 'مثل: مسجد تمت خدمته',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `stats`
--

INSERT INTO `stats` (`id`, `value`, `label`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '1,240', 'مسجد تمت خدمته', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, '18,500', 'متبرع كريم', 2, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, '340', 'مشروع مكتمل', 3, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, '15', 'منطقة مغطاة', 4, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `surveys`
--

CREATE TABLE `surveys` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(10) DEFAULT '?',
  `icon_bg` varchar(20) DEFAULT '#e8f2ec',
  `category` varchar(100) DEFAULT 'عام',
  `status` enum('open','closed') NOT NULL DEFAULT 'open',
  `responses_count` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `surveys`
--

INSERT INTO `surveys` (`id`, `title`, `description`, `icon`, `icon_bg`, `category`, `status`, `responses_count`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'تقييم جودة خدمات الصيانة Q1 2026', 'استطلاع دوري لقياس رضا مستفيدي خدمات الصيانة', '📋', '#e8f2ec', 'جودة الخدمة', 'open', 0, 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'رضا المستفيدين عن مشروع الطاقة الشمسية', 'قياس مدى رضا المساجد المستفيدة من مشروع الطاقة', '⚡', '#fef6e4', 'رضا المستفيدين', 'open', 0, 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `survey_id` bigint(20) UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('likert','radio','dropdown','text','checkbox') NOT NULL DEFAULT 'likert',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'الخيارات كـ JSON array' CHECK (json_valid(`options`)),
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `survey_id`, `question_text`, `question_type`, `options`, `is_required`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'ما مدى رضاك عن جودة العمل المنجز؟', 'likert', '[\"ضعيف\",\"مقبول\",\"جيد\",\"جيد جداً\",\"ممتاز\"]', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 1, 'ما نوع الخدمة التي استفدت منها؟', 'dropdown', '[\"صيانة كهربائية\",\"سباكة\",\"دهانات\",\"تبريد\",\"أخرى\"]', 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 1, 'هل التزم الفريق بالمواعيد المحددة؟', 'radio', '[\"دائماً\",\"غالباً\",\"أحياناً\",\"نادراً\"]', 1, 3, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, 1, 'ملاحظاتك واقتراحاتك', 'text', NULL, 0, 4, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `survey_responses`
--

CREATE TABLE `survey_responses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `survey_id` bigint(20) UNSIGNED NOT NULL,
  `respondent_name` varchar(191) DEFAULT NULL,
  `respondent_phone` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'الإجابات كـ JSON' CHECK (json_valid(`answers`)),
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `testimonials`
--

CREATE TABLE `testimonials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `role` varchar(191) DEFAULT NULL COMMENT 'مثل: إمام مسجد · أبها',
  `quote` text NOT NULL,
  `initials` varchar(10) DEFAULT NULL COMMENT 'الأحرف الأولى',
  `avatar_color` varchar(20) NOT NULL DEFAULT '#1a5c3a',
  `avatar_text_color` varchar(20) NOT NULL DEFAULT '#ffffff',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `testimonials`
--

INSERT INTO `testimonials` (`id`, `name`, `role`, `quote`, `initials`, `avatar_color`, `avatar_text_color`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'أحمد الغامدي', 'إمام مسجد · أبها', 'لقد تحوّل مسجدنا تماماً بعد مشروع الصيانة — بارك الله فيهم.', 'أح', '#1a5c3a', '#ffffff', 1, 1, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(2, 'سعد الحارثي', 'متبرع دائم · الرياض', 'الشفافية والمتابعة الميدانية جعلتني أثق بهم تماماً.', 'سع', '#c9a227', '#ffffff', 1, 2, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(3, 'منصور العتيبي', 'عضو مجلس بلدي · جدة', 'رأيت التحول بأم عيني — مبادرة تستحق الدعم.', 'من', '#378ADD', '#ffffff', 1, 3, '2026-04-21 20:28:46', '2026-04-21 20:28:46'),
(4, 'فاطمة الأحمدي', 'ولية أمر · مكة', 'خدمة احترافية وفريق متميز.', 'فا', '#c9a227', '#ffffff', 1, 4, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL COMMENT 'الاسم الكامل',
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','editor','viewer') NOT NULL DEFAULT 'viewer' COMMENT 'admin=كامل، editor=تحرير، viewer=قراءة فقط',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`, `last_login`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'مدير النظام', 'admin@mosqueksa.org', '$2y$10$VDffofSr5c4H.DjxHsd5qeP9M3bmEIbgyXwdJPQreUfwop5T4tD5m', 'admin', 1, '2026-05-16 02:43:03', NULL, '2026-04-21 20:28:46', '2026-04-21 20:28:46');

--
-- Indexes for dumped tables
--

--
-- فهارس للجدول `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `analysis_reports`
--
ALTER TABLE `analysis_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `analysis_reports_related_survey_id_foreign` (`related_survey_id`);

--
-- فهارس للجدول `board_decisions`
--
ALTER TABLE `board_decisions`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `decision_files`
--
ALTER TABLE `decision_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `decision_files_decision_id_foreign` (`decision_id`);

--
-- فهارس للجدول `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donations_project_id_foreign` (`project_id`);

--
-- فهارس للجدول `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `footer_links`
--
ALTER TABLE `footer_links`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `form_entries`
--
ALTER TABLE `form_entries`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `nav_dropdown_items`
--
ALTER TABLE `nav_dropdown_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nav_dropdown_items_nav_item_id_foreign` (`nav_item_id`);

--
-- فهارس للجدول `nav_items`
--
ALTER TABLE `nav_items`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registrations_form_id_foreign` (`form_id`);

--
-- فهارس للجدول `registration_forms`
--
ALTER TABLE `registration_forms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_forms_form_key_unique` (`form_key`);

--
-- فهارس للجدول `report_files`
--
ALTER TABLE `report_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_files_report_id_foreign` (`report_id`);

--
-- فهارس للجدول `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `site_settings_key_unique` (`key`);

--
-- فهارس للجدول `site_state`
--
ALTER TABLE `site_state`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `state_key` (`state_key`);

--
-- فهارس للجدول `social_links`
--
ALTER TABLE `social_links`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `stats`
--
ALTER TABLE `stats`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_questions_survey_id_foreign` (`survey_id`);

--
-- فهارس للجدول `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_responses_survey_id_foreign` (`survey_id`);

--
-- فهارس للجدول `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`);

--
-- فهارس للجدول `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `analysis_reports`
--
ALTER TABLE `analysis_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `board_decisions`
--
ALTER TABLE `board_decisions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `decision_files`
--
ALTER TABLE `decision_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `footer_links`
--
ALTER TABLE `footer_links`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `form_entries`
--
ALTER TABLE `form_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `nav_dropdown_items`
--
ALTER TABLE `nav_dropdown_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `nav_items`
--
ALTER TABLE `nav_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_forms`
--
ALTER TABLE `registration_forms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `report_files`
--
ALTER TABLE `report_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `site_state`
--
ALTER TABLE `site_state`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `social_links`
--
ALTER TABLE `social_links`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stats`
--
ALTER TABLE `stats`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `surveys`
--
ALTER TABLE `surveys`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `survey_questions`
--
ALTER TABLE `survey_questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `survey_responses`
--
ALTER TABLE `survey_responses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- القيود المفروضة على الجداول الملقاة
--

--
-- قيود الجداول `analysis_reports`
--
ALTER TABLE `analysis_reports`
  ADD CONSTRAINT `analysis_reports_related_survey_id_foreign` FOREIGN KEY (`related_survey_id`) REFERENCES `surveys` (`id`) ON DELETE SET NULL;

--
-- قيود الجداول `decision_files`
--
ALTER TABLE `decision_files`
  ADD CONSTRAINT `decision_files_decision_id_foreign` FOREIGN KEY (`decision_id`) REFERENCES `board_decisions` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- قيود الجداول `nav_dropdown_items`
--
ALTER TABLE `nav_dropdown_items`
  ADD CONSTRAINT `nav_dropdown_items_nav_item_id_foreign` FOREIGN KEY (`nav_item_id`) REFERENCES `nav_items` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_form_id_foreign` FOREIGN KEY (`form_id`) REFERENCES `registration_forms` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `report_files`
--
ALTER TABLE `report_files`
  ADD CONSTRAINT `report_files_report_id_foreign` FOREIGN KEY (`report_id`) REFERENCES `analysis_reports` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD CONSTRAINT `survey_questions_survey_id_foreign` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD CONSTRAINT `survey_responses_survey_id_foreign` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
