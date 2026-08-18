<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

require_once '../../includes/config/database.php';
require_once '../../includes/config/env.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Get JSON or form data
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
    } else {
        $input = $_POST;
    }

    // Validate required fields
    $name    = trim($input['name'] ?? '');
    $email   = trim($input['email'] ?? '');
    $phone   = trim($input['phone'] ?? '');
    $subject = trim($input['subject'] ?? '');
    $message = trim($input['message'] ?? '');

    if (empty($name))    throw new Exception('Name is required');
    if (empty($email))   throw new Exception('Email is required');
    if (empty($subject)) throw new Exception('Subject is required');
    if (empty($message)) throw new Exception('Message is required');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }

    if (strlen($name) > 150)    throw new Exception('Name is too long');
    if (strlen($subject) > 100) throw new Exception('Subject is too long');
    if (strlen($message) > 5000) throw new Exception('Message is too long');

    // Save to database — is_active defaults to 1
    $conn = DatabaseConfig::getConnection();

    $stmt = $conn->prepare("
        INSERT INTO contact_messages (name, email, phone, subject, message, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    ");
    $stmt->execute([$name, $email, $phone ?: null, $subject, $message]);

    $messageId = $conn->lastInsertId();
    error_log("Contact message saved: ID={$messageId}, from={$email}");

    // Send email notification (non-blocking — failure doesn't affect response)
    try {
        sendContactEmail($name, $email, $phone, $subject, $message);
    } catch (Exception $mailEx) {
        error_log("Contact email failed (message still saved): " . $mailEx->getMessage());
    }

    echo json_encode([
        'success' => true,
        'message' => 'Your message has been received. We\'ll get back to you soon!'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Send notification email using PHP mail()
 */
function sendContactEmail($name, $email, $phone, $subject, $message) {
    $toAddress  = EnvLoader::get('MAIL_FROM_ADDRESS', 'teamequinox05@gmail.com');
    $fromName   = EnvLoader::get('MAIL_FROM_NAME', 'Fitness Conscious Goa');
    $emailSubject = "New Contact Form Submission: {$subject}";

    $boundary = md5(uniqid(time()));

    $headers = implode("\r\n", [
        "From: {$fromName} <{$toAddress}>",
        "Reply-To: {$name} <{$email}>",
        "X-Mailer: PHP/" . phpversion(),
        "MIME-Version: 1.0",
        "Content-Type: multipart/alternative; boundary=\"{$boundary}\""
    ]);

    $htmlBody = "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;color:#333;background:#f4f4f4;margin:0;padding:0;'>
  <div style='max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);'>
    <div style='background:linear-gradient(135deg,#FF4444,#FF6B35);padding:30px 24px;text-align:center;'>
      <h1 style='color:#fff;margin:0;font-size:22px;'>New Contact Message</h1>
      <p style='color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;'>Fitness Conscious Goa — Website Contact Form</p>
    </div>
    <div style='padding:30px 24px;'>
      <table style='width:100%;border-collapse:collapse;'>
        <tr><td style='padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;width:120px;color:#555;'>Name</td><td style='padding:10px 0;border-bottom:1px solid #eee;'>" . htmlspecialchars($name) . "</td></tr>
        <tr><td style='padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;'>Email</td><td style='padding:10px 0;border-bottom:1px solid #eee;'><a href='mailto:" . htmlspecialchars($email) . "' style='color:#FF4444;'>" . htmlspecialchars($email) . "</a></td></tr>
        <tr><td style='padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;'>Phone</td><td style='padding:10px 0;border-bottom:1px solid #eee;'>" . htmlspecialchars($phone ?: 'Not provided') . "</td></tr>
        <tr><td style='padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;'>Subject</td><td style='padding:10px 0;border-bottom:1px solid #eee;'>" . htmlspecialchars($subject) . "</td></tr>
      </table>
      <div style='margin-top:20px;'>
        <p style='font-weight:bold;color:#555;margin-bottom:8px;'>Message:</p>
        <div style='background:#f8f8f8;border-left:4px solid #FF4444;padding:16px;border-radius:4px;line-height:1.7;'>" . nl2br(htmlspecialchars($message)) . "</div>
      </div>
      <div style='margin-top:24px;text-align:center;'>
        <a href='mailto:" . htmlspecialchars($email) . "' style='display:inline-block;background:linear-gradient(135deg,#FF4444,#FF6B35);color:#fff;padding:12px 28px;border-radius:25px;text-decoration:none;font-weight:600;font-size:14px;'>Reply to " . htmlspecialchars($name) . "</a>
      </div>
    </div>
    <div style='background:#f8f8f8;padding:16px 24px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;'>
      Fitness Conscious Goa &mdash; Website Contact Form
    </div>
  </div>
</body>
</html>";

    $textBody = "New contact form submission\n\n"
        . "Name: {$name}\n"
        . "Email: {$email}\n"
        . "Phone: " . ($phone ?: 'Not provided') . "\n"
        . "Subject: {$subject}\n\n"
        . "Message:\n{$message}";

    $body  = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 7bit\r\n\r\n{$textBody}\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 7bit\r\n\r\n{$htmlBody}\r\n\r\n";
    $body .= "--{$boundary}--\r\n";

    @mail($toAddress, $emailSubject, $body, $headers);
}
