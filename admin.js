/* ═══════════════════════════════════════
   NK NEWS — Admin Panel Logic
   ═══════════════════════════════════════ */

// ── TOAST NOTIFICATION ──
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── LOGIN ──
const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const adminLayout = document.getElementById('adminLayout');

// Check if already logged in
if (localStorage.getItem('nk_admin_logged')) {
  loginScreen.style.display = 'none';
  adminLayout.style.display = 'flex';
  loadDashboard();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;
  if (email === 'admin@nknews.in' && pass === 'admin123') {
    localStorage.setItem('nk_admin_logged', 'true');
    loginScreen.style.display = 'none';
    adminLayout.style.display = 'flex';
    showToast('Welcome to NK News Admin!');
    loadDashboard();
  } else {
    showToast('Invalid credentials!', 'error');
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('nk_admin_logged');
  loginScreen.style.display = 'flex';
  adminLayout.style.display = 'none';
});

// ── TAB SWITCHING ──
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const tabContents = document.querySelectorAll('.tab-content');

function switchTab(tabName) {
  sidebarLinks.forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeLink) activeLink.classList.add('active');

  tabContents.forEach(t => t.classList.remove('active'));
  const tabEl = document.getElementById(`tab-${tabName}`);
  if (tabEl) tabEl.classList.add('active');

  const titles = { dashboard: 'Dashboard', articles: 'All Articles', create: 'Create Article', breaking: 'Breaking News' };
  document.getElementById('pageTitle').textContent = titles[tabName] || tabName;

  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'articles') loadArticlesTable();
  if (tabName === 'breaking') loadBreakingList();
}

sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(link.dataset.tab);
  });
});

// ── DASHBOARD ──
function loadDashboard() {
  NKData.init();
  const all = NKData.getAllArticles();
  const published = all.filter(a => a.status === 'published');
  const breaking = all.filter(a => a.priority === 'breaking');
  const totalViews = all.reduce((s, a) => s + (a.views || 0), 0);

  document.getElementById('statTotal').textContent = all.length;
  document.getElementById('statPublished').textContent = published.length;
  document.getElementById('statBreaking').textContent = breaking.length;
  document.getElementById('statViews').textContent = totalViews > 1000 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews;

  // Recent articles
  const recent = all.slice(0, 8);
  const container = document.getElementById('recentArticles');
  container.innerHTML = recent.map(a => {
    const cat = NKData.getCategoryInfo(a.category);
    const colorMap = { red: 'badge-red', gold: 'badge-gold', teal: 'badge-teal', blue: 'badge-blue', purple: 'badge-purple' };
    const badge = colorMap[cat.color] || 'badge-gray';
    return `
      <div class="mini-article">
        <span class="mini-cat badge ${badge}">${cat.en}</span>
        <span class="mini-title">${typeof a.title === 'object' ? a.title.en : a.title}</span>
        <span class="mini-views">${(a.views || 0).toLocaleString()} views</span>
        <span class="mini-time">${NKData.timeAgo(a.publishedAt)}</span>
      </div>
    `;
  }).join('');
}

