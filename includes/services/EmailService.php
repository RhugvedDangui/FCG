<?php
/**
 * Email Service for Event Registration System
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
        $subject  = "Registration Confirmed - " . ($eventData['title'] ?? 'Event');
        $htmlBody = $this->getRegistrationConfirmationHTML($userData, $eventData);
        $textBody = $this->getRegistrationConfirmationText($userData, $eventData);
        return $this->sendEmail($userEmail, $subject, $htmlBody, $textBody);
    }

    public function sendPaymentReceipt($userEmail, $userData, $eventData, $paymentData) {
        $subject  = "Payment Receipt - " . ($eventData['title'] ?? 'Event');
        $htmlBody = $this->getPaymentReceiptHTML($userData, $eventData, $paymentData);
        $textBody = $this->getPaymentReceiptText($userData, $eventData, $paymentData);
        return $this->sendEmail($userEmail, $subject, $htmlBody, $textBody);
    }

    /**
     * Send admin notification with full registration details
     */
    public function sendAdminNotification($regData, $eventData, $paymentData = null) {
        $adminEmail = 'fitnessconsciousgoa@gmail.com';
        $eventTitle = $eventData['title'] ?? 'Event';
        $subject    = "New Registration - {$eventTitle}";

        $rows = '';
        $fields = [
            'Registration ID'        => $regData['id'] ?? '',
            'Event'                  => $eventTitle,
            'Name'                   => ($regData['first_name'] ?? '') . ' ' . ($regData['last_name'] ?? ''),
            'Email'                  => $regData['email'] ?? '',
            'Mobile'                 => $regData['mobile_number'] ?? '',
            'Age'                    => $regData['age'] ?? '',
            'Gender'                 => ucfirst($regData['gender'] ?? ''),
            'Date of Birth'          => $regData['date_of_birth'] ?? '',
            'Address'                => $regData['address'] ?? '',
            'T-Shirt Size'           => $regData['tshirt_size'] ?? '',
            'Runner Group'           => $regData['runner_group'] ?? '',
            'Emergency Contact'      => ($regData['emergency_contact_name'] ?? '') . ' — ' . ($regData['emergency_contact_mobile'] ?? ''),
            'Registration Type'      => ucfirst($regData['registration_type'] ?? ''),
            'Payment Status'         => isset($regData['ispaid']) && $regData['ispaid'] ? 'Paid' : 'Unpaid',
            'Order ID'               => $regData['order_id'] ?? '',
            'Registered On'          => !empty($regData['created_at']) ? date('d M Y H:i', strtotime($regData['created_at'])) : '',
        ];

        if ($paymentData) {
            $fields['Payment ID']     = $paymentData['payment_id'] ?? '';
            $fields['Amount Paid']    = 'Rs.' . ($paymentData['amount'] ?? '');
            $fields['Payment Method'] = $paymentData['method'] ?? '';
        }

        foreach ($fields as $label => $value) {
            if ($value === '' || $value === ' — ') continue;
            $rows .= "<tr>
                <td style='padding:7px 12px;color:#888;font-size:13px;width:160px;border-bottom:1px solid #f0f0f0;'>{$label}</td>
                <td style='padding:7px 12px;color:#222;font-size:13px;border-bottom:1px solid #f0f0f0;'>" . htmlspecialchars((string)$value) . "</td>
            </tr>";
        }

        $fromName = htmlspecialchars($this->fromName);
        $html = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;'>
<table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center'>
<table style='max-width:560px;width:100%;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.08);'>
  <tr><td style='background:linear-gradient(135deg,#FF4444,#FF6B35);padding:24px;text-align:center;'>
    <h2 style='margin:0;color:#fff;font-size:18px;'>New Registration Alert</h2>
    <p style='margin:6px 0 0;color:rgba(255,255,255,.88);font-size:13px;'>{$eventTitle}</p>
  </td></tr>
  <tr><td style='padding:0;'>
    <table width='100%' cellpadding='0' cellspacing='0'>{$rows}</table>
  </td></tr>
  <tr><td style='background:#f8f8f8;padding:14px 20px;text-align:center;border-top:1px solid #eee;'>
    <p style='margin:0;font-size:11px;color:#999;'>Automated admin notification &mdash; {$fromName}</p>
  </td></tr>
</table></td></tr></table>
</body></html>";

        return $this->sendEmailDirect($adminEmail, $subject, $html);
    }

    /**
     * Send email directly without CC (for admin notifications)
     */
    private function sendEmailDirect($to, $subject, $htmlBody) {
        try {
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return false;

            require_once __DIR__ . '/../../vendor/autoload.php';

            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host     = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUsername;
            $mail->Password = $this->smtpPassword;
            $mail->Port     = (int)$this->smtpPort;

            if (strtolower($this->smtpEncryption) === 'ssl') {
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            }

            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer'       => false,
                    'verify_peer_name'  => false,
                    'allow_self_signed' => true,
                ]
            ];

            $mail->setFrom($this->fromAddress, $this->fromName);
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->isHTML(true);
            $mail->Body    = $htmlBody;
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Admin notification failed: " . $e->getMessage());
            return false;
        }
    }

    private function sendEmail($to, $subject, $htmlBody, $textBody = null) {
        try {
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email address: ' . $to);
            }

            require_once __DIR__ . '/../../vendor/autoload.php';

            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host     = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUsername;
            $mail->Password = $this->smtpPassword;
            $mail->Port     = (int)$this->smtpPort;

            if (strtolower($this->smtpEncryption) === 'ssl') {
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            }

            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer'       => false,
                    'verify_peer_name'  => false,
                    'allow_self_signed' => true,
                ]
            ];

            $mail->setFrom($this->fromAddress, $this->fromName);
            $mail->addAddress($to);
            $mail->addCC('fitnessconsciousgoa@gmail.com', 'Fitness Conscious Goa');
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

    private function getRegistrationConfirmationHTML($userData, $eventData) {
        $name       = htmlspecialchars(($userData['firstName'] ?? '') . ' ' . ($userData['lastName'] ?? ''));
        $eventTitle = htmlspecialchars($eventData['title'] ?? 'Event');
        $eventDate  = !empty($eventData['date']) ? date('j F Y', strtotime($eventData['date'])) : '';
        $eventVenue = htmlspecialchars($eventData['location'] ?? '');
        $fromName   = htmlspecialchars($this->fromName);
        $dateRow    = $eventDate  ? "<tr><td style='color:#888;padding:4px 0;width:80px;'>Date</td><td style='color:#222;padding:4px 0;'>{$eventDate}</td></tr>" : '';
        $venueRow   = $eventVenue ? "<tr><td style='color:#888;padding:4px 0;'>Venue</td><td style='color:#222;padding:4px 0;'>{$eventVenue}</td></tr>" : '';

        return "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'><title>Registration Confirmed</title></head>
<body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>
<table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f4;padding:20px 0;'><tr><td align='center'>
<table width='100%' cellpadding='0' cellspacing='0' style='max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);'>
  <tr><td style='background:linear-gradient(135deg,#FF4444,#FF6B35);padding:32px;text-align:center;'>
    <h1 style='margin:0;color:#fff;font-size:22px;font-weight:700;'>Registration Confirmed</h1>
    <p style='margin:8px 0 0;color:rgba(255,255,255,.88);font-size:14px;'>{$eventTitle}</p>
  </td></tr>
  <tr><td style='padding:32px;'>
    <p style='margin:0 0 16px;font-size:15px;color:#333;'>Dear <strong>{$name}</strong>,</p>
    <p style='margin:0 0 20px;font-size:14px;color:#555;line-height:1.7;'>
      Thank you for registering for <strong>{$eventTitle}</strong>.<br>
      Your registration has been <strong style='color:#FF4444;'>successfully confirmed</strong>.
    </p>
    <table width='100%' cellpadding='0' cellspacing='0' style='background:#fff8f8;border:1px solid rgba(255,68,68,.15);border-radius:10px;margin:0 0 20px;'>
      <tr><td style='padding:12px 16px;border-bottom:1px solid rgba(255,68,68,.1);'>
        <span style='font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#FF6B35;'>Event Details</span>
      </td></tr>
      <tr><td style='padding:12px 16px;'>
        <table cellpadding='0' cellspacing='0' style='font-size:14px;width:100%;'>
          <tr><td style='color:#888;padding:4px 0;width:80px;'>Event</td><td style='color:#222;padding:4px 0;'><strong>{$eventTitle}</strong></td></tr>
          {$dateRow}{$venueRow}
        </table>
      </td></tr>
    </table>
    <table width='100%' cellpadding='0' cellspacing='0' style='background:#f9f9f9;border:1px dashed #ddd;border-radius:8px;margin:0 0 20px;'>
      <tr><td style='padding:12px 16px;font-size:13px;color:#666;'>Your <strong>BIB number</strong> and further event details will be shared separately.</td></tr>
    </table>
    <p style='margin:0 0 4px;font-size:14px;color:#555;'>Thank you for being part of <strong>{$eventTitle}</strong>.</p>
    <p style='margin:0;font-size:14px;font-weight:700;color:#FF6B35;'>Run &bull; Stay Fit &bull; Stay Healthy!</p>
  </td></tr>
  <tr><td style='background:#f8f8f8;padding:16px 32px;text-align:center;border-top:1px solid #eee;'>
    <p style='margin:0;font-size:12px;color:#999;'>This is an automated email. Please do not reply.<br>{$fromName}</p>
  </td></tr>
</table></td></tr></table></body></html>";
    }

    private function getPaymentReceiptHTML($userData, $eventData, $paymentData) {
        $name       = htmlspecialchars(($userData['firstName'] ?? '') . ' ' . ($userData['lastName'] ?? ''));
        $eventTitle = htmlspecialchars($eventData['title'] ?? 'Event');
        $eventDate  = !empty($eventData['date']) ? date('j F Y', strtotime($eventData['date'])) : '';
        $eventVenue = htmlspecialchars($eventData['location'] ?? '');
        $amount     = htmlspecialchars($paymentData['amount'] ?? '');
        $paymentId  = htmlspecialchars($paymentData['payment_id'] ?? '');
        $orderId    = htmlspecialchars($paymentData['order_id'] ?? '');
        $method     = htmlspecialchars(ucfirst($paymentData['method'] ?? ''));
        $status     = htmlspecialchars(ucfirst($paymentData['status'] ?? ''));
        $fromName   = htmlspecialchars($this->fromName);
        $dateRow    = $eventDate  ? "<tr><td style='color:#888;padding:4px 0;width:80px;'>Date</td><td style='color:#222;padding:4px 0;'>{$eventDate}</td></tr>" : '';
        $venueRow   = $eventVenue ? "<tr><td style='color:#888;padding:4px 0;'>Venue</td><td style='color:#222;padding:4px 0;'>{$eventVenue}</td></tr>" : '';

        return "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'><title>Payment Receipt</title></head>
<body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>
<table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f4;padding:20px 0;'><tr><td align='center'>
<table width='100%' cellpadding='0' cellspacing='0' style='max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);'>
  <tr><td style='background:linear-gradient(135deg,#FF4444,#FF6B35);padding:32px;text-align:center;'>
    <h1 style='margin:0;color:#fff;font-size:22px;font-weight:700;'>Registration Confirmed</h1>
    <p style='margin:8px 0 0;color:rgba(255,255,255,.88);font-size:14px;'>{$eventTitle}</p>
  </td></tr>
  <tr><td style='padding:32px;'>
    <p style='margin:0 0 16px;font-size:15px;color:#333;'>Dear <strong>{$name}</strong>,</p>
    <p style='margin:0 0 16px;font-size:14px;color:#555;line-height:1.7;'>
      Thank you for registering for <strong>{$eventTitle}</strong>.<br>
      Your registration and payment have been <strong style='color:#FF4444;'>successfully received</strong>.
    </p>
    <div style='font-size:22px;font-weight:700;color:#FF4444;text-align:center;background:#fff8f8;border-radius:8px;padding:14px;margin:0 0 20px;'>
      Amount Paid: Rs.{$amount}
    </div>
    <table width='100%' cellpadding='0' cellspacing='0' style='background:#fff8f8;border:1px solid rgba(255,68,68,.15);border-radius:10px;margin:0 0 16px;'>
      <tr><td style='padding:12px 16px;border-bottom:1px solid rgba(255,68,68,.1);'>
        <span style='font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#FF6B35;'>Event Details</span>
      </td></tr>
      <tr><td style='padding:12px 16px;'>
        <table cellpadding='0' cellspacing='0' style='font-size:14px;width:100%;'>
          <tr><td style='color:#888;padding:4px 0;width:80px;'>Event</td><td style='color:#222;padding:4px 0;'><strong>{$eventTitle}</strong></td></tr>
          {$dateRow}{$venueRow}
        </table>
      </td></tr>
    </table>
    <table width='100%' cellpadding='0' cellspacing='0' style='background:#f0fff4;border:1px solid rgba(34,197,94,.2);border-radius:10px;margin:0 0 20px;'>
      <tr><td style='padding:12px 16px;border-bottom:1px solid rgba(34,197,94,.15);'>
        <span style='font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#16a34a;'>Payment Details</span>
      </td></tr>
      <tr><td style='padding:12px 16px;'>
        <table cellpadding='0' cellspacing='0' style='font-size:14px;width:100%;'>
          <tr><td style='color:#888;padding:4px 0;width:110px;'>Payment ID</td><td style='color:#222;padding:4px 0;'>{$paymentId}</td></tr>
          <tr><td style='color:#888;padding:4px 0;'>Order ID</td><td style='color:#222;padding:4px 0;'>{$orderId}</td></tr>
          <tr><td style='color:#888;padding:4px 0;'>Method</td><td style='color:#222;padding:4px 0;'>{$method}</td></tr>
          <tr><td style='color:#888;padding:4px 0;'>Status</td><td style='color:#16a34a;font-weight:700;padding:4px 0;'>{$status}</td></tr>
        </table>
      </td></tr>
    </table>
    <table width='100%' cellpadding='0' cellspacing='0' style='background:#f9f9f9;border:1px dashed #ddd;border-radius:8px;margin:0 0 20px;'>
      <tr><td style='padding:12px 16px;font-size:13px;color:#666;'>Your <strong>BIB number</strong> and further event details will be shared separately.</td></tr>
    </table>
    <p style='margin:0 0 4px;font-size:14px;color:#555;'>Thank you for being part of <strong>{$eventTitle}</strong>.</p>
    <p style='margin:0;font-size:14px;font-weight:700;color:#FF6B35;'>Run &bull; Stay Fit &bull; Stay Healthy!</p>
  </td></tr>
  <tr><td style='background:#f8f8f8;padding:16px 32px;text-align:center;border-top:1px solid #eee;'>
    <p style='margin:0;font-size:12px;color:#999;'>This is an automated receipt. Please save for your records.<br>{$fromName} &mdash; Payment via Razorpay</p>
  </td></tr>
</table></td></tr></table></body></html>";
    }

    private function getRegistrationConfirmationText($userData, $eventData) {
        $name       = ($userData['firstName'] ?? '') . ' ' . ($userData['lastName'] ?? '');
        $eventTitle = $eventData['title'] ?? 'Event';
        $eventDate  = !empty($eventData['date']) ? date('j F Y', strtotime($eventData['date'])) : '';
        $eventVenue = $eventData['location'] ?? '';
        return "Registration Confirmed - {$eventTitle}\n\n"
            . "Dear {$name},\n\n"
            . "Thank you for registering for {$eventTitle}. Your registration is now confirmed.\n\n"
            . "EVENT DETAILS:\n"
            . "Event: {$eventTitle}\n"
            . ($eventDate  ? "Date: {$eventDate}\n"   : '')
            . ($eventVenue ? "Venue: {$eventVenue}\n" : '')
            . "\nYour BIB number and further details will be shared separately.\n\n"
            . "Run | Stay Fit | Stay Healthy!\n" . $this->fromName;
    }

    private function getPaymentReceiptText($userData, $eventData, $paymentData) {
        $name       = ($userData['firstName'] ?? '') . ' ' . ($userData['lastName'] ?? '');
        $eventTitle = $eventData['title'] ?? 'Event';
        $eventDate  = !empty($eventData['date']) ? date('j F Y', strtotime($eventData['date'])) : '';
        $eventVenue = $eventData['location'] ?? '';
        $amount     = $paymentData['amount'] ?? '';
        return "Payment Receipt - {$eventTitle}\n\n"
            . "Dear {$name},\n\n"
            . "Your registration and payment of Rs.{$amount} for {$eventTitle} have been received.\n\n"
            . "EVENT DETAILS:\n"
            . "Event: {$eventTitle}\n"
            . ($eventDate  ? "Date: {$eventDate}\n"   : '')
            . ($eventVenue ? "Venue: {$eventVenue}\n" : '')
            . "\nPAYMENT DETAILS:\n"
            . "Payment ID: " . ($paymentData['payment_id'] ?? '') . "\n"
            . "Amount: Rs.{$amount}\n"
            . "Status: " . ($paymentData['status'] ?? '') . "\n\n"
            . "Your BIB number and further details will be shared separately.\n\n"
            . "Run | Stay Fit | Stay Healthy!\n" . $this->fromName;
    }
}
?>
