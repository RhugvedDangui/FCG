<?php
/**
 * Webhook Email Handler
 * Handles email sending after successful payment capture
 */

require_once __DIR__ . '/EmailService.php';
require_once __DIR__ . '/../config/database.php';

class WebhookEmailHandler {
    private $emailService;
    private $conn;
    
    public function __construct() {
        $this->emailService = new EmailService();
        // Get fresh connection to avoid MySQL server gone away on long-running webhooks
        $this->conn = DatabaseConfig::getConnection();
    }
    
    /**
     * Send emails after payment capture
     */
    public function handlePaymentCaptured($orderId, $paymentData) {
        try {
            // Get registration and event data
            $registrationData = $this->getRegistrationData($orderId);
            if (!$registrationData) {
                error_log("Registration not found for order: {$orderId}");
                return false;
            }
            
            $eventData = $this->getEventData($registrationData['event_id']);
            if (!$eventData) {
                error_log("Event not found for ID: {$registrationData['event_id']}");
                return false;
            }
            
            // Prepare user data for email templates with safe defaults
            $userData = [
                'firstName' => $registrationData['first_name'] ?? 'User',
                'lastName' => $registrationData['last_name'] ?? '',
                'email' => $registrationData['email'] ?? '',
                'mobileNumber' => $registrationData['mobile_number'] ?? 'N/A',
                'tshirtSize' => $registrationData['tshirt_size'] ?? 'N/A',
                'registrationId' => $registrationData['id'] ?? 'N/A'
            ];
            
            // Prepare payment data for receipt
            $timestamp = $paymentData['created_at'] ?? time();
            $paymentInfo = [
                'payment_id' => $paymentData['id'] ?? 'N/A',
                'order_id' => $orderId,
                'amount' => number_format(($paymentData['amount'] ?? 0) / 100, 2), // Convert from paise
                'currency' => $paymentData['currency'] ?? 'INR',
                'method' => ucfirst($paymentData['method'] ?? 'unknown'),
                'status' => ucfirst($paymentData['status'] ?? 'unknown'),
                'created_at' => date('Y-m-d H:i:s', $timestamp)
            ];
            
            $userEmail = $userData['email'];
            
            // Validate email before sending
            if (empty($userEmail) || !filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
                error_log("Invalid email for order {$orderId}: {$userEmail}");
                return false;
            }
            
            // Send registration confirmation email
            $confirmationSent = $this->emailService->sendRegistrationConfirmation(
                $userEmail, 
                $userData, 
                $eventData
            );
            
            // Send payment receipt email
            $receiptSent = $this->emailService->sendPaymentReceipt(
                $userEmail, 
                $userData, 
                $eventData, 
                $paymentInfo
            );
            
            // Log email status
            $this->logEmailStatus($orderId, $confirmationSent, $receiptSent);
            
            return $confirmationSent && $receiptSent;
            
        } catch (Exception $e) {
            error_log("Error sending emails for order {$orderId}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get registration data from database
     */
    private function getRegistrationData($orderId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT id, event_id, first_name, last_name, email, mobile_number, 
                       tshirt_size
                FROM registrations 
                WHERE order_id = ? 
                LIMIT 1
            ");
            $stmt->execute([$orderId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("Error fetching registration data: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get event data from database
     */
    private function getEventData($eventId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT id, title, date, location, amount, currency
                FROM events 
                WHERE id = ? 
                LIMIT 1
            ");
            $stmt->execute([$eventId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("Error fetching event data: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Log email sending status for debugging
     */
    private function logEmailStatus($orderId, $confirmationSent, $receiptSent) {
        try {
            $status = [];
            $status['confirmation'] = $confirmationSent ? 'sent' : 'failed';
            $status['receipt'] = $receiptSent ? 'sent' : 'failed';
            
            $logMessage = "Email status for order {$orderId}: " . json_encode($status);
            error_log($logMessage);
            
            // Optional: Store in database for tracking
            $this->updateEmailStatus($orderId, $confirmationSent, $receiptSent);
            
        } catch (Exception $e) {
            error_log("Error logging email status: " . $e->getMessage());
        }
    }
    
    /**
     * Update email status in database (optional tracking)
     */
    private function updateEmailStatus($orderId, $confirmationSent, $receiptSent) {
        try {
            // Check if we need to create email_logs table
            $this->createEmailLogsTable();
            
            $stmt = $this->conn->prepare("
                INSERT INTO email_logs (order_id, confirmation_sent, receipt_sent, sent_at)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                confirmation_sent = VALUES(confirmation_sent),
                receipt_sent = VALUES(receipt_sent),
                sent_at = VALUES(sent_at)
            ");
            
            $stmt->execute([
                $orderId,
                $confirmationSent ? 1 : 0,
                $receiptSent ? 1 : 0
            ]);
            
        } catch (Exception $e) {
            // Silently fail if table doesn't exist or can't be created
            error_log("Could not update email status in database: " . $e->getMessage());
        }
    }
    
    /**
     * Create email_logs table if it doesn't exist
     */
    private function createEmailLogsTable() {
        try {
            $sql = "
                CREATE TABLE IF NOT EXISTS email_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(255) UNIQUE,
                    confirmation_sent BOOLEAN DEFAULT FALSE,
                    receipt_sent BOOLEAN DEFAULT FALSE,
                    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_order_id (order_id),
                    INDEX idx_sent_at (sent_at)
                ) ENGINE=InnoDB
            ";
            
            $this->conn->exec($sql);
            
        } catch (Exception $e) {
            // Table creation failed, but continue without it
            error_log("Could not create email_logs table: " . $e->getMessage());
        }
    }
}
?>