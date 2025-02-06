const fs = require('fs');
const path = require('path');

// Constant flag to control if batch writing should be used
const ENABLE_BATCH_LOG_PROCESSING = true;

// List definitions
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

// Utility function to get random element from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Stub for getting request context (to be replaced with actual implementation)
function getRequestContext() {
  return {
    headers: {
      'user-agent': 'example user-agent',
      'cf-ipcountry': 'JP',
      referer: 'http://example.com'
    },
    ip: '127.0.0.1',
    session: { id: 'session123' },
    query: {} // Assume empty query for UTM extraction
  };
}

// Stub for device type detection based on user agent
function detectDeviceType(userAgent) {
  // Simple implementation; replace with actual detection logic
  if (userAgent.includes('Mobile')) {
    return 'mobile';
  }
  return 'desktop';
}

// Stub for categorizing action types
function categorizeAction(actionType) {
  // Return a categorized action string based on actionType
  return actionType.toUpperCase();
}

// Stub for extracting UTM parameters from query
function extractUTMParams(query) {
  // Return UTM parameters if exists; placeholder implementation
  return {
    utm_source: query.utm_source || '',
    utm_medium: query.utm_medium || '',
    utm_campaign: query.utm_campaign || ''
  };
}

/* 
  Improvement Functions:
  
  - generateRandomAmount: simulate realistic amount using log-normal distribution.
  - addNoiseToData: add noise around a base value.
  - addSeasonality: add seasonal factor based on the month.
  - productRelations: indicates product associations.
  - userPreferences: indicates user purchasing tendencies.
  - introduceAnomalies: randomly introduce extreme outliers.
  - generateSessionBehavior: simulate session-related purchasing actions.
*/

// Generate a random amount using log-normal distribution
const generateRandomAmount = () => {
  return Math.exp(Math.random() + 0.5) * 1000;
};

// Add noise to a given value
const addNoiseToData = (value, noiseLevel = 0.1) => {
  return value * (1 + (Math.random() - 0.5) * noiseLevel);
};

// Add seasonal adjustment to a value based on the month
const addSeasonality = (baseAmount, date) => {
  const month = date.getMonth();
  const seasonalFactor = 1 + Math.sin((month / 12) * 2 * Math.PI) * 0.2;
  return baseAmount * seasonalFactor;
};

// Define product relations (for cross-selling scenarios)
const productRelations = {
  'prod123': ['prod456', 'prod789'],
  'prod456': ['prod123', 'prod101'],
};

// Define user purchasing preferences
const userPreferences = {
  'user123': ['electronics', 'books'],
  'user456': ['clothes', 'food'],
};

// Introduce anomalies into logs (e.g., extreme amount outliers)
const introduceAnomalies = (logs, anomalyRate = 0.05) => {
  return logs.map(log => {
    if (Math.random() < anomalyRate) {
      return {
        ...log,
        amount: log.amount * 100  // Introduce extreme outlier in amount
      };
    }
    return log;
  });
};

