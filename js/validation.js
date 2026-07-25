// =============================================
// AcademiCare  Frontend Validation Engine
// Real-time validation, sanitization, UX helpers
// =============================================

'use strict';

//  Constants 
const VALID_DEPARTMENTS = ['MCA','MSc DS','MSc CS','MBA','BCom FA','BA LLB','BTech CS'];
const VALID_YEARS       = [1, 2, 3];
const VALID_SEMESTERS   = [1, 2, 3, 4, 5, 6];
const VALID_ROLES       = ['student', 'counselor', 'admin', 'faculty'];

//  Sanitize 
/**
 * Strip potential XSS vectors from user input strings.
 * Removes script tags, encodes angle brackets.
 */
function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Sanitize a plain notes/textarea field  allow all chars but strip script tags.
 */
function sanitizeNotes(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .substring(0, 500);
}

//  Name Validation 
function validateName(value) {
  if (!value || !value.trim()) return 'Full name is required.';
  const v = value.trim();
  if (v.length < 3) return 'Name must be at least 3 characters.';
  if (v.length > 50) return 'Name must not exceed 50 characters.';
  if (!/^[a-zA-Z\s]+$/.test(v)) return 'Name must contain only letters and spaces.';
  return null;
}

//  Email Validation 
function validateEmail(value) {
  if (!value || !value.trim()) return 'Email address is required.';
  const v = value.trim().toLowerCase();
  // RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(v)) return 'Please enter a valid email address.';
  return null;
}

//  Password Validation 
function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter (A-Z).';
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter (a-z).';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number (0-9).';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value)) {
    return 'Password must contain at least one special character (!@#$%^&*...).';
  }
  return null;
}

function validatePasswordMatch(password, confirm) {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

/**
 * Get password strength: 0=empty, 1=weak, 2=fair, 3=good, 4=strong
 */
function getPasswordStrength(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8)  score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value)) score++;
  if (score <= 1) return 1;      // weak
  if (score === 2) return 2;     // fair
  if (score === 3) return 3;     // good
  return 4;                      // strong
}

//  Numeric Range Validators 
function validateAge(value) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return 'Age must be a number.';
  if (n < 17 || n > 35) return 'Age must be between 17 and 35.';
  return null;
}

function validateSleepHours(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return 'Sleep hours must be a number.';
  if (n < 0 || n > 24) return 'Sleep hours must be between 0 and 24.';
  return null;
}

function validateStudyHours(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return 'Study hours must be a number.';
  if (n < 0 || n > 18) return 'Study hours must be between 0 and 18.';
  return null;
}

function validateAttendance(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return 'Attendance must be a number.';
  if (n < 0 || n > 100) return 'Attendance must be between 0 and 100.';
  return null;
}

function validateMarks(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return 'Marks must be a number.';
  if (n < 0 || n > 100) return 'Marks must be between 0 and 100.';
  return null;
}

function validateSlider(value, fieldName, min, max) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return `${fieldName} must be a number.`;
  if (n < min || n > max) return `${fieldName} must be between ${min} and ${max}.`;
  return null;
}

function validateMoodScore(value) {
  if (!value) return 'Please select your mood.';
  return validateSlider(value, 'Mood score', 1, 10);
}

//  Text Validators 
function validateNotes(value) {
  if (!value) return null; // optional
  if (value.length > 500) return `Notes must not exceed 500 characters (currently ${value.length}).`;
  return null;
}

function validateMessage(value) {
  if (!value || !value.trim()) return 'Message is required.';
  if (value.trim().length < 20) return 'Message must be at least 20 characters.';
  return null;
}

//  Dropdown/Enum Validators 
function validateDepartment(value) {
  if (!value) return 'Please select your department.';
  if (!VALID_DEPARTMENTS.includes(value)) return 'Please select a valid department from the list.';
  return null;
}

