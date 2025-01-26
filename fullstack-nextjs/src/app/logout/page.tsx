'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export default function LogoutPage() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const logout = async () => {
      // 認証状態をクリア
      clearUser();

      await fetch('/api/auth/logout', { method: 'POST' });

      // トップページにリダイレクト
      router.push('/');
    };

    logout();
  }, [clearUser, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>ログアウト中...</p>
    </div>
  );
} 