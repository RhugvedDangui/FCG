<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

require_once '../../includes/config/database.php';
require_once '../../includes/config/env.php';
require_once '../../payments/vendor/autoload.php';

use Razorpay\Api\Api;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $razorpayPaymentId = $input['razorpay_payment_id'] ?? null;
    $razorpayOrderId   = $input['razorpay_order_id'] ?? null;
    $razorpaySignature = $input['razorpay_signature'] ?? null;

    if (!$razorpayPaymentId || !$razorpayOrderId || !$razorpaySignature) {
        throw new Exception('Missing payment verification fields');
    }

    // Verify signature
    $keySecret = EnvLoader::get('RAZORPAY_KEY_SECRET');
    $expectedSignature = hash_hmac('sha256', $razorpayOrderId . '|' . $razorpayPaymentId, $keySecret);

    if (!hash_equals($expectedSignature, $razorpaySignature)) {
        throw new Exception('Payment signature verification failed');
    }

    // Update DB
    $conn = DatabaseConfig::getConnection();

    $stmt = $conn->prepare("UPDATE registrations SET ispaid = 1 WHERE order_id = ?");
    $stmt->execute([$razorpayOrderId]);

    $stmt = $conn->prepare("
        UPDATE paymentinfo 
        SET payment_id = ?, payment_status = 'captured', updated_at = NOW()
        WHERE order_id = ?
    ");
    $stmt->execute([$razorpayPaymentId, $razorpayOrderId]);

    echo json_encode([
        'success' => true,
        'message' => 'Payment verified successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
