// ---- Mobile Sidebar ----
const menuToggle    = document.getElementById('menuToggle');
const sidebar       = document.getElementById('sidebar');
const sidebarClose  = document.getElementById('sidebarClose');
const overlay       = document.getElementById('sidebarOverlay');

function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
}

menuToggle?.addEventListener('click', openSidebar);
sidebarClose?.addEventListener('click', closeSidebar);
overlay?.addEventListener('click', closeSidebar);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
});

// ---- Password toggle (login page) ----
const toggleBtn = document.querySelector('.toggle-password');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const input = document.getElementById('password');
        const icon  = toggleBtn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
}

// ---- Auto-dismiss alerts after 4s ----
document.querySelectorAll('.alert').forEach(el => {
    setTimeout(() => {
        el.style.transition = 'opacity 0.5s, transform 0.5s';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-8px)';
        setTimeout(() => el.remove(), 500);
    }, 4000);
});

// ---- ID Proof Modal ----
function openProofModal(url) {
    const modal = document.getElementById('proofModal');
    if (!modal) return;
    document.getElementById('proofModalImg').src = url;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeProofModal() {
    const modal = document.getElementById('proofModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.getElementById('proofModalImg').src = '';
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProofModal();
});
