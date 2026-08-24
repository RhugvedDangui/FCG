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
    // 1️⃣ Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // 2️⃣ Get input data (handle both JSON and FormData)
    $input = null;
    $user = null;
    $event_id = null;
    
    // Check if it's FormData (with files) or JSON
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'multipart/form-data') !== false) {
        // Handle FormData (with file uploads)
        $event_id = $_POST['event_id'] ?? null;
        if (!$event_id) {
            throw new Exception('Missing event_id in FormData');
        }
        
        $user = [
            'firstName' => $_POST['firstName'] ?? '',
            'lastName' => $_POST['lastName'] ?? '',
            'fullName' => ($_POST['firstName'] ?? '') . ' ' . ($_POST['lastName'] ?? ''),
            'email' => $_POST['email'] ?? '',
            'mobileNumber' => $_POST['mobileNumber'] ?? '',
            'gender' => $_POST['gender'] ?? '',
            'dateOfBirth' => $_POST['dateOfBirth'] ?? '',
            'address' => $_POST['address'] ?? '',
            'tshirtSize' => $_POST['tshirtSize'] ?? '',
            'runnerGroup' => $_POST['runnerGroup'] ?? '',
            'emergencyContactName' => $_POST['emergencyContactName'] ?? '',
            'emergencyContactMobile' => $_POST['emergencyContactMobile'] ?? ''
        ];
    } else {
        // Handle JSON (backward compatibility)
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input || !isset($input['event_id']) || !isset($input['user_data'])) {
            throw new Exception('Missing required fields in JSON');
        }
        
        $event_id = $input['event_id'];
        $user = $input['user_data'];
    }
    
    $event_id = htmlspecialchars($event_id);

    // 3️⃣ Database connection
    $conn = DatabaseConfig::getConnection();

    // 4️⃣ Fetch event amount from DB
    $stmt = $conn->prepare("SELECT amount FROM events WHERE id = ?");
    $stmt->execute([$event_id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$event) {
        throw new Exception('Invalid event ID');
    }

    $amount = (int) $event['amount'];

    // 5️⃣ Razorpay API keys from environment variables
    $razorpayKey = EnvLoader::get('RAZORPAY_KEY_ID');
    $razorpaySecret = EnvLoader::get('RAZORPAY_KEY_SECRET');

    if (empty($razorpayKey) || empty($razorpaySecret)) {
        error_log('Razorpay credentials missing from environment variables');
        throw new Exception('Payment system not configured. Please contact support.');
    }

    // 6️⃣ Create Razorpay order
    $api = new Api($razorpayKey, $razorpaySecret);
    $razorpayOrder = $api->order->create([
        'receipt' => 'rcpt_' . uniqid(),
        'amount' => $amount * 100, // convert to paise
        'currency' => 'INR'
    ]);
    $order_id = $razorpayOrder['id'];

    // 7️⃣ Handle file upload for ID proof (temporarily before registration)
    $uploadedFileInfo = null;
    
    if (isset($_FILES['idProof']) && $_FILES['idProof']['error'] === UPLOAD_ERR_OK) {
        $fileExtension = strtolower(pathinfo($_FILES['idProof']['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png'];
        
        if (!in_array($fileExtension, $allowedExtensions)) {
            throw new Exception('Invalid file type. Only JPG and PNG images are allowed.');
        }

        if ($_FILES['idProof']['size'] > 5 * 1024 * 1024) { // 5MB limit
            throw new Exception('File too large. Maximum size is 5MB.');
        }

        // Store file info for later processing
        $uploadedFileInfo = [
            'tmp_name' => $_FILES['idProof']['tmp_name'],
            'extension' => $fileExtension
        ];
    }

    // 8️⃣ Calculate age from date of birth
    $age = null;
    if (!empty($user['dateOfBirth'])) {
        $birthDate = new DateTime($user['dateOfBirth']);
        $currentDate = new DateTime();
        $age = $currentDate->diff($birthDate)->y;
    }

    // Save user info + order_id to registrations table (with all fields including age)
    $stmt = $conn->prepare("
    INSERT INTO registrations (
        event_id, first_name, last_name, full_name, email, mobile_number, age,
        gender, date_of_birth, address, tshirt_size, runner_group, 
        emergency_contact_name, emergency_contact_mobile, order_id, ispaid, registration_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $event_id,
    $user['firstName'] ?? '',
    $user['lastName'] ?? '',
    $user['fullName'] ?? '',
    $user['email'] ?? '',
    $user['mobileNumber'] ?? '',
    $age, // calculated age
    $user['gender'] ?? '',
    $user['dateOfBirth'] ?? null,
    $user['address'] ?? '',
    $user['tshirtSize'] ?? '',
    $user['runnerGroup'] ?? '',
    $user['emergencyContactName'] ?? '',
    $user['emergencyContactMobile'] ?? '',
    $order_id,
    0,   // ispaid = false initially
    'paid' // registration_type for paid events
]);

    // Get the registration ID for linking
    $registration_id = $conn->lastInsertId();

    // Save custom field answers
    $customAnswers = $_POST['custom_field_answers'] ?? '';
    if ($customAnswers) {
        $answers = json_decode($customAnswers, true);
        if (is_array($answers)) {
            $stmt = $conn->prepare("INSERT INTO registration_custom_answers (registration_id, field_label, field_value) VALUES (?, ?, ?)");
            foreach ($answers as $answer) {
                if (!empty($answer['label'])) {
                    $stmt->execute([$registration_id, $answer['label'], $answer['value'] ?? '']);
                }
            }
        }
    }

    // 9️⃣ Handle file upload (temporarily store in filesystem until DB is updated)
    if ($uploadedFileInfo) {
        // Get event data for directory naming
        $stmt = $conn->prepare("SELECT id, title FROM events WHERE id = ?");
        $stmt->execute([$event_id]);
        $eventData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get event slug/name for directory
        $eventSlug = strtolower(str_replace([' ', '-'], '_', $eventData['title']));
        $eventSlug = preg_replace('/[^a-z0-9_]/', '', $eventSlug);
        
        // Create directory structure: uploads/id-proofs/{event_name_id}/
        $uploadDir = "../../uploads/id-proofs/{$eventSlug}_{$eventData['id']}/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Create filename: {username}_{registration_id}.{extension}
        $fullName = trim(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? ''));
        $username = strtolower(str_replace([' ', '-'], '_', $fullName));
        $username = preg_replace('/[^a-z0-9_]/', '', $username);
        $fileName = "{$username}_{$registration_id}.{$uploadedFileInfo['extension']}";
        $filePath = $uploadDir . $fileName;

        if (!move_uploaded_file($uploadedFileInfo['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload ID proof');
        }

        // Update registration with file path in id_proof column
        $stmt = $conn->prepare("UPDATE registrations SET id_proof = ? WHERE id = ?");
        $stmt->execute([$filePath, $registration_id]);
        
        error_log("ID proof saved to database for registration $registration_id: $filePath");
    }

    // 8️⃣ Create initial paymentinfo row
    $stmt = $conn->prepare("
        INSERT INTO paymentinfo (
            registration_id, order_id, payment_status
        ) VALUES (?, ?, ?)
    ");
    $stmt->execute([
        $registration_id,
        $order_id,
        'created' // initial status
    ]);

    // 9️⃣ Return JSON to frontend
    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'order_id' => $order_id,
        'amount' => $amount,
        'currency' => 'INR',
        'razorpaykey' => $razorpayKey
    ]);

} catch (\Razorpay\Api\Errors\AuthenticationError $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Razorpay authentication failed: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
