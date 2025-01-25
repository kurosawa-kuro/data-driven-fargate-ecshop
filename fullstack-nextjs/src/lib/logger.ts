import { PrismaClient, Prisma } from '@prisma/client';

// ----------------
// アクション定義
// ----------------
const DB_STORED_ACTIONS = [
  // 売上・在庫関連
  'CART_ADD',
  'CART_REMOVE', 
  'CART_UPDATE',
  'COMPLETE_PURCHASE',
  'PURCHASE_CANCEL',
  'RETURN_REQUESTED',
  'RETURN_COMPLETED',
  // ユーザー関連
  'USER_REGISTER_START',
  'USER_REGISTER_COMPLETE',
  'PROFILE_UPDATE',
  'USER_LOGIN',
  'USER_LOGOUT',
  'DELETE_ACCOUNT'
] as const;

const LOG_ONLY_ACTIONS = [
  // 閲覧行動
  'PRODUCT_VIEW',
  'PRODUCT_SEARCH',
  'PRODUCT_FILTER',
  'PRODUCT_SORT',
  'PRODUCT_BUY_AGAIN',
  // カート
  'CART_SAVE_FOR_LATER',
  // 決済
  'CHECKOUT_START',
  'PAYMENT_ERROR',
  'ADDRESS_UPDATE',
  // その他
  'PURCHASE_DELIVERY_STATUS_VIEW',
  'PASSWORD_CHANGE'
] as const;

// この動的に生成する方のみを残す
export const ActionLogType = {
  Pre_Purchase: {
    PRODUCT: {
      VIEW: LOG_ONLY_ACTIONS[0],      // PRODUCT_VIEW
      SEARCH: LOG_ONLY_ACTIONS[1],    // PRODUCT_SEARCH
      FILTER: LOG_ONLY_ACTIONS[2],    // PRODUCT_FILTER
      SORT: LOG_ONLY_ACTIONS[3]       // PRODUCT_SORT
    },
    CART: {
      ADD: DB_STORED_ACTIONS[0],           // CART_ADD
      REMOVE: DB_STORED_ACTIONS[1],        // CART_REMOVE
      UPDATE: DB_STORED_ACTIONS[2],        // CART_UPDATE
      SAVE_FOR_LATER: LOG_ONLY_ACTIONS[5]  // CART_SAVE_FOR_LATER
    },
    CHECKOUT: {
      START: LOG_ONLY_ACTIONS[6],     // CHECKOUT_START
      COMPLETE: DB_STORED_ACTIONS[3],      // COMPLETE_PURCHASE
      PAYMENT_ERROR: LOG_ONLY_ACTIONS[7],  // PAYMENT_ERROR
      ADDRESS_UPDATE: LOG_ONLY_ACTIONS[8]  // ADDRESS_UPDATE
    }
  },
  Post_Purchase: {
    PRODUCT: {
      BUY_AGAIN: LOG_ONLY_ACTIONS[4],  // PRODUCT_BUY_AGAIN
      CANCEL: DB_STORED_ACTIONS[3],         // PURCHASE_CANCEL
      RETURN: {
        REQUEST: DB_STORED_ACTIONS[5],      // RETURN_REQUESTED
        COMPLETE: DB_STORED_ACTIONS[6]      // RETURN_COMPLETED
      }
    },
    PURCHASE: {
      DELIVERY_STATUS_VIEW: LOG_ONLY_ACTIONS[9]  // PURCHASE_DELIVERY_STATUS_VIEW
    }
  },
  USER: {
    LOGIN: DB_STORED_ACTIONS[10],           // USER_LOGIN
    LOGOUT: DB_STORED_ACTIONS[11],          // USER_LOGOUT
    REGISTER_START: DB_STORED_ACTIONS[7],   // USER_REGISTER_START
    REGISTER_COMPLETE: DB_STORED_ACTIONS[8], // USER_REGISTER_COMPLETE
    PROFILE_UPDATE: DB_STORED_ACTIONS[9],   // PROFILE_UPDATE
    PASSWORD_CHANGE: LOG_ONLY_ACTIONS[10], // PASSWORD_CHANGE
    DELETE_ACCOUNT: DB_STORED_ACTIONS[10]   // DELETE_ACCOUNT
  }
} as const;

