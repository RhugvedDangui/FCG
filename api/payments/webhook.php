<?php
header('Content-Type: application/json');
http_response_code(200); // Razorpay expects 200 to stop retries

require_once '../../includes/config/database.php';
require_once '../../includes/config/env.php';
require_once '../../includes/services/WebhookEmailHandler.php';
require_once '../../payments/vendor/autoload.php';

use Razorpay\Api\Api;

try {
    // 1️⃣ Read webhook body & signature
    $body = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';

    if (!$body || !$signature) {
        // Nothing to process, just exit
        exit;
    }

    // 2️⃣ Verify signature
    $webhookSecret = EnvLoader::get('RAZORPAY_WEBHOOK_SECRET');
    if (!$webhookSecret || !hash_equals(hash_hmac('sha256', $body, $webhookSecret), $signature)) {
        // Invalid signature, ignore
        exit;
    }

    // 3️⃣ Decode payload
    $payload = json_decode($body, true);
    if (!$payload) exit;

    $eventType = $payload['event'] ?? '';
    $payment = $payload['payload']['payment']['entity'] ?? null;
    if (!$payment) exit;

    $orderId = $payment['order_id'] ?? null;
    $paymentId = $payment['id'] ?? null;
    $status = $payment['status'] ?? null;
    if (!$orderId || !$paymentId) exit;

    // 4️⃣ Database connection
    $conn = DatabaseConfig::getConnection();

    // 5️⃣ Update paymentinfo table
    $stmt = $conn->prepare("
        UPDATE paymentinfo
        SET payment_id = ?, payment_status = ?, amount = ?, currency = ?, method = ?, payment_response = ?, updated_at = NOW()
        WHERE order_id = ?
    ");
    $stmt->execute([
        $paymentId,
        $status,
        $payment['amount'],
        $payment['currency'],
        $payment['method'],
        json_encode($payment),
        $orderId
    ]);

    // 6️⃣ Update registrations only if captured
    if ($eventType === 'payment.captured') {
        $stmt = $conn->prepare("UPDATE registrations SET ispaid = 1 WHERE order_id = ?");
        $stmt->execute([$orderId]);
        
        // 7️⃣ Send confirmation and receipt emails (safely)
        try {
            $emailHandler = new WebhookEmailHandler();
            $emailsSent = $emailHandler->handlePaymentCaptured($orderId, $payment);
            
            if ($emailsSent) {
                error_log("✅ Emails sent successfully for order: {$orderId}");
            } else {
                error_log("⚠️ Email sending failed for order: {$orderId} (but payment processed)");
            }
        } catch (Throwable $e) {
            // Catch ALL errors/exceptions including fatal errors
            error_log("❌ Email handler exception for order {$orderId}: " . $e->getMessage());
        }
    }

} catch (Throwable $e) {
    // Catch ALL errors including fatal errors
    error_log("🚨 Webhook fatal error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
}

// CRITICAL: Always return 200 to Razorpay regardless of any errors
http_response_code(200);
exit;