// ── ARTICLES TABLE ──
function loadArticlesTable() {
  const all = NKData.getAllArticles();
  const tbody = document.getElementById('articlesTable');

  tbody.innerHTML = all.map(a => {
    const cat = NKData.getCategoryInfo(a.category);
    const colorMap = { red: 'badge-red', gold: 'badge-gold', teal: 'badge-teal', blue: 'badge-blue', purple: 'badge-purple' };
    const catBadge = colorMap[cat.color] || 'badge-gray';

    const priorityMap = { breaking: 'badge-red', top_story: 'badge-gold', featured: 'badge-blue', normal: 'badge-gray' };
    const priLabel = { breaking: 'Breaking', top_story: 'Top Story', featured: 'Featured', normal: 'Normal' };
    const typeEmoji = { article: '📄', video: '▶️', photo_story: '📸', live: '🔴', opinion: '✍️' };
    const statusBadge = a.status === 'published' ? 'badge-green' : 'badge-gray';

    const title = typeof a.title === 'object' ? a.title.en : a.title;
    const date = new Date(a.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return `
      <tr>
        <td class="title-cell"><a href="#" onclick="editArticle('${a.id}'); return false;">${title}</a></td>
        <td><span class="badge ${catBadge}">${cat.en}</span></td>
        <td><span class="badge ${priorityMap[a.priority] || 'badge-gray'}">${priLabel[a.priority] || a.priority}</span></td>
        <td>${typeEmoji[a.contentType] || '📄'} ${a.contentType}</td>
        <td><span class="badge ${statusBadge}">${a.status}</span></td>
        <td>${(a.views || 0).toLocaleString()}</td>
        <td style="white-space:nowrap; font-size:12px;">${date}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-sm btn-secondary" onclick="editArticle('${a.id}')">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteArticle('${a.id}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── CREATE / EDIT ARTICLE ──

function submitArticleForm() {
  const form = document.getElementById('articleForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('articleId').value;
  const article = {
    id: id || ('art-' + Date.now()),
    title: {
      en: document.getElementById('titleEn').value,
      hi: document.getElementById('titleHi').value || document.getElementById('titleEn').value
    },
    excerpt: {
      en: document.getElementById('excerptEn').value,
      hi: document.getElementById('excerptHi').value || document.getElementById('excerptEn').value
    },
    body: {
      en: document.getElementById('bodyEn').innerHTML,
      hi: document.getElementById('bodyHi').value || (document.getElementById('bodyEn').textContent ? document.getElementById('bodyEn').innerHTML : '')
    },
    images: [...uploadedImageSrcs],
    category: document.getElementById('articleCategory').value,
    priority: document.getElementById('articlePriority').value,
    contentType: document.getElementById('articleType').value,
    status: document.getElementById('articleStatus').value,
    author: document.getElementById('articleAuthor').value || 'Admin',
    tags: document.getElementById('articleTags').value.split(',').map(t => t.trim()).filter(Boolean),
    publishedAt: id ? (NKData.getArticleById(id)?.publishedAt || new Date().toISOString()) : new Date().toISOString(),
    views: id ? (NKData.getArticleById(id)?.views || 0) : 0
  };

  NKData.saveArticle(article);
  showToast(id ? 'Story published successfully!' : 'Story published successfully!');
  resetForm();
  switchTab('articles');
}

function editArticle(id) {
  const a = NKData.getArticleById(id);
  if (!a) return;

  document.getElementById('formTitle').textContent = 'Edit Story';
  document.getElementById('articleId').value = a.id;
  document.getElementById('titleEn').value = typeof a.title === 'object' ? a.title.en : a.title;
  document.getElementById('titleHi').value = typeof a.title === 'object' ? (a.title.hi || '') : '';
  document.getElementById('excerptEn').value = typeof a.excerpt === 'object' ? a.excerpt.en : (a.excerpt || '');
  document.getElementById('excerptHi').value = typeof a.excerpt === 'object' ? (a.excerpt.hi || '') : '';
  
  // rich text box
  document.getElementById('bodyEn').innerHTML = typeof a.body === 'object' ? a.body.en : (a.body || '');
  document.getElementById('bodyHi').value = typeof a.body === 'object' ? (a.body.hi || '') : '';
  
  document.getElementById('articleCategory').value = a.category;
  document.getElementById('articlePriority').value = a.priority;
  document.getElementById('articleType').value = a.contentType;
  document.getElementById('articleStatus').value = a.status;
  document.getElementById('articleAuthor').value = a.author || '';
  document.getElementById('articleTags').value = (a.tags || []).join(', ');

  // load image if exists
  if (a.images && a.images.length > 0) {
    uploadedImageSrcs = [...a.images];
  } else if (a.image) {
    // support legacy format
    uploadedImageSrcs = [a.image];
  } else {
    uploadedImageSrcs = [];
  }
  renderMediaGallery();

  switchTab('create');
  document.getElementById('pageTitle').textContent = 'Edit Story';
}

function deleteArticle(id) {
  const a = NKData.getArticleById(id);
  const title = typeof a?.title === 'object' ? a.title.en : a?.title;
  if (confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) {
    NKData.deleteArticle(id);
    showToast('Article deleted!', 'error');
    loadArticlesTable();
    loadDashboard();
  }
}

function resetForm() {
  document.getElementById('formTitle').textContent = 'Write New Story';
  document.getElementById('articleForm').reset();
  document.getElementById('articleId').value = '';
  document.getElementById('bodyEn').innerHTML = '';
  document.getElementById('translateStatus').textContent = '';
  uploadedImageSrcs = [];
  renderMediaGallery();
}

// ── WYSIWYG EDITOR ──
function formatText(command, value = null) {
  document.execCommand(command, false, value);
  document.getElementById('bodyEn').focus();
}

function addLink() {
  const url = prompt('Enter the link URL (e.g., https://example.com):');
  if (url) {
    formatText('createLink', url);
  }
}

// ── MEDIA UPLOAD SIMULATOR ──
let uploadedImageSrcs = [];

function handleImageUpload(input) {
  if (input.files) {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        uploadedImageSrcs.push(e.target.result);
        renderMediaGallery();
        showToast('Image attached!');
      }
      reader.readAsDataURL(file);
    });
  }
}

function removeImageIndex(idx) {
  uploadedImageSrcs.splice(idx, 1);
  renderMediaGallery();
}

function renderMediaGallery() {
  const container = document.getElementById('mediaGallery');
  const uploadText = document.querySelector('#uploadContent .upload-text');
  
  if (uploadedImageSrcs.length > 0) {
    if(uploadText) uploadText.textContent = "Upload more images";
  } else {
    if(uploadText) uploadText.textContent = "Drag & drop featured images, or click to browse";
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  }

  if (container) {
    container.innerHTML = uploadedImageSrcs.map((src, idx) => `
      <div class="media-gallery-item">
        <img src="${src}" alt="Preview">
        <button type="button" class="remove-btn" onclick="event.stopPropagation(); removeImageIndex(${idx});">✕</button>
      </div>
    `).join('');
  }
}

// ── AUTO TRANSLATE (Real, Bi-Directional) ──
async function runMagicTranslation() {
  const status = document.getElementById('translateStatus');
  let pTitle = document.getElementById('titleEn').value;
  let pExcerpt = document.getElementById('excerptEn').value;
  let pBody = document.getElementById('bodyEn').innerHTML;

  if (!pTitle && !pBody) {
    showToast('Enter some content first!', 'error');
    return;
  }

  status.textContent = '⏳ Translating...';
  
  const btn = document.getElementById('autoTranslateBtn');
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  function isHindi(text) {
    if (!text) return false;
    const chars = text.match(/[\u0900-\u097F]/g);
    return chars && chars.length > 5;
  }

  try {
    // Process Title
    if (pTitle) {
      if (isHindi(pTitle)) {
        document.getElementById('titleHi').value = pTitle;
        document.getElementById('titleEn').value = await NKData.translateText(pTitle, 'en');
      } else {
        if (!document.getElementById('titleHi').value) {
          document.getElementById('titleHi').value = await NKData.translateText(pTitle, 'hi');
        }
      }
    }
    
    // Process Excerpt
    if (pExcerpt) {
      if (isHindi(pExcerpt)) {
        document.getElementById('excerptHi').value = pExcerpt;
        document.getElementById('excerptEn').value = await NKData.translateText(pExcerpt, 'en');
      } else {
        if (!document.getElementById('excerptHi').value) {
          document.getElementById('excerptHi').value = await NKData.translateText(pExcerpt, 'hi');
        }
      }
    }
    
    // Process Body
    if (pBody) {
      const plainText = document.createElement('div');
      plainText.innerHTML = pBody;
      if (isHindi(plainText.textContent)) {
        document.getElementById('bodyHi').value = pBody;
        document.getElementById('bodyEn').innerHTML = await NKData.translateHTML(pBody, 'en');
      } else {
        if (!document.getElementById('bodyHi').value) {
          document.getElementById('bodyHi').value = await NKData.translateHTML(pBody, 'hi');
        }
      }
    }
    
    status.textContent = '✅ Success!';
    showToast('Auto-translation complete!');
  } catch (e) {
    console.error(e);
    status.textContent = '❌ Failed';
    showToast('Translation failed', 'error');
  }

  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
  setTimeout(() => { if(status.textContent === '✅ Success!') status.textContent = ''; }, 3000);
}

// ── BREAKING NEWS LIST ──
function loadBreakingList() {
  const articles = NKData.getArticlesByPriority('breaking');
  const container = document.getElementById('breakingList');

  if (articles.length === 0) {
    container.innerHTML = '<p style="color:var(--ink3); padding:20px 0;">No breaking news articles. Set an article\'s priority to "Breaking" to add it here.</p>';
    return;
  }

  container.innerHTML = articles.map(a => {
    const title = typeof a.title === 'object' ? a.title.en : a.title;
    return `
      <div class="breaking-item">
        <span class="dot"></span>
        <span class="text">${title}</span>
        <span class="remove" onclick="removeBreaking('${a.id}')">Make Normal ✕</span>
      </div>
    `;
  }).join('');
}

function removeBreaking(id) {
  const article = NKData.getArticleById(id);
  if (article) {
    article.priority = 'normal';
    NKData.saveArticle(article);
    showToast('Removed from breaking!');
    loadBreakingList();
  }
}
