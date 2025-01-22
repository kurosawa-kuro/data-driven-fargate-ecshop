import Link from 'next/link';

export default function Page() {
  return (
    <>
      <div className="container mx-auto">
        <ul className="flex flex-wrap gap-4 list-none p-4">
          <li><Link href="/" className="hover:text-blue-500 transition-colors">ロゴ/TOP</Link></li>
          <li><Link href="/search" className="hover:text-blue-500 transition-colors">検索バー</Link></li>
          <li><Link href="/cart" className="hover:text-blue-500 transition-colors">カート</Link></li>
          <li><Link href="/login" className="hover:text-blue-500 transition-colors">ログイン/アカウント</Link></li>
          <li><Link href="/categories" className="hover:text-blue-500 transition-colors">カテゴリー</Link></li>
          <li><Link href="/orders" className="hover:text-blue-500 transition-colors">注文一覧</Link></li>
          <li><Link href="/register" className="hover:text-blue-500 transition-colors">会員登録</Link></li>
        </ul>
      </div>
      
      <h1 className="text-2xl font-bold mt-8 px-4">Public Products</h1>
    </>
  );
}
