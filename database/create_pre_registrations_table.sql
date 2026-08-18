-- Create table for storing pre-registration data before payment completion
-- This table stores order data temporarily until payment is verified

CREATE TABLE IF NOT EXISTS `event_pre_registrations` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `order_id` varchar(255) NOT NULL UNIQUE,
    `event_id` int(11) NOT NULL,
    `user_data` JSON NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `currency` varchar(10) NOT NULL DEFAULT 'INR',
    `id_proof_path` varchar(500) NULL,
    `status` enum('pending','completed','failed','expired') NOT NULL DEFAULT 'pending',
    `payment_id` varchar(255) NULL,
    `payment_signature` varchar(500) NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `expires_at` timestamp NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_event_id` (`event_id`),
    KEY `idx_status` (`status`),
    KEY `idx_expires_at` (`expires_at`),
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX `idx_user_email` ON `event_pre_registrations`((JSON_UNQUOTE(JSON_EXTRACT(user_data, '$.email'))));
CREATE INDEX `idx_created_status` ON `event_pre_registrations`(`created_at`, `status`);