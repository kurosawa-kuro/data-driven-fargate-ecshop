'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

interface OrderFormData {
  name: string;
  address: string;
  cardNumber: string;
  expiryDate: string;
  securityCode: string;
  deliveryDate: string;
  paymentMethod: 'credit_card' | 'bank_transfer';
}

const calculateTotal = () => {
  const subtotal = 10000; // TODO: 実際のカート合計を計算
  const shippingFee = 550;
  return subtotal + shippingFee;
};

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    address: '',
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    deliveryDate: '明日 - 12/24（日）',
    paymentMethod: 'credit_card',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      router.push('/orders');
    } catch (error) {
      logger.error('注文の確定に失敗しました', error as Error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-white">決済ページ</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 左ペイン */}
          <div className="md:col-span-2 space-y-8">
            {/* お届け先情報 */}
            <section className="bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-white">お届け先</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">氏名</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">住所</label>
                  <input 
                    type="text" 
                    
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* お支払い方法 */}
            <section className="bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-white">お支払い方法</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="credit-card" 
                    name="payment" 
                    className="mr-2" 
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={() => setFormData({...formData, paymentMethod: 'credit_card'})}
                  />
                  <label htmlFor="credit-card" className="text-white">クレジットカード</label>
                </div>
                <div className="border border-gray-600 rounded-md p-4">
                  <input 
                    type="text" 
                    placeholder="カード番号" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mb-2 text-white"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="有効期限" 
                      className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="セキュリティコード" 
                      className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                      value={formData.securityCode}
                      onChange={(e) => setFormData({...formData, securityCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 到着予定日 */}
            <section className="bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-white">到着予定日</h2>
              <select 
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
              >
                <option>明日 - 12/24（日）</option>
                <option>12/25（月）</option>
                <option>12/26（火）</option>
              </select>
            </section>
          </div>

          {/* 右ペイン */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-white">注文サマリー</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-white">
                  <span>小計</span>
                  <span>¥10,000</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>送料</span>
                  <span>¥550</span>
                </div>
                <div className="border-t border-gray-600 pt-4 font-bold text-white">
                  <div className="flex justify-between">
                    <span>請求額合計</span>
                    <span>¥10,550</span>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
                >
                  注文を確定する
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 