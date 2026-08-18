<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();
require_once __DIR__ . '/includes/db.php';

$db  = getAdminDb();
$id  = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$event = null;

if ($id > 0) {
    $stmt = $db->prepare("SELECT * FROM events WHERE id = ?");
    $stmt->execute([$id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$event) {
        flashSet('danger', 'Event not found.');
        header('Location: events.php');
        exit;
    }
}

$pageTitle = $event ? 'Edit Event' : 'Add Event';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();

    $title        = trim($_POST['title'] ?? '');
    $description  = trim($_POST['description'] ?? '');
    $location     = trim($_POST['location'] ?? '');
    $image        = trim($_POST['image'] ?? '');
    $date         = $_POST['date'] ?? '';
    $start_time   = $_POST['start_time'] ?? '';
    $type         = $_POST['type'] ?? 'running';
    $is_paid      = isset($_POST['is_paid']) ? 1 : 0;
    $amount       = $is_paid ? (float)($_POST['amount'] ?? 0) : null;
    $currency     = 'INR';
    $is_active    = isset($_POST['is_active']) ? 1 : 0;
    $contact_name  = trim($_POST['contact_name'] ?? '');
    $contact_phone = trim($_POST['contact_phone'] ?? '');
    $contact_email = trim($_POST['contact_email'] ?? '');

    // Validate
    $errors = [];
    if (empty($title))      $errors[] = 'Title is required.';
    if (empty($date))       $errors[] = 'Date is required.';
    if (empty($start_time)) $errors[] = 'Start time is required.';
    if (!in_array($type, ['challenge','running','cycling','steps','multi'])) $errors[] = 'Invalid event type.';
    if ($is_paid && ($amount <= 0)) $errors[] = 'Amount must be greater than 0 for paid events.';

    if (empty($errors)) {
        // Generate slug from title
        $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $title), '-'));

        if ($id > 0) {
            $stmt = $db->prepare("
                UPDATE events SET
                    title=?, slug=?, description=?, location=?, image=?,
                    date=?, start_time=?, type=?, is_paid=?, amount=?,
                    currency=?, is_active=?, contact_name=?, contact_phone=?,
                    contact_email=?, updated_at=NOW()
                WHERE id=?
            ");
            $stmt->execute([$title, $slug, $description, $location, $image,
                $date, $start_time, $type, $is_paid, $amount, $currency, $is_active,
                $contact_name ?: null, $contact_phone ?: null, $contact_email ?: null, $id]);
            flashSet('success', 'Event updated successfully.');
        } else {
            $stmt = $db->prepare("
                INSERT INTO events (title, slug, description, location, image,
                    date, start_time, type, is_paid, amount, currency, is_active,
                    contact_name, contact_phone, contact_email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$title, $slug, $description, $location, $image,
                $date, $start_time, $type, $is_paid, $amount, $currency, $is_active,
                $contact_name ?: null, $contact_phone ?: null, $contact_email ?: null]);
            flashSet('success', 'Event created successfully.');
        }
        header('Location: events.php');
        exit;
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="card-header mb-4">
    <h2><i class="fas fa-<?= $event ? 'edit' : 'plus' ?>"></i> <?= $pageTitle ?></h2>
    <a href="events.php" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Back</a>
</div>

<?php if (!empty($errors)): ?>
<div class="alert alert-danger">
    <ul style="margin:0;padding-left:1.2rem;">
        <?php foreach ($errors as $e): ?><li><?= sanitize($e) ?></li><?php endforeach; ?>
    </ul>
</div>
<?php endif; ?>

<div class="card">
    <form method="POST" action="event-form.php<?= $id ? "?id=$id" : '' ?>">
        <input type="hidden" name="csrf_token" value="<?= csrfToken() ?>">

        <div class="form-grid">
            <div class="form-group span-2">
                <label for="title">Event Title *</label>
                <input type="text" id="title" name="title" required maxlength="200"
                       value="<?= sanitize($_POST['title'] ?? $event['title'] ?? '') ?>">
            </div>

            <div class="form-group span-2">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="4" maxlength="2000"><?= sanitize($_POST['description'] ?? $event['description'] ?? '') ?></textarea>
            </div>

            <div class="form-group">
                <label for="date">Date *</label>
                <input type="date" id="date" name="date" required
                       value="<?= sanitize($_POST['date'] ?? $event['date'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label for="start_time">Start Time *</label>
                <input type="time" id="start_time" name="start_time" required
                       value="<?= sanitize($_POST['start_time'] ?? $event['start_time'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label for="location">Location</label>
                <input type="text" id="location" name="location" maxlength="255"
                       value="<?= sanitize($_POST['location'] ?? $event['location'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label for="type">Event Type *</label>
                <select id="type" name="type" required>
                    <?php foreach (['challenge','running','cycling','steps','multi'] as $t): ?>
                    <option value="<?= $t ?>" <?= (($_POST['type'] ?? $event['type'] ?? '') === $t) ? 'selected' : '' ?>>
                        <?= ucfirst($t) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group span-2">
                <label for="image">Image URL</label>
                <input type="url" id="image" name="image" maxlength="500"
                       placeholder="https://..."
                       value="<?= sanitize($_POST['image'] ?? $event['image'] ?? '') ?>">
            </div>

            <!-- Contact Details -->
            <div class="form-group span-2" style="border-top:1px solid var(--border);padding-top:1.25rem;margin-top:0.25rem;">
                <label style="font-size:0.8rem;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:0.06em;">
                    <i class="fas fa-address-book" style="color:var(--primary);margin-right:6px;"></i> Contact Details (shown on website)
                </label>
            </div>

            <div class="form-group">
                <label for="contact_name">Contact Person</label>
                <input type="text" id="contact_name" name="contact_name" maxlength="150"
                       placeholder="e.g. Rhugved Dangui"
                       value="<?= sanitize($_POST['contact_name'] ?? $event['contact_name'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label for="contact_phone">Contact Phone</label>
                <input type="tel" id="contact_phone" name="contact_phone" maxlength="20"
                       placeholder="e.g. +91 98765 43210"
                       value="<?= sanitize($_POST['contact_phone'] ?? $event['contact_phone'] ?? '') ?>">
            </div>

            <div class="form-group span-2">
                <label for="contact_email">Contact Email</label>
                <input type="email" id="contact_email" name="contact_email" maxlength="255"
                       placeholder="e.g. events@fitnessconsciousgoa.com"
                       value="<?= sanitize($_POST['contact_email'] ?? $event['contact_email'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="is_paid" id="is_paid" value="1"
                           <?= (isset($_POST['is_paid']) || (!empty($event) && $event['is_paid'])) ? 'checked' : '' ?>>
                    Paid Event
                </label>
            </div>

            <div class="form-group" id="amount-group" style="<?= (isset($_POST['is_paid']) || (!empty($event) && $event['is_paid'])) ? '' : 'display:none' ?>">
                <label for="amount">Amount (₹)</label>
                <input type="number" id="amount" name="amount" min="1" step="0.01"
                       value="<?= sanitize($_POST['amount'] ?? $event['amount'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="is_active" value="1"
                           <?= (!isset($_POST['is_active']) && empty($event)) || (isset($_POST['is_active'])) || (!empty($event) && $event['is_active']) ? 'checked' : '' ?>>
                    Active (visible on website)
                </label>
            </div>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> <?= $event ? 'Update Event' : 'Create Event' ?>
            </button>
            <a href="events.php" class="btn btn-outline">Cancel</a>
        </div>
    </form>
</div>

<script>
document.getElementById('is_paid').addEventListener('change', function() {
    document.getElementById('amount-group').style.display = this.checked ? '' : 'none';
    document.getElementById('amount').required = this.checked;
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
