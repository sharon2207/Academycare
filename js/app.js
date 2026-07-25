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

function getCleanHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '').replace(/\/$/, '').trim();
  return PAGES[raw] ? raw : null;
}

// ─── AUTH MODAL OVERLAY ──────────────────────
function openAuthModal(type = 'login') {
  const modal = document.getElementById('auth-modal');
  const loginCard = document.getElementById('auth-card-login');
  const regCard = document.getElementById('auth-card-register');

  if (!modal) return showPage(type);

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (type === 'register') {
    if (loginCard) loginCard.style.display = 'none';
    if (regCard) regCard.style.display = 'block';
  } else {
    if (regCard) regCard.style.display = 'none';
    if (loginCard) loginCard.style.display = 'block';
  }

  // Attach real-time validation handlers
  if (typeof attachValidator === 'function') {
    if (type === 'register') {
      attachValidator('reg-name', validateName);
      attachValidator('reg-email', validateEmail);
      const passEl = document.getElementById('reg-pass');
      if (passEl) {
        passEl.addEventListener('input', () => {
          if (typeof updatePasswordStrengthMeter === 'function')
            updatePasswordStrengthMeter(passEl.value, 'reg-pass-strength');
        });
      }
    } else {
      attachValidator('login-email', validateEmail);
    }
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ─── NAVIGATION ──────────────────────────────
function showPage(pageName, sectionHash = null) {
  if (!PAGES[pageName]) pageName = 'landing';

  // Sync browser URL hash
  const targetHash = '#' + pageName;
  if (window.location.hash !== targetHash && !sectionHash) {
    try { history.pushState(null, null, targetHash); } catch(e) {}
  }

  // Explicitly hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  // Render page if it has a renderer
  const pageConfig = PAGES[pageName];
  if (pageConfig && pageConfig.render) {
    try {
      pageConfig.render();
    } catch (err) {
      console.error('[AcademiCare] Error rendering page:', pageName, err);
    }
  }

  // Show selected page explicitly
  const pageEl = document.getElementById(pageConfig.id);
  if (pageEl) {
    pageEl.classList.add('active');
    pageEl.style.display = 'block';
    if (!sectionHash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  currentPage = pageName;
  updateNavbar(pageConfig.navbarStyle);
  updateNavLinks(pageName);
  updateNavbarAuth();

  // If navigating to landing with a specific section target
  if (pageName === 'landing' && sectionHash) {
    setTimeout(() => {
      const sectionEl = document.querySelector(sectionHash);
      if (sectionEl) sectionEl.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}

function updateNavbar(style) {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
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
      try {
        const user = JSON.parse(savedUser);
        container.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px">
            <div onclick="showPage('${user.role === 'student' ? 'dashboard' : 'counselor'}')" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:5px 10px;border-radius:var(--radius-full);cursor:pointer;">
              <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--violet));display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white">${user.avatar || 'U'}</div>
              <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;max-width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.name ? user.name.split(' ')[0] : 'User'}</span>
            </div>
            <button onclick="logout()" style="padding:5px 10px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#f87171;font-size:0.7rem;cursor:pointer;">🚪 Logout</button>
          </div>
        `;
      } catch(e) {
        localStorage.removeItem('academicare_user');
      }
    } else {
      container.innerHTML = `
        <button class="btn-outline" onclick="openAuthModal('login')">Sign In</button>
        <button class="btn-primary" onclick="openAuthModal('register')">Get Started</button>
      `;
    }
  }

  const links = document.getElementById('navLinks');
  if (links) {
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        links.innerHTML = `
          <a onclick="showPage('landing')" class="nav-link" style="cursor:pointer">Home</a>
          <a onclick="showPage('dashboard')" class="nav-link" style="cursor:pointer">Dashboard</a>
          <a onclick="showPage('checkin')" class="nav-link" style="cursor:pointer">Daily Check-In</a>
          <a onclick="showPage('analytics')" class="nav-link" style="cursor:pointer">Analytics</a>
          <a onclick="logout()" class="nav-link" style="cursor:pointer;color:#f87171">🚪 Logout (${user.name ? user.name.split(' ')[0] : 'User'})</a>
        `;
      } catch(e) {}
    } else {
      links.innerHTML = `
        <a onclick="showPage('landing')" class="nav-link" style="cursor:pointer">Home</a>
        <a onclick="navigateToSection('#features')" class="nav-link" style="cursor:pointer">Features</a>
        <a onclick="navigateToSection('#ml-models')" class="nav-link" style="cursor:pointer">ML Models</a>
        <a onclick="openAuthModal('login')" class="nav-link" style="cursor:pointer;color:var(--purple-light);font-weight:700">🔑 Sign In</a>
        <a onclick="openAuthModal('register')" class="nav-link" style="cursor:pointer;color:#34d399;font-weight:700">✨ Create Account</a>
      `;
    }
  }
}

function navigateToSection(sectionHash) {
  if (currentPage !== 'landing') {
    showPage('landing', sectionHash);
  } else {
    const el = document.querySelector(sectionHash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function updateNavLinks(page) {
  // Update nav active state if needed
}

// ─── SCROLL HANDLER ──────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ─── HAMBURGER MENU ──────────────────────────
function toggleMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.toggle('open');
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
    const res = await fetch('/api/login', {
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
      closeAuthModal();
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
    const res = await fetch('/api/students', {
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
    closeAuthModal();
    showToast('🎉', `Account created successfully for ${name}!`, 'success');
    setTimeout(() => showPage('checkin'), 600);

  } catch (err) {
    console.warn('Registration error:', err.message);
    showToast('❌', 'Unable to reach backend server. Please check your connection.', 'error');
    if (typeof resetLoadingBtn === 'function') resetLoadingBtn('btn-register', 'Create Account →');
  }
}

// ─── AUTH-AWARE FETCH HELPER ──────────────────
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
    setTimeout(() => { updateNavbarAuth(); openAuthModal('login'); }, 1500);
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
    const href = this.getAttribute('href');
    if (href === '#' || href === '#landing' || href === '#login' || href === '#register' || href === '#dashboard' || href === '#checkin' || href === '#analytics' || href === '#counselor' || href === '#groups') {
      return;
    }
    e.preventDefault();
    navigateToSection(href);
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
    closeAuthModal();
    const links = document.getElementById('navLinks');
    if (links && links.classList.contains('open')) links.classList.remove('open');
  }
});

// ─── HASH NAVIGATION ─────────────────────────
window.addEventListener('hashchange', () => {
  const target = getCleanHash();
  if (target && currentPage !== target) {
    showPage(target);
  }
});

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check session validity on load
  const token     = typeof getStoredToken === 'function' ? getStoredToken() : null;
  const savedUser = localStorage.getItem('academicare_user');

  if (token && typeof isTokenExpired === 'function' && isTokenExpired(token)) {
    if (typeof clearToken === 'function') clearToken();
    localStorage.removeItem('academicare_user');
  }

  const target = getCleanHash();
  if (target) {
    showPage(target);
  } else {
    showPage('landing');
  }
  setTimeout(observeElements, 100);

  const freshUser = localStorage.getItem('academicare_user');
  if (freshUser) {
    try {
      const user = JSON.parse(freshUser);
      setTimeout(() => {
        showToast('👤', `Welcome back, ${user.name ? user.name.split(' ')[0] : 'User'}! Click Dashboard to continue.`, 'info');
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
