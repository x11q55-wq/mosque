<?php
/**
 * الدوال المساعدة العامة
 */

// ─── أمان وتنقية المدخلات ─────────────────────────────────
function sanitize($value): string {
    return htmlspecialchars(trim((string)$value), ENT_QUOTES, 'UTF-8');
}

function sanitizeInt($value): int {
    return (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
}

function sanitizeEmail($value): string {
    return filter_var(trim($value), FILTER_SANITIZE_EMAIL);
}

// ─── استجابة JSON ──────────────────────────────────────────
function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function jsonSuccess(string $message = 'تمت العملية بنجاح', array $data = []): void {
    jsonResponse(['success' => true, 'message' => $message, 'data' => $data]);
}

function jsonError(string $message, int $status = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $status);
}

// ─── رفع الملفات ───────────────────────────────────────────
function uploadFile(array $file, string $subFolder = 'uploads', array $allowedTypes = ['pdf','jpg','jpeg','png','webp']): ?string {
    if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedTypes)) {
        return null;
    }

    $maxSize = 10 * 1024 * 1024; // 10 MB
    if ($file['size'] > $maxSize) {
        return null;
    }

    $uploadDir = BASE_PATH . '/../storage/app/public/' . $subFolder . '/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $filename = uniqid('file_', true) . '.' . $ext;
    $destination = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return 'storage/' . $subFolder . '/' . $filename;
    }
    return null;
}

function getFileSize(string $path): string {
    $fullPath = BASE_PATH . '/' . ltrim($path, '/');
    if (!file_exists($fullPath)) return '';
    $bytes = filesize($fullPath);
    if ($bytes >= 1048576) return round($bytes / 1048576, 1) . ' MB';
    if ($bytes >= 1024) return round($bytes / 1024, 0) . ' KB';
    return $bytes . ' B';
}

function fileUrl(string $path): string {
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return 'https://' . $host . '/mosque/' . ltrim($path, '/');
}

// ─── المصادقة ──────────────────────────────────────────────
function isLoggedIn(): bool {
    return isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id']);
}

function requireLogin(): void {
    if (!isLoggedIn()) {
        header('Location: /admin/login');
        exit;
    }
}

function currentUser(): ?array {
    if (!isLoggedIn()) return null;
    return dbQueryOne("SELECT * FROM users WHERE id = ?", [$_SESSION['admin_id']]);
}

function hasRole(string $role): bool {
    $user = currentUser();
    if (!$user) return false;
    $roles = ['admin' => 3, 'editor' => 2, 'viewer' => 1];
    return ($roles[$user['role']] ?? 0) >= ($roles[$role] ?? 0);
}

// ─── CSRF Protection ──────────────────────────────────────
function csrfToken(): string {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrf(): bool {
    $token = $_POST['_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    return hash_equals($_SESSION['csrf_token'] ?? '', $token);
}

// ─── تحقق من IP و Rate Limiting ──────────────────────────
function getClientIP(): string {
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// ─── تنسيق التاريخ ────────────────────────────────────────
function formatDate(string $date): string {
    $months = ['01'=>'يناير','02'=>'فبراير','03'=>'مارس','04'=>'أبريل',
               '05'=>'مايو','06'=>'يونيو','07'=>'يوليو','08'=>'أغسطس',
               '09'=>'سبتمبر','10'=>'أكتوبر','11'=>'نوفمبر','12'=>'ديسمبر'];
    $parts = explode('-', $date);
    if (count($parts) !== 3) return $date;
    return $parts[2] . ' ' . ($months[$parts[1]] ?? '') . ' ' . $parts[0];
}
