require('dotenv').config();
const { XMLParser } = require('fast-xml-parser');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function translateText(text, tl) {
  if (!text || !text.trim() || tl === 'en') return text;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map(x => x[0]).join('');
  } catch (e) {
    return text; // fallback
  }
}

async function fetchCategoryFeeds() {
  console.log('Starting Multi-Source Global News sync...');
  const FEEDS = [
    { url: 'https://news.google.com/rss/search?q=Politics+India&hl=en-IN&gl=IN&ceid=IN:en', category: 'politics' },
    { url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en', category: 'business' },
    { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en', category: 'technology' },
    { url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en', category: 'sports' },
    { url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-IN&gl=IN&ceid=IN:en', category: 'world' },
    { url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-IN&gl=IN&ceid=IN:en', category: 'culture' },
    { url: 'https://news.google.com/rss/search?q=Uttar+Pradesh&hl=hi&gl=IN&ceid=IN:hi', category: 'uttar-pradesh' },
    { url: 'https://news.google.com/rss/search?q=Gorakhpur&hl=hi&gl=IN&ceid=IN:hi', category: 'gorakhpur' }
  ];

  for (const feed of FEEDS) {
    try {
      console.log(`Processing category: ${feed.category}`);
      const res = await fetch(feed.url);
      const xml = await res.text();
      const parser = new XMLParser({ ignoreAttributes: false, processEntities: false });
      const jsonObj = parser.parse(xml);
      
      const items = jsonObj.rss?.channel?.item;
      if (!items) continue;
      
      const topItems = Array.isArray(items) ? items.slice(0, 3) : [items];
      
      for (const item of topItems) {
        const publishedAt = new Date(item.pubDate || new Date()).getTime();
        
        let titleEn = item.title || '';
        titleEn = titleEn.split(' - ').slice(0, -1).join(' - ') || titleEn;
        
        let decodedDesc = (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
        let fullHtmlBodyEn = `<p>${decodedDesc}</p>`;
        let finalImageSrc = null;

        // --- FULL TEXT SCRAPING (JSDOM + Readability) ---
        try {
            // Decode Google News Base64 Redirects to bypass 403 Bot-Block
            let targetUrl = item.link;
            try {
              const b64 = item.link.split('/articles/')[1]?.split('?')[0];
              if (b64) {
                const decoded = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
                const match = decoded.match(/https?:\/\/[^\s\"\']+/);
                if (match) targetUrl = match[0].replace(/[\x00-\x1F\x7F]/g, '');
              }
            } catch (e) {}

            console.log(`  -> Scraping full article: ${targetUrl}`);
            // Fetch source HTML with a fake user agent to bypass basic blocks
            const htmlRes = await fetch(targetUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const htmlText = await htmlRes.text();
            
            // JSDOM Parsing
            const doc = new JSDOM(htmlText, { url: item.link });
            const reader = new Readability(doc.window.document);
            const articleData = reader.parse();
            
            if (articleData && articleData.content) {
                // Use Readability's clean, reading-mode HTML
                fullHtmlBodyEn = articleData.content;
                // Excerpt can be taken directly from the parsed text content
                decodedDesc = (articleData.excerpt || articleData.textContent.substring(0, 160)).trim() + '...';
                
                // Get the best native image
                const ogImage = doc.window.document.querySelector('meta[property="og:image"]')?.content;
                finalImageSrc = ogImage || articleData.leadImageUrl;
            }
        } catch (scrapeErr) {
            console.log(`  -> Scrape failed, falling back to RSS excerpt:`, scrapeErr.message);
        }
        
        // Translate to top UI languages immediately
        const titleHi = await translateText(titleEn, 'hi');
        const titleBn = await translateText(titleEn, 'bn');
        const excerptEn = await translateText(decodedDesc, 'en');
        const excerptHi = await translateText(decodedDesc, 'hi');
        const excerptBn = await translateText(decodedDesc, 'bn');
        
        const rawGuid = (typeof item.guid === 'object' ? item.guid['#text'] : item.guid) || item.title;
        const id = 'art-' + Buffer.from(String(rawGuid)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
        
        let imgSrc = finalImageSrc;
        if (!imgSrc && item['media:content'] && item['media:content']['@_url']) {
            imgSrc = item['media:content']['@_url'];
        } else if (item.description) {
            const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) imgSrc = imgMatch[1];
        }

        if (!imgSrc) {
            const fallbacks = {
                'politics': 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80',
                'business': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
                'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
                'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
                'world': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80',
                'culture': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
                'uttar-pradesh': 'https://images.unsplash.com/photo-1564507592208-528f1e4ceac8?w=800&q=80',
                'gorakhpur': 'https://images.unsplash.com/photo-1506869640319-fea1a80d4bd3?w=800&q=80'
            };
            imgSrc = fallbacks[feed.category] || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
        }

        const article = {
          id,
          title: { en: await translateText(titleEn, 'en'), hi: titleHi, bn: titleBn },
          excerpt: { en: excerptEn, hi: excerptHi, bn: excerptBn },
          body: { en: `${fullHtmlBodyEn}<br><p style="font-size:11px;color:#888;">Source: ${new URL(item.link).hostname.replace('news.google.com', 'Google News')}</p>` },
          category: feed.category,
          author: 'Auto News Matrix',
          status: 'published',
          publishedAt,
          views: Math.floor(Math.random() * 500) + 50,
          contentType: 'article',
          images: [imgSrc],
          tags: ['Global Sync']
        };
        
        // Parse Google News images if available or use placeholder pattern later
        await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
          method: 'POST',
          headers: { 
            'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ id: article.id, data: article, published_at: new Date(article.publishedAt).toISOString() })
        });
        
        console.log(`Saved new article [${feed.category}]: ${id}`);
        await new Promise(r => setTimeout(r, 800)); // anti-rate limit delay
      }
    } catch (e) {
      console.error(`Feed Error ${feed.category}:`, e.message);
    }
  }
}

fetchCategoryFeeds();
