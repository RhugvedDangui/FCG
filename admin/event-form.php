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
    $event_details = $_POST['event_details'] ?? '';
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

    // Process custom fields
    $customFields = [];
    $fieldLabels   = $_POST['field_label'] ?? [];
    $fieldTypes    = $_POST['field_type'] ?? [];
    $fieldOptions  = $_POST['field_options'] ?? [];
    $fieldRequired = $_POST['field_required'] ?? [];

    foreach ($fieldLabels as $i => $label) {
        $label = trim($label);
        if (empty($label)) continue;
        $field = [
            'label'    => $label,
            'type'     => $fieldTypes[$i] ?? 'text',
            'required' => isset($fieldRequired[$i]) && $fieldRequired[$i] === '1',
        ];
        if ($field['type'] === 'select' && !empty($fieldOptions[$i])) {
            $field['options'] = array_values(array_filter(array_map('trim', explode("\n", $fieldOptions[$i]))));
        }
        $customFields[] = $field;
    }
    $customFieldsJson = !empty($customFields) ? json_encode($customFields) : null;

    // Process extra info blocks (label + content pairs)
    $extraInfoBlocks  = [];
    $infoLabels   = $_POST['info_label'] ?? [];
    $infoContents = $_POST['info_content'] ?? [];

    foreach ($infoLabels as $i => $label) {
        $label   = trim($label);
        $content = trim($infoContents[$i] ?? '');
        if (empty($label) && empty($content)) continue;
        $extraInfoBlocks[] = ['label' => $label, 'content' => $content];
    }
    $extraInfoJson = !empty($extraInfoBlocks) ? json_encode($extraInfoBlocks) : null;

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
                    title=?, slug=?, description=?, event_details=?, extra_info=?, location=?, image=?,
                    date=?, start_time=?, type=?, is_paid=?, amount=?,
                    currency=?, is_active=?, contact_name=?, contact_phone=?,
                    contact_email=?, custom_fields=?, updated_at=NOW()
                WHERE id=?
            ");
            $stmt->execute([$title, $slug, $description, $event_details ?: null, $extraInfoJson, $location, $image,
                $date, $start_time, $type, $is_paid, $amount, $currency, $is_active,
                $contact_name ?: null, $contact_phone ?: null, $contact_email ?: null,
                $customFieldsJson, $id]);
            flashSet('success', 'Event updated successfully.');
        } else {
            $stmt = $db->prepare("
                INSERT INTO events (title, slug, description, event_details, extra_info, location, image,
                    date, start_time, type, is_paid, amount, currency, is_active,
                    contact_name, contact_phone, contact_email, custom_fields)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$title, $slug, $description, $event_details ?: null, $extraInfoJson, $location, $image,
                $date, $start_time, $type, $is_paid, $amount, $currency, $is_active,
                $contact_name ?: null, $contact_phone ?: null, $contact_email ?: null,
                $customFieldsJson]);
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
                <label for="description">Description <span style="font-weight:400;text-transform:none;font-size:0.75rem;color:var(--muted);">(short summary)</span></label>
                <textarea id="description" name="description" rows="4" maxlength="2000"><?= sanitize($_POST['description'] ?? $event['description'] ?? '') ?></textarea>
            </div>

            <div class="form-group span-2">
                <label for="event_details">Event Details <span style="font-weight:400;text-transform:none;font-size:0.75rem;color:var(--muted);">(HTML — full detailed description shown on homepage)</span></label>
                <textarea id="event_details" name="event_details" rows="10"
                          style="font-family:monospace;font-size:0.82rem;"
                          placeholder="<p>Enter detailed HTML here...</p>"><?= htmlspecialchars($_POST['event_details'] ?? $event['event_details'] ?? '', ENT_QUOTES) ?></textarea>
                <small style="color:var(--muted);font-size:0.72rem;margin-top:4px;">Supports full HTML — headings, lists, images, links etc.</small>
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

        <!-- Custom Fields Section -->
        <div style="padding:1.5rem;border-top:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <div>
                    <label style="font-size:0.8rem;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:0.06em;">
                        <i class="fas fa-sliders-h" style="color:var(--primary);margin-right:6px;"></i> Custom Registration Fields
                    </label>
                    <p style="font-size:0.75rem;color:var(--muted);margin-top:3px;">Add extra fields specific to this event (e.g. Running Category, Club Name)</p>
                </div>
                <button type="button" class="btn btn-sm btn-outline" id="addFieldBtn">
                    <i class="fas fa-plus"></i> Add Field
                </button>
            </div>

            <div id="customFieldsList">
                <?php
                $existingFields = [];
                if (!empty($event['custom_fields'])) {
                    $existingFields = json_decode($event['custom_fields'], true) ?: [];
                }
                if (!empty($_POST['field_label'])) {
                    // Re-render on validation error
                    foreach ($_POST['field_label'] as $i => $lbl) {
                        if (empty(trim($lbl))) continue;
                        $existingFields[] = [
                            'label'    => $lbl,
                            'type'     => $_POST['field_type'][$i] ?? 'text',
                            'required' => isset($_POST['field_required'][$i]),
                            'options'  => $_POST['field_options'][$i] ?? ''
                        ];
                    }
                }
                foreach ($existingFields as $i => $field):
                    $isSelect = ($field['type'] === 'select');
                    $optionsText = $isSelect && !empty($field['options'])
                        ? (is_array($field['options']) ? implode("\n", $field['options']) : $field['options'])
                        : '';
                ?>
                <div class="custom-field-row" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
                    <div style="display:grid;grid-template-columns:1fr 160px auto;gap:0.75rem;align-items:start;">
                        <div>
                            <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Field Label *</label>
                            <input type="text" name="field_label[]" value="<?= sanitize($field['label']) ?>"
                                   required placeholder="e.g. Running Category" style="width:100%;margin-top:4px;">
                        </div>
                        <div>
                            <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Type</label>
                            <select name="field_type[]" class="field-type-select" style="width:100%;margin-top:4px;">
                                <option value="text" <?= ($field['type']==='text')?'selected':'' ?>>Text</option>
                                <option value="select" <?= ($field['type']==='select')?'selected':'' ?>>Dropdown</option>
                                <option value="checkbox" <?= ($field['type']==='checkbox')?'selected':'' ?>>Checkbox</option>
                                <option value="number" <?= ($field['type']==='number')?'selected':'' ?>>Number</option>
                            </select>
                        </div>
                        <div style="display:flex;gap:0.5rem;align-items:center;padding-top:1.5rem;">
                            <label style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;cursor:pointer;">
                                <input type="checkbox" name="field_required[]" value="1" <?= !empty($field['required'])?'checked':'' ?>> Required
                            </label>
                            <button type="button" class="btn btn-sm btn-danger remove-field-btn" title="Remove">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="field-options-wrap" style="<?= $isSelect ? '' : 'display:none' ?>;margin-top:0.75rem;">
                        <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Options (one per line)</label>
                        <textarea name="field_options[]" rows="3" placeholder="5K&#10;10K&#10;21K"
                                  style="width:100%;margin-top:4px;resize:vertical;"><?= sanitize($optionsText) ?></textarea>
                    </div>
                    <?php if (!$isSelect): ?>
                    <textarea name="field_options[]" style="display:none;"></textarea>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Extra Info Section -->
        <div style="padding:1.5rem;border-top:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <div>
                    <label style="font-size:0.8rem;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:0.06em;">
                        <i class="fas fa-info-circle" style="color:var(--primary);margin-right:6px;"></i> Extra Event Info
                    </label>
                    <p style="font-size:0.75rem;color:var(--muted);margin-top:3px;">Add info blocks shown on the registration page and homepage (e.g. Route, Rules, What to Bring)</p>
                </div>
                <button type="button" class="btn btn-sm btn-outline" id="addInfoBtn">
                    <i class="fas fa-plus"></i> Add Info Block
                </button>
            </div>

            <div id="extraInfoList">
                <?php
                $existingInfo = [];
                if (!empty($event['extra_info'])) {
                    $decoded = json_decode($event['extra_info'], true);
                    if (is_array($decoded)) $existingInfo = $decoded;
                }
                foreach ($existingInfo as $i => $block):
                ?>
                <div class="info-block-row" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
                    <div style="display:grid;grid-template-columns:1fr auto;gap:0.75rem;align-items:start;">
                        <div>
                            <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Label</label>
                            <input type="text" name="info_label[]" value="<?= sanitize($block['label'] ?? '') ?>"
                                   placeholder="e.g. Route, Rules, What to Bring" style="width:100%;margin-top:4px;">
                        </div>
                        <div style="padding-top:1.5rem;">
                            <button type="button" class="btn btn-sm btn-danger remove-info-btn" title="Remove">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div style="margin-top:0.75rem;">
                        <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Content</label>
                        <textarea name="info_content[]" rows="3" placeholder="Enter details here..."
                                  style="width:100%;margin-top:4px;resize:vertical;"><?= sanitize($block['content'] ?? '') ?></textarea>
                    </div>
                </div>
                <?php endforeach; ?>
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

