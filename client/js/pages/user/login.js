/**
 * login.js — handles login form submission
 */
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    window.location.href = (user.role === 'government' || user.role === 'admin')
      ? '/government.html' : '/index.html';
  }

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('loginError');

  errorEl.textContent = '';
  showLoading();

  try {
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      Auth.save(data.token, data.user);
      window.location.href = (data.user.role === 'government' || data.user.role === 'admin')
        ? '/government.html' : '/index.html';
    } else {
      errorEl.textContent = data.message || 'Login failed. Please check your credentials.';
    }
  } catch {
    errorEl.textContent = 'Network error. Please try again.';
  } finally {
    hideLoading();
  }
}
