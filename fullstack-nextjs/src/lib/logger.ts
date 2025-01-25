import { PrismaClient, Prisma } from '@prisma/client';
import { ActionType as PrismaActionType } from '@prisma/client';

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
      VIEW: 'PRODUCT_VIEW',
      SEARCH: 'PRODUCT_SEARCH',
      FILTER: 'PRODUCT_FILTER',
      SORT: 'PRODUCT_SORT'
    },
    CART: {
      ADD: 'CART_ADD',
      REMOVE: 'CART_REMOVE',
      UPDATE: 'CART_UPDATE',
      SAVE_FOR_LATER: 'CART_SAVE_FOR_LATER'
    },
    CHECKOUT: {
      START: 'CHECKOUT_START',
      COMPLETE: 'COMPLETE_PURCHASE',
      PAYMENT_ERROR: 'PAYMENT_ERROR',
      ADDRESS_UPDATE: 'ADDRESS_UPDATE'
    }
  },
  Post_Purchase: {
    PRODUCT: {
      BUY_AGAIN: 'PRODUCT_BUY_AGAIN',
      CANCEL: 'PURCHASE_CANCEL',
      RETURN: {
        REQUEST: 'RETURN_REQUESTED',
        COMPLETE: 'RETURN_COMPLETED'
      }
    },
    PURCHASE: {
      DELIVERY_STATUS_VIEW: 'PURCHASE_DELIVERY_STATUS_VIEW'
    }
  },
  USER: {
    LOGIN: 'USER_LOGIN',
    LOGOUT: 'USER_LOGOUT',
    REGISTER_START: 'USER_REGISTER_START',
    REGISTER_COMPLETE: 'USER_REGISTER_COMPLETE',
    PROFILE_UPDATE: 'PROFILE_UPDATE',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    DELETE_ACCOUNT: 'DELETE_ACCOUNT'
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
  requestID?: string;
  // DB保存対象のフィールド
  productId?: number;
  quantity?: number;
  cartItemId?: number;
  purchaseId?: number;
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
  requestID?: string;
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

      // 基本データ
      const logData = {
        userId: action.userId,
        requestID: action.requestID,
        actionType: action.actionType as PrismaActionType,
        productId: action.productId,
        cartItemId: action.cartItemId,
        quantity: action.metadata?.quantity as number | undefined,
        purchaseId: action.purchaseId,
        metadata: action.metadata as Prisma.InputJsonValue
      } satisfies Prisma.UserActionLogUncheckedCreateInput;

      // メタデータから特定のフィールドを抽出
      if (action.metadata) {
        const {
          quantity,
          savedForLater,
          paymentErrorDetails,
          reviewText,
          rating,
          deleteReason,
          ...restMetadata
        } = action.metadata;

        // 型安全な代入
        // if (typeof quantity === 'number') logData.quantity = quantity;
        // if (typeof savedForLater === 'boolean') logData.savedForLater = savedForLater;
        // if (typeof paymentErrorDetails === 'string') logData.paymentErrorDetails = paymentErrorDetails;
        // if (typeof reviewText === 'string') logData.reviewText = reviewText;
        // if (typeof rating === 'number') logData.rating = rating;
        // if (typeof deleteReason === 'string') logData.deleteReason = deleteReason;

        // 残りのメタデータを保存
        logData.metadata = restMetadata as Prisma.InputJsonValue;
      }

      await this.prisma.userActionLog.create({ data: logData });

    } catch (error) {
      if (error instanceof Error) {
        console.error('Logging error:', error.message);
      } else {
        console.error('Unexpected logging error');
      }
    }
  }

  private generateRequestID(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  async info(message: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date(),
      requestID: this.generateRequestID(),
      metadata
    };
    console.log(JSON.stringify(entry));
  }

  async warn(message: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date(),
      requestID: this.generateRequestID(),
      metadata
    };
    console.warn(JSON.stringify(entry));
  }

  async error(message: string, error: Error, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date(),
      requestID: this.generateRequestID(),
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
        requestID: this.generateRequestID(),
        metadata
      };
      console.debug(JSON.stringify(entry));
    }
  }

  async action(action: UserAction): Promise<void> {
    const requestID = this.generateRequestID();
    const timestamp = new Date();
    const logData = {
      level: 'action',
      type: action.actionType,
      userId: action.userId,
      requestID,
      timestamp,
      productId: action.productId,
      purchaseId: action.purchaseId,
      cartItemId: action.cartItemId,
      quantity: action.quantity
    };

    // オレンジ色で簡潔なログ出力
    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(logData));

    // DBログの処理
    if (!this.isLoggingOnlyAction(action.actionType)) {
      await this.logToDB({
        level: 'action',
        message: `User Action: ${action.actionType}`,
        timestamp,
        action,
        requestID
      }).catch(error => {
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