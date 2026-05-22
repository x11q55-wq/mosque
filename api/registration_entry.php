<?php
/**
 * api/registration_entry.php — نماذج التسجيل وإجابات الاستطلاعات
 * ════════════════════════════════════════════════════════════
 * النسخة الآمنة: مع Rate Limiting وحماية من الإرسال المتكرر
 * تاريخ الإصلاح: 2026
 */

require_once dirname(__DIR__) . '/config/database.php';

// ── رؤوس الاستجابة ──────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// ── CORS: مقيّد بدومين الموقع فقط ──────────────────────────
$allowed_origins = [
    'https://mnassat.com',
    'https://www.mnassat.com',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: https://mnassat.com');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CMS-Token, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── الحصول على IP الحقيقي ───────────────────────────────────
function getRealIP(): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    // دعم الخوادم خلف Proxy
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($parts[0]);
    }
    // التحقق من صحة IP
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

// ── Rate Limiting: منع الإرسال المتكرر ──────────────────────
function checkRateLimit(string $action): bool {
    $ip          = getRealIP();
    $ip_hash     = hash('sha256', $ip); // لا نخزن IP نصياً
    $cache_file  = sys_get_temp_dir() . '/mosque_rl_' . $action . '_' . $ip_hash . '.tmp';
    $window      = 60;   // ثانية
    $max_requests = 10;  // أقصى طلبات في النافذة

    $now = time();
    $requests = [];

    if (file_exists($cache_file)) {
        $data = @json_decode(file_get_contents($cache_file), true);
        if (is_array($data)) {
            // احتفظ فقط بالطلبات خلال النافذة الزمنية
            $requests = array_filter($data, fn($t) => ($now - $t) < $window);
        }
    }

    if (count($requests) >= $max_requests) {
        return false; // تجاوز الحد
    }

    $requests[] = $now;
    @file_put_contents($cache_file, json_encode(array_values($requests)), LOCK_EX);
    return true;
}

// ── التحقق من صلاحية المشرف ─────────────────────────────────
function isAdminUser(): bool {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!empty($_SESSION['admin_id']) || !empty($_SESSION['cms_admin_id'])) return true;

    $token = $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    if (!$token && !empty($_SERVER['HTTP_AUTHORIZATION']) && stripos($_SERVER['HTTP_AUTHORIZATION'], 'Bearer ') === 0) {
        $token = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
    }
    if (!$token && !empty($_COOKIE['cms_token'])) $token = urldecode($_COOKIE['cms_token']);
    if (!$token || strlen($token) > 2048) return false;

    try {
        $decoded = base64_decode($token, true);
        if ($decoded === false) return false;
        $parts = explode('|', $decoded);
        $uid = (int)($parts[0] ?? 0);
        if ($uid < 1) return false;

        try {
            $stmt = getDB()->prepare("SELECT id FROM cms_users WHERE id=? AND active_token=? AND token_expires > NOW() AND is_active=1 LIMIT 1");
            $stmt->execute([$uid, $token]);
            if ($stmt->fetch()) return true;
        } catch (Throwable $e) {}

        try {
            $stmt = getDB()->prepare("SELECT id FROM users WHERE id=? AND remember_token=? AND is_active=1 LIMIT 1");
            $stmt->execute([$uid, $token]);
            if ($stmt->fetch()) return true;
        } catch (Throwable $e) {}
    } catch (Throwable $e) {}
    return false;
}

