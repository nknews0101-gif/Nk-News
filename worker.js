require('dotenv').config();
const { XMLParser } = require('fast-xml-parser');

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
        // Google News sometimes throws the source at the end like " - Times of India"
        titleEn = titleEn.split(' - ').slice(0, -1).join(' - ') || titleEn;
        
        const decodedDesc = (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
        
        // Translate to top UI languages immediately
        const titleHi = await translateText(titleEn, 'hi');
        const titleBn = await translateText(titleEn, 'bn');
        const excerptEn = await translateText(decodedDesc, 'en');
        const excerptHi = await translateText(decodedDesc, 'hi');
        const excerptBn = await translateText(decodedDesc, 'bn');
        
        const rawGuid = (typeof item.guid === 'object' ? item.guid['#text'] : item.guid) || item.title;
        const id = 'art-' + Buffer.from(String(rawGuid)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
        
        const article = {
          id,
          title: { en: await translateText(titleEn, 'en'), hi: titleHi, bn: titleBn },
          excerpt: { en: excerptEn, hi: excerptHi, bn: excerptBn },
          body: { en: `<p>${excerptEn}</p><br><p><strong>Source / <i>स्रोत</i></strong>: <a href="${item.link}" target="_blank" style="color:red; font-weight:600;">Read Full Report ↗</a></p>` },
          category: feed.category,
          author: 'Auto News Matrix',
          status: 'published',
          publishedAt,
          views: Math.floor(Math.random() * 500) + 50,
          contentType: 'article',
          images: [],
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
