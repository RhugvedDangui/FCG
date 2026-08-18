<?php
/**
 * Simple Environment Variable Loader
 * No external dependencies required
 */
class EnvLoader {
    public static function load($envFile = '.env') {
        // Get the project root directory (where .env should be located)
        $rootPath = dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR;
        $envPath = $rootPath . $envFile;
        
        if (!file_exists($envPath)) {
            throw new Exception(".env file not found at: $envPath");
        }
        
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parse key=value pairs
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                $value = trim($value, '"\'');
                
                // Set environment variable
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
    
    public static function get($key, $default = null) {
        return $_ENV[$key] ?? $default;
    }
}

// Auto-load environment variables
try {
    EnvLoader::load();
} catch (Exception $e) {
    // Fallback to default values if .env not found
    error_log("Environment file not found: " . $e->getMessage());
}
?>