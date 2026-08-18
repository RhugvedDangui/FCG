<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();
require_once __DIR__ . '/includes/db.php';

$pageTitle = 'Registrations';
$db = getAdminDb();

$eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
$events  = $db->query("SELECT id, title FROM events ORDER BY date DESC")->fetchAll(PDO::FETCH_ASSOC);

$sql = "
    SELECT r.*, e.title AS event_title, p.payment_status
    FROM registrations r
    LEFT JOIN events e ON r.event_id = e.id
    LEFT JOIN paymentinfo p ON p.registration_id = r.id
";
$params = [];
if ($eventId > 0) {
    $sql .= " WHERE r.event_id = ?";
    $params[] = $eventId;
}
$sql .= " ORDER BY r.created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$regs = $stmt->fetchAll(PDO::FETCH_ASSOC);

function idProofUrl(string $path): string {
    $path = str_replace('\\', '/', $path);
    $path = preg_replace('#^(\.\./)+uploads/id-proofs/#', '', $path);
    $path = preg_replace('#^(\.\./)+#', '', $path);
    $path = preg_replace('#^uploads/id-proofs/#', '', $path);
    return 'view-proof.php?file=' . urlencode($path);
}

function isImage(string $path): bool {
    return in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg','jpeg','png','gif','webp']);
}

function paymentBadge(array $r): string {
    $type    = $r['registration_type'] ?? 'free';
    $ispaid  = $r['ispaid'] ?? 0;
    $pstatus = $r['payment_status'] ?? null;

    if ($type === 'free') {
        return '<span class="badge badge-info">Free</span>';
    } elseif ($ispaid) {
        return '<span class="badge badge-success">Paid</span>';
    } elseif ($pstatus === 'created') {
        return '<span class="badge badge-warning">Pending</span>';
    } elseif ($pstatus === 'failed') {
        return '<span class="badge badge-danger">Failed</span>';
    } else {
        return '<span class="badge badge-secondary">Unpaid</span>';
    }
}

// CSV Export
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="registrations_' . date('Ymd') . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID','Event','Name','Email','Mobile','Age','Gender','T-Shirt','Payment','ID Proof','Registered On']);
    foreach ($regs as $r) {
        fputcsv($out, [
            $r['id'], $r['event_title'], $r['full_name'], $r['email'],
            $r['mobile_number'], $r['age'], $r['gender'], $r['tshirt_size'],
            $r['ispaid'] ? 'Paid' : 'Unpaid',
            $r['id_proof'] ? 'Yes' : 'No',
            date('d M Y H:i', strtotime($r['created_at']))
        ]);
    }
    fclose($out);
    exit;
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="card-header mb-4">
    <h2><i class="fas fa-users"></i> Registrations</h2>
    <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
        <form method="GET" style="display:flex;gap:0.5rem;align-items:center;">
            <select name="event_id" onchange="this.form.submit()" style="padding:0.4rem 0.75rem;border:1.5px solid var(--border);border-radius:8px;font-family:'Poppins',sans-serif;font-size:0.82rem;">
                <option value="">All Events</option>
                <?php foreach ($events as $ev): ?>
                <option value="<?= (int)$ev['id'] ?>" <?= $eventId === (int)$ev['id'] ? 'selected' : '' ?>>
                    <?= sanitize($ev['title']) ?>
                </option>
                <?php endforeach; ?>
            </select>
        </form>
        <a href="registrations.php?export=csv<?= $eventId ? "&event_id=$eventId" : '' ?>" class="btn btn-outline btn-sm">
            <i class="fas fa-download"></i> Export CSV
        </a>
    </div>
</div>

<?php if (empty($regs)): ?>
<div class="empty-state">
    <i class="fas fa-users"></i>
    <p>No registrations found.</p>
</div>
<?php else: ?>

<!-- Desktop Table -->
<div class="card desktop-only">
    <div class="table-wrap">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email / Mobile</th>
                    <th>Event</th>
                    <th>T-Shirt</th>
                    <th>ID Proof</th>
                    <th>Payment</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($regs as $r): ?>
                <tr>
                    <td><?= (int)$r['id'] ?></td>
                    <td>
                        <strong><?= sanitize($r['full_name'] ?? '-') ?></strong>
                        <?php if ($r['age']): ?>
                        <small class="text-muted d-block"><?= (int)$r['age'] ?> yrs, <?= sanitize($r['gender'] ?? '') ?></small>
                        <?php endif; ?>
                    </td>
                    <td>
                        <?= sanitize($r['email'] ?? '-') ?>
                        <small class="text-muted d-block"><?= sanitize($r['mobile_number'] ?? '') ?></small>
                    </td>
                    <td><?= sanitize($r['event_title'] ?? '-') ?></td>
                    <td><?= sanitize($r['tshirt_size'] ?? '-') ?></td>
                    <td>
                        <?php if (!empty($r['id_proof'])): ?>
                            <?php $url = idProofUrl($r['id_proof']); $ext = strtolower(pathinfo($r['id_proof'], PATHINFO_EXTENSION)); ?>
                            <?php if (isImage($r['id_proof'])): ?>
                                <img src="<?= htmlspecialchars($url) ?>" alt="ID Proof" class="id-proof-thumb"
                                     onclick="openProofModal('<?= htmlspecialchars($url) ?>')" title="Click to enlarge">
                            <?php else: ?>
                                <a href="<?= htmlspecialchars($url) ?>" target="_blank" class="btn btn-sm btn-outline">
                                    <i class="fas fa-file-pdf" style="color:#ef4444;"></i> PDF
                                </a>
                            <?php endif; ?>
                        <?php else: ?>
                            <span class="text-muted">—</span>
                        <?php endif; ?>
                    </td>
                    <td>
                        <?= paymentBadge($r) ?>
                        <small class="text-muted d-block"><?= sanitize(ucfirst($r['registration_type'] ?? '')) ?></small>
                    </td>
                    <td>
                        <?= date('d M Y', strtotime($r['created_at'])) ?>
                        <small class="text-muted d-block"><?= date('g:i A', strtotime($r['created_at'])) ?></small>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <div class="table-footer">Total: <strong><?= count($regs) ?></strong> registrations</div>
