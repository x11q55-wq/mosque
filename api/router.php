<?php
/**
 * API Router — يعالج جميع طلبات API
 * النسخة الآمنة: مع Rate Limiting على الشكاوى والنماذج
 * تاريخ الإصلاح: 2026
 */

$api_path = substr($path, 4); // remove 'api/'

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
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Rate Limiting مشترك ──────────────────────────────────────
function apiRateLimit(string $action, int $max = 10, int $window = 60): bool {
    $ip       = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip    = trim($parts[0]);
    }
    $ip       = filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    $hash     = hash('sha256', $ip);
    $file     = sys_get_temp_dir() . '/mosque_rl_' . $action . '_' . $hash . '.tmp';
    $now      = time();
    $requests = [];

    if (file_exists($file)) {
        $data = @json_decode(file_get_contents($file), true);
        if (is_array($data)) {
            $requests = array_filter($data, fn($t) => ($now - $t) < $window);
        }
    }
    if (count($requests) >= $max) return false;
    $requests[] = $now;
    @file_put_contents($file, json_encode(array_values($requests)), LOCK_EX);
    return true;
}

// ── توجيه طلبات API ──────────────────────────────────────────
switch ($api_path) {

    case 'site-data':
    case 'site-data/':
        handleSiteData();
        break;

    case 'survey-submit':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
        // Rate Limit: 5 إرسالات في الدقيقة لكل IP
        if (!apiRateLimit('survey', 5, 60)) {
            jsonError('الرجاء الانتظار قبل المشاركة مجدداً', 429);
        }
        handleSurveySubmit();
        break;

    case 'complaint-submit':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
        // Rate Limit: 3 شكاوى في الدقيقة لكل IP
        if (!apiRateLimit('complaint', 3, 60)) {
            jsonError('الرجاء الانتظار قبل الإرسال مجدداً', 429);
        }
        handleComplaintSubmit();
        break;

    case 'registration':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
        // Rate Limit: 5 تسجيلات في الدقيقة لكل IP
        if (!apiRateLimit('registration', 5, 60)) {
            jsonError('الرجاء الانتظار قبل الإرسال مجدداً', 429);
        }
        handleRegistration();
        break;

    case 'registration-entry':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
        if (!apiRateLimit('reg_entry', 10, 60)) {
            jsonError('الرجاء الانتظار قبل الإرسال مجدداً', 429);
        }
        handleRegistrationEntry();
        break;

    case 'registration-entries':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);
        handleGetRegistrationEntries();
        break;

    case 'admin/login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
        // Rate Limit صارم على تسجيل الدخول: 5 محاولات في الدقيقة
        if (!apiRateLimit('login', 5, 60)) {
            jsonError('تم تجاوز عدد محاولات تسجيل الدخول — انتظر دقيقة', 429);
        }
        handleAdminLogin();
        break;

    case 'admin/data':
        requireAdminAuth();
        handleAdminData();
        break;

    case 'admin/save':
        requireAdminAuth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
        handleAdminSave();
        break;

    case 'admin/upload':
        requireAdminAuth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
        handleAdminUpload();
        break;

    case 'admin/logout':
        session_destroy();
        jsonSuccess('تم تسجيل الخروج');
        break;

    default:
        jsonError('المسار غير موجود', 404);
}

// ══════════════════════════════════════════════════════════
// دوال المعالجة
// ══════════════════════════════════════════════════════════

