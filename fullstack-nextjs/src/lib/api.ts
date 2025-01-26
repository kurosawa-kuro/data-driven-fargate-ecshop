import { Purchase } from "@prisma/client";

export const authAPI = {
  async register(email: string, password: string) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    return response;
  },

  async confirm(email: string, code: string) {
    const response = await fetch('/api/auth/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    return response;
  }
};

export const cartAPI = {
  async addToCart(productId: string) {
    const response = await fetch('/api/carts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        productId
      })
    });
    return response;
  }
};

export const checkoutAPI = {
  async confirmCheckout(
    name: string,
    address: string,
    cardNumber: string,
    expiryDate: string,
    securityCode: string,
    deliveryDate: string,
    paymentMethod: 'credit_card' | 'bank_transfer'
  ) {
    const response = await fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        address,
        cardNumber,
        expiryDate,
        securityCode,
        deliveryDate,
        paymentMethod
      })
    });
    return response;
  }
};

export const fetchPurchases = async (): Promise<{ purchases: Purchase[] }> => {
  const response = await fetch('/api/purchase', {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}; 