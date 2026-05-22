<?php
/**
 * api/upload_file.php
 * رفع ملف PDF أو صورة للمشرفين فقط وإعادة رابطه.
 */
require_once dirname(__DIR__) . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');
$allowed_origins = ['https://mnassat.com', 'https://www.mnassat.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'https://mnassat.com'));
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CMS-Token, Authorization');
header('Access-Control-Allow-Credentials: true');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

function uploadJson(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function uploadTokenUser(string $token): ?array {
    if ($token === '' || strlen($token) > 2048) return null;
    $decoded = base64_decode($token, true);
    if ($decoded === false) return null;
    $parts = explode('|', $decoded);
    $uid = (int)($parts[0] ?? 0);
    if ($uid < 1) return null;
    try {
        $stmt = getDB()->prepare("SELECT id, role FROM cms_users WHERE id=? AND active_token=? AND token_expires > NOW() AND is_active=1 LIMIT 1");
        $stmt->execute([$uid, $token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    } catch (Throwable $e) { return null; }
}

function uploadIsAuthorized(): bool {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!empty($_SESSION['admin_id']) || !empty($_SESSION['cms_admin_id'])) return true;
    $token = $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    if (!$token && !empty($_SERVER['HTTP_AUTHORIZATION']) && stripos($_SERVER['HTTP_AUTHORIZATION'], 'Bearer ') === 0) {
        $token = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
    }
    $user = uploadTokenUser(trim($token));
    return $user && in_array($user['role'] ?? '', ['admin', 'limited'], true);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') uploadJson(['success'=>false,'error'=>'POST only'], 405);
if (!uploadIsAuthorized()) uploadJson(['success'=>false,'error'=>'غير مصرح — يجب تسجيل الدخول'], 403);
if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) uploadJson(['success'=>false,'error'=>'no file'], 400);

$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) uploadJson(['success'=>false,'error'=>'فشل الرفع'], 400);
if (($file['size'] ?? 0) > 10 * 1024 * 1024) uploadJson(['success'=>false,'error'=>'حجم الملف يتجاوز 10MB'], 413);

$allowed = [
    'application/pdf' => 'pdf',
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
if (!isset($allowed[$mime])) uploadJson(['success'=>false,'error'=>'نوع الملف غير مسموح'], 415);

$uploadDir = dirname(__DIR__) . '/uploads/';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) uploadJson(['success'=>false,'error'=>'تعذر إنشاء مجلد الرفع'], 500);

$original = pathinfo($file['name'] ?? 'file', PATHINFO_FILENAME);
$original = trim(preg_replace('/[^a-zA-Z0-9._-]/', '_', $original), '._-');
$original = $original !== '' ? substr($original, 0, 80) : 'file';
$name = time() . '_' . bin2hex(random_bytes(8)) . '_' . $original . '.' . $allowed[$mime];
$path = $uploadDir . $name;

if (!move_uploaded_file($file['tmp_name'], $path)) uploadJson(['success'=>false,'error'=>'فشل نقل الملف'], 500);
@chmod($path, 0644);
uploadJson(['success'=>true,'url'=>'/mosque/uploads/' . $name,'name'=>$file['name'],'mime'=>$mime]);
