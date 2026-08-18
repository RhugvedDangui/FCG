<?php
require_once __DIR__ . '/includes/auth.php';

// Already logged in
if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

// Rate limiting via session — max 5 attempts per 15 minutes
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['login_first_attempt'] = time();
}

$lockoutDuration = 900; // 15 minutes
$maxAttempts = 5;
$isLocked = false;
$lockoutRemaining = 0;

if ($_SESSION['login_attempts'] >= $maxAttempts) {
    $elapsed = time() - $_SESSION['login_first_attempt'];
    if ($elapsed < $lockoutDuration) {
        $isLocked = true;
        $lockoutRemaining = ceil(($lockoutDuration - $elapsed) / 60);
    } else {
        // Reset after lockout period
        $_SESSION['login_attempts'] = 0;
        $_SESSION['login_first_attempt'] = time();
    }
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$isLocked) {
    // CSRF check for login form
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals(csrfToken(), $token)) {
        $error = 'Invalid request. Please try again.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        // Load credentials from env
        require_once __DIR__ . '/../includes/config/env.php';
        $adminUser = EnvLoader::get('ADMIN_USERNAME', '');
        $adminHash = EnvLoader::get('ADMIN_PASSWORD_HASH', '');

        if (!empty($username) && !empty($password)
            && $username === $adminUser
            && !empty($adminHash)
            && password_verify($password, $adminHash)
        ) {
            // Successful login
            session_regenerate_id(true);
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_user'] = $username;
            $_SESSION['created'] = time();
            $_SESSION['login_attempts'] = 0;
            header('Location: dashboard.php');
            exit;
        } else {
            $_SESSION['login_attempts']++;
            // Generic error — don't reveal whether username or password was wrong
            $error = 'Invalid credentials.';
            // Small delay to slow brute force
            sleep(1);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login — Fitness Conscious Goa</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="assets/admin.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="login-logo">
                    <i class="fas fa-running"></i>
                </div>
                <h1>FCG Admin</h1>
                <p>Fitness Conscious Goa</p>
            </div>

            <?php if ($isLocked): ?>
            <div class="alert alert-danger">
                <i class="fas fa-lock"></i>
                Too many failed attempts. Try again in <?= $lockoutRemaining ?> minute(s).
            </div>
            <?php elseif ($error): ?>
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <?= htmlspecialchars($error) ?>
            </div>
            <?php endif; ?>

            <form method="POST" action="index.php" autocomplete="off" <?= $isLocked ? 'style="display:none"' : '' ?>>
                <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">

                <div class="form-group">
                    <label for="username"><i class="fas fa-user"></i> Username</label>
                    <input type="text" id="username" name="username"
                           required autofocus autocomplete="off"
                           maxlength="50"
                           value="<?= isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '' ?>">
                </div>

                <div class="form-group">
                    <label for="password"><i class="fas fa-lock"></i> Password</label>
                    <div class="password-wrap">
                        <input type="password" id="password" name="password"
                               required autocomplete="off" maxlength="128">
                        <button type="button" class="toggle-password" tabindex="-1">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-login">
                    <span>Sign In</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </form>
        </div>
    </div>
    <script src="assets/admin.js"></script>
</body>
</html>
