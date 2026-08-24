<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once '../../includes/config/database.php';

try {
    // Define access control for includes
    define('ACCESS_CONTROL', true);
    
    // Get database connection
    $pdo = DatabaseConfig::getConnection();
    
    // Get filter parameters
    $type = $_GET['type'] ?? null;
    $active_only = isset($_GET['active']) ? (bool)$_GET['active'] : true;
    
    // Build query
    // Check if contact columns exist
    $hasContactCols = false;
    try {
        $check = $pdo->query("SHOW COLUMNS FROM events LIKE 'contact_name'");
        $hasContactCols = $check->rowCount() > 0;
    } catch (Exception $e) {}

    $contactSelect = $hasContactCols
        ? ", contact_name, contact_phone, contact_email"
        : ", NULL as contact_name, NULL as contact_phone, NULL as contact_email";

    // Check if custom_fields column exists
    $hasCustomFields = false;
    try {
        $check = $pdo->query("SHOW COLUMNS FROM events LIKE 'custom_fields'");
        $hasCustomFields = $check->rowCount() > 0;
    } catch (Exception $e) {}

    $customFieldsSelect = $hasCustomFields ? ", custom_fields" : ", NULL as custom_fields";

    // Check if event_details column exists
    $hasEventDetails = false;
    try {
        $check = $pdo->query("SHOW COLUMNS FROM events LIKE 'event_details'");
        $hasEventDetails = $check->rowCount() > 0;
    } catch (Exception $e) {}

    $eventDetailsSelect = $hasEventDetails ? ", event_details" : ", NULL as event_details";

    // Check if extra_info column exists
    $hasExtraInfo = false;
    try {
        $check = $pdo->query("SHOW COLUMNS FROM events LIKE 'extra_info'");
        $hasExtraInfo = $check->rowCount() > 0;
    } catch (Exception $e) {}

    $extraInfoSelect = $hasExtraInfo ? ", extra_info" : ", NULL as extra_info";

    $sql = "SELECT 
                id, slug, title, description, location, image, 
                date, start_time, type, is_paid, amount, currency,
                is_active, created_at
                {$contactSelect}
                {$customFieldsSelect}
                {$eventDetailsSelect}
                {$extraInfoSelect}
            FROM events 
            WHERE 1=1";
    
    $params = [];
    
    // Add filters
    if ($active_only) {
        $sql .= " AND is_active = 1";
    }
    
    if ($type) {
        $sql .= " AND type = :type";
        $params['type'] = $type;
    }
    
    // Order by date
    $sql .= " ORDER BY date ASC, start_time ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format events for frontend
    $formattedEvents = [];
    foreach ($events as $event) {
        $formattedEvents[] = [
            'id' => (int)$event['id'],
            'slug' => $event['slug'],
            'title' => $event['title'],
            'description' => $event['description'],
            'event_details' => $event['event_details'] ?? null,
            'extra_info' => !empty($event['extra_info']) ? json_decode($event['extra_info'], true) : [],
            'location' => $event['location'],
            'image' => $event['image'],
            'date' => $event['date'],
            'start_time' => $event['start_time'],
            'type' => $event['type'],
            'is_paid' => (bool)$event['is_paid'],
            'amount' => $event['amount'] ? (float)$event['amount'] : 0,
            'currency' => $event['currency'] ?? 'INR',
            'is_active' => (bool)$event['is_active'],
            'contact_name'  => $event['contact_name'] ?? null,
            'contact_phone' => $event['contact_phone'] ?? null,
            'contact_email' => $event['contact_email'] ?? null,
            'custom_fields' => !empty($event['custom_fields']) ? json_decode($event['custom_fields'], true) : [],
            'created_at' => $event['created_at'],
            'price' => $event['amount'] ? (float)$event['amount'] : 0,
            'formatted_date' => date('M j, Y', strtotime($event['date'])),
            'formatted_time' => date('g:i A', strtotime($event['start_time'])),
            'formatted_datetime' => date('M j, Y \a\t g:i A', strtotime($event['date'] . ' ' . $event['start_time']))
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $formattedEvents,
        'count' => count($formattedEvents),
        'message' => 'Events retrieved successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Error fetching events: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'data' => [],
        'message' => 'Failed to retrieve events'
    ]);
}