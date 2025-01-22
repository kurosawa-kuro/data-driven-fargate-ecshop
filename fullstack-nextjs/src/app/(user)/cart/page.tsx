'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

export default function Page() {
  // サンプルデータ（実際はAPIやRedux/Contextから取得）
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Sample Product 1",
      price: 2000,
      quantity: 1,
      image: "https://picsum.photos/id/1/180/200",
      description: "This is a sample product description"
    },
    {
      id: 2,
      name: "Sample Product 2",
      price: 3000,
      quantity: 2,
      image: "https://picsum.photos/id/2/180/200",
      description: "This is another sample product description"
    },
    {
      id: 3,
      name: "Sample Product 3",
      price: 4000,
      quantity: 3,
      image: "https://picsum.photos/id/3/180/200",
      description: "This is another sample product description"
    },
    // ... 他の商品
  ]);

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setCartItems(prevItems =>
      prevItems.filter(item => item.id !== productId)
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
                <Image
                  src={item.image}
                  alt={item.name}
                  width={180}
                  height={200}
                  className="rounded-lg"
                />
              </div>
              
              {/* 商品情報 */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="text-gray-300">{item.description}</p>
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
                <p className="font-semibold text-white">¥{item.price.toLocaleString()}</p>
                <p className="text-sm text-gray-400">
                  小計: ¥{(item.price * item.quantity).toLocaleString()}
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
            <Link href="/checkout"> 
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                レジに進む
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}