/**
 * script.js — index.html page logic.
 * Handles map, news, investments, dashboard, calculator, slideshow.
 */

let map, markers = [], tenders = [];
let tokenCount = parseInt(localStorage.getItem('tokenCount') || '0');

/* ── Shared fallback tender data (used by tenders.js too) ─────── */
function getFallbackTenders() {
  return [
    { id:1, title:'Cape Town Road Infrastructure', category:'construction', budget:25000000, deadline:'2025-09-30', location:'Cape Town',    description:'Development of road infrastructure in Cape Town.',  status:'open' },
    { id:2, title:'Durban Port Expansion',          category:'construction', budget:50000000, deadline:'2025-10-15', location:'Durban',       description:'Expansion of Durban port facilities.',              status:'open' },
    { id:3, title:'Johannesburg Solar Initiative',  category:'energy',       budget:15000000, deadline:'2025-08-10', location:'Johannesburg', description:'Solar panels on government buildings.',              status:'open' },
    { id:4, title:'National Healthcare Database',   category:'it',           budget:12000000, deadline:'2025-07-20', location:'Pretoria',     description:'Centralised healthcare database system.',            status:'open' },
    { id:5, title:'East London Hospital Renovation',category:'healthcare',   budget:30000000, deadline:'2025-11-01', location:'East London',  description:'Renovation of East London General Hospital.',        status:'open' },
  ];
}

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('map'))                 initMap();
  if (document.getElementById('newsContainer'))       loadNews();
  if (document.getElementById('investmentContainer')) loadInvestments();
  if (document.getElementById('tendersAwarded'))      updateDashboard();
  if (document.querySelector('.slide'))               startSlideshow();

  // Pre-load tenders for search/filter on index page
  if (document.getElementById('searchInput')) {
    try {
      const res = await fetch('/api/tenders');
      if (res.ok) tenders = await res.json();
    } catch { /* ignore */ }
    if (!tenders.length) tenders = getFallbackTenders();
  }
});

/* ── Map ─────────────────────────────────────────────────────── */
function initMap() {
  map = L.map('map').setView([-30.5595, 22.9375], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  [
    { lat:-33.9249, lng:18.4241, title:'Cape Town Infrastructure',    budget:'R25m' },
    { lat:-29.8587, lng:31.0218, title:'Durban Port Expansion',       budget:'R50m' },
    { lat:-26.2041, lng:28.0473, title:'Johannesburg Solar Initiative',budget:'R15m' },
    { lat:-33.0145, lng:27.9116, title:'East London Hospital',        budget:'R30m' },
    { lat:-25.7479, lng:28.2293, title:'Pretoria Public Transport',   budget:'R40m' },
  ].forEach(loc => {
    const m = L.marker([loc.lat, loc.lng]).addTo(map);
    m.bindPopup(`<b>${loc.title}</b><br>Budget: ${loc.budget}`);
    markers.push(m);
  });
}

/* ── Search (index page — shows inline results) ──────────────── */
function searchTenders() {
  const term = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  if (!term) return;
  const results = tenders.filter(t =>
    t.title.toLowerCase().includes(term) ||
    (t.description || '').toLowerCase().includes(term) ||
    (t.location || '').toLowerCase().includes(term)
  );
  showSearchResults(results, `Results for "${term}"`);
}

function filterTenders() {
  const category  = document.getElementById('categoryFilter').value;
  const maxBudget = parseFloat(document.getElementById('budgetFilter').value) || Infinity;
  let results = tenders;
  if (category !== 'all') results = results.filter(t => t.category === category);
  results = results.filter(t => t.budget <= maxBudget);
  showSearchResults(results, 'Filtered Tenders');
}

function showSearchResults(list, heading) {
  // Reuse or create a results panel below the filter section
  let panel = document.getElementById('searchResultsPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'searchResultsPanel';
    panel.style.cssText = 'max-width:1100px;margin:0 auto 32px;padding:0 16px';
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) filterSection.after(panel);
  }
  if (!list.length) {
    panel.innerHTML = `<p style="text-align:center;color:#888;padding:16px">No tenders found.</p>`;
    return;
  }
  panel.innerHTML = `
    <h3 style="color:#004B87;margin:0 0 16px">${heading} (${list.length})</h3>
    <div style="display:flex;flex-wrap:wrap;gap:16px">
      ${list.map(t => `
        <div style="background:white;border-radius:10px;padding:18px;box-shadow:0 3px 10px rgba(0,0,0,0.08);flex:1;min-width:260px;max-width:340px;text-align:left">
          <h4 style="color:#004B87;margin:0 0 8px">${t.title}</h4>
          <p style="margin:4px 0;font-size:0.88rem;color:#555"><strong>Budget:</strong> R${Number(t.budget).toLocaleString('en-ZA')}</p>
          <p style="margin:4px 0;font-size:0.88rem;color:#555"><strong>Deadline:</strong> ${t.deadline}</p>
          <p style="margin:4px 0;font-size:0.88rem;color:#555"><strong>Location:</strong> ${t.location || '—'}</p>
          <a href="/tenders.html" style="display:inline-block;margin-top:10px;background:#004B87;color:white;padding:7px 14px;border-radius:5px;text-decoration:none;font-size:0.85rem">View All Tenders</a>
        </div>`).join('')}
    </div>`;
}

