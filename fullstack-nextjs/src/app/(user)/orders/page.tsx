'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';

// 型定義をまとめて管理
type ActionType = 'return_request' | 'repurchase' | 'review_start';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

interface Purchase {
  id: number;
  userId: string;
  totalAmount: number;
  purchasedAt: Date;
  purchaseItems: PurchaseItem[];
}

// API通信用のユーティリティ関数
const apiClient = {
  async logAction(actionType: ActionType, payload: Record<string, any>) {
    return fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, ...payload })
    });
  },

  async addToCart(products: { productId: number; quantity: number }[]) {
    return fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
  }
};

// メインコンポーネント
export default function Page() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/purchase',
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();
        setPurchases(data.purchases);
      } catch (error) {
        logger.error('購入履歴取得エラー:', error as Error);
      }
    };
    fetchPurchases();
  }, []);

  // アクションハンドラーをリファクタリング
  const handleReturn = async (orderId: string, productId: string) => {
    try {
      await apiClient.logAction('return_request', { orderId, productId });
      alert('返品リクエストを受け付けました。カスタマーサービスからご連絡いたします。');
    } catch (error) {
      logger.error('返品処理に失敗しました', error as Error);
    }
  };

  const handleRepurchase = async (products: { id: string; quantity: number }[]) => {
    try {
      await apiClient.addToCart(
        products.map(p => ({
          productId: parseInt(p.id),
          quantity: p.quantity
        }))
      );
      await apiClient.logAction('repurchase', {
        products: products.map(p => p.id)
      });
      router.push('/cart');
    } catch (error) {
      logger.error('再購入処理に失敗しました', error as Error);
    }
  };

  const handleReview = async (orderId: string, productId: string) => {
    try {
      await apiClient.logAction('review_start', { orderId, productId });
      router.push(`/reviews/new?orderId=${orderId}&productId=${productId}`);
    } catch (error) {
      logger.error('レビュー画面への遷移に失敗しました', error as Error);
    }
  };

  // UI描画
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">注文履歴</h1>
      
      <div className="space-y-6">
        {purchases.map((order) => (
          <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
            {/* 注文情報ヘッダー */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
              <div>注文日: {new Date(order.purchasedAt).toLocaleDateString('ja-JP')}</div>
              <div>合計: ¥{order.totalAmount.toLocaleString()}</div>
            </div>
            
            {/* 商品リスト */}
            <div className="space-y-4">
              {order.purchaseItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-gray-700 last:border-b-0 pb-4 last:pb-0">
                  {/* 商品画像 */}
                  <div className="w-20 h-20 bg-gray-700 rounded flex-shrink-0 relative">
                    Image
                  </div>
                  
                  {/* 商品情報とアクション */}
                  <div className="flex-grow flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-white">{item.product.name}</h3>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>数量: {item.quantity}</p>
                        <p>価格: ¥{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReturn(order.id.toString(), item.productId.toString())}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        返品
                      </button>
                      <button 
                        onClick={() => handleRepurchase([{
                          id: item.product.id.toString(),
                          quantity: item.quantity
                        }])}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        再度購入
                      </button>
                      <button 
                        onClick={() => handleReview(order.id.toString(), item.productId.toString())}
                        className="px-3 py-1 text-sm border border-gray-600 text-gray-300 rounded hover:bg-gray-700"
                      >
                        レビューを書く
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}