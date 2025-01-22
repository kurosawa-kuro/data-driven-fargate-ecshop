import SampleList from '../../components/SampleList';
import SampleForm from '../../components/SampleForm';
import SystemCheck from '../../components/SystemCheck';
import Link from 'next/link';

export default function Page() {
  return (
    <>
    <div className="container mx-auto">
      <ul className="flex flex-wrap gap-4 list-none p-4">
        <li><Link href="/" className="hover:text-blue-500">ロゴ/TOP</Link></li>
        <li><Link href="/products" className="hover:text-blue-500">検索バー</Link></li>
        <li><Link href="/developerTools" className="hover:text-blue-500">カート</Link></li>
        <li><Link href="/adminTools" className="hover:text-blue-500">ログイン/アカウント</Link></li>
        <li><Link href="/publicTools" className="hover:text-blue-500">カテゴリー</Link></li>
        <li><Link href="/products" className="hover:text-blue-500">注文一覧</Link></li>
        <li><Link href="/products" className="hover:text-blue-500">会員登録</Link></li>
        <li><Link href="/developerTools" className="hover:text-blue-500">開発者ツール</Link></li>
        <li><Link href="/adminTools" className="hover:text-blue-500">管理者ツール</Link></li>
        <li><Link href="/publicTools" className="hover:text-blue-500">パブリックツール</Link></li>
        <li><Link href="/sample" className="hover:text-blue-500">Auth</Link></li>
        <li><Link href="/sample" className="hover:text-blue-500">User</Link></li>
      </ul>
    </div>
   <h1>DeveloperTools</h1>
   </>
  );
}
