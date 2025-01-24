'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface CartItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
  };
}

// カート操作の結果型
type CartOperationResult = {
  success: boolean;
  error?: string;
};

// APIエンドポイント定数
const API_ENDPOINTS = {
  CART: '/api/cart',
  LOG: '/api/log',
} as const;

export default function Page() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // APIリクエストのエラーハンドラー
  const handleApiError = (error: Error, message: string) => {
    logger.error(message, error);
    setError(message);
  };

  // カート商品の取得
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CART);
        if (!response.ok) throw new Error('カートの取得に失敗しました');
        const data = await response.json();
        setCartItems(data.cartItems);
      } catch (error) {
        handleApiError(error as Error, 'カート一覧の取得に失敗しました');
      }
    };
    fetchCartItems();
  }, []);

  // カート操作関連の関数
  const cartOperations = {
    async updateQuantity(productId: number, newQuantity: number): Promise<CartOperationResult> {
      try {
        // 数量更新のAPIコールをここに追加予定
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        return { success: true };
      } catch (error) {
        handleApiError(error as Error, '数量の更新に失敗しました');
        return { success: false, error: '数量の更新に失敗しました' };
      }
    },

    async removeItem(productId: number): Promise<CartOperationResult> {
      try {
        const response = await fetch(API_ENDPOINTS.LOG, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionType: 'cart_remove' })
        });
        if (!response.ok) throw new Error('ログの記録に失敗しました');
        
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        return { success: true };
      } catch (error) {
        handleApiError(error as Error, 'カートからの削除に失敗しました');
        return { success: false, error: 'カートからの削除に失敗しました' };
      }
    },

    calculateTotal(): number {
      return cartItems.reduce((total, item) => 
        total + (item.product.price * item.quantity), 0
      );
    }
  };

  // チェックアウト処理
  const handleProceedToCheckout = async () => {
    try {
      router.push('/checkout');
    } catch (error) {
      handleApiError(error as Error, 'チェックアウトの開始に失敗しました');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-white">ショッピングカート</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* 商品リスト */}
        <div className="md:w-2/3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex border-b border-gray-700 py-4 gap-4">
              {/* 商品画像 */}
              <div className="w-[180px]">
                Image
              </div>
              
              {/* 商品情報 */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white">{item.product.name}</h3>
                <p className="text-gray-300">{item.product.description}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div>
                    <label className="text-gray-300">数量：</label>
                    <select 
                      value={item.quantity}
                      onChange={(e) => cartOperations.updateQuantity(item.id, Number(e.target.value))}
                      className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => cartOperations.removeItem(item.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    削除
                  </button>
                </div>
              </div>
              
              {/* 価格 */}
              <div className="text-right">
                <p className="font-semibold text-white">¥{item.product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-400">
                  小計: ¥{(item.product.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 小計 */}
        <div className="md:w-1/3">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-white">注文概要</h2>
            <div className="flex justify-between mb-4 text-white">
              <span>小計</span>
              <span>¥{cartOperations.calculateTotal().toLocaleString()}</span>
            </div>
            <button 
              onClick={handleProceedToCheckout}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              レジに進む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}