'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

export default function Navigation() {
  const email = useAuthStore((state) => state.user.email);

  const menuItems = [
    { href: '/', label: 'ロゴ/TOP' },
    { href: '/products', label: 'products' },
    { href: '/search', label: '検索バー' },
  ];

  // ログインしていない場合のみログイン/登録リンクを追加
  if (!email) {
    menuItems.push(
      { href: '/login', label: 'ログイン' },
      { href: '/register', label: 'ユーザー登録' }
    );
  } else {
    // ログイン済みの場合のみログアウトリンクを追加
    menuItems.push({ href: '/carts', label: 'カート' });
    menuItems.push({ href: '/purchase', label: '注文履歴' });
    menuItems.push({ href: '/logout', label: 'ログアウト' });
  }

  return (
    <nav className="container mx-auto bg-gray-900">
      <ul className="flex flex-wrap gap-4 list-none p-4 items-center">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href} 
              className="hover:text-blue-500 transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
        {email && (
          <li className="ml-2 text-gray-400">
            {email}
          </li>
        )}
      </ul>
    </nav>
  );
} 