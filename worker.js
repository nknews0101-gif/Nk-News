require('dotenv').config();
const { XMLParser } = require('fast-xml-parser');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Using standard fetch available in Node.js >= 18
async function fetchNDTVFeed() {
  try {
    const res = await fetch('https://feeds.feedburner.com/ndtvnews-india-news');
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xml);
    return jsonObj.rss.channel.item || [];
  } catch (e) {
    console.error('RSS Fetch Error:', e);
    return [];
  }
}

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

async function translateHTML(html, tl) {
    if (!html || tl === 'en') return '';
    // Very naive HTML text translation regex-based for Node.js since there's no DOM.
    // Replace content inside tags safely for automation worker
    // A better approach in pure Node is to use jsdom, but we'll keep it zero-dependency
    return html; // Skip HTML body translation on backend for now to avoid broken HTML
}

async function syncNews() {
  console.log('Starting NDTV news sync...');
  const items = await fetchNDTVFeed();
  console.log(`Found ${items.length} items in RSS.`);
  if (!items.length) return;

  // Let's just sync the top 5 to avoid heavy API load in one automated burst
  for (const item of items.slice(0, 5)) {
    const pubDateStr = item.pubDate || new Date().toISOString();
    const publishedAt = new Date(pubDateStr).getTime();
    
    // Create unique ID based on link to prevent duplicates
    const rawId = item.link ? item.link.split('/').pop().replace(/[^a-zA-Z0-9]/g, '') : `ndtv-${Date.now()}`;
    const id = `art-${rawId.substring(0, 15)}`;

    let titleEn = item.title;
    let excerptEn = item.description || '';
    if (excerptEn.includes('</a>')) {
      excerptEn = excerptEn.replace(/<[^>]+>/g, '').trim(); 
    }
    
    // Auto-translate to top critical languages (Hindi, Bengali, Marathi) for the automated bot
    // The frontend will lazily translate the rest!
    const titleHi = await translateText(titleEn, 'hi');
    const titleBn = await translateText(titleEn, 'bn');
    
    const excerptHi = await translateText(excerptEn, 'hi');
    const excerptBn = await translateText(excerptEn, 'bn');

    const article = {
      id,
      title: { en: titleEn, hi: titleHi, bn: titleBn },
      excerpt: { en: excerptEn, hi: excerptHi, bn: excerptBn },
      body: { en: `<p>${excerptEn}</p><p>Read more at: <a href="${item.link}" target="_blank">${item.link}</a></p>` },
      category: 'politics', // fallback
      author: 'NDTV (Auto)',
      status: 'published',
      publishedAt,
      views: 0,
      contentType: 'article',
      images: [],
      tags: ['Live News']
    };

    // Make Image Array
    let imgSrc = null;
    if (item['media:content'] && item['media:content']['@_url']) {
        imgSrc = item['media:content']['@_url'];
    } else if (item['StoryImage']) {
        imgSrc = item['StoryImage'];
    }
    if (imgSrc) article.images.push(imgSrc);

    // Save to Supabase using REST
    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
            method: 'POST',
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                id: article.id,
                data: article,
                published_at: new Date(article.publishedAt).toISOString()
            })
        });
        if (!resp.ok) {
            console.error('Failed to save to Supabase:', await resp.text());
        } else {
            console.log(`Saved new article: ${id}`);
        }
    } catch(err) {
        console.error('Supabase upload error:', err);
    }
  }
  console.log('Automated Sync Complete!');
}

syncNews();
