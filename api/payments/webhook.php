<?php
header('Content-Type: application/json');
http_response_code(200); // Razorpay expects 200 to stop retries

require_once '../../includes/config/database.php';
require_once '../../includes/config/env.php';
require_once '../../includes/services/WebhookEmailHandler.php';
require_once '../../payments/vendor/autoload.php';

use Razorpay\Api\Api;

// Read body ONCE
$body      = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';

try {
    if (!$body || !$signature) exit;

    $webhookSecret = EnvLoader::get('RAZORPAY_WEBHOOK_SECRET');
    if (!$webhookSecret || !hash_equals(hash_hmac('sha256', $body, $webhookSecret), $signature)) {
        exit;
    }

    $payload = json_decode($body, true);
    if (!$payload) exit;

    $eventType = $payload['event'] ?? '';
    $payment   = $payload['payload']['payment']['entity'] ?? null;
    if (!$payment) exit;

    $orderId   = $payment['order_id'] ?? null;
    $paymentId = $payment['id'] ?? null;
    if (!$orderId || !$paymentId) exit;

    $conn = DatabaseConfig::getConnection();

    // Update paymentinfo
    $stmt = $conn->prepare("
        UPDATE paymentinfo
        SET payment_id=?, payment_status=?, amount=?, currency=?, method=?, payment_response=?, updated_at=NOW()
        WHERE order_id=?
    ");
    $stmt->execute([
        $paymentId, $payment['status'], $payment['amount'],
        $payment['currency'], $payment['method'], json_encode($payment), $orderId
    ]);

    if ($eventType === 'payment.captured') {
        // Mark as paid
        $conn->prepare("UPDATE registrations SET ispaid=1 WHERE order_id=?")->execute([$orderId]);

        // Send email
        try {
            $emailHandler = new WebhookEmailHandler();
            $emailHandler->handlePaymentCaptured($orderId, $payment);
        } catch (Throwable $e) {
            error_log("Email handler error for order {$orderId}: " . $e->getMessage());
        }
    }

} catch (Throwable $e) {
    error_log("Webhook error: " . $e->getMessage());
}

http_response_code(200);
exit;
