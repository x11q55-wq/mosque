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
$allowed_origins = ['https://mnassat.com', 'https://www.mnassat.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'https://mnassat.com'));
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CMS-Token, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ════════════════════════════════════════════════════════════
// التحقق من الصلاحية — جلسة PHP أو X-CMS-Token. لا نقبل cookie وحده في POST لتقليل CSRF.
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

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!empty($authHeader) && stripos($authHeader, 'Bearer ') === 0) {
        if (validateToken(substr($authHeader, 7))) return true;
    }

    return false;
}

// ── التحقق من صحة التوكن في DB ──────────────────────────────
function validateToken(string $token): bool {
    if (empty($token)) return false;

    try {
        $decoded = base64_decode($token, true);
        if ($decoded === false) return false;
        $parts = explode('|', $decoded);
        $uid   = (int)($parts[0] ?? 0);
        if ($uid < 1) return false;

        try {
            $stmt = getDB()->prepare(
                "SELECT id FROM cms_users
                 WHERE id = ? AND active_token = ? AND token_expires > NOW() AND is_active = 1
                 LIMIT 1"
            );
            $stmt->execute([$uid, $token]);
            if ($stmt->fetch()) return true;
        } catch (Throwable $e) {}

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

function sanitizeStateValue($value) {
    if (is_array($value)) {
        $clean = [];
        foreach ($value as $key => $item) {
            $cleanKey = is_string($key) ? substr(strip_tags($key), 0, 120) : $key;
            $clean[$cleanKey] = sanitizeStateValue($item);
        }
        return $clean;
    }
    if (is_string($value)) {
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
        $value = strip_tags($value);
        $value = preg_replace('/^\s*(javascript|data):/i', '', $value);
        return mb_substr($value, 0, 20000, 'UTF-8');
    }
    return $value;
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
        $cleanState = sanitizeStateValue($data['S']);
        $json     = json_encode($cleanState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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
