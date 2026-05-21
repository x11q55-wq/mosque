<?php
/**
 * api/save_state.php
 * حفظ كامل إعدادات الموقع في قاعدة البيانات
 */
require_once dirname(__DIR__) . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); exit;
}

// التحقق من الجلسة
session_start();
$isAdmin = isset($_SESSION['user_id']) || isset($_SESSION['admin']);

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
