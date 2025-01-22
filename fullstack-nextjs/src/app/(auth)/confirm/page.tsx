'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmSignUp } from '@/lib/auth/cognito';

export default function ConfirmPage() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [userSub, setUserSub] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await confirmSignUp(email, code );
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mt-8 px-4">メールアドレスの確認</h1>
      <p className="mt-2 px-4 text-gray-300">
        {email} に送信された確認コードを入力してください
      </p>

      <form onSubmit={handleSubmit} className="mt-8 px-4 max-w-md">
        <div className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-white">
              確認コード
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black placeholder-gray-300"
              placeholder="123456"
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
            確認
          </button>
        </div>
      </form>
    </>
  );
}