// Custom fields
const fieldTemplate = `
<div class="custom-field-row" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
    <div style="display:grid;grid-template-columns:1fr 160px auto;gap:0.75rem;align-items:start;">
        <div>
            <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Field Label *</label>
            <input type="text" name="field_label[]" required placeholder="e.g. Running Category" style="width:100%;margin-top:4px;">
        </div>
        <div>
            <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Type</label>
            <select name="field_type[]" class="field-type-select" style="width:100%;margin-top:4px;">
                <option value="text">Text</option>
                <option value="select">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="number">Number</option>
            </select>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;padding-top:1.5rem;">
            <label style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;cursor:pointer;">
                <input type="checkbox" name="field_required[]" value="1"> Required
            </label>
            <button type="button" class="btn btn-sm btn-danger remove-field-btn" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>
    <div class="field-options-wrap" style="display:none;margin-top:0.75rem;">
        <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Options (one per line)</label>
        <textarea name="field_options[]" rows="3" placeholder="5K&#10;10K&#10;21K" style="width:100%;margin-top:4px;resize:vertical;"></textarea>
    </div>
    <span style="display:none;"><textarea name="field_options[]"></textarea></span>
</div>`;

document.getElementById('addFieldBtn').addEventListener('click', () => {
    const list = document.getElementById('customFieldsList');
    const div  = document.createElement('div');
    div.innerHTML = fieldTemplate;
    const row = div.firstElementChild;
    list.appendChild(row);
    bindFieldEvents(row);
});

