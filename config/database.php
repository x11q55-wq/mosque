<?php
/**
 * إعدادات قاعدة البيانات
 * عدّل القيم الخمس أدناه بعد إنشاء قاعدة البيانات في cPanel
 */

function envValue(array $keys, string $default = ''): string {
    foreach ($keys as $key) {
        $value = getenv($key);
        if ($value !== false && $value !== '') {
            return $value;
        }
    }
    return $default;
}

define('DB_HOST', envValue(['DB_HOST'], 'localhost'));
define('DB_NAME', envValue(['DB_NAME', 'DB_DATABASE'], 'mosque'));
define('DB_USER', envValue(['DB_USER', 'DB_USERNAME'], 'mosque_user'));
define('DB_PASS', envValue(['DB_PASS', 'DB_PASSWORD'], ''));
define('DB_CHARSET', envValue(['DB_CHARSET'], 'utf8mb4'));

// ─── الاتصال بقاعدة البيانات ──────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ]);
        } catch (PDOException $e) {
            // في الإنتاج لا نعرض رسالة الخطأ للزائر
            error_log("DB Connection failed: " . $e->getMessage());
            http_response_code(503);
            die(json_encode(['error' => 'خدمة قاعدة البيانات غير متاحة مؤقتاً']));
        }
    }
    return $pdo;
}

// ─── دوال مساعدة لقاعدة البيانات ─────────────────────────
function dbQuery(string $sql, array $params = []): array {
    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function dbQueryOne(string $sql, array $params = []): ?array {
    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row ?: null;
}

function dbExecute(string $sql, array $params = []): int {
    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    return (int) getDB()->lastInsertId();
}

function dbUpdate(string $sql, array $params = []): bool {
    $stmt = getDB()->prepare($sql);
    return $stmt->execute($params);
}

function getSetting(string $key, string $default = ''): string {
    static $cache = [];
    if (!isset($cache[$key])) {
        $row = dbQueryOne("SELECT value FROM site_settings WHERE `key` = ?", [$key]);
        $cache[$key] = $row ? $row['value'] : $default;
    }
    return $cache[$key] ?? $default;
}

function getAllSettings(): array {
    $rows = dbQuery("SELECT `key`, value FROM site_settings");
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['key']] = $row['value'];
    }
    return $settings;
}
