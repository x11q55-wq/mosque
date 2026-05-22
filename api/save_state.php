<?php
/**
 * api/save_state.php
 * حفظ كامل إعدادات الموقع في قاعدة البيانات
 */
require_once dirname(__DIR__) . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');
$allowed_origins = ['https://mnassat.com', 'https://www.mnassat.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'https://mnassat.com'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CMS-Token, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); exit;
}

// نقطة قديمة للتوافق فقط. الحفظ الفعلي يستخدم api/state.php.
session_start();
function legacyTokenValid(): bool {
    $token = $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    if (!$token && !empty($_SERVER['HTTP_AUTHORIZATION']) && stripos($_SERVER['HTTP_AUTHORIZATION'], 'Bearer ') === 0) {
        $token = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
    }
    if (!$token || strlen($token) > 2048) return false;
    $decoded = base64_decode($token, true);
    if ($decoded === false) return false;
    $parts = explode('|', $decoded);
    $uid = (int)($parts[0] ?? 0);
    if ($uid < 1) return false;
    try {
        $stmt = getDB()->prepare("SELECT id FROM cms_users WHERE id=? AND active_token=? AND token_expires > NOW() AND is_active=1 LIMIT 1");
        $stmt->execute([$uid, $token]);
        return (bool)$stmt->fetch();
    } catch (Throwable $e) { return false; }
}
$isAdmin = !empty($_SESSION['admin_id']) || !empty($_SESSION['cms_admin_id']) || legacyTokenValid();

// GET: جلب الحالة
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $rows = dbQuery("SELECT state_json, updated_at FROM site_state WHERE state_key='main' LIMIT 1");
        if (!empty($rows)) {
            echo json_encode([
                'success' => true,
                'data' => json_decode($rows[0]['state_json'], true),
                'updated_at' => $rows[0]['updated_at']
            ]);
        } else {
            echo json_encode(['success' => true, 'data' => null]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// POST: حفظ الحالة
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'غير مصرح']);
        exit;
    }

    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (!$data || !isset($data['S'])) {
        echo json_encode(['success' => false, 'error' => 'بيانات غير صالحة']);
        exit;
    }

    try {
        $stateJson = json_encode($data['S'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $updatedBy = $_SESSION['user_email'] ?? 'admin';

        // INSERT or UPDATE
        $existing = dbQuery("SELECT id FROM site_state WHERE state_key='main' LIMIT 1");
        if (!empty($existing)) {
            dbExecute(
                "UPDATE site_state SET state_json=?, updated_by=? WHERE state_key='main'",
                [$stateJson, $updatedBy]
            );
        } else {
            dbExecute(
                "INSERT INTO site_state (state_key, state_json, updated_by) VALUES ('main', ?, ?)",
                [$stateJson, $updatedBy]
            );
        }

        echo json_encode(['success' => true, 'message' => 'تم الحفظ بنجاح']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
