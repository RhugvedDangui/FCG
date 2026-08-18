<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();
require_once __DIR__ . '/includes/db.php';

$pageTitle = 'Events';
$db = getAdminDb();

function eventTypeBadge(string $type): string {
    $map = [
        'running'  => ['icon' => 'fa-running',   'color' => '#16a34a', 'bg' => '#dcfce7', 'label' => 'Running'],
        'cycling'  => ['icon' => 'fa-bicycle',   'color' => '#2563eb', 'bg' => '#dbeafe', 'label' => 'Cycling'],
        'steps'    => ['icon' => 'fa-walking',   'color' => '#7c3aed', 'bg' => '#ede9fe', 'label' => 'Steps'],
        'multi'    => ['icon' => 'fa-medal',     'color' => '#b45309', 'bg' => '#fef3c7', 'label' => 'Multi-Sport'],
        'challenge'=> ['icon' => 'fa-trophy',    'color' => '#db2777', 'bg' => '#fce7f3', 'label' => 'Challenge'],
    ];
    $t = $map[$type] ?? ['icon' => 'fa-calendar', 'color' => '#6b7280', 'bg' => '#f1f5f9', 'label' => ucfirst($type)];
    return '<span class="event-type-badge" style="background:'.$t['bg'].';color:'.$t['color'].';">
                <i class="fas '.$t['icon'].'"></i> '.$t['label'].'
            </span>';
}

// Toggle active/inactive
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    verifyCsrf();
    $id = (int)($_POST['event_id'] ?? 0);

    if ($_POST['action'] === 'toggle' && $id > 0) {
        $db->prepare("UPDATE events SET is_active = NOT is_active WHERE id = ?")->execute([$id]);
        flashSet('success', 'Event status updated.');
    } elseif ($_POST['action'] === 'delete' && $id > 0) {
        $db->prepare("DELETE FROM events WHERE id = ?")->execute([$id]);
        flashSet('success', 'Event deleted.');
    }
    header('Location: events.php');
    exit;
}

$events = $db->query("SELECT * FROM events ORDER BY date DESC")->fetchAll(PDO::FETCH_ASSOC);

require_once __DIR__ . '/includes/header.php';
?>

<div class="card-header mb-4">
    <h2><i class="fas fa-calendar-alt"></i> All Events</h2>
    <a href="event-form.php" class="btn btn-primary"><i class="fas fa-plus"></i> Add Event</a>
</div>

<div class="card">
    <div class="table-wrap">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($events as $ev): ?>
                <tr>
                    <td><?= (int)$ev['id'] ?></td>
                    <td>
                        <strong><?= sanitize($ev['title']) ?></strong>
                        <small class="text-muted d-block"><?= sanitize($ev['location'] ?? '') ?></small>
                    </td>
                    <td><?= date('d M Y', strtotime($ev['date'])) ?><br><small><?= date('g:i A', strtotime($ev['start_time'])) ?></small></td>
                    <td><?= eventTypeBadge($ev['type']) ?></td>
                    <td><?= $ev['is_paid'] ? '₹' . number_format($ev['amount'], 0) : '<span class="badge badge-success">Free</span>' ?></td>
                    <td>
                        <span class="badge <?= $ev['is_active'] ? 'badge-success' : 'badge-secondary' ?>">
                            <?= $ev['is_active'] ? 'Active' : 'Inactive' ?>
                        </span>
                    </td>
                    <td class="actions">
                        <a href="event-form.php?id=<?= (int)$ev['id'] ?>" class="btn btn-sm btn-outline" title="Edit">
                            <i class="fas fa-edit"></i>
                        </a>
                        <form method="POST" style="display:inline;">
                            <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                            <input type="hidden" name="action" value="toggle">
                            <input type="hidden" name="event_id" value="<?= (int)$ev['id'] ?>">
                            <button type="submit" class="btn btn-sm btn-outline" title="<?= $ev['is_active'] ? 'Deactivate' : 'Activate' ?>">
                                <i class="fas fa-<?= $ev['is_active'] ? 'eye-slash' : 'eye' ?>"></i>
                            </button>
                        </form>
                        <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this event? This cannot be undone.')">
                            <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="event_id" value="<?= (int)$ev['id'] ?>">
                            <button type="submit" class="btn btn-sm btn-danger" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($events)): ?>
                <tr><td colspan="7" class="text-center text-muted">No events found. <a href="event-form.php">Add one</a></td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
