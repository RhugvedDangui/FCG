<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Suppress PHP errors from outputting HTML and breaking JSON response
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../../includes/config/database.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $eventId          = $_POST['event_id'] ?? null;
    $eventTitle       = $_POST['event_title'] ?? null;
    $eventPrice       = $_POST['event_price'] ?? 0;
    $registrationType = $_POST['registration_type'] ?? 'free';

    if (!$eventId || !$eventTitle) {
        throw new Exception('Missing required event information');
    }

    if ($eventPrice > 0 || $registrationType !== 'free') {
        throw new Exception('This endpoint only handles free event registrations');
    }

    $userData = [
        'firstName'             => $_POST['firstName'] ?? '',
        'lastName'              => $_POST['lastName'] ?? '',
        'email'                 => $_POST['email'] ?? '',
        'mobileNumber'          => $_POST['mobileNumber'] ?? '',
        'gender'                => $_POST['gender'] ?? '',
        'dateOfBirth'           => $_POST['dateOfBirth'] ?? '',
        'address'               => $_POST['address'] ?? '',
        'tshirtSize'            => $_POST['tshirtSize'] ?? '',
        'runnerGroup'           => $_POST['runnerGroup'] ?? '',
        'emergencyContactName'  => $_POST['emergencyContactName'] ?? '',
        'emergencyContactMobile'=> $_POST['emergencyContactMobile'] ?? '',
        'terms'                 => $_POST['terms'] ?? false
    ];

    $requiredFields = ['firstName','lastName','email','mobileNumber','gender','dateOfBirth','address','tshirtSize','emergencyContactName','emergencyContactMobile'];
    foreach ($requiredFields as $field) {
        if (empty($userData[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }

    if (!$userData['terms']) {
        throw new Exception('You must accept the terms and conditions');
    }

    $conn = DatabaseConfig::getConnection();

    $stmt = $conn->prepare("SELECT id, title, amount FROM events WHERE id = ?");
    $stmt->execute([$eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$event) {
        throw new Exception('Event not found');
    }

    if ($event['amount'] > 0) {
        throw new Exception('This is a paid event. Please use the payment flow.');
    }

    // Handle file upload
    $uploadedFileInfo = null;
    if (isset($_FILES['idProof']) && $_FILES['idProof']['error'] === UPLOAD_ERR_OK) {
        $fileExtension = strtolower(pathinfo($_FILES['idProof']['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, ['jpg','jpeg','png','pdf'])) {
            throw new Exception('Invalid file type. Only JPG, PNG, and PDF files are allowed.');
        }
        if ($_FILES['idProof']['size'] > 5 * 1024 * 1024) {
            throw new Exception('File too large. Maximum size is 5MB.');
        }
        $uploadedFileInfo = ['tmp_name' => $_FILES['idProof']['tmp_name'], 'extension' => $fileExtension];
    }

    // Calculate age
    $age = null;
    if (!empty($userData['dateOfBirth'])) {
        $birthDate = new DateTime($userData['dateOfBirth']);
        $age = (new DateTime())->diff($birthDate)->y;
    }

    $fullName = trim($userData['firstName'] . ' ' . $userData['lastName']);

    $stmt = $conn->prepare("
        INSERT INTO registrations (
            event_id, first_name, last_name, full_name, email, mobile_number, age,
            gender, date_of_birth, address, tshirt_size, runner_group,
            emergency_contact_name, emergency_contact_mobile, ispaid, registration_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'free')
    ");

    $stmt->execute([
        $event['id'], $userData['firstName'], $userData['lastName'], $fullName,
        $userData['email'], $userData['mobileNumber'], $age, $userData['gender'],
        $userData['dateOfBirth'], $userData['address'], $userData['tshirtSize'],
        $userData['runnerGroup'], $userData['emergencyContactName'], $userData['emergencyContactMobile']
    ]);

    $registrationId = $conn->lastInsertId();

    // Save custom field answers
    $customAnswers = $_POST['custom_field_answers'] ?? '';
    if ($customAnswers) {
        $answers = json_decode($customAnswers, true);
        if (is_array($answers)) {
            $stmt = $conn->prepare("INSERT INTO registration_custom_answers (registration_id, field_label, field_value) VALUES (?, ?, ?)");
            foreach ($answers as $answer) {
                if (!empty($answer['label'])) {
                    $stmt->execute([$registrationId, $answer['label'], $answer['value'] ?? '']);
                }
            }
        }
    }

    // Handle file upload
    if ($uploadedFileInfo) {
        $eventSlug = preg_replace('/[^a-z0-9_]/', '', strtolower(str_replace([' ','-'], '_', $event['title'])));
        $uploadDir = "../../uploads/id-proofs/{$eventSlug}_{$event['id']}/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        $username = preg_replace('/[^a-z0-9_]/', '', strtolower(str_replace([' ','-'], '_', $fullName)));
        $filePath = $uploadDir . "{$username}_{$registrationId}.{$uploadedFileInfo['extension']}";
        if (!move_uploaded_file($uploadedFileInfo['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload ID proof');
        }
        $conn->prepare("UPDATE registrations SET id_proof = ? WHERE id = ?")->execute([$filePath, $registrationId]);
    }

    // Send confirmation email (non-blocking — failure does not affect registration)
    try {
        require_once '../../includes/config/env.php';
        require_once '../../includes/services/EmailService.php';
        $emailService = new EmailService();

        $evStmt = $conn->prepare("SELECT title, date, location FROM events WHERE id = ?");
        $evStmt->execute([$event['id']]);
        $evRow = $evStmt->fetch(PDO::FETCH_ASSOC);

        $emailUserData = [
            'firstName'      => $userData['firstName'],
            'lastName'       => $userData['lastName'],
            'email'          => $userData['email'],
            'mobileNumber'   => $userData['mobileNumber'],
            'tshirtSize'     => $userData['tshirtSize'],
            'registrationId' => $registrationId
        ];
        $emailEventData = $evRow ?: ['title' => $event['title'], 'date' => date('Y-m-d'), 'location' => ''];
        $emailService->sendRegistrationConfirmation($userData['email'], $emailUserData, $emailEventData);

        // Send admin notification with full details
        $fullRegData = [
            'id'                      => $registrationId,
            'first_name'              => $userData['firstName'],
            'last_name'               => $userData['lastName'],
            'email'                   => $userData['email'],
            'mobile_number'           => $userData['mobileNumber'],
            'age'                     => $age,
            'gender'                  => $userData['gender'],
            'date_of_birth'           => $userData['dateOfBirth'],
            'address'                 => $userData['address'],
            'tshirt_size'             => $userData['tshirtSize'],
            'runner_group'            => $userData['runnerGroup'],
            'emergency_contact_name'  => $userData['emergencyContactName'],
            'emergency_contact_mobile'=> $userData['emergencyContactMobile'],
            'registration_type'       => 'free',
            'ispaid'                  => 1,
            'order_id'                => null,
            'created_at'              => date('Y-m-d H:i:s')
        ];
        $emailService->sendAdminNotification($fullRegData, $emailEventData);
    } catch (Exception $mailEx) {
        error_log("Free registration email failed (registration saved): " . $mailEx->getMessage());
    }

    echo json_encode([
        'success'         => true,
        'message'         => 'Registration successful! You will receive a confirmation email shortly.',
        'registration_id' => $registrationId,
        'event_title'     => $event['title']
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred. Please try again.']);
    error_log('Registration error: ' . $e->getMessage());
}
?>
