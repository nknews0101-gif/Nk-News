/* ═══════════════════════════════════════════════════════════════
   NK NEWS — Shared Data Layer
   Sample articles, translations, localStorage helpers
   ═══════════════════════════════════════════════════════════════ */

// ── GLOBAL CLOUD DATABASE CREDENTIALS (SUPABASE) ──
const SUPABASE_URL = 'https://kjuqbuycagemxzinwntn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdXFidXljYWdlbXh6aW53bnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTUwMTksImV4cCI6MjA5MDE3MTAxOX0.B2KRbUFgMUTZ4fBw1niTS_RvPK10MNkLdioHnLwikzM';

// ── UI TRANSLATIONS (All 22 Languages) ──
const TRANSLATIONS = {
  en: { 
    politics: 'Politics', business: 'Business', technology: 'Technology', sports: 'Sports', world: 'World', culture: 'Culture', opinion: 'Opinion', videos: 'Videos',
    featured_stories: 'Featured Stories', top_story: 'Top Story', in_depth: 'In-Depth Analysis', most_read: 'Most Read', video_gallery: 'Video Gallery', view_all: 'View All →',
    by: 'By', min_read: 'min read', hours_ago: 'h ago', mins_ago: 'm ago', days_ago: 'd ago', just_now: 'Just now', breaking: 'BREAKING',
    newsletter_title: 'Stay Informed. Stay Ahead.', newsletter_desc: 'Get NK News delivered to your inbox — breaking headlines, deep analysis, and exclusive stories.', subscribe: 'Subscribe', your_email: 'Your email address',
    categories: 'Categories', company: 'Company', legal: 'Legal', about: 'About NK News', careers: 'Careers', ethics: 'Ethics Policy', advertise: 'Advertise With Us', contact: 'Contact', rss: 'RSS Feeds',
    privacy: 'Privacy Policy', terms: 'Terms of Service', cookie_policy: 'Cookie Policy', grievance: 'Grievance Redressal', takedown: 'Content Takedown', dpdp: 'DPDP Act Compliance',
    mib_title: 'MIB Publisher Disclosure — IT Rules 2021', avail_languages: 'Available in 22 Languages',
    cookie_msg: "NK News uses cookies for essential functionality and analytics. We comply with India's Digital Personal Data Protection Act (DPDP) 2023.", cookie_privacy: 'Read our Privacy Policy', accept_all: 'Accept All', decline: 'Decline',
    search_placeholder: 'Search NK News...', admin_panel: 'Admin Panel', article: 'Article', video: 'Video', photo_story: 'Photo Story', live: 'Live', opinion_type: 'Opinion', views: 'views', watching: 'watching', live_now: 'LIVE NOW',
    ad_sidebar: 'Ad Slot — Sidebar 300×250', ad_auto: 'Auto-injected from Ad Manager'
  },
  hi: { 
    politics: 'राजनीति', business: 'व्यापार', technology: 'तकनीक', sports: 'खेल', world: 'विश्व', culture: 'संस्कृति', opinion: 'विचार', videos: 'वीडियो',
    featured_stories: 'प्रमुख ख़बरें', top_story: 'मुख्य ख़बर', in_depth: 'गहन विश्लेषण', most_read: 'सबसे ज़्यादा पढ़ी गई', video_gallery: 'वीडियो गैलरी', view_all: 'सभी देखें →',
    by: 'लेखक', min_read: 'मिनट पठन', hours_ago: 'घंटे पहले', mins_ago: 'मिनट पहले', days_ago: 'दिन पहले', just_now: 'अभी', breaking: 'ब्रेकिंग',
    newsletter_title: 'सूचित रहें। आगे रहें।', newsletter_desc: 'NK News को अपने इनबॉक्स में पाएं — ब्रेकिंग हेडलाइंस, गहन विश्लेषण, और विशेष ख़बरें।', subscribe: 'सदस्यता लें', your_email: 'आपका ईमेल पता',
    categories: 'श्रेणियाँ', company: 'कंपनी', legal: 'कानूनी', about: 'NK News के बारे में', careers: 'करिअर', ethics: 'नैतिकता नीति', advertise: 'हमारे साथ विज्ञापन दें', contact: 'संपर्क', rss: 'RSS फ़ीड',
    privacy: 'गोपनीयता नीति', terms: 'सेवा की शर्तें', cookie_policy: 'कुकी नीति', grievance: 'शिकायत निवारण', takedown: 'कंटेंट हटाना', dpdp: 'DPDP अनुपालन',
    mib_title: 'MIB प्रकटीकरण — IT नियम 2021', avail_languages: '22 भाषाओं में उपलब्ध',
    cookie_msg: 'NK News कुकीज़ का उपयोग करता है। हम DPDP अधिनियम 2023 का पालन करते हैं।', cookie_privacy: 'गोपनीयता नीति पढ़ें', accept_all: 'सभी स्वीकार करें', decline: 'अस्वीकार',
    search_placeholder: 'खोजें...', admin_panel: 'एडमिन', article: 'लेख', video: 'वीडियो', photo_story: 'फ़ोटो', live: 'लाइव', opinion_type: 'विचार', views: 'व्यूज', watching: 'देख रहे हैं', live_now: 'लाइव',
    ad_sidebar: 'विज्ञापन', ad_auto: 'ऑटो-इंजेक्ट'
  },
  mr: { politics: 'राजकारण', business: 'व्यापार', technology: 'तंत्रज्ञान', sports: 'क्रीडा', world: 'जग', culture: 'संस्कृती', opinion: 'मत', videos: 'व्हिडिओ', featured_stories: 'प्रमुख बातम्या', top_story: 'मुख्य बातमी', in_depth: 'सखोल विश्लेषण', most_read: 'सर्वाधिक वाचलेले', breaking: 'ब्रेकिंग', by: 'लेखक', min_read: 'मिनिटांचे वाचन', views: 'दृश्ये', just_now: 'आत्ताच', subscribe: 'सबस्क्राईब करा' },
  sa: { politics: 'राजनीतिः', business: 'वाणिज्यम्', technology: 'तन्त्रज्ञानम्', sports: 'क्रीडा', world: 'विश्वम्', culture: 'संस्कृतिः', opinion: 'मतम्', videos: 'चित्रगृहीतिः', featured_stories: 'प्रमुखवार्ताः', top_story: 'मुख्यवार्ता', in_depth: 'गहनविश्लेषणम्', most_read: 'अधिकं पठितम्', breaking: 'ब्रेकिंग', by: 'लेखकः', min_read: 'पठनसमयः', views: 'दृष्टयः', just_now: 'इदानीमेव', subscribe: 'सदस्यत्वम्' },
  ne: { politics: 'राजनीति', business: 'व्यापार', technology: 'प्रविधि', sports: 'खेलकुद', world: 'विश्व', culture: 'संस्कृति', opinion: 'विचार', videos: 'भिडियोहरू', featured_stories: 'प्रमुख खबरहरू', top_story: 'मुख्य खबर', in_depth: 'गहिरो विश्लेषण', most_read: 'सबैभन्दा बढी पढिएको', breaking: 'ब्रेकिंग', by: 'लेखक', min_read: 'मिनेट पढ्ने', views: 'भ्यू', just_now: 'भर्खरै', subscribe: 'सदस्यতা' },
  doi: { politics: 'सयासत', business: 'व्यापार', technology: 'तकनीक', sports: 'खेल', world: 'दुनिया', culture: 'संस्कृति', opinion: 'विचार', videos: 'वीडियो', featured_stories: 'प्रमुख खबरां', top_story: 'मुख्य खबर', breaking: 'ब्रेकिंग', by: 'लेखक', views: 'दृश्य', just_now: 'हुणें', subscribe: 'सदस्यता' },
  kok: { politics: 'राजकारण', business: 'वेपार', technology: 'तंत्रज्ञान', sports: 'खेळ', world: 'संवसार', culture: 'संस्कृताय', opinion: 'मत', videos: 'व्हिडिओ', featured_stories: 'मुखेल खबरो', top_story: 'मुखेल खबर', breaking: 'ब्रेकिंग', by: 'बरोवपी', views: 'दिशटी', just_now: 'आताच', subscribe: 'सदस्यता' },
  mai: { politics: 'राजनीति', business: 'व्यापार', technology: 'तकनीक', sports: 'खेल', world: 'विश्व', culture: 'संस्कृति', opinion: 'विचार', videos: 'वीडियो', breaking: 'ब्रेकिंग', top_story: 'मुख्य खबर', views: 'दृश्य', just_now: 'आबे', subscribe: 'सदस्यता' },
  ta: { politics: 'அரசியல்', business: 'வணிகம்', technology: 'தொழில்நுட்பம்', sports: 'விளையாட்டு', world: 'உலகம்', culture: 'கலாச்சாரம்', opinion: 'கருத்து', videos: 'வீடியோக்கள்', featured_stories: 'சிறப்பு செய்திகள்', top_story: 'தலைப்புச் செய்தி', in_depth: 'ஆழ்ந்த பகுப்பாய்வு', most_read: 'அதிகம் வாசிக்கப்பட்டவை', breaking: 'முக்கிய செய்தி', by: 'எழுதியவர்', min_read: 'நிமிட வாசிப்பு', views: 'பார்வைகள்', just_now: 'இப்போது', subscribe: 'சந்தாதாரராக' },
  te: { politics: 'రాజకీయం', business: 'వ్యాపారం', technology: 'సాంకేతికం', sports: 'క్రీడలు', world: 'ప్రపంచం', culture: 'సంస్కృతి', opinion: 'అభిప్రాయం', videos: 'వీడియోలు', featured_stories: 'ప్రధాన వార్తలు', top_story: 'ముఖ్యాంశం', in_depth: 'లోతైన విశ్లేషణ', most_read: 'ఎక్కువగా చదివినవి', breaking: 'బ్రేకింగ్', by: 'రచయిత', min_read: 'నిమిషాల పఠనం', views: 'వీక్షణలు', just_now: 'ఇప్పుడే', subscribe: 'సబ్‌స్క్రయిబ్' },
  kn: { politics: 'ರಾಜಕೀಯ', business: 'ವ್ಯಾಪಾರ', technology: 'ತಂತ್ರಜ್ಞಾನ', sports: 'ಕ್ರೀಡೆ', world: 'ವಿಶ್ವ', culture: 'ಸಂಸ್ಕೃತಿ', opinion: 'ಅಭಿಪ್ರಾಯ', videos: 'ವೀಡಿಯೊಗಳು', featured_stories: 'ಪ್ರಮುಖ ಸುದ್ದಿಗಳು', top_story: 'ಮುಖ್ಯ ಸುದ್ದಿ', in_depth: 'ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ', most_read: 'ಹೆಚ್ಚು ಓದಲಾದ', breaking: 'ಬ್ರೇಕಿಂಗ್', by: 'ಲೇಖಕರು', min_read: 'ನಿಮಿಷಗಳ ಓದು', views: 'ವೀಕ್ಷಣೆಗಳು', just_now: 'ಈಗಷ್ಟೇ', subscribe: 'ಚಂದಾದಾರರಾಗಿ' },
  ml: { politics: 'രാഷ്ട്രീയം', business: 'ബിസിനസ്സ്', technology: 'സാങ്കേതികവിദ്യ', sports: 'കായികം', world: 'ലോകം', culture: 'സംസ്കാരം', opinion: 'അഭിപ്രായം', videos: 'വീഡിയോകൾ', featured_stories: 'പ്രധാന വാർത്തകൾ', top_story: 'പ്രധാന വാർത്ത', in_depth: 'ആഴത്തിലുള്ള വിശകലനം', most_read: 'ഏറ്റവും കൂടുതൽ വായിച്ചത്', breaking: 'ബ്രേക്കിംഗ്', by: 'എഴുതിയത്', min_read: 'മിനിറ്റ് വായന', views: 'കാഴ്ചകൾ', just_now: 'ഇപ്പോൾ', subscribe: 'വരിക്കാരാകുക' },
  bn: { politics: 'রাজনীতি', business: 'ব্যবসা', technology: 'প্রযুক্তি', sports: 'খেলাধুলা', world: 'বিশ্ব', culture: 'সংস্কৃতি', opinion: 'মতামত', videos: 'ভিডিও', featured_stories: 'মূল খবর', top_story: 'শীর্ষ খবর', in_depth: 'গভীর বিশ্লেষণ', most_read: 'সবচেয়ে বেশি পঠিত', breaking: 'ব্রেকিং', by: 'লেখক', min_read: 'মিনিট পড়া', views: 'ভিউ', just_now: 'এইমাত্র', subscribe: 'সাবস্ক্রাইব' },
  as: { politics: 'ৰাজনীতি', business: 'ব্যৱসায়', technology: 'প্ৰযুক্তি', sports: 'খেল', world: 'বিশ্ব', culture: 'সংস্কৃতি', opinion: 'মতামত', videos: 'ভিডিঅ’', featured_stories: 'প্ৰধান খবৰ', top_story: 'শীৰ্ষ খবৰ', in_depth: 'গভীৰ বিশ্লেষণ', most_read: 'সৰ্বাধিক পঠিত', breaking: 'ব্ৰেকিং', by: 'লেখক', min_read: 'মিনিট পঢ়া', views: 'ভিউ', just_now: 'এইমাত্ৰ', subscribe: 'চাবস্ক্ৰাইব' },
  or: { politics: 'ରାଜନୀତି', business: 'ବ୍ୟବସାୟ', technology: 'ପ୍ରଯୁକ୍ତିବିଦ୍ୟା', sports: 'ଖେଳ', world: 'ବିଶ୍ୱ', culture: 'ସଂସ୍କୃତି', opinion: 'ମତାମତ', videos: 'ଭିଡିଓ', featured_stories: 'ପ୍ରମୁଖ ଖବର', top_story: 'ପ୍ରମୁଖ ଖବର', in_depth: 'ଗଭୀର ବିଶ୍ଳେଷଣ', most_read: 'ସର୍ବାଧିକ ପଠିତ', breaking: 'ବ୍ରେକିଙ୍ଗ', by: 'ଲେଖକ', min_read: 'ମିନିଟ୍ ପଢ଼ା', views: 'ଭ୍ୟୁ', just_now: 'ବର୍ତ୍ତମାନ', subscribe: 'ସବସ୍କ୍ରାଇବ୍' },
  pa: { politics: 'ਰਾਜਨੀਤੀ', business: 'ਕਾਰੋਬਾਰ', technology: 'ਤਕਨਾਲੋਜੀ', sports: 'ਖੇਡਾਂ', world: 'ਵਿਸ਼ਵ', culture: 'ਸੱਭਿਆਚਾਰ', opinion: 'ਰਾਏ', videos: 'ਵੀਡੀਓਜ਼', featured_stories: 'ਪ੍ਰਮੁੱਖ ਖ਼ਬਰਾਂ', top_story: 'ਮੁੱਖ ਖ਼ਬਰ', in_depth: 'ਡੂੰਘਾ ਵਿਸ਼ਲੇਸ਼ਣ', most_read: 'ਸਭ ਤੋਂ ਵੱਧ ਪੜ੍ਹਿਆ ਗਿਆ', breaking: 'ਬ੍ਰੇਕਿੰਗ', by: 'ਲੇਖਕ', min_read: 'ਮਿੰਟ ਪੜ੍ਹਨ', views: 'ਵਿਊਜ਼', just_now: 'ਹੁਣੇ', subscribe: 'ਮੈਂਬਰ ਬਣੋ' },
  gu: { politics: 'રાજકારણ', business: 'વ્યાપાર', technology: 'ટેકનોલોજી', sports: 'રમતગમત', world: 'વિશ્વ', culture: 'સંસ્કૃતિ', opinion: 'અભિપ્રાય', videos: 'વિડિઓઝ', featured_stories: 'મુખ્ય સમાચાર', top_story: 'મુખ્ય સમાચાર', in_depth: 'ઊંડાણપૂર્વક વિશ્લેષણ', most_read: 'સૌથી વધુ વંચાયેલ', breaking: 'બ્રેકિંગ', by: 'લેખક', min_read: 'મિનિટ વાંચન', views: 'વ્યૂઝ', just_now: 'હમણાં જ', subscribe: 'સબ્સ્ક્રાઇબ' },
  sd: { politics: 'سياست', business: 'واپار', technology: 'ٽيڪنالاجي', sports: 'رانديون', world: 'دنيا', culture: 'ثقافت', opinion: 'راءِ', videos: 'ويڊيوز', breaking: 'بريڪنگ', top_story: 'اهم خبر', views: 'ڏسڻ', just_now: 'هاڻي', subscribe: 'سبسڪرائب' },
  brx: { politics: 'Politics', business: 'Business', technology: 'Technology', sports: 'Sports', world: 'World', culture: 'Culture', opinion: 'Opinion', videos: 'Videos', breaking: 'Breaking', top_story: 'Top Story', views: 'views', just_now: 'Just now' },
  ks: { politics: 'سیاست', business: 'تِجارَت', technology: 'ٹیکنالوجی', sports: 'کھیل', world: 'دُنیا', culture: 'ثقافت', opinion: 'رائے', videos: 'ویڈیوز', breaking: 'بریکنگ', top_story: 'اہم خبر', views: 'مناظر', just_now: 'وُنکینس', subscribe: 'سَبسکرایب' },
  mni: { politics: 'Politics', business: 'Business', technology: 'Technology', sports: 'Sports', world: 'World', culture: 'Culture', opinion: 'Opinion', videos: 'Videos', breaking: 'Breaking', top_story: 'Top Story', views: 'views', just_now: 'Just now' },
  ur: { politics: 'سیاست', business: 'کاروبار', technology: 'ٹیکنالوجی', sports: 'کھیل', world: 'دنیا', culture: 'ثقافت', opinion: 'رائے', videos: 'ویڈیوز', featured_stories: 'اہم خبریں', top_story: 'اہم خبر', in_depth: 'گہرا تجزیہ', most_read: 'سب سے زیادہ پڑھا گیا', breaking: 'بریکنگ', by: 'مصنف', min_read: 'منٹ پڑھنا', views: 'مناظر', just_now: 'ابھی', subscribe: 'سبسکرائب' }
};

