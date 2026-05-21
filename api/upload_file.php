<?php
/**
 * api/upload_file.php
 * رفع ملف PDF أو صورة وإعادة رابطه
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// مجلد الرفع
$uploadDir = dirname(__DIR__) . '/uploads/';
if(!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    echo json_encode(['success'=>false,'error'=>'POST only']);
    exit;
}

if(empty($_FILES['file'])){
    echo json_encode(['success'=>false,'error'=>'no file']);
    exit;
}

$file = $_FILES['file'];
$name = preg_replace('/[^a-zA-Z0-9._-]/', '_', $file['name']);
$name = time() . '_' . $name;
$path = $uploadDir . $name;

// التحقق من النوع
$allowed = ['application/pdf','image/jpeg','image/png','image/gif','image/webp'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);

if(!in_array($mime, $allowed)){
    echo json_encode(['success'=>false,'error'=>'نوع الملف غير مسموح: '.$mime]);
    exit;
}

if(move_uploaded_file($file['tmp_name'], $path)){
    $url = '/mosque/uploads/' . $name;
    echo json_encode(['success'=>true,'url'=>$url,'name'=>$file['name'],'mime'=>$mime]);
} else {
    echo json_encode(['success'=>false,'error'=>'فشل نقل الملف']);
}