function bindFieldEvents(row) {
    // Remove button
    row.querySelector('.remove-field-btn').addEventListener('click', () => row.remove());

    // Type change — show/hide options textarea
    const typeSelect = row.querySelector('.field-type-select');
    const optionsWrap = row.querySelector('.field-options-wrap');
    const hiddenTextarea = row.querySelector('span textarea');

    typeSelect.addEventListener('change', function() {
        if (this.value === 'select') {
            optionsWrap.style.display = 'block';
            if (hiddenTextarea) hiddenTextarea.closest('span').style.display = 'none';
        } else {
            optionsWrap.style.display = 'none';
            if (hiddenTextarea) hiddenTextarea.closest('span').style.display = '';
        }
    });
}

// Bind events to existing fields
document.querySelectorAll('.custom-field-row').forEach(bindFieldEvents);

// ---- Extra Info Blocks ----
const infoTemplate = `
<div class="info-block-row" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
    <div style="display:grid;grid-template-columns:1fr auto;gap:0.75rem;align-items:start;">
        <div>
            <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Label</label>
            <input type="text" name="info_label[]" placeholder="e.g. Route, Rules, What to Bring" style="width:100%;margin-top:4px;">
        </div>
        <div style="padding-top:1.5rem;">
            <button type="button" class="btn btn-sm btn-danger remove-info-btn" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>
    <div style="margin-top:0.75rem;">
        <label style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">Content</label>
        <textarea name="info_content[]" rows="3" placeholder="Enter details here..." style="width:100%;margin-top:4px;resize:vertical;"></textarea>
    </div>
</div>`;

document.getElementById('addInfoBtn').addEventListener('click', () => {
    const list = document.getElementById('extraInfoList');
    const div  = document.createElement('div');
    div.innerHTML = infoTemplate;
    const row = div.firstElementChild;
    list.appendChild(row);
    row.querySelector('.remove-info-btn').addEventListener('click', () => row.remove());
});

document.querySelectorAll('.remove-info-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.info-block-row').remove());
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