// ----------------
// 型定義
// ----------------
type DBStoredAction = typeof DB_STORED_ACTIONS[number];
type LogOnlyAction = typeof LOG_ONLY_ACTIONS[number];
export type ActionType = DBStoredAction | LogOnlyAction;

export interface UserAction {
  actionType: ActionType;
  userId: string;
  // DB保存対象のフィールド
  productId?: number;
  cartItemId?: number;
  purchaseId?: number;
  returnId?: number;
  returnReason?: string;
  timestamp?: Date;
  
  // ログ専用アクション用のメタデータ
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug' | 'action';
  message: string;
  timestamp: Date;
  userId?: string;
  action?: UserAction;
  error?: Error;
  metadata?: Record<string, unknown>;
}

export interface Logger {
  info(message: string, metadata?: Record<string, unknown>): Promise<void>;
  warn(message: string, metadata?: Record<string, unknown>): Promise<void>;
  error(message: string, error: Error, metadata?: Record<string, unknown>): Promise<void>;
  debug(message: string, metadata?: Record<string, unknown>): Promise<void>;
  action(action: UserAction): Promise<void>;
}

// ----------------
// ロガー実装
// ----------------
class AppLogger implements Logger {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private isLoggableAction(actionType: ActionType): actionType is DBStoredAction {
    return DB_STORED_ACTIONS.includes(actionType as DBStoredAction);
  }

  private isLoggingOnlyAction(actionType: ActionType): actionType is LogOnlyAction {
    return LOG_ONLY_ACTIONS.includes(actionType as LogOnlyAction);
  }

  private async logToDB(entry: LogEntry): Promise<void> {
    try {
      if (!entry?.action?.userId) {
        console.warn('Invalid log entry: missing userId');
        return;
      }

      const action = entry.action;
      
      if (!this.isLoggableAction(action.actionType)) {
        return;
      }

      // メタデータの型安全な処理
      const metadata: Record<string, unknown> = {
        ...(action.metadata || {}),
        ...(action.returnReason ? { returnReason: action.returnReason } : {})
      };

      const data: Prisma.UserActionLogCreateInput = {
        user: { connect: { id: action.userId } },
        actionType: action.actionType,
        product: action.productId ? { connect: { id: action.productId } } : undefined,
        cartItem: action.cartItemId ? { connect: { id: action.cartItemId } } : undefined,
        purchase: action.purchaseId ? { connect: { id: action.purchaseId } } : undefined,
        metadata: metadata as Prisma.InputJsonValue
      };

      await this.prisma.userActionLog.create({ data });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Logging error:', error.message);
      } else {
        console.error('Unexpected logging error');
      }
    }
  }

  async info(message: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date(),
      metadata
    };
    console.log(JSON.stringify(entry));
  }

  async warn(message: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date(),
      metadata
    };
    console.warn(JSON.stringify(entry));
  }

  async error(message: string, error: Error, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date(),
      error,
      metadata
    };
    console.error(JSON.stringify(entry));
  }

  async debug(message: string, metadata?: Record<string, unknown>): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: new Date(),
        metadata
      };
      console.debug(JSON.stringify(entry));
    }
  }

  async action(action: UserAction): Promise<void> {
    if (!action?.userId) {
      console.warn('Invalid action: missing userId');
      return;
    }

    const entry: LogEntry = {
      level: 'action',
      message: `User Action: ${action.actionType}`,
      timestamp: new Date(),
      action
    };

    // 全アクションをコンソールに出力
    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(entry));

    // LOGGABLE_ACTIONSのみDBに保存
    if (!this.isLoggingOnlyAction(action.actionType)) {
      await this.logToDB(entry).catch(error => {
        if (error instanceof Error) {
          console.error('Failed to log action:', error.message);
        } else {
          console.error('Unexpected error while logging action');
        }
      });
    }
  }
}

export const logger = new AppLogger();