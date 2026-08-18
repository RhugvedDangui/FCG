<?php
/**
 * Secure ID Proof File Server
 * Only accessible to logged-in admin — serves files from uploads/id-proofs/
 */
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$file = $_GET['file'] ?? '';

// Sanitize — strip any path traversal attempts
$file = ltrim(str_replace(['..', '\\', "\0"], '', $file), '/');

if (empty($file)) {
    http_response_code(400);
    die('No file specified.');
}

// Build absolute path — file must be inside uploads/id-proofs/
$basePath = realpath(__DIR__ . '/../uploads/id-proofs');
$filePath = realpath($basePath . '/' . $file);

// Ensure resolved path is still inside the allowed directory (prevent traversal)
if ($filePath === false || strpos($filePath, $basePath) !== 0) {
    http_response_code(403);
    die('Access denied.');
}

if (!is_file($filePath)) {
    http_response_code(404);
    die('File not found.');
}

// Determine MIME type
$ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mimeTypes = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
    'pdf'  => 'application/pdf',
];

if (!isset($mimeTypes[$ext])) {
    http_response_code(403);
    die('File type not allowed.');
}

// Serve the file
header('Content-Type: ' . $mimeTypes[$ext]);
header('Content-Length: ' . filesize($filePath));
header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');
readfile($filePath);
exit;
