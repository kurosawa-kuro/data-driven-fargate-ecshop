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

export default function Page() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // カート商品の取得
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch('/api/cart');
        if (!response.ok) throw new Error('カートの取得に失敗しました');
        const data = await response.json();
        setCartItems(data.cartItems);
      } catch (error) {
        logger.error('カート一覧取得エラー:', error as Error);
        // TODO: エラー表示の実装
      }
    };
    fetchCartItems();
  }, []);

  // カート操作関連の関数
  const cartOperations = {
    updateQuantity: (productId: number, newQuantity: number) => {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    },

    removeItem: async (productId: number) => {
      try {
        const response = await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionType: 'cart_remove' })
        });
        if (!response.ok) throw new Error('ログの記録に失敗しました');
        
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      } catch (error) {
        logger.error('カートからの削除に失敗しました', error as Error);
        // TODO: エラー表示の実装
      }
    },

    calculateTotal: () => {
      return cartItems.reduce((total, item) => 
        total + (item.product.price * item.quantity), 0
      );
    }
  };

  // チェックアウト処理
  const handleProceedToCheckout = async () => {
    try {
      // const response = await fetch('/api/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ actionType: 'checkout_start' })
      // });
      // if (!response.ok) throw new Error('ログの記録に失敗しました');

      router.push('/checkout');
    } catch (error) {
      logger.error('チェックアウトの開始に失敗しました', error as Error);
      // TODO: エラー表示の実装
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