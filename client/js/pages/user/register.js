/**
 * register.js — handles registration form submission
 */
document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isLoggedIn()) window.location.href = '/index.html';
  document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
});

async function handleRegistration(e) {
  e.preventDefault();
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const role     = document.getElementById('role').value;
  const errorEl  = document.getElementById('registerError');

  errorEl.textContent = '';

  if (password.length < 8) {
    errorEl.textContent = 'Password must be at least 8 characters.';
    return;
  }

  showLoading();
  try {
    const res  = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();

    if (res.ok) {
      Auth.save(data.token, data.user);
      window.location.href = '/index.html';
    } else {
      errorEl.textContent = data.message || 'Registration failed.';
    }
  } catch {
    errorEl.textContent = 'Network error. Please try again.';
  } finally {
    hideLoading();
  }
}
