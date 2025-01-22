import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <Link href="/">Top</Link>
      <Link href="/products">Products</Link>
      <Link href="/developerTools">開発者ツール</Link>
      <Link href="/adminTools">管理者ツール</Link>
      <Link href="/publicTools">パブリックツール</Link>
      <Link href="/sample">Auth</Link>
      <Link href="/sample">User</Link>

      <h1>Public</h1>
    </div>
  );
}