function handleSiteData(): void {
    $data = [
        'settings'         => getAllSettings(),
        'achievements'     => dbQuery("SELECT * FROM achievements WHERE is_active=1 ORDER BY sort_order"),
        'stats'            => dbQuery("SELECT * FROM stats WHERE is_active=1 ORDER BY sort_order"),
        'projects'         => dbQuery("SELECT * FROM projects WHERE is_active=1 ORDER BY sort_order"),
        'partners'         => dbQuery("SELECT * FROM partners WHERE is_active=1 ORDER BY sort_order"),
        'news'             => dbQuery("SELECT * FROM news WHERE is_active=1 ORDER BY sort_order LIMIT 9"),
        'events'           => dbQuery("SELECT * FROM events WHERE is_active=1 ORDER BY sort_order LIMIT 6"),
        'testimonials'     => dbQuery("SELECT * FROM testimonials WHERE is_active=1 ORDER BY sort_order"),
        'surveys'          => dbQuery("SELECT s.*, (SELECT COUNT(*) FROM survey_questions WHERE survey_id=s.id) as questions_count FROM surveys s WHERE s.is_active=1 ORDER BY s.sort_order"),
        'survey_questions' => dbQuery("SELECT * FROM survey_questions ORDER BY survey_id, sort_order"),
        'analysis_reports' => dbQuery("SELECT ar.*, GROUP_CONCAT(rf.file_name SEPARATOR '|') as file_names, GROUP_CONCAT(rf.file_path SEPARATOR '|') as file_paths FROM analysis_reports ar LEFT JOIN report_files rf ON rf.report_id=ar.id WHERE ar.is_active=1 GROUP BY ar.id ORDER BY ar.sort_order"),
        'board_decisions'  => dbQuery("SELECT bd.*, GROUP_CONCAT(df.file_name SEPARATOR '|') as file_names, GROUP_CONCAT(df.file_path SEPARATOR '|') as file_paths FROM board_decisions bd LEFT JOIN decision_files df ON df.decision_id=bd.id WHERE bd.is_active=1 GROUP BY bd.id ORDER BY bd.sort_order"),
        'documents'        => dbQuery("SELECT * FROM documents WHERE is_active=1 ORDER BY sort_order"),
        'registration_forms' => dbQuery("SELECT * FROM registration_forms WHERE is_active=1 ORDER BY sort_order"),
        'social_links'     => dbQuery("SELECT * FROM social_links WHERE is_active=1 ORDER BY sort_order"),
        'footer_links'     => dbQuery("SELECT * FROM footer_links WHERE is_active=1 ORDER BY sort_order"),
        'nav_items'        => dbQuery("SELECT * FROM nav_items WHERE is_active=1 ORDER BY sort_order"),
        'nav_dropdown'     => dbQuery("SELECT * FROM nav_dropdown_items WHERE is_active=1 ORDER BY nav_item_id, sort_order"),
    ];

    foreach (['registration_forms'] as $key) {
        foreach ($data[$key] as &$row) {
            if (isset($row['fields'])) {
                $row['fields'] = json_decode($row['fields'], true) ?? [];
            }
        }
    }
    foreach ($data['survey_questions'] as &$row) {
        if (isset($row['options'])) {
            $row['options'] = json_decode($row['options'], true) ?? [];
        }
    }

    jsonResponse(['success' => true, 'data' => $data]);
}

function handleSurveySubmit(): void {
    // التحقق من حجم البيانات
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 512 * 1024) jsonError('البيانات كبيرة جداً', 413);

    $body     = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $surveyId = sanitizeInt($body['survey_id'] ?? 0);
    if (!$surveyId) jsonError('معرّف الاستطلاع مطلوب');

    $survey = dbQueryOne(
        "SELECT * FROM surveys WHERE id=? AND status='open' AND is_active=1",
        [$surveyId]
    );
    if (!$survey) jsonError('الاستطلاع غير متاح أو مغلق');

    $answers = $body['answers'] ?? [];
    $name    = sanitize($body['name'] ?? '');
    $phone   = sanitize($body['phone'] ?? '');

    dbExecute(
        "INSERT INTO survey_responses (survey_id, respondent_name, respondent_phone, ip_address, answers, submitted_at)
         VALUES (?, ?, ?, ?, ?, NOW())",
        [$surveyId, $name ?: null, $phone ?: null, getClientIP(),
         json_encode($answers, JSON_UNESCAPED_UNICODE)]
    );

    dbUpdate("UPDATE surveys SET responses_count = responses_count + 1 WHERE id=?", [$surveyId]);
    jsonSuccess('شكراً لمشاركتك — رأيك يُحدث فرقاً ✓');
}

function handleComplaintSubmit(): void {
    // التحقق من حجم البيانات
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 100 * 1024) jsonError('البيانات كبيرة جداً', 413);

    $body     = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $type     = in_array($body['type'] ?? '', ['complaint', 'suggestion']) ? $body['type'] : 'suggestion';
    $name     = sanitize($body['name'] ?? '');
    $contact  = sanitize($body['contact'] ?? '');
    $message  = sanitize($body['message'] ?? '');
    $compType = sanitize($body['complaint_type'] ?? '');

    if (strlen($message) < 10) jsonError('الرسالة قصيرة جداً — الحد الأدنى 10 أحرف');
    if (strlen($message) > 3000) jsonError('الرسالة طويلة جداً — الحد الأقصى 3000 حرف');

    dbExecute(
        "INSERT INTO complaints (type, name, contact, complaint_type, message, ip_address, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [$type, $name ?: null, $contact ?: null, $compType ?: null, $message, getClientIP()]
    );

    $msg = $type === 'complaint'
        ? 'تم استلام شكواك — سيتم التواصل معك خلال 48 ساعة ✓'
        : 'تم إرسال مقترحك — شكراً لمساهمتك ✓';
    jsonSuccess($msg);
}

