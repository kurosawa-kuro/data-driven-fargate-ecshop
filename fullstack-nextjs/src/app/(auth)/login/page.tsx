export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold mt-8 px-4">ログイン</h1>

      <form className="mt-8 px-4 max-w-md">
        <div className="space-y-6">
          {/* Email フィールド */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black placeholder-black"
              placeholder="example@example.com"
              required
            />
          </div>

          {/* パスワードフィールド */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black placeholder-black"
              placeholder="********"
              required
            />
          </div>

          {/* 登録ボタン */}
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            アカウント作成
          </button>
        </div>
      </form>
    </>
  );
}