'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { authAPI } from '@/lib/api';

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
}

const useLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(email, password);
      const data = await response.json();
      
      if (data.success) {
        useAuthStore.getState().setUser(data.user);
        router.push('/products');
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('ログインに失敗しました');
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

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  error
}) => {
  return (
    <>
      <h1 className="text-2xl font-bold mt-8 px-4">ログイン</h1>
      <p className="mt-2 px-4 text-gray-300">
        アカウントにログインしてください
      </p>

      <form onSubmit={onSubmit} className="mt-8 px-4 max-w-md">
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
            ログイン
          </button>

          <div className="text-sm text-center">
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

const LoginPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleSubmit
  } = useLoginForm();

  return (
    <div className="min-h-screen">
      <LoginForm
        onSubmit={handleSubmit}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
      />
    </div>
  );
};

export default LoginPage;