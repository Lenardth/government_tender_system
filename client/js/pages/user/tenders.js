/**
 * tenders.js — tenders listing page logic.
 */
let allTenders = [];

const FALLBACK_TENDERS = [
  { id:1, title:'Cape Town Road Infrastructure', category:'construction', budget:25000000, deadline:'2025-09-30', location:'Cape Town',    description:'Development of road infrastructure in Cape Town.',  status:'open' },
  { id:2, title:'Durban Port Expansion',          category:'construction', budget:50000000, deadline:'2025-10-15', location:'Durban',       description:'Expansion of Durban port facilities.',              status:'open' },
  { id:3, title:'Johannesburg Solar Initiative',  category:'energy',       budget:15000000, deadline:'2025-08-10', location:'Johannesburg', description:'Solar panels on government buildings.',              status:'open' },
  { id:4, title:'National Healthcare Database',   category:'it',           budget:12000000, deadline:'2025-07-20', location:'Pretoria',     description:'Centralised healthcare database system.',            status:'open' },
  { id:5, title:'East London Hospital Renovation',category:'healthcare',   budget:30000000, deadline:'2025-11-01', location:'East London',  description:'Renovation of East London General Hospital.',        status:'open' },
];

document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  try {
    const res = await fetch('/api/tenders');
    if (res.ok) {
      allTenders = await res.json();
    } else {
      allTenders = FALLBACK_TENDERS;
    }
  } catch {
    allTenders = FALLBACK_TENDERS;
  }
  hideLoading();
  renderTenders(allTenders);

  document.getElementById('searchInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') doSearch();
  });
});

function renderTenders(list) {
  const container = document.getElementById('tendersList');
  if (!container) return;
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<p class="no-results" style="text-align:center;color:#888;padding:32px">No tenders found.</p>';
    return;
  }

  list.forEach(t => {
    const statusColor = t.status === 'open' ? '#2e7d32' : t.status === 'closed' ? '#c62828' : '#e65100';
    const card = document.createElement('div');
    card.className = 'tender-card';
    card.innerHTML = `
      <div class="tender-card-header">
        <h3>${t.title}</h3>
        <span class="tender-status" style="background:${statusColor}15;color:${statusColor};padding:3px 10px;border-radius:12px;font-size:0.78rem;font-weight:700">${t.status.toUpperCase()}</span>
      </div>
      <p><strong>Category:</strong> ${t.category.charAt(0).toUpperCase() + t.category.slice(1)}</p>
      <p><strong>Budget:</strong> R${Number(t.budget).toLocaleString('en-ZA')}</p>
      <p><strong>Deadline:</strong> ${t.deadline}</p>
      <p><strong>Location:</strong> ${t.location || '—'}</p>
      <p style="color:#555;font-size:0.9rem">${t.description || ''}</p>
      <button onclick="applyForTender(${t.id})" class="btn-apply">Apply for Tender</button>`;
    container.appendChild(card);
  });
}

function doSearch() {
  const term = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  if (!term) { renderTenders(allTenders); return; }
  renderTenders(allTenders.filter(t =>
    t.title.toLowerCase().includes(term) ||
    (t.description || '').toLowerCase().includes(term) ||
    (t.location || '').toLowerCase().includes(term)
  ));
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
    alert('Only contractors can apply for tenders. Please register as a contractor.');
    return;
  }

  const proposal   = prompt('Enter a brief proposal (required):');
  if (!proposal || !proposal.trim()) return;
  const bidStr = prompt('Enter your bid amount in Rands (e.g. 5000000):');
  if (!bidStr) return;
  const bid_amount = parseFloat(bidStr);
  if (isNaN(bid_amount) || bid_amount <= 0) { alert('Please enter a valid bid amount.'); return; }

  showLoading();
  try {
    const res = await fetch(`/api/tenders/${id}/apply`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ proposal: proposal.trim(), bid_amount }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('✓ Application submitted successfully!');
    } else {
      alert(`Error: ${data.message || 'Could not submit application.'}`);
    }
  } catch {
    alert('Network error. Please check your connection and try again.');
  } finally {
    hideLoading();
  }
}
