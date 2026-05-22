<?php
/**
 * views/site.php — النسخة المُصلحة
 * يعالج:
 * 1. إخفاء لوحة التحكم عن الزوار العاديين
 * 2. إصلاح ترميز UTF-8 (علامات الاستفهام)
 * 3. حقن بيانات قاعدة البيانات
 */

// إرسال header الترميز أولاً
header('Content-Type: text/html; charset=utf-8');

// ══ فحص الصيانة على مستوى PHP ══════════════════════
$current_uri   = $_SERVER['REQUEST_URI'] ?? '';
$is_admin_path = strpos($current_uri, '/admin') !== false;

// استخدام نتيجة فحص cookie من index.php
$is_cms_admin = $is_admin_path || (!empty($_IS_CMS_ADMIN) && $_IS_CMS_ADMIN === true);

if (!$is_cms_admin) {
    try {
        $ss_row = getDB()->query("SELECT state_json FROM site_state WHERE state_key='main' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        if ($ss_row) {
            $ss_data = json_decode($ss_row['state_json'], true);
            $maint   = $ss_data['maintenance'] ?? [];
            if (!empty($maint['enabled'])) {
                // إذا انتهى الوقت → أوقف آلياً
                if (!empty($maint['until']) && strtotime($maint['until']) <= time()) {
                    $ss_data['maintenance']['enabled'] = false;
                    getDB()->prepare("UPDATE site_state SET state_json=? WHERE state_key='main'")
                           ->execute([json_encode($ss_data, JSON_UNESCAPED_UNICODE)]);
                } else {
                    // اعرض شاشة الصيانة من PHP مباشرة
                    $maint_msg   = htmlspecialchars($maint['message'] ?? 'الموقع قيد الصيانة — سنعود قريباً');
                    $maint_until = htmlspecialchars($maint['until'] ?? '');
                    http_response_code(503);
                    header('Retry-After: 3600');
                    echo <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>الموقع قيد الصيانة</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Tajawal',sans-serif;background:linear-gradient(135deg,#0f3d26,#1a5c38);min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff;direction:rtl}
.box{text-align:center;padding:40px 20px;max-width:600px}
.icon{font-size:64px;margin-bottom:20px}
h1{font-size:28px;font-weight:700;margin-bottom:12px}
p{font-size:16px;color:rgba(255,255,255,.85);line-height:1.8;margin-bottom:28px}
.cd{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:20px}
.unit{background:rgba(255,255,255,.15);border-radius:12px;padding:16px 20px;min-width:80px}
.num{font-size:32px;font-weight:700;line-height:1}
.lbl{font-size:12px;color:rgba(255,255,255,.7);margin-top:4px}
</style>
</head>
<body>
<div class="box">
  <div class="icon">🔧</div>
  <h1>الموقع قيد الصيانة</h1>
  <p>{$maint_msg}</p>
  <div class="cd" id="cd"></div>
</div>
<script>
var target = '{$maint_until}' ? new Date('{$maint_until}') : null;
function pad(n){return n<10?'0'+n:String(n);}
function tick(){
  var el=document.getElementById('cd');
  if(!target||!el) return;
  var diff=target-new Date();
  if(diff<=0){location.reload();return;}
  el.innerHTML=
    '<div class="unit"><div class="num">'+pad(Math.floor(diff/2592000000))+'</div><div class="lbl">شهر</div></div>'+
    '<div class="unit"><div class="num">'+pad(Math.floor((diff%2592000000)/86400000))+'</div><div class="lbl">يوم</div></div>'+
    '<div class="unit"><div class="num">'+pad(Math.floor((diff%86400000)/3600000))+'</div><div class="lbl">ساعة</div></div>'+
    '<div class="unit"><div class="num">'+pad(Math.floor((diff%3600000)/60000))+'</div><div class="lbl">دقيقة</div></div>'+
    '<div class="unit"><div class="num">'+pad(Math.floor((diff%60000)/1000))+'</div><div class="lbl">ثانية</div></div>';
}
tick(); if(target) setInterval(tick,1000);
</script>
</body>
</html>
HTML;
                    exit;
                }
            }
        }
    } catch (Throwable $e) {}
}
// ═══════════════════════════════════════════════════

// جلب بيانات DB
$S = getSiteData();

