/**
 * tenders.js — tenders listing page logic
 */
let allTenders = [];

document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  try {
    const res = await fetch('/api/tenders');
    allTenders = await res.json();
  } catch {
    allTenders = getFallbackTenders();
  }
  hideLoading();
  renderTenders(allTenders);

  document.getElementById('searchInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') doSearch();
  });
});

function renderTenders(list) {
  const container = document.getElementById('tendersList');
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p class="no-results">No tenders found.</p>';
    return;
  }
  list.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tender-card';
    card.innerHTML = `
      <div class="tender-card-header">
        <h3>${t.title}</h3>
        <span class="tender-status status-${t.status}">${t.status.toUpperCase()}</span>
      </div>
      <p><strong>Category:</strong> ${t.category.charAt(0).toUpperCase() + t.category.slice(1)}</p>
      <p><strong>Budget:</strong> R${Number(t.budget).toLocaleString('en-ZA')}</p>
      <p><strong>Deadline:</strong> ${t.deadline}</p>
      <p><strong>Location:</strong> ${t.location || '—'}</p>
      <p>${t.description || ''}</p>
      <button onclick="applyForTender(${t.id})" class="btn-apply">Apply for Tender</button>
    `;
    container.appendChild(card);
  });
}

function doSearch() {
  const term = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = allTenders.filter(t =>
    t.title.toLowerCase().includes(term) ||
    (t.description || '').toLowerCase().includes(term) ||
    (t.location || '').toLowerCase().includes(term)
  );
  renderTenders(filtered);
}

function searchTenders() { doSearch(); }

function filterTenders() {
  const category  = document.getElementById('categoryFilter').value;
  const maxBudget = parseFloat(document.getElementById('budgetFilter').value) || Infinity;
  let results = allTenders;
  if (category !== 'all') results = results.filter(t => t.category === category);
  results = results.filter(t => Number(t.budget) <= maxBudget);
  renderTenders(results);
}

async function applyForTender(id) {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return;
  }
  const user = Auth.getUser();
  if (user.role !== 'contractor') {
    alert('Only contractors can apply for tenders.');
    return;
  }
  const proposal   = prompt('Enter a brief proposal:');
  if (proposal === null) return;
  const bid_amount = prompt('Enter your bid amount (R):');
  if (bid_amount === null) return;

  showLoading();
  try {
    const res = await fetch(`/api/tenders/${id}/apply`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ proposal, bid_amount: parseFloat(bid_amount) }),
    });
    const data = await res.json();
    alert(res.ok ? 'Application submitted successfully!' : data.message);
  } catch {
    alert('Failed to submit application. Please try again.');
  } finally {
    hideLoading();
  }
}
