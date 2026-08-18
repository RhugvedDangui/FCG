<?php
/**
 * Admin DB connection - uses the same config as the main site
 */
if (!defined('ADMIN_GUARD')) die('Direct access not allowed.');

require_once __DIR__ . '/../../includes/config/database.php';
require_once __DIR__ . '/../../includes/config/env.php';

function getAdminDb(): PDO {
    return DatabaseConfig::getConnection();
}
