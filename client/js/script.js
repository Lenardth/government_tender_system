/**
 * script.js — main page logic (index.html)
 */

let map, markers = [], tenders = [], tokenCount = parseInt(localStorage.getItem('tokenCount') || '0');

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('map'))              initMap();
  if (document.getElementById('newsContainer'))    loadNews();
  if (document.getElementById('investmentContainer')) loadInvestments();
  if (document.getElementById('tendersAwarded'))   updateDashboard();

  window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTop');
    if (btn) btn.style.display = (window.scrollY > 200) ? 'block' : 'none';
  });
});

// ── Map ───────────────────────────────────────────────────────
function initMap() {
  map = L.map('map').setView([-30.5595, 22.9375], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  addTenderLocations();
}

function addTenderLocations() {
  const locations = [
    { lat: -33.9249, lng: 18.4241, title: 'Cape Town Infrastructure Project',    budget: 'R25 million' },
    { lat: -29.8587, lng: 31.0218, title: 'Durban Port Expansion',               budget: 'R50 million' },
    { lat: -26.2041, lng: 28.0473, title: 'Johannesburg Solar Energy Initiative', budget: 'R15 million' },
    { lat: -33.0145, lng: 27.9116, title: 'East London Hospital Renovation',      budget: 'R30 million' },
    { lat: -25.7479, lng: 28.2293, title: 'Pretoria Public Transport System',     budget: 'R40 million' },
  ];
  locations.forEach(loc => {
    const m = L.marker([loc.lat, loc.lng]).addTo(map);
    m.bindPopup(`<b>${loc.title}</b><br>Budget: ${loc.budget}`);
    markers.push(m);
  });
}

// ── Tenders ───────────────────────────────────────────────────
async function loadTenders() {
  try {
    const res  = await fetch('/api/tenders');
    tenders    = await res.json();
  } catch {
    tenders = getFallbackTenders();
  }
  return tenders;
}

function getFallbackTenders() {
  return [
    { id:1, title:'Cape Town Road Infrastructure', category:'construction', budget:25000000, deadline:'2025-09-30', location:'Cape Town',    description:'Development of road infrastructure in Cape Town.', status:'open' },
    { id:2, title:'Durban Port Expansion',          category:'construction', budget:50000000, deadline:'2025-10-15', location:'Durban',       description:'Expansion of Durban port facilities.',             status:'open' },
    { id:3, title:'Johannesburg Solar Initiative',  category:'energy',       budget:15000000, deadline:'2025-08-10', location:'Johannesburg', description:'Solar panels on government buildings.',             status:'open' },
    { id:4, title:'National Healthcare Database',   category:'it',           budget:12000000, deadline:'2025-07-20', location:'Pretoria',     description:'Centralized healthcare database system.',           status:'open' },
    { id:5, title:'East London Hospital Renovation',category:'healthcare',   budget:30000000, deadline:'2025-11-01', location:'East London',  description:'Renovation of East London General Hospital.',       status:'open' },
  ];
}

async function searchTenders() {
  const term = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!term) return;
  showLoading();
  const all = tenders.length ? tenders : await loadTenders();
  hideLoading();
  const results = all.filter(t =>
    t.title.toLowerCase().includes(term) ||
    (t.description || '').toLowerCase().includes(term) ||
    (t.location || '').toLowerCase().includes(term)
  );
  alert(results.length ? `Found ${results.length} tender(s) matching "${term}"` : `No tenders found for "${term}"`);
}

async function filterTenders() {
  const category  = document.getElementById('categoryFilter').value;
  const maxBudget = parseFloat(document.getElementById('budgetFilter').value) || Infinity;
  showLoading();
  const all = tenders.length ? tenders : await loadTenders();
  hideLoading();
  let results = all;
  if (category !== 'all') results = results.filter(t => t.category === category);
  results = results.filter(t => t.budget <= maxBudget);
  alert(results.length ? `Found ${results.length} tender(s)` : 'No tenders match your filters');
}

// ── News ──────────────────────────────────────────────────────
function loadNews() {
  const items = [
    { title:'Government Announces Tender Transparency Initiative', date:'2025-04-01', content:'New initiative to improve transparency using blockchain technology.' },
    { title:'Infrastructure Fund Increased by R10 Billion',        date:'2025-03-25', content:'National Treasury allocates additional R10bn to Infrastructure Development Fund.' },
    { title:'New Tender Regulations Coming in June',               date:'2025-03-20', content:'Department of Public Works announces streamlined tender application regulations.' },
  ];
  const container = document.getElementById('newsContainer');
  if (!container) return;
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `<h3>${item.title}</h3><p class="news-date">${item.date}</p><p>${item.content}</p>`;
    container.appendChild(card);
  });
}

// ── Investments ───────────────────────────────────────────────
function loadInvestments() {
  const items = [
    { title:'Renewable Energy Projects',              roi:'15-20%', min:'R500,000',   desc:'Government-backed solar and wind energy projects.' },
    { title:'Public-Private Infrastructure Partners', roi:'12-18%', min:'R1,000,000', desc:'Critical infrastructure projects with stable long-term returns.' },
    { title:'Healthcare Facility Modernization',      roi:'10-15%', min:'R750,000',   desc:'Modernization of public healthcare facilities.' },
  ];
  const container = document.getElementById('investmentContainer');
  if (!container) return;
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'investment-card';
    card.innerHTML = `<h3>${item.title}</h3><p><strong>ROI:</strong> ${item.roi}</p><p><strong>Min Investment:</strong> ${item.min}</p><p>${item.desc}</p>`;
    container.appendChild(card);
  });
}

// ── Dashboard ─────────────────────────────────────────────────
function updateDashboard() {
  showLoading();
  setTimeout(() => {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('tendersAwarded',   '157');
    set('projectsCompleted','89');
    set('efficiencyScore',  '76%');
    hideLoading();
  }, 800);
}

// ── Calculator ────────────────────────────────────────────────
function calculateTender() {
  const m = parseFloat(document.getElementById('materialCost').value) || 0;
  const l = parseFloat(document.getElementById('laborCost').value)    || 0;
  const o = parseFloat(document.getElementById('overhead').value)     || 0;
  const el = document.getElementById('totalCost');
  if (el) el.textContent = `Total Cost: R${(m + l + o).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

// ── Gamification ──────────────────────────────────────────────
function claimTokens() {
  tokenCount += 10;
  localStorage.setItem('tokenCount', tokenCount);
  alert(`You earned 10 tokens! Total: ${tokenCount}`);
}

function downloadBudget() {
  alert('Budget plan download will be available soon.');
}
