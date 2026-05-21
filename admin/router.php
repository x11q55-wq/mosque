<?php
/**
 * admin/router.php
 */

$admin_path = trim(str_replace('admin', '', $path), '/');

switch ($admin_path) {

    case '':
    case 'dashboard':
        requireLogin();
        // لوحة التحكم = الصفحة الرئيسية (مع إظهار CMS)
        header('Location: /mosque/');
        exit;

    case 'login':
        if (isLoggedIn()) {
            header('Location: /mosque/');
            exit;
        }
        require_once BASE_PATH . '/admin/views/login.php';
        break;

    case 'logout':
        session_destroy();
        header('Location: /mosque/admin/login');
        exit;

    default:
        header('Location: /mosque/admin/login');
        exit;
}
