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

import { PrismaClient, Prisma, ActionType as PrismaActionType } from '@prisma/client';
const prisma = new PrismaClient();

class AppLogger implements Logger {
  private async logToDB(entry: LogEntry): Promise<void> {
    try {
      if (!entry?.action?.userId) {
        console.warn('Invalid log entry: missing userId');
        return;
      }

      await prisma.userActionLog.create({
        data: {
          userId: entry.action.userId,
          actionType: this.mapActionTypeToEnum(entry.action.actionType),
          productId: entry.action.productId,
          cartItemId: entry.action.cartItemId,
          purchaseId: entry.action.purchaseId,
          metadata: entry.action.metadata as Prisma.InputJsonValue || {},
          createdAt: entry.timestamp || new Date()
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Logging error:', error.message);
      } else {
        console.error('Unexpected logging error');
      }
    }
  }

  private mapActionTypeToEnum(actionType: ActionType): PrismaActionType {
    const mapping: Record<string, PrismaActionType> = {
      'PRODUCT_VIEW': PrismaActionType.PRODUCT_VIEW,
      'CART_ADD': PrismaActionType.CART_ADD,
      'CART_REMOVE': PrismaActionType.CART_REMOVE,
      'CART_UPDATE': PrismaActionType.CART_UPDATE,
      'CHECKOUT_START': PrismaActionType.CHECKOUT_START,
      'COMPLETE_PURCHASE': PrismaActionType.COMPLETE_PURCHASE,
      'PURCHASE_CANCEL': PrismaActionType.PURCHASE_CANCEL,
      'RETURN_REQUESTED': PrismaActionType.RETURN_REQUESTED,
      'RETURN_COMPLETED': PrismaActionType.RETURN_COMPLETED,
      'USER_REGISTER_START': PrismaActionType.USER_REGISTER_START,
      'USER_REGISTER_COMPLETE': PrismaActionType.USER_REGISTER_COMPLETE,
      'USER_LOGIN': PrismaActionType.USER_LOGIN,
      'USER_LOGOUT': PrismaActionType.USER_LOGOUT,
      'PROFILE_UPDATE': PrismaActionType.PROFILE_UPDATE,
      'PASSWORD_CHANGE': PrismaActionType.PASSWORD_CHANGE,
      'DELETE_ACCOUNT': PrismaActionType.DELETE_ACCOUNT
    } as const;
    
    return mapping[actionType] || actionType as unknown as PrismaActionType;
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

    console.log('\x1b[33m%s\x1b[0m', JSON.stringify(entry));

    await this.logToDB(entry).catch(error => {
      if (error instanceof Error) {
        console.error('Failed to log action:', error.message);
      } else {
        console.error('Unexpected error while logging action');
      }
    });
  }
}

export const logger = new AppLogger();