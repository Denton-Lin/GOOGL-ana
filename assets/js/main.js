console.log("main.js script started");

(function() {
  "use strict";
  console.log("IIFE executed");

  // =======================================================
  // 1. Firebase Configuration (!!! 🚨🚨🚨 請務必使用您自己的真實設定 🚨🚨🚨 !!!)
  // =======================================================
  const firebaseConfig = {
    apiKey: "AIzaSyCLGSAluWGeB92CsD-5mNlsQxt7-zz_hAY", // 請替換成您真實的 Firebase Key
    authDomain: "snake1-cbb66.firebaseapp.com",
    databaseURL: "https://snake1-cbb66-default-rtdb.firebaseio.com",
    projectId: "snake1-cbb66",
    storageBucket: "snake1-cbb66.firebasestorage.app",
    messagingSenderId: "126279439476",
    appId: "1:126279439476:web:74cc01dd889a682da0ed21",
    measurementId: "G-2X2XB1CBMG"
  };
  try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
  } catch (e) {
      console.error("Firebase initialization error:", e);
      alert("Firebase 設定錯誤，請檢查您的 firebaseConfig 物件！\n" + e.message + "\n並確認您已在 Firebase Console 完成所有必要設定 (啟用Google登入、新增授權網域)。");
  }
  const auth = firebase.auth();
  const database = firebase.database();

  // =======================================================
  // 2. Gemini API Key (!!! 🚨🚨🚨 請務必使用您自己的真實金鑰 🚨🚨🚨 !!!)
  // =======================================================
  const GEMINI_API_KEY = "AIzaSyAfDwNDCzR9ECRlLBXkgWoxLMc833c5tPg"; // 請替換成您有效的 Gemini API Key
  // =======================================================
  //  ✨✨✨  使用 flash 版本以避免 429 錯誤  ✨✨✨
  // =======================================================
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;


  // =======================================================
  // 3. Global Variables & DOM Elements
  // =======================================================
  let currentUser = null;
  let currentLang = 'zh-TW';
  let dailyPricesData = [], incomeStatementData = [], balanceSheetData = [], cashFlowData = [];
  let financialRatios = {};
  let domElements = {};

  // =======================================================
  // 4. Language Translations (✨✨✨ 這裡已擴充 ✨✨✨)
  // =======================================================
  const translations = {
      'zh-TW': {
          siteTitle: "Google 投資分析", navHome: "首頁", navAbout: "公司概覽", navStock: "股價分析", navFinancials: "財務報表", navRatios: "財務比率", navAI: "AI分析師", projectAuthor: "開發者: 林致宇 | 期末專題",
          heroTitle: "Google (Alphabet Inc.) ", heroTitleSpan: "投資價值分析", heroSubtitle: "透過深入的數據分析，探索 Google 的投資潛力與風險。", getStarted: "開始探索",
          aboutTitle: "公司概覽", aboutSubtitle: "了解 Google", aboutSubtitleSpan: "的核心業務與市場地位",
          googleIntroTitle: "Alphabet Inc. 簡介",
          googleIntroText1: "Alphabet Inc. 是一家總部位於美國加州山景城的跨國科技集團，於 2015 年 10 月 2 日重組成立，由 Google 的聯合創始人 Larry Page 和 Sergey Brin 創立。這次重組的主要目的是提高營運透明度和管理效率，將核心的網際網路業務與其他具前瞻性但風險較高的新興業務分開。Google 依然是 Alphabet 旗下最大、最核心的子公司，是全球資訊搜尋、線上廣告、影音分享及行動作業系統的領導者。",
          coreBizTitle: "核心業務:",
          googleBiz1:"<i class='bi bi-search'></i> Google 搜尋及相關服務: 核心廣告收入來源，整合 AI 提供智慧搜尋體驗，涵蓋地圖、新聞等。",
          googleBiz2:"<i class='bi bi-badge-ad-fill'></i> Google 廣告: 主要營收引擎，包括搜尋廣告、YouTube 廣告及 Google 聯播網廣告。",
          googleBiz3:"<i class='bi bi-youtube'></i> YouTube: 全球最大影音平台，透過廣告和 Premium 訂閱等方式盈利，Shorts 短影音增長迅速。",
          googleBiz4:"<i class='bi bi-cloud-fill'></i> Google Cloud: 提供 GCP 雲端運算和 Workspace 協作工具，是快速增長的戰略重點。",
          googleBiz5:"<i class='bi bi-android2'></i> Android、Chrome 與硬體: Android 為全球主流行動作業系統，輔以 Chrome 及 Pixel 等硬體設備。",
          otherBetsTitle: "其他新興業務:",
          otherBetsText: "投資於具未來潛力但高風險的項目，如 Waymo (自動駕駛)、Verily (生命科學) 和 Calico (抗衰老研究) 等。",
          marketPosTitle: "市場地位、挑戰與展望",
          marketPosText1: "Google 在其核心領域擁有無可比擬的市場主導地位。然而，它也面臨諸多挑戰與機遇：",
          challenge1:"<i class='bi bi-robot'></i> AI 浪潮: 既是核心驅動力，也面臨激烈競爭。",
          challenge2:"<i class='bi bi-gavel'></i> 監管壓力: 全球反壟斷審查和數據隱私挑戰。",
          challenge3:"<i class='bi bi-clouds'></i> 雲端競爭: 與 AWS、Azure 的市場份額爭奪戰。",
          challenge4:"<i class='bi bi-globe'></i> 新興市場: 長期增長的潛力所在。",
          marketPosText2: "總體而言，Google 依然是全球最具影響力和投資價值的科技公司之一，但投資人需關注其應對挑戰的能力。",
          stockTitle: "股價分析", stockSubtitle: "追蹤 Google", stockSubtitleSpan: "的歷史股價表現", selectTimeRange: "選擇時間區間:", time1Y: "近一年", time3Y: "近三年", time5Y: "近五年", timeAll: "全部",
          stockPriceName: "收盤價", volumeName: "成交量", volumeChartTitle: "成交量圖",
          stockDataError: "股價資料載入失敗或格式錯誤。", noStockDataPeriod: "此時間區間無股價資料。",
          financialsTitle: "財務報表", financialsSubtitle: "探索 Google", financialsSubtitleSpan: "的核心財務數據", revenueTitle: "營收與毛利趨勢", incomeTitle: "營業收入與淨利趨勢", assetsLiabilitiesTitle: "資產與負債趨勢", cashflowTitle: "現金流量趨勢",
          ratiosTitle: "財務比率", ratiosSubtitle: "評估 Google", ratiosSubtitleSpan: "的綜合財務健康狀況", ratiosIntro: "以下表格展示了根據最新財報計算出的關鍵財務比率。", ratioCategory: "類別", ratioName: "比率名稱", ratioValue: "數值 (最新季度)", ratioMeaning: "簡要含意",
          aiTitle: "Gemini AI 投資分析師", aiSubtitle: "與 AI 互動", aiSubtitleSpan: "獲取即時分析與見解",
          aiLoginPromptText1: "請先", aiLoginPromptText2: "以使用 AI 分析師功能並保存您的對話紀錄。",
          aiChatHeader: "與 Gemini AI 分析師對話", aiInputPlaceholder: "輸入您的問題...", aiSendButton: "發送", aiClearHistory: "清除歷史紀錄",
          login: "登入", logout: "登出", aiWelcome: "您好！我是您的 Gemini AI 投資分析師。請問有什麼關於 Google 投資的問題嗎？", aiThinking: "AI 正在思考中...", aiError: "抱歉，與 AI 連線時發生錯誤，請稍後再試或檢查您的 API 金鑰設定。", aiHistoryCleared: "對話紀錄已清除。",
          eps: "每股盈餘 (EPS)", eps_m: "公司每一股普通股能賺取多少利潤。", roa: "資產報酬率 (ROA)", roa_m: "公司利用其總資產創造利潤的效率。", roe: "股東權益報酬率 (ROE)", roe_m: "公司為股東創造利潤的效率。", pe: "本益比 (PE Ratio)", pe_m: "投資人願意為公司每一元盈餘支付多少價格。", ps: "股價營收比 (PS Ratio)", ps_m: "投資人願意為公司每一元營收支付多少價格。", pm: "利潤率 (PM)", pm_m: "公司每一元營收能產生多少淨利。", current: "流動比率", current_m: "公司以流動資產償還短期負債的能力。", quick: "速動比率", quick_m: "公司以更具流動性的資產償還短期負債的能力。", cash: "現金比率", cash_m: "公司以現金及約當現金償還短期負債的能力。", invTurn: "存貨週轉率", invTurn_m: "公司管理存貨的效率。", nwcTurn: "淨營運資本週轉率", nwcTurn_m: "公司利用淨營運資本產生營收的效率。", assetTurn: "總資產週轉率", assetTurn_m: "公司利用總資產產生營收的效率。", debt: "總負債比率", debt_m: "公司總資產中有多少比例是透過負債籌措的。", de: "負債權益比", de_m: "公司負債相對於股東權益的比例。", em: "權益乘數", em_m: "衡量財務槓桿的另一指標。"
      },
      'en-US': {
          siteTitle: "Google Investment Analysis", navHome: "Home", navAbout: "Overview", navStock: "Stock Analysis", navFinancials: "Financials", navRatios: "Ratios", navAI: "AI Analyst", projectAuthor: "Developer: Chih-Yu Lin | Final Project",
          heroTitle: "Google (Alphabet Inc.) ", heroTitleSpan: "Investment Analysis", heroSubtitle: "Explore Google's investment potential through in-depth data analysis.", getStarted: "Get Started",
          aboutTitle: "Company Overview", aboutSubtitle: "Understanding Google's", aboutSubtitleSpan: "Core Business & Market Position",
          googleIntroTitle: "About Alphabet Inc.",
          googleIntroText1: "Alphabet Inc., based in Mountain View, California, is a multinational technology conglomerate established on October 2, 2015, through a restructuring led by Google's co-founders, Larry Page and Sergey Brin. The primary goal was to enhance operational transparency and management efficiency by separating core internet services from 'Other Bets'—forward-looking but higher-risk ventures. Google remains Alphabet's largest and most crucial subsidiary, a global leader in information search, online advertising, video sharing, and mobile operating systems.",
          coreBizTitle: "Core Businesses:",
          googleBiz1:"<i class='bi bi-search'></i> Google Search & related: Core ad revenue, AI-powered smart search, Maps, News.",
          googleBiz2:"<i class='bi bi-badge-ad-fill'></i> Google Ads: Main revenue engine: Search, YouTube, Display Network.",
          googleBiz3:"<i class='bi bi-youtube'></i> YouTube: Largest video platform, monetized via ads & Premium; Shorts for short-form.",
          googleBiz4:"<i class='bi bi-cloud-fill'></i> Google Cloud: GCP (cloud computing) & Workspace (collaboration), a key growth area.",
          googleBiz5:"<i class='bi bi-android2'></i> Android, Chrome & Hardware: Dominant mobile OS, Chrome browser, Pixel devices.",
          otherBetsTitle: "Other Bets:",
          otherBetsText: "Investments in future-potential, high-risk projects like Waymo (self-driving), Verily (life sciences), and Calico (longevity research).",
          marketPosTitle: "Market Position, Challenges & Outlook",
          marketPosText1: "Google holds an unparalleled market-dominant position in its core areas. However, it faces numerous challenges and opportunities:",
          challenge1:"<i class='bi bi-robot'></i> AI Wave: Both a core driver and faces fierce competition.",
          challenge2:"<i class='bi bi-gavel'></i> Regulatory Pressure: Global antitrust reviews and data privacy challenges.",
          challenge3:"<i class='bi bi-clouds'></i> Cloud Competition: Market share battle with AWS and Azure.",
          challenge4:"<i class='bi bi-globe'></i> Emerging Markets: Potential for long-term growth.",
          marketPosText2: "Overall, Google remains one of the world's most influential and valuable tech companies, but investors need to monitor its ability to navigate these challenges.",
          stockTitle: "Stock Analysis", stockSubtitle: "Track Google's", stockSubtitleSpan: "Historical Stock Performance", selectTimeRange: "Select Time Range:", time1Y: "1 Year", time3Y: "3 Years", time5Y: "5 Years", timeAll: "All Time",
          stockPriceName: "Close Price", volumeName: "Volume", volumeChartTitle: "Trading Volume",
          stockDataError: "Failed to load stock price data or format is incorrect.", noStockDataPeriod: "No stock price data for this period.",
          financialsTitle: "Financial Statements", financialsSubtitle: "Explore Google's", financialsSubtitleSpan: "Core Financial Data", revenueTitle: "Revenue & Gross Profit Trend", incomeTitle: "Operating Income & Net Income Trend", assetsLiabilitiesTitle: "Assets & Liabilities Trend", cashflowTitle: "Cash Flow Trend",
          ratiosTitle: "Financial Ratios", ratiosSubtitle: "Assess Google's", ratiosSubtitleSpan: "Overall Financial Health", ratiosIntro: "The table below shows key financial ratios calculated from the latest reports.", ratioCategory: "Category", ratioName: "Ratio Name", ratioValue: "Value (Latest Quarter)", ratioMeaning: "Brief Meaning",
          aiTitle: "Gemini AI Investment Analyst", aiSubtitle: "Interact with AI", aiSubtitleSpan: "for Real-time Analysis",
          aiLoginPromptText1: "Please ", aiLoginPromptText2: " to use the AI Analyst and save your chat history.",
          aiChatHeader: "Chat with Gemini AI Analyst", aiInputPlaceholder: "Type your question...", aiSendButton: "Send", aiClearHistory: "Clear History",
          login: "Login", logout: "Logout", aiWelcome: "Hello! I am your Gemini AI Investment Analyst. How can I help with your Google investment questions?", aiThinking: "AI is thinking...", aiError: "Sorry, an error occurred connecting to AI. Please try again later or check your API key.", aiHistoryCleared: "Chat history cleared.",
          eps: "EPS", eps_m: "Earnings per share.", roa: "ROA", roa_m: "Return on assets.", roe: "ROE", roe_m: "Return on equity.", pe: "PE Ratio", pe_m: "Price to earnings.", ps: "PS Ratio", ps_m: "Price to sales.", pm: "Profit Margin", pm_m: "Net income / revenue.", current: "Current Ratio", current_m: "Ability to pay short-term debt.", quick: "Quick Ratio", quick_m: "Ability to pay short-term debt w/o inventory.", cash: "Cash Ratio", cash_m: "Ability to pay short-term debt w/ cash.", invTurn: "Inventory Turnover", invTurn_m: "Inventory efficiency.", nwcTurn: "NWC Turnover", nwcTurn_m: "Working capital efficiency.", assetTurn: "Total Asset Turnover", assetTurn_m: "Asset efficiency.", debt: "Total Debt Ratio", debt_m: "Assets financed by debt.", de: "Debt-to-Equity", de_m: "Debt vs equity.", em: "Equity Multiplier", em_m: "Financial leverage measure."
      }
  };

  // =======================================================
  // Function Declarations (定義移到前面，確保可用性)
  // =======================================================

  function assignDOMElements() {
      domElements = {
          loginButton: document.getElementById('login-button'), logoutButton: document.getElementById('logout-button'),
          userDisplay: document.getElementById('user-display'), aiLoginPrompt: document.getElementById('ai-login-prompt'),
          loginLink: document.getElementById('login-link'), aiChatArea: document.getElementById('ai-chat-area'),
          chatHistory: document.getElementById('chat-history'), userInput: document.getElementById('user-input'),
          sendButton: document.getElementById('send-button'), aiLoading: document.getElementById('ai-loading'),
          clearHistoryButton: document.getElementById('clear-history-button'), langTwButton: document.getElementById('lang-tw'),
          langEnButton: document.getElementById('lang-en'), priceTimeRangeSelect: document.getElementById('price-time-range'),
          ratiosTableBody: document.getElementById('ratios-table-body'),
      };
  }

  function switchLanguage(lang) {
      currentLang = lang;
      if (document.documentElement) document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
      document.querySelectorAll('[data-lang-key]').forEach(el => {
          const key = el.getAttribute('data-lang-key');
          if (translations[lang] && translations[lang][key]) {
               if (el.placeholder) { el.placeholder = translations[lang][key]; }
               else { el.innerHTML = translations[lang][key]; }
          }
      });
      if (domElements.langTwButton) domElements.langTwButton.classList.toggle('active', lang === 'zh-TW');
      if (domElements.langEnButton) domElements.langEnButton.classList.toggle('active', lang === 'en-US');

      // Refresh charts and tables to update titles/names if needed
      updateAllCharts();
      populateRatiosTable();
      updateAIChatLanguage();
  }

  function updateAIChatLanguage() {
      if (domElements.userInput) domElements.userInput.placeholder = translations[currentLang]['aiInputPlaceholder'];
      const sendButtonSpan = domElements.sendButton ? domElements.sendButton.querySelector('span:not(.spinner-border)') : null;
      if (sendButtonSpan) sendButtonSpan.innerText = translations[currentLang]['aiSendButton'];
      if (domElements.clearHistoryButton) domElements.clearHistoryButton.innerText = translations[currentLang]['aiClearHistory'];
  }

  function handleLogin(e) {
      if(e) e.preventDefault();
      console.log("Attempting Google Sign-In... Ensure Firebase config and console settings are correct.");
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
          .then((result) => { console.log("Login Successful:", result.user); })
          .catch(error => {
              console.error("Login Error:", error);
              alert(`登入失敗: ${error.code} - ${error.message}\n請檢查 Firebase Console 設定 (Authentication -> Sign-in method -> Google 已啟用，且已新增授權網域如 127.0.0.1, localhost)。並確認您的 firebaseConfig 物件完全正確。`);
          });
  }

  function handleLogout() {
      auth.signOut().catch(error => console.error("Logout Error:", error));
  }

  function updateUIForAuthState() {
      if (!domElements.loginButton) { console.warn("DOM elements (like loginButton) not ready for updateUIForAuthState."); return; }
      if (currentUser) {
          domElements.loginButton.style.display = 'none';
          domElements.logoutButton.style.display = 'inline-block';
          domElements.userDisplay.textContent = currentUser.displayName || currentUser.email;
          domElements.userDisplay.style.display = 'inline-block';
          if(domElements.aiLoginPrompt) domElements.aiLoginPrompt.style.display = 'none';
          if(domElements.aiChatArea) domElements.aiChatArea.style.display = 'block';
          loadChatHistory();
      } else {
          domElements.loginButton.style.display = 'inline-block';
          domElements.logoutButton.style.display = 'none';
          domElements.userDisplay.style.display = 'none';
          if(domElements.aiLoginPrompt) domElements.aiLoginPrompt.style.display = 'block';
          if(domElements.aiChatArea) domElements.aiChatArea.style.display = 'none';
          if(domElements.chatHistory) domElements.chatHistory.innerHTML = '';
      }
  }

  function getKey(obj, keyName) {
      if (!obj) return undefined;
      const lowerKeyName = keyName.toLowerCase();
      if (obj.hasOwnProperty(keyName)) return obj[keyName]; // Try exact match first
      for (const k in obj) { // Fallback to case-insensitive and partial match
          if (k.toLowerCase().includes(lowerKeyName)) { return obj[k]; }
      }
      return undefined;
  }

  const parseNum = (val) => {
      if (val === 'None' || val === '' || val === undefined || val === null) return null;
      const num = parseFloat(String(val).replace(/,/g, ''));
      return isNaN(num) ? null : num;
  };

   const parseDate = (val) => {
       if (!val) return null;
       let date = new Date(val);
       if (!isNaN(date.getTime())) return date;
       const partsDash = String(val).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
       if (partsDash) {
          date = new Date(Date.UTC(parseInt(partsDash[1]), parseInt(partsDash[2]) - 1, parseInt(partsDash[3])));
          if (!isNaN(date.getTime())) return date;
       }
       const partsSlash = String(val).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
       if (partsSlash) {
           date = new Date(Date.UTC(parseInt(partsSlash[2]), parseInt(partsSlash[0]) - 1, parseInt(partsSlash[1])));
           if (!isNaN(date.getTime())) return date;
       }
       console.warn(`[parseDate] Could not parse date string: "${val}"`);
       return null;
  };


  const stockSplits = [
      { date: '2014-04-03', ratio: 1.998001998 },
      { date: '2022-07-18', ratio: 20 }
  ].map(split => ({ date: new Date(split.date + "T00:00:00Z"), ratio: split.ratio }))
   .sort((a, b) => b.date - a.date);

  function processData() {
      console.log("Processing data...");
      dailyPricesData = dailyPricesData.map((d) => {
          const pDate = parseDate(getKey(d, 'date') || getKey(d, 'timestamp'));
          let pOpen = parseNum(getKey(d, 'open'));
          let pHigh = parseNum(getKey(d, 'high'));
          let pLow = parseNum(getKey(d, 'low'));
          let pClose = parseNum(getKey(d, 'close') || getKey(d, '4. close'));
          let pVolume = parseNum(getKey(d, 'volume') || getKey(d, '5. volume'));

          if (pDate) {
              for (const split of stockSplits) {
                  if (pDate < split.date) {
                      if (pOpen !== null) pOpen /= split.ratio;
                      if (pHigh !== null) pHigh /= split.ratio;
                      if (pLow !== null) pLow /= split.ratio;
                      if (pClose !== null) pClose /= split.ratio;
                      if (pVolume !== null) pVolume *= split.ratio;
                  }
              }
          }
          return { date: pDate, open: pOpen, high: pHigh, low: pLow, close: pClose, volume: pVolume };
      }).filter(d => d.date && d.close !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      [incomeStatementData, balanceSheetData, cashFlowData] = [incomeStatementData, balanceSheetData, cashFlowData].map(dataSet =>
          dataSet.map(d => {
              const processed = { fiscalDateEnding: parseDate(getKey(d, 'fiscalDateEnding')) };
              for (const key in d) {
                  if (key.toLowerCase() !== 'fiscaldateending' && key.toLowerCase() !== 'reportedcurrency') {
                      processed[key] = parseNum(d[key]);
                  } else if (key.toLowerCase() === 'reportedcurrency') {
                       processed[key] = d[key];
                  }
              }
              return processed;
          }).filter(d => d.fiscalDateEnding).sort((a, b) => a.fiscalDateEnding.getTime() - b.fiscalDateEnding.getTime())
      );
       console.log("Data Processed. Lengths:", `P:${dailyPricesData.length}, I:${incomeStatementData.length}, B:${balanceSheetData.length}, C:${cashFlowData.length}`);
  }

  function loadCSV(filePath) {
      return new Promise((resolve, reject) => {
          Papa.parse(filePath, {
              download: true, header: true, skipEmptyLines: true,
              complete: (results) => {
                  console.log(`Loaded ${filePath}: ${results.data.length} rows.`);
                  if (results.errors.length > 0) console.warn(`Errors parsing ${filePath}:`, results.errors);
                  resolve(results.data);
              },
              error: (error) => reject(new Error(`Failed to load ${filePath}: ${error.message}`))
          });
      });
  }

  async function loadAllData() {
      try {
          console.log("Loading all data...");
          [dailyPricesData, incomeStatementData, balanceSheetData, cashFlowData] = await Promise.all([
              loadCSV('assets/data/googl_daily_prices.csv'),
              loadCSV('assets/data/googl_income_statement.csv'),
              loadCSV('assets/data/googl_balance_sheet.csv'),
              loadCSV('assets/data/googl_cash_flow_statement.csv')
          ]);
          processData();
          calculateFinancialRatios();
          updateAllCharts(); // Initial chart drawing
          populateRatiosTable(); // Initial table population
      } catch (error) {
          console.error("FATAL: Error loading or processing data:", error);
          alert("資料載入失敗，請檢查網路連線或資料檔案路徑。");
      }
  }

  function calculateFinancialRatios() {
    console.log("Calculating financial ratios...");
    if (!incomeStatementData.length || !balanceSheetData.length) {
        console.warn("Income or Balance Sheet data not ready.");
        financialRatios = {}; // Reset or set to N/A
        return;
    }

    const latestIncome = incomeStatementData[incomeStatementData.length - 1] || {};
    const latestBalance = balanceSheetData[balanceSheetData.length - 1] || {};
    const latestPriceData = dailyPricesData.length ? dailyPricesData[dailyPricesData.length - 1] : {};

    const NI = latestIncome.netIncome; const TA = latestBalance.totalAssets;
    const SE = latestBalance.totalShareholderEquity; const SO = latestBalance.commonStockSharesOutstanding;
    const TR = latestIncome.totalRevenue; const TCA = latestBalance.totalCurrentAssets;
    const TCL = latestBalance.totalCurrentLiabilities; const Inv = latestBalance.inventory;
    const Cash = latestBalance.cashAndCashEquivalentsAtCarryingValue; const CR = latestIncome.costOfRevenue;
    const TL = latestBalance.totalLiabilities;
    const Price = latestPriceData.close;

    const safeDiv = (a, b) => (a != null && b != null && b !== 0) ? (a / b) : null;
    const format = (val, type = 'num') => (val === null) ? 'N/A' : (type === 'pct' ? (val * 100).toFixed(2) + '%' : val.toFixed(2));
    const epsVal = safeDiv(NI, SO);

    financialRatios = {
        eps: format(epsVal), roa: format(safeDiv(NI, TA), 'pct'), roe: format(safeDiv(NI, SE), 'pct'),
        pe: (Price && epsVal) ? format(safeDiv(Price, epsVal)) : 'N/A',
        ps: (Price && SO && TR) ? format(safeDiv(Price * SO, TR)) : 'N/A',
        pm: format(safeDiv(NI, TR), 'pct'),
        current: format(safeDiv(TCA, TCL)), quick: format(safeDiv(TCA - (Inv || 0), TCL)), cash: format(safeDiv(Cash, TCL)),
        invTurn: format(safeDiv(CR, Inv)), nwcTurn: format(safeDiv(TR, TCA - TCL)), assetTurn: format(safeDiv(TR, TA)),
        debt: format(safeDiv(TL, TA), 'pct'), de: format(safeDiv(TL, SE)), em: format(safeDiv(TA, SE)),
    };
    console.log("Financial Ratios Calculated:", financialRatios);
  }

  function populateRatiosTable() {
      const tableBody = domElements.ratiosTableBody;
      if (!tableBody) { console.warn("Ratios table body not found."); return; }
      tableBody.innerHTML = '';
      const ratioOrder = [
          { cat: '獲利能力', cat_en: 'Profitability', ratios: ['eps', 'roa', 'roe', 'pm'] },
          { cat: '評價指標', cat_en: 'Valuation', ratios: ['pe', 'ps'] },
          { cat: '償債能力', cat_en: 'Liquidity', ratios: ['current', 'quick', 'cash'] },
          { cat: '經營效率', cat_en: 'Efficiency', ratios: ['invTurn', 'nwcTurn', 'assetTurn'] },
          { cat: '財務結構', cat_en: 'Leverage', ratios: ['debt', 'de', 'em'] }
      ];

      ratioOrder.forEach(category => {
          category.ratios.forEach(key => {
              const catText = currentLang === 'zh-TW' ? category.cat : category.cat_en;
              const nameText = translations[currentLang][key] || key.toUpperCase();
              const meaningText = translations[currentLang][key + '_m'] || 'N/A';
              const value = financialRatios[key] || 'N/A';
              tableBody.innerHTML += `<tr><td>${catText}</td><td>${nameText}</td><td>${value}</td><td class="ratio-meaning-cell">${meaningText}</td></tr>`;
          });
      });
  }

  function drawPlotlyChart(divId, data, layout) {
     const chartDiv = document.getElementById(divId);
     if (chartDiv) {
         try { Plotly.newPlot(chartDiv, data, layout, {responsive: true}); }
         catch (e) { console.error(`Plotly Error on ${divId}:`, e); }
     }
 }

  function drawPriceChart(timeRange = '1y') {
      const priceChartDivId = 'price-chart';
      const volumeChartDivId = 'volume-chart';
      if (!dailyPricesData.length) {
          document.getElementById(priceChartDivId).innerHTML = `<div class="alert alert-warning">${translations[currentLang]['stockDataError']}</div>`;
          return;
      }
      const calcDate = new Date(); let startDate;
      switch (timeRange) {
          case '1y': startDate = new Date(new Date().setFullYear(calcDate.getFullYear() - 1)); break;
          case '3y': startDate = new Date(new Date().setFullYear(calcDate.getFullYear() - 3)); break;
          case '5y': startDate = new Date(new Date().setFullYear(calcDate.getFullYear() - 5)); break;
          default: startDate = dailyPricesData[0].date;
      }
      const filteredData = dailyPricesData.filter(d => d.date >= startDate);
      if (!filteredData.length) {
           document.getElementById(priceChartDivId).innerHTML = `<div class="alert alert-warning">${translations[currentLang]['noStockDataPeriod']}</div>`;
           return;
      }
      const x = filteredData.map(d => d.date);
      const layoutOptions = { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#444444' }, margin: { l: 50, r: 20, t: 60, b: 40 } };
      drawPlotlyChart(priceChartDivId, [{ x: x, y: filteredData.map(d => d.close), type: 'scatter', mode: 'lines', name: translations[currentLang]['stockPriceName'], line: { color: '#106eea' } }], { title: translations[currentLang]['stockTitle'], ...layoutOptions, yaxis: {title: 'Price (USD)'} });
      drawPlotlyChart(volumeChartDivId, [{ x: x, y: filteredData.map(d => d.volume), type: 'bar', name: translations[currentLang]['volumeName'], marker: { color: '#6c757d', opacity: 0.6 } }], { title: translations[currentLang]['volumeChartTitle'], ...layoutOptions, yaxis: {title: 'Volume'} });
  }

  function drawFinancialCharts() {
      if (!incomeStatementData.length) return;
      const dates = incomeStatementData.map(d => d.fiscalDateEnding);
      const layoutOptions = { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#444444' }, margin: { l: 70, r: 20, t: 60, b: 40 } };

      drawPlotlyChart('revenue-chart', [{ x: dates, y: incomeStatementData.map(d => d.totalRevenue), name: '總營收', type: 'bar' }, { x: dates, y: incomeStatementData.map(d => d.grossProfit), name: '毛利', type: 'bar' }], { title: translations[currentLang]['revenueTitle'], barmode: 'group', ...layoutOptions });
      drawPlotlyChart('income-chart', [{ x: dates, y: incomeStatementData.map(d => d.operatingIncome), name: '營業收入', type: 'line' }, { x: dates, y: incomeStatementData.map(d => d.netIncome), name: '淨利', type: 'line' }], { title: translations[currentLang]['incomeTitle'], ...layoutOptions });
      drawPlotlyChart('balance-sheet-chart', [{ x: balanceSheetData.map(d => d.fiscalDateEnding), y: balanceSheetData.map(d => d.totalAssets), name: '總資產', type: 'line' }, { x: balanceSheetData.map(d => d.fiscalDateEnding), y: balanceSheetData.map(d => d.totalLiabilities), name: '總負債', type: 'line' }], { title: translations[currentLang]['assetsLiabilitiesTitle'], ...layoutOptions });
      drawPlotlyChart('cash-flow-chart', [{ x: cashFlowData.map(d => d.fiscalDateEnding), y: cashFlowData.map(d => d.operatingCashflow), name: '營運', type: 'bar' }, { x: cashFlowData.map(d => d.fiscalDateEnding), y: cashFlowData.map(d => d.cashflowFromInvestment), name: '投資', type: 'bar' }], { title: translations[currentLang]['cashflowTitle'], barmode: 'relative', ...layoutOptions });
  }

  function updateAllCharts() {
      drawPriceChart(domElements.priceTimeRangeSelect ? domElements.priceTimeRangeSelect.value : '1y');
      drawFinancialCharts();
  }

  function addMessageToChat(text, sender) {
      if (!domElements.chatHistory) return null;
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('chat-message', sender);
      const senderName = sender === 'user' ? (currentUser?.displayName || 'You') : 'Gemini AI';
      const formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      msgDiv.innerHTML = `<strong>${senderName}</strong><br>${formattedText}`;
      domElements.chatHistory.appendChild(msgDiv);
      domElements.chatHistory.scrollTop = domElements.chatHistory.scrollHeight;
      return msgDiv;
  }

  function saveMessageToFirebase(text, sender) {
      if (!currentUser || !database) return;
      database.ref(`chat_history/${currentUser.uid}`).push({
          text: text, sender: sender, timestamp: firebase.database.ServerValue.TIMESTAMP
      });
  }

  function loadChatHistory() {
      if (!currentUser || !domElements.chatHistory || !database) return;
      domElements.chatHistory.innerHTML = '';
      const chatRef = database.ref(`chat_history/${currentUser.uid}`).limitToLast(50);
      chatRef.on('child_added', snapshot => {
          const message = snapshot.val();
          if(message) addMessageToChat(message.text, message.sender);
      });
       chatRef.once('value', snapshot => {
           if (!snapshot.exists() && domElements.chatHistory.innerHTML === '') {
               addMessageToChat(translations[currentLang]['aiWelcome'], 'ai');
           }
       });
  }

  function clearChatHistory() {
      if (!currentUser || !database || !confirm(translations[currentLang]['aiClearHistory'] + '?')) return;
      database.ref(`chat_history/${currentUser.uid}`).remove()
          .then(() => {
              if(domElements.chatHistory) domElements.chatHistory.innerHTML = '';
              addMessageToChat(translations[currentLang]['aiHistoryCleared'], 'ai');
          })
          .catch(error => console.error("Clear history error:", error));
  }

  async function handleSendMessage() {
      if (!domElements.userInput || !domElements.sendButton || !domElements.aiLoading) return;
      const userText = domElements.userInput.value.trim();
      if (!userText || !currentUser) return;

      addMessageToChat(userText, 'user');
      saveMessageToFirebase(userText, 'user');
      domElements.userInput.value = '';
      domElements.sendButton.disabled = true;
      domElements.aiLoading.style.display = 'inline-block';
      const thinkingMsg = addMessageToChat(translations[currentLang]['aiThinking'], 'ai');

      const financialContext = JSON.stringify(financialRatios, null, 2);
      const prompt = `You are a helpful investment analyst for Google (Alphabet Inc.). Current Language: ${currentLang}. Respond in this language. Financial Ratios for context: ${financialContext}. User's question: "${userText}". Provide concise, neutral analysis. Avoid direct financial advice (buy/sell).`;

      try {
          if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR")) throw new Error("API Key missing/invalid.");

          const response = await fetch(GEMINI_API_URL, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          const rawResponseText = await response.text();
          console.log("Gemini Raw:", rawResponseText.substring(0, 200));

          if (!response.ok) {
              let errorMsg = `API Error: ${response.status}.`;
              try { errorMsg += ` ${JSON.parse(rawResponseText)?.error?.message || rawResponseText}`; }
              catch(e) { errorMsg += ` ${rawResponseText}`; }
              throw new Error(errorMsg);
          }
          const data = JSON.parse(rawResponseText);
          const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || (translations[currentLang]['aiError'] + " (No content)");

          if (thinkingMsg) thinkingMsg.remove();
          addMessageToChat(aiText, 'ai');
          saveMessageToFirebase(aiText, 'ai');

      } catch (error) {
          console.error("Gemini API Error:", error);
          if (thinkingMsg) thinkingMsg.remove();
          addMessageToChat(`${translations[currentLang]['aiError']} (${error.message})`, 'ai');
      } finally {
          domElements.sendButton.disabled = false;
          domElements.aiLoading.style.display = 'none';
      }
  }

  function handleUserInputKeypress(e) { if (e.key === 'Enter') handleSendMessage(); }
  function handleTimeRangeChange(e) { drawPriceChart(e.target.value); }

  function addEventListeners() {
      const add = (el, event, handler) => { if (el) el.addEventListener(event, handler); };
      add(domElements.loginButton, 'click', handleLogin);
      add(domElements.loginLink, 'click', handleLogin);
      add(domElements.logoutButton, 'click', handleLogout);
      add(domElements.sendButton, 'click', handleSendMessage);
      add(domElements.clearHistoryButton, 'click', clearChatHistory);
      add(domElements.langTwButton, 'click', () => switchLanguage('zh-TW'));
      add(domElements.langEnButton, 'click', () => switchLanguage('en-US'));
      add(domElements.priceTimeRangeSelect, 'change', handleTimeRangeChange);
      add(domElements.userInput, 'keypress', handleUserInputKeypress);
  }

  function initBizLandJS() {
    function toggleScrolled() { const selectBody = document.querySelector('body'); const selectHeader = document.querySelector('#header'); if (!selectHeader || !selectBody) return; window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled'); }
    document.addEventListener('scroll', toggleScrolled); window.addEventListener('load', toggleScrolled);
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    function mobileNavToogle() { document.querySelector('body')?.classList.toggle('mobile-nav-active'); mobileNavToggleBtn?.classList.toggle('bi-list'); mobileNavToggleBtn?.classList.toggle('bi-x'); }
    mobileNavToggleBtn?.addEventListener('click', mobileNavToogle);
    document.querySelectorAll('#navmenu a').forEach(navmenu => { navmenu.addEventListener('click', () => { if (document.querySelector('.mobile-nav-active')) mobileNavToogle(); }); });
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => { navmenu.addEventListener('click', function(e) { e.preventDefault(); this.parentNode.classList.toggle('active'); this.parentNode.nextElementSibling.classList.toggle('dropdown-active'); e.stopImmediatePropagation(); }); });
    const preloader = document.querySelector('#preloader'); if (preloader) window.addEventListener('load', () => preloader.remove());
    let scrollTop = document.querySelector('.scroll-top');
    function toggleScrollTop() { if (scrollTop) window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active'); }
    scrollTop?.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('load', toggleScrollTop); document.addEventListener('scroll', toggleScrollTop);
    if (typeof AOS !== 'undefined') AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
    if (typeof GLightbox !== 'undefined') GLightbox({ selector: '.glightbox' });
    if (typeof PureCounter !== 'undefined') new PureCounter();
  }

  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Fully Loaded. Initializing...");
    assignDOMElements();
    initBizLandJS();
    addEventListeners();
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateUIForAuthState();
    });
    loadAllData().then(() => {
        console.log("Data loaded. Initializing language and UI.");
        switchLanguage(currentLang); // Ensure initial language is set AFTER data load & element assignment
        updateUIForAuthState();     // Ensure UI reflects login state
    }).catch(error => console.error("Initialization failed:", error));
  });

})();
