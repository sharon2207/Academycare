// =============================================
// AcademiCare — Main App Controller
// Navigation, page management, UI interactions
// =============================================

// ─── PAGE REGISTRY ───────────────────────────
const PAGES = {
  landing:   { id: 'page-landing',   render: null,                navbarStyle: 'transparent' },
  login:     { id: 'page-login',     render: renderLoginPage,     navbarStyle: 'solid' },
  register:  { id: 'page-register',  render: renderRegisterPage,  navbarStyle: 'solid' },
  dashboard: { id: 'page-dashboard', render: renderDashboardPage, navbarStyle: 'solid' },
  checkin:   { id: 'page-checkin',   render: renderCheckinPage,   navbarStyle: 'solid' },
  analytics: { id: 'page-analytics', render: renderAnalyticsPage, navbarStyle: 'solid' },
  counselor: { id: 'page-counselor', render: renderCounselorPage, navbarStyle: 'solid' },
  groups:    { id: 'page-groups',    render: renderGroupsPage,    navbarStyle: 'solid' }
};

let currentPage = 'landing';

// ─── NAVIGATION ──────────────────────────────
function showPage(pageName) {
  if (!PAGES[pageName]) return;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Render page if it has a renderer
  const pageConfig = PAGES[pageName];
  if (pageConfig.render) {
    pageConfig.render();
  }

  // Show selected page
  const pageEl = document.getElementById(pageConfig.id);
  if (pageEl) {
    pageEl.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  currentPage = pageName;
  updateNavbar(pageConfig.navbarStyle);
  updateNavLinks(pageName);
  updateNavbarAuth();
}

function updateNavbar(style) {
  const navbar = document.getElementById('navbar');
  if (style === 'solid') {
    navbar.style.background = 'rgba(9,9,11,0.97)';
  } else {
    navbar.style.background = 'rgba(9,9,11,0.85)';
  }
}

function updateNavbarAuth() {
  const container = document.querySelector('.nav-actions');
  const savedUser = localStorage.getItem('academicare_user');

  if (container) {
    if (savedUser) {
      const user = JSON.parse(savedUser);
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px">
          <div onclick="showPage('${user.role === 'student' ? 'dashboard' : 'counselor'}')" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:5px 10px;border-radius:var(--radius-full);cursor:pointer;">
            <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--violet));display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white">${user.avatar || 'U'}</div>
            <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;max-width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.name.split(' ')[0]}</span>
          </div>
          <button onclick="logout()" style="padding:5px 10px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#f87171;font-size:0.7rem;cursor:pointer;">🚪 Logout</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button class="btn-outline" onclick="showPage('login')">Sign In</button>
        <button class="btn-primary" onclick="showPage('register')">Get Started</button>
      `;
    }
  }

  const links = document.getElementById('navLinks');
  if (links) {
    if (savedUser) {
      const user = JSON.parse(savedUser);
      links.innerHTML = `
        <a onclick="showPage('landing')" class="nav-link" style="cursor:pointer">Home</a>
        <a onclick="showPage('dashboard')" class="nav-link" style="cursor:pointer">Dashboard</a>
        <a onclick="showPage('checkin')" class="nav-link" style="cursor:pointer">Daily Check-In</a>
        <a onclick="showPage('analytics')" class="nav-link" style="cursor:pointer">Analytics</a>
        <a onclick="logout()" class="nav-link" style="cursor:pointer;color:#f87171">🚪 Logout (${user.name.split(' ')[0]})</a>
      `;
    } else {
      links.innerHTML = `
        <a onclick="showPage('landing')" class="nav-link" style="cursor:pointer">Home</a>
        <a href="#features" class="nav-link">Features</a>
        <a href="#ml-models" class="nav-link">ML Models</a>
        <a onclick="showPage('login')" class="nav-link" style="cursor:pointer;color:var(--purple-light);font-weight:700">🔑 Sign In</a>
        <a onclick="showPage('register')" class="nav-link" style="cursor:pointer;color:#34d399;font-weight:700">✨ Create Account</a>
      `;
    }
  }
}

function updateNavLinks(page) {
  // Update nav active state if needed
}

// ─── SCROLL HANDLER ──────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ─── HAMBURGER MENU ──────────────────────────
function toggleMenu() {
  const links = document.getElementById('navLinks');
  links.classList.toggle('open');
}

// ─── AUTH ────────────────────────────────────
let selectedRole = 'student';
function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('role-' + role)?.classList.add('selected');
}

async function handleLogin() {
  // Frontend validation first
  if (typeof validateLoginForm === 'function' && !validateLoginForm()) return;

  const email = document.getElementById('login-email')?.value?.trim();
  const pass  = document.getElementById('login-pass')?.value;
  if (!email) return showToast('❌', 'Please enter your college email', 'error');
  if (!pass)  return showToast('❌', 'Please enter your password', 'error');

  if (typeof showLoadingBtn === 'function') showLoadingBtn('btn-login', 'Signing in...');
  else showToast('🔐', 'Authenticating credentials...', 'info');

  try {
    const res = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, role: selectedRole })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const serverUser = data.user || {};
      const initials = serverUser.name
        ? serverUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
        : 'U';
      const user = {
        id:         serverUser.id,
        name:       serverUser.name,
        email:      serverUser.email,
        role:       serverUser.role || selectedRole,
        department: serverUser.department || 'MCA',
        year:       serverUser.year || 2,
        section:    serverUser.section || 'B',
        rollNo:     serverUser.roll_no || ('MCA24B' + serverUser.id),
        avatar:     initials,
        loginTime:  new Date().toISOString()
      };
      // Store JWT token + user session
      if (data.access_token && typeof storeToken === 'function') storeToken(data.access_token);
      localStorage.setItem('academicare_user', JSON.stringify(user));
      if (typeof closeAuthModal === 'function') closeAuthModal();
      showToast('✅', `Signed in successfully as ${user.name}!`, 'success');
      setTimeout(() => {
        if (user.role === 'counselor' || user.role === 'admin') showPage('counselor');
        else showPage('dashboard');
      }, 600);
    } else {
      const msg = data.detail || 'Incorrect email or password. Please try again.';
      showToast('❌', msg, 'error');
      if (typeof resetLoadingBtn === 'function') resetLoadingBtn('btn-login', 'Sign In to Dashboard →');
    }
  } catch (err) {
    console.warn('Server error or network offline:', err.message);
    showToast('❌', 'Unable to reach backend server. Please check your connection.', 'error');
    if (typeof resetLoadingBtn === 'function') resetLoadingBtn('btn-login', 'Sign In to Dashboard →');
  }
}

async function handleRegister() {
  // Frontend validation first
  if (typeof validateRegistrationForm === 'function' && !validateRegistrationForm()) return;

  const name    = document.getElementById('reg-name')?.value?.trim();
  const email   = document.getElementById('reg-email')?.value?.trim();
  const dept    = document.getElementById('reg-dept')?.value || 'MCA';
  const year    = parseInt(document.getElementById('reg-year')?.value) || 2;
  const pass    = document.getElementById('reg-pass')?.value;
  const confirm = document.getElementById('reg-confirm-pass')?.value || null;
  const ageEl   = document.getElementById('reg-age');
  const age     = ageEl && ageEl.value ? parseInt(ageEl.value) : null;

  if (!name)  return showToast('❌', 'Please enter your full name', 'error');
  if (!email) return showToast('❌', 'Please enter your college email', 'error');
  if (!pass)  return showToast('❌', 'Please choose a password', 'error');
  if (confirm && pass !== confirm) return showToast('❌', 'Passwords do not match', 'error');

  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const rollNo   = (dept.slice(0,3) || 'MCA').toUpperCase() + '24B' + Math.floor(Math.random()*90+10);

  if (typeof showLoadingBtn === 'function') showLoadingBtn('btn-register', 'Creating Account...');
  else showToast('💾', 'Creating student account in database...', 'info');

  try {
    const res = await fetch('http://127.0.0.1:8000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, password: pass, confirm_password: confirm,
        roll_no: rollNo, department: dept, year, age
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let msg = data.detail || 'Registration failed. Please check your details.';
      if (Array.isArray(data.detail)) {
        msg = data.detail.map(e => (e.msg || '').replace('Value error, ', '')).join(' | ');
      }
      showToast('❌', msg, 'error');
      if (typeof resetLoadingBtn === 'function') resetLoadingBtn('btn-register', 'Create Account →');
      return;
    }

    const user = {
      id: data.student_id, name, email, role: 'student',
      department: dept, year, section: 'B', rollNo, avatar: initials,
      loginTime: new Date().toISOString()
    };
    // Store JWT + user session
    if (data.access_token && typeof storeToken === 'function') storeToken(data.access_token);
    localStorage.setItem('academicare_user', JSON.stringify(user));
    if (typeof closeAuthModal === 'function') closeAuthModal();
    showToast('🎉', `Account created successfully for ${name}!`, 'success');
    setTimeout(() => showPage('checkin'), 600);

  } catch (err) {
    console.warn('Registration error:', err.message);
    showToast('❌', 'Unable to reach backend server. Please check your connection.', 'error');
    if (typeof resetLoadingBtn === 'function') resetLoadingBtn('btn-register', 'Create Account →');
  }
}

// ─── AUTH-AWARE FETCH HELPER ──────────────────
/**
 * Wrapper around fetch() that auto-adds JWT Authorization header.
 * On 401 (session expired): clears session and redirects to login.
 */
async function authFetch(url, options = {}) {
  const token = typeof getStoredToken === 'function' ? getStoredToken() : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    if (typeof clearToken === 'function') clearToken();
    localStorage.removeItem('academicare_user');
    showToast('🔒', 'Your session has expired. Please sign in again.', 'error');
    setTimeout(() => { updateNavbarAuth(); renderLoginPage(); }, 1500);
    throw new Error('Session expired');
  }
  return res;
}

function logout() {
  if (typeof clearToken === 'function') clearToken();
  localStorage.removeItem('academicare_user');
  updateNavbarAuth();
  showToast('👋', 'Logged out successfully! Starting fresh session.', 'info');
  setTimeout(() => showPage('landing'), 300);
}

// ─── TOAST NOTIFICATIONS ─────────────────────
function showToast(icon, message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';

  const borderColors = {
    success: 'rgba(16,185,129,0.4)',
    error:   'rgba(239,68,68,0.4)',
    info:    'rgba(99,102,241,0.4)',
    warning: 'rgba(245,158,11,0.4)'
  };
  toast.style.borderColor = borderColors[type] || borderColors.info;

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${message}</span>
    <span class="toast-close" onclick="this.closest('.toast').remove()">×</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'none';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// ─── SMOOTH SCROLL FOR NAV LINKS ─────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ─── INTERSECTION OBSERVER (Animate on scroll) ─
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

function observeElements() {
  document.querySelectorAll('.feature-card, .ml-card, .sdg-card, .tech-category').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 0.06}s`;
    observer.observe(el);
  });
}