</div>

<!-- Mobile Cards -->
<div class="reg-cards mobile-only">
    <?php foreach ($regs as $r): ?>
    <div class="reg-card">
        <div class="reg-card-top">
            <div class="reg-card-info">
                <div class="reg-card-name"><?= sanitize($r['full_name'] ?? '-') ?></div>
                <div class="reg-card-sub">
                    <?php if ($r['age']): ?><?= (int)$r['age'] ?> yrs · <?php endif; ?>
                    <?= sanitize(ucfirst($r['gender'] ?? '')) ?>
                </div>
            </div>
            <span><?= paymentBadge($r) ?></span>
        </div>

        <div class="reg-card-body">
            <div class="reg-card-row">
                <i class="fas fa-calendar-alt"></i>
                <span><?= sanitize($r['event_title'] ?? '-') ?></span>
            </div>
            <div class="reg-card-row">
                <i class="fas fa-envelope"></i>
                <span><?= sanitize($r['email'] ?? '-') ?></span>
            </div>
            <div class="reg-card-row">
                <i class="fas fa-phone"></i>
                <span><?= sanitize($r['mobile_number'] ?? '-') ?></span>
            </div>
            <div class="reg-card-row">
                <i class="fas fa-tshirt"></i>
                <span>T-Shirt: <strong><?= sanitize($r['tshirt_size'] ?? '-') ?></strong></span>
            </div>
            <div class="reg-card-row">
                <i class="fas fa-clock"></i>
                <span><?= date('d M Y, g:i A', strtotime($r['created_at'])) ?></span>
            </div>

            <?php if (!empty($r['id_proof'])): ?>
            <div class="reg-card-proof">
                <?php $url = idProofUrl($r['id_proof']); ?>
                <?php if (isImage($r['id_proof'])): ?>
                    <img src="<?= htmlspecialchars($url) ?>" alt="ID Proof" class="id-proof-thumb"
                         onclick="openProofModal('<?= htmlspecialchars($url) ?>')" title="Tap to enlarge">
                    <span class="text-muted" style="font-size:0.75rem;">Tap to view ID proof</span>
                <?php else: ?>
                    <a href="<?= htmlspecialchars($url) ?>" target="_blank" class="btn btn-sm btn-outline">
                        <i class="fas fa-file-pdf" style="color:#ef4444;"></i> View ID Proof (PDF)
                    </a>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
    <?php endforeach; ?>
    <div class="table-footer" style="border-radius:0 0 12px 12px;">
        Total: <strong><?= count($regs) ?></strong> registrations
    </div>
</div>

<?php endif; ?>

<!-- Image Modal -->
<div id="proofModal" class="proof-modal" onclick="closeProofModal()">
    <div class="proof-modal-inner" onclick="event.stopPropagation()">
        <button class="proof-modal-close" onclick="closeProofModal()"><i class="fas fa-times"></i></button>
        <img id="proofModalImg" src="" alt="ID Proof">
    </div>
</div>

<style>
.desktop-only { display: block; }
.mobile-only  { display: none !important; }
.reg-cards { display: flex; flex-direction: column; gap: 1rem; }
.reg-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.reg-card-top { display: flex; align-items: flex-start; justify-content: space-between; padding: 1rem 1rem 0.5rem; gap: 0.5rem; }
.reg-card-name { font-weight: 600; font-size: 0.95rem; }
.reg-card-sub  { font-size: 0.78rem; color: var(--muted); margin-top: 0.1rem; }
.reg-card-body { padding: 0.5rem 1rem 1rem; }
.reg-card-row { display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.3rem 0; font-size: 0.82rem; color: var(--text); border-bottom: 1px solid #f3f4f6; }
.reg-card-row:last-of-type { border-bottom: none; }
.reg-card-row i { color: var(--primary); width: 14px; flex-shrink: 0; margin-top: 3px; font-size: 0.75rem; }
.reg-card-proof { margin-top: 0.75rem; display: flex; align-items: center; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border); }
@media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mobile-only  { display: flex !important; flex-direction: column; }
}
</style>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