// Simulate session behavior for a user
const generateSessionBehavior = (userId) => {
  const sessionLength = Math.floor(Math.random() * 5) + 1;
  return Array.from({ length: sessionLength }, () => ({
    userId,
    sessionId: `${userId}-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
    activity: getRandomElement(["click", "view", "purchase", "refund"]),
    timestamp: new Date()
  }));
};

// Class responsible for file operations for log writing
class LogFileWriter {
  constructor(filePath) {
    this.logFilePath = filePath;
  }

  // Write log message to file; delete existing file if exists
  write(logMessage) {
    if (fs.existsSync(this.logFilePath)) { // If file exists, delete it
      try {
        fs.unlinkSync(this.logFilePath);
      } catch (err) {
        console.error('Failed to delete existing log file:', err);
      }
    }
    
    fs.writeFile(this.logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Failed to write log to file:', err);
      }
    });
  }
}

// Class responsible for log management (payment logs & user action logs)
class LogMaker {
  constructor() {
    this.logs = [];
    // Define the log file path for payment logs
    this.logFilePath = path.join(__dirname, 'payment.log');
    // Instantiate LogFileWriter for file operations (SRP)
    this.logWriter = new LogFileWriter(this.logFilePath);
  }

  // Creates and processes a single log entry
  createPaymentLog(data) {
    this.validateData(data);
    const enrichedLog = this.createEnrichedLog(data);
    this.logs.push(enrichedLog);
    this.processLog(enrichedLog);
    return enrichedLog;
  }

  // Creates and processes multiple log entries
  createMultiplePaymentLogs(dataArray) {
    if (!Array.isArray(dataArray)) {
      throw new Error('Input must be an array of log data objects');
    }
    
    // Validate and enrich logs for each data object
    let newLogs = dataArray.map(data => {
      this.validateData(data);
      return this.createEnrichedLog(data);
    });
    
    // Introduce anomalies randomly into the log set
    newLogs = introduceAnomalies(newLogs, 0.05);
    
    this.logs.push(...newLogs);
    
    // Process logs according to the flag (batch mode or individual processing)
    if (ENABLE_BATCH_LOG_PROCESSING) {
      this.processLogs(newLogs);
    } else {
      newLogs.forEach(log => this.processLog(log));
    }
    
    return newLogs;
  }

  // Enriches raw log data with additional metadata and improvement info
  createEnrichedLog(data) {
    const req = getRequestContext();
    return {
      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
      request_id: this.generateRequestID(),
      log_type: "ORDER_COMPLETE",
      environment: process.env.NODE_ENV || "development",
      user_id: data.userId,
      user_agent: req.headers['user-agent'],
      client_ip: req.ip,
      country_code: req.headers['cf-ipcountry'],
      device_type: detectDeviceType(req.headers['user-agent']),
      action: data.action,
      context: {
        note: "Payment log entry"
      },
      product_data: data.productId ? {
          product_id: parseInt(data.productId.replace(/\D/g, "")),  // "prod001" -> 1
          product_name: data.productName,
          product_price: data.productPrice,
          quantity: data.quantity,
          category_id: data.categoryId ? parseInt(data.categoryId.replace(/\D/g, "")) : 0, // "cat001" -> 1
          category_name: data.category
      } : undefined,
      search_data: data.searchKeyword ? {
          keyword: data.searchKeyword,
          category_id: data.searchCategoryId || 0,
          category_name: data.searchCategoryName || ""
      } : undefined,
      metadata: data.metadata || {},
      order_data: data.orderId ? {
          order_id: data.orderId.toString()
      } : undefined
    };
  }

  // Validates that necessary fields are present and valid
  validateData(data) {
    const requiredFields = ['userId', 'action', 'productId', 'category', 'quantity', 'amount', 'timestamp'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    if (data.quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (data.amount <= 0) {
      throw new Error('Amount must be positive');
    }
  }

  // Generates a unique log ID using the current timestamp and a random string
  generateLogId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Processes a single log: delegates file writing and outputs to console
  processLog(log) {
    const logMessage = `${JSON.stringify(log)}\n`;
    this.logWriter.write(logMessage);
    console.log('Processing log:', log);
  }
  
  // Processes an array of logs in batch and writes them all at once
  processLogs(logs) {
    const logMessage = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
    this.logWriter.write(logMessage);
    logs.forEach(log => console.log('Processing log:', log));
  }

  // Utility method: searches logs matching given criteria
  searchLogs(criteria) {
    return this.logs.filter(log =>
      Object.entries(criteria).every(([key, value]) => log[key] === value)
    );
  }

  // Utility method: retrieves logs within a specified date range
  getLogsByDateRange(startDate, endDate) {
    return this.logs.filter(log =>
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  // Utility method: calculates total amount for logs of a specific user
  getTotalAmountByUser(userId) {
    return this.logs
      .filter(log => log.userId === userId)
      .reduce((sum, log) => sum + log.amount, 0);
  }

  // --------------------------------------------------------------
  // New Methods for Asynchronous User Action Logging (Athena format)
  
  /**
   * Log user action asynchronously in Athena log format.
   * Only processes actions with actionType "ORDER_COMPLETE".
   * Prints log to CloudWatch (console) and conditionally saves to DB.
   */
  async logUserAction(action) {
    // Restrict logging to ORDER_COMPLETE actions only
    if (action.actionType !== "ORDER_COMPLETE") {
      console.log("Skipping user action log because action type is not ORDER_COMPLETE");
      return;
    }
    
    const athenaLog = await this.formatForAthena(action);
    
    // Send log to Athena via CloudWatch Logs (displayed in yellow)
    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(athenaLog));
    
    // Save to DB if action type is not logging-only
    if (!this.isLoggingOnlyAction(action.actionType)) {
      await this.logToDB(action);
    }
  }
  
  /**
   * Format the user action to Athena Log format.
   * Returns a Promise that resolves to the Athena log entry.
   */
  async formatForAthena(action) {
    // Retrieve request context (stub implementation)
    const req = getRequestContext();
    
    return {
      timestamp: new Date().toISOString(), // Log timestamp in ISO format
      request_id: action.requestID || this.generateRequestID(),
      log_type: 'USER_ACTION',
      environment: process.env.NODE_ENV || 'development',
      
      // User information
      user_id: action.userId,
      user_agent: req.headers['user-agent'],
      client_ip: req.ip,
      country_code: req.headers['cf-ipcountry'],
      device_type: detectDeviceType(req.headers['user-agent']),
      
      // Action information
      action: categorizeAction(action.actionType),
      
      // Context data
      context: {
        page_url: action.page_url,
        source: action.metadata?.source,
        referrer: req.headers.referer,
        session_id: req.session?.id,
        ...extractUTMParams(req.query)
      },
      
      // Product data if available
      product_data: action.productId ? {
        product_id: action.productId,
        product_name: action.productName || '',
        product_price: action.productPrice || 0,
        quantity: action.quantity || 0,
        category_id: action.categoryId || 0,
        category_name: action.categoryName || ''
      } : undefined,
      
      // Order data if available
      order_data: action.orderId ? {
        order_id: action.orderId.toString()
      } : undefined,
      
      // Search data if available
      search_data: action.searchKeyword ? {
        keyword: action.searchKeyword,
        category_id: action.searchCategoryId || 0,
        category_name: action.searchCategoryName || ''
      } : undefined,
      
      // Additional metadata merged
      ...action.metadata
    };
  }
  
  /**
   * Placeholder: Determines if the action is a logging-only action.
   * Replace with actual logic as needed.
   */
  isLoggingOnlyAction(actionType) {
    // For demonstration, assume actions of type 'VIEW' are logging-only.
    return actionType === 'VIEW';
  }
  
  /**
   * Placeholder: Logs the action to the database.
   * Replace with actual DB logging implementation.
   */
  async logToDB(action) {
    // Simulate asynchronous DB logging
    return new Promise((resolve) => {
      console.log('Logging action to DB:', action);
      setTimeout(resolve, 100); // Simulated async DB operation delay
    });
  }
  
  /**
   * Generates a unique request ID.
   */
  generateRequestID() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
  }
}

// ----- Usage example for Payment Logs -----

const logMaker = new LogMaker();

// Dynamic generation of 10 payment log entries using ORDER_COMPLETE only
const dynamicMultipleLogData = Array.from({ length: 10 }, () => {
  const randomUser = getRandomElement(userList);
  const randomProduct = getRandomElement(productList);
  // Get corresponding category for consistency with product
  const matchingCategory = categoryList.find(cat => cat.id === randomProduct.category_id) || randomProduct;
  const action = "ORDER_COMPLETE"; // 固定値で設定
  const quantity = Math.floor(Math.random() * 5) + 1;
  
  // Calculate base amount from product price and quantity, then apply noise and seasonality
  let baseAmount = randomProduct.price * quantity;
  baseAmount = addNoiseToData(baseAmount);
  baseAmount = addSeasonality(baseAmount, new Date());
  
  return {
    userId: randomUser.id,
    action: action,
    productId: randomProduct.id,            // e.g. "prod001"
    productName: randomProduct.name,          // e.g. "4Kテレビ 55インチ"
    productPrice: randomProduct.price,        // e.g. 89800
    categoryId: matchingCategory.id,          // e.g. "cat001"
    category: matchingCategory.name,          // e.g. "電化製品"
    quantity: quantity,
    amount: baseAmount,
    timestamp: new Date()
  };
});

try {
  const logs = logMaker.createMultiplePaymentLogs(dynamicMultipleLogData);
  console.log('Created dynamic multiple logs:', logs);
} catch (error) {
  console.error('Error creating dynamic multiple logs:', error.message);
}

// ----- Usage example for User Action Logging -----
const sampleUserAction = {
  requestID: null, // Will be generated dynamically if null
  userId: 'user123',
  actionType: 'ORDER_COMPLETE', // Changed to ORDER_COMPLETE
  page_url: 'http://example.com/home',
  productId: 'prod001',
  productName: '4Kテレビ 55インチ',
  productPrice: 89800,
  quantity: 1,
  categoryId: 'cat001',
  categoryName: '電化製品',
  orderId: 'order789',
  searchKeyword: 'テレビ',
  searchCategoryId: 'cat001',
  searchCategoryName: '電化製品',
  metadata: { additional_info: 'test action' }
};

(async () => {
  try {
    await logMaker.logUserAction(sampleUserAction);
  } catch (err) {
    console.error('Error logging user action:', err);
  }
})();