function handleRegistrationEntry(): void {
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 512 * 1024) jsonError('البيانات كبيرة جداً', 413);

    $body      = json_decode(file_get_contents('php://input'), true) ?? [];
    $formKey   = sanitize($body['form_key']   ?? 'general');
    $formLabel = sanitize($body['form_label'] ?? $formKey);
    $data      = $body['data'] ?? [];

    if (empty($data)) jsonError('لا توجد بيانات للحفظ');
    if (!is_array($data)) jsonError('تنسيق البيانات غير صحيح');

    // تنظيف البيانات
    $clean = [];
    foreach ($data as $k => $v) {
        $clean[substr(strip_tags((string)$k), 0, 200)] =
            substr(strip_tags((string)$v), 0, 5000);
    }

    try {
        getDB()->query("SELECT 1 FROM form_entries LIMIT 1");
        $id = dbExecute(
            "INSERT INTO form_entries (form_key, form_label, data, ip_address, submitted_at)
             VALUES (?, ?, ?, ?, NOW())",
            [$formKey, $formLabel, json_encode($clean, JSON_UNESCAPED_UNICODE), getClientIP()]
        );
    } catch (\PDOException $e) {
        getDB()->exec("CREATE TABLE IF NOT EXISTS `form_entries` (
            `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
            `form_key` varchar(191) NOT NULL,
            `form_label` varchar(500) NOT NULL,
            `data` json DEFAULT NULL,
            `ip_address` varchar(45) DEFAULT NULL,
            `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        $id = dbExecute(
            "INSERT INTO form_entries (form_key, form_label, data, ip_address, submitted_at)
             VALUES (?, ?, ?, ?, NOW())",
            [$formKey, $formLabel, json_encode($clean, JSON_UNESCAPED_UNICODE), getClientIP()]
        );
    }

    jsonSuccess('تم حفظ البيانات بنجاح', ['id' => $id]);
}

function handleGetRegistrationEntries(): void {
    if (!isLoggedIn()) jsonError('غير مصرح', 401);
    try {
        $entries = dbQuery(
            "SELECT id, form_key, form_label, data, submitted_at
             FROM form_entries ORDER BY submitted_at DESC LIMIT 500"
        );
        foreach ($entries as &$e) {
            if (isset($e['data']) && is_string($e['data'])) {
                $e['data'] = json_decode($e['data'], true) ?? [];
            }
        }
        jsonResponse(['success' => true, 'data' => $entries]);
    } catch (\PDOException $e) {
        jsonResponse(['success' => true, 'data' => []]);
    }
}

