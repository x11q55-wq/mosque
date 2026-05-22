<?php
/**
 * جمعية رفد المساجد للعناية بالمساجد — index.php
 * مُعدَّل للمسار /mosque/
 * ═══════════════════════════════════════
 * الإصلاحات الأمنية المُطبَّقة:
 * [1] إيقاف display_errors في production
 * [2] حذف صفحة /test المكشوفة
 * [3] مصادقة إلزامية على POST /api/state.php
 * [4] حد أقصى لحجم JSON body (512 KB)
 * [5] رسائل خطأ عامة — لا تسريب لتفاصيل DB
 * [6] Rate limiting على حفظ الـ state
 * [7] SameSite=Strict على session cookie
 * [8] Security Headers شاملة
 * ═══════════════════════════════════════
 */

// ── [1] إخفاء الأخطاء في production ─────────────────────
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);
ini_set('log_errors', 1); // الأخطاء تُسجَّل في error_log فقط

// ── المسار الجذري ────────────────────────────────────────
define('BASE_PATH', __DIR__);
define('VERSION', '2.0.0');
date_default_timezone_set('Asia/Riyadh');

// ── [7] إعداد الجلسة بشكل آمن ───────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/mosque/',
        'secure'   => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

// ── [8] Security Headers ─────────────────────────────────
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// ── تحميل الإعدادات ──────────────────────────────────────
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/config/helpers.php';

// ── المسار المطلوب ────────────────────────────────────────
$uri  = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
// تنظيف: إزالة /mosque ومنع path traversal بإزالة ..
$path = trim(str_replace('/mosque', '', $uri), '/');
$path = preg_replace('/\.\.+/', '', $path);
$path = trim(preg_replace('/\/+/', '/', $path), '/');

// ── استثناء مبكر: /admin يُوجَّه فوراً ──────────────────
if (str_contains($uri, '/admin')) {
    require_once BASE_PATH . '/admin/router.php';
    exit;
}

// ── [2] صفحة /test محذوفة نهائياً لأسباب أمنية ──────────
// كانت تكشف: BASE_PATH، أسماء الملفات، جداول DB

// ── API ───────────────────────────────────────────────────
if (str_starts_with($path, 'api')) {
    header('Content-Type: application/json; charset=utf-8');

    // ── معالجة مباشرة لـ api/state.php ──────────────────
    if ($path === 'api/state.php' || $path === 'api/state') {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // GET: قراءة site_state (مفتوح للجميع — البيانات عامة)
        if ($method === 'GET') {
            try {
                $row = getDB()
                    ->query("SELECT state_json FROM site_state WHERE state_key='main' LIMIT 1")
                    ->fetch(PDO::FETCH_ASSOC);

                if ($row && $row['state_json']) {
                    $data = json_decode($row['state_json'], true);
                    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(['success' => true, 'data' => null]);
                }
            } catch (Throwable $e) {
                // [5] رسالة عامة — لا تفاصيل DB
                error_log('state GET: ' . $e->getMessage());
                echo json_encode(['success' => false, 'error' => 'خطأ في قراءة البيانات']);
            }
            exit;
        }

        // POST: حفظ site_state — يتطلب مصادقة
        if ($method === 'POST') {

            // ── [3] فحص المصادقة أولاً ───────────────────
            if (!_isStateWriteAuthorized()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'غير مصرح — يجب تسجيل الدخول']);
                exit;
            }

            // ── [4] حد أقصى 512 KB ───────────────────────
            $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
            if ($contentLength > 524288) {
                http_response_code(413);
                echo json_encode(['success' => false, 'error' => 'حجم البيانات كبير جداً']);
                exit;
            }

            $raw = file_get_contents('php://input', false, null, 0, 524288);
            if ($raw === false || strlen($raw) === 0) {
                echo json_encode(['success' => false, 'error' => 'لا توجد بيانات']);
                exit;
            }

            $body = json_decode($raw, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode(['success' => false, 'error' => 'بيانات JSON غير صالحة']);
                exit;
            }

            // يقبل: {key,data} أو {S}
            $stateData = $body['data'] ?? $body['S'] ?? null;

            if ($stateData === null || !is_array($stateData)) {
                echo json_encode(['success' => false, 'error' => 'لا توجد بيانات للحفظ']);
                exit;
            }

            // ── [6] Rate Limiting ─────────────────────────
            if (!_checkStateRateLimit()) {
                http_response_code(429);
                echo json_encode(['success' => false, 'error' => 'طلبات كثيرة — انتظر لحظة']);
                exit;
            }

            try {
                $json = json_encode($stateData, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
                $db   = getDB();

                $exists = $db->query("SELECT COUNT(*) FROM site_state WHERE state_key='main'")->fetchColumn();
                if ($exists) {
                    $db->prepare("UPDATE site_state SET state_json=?, updated_at=NOW() WHERE state_key='main'")
                       ->execute([$json]);
                } else {
                    $db->prepare("INSERT INTO site_state (state_key, state_json, updated_at) VALUES ('main', ?, NOW())")
                       ->execute([$json]);
                }
                echo json_encode(['success' => true, 'message' => 'تم الحفظ'], JSON_UNESCAPED_UNICODE);

            } catch (Throwable $e) {
                // [5] رسالة عامة — لا تفاصيل DB
                error_log('state POST: ' . $e->getMessage());
                echo json_encode(['success' => false, 'error' => 'خطأ في حفظ البيانات']);
            }
            exit;
        }

        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'method not allowed']);
        exit;
    }
    // ── نهاية معالجة state.php ──

    require_once BASE_PATH . '/api/router.php';
    exit;
}

