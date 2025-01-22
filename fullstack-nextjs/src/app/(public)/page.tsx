import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <Link href="/">ロゴ/TOP</Link>
      <Link href="/products">検索バー</Link>
      <Link href="/developerTools">カート</Link>
      <Link href="/adminTools">ログイン/アカウント</Link>

      <Link href="/publicTools">カテゴリー</Link>

      <Link href="/products">注文一覧</Link>
      <Link href="/products">会員登録</Link>

      <Link href="/developerTools">開発者ツール</Link>
      <Link href="/adminTools">管理者ツール</Link>
      <Link href="/publicTools">パブリックツール</Link>
      <Link href="/sample">Auth</Link>
      <Link href="/sample">User</Link>

      <h1>Public</h1>
    </div>
  );
}
