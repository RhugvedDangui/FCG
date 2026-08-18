<?php
/**
 * Email Service for Event Registration System
 * Handles registration confirmation and payment receipt emails
 */

require_once __DIR__ . '/../config/env.php';

class EmailService {
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $smtpEncryption;
    private $fromAddress;
    private $fromName;
    
    public function __construct() {
        $this->smtpHost       = EnvLoader::get('MAIL_HOST');
        $this->smtpPort       = EnvLoader::get('MAIL_PORT', 587);
        $this->smtpUsername   = EnvLoader::get('MAIL_USERNAME');
        $this->smtpPassword   = EnvLoader::get('MAIL_PASSWORD');
        $this->smtpEncryption = EnvLoader::get('MAIL_ENCRYPTION', 'tls');
        $this->fromAddress    = EnvLoader::get('MAIL_FROM_ADDRESS');
        $this->fromName       = EnvLoader::get('MAIL_FROM_NAME', 'Fitness Conscious Goa');

        if (!$this->smtpHost || !$this->smtpUsername || !$this->smtpPassword || !$this->fromAddress) {
            throw new Exception('Email configuration incomplete. Please check environment variables.');
        }
    }

    public function sendRegistrationConfirmation($userEmail, $userData, $eventData) {
        $subject  = "🎉 Registration Confirmed - {$eventData['title']}";
        $htmlBody = $this->getRegistrationConfirmationHTML($userData, $eventData);
        $textBody = $this->getRegistrationConfirmationText($userData, $eventData);
        return $this->sendEmail($userEmail, $subject, $htmlBody, $textBody);
    }

    public function sendPaymentReceipt($userEmail, $userData, $eventData, $paymentData) {
        $subject  = "💳 Payment Receipt - {$eventData['title']} Registration";
        $htmlBody = $this->getPaymentReceiptHTML($userData, $eventData, $paymentData);
        $textBody = $this->getPaymentReceiptText($userData, $eventData, $paymentData);
        return $this->sendEmail($userEmail, $subject, $htmlBody, $textBody);
    }

    private function sendEmail($to, $subject, $htmlBody, $textBody = null) {
        try {
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email address: ' . $to);
            }

            require_once __DIR__ . '/../../vendor/autoload.php';

            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $this->smtpHost;
            $mail->SMTPAuth   = true;
            $mail->Username   = $this->smtpUsername;
            $mail->Password   = $this->smtpPassword;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int)$this->smtpPort;

            $mail->setFrom($this->fromAddress, $this->fromName);
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->isHTML(true);
            $mail->Body    = $htmlBody;
            if ($textBody) $mail->AltBody = $textBody;

