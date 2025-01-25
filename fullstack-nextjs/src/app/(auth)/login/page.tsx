'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

// 認証ロジックの分離
interface LoginResponse {
  success: boolean;
  user?: {
    email: string;
    userId: string;
  };
  error?: string;
}

const useAuth = () => {
  const router = useRouter();
  
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        useAuthStore.getState().setUser(data.user);
        router.push('/products');
      }
      
      return data;
    } catch (err) {
      return { success: false, error: 'ログインに失敗しました' };
    }
  };

  return { login };
};

// フォームロジックの分離
const useLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'ログインに失敗しました');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleSubmit
  };
};

// UI コンポーネント
const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  handleSubmit
}: {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}) => (
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black placeholder-gray-300"
          placeholder="example@example.com"
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
);

// メインコンポーネント
export default function LoginPage() {
  const formProps = useLoginForm();

  return (
    <>
      <h1 className="text-2xl font-bold mt-8 px-4">ログイン</h1>
      <LoginForm {...formProps} />
    </>
  );
}