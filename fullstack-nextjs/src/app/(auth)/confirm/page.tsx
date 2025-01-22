'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmSignUp } from '@/lib/auth/cognito';
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { client } from '@/lib/auth/cognito';

interface CognitoError extends Error {
  name: string;
  message: string;
  code?: string;
}

export default function ConfirmPage() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
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
      const response = await confirmSignUp(email, code);
      console.log("Confirmation successful:", response);

      // Cognitoユーザー情報を取得
      const userCommand = new AdminGetUserCommand({
        UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        Username: email
      });
      
      const userResponse = await client.send(userCommand);
      const sub = userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;
      console.log("Got user sub:", sub);

      if (sub) {
        // ユーザー登録APIを呼び出し
        console.log("Calling user registration API...");
        const apiResponse = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, sub }),
        });

        const data = await apiResponse.json();
        console.log("User registration response:", data);
      }

      router.push('/products'); 
    } catch (err: unknown) {
      console.error('Confirmation error:', err);
      const error = err as CognitoError;
      setError(error.message || '確認コードの検証に失敗しました');
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