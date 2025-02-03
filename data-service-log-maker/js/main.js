const fs = require('fs');
const path = require('path');

// Constant flag to control if batch writing should be used
const ENABLE_BATCH_LOG_PROCESSING = true;

// List definitions
const userList = [
  { id: "user123" },
  { id: "user456" },
  { id: "user789" },
  { id: "user101" },
  { id: "user102" },
  { id: "user103" },
  { id: "user104" },
  { id: "user105" },
];

const productList = [
  { id: "prod123", name: "product1", price: 1000, category: "electronics" },
  { id: "prod456", name: "product2", price: 2000, category: "electronics" },
];

const categoryList = [
  { id: "cat123", name: "electronics" },
  { id: "cat456", name: "books" },
  { id: "cat789", name: "clothes" },
  { id: "cat101", name: "food" },
  { id: "cat102", name: "furniture" },
];

// Utility function to get random element from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

// Class responsible for log management (creation, validation, enrichment)
class LogMaker {
  constructor() {
    this.logs = [];
    // Define the log file path
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
    // Enrich the log with a unique ID and creation timestamp
    const enrichedLog = {
      ...data,
      logId: this.generateLogId(),
      createdAt: new Date(),
      // Add related product information if exists
      relatedProducts: productRelations[data.productId] || [],
      // Add user purchasing preferences if exists
      userPreferences: userPreferences[data.userId] || [],
      // Simulate session behavior for this log entry
      sessionBehavior: generateSessionBehavior(data.userId)
    };
    return enrichedLog;
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
}

// ----- Usage example -----

const logMaker = new LogMaker();

// Dynamically generate 10 log entries using random values from userList, productList, and categoryList
const dynamicMultipleLogData = Array.from({ length: 10 }, () => {
  const randomUser = getRandomElement(userList);
  const randomProduct = getRandomElement(productList);
  const randomCategory = getRandomElement(categoryList);
  const randomAction = Math.random() > 0.5 ? "purchase" : "refund";
  const quantity = Math.floor(Math.random() * 5) + 1;
  
  // Calculate base amount from product price and quantity
  let baseAmount = randomProduct.price * quantity;
  // Add noise and seasonality to simulate realistic price fluctuation
  baseAmount = addNoiseToData(baseAmount);
  baseAmount = addSeasonality(baseAmount, new Date());
  
  return {
    userId: randomUser.id,
    action: randomAction,
    productId: randomProduct.id,
    category: randomCategory.name,
    quantity: quantity,
    amount: baseAmount,
    timestamp: new Date()
  };
});

try {
  // Create multiple logs with the generated dynamic data
  const logs = logMaker.createMultiplePaymentLogs(dynamicMultipleLogData);
  console.log('Created dynamic multiple logs:', logs);
} catch (error) {
  console.error('Error creating dynamic multiple logs:', error.message);
}