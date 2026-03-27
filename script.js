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
    // Top story: first top_story or first article
    const topStory = articles.find(a => a.priority === 'top_story') || articles[0];
    const featured = articles.filter(a => a.priority === 'featured').slice(0, 3);

    if (topStory) {
      const cat = NKData.getCategoryInfo(topStory.category);
      const bgImage = topStory.images && topStory.images[0] ? `<img src="${topStory.images[0]}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;" />` : `<div class="hero-image-placeholder">Article Hero Image · ${cat.en}</div>`;
      
      heroMain.innerHTML = `
        <div class="hero-image">
          ${bgImage}
        </div>
        <div class="hero-content">
          <span class="cat-tag">${NKData.t('top_story')}</span>
          <h1 class="hero-headline"><a href="article.html?id=${topStory.id}" style="color:inherit; text-decoration:none;">${NKData.localText(topStory.title)}</a></h1>
          <p class="hero-excerpt">${NKData.localText(topStory.excerpt)}</p>
          <div class="hero-meta">
            <span class="author">${NKData.t('by')} ${topStory.author}</span>
            <span class="dot"></span>
            <span>${NKData.timeAgo(topStory.publishedAt)}</span>
            <span class="dot"></span>
            <span>${Math.ceil((NKData.localText(topStory.body) || '').length / 200)} ${NKData.t('min_read')}</span>
          </div>
        </div>
      `;
    }

    // Sidebar
    const sidebarHTML = `
      <div class="sidebar-label">${NKData.t('featured_stories')}</div>
      ${featured.map(a => {
        const cat = NKData.getCategoryInfo(a.category);
        const colorClass = NKData.getCatColorClass(a.category);
        const thumb = a.images && a.images[0] ? `<img src="${a.images[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />` : `<div style="background:var(--surface2);width:100%;height:100%;border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--ink3);font-size:10px;">img</div>`;
        return `
          <article class="featured-card">
            <div class="featured-thumb">${thumb}</div>
            <div class="featured-info">
              <span class="cat-tag ${colorClass}">${NKData.t(a.category)}</span>
              <h3 class="featured-title"><a href="article.html?id=${a.id}" style="color:inherit; text-decoration:none;">${NKData.localText(a.title)}</a></h3>
              <span class="featured-time">${NKData.timeAgo(a.publishedAt)}</span>
            </div>
          </article>
        `;
      }).join('')}
      <div class="ad-slot">📢 ${NKData.t('ad_sidebar')}<div class="ad-slot-label">${NKData.t('ad_auto')}</div></div>
    `;
    heroSidebar.innerHTML = sidebarHTML;
  }

  // ── CATEGORY SECTIONS ──
  function renderCategorySections() {
    const container = document.getElementById('categorySections');
    if (!container) return;

    const cats = ['politics', 'business', 'technology', 'sports', 'world', 'culture'];
    
    container.innerHTML = cats.map(catId => {
      const catInfo = NKData.getCategoryInfo(catId);
      const articles = NKData.getArticlesByCategory(catId).slice(0, 4);
      if (articles.length === 0) return '';

      const catName = NKData.t(catId);
      const colorClass = NKData.getCatColorClass(catId);

      const cards = articles.map(a => {
        const typeMap = { video: 'content-type-badge--video', photo_story: 'content-type-badge--photo', live: 'content-type-badge--live', opinion: 'content-type-badge--opinion' };
        const typeEmoji = { video: '▶️ Video', photo_story: '📸 Photo Story', live: '🔴 Live', opinion: '✍️ Opinion' };
        
        let badge = `<span class="cat-tag ${colorClass}" style="font-size:9px; padding:2px 6px;">${catName}</span>`;
        if (typeMap[a.contentType]) {
          badge = `<span class="content-type-badge ${typeMap[a.contentType]}">${typeEmoji[a.contentType]}</span>`;
        }

        const thumb = a.images && a.images[0] ? `<img src="${a.images[0]}" style="width:100%;height:100%;object-fit:cover;" />` : `<div class="hero-image-placeholder" style="height:100%; font-size:11px;">${catInfo.en} · Image</div>`;

        return `
          <article class="news-card">
            <div class="news-card-image">${thumb}</div>
            <div class="news-card-body">
              ${badge}
              <h3 class="news-card-title"><a href="article.html?id=${a.id}" style="color:inherit; text-decoration:none;">${NKData.localText(a.title)}</a></h3>
              <p class="news-card-excerpt">${NKData.localText(a.excerpt)}</p>
              <div class="news-card-meta">
                <span>${NKData.timeAgo(a.publishedAt)}</span>
                <span>${(a.views||0).toLocaleString()} ${NKData.t('views')}</span>
              </div>
            </div>
          </article>
        `;
      }).join('');

      return `
        <section id="${catId}">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title"><span class="accent"></span>${catName}</h2>
              <a href="category.html?cat=${catId}" class="section-more">${NKData.t('view_all')}</a>
            </div>
            <div class="news-grid">${cards}</div>
          </div>
        </section>
      `;
    }).join('');
  }

  // ── DEEP ANALYSIS ──
  function renderAnalysis() {
    const container = document.getElementById('analysisBlock');
    if (!container) return;

    const analysis = NKData.getArticles().find(a => a.isAnalysis);
    if (!analysis) {
      container.innerHTML = '<p style="color:var(--ink3);">No in-depth analysis available.</p>';
      return;
    }
    
    const bgImage = analysis.images && analysis.images[0] ? `style="background-image: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('${analysis.images[0]}'); background-size:cover; background-position:center;"` : '';

    container.innerHTML = `
      <article class="deep-analysis" ${bgImage}>
        <div class="analysis-header">
          <span class="analysis-tag">IN-DEPTH</span>
          <span class="analysis-meta-info">${Math.ceil((NKData.localText(analysis.body)||'').length/200)} ${NKData.t('min_read')} · Updated ${NKData.timeAgo(analysis.publishedAt)}</span>
        </div>
        <h3 class="analysis-title"><a href="article.html?id=${analysis.id}" style="color:inherit; text-decoration:none;">${NKData.localText(analysis.title)}</a></h3>
        <p class="analysis-desc">${NKData.localText(analysis.excerpt)}</p>
        <div class="analysis-counters">
          <div class="counter-box"><span class="counter-num">${analysis.sources||0}</span><span class="counter-label">Primary Sources</span></div>
          <div class="counter-box"><span class="counter-num">${analysis.govDocs||0}</span><span class="counter-label">Govt Documents</span></div>
          <div class="counter-box"><span class="counter-num">${analysis.expertQuotes||0}</span><span class="counter-label">Expert Quotes</span></div>
        </div>
        ${analysis.tags ? `<div class="analysis-tags">${analysis.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
      </article>
    `;
  }

  // ── TRENDING ──
  function renderTrending() {
    const list = document.getElementById('trendingList');
    if (!list) return;

    const top = NKData.getArticles().sort((a, b) => (b.views||0) - (a.views||0)).slice(0, 8);
    list.innerHTML = top.map((a, i) => `
      <div class="trending-item">
        <span class="trending-num">${String(i+1).padStart(2,'0')}</span>
        <div>
          <div class="trending-title"><a href="article.html?id=${a.id}" style="color:inherit; text-decoration:none;">${NKData.localText(a.title)}</a></div>
          <div class="trending-time">${NKData.timeAgo(a.publishedAt)}</div>
        </div>
      </div>
    `).join('');
  }

  // ── VIDEOS ──
  function renderVideos() {
    const container = document.getElementById('videoGrid');
    if (!container) return;

    const videos = NKData.getArticles().filter(a => a.contentType === 'video' || a.contentType === 'live');
    
    if (videos.length === 0) {
      // Show placeholder videos
      container.innerHTML = [1,2,3,4].map(i => `
        <article class="video-card">
          <div class="video-thumb">
            <div class="hero-image-placeholder" style="height:100%; font-size:11px; background:linear-gradient(135deg,#1a1714,#2a2520); color:rgba(250,248,244,0.4);">Video ${i}</div>
            <div class="video-duration">${10+i}:${20+i}</div>
            <div class="video-play-btn">▶</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">Video content coming soon</h3>
            <div class="video-meta">—</div>
          </div>
        </article>
      `).join('');
      return;
    }

    container.innerHTML = videos.slice(0, 4).map(a => {
      const isLive = a.contentType === 'live';
      const thumb = a.images && a.images[0] ? `<img src="${a.images[0]}" style="width:100%;height:100%;object-fit:cover;" />` : `<div class="hero-image-placeholder" style="height:100%; font-size:11px; background:linear-gradient(135deg,#1a1714,#2a2520); color:rgba(250,248,244,0.4);">Video</div>`;
      return `
        <article class="video-card">
          <div class="video-thumb">
            ${thumb}
            ${isLive ? '<div class="video-live-badge"><span class="live-dot"></span> LIVE</div>' : '<div class="video-duration">12:34</div>'}
            <div class="video-play-btn">▶</div>
          </div>
          <div class="video-info">
            <h3 class="video-title"><a href="article.html?id=${a.id}" style="color:inherit; text-decoration:none;">${NKData.localText(a.title)}</a></h3>
            <div class="video-meta">${isLive ? '🔴 LIVE · ' + (a.views||0).toLocaleString() + ' ' + NKData.t('watching') : (a.views||0).toLocaleString() + ' ' + NKData.t('views') + ' · ' + NKData.timeAgo(a.publishedAt)}</div>
          </div>
        </article>
      `;
    }).join('');
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
        if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; observer.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Observe after render
    setTimeout(() => {
      document.querySelectorAll('.news-card, .video-card, .featured-card, .deep-analysis').forEach(el => {
        el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        observer.observe(el);
      });
    }, 100);
  }

  // ═════════════════════════════════
  //  INITIAL RENDER
  // ═════════════════════════════════
  renderPage();

});