// ── Admin ─────────────────────────────────────────────────
if (str_starts_with($path, 'admin')) {
    require_once BASE_PATH . '/admin/router.php';
    exit;
}

// ── الصفحة الرئيسية ───────────────────────────────────────
$_IS_CMS_ADMIN = (
    (!empty($_SESSION['admin_id'])     && ($_SESSION['admin_role']     ?? '') === 'admin') ||
    (!empty($_SESSION['cms_admin_id']) && ($_SESSION['cms_admin_role'] ?? '') === 'admin') ||
    (!empty($_COOKIE['cms_token'])     && _verifyCmsToken($_COOKIE['cms_token']))
);
require_once BASE_PATH . '/views/site.php';


/* ══════════════════════════════════════════════════════════
   دوال مساعدة أمنية — خاصة بهذا الملف
══════════════════════════════════════════════════════════ */

/**
 * [3] التحقق من صلاحية الكتابة على site_state
 * يدعم: session PHP القديمة + cms_token cookie الجديد
 */
function _isStateWriteAuthorized(): bool
{
    // session PHP القديمة
    if (!empty($_SESSION['admin_id']) && ($_SESSION['admin_role'] ?? '') === 'admin') {
        return true;
    }
    if (!empty($_SESSION['cms_admin_id']) && ($_SESSION['cms_admin_role'] ?? '') === 'admin') {
        return true;
    }

    // cms_token cookie
    if (!empty($_COOKIE['cms_token'])) {
        return _verifyCmsToken($_COOKIE['cms_token']);
    }

    // Authorization header (اختياري — للطلبات البرمجية)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!empty($authHeader) && str_starts_with($authHeader, 'Bearer ')) {
        return _verifyCmsToken(substr($authHeader, 7));
    }

    return false;
}

/**
 * [3] التحقق من cms_token — صالح فقط إذا موجود في DB وغير منتهٍ
 */
function _verifyCmsToken(string $rawToken): bool
{
    if (empty($rawToken) || strlen($rawToken) > 2048) {
        return false;
    }

    try {
        $token   = urldecode($rawToken);
        $decoded = base64_decode($token, true);
        if ($decoded === false) return false;

        $parts = explode('|', $decoded);
        if (count($parts) !== 3) return false;

        $uid = (int)$parts[0];
        if ($uid <= 0) return false;

        $db = getDB();

        // نجرب جدول cms_users أولاً ثم users
        foreach (['cms_users', 'users'] as $table) {
            try {
                $hasCols = $db->query("SHOW COLUMNS FROM `$table` LIKE 'active_token'")->fetchAll();
                if (empty($hasCols)) continue;

                $stmt = $db->prepare(
                    "SELECT role FROM `$table`
                     WHERE id = ? AND active_token = ? AND token_expires > NOW()
                     LIMIT 1"
                );
                $stmt->execute([$uid, $token]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($row && in_array($row['role'], ['admin', 'editor'], true)) {
                    return true;
                }
            } catch (Throwable $e) {
                continue;
            }
        }
    } catch (Throwable $e) {
        error_log('token verify: ' . $e->getMessage());
    }

    return false;
}

/**
 * [6] Rate limiting بسيط: حد 30 طلب/دقيقة لكل IP
 * يعمل مع APCu — إذا غير متوفر يسمح بالطلب تلقائياً
 */
function _checkStateRateLimit(): bool
{
    if (!function_exists('apcu_fetch')) {
        return true; // APCu غير متوفر → نسمح ولا نُوقف الموقع
    }

    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'rl_state_' . md5($ip);
    $max = 30;
    $ttl = 60;

    $count = apcu_fetch($key);
    if ($count === false) {
        apcu_store($key, 1, $ttl);
        return true;
    }
    if ((int)$count >= $max) {
        return false;
    }
    apcu_inc($key);
    return true;
}