// ══ OG Tags ديناميكية حسب النموذج المطلوب ══
$og_title       = getSetting('org_name', 'جمعية العناية بالمساجد');
$og_description = getSetting('org_about', 'جمعية خيرية متخصصة في صيانة وتطوير المساجد عبر المملكة العربية السعودية');
$og_image       = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'mnassat.com') . '/mosque/og-image.jpg';
$og_url         = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'mnassat.com') . '/mosque/';

// إذا كان الطلب لنموذج محدد (?form=اسم-النموذج)
$form_slug = isset($_GET['form']) ? trim($_GET['form']) : '';
if (!empty($form_slug)) {
    // البحث في النماذج
    $forms = $S['registration_forms'] ?? [];
    foreach ($forms as $form) {
        $slug = str_replace(' ', '-', $form['label'] ?? '');
        if ($slug === $form_slug || ($form['label'] ?? '') === $form_slug) {
            $icon = $form['icon'] ?? '📋';
            $og_title       = $icon . ' ' . ($form['label'] ?? '') . ' — جمعية العناية بالمساجد';
            $og_description = $form['description'] ?? ('نموذج ' . ($form['label'] ?? '') . ' — جمعية العناية بالمساجد');
            $og_url         = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'mnassat.com') . '/mosque/?form=' . urlencode($form_slug);
            /* توليد صورة OG ديناميكية لهذا النموذج */
            $og_image = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'mnassat.com') . '/mosque/form-og.php?form=' . urlencode($form_slug) . '&icon=' . urlencode($icon) . '&label=' . urlencode($form['label'] ?? '');
            break;
        }
    }
}

// مسار قالب HTML. النسخة المقسمة تستخدم index.html، مع إبقاء الملف الكامل كخطة رجوع.
$htmlFile = BASE_PATH . '/index.html';
if (!file_exists($htmlFile)) {
    $htmlFile = BASE_PATH . '/mosque_full.html';
}

if (!file_exists($htmlFile)) {
    http_response_code(503);
    echo '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>خطأ</title></head>
    <body style="font-family:Arial;text-align:center;padding:80px">
    <h2>⚠ ملف قالب الموقع غير موجود</h2>
    <p>المسار المتوقع: <code>' . htmlspecialchars(BASE_PATH) . '/index.html</code></p>
    </body></html>';
    exit;
}

$html = file_get_contents($htmlFile);

// ══ استبدال OG tags بقيم ديناميكية ══
$html = preg_replace(
    '/<meta property="og:image"[^>]*>/i',
    '<meta property="og:image" content="' . htmlspecialchars($og_image) . '">',
    $html
);
$html = preg_replace(
    '/<meta name="twitter:image"[^>]*>/i',
    '<meta name="twitter:image" content="' . htmlspecialchars($og_image) . '">',
    $html
);
$html = preg_replace(
    '/<meta property="og:title"[^>]*>/i',
    '<meta property="og:title" content="' . htmlspecialchars($og_title) . '">',
    $html
);
$html = preg_replace(
    '/<meta property="og:description"[^>]*>/i',
    '<meta property="og:description" content="' . htmlspecialchars($og_description) . '">',
    $html
);
$html = preg_replace(
    '/<meta property="og:url"[^>]*>/i',
    '<meta property="og:url" content="' . htmlspecialchars($og_url) . '">',
    $html
);
$html = preg_replace(
    '/<meta name="description"[^>]*>/i',
    '<meta name="description" content="' . htmlspecialchars($og_description) . '">',
    $html
);
$html = preg_replace(
    '/<meta name="twitter:title"[^>]*>/i',
    '<meta name="twitter:title" content="' . htmlspecialchars($og_title) . '">',
    $html
);
$html = preg_replace(
    '/<meta name="twitter:description"[^>]*>/i',
    '<meta name="twitter:description" content="' . htmlspecialchars($og_description) . '">',
    $html
);
$html = preg_replace(
    '/<title>[^<]*<\/title>/i',
    '<title>' . htmlspecialchars($og_title) . '</title>',
    $html
);

// ── إصلاح الترميز ──────────────────────────────────────────
// تأكد أن الملف يُقرأ بـ UTF-8 وأضف charset للـ meta
if (strpos($html, 'charset=UTF-8') === false && strpos($html, 'charset=utf-8') === false) {
    $html = str_replace('<head>', '<head><meta charset="UTF-8">', $html);
}

