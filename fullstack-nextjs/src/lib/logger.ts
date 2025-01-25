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
      REVIEW: 'PRODUCT_REVIEW',
      RETURN: {
        REQUEST: 'RETURN_REQUESTED',
        COMPLETE: 'RETURN_COMPLETED',
        CANCEL: 'RETURN_CANCELLED'
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

export type ActionType = 
  | 'PRODUCT_VIEW' | 'PRODUCT_SEARCH' | 'PRODUCT_FILTER' | 'PRODUCT_SORT'
  | 'CART_ADD' | 'CART_REMOVE' | 'CART_UPDATE' | 'CART_SAVE_FOR_LATER'
  | 'CHECKOUT_START' | 'COMPLETE_PURCHASE' | 'PAYMENT_ERROR' | 'ADDRESS_UPDATE'
  | 'PRODUCT_BUY_AGAIN' | 'PURCHASE_CANCEL' | 'PRODUCT_REVIEW'
  | 'RETURN_REQUESTED' | 'RETURN_COMPLETED' | 'RETURN_CANCELLED'
  | 'PURCHASE_DELIVERY_STATUS_VIEW'
  | 'USER_LOGIN' | 'USER_LOGOUT' | 'USER_REGISTER_START' | 'USER_REGISTER_COMPLETE'
  | 'PROFILE_UPDATE' | 'PASSWORD_CHANGE' | 'DELETE_ACCOUNT';

export interface UserAction {
  actionType: ActionType;
  userId: string;
  productId?: number;
  cartItemId?: number;
  purchaseId?: number;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
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

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

class AppLogger implements Logger {
  private async logToDB(entry: LogEntry): Promise<void> {
    if (entry.action) {
      await prisma.userActionLog.create({
        data: {
          userId: entry.action.userId,
          actionType: this.mapActionTypeToEnum(entry.action.actionType),
          productId: entry.action.productId,
          cartItemId: entry.action.cartItemId,
          purchaseId: entry.action.purchaseId,
          metadata: entry.action.metadata as Prisma.InputJsonValue,
          createdAt: entry.timestamp || new Date()
        }
      });
    }
  }

  private mapActionTypeToEnum(actionType: ActionType): any {
    const mapping: Record<string, any> = {
      'PRODUCT_VIEW': 'VIEW_PRODUCT',
      'CART_ADD': 'ADD_TO_CART',
      'CART_REMOVE': 'REMOVE_FROM_CART',
      'CART_UPDATE': 'UPDATE_CART',
      'CHECKOUT_START': 'START_CHECKOUT',
      'COMPLETE_PURCHASE': 'COMPLETE_PURCHASE',
      'PURCHASE_CANCEL': 'CANCEL_PURCHASE',
      'RETURN_REQUESTED': 'RETURN_REQUESTED',
      'RETURN_COMPLETED': 'RETURN_COMPLETED',
      'RETURN_CANCELLED': 'RETURN_CANCELLED'
    };
    return mapping[actionType] || actionType;
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
    const entry: LogEntry = {
      level: 'action',
      message: `User Action: ${action.actionType}`,
      timestamp: new Date(),
      action
    };
    await this.logToDB(entry);
    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(entry));
  }
}

export const logger = new AppLogger();