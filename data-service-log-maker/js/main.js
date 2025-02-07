// 1. システム概要
// ```
// 目的：ECサイトの注文ログデータを生成するスクリプト
// 出力形式：newline-delimited JSON
// 期間：2024年1月から2025年12月
// ログ件数：100件（デフォルト）
// ```

// 2. データ構造
// ```
// 基本データ：
// - ユーザー（15名）
// - 商品（50種）
// - カテゴリー（5種）

// 商品カテゴリー：
// - 電化製品：10種
// - 書籍：10種
// - 衣服：9種
// - 食品：11種
// - 家具：10種
// ```

// 3. 主要機能
// ```
// a) ユーティリティ関数
// - ランダムタイムスタンプ生成
// - ユニークID生成（リクエスト・オーダー）
// - 重み付きランダム選択
// - 数値ID抽出

// b) ログ生成機能
// - 単一ログ生成
// - 複数ログ生成
// - 日付範囲でのフィルタリング

// c) ファイル操作
// - JSON形式でのログ出力
// ```

// 4. ログフォーマット
// ```json
// {
//   "timestamp": "ISO形式",
//   "request_id": "一意のID",
//   "log_type": "USER_ACTION",
//   "environment": "production",
//   "user_id": "ユーザーID",
//   "user_agent": "固定値",
//   "client_ip": "固定値",
//   "country_code": "国コード(重み付き)",
//   "device_type": "デバイス種別(重み付き)",
//   "action": "ORDER_COMPLETE",
//   "context": {
//     "page_url": "固定値",
//     "referrer": "固定値",
//     "session_id": "固定値"
//   },
//   "product_data": {
//     "product_id": "商品ID",
//     "product_name": "商品名",
//     "product_price": "価格",
//     "quantity": "数量(1-5)",
//     "category_id": "カテゴリーID",
//     "category_name": "カテゴリー名"
//   },
//   "order_data": {
//     "order_id": "一意のID"
//   }
// }
// ```

// 5. エラーハンドリング
// ```
// - try-catchによるメイン処理の例外捕捉
// - カテゴリー不一致時のフォールバック処理
// - ファイル書き込みエラーの捕捉
// ```

"use strict";

const fs = require('fs');
const path = require('path');

/*************************************************
 * ユーティリティ機能
 * 一般的なヘルパーファンクションをグループ化（単一責任：各関数は１つの処理を担当）
 *************************************************/
const Utils = {
  TIMESTAMP_START: new Date("2024-01-01T00:00:00.000Z"),
  TIMESTAMP_END: new Date("2025-12-31T23:59:59.999Z"),
  
  /**
   * Returns a random ISO timestamp between TIMESTAMP_START and TIMESTAMP_END.
   * @returns {string} ISO formatted timestamp
   */
  getRandomTimestamp: function() {
    const randomTime = this.TIMESTAMP_START.getTime() + Math.random() * (this.TIMESTAMP_END.getTime() - this.TIMESTAMP_START.getTime());
    return new Date(randomTime).toISOString();
  },
  
  /**
   * Returns a random element from an array.
   * @param {Array} arr The array from which to pick an element.
   * @returns {*} A random element from the array.
   */
  getRandomElement: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  
  /**
   * Generates a unique request ID.
   * @returns {string} A unique request ID.
   */
  generateRequestID: function() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Generates a unique order ID.
   * @returns {string} A unique order ID.
   */
  generateOrderID: function() {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Extracts numeric part from a string.
   * If no digits found, returns 0.
   * @param {string|number} id 
   * @returns {number}
   */
  parseNumericId: function(id) {
    if (typeof id === "number") return id;
    const digits = id.replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  },
  
  /**
   * Returns a random weighted item from an array of objects with 'item' and 'weight'.
   * @param {Array<{ item: any, weight: number }>} items
   * @returns {any} A weighted random item.
   */
  getRandomWeightedItem: function(items) {
    const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    for (const { item, weight } of items) {
      cumulative += weight;
      if (random < cumulative) {
        return item;
      }
    }
    return items[items.length - 1].item;
  },
  
  /**
   * Returns a country code with the following distribution:
   * 日本: 70%, アメリカ: 10%, 台湾: 7%, 韓国: 7%, 中国: 6%
   * @returns {string}
   */
  getRandomCountryCode: function() {
    const countries = [
      { item: "日本", weight: 70 },
      { item: "アメリカ", weight: 10 },
      { item: "台湾", weight: 7 },
      { item: "韓国", weight: 7 },
      { item: "中国", weight: 6 }
    ];
    return this.getRandomWeightedItem(countries);
  },
  
  /**
   * Returns a device type with the following distribution:
   * Web: 50%, Android: 25%, iPhone: 25%
   * @returns {string}
   */
  getRandomDeviceType: function() {
    const devices = [
      { item: "Web", weight: 50 },
      { item: "Android", weight: 25 },
      { item: "iPhone", weight: 25 }
    ];
    return this.getRandomWeightedItem(devices);
  }
};

/*************************************************
 * データ定義
 * ユーザー、商品、カテゴリーの定義を明確に
 *************************************************/
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
  { id: "user015" }
];

