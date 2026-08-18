<?php
/**
 * Razorpay Configuration API Endpoint
 * Returns the Razorpay Key ID for frontend use
 * 
 * Security: Only returns the public key ID, never the secret
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Simple .env file loader
 * Loads environment variables from .env file into $_ENV superglobal
 */
function loadEnvFile($filePath) {
    if (!file_exists($filePath)) {
        throw new Exception('.env file not found');
    }
    
    $envContent = file_get_contents($filePath);
    $envLines = explode("\n", $envContent);
    
    foreach ($envLines as $line) {
        $line = trim($line);
        
        // Skip empty lines and comments
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        
        // Parse key=value pairs
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1]);
            
            // Remove quotes if present
            if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') || 
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                $value = substr($value, 1, -1);
            }
            
            $_ENV[$key] = $value;
        }
    }
}

try {
    // Load .env file from project root
    $envFile = '../../.env';
    loadEnvFile($envFile);
    
    // Get Razorpay Key ID (public key - safe to expose)
    $razorpayKeyId = $_ENV['RAZORPAY_KEY_ID'] ?? null;
    
    if (!$razorpayKeyId) {
        throw new Exception('Razorpay Key ID not configured');
    }
    
    // Return only the public key ID
    echo json_encode([
        'success' => true,
        'key_id' => $razorpayKeyId
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Configuration error',
        'message' => $e->getMessage()
    ]);
}
?>