<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();
require_once __DIR__ . '/includes/db.php';

$pageTitle = 'Contact Messages';
$db = getAdminDb();

// Archive/unarchive/delete
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $msgId  = (int)($_POST['msg_id'] ?? 0);
    $action = $_POST['action'] ?? '';

    if ($msgId > 0 && in_array($action, ['archive', 'unarchive', 'delete'])) {
        if ($action === 'delete') {
            $db->prepare("DELETE FROM contact_messages WHERE id = ?")->execute([$msgId]);
            flashSet('success', 'Message deleted.');
        } else {
            $val = $action === 'archive' ? 0 : 1;
            $db->prepare("UPDATE contact_messages SET is_active = ? WHERE id = ?")->execute([$val, $msgId]);
            flashSet('success', 'Message updated.');
        }
    }
    header('Location: messages.php');
    exit;
}

$filter = $_GET['filter'] ?? 'active';
$where  = $filter === 'archived' ? 'is_active = 0' : 'is_active = 1';
$msgs   = $db->query("SELECT * FROM contact_messages WHERE {$where} ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

require_once __DIR__ . '/includes/header.php';
?>

<div class="card-header mb-4">
    <h2><i class="fas fa-envelope"></i> Contact Messages</h2>
    <div style="display:flex;gap:0.5rem;">
        <a href="?filter=active"   class="btn btn-sm <?= $filter !== 'archived' ? 'btn-primary' : 'btn-outline' ?>">Active</a>
        <a href="?filter=archived" class="btn btn-sm <?= $filter === 'archived' ? 'btn-primary' : 'btn-outline' ?>">Archived</a>
    </div>
</div>

<div class="messages-list">
    <?php foreach ($msgs as $msg): ?>
    <div class="message-card">
        <div class="message-header">
            <div>
                <strong><?= sanitize($msg['name']) ?></strong>
                <span class="badge badge-info ml-2"><?= sanitize($msg['subject']) ?></span>
            </div>
            <small class="text-muted"><?= date('d M Y, g:i A', strtotime($msg['created_at'])) ?></small>
        </div>
        <div class="message-meta">
            <span><i class="fas fa-envelope"></i> <a href="mailto:<?= sanitize($msg['email']) ?>"><?= sanitize($msg['email']) ?></a></span>
            <?php if ($msg['phone']): ?>
            <span><i class="fas fa-phone"></i> <?= sanitize($msg['phone']) ?></span>
            <?php endif; ?>
        </div>
        <div class="message-body">
            <?= nl2br(sanitize($msg['message'])) ?>
        </div>
        <div class="message-actions">
            <a href="mailto:<?= sanitize($msg['email']) ?>?subject=Re: <?= urlencode($msg['subject']) ?>" class="btn btn-sm btn-primary">
                <i class="fas fa-reply"></i> Reply
            </a>
            <form method="POST" style="display:inline;">
                <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                <input type="hidden" name="msg_id"    value="<?= (int)$msg['id'] ?>">
                <input type="hidden" name="action"    value="<?= $filter === 'archived' ? 'unarchive' : 'archive' ?>">
                <button class="btn btn-sm btn-outline">
                    <i class="fas fa-<?= $filter === 'archived' ? 'inbox' : 'archive' ?>"></i>
                    <?= $filter === 'archived' ? 'Unarchive' : 'Archive' ?>
                </button>
            </form>
            <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this message permanently?')">
                <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">
                <input type="hidden" name="msg_id"    value="<?= (int)$msg['id'] ?>">
                <input type="hidden" name="action"    value="delete">
                <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
            </form>
        </div>
    </div>
    <?php endforeach; ?>
    <?php if (empty($msgs)): ?>
    <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No <?= $filter === 'archived' ? 'archived' : 'active' ?> messages.</p>
    </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
