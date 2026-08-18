<?php
/**
 * Cleanup Script for Expired Pre-Registrations
 * 
 * This script should be run periodically (via cron job or scheduled task)
 * to clean up expired pre-registration orders and their associated files
 */

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDatabaseConnection();
    
    // Get expired pre-registrations with file paths
    $stmt = $pdo->prepare("
        SELECT id, order_id, id_proof_path 
        FROM event_pre_registrations 
        WHERE status = 'pending' AND expires_at < NOW()
    ");
    $stmt->execute();
    $expiredOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $cleanedCount = 0;
    $filesDeleted = 0;
    
    foreach ($expiredOrders as $order) {
        // Delete associated file if exists
        if (!empty($order['id_proof_path']) && file_exists($order['id_proof_path'])) {
            if (unlink($order['id_proof_path'])) {
                $filesDeleted++;
            }
        }
        
        // Update status to expired (keep for audit trail)
        $updateStmt = $pdo->prepare("
            UPDATE event_pre_registrations 
            SET status = 'expired', id_proof_path = NULL 
            WHERE id = ?
        ");
        $updateStmt->execute([$order['id']]);
        $cleanedCount++;
    }
    
    // Optionally, delete very old expired records (older than 30 days)
    $deleteOldStmt = $pdo->prepare("
        DELETE FROM event_pre_registrations 
        WHERE status = 'expired' 
        AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    ");
    $deleteOldStmt->execute();
    $deletedOldCount = $deleteOldStmt->rowCount();
    
    $message = "Cleanup completed: {$cleanedCount} orders expired, {$filesDeleted} files deleted, {$deletedOldCount} old records removed";
    
    // Log the cleanup
    error_log("[" . date('Y-m-d H:i:s') . "] Pre-registration cleanup: " . $message);
    
    // If running from command line, output the result
    if (php_sapi_name() === 'cli') {
        echo $message . "\n";
    }
    
} catch (Exception $e) {
    $errorMessage = "Cleanup failed: " . $e->getMessage();
    error_log("[" . date('Y-m-d H:i:s') . "] Pre-registration cleanup error: " . $errorMessage);
    
    if (php_sapi_name() === 'cli') {
        echo $errorMessage . "\n";
    }
}
?>