// ── SAMPLE ARTICLES (Pre-loaded with EN/HI fallbacks) ──
const SAMPLE_ARTICLES = [];

// ── BREAKING NEWS ITEMS ──
const BREAKING_NEWS = {
  en: [
    "PM Modi inaugurates new expressway connecting Lucknow to Varanasi in Uttar Pradesh",
    "India registers 3.2% GDP growth in Q3, exceeding market expectations",
    "Supreme Court upholds electoral bond ruling in landmark 5-judge bench decision"
  ],
  hi: [
    "PM मोदी ने लखनऊ से वाराणसी को जोड़ने वाले नए एक्सप्रेसवे का उद्घाटन किया",
    "भारत ने Q3 में 3.2% GDP वृद्धि दर्ज की, बाजार की उम्मीदों से ज़्यादा",
    "सुप्रीम कोर्ट ने 5 जजों की पीठ के ऐतिहासिक फैसले में इलेक्टोरल बॉन्ड फैसले को बरकरार रखा"
  ]
};

// ── CATEGORIES (Metadata) ──
const CATEGORIES = [
  { id: 'politics', color: 'red' },
  { id: 'business', color: 'gold' },
  { id: 'technology', color: 'teal' },
  { id: 'sports', color: 'purple' },
  { id: 'world', color: 'blue' },
  { id: 'culture', color: 'purple' },
];

