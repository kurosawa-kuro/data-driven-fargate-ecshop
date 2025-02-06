"use strict";

const fs = require('fs');
const path = require('path');

/*************************************
 * タイムスタンプ生成関連定数とグローバル変数
 *************************************/
const TIMESTAMP_START = new Date("2024-01-01T00:00:00.000Z"); // 生成開始日時
const TIMESTAMP_END   = new Date("2025-12-31T23:59:59.999Z"); // 生成終了日時
let lastTimestamp = TIMESTAMP_START;

/**
 * Generates a random timestamp between TIMESTAMP_START and TIMESTAMP_END.
 *
 * @returns {string} ISO formatted timestamp
 */
function getRandomTimestamp() {
  const startTime = TIMESTAMP_START.getTime();
  const endTime = TIMESTAMP_END.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString();
}

/*************************************
 * 定数およびその他のデータ定義
 *************************************/
const ENABLE_BATCH_LOG_PROCESSING = true;
const LOG_COUNT = 10; // 生成するログの件数

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
 * ユーティリティ関数群
 *************************************/

/**
 * Returns a random element from an array.
 * @param {Array} arr 
 * @returns {*} A random element from arr.
 */
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a random country.
 * 80% chance to return "日本", otherwise random from other options.
 * @returns {string}
 */
function getRandomCountry() {
  if (Math.random() < 0.8) {
    return "日本";
  }
  const otherCountries = ["アメリカ", "中国", "韓国", "台湾", "ベトナム"];
  return getRandomElement(otherCountries);
}

/**
 * Adds noise to the value.
 * @param {number} value 
 * @param {number} noiseLevel 
 * @returns {number}
 */
function addNoiseToData(value, noiseLevel = 0.1) {
  return value * (1 + (Math.random() - 0.5) * noiseLevel);
}

/**
 * Adds seasonal adjustment based on the month.
 * @param {number} baseAmount 
 * @param {Date} date 
 * @returns {number}
 */
function addSeasonality(baseAmount, date) {
  const month = date.getMonth();
  const seasonalFactor = 1 + Math.sin((month / 12) * 2 * Math.PI) * 0.2;
  return baseAmount * seasonalFactor;
}

/*************************************
 * LogMaker クラス（ユーザーアクションログ機能は削除済）
 *************************************/
class LogMaker {
  constructor() {
    this.logs = [];
  }
  
  /**
   * Create multiple payment logs from provided data array.
   * @param {Array} logDataArray 
   * @returns {Array} Generated logs
   */
  createMultiplePaymentLogs(logDataArray) {
    logDataArray.forEach(data => {
      // timestamp が Date 型の場合は ISO 文字列に変換
      if (data.timestamp instanceof Date) {
        data.timestamp = data.timestamp.toISOString();
      }
      this.logs.push(data);
    });
    return this.logs;
  }
  
  /**
   * Returns logs within the specified date range.
   * @param {string} startISO 
   * @param {string} endISO 
   * @returns {Array}
   */
  getLogsByDateRange(startISO, endISO) {
    const start = new Date(startISO);
    const end = new Date(endISO);
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= start && logTime <= end;
    });
  }
  
  /**
   * Generates a unique request ID.
   * @returns {string}
   */
  generateRequestID() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/*************************************
 * 使用例（ユーザーアクションログ機能は使用せず、支払いログのみ生成）
 *************************************/
const logMaker = new LogMaker();

// 動的に LOG_COUNT 件の支払いログサンプルを生成（各ログはランダムな timestamp を有する）
const dynamicMultipleLogData = Array.from({ length: LOG_COUNT }, () => {
  const randomUser = getRandomElement(userList);
  const randomProduct = getRandomElement(productList);
  const matchingCategory = categoryList.find(cat => cat.id === randomProduct.category_id) || randomProduct;
  const action = "ORDER_COMPLETE";
  const quantity = Math.floor(Math.random() * 5) + 1;
  
  return {
    userId: randomUser.id,
    action: action,
    productId: randomProduct.id,
    productName: randomProduct.name,
    productPrice: randomProduct.price,
    categoryId: matchingCategory.id,
    category: matchingCategory.name,
    quantity: quantity,
    timestamp: getRandomTimestamp()
  };
});

// グローバル変数 logs を利用してログを生成
let logs = [];
try {
  logs = logMaker.createMultiplePaymentLogs(dynamicMultipleLogData);
  console.log('Created dynamic multiple logs:', logs);
} catch (error) {
  console.error('Error creating dynamic multiple logs:', error.message);
}

// 指定期間内のログをフィルタリング（現在時刻から10分後まで）
const now = new Date();
const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
const logsWithinRange = logMaker.getLogsByDateRange(now.toISOString(), tenMinutesLater.toISOString());
console.log('Logs within specified date range:', logsWithinRange);

// 結果を order.log に書き出す（各ログを JSON 文字列で改行区切りにする）
const outputFilePath = path.join(__dirname, 'order.log');
fs.writeFileSync(outputFilePath, logs.map(log => JSON.stringify(log)).join('\n') + '\n', "utf8");
console.log(`Logs written to ${outputFilePath}`);