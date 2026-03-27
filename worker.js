require('dotenv').config();
const { XMLParser } = require('fast-xml-parser');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function translateText(text, tl) {
  if (!text || !text.trim()) return text;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map(x => x[0]).join('');
  } catch (e) {
    return text; // fallback
  }
}

async function translateHTML(html, tl) {
    if (!html) return html;
    try {
        const dom = new JSDOM(html);
        const { document } = dom.window;
        const textNodes = [];
        const walk = (node) => {
            if (node.nodeType === 3 && node.nodeValue.trim()) textNodes.push(node);
            for (let child of node.childNodes) walk(child);
        };
        walk(document.body);
        
        // Translate in chunks of 5 to avoid rate limits
        for (let i = 0; i < textNodes.length; i += 5) {
            const chunk = textNodes.slice(i, i + 5);
            await Promise.all(chunk.map(async (n) => {
                n.nodeValue = await translateText(n.nodeValue, tl);
            }));
        }
        return document.body.innerHTML;
    } catch (e) {
        return html;
    }
}

async function fetchCategoryFeeds() {
  console.log('Starting Multi-Source Global News sync...');
  const FEEDS = [
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', category: 'politics' },
    { url: 'https://www.moneycontrol.com/rss/latestnews.xml', category: 'business' },
    { url: 'https://www.gadgets360.com/rss/news', category: 'technology' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', category: 'sports' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
    { url: 'https://feeds.feedburner.com/ndtvnews-trending-news', category: 'culture' },
    { url: 'https://api.livehindustan.com/feeds/rss/uttar-pradesh/rssfeed.xml', category: 'uttar-pradesh' },
    { url: 'https://api.livehindustan.com/feeds/rss/uttar-pradesh/gorakhpur/rssfeed.xml', category: 'gorakhpur' },
    { url: 'https://indianexpress.com/section/opinion/feed/', category: 'opinion' }
  ];

  for (const feed of FEEDS) {
    try {
      console.log(`Processing category: ${feed.category}`);
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${feed.url}`);
      const xml = await res.text();
      const parser = new XMLParser({ ignoreAttributes: false, processEntities: false });
      const jsonObj = parser.parse(xml);
      
      const items = jsonObj.rss?.channel?.item;
      if (!items) continue;
      
      const topItems = Array.isArray(items) ? items.slice(0, 3) : [items];
      
      for (const item of topItems) {
        const publishedAt = new Date(item.pubDate || new Date()).getTime();
        
        let rawTitle = item.title || '';
        // NDTV/TOI often append " - NDTV.com" to titles. Clean that up.
        rawTitle = rawTitle.split(' - ').slice(0, -1).join(' - ') || rawTitle;
        
        // Translate to English first as our base if source is different
        const titleEn = await translateText(rawTitle, 'en');
        
        let decodedDesc = (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
        let fullHtmlBodyEn = `<p>${decodedDesc}</p>`;
        let finalImageSrc = null;

        // --- FULL TEXT SCRAPING (JSDOM + Readability) ---
        try {
            const targetUrl = item.link;
            console.log(`  -> Scraping: ${targetUrl}`);
            
            const htmlRes = await fetch(targetUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });
            const htmlText = await htmlRes.text();
            
            const doc = new JSDOM(htmlText, { url: targetUrl });
            const reader = new Readability(doc.window.document);
            const articleData = reader.parse();
            
            if (articleData && articleData.content) {
                fullHtmlBodyEn = articleData.content;
                decodedDesc = (articleData.excerpt || articleData.textContent.substring(0, 160)).trim() + '...';
                
                // Better Image Extraction (OG Image > Lead Image > First article image)
                const ogImage = doc.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');
                finalImageSrc = ogImage || articleData.leadImageUrl;
            }
        } catch (scrapeErr) {
            console.log(`  -> Scrape failed:`, scrapeErr.message);
        }
        
        // Translate to UI languages
        const titleHi = await translateText(titleEn, 'hi');
        const titleBn = await translateText(titleEn, 'bn');
        const excerptEn = await translateText(decodedDesc, 'en');
        const excerptHi = await translateText(decodedDesc, 'hi');
        const excerptBn = await translateText(decodedDesc, 'bn');
        
        const rawGuid = (typeof item.guid === 'object' ? item.guid['#text'] : item.guid) || item.link || item.title;
        const b64 = Buffer.from(String(rawGuid)).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
        const id = 'art-' + (b64.substring(0, 15) + b64.substring(b64.length - 15));
        
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

        const rawBody = `${fullHtmlBodyEn}<br><p style="font-size:11px;color:#888;">Source: ${new URL(item.link).hostname.replace('news.google.com', 'Google News')}</p>`;
        const bodyEn = await translateHTML(rawBody, 'en');
        const bodyHi = await translateHTML(rawBody, 'hi');

        const article = {
          id,
          title: { en: await translateText(titleEn, 'en'), hi: titleHi, bn: titleBn },
          excerpt: { en: excerptEn, hi: excerptHi, bn: excerptBn },
          body: { en: bodyEn, hi: bodyHi },
          category: feed.category,
          author: 'Auto News Matrix',
          status: 'published',
          publishedAt,
          views: Math.floor(Math.random() * 500) + 50,
          contentType: 'article',
          images: [imgSrc],
          tags: ['Global Sync']
        };
        
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