function validateYear(value) {
  const n = parseInt(value, 10);
  if (isNaN(n) || !VALID_YEARS.includes(n)) return 'Please select a valid year of study.';
  return null;
}

//  UI Helpers  Inline Field Errors 
/**
 * Show a red error message below a form field.
 * Creates a <span id="${fieldId}-error"> element if it doesn't exist.
 */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.style.borderColor = '#ef4444';
  field.style.boxShadow   = '0 0 0 2px rgba(239,68,68,0.25)';

  let errEl = document.getElementById(`${fieldId}-error`);
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.id = `${fieldId}-error`;
    errEl.style.cssText = 'display:block;color:#ef4444;font-size:0.75rem;margin-top:4px;font-weight:500;animation:fadeIn 0.2s ease';
    field.parentNode.appendChild(errEl);
  }
  errEl.textContent = '⚠ ' + message;
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
  }
  const errEl = document.getElementById(`${fieldId}-error`);
  if (errEl) errEl.textContent = '';
}

function showFieldSuccess(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.borderColor = '#10b981';
  field.style.boxShadow   = '0 0 0 2px rgba(16,185,129,0.2)';
  const errEl = document.getElementById(`${fieldId}-error`);
  if (errEl) errEl.textContent = '';
}

//  Password Strength Meter UI 
function updatePasswordStrengthMeter(passwordValue, meterId) {
  const meter = document.getElementById(meterId);
  if (!meter) return;

  const strength = getPasswordStrength(passwordValue);
  const labels   = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors   = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const widths   = ['0%', '25%', '50%', '75%', '100%'];

  meter.innerHTML = `
    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:8px;overflow:hidden">
      <div style="height:100%;width:${widths[strength]};background:${colors[strength]};border-radius:2px;transition:all 0.3s ease"></div>
    </div>
    ${passwordValue ? `<span style="font-size:0.7rem;color:${colors[strength]};margin-top:4px;display:block;font-weight:600">${labels[strength]} password</span>` : ''}
  `;
}

//  Notes Character Counter 
function updateNotesCounter(value, counterId, max = 500) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const remaining = max - (value ? value.length : 0);
  const color = remaining < 50 ? '#ef4444' : remaining < 100 ? '#f59e0b' : '#71717a';
  counter.textContent = `${value ? value.length : 0} / ${max} characters`;
  counter.style.color = color;
}

