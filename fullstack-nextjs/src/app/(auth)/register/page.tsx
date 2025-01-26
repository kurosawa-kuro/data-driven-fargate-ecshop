"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authAPI.register(email, password);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      // 確認ページへリダイレクト
      router.push(`/confirm?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザー登録に失敗しました');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mt-8 px-4">アカウント登録</h1>
      <p className="mt-2 px-4 text-gray-300">
        新しいアカウントを作成してください
      </p>

      <form onSubmit={handleSubmit} className="mt-8 px-4 max-w-md">
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            登録
          </button>

          <div className="text-sm text-center">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <RegisterForm />
    </div>
  );
}