function handleRegistration(): void {
    $formKey = sanitize($_POST['form_key'] ?? '');
    if (!$formKey) jsonError('نوع النموذج مطلوب');

    $form = dbQueryOne(
        "SELECT * FROM registration_forms WHERE form_key=? AND is_active=1",
        [$formKey]
    );
    if (!$form) jsonError('النموذج غير موجود');

    $data   = [];
    $fields = json_decode($form['fields'], true) ?? [];
    foreach ($fields as $field) {
        if ($field['type'] === 'file') continue;
        $val = sanitize($_POST[$field['label']] ?? '');
        if (!empty($field['required']) && $val === '') {
            jsonError('حقل "' . $field['label'] . '" إلزامي');
        }
        $data[$field['label']] = $val;
    }

    $attachmentPath = null;
    if (!empty($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $attachmentPath = uploadFile($_FILES['attachment'], 'registrations', ['pdf', 'doc', 'docx']);
        if (!$attachmentPath) jsonError('تعذّر رفع الملف — يرجى استخدام PDF أو Word فقط (الحد 10 MB)');
    }

    dbExecute(
        "INSERT INTO registrations (form_id, form_key, data, attachment_path, ip_address, submitted_at)
         VALUES (?, ?, ?, ?, ?, NOW())",
        [$form['id'], $formKey, json_encode($data, JSON_UNESCAPED_UNICODE), $attachmentPath, getClientIP()]
    );

    jsonSuccess('تم استلام طلبك بنجاح — سيتم التواصل معك قريباً ✓');
}

// ── لوحة التحكم ───────────────────────────────────────────

function handleAdminLogin(): void {
    $body  = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $email = sanitizeEmail($body['email'] ?? '');
    $pass  = $body['password'] ?? '';

    if (!$email || !$pass) jsonError('البريد وكلمة المرور مطلوبان');

    $user = dbQueryOne("SELECT * FROM users WHERE email=? AND is_active=1", [$email]);

    // تأخير عشوائي لمنع هجمات Timing
    usleep(random_int(100000, 300000));

    if (!$user || !password_verify($pass, $user['password'])) {
        jsonError('بيانات الدخول غير صحيحة', 401);
    }

    $_SESSION['admin_id']   = $user['id'];
    $_SESSION['admin_role'] = $user['role'];
    $_SESSION['admin_name'] = $user['name'];

    dbUpdate("UPDATE users SET last_login=NOW() WHERE id=?", [$user['id']]);

    jsonSuccess('مرحباً ' . $user['name'], [
        'user'  => ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']],
        'token' => csrfToken(),
    ]);
}

function requireAdminAuth(): void {
    if (!isLoggedIn()) jsonError('غير مصرح — يرجى تسجيل الدخول', 401);
}

function handleAdminData(): void {
    $section = $_GET['section'] ?? 'overview';

    $data = match ($section) {
        'overview' => [
            'total_mosques'   => dbQueryOne("SELECT value FROM achievements WHERE label LIKE '%مساجد%' LIMIT 1")['value'] ?? '0',
            'total_donations' => dbQueryOne("SELECT COALESCE(SUM(amount),0) as total FROM donations WHERE status='completed'")['total'] ?? 0,
            'new_complaints'  => dbQueryOne("SELECT COUNT(*) as c FROM complaints WHERE status='new'")['c'] ?? 0,
            'open_surveys'    => dbQueryOne("SELECT COUNT(*) as c FROM surveys WHERE status='open'")['c'] ?? 0,
        ],
        'achievements'       => dbQuery("SELECT * FROM achievements ORDER BY sort_order"),
        'stats'              => dbQuery("SELECT * FROM stats ORDER BY sort_order"),
        'projects'           => dbQuery("SELECT * FROM projects ORDER BY sort_order"),
        'partners'           => dbQuery("SELECT * FROM partners ORDER BY sort_order"),
        'news'               => dbQuery("SELECT * FROM news ORDER BY sort_order"),
        'events'             => dbQuery("SELECT * FROM events ORDER BY sort_order"),
        'testimonials'       => dbQuery("SELECT * FROM testimonials ORDER BY sort_order"),
        'surveys'            => dbQuery("SELECT s.*, (SELECT COUNT(*) FROM survey_responses WHERE survey_id=s.id) as total_responses FROM surveys s ORDER BY sort_order"),
        'survey-questions'   => dbQuery("SELECT * FROM survey_questions ORDER BY survey_id, sort_order"),
        'analysis-reports'   => dbQuery("SELECT ar.*, (SELECT COUNT(*) FROM report_files WHERE report_id=ar.id) as files_count FROM analysis_reports ar ORDER BY sort_order"),
        'board-decisions'    => dbQuery("SELECT * FROM board_decisions ORDER BY sort_order"),
        'documents'          => dbQuery("SELECT * FROM documents ORDER BY sort_order"),
        'complaints'         => dbQuery("SELECT * FROM complaints ORDER BY submitted_at DESC LIMIT 100"),
        'registrations'      => dbQuery("SELECT r.*, rf.label as form_label FROM registrations r JOIN registration_forms rf ON r.form_id=rf.id ORDER BY r.submitted_at DESC LIMIT 100"),
        'registration-forms' => dbQuery("SELECT * FROM registration_forms ORDER BY sort_order"),
        'nav'                => [
            'items'    => dbQuery("SELECT * FROM nav_items ORDER BY sort_order"),
            'dropdown' => dbQuery("SELECT * FROM nav_dropdown_items ORDER BY nav_item_id, sort_order"),
        ],
        'footer' => [
            'settings'     => getAllSettings(),
            'social_links' => dbQuery("SELECT * FROM social_links ORDER BY sort_order"),
            'footer_links' => dbQuery("SELECT * FROM footer_links ORDER BY sort_order"),
        ],
        'settings' => getAllSettings(),
        'users'    => hasRole('admin')
            ? dbQuery("SELECT id,name,email,role,is_active,last_login,created_at FROM users")
            : [],
        default => [],
    };

    jsonResponse(['success' => true, 'data' => $data]);
}

function handleAdminSave(): void {
    if (!hasRole('editor')) jsonError('ليس لديك صلاحية التعديل', 403);

    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 2 * 1024 * 1024) jsonError('البيانات كبيرة جداً', 413);

    $body    = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $section = sanitize($body['section'] ?? '');
    $action  = sanitize($body['action']  ?? 'update');
    $payload = $body['data'] ?? [];

    $result = match (true) {
        $section === 'settings' => saveSectionSettings($payload),
        in_array($section, ['achievements','stats','projects','partners','news','events','testimonials',
                             'surveys','analysis_reports','board_decisions','documents',
                             'registration_forms','nav_items','nav_dropdown_items',
                             'social_links','footer_links']) => saveSectionCrud($section, $action, $payload),
        $section === 'complaint_status'    => updateComplaintStatus($payload),
        $section === 'registration_status' => updateRegistrationStatus($payload),
        $section === 'user' && hasRole('admin') => saveUser($action, $payload),
        default => false,
    };

    if ($result === false) jsonError('فشل حفظ البيانات');
    jsonSuccess('تم الحفظ بنجاح ✓');
}

