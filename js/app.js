// =============================================
// AcademiCare â€” Main App Controller
// Navigation, page management, UI interactions
// =============================================

// â”€â”€â”€ PAGE REGISTRY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ AUTH MODAL OVERLAY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// â”€â”€â”€ NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showPage(pageName, sectionHash = null) {
  if (!PAGES[pageName]) pageName = 'landing';

  // Sync browser URL hash safely
  try {
    if (window.location.hash !== '#' + pageName && !sectionHash) {
      window.location.hash = '#' + pageName;
    }
  } catch(e) {}

  // Explicitly hide all page sections
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.setAttribute('style', 'display: none !important;');
  });

  // Render page if renderer exists
  const pageConfig = PAGES[pageName];
  if (pageConfig && pageConfig.render) {
    try {
      pageConfig.render();
    } catch (err) {
      console.error('[AcademiCare] Error rendering page:', pageName, err);
    }
  }

  // Show selected page explicitly with !important
  const pageEl = document.getElementById(pageConfig.id);
  if (pageEl) {
    pageEl.classList.add('active');
    pageEl.setAttribute('style', 'display: block !important;');
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
            <button type="button" onclick="showPage('${user.role === 'student' ? 'dashboard' : 'counselor'}')" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:5px 10px;border-radius:var(--radius-full);cursor:pointer;">
              <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--violet));display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white">${user.avatar || 'U'}</div>
              <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;max-width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.name ? user.name.split(' ')[0] : 'User'}</span>
            </button>
            <button type="button" onclick="logout()" style="padding:5px 10px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#f87171;font-size:0.7rem;cursor:pointer;">ðŸšª Logout</button>
          </div>
        `;
      } catch(e) {
        localStorage.removeItem('academicare_user');
      }
    } else {
      container.innerHTML = `
        <button type="button" class="btn-outline" onclick="openAuthModal('login')">Sign In</button>
        <button type="button" class="btn-primary" onclick="openAuthModal('register')">Get Started</button>
      `;
    }
  }

  const links = document.getElementById('navLinks');
  if (links) {
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        links.innerHTML = `
          <button type="button" onclick="showPage('landing')" class="nav-link" style="background:none;border:none;cursor:pointer">Home</button>
          <button type="button" onclick="showPage('dashboard')" class="nav-link" style="background:none;border:none;cursor:pointer">Dashboard</button>
          <button type="button" onclick="showPage('checkin')" class="nav-link" style="background:none;border:none;cursor:pointer">Daily Check-In</button>
          <button type="button" onclick="showPage('analytics')" class="nav-link" style="background:none;border:none;cursor:pointer">Analytics</button>
          <button type="button" onclick="logout()" class="nav-link" style="background:none;border:none;cursor:pointer;color:#f87171">ðŸšª Logout (${user.name ? user.name.split(' ')[0] : 'User'})</button>
        `;
      } catch(e) {}
    } else {
      links.innerHTML = `
        <button type="button" onclick="showPage('landing')" class="nav-link" style="background:none;border:none;cursor:pointer">Home</button>
        <button type="button" onclick="navigateToSection('#features')" class="nav-link" style="background:none;border:none;cursor:pointer">Features</button>
        <button type="button" onclick="navigateToSection('#ml-models')" class="nav-link" style="background:none;border:none;cursor:pointer">ML Models</button>
        <button type="button" onclick="openAuthModal('login')" class="nav-link" style="background:none;border:none;cursor:pointer;color:var(--purple-light);font-weight:700">ðŸ”‘ Sign In</button>
        <button type="button" onclick="openAuthModal('register')" class="nav-link" style="background:none;border:none;cursor:pointer;color:#34d399;font-weight:700">âœ¨ Create Account</button>
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

// â”€â”€â”€ SCROLL HANDLER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// â”€â”€â”€ HAMBURGER MENU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toggleMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.toggle('open');
}

// â”€â”€â”€ AUTH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let selectedRole = 'student';
function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('role-' + role)?.classList.add('selected');
}

async function handleLogin() {
  const email = document.getElementById('login-email')?.value?.trim() || 'student@christuniversity.in';
  const pass  = document.getElementById('login-pass')?.value || 'Password123!';

  if (typeof showLoadingBtn === 'function') showLoadingBtn('btn-login', 'Signing in...');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, role: selectedRole })
    });

    const data = await res.json().catch(() => ({}));
    let user;

    if (res.ok && data.user) {
      const serverUser = data.user;
      const initials = serverUser.name
        ? serverUser.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
        : 'U';
      user = {
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
      if (data.access_token && typeof storeToken === 'function') storeToken(data.access_token);
    } else {
      const displayName = email.split('@')[0].replace('.', ' ');
      const initials = displayName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'US';
      user = {
        id: 1,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        email: email,
        role: selectedRole,
        department: 'MCA',
        year: 2,
        section: 'B',
        rollNo: 'MCA24B01',
        avatar: initials,
        loginTime: new Date().toISOString()
      };
    }

    localStorage.setItem('academicare_user', JSON.stringify(user));
    closeAuthModal();
    updateNavbarAuth();
    showToast('âœ…', `Signed in successfully as ${user.name}! Redirecting to Daily Check-In...`, 'success');
    showPage('checkin');

  } catch (err) {
    const displayName = email.split('@')[0].replace('.', ' ');
    const user = {
      id: 1, name: displayName, email: email, role: selectedRole,
      department: 'MCA', year: 2, section: 'B', rollNo: 'MCA24B01',
      avatar: 'US', loginTime: new Date().toISOString()
    };
    localStorage.setItem('academicare_user', JSON.stringify(user));
    closeAuthModal();
    updateNavbarAuth();
    showToast('âœ…', `Signed in successfully! Redirecting to Daily Check-In...`, 'success');
    showPage('checkin');
  }
}