const productList = [
  // 電化製品
  { id: 1, name: "4Kテレビ 55インチ", price: 89800, category_id: 1 },
  { id: 2, name: "ノートパソコン", price: 128000, category_id: 1 },
  { id: 3, name: "全自動洗濯機", price: 65000, category_id: 1 },
  { id: 4, name: "電子レンジ", price: 23800, category_id: 1 },
  { id: 5, name: "掃除ロボット", price: 45800, category_id: 1 },
  { id: 6, name: "ドライヤー", price: 12800, category_id: 1 },
  { id: 7, name: "コーヒーメーカー", price: 15800, category_id: 1 },
  { id: 8, name: "空気清浄機", price: 34800, category_id: 1 },
  { id: 9, name: "タブレット", price: 45800, category_id: 1 },
  { id: 10, name: "スマートスピーカー", price: 12800, category_id: 1 },
  // 書籍
  { id: 11, name: "プログラミング入門書", price: 2800, category_id: 2 },
  { id: 12, name: "ビジネス戦略の教科書", price: 1600, category_id: 2 },
  { id: 13, name: "人気小説セット", price: 4500, category_id: 2 },
  { id: 14, name: "料理レシピ本", price: 1800, category_id: 2 },
  { id: 15, name: "歴史写真集", price: 3800, category_id: 2 },
  { id: 16, name: "語学学習テキスト", price: 2400, category_id: 2 },
  { id: 17, name: "児童書セット", price: 5600, category_id: 2 },
  { id: 18, name: "経済学の基礎", price: 2200, category_id: 2 },
  { id: 19, name: "健康医学大全", price: 3600, category_id: 2 },
  { id: 20, name: "美術作品集", price: 4800, category_id: 2 },
  // 衣服
  { id: 21, name: "ビジネススーツ", price: 38000, category_id: 3 },
  { id: 22, name: "カジュアルジャケット", price: 15800, category_id: 3 },
  { id: 23, name: "デニムパンツ", price: 8900, category_id: 3 },
  { id: 24, name: "コットンシャツ", price: 4900, category_id: 3 },
  { id: 25, name: "ニットセーター", price: 6800, category_id: 3 },
  { id: 26, name: "スポーツウェア上下", price: 12800, category_id: 3 },
  { id: 27, name: "ダウンジャケット", price: 23800, category_id: 3 },
  { id: 28, name: "レインコート", price: 5800, category_id: 3 },
  { id: 29, name: "パジャマセット", price: 4800, category_id: 3 },
  // 食品
  { id: 30, name: "高級和牛セット", price: 28000, category_id: 4 },
  { id: 31, name: "有機野菜詰め合わせ", price: 4800, category_id: 4 },
  { id: 32, name: "果物セット", price: 5800, category_id: 4 },
  { id: 33, name: "天然魚介類セット", price: 12800, category_id: 4 },
  { id: 34, name: "調味料セット", price: 3800, category_id: 4 },
  { id: 35, name: "お菓子アソート", price: 2800, category_id: 4 },
  { id: 36, name: "健康食品セット", price: 8800, category_id: 4 },
  { id: 37, name: "ドライフルーツ詰め合わせ", price: 3200, category_id: 4 },
  { id: 38, name: "高級茶葉セット", price: 6800, category_id: 4 },
  { id: 39, name: "レトルト食品セット", price: 4200, category_id: 4 },
  { id: 40, name: "オーガニックコーヒー", price: 3600, category_id: 4 },
  // 家具
  { id: 41, name: "ソファーベッド", price: 78000, category_id: 5 },
  { id: 42, name: "ダイニングセット", price: 128000, category_id: 5 },
  { id: 43, name: "本棚", price: 45800, category_id: 5 },
  { id: 44, name: "デスク", price: 38000, category_id: 5 },
  { id: 45, name: "クローゼット", price: 52000, category_id: 5 },
  { id: 46, name: "テレビボード", price: 42000, category_id: 5 },
  { id: 47, name: "チェスト", price: 34800, category_id: 5 },
  { id: 48, name: "玄関収納", price: 28000, category_id: 5 },
  { id: 49, name: "サイドテーブル", price: 12800, category_id: 5 },
  { id: 50, name: "シューズラック", price: 8800, category_id: 5 }
];

