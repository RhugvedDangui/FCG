-- Create contact_messages table
CREATE TABLE IF NOT EXISTS `contact_messages` (
    `id`         INT(11) NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(150) NOT NULL,
    `email`      VARCHAR(255) NOT NULL,
    `phone`      VARCHAR(20) NULL DEFAULT NULL,
    `subject`    VARCHAR(100) NOT NULL,
    `message`    TEXT NOT NULL,
    `is_active`  TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = active/unread, 0 = archived',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_email`      (`email`),
    INDEX `idx_is_active`  (`is_active`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Contact form submissions from website';
