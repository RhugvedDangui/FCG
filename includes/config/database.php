<?php
// Load environment variables
require_once __DIR__ . '/env.php';

// Database Configuration
class DatabaseConfig {
    private static function getEnvValue($key, $default) {
        return EnvLoader::get($key, $default);
    }
    
    private static function getDbHost() {
        return self::getEnvValue('DB_HOST', 'localhost');
    }
    
    private static function getDbName() {
        return self::getEnvValue('DB_NAME', 'fitness_conscious_goa');
    }
    
    private static function getDbUsername() {
        return self::getEnvValue('DB_USERNAME', 'root');
    }
    
    private static function getDbPassword() {
        return self::getEnvValue('DB_PASSWORD', '');
    }
    
    private static function getDbCharset() {
        return self::getEnvValue('DB_CHARSET', 'utf8mb4');
    }
    
    private static $connection = null;
    
    public static function getConnection() {
        if (self::$connection === null) {
            try {
                $host = self::getDbHost();
                $dbname = self::getDbName();
                $charset = self::getDbCharset();
                $username = self::getDbUsername();
                $password = self::getDbPassword();
                
                $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
                
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                
                self::$connection = new PDO($dsn, $username, $password, $options);
                
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Database connection failed");
            }
        }
        
        return self::$connection;
    }
}