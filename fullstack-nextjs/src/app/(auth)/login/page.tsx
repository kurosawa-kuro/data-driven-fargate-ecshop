'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/cognito';
import Cookies from 'js-cookie';

interface CognitoError extends Error {
  name: string;
  message: string;
  code?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // クライアントサイドでのクッキー設定
      Cookies.set('email', email);
      router.push('/products');
    } catch (err: unknown) {
      const error = err as CognitoError;
      setError(error.message || 'ログインに失敗しました');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mt-8 px-4">ログイン</h1>

      <form onSubmit={handleSubmit} className="mt-8 px-4 max-w-md">
        <div className="space-y-6">
          {/* Email フィールド */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black placeholder-gray-300"
              placeholder="example@example.com"
              required
            />
          </div>

          {/* パスワードフィールド */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black placeholder-gray-300"
              placeholder="********"
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
            ログイン
          </button>
        </div>
      </form>
    </>
  );
}