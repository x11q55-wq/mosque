<?php
/**
 * form-og.php — توليد صورة OG ديناميكية لنماذج التسجيل
 * تُستخدم لعرض أيقونة النموذج واسمه عند المشاركة في واتساب
 * 
 * المعاملات:
 *   ?icon=📋&label=عضو جمعية عمومية&form=عضو-جمعية
 */

$icon  = isset($_GET['icon'])  ? mb_substr(strip_tags($_GET['icon']), 0, 4)  : '📋';
$label = isset($_GET['label']) ? mb_substr(strip_tags($_GET['label']), 0, 40) : 'نموذج تسجيل';

// ألوان الجمعية
$bg_color   = '#0f3d26';
$gold_color = '#c9a227';
$white      = '#ffffff';

// توليد SVG كصورة OG
$svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#082918"/>
      <stop offset="100%" style="stop-color:#1a5c3a"/>
    </linearGradient>
  </defs>

  <!-- خلفية -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- شريط ذهبي علوي -->
  <rect x="0" y="0" width="1200" height="8" fill="#c9a227"/>
  <!-- شريط ذهبي سفلي -->
  <rect x="0" y="622" width="1200" height="8" fill="#c9a227"/>

  <!-- دائرة خلفية للأيقونة -->
  <circle cx="600" cy="230" r="120" fill="rgba(201,162,39,0.15)"/>
  <circle cx="600" cy="230" r="100" fill="rgba(255,255,255,0.08)"/>

  <!-- الأيقونة -->
  <text x="600" y="270" font-size="110" text-anchor="middle" font-family="Arial">$icon</text>

  <!-- خط فاصل -->
  <rect x="350" y="370" width="500" height="3" fill="#c9a227" rx="2"/>

  <!-- اسم النموذج -->
  <text x="600" y="440" font-size="48" font-weight="bold" fill="#ffffff"
        text-anchor="middle" font-family="Arial, sans-serif" direction="rtl">$label</text>

  <!-- نص ثانوي -->
  <text x="600" y="500" font-size="28" fill="rgba(255,255,255,0.7)"
        text-anchor="middle" font-family="Arial, sans-serif" direction="rtl">جمعية العناية بالمساجد</text>

  <!-- منظمة -->
  <text x="600" y="540" font-size="20" fill="rgba(201,162,39,0.8)"
        text-anchor="middle" font-family="Arial, sans-serif">KSA Mosque Care Foundation</text>
</svg>
SVG;

// إرسال كصورة SVG
header('Content-Type: image/svg+xml');
header('Cache-Control: public, max-age=3600');
echo $svg;
