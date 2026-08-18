-- Add contact details columns to events table
ALTER TABLE `events`
    ADD COLUMN `contact_name`  VARCHAR(150) NULL DEFAULT NULL AFTER `is_active`,
    ADD COLUMN `contact_phone` VARCHAR(20)  NULL DEFAULT NULL AFTER `contact_name`,
    ADD COLUMN `contact_email` VARCHAR(255) NULL DEFAULT NULL AFTER `contact_phone`;
