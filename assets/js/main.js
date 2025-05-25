console.log("main.js script started"); // Very first log

(function() {
  "use strict";
  console.log("IIFE executed"); // Log IIFE execution

  // =======================================================
  // 1. Firebase Configuration (!!! 🚨🚨🚨 請務必使用您自己的真實設定 🚨🚨🚨 !!!)
  // =======================================================
  const firebaseConfig = {
  apiKey: "AIzaSyCLGSAluWGeB92CsD-5mNlsQxt7-zz_hAY",
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
  const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // 使用者提供的，但應替換
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  // =======================================================
  // 3. Global Variables & DOM Elements
  // =======================================================
  let currentUser = null;
  let currentLang = 'zh-TW';
  let dailyPricesData = [];
  let incomeStatementData = [];
  let balanceSheetData = [];
  let cashFlowData = [];
  let financialRatios = {};
  let domElements = {};

  // =======================================================
  // 4. Language Translations
  // =======================================================
  const translations = {
      'zh-TW': {
          siteTitle: "Google 投資分析", navHome: "首頁", navAbout: "公司概覽", navStock: "股價分析", navFinancials: "財務報表", navRatios: "財務比率", navAI: "AI分析師",
          heroTitle: "Google (Alphabet Inc.) ", heroTitleSpan: "投資價值分析", heroSubtitle: "透過深入的數據分析，探索 Google 的投資潛力與風險。", getStarted: "開始探索",
          aboutTitle: "公司概覽", aboutSubtitle: "了解 Google", aboutSubtitleSpan: "的核心業務與市場地位",
          googleIntroTitle: "Alphabet Inc. 簡介", googleIntroText1: "Alphabet Inc. 是一家總部位於美國加州山景城的跨國科技集團，於 2015 年 10 月 2 日重組成立，由 Google 的聯合創始人 Larry Page 和 Sergey Brin 創立。這次重組的主要目的是提高營運透明度和管理效率，將核心的網際網路業務與其他具前瞻性但風險較高的「其他賭注」(Other Bets) 業務分開。Google 依然是 Alphabet 旗下最大、最核心的子公司，是全球資訊搜尋、線上廣告、影音分享及行動作業系統的領導者。", googleIntroText2: "總體而言，Google 依然是全球最具影響力和投資價值的科技公司之一，但投資人需關注其應對挑戰的能力。",
          coreBizTitle: "核心業務 (Core Businesses):", googleBiz1:"<i class='bi bi-search'></i> **Google 搜尋:** 全球市佔率最高的搜尋引擎，整合 AI 提供更智慧的體驗。", googleBiz2:"<i class='bi bi-badge-ad-fill'></i> **Google 廣告:** 主要營收來源，涵蓋搜尋、YouTube 及聯播網廣告。", googleBiz3:"<i class='bi bi-youtube'></i> **YouTube:** 全球最大的影音分享平台，包含 Premium 訂閱和 Shorts 短影音。", googleBiz4:"<i class='bi bi-cloud-fill'></i> **Google Cloud:** 提供雲端運算 (GCP) 和協作工具 (Workspace)，是快速增長的業務。", googleBiz5:"<i class='bi bi-android2'></i> **Android & 硬體:** 全球市佔率最高的行動作業系統，並發展 Pixel 等硬體。",
          otherBetsTitle: "其他賭注 (Other Bets):", otherBetsText: "包括 Waymo (自動駕駛)、Verily (生命科學)、Calico (抗衰老) 等長期高風險投資。",
          marketPosTitle: "市場地位與展望", marketPosText1: "Google 在其核心領域擁有無可比擬的市場主導地位。然而，它也面臨諸多挑戰與機遇：",
          challenge1:"<i class='bi bi-robot'></i> **AI 浪潮:** 既是核心驅動力，也面臨激烈競爭。", challenge2:"<i class='bi bi-gavel'></i> **監管壓力:** 全球反壟斷審查和數據隱私挑戰。", challenge3:"<i class='bi bi-clouds'></i> **雲端競爭:** 與 AWS、Azure 的市場份額爭奪戰。", challenge4:"<i class='bi bi-globe'></i> **新興市場:** 長期增長的潛力所在。",
          stockTitle: "股價分析", stockSubtitle: "追蹤 Google", stockSubtitleSpan: "的歷史股價表現", selectTimeRange: "選擇時間區間:", time1Y: "近一年", time3Y: "近三年", time5Y: "近五年", timeAll: "全部",
          financialsTitle: "財務報表", financialsSubtitle: "探索 Google", financialsSubtitleSpan: "的核心財務數據", revenueTitle: "營收與毛利趨勢", incomeTitle: "營業收入與淨利趨勢", assetsLiabilitiesTitle: "資產與負債趨勢", cashflowTitle: "現金流量趨勢",
          ratiosTitle: "財務比率", ratiosSubtitle: "評估 Google", ratiosSubtitleSpan: "的綜合財務健康狀況", ratiosIntro: "以下表格展示了根據最新財報計算出的關鍵財務比率。", ratioCategory: "類別", ratioName: "比率名稱", ratioValue: "數值 (最新季度)", ratioMeaning: "簡要含意",
          aiTitle: "Gemini AI 投資分析師", aiSubtitle: "與 AI 互動", aiSubtitleSpan: "獲取即時分析與見解",
          aiLoginPromptText1: "請先", aiLoginPromptText2: "以使用 AI 分析師功能並保存您的對話紀錄。",
          aiChatHeader: "與 Gemini AI 分析師對話", aiInputPlaceholder: "輸入您的問題...", aiSendButton: "發送", aiClearHistory: "清除歷史紀錄",
          login: "登入", logout: "登出", aiWelcome: "您好！我是您的 Gemini AI 投資分析師。請問有什麼關於 Google 投資的問題嗎？", aiThinking: "AI 正在思考中...", aiError: "抱歉，發生錯誤，請稍後再試。", aiHistoryCleared: "對話紀錄已清除。",
          eps: "每股盈餘 (EPS)", eps_m: "公司每一股普通股能賺取多少利潤。", roa: "資產報酬率 (ROA)", roa_m: "公司利用其總資產創造利潤的效率。", roe: "股東權益報酬率 (ROE)", roe_m: "公司為股東創造利潤的效率。", pe: "本益比 (PE Ratio)", pe_m: "投資人願意為公司每一元盈餘支付多少價格。", ps: "股價營收比 (PS Ratio)", ps_m: "投資人願意為公司每一元營收支付多少價格。", pm: "利潤率 (PM)", pm_m: "公司每一元營收能產生多少淨利。", current: "流動比率", current_m: "公司以流動資產償還短期負債的能力。", quick: "速動比率", quick_m: "公司以更具流動性的資產償還短期負債的能力。", cash: "現金比率", cash_m: "公司以現金及約當現金償還短期負債的能力。", invTurn: "存貨週轉率", invTurn_m: "公司管理存貨的效率。", nwcTurn: "淨營運資本週轉率", nwcTurn_m: "公司利用淨營運資本產生營收的效率。", assetTurn: "總資產週轉率", assetTurn_m: "公司利用總資產產生營收的效率。", debt: "總負債比率", debt_m: "公司總資產中有多少比例是透過負債籌措的。", de: "負債權益比", de_m: "公司負債相對於股東權益的比例。", em: "權益乘數", em_m: "衡量財務槓桿的另一指標。"
      },
      'en-US': { // Minimal English translation to ensure valid object
          siteTitle: "Google Investment Analysis", navHome: "Home", navAbout: "Overview", navStock: "Stock Analysis", navFinancials: "Financials", navRatios: "Ratios", navAI: "AI Analyst",
          heroTitle: "Google (Alphabet Inc.) ", heroTitleSpan: "Investment Analysis", heroSubtitle: "Explore Google's investment potential.", getStarted: "Get Started",
          aboutTitle: "Company Overview", aboutSubtitle: "About Google", aboutSubtitleSpan: "Core Business",
          googleIntroTitle: "About Alphabet Inc.", googleIntroText1: "Alphabet Inc. is a multinational technology conglomerate...", googleIntroText2: "Overall, Google remains influential...",
          coreBizTitle: "Core Businesses:", googleBiz1:"Search", googleBiz2:"Ads", googleBiz3:"YouTube", googleBiz4:"Cloud", googleBiz5:"Android & Hardware",
          otherBetsTitle: "Other Bets:", otherBetsText: "Waymo, Verily, Calico...",
          marketPosTitle: "Market Position", marketPosText1: "Google is dominant...",
          challenge1:"AI Wave", challenge2:"Regulatory Pressure", challenge3:"Cloud Competition", challenge4:"Emerging Markets",
          stockTitle: "Stock Analysis", stockSubtitle: "Google's Stock", stockSubtitleSpan: "Performance", selectTimeRange: "Time Range:", time1Y: "1Y", time3Y: "3Y", time5Y: "5Y", timeAll: "All",
          financialsTitle: "Financials", financialsSubtitle: "Google's", financialsSubtitleSpan: "Data", revenueTitle: "Revenue", incomeTitle: "Income", assetsLiabilitiesTitle: "Assets & Liabilities", cashflowTitle: "Cash Flow",
          ratiosTitle: "Ratios", ratiosSubtitle: "Google's", ratiosSubtitleSpan: "Health", ratiosIntro: "Key financial ratios.", ratioCategory: "Category", ratioName: "Ratio", ratioValue: "Value", ratioMeaning: "Meaning",
          aiTitle: "AI Analyst", aiSubtitle: "Interact with AI", aiSubtitleSpan: "for Insights",
          aiLoginPromptText1: "Please ", aiLoginPromptText2: " to use AI Analyst.",
          aiChatHeader: "Chat with AI", aiInputPlaceholder: "Your question...", aiSendButton: "Send", aiClearHistory: "Clear History",
          login: "Login", logout: "Logout", aiWelcome: "Hello! I'm your AI Analyst.", aiThinking: "Thinking...", aiError: "Error occurred.", aiHistoryCleared: "History cleared.",
          eps: "EPS", eps_m: "Earnings per share.", roa: "ROA", roa_m: "Return on assets.", roe: "ROE", roe_m: "Return on equity.", pe: "PE Ratio", pe_m: "Price to earnings.", ps: "PS Ratio", ps_m: "Price to sales.", pm: "Profit Margin", pm_m: "Net income / revenue.", current: "Current Ratio", current_m: "Pay short-term debt.", quick: "Quick Ratio", quick_m: "Pay short-term debt (no inventory).", cash: "Cash Ratio", cash_m: "Pay short-term debt (cash).", invTurn: "Inventory Turnover", invTurn_m: "Inventory efficiency.", nwcTurn: "NWC Turnover", nwcTurn_m: "Working capital efficiency.", assetTurn: "Total Asset Turnover", assetTurn_m: "Asset efficiency.", debt: "Total Debt Ratio", debt_m: "Assets financed by debt.", de: "Debt-to-Equity", de_m: "Debt vs equity.", em: "Equity Multiplier", em_m: "Financial leverage."
      }
  };

  // All function definitions must come before they are called in addEventListeners or DOMContentLoaded
  function switchLanguage(lang) {
      currentLang = lang;
      document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
      document.querySelectorAll('[data-lang-key]').forEach(el => {
          const key = el.getAttribute('data-lang-key');
          if (translations[lang] && translations[lang][key]) {
               if (el.placeholder) { el.placeholder = translations[lang][key]; }
               else { el.innerHTML = translations[lang][key]; }
          }
      });
      if (domElements.langTwButton) domElements.langTwButton.classList.toggle('active', lang === 'zh-TW');
      if (domElements.langEnButton) domElements.langEnButton.classList.toggle('active', lang === 'en-US');
      if (typeof updateAllCharts === "function") updateAllCharts();
      if (typeof populateRatiosTable === "function") populateRatiosTable();
      if (typeof updateAIChatLanguage === "function") updateAIChatLanguage();
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
          if (typeof loadChatHistory === "function") loadChatHistory();
      } else {
          domElements.loginButton.style.display = 'inline-block';
          domElements.logoutButton.style.display = 'none';
          domElements.userDisplay.style.display = 'none';
          if(domElements.aiLoginPrompt) domElements.aiLoginPrompt.style.display = 'block';
          if(domElements.aiChatArea) domElements.aiChatArea.style.display = 'none';
          if(domElements.chatHistory) domElements.chatHistory.innerHTML = '';
      }
  }

  function loadCSV(filePath) {
      return new Promise((resolve, reject) => {
          Papa.parse(filePath, {
              download: true, header: true, skipEmptyLines: true,
              complete: (results) => {
                  console.log(`Loaded ${filePath}: ${results.data.length} rows. First row:`, results.data[0]);
                  if (results.errors.length > 0) console.warn(`Errors parsing ${filePath}:`, results.errors);
                  resolve(results.data);
              },
              error: (error) => {
                   console.error(`Failed to load ${filePath}:`, error);
                   reject(new Error(`Failed to load ${filePath}: ${error.message}`))
              }
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
          console.log("All CSVs loaded. Pre-Process lengths:", `P:${dailyPricesData.length}, I:${incomeStatementData.length}, B:${balanceSheetData.length}, C:${cashFlowData.length}`);
          processData();
          calculateFinancialRatios();
          updateAllCharts();
          populateRatiosTable();
      } catch (error) {
          console.error("FATAL: Error during loadAllData or subsequent processing:", error);
      }
  }

  function getKey(obj, keyName) {
      if (!obj) return undefined;
      const lowerKeyName = keyName.toLowerCase();
      for (const k in obj) {
          if (k.toLowerCase() === lowerKeyName) { return obj[k]; }
      }
      if (obj.hasOwnProperty('4. close') && (keyName === '4. close' || keyName.toLowerCase() === 'close')) {
           return obj['4. close'];
      }
      if (obj.hasOwnProperty('date') && keyName.toLowerCase() === 'date') { // Explicit for date
           return obj['date'];
      }
      return undefined;
  }

 function processData() {
      console.log("Processing data...");
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
              date = new Date(parseInt(partsDash[1]), parseInt(partsDash[2]) - 1, parseInt(partsDash[3]));
              if (!isNaN(date.getTime())) return date;
           }
           const partsSlash = String(val).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
           if (partsSlash) {
               date = new Date(parseInt(partsSlash[2]), parseInt(partsSlash[0]) - 1, parseInt(partsSlash[1]));
               if (!isNaN(date.getTime())) return date;
           }
           console.warn(`[parseDate] Could not parse date string: "${val}"`);
           return null;
      };

      if (dailyPricesData.length > 0) {
          console.log("First 5 raw values for 'date' and '4. close'/'close' from dailyPricesData CSV:");
          for (let i = 0; i < Math.min(5, dailyPricesData.length); i++) {
              const row = dailyPricesData[i];
              console.log(`Row ${i}: raw date='${getKey(row, 'date')}', raw close='${getKey(row, '4. close') || getKey(row, 'close')}'`);
          }
      }

      dailyPricesData = dailyPricesData.map((d, index) => {
          const rawDate = getKey(d, 'date');
          // *** Use '4. close' explicitly, then fallback to 'close' via getKey ***
          const rawClose = d['4. close'] !== undefined ? d['4. close'] : getKey(d, 'close');

          const pDate = parseDate(rawDate);
          const pClose = parseNum(rawClose);

          if (pDate === null && rawDate && index < 10) {
              console.warn(`Date parsing failed for dailyPricesData Row ${index}: Original Date String = "${rawDate}"`);
          }
           if (pClose === null && rawClose && rawClose !== '' && rawClose !== 'None' && index < 10) { // Log only if it wasn't obviously null/empty
              console.warn(`Close price parsing failed for dailyPricesData Row ${index}: Original Close String = "${rawClose}"`);
          }

          return {
              date: pDate,
              open: parseNum(getKey(d, 'open')),
              high: parseNum(getKey(d, 'high')),
              low: parseNum(getKey(d, 'low')),
              close: pClose,
              volume: parseNum(getKey(d, 'volume'))
          };
      }).filter(d => d.date && d.close !== null)
        .sort((a, b) => a.date - b.date);

      [incomeStatementData, balanceSheetData, cashFlowData] = [incomeStatementData, balanceSheetData, cashFlowData].map(dataSet =>
          dataSet.map(d => {
              const processed = { fiscalDateEnding: parseDate(getKey(d, 'fiscalDateEnding')) };
              for (const key in d) {
                  const lowerKey = key.toLowerCase();
                  if (lowerKey !== 'fiscaldateending' && lowerKey !== 'reportedcurrency') {
                      processed[key] = parseNum(d[key]);
                  } else if (lowerKey === 'reportedcurrency') {
                       processed[key] = d[key];
                  }
              }
              return processed;
          }).filter(d => d.fiscalDateEnding).sort((a, b) => a.fiscalDateEnding - b.fiscalDateEnding)
      );
       console.log("Data Processed. Final lengths:", `P:${dailyPricesData.length}, I:${incomeStatementData.length}, B:${balanceSheetData.length}, C:${cashFlowData.length}`);
  }

  function calculateFinancialRatios() {
    console.log("Calculating financial ratios...");
    if (!incomeStatementData.length || !balanceSheetData.length) {
        console.warn("Income or Balance Sheet data not ready for ratio calculation.");
        financialRatios = {};
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

    const safeDiv = (a, b) => (a != null && b != null && a !== undefined && b !== undefined && b !== 0) ? (a / b) : null;
    const format = (val, type = 'num') => {
        if (val === null || val === undefined) return 'N/A';
        return type === 'pct' ? (val * 100).toFixed(2) + '%' : val.toFixed(2);
    };
    const epsVal = safeDiv(NI, SO);

    financialRatios = {
        eps: format(epsVal), roa: format(safeDiv(NI, TA), 'pct'), roe: format(safeDiv(NI, SE), 'pct'),
        pe: Price !== undefined ? format(safeDiv(Price, epsVal)) : 'N/A',
        ps: Price !== undefined && SO !== undefined ? format(safeDiv(Price * SO, TR)) : 'N/A',
        pm: format(safeDiv(NI, TR), 'pct'),
        current: format(safeDiv(TCA, TCL)), quick: format(safeDiv(TCA - (Inv || 0), TCL)), cash: format(safeDiv(Cash, TCL)),
        invTurn: format(safeDiv(CR, Inv)), nwcTurn: format(safeDiv(TR, TCA - TCL)), assetTurn: format(safeDiv(TR, TA)),
        debt: format(safeDiv(TL, TA), 'pct'), de: format(safeDiv(TL, SE)), em: format(safeDiv(TA, SE)),
    };
    console.log("Financial Ratios Calculated:", financialRatios);
  }

  function populateRatiosTable() {
      const tableBody = domElements.ratiosTableBody;
      if (!tableBody) {console.warn("Ratios table body not found."); return;}
      tableBody.innerHTML = '';
      console.log("Populating ratios table...");

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

              const row = `<tr><td>${catText}</td><td>${nameText}</td><td>${value}</td><td class="ratio-meaning-cell">${meaningText}</td></tr>`;
              tableBody.innerHTML += row;
          });
      });
  }

  function drawPlotlyChart(divId, data, layout) {
     const chartDiv = document.getElementById(divId);
     if (chartDiv) {
         try { Plotly.newPlot(chartDiv, data, layout); }
         catch (e) { console.error(`Plotly Error on ${divId}:`, e); chartDiv.innerHTML = `<div class="alert alert-danger">圖表繪製失敗: ${e.message}</div>`; }
     } else { console.error(`Chart div not found: ${divId}`); }
 }

 function drawPriceChart(timeRange = '1y') {
      const priceChartDivId = 'price-chart';
      const volumeChartDivId = 'volume-chart';
      const priceChartDiv = document.getElementById(priceChartDivId);
      if (!priceChartDiv) { console.warn("Price chart div not found for drawing!"); return; }

      if (!dailyPricesData || !dailyPricesData.length) {
          console.warn("No daily prices data to draw price chart.");
          Plotly.purge(priceChartDivId); Plotly.purge(volumeChartDivId);
          priceChartDiv.innerHTML = `<div class="alert alert-warning">${currentLang === 'zh-TW' ? '股價資料載入失敗或格式錯誤。' : 'Failed to load stock price data.'}</div>`;
          return;
      }
      priceChartDiv.innerHTML = ''; // Clear previous error messages

      const calcDate = new Date(); let startDate;
      switch (timeRange) {
          case '1y': startDate = new Date(new Date().setFullYear(calcDate.getFullYear() - 1)); break;
          case '3y': startDate = new Date(new Date().setFullYear(calcDate.getFullYear() - 3)); break;
          case '5y': startDate = new Date(new Date().setFullYear(calcDate.getFullYear() - 5)); break;
          default: startDate = dailyPricesData.length > 0 ? dailyPricesData[0].date : new Date(); // Ensure dailyPricesData[0] exists
      }
      const filteredData = dailyPricesData.filter(d => d.date && d.date >= startDate);

      if (!filteredData.length) {
           Plotly.purge(priceChartDivId); Plotly.purge(volumeChartDivId);
           priceChartDiv.innerHTML = `<div class="alert alert-warning">${currentLang === 'zh-TW' ? '此時間區間無股價資料。' : 'No stock price data for this period.'}</div>`;
           return;
      }

      const tracePrice = { x: filteredData.map(d => d.date), y: filteredData.map(d => d.close), type: 'scatter', mode: 'lines', name: (translations[currentLang]['stockPriceName'] || '收盤價'), line: { color: '#106eea' } };
      const traceVolume = { x: filteredData.map(d => d.date), y: filteredData.map(d => d.volume), type: 'bar', name: (translations[currentLang]['volumeName'] || '成交量'), marker: { color: '#6c757d', opacity: 0.6 } };
      const layoutOptions = { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#444444' } };

      drawPlotlyChart(priceChartDivId, [tracePrice], { title: translations[currentLang]['stockTitle'], xaxis: {title: 'Date'}, yaxis: {title: 'Price (USD)'}, ...layoutOptions });
      drawPlotlyChart(volumeChartDivId, [traceVolume], { title: (translations[currentLang]['volumeChartTitle'] || '成交量圖'), xaxis: {title: 'Date'}, yaxis: {title: 'Volume'}, ...layoutOptions });
}

function drawFinancialCharts() {
      if (!incomeStatementData.length || !balanceSheetData.length || !cashFlowData.length) {
          console.warn("Not enough data for financial charts."); return;
      }
      const dates = incomeStatementData.map(d => d.fiscalDateEnding);
      const layoutOptions = { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#444444' } };

      drawPlotlyChart('revenue-chart', [{ x: dates, y: incomeStatementData.map(d => d.totalRevenue), name: '總營收', type: 'bar' }, { x: dates, y: incomeStatementData.map(d => d.grossProfit), name: '毛利', type: 'bar' }], { title: translations[currentLang]['revenueTitle'], barmode: 'group', ...layoutOptions });
      drawPlotlyChart('income-chart', [{ x: dates, y: incomeStatementData.map(d => d.operatingIncome), name: '營業收入', type: 'line' }, { x: dates, y: incomeStatementData.map(d => d.netIncome), name: '淨利', type: 'line' }], { title: translations[currentLang]['incomeTitle'], ...layoutOptions });
      drawPlotlyChart('balance-sheet-chart', [{ x: balanceSheetData.map(d => d.fiscalDateEnding), y: balanceSheetData.map(d => d.totalAssets), name: '總資產', type: 'line' }, { x: balanceSheetData.map(d => d.fiscalDateEnding), y: balanceSheetData.map(d => d.totalLiabilities), name: '總負債', type: 'line' }, { x: balanceSheetData.map(d => d.fiscalDateEnding), y: balanceSheetData.map(d => d.totalShareholderEquity), name: '股東權益', type: 'line' }], { title: translations[currentLang]['assetsLiabilitiesTitle'], ...layoutOptions });
      drawPlotlyChart('cash-flow-chart', [{ x: cashFlowData.map(d => d.fiscalDateEnding), y: cashFlowData.map(d => d.operatingCashflow), name: '營運', type: 'bar' }, { x: cashFlowData.map(d => d.fiscalDateEnding), y: cashFlowData.map(d => d.cashflowFromInvestment), name: '投資', type: 'bar' }, { x: cashFlowData.map(d => d.fiscalDateEnding), y: cashFlowData.map(d => d.cashflowFromFinancing), name: '融資', type: 'bar' }], { title: translations[currentLang]['cashflowTitle'], barmode: 'relative', ...layoutOptions });
}

function updateAllCharts() {
    console.log("Updating all charts...");
    if (typeof drawPriceChart === "function") drawPriceChart(domElements.priceTimeRangeSelect ? domElements.priceTimeRangeSelect.value : '1y');
    if (typeof drawFinancialCharts === "function") drawFinancialCharts();
}

  function addMessageToChat(text, sender) { /* ... (保持不變) ... */ }
  function saveMessageToFirebase(text, sender) { /* ... (保持不變) ... */ }
  function loadChatHistory() { /* ... (保持不變) ... */ }
  function clearChatHistory() { /* ... (保持不變) ... */ }
  async function handleSendMessage() { /* ... (保持不變) ... */ }

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

  function handleUserInputKeypress(e) { if (e.key === 'Enter' && typeof handleSendMessage === "function") handleSendMessage(); }
  function handleTimeRangeChange(e) { if (typeof drawPriceChart === "function") drawPriceChart(e.target.value); }

  function addEventListeners() {
      const add = (el, event, handler) => {
          if (el && typeof handler === "function") {
              el.removeEventListener(event, handler);
              el.addEventListener(event, handler);
          }
      };
      add(domElements.loginButton, 'click', handleLogin); add(domElements.loginLink, 'click', handleLogin);
      add(domElements.logoutButton, 'click', handleLogout); add(domElements.sendButton, 'click', handleSendMessage);
      add(domElements.clearHistoryButton, 'click', clearChatHistory);
      add(domElements.langTwButton, 'click', () => switchLanguage('zh-TW')); add(domElements.langEnButton, 'click', () => switchLanguage('en-US'));
      add(domElements.priceTimeRangeSelect, 'change', handleTimeRangeChange);
      add(domElements.userInput, 'keypress', handleUserInputKeypress);
  }

  function initBizLandJS() {
      function toggleScrolled() { const selectBody = document.querySelector('body'); const selectHeader = document.querySelector('#header'); if (!selectHeader || !selectBody) return; window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled'); } document.addEventListener('scroll', toggleScrolled); window.addEventListener('load', toggleScrolled);
      const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle'); function mobileNavToogle() { document.querySelector('body').classList.toggle('mobile-nav-active'); mobileNavToggleBtn.classList.toggle('bi-list'); mobileNavToggleBtn.classList.toggle('bi-x'); } if (mobileNavToggleBtn) { mobileNavToggleBtn.addEventListener('click', mobileNavToogle); }
      document.querySelectorAll('#navmenu a').forEach(navmenu => { navmenu.addEventListener('click', () => { if (document.querySelector('.mobile-nav-active')) { mobileNavToogle(); } }); });
      document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => { navmenu.addEventListener('click', function(e) { e.preventDefault(); this.parentNode.classList.toggle('active'); this.parentNode.nextElementSibling.classList.toggle('dropdown-active'); e.stopImmediatePropagation(); }); });
      const preloader = document.querySelector('#preloader'); if (preloader) { window.addEventListener('load', () => { preloader.remove(); }); }
      let scrollTop = document.querySelector('.scroll-top'); function toggleScrollTop() { if (scrollTop) { window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active'); } } if (scrollTop) { scrollTop.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }); } window.addEventListener('load', toggleScrollTop); document.addEventListener('scroll', toggleScrollTop);
      if (typeof AOS !== 'undefined') { function aosInit() { AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false }); } window.addEventListener('load', aosInit); } else { console.warn("AOS library not found."); }
      if (typeof GLightbox !== 'undefined') { GLightbox({ selector: '.glightbox' }); } else { console.warn("GLightbox library not found."); }
      if (typeof PureCounter !== 'undefined') { new PureCounter(); } else { console.warn("PureCounter library not found."); }
  }

  console.log("main.js script parsed and running up to DOMContentLoaded");

  document.addEventListener('DOMContentLoaded', () => {
    try {
      console.log("DOM Fully Loaded.");
      initBizLandJS();
      assignDOMElements(); // Must be called before addEventListeners and other functions that use domElements
      addEventListeners();
      auth.onAuthStateChanged(user => { // Moved auth listener here to ensure domElements is ready
          currentUser = user;
          updateUIForAuthState(); // This will also call addEventListeners
      });
      loadAllData().then(() => {
          console.log("loadAllData finished in DOMContentLoaded.");
          // Initial language and UI setup after data is loaded
          if (!currentUser) { // If auth state hasn't fired yet or no user
              switchLanguage(currentLang);
              updateUIForAuthState(); // Ensure UI is correct for logged-out state initially
          }
      }).catch(error => {
          console.error("Error in DOMContentLoaded's loadAllData chain:", error);
      });
    } catch (e) {
        console.error("Error in DOMContentLoaded callback:", e);
        alert("頁面初始化時發生嚴重錯誤，請檢查主控台。");
    }
  });

})();