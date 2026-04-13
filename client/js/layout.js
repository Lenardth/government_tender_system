/**
 * layout.js — shared header, nav (with mobile toggle), page hero, footer, utilities.
 *
 * Every page gets:
 *   1. Header  (logo + title + auth links + theme toggle)
 *   2. Nav     (sticky, with hamburger toggle on mobile)
 *   3. Page hero banner (auto-generated from page title, skipped on home)
 *   4. Footer  (brand + copyright + social)
 *   5. Back-to-top + spinner
 */
(function () {

  /* ── Page metadata map ───────────────────────────────────── */
  // Maps pathname → { title, subtitle }
  const PAGE_META = {
    '/tenders.html':          { title: 'Available Tenders',            sub: 'Browse and apply for government procurement opportunities' },
    '/investors.html':        { title: 'Investment Opportunities',     sub: 'Discover government-backed infrastructure investments' },
    '/government.html':       { title: 'Government Dashboard',         sub: 'Efficiency metrics, project status and procurement analytics' },
    '/news.html':             { title: 'News & Updates',               sub: 'Latest developments in public procurement and infrastructure' },
    '/calculator.html':       { title: 'Tender Cost Calculator',       sub: 'Estimate project costs and evaluate bid competitiveness' },
    '/documents.html':        { title: 'Tender Documents',             sub: 'Download official forms, guidelines and templates' },
    '/scoring.html':          { title: 'Scoring System',               sub: 'Understand the 10-point tender evaluation criteria' },
    '/verify.html':           { title: 'Verify Reports',               sub: 'Blockchain-based document authenticity verification' },
    '/status.html':           { title: 'Project Status',               sub: 'Real-time progress tracking across all provinces' },
    '/login.html':            { title: 'Sign In',                      sub: 'Access your Tender Monitoring System account' },
    '/register.html':         { title: 'Create Account',               sub: 'Join the platform as a contractor, investor or official' },
    '/admin/blockchain.html': { title: 'Blockchain Dashboard',         sub: 'Anti-corruption monitoring and blockchain verification' },
    '/admin/anticorruption.html': { title: 'Procurement Integrity',    sub: 'Integrated verification across government databases' },
  };

  /* ── Nav link definitions ────────────────────────────────── */
  const NAV_LINKS = [
    { href: '/index.html',            label: 'Home'       },
    { href: '/tenders.html',          label: 'Tenders'    },
    { href: '/investors.html',        label: 'Investors'  },
    { href: '/government.html',       label: 'Government' },
    { href: '/news.html',             label: 'News'       },
    { href: '/calculator.html',       label: 'Calculator' },
    { href: '/admin/blockchain.html', label: 'Blockchain' },
  ];

  const MORE_LINKS = [
    { href: '/documents.html', label: 'Download Documents' },
    { href: '/scoring.html',   label: 'Scoring System'     },
    { href: '/verify.html',    label: 'Verify Reports'     },
    { href: '/status.html',    label: 'Project Status'     },
  ];

  /* ── Favicon ─────────────────────────────────────────────── */
  document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());
  const svgIcon = document.createElement('link');
  svgIcon.rel = 'icon'; svgIcon.type = 'image/svg+xml'; svgIcon.href = '/assets/icon.svg';
  document.head.appendChild(svgIcon);
  const pngIcon = document.createElement('link');
  pngIcon.rel = 'icon'; pngIcon.type = 'image/png'; pngIcon.href = '/assets/icon.png';
  document.head.appendChild(pngIcon);

  /* ── Helpers ─────────────────────────────────────────────── */
  function isActive(href) {
    const p = window.location.pathname;
    if (href === '/index.html') return p === '/' || p === '/index.html' || p === '';
    return p === href || p === href.replace('.html', '');
  }

  function currentPath() {
    return window.location.pathname;
  }

  function isHomePage() {
    const p = currentPath();
    return p === '/' || p === '/index.html' || p === '';
  }

  /* ── 1. Header ───────────────────────────────────────────── */
  function buildHeader() {
    const h = document.createElement('header');
    h.innerHTML = `
      <a href="/index.html" class="header-img-link" aria-label="Home">
        <img src="/assets/south-africa.png" alt="South Africa coat of arms" class="header-img">
      </a>
      <h1 class="header-title">Tender Monitoring &amp; Verification System</h1>
      <div class="header-auth">
        <div id="authLinks"></div>
        <button id="themeToggle" aria-label="Toggle dark mode">🌙</button>
      </div>`;
    return h;
  }

  /* ── 2. Nav with hamburger ───────────────────────────────── */
  function buildNav() {
    const nav = document.createElement('nav');
    nav.id = 'mainNav';
    nav.setAttribute('aria-label', 'Main navigation');

    const links = NAV_LINKS.map(l => {
      const cur = isActive(l.href) ? ' aria-current="page"' : '';
      return `<a href="${l.href}"${cur}>${l.label}</a>`;
    }).join('');

    const more = MORE_LINKS.map(l =>
      `<a href="${l.href}" role="menuitem">${l.label}</a>`
    ).join('');

    nav.innerHTML = `
      <div class="nav-bar">
        <!-- Hamburger button (mobile only) -->
        <button class="nav-hamburger" id="navToggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="navMenu">
          <span></span><span></span><span></span>
        </button>

        <!-- Nav links -->
        <div class="nav-menu" id="navMenu" role="menubar">
          ${links}
          <div class="dropdown">
            <button class="dropbtn" aria-haspopup="true">More ▼</button>
            <div class="dropdown-content" role="menu">${more}</div>
          </div>
        </div>
      </div>`;

    // Wire hamburger toggle after element is in DOM
    setTimeout(() => {
      const toggle = document.getElementById('navToggle');
      const menu   = document.getElementById('navMenu');
      if (!toggle || !menu) return;

      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('nav-open');
        toggle.classList.toggle('nav-hamburger--open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });

      // Close menu when a link is clicked
      menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          menu.classList.remove('nav-open');
          toggle.classList.remove('nav-hamburger--open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (!nav.contains(e.target)) {
          menu.classList.remove('nav-open');
          toggle.classList.remove('nav-hamburger--open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }, 0);

    return nav;
  }

  /* ── 3. Page hero banner (every page except home) ────────── */
  function buildPageHero() {
    const p    = currentPath();
    const meta = PAGE_META[p] || PAGE_META[p + '.html'];
    if (!meta || isHomePage()) return null;

    // Build breadcrumb: Home > Page
    const crumb = document.createElement('div');
    crumb.className = 'page-hero';
    crumb.innerHTML = `
      <div class="page-hero-inner">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/index.html">Home</a>
          <span aria-hidden="true">›</span>
          <span aria-current="page">${meta.title}</span>
        </nav>
        <h1 class="page-hero-title">${meta.title}</h1>
        <p class="page-hero-sub">${meta.sub}</p>
      </div>`;
    return crumb;
  }

  /* ── 4. Footer ───────────────────────────────────────────── */
  function buildFooter() {
    const f = document.createElement('footer');
    f.className = 'footer';
    f.innerHTML = `
      <div class="footer-content">
        <div class="footer-brand">
          <img src="/assets/south-africa.png" alt="SA" class="footer-logo">
          <div>
            <p class="footer-title">Tender Monitoring System</p>
            <p class="footer-sub">Designed for Transparency and Growth</p>
          </div>
        </div>
        <p class="footer-copy">&copy; 2025 Government Tender Monitoring System</p>
        <div class="social-media">
          <a href="#" aria-label="Facebook"><img src="/assets/facebook.png" alt="Facebook"></a>
          <a href="#" aria-label="Twitter"><img src="/assets/twitter.png"   alt="Twitter"></a>
          <a href="#" aria-label="LinkedIn"><img src="/assets/linkedin.png" alt="LinkedIn"></a>
        </div>
      </div>`;
    return f;
  }

  /* ── 5. Utilities ────────────────────────────────────────── */
  function buildUtils() {
    const frag = document.createDocumentFragment();
    const btn  = document.createElement('button');
    btn.id = 'backToTop';
    btn.setAttribute('aria-label', 'Back to top');
    btn.textContent = '↑';
    frag.appendChild(btn);
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.id = 'loadingSpinner';
    spinner.setAttribute('aria-hidden', 'true');
    frag.appendChild(spinner);
    return frag;
  }

  /* ── Inject ──────────────────────────────────────────────── */
  const body = document.body;
  const main = document.getElementById('page-content');

  const nav    = buildNav();
  const header = buildHeader();
  const hero   = buildPageHero();

  body.insertBefore(nav,    main);
  body.insertBefore(header, body.firstChild);

  // Insert page hero between nav and main content
  if (hero) body.insertBefore(hero, main);

  body.appendChild(buildFooter());
  body.appendChild(buildUtils());

  /* ── Back-to-top ─────────────────────────────────────────── */
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTop');
    if (btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Theme toggle ────────────────────────────────────────── */
  window.addEventListener('load', () => {
    const btn = document.getElementById('themeToggle');
    if (btn && typeof toggleTheme === 'function') {
      btn.addEventListener('click', toggleTheme);
    }
  });

})();