// ── كود إخفاء لوحة التحكم + حقن البيانات ─────────────────
$isAdmin = isLoggedIn();
$baseUrl  = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/mosque';

// ── حقن IS_ADMIN في <head> مباشرة ليكون متاحاً قبل أي JavaScript ──
$headInject = '<script>var IS_ADMIN = ' . ($isAdmin ? 'true' : 'false') . ';</script>';
$html = str_replace('<head>', '<head>' . $headInject, $html);

$injectScript = '<script>
/* ══ تهيئة الموقع من قاعدة البيانات ══ */
(function(){

/* ── 1. إخفاء/إظهار لوحة التحكم حسب صلاحية المستخدم ── */
var IS_ADMIN = ' . ($isAdmin ? 'true' : 'false') . ';

function initCMSVisibility() {
  var panel  = document.getElementById("cms-panel");
  var toggle = document.getElementById("cms-toggle");

  /* إخفاء اللوحة الجانبية القديمة تماماً للجميع */
  if (panel)  panel.style.display  = "none";
  if (toggle) toggle.style.display = "none";

  if (IS_ADMIN) {
    addAdminNavBtn();
  }
}

function addAdminNavBtn() {
  var bar = document.createElement("div");
  bar.id = "admin-bar";
  bar.style.cssText =
    "position:relative;background:#082918;color:#fff;" +
    "font-size:12px;padding:6px 20px;z-index:100;" +
    "display:flex;justify-content:space-between;align-items:center;" +
    "direction:rtl;font-family:Tajawal,Arial,sans-serif;height:40px;flex-shrink:0;";
  bar.innerHTML =
    "<span style=\"opacity:.75;font-size:11px\">⚙ مسجل دخول كمشرف</span>" +
    "<div style=\"display:flex;gap:8px\">" +
    "<button onclick=\"openCMSStandalone()\" " +
    "style=\"background:#c9a227;color:#0f3d26;border:none;border-radius:6px;" +
    "padding:5px 16px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;\">" +
    "⚙ لوحة التحكم</button>" +
    "<a href=\"/mosque/admin/logout\" " +
    "style=\"background:rgba(255,255,255,.12);color:#fff;border-radius:6px;" +
    "padding:5px 12px;text-decoration:none;font-size:12px;line-height:1.8\">خروج</a>" +
    "</div>";

  var shell = document.querySelector(".shell");
  if (shell && shell.parentNode) {
    shell.parentNode.insertBefore(bar, shell);
    shell.style.height = "calc(100vh - 40px)";
  } else {
    document.body.insertBefore(bar, document.body.firstChild);
  }
}

/* ── 2. بيانات قاعدة البيانات ── */
var DB = ' . json_encode($S, JSON_UNESCAPED_UNICODE) . ';
var API_BASE = "' . $baseUrl . '/api";

function applyDB() {
  try {
    var s = DB.settings || {};
    var root = document.documentElement;
    /* ══ تطبيق بيانات site_state (S الكاملة من CMS) ══ */
    if(DB.site_state && typeof DB.site_state !== "undefined") {
      var ss = DB.site_state;
      if(ss.surveys && ss.surveys.length) S.surveys = ss.surveys;
      if(ss.analysisReports) S.analysisReports = ss.analysisReports;
      if(ss.boardDecisions) S.boardDecisions = ss.boardDecisions;
      if(ss.achiev && ss.achiev.length) S.achiev = ss.achiev;
      if(ss.projects && ss.projects.length) S.projects = ss.projects;
      if(ss.partners && ss.partners.length) S.partners = ss.partners;
      if(ss.news && ss.news.length) S.news = ss.news;
      if(ss.events && ss.events.length) S.events = ss.events;
      if(ss.testimonials && ss.testimonials.length) S.testimonials = ss.testimonials;
      if(ss.hero) Object.assign(S.hero, ss.hero);
      if(ss.nav) Object.assign(S.nav, ss.nav);
      if(ss.footer) Object.assign(S.footer, ss.footer);
    }

    /* الألوان */
    if(s.color_primary)   root.style.setProperty("--P",  s.color_primary);
    if(s.color_secondary) { root.style.setProperty("--PL", s.color_secondary); root.style.setProperty("--PM", s.color_secondary); }
    if(s.color_accent)    { root.style.setProperty("--A",  s.color_accent); root.style.setProperty("--AL", s.color_accent); }
    if(s.color_bg)        root.style.setProperty("--BG", s.color_bg);
    if(s.scroll_speed)    root.style.setProperty("--scroll-speed", s.scroll_speed+"s");

    if(typeof S === "undefined") return;

    /* اسم المنظمة */
    if(s.org_name)       S.nav.orgName     = s.org_name;
    if(s.org_name_en)    S.nav.orgSub      = s.org_name_en;
    if(s.nav_donate_btn) S.nav.donBtnText  = s.nav_donate_btn;

    /* الهيرو */
    if(typeof S.hero === "object") {
      if(s.hero_badge)      S.hero.badge = s.hero_badge;
      if(s.hero_title_em)   S.hero.em    = s.hero_title_em;
      if(s.hero_title_rest) S.hero.rest  = s.hero_title_rest;
      if(s.hero_subtitle)   S.hero.sub   = s.hero_subtitle;
      if(s.hero_btn1)       S.hero.btn1  = s.hero_btn1;
      if(s.hero_btn2)       S.hero.btn2  = s.hero_btn2;
      if(s.hero_bg1)        S.hero.bg1   = s.hero_bg1;
      if(s.hero_bg2)        S.hero.bg2   = s.hero_bg2;
    }

    /* الإنجازات */
    if(DB.achievements && DB.achievements.length)
      S.achiev = DB.achievements.map(function(a){
        return{icon:a.icon,label:a.label,val:a.value,unit:a.unit};});

    /* الأرقام */
    if(DB.stats && DB.stats.length)
      S.stats = DB.stats.map(function(x){return{val:x.value,label:x.label};});

    /* المشاريع */
    if(DB.projects && DB.projects.length)
      S.projects = DB.projects.map(function(p){
        return{icon:p.icon,bg:p.bg_color,name:p.name,desc:p.description||"",
               pct:parseInt(p.progress_pct)||0,goal:parseFloat(p.goal_amount)||0,cur:parseFloat(p.current_amount)||0};});

    /* الشركاء */
    if(DB.partners && DB.partners.length)
      S.partners = DB.partners.map(function(p){
        return{name:p.name,icon:p.icon||"⭐",
               img:p.logo_url||(p.logo_path?"/mosque/"+p.logo_path:""),
               color:p.name_color};});

    /* الأخبار */
    if(DB.news && DB.news.length)
      S.news = DB.news.map(function(n){
        return{cat:n.category,catIcon:n.category_icon||"📰",
               catColor:n.category_color,catTx:n.category_text_color,
               bg:n.bg_color,title:n.title,date:n.publish_date||"",excerpt:n.excerpt||""};});

    /* الفعاليات */
    if(DB.events && DB.events.length)
      S.events = DB.events.map(function(e){
        return{day:e.event_day,month:e.event_month,title:e.title,meta:e.location||"",status:e.status};});

    /* الآراء */
    if(DB.testimonials && DB.testimonials.length)
      S.testimonials = DB.testimonials.map(function(t){
        return{name:t.name,role:t.role,quote:t.quote,initials:t.initials,color:t.avatar_color};});

    /* الاستطلاعات — نتجاهل DB.surveys إذا كان site_state يحتوي surveys */
    var _hasSiteStateSurveys = DB.site_state && DB.site_state.surveys && DB.site_state.surveys.length > 0;
    if(!_hasSiteStateSurveys && DB.surveys && DB.surveys.length) {
      var qs = DB.survey_questions || [];
      S.surveys = DB.surveys.map(function(sv){
        return{id:sv.id,icon:sv.icon,iconBg:sv.icon_bg,title:sv.title,
               desc:sv.description||"",cat:sv.category,status:sv.status,
               responses:sv.responses_count||0,
               questions:qs.filter(function(q){return String(q.survey_id)===String(sv.id);})
                 .map(function(q){
                   var opts = q.options;
                   if(typeof opts === "string"){try{opts=JSON.parse(opts);}catch(e){opts=[];}}
                   return{text:q.question_text,type:q.question_type,
                          required:!!q.is_required,opts:opts||["ضعيف","مقبول","جيد","ممتاز"]};})};});
    }

    /* الوثائق */
    if(DB.documents && DB.documents.length) {
      if(!S.pages) S.pages = {};
      S.pages.docs = {pdfs: DB.documents.map(function(d){
        return{title:d.title,desc:d.description,date:d.publish_date,
               size:d.file_size,bg:d.bg_color,icon:d.icon,
               file:d.file_path,fileUrl:d.file_path?"/mosque/"+d.file_path:""};})};
    }

    /* نماذج التسجيل */
    if(DB.registration_forms && DB.registration_forms.length) {
      if(!S.pages) S.pages = {};
      S.pages.register = {forms: DB.registration_forms.map(function(f){
        var fields = f.fields;
        if(typeof fields==="string"){try{fields=JSON.parse(fields);}catch(e){fields=[];}}
        return{label:f.label,icon:f.icon,desc:f.description,fields:fields||[]};})};
    }

    /* الفوتر */
    if(s.org_about)    S.footer.about    = s.org_about;
    if(s.org_phone)    S.footer.phone    = s.org_phone;
    if(s.org_email)    S.footer.email    = s.org_email;
    if(s.org_address)  S.footer.address  = s.org_address;
    if(s.map_url)      S.footer.mapUrl   = s.map_url;
    if(s.map_label)    S.footer.mapLabel = s.map_label;
    if(DB.social_links)  S.footer.socials = DB.social_links.map(function(x){return{icon:x.icon,label:x.label,url:x.url};});
    if(DB.footer_links)  S.footer.links   = DB.footer_links.map(function(x){return{label:x.label,url:x.url,page:x.page_key};});

    /* إعادة رسم الموقع */
    if(typeof renderAll === "function") renderAll();

  } catch(err) {
    console.warn("applyDB error:", err);
  }
}

/* ── تشغيل عند التحميل ── */
if(document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){
    applyDB();
    initCMSVisibility();
  });
} else {
  applyDB();
  initCMSVisibility();
}

})();
</script>';