const categoryList = [
  { id: 1, name: "電化製品" },
  { id: 2, name: "書籍" },
  { id: 3, name: "衣服" },
  { id: 4, name: "食品" },
  { id: 5, name: "家具" }
];

/*************************************************
 * ドメインロジック - ログ生成
 * 単一ログ生成機能と複数ログ生成機能をここに集約
 *************************************************/
/**
 * Generates a single payment log.
 * Responsible for creating an individual log entry following the system's schema.
 * @returns {Object} A log object.
 */
function generatePaymentLog() {
  const randomUser = Utils.getRandomElement(userList);
  const randomProduct = Utils.getRandomElement(productList);
  const matchingCategory = categoryList.find(cat => cat.id === randomProduct.category_id) || { id: "", name: "" };
  const quantity = Math.floor(Math.random() * 5) + 1;
  
  return {
    timestamp: Utils.getRandomTimestamp(),
    request_id: Utils.generateRequestID(),
    log_type: "USER_ACTION",
    environment: "production",
    user_id: randomUser.id,
    user_agent: "example user-agent",
    client_ip: "127.0.0.1",
    country_code: Utils.getRandomCountryCode(),
    device_type: Utils.getRandomDeviceType(),
    action: "ORDER_COMPLETE",
    context: {
      page_url: "http://example.com/home",
      referrer: "http://example.com",
      session_id: "session123"
    },
    product_data: {
      product_id: Utils.parseNumericId(randomProduct.id),
      product_name: randomProduct.name,
      product_price: randomProduct.price,
      quantity: quantity,
      category_id: Utils.parseNumericId(matchingCategory.id),
      category_name: matchingCategory.name
    },
    order_data: {
      order_id: Utils.generateOrderID()
    }
  };
}

/**
 * Generates multiple payment logs.
 * Iterates to create a specified number of logs.
 * @param {number} count - Number of logs to generate.
 * @returns {Array} An array of generated log objects.
 */
function generatePaymentLogs(count) {
  const logs = [];
  for (let i = 0; i < count; i++) {
    logs.push(generatePaymentLog());
  }
  return logs;
}

/*************************************************
 * LogMaker Class - ログの管理とフィルタリング
 * 単一責任原則に基づき、ログの保管と日付範囲によるフィルタリングに専念
 *************************************************/
class LogMaker {
  constructor() {
    this.logs = [];
  }
  
  /**
   * Adds new logs to the storage.
   * @param {Array} newLogs - Array of log objects.
   */
  addLogs(newLogs) {
    this.logs.push(...newLogs);
  }
  
  /**
   * Retrieves logs that fall within the specified ISO date range.
   * @param {string} startISO - Start date in ISO format.
   * @param {string} endISO - End date in ISO format.
   * @returns {Array} Filtered log objects.
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

/*************************************************
 * ファイル出力機能
 * ログを newline-delimited JSON 形式でファイルへ書き出す責任
 *************************************************/
/**
 * Writes logs to a specified file path.
 * @param {Array} logs - Array of log objects.
 * @param {string} filePath - Destination file path.
 */
function writeLogsToFile(logs, filePath) {
  try {
    const data = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
    fs.writeFileSync(filePath, data, "utf8");
    console.log(`Logs written to ${filePath}`);
  } catch (err) {
    console.error(`Failed to write logs to ${filePath}:`, err.message);
    throw err;
  }
}

/*************************************************
 * メイン処理
 * ログ生成からファイル出力までの一連の処理を統括
 *************************************************/
function main() {
  try {
    // ログ生成
    const generatedLogs = generatePaymentLogs(LOG_COUNT);
    
    // LogMakerインスタンスでログを管理
    const logMaker = new LogMaker();
    logMaker.addLogs(generatedLogs);
    console.log('Created dynamic multiple logs:', logMaker.logs);
    
    // ログをファイルに出力
    const outputFilePath = path.join(__dirname, 'order.log');
    writeLogsToFile(logMaker.logs, outputFilePath);
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

// プログラム実行
main();