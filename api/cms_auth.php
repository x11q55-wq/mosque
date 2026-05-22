<?php
/**
 * api/cms_auth.php
 * نظام مصادقة لوحة التحكم + إدارة المستخدمين + استعادة كلمة المرور
 */
header('Content-Type: application/json; charset=utf-8');
$allowed_origins = ['https://mnassat.com', 'https://www.mnassat.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'https://mnassat.com'));
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CMS-Token, Authorization');
header('Access-Control-Allow-Credentials: true');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

require_once dirname(__DIR__).'/config/database.php';

/* ──────────────────────────── إعداد الجدول ────────────────────────────── */
function ensureTable(){
    $db = getDB();
    $db->exec("CREATE TABLE IF NOT EXISTS `cms_users` (
        `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `name`          VARCHAR(200) NOT NULL,
        `email`         VARCHAR(200) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `role`          ENUM('admin','limited') DEFAULT 'limited',
        `tabs`          TEXT DEFAULT '[]',
        `active_token`  VARCHAR(300) DEFAULT NULL,
        `token_expires` DATETIME DEFAULT NULL,
        `is_active`     TINYINT(1) DEFAULT 1,
        `last_login`    DATETIME DEFAULT NULL,
        `reset_token`   VARCHAR(100) DEFAULT NULL,
        `reset_expires` DATETIME DEFAULT NULL,
        `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    /* أضف عمود active_token إن لم يكن موجوداً في جداول قديمة */
    try { $db->exec("ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS `active_token` VARCHAR(300) DEFAULT NULL"); } catch(Throwable $e){}
    try { $db->exec("ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS `token_expires` DATETIME DEFAULT NULL"); } catch(Throwable $e){}
    try { $db->exec("ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS `is_active` TINYINT(1) DEFAULT 1"); } catch(Throwable $e){}
    try { $db->exec("ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS `last_login` DATETIME DEFAULT NULL"); } catch(Throwable $e){}

    // لا ننشئ حساب مدير افتراضي بكلمة ثابتة. إنشاء المستخدمين يتم يدوياً من قاعدة البيانات أو عبر مدير قائم.
}

/* ──────────────────────────── توليد Token ────────────────────────────── */
function generateToken($userId){
    return base64_encode($userId.'|'.time().'|'.bin2hex(random_bytes(16)));
}
function decodeToken($token){
    $decoded = base64_decode((string)$token, true);
    if ($decoded === false) return null;
    $parts = explode('|', $decoded);
    return count($parts)===3 ? $parts : null;
}

function requestToken(array $input): string {
    $header = $_SERVER['HTTP_X_CMS_TOKEN'] ?? '';
    if (!$header && !empty($_SERVER['HTTP_AUTHORIZATION']) && stripos($_SERVER['HTTP_AUTHORIZATION'], 'Bearer ') === 0) {
        $header = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
    }
    return trim($header ?: ($input['token'] ?? ''));
}

function cmsUserFromToken(string $token): ?array {
    if ($token === '' || strlen($token) > 2048) return null;
    $parts = decodeToken($token);
    if (!$parts) return null;
    $userId = (int)$parts[0];
    if ($userId < 1) return null;
    $stmt = getDB()->prepare("SELECT * FROM cms_users WHERE id=? AND active_token=? AND token_expires > NOW() AND is_active=1 LIMIT 1");
    $stmt->execute([$userId, $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
}

function requireCmsAdmin(array $input): array {
    $user = cmsUserFromToken(requestToken($input));
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['success'=>false,'error'=>'غير مصرح — صلاحية المدير مطلوبة']);
        exit;
    }
    return $user;
}

/* ──────────────────────────── إرسال الإيميل ────────────────────────────── */
function sendResetEmail($email, $name, $token){
    $resetLink = 'https://mnassat.com/mosque/api/cms_auth.php?action=reset_form&token='.urlencode($token);
    $subject   = 'إعادة تعيين كلمة مرور لوحة التحكم';
    $message   = "السلام عليكم $name،\n\n"
               . "تم طلب إعادة تعيين كلمة المرور للوحة التحكم.\n"
               . "اضغط على الرابط التالي لإعادة التعيين (صالح لمدة ساعة):\n\n"
               . $resetLink . "\n\n"
               . "إذا لم تطلب هذا، تجاهل هذا البريد.\n\n"
               . "جمعية رفد المساجد للعناية بالمساجد";
    $headers   = "From: noreply@mnassat.com\r\nContent-Type: text/plain; charset=UTF-8\r\nX-Mailer: PHP";
    return mail($email, '=?UTF-8?B?'.base64_encode($subject).'?=', $message, $headers);
}

/* ──────────────────────────── استعادة كلمة المرور (نموذج) ────────────────────────────── */
if(isset($_GET['action']) && $_GET['action']==='reset_form'){
    $token = $_GET['token']??'';
    ensureTable();
    $db = getDB();
    $user = $db->prepare("SELECT * FROM cms_users WHERE reset_token=? AND reset_expires > NOW() LIMIT 1");
    $user->execute([$token]);
    $u = $user->fetch(PDO::FETCH_ASSOC);
    if(!$u){ die('<html><body dir="rtl" style="font-family:Tajawal,Arial;padding:40px;background:#f5f5f5;"><div style="background:#fff;border-radius:12px;padding:30px;max-width:400px;margin:auto;"><h2 style="color:#dc2626;">❌ رابط غير صالح</h2><p>الرابط منتهي الصلاحية أو غير صحيح.</p></div></body></html>'); }
    if($_SERVER['REQUEST_METHOD']==='POST'){
        $newPass = $_POST['password']??'';
        $confirm = $_POST['confirm']??'';
        if(strlen($newPass)<6){ $err='كلمة المرور يجب أن تكون 6 أحرف على الأقل'; }
        elseif($newPass!==$confirm){ $err='كلمة المرور وتأكيدها غير متطابقان'; }
        else {
            $hash = password_hash($newPass, PASSWORD_BCRYPT);
            $db->prepare("UPDATE cms_users SET password_hash=?,reset_token=NULL,reset_expires=NULL WHERE id=?")->execute([$hash,$u['id']]);
            die('<html><body dir="rtl" style="font-family:Tajawal,Arial;padding:40px;background:#f5f5f5;"><div style="background:#fff;border-radius:12px;padding:30px;max-width:400px;margin:auto;text-align:center;"><h2 style="color:#0f3d26;">✅ تم تغيير كلمة المرور</h2><p>يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p><script>setTimeout(function(){window.location="/mosque/";},3000);</script></div></body></html>');
        }
    }
    echo '<html><head><meta charset="UTF-8"><title>إعادة تعيين كلمة المرور</title><style>*{box-sizing:border-box}body{font-family:Tajawal,Arial;padding:40px;background:#f5f5f5;direction:rtl}.box{background:#fff;border-radius:12px;padding:30px;max-width:400px;margin:auto}h2{color:#0f3d26}input{width:100%;border:1.5px solid #e5e7eb;border-radius:8px;padding:10px;font-size:14px;margin-bottom:12px;font-family:Tajawal}button{width:100%;background:#0f3d26;color:#fff;border:none;border-radius:8px;padding:12px;font-size:15px;cursor:pointer;font-family:Tajawal}.err{color:#dc2626;margin-bottom:10px}</style></head><body>';
    echo '<div class="box"><h2>🔑 إعادة تعيين كلمة المرور</h2>';
    if(isset($err)) echo '<p class="err">❌ '.$err.'</p>';
    echo '<form method="POST"><input type="password" name="password" placeholder="كلمة المرور الجديدة" required minlength="6">';
    echo '<input type="password" name="confirm" placeholder="تأكيد كلمة المرور" required>';
    echo '<button type="submit">حفظ كلمة المرور الجديدة</button></form></div></body></html>';
    exit;
}

/* ──────────────────────────── API الرئيسي ────────────────────────────── */
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? '';

ensureTable();
$db = getDB();

switch($action){

    /* ── تسجيل الدخول ── */
    case 'login':
        $email    = trim($input['email']??'');
        $password = $input['password']??'';
        if(!$email||!$password){ echo json_encode(['success'=>false,'error'=>'أدخل البريد وكلمة المرور']); exit; }
        $stmt = $db->prepare("SELECT * FROM cms_users WHERE email=? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if(!$user||!password_verify($password,$user['password_hash'])){
            echo json_encode(['success'=>false,'error'=>'بيانات الدخول غير صحيحة']); exit;
        }
        $token   = generateToken($user['id']);
        $expires = date('Y-m-d H:i:s', time() + 86400 * 30);
        /* حفظ الـ token في قاعدة البيانات */
        $db->prepare("UPDATE cms_users SET active_token=?, token_expires=?, last_login=NOW() WHERE id=?")
           ->execute([$token, $expires, $user['id']]);
        $tabs = json_decode($user['tabs']??'[]',true);
        echo json_encode(['success'=>true,'user'=>[
            'id'=>$user['id'], 'name'=>$user['name'], 'email'=>$user['email'],
            'role'=>$user['role'], 'tabs'=>$tabs, 'token'=>$token
        ]]);
        break;

    /* ── التحقق من التوكن ── */
    case 'verify':
        $token = requestToken($input);
        $user = cmsUserFromToken($token);
        if(!$user){ echo json_encode(['success'=>false]); exit; }
        $tabs = json_decode($user['tabs']??'[]',true);
        echo json_encode(['success'=>true,'user'=>[
            'id'=>$user['id'], 'name'=>$user['name'], 'email'=>$user['email'],
            'role'=>$user['role'], 'tabs'=>$tabs, 'token'=>$token
        ]]);
        break;

    /* ── نسيت كلمة المرور ── */
    case 'forgot':
        $email = trim($input['email']??'');
        $stmt = $db->prepare("SELECT * FROM cms_users WHERE email=? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if(!$user){ echo json_encode(['success'=>true,'sent'=>false]); exit; }
        $token   = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time()+3600);
        $db->prepare("UPDATE cms_users SET reset_token=?,reset_expires=? WHERE id=?")->execute([$token,$expires,$user['id']]);
        $sent = sendResetEmail($user['email'],$user['name'],$token);
        echo json_encode(['success'=>true,'sent'=>$sent]);
        break;

    /* ── إنشاء مستخدم جديد ── */
    case 'create_user':
        requireCmsAdmin($input);
        $email    = trim($input['email']??'');
        $name     = trim($input['name']??'');
        $password = $input['password']??bin2hex(random_bytes(8));
        $role     = in_array($input['role']??'',['admin','limited'])?$input['role']:'limited';
        $tabs     = json_encode($input['tabs']??[]);
        if(!$email||!$name){ echo json_encode(['success'=>false,'error'=>'أدخل الاسم والبريد']); exit; }
        $hash = password_hash($password, PASSWORD_BCRYPT);
        try {
            $db->prepare("INSERT INTO cms_users (name,email,password_hash,role,tabs) VALUES (?,?,?,?,?)")
               ->execute([$name,$email,$hash,$role,$tabs]);
            /* إرسال بيانات الدخول للمستخدم الجديد */
            $subject = 'بيانات دخول لوحة التحكم';
            $msg = "مرحباً $name،\n\nتم إنشاء حسابك في لوحة التحكم.\n\nالبريد: $email\nكلمة المرور: $password\n\nhttps://mnassat.com/mosque/\n\nيُرجى تغيير كلمة المرور عند أول دخول.\n\nجمعية رفد المساجد للعناية بالمساجد";
            mail($email,'=?UTF-8?B?'.base64_encode($subject).'?=',$msg,"From: noreply@mnassat.com\r\nContent-Type: text/plain; charset=UTF-8");
            echo json_encode(['success'=>true]);
        } catch(Exception $e){
            echo json_encode(['success'=>false,'error'=>'البريد مسجل مسبقاً']);
        }
        break;

    /* ── حذف مستخدم ── */
    case 'delete_user':
        $admin = requireCmsAdmin($input);
        $email = trim($input['email']??'');
        if ($email === ($admin['email'] ?? '')) { echo json_encode(['success'=>false,'error'=>'لا يمكن حذف حسابك الحالي']); break; }
        $db->prepare("DELETE FROM cms_users WHERE email=? AND role <> 'admin'")->execute([$email]);
        echo json_encode(['success'=>true]);
        break;

    /* ── تحديث التبويبات ── */
    case 'update_tabs':
        requireCmsAdmin($input);
        $email = trim($input['email']??'');
        $tabs  = json_encode($input['tabs']??[]);
        $db->prepare("UPDATE cms_users SET tabs=? WHERE email=?")->execute([$tabs,$email]);
        echo json_encode(['success'=>true]);
        break;

    default:
        echo json_encode(['success'=>false,'error'=>'unknown action']);
}
