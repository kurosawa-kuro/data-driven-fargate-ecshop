import Link from 'next/link';

export default function Navigation() {
  const menuItems = [
    { href: '/', label: 'ロゴ/TOP' },
    { href: '/products', label: 'products' },
    { href: '/search', label: '検索バー' },
    { href: '/cart', label: 'カート' },
    { href: '/login', label: 'ログイン/アカウント' },
    { href: '/register', label: '登録' },
  ];

  return (
    <nav className="container mx-auto bg-gray-900 ">
      <ul className="flex flex-wrap gap-4 list-none p-4">
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
      </ul>
    </nav>
  );
} 