// ─── KEYBOARD SHORTCUTS ───────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close mobile menu
    const links = document.getElementById('navLinks');
    if (links && links.classList.contains('open')) links.classList.remove('open');
    // Close auth modal
    if (typeof closeAuthModal === 'function') closeAuthModal();
  }
});

// ─── HASH NAVIGATION ─────────────────────────
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (PAGES[hash]) showPage(hash);
});

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check session validity on load
  const token    = typeof getStoredToken === 'function' ? getStoredToken() : null;
  const savedUser = localStorage.getItem('academicare_user');

  // If token exists but is expired, clear session
  if (token && typeof isTokenExpired === 'function' && isTokenExpired(token)) {
    if (typeof clearToken === 'function') clearToken();
    localStorage.removeItem('academicare_user');
  }

  const hash = window.location.hash.replace('#', '');
  if (PAGES[hash]) {
    showPage(hash);
  } else {
    showPage('landing');
  }
  setTimeout(observeElements, 100);

  const freshUser = localStorage.getItem('academicare_user');
  if (freshUser) {
    try {
      const user = JSON.parse(freshUser);
      setTimeout(() => {
        showToast('👤', `Welcome back, ${user.name.split(' ')[0]}! Click Dashboard to continue.`, 'info');
      }, 1000);
    } catch (e) {}
  } else {
    setTimeout(() => {
      showToast('🎓', 'AcademiCare — Predictive Student Wellness Platform', 'success');
    }, 1200);
  }

  console.log('%cAcademiCare v2.0', 'color:#6366f1;font-size:20px;font-weight:bold');
  console.log('%cProduction-Hardened | JWT + bcrypt + RBAC', 'color:#a78bfa;font-size:13px');
});