//  Loading Button Helpers 
function showLoadingBtn(btnId, loadingText = 'Processing...') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = true;
  btn.dataset.originalText = btn.textContent;
  btn.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:8px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      ${loadingText}
    </span>`;
}

function resetLoadingBtn(btnId, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = originalText || btn.dataset.originalText || 'Submit';
}

//  Attach Real-time Validators 
/**
 * Attach blur+input listeners that validate a field in real-time.
 * validateFn: function(value) -> error string | null
 */
function attachValidator(fieldId, validateFn, successCheck = true) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  const run = () => {
    const err = validateFn(field.value);
    if (err) showFieldError(fieldId, err);
    else if (successCheck && field.value) showFieldSuccess(fieldId);
    else clearFieldError(fieldId);
  };

  field.addEventListener('blur', run);
  field.addEventListener('input', () => {
    // Debounce: clear error immediately on typing, validate on pause
    clearFieldError(fieldId);
    clearTimeout(field._vTimer);
    field._vTimer = setTimeout(run, 600);
  });
}

//  Full Form Validators 
/**
 * Validate the registration form.
 * Returns true if all fields are valid, false otherwise.
 */
function validateRegistrationForm() {
  const name    = document.getElementById('reg-name')?.value?.trim() || '';
  const email   = document.getElementById('reg-email')?.value?.trim() || '';
  const pass    = document.getElementById('reg-pass')?.value || '';
  const confirm = document.getElementById('reg-confirm-pass')?.value || '';
  const dept    = document.getElementById('reg-dept')?.value || '';
  const year    = document.getElementById('reg-year')?.value || '';
  const age     = document.getElementById('reg-age')?.value || '';

  let valid = true;

  const nameErr = validateName(name);
  if (nameErr) { showFieldError('reg-name', nameErr); valid = false; }
  else showFieldSuccess('reg-name');

  const emailErr = validateEmail(email);
  if (emailErr) { showFieldError('reg-email', emailErr); valid = false; }
  else showFieldSuccess('reg-email');

  const passErr = validatePassword(pass);
  if (passErr) { showFieldError('reg-pass', passErr); valid = false; }
  else showFieldSuccess('reg-pass');

  const confirmErr = validatePasswordMatch(pass, confirm);
  if (confirmErr) { showFieldError('reg-confirm-pass', confirmErr); valid = false; }
  else if (confirm) showFieldSuccess('reg-confirm-pass');

  const deptErr = validateDepartment(dept);
  if (deptErr) { showFieldError('reg-dept', deptErr); valid = false; }

  const yearErr = validateYear(year);
  if (yearErr) { showFieldError('reg-year', yearErr); valid = false; }

  if (age) {
    const ageErr = validateAge(age);
    if (ageErr) { showFieldError('reg-age', ageErr); valid = false; }
    else showFieldSuccess('reg-age');
  }

  return valid;
}

/**
 * Validate the login form.
 */
function validateLoginForm() {
  const email = document.getElementById('login-email')?.value?.trim() || '';
  const pass  = document.getElementById('login-pass')?.value || '';
  let valid = true;

  const emailErr = validateEmail(email);
  if (emailErr) { showFieldError('login-email', emailErr); valid = false; }
  else showFieldSuccess('login-email');

  if (!pass) { showFieldError('login-pass', 'Password is required.'); valid = false; }
  else clearFieldError('login-pass');

  return valid;
}

/**
 * Validate the daily check-in form.
 */
function validateCheckinForm() {
  const mood  = document.getElementById('ci-mood')?.value || '';
  const sleep = document.getElementById('ci-sleep')?.value || '';
  const study = document.getElementById('ci-study')?.value || '';
  const notes = document.getElementById('ci-notes')?.value || '';
  let valid = true;

  const moodErr = validateMoodScore(mood);
  if (moodErr) { showFieldError('ci-mood', moodErr); valid = false; }

  if (sleep !== '') {
    const sleepErr = validateSleepHours(sleep);
    if (sleepErr) { showFieldError('ci-sleep', sleepErr); valid = false; }
    else clearFieldError('ci-sleep');
  }

  if (study !== '') {
    const studyErr = validateStudyHours(study);
    if (studyErr) { showFieldError('ci-study', studyErr); valid = false; }
    else clearFieldError('ci-study');
  }

  const notesErr = validateNotes(notes);
  if (notesErr) { showFieldError('ci-notes', notesErr); valid = false; }

  return valid;
}

//  JWT Utilities 
function getStoredToken() {
  return localStorage.getItem('academicare_token');
}

function storeToken(token) {
  localStorage.setItem('academicare_token', token);
}

function clearToken() {
  localStorage.removeItem('academicare_token');
}

function getAuthHeaders() {
  const token = getStoredToken();
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

function checkSessionValid() {
  const token = getStoredToken();
  const user  = localStorage.getItem('academicare_user');
  if (!token || !user) return false;
  if (isTokenExpired(token)) {
    // Clear stale session
    clearToken();
    localStorage.removeItem('academicare_user');
    return false;
  }
  return true;
}

//  Inject spin animation 
(function injectStyles() {
  if (document.getElementById('validation-styles')) return;
  const style = document.createElement('style');
  style.id = 'validation-styles';
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--purple) !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important;
    }
    .field-valid {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 2px rgba(16,185,129,0.15) !important;
    }
  `;
  document.head.appendChild(style);
})();

console.log('%c[AcademiCare Validation] Engine loaded ✓', 'color:#6366f1;font-weight:600');