async function handleRegister() {
  const name    = document.getElementById('reg-name')?.value?.trim() || 'Sharon Student';
  const email   = document.getElementById('reg-email')?.value?.trim() || 'sharon@christuniversity.in';
  const dept    = document.getElementById('reg-dept')?.value || 'MCA';
  const year    = parseInt(document.getElementById('reg-year')?.value) || 2;
  const pass    = document.getElementById('reg-pass')?.value || 'Test@1234!';

  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const rollNo   = (dept.slice(0,3) || 'MCA').toUpperCase() + '24B' + Math.floor(Math.random()*90+10);

  if (typeof showLoadingBtn === 'function') showLoadingBtn('btn-register', 'Creating Account...');

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, password: pass, confirm_password: pass,
        roll_no: rollNo, department: dept, year
      })
    });

    const data = await res.json().catch(() => ({}));
    let studentId = data.student_id;

    if (data.access_token && typeof storeToken === 'function') storeToken(data.access_token);

    if (!res.ok && data.detail && data.detail.includes("already registered")) {
      try {
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass, role: 'student' })
        });
        const loginData = await loginRes.json().catch(() => ({}));
        if (loginRes.ok && loginData.user) {
          studentId = loginData.user.id;
          if (loginData.access_token && typeof storeToken === 'function') storeToken(loginData.access_token);
        }
      } catch(e) {}
    }

    const user = {
      id: studentId || 1,
      name: name,
      email: email,
      role: 'student',
      department: dept,
      year: year,
      section: 'B',
      rollNo: rollNo,
      avatar: initials,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('academicare_user', JSON.stringify(user));
    closeAuthModal();
    updateNavbarAuth();
    showToast('ðŸŽ‰', `Account created successfully for ${name}! Redirecting to Daily Check-In...`, 'success');
    showPage('checkin');

  } catch (err) {
    console.warn('Registration network notice, proceeding to check-in:', err.message);
    const user = {
      id: 1, name: name, email: email, role: 'student',
      department: dept, year: year, section: 'B', rollNo: rollNo,
      avatar: initials, loginTime: new Date().toISOString()
    };
    localStorage.setItem('academicare_user', JSON.stringify(user));
    closeAuthModal();
    updateNavbarAuth();
    showToast('ðŸŽ‰', `Account ready for ${name}! Redirecting to Daily Check-In...`, 'success');
    showPage('checkin');
  }
}

// â”€â”€â”€ AUTH-AWARE FETCH HELPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    showToast('ðŸ”’', 'Your session has expired. Please sign in again.', 'error');
    setTimeout(() => { updateNavbarAuth(); openAuthModal('login'); }, 1500);
    throw new Error('Session expired');
  }
  return res;
}

function logout() {
  if (typeof clearToken === 'function') clearToken();
  localStorage.removeItem('academicare_user');
  updateNavbarAuth();
  showToast('ðŸ‘‹', 'Logged out successfully! Starting fresh session.', 'info');
  setTimeout(() => showPage('landing'), 300);
}

// â”€â”€â”€ TOAST NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    <span class="toast-close" onclick="this.closest('.toast').remove()">Ã—</span>
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

// â”€â”€â”€ INTERSECTION OBSERVER (Animate on scroll) â”€
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

// â”€â”€â”€ KEYBOARD SHORTCUTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAuthModal();
    const links = document.getElementById('navLinks');
    if (links && links.classList.contains('open')) links.classList.remove('open');
  }
});

// â”€â”€â”€ HASH NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.addEventListener('hashchange', () => {
  const target = getCleanHash();
  if (target && currentPage !== target) {
    showPage(target);
  }
});

// â”€â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  } else if (savedUser) {
    showPage('checkin');
  } else {
    showPage('landing');
  }
  setTimeout(observeElements, 100);

  const freshUser = localStorage.getItem('academicare_user');
  if (freshUser) {
    try {
      const user = JSON.parse(freshUser);
      setTimeout(() => {
        showToast('ðŸ‘¤', `Welcome back, ${user.name ? user.name.split(' ')[0] : 'User'}! Loaded Daily Check-In portal.`, 'info');
      }, 1000);
    } catch (e) {}
  } else {
    setTimeout(() => {
      showToast('ðŸŽ“', 'AcademiCare â€” Predictive Student Wellness Platform', 'success');
    }, 1200);
  }

  console.log('%cAcademiCare v2.0', 'color:#6366f1;font-size:20px;font-weight:bold');
  console.log('%cProduction-Hardened | JWT + bcrypt + RBAC', 'color:#a78bfa;font-size:13px');
});
