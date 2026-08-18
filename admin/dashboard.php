<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();
require_once __DIR__ . '/includes/db.php';

$pageTitle = 'Dashboard';
$db = getAdminDb();

// Stats
$totalEvents      = $db->query("SELECT COUNT(*) FROM events")->fetchColumn();
$activeEvents     = $db->query("SELECT COUNT(*) FROM events WHERE is_active = 1")->fetchColumn();
$totalRegs        = $db->query("SELECT COUNT(*) FROM registrations")->fetchColumn();
$paidRegs         = $db->query("SELECT COUNT(*) FROM registrations WHERE ispaid = 1")->fetchColumn();
$totalMessages    = $db->query("SELECT COUNT(*) FROM contact_messages WHERE is_active = 1")->fetchColumn();
$recentRegs = $db->query("
    SELECT r.full_name, r.email, r.created_at, e.title AS event_title,
           r.ispaid, r.registration_type,
           p.payment_status
    FROM registrations r
    LEFT JOIN events e ON r.event_id = e.id
    LEFT JOIN paymentinfo p ON p.registration_id = r.id
    ORDER BY r.created_at DESC LIMIT 5
")->fetchAll(PDO::FETCH_ASSOC);

require_once __DIR__ . '/includes/header.php';
?>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-calendar-alt"></i></div>
        <div class="stat-info">
            <h3><?= $activeEvents ?></h3>
            <p>Active Events</p>
            <span><?= $totalEvents ?> total</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-users"></i></div>
        <div class="stat-info">
            <h3><?= $totalRegs ?></h3>
            <p>Registrations</p>
            <span><?= $paidRegs ?> paid</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-envelope"></i></div>
        <div class="stat-info">
            <h3><?= $totalMessages ?></h3>
            <p>Unread Messages</p>
            <span>Contact form</span>
        </div>
    </div>
</div>

<div class="card mt-4">
    <div class="card-header">
        <h2><i class="fas fa-clock"></i> Recent Registrations</h2>
        <a href="registrations.php" class="btn btn-sm btn-outline">View All</a>
    </div>
    <div class="table-wrap">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Payment</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($recentRegs as $reg): ?>
                <tr>
                    <td><?= sanitize($reg['full_name'] ?? '-') ?></td>
                    <td><?= sanitize($reg['email'] ?? '-') ?></td>
                    <td><?= sanitize($reg['event_title'] ?? '-') ?></td>
                    <td>
                        <?php
                        $type   = $reg['registration_type'] ?? 'free';
                        $ispaid = $reg['ispaid'];
                        $pstatus = $reg['payment_status'] ?? null;

                        if ($type === 'free') {
                            echo '<span class="badge badge-info">Free</span>';
                        } elseif ($ispaid) {
                            echo '<span class="badge badge-success">Paid</span>';
                        } elseif ($pstatus === 'created') {
                            echo '<span class="badge badge-warning">Pending</span>';
                        } elseif ($pstatus === 'failed') {
                            echo '<span class="badge badge-danger">Failed</span>';
                        } else {
                            echo '<span class="badge badge-secondary">Unpaid</span>';
                        }
                        ?>
                    </td>
                    <td><?= date('d M Y', strtotime($reg['created_at'])) ?></td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($recentRegs)): ?>
                <tr><td colspan="5" class="text-center text-muted">No registrations yet</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
