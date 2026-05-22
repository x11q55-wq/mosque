<?php
/**
 * admin/views/login.php — صفحة دخول لوحة التحكم
 */
if (isLoggedIn()) {
    header('Location: /mosque/');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (function_exists('verifyCsrf') && !verifyCsrf()) {
        $error = 'انتهت صلاحية الجلسة، أعد المحاولة';
    }
    $email = sanitizeEmail($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';

    if (!$error && $email && $pass) {
        $user = dbQueryOne(
            "SELECT * FROM users WHERE email = ? AND is_active = 1",
            [$email]
        );
        if ($user && password_verify($pass, $user['password'])) {
            session_regenerate_id(true);
            $_SESSION['admin_id']   = $user['id'];
            $_SESSION['admin_role'] = $user['role'];
            $_SESSION['admin_name'] = $user['name'];
            dbUpdate("UPDATE users SET last_login = NOW() WHERE id = ?", [$user['id']]);
            header('Location: /mosque/');
            exit;
        }
        $error = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    } else {
        $error = 'يرجى إدخال البريد وكلمة المرور';
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>دخول لوحة التحكم — جمعية رفد المساجد للعناية بالمساجد</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Tajawal',Arial,sans-serif;background:#f5f1ea;min-height:100vh;display:flex;align-items:center;justify-content:center;direction:rtl}
.card{background:#fff;border-radius:16px;padding:40px;width:100%;max-width:420px;box-shadow:0 8px 32px rgba(15,61,38,.12)}
.logo{text-align:center;margin-bottom:28px}
.logo-icon{width:64px;height:64px;background:#0f3d26;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 12px}
.logo h1{font-size:18px;color:#0f3d26;font-weight:700}
.logo p{font-size:13px;color:#888;margin-top:4px}
.form-group{margin-bottom:18px}
.form-group label{display:block;font-size:13px;color:#444;font-weight:500;margin-bottom:6px}
.form-group input{width:100%;padding:11px 14px;border:1.5px solid #e0dbd1;border-radius:8px;font-size:14px;font-family:inherit;color:#111;transition:border .2s;background:#fafaf8}
.form-group input:focus{outline:none;border-color:#0f3d26;background:#fff}
.btn{width:100%;padding:13px;background:#0f3d26;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:background .2s;margin-top:4px}
.btn:hover{background:#1a5c3a}
.error{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:18px;text-align:center}
.back{text-align:center;margin-top:20px}
.back a{color:#888;font-size:13px;text-decoration:none}
.back a:hover{color:#0f3d26}
.divider{height:1px;background:#eee;margin:20px 0}
.hint{background:#e8f2ec;border-radius:8px;padding:12px 14px;font-size:12px;color:#0f3d26;margin-top:16px;line-height:1.8}
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <div class="logo-icon">🕌</div>
    <h1>جمعية رفد المساجد للعناية بالمساجد</h1>
    <p>لوحة تحكم المشرفين</p>
  </div>

  <?php if ($error): ?>
  <div class="error">⚠ <?= htmlspecialchars($error) ?></div>
  <?php endif; ?>

  <form method="POST" action="/mosque/admin/login">
    <input type="hidden" name="_token" value="<?= htmlspecialchars(csrfToken()) ?>">
    <div class="form-group">
      <label>البريد الإلكتروني</label>
      <input type="email" name="email" placeholder="admin@mosqueksa.org"
             value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required autofocus>
    </div>
    <div class="form-group">
      <label>كلمة المرور</label>
      <input type="password" name="password" placeholder="••••••••" required>
    </div>
    <button type="submit" class="btn">دخول ←</button>
  </form>

  <div class="hint">
    لحماية لوحة التحكم، لا تُعرض بيانات الدخول على هذه الصفحة. استخدم بيانات المدير المعتمدة لديك.
  </div>

  <div class="back">
    <a href="/mosque/">← العودة للموقع</a>
  </div>
</div>
</body>
</html>
