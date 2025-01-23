export type ActionType = 
  | 'cart_add'
  | 'cart_remove'
  | 'checkout_start'
  | 'checkout_complete'
  | 'checkout_failed'
  | 'product_view'
  | 'user_login'
  | 'user_logout';

export interface UserAction {
  actionType: ActionType;
  userId?: string;
  productId?: string;
  quantity?: number;
  amount?: number;
  currency?: string;
  cartId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  method?: string;
  path?: string;
  origin?: string;
  headers?: Record<string, string>;
  geoInfo?: {
    country?: string;
    countryName?: string;
    region?: string;
    city?: string;
  };
  action?: UserAction;  // アクション情報を追加
  error?: Error | unknown;
  [key: string]: unknown;
}

export interface Logger {
  info(message: string, meta?: Partial<LogEntry>): void;
  warn(message: string, meta?: Partial<LogEntry>): void;
  error(message: string, error?: Error, meta?: Partial<LogEntry>): void;
  debug(message: string, meta?: Partial<LogEntry>): void;
  action(actionType: ActionType, data: Partial<UserAction>): void;  // アクション用メソッドを追加
}

class AppLogger implements Logger {
  private formatMessage(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    });
  }

  info(message: string, meta: Partial<LogEntry> = {}): void {
    console.log(this.formatMessage({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  }

  warn(message: string, meta: Partial<LogEntry> = {}): void {
    console.warn(this.formatMessage({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  }

  error(message: string, error?: Error, meta: Partial<LogEntry> = {}): void {
    console.error(this.formatMessage({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error?.toString(),
      stack: error?.stack,
      ...meta,
    }));
  }

  debug(message: string, meta: Partial<LogEntry> = {}): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage({
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      }));
    }
  }

  action(actionType: ActionType, data: Partial<UserAction>): void {
    const action: UserAction = {
      actionType,
      ...data,
    };
    this.info(`User Action: ${actionType}`, { action });
  }
}

export const logger = new AppLogger();