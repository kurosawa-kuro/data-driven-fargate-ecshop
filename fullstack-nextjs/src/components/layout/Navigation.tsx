'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

export default function Navigation() {
  const email = useAuthStore((state) => state.user.email);

  const menuItems = [
    { href: '/', label: 'ロゴ/TOP' },
    { href: '/products', label: 'products' },
    { href: '/search', label: '検索バー' },
    { href: '/cart', label: 'カート' },
    { href: '/login', label: 'ログイン/アカウント' },
    { href: '/register', label: '登録' },
    { href: '/logout', label: 'ログアウト' },
  ];

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