/**
 * auth.js — authentication helpers, theme, and shared utilities.
 * Loaded on every page after layout.js.
 */

const Auth = (() => {
  const TOKEN_KEY = 'tender_token';
  const USER_KEY  = 'tender_user';

  function getToken()   { return localStorage.getItem(TOKEN_KEY); }
  function getUser()    { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null; }
  function isLoggedIn() { return !!getToken(); }

  function save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login.html';
  }

  /** Render auth state into #authLinks (injected by layout.js). */
  function renderHeader() {
    const el = document.getElementById('authLinks');
    if (!el) return;
    const user = getUser();
    if (user) {
      el.innerHTML = `
        <span class="welcome-text">Welcome, ${escHtml(user.name)}</span>
        ${(user.role === 'government' || user.role === 'admin')
          ? '<a href="/admin/blockchain.html">Admin</a>' : ''}
        <a href="#" id="logoutBtn">Logout</a>`;
      document.getElementById('logoutBtn').addEventListener('click', e => {
        e.preventDefault();
        logout();
      });
    } else {
      el.innerHTML = `
        <a href="/login.html">Login</a>
        <a href="/register.html">Register</a>`;
    }
  }

  /** Redirect if not logged in (or wrong role). */
  function requireAuth(allowedRoles = []) {
    if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
    if (allowedRoles.length) {
      const user = getUser();
      if (!allowedRoles.includes(user.role)) { window.location.href = '/index.html'; return false; }
    }
    return true;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Init on DOM ready ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();

    // Restore saved theme
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = '☀️';
    }

    // Wire theme toggle (layout.js may have already wired it via window.load,
    // but DOMContentLoaded fires first — wire it here too, safely)
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      // Remove any duplicate listeners by replacing the element clone trick
      themeBtn.onclick = toggleTheme;
    }
  });

  return { getToken, getUser, isLoggedIn, save, logout, requireAuth, renderHeader };
})();

/* ── Global helpers ──────────────────────────────────────────── */

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const dark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
}

function showLoading() {
  const s = document.getElementById('loadingSpinner');
  if (s) s.style.display = 'block';
}

function hideLoading() {
  const s = document.getElementById('loadingSpinner');
  if (s) s.style.display = 'none';
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