// حقن السكريبت قبل إغلاق body
$html = str_replace('</body>', $injectScript . '</body>', $html);

echo $html;

/* ── جلب البيانات من DB ── */
function getSiteData(): array {
    try {
        // جلب site_state (بيانات CMS كاملة)
        $site_state_row = null;
        try {
            $ss_row = getDB()->query("SELECT state_json FROM site_state WHERE state_key='main' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
            $site_state_row = $ss_row ? json_decode($ss_row['state_json'], true) : null;
        } catch(Exception $e2){}

        $data = [
            'site_state'         => $site_state_row,
            'settings'           => getAllSettings(),
            'achievements'       => dbQuery("SELECT * FROM achievements WHERE is_active=1 ORDER BY sort_order"),
            'stats'              => dbQuery("SELECT * FROM stats WHERE is_active=1 ORDER BY sort_order"),
            'projects'           => dbQuery("SELECT * FROM projects WHERE is_active=1 ORDER BY sort_order"),
            'partners'           => dbQuery("SELECT * FROM partners WHERE is_active=1 ORDER BY sort_order"),
            'news'               => dbQuery("SELECT * FROM news WHERE is_active=1 ORDER BY sort_order LIMIT 9"),
            'events'             => dbQuery("SELECT * FROM events WHERE is_active=1 ORDER BY sort_order LIMIT 6"),
            'testimonials'       => dbQuery("SELECT * FROM testimonials WHERE is_active=1 ORDER BY sort_order"),
            'surveys'            => dbQuery("SELECT * FROM surveys WHERE is_active=1 ORDER BY sort_order"),
            'survey_questions'   => dbQuery("SELECT sq.* FROM survey_questions sq JOIN surveys s ON s.id=sq.survey_id WHERE s.is_active=1 ORDER BY sq.survey_id, sq.sort_order"),
            'documents'          => dbQuery("SELECT * FROM documents WHERE is_active=1 ORDER BY sort_order"),
            'registration_forms' => dbQuery("SELECT * FROM registration_forms WHERE is_active=1 ORDER BY sort_order"),
            'social_links'       => dbQuery("SELECT * FROM social_links WHERE is_active=1 ORDER BY sort_order"),
            'footer_links'       => dbQuery("SELECT * FROM footer_links WHERE is_active=1 ORDER BY sort_order"),
        ];
        return $data;
    } catch (Exception $e) {
        error_log("getSiteData error: " . $e->getMessage());
        return ['settings' => [], 'error' => $e->getMessage()];
    }
}
