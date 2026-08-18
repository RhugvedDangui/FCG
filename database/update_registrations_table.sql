-- SQL queries to update the registrations table with all required fields

-- 1. Add missing fields that are used in the registration form
ALTER TABLE `registrations` 
ADD COLUMN `date_of_birth` DATE NULL AFTER `gender`,
ADD COLUMN `emergency_contact_name` VARCHAR(150) NULL AFTER `runner_group`,
ADD COLUMN `emergency_contact_mobile` VARCHAR(20) NULL AFTER `emergency_contact_name`,
ADD COLUMN `registration_type` ENUM('free', 'paid') NOT NULL DEFAULT 'free' AFTER `ispaid`,
ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `registration_type`,
ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- 2. Rename id_proof to id_proof_path for clarity (since it now stores file path)
ALTER TABLE `registrations` 
CHANGE COLUMN `id_proof` `id_proof_path` VARCHAR(1000) NULL;

-- 3. Add indexes for better performance
ALTER TABLE `registrations`
ADD INDEX `idx_email` (`email`),
ADD INDEX `idx_mobile` (`mobile_number`),
ADD INDEX `idx_registration_type` (`registration_type`),
ADD INDEX `idx_created_at` (`created_at`);

-- 4. Optional: Add a comment to the table
ALTER TABLE `registrations` COMMENT = 'Event registrations with complete user information and payment tracking';

-- 5. Show the updated table structure
DESCRIBE `registrations`;