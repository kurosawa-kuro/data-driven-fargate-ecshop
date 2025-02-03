const fs = require('fs');
const path = require('path');

class LogMaker {
    constructor() {
      this.logs = [];
      // Define the log file path
      this.logFilePath = path.join(__dirname, 'payment.log');
    }
  
    createPaymentLog(data) {
      // Validate required fields
      this.validateData(data);
      
      // Add additional metadata
      const enrichedLog = {
        ...data,
        logId: this.generateLogId(),
        createdAt: new Date()
      };
      
      // Store log
      this.logs.push(enrichedLog);
      
      // Process log
      this.processLog(enrichedLog);
      
      return enrichedLog;
    }
    
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
    
    generateLogId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    processLog(log) {
      // Create log message without the timestamp prefix
      const logMessage = `${JSON.stringify(log)}\n`;
      
      // If the log file exists, delete it before creating a new one
      if (fs.existsSync(this.logFilePath)) {
        try {
          fs.unlinkSync(this.logFilePath);
        } catch (err) {
          console.error('Failed to delete existing log file:', err);
        }
      }
      
      // Write log message to a new file
      fs.writeFile(this.logFilePath, logMessage, (err) => {
        if (err) {
          console.error('Failed to write log to file:', err);
        }
      });
      
      // Additional processing logic (e.g., logging to console)
      console.log('Processing log:', log);
    }
    
    // Utility methods
    searchLogs(criteria) {
      return this.logs.filter(log => 
        Object.entries(criteria).every(([key, value]) => log[key] === value)
      );
    }
    
    getLogsByDateRange(startDate, endDate) {
      return this.logs.filter(log => 
        log.timestamp >= startDate && log.timestamp <= endDate
      );
    }
    
    getTotalAmountByUser(userId) {
      return this.logs
        .filter(log => log.userId === userId)
        .reduce((sum, log) => sum + log.amount, 0);
    }
  }
  
  // Usage example
  const logMaker = new LogMaker();
  
  // Create a payment log
  const logData = {
    userId: "user123",
    action: "purchase",
    productId: "prod456",
    category: "electronics",
    quantity: 2,
    amount: 1000,
    timestamp: new Date()
  };
  
  try {
    const log = logMaker.createPaymentLog(logData);
    console.log('Created log:', log);
  } catch (error) {
    console.error('Error creating log:', error.message);
  }