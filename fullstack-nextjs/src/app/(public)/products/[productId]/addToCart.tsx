'use client';

import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/auth.store';
// import { headers } from "next/headers";

export function CartActions({ productData }: { productData: any }) {
  const router = useRouter();
  const { user } = useAuthStore(); // Zustandのstoreから直接userを取得
  console.log("addToCart - user:", user);

  const handleAddToCart = async () => {
    try {
      if (!user?.userId) {
        // ユーザーが未ログインの場合はログインページへリダイレクト
        router.push('/login');
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productData.id,
          quantity: 1
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('カートへの追加に失敗しました');
      }

      // 成功時の処理（オプション）
      router.push('/cart');
    } catch (error) {
      logger.error('カートへの追加に失敗しました', error as Error);
    }
  };

  const handleMoveToCart = () => {
    router.push('/cart');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-white">
          <span className="text-lg font-medium">価格:</span>
          <span className="text-xl font-bold">¥{productData.price.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-white">
          <span className="text-lg font-medium">数量:</span>
          <span className="text-xl font-bold">1</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          カートに追加
        </button>
        <button
          onClick={handleMoveToCart}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          カートへ移動
        </button>
        <p className="text-sm text-gray-400 text-center">
          通常配送 2-4 日でお届け
        </p>
      </div>
    </div>
  );
}