// ── إنشاء الجدول إن لم يكن موجوداً ─────────────────────────
try {
    dbExecute("CREATE TABLE IF NOT EXISTS form_entries (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        form_key VARCHAR(191) NOT NULL,
        form_label VARCHAR(500) NOT NULL,
        data LONGTEXT,
        entry_data JSON,
        ip_address VARCHAR(45),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_form_key (form_key),
        INDEX idx_submitted (submitted_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", []);
} catch (Exception $e) {}

// ════════════════════════════════════════════════════════════
// POST: حفظ إجابة — متاح للعموم مع Rate Limiting
// ════════════════════════════════════════════════════════════
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // ── التحقق من حجم البيانات (حد 1MB) ────────────────────
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 1 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'البيانات كبيرة جداً — الحد الأقصى 1MB']);
        exit;
    }

    // ── Rate Limiting ────────────────────────────────────────
    if (!checkRateLimit('entry')) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error'   => 'الرجاء الانتظار قبل الإرسال مجدداً — تجاوزت الحد المسموح',
        ]);
        exit;
    }

    // ── قراءة البيانات ───────────────────────────────────────
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'بيانات غير صالحة']);
        exit;
    }

    $form_key   = trim(strip_tags($body['form_key']   ?? ''));
    $form_label = trim(strip_tags($body['form_label'] ?? $form_key));
    $data       = $body['data'] ?? [];

    if (!$form_key) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'مفتاح النموذج مطلوب']);
        exit;
    }

    // ── التحقق من البيانات ───────────────────────────────────
    if (!is_array($data) || empty($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'لا توجد بيانات للحفظ']);
        exit;
    }

    // ── تنظيف البيانات من أي HTML ────────────────────────────
    $clean_data = [];
    foreach ($data as $key => $value) {
        $clean_key = substr(strip_tags((string)$key), 0, 200);
        $clean_val = is_array($value)
            ? json_encode($value, JSON_UNESCAPED_UNICODE)
            : substr(strip_tags((string)$value), 0, 5000);
        $clean_data[$clean_key] = $clean_val;
    }

    $dataJson = json_encode($clean_data, JSON_UNESCAPED_UNICODE);
    $ip       = getRealIP();

    try {
        dbExecute(
            "INSERT INTO form_entries (form_key, form_label, data, entry_data, ip_address)
             VALUES (?, ?, ?, ?, ?)",
            [$form_key, $form_label, $dataJson, $dataJson, $ip]
        );
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'خطأ في حفظ البيانات']);
    }
    exit;
}

// ════════════════════════════════════════════════════════════
// GET: استرجاع الإجابات — يتطلب صلاحية مشرف
// ════════════════════════════════════════════════════════════
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // ── التحقق من الصلاحية للقراءة الإدارية ─────────────────
    // قراءة عامة (عدد الإجابات فقط) — للاستطلاعات
    $is_admin  = isAdminUser();
    $form_key  = urldecode($_GET['form_key'] ?? '');
    $page      = max(1, (int)($_GET['page'] ?? 1));
    $per_page  = (int)($_GET['per_page'] ?? 20);
    if ($per_page > 9999) $per_page = 9999;
    if (!$is_admin && $per_page > 100) $per_page = 100;
    $offset    = ($page - 1) * $per_page;

    // لا نكشف الردود التفصيلية للزوار. يسمح فقط بنتائج الاستطلاعات العامة التي تبدأ بـ survey_.
    if (!$is_admin && (empty($form_key) || strpos($form_key, 'survey_') !== 0)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'غير مصرح']);
        exit;
    }

    try {
        if ($form_key) {
            $rows  = dbQuery(
                "SELECT id, form_key, form_label, data, entry_data, submitted_at
                 FROM form_entries WHERE form_key=?
                 ORDER BY submitted_at DESC LIMIT ? OFFSET ?",
                [$form_key, $per_page, $offset]
            );
            $total = dbQuery(
                "SELECT COUNT(*) cnt FROM form_entries WHERE form_key=?",
                [$form_key]
            );
        } else {
            $rows  = dbQuery(
                "SELECT id, form_key, form_label, data, entry_data, submitted_at
                 FROM form_entries ORDER BY submitted_at DESC LIMIT ? OFFSET ?",
                [$per_page, $offset]
            );
            $total = dbQuery("SELECT COUNT(*) cnt FROM form_entries", []);
        }

        // إخفاء IP من الردود (خصوصية)
        foreach ($rows as &$r) {
            $raw = $r['entry_data'] ?? $r['data'] ?? '{}';
            $r['entry_data'] = is_string($raw)
                ? (json_decode($raw, true) ?? [])
                : ($raw ?? []);
            unset($r['data']);
        }

        echo json_encode([
            'success'  => true,
            'entries'  => $rows,
            'total'    => (int)($total[0]['cnt'] ?? 0),
            'page'     => $page,
            'per_page' => $per_page,
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'خطأ في قراءة البيانات']);
    }
    exit;
}

// ── طريقة غير مدعومة ────────────────────────────────────────
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'طريقة الطلب غير مدعومة']);