// ── DATA HELPERS ──
const NKData = {
  // Get current language
  getLang() {
    return localStorage.getItem('nk_lang') || 'en';
  },

  // Get translation with cascading fallbacks covering 22 languages
  t(key) {
    const lang = this.getLang();
    // 1. Exact match
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) return TRANSLATIONS[lang][key];
    
    // 2. Hindi fallback for Devanagari and North/Central Indian scripts
    const hindiLike = ['mr', 'sa', 'ne', 'doi', 'kok', 'mai', 'brx'];
    if (hindiLike.includes(lang) && TRANSLATIONS.hi && TRANSLATIONS.hi[key]) return TRANSLATIONS.hi[key];
    
    // 3. Urdu fallback for Perso-Arabic scripts
    const urduLike = ['ks', 'sd'];
    if (urduLike.includes(lang) && TRANSLATIONS.ur && TRANSLATIONS.ur[key]) return TRANSLATIONS.ur[key];
    
    // 4. Default to English
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    
    // 5. Raw key
    return key;
  },

  // Get localized text from an object (e.g. article title: {en:"...", hi:"..."})
  localText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = this.getLang();
    
    // 1. Exact match
    if (obj[lang]) return obj[lang];
    
    // 2. Hindi fallback if English isn't strictly requested
    if (lang !== 'en' && obj.hi) return obj.hi;
    
    // 3. English default
    if (obj.en) return obj.en;
    
    // 4. Any available non-empty translation
    return Object.values(obj).find(val => val) || '';
  },

  // ── DYNAMIC TRANSLATION ──
  async translateText(text, tl) {
    if (!text || !text.trim()) return text;
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      return data[0].map(x => x[0]).join('');
    } catch (e) {
      console.error('Translation error:', e);
      return text;
    }
  },

  async translateHTML(html, tl) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    
    const textNodes = [];
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) {
        textNodes.push(node);
      }
    }

    // Parallelize all text nodes inside the HTML block
    const promises = textNodes.map(async (n) => {
      n.nodeValue = await this.translateText(n.nodeValue, tl);
    });
    
    await Promise.all(promises);
    return div.innerHTML;
  },

  async translateMissingContent(targetLang) {
    if (!targetLang || targetLang === 'en') return;
    
    let articles = JSON.parse(localStorage.getItem('nk_articles') || '[]');
    let needsUpdate = false;
    let overlay = document.getElementById('nk-translating-overlay');
    const tasks = [];

    for (let i = 0; i < articles.length; i++) {
      let a = articles[i];
      if (typeof a.title === 'object' && !a.title[targetLang]) {
        if (!needsUpdate) {
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'nk-translating-overlay';
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(250,248,244,0.9); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:var(--font-sans); color:var(--ink); font-size:20px; font-weight:600; opacity:0; pointer-events:none; transition:opacity 0.3s;';
            overlay.innerHTML = `<div style="width:40px; height:40px; border:4px solid var(--border); border-top-color:var(--red); border-radius:50%; animation:spin 1s linear infinite; margin-bottom:16px;"></div><span id="nk-translating-text">Translating...</span><style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>`;
            document.body.appendChild(overlay);
          }
          const uiT = TRANSLATIONS.en || {};
          const langName = uiT[targetLang] || targetLang.toUpperCase();
          document.getElementById('nk-translating-text').textContent = `Translating to ${langName} in parallel... Please wait`;
          
          overlay.style.opacity = '1';
          overlay.style.pointerEvents = 'all';
          await new Promise(r => setTimeout(r, 100)); // allow browser to paint loader
        }
        needsUpdate = true;
        
        // Push concurrent translation tasks for ALL missing articles at once
        tasks.push((async () => {
          let srcTitle = a.title.en || a.title.hi || Object.values(a.title)[0] || '';
          let srcExcerpt = a.excerpt.en || a.excerpt.hi || Object.values(a.excerpt)[0] || '';
          let srcBody = a.body.en || a.body.hi || Object.values(a.body)[0] || '';

          const [tTitle, tExcerpt, tBody] = await Promise.all([
            srcTitle ? this.translateText(srcTitle, targetLang) : Promise.resolve(''),
            srcExcerpt ? this.translateText(srcExcerpt, targetLang) : Promise.resolve(''),
            srcBody ? this.translateHTML(srcBody, targetLang) : Promise.resolve('')
          ]);

          if (tTitle) a.title[targetLang] = tTitle;
          if (tExcerpt) a.excerpt[targetLang] = tExcerpt;
          if (tBody) a.body[targetLang] = tBody;
        })());
      }
    }

    if (needsUpdate) {
      // Wait for all concurrent fetches to resolve (the browser handles connection limit automatically)
      await Promise.all(tasks);
      localStorage.setItem('nk_articles', JSON.stringify(articles));
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      await new Promise(r => setTimeout(r, 300));
    }
  },

  // Initialize localStorage with sample data if empty
  init() {
    if (!localStorage.getItem('nk_articles')) {
      localStorage.setItem('nk_articles', JSON.stringify(SAMPLE_ARTICLES));
    }
    
    // Purge fake articles (one-time for existing users)
    if (!localStorage.getItem('nk_purged_fakes')) {
      let articles = JSON.parse(localStorage.getItem('nk_articles') || '[]');
      const len = articles.length;
      articles = articles.filter(a => !a.id.startsWith('art-0')); // Fake ids were art-001 to art-014
      if (articles.length < len) {
        localStorage.setItem('nk_articles', JSON.stringify(articles));
      }
      localStorage.setItem('nk_purged_fakes', 'true');
    }
    
    // Fire and forget auto-fetch for live news
    setTimeout(() => this.fetchLiveNews(), 1500);

    // BACKGROUND CLOUD SYNC: Automatically pull from Supabase in background
    if (!window._nk_syncing) {
      window._nk_syncing = true;
      setTimeout(() => this.syncFromSupabase(), 500);
    }
  },

  // ── OFFLINE-FIRST BACKEND SYNC (Supabase) ──
  async syncFromSupabase() {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=data`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (!resp.ok) return;
      const rows = await resp.json();
      
      const cloudArticles = rows.map(r => r.data).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const localHash = localStorage.getItem('nk_articles');
      const cloudHash = JSON.stringify(cloudArticles);
      
      // If cloud has different data than local, overwrite local and trigger a silent UI refresh (reload) if not an admin doing edits
      if (localHash !== cloudHash && cloudArticles.length > 0) {
        console.log('☁️ Supabase Sync: Updating local database with fresh cloud data...');
        localStorage.setItem('nk_articles', cloudHash);
        if (!window.location.pathname.includes('admin.html')) {
           window.location.reload(); // Instantly apply live changes for readers
        }
      }
    } catch(e) {
      console.log('☁️ Supabase Sync Failed (Operating Offline)', e);
    }
  },

  // Fetch Live RSS News (100% Free architecture demo)
  async fetchLiveNews() {
    const lastFetch = localStorage.getItem('nk_last_rss_fetch');
    const now = Date.now();
    // Fetch once every 15 minutes to stay well within free API limits
    if (lastFetch && (now - parseInt(lastFetch)) < 15 * 60 * 1000) {
      return; 
    }
    
    try {
      const rssUrl = 'https://feeds.feedburner.com/ndtvnews-top-stories';
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      const data = await res.json();
      
      if (data.status !== 'ok') return;
      
      let articles = JSON.parse(localStorage.getItem('nk_articles') || '[]');
      let updated = false;
      const items = data.items.slice(0, 10);
      
      for (const item of items) {
        if (articles.some(a => a.title && a.title.en === item.title)) continue;
        
        const newArt = {
          id: 'live-' + Date.now() + '-' + Math.floor(Math.random()*1000),
          title: { en: item.title, hi: '' }, 
          excerpt: { en: (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...', hi: '' },
          body: { en: `<p>${item.description}</p><br><p><a href="${item.link}" target="_blank" style="color:var(--red); font-weight:600;">Read full story at Source ↗</a></p>`, hi: '' },
          category: 'politics', // Mapping to arbitrary core category
          priority: 'normal',
          contentType: 'article',
          author: 'Live News Desk',
          status: 'published',
          publishedAt: new Date(item.pubDate).toISOString(),
          views: Math.floor(Math.random() * 500) + 100,
          tags: ['Live News'],
          images: item.thumbnail ? [item.thumbnail] : []
        };
        articles.push(newArt);
        updated = true;
      }
      
      if (updated) {
        articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        localStorage.setItem('nk_articles', JSON.stringify(articles));
        localStorage.setItem('nk_last_rss_fetch', now.toString());
      }
    } catch (e) {
      console.error('Live fetch err:', e);
    }
  },

  // Get all published articles
  getArticles() {
    this.init();
    const articles = JSON.parse(localStorage.getItem('nk_articles') || '[]');
    return articles.filter(a => a.status === 'published')
                   .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  },

  // Get all articles (including drafts — for admin)
  getAllArticles() {
    this.init();
    return JSON.parse(localStorage.getItem('nk_articles') || '[]')
               .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  },

  // Get article by ID
  getArticleById(id) {
    this.init();
    const articles = JSON.parse(localStorage.getItem('nk_articles') || '[]');
    return articles.find(a => a.id === id);
  },

  // Get articles by category
  getArticlesByCategory(category) {
    return this.getArticles().filter(a => a.category === category);
  },

  // Get articles by priority
  getArticlesByPriority(priority) {
    return this.getArticles().filter(a => a.priority === priority);
  },

  // Get breaking news
  getBreakingNews() {
    const lang = this.getLang();
    const adminBreaking = this.getArticlesByPriority('breaking');
    const breakingTitles = adminBreaking.map(a => this.localText(a.title));
    const defaultBreaking = BREAKING_NEWS[lang] || BREAKING_NEWS.hi || BREAKING_NEWS.en;
    return [...breakingTitles, ...defaultBreaking];
  },

  // Save article (create or update)
  saveArticle(article) {
    this.init();
    const articles = JSON.parse(localStorage.getItem('nk_articles') || '[]');
    const idx = articles.findIndex(a => a.id === article.id);
    if (idx >= 0) {
      articles[idx] = article;
    } else {
      article.id = 'art-' + Date.now();
      article.publishedAt = article.publishedAt || new Date().toISOString();
      article.views = article.views || 0;
      articles.push(article);
    }
    localStorage.setItem('nk_articles', JSON.stringify(articles));
    
    // Async Fire-and-Forget push to Supabase Cloud
    fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: 'POST',
      headers: { 
        'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ id: article.id, data: article, published_at: new Date(article.publishedAt).toISOString() })
    }).catch(e => console.error('Cloud upload failed:', e));
    
    return article;
  },

  // Delete article
  deleteArticle(id) {
    const articles = JSON.parse(localStorage.getItem('nk_articles') || '[]');
    const filtered = articles.filter(a => a.id !== id);
    localStorage.setItem('nk_articles', JSON.stringify(filtered));
    
    // Async Fire-and-Forget delete to Supabase Cloud
    fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }).catch(e => console.error('Cloud delete failed:', e));
  },

  // Format time ago dynamically using native browser Intl
  timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSeconds = Math.floor((now - date) / 1000);
    const lang = this.getLang() || 'en';
    
    if (diffSeconds < 60) return this.t('just_now');
    
    try {
      // Browsers support standard ISO languages natively.
      // Some exotic/regional scripts map back to major ones for time formatting if strictly needed,
      // but Intl.RelativeTimeFormat covers mostly all of India's 22 languages directly.
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
      
      if (diffSeconds < 3600) return rtf.format(-Math.floor(diffSeconds / 60), 'minute');
      if (diffSeconds < 86400) return rtf.format(-Math.floor(diffSeconds / 3600), 'hour');
      return rtf.format(-Math.floor(diffSeconds / 86400), 'day');
    } catch (e) {
      // Manual fallback code
      if (diffSeconds < 3600) return Math.floor(diffSeconds / 60) + (lang !== 'en' ? ' ' + this.t('mins_ago') : 'm ago');
      if (diffSeconds < 86400) return Math.floor(diffSeconds / 3600) + (lang !== 'en' ? ' ' + this.t('hours_ago') : 'h ago');
      return Math.floor(diffSeconds / 86400) + (lang !== 'en' ? ' ' + this.t('days_ago') : 'd ago');
    }
  },

  // Get category info
  getCategoryInfo(catId) {
    return CATEGORIES.find(c => c.id === catId) || { id: catId, color: 'gray' };
  },

  // Get category color class
  getCatColorClass(catId) {
    const cat = this.getCategoryInfo(catId);
    const map = { red: '', gold: 'cat-tag--gold', teal: 'cat-tag--teal', blue: 'cat-tag--blue', purple: 'cat-tag--purple' };
    return map[cat.color] || '';
  }
};
