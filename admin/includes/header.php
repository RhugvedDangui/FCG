<?php if (!defined('ADMIN_GUARD')) die('Direct access not allowed.'); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= sanitize($pageTitle ?? 'Admin') ?> — FCG Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="assets/admin.css">
</head>
<body>
<div class="admin-layout">

    <!-- Mobile overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <span class="brand-text">FCG <span class="brand-accent">Admin</span></span>
            <button class="sidebar-close" id="sidebarClose"><i class="fas fa-times"></i></button>
        </div>
        <nav class="sidebar-nav">
            <a href="dashboard.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'dashboard.php' ? 'active' : '' ?>">
                <i class="fas fa-tachometer-alt"></i><span>Dashboard</span>
            </a>
            <a href="events.php" class="nav-item <?= in_array(basename($_SERVER['PHP_SELF']), ['events.php','event-form.php']) ? 'active' : '' ?>">
                <i class="fas fa-calendar-alt"></i><span>Events</span>
            </a>
            <a href="registrations.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'registrations.php' ? 'active' : '' ?>">
                <i class="fas fa-users"></i><span>Registrations</span>
            </a>
            <a href="messages.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'messages.php' ? 'active' : '' ?>">
                <i class="fas fa-envelope"></i><span>Messages</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <div class="admin-name"><i class="fas fa-user-shield"></i> <?= sanitize($_SESSION['admin_user'] ?? '') ?></div>
            <a href="logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
        <div class="topbar">
            <button class="menu-toggle" id="menuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title"><?= sanitize($pageTitle ?? '') ?></h1>
            <div class="topbar-right">
                <span class="topbar-user"><i class="fas fa-user-circle"></i> <?= sanitize($_SESSION['admin_user'] ?? '') ?></span>
            </div>
        </div>

        <?php $flash = flashGet(); if ($flash): ?>
        <div class="alert alert-<?= $flash['type'] ?>">
            <i class="fas fa-<?= $flash['type'] === 'success' ? 'check-circle' : 'exclamation-circle' ?>"></i>
            <?= sanitize($flash['message']) ?>
        </div>
        <?php endif; ?>

        <div class="content-area">
