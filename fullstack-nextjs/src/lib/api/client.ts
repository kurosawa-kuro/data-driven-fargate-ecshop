import { Purchase } from "@prisma/client";
import { Product } from "@prisma/client";

// 認証関連API
export const authAPI = {
  register: async (email: string, password: string) => {
    return executeRequest('/api/auth/register', 'POST', { email, password });
  },
  login: async (email: string, password: string) => {
    return executeRequest('/api/auth/login', 'POST', { email, password }, { credentials: 'include' });
  },
  confirm: async (email: string, code: string) => {
    return executeRequest('/api/auth/confirm', 'POST', { email, code });
  }
};

// カート関連API
export const cartAPI = {
  addToCart: async (productId: string) => {
    return executeRequest('/api/carts', 'POST', { productId });
  }
};

// チェックアウト関連API
export const checkoutAPI = {
  confirmCheckout: async (
    name: string,
    address: string,
    cardNumber: string,
    expiryDate: string,
    securityCode: string,
    deliveryDate: string,
    paymentMethod: 'credit_card' | 'bank_transfer'
  ) => {
    return executeRequest('/api/checkout/confirm', 'POST', {
      name,
      address,
      cardNumber,
      expiryDate,
      securityCode,
      deliveryDate,
      paymentMethod
    });
  }
};

// 購入履歴関連API
export const purchaseAPI = {
  fetchPurchases: async (): Promise<{ purchases: Purchase[] }> => {
    return executeRequest('/api/purchase', 'GET');
  },
  return: async (orderId: string, productId: string) => {
    const response = await fetch('/api/purchase/return', {
      method: 'POST',
      body: JSON.stringify({ orderId, productId })
    });
    return response.json();
  },
  repurchase: async (products: { id: string; quantity: number }[]) => {
    const response = await fetch('/api/purchase/repurchase', {
      method: 'POST',
      body: JSON.stringify({ products })
    });
    return response.json();
  },
  review: async (orderId: string, productId: string) => {
    const response = await fetch('/api/purchase/review', {
      method: 'POST',
      body: JSON.stringify({ orderId, productId })
    });
    return response.json();
  }
};

// 商品関連API
export const productAPI = {
  getProducts: async (): Promise<{ products: Product[] }> => {
    return executeRequest('/api/products', 'GET', null, { cache: 'no-store' });
  },
  getProduct: async (productId: string): Promise<{ product: Product }> => {
    return executeRequest(`/api/products/${productId}`, 'GET', null, { cache: 'no-store' });
  }
};

// 閲覧履歴関連API
export const historyAPI = {
  recordView: async (productId: string, userId: string) => {
    return executeRequest('/api/view-history', 'POST', { productId }, {
      headers: { 'x-user-id': userId }
    });
  }
};

// 共通リクエスト実行関数
const executeRequest = async (
  endpoint: string,
  method: string,
  body?: any,
  options?: RequestInit
): Promise<any> => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
}; 