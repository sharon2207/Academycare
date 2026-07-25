// =============================================
// AcademiCare  Page Renderer
// All inner pages rendered dynamically
// =============================================

function renderLoginPage() {
  document.getElementById('page-login').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:radial-gradient(ellipse at top, rgba(99,102,241,0.12), transparent 70%);">
      <div style="width:100%;max-width:440px;background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <button onclick="showPage('landing')" style="background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--text-secondary);padding:6px 14px;border-radius:9999px;font-size:0.8rem;cursor:pointer">Back</button>
          <span style="font-size:0.75rem;color:var(--purple-light);font-weight:600">CHRIST University</span>
        </div>
        <h1 style="text-align:center;font-size:1.75rem;font-weight:800;color:white;margin-bottom:6px">Welcome Back</h1>
        <p style="text-align:center;font-size:0.85rem;color:var(--text-secondary);margin-bottom:24px">Sign in to access your student wellness portal</p>
        <div class="role-selector" style="display:flex;gap:8px;margin-bottom:20px">
          <button class="role-btn selected" id="role-student" onclick="selectRole('student')">Student</button>
          <button class="role-btn" id="role-counselor" onclick="selectRole('counselor')">Counselor</button>
          <button class="role-btn" id="role-admin" onclick="selectRole('admin')">Admin</button>
        </div>
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">College Email *</label>
          <input type="email" id="login-email" placeholder="student.name@christuniversity.in"
            style="width:100%;padding:12px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box" autocomplete="email" />
        </div>
        <div style="margin-bottom:24px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Password *</label>
          <input type="password" id="login-pass" placeholder="Your password"
            style="width:100%;padding:12px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box" autocomplete="current-password" />
        </div>
        <button id="btn-login" onclick="handleLogin()"
          style="width:100%;padding:14px;border-radius:9999px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;font-size:1rem;border:none;cursor:pointer;box-shadow:0 0 20px rgba(99,102,241,0.4)">
          Sign In to Dashboard
        </button>
        <div style="text-align:center;margin-top:20px;font-size:0.85rem;color:var(--text-muted)">
          No account? <a onclick="showPage('register')" style="color:var(--purple-light);font-weight:600;cursor:pointer">Register here</a>
        </div>
      </div>
    </div>
  `;
  if (typeof attachValidator === 'function') {
    attachValidator('login-email', validateEmail);
  }
}

function renderRegisterPage() {
  document.getElementById('page-register').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:radial-gradient(ellipse at top, rgba(99,102,241,0.12), transparent 70%);">
      <div style="width:100%;max-width:480px;background:var(--bg-card);border:1px solid var(--border);border-radius:24px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <button onclick="showPage('landing')" style="background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--text-secondary);padding:6px 14px;border-radius:9999px;font-size:0.8rem;cursor:pointer">Back</button>
          <span style="font-size:0.75rem;color:var(--purple-light);font-weight:600">CHRIST University</span>
        </div>
        <h1 style="text-align:center;font-size:1.6rem;font-weight:800;color:white;margin-bottom:4px">Create Student Account</h1>
        <p style="text-align:center;font-size:0.8rem;color:var(--text-secondary);margin-bottom:20px">Join the AcademiCare Student Wellness Portal</p>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Full Name * (letters only, 3-50 chars)</label>
          <input type="text" id="reg-name" placeholder="Your full name"
            style="width:100%;padding:11px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box" maxlength="50" />
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">College Email *</label>
          <input type="email" id="reg-email" placeholder="student@christuniversity.in"
            style="width:100%;padding:11px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box" />
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Age (17-35)</label>
          <input type="number" id="reg-age" placeholder="e.g. 21" min="17" max="35"
            style="width:100%;padding:11px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box" />
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Department *</label>
          <select id="reg-dept" style="width:100%;padding:11px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box">
            <option value="MCA">MCA - Dept. of Computer Science</option>
            <option value="MSc DS">MSc Data Science</option>
            <option value="MSc CS">MSc Computer Science</option>
            <option value="MBA">MBA - School of Business</option>
            <option value="BCom FA">BCom Finance and Accountancy</option>
            <option value="BA LLB">School of Law</option>
            <option value="BTech CS">School of Engineering</option>
          </select>
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Year of Study *</label>
          <select id="reg-year" style="width:100%;padding:11px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box">
            <option value="1">Year 1</option>
            <option value="2" selected>Year 2</option>
            <option value="3">Year 3</option>
          </select>
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Password * (8+ chars, upper, lower, number, special)</label>
          <input type="password" id="reg-pass" placeholder="Create a strong password"
            style="width:100%;padding:11px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box" autocomplete="new-password" />
          <div id="reg-pass-strength"></div>
        </div>
        <div style="margin-bottom:24px">
          <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Confirm Password *</label>
          <input type="password" id="reg-confirm-pass" placeholder="Re-enter your password"
            style="width:100%;padding:11px;border-radius:12px;background:#111113;border:1px solid var(--border);color:white;font-size:0.9rem;box-sizing:border-box" autocomplete="new-password" />
        </div>
        <button id="btn-register" onclick="handleRegister()"
          style="width:100%;padding:14px;border-radius:9999px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;font-size:1rem;border:none;cursor:pointer;box-shadow:0 0 20px rgba(99,102,241,0.4)">
          Create Account and Continue
        </button>
        <div style="text-align:center;margin-top:20px;font-size:0.85rem;color:var(--text-muted)">
          Have an account? <a onclick="showPage('login')" style="color:var(--purple-light);font-weight:600;cursor:pointer">Sign in here</a>
        </div>
      </div>
    </div>
  `;
  if (typeof attachValidator === 'function') {
    attachValidator('reg-name', validateName);
    attachValidator('reg-email', validateEmail);
    attachValidator('reg-age', validateAge, false);
    const passEl = document.getElementById('reg-pass');
    if (passEl) {
      passEl.addEventListener('input', () => {
        if (typeof updatePasswordStrengthMeter === 'function')
          updatePasswordStrengthMeter(passEl.value, 'reg-pass-strength');
        clearTimeout(passEl._vTimer);
        passEl._vTimer = setTimeout(() => {
          const err = validatePassword(passEl.value);
          if (err) showFieldError('reg-pass', err);
          else showFieldSuccess('reg-pass');
        }, 600);
      });
    }
    const confirmEl = document.getElementById('reg-confirm-pass');
    if (confirmEl && passEl) {
      confirmEl.addEventListener('input', () => {
        clearTimeout(confirmEl._vTimer);
        confirmEl._vTimer = setTimeout(() => {
          const err = validatePasswordMatch(passEl.value, confirmEl.value);
          if (err) showFieldError('reg-confirm-pass', err);
          else if (confirmEl.value) showFieldSuccess('reg-confirm-pass');
        }, 400);
      });
    }
  }
}
async function renderDashboardPage() {
  const student = AcademiData.currentStudent;
  
  //  Show Loading Skeleton while fetching 
  document.getElementById('page-dashboard').innerHTML = `
    <div class="inner-page-wrap">
      <div style="text-align:center;padding:120px 20px">
        <div style="font-size:3rem;margin-bottom:16px;animation:spin 1s linear infinite;display:inline-block"></div>
        <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;color:white">Syncing with AcademiCare Database...</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">Querying: GET /api/dashboard/${student.id}</div>
      </div>
    </div>
  `;

  let latestScore     = null;
  let history         = [];
  let latestCheckin   = null;
  let recommendations = [];
  let isOffline       = false;

  try {
    const res = await fetch(`/api/dashboard/${student.id}`, { headers: (typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}) });
    if (!res.ok) throw new Error('Failed to load dashboard from API');
    const data = await res.json();
    
    latestScore     = data.latest_score;
    history         = data.score_history;
    latestCheckin   = data.latest_checkin;
    recommendations = data.recommendations;
    
    // Save last check-in to window so stats bar can show it immediately
    window._lastCheckin = latestCheckin;
  } catch (err) {
    console.warn("Backend offline or error fetching profile, using offline session fallback:", err.message);
    isOffline = true;
  }

  // Get today's local date in YYYY-MM-DD format
  const todayStr = new Date().toLocaleDateString('sv').substring(0, 10);
  const hasCheckedInToday = latestCheckin && latestCheckin.checkin_date === todayStr;

  //   FORCE DAILY CHECK-IN 
  if (!isOffline) {
    if (!latestCheckin) {
      showToast('ðŸ¤–', `Welcome ${student.name}! Please complete your first Daily Check-in to analyze your burnout score.`, 'info');
      showPage('checkin');
      return;
    } else if (!hasCheckedInToday) {
      showToast('ðŸ“…', `Hi ${student.name}, please complete today's Daily Check-in first!`, 'info');
      showPage('checkin');
      return;
    }
  }

  // Fallback default variables if offline or DB record doesn't exist
  const s = {
    current: latestScore ? latestScore.burnout_score : 67,
    riskLevel: latestScore ? latestScore.risk_level : 'High',
    change: latestScore ? (latestScore.score_delta || 0) : 9,
    confidence: latestScore ? (latestScore.rf_confidence || 0.84) : 0.84
  };

  const currentSleep = latestCheckin ? latestCheckin.sleep_hours : 5.2;
  const currentStudy = latestCheckin ? latestCheckin.study_hours : 7.8;
  const currentMood  = latestCheckin ? latestCheckin.mood_score : 6;

  const exams = AcademiData.examTimetable;
  const nextExam = exams.length > 0 ? exams[0] : null;
  const resilience = AcademiData.resilienceScore;

  const iconMap = {
    sleep: '',
    study: '',
    mental: '',
    physical: '',
    social: '',
    general: ''
  };

  const recsList = recommendations.length > 0 ? recommendations : [
    { category: 'sleep', title: 'Improve Sleep Quality', body_text: 'Aim for 7-8 hours of sleep to reduce stress.', priority: 1 },
    { category: 'study', title: 'Take Regular Study Breaks', body_text: 'Use the 50/10 study rule to keep your mind fresh.', priority: 2 }
  ];

  document.getElementById('page-dashboard').innerHTML = `
    <div class="inner-page-wrap">
      <div class="page-header">
        <div class="page-header-inner">
          <button class="back-btn" onclick="showPage('landing')"> Home</button>
          <div class="page-title-area">
            <div class="page-title">Student Dashboard</div>
            <div class="page-subtitle">Welcome back, <strong>${student.name}</strong>  |  ${student.department} Year ${student.year}  |  ${new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn-primary" onclick="showPage('checkin')"> Daily Check-in</button>
            <button class="btn-outline" onclick="showPage('analytics')"> Analytics</button>
            <button onclick="logout()" style="padding:8px 14px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:0.75rem;cursor:pointer;"> Logout</button>
          </div>
        </div>
      </div>
      <div class="page-content">

        <!-- Quick Stats Bar -->
        <div class="stats-bar">
          <div class="stats-bar-item">
            <div class="sbi-value" style="color: ${getRiskColor(s.riskLevel)}">${s.current}</div>
            <div class="sbi-label">Burnout Score</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color: var(--red)">${currentSleep}h</div>
            <div class="sbi-label">Last Sleep</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color: var(--purple-light)">${currentMood}/10</div>
            <div class="sbi-label">Last Mood</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color: var(--green)">${student.streak || 0}</div>
            <div class="sbi-label">Day Streak </div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color: var(--yellow)">${nextExam ? nextExam.daysLeft+'d' : ' - '}</div>
            <div class="sbi-label">${nextExam ? 'Days to '+nextExam.subject.split(' ')[0] : 'No Exams Set'}</div>
          </div>
        </div>

        <div class="dashboard-grid">

          <!-- Burnout Score Gauge -->
          <div class="card col-3">
            <div class="card-header">
              <span class="card-title">AI Burnout Score</span>
              <span class="card-badge badge-live"> ${isOffline ? 'OFFLINE DEMO' : 'LIVE'}</span>
            </div>
            <div class="burnout-gauge-wrap">
              <svg viewBox="0 0 200 140" class="burnout-gauge-svg" style="width:100%;max-width:200px">
                <!-- Track -->
                <path d="M20 120 A80 80 0 0 1 180 120" fill="none" stroke="#27272a" stroke-width="16" stroke-linecap="round"/>
                <!-- Low zone -->
                <path d="M20 120 A80 80 0 0 1 75 48" fill="none" stroke="#10b981" stroke-width="16" stroke-linecap="round" opacity="0.3"/>
                <!-- Moderate zone -->
                <path d="M75 48 A80 80 0 0 1 125 48" fill="none" stroke="#f59e0b" stroke-width="16" stroke-linecap="round" opacity="0.3"/>
                <!-- High zone -->
                <path d="M125 48 A80 80 0 0 1 180 120" fill="none" stroke="#ef4444" stroke-width="16" stroke-linecap="round" opacity="0.3"/>
                <!-- Score arc -->
                <path d="M20 120 A80 80 0 0 1 180 120" fill="none" stroke="url(#dashGrad)" stroke-width="16" stroke-linecap="round"
                  stroke-dasharray="251" stroke-dashoffset="${getRiskGaugeOffset(s.current)}" class="score-arc"/>
                <!-- Score text -->
                <text x="100" y="100" text-anchor="middle" fill="white" font-family="Outfit,sans-serif" font-size="38" font-weight="900">${s.current}</text>
                <text x="100" y="125" text-anchor="middle" fill="${getRiskColor(s.riskLevel)}" font-size="11" font-weight="700" letter-spacing="2">${s.riskLevel.toUpperCase()}</text>
                <text x="100" y="138" text-anchor="middle" fill="#71717a" font-size="8">RF Confidence: ${(s.confidence*100).toFixed(0)}%</text>
                <text x="25" y="134" fill="#71717a" font-size="7">LOW</text>
                <text x="157" y="134" fill="#71717a" font-size="7">HIGH</text>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#10b981"/>
                    <stop offset="50%" stop-color="#f59e0b"/>
                    <stop offset="100%" stop-color="#ef4444"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="burnout-risk-label risk-${s.riskLevel.toLowerCase()}" style="text-align:center">
                ${s.change >= 0 ? ` +${s.change} from yesterday` : ` ${s.change} from yesterday`}
              </div>
              <div style="font-size:0.7rem;color:var(--text-muted);text-align:center;margin-top:6px">
                Random Forest  |  12 Features
              </div>
            </div>
          </div>

          <!-- Risk Banner + Recs -->
          <div class="card col-9" style="display:flex;flex-direction:column;gap:16px">
            <div class="card-header">
              <span class="card-title">AI Wellness Recommendations</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">Personalized for ${student.name}</span>
            </div>
            <div class="risk-banner ${s.riskLevel.toLowerCase()}">
              <span class="risk-banner-icon">${s.riskLevel==='Critical'?'':s.riskLevel==='High'?'':''}</span>
              <div class="risk-banner-text">
                <h4>${s.riskLevel} Burnout Risk Detected</h4>
                <p>
                  ${s.riskLevel === 'Critical' ? 'Your score has crossed 80. An anonymous alert has been sent to college counseling.' :
                    s.riskLevel === 'High' ? 'Your academic workload + sleep parameters indicate high burnout risk.' :
                    s.riskLevel === 'Moderate' ? 'You have moderate stress levels. Small wellness steps can prevent escalation.' :
                    'Great job! Your wellness metrics are stable. Keep up the balance.'}
                </p>
              </div>
              <button class="resolve-btn" onclick="showPage('checkin')">Update Check-in</button>
            </div>
            <div class="rec-list">
              ${recsList.map(r => `
                <div class="rec-item">
                  <span class="rec-icon">${r.icon || iconMap[r.category.toLowerCase()] || ''}</span>
                  <div class="rec-text">
                    <strong>${r.title}</strong>
                    ${r.text || r.body_text || ''}
                  </div>
                </div>
              `).join('')}
            </div>
            <button onclick="showPage('analytics')" style="align-self:flex-start;padding:8px 18px;border-radius:var(--radius-full);background:var(--bg-glass);border:1px solid var(--border);color:var(--text-secondary);font-size:0.8rem;cursor:pointer;transition:var(--transition)">View All Recommendations </button>
          </div>

          <!-- Today's Metrics -->
          <div class="card col-4">
            <div class="card-header"><span class="card-title">Today's Check-in Data</span></div>
            <div class="metric-row" style="grid-template-columns:1fr 1fr 1fr">
              <div class="metric-card">
                <div class="metric-icon-label"><span class="metric-icon"></span><span class="metric-label">Sleep</span></div>
                <div class="metric-value" style="color:${currentSleep < 6 ? 'var(--red)' : 'var(--green)'};font-size:1.4rem">${currentSleep}h</div>
                <div class="metric-change">${currentSleep < 6 ? 'Low (Aim for 7h+)' : 'Good sleep'}</div>
              </div>
              <div class="metric-card">
                <div class="metric-icon-label"><span class="metric-icon"></span><span class="metric-label">Study</span></div>
                <div class="metric-value" style="font-size:1.4rem">${currentStudy}h</div>
                <div class="metric-change">${currentStudy > 8 ? 'High intensity' : 'Balanced study'}</div>
              </div>
              <div class="metric-card">
                <div class="metric-icon-label"><span class="metric-icon"></span><span class="metric-label">Mood</span></div>
                <div class="metric-value" style="color:${currentMood < 5 ? 'var(--red)' : currentMood < 8 ? 'var(--yellow)' : 'var(--green)'};font-size:1.4rem">${currentMood}/10</div>
                <div class="metric-change">Mood Rating</div>
              </div>
            </div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
              <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px">Active Stress Flags</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                ${latestCheckin && latestCheckin.gate_cat_prep ? '<span style="font-size:0.65rem;padding:3px 8px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2)"> GATE Prep</span>' : ''}
                ${latestCheckin && latestCheckin.placement_anxiety ? '<span style="font-size:0.65rem;padding:3px 8px;border-radius:var(--radius-full);background:rgba(245,158,11,0.1);color:#fbbf24;border:1px solid rgba(245,158,11,0.2)"> Placement Season</span>' : ''}
                ${latestCheckin && latestCheckin.family_stress ? '<span style="font-size:0.65rem;padding:3px 8px;border-radius:var(--radius-full);background:rgba(99,102,241,0.1);color:var(--purple-light);border:1px solid rgba(99,102,241,0.2)"> Family Stress</span>' : ''}
                ${latestCheckin && latestCheckin.social_isolation ? '<span style="font-size:0.65rem;padding:3px 8px;border-radius:var(--radius-full);background:rgba(139,92,246,0.1);color:var(--purple-light);border:1px solid rgba(139,92,246,0.2)"> Social Isolation</span>' : ''}
                ${!latestCheckin || (!latestCheckin.gate_cat_prep && !latestCheckin.placement_anxiety && !latestCheckin.family_stress && !latestCheckin.social_isolation) ? '<span style="font-size:0.65rem;padding:3px 8px;border-radius:var(--radius-full);background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.2)"> No Active Stress Triggers</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Exam Countdown -->
          <div class="card col-4">
            <div class="card-header">
              <span class="card-title">Exam Stress Predictions</span>
              <div style="display:flex;gap:6px">
                <span style="font-size:0.7rem;color:var(--text-muted)">Regression Model</span>
                <button onclick="openAddExamModal()" style="font-size:0.65rem;padding:2px 8px;border-radius:var(--radius-full);background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:var(--purple-light);cursor:pointer;">+ Add Exam</button>
              </div>
            </div>
            ${exams.length === 0 ? `
              <div style="text-align:center;padding:24px 16px;color:var(--text-muted)">
                <div style="font-size:2rem;margin-bottom:8px"></div>
                <div style="font-size:0.85rem;font-weight:500;margin-bottom:6px">No exams added yet</div>
                <div style="font-size:0.75rem;margin-bottom:12px">Add your exam dates and we'll predict stress levels</div>
                <button onclick="openAddExamModal()" style="padding:8px 16px;border-radius:var(--radius-full);background:var(--purple);color:white;border:none;font-size:0.75rem;cursor:pointer;">+ Add Your Exams</button>
              </div>
            ` : `
            <div class="exam-timeline">
              ${exams.slice(0,3).map(e => `
                <div class="exam-item">
                  <div class="exam-dot ${e.status}">${e.daysLeft}d</div>
                  <div class="exam-content">
                    <div class="exam-subject">${e.subject}</div>
                    <div class="exam-date">${new Date(e.examDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}  |  ${e.code||''}</div>
                    <span class="exam-prediction pred-${e.predictedStress > 70 ? 'high' : e.predictedStress > 50 ? 'medium' : 'low'}">
                       Predicted stress: ${e.predictedStress}/100
                    </span>
                  </div>
                  <button onclick="deleteExam('${e.subject}')" style="font-size:0.6rem;padding:2px 6px;border-radius:4px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;cursor:pointer;"></button>
                </div>
              `).join('')}
            </div>
            `}
          </div>

          <!-- Resilience Score -->
          <div class="card col-4">
            <div class="card-header"><span class="card-title">Resilience Recovery Score</span><span style="font-size:0.7rem;color:var(--green)"> Improving</span></div>
            <div class="resilience-score-big">${resilience.current}</div>
            <div style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-bottom:16px">out of 100  -  How well you recover after burnout</div>
            <div class="resilience-progress">
              <div class="resilience-bar" style="width:${resilience.current}%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);margin-top:4px">
              <span>Poor Recovery</span><span>Excellent</span>
            </div>
            <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
              ${resilience.episodes.map((ep, i) => `
                <div style="display:flex;align-items:center;gap:8px;font-size:0.75rem">
                  <span style="color:var(--text-muted)">Episode ${i+1}</span>
                  <span style="flex:1;background:var(--border);border-radius:var(--radius-full);height:4px;overflow:hidden">
                    <span style="display:block;height:100%;width:${ep.recoveryScore}%;background:var(--green);border-radius:var(--radius-full)"></span>
                  </span>
                  <span style="color:var(--green);font-weight:600">${ep.recoveryScore}</span>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:12px;font-size:0.7rem;color:var(--text-muted)">Avg Recovery: ${resilience.avgRecoveryDays} days  |  3 episodes tracked</div>
          </div>

          <!-- 7-Day LSTM Prediction -->
          <div class="card col-12">
            <div class="card-header">
              <span class="card-title">LSTM Stress Trajectory  -  7 Day Forecast</span>
              <div class="chart-legend">
                <div class="legend-item"><span class="legend-dot" style="background:var(--purple)"></span>Historical Score</div>
                <div class="legend-item"><span class="legend-dot" style="background:var(--red);"></span>LSTM Prediction</div>
              </div>
            </div>
            <div class="chart-canvas-wrap">
              <canvas id="lstmChart"></canvas>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  // Draw LSTM chart after render
  setTimeout(() => drawLSTMChart(history), 100);
}

