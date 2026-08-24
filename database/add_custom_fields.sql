-- Add custom_fields column to events table
-- Stores JSON array of field definitions
-- Example: [{"label":"Running Category","type":"select","options":["5K","10K","21K"],"required":true},{"label":"Club Name","type":"text","required":false}]
ALTER TABLE `events`
    ADD COLUMN `custom_fields` JSON NULL DEFAULT NULL AFTER `contact_email`;

-- Table to store custom field answers per registration
CREATE TABLE IF NOT EXISTS `registration_custom_answers` (
    `id`              INT(11) NOT NULL AUTO_INCREMENT,
    `registration_id` INT(11) NOT NULL,
    `field_label`     VARCHAR(255) NOT NULL,
    `field_value`     TEXT NULL DEFAULT NULL,
    `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_registration_id` (`registration_id`),
    CONSTRAINT `fk_custom_answers_registration`
        FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
