"use strict";

const fs = require('fs');
const path = require('path');

/*************************************
 * ユーティリティ関数群
 *************************************/
// タイムスタンプ生成用定数
const TIMESTAMP_START = new Date("2024-01-01T00:00:00.000Z");
const TIMESTAMP_END   = new Date("2025-12-31T23:59:59.999Z");

/**
 * Returns a random ISO timestamp between TIMESTAMP_START and TIMESTAMP_END.
 * @returns {string} ISO formatted timestamp
 */
function getRandomTimestamp() {
  const randomTime =
    TIMESTAMP_START.getTime() +
    Math.random() * (TIMESTAMP_END.getTime() - TIMESTAMP_START.getTime());
  return new Date(randomTime).toISOString();
}

/**
 * Returns a random element from an array.
 * @param {Array} arr The array from which to pick an element.
 * @returns {*} A random element from the array.
 */
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a unique request ID.
 * @returns {string} A unique request ID.
 */
function generateRequestID() {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a unique order ID.
 * @returns {string} A unique order ID.
 */
function generateOrderID() {
  return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extracts numeric part from a string.
 * If no digits found, returns 0.
 * @param {string} id 
 * @returns {number}
 */
function parseNumericId(id) {
  const digits = id.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/*************************************
 * データ定義
 *************************************/
const LOG_COUNT = 100; // 生成するログの件数

const userList = [
  { id: "user001" },
  { id: "user002" },
  { id: "user003" },
  { id: "user004" },
  { id: "user005" },
  { id: "user006" },
  { id: "user007" },
  { id: "user008" },
  { id: "user009" },
  { id: "user010" },
  { id: "user011" },
  { id: "user012" },
  { id: "user013" },
  { id: "user014" },
  { id: "user015" },
];

const productList = [
  // 電化製品
  { id: "prod001", name: "4Kテレビ 55インチ", price: 89800, category_id: "cat001" },
  { id: "prod002", name: "ノートパソコン", price: 128000, category_id: "cat001" },
  { id: "prod003", name: "全自動洗濯機", price: 65000, category_id: "cat001" },
  { id: "prod004", name: "電子レンジ", price: 23800, category_id: "cat001" },
  { id: "prod005", name: "掃除ロボット", price: 45800, category_id: "cat001" },
  { id: "prod006", name: "ドライヤー", price: 12800, category_id: "cat001" },
  { id: "prod007", name: "コーヒーメーカー", price: 15800, category_id: "cat001" },
  { id: "prod008", name: "空気清浄機", price: 34800, category_id: "cat001" },
  { id: "prod009", name: "タブレット", price: 45800, category_id: "cat001" },
  { id: "prod010", name: "スマートスピーカー", price: 12800, category_id: "cat001" },
 
  // 書籍
  { id: "prod011", name: "プログラミング入門書", price: 2800, category_id: "cat002" },
  { id: "prod012", name: "ビジネス戦略の教科書", price: 1600, category_id: "cat002" },
  { id: "prod013", name: "人気小説セット", price: 4500, category_id: "cat002" },
  { id: "prod014", name: "料理レシピ本", price: 1800, category_id: "cat002" },
  { id: "prod015", name: "歴史写真集", price: 3800, category_id: "cat002" },
  { id: "prod016", name: "語学学習テキスト", price: 2400, category_id: "cat002" },
  { id: "prod017", name: "児童書セット", price: 5600, category_id: "cat002" },
  { id: "prod018", name: "経済学の基礎", price: 2200, category_id: "cat002" },
  { id: "prod019", name: "健康医学大全", price: 3600, category_id: "cat002" },
  { id: "prod020", name: "美術作品集", price: 4800, category_id: "cat002" },
 
  // 衣服
  { id: "prod021", name: "ビジネススーツ", price: 38000, category_id: "cat003" },
  { id: "prod022", name: "カジュアルジャケット", price: 15800, category_id: "cat003" },
  { id: "prod023", name: "デニムパンツ", price: 8900, category_id: "cat003" },
  { id: "prod024", name: "コットンシャツ", price: 4900, category_id: "cat003" },
  { id: "prod025", name: "ニットセーター", price: 6800, category_id: "cat003" },
  { id: "prod026", name: "スポーツウェア上下", price: 12800, category_id: "cat003" },
  { id: "prod027", name: "ダウンジャケット", price: 23800, category_id: "cat003" },
  { id: "prod028", name: "レインコート", price: 5800, category_id: "cat003" },
  { id: "prod029", name: "パジャマセット", price: 4800, category_id: "cat003" },
 
  // 食品
  { id: "prod030", name: "高級和牛セット", price: 28000, category_id: "cat004" },
  { id: "prod031", name: "有機野菜詰め合わせ", price: 4800, category_id: "cat004" },
  { id: "prod032", name: "果物セット", price: 5800, category_id: "cat004" },
  { id: "prod033", name: "天然魚介類セット", price: 12800, category_id: "cat004" },
  { id: "prod034", name: "調味料セット", price: 3800, category_id: "cat004" },
  { id: "prod035", name: "お菓子アソート", price: 2800, category_id: "cat004" },
  { id: "prod036", name: "健康食品セット", price: 8800, category_id: "cat004" },
  { id: "prod037", name: "ドライフルーツ詰め合わせ", price: 3200, category_id: "cat004" },
  { id: "prod038", name: "高級茶葉セット", price: 6800, category_id: "cat004" },
  { id: "prod039", name: "レトルト食品セット", price: 4200, category_id: "cat004" },
  { id: "prod040", name: "オーガニックコーヒー", price: 3600, category_id: "cat004" },
 
  // 家具
  { id: "prod041", name: "ソファーベッド", price: 78000, category_id: "cat005" },
  { id: "prod042", name: "ダイニングセット", price: 128000, category_id: "cat005" },
  { id: "prod043", name: "本棚", price: 45800, category_id: "cat005" },
  { id: "prod044", name: "デスク", price: 38000, category_id: "cat005" },
  { id: "prod045", name: "クローゼット", price: 52000, category_id: "cat005" },
  { id: "prod046", name: "テレビボード", price: 42000, category_id: "cat005" },
  { id: "prod047", name: "チェスト", price: 34800, category_id: "cat005" },
  { id: "prod048", name: "玄関収納", price: 28000, category_id: "cat005" },
  { id: "prod049", name: "サイドテーブル", price: 12800, category_id: "cat005" },
  { id: "prod050", name: "シューズラック", price: 8800, category_id: "cat005" }
 ];

const categoryList = [
  { id: "cat001", name: "電化製品" },
  { id: "cat002", name: "書籍" },
  { id: "cat003", name: "衣服" },
  { id: "cat004", name: "食品" },
  { id: "cat005", name: "家具" },
];

/*************************************
 * ドメインロジック - ログ生成処理
 *************************************/
/**
 * Generates a single payment log with the correct log format.
 * @returns {Object} A log object.
 */
function generatePaymentLog() {
  const randomUser = getRandomElement(userList);
  const randomProduct = getRandomElement(productList);
  const matchingCategory =
    categoryList.find(cat => cat.id === randomProduct.category_id) || { id: "", name: "" };
  const quantity = Math.floor(Math.random() * 5) + 1;
  
  return {
    timestamp: getRandomTimestamp(),
    request_id: generateRequestID(),
    log_type: "USER_ACTION",
    environment: "production",
    user_id: randomUser.id,
    user_agent: "example user-agent",
    client_ip: "127.0.0.1",
    country_code: "日本",
    device_type: "iPhone",
    action: "ORDER_COMPLETE",
    context: {
      page_url: "http://example.com/home",
      referrer: "http://example.com",
      session_id: "session123",
      utm_source: "",
      utm_medium: "",
      utm_campaign: ""
    },
    product_data: {
      product_id: parseNumericId(randomProduct.id),
      product_name: randomProduct.name,
      product_price: randomProduct.price,
      quantity: quantity,
      category_id: parseNumericId(matchingCategory.id),
      category_name: matchingCategory.name
    },
    search_data: {
      keyword: "",
      category_id: "",
      category_name: ""
    },
    metadata: { additional_info: "test action" },
    order_data: { order_id: generateOrderID() }
  };
}

/**
 * Generates multiple payment logs.
 * @param {number} count Number of logs to generate.
 * @returns {Array} Array of log objects.
 */
function generatePaymentLogs(count) {
  const logs = [];
  for (let i = 0; i < count; i++) {
    logs.push(generatePaymentLog());
  }
  return logs;
}

/*************************************
 * LogMaker クラス（ログの保管とフィルタリング）
 *************************************/
class LogMaker {
  constructor() {
    this.logs = [];
  }
  
  /**
   * Adds an array of logs to the internal storage.
   * @param {Array} newLogs Array of log objects.
   */
  addLogs(newLogs) {
    this.logs.push(...newLogs);
  }
  
  /**
   * Returns logs within the specified date range.
   * @param {string} startISO Start date in ISO format.
   * @param {string} endISO End date in ISO format.
   * @returns {Array} Filtered logs.
   */
  getLogsByDateRange(startISO, endISO) {
    const start = new Date(startISO);
    const end = new Date(endISO);
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= start && logTime <= end;
    });
  }
}

/*************************************
 * ファイル出力ユーティリティ
 *************************************/
/**
 * Writes logs to the given file path in newline-delimited JSON format.
 * @param {Array} logs Array of log objects.
 * @param {string} filePath Destination file path.
 */
function writeLogsToFile(logs, filePath) {
  const data = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
  fs.writeFileSync(filePath, data, "utf8");
  console.log(`Logs written to ${filePath}`);
}

/*************************************
 * メイン処理
 *************************************/
function main() {
  try {
    // ログ生成（支払いログ）
    const generatedLogs = generatePaymentLogs(LOG_COUNT);
    
    // LogMakerクラスによりログを保持
    const logMaker = new LogMaker();
    logMaker.addLogs(generatedLogs);
    console.log('Created dynamic multiple logs:', logMaker.logs);
    
    // ログを order.log に出力
    const outputFilePath = path.join(__dirname, 'order.log');
    writeLogsToFile(logMaker.logs, outputFilePath);
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

main();