/**
 * auth.js — shared authentication helpers
 * Used by every page to manage login state and header UI.
 */

const Auth = (() => {
  const TOKEN_KEY = 'tender_token';
  const USER_KEY  = 'tender_user';

  function getToken()  { return localStorage.getItem(TOKEN_KEY); }
  function getUser()   { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null; }
  function isLoggedIn(){ return !!getToken(); }

  function save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login.html';
  }

  // Inject auth state into the header #authLinks element
  function renderHeader() {
    const el = document.getElementById('authLinks');
    if (!el) return;
    const user = getUser();
    if (user) {
      el.innerHTML = `
        <span class="welcome-text">Welcome, ${user.name}</span>
        ${user.role === 'government' || user.role === 'admin'
          ? '<a href="/admin/blockchain.html">Admin</a>' : ''}
        <a href="#" onclick="Auth.logout()">Logout</a>
      `;
    } else {
      el.innerHTML = `
        <a href="/login.html">Login</a>
        <a href="/register.html">Register</a>
      `;
    }
  }

  // Redirect away from protected pages if not logged in
  function requireAuth(allowedRoles = []) {
    if (!isLoggedIn()) {
      window.location.href = '/login.html';
      return false;
    }
    if (allowedRoles.length > 0) {
      const user = getUser();
      if (!allowedRoles.includes(user.role)) {
        window.location.href = '/index.html';
        return false;
      }
    }
    return true;
  }

  // Attach header render on every page load
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    // Restore theme
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = '☀️';
    }
  });

  return { getToken, getUser, isLoggedIn, save, logout, requireAuth, renderHeader };
})();

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function showLoading()  { const s = document.getElementById('loadingSpinner'); if (s) s.style.display = 'block'; }
function hideLoading()  { const s = document.getElementById('loadingSpinner'); if (s) s.style.display = 'none'; }
function scrollToTop()  { window.scrollTo({ top: 0, behavior: 'smooth' }); }
