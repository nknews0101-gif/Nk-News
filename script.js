/* ═══════════════════════════════════════════════════════════════
   NK NEWS — Dynamic Homepage Interactivity
   Loads articles from localStorage, supports real language switching
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Initialize Data Layer ──
  NKData.init();

  // Listen for background cloud sync updates for seamless re-rendering
  document.addEventListener('nk-data-updated', () => {
    console.log('Background Sync Received: Silently rendering new UI');
    renderPage();
  });

  // ═════════════════════════════════
  //  RENDER ALL DYNAMIC CONTENT
  // ═════════════════════════════════
  function renderPage() {
    renderTicker();
    renderHero();
    renderCategorySections();
    renderAnalysis();
    renderTrending();
    renderVideos();
    applyTranslations();
  }

  // Initial Boot Render
  renderPage();

  // ── TICKER ──
  function renderTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent) return;
    const news = NKData.getBreakingNews();
    const items = news.map(n => `<span class="ticker-item">${n}</span><span class="ticker-separator"></span>`).join('');
    tickerContent.innerHTML = items + items; // duplicate for seamless loop
  }

  // ── HERO SECTION ──
  function renderHero() {
    const heroMain = document.getElementById('heroMain');
    const heroSidebar = document.getElementById('heroSidebar');
    if (!heroMain || !heroSidebar) return;

    const articles = NKData.getArticles();
    const topStory = articles.find(a => a.priority === 'top_story') || articles[0];
    const featured = articles.filter(a => a.priority === 'featured').slice(0, 3);

    if (topStory) {
      const bgImage = topStory.images && topStory.images[0] ? topStory.images[0] : 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?q=80&w=1000';
      
      heroMain.innerHTML = `
        <div class="hero-detail animate-fade-up">
           <div class="rounded overflow-hidden mb-4 shadow-sm border_light">
              <img src="${bgImage}" class="w-100 transition" alt="${NKData.localText(topStory.title)}" style="height: 480px; object-fit: cover;">
           </div>
           <div>
              <nav aria-label="breadcrumb" class="mb-2">
                  <ol class="breadcrumb font_12 uppercase bold mb-0">
                      <li class="breadcrumb-item col_orange">${NKData.t(topStory.category)}</li>
                      <li class="breadcrumb-item text-muted">${NKData.timeAgo(topStory.publishedAt)}</li>
                  </ol>
              </nav>
              <h1 class="family_1 bold mb-3" style="font-size: 2.5rem; line-height: 1.1;">
                <a href="article.html?id=${topStory.id}">${NKData.localText(topStory.title)}</a>
              </h1>
              <p class="text-muted mb-0 font_15 line-clamp-3">${NKData.localText(topStory.excerpt)}</p>
           </div>
        </div>
      `;
    }

    // Sidebar (Featured)
    heroSidebar.innerHTML = `
      <div class="trend_1_right ps-lg-3">
        <h4 class="mb-4 border-bottom pb-2 font_16 uppercase bold design border_light px-3 py-1">Trending News</h4>
        ${featured.map(a => `
          <div class="trend_2_inner mb-3 d-flex align-items-center gap-3 border_light p-2 rounded shadow-sm bg_light">
             <div class="trend_2_inner_l w-25 overflow-hidden rounded" style="height:60px;">
                <img src="${a.images && a.images[0] ? a.images[0] : 'https://via.placeholder.com/150'}" class="w-100 h-100 object-fit-cover" alt="thumb">
             </div>
             <div class="trend_2_inner_r w-75">
                <h6 class="font_13 line-clamp-2 bold mb-1"><a href="article.html?id=${a.id}">${NKData.localText(a.title)}</a></h6>
                <span class="font_11 text-muted uppercase bold">${NKData.timeAgo(a.publishedAt)}</span>
             </div>
          </div>
        `).join('')}
        <div class="bg-dark text-white p-4 mt-5 rounded shadow d-none d-lg-block">
            <h5 class="bold mb-2 font_14 uppercase">24/7 AI Coverage</h5>
            <p class="font_11 text-white-50 mb-0">Our AI engine publishes real-time updates every 30 minutes from global sources.</p>
        </div>
      </div>
    `;
  }

  // ── CATEGORY SECTIONS ──
  function renderCategorySections() {
    const container = document.getElementById('categorySections');
    if (!container) return;

    const cats = ['politics', 'business', 'technology', 'sports', 'world', 'culture'];
    
    container.innerHTML = `
      <div class="container py-4">
        <div class="row g-5">
          ${cats.map(catId => {
            const articles = NKData.getArticlesByCategory(catId).slice(0, 4);
            if (articles.length === 0) return '';

            return `
              <div class="col-lg-6 mb-5">
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                  <h3 class="bold uppercase design border_light px-3 py-2 font_16 mb-0">${NKData.t(catId)}</h3>
                  <a href="category.html?cat=${catId}" class="col_orange bold font_11 uppercase">${NKData.t('view_all')} <i class="bi bi-arrow-right"></i></a>
                </div>
                <div class="row g-3">
                  ${articles.map((a, i) => i === 0 ? `
                    <div class="col-12 mb-3">
                      <div class="trend_2_inner h-100 card border-0 p-0 shadow-sm overflow-hidden">
                        <div style="height:200px; overflow:hidden;">
                          <img src="${a.images?.[0] || ''}" class="w-100 h-100 object-fit-cover transition" />
                        </div>
                        <div class="p-3">
                          <h5 class="font_15 bold line-clamp-2"><a href="article.html?id=${a.id}">${NKData.localText(a.title)}</a></h5>
                          <span class="font_11 text-muted uppercase bold">${NKData.timeAgo(a.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ` : `
                    <div class="col-md-4">
                      <div class="trend_2_inner h-100 text-center">
                        <div class="mb-2 overflow-hidden rounded shadow-sm" style="height:80px;">
                          <img src="${a.images?.[0] || ''}" class="w-100 h-100 object-fit-cover" />
                        </div>
                        <h6 class="font_11 bold line-clamp-3 mb-0"><a href="article.html?id=${a.id}">${NKData.localText(a.title)}</a></h6>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ── DEEP ANALYSIS ──
  function renderAnalysis() {
    const container = document.getElementById('analysisBlock');
    if (!container) return;

    const analysis = NKData.getArticles().find(a => a.isAnalysis);
    if (!analysis) return;
    
    container.innerHTML = `
      <section class="py-5 bg_orange_dark text-white">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-7">
               <h6 class="bg_orange d-table px-3 py-1 mb-3 font_12 uppercase bold">${NKData.t('in_depth')}</h6>
               <h2 class="family_1 bold mb-4" style="font-size:3rem; line-height:1.1;">
                 <a href="article.html?id=${analysis.id}" class="text-white">${NKData.localText(analysis.title)}</a>
               </h2>
               <p class="text-white-50 mb-5 font_16">${NKData.localText(analysis.excerpt)}</p>
               <div class="row g-4">
                  <div class="col-4">
                    <h3 class="bold family_1 mb-0">${analysis.sources||5}</h3>
                    <span class="font_11 uppercase text-white-50">Sources</span>
                  </div>
                  <div class="col-4">
                    <h3 class="bold family_1 mb-0">${analysis.govDocs||12}</h3>
                    <span class="font_11 uppercase text-white-50">Documents</span>
                  </div>
                  <div class="col-4">
                    <h3 class="bold family_1 mb-0">${analysis.expertQuotes||8}</h3>
                    <span class="font_11 uppercase text-white-50">Experts</span>
                  </div>
               </div>
            </div>
            <div class="col-lg-5 mt-4 mt-lg-0">
               <div class="rounded overflow-hidden shadow-lg">
                 <img src="${analysis.images ? analysis.images[0] : 'https://via.placeholder.com/600x400'}" class="w-100" alt="analysis">
               </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ── TRENDING ──
  function renderTrending() {
    const list = document.getElementById('trendingList');
    if (!list) return;

    const top = NKData.getArticles().sort((a, b) => (b.views||0) - (a.views||0)).slice(0, 8);
    list.innerHTML = top.map((a, i) => `
      <div class="trend_2_inner mb-3 d-flex align-items-start gap-3 border-0 border-bottom pb-3 bg-transparent">
        <span class="font_24 bold col_orange family_1" style="min-width:30px;">${String(i+1).padStart(2,'0')}</span>
        <div>
          <h6 class="font_14 bold mb-1"><a href="article.html?id=${a.id}">${NKData.localText(a.title)}</a></h6>
          <span class="font_11 text-muted uppercase">${NKData.timeAgo(a.publishedAt)}</span>
        </div>
      </div>
    `).join('');
  }

  // ── VIDEOS ──
  function renderVideos() {
    const container = document.getElementById('videoGrid');
    if (!container) return;

    const videos = NKData.getArticles().filter(a => a.contentType === 'video' || a.contentType === 'live');
    if (videos.length === 0) return;

    container.innerHTML = videos.slice(0, 4).map(a => `
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="position-relative overflow-hidden rounded group" style="height:200px;">
          <img src="${a.images && a.images[0] ? a.images[0] : 'https://via.placeholder.com/400x250'}" class="w-100 h-100 object-fit-cover" alt="video">
          <div class="position-absolute top-0 start-0 w-100 h-100 bg_back d-flex flex-column justify-content-end p-3">
             ${a.contentType === 'live' ? '<span class="bg-danger text-white px-2 py-1 rounded font_10 bold mb-2 d-table">LIVE</span>' : ''}
             <h6 class="text-white font_13 bold mb-0"><a href="article.html?id=${a.id}" class="text-white">${NKData.localText(a.title)}</a></h6>
             <div class="position-absolute top-50 start-50 translate-middle opacity-75 group-hover-opacity-100 transition">
                <i class="bi bi-play-circle-fill text-white fs-1"></i>
             </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ═════════════════════════════════
  //  LANGUAGE SWITCHING (REAL)
  // ═════════════════════════════════
  function applyTranslations() {
    // data-i18n on elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = NKData.t(el.dataset.i18n);
    });
    // data-i18n-placeholder on inputs
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = NKData.t(el.dataset.i18nPlaceholder);
    });
  }

  // ═════════════════════════════════
  //  UI INTERACTIONS
  // ═════════════════════════════════

  // ── Date/Time ──
  const headerDate = document.getElementById('headerDate');
  function updateDateTime() {
    headerDate.textContent = new Date().toLocaleDateString('en-IN', {
      weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata'
    }) + ' IST';
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // ── Dark Mode ──
  const themeBtn = document.getElementById('themeBtn');
  if (localStorage.getItem('nk_theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '☀️';
  }
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('nk_theme','light'); themeBtn.textContent='🌙'; }
    else { document.documentElement.setAttribute('data-theme','dark'); localStorage.setItem('nk_theme','dark'); themeBtn.textContent='☀️'; }
  });

  // ── Language Switcher ──
  const langSwitcher = document.getElementById('langSwitcher');
  const langBtn = document.getElementById('langBtn');

  langBtn.addEventListener('click', (e) => { e.stopPropagation(); langSwitcher.classList.toggle('open'); });
  document.addEventListener('click', (e) => { if (!langSwitcher.contains(e.target)) langSwitcher.classList.remove('open'); });

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', async () => {
      const code = opt.dataset.lang; // Use dataset.lang as in original
      const name = opt.querySelector('.native').textContent; // Get native name as in original
      localStorage.setItem('nk_lang', code);
      document.cookie = `nk_lang=${code}; max-age=31536000; path=/`; // Keep cookie setting

      // RTL
      if (code === 'ur' || code === 'ks') document.documentElement.setAttribute('dir','rtl');
      else document.documentElement.removeAttribute('dir');

      langBtn.querySelector('span:first-child').textContent = name;
      document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      langSwitcher.classList.remove('open');

      // AUTO TRANSLATE MISSING CONTENT
      await NKData.translateMissingContent(code);

      // RE-RENDER EVERYTHING in new language
      renderPage();
    });
  });

  // Restore saved lang
  const savedLang = localStorage.getItem('nk_lang');
  if (savedLang) {
    const opt = document.querySelector(`[data-lang="${savedLang}"]`);
    if (opt) {
      langBtn.querySelector('span:first-child').textContent = opt.querySelector('.native').textContent;
      document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      if (savedLang === 'ur' || savedLang === 'ks') document.documentElement.setAttribute('dir','rtl');
    }
  }

  // ── Search ──
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  function openSearch() { searchOverlay.classList.add('show'); document.body.style.overflow='hidden'; setTimeout(() => searchInput.focus(), 200); }
  function closeSearch() { searchOverlay.classList.remove('show'); document.body.style.overflow=''; searchInput.value=''; document.getElementById('searchResults').innerHTML=''; }

  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });

  // Live search
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    const results = document.getElementById('searchResults');
    if (q.length < 2) { results.innerHTML = ''; return; }

    const articles = NKData.getArticles().filter(a => {
      const title = NKData.localText(a.title).toLowerCase();
      const excerpt = NKData.localText(a.excerpt).toLowerCase();
      return title.includes(q) || excerpt.includes(q);
    }).slice(0, 5);

    results.innerHTML = articles.length ? articles.map(a => `
      <a href="article.html?id=${a.id}" style="display:block; padding:12px; margin:4px 0; background:var(--surface2); border-radius:8px; text-decoration:none; color:var(--ink);">
        <strong>${NKData.localText(a.title)}</strong>
        <div style="font-size:12px; color:var(--ink3); margin-top:4px;">${NKData.t(a.category)} · ${NKData.timeAgo(a.publishedAt)}</div>
      </a>
    `).join('') : '<p style="padding:12px; color:var(--ink3);">No results found.</p>';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); closeMobileMenu(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  });

  // ── Mobile Menu ──
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  function openMobileMenu() { mobileOverlay.classList.add('show'); mobileMenu.classList.add('show'); document.body.style.overflow='hidden'; }
  function closeMobileMenu() { mobileOverlay.classList.remove('show'); mobileMenu.classList.remove('show'); document.body.style.overflow=''; }

  hamburgerBtn.addEventListener('click', openMobileMenu);
  mobileClose.addEventListener('click', closeMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);

  // ── Cookie Consent ──
  const cookieConsent = document.getElementById('cookieConsent');
  if (!localStorage.getItem('nk_cookie_consent')) {
    setTimeout(() => cookieConsent.classList.add('show'), 2000);
  }
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('nk_cookie_consent', 'accepted');
    cookieConsent.classList.remove('show');
  });
  document.getElementById('cookieDecline').addEventListener('click', () => {
    localStorage.setItem('nk_cookie_consent', 'declined');
    cookieConsent.classList.remove('show');
  });

  // ── Newsletter ──
  const nlForm = document.querySelector('.newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nlForm.querySelector('.newsletter-input');
      const btn = nlForm.querySelector('.newsletter-submit');
      if (input.value) {
        btn.textContent = '✓ ' + (NKData.getLang() === 'hi' ? 'सदस्यता हो गई!' : 'Subscribed!');
        btn.style.background = 'var(--teal)';
        input.value = '';
        setTimeout(() => { btn.textContent = NKData.t('subscribe'); btn.style.background=''; }, 3000);
      }
    });
  }

  // ── Ticker Pause on Hover ──
  const tickerContent = document.getElementById('tickerContent');
  tickerContent.addEventListener('mouseenter', () => { tickerContent.style.animationPlayState='paused'; });
  tickerContent.addEventListener('mouseleave', () => { tickerContent.style.animationPlayState='running'; });

  // ── Header Scroll Effect ──
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 100 ? '0 4px 20px rgba(0,0,0,0.15)' : '';
  });

  // ── Lazy Load Animation ──
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { 
          e.target.classList.add('animate-fade-up'); 
          observer.unobserve(e.target); 
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Observe potential elements
    const observeInitial = () => {
      document.querySelectorAll('.news-card, .video-card, .featured-card, .deep-analysis, .trending-item').forEach(el => {
        observer.observe(el);
      });
    };
    setTimeout(observeInitial, 200);
  }

  // ═════════════════════════════════
  //  INITIAL RENDER
  // ═════════════════════════════════
  renderPage();

});
