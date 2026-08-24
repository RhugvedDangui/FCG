<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pageTitle = 'AI HTML Generator';
require_once __DIR__ . '/includes/header.php';
?>

<div class="card-header mb-4">
    <h2><i class="fas fa-robot"></i> AI Event HTML Generator</h2>
    <span class="badge badge-info">Copy prompt → Add your content → Paste to ChatGPT/Claude → Copy HTML → Paste in Event Details</span>
</div>

<div class="card" style="margin-bottom:1.5rem;">
    <div style="padding:1.5rem;">
        <p style="font-size:0.9rem;color:var(--muted);margin-bottom:1rem;">
            Set the style preferences below. The prompt will give the AI the design rules.
            <strong>You add your actual content after copying the prompt.</strong>
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
            <div class="form-group">
                <label>Primary Accent Color (hex)</label>
                <input type="text" id="ai_color" placeholder="e.g. #f36c21" value="#FF4444">
            </div>
            <div class="form-group">
                <label>Background Color</label>
                <input type="text" id="ai_bg" placeholder="e.g. #0f0f0f" value="#0f0f0f">
            </div>
            <div class="form-group">
                <label>Card Style</label>
                <select id="ai_style">
                    <option value="bordered">Bordered cards with icon + heading + list</option>
                    <option value="minimal">Minimal clean cards</option>
                    <option value="gradient">Gradient accent cards</option>
                    <option value="table">Table / info grid layout</option>
                </select>
            </div>
            <div class="form-group">
                <label>Font Style</label>
                <select id="ai_font">
                    <option value="sporty">Sporty (Bebas Neue / Impact)</option>
                    <option value="clean">Clean (Arial / sans-serif)</option>
                    <option value="modern">Modern (system-ui)</option>
                </select>
            </div>
        </div>

        <button class="btn btn-primary" onclick="generatePrompt()">
            <i class="fas fa-magic"></i> Generate Prompt
        </button>
    </div>
</div>

<div class="card" id="promptCard" style="display:none;">
    <div style="padding:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <h3 style="font-size:0.95rem;font-weight:600;margin:0;">
                <i class="fas fa-copy" style="color:var(--primary);"></i> Copy prompt → Add your content at the bottom → Send to AI
            </h3>
            <button class="btn btn-primary btn-sm" onclick="copyPrompt()">
                <i class="fas fa-copy"></i> Copy Prompt
            </button>
        </div>
        <div style="background:rgba(255,68,68,0.06);border:1px solid rgba(255,68,68,0.15);border-radius:8px;padding:0.75rem 1rem;margin-bottom:0.75rem;font-size:0.82rem;color:var(--muted);">
            <i class="fas fa-info-circle" style="color:var(--primary);margin-right:6px;"></i>
            After copying, paste into ChatGPT/Claude and <strong>add your event content below the prompt</strong> — e.g. age categories, includes, rules, schedule, anything you want displayed.
        </div>
        <textarea id="generatedPrompt" rows="18"
                  style="width:100%;font-family:monospace;font-size:0.8rem;border:1.5px solid var(--border);border-radius:8px;padding:1rem;background:var(--bg);color:var(--text);resize:vertical;"
                  readonly></textarea>
    </div>
</div>

<div class="card" style="margin-top:1.5rem;">
    <div style="padding:1.5rem;">
        <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:1rem;">
            <i class="fas fa-lightbulb" style="color:var(--primary);"></i> How to use
        </h3>
        <ol style="font-size:0.875rem;color:var(--muted);line-height:2;padding-left:1.25rem;">
            <li>Set your color and style preferences above</li>
            <li>Click <strong>Generate Prompt</strong> and copy it</li>
            <li>Open <a href="https://chat.openai.com" target="_blank" style="color:var(--primary);">ChatGPT</a> or <a href="https://claude.ai" target="_blank" style="color:var(--primary);">Claude</a></li>
            <li>Paste the prompt then <strong>add your content below it</strong> — e.g:
                <div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:0.6rem 0.9rem;margin:0.5rem 0;font-family:monospace;font-size:0.78rem;color:var(--text);">
                    Age Categories: 15-30, 31-45, 46-60, Above 60<br>
                    Includes: Bib, Medal, E-Certificate, Breakfast<br>
                    Why Run: Improve fitness, Build discipline, Stay healthy<br>
                    Rules: No earphones, Stay on route, Respect marshals
                </div>
            </li>
            <li>Copy the HTML from the AI response</li>
            <li>Go to <a href="event-form.php" style="color:var(--primary);">Events → Edit Event</a> → paste into <strong>Event Details</strong> field → Save</li>
        </ol>
    </div>
</div>

<script>
function generatePrompt() {
    const color = document.getElementById('ai_color').value || '#FF4444';
    const bg    = document.getElementById('ai_bg').value || '#0f0f0f';
    const style = document.getElementById('ai_style').value;
    const font  = document.getElementById('ai_font').value;

    const styleDesc = {
        bordered: 'bordered cards with a colored border, SVG icon, bold heading, and bullet/check list',
        minimal:  'minimal clean cards with subtle borders and simple typography',
        gradient: 'cards with a gradient accent top border and clean content',
        table:    'table or info-grid layout with labeled rows'
    }[style];

    const fontDesc = {
        sporty: "Bebas Neue with Impact as fallback for headings, Arial for body",
        clean:  "Arial or sans-serif throughout",
        modern: "system-ui or -apple-system throughout"
    }[font];

    const prompt = `Generate a self-contained HTML snippet for displaying event information. Follow these exact requirements:

DESIGN RULES:
- Use ONLY inline CSS and a single scoped wrapper class — NO external stylesheets, NO CSS variables
- Dark background: ${bg} (it will be shown over a dark image in a hero banner)
- Primary accent color: ${color}
- Card style: ${styleDesc}
- Font: ${fontDesc}
- Fully responsive using CSS Grid: repeat(auto-fit, minmax(160px, 1fr))
- Cards: border-radius 8px, padding 12-16px
- Text colors: white (#fff) for headings, #e0e0e0 for body text
- The wrapper must have class "run-boxes-wrapper" and the grid must have class "run-grid"
- Each card must have class "run-card"

OUTPUT RULES:
- Output ONLY raw HTML — no markdown, no explanation, no code fences
- Include <style> tag with all CSS scoped to .run-boxes-wrapper
- Do NOT use any CSS variables like var(--anything)

I will now provide the content to display. Create one card/box for each section I provide below:
`;

    document.getElementById('generatedPrompt').value = prompt;
    document.getElementById('promptCard').style.display = 'block';
    document.getElementById('promptCard').scrollIntoView({ behavior: 'smooth' });
}

function copyPrompt() {
    const ta = document.getElementById('generatedPrompt');
    ta.select();
    document.execCommand('copy');
    const btn = event.target.closest('button');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => btn.innerHTML = original, 2000);
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