function saveSectionSettings(array $payload): bool {
    foreach ($payload as $key => $value) {
        $exists = dbQueryOne("SELECT id FROM site_settings WHERE `key`=?", [$key]);
        if ($exists) {
            dbUpdate("UPDATE site_settings SET value=?, updated_at=NOW() WHERE `key`=?", [$value, $key]);
        } else {
            dbExecute("INSERT INTO site_settings (`key`, value, updated_at) VALUES (?,?,NOW())", [$key, $value]);
        }
    }
    return true;
}

function saveSectionCrud(string $table, string $action, array $data): bool {
    $allowed = ['achievements','stats','projects','partners','news','events','testimonials',
                'surveys','survey_questions','analysis_reports','board_decisions','documents',
                'registration_forms','nav_items','nav_dropdown_items','social_links','footer_links'];
    if (!in_array($table, $allowed)) return false;

    $now = date('Y-m-d H:i:s');

    if ($action === 'delete' && isset($data['id'])) {
        return (bool) dbUpdate("DELETE FROM `$table` WHERE id=?", [(int)$data['id']]);
    }

    if ($action === 'reorder' && isset($data['ids'])) {
        foreach ($data['ids'] as $order => $id) {
            dbUpdate("UPDATE `$table` SET sort_order=? WHERE id=?", [(int)$order, (int)$id]);
        }
        return true;
    }

    $allowed_fields = getAllowedFields($table);
    $sets = [];
    $vals = [];
    foreach ($data as $field => $val) {
        if ($field === 'id' || !in_array($field, $allowed_fields)) continue;
        if (is_array($val)) $val = json_encode($val, JSON_UNESCAPED_UNICODE);
        $sets[] = "`$field` = ?";
        $vals[] = $val;
    }

    if (empty($sets)) return false;

    if ($action === 'create') {
        $sets[] = 'created_at = ?'; $vals[] = $now;
        $sets[] = 'updated_at = ?'; $vals[] = $now;
        $cols   = implode(', ', $sets);
        dbExecute("INSERT INTO `$table` SET $cols", $vals);
        return true;
    }

    $sets[] = 'updated_at = ?'; $vals[] = $now;
    $vals[] = (int)$data['id'];
    $setStr = implode(', ', $sets);
    return (bool) dbUpdate("UPDATE `$table` SET $setStr WHERE id=?", $vals);
}