            $mail->send();
            error_log("Email sent successfully to: {$to}");
            return true;

        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }

    private function buildMultipartBody($boundary, $htmlBody, $textBody) {
        $body = "";
        if ($textBody) {
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 7bit\r\n\r\n";
            $body .= $textBody . "\r\n\r\n";
        }
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $htmlBody . "\r\n\r\n";
        $body .= "--{$boundary}--\r\n";
        return $body;
    }

    private function getRegistrationConfirmationHTML($userData, $eventData) {
        return "
<!DOCTYPE html>
<html lang='en'>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Registration Confirmed</title>
<style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f4f4f4;}
.container{max-width:600px;margin:20px auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,.1);}
.header{background:linear-gradient(135deg,#FF4444,#FF6B35);color:#fff;padding:30px 20px;border-radius:8px 8px 0 0;text-align:center;margin:-20px -20px 30px;}
.header h1{margin:0;font-size:26px;}
.event-info{background:#fff8f8;padding:18px;border-radius:6px;margin:20px 0;border-left:4px solid #FF4444;}
.info-row{display:flex;justify-content:space-between;margin:8px 0;padding:6px 0;border-bottom:1px solid #eee;}
.info-label{font-weight:bold;color:#555;}
.bib-note{background:#f9f9f9;border:1px dashed #ddd;border-radius:6px;padding:12px;font-size:13px;color:#666;margin:16px 0;}
.tagline{text-align:center;font-size:15px;font-weight:700;color:#FF6B35;margin-top:12px;}
.footer{text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #eee;color:#999;font-size:12px;}
</style>
</head>
<body>
<div class='container'>
  <div class='header'>
    <div style='font-size:40px;margin-bottom:10px;'>🏃‍♂️🏃‍♀️</div>
    <h1>Registration Confirmed!</h1>
    <p style='margin:6px 0 0;opacity:.88;font-size:14px;'>Fitness Conscious Goa Run</p>
  </div>
  <p>Dear <strong>{$userData['firstName']} {$userData['lastName']}</strong>,</p>
  <p>Thank you for registering for the <strong>Fitness Conscious Goa Run</strong>! 🏃‍♂️🏃‍♀️<br>
  Your registration and payment have been <strong style='color:#FF4444;'>successfully received</strong>. Your registration is now confirmed. 🎉</p>
  <div class='event-info'>
    <strong style='color:#FF4444;font-size:13px;text-transform:uppercase;letter-spacing:.05em;'>📅 Event Details</strong>
    <div class='info-row'><span class='info-label'>Event</span><span>{$eventData['title']}</span></div>
    <div class='info-row'><span class='info-label'>Date</span><span>" . date('j F Y', strtotime($eventData['date'])) . "</span></div>
    <div class='info-row'><span class='info-label'>Venue</span><span>{$eventData['location']}</span></div>
    <div class='info-row' style='border:none;'><span class='info-label'>Distance</span><span>7 KM</span></div>
  </div>
  <div class='bib-note'>ℹ️ Your <strong>BIB number</strong> and further event details will be shared with you separately.</div>
  <p>Thank you for being part of <strong>Fitness Conscious Goa Run</strong>.</p>
  <p class='tagline'>Run • Stay Fit • Stay Healthy!</p>
  <div class='footer'>This is an automated email. Please do not reply to this address.<br>Fitness Conscious Goa</div>
</div>
</body></html>";
    }

    private function getPaymentReceiptHTML($userData, $eventData, $paymentData) {
        return "
<!DOCTYPE html>
<html lang='en'>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Payment Receipt</title>
<style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f4f4f4;}
.container{max-width:600px;margin:20px auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,.1);}
.header{background:linear-gradient(135deg,#FF4444,#FF6B35);color:#fff;padding:30px 20px;border-radius:8px 8px 0 0;text-align:center;margin:-20px -20px 30px;}
.header h1{margin:0;font-size:26px;}
.event-info{background:#fff8f8;padding:18px;border-radius:6px;margin:20px 0;border-left:4px solid #FF4444;}
.payment-info{background:#f8f8f8;padding:18px;border-radius:6px;margin:20px 0;border-left:4px solid #28a745;}
.info-row{display:flex;justify-content:space-between;margin:8px 0;padding:6px 0;border-bottom:1px solid #eee;}
.info-label{font-weight:bold;color:#555;}
.amount{font-size:24px;font-weight:700;color:#FF4444;text-align:center;padding:14px;background:#fff8f8;border-radius:6px;margin:16px 0;}
.bib-note{background:#f9f9f9;border:1px dashed #ddd;border-radius:6px;padding:12px;font-size:13px;color:#666;margin:16px 0;}
.tagline{text-align:center;font-size:15px;font-weight:700;color:#FF6B35;margin-top:12px;}
.footer{text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #eee;color:#999;font-size:12px;}
</style>
</head>
<body>
<div class='container'>
  <div class='header'>
    <div style='font-size:40px;margin-bottom:10px;'>🏃‍♂️🏃‍♀️</div>
    <h1>Registration Confirmed!</h1>
    <p style='margin:6px 0 0;opacity:.88;font-size:14px;'>Fitness Conscious Goa Run</p>
  </div>
  <p>Dear <strong>{$userData['firstName']} {$userData['lastName']}</strong>,</p>
  <p>Thank you for registering for the <strong>Fitness Conscious Goa Run</strong>! 🏃‍♂️🏃‍♀️<br>
  Your registration and payment have been <strong style='color:#FF4444;'>successfully received</strong>. Your registration is now confirmed. 🎉</p>
  <div class='amount'>Amount Paid: ₹{$paymentData['amount']}</div>
  <div class='event-info'>
    <strong style='color:#FF4444;font-size:13px;text-transform:uppercase;letter-spacing:.05em;'>📅 Event Details</strong>
    <div class='info-row'><span class='info-label'>Event</span><span>{$eventData['title']}</span></div>
    <div class='info-row'><span class='info-label'>Date</span><span>" . date('j F Y', strtotime($eventData['date'])) . "</span></div>
    <div class='info-row'><span class='info-label'>Venue</span><span>{$eventData['location']}</span></div>
    <div class='info-row' style='border:none;'><span class='info-label'>Distance</span><span>7 KM</span></div>
  </div>
  <div class='payment-info'>
    <strong style='color:#28a745;font-size:13px;text-transform:uppercase;letter-spacing:.05em;'>💳 Payment Details</strong>
    <div class='info-row'><span class='info-label'>Payment ID</span><span>{$paymentData['payment_id']}</span></div>
    <div class='info-row'><span class='info-label'>Order ID</span><span>{$paymentData['order_id']}</span></div>
    <div class='info-row'><span class='info-label'>Method</span><span>{$paymentData['method']}</span></div>
    <div class='info-row' style='border:none;'><span class='info-label'>Status</span><span style='color:#28a745;font-weight:bold;'>✅ {$paymentData['status']}</span></div>
  </div>
  <div class='bib-note'>ℹ️ Your <strong>BIB number</strong> and further event details will be shared with you separately.</div>
  <p>Thank you for being part of <strong>Fitness Conscious Goa Run</strong>.</p>
  <p class='tagline'>Run • Stay Fit • Stay Healthy!</p>
  <div class='footer'>This is an automated receipt. Please save this email for your records.<br>Fitness Conscious Goa — Payment processed securely via Razorpay</div>
</div>
</body></html>";
    }

    private function getRegistrationConfirmationText($userData, $eventData) {
        return "Registration Confirmed!\n\nDear {$userData['firstName']} {$userData['lastName']},\n\n"
            . "Thank you for registering for the Fitness Conscious Goa Run!\n"
            . "Your registration is now confirmed.\n\n"
            . "EVENT DETAILS:\n"
            . "- Event: {$eventData['title']}\n"
            . "- Date: " . date('j F Y', strtotime($eventData['date'])) . "\n"
            . "- Venue: {$eventData['location']}\n"
            . "- Distance: 7 KM\n\n"
            . "Your BIB number and further event details will be shared separately.\n\n"
            . "Thank you for being part of Fitness Conscious Goa Run.\n"
            . "Run • Stay Fit • Stay Healthy!\n\n"
            . "Fitness Conscious Goa";
    }

    private function getPaymentReceiptText($userData, $eventData, $paymentData) {
        return "Registration Confirmed!\n\nDear {$userData['firstName']} {$userData['lastName']},\n\n"
            . "Thank you for registering for the Fitness Conscious Goa Run!\n"
            . "Your registration and payment of Rs.{$paymentData['amount']} have been successfully received.\n\n"
            . "EVENT DETAILS:\n"
            . "- Event: {$eventData['title']}\n"
            . "- Date: " . date('j F Y', strtotime($eventData['date'])) . "\n"
            . "- Venue: {$eventData['location']}\n"
            . "- Distance: 7 KM\n\n"
            . "PAYMENT DETAILS:\n"
            . "- Payment ID: {$paymentData['payment_id']}\n"
            . "- Amount: Rs.{$paymentData['amount']}\n"
            . "- Status: {$paymentData['status']}\n\n"
            . "Your BIB number and further event details will be shared separately.\n\n"
            . "Run • Stay Fit • Stay Healthy!\n\n"
            . "Fitness Conscious Goa";
    }
}
?>
