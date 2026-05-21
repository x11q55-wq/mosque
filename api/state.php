<?php
/**
 * api/state.php — حفظ وقراءة حالة الموقع
 * ════════════════════════════════════════
 * النسخة الآمنة النهائية
 * يتحقق من X-CMS-Token header + PHP SESSION + Cookie
 * تاريخ الإصلاح: 2026
 */
require_once dirname(__DIR__) . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CMS-Token');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ════════════════════════════════════════════════════════════
// التحقق من الصلاحية — 3 طرق متوازية
// ════════════════════════════════════════════════════════════
function isAuthorized(): bool {

    // ── 1. PHP SESSION (نظام admin القديم) ──────────────────
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!empty($_SESSION['admin_id']))     return true;
    if (!empty($_SESSION['cms_admin_id'])) return true;

    // ── 2. X-CMS-Token Header (الطريقة الجديدة من JS) ───────
    $header_token = $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    if (!empty($header_token)) {
        if (validateToken($header_token)) return true;
    }

    // ── 3. Cookie cms_token (احتياطي) ───────────────────────
    $cookie_token = !empty($_COOKIE['cms_token'])
        ? urldecode($_COOKIE['cms_token'])
        : '';
    if (!empty($cookie_token)) {
        if (validateToken($cookie_token)) return true;
    }

    return false;
}

// ── التحقق من صحة التوكن في DB ──────────────────────────────
function validateToken(string $token): bool {
    if (empty($token)) return false;

    try {
        $parts = explode('|', base64_decode($token));
        $uid   = (int)($parts[0] ?? 0);
        if ($uid < 1) return false;

        // جرّب cms_users (النظام الجديد لـ cms_auth.php)
        try {
            $stmt = getDB()->prepare(
                "SELECT id FROM cms_users
                 WHERE id = ? AND active_token = ? AND token_expires > NOW()
                 LIMIT 1"
            );
            $stmt->execute([$uid, $token]);
            if ($stmt->fetch()) return true;
        } catch (Throwable $e) {}

        // جرّب users (النظام القديم)
        try {
            $stmt = getDB()->prepare(
                "SELECT id FROM users
                 WHERE id = ? AND remember_token = ? AND is_active = 1
                 LIMIT 1"
            );
            $stmt->execute([$uid, $token]);
            if ($stmt->fetch()) return true;
        } catch (Throwable $e) {}

    } catch (Throwable $e) {}

    return false;
}

// ── إنشاء الجدول تلقائياً إن لم يكن موجوداً ─────────────────
try {
    dbExecute("CREATE TABLE IF NOT EXISTS `site_state` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `state_key` varchar(50) NOT NULL DEFAULT 'main',
        `state_json` longtext NOT NULL,
        `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `state_key` (`state_key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci", []);
} catch (Exception $e) {}

// ════════════════════════════════════════════════════════════
// GET: قراءة الحالة — متاحة للجميع
// ════════════════════════════════════════════════════════════
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $rows = dbQuery(
            "SELECT state_json, updated_at FROM site_state WHERE state_key='main' LIMIT 1"
        );
        if (!empty($rows)) {
            echo json_encode([
                'success'    => true,
                'data'       => json_decode($rows[0]['state_json'], true),
                'updated_at' => $rows[0]['updated_at'],
            ]);
        } else {
            echo json_encode(['success' => true, 'data' => null]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ════════════════════════════════════════════════════════════
// POST: حفظ الحالة — يتطلب مصادقة
// ════════════════════════════════════════════════════════════
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // التحقق من الصلاحية
    if (!isAuthorized()) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error'   => 'غير مصرح — يجب تسجيل الدخول أولاً',
        ]);
        exit;
    }

    // حد الحجم 5MB
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 5 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode([
            'success' => false,
            'error'   => 'حجم البيانات كبير جداً — الحد الأقصى 5MB',
        ]);
        exit;
    }

    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (!$data || !isset($data['S'])) {
        echo json_encode(['success' => false, 'error' => 'invalid data']);
        exit;
    }

    try {
        $json     = json_encode($data['S'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $existing = dbQuery("SELECT id FROM site_state WHERE state_key='main' LIMIT 1");

        if (!empty($existing)) {
            dbExecute(
                "UPDATE site_state SET state_json=? WHERE state_key='main'",
                [$json]
            );
        } else {
            dbExecute(
                "INSERT INTO site_state (state_key, state_json) VALUES ('main',?)",
                [$json]
            );
        }
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}
