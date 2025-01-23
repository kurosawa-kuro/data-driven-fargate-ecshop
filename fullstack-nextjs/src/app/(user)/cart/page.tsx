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
  
//   ### カート一覧取得
// GET {{localBaseUrl}}/api/cart

// {
//   "cartItems": [
//     {
//       "id": 1,
//       "userId": "auth0|user5",
//       "productId": 1,
//       "quantity": 2,
//       "addedAt": "2025-01-23T18:25:05.132Z",
//       "product": {
//         "id": 1,
//         "name": "Smartwatch",
//         "price": 299.99,
//         "rating": 4.4,
//         "createdAt": "2025-01-23T18:25:04.260Z",
//         "updatedAt": "2025-01-23T18:25:04.260Z"
//       }
//     },
//     {
//       "id": 2,
//       "userId": "auth0|user4",
//       "productId": 2,
//       "quantity": 1,
//       "addedAt": "2025-01-23T18:25:05.132Z",
//       "product": {
//         "id": 2,
//         "name": "Tablet",
//         "price": 499.99,
//         "rating": 4.2,
//         "createdAt": "2025-01-23T18:25:04.260Z",
//         "updatedAt": "2025-01-23T18:25:04.260Z"
//       }
//     },
//     {
//       "id": 4,
//       "userId": "auth0|user2",
//       "productId": 4,
//       "quantity": 1,
//       "addedAt": "2025-01-23T18:25:05.132Z",
//       "product": {
//         "id": 4,
//         "name": "Smartphone",
//         "price": 699.99,
//         "rating": 4.3,
//         "createdAt": "2025-01-23T18:25:04.260Z",
//         "updatedAt": "2025-01-23T18:25:04.260Z"
//       }
//     },
//     {
//       "id": 5,
//       "userId": "auth0|user3",
//       "productId": 3,
//       "quantity": 3,
//       "addedAt": "2025-01-23T18:25:05.132Z",
//       "product": {
//         "id": 3,
//         "name": "Headphones",
//         "price": 199.99,
//         "rating": 4.7,
//         "createdAt": "2025-01-23T18:25:04.260Z",
//         "updatedAt": "2025-01-23T18:25:04.260Z"
//       }
//     }
//   ]
// }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    fetch('/api/cart')
      .then(response => response.json())
      .then(data => setCartItems(data.cartItems))
      .catch(error => console.error('カート一覧取得エラー:', error));
  }, []);

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = async (productId: number) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: 'cart_remove'
        })
      });
    } catch (error) {
      logger.error('カートからの削除に失敗しました', error as Error);
    }
    setCartItems(prevItems =>
      prevItems.filter(item => item.id !== productId)
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleProceedToCheckout = async () => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: 'checkout_start'
        })
      });

      router.push('/checkout');
    } catch (error) {
      logger.error('チェックアウトの開始に失敗しました', error as Error);
      // TODO: エラー処理（例：トースト表示など）
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
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
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
              <span>¥{calculateTotal().toLocaleString()}</span>
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