/* ── News ────────────────────────────────────────────────────── */
function loadNews() {
  const items = [
    { title:'Government Announces Tender Transparency Initiative', date:'2025-04-01', content:'New initiative to improve transparency using blockchain technology for verification.' },
    { title:'Infrastructure Fund Increased by R10 Billion',        date:'2025-03-25', content:'National Treasury allocates additional R10bn to the Infrastructure Development Fund.' },
    { title:'New Tender Regulations Coming in June',               date:'2025-03-20', content:'Department of Public Works announces streamlined tender application regulations.' },
  ];
  const container = document.getElementById('newsContainer');
  if (!container) return;
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p class="news-date">📅 ${item.date}</p>
      <p>${item.content}</p>
      <a href="/news.html" style="display:inline-block;margin-top:12px;color:#004B87;font-weight:600;font-size:0.88rem;text-decoration:none">Read more →</a>`;
    container.appendChild(card);
  });
}

/* ── Investments ─────────────────────────────────────────────── */
function loadInvestments() {
  const items = [
    { title:'Renewable Energy Projects',              roi:'15–20%', min:'R500,000',   desc:'Government-backed solar and wind energy projects across South Africa.' },
    { title:'Public-Private Infrastructure Partners', roi:'12–18%', min:'R1,000,000', desc:'Critical infrastructure projects with stable long-term returns.' },
    { title:'Healthcare Facility Modernization',      roi:'10–15%', min:'R750,000',   desc:'Modernisation of public healthcare facilities with equipment leasing.' },
  ];
  const container = document.getElementById('investmentContainer');
  if (!container) return;
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'investment-card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Expected ROI:</strong> ${item.roi}</p>
      <p><strong>Min Investment:</strong> ${item.min}</p>
      <p>${item.desc}</p>
      <a href="/investors.html" style="display:inline-block;margin-top:12px;color:#004B87;font-weight:600;font-size:0.88rem;text-decoration:none">Learn more →</a>`;
    container.appendChild(card);
  });
}

/* ── Dashboard ───────────────────────────────────────────────── */
function updateDashboard() {
  showLoading();
  setTimeout(() => {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('tendersAwarded',    '157');
    set('projectsCompleted', '89');
    set('efficiencyScore',   '76%');
    hideLoading();
  }, 600);
}

/* ── Calculator (index page quick calc) ──────────────────────── */
function calculateTender() {
  const m  = parseFloat(document.getElementById('materialCost').value) || 0;
  const l  = parseFloat(document.getElementById('laborCost').value)    || 0;
  const o  = parseFloat(document.getElementById('overhead').value)     || 0;
  const el = document.getElementById('totalCost');
  if (el) el.textContent = `Total Cost: R${(m + l + o).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

/* ── Gamification ────────────────────────────────────────────── */
function claimTokens() {
  tokenCount += 10;
  localStorage.setItem('tokenCount', tokenCount);
  alert(`You earned 10 tokens! Total: ${tokenCount}`);
}

/* ── Slideshow with dot navigation ──────────────────────────── */
function startSlideshow() {
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('slideDots');
  if (!slides.length) return;

  let current = 0;

  // Build dot buttons
  if (dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  function goTo(index) {
    slides[current].classList.remove('show');
    if (dotsContainer) dotsContainer.children[current].classList.remove('active');
    current = index;
    slides[current].classList.add('show');
    if (dotsContainer) dotsContainer.children[current].classList.add('active');
  }

  // Show first slide
  slides[0].classList.add('show');

  // Auto-advance every 4 seconds
  setInterval(() => goTo((current + 1) % slides.length), 4000);
}