async function renderCheckinPage() {
  const student = AcademiData.currentStudent;
  const todayStr = new Date().toLocaleDateString('sv').substring(0, 10);

  // Check if today's checkin is already completed in localStorage or backend
  const lastCheckinDate = localStorage.getItem('academicare_last_checkin_' + (student.email || 'guest'));
  let alreadyCheckedInToday = lastCheckinDate === todayStr;

  if (!alreadyCheckedInToday) {
    try {
      const res = await fetch(`/api/history/${student.id}`, { headers: (typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}) });
      if (res.ok) {
        const result = await res.json();
        if (result.data && result.data.some(r => r.score_date === todayStr)) {
          alreadyCheckedInToday = true;
          localStorage.setItem('academicare_last_checkin_' + (student.email || 'guest'), todayStr);
        }
      }
    } catch (e) {}
  }

  if (alreadyCheckedInToday) {
    document.getElementById('page-checkin').innerHTML = `
      <div class="inner-page-wrap">
        <div class="page-header">
          <div class="page-header-inner">
            <button class="back-btn" onclick="showPage('dashboard')"> Dashboard</button>
            <div class="page-title-area">
              <div class="page-title">Daily Check-In Status</div>
              <div class="page-subtitle">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
            </div>
          </div>
        </div>
        <div class="page-content">
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:48px 24px;text-align:center;max-width:540px;margin:30px auto;box-shadow:0 10px 30px rgba(0,0,0,0.5)">
            <div style="font-size:3.5rem;margin-bottom:12px">ðŸ“…</div>
            <h2 style="color:white;font-size:1.4rem;margin-bottom:8px;font-weight:700">Check-In Already Completed Today!</h2>
            <p style="color:var(--text-muted);font-size:0.85rem;line-height:1.6;margin-bottom:24px">
              Hi <strong>${student.name}</strong>, you have already submitted your daily check-in for today (<code>${todayStr}</code>). To ensure accurate 30-day analytics and prevent data skewing, check-ins are limited to <strong>once per day</strong>. Come back tomorrow!
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
              <button class="btn-primary" onclick="showPage('analytics')"> View Your Analytics</button>
              <button class="btn-hero-secondary" onclick="showPage('dashboard')"> Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  let currentStep = 1;
  const totalSteps = 4;
  let checkinData = { mood: 7, sleep: 7, study: 5, social: 2, placement: false, family: false, gate: false, isolation: false, notes: '' };

  document.getElementById('page-checkin').innerHTML = `
    <div class="inner-page-wrap">
      <div class="page-header">
        <div class="page-header-inner">
          <button class="back-btn" onclick="showPage('dashboard')"> Dashboard</button>
          <div class="page-title-area">
            <div class="page-title">Daily Check-In</div>
            <div class="page-subtitle">2-minute wellness check  |  ${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
          </div>
        </div>
      </div>
      <div class="page-content">
        <div class="checkin-container">
          <div class="checkin-card">
            <div class="checkin-progress" id="checkinProgress">
              ${Array.from({length:totalSteps}, (_, i) => `<div class="progress-step ${i===0?'active':''}" id="step-prog-${i+1}"></div>`).join('')}
            </div>

            <!-- Step 1: Mood -->
            <div class="checkin-step active" id="step-1">
              <div class="step-title"> How are you feeling today?</div>
              <div class="step-subtitle">Rate your overall mood on a scale of 1 (terrible) to 10 (amazing)</div>
              <div class="mood-grid" id="moodGrid">
                ${[
                  {v:1,e:'',l:'Terrible'},{v:2,e:'',l:'Very Bad'},{v:3,e:'',l:'Bad'},
                  {v:4,e:'',l:'Low'},{v:5,e:'',l:'Neutral'},{v:6,e:'',l:'Okay'},
                  {v:7,e:'',l:'Good'},{v:8,e:'',l:'Great'},{v:9,e:'',l:'Excellent'},{v:10,e:'',l:'Amazing'}
                ].map(m => `
                  <div class="mood-btn ${m.v===7?'selected':''}" id="mood-${m.v}" onclick="selectMood(${m.v})">
                    <span class="emoji">${m.e}</span>
                    <span class="label">${m.l}</span>
                  </div>
                `).join('')}
              </div>
              <div class="checkin-nav">
                <span></span>
                <button class="btn-checkin-next" onclick="nextStep(1)">Next </button>
              </div>
            </div>

            <!-- Step 2: Sleep & Study -->
            <div class="checkin-step" id="step-2">
              <div class="step-title"> Sleep & Study Hours</div>
              <div class="step-subtitle">Log last night's sleep and today's planned study hours</div>
              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label"> Sleep Hours Last Night</span>
                  <span class="slider-value" id="sleepVal">7.0 hours</span>
                </div>
                <input type="range" class="range-input" id="sleepSlider" min="1" max="12" step="0.5" value="7"
                  oninput="document.getElementById('sleepVal').textContent = this.value + ' hours'; window.checkinData.sleep = parseFloat(this.value)">
                <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);margin-top:4px">
                  <span>1h (Very Low)</span><span>7-8h (Ideal)</span><span>12h (Max)</span>
                </div>
              </div>
              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label"> Study Hours Today</span>
                  <span class="slider-value" id="studyVal">5.0 hours</span>
                </div>
                <input type="range" class="range-input" id="studySlider" min="0" max="16" step="0.5" value="5"
                  oninput="document.getElementById('studyVal').textContent = this.value + ' hours'; window.checkinData.study = parseFloat(this.value)">
                <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);margin-top:4px">
                  <span>0h</span><span>4-6h (Balanced)</span><span>16h</span>
                </div>
              </div>
              <div class="slider-group" style="margin-top:16px">
                <div class="slider-header">
                  <span class="slider-label"> Social Media Screen Time</span>
                  <span class="slider-value" id="socialVal">2.0 hours</span>
                </div>
                <input type="range" class="range-input" id="socialSlider" min="0" max="10" step="0.5" value="2"
                  oninput="document.getElementById('socialVal').textContent = this.value + ' hours'; window.checkinData.social = parseFloat(this.value)">
                <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);margin-top:4px">
                  <span>0h (None)</span><span>1-2h (Average)</span><span>10h (Excessive)</span>
                </div>
              </div>
              <div class="checkin-nav">
                <button class="btn-checkin-back" onclick="prevStep(2)"> Back</button>
                <button class="btn-checkin-next" onclick="nextStep(2)">Next </button>
              </div>
            </div>

            <!-- Step 3: Stress Triggers -->
            <div class="checkin-step" id="step-3">
              <div class="step-title"> Active Stress Triggers</div>
              <div class="step-subtitle">Select any pressures you're currently facing (Indian context-aware)</div>
              <div class="additional-fields">
                <div class="toggle-field" id="tog-placement" onclick="toggleFlag('placement','tog-placement')">
                  <span class="tf-icon"></span>
                  <span class="tf-label">Placement Season Pressure</span>
                  <div class="tf-check"></div>
                </div>
                <div class="toggle-field" id="tog-gate" onclick="toggleFlag('gate','tog-gate')">
                  <span class="tf-icon"></span>
                  <span class="tf-label">GATE / CAT Preparation</span>
                  <div class="tf-check"></div>
                </div>
                <div class="toggle-field" id="tog-family" onclick="toggleFlag('family','tog-family')">
                  <span class="tf-icon"></span>
                  <span class="tf-label">Family Pressure / Financial Stress</span>
                  <div class="tf-check"></div>
                </div>
                <div class="toggle-field" id="tog-isolation" onclick="toggleFlag('isolation','tog-isolation')">
                  <span class="tf-icon"></span>
                  <span class="tf-label">Feeling Socially Isolated</span>
                  <div class="tf-check"></div>
                </div>
              </div>
              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label"> Physical Activity Today</span>
                  <span class="slider-value" id="actVal">30 min</span>
                </div>
                <input type="range" class="range-input" min="0" max="180" step="15" value="30"
                  oninput="document.getElementById('actVal').textContent = this.value + ' min'; window.checkinData.activity = parseFloat(this.value)">
              </div>
              <div class="checkin-nav">
                <button class="btn-checkin-back" onclick="prevStep(3)"> Back</button>
                <button class="btn-checkin-next" onclick="nextStep(3)">Compute Score </button>
              </div>
            </div>

            <!-- Step 4: Result -->
            <div class="checkin-step" id="step-4">
              <div class="checkin-result" id="checkinResult"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  // Make checkinData and helpers available
  window.checkinData = checkinData;

  window.selectMood = function(v) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('mood-'+v).classList.add('selected');
    window.checkinData.mood = v;
  };

  window.toggleFlag = function(flag, id) {
    window.checkinData[flag] = !window.checkinData[flag];
    document.getElementById(id).classList.toggle('active');
  };

  window.nextStep = async function(step) {
    document.getElementById('step-'+step).classList.remove('active');
    // Mark current progress dot done
    const progDone = document.getElementById('step-prog-'+step);
    if (progDone) progDone.classList.add('done');
    // Navigate to next step OR trigger ML result on last step
    if (step < totalSteps - 1) {
      document.getElementById('step-'+(step+1)).classList.add('active');
      const progNext = document.getElementById('step-prog-'+(step+1));
      if (progNext) progNext.classList.add('active');
    } else {
      //  Show loading spinner while calling API 
      document.getElementById('step-4').classList.add('active');
      document.getElementById('checkinResult').innerHTML = `
        <div style="text-align:center;padding:40px 20px">
          <div style="font-size:2.5rem;margin-bottom:16px;animation:spin 1s linear infinite;display:inline-block"></div>
          <div style="font-size:1rem;font-weight:600;margin-bottom:8px">Running ML Model...</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">Random Forest Classifier  |  13 features  |  SQLite storage</div>
        </div>
      `;

      const nextExamObj = AcademiData.examTimetable[0];
      const daysToNext = nextExamObj ? nextExamObj.daysLeft : 30;

      //  Build API payload from check-in form 
      const payload = {
        student_id:        AcademiData.currentStudent.id || 1,
        mood_score:        window.checkinData.mood  || 7,
        sleep_hours:       window.checkinData.sleep || 7,
        study_hours:       window.checkinData.study || 5,
        physical_activity: (window.checkinData.activity || 30) / 60,
        placement_anxiety: window.checkinData.placement ? 1 : 0,
        gate_cat_prep:     window.checkinData.gate      ? 1 : 0,
        family_stress:     window.checkinData.family    ? 1 : 0,
        social_isolation:  window.checkinData.isolation ? 1 : 0,
        social_media_hours: window.checkinData.social   || 2,
        // Academic data (dynamic exam countdown + defaults)
        attendance_pct:       75.0,
        internal_marks_avg:   72.0,
        days_to_next_exam:    daysToNext,
        assignment_deadlines: 2
      };

      let result;
      try {
        //  Call real FastAPI server 
        const res = await fetch('/api/checkin', {
          method: 'POST',
          headers: (typeof getAuthHeaders === 'function' ? getAuthHeaders() : { 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Server error');
        const data = await res.json();

        result = {
          score:      data.burnout_score,
          riskLevel:  data.risk_level,
          recs:       data.recommendations,
          delta:      data.score_delta,
          examStress: data.exam_stress,
          cluster:    data.peer_cluster,
          fromAPI:    true,
          stored:     data.stored_in,
          model:      data.model_used
        };
        localStorage.setItem('academicare_last_checkin_' + (student.email || 'guest'), todayStr);
        showToast('', `Score saved to DB! Risk: ${data.risk_level}`, 'success');

      } catch (err) {
        //  Fallback: use local mock if server not running 
        console.warn('API not reachable, using local computation:', err.message);
        const localResult = computeBurnoutScore(window.checkinData);
        result = { ...localResult, fromAPI: false, stored: 'Local (server offline)' };
        showToast('', 'Server offline  -  using local model estimate', 'warning');
      }

      const recs = result.recs || AcademiData.recommendations.slice(0, 3);
      document.getElementById('checkinResult').innerHTML = `
        <div style="margin-bottom:20px">
          <div style="font-size:0.9rem;color:var(--text-muted);margin-bottom:8px">Your Burnout Risk Score</div>
          <div class="result-score-big" style="background:linear-gradient(135deg,${getRiskColor(result.riskLevel)},${getRiskColor(result.riskLevel)}aa);-webkit-background-clip:text;background-clip:text;">${result.score}</div>
          <div class="result-label">Risk Level: <strong style="color:${getRiskColor(result.riskLevel)}">${result.riskLevel}</strong>
            ${result.delta !== null && result.delta !== undefined ? `<span style="font-size:0.75rem;color:${result.delta>0?'var(--red)':'var(--green)'}"> (${result.delta>0?'+':''}${result.delta} from yesterday)</span>` : ''}
          </div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px">
            <span style="font-size:0.7rem;padding:3px 10px;border-radius:var(--radius-full);background:${result.fromAPI?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)'};border:1px solid ${result.fromAPI?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.3)'};color:${result.fromAPI?'var(--green)':'var(--yellow)'}">
              ${result.fromAPI ? ' LIVE  -  Real Random Forest' : ' Local estimate (start server)'}
            </span>
            <span style="font-size:0.7rem;padding:3px 10px;border-radius:var(--radius-full);background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);color:var(--purple-light)">
               ${result.stored || 'academiccare.db'}
            </span>
            ${result.cluster ? `<span style="font-size:0.7rem;padding:3px 10px;border-radius:var(--radius-full);background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);color:var(--violet)"> Peer Cluster ${result.cluster}</span>` : ''}
          </div>
          <div style="font-size:0.7rem;color:var(--text-muted);margin-top:6px">12 ML features analyzed  |  ${result.model || 'RandomForestClassifier (200 trees)'}</div>
        </div>
        <div class="risk-banner ${result.riskLevel.toLowerCase()}" style="text-align:left;margin-bottom:20px">
          <span class="risk-banner-icon">${result.riskLevel==='Critical'?'':result.riskLevel==='High'?'':result.riskLevel==='Moderate'?'':''}</span>
          <div class="risk-banner-text">
            <h4>${result.riskLevel} Burnout Risk</h4>
            <p>${result.riskLevel==='Critical'?'Counselor has been anonymously notified. Please reach out for support.':result.riskLevel==='High'?'Immediate wellness intervention recommended. Check recommendations below.':result.riskLevel==='Moderate'?'Monitor your wellness. Small changes can prevent escalation.':'Great job! Keep maintaining these healthy habits.'}</p>
          </div>
        </div>
        <div class="result-recs">
          <div style="font-size:0.85rem;font-weight:600;margin-bottom:12px">ðŸ¤– AI Recommendations for You</div>
          <div class="rec-list">
            ${recs.map(r => `<div class="rec-item"><span class="rec-icon">${r.icon||''}</span><div class="rec-text"><strong>${r.title}</strong>${r.text||r.body_text||''}</div></div>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:12px;margin-top:24px;justify-content:center;flex-wrap:wrap">
          <button class="btn-checkin-next" onclick="showPage('dashboard')">View Dashboard </button>
          <button class="btn-checkin-back" onclick="showPage('analytics')">See Analytics</button>
          ${result.riskLevel==='Critical'?'<button class="btn-checkin-back" style="border-color:var(--red);color:var(--red)" onclick="showPage(\'counselor\')">Contact Counselor</button>':''}
        </div>
        ${result.riskLevel==='Critical'?`<div class="preview-alert" style="margin-top:16px"><span class="alert-dot critical"></span>Anonymous alert saved to DB + Firebase FCM triggered</div>`:''}
        ${result.fromAPI ? `<div style="margin-top:12px;padding:10px 14px;border-radius:var(--radius-sm);background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.15);font-size:0.7rem;color:var(--text-muted)"> Check-in saved to <strong>academiccare.db</strong>  |  Score computed by real <strong>Random Forest .pkl</strong>  |  Recommendations generated by ML engine</div>` : `<div style="margin-top:12px;padding:10px 14px;border-radius:var(--radius-sm);background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.15);font-size:0.7rem;color:var(--text-muted)"> Start the server with <code>python simple_server.py</code> to enable real storage</div>`}
      `;
    }
  };

  window.prevStep = function(step) {
    document.getElementById('step-'+step).classList.remove('active');
    document.getElementById('step-prog-'+(step-1)).classList.remove('active');
    if (step > 1) {
      document.getElementById('step-'+(step-1)).classList.add('active');
      document.getElementById('step-prog-'+(step-2)).classList.remove('done');
    }
  };
}

async function renderAnalyticsPage() {
  const student = AcademiData.currentStudent;
  
  // Show loading skeleton
  document.getElementById('page-analytics').innerHTML = `
    <div class="inner-page-wrap">
      <div style="text-align:center;padding:120px 20px">
        <div style="font-size:3rem;margin-bottom:16px;animation:spin 1s linear infinite;display:inline-block"></div>
        <div style="font-size:1.1rem;font-weight:600;color:white;margin-bottom:8px">Loading Academic &amp; Wellness Analytics...</div>
      </div>
    </div>
  `;

  let history = [];
  let userSubjects = [];

  // 1. Fetch check-in history
  try {
    const res = await fetch(`/api/history/${student.id}`, { headers: (typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}) });
    if (res.ok) {
      const result = await res.json();
      history = result.data || [];
    }
  } catch (err) {
    console.warn("Backend offline or error fetching history:", err.message);
  }

  // 2. Fetch student subjects from API or LocalStorage
  try {
    const res = await fetch(`/api/subjects/${student.id}`, { headers: (typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}) });
    if (res.ok) {
      const data = await res.json();
      userSubjects = data.subjects || [];
    }
  } catch (err) {
    console.warn("Backend offline, loading local subjects:", err.message);
  }

  if (userSubjects.length === 0) {
    const key = 'academicare_subjects_' + (student.email || 'guest');
    userSubjects = JSON.parse(localStorage.getItem(key) || '[]');
  }

  const hasHistory = history && history.length > 0;
  const hasSubjects = userSubjects && userSubjects.length > 0;

  // Complexity level label helper
  const getComplexityBadge = (lvl) => {
    const levels = {
      1: '<span style="color:#34d399;font-weight:600">Level 1 (Easy)</span>',
      2: '<span style="color:#60a5fa;font-weight:600">Level 2 (Moderate)</span>',
      3: '<span style="color:#f59e0b;font-weight:600">Level 3 (Challenging)</span>',
      4: '<span style="color:#f97316;font-weight:600">Level 4 (Hard)</span>',
      5: '<span style="color:#ef4444;font-weight:700">Level 5 (Extremely High)</span>'
    };
    return levels[lvl] || levels[3];
  };

  document.getElementById('page-analytics').innerHTML = `
    <div class="inner-page-wrap">
      <div class="page-header">
        <div class="page-header-inner">
          <button class="back-btn" onclick="showPage('dashboard')"> Dashboard</button>
          <div class="page-title-area">
            <div class="page-title">Academic &amp; Wellness Analytics</div>
            <div class="page-subtitle">Student Profile: <strong>${student.name}</strong> (${student.department || 'MCA'})</div>
          </div>
          <button class="btn-primary" onclick="openSubjectModal()"> Add / Manage Subjects</button>
        </div>
      </div>
      <div class="page-content">

        <!-- SUBJECT MANAGEMENT SECTION -->
        <div class="chart-card" style="margin-bottom:24px">
          <div class="chart-header">
            <span class="chart-title"> Enrolled Subjects &amp; Complexity Ratings</span>
            <button class="btn-outline" onclick="openSubjectModal()" style="font-size:0.75rem;padding:4px 10px"> Add Subject</button>
          </div>
          ${!hasSubjects ? `
            <div style="text-align:center;padding:32px 16px;color:var(--text-muted)">
              <div style="font-size:2rem;margin-bottom:8px"></div>
              <div style="font-weight:600;font-size:0.9rem;color:white;margin-bottom:4px">No Subjects Added Yet</div>
              <div style="font-size:0.8rem;margin-bottom:16px;max-width:480px;margin-left:auto;margin-right:auto">Please add your current semester subjects, set their complexity rating, attendance %, and internal marks to generate your personalized performance &amp; stress analytics.</div>
              <button class="btn-primary" onclick="openSubjectModal()"> Add Your First Subject</button>
            </div>
          ` : `
            <div style="overflow-x:auto;margin-top:8px">
              <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
                <thead>
                  <tr style="border-bottom:1px solid var(--border)">
                    <th style="text-align:left;padding:8px;color:var(--text-muted)">Code</th>
                    <th style="text-align:left;padding:8px;color:var(--text-muted)">Subject Name</th>
                    <th style="text-align:center;padding:8px;color:var(--text-muted)">Complexity</th>
                    <th style="text-align:center;padding:8px;color:var(--text-muted)">Attendance %</th>
                    <th style="text-align:center;padding:8px;color:var(--text-muted)">Internal Marks</th>
                    <th style="text-align:center;padding:8px;color:var(--text-muted)">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${userSubjects.map((s, idx) => `
                    <tr style="border-bottom:1px solid var(--border)">
                      <td style="padding:10px 8px;font-weight:700;color:var(--purple-light)">${s.subject_code || s.code || 'SUB' + (idx+1)}</td>
                      <td style="padding:10px 8px;font-weight:600">${s.subject_name || s.name || s.subject}</td>
                      <td style="padding:10px 8px;text-align:center">${getComplexityBadge(s.complexity || 3)}</td>
                      <td style="padding:10px 8px;text-align:center;font-weight:700;color:${(s.attendance_pct !== undefined ? s.attendance_pct : s.attendance) < 75 ? 'var(--red)' : 'var(--green)'}">${s.attendance_pct !== undefined ? s.attendance_pct : (s.attendance || 80)}%</td>
                      <td style="padding:10px 8px;text-align:center;font-weight:700;color:${(s.internal_marks !== undefined ? s.internal_marks : s.marks) < 70 ? 'var(--yellow)' : 'var(--green)'}">${s.internal_marks !== undefined ? s.internal_marks : (s.marks || 70)} / 100</td>
                      <td style="padding:10px 8px;text-align:center">
                        <button onclick="deleteStudentSubject(${s.id || 'null'}, ${idx})" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:0.7rem">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- ANALYTICS GRAPHS SECTION -->
        ${(!hasHistory && !hasSubjects) ? `
          <div style="background:var(--bg-glass);border:1px dashed var(--border);border-radius:16px;padding:48px 24px;text-align:center;margin-top:20px">
            <div style="font-size:3rem;margin-bottom:12px"></div>
            <h3 style="color:white;font-size:1.2rem;margin-bottom:8px">No Input Data Available for Analytics Graphs</h3>
            <p style="color:var(--text-muted);max-width:540px;margin:0 auto 20px;font-size:0.85rem">
              AcademiCare does not generate arbitrary or fake graphs. Analytics graphs and 30-day burnout trend predictions are plotted strictly after you log your daily check-in and enter your enrolled subjects.
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
              <button class="btn-primary" onclick="openSubjectModal()"> Add Enrolled Subjects</button>
              <button class="btn-hero-secondary" onclick="showPage('checkin')"> Log Daily Check-In</button>
            </div>
          </div>
        ` : `
          <div class="analytics-grid">
            <!-- 30-Day Burnout Trend -->
            <div class="chart-card" style="grid-column:span 2">
              <div class="chart-header">
                <span class="chart-title"> Burnout Score &amp; Wellness Trend</span>
                <div class="chart-legend">
                  <div class="legend-item"><span class="legend-dot" style="background:#6366f1"></span>Burnout Score</div>
                  <div class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Sleep Hours</div>
                  <div class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>Mood Score</div>
                </div>
              </div>
              ${!hasHistory ? `
                <div style="text-align:center;padding:40px;color:var(--text-muted);font-size:0.8rem">No check-in entries submitted yet. Complete your check-in form to start generating this trend line.</div>
              ` : `
                <div class="chart-canvas-wrap" style="height:250px">
                  <canvas id="trendChart30"></canvas>
                </div>
              `}
            </div>

            <!-- Attendance vs Internal Marks -->
            <div class="chart-card">
              <div class="chart-header">
                <span class="chart-title"> Attendance vs. Internal Marks Chart</span>
                <span style="font-size:0.7rem;color:var(--text-muted)">Your Enrolled Subjects</span>
              </div>
              ${!hasSubjects ? `
                <div style="text-align:center;padding:40px;color:var(--text-muted);font-size:0.8rem">No subjects added. Click "Add Subject" above to plot your subject marks vs attendance.</div>
              ` : `
                <div class="chart-canvas-wrap">
                  <canvas id="attendChart"></canvas>
                </div>
              `}
            </div>

            <!-- Random Forest Feature Importance -->
            <div class="chart-card">
              <div class="chart-header">
                <span class="chart-title"> Random Forest Model Feature Weights</span>
                <span style="font-size:0.7rem;color:var(--purple-light)">ML Weights</span>
              </div>
              <div class="chart-canvas-wrap">
                <canvas id="featureChart"></canvas>
              </div>
            </div>
          </div>
        `}

      </div>
    </div>

    <!-- SUBJECT ADD MODAL -->
    <div id="subject-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;align-items:center;justify-content:center">
      <div style="background:#18181b;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:24px;width:90%;max-width:460px;box-shadow:0 20px 40px rgba(0,0,0,0.6)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px">
          <h3 style="margin:0;font-size:1.1rem;color:white;font-weight:700"> Add Enrolled Subject</h3>
          <button onclick="closeSubjectModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer"></button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label class="form-label">Subject Name *</label>
            <input type="text" id="sub-name" class="form-input" placeholder="e.g. Advanced Operating Systems" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="form-label">Course Code (Optional)</label>
              <input type="text" id="sub-code" class="form-input" placeholder="e.g. MCA102" />
            </div>
            <div>
              <label class="form-label">Subject Complexity</label>
              <select id="sub-complexity" class="form-select">
                <option value="1">1  -  Easy / Basic</option>
                <option value="2">2  -  Moderate</option>
                <option value="3" selected>3  -  Challenging</option>
                <option value="4">4  -  Hard</option>
                <option value="5">5  -  Extremely High</option>
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="form-label">Attendance %</label>
              <input type="number" id="sub-attendance" class="form-input" min="0" max="100" value="85" />
            </div>
            <div>
              <label class="form-label">Internal Marks (out of 100)</label>
              <input type="number" id="sub-marks" class="form-input" min="0" max="100" value="78" />
            </div>
          </div>
          <button onclick="saveStudentSubject()" class="btn-auth" style="margin-top:12px;width:100%">Save Subject &amp; Update Analytics</button>
        </div>
      </div>
    </div>
  `;

  // Draw charts if data exists
  setTimeout(() => {
    drawAnalyticsCharts(history, userSubjects);
  }, 100);
}

//  SUBJECT MANAGEMENT MODAL & HANDLERS 
function openSubjectModal() {
  const modal = document.getElementById('subject-modal');
  if (modal) modal.style.display = 'flex';
}

function closeSubjectModal() {
  const modal = document.getElementById('subject-modal');
  if (modal) modal.style.display = 'none';
}

async function saveStudentSubject() {
  const student = AcademiData.currentStudent;
  const nameEl = document.getElementById('sub-name');
  const codeEl = document.getElementById('sub-code');
  const compEl = document.getElementById('sub-complexity');
  const attEl = document.getElementById('sub-attendance');
  const markEl = document.getElementById('sub-marks');

  if (!nameEl || !nameEl.value.trim()) {
    showToast('', 'Please enter a subject name', 'warning');
    return;
  }

  const name = nameEl.value.trim();
  const code = codeEl ? codeEl.value.trim() : '';
  const complexity = parseInt(compEl ? compEl.value : '3') || 3;
  const attendance = parseFloat(attEl ? attEl.value : '80') || 80;
  const marks = parseFloat(markEl ? markEl.value : '70') || 70;

  const payload = {
    student_id: student.id || 1,
    subject_name: name,
    subject_code: code || name.substring(0, 6).toUpperCase(),
    complexity: complexity,
    attendance_pct: attendance,
    internal_marks: marks,
    max_marks: 100
  };

  try {
    await fetch('/api/subjects', {
      method: 'POST',
      headers: (typeof getAuthHeaders === 'function' ? getAuthHeaders() : { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("Backend offline, saving subject locally:", err.message);
  }

  const key = 'academicare_subjects_' + (student.email || 'guest');
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push(payload);
  localStorage.setItem(key, JSON.stringify(existing));

  showToast('', `Added "${name}" (Complexity Level ${complexity})!`, 'success');
  closeSubjectModal();
  renderAnalyticsPage();
}

async function deleteStudentSubject(subjectId, idx) {
  const student = AcademiData.currentStudent;
  if (subjectId && subjectId !== 'null') {
    try {
      await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
    } catch (e) {}
  }
  const key = 'academicare_subjects_' + (student.email || 'guest');
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  if (idx !== undefined && idx < existing.length) {
    existing.splice(idx, 1);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  showToast('', 'Subject removed', 'info');
  renderAnalyticsPage();
}

        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    drawAnalyticsCharts(history, academic);
  }, 100);
}

async function renderCounselorPage() {
  // Show loading skeleton
  document.getElementById('page-counselor').innerHTML = `
    <div class="inner-page-wrap">
      <div style="text-align:center;padding:120px 20px">
        <div style="font-size:3rem;margin-bottom:16px;animation:spin 1s linear infinite;display:inline-block"></div>
        <div style="font-size:1.1rem;font-weight:600;color:white;margin-bottom:8px">Accessing Secure Counselor Board...</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">GET /api/counselor/alerts &amp; GET /api/students</div>
      </div>
    </div>
  `;

  let pendingAlerts = [];
  let resolvedAlerts = [];
  let students = [];
  let isOffline = false;

  try {
    // 1. Fetch pending alerts
    let res = await fetch('/api/counselor/alerts?status=pending');
    if (res.ok) pendingAlerts = (await res.json()).alerts;

    // 2. Fetch resolved alerts
    res = await fetch('/api/counselor/alerts?status=resolved');
    if (res.ok) resolvedAlerts = (await res.json()).alerts;

    // 3. Fetch all students for batch statistics
    res = await fetch('/api/students');
    if (res.ok) students = (await res.json()).students;
  } catch (err) {
    console.warn("Backend offline, using fallback counselor board statistics:", err.message);
    isOffline = true;
  }

  //  Calculate dynamic batch statistics from SQLite data 
  let totalStudents = students.length || 3;
  let riskDistribution = { low: 0, moderate: 0, high: 0, critical: 0 };
  let sumScore = 0;
  let studentsWithScores = 0;

  students.forEach(st => {
    if (st.burnout_score !== null && st.burnout_score !== undefined) {
      sumScore += st.burnout_score;
      studentsWithScores++;
      const risk = (st.risk_level || 'Low').toLowerCase();
      if (riskDistribution.hasOwnProperty(risk)) {
        riskDistribution[risk]++;
      } else {
        riskDistribution.low++;
      }
    } else {
      riskDistribution.low++; // default
    }
  });

  let avgScore = studentsWithScores > 0 ? round(sumScore / studentsWithScores, 1) : 42.5;

  // Fallback defaults if database is empty/offline
  if (isOffline) {
    pendingAlerts = AcademiData.counselorAlerts.filter(a => !a.resolved);
    resolvedAlerts = AcademiData.counselorAlerts.filter(a => a.resolved);
    riskDistribution = AcademiData.batchAnalytics.riskDistribution;
    totalStudents = AcademiData.batchAnalytics.totalStudents;
    avgScore = AcademiData.batchAnalytics.avgBurnoutScore;
  }

  // Global helper to resolve alert on backend SQLite
  window.resolveAlert = async function(token, anonId) {
    showToast('', `Resolving alert ${anonId}...`, 'info');
    try {
      const res = await fetch(`/api/counselor/alerts/${token}/resolve`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('', `Alert ${anonId} marked as resolved in DB`, 'success');
        setTimeout(() => renderCounselorPage(), 300); // Reload board
      } else {
        throw new Error('API rejection');
      }
    } catch (err) {
      showToast('', 'Server offline  -  marking resolved in session', 'warning');
      // Offline fallback: mark resolved in mock array
      const match = AcademiData.counselorAlerts.find(a => a.anonymousId === anonId);
      if (match) match.resolved = true;
      setTimeout(() => renderCounselorPage(), 300);
    }
  };

  document.getElementById('page-counselor').innerHTML = `
    <div class="inner-page-wrap">
      <div class="page-header">
        <div class="page-header-inner">
          <button class="back-btn" onclick="showPage('dashboard')"> Dashboard</button>
          <div class="page-title-area">
            <div class="page-title">Counselor Alert Dashboard</div>
            <div class="page-subtitle">Anonymous student alerts  |  Firebase FCM  |  Real-time monitoring</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3)">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--red);animation:pulse-dot 1.5s ease-in-out infinite"></span>
            <span style="font-size:0.8rem;color:#f87171;font-weight:600">${pendingAlerts.length} Active Alerts</span>
          </div>
        </div>
      </div>
      <div class="page-content">

        <!-- Batch Summary -->
        <div class="stats-bar" style="margin-bottom:24px">
          <div class="stats-bar-item">
            <div class="sbi-value">${totalStudents}</div>
            <div class="sbi-label">Total Students</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color:var(--red)">${riskDistribution.critical || 0}</div>
            <div class="sbi-label">Critical</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color:var(--orange)">${riskDistribution.high || 0}</div>
            <div class="sbi-label">High Risk</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color:var(--yellow)">${riskDistribution.moderate || 0}</div>
            <div class="sbi-label">Moderate</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color:var(--green)">${riskDistribution.low || 0}</div>
            <div class="sbi-label">Low Risk</div>
          </div>
          <div class="stats-bar-item">
            <div class="sbi-value" style="color:var(--purple-light)">${avgScore}</div>
            <div class="sbi-label">Avg Burnout Score</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">

          <!-- Alert Board -->
          <div>
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px">
               Active Alerts
              <span style="font-size:0.7rem;color:var(--text-muted)">(Student identities are anonymous  -  FERPA compliant)</span>
            </div>
            <div class="alert-board">
              ${pendingAlerts.length === 0 ? `
                <div style="text-align:center;padding:40px;color:var(--text-muted);background:var(--bg-glass);border-radius:12px;border:1px dashed var(--border)">
                  <div style="font-size:2rem;margin-bottom:8px"></div>
                  <div style="font-weight:600;font-size:0.85rem">No Active Counselor Alerts</div>
                  <div style="font-size:0.75rem;margin-top:4px">All student burnout scores are currently within healthy limits.</div>
                </div>
              ` : pendingAlerts.map(a => {
                const anonId = a.anon_token ? `ANON-${a.anon_token.slice(0,6).toUpperCase()}` : (a.anonymousId || 'ANON-xxxx');
                const triggerReasons = Array.isArray(a.trigger_reasons) ? a.trigger_reasons : JSON.parse(a.trigger_reasons || "[]");
                return `
                  <div class="alert-row">
                    <div class="alert-avatar avatar-${a.risk_level ? a.risk_level.toLowerCase() : (a.riskLevel || 'critical').toLowerCase()}">${a.risk_level ? a.risk_level[0] : (a.riskLevel ? a.riskLevel[0] : 'C')}</div>
                    <div class="alert-info">
                      <div class="alert-anon-id">${anonId}</div>
                      <div class="alert-meta">MCA Department  |  Triggered ${a.triggered_at ? a.triggered_at.split(' ')[0] : (a.triggeredAt || 'just now')}</div>
                      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
                        ${triggerReasons.map(t => `<span style="font-size:0.65rem;padding:2px 7px;border-radius:var(--radius-full);background:var(--bg-glass);border:1px solid var(--border);color:var(--text-muted)">${t}</span>`).join('')}
                      </div>
                    </div>
                    <div style="text-align:center">
                      <div class="alert-score ${a.risk_level ? a.risk_level.toLowerCase() : (a.riskLevel || 'critical').toLowerCase()}">${a.score}</div>
                      <span class="risk-pill pill-${a.risk_level ? a.risk_level.toLowerCase() : (a.riskLevel || 'critical').toLowerCase()}">${(a.risk_level || a.riskLevel || 'CRITICAL').toUpperCase()}</span>
                    </div>
                    <button class="resolve-btn" onclick="resolveAlert('${a.anon_token || a.anonymousId}', '${anonId}')">Resolve</button>
                  </div>
                `;
              }).join('')}
            </div>
            
            <div style="margin-top:20px;font-size:0.85rem;font-weight:600;margin-bottom:12px;color:var(--text-muted)"> Resolved Alerts</div>
            <div class="alert-board">
              ${resolvedAlerts.length === 0 ? `
                <div style="text-align:center;padding:20px;font-size:0.75rem;color:var(--text-muted)">No resolved records today.</div>
              ` : resolvedAlerts.map(a => {
                const anonId = a.anon_token ? `ANON-${a.anon_token.slice(0,6).toUpperCase()}` : (a.anonymousId || 'ANON-xxxx');
                return `
                  <div class="alert-row" style="opacity:0.5">
                    <div class="alert-avatar" style="background:var(--bg-glass)"></div>
                    <div class="alert-info">
                      <div class="alert-anon-id">${anonId}</div>
                      <div class="alert-meta">MCA Department  |  Resolved on ${a.triggered_at ? a.triggered_at.split(' ')[0] : 'Just now'}</div>
                    </div>
                    <div class="alert-score" style="color:var(--text-muted)">${a.score}</div>
                    <span class="risk-pill" style="background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.3)">RESOLVED</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Batch Distribution Chart -->
          <div>
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:12px"> Batch Risk Distribution</div>
            <div class="chart-card">
              <div class="chart-canvas-wrap" style="height:220px">
                <canvas id="riskDistChart"></canvas>
              </div>
            </div>
            <div class="chart-card" style="margin-top:16px">
              <div class="chart-header"><span class="chart-title">Weekly Batch Trend</span></div>
              <div class="chart-canvas-wrap" style="height:150px">
                <canvas id="batchTrendChart"></canvas>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Dynamically update AcademiData risk stats for drawing charts
  AcademiData.batchAnalytics.riskDistribution = riskDistribution;
  AcademiData.batchAnalytics.totalStudents = totalStudents;
  AcademiData.batchAnalytics.avgBurnoutScore = avgScore;

  setTimeout(() => { drawCounselorCharts(); }, 100);
}

async function renderGroupsPage() {
  const student = AcademiData.currentStudent;

  // Show loading skeleton
  document.getElementById('page-groups').innerHTML = `
    <div class="inner-page-wrap">
      <div style="text-align:center;padding:120px 20px">
        <div style="font-size:3rem;margin-bottom:16px;animation:spin 1s linear infinite;display:inline-block"></div>
        <div style="font-size:1.1rem;font-weight:600;color:white;margin-bottom:8px">Loading study clusters...</div>
      </div>
    </div>
  `;

  let latestCheckin = null;
  let latestScore = null;
  let isOffline = false;

  try {
    const res = await fetch(`/api/dashboard/${student.id}`, { headers: (typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}) });
    if (res.ok) {
      const data = await res.json();
      latestCheckin = data.latest_checkin;
      latestScore = data.latest_score;
    }
  } catch (err) {
    isOffline = true;
  }

  const todayStr = new Date().toLocaleDateString('sv').substring(0, 10);
  const hasCheckedInToday = latestCheckin && latestCheckin.checkin_date === todayStr;

  //   FORCE DAILY CHECK-IN BEFORE ACCESSING GROUPS 
  if (!isOffline && !hasCheckedInToday) {
    showToast('ðŸ“…', `Hi ${student.name}, please complete today's Daily Check-in first!`, 'info');
    showPage('checkin');
    return;
  }

  const score   = latestScore ? latestScore.burnout_score : 50;
  const myClusterId = score >= 75 ? 'A' : score >= 55 ? 'C' : score >= 30 ? 'B' : 'D';

  const clusterNames = {
    'A': 'Cluster A  -  High-Stress GATE Prep Group',
    'B': 'Cluster B  -  Moderate Stress Achievers',
    'C': 'Cluster C  -  Placement Season Warriors',
    'D': 'Cluster D  -  Low Stress High Performers'
  };

  const matchedName = clusterNames[myClusterId];

  // Deep clone peerGroups so we don't modify the static AcademiData list
  const groups = JSON.parse(JSON.stringify(AcademiData.peerGroups));

  groups.forEach(g => {
    // Remove default mock "Arjun Sharma" isYou flag from members
    g.members.forEach(m => {
      if (m.name === 'Arjun Sharma' && student.name !== 'Arjun Sharma') {
        m.isYou = false;
      }
    });
    
    // Inject the logged-in student into their matched cluster
    if (g.clusterId === myClusterId) {
      // Avoid duplicate if student already exists in mock list
      const exists = g.members.find(m => m.name.toLowerCase() === student.name.toLowerCase());
      if (exists) {
        exists.isYou = true;
        exists.score = Math.round(score);
        exists.initials = student.avatar || 'US';
      } else {
        g.members.push({
          name: student.name,
          score: Math.round(score),
          initials: student.avatar || 'US',
          isYou: true
        });
      }
      // Sort members by score descending
      g.members.sort((a,b) => b.score - a.score);
    }
  });

  document.getElementById('page-groups').innerHTML = `
    <div class="inner-page-wrap">
      <div class="page-header">
        <div class="page-header-inner">
          <button class="back-btn" onclick="showPage('dashboard')"> Dashboard</button>
          <div class="page-title-area">
            <div class="page-title">Peer Study Groups</div>
            <div class="page-subtitle">K-Means clustering  |  Stress-pattern matched groups  |  ${AcademiData.batchAnalytics.totalStudents} students</div>
          </div>
        </div>
      </div>
      <div class="page-content">
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))">
          <div style="display:flex;align-items:center;gap:16px">
            <span style="font-size:2rem"></span>
            <div>
              <div style="font-weight:600;margin-bottom:4px">You are matched to ${matchedName}</div>
              <div style="font-size:0.8rem;color:var(--text-secondary)">K-Means algorithm identified students with similar stress patterns, study habits, and academic pressure as you. Meeting this Saturday!</div>
            </div>
            <button class="btn-primary" onclick="showToast('','Joined ${matchedName} group! Check your college email for details.','success')">Join Your Group</button>
          </div>
        </div>
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:16px">All Peer Study Clusters (${groups.length} groups  |  K-Means k=${groups.length})</div>
        <div class="groups-grid">
          ${groups.map(g => `
            <div class="group-card">
              <div class="group-header">
                <div class="group-cluster-badge cluster-${g.clusterId.toLowerCase()}">K${g.clusterId}</div>
                <div>
                  <div class="group-name">${g.clusterName}</div>
                  <div class="group-tag">${g.stressProfile}</div>
                </div>
              </div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px;padding:8px;background:var(--bg-glass);border-radius:var(--radius-sm)">
                 ${g.matchReason}
              </div>
              <div class="group-members">
                ${g.members.map(m => `
                  <div class="member-row">
                    <div class="member-avatar" style="${m.isYou?'background:linear-gradient(135deg,var(--purple),var(--violet));box-shadow:0 0 10px rgba(99,102,241,0.4)':''}">${m.initials}</div>
                    <span class="member-name">${m.name}${m.isYou?' <span style="font-size:0.65rem;color:var(--purple-light)">(You)</span>':''}</span>
                    <span class="member-score" style="color:${getRiskColor(m.score>=75?'Critical':m.score>=55?'High':m.score>=30?'Moderate':'Low')}">${m.score}</span>
                  </div>
                `).join('')}
              </div>
              <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:12px">
                 ${g.meetingTime}  |  Focus: ${g.focusArea}
              </div>
              <button class="join-btn" onclick="showToast('','Joining ${g.clusterName}!','success')">
                ${g.clusterId === myClusterId ? ' Already Joined' : 'Request to Join'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 
// EXAM MODAL  -  Add / Delete Exams
// 

function openAddExamModal() {
  // Remove existing modal if any
  const old = document.getElementById('examModal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'examModal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);
    z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;
  `;
  modal.innerHTML = `
    <div style="background:#18181b;border:1px solid #3f3f46;border-radius:16px;padding:28px;width:100%;max-width:420px;box-shadow:0 25px 60px rgba(0,0,0,0.5)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div>
          <div style="font-size:1.1rem;font-weight:700;color:white"> Add Your Exam</div>
          <div style="font-size:0.75rem;color:#71717a;margin-top:2px">Dates saved to your profile</div>
        </div>
        <button onclick="closeModal('examModal')" style="background:rgba(255,255,255,0.05);border:1px solid #3f3f46;color:#a1a1aa;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1rem;"></button>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label style="font-size:0.78rem;color:#a1a1aa;display:block;margin-bottom:6px">Subject Name</label>
          <input id="exam-subject" type="text" placeholder="e.g. Cloud Computing"
            style="width:100%;padding:10px 14px;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:white;font-size:0.875rem;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:0.78rem;color:#a1a1aa;display:block;margin-bottom:6px">Subject Code (optional)</label>
          <input id="exam-code" type="text" placeholder="e.g. CC501"
            style="width:100%;padding:10px 14px;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:white;font-size:0.875rem;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:0.78rem;color:#a1a1aa;display:block;margin-bottom:6px">Exam Date</label>
          <input id="exam-date" type="date"
            min="${new Date().toISOString().split('T')[0]}"
            style="width:100%;padding:10px 14px;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:white;font-size:0.875rem;box-sizing:border-box;color-scheme:dark;" />
        </div>
        <div>
          <label style="font-size:0.78rem;color:#a1a1aa;display:block;margin-bottom:6px">Exam Weight</label>
          <select id="exam-weight"
            style="width:100%;padding:10px 14px;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:white;font-size:0.875rem;box-sizing:border-box;">
            <option value="1">University Final (High stress)</option>
            <option value="0.6">Midterm / Internal Exam</option>
            <option value="0.4">Unit Test / Assignment</option>
            <option value="0.8">Practical / Viva</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:22px">
        <button onclick="closeModal('examModal')"
          style="flex:1;padding:10px;border-radius:8px;background:transparent;border:1px solid #3f3f46;color:#a1a1aa;cursor:pointer;font-size:0.875rem;">
          Cancel
        </button>
        <button onclick="saveExam()"
          style="flex:2;padding:10px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;cursor:pointer;font-size:0.875rem;font-weight:600;">
           Save Exam
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal('examModal'); });
  setTimeout(() => document.getElementById('exam-subject')?.focus(), 100);
}

function saveExam() {
  const subject = document.getElementById('exam-subject')?.value?.trim();
  const code    = document.getElementById('exam-code')?.value?.trim() || '';
  const date    = document.getElementById('exam-date')?.value;
  const weight  = parseFloat(document.getElementById('exam-weight')?.value || '1');

  if (!subject) return showToast('', 'Please enter the subject name', 'error');
  if (!date)    return showToast('', 'Please select an exam date', 'error');

  const student = AcademiData.currentStudent;
  const email   = student.email || 'guest';

  // Load existing exams and add new one
  const exams = JSON.parse(localStorage.getItem('academicare_exams_' + email) || '[]');
  // Remove duplicate subject if exists
  const filtered = exams.filter(e => e.subject.toLowerCase() !== subject.toLowerCase());
  filtered.push({ subject, code, examDate: date, weight });
  localStorage.setItem('academicare_exams_' + email, JSON.stringify(filtered));

  closeModal('examModal');
  showToast('', `Exam added: ${subject} on ${new Date(date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`, 'success');

  // Refresh dashboard
  setTimeout(() => renderDashboardPage(), 200);
}

function deleteExam(subject) {
  const student = AcademiData.currentStudent;
  const email   = student.email || 'guest';
  const exams   = JSON.parse(localStorage.getItem('academicare_exams_' + email) || '[]');
  const updated = exams.filter(e => e.subject !== subject);
  localStorage.setItem('academicare_exams_' + email, JSON.stringify(updated));
  showToast('', `Removed: ${subject}`, 'info');
  setTimeout(() => renderDashboardPage(), 200);
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}
