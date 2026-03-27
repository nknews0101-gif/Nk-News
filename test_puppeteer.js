const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate to local live server index page to initialize data
  await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle0' });
  
  // Set admin logged in state
  await page.evaluate(() => {
    localStorage.setItem('nk_admin_logged', 'true');
  });
  
  // Go to admin
  await page.goto('http://127.0.0.1:8080/admin.html', { waitUntil: 'networkidle0' });
  
  // Switch to create tab
  await page.evaluate(() => switchTab('create'));
  
  // Fill the title and body
  await page.type('#titleEn', 'My Test Article Title');
  
  await page.evaluate(() => {
    document.getElementById('bodyEn').innerHTML = '<p>This is the full article body that I expect to be visible.</p>';
  });
  
  // Publish
  await page.click('button[onclick="submitArticleForm()"]');
  
  // Get articles
  await page.waitForTimeout(500); // wait for save
  const articles = await page.evaluate(() => JSON.parse(localStorage.getItem('nk_articles')));
  const lastArticle = articles[articles.length - 1];
  
  console.log('Saved Article Body:', JSON.stringify(lastArticle.body, null, 2));
  
  await browser.close();
})();