function getAllowedFields(string $table): array {
    $fields = [
        'achievements'       => ['icon','label','value','unit','sort_order','is_active'],
        'stats'              => ['value','label','sort_order','is_active'],
        'projects'           => ['icon','name','description','bg_color','progress_pct','goal_amount','current_amount','is_active','sort_order'],
        'partners'           => ['name','icon','logo_path','logo_url','name_color','is_active','sort_order'],
        'news'               => ['title','excerpt','content','category','category_icon','category_color','category_text_color','bg_color','image_path','publish_date','is_active','sort_order'],
        'events'             => ['title','description','event_day','event_month','event_date','location','status','is_active','sort_order'],
        'testimonials'       => ['name','role','quote','initials','avatar_color','avatar_text_color','is_active','sort_order'],
        'surveys'            => ['title','description','icon','icon_bg','category','status','is_active','sort_order'],
        'survey_questions'   => ['survey_id','question_text','question_type','options','is_required','sort_order'],
        'analysis_reports'   => ['title','description','related_survey_id','analysis_text','report_date','is_active','sort_order'],
        'board_decisions'    => ['type','title','body','responsible','deadline','decision_date','status','is_active','sort_order'],
        'documents'          => ['title','description','file_path','file_size','bg_color','icon','publish_date','is_active','sort_order'],
        'registration_forms' => ['form_key','label','icon','description','fields','is_active','sort_order'],
        'nav_items'          => ['label','url','has_dropdown','is_donate_btn','sort_order','is_active'],
        'nav_dropdown_items' => ['nav_item_id','label','url','icon','content_type','content','page_key','sort_order','is_active'],
        'social_links'       => ['icon','label','url','sort_order','is_active'],
        'footer_links'       => ['label','url','page_key','sort_order','is_active'],
    ];
    return $fields[$table] ?? [];
}

function updateComplaintStatus(array $data): bool {
    if (!isset($data['id'], $data['status'])) return false;
    if (!in_array($data['status'], ['new','in_progress','done'])) return false;
    return (bool) dbUpdate(
        "UPDATE complaints SET status=?, admin_notes=?, updated_at=NOW() WHERE id=?",
        [$data['status'], $data['notes'] ?? null, (int)$data['id']]
    );
}

function updateRegistrationStatus(array $data): bool {
    if (!isset($data['id'], $data['status'])) return false;
    if (!in_array($data['status'], ['pending','approved','rejected'])) return false;
    return (bool) dbUpdate(
        "UPDATE registrations SET status=?, admin_notes=?, updated_at=NOW() WHERE id=?",
        [$data['status'], $data['notes'] ?? null, (int)$data['id']]
    );
}

function saveUser(string $action, array $data): bool {
    if ($action === 'create') {
        if (empty($data['email']) || empty($data['password'])) return false;
        // التحقق من عدم تكرار البريد
        $exists = dbQueryOne("SELECT id FROM users WHERE email=?", [sanitizeEmail($data['email'])]);
        if ($exists) return false;
        $hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        dbExecute(
            "INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
             VALUES (?,?,?,?,1,NOW(),NOW())",
            [sanitize($data['name'] ?? ''), sanitizeEmail($data['email']), $hash, $data['role'] ?? 'viewer']
        );
        return true;
    }
    if ($action === 'update' && isset($data['id'])) {
        $sets = ['name=?','role=?','is_active=?','updated_at=NOW()'];
        $vals = [sanitize($data['name'] ?? ''), $data['role'] ?? 'viewer', (int)($data['is_active'] ?? 1)];
        if (!empty($data['password'])) {
            $sets[] = 'password=?';
            $vals[] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }
        $vals[] = (int)$data['id'];
        return (bool) dbUpdate("UPDATE users SET " . implode(',', $sets) . " WHERE id=?", $vals);
    }
    return false;
}

function handleAdminUpload(): void {
    if (!hasRole('editor')) jsonError('ليس لديك صلاحية الرفع', 403);

    $type = sanitize($_POST['type'] ?? 'general');
    $subFolders = [
        'pdf'        => 'pdfs',
        'image'      => 'images',
        'logo'       => 'logos',
        'attachment' => 'registrations',
        'general'    => 'uploads',
    ];
    $folder = $subFolders[$type] ?? 'uploads';

    $allowedTypes = ($type === 'image' || $type === 'logo')
        ? ['jpg','jpeg','png','webp','svg','gif']
        : ['pdf','doc','docx','jpg','jpeg','png'];

    if (empty($_FILES['file'])) jsonError('لم يُرفع أي ملف');

    $path = uploadFile($_FILES['file'], $folder, $allowedTypes);
    if (!$path) jsonError('فشل رفع الملف — تأكد من نوع الملف والحجم (الحد الأقصى 10 MB)');

    jsonSuccess('تم رفع الملف بنجاح', [
        'path' => $path,
        'url'  => '/' . $path,
        'name' => $_FILES['file']['name'],
        'size' => getFileSize($path),
    ]);
}
