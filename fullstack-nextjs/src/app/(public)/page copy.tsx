import Link from 'next/link';

export default function Page() {
  return (
    <>
      <div>
        <ul className="flex items-center space-x-4">
          <li>
            <Link href="/">ロゴ/TOP</Link>
          </li>
          <li>
            <Link href="/products">products</Link>
          </li>
          <li>
            <Link href="/search">検索バー</Link>
          </li>
          <li>
            <Link href="/cart">カート</Link>
          </li>
          <li>
            <Link href="/login">ログイン/アカウント</Link>
          </li>
        </ul>
      </div>
      
      <h1>Public</h1>
    </>
  );
}
