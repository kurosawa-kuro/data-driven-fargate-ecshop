はい、認証状態とユーザーロールは状態管理（Jotai）で動的に管理することを推奨します。

以下に具体的な実装案を示します：

```typescript
// src/store/auth.ts
import { atom } from 'jotai';

type UserRole = 'guest' | 'user' | 'admin';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  userId: string | null;
  username: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  role: 'guest',
  userId: null,
  username: null,
};

export const authAtom = atom<AuthState>(initialAuthState);

// デバッグ用のモック認証状態
export const mockUsers = {
  guest: {
    isAuthenticated: false,
    role: 'guest',
    userId: null,
    username: null,
  },
  user: {
    isAuthenticated: true,
    role: 'user',
    userId: 'mock-user-1',
    username: 'テストユーザー',
  },
  admin: {
    isAuthenticated: true,
    role: 'admin',
    userId: 'mock-admin-1',
    username: '管理者',
  },
} as const;
```

```typescript
// (developerTools)/components/AuthStateSwitcher.tsx
'use client';
import { useAtom } from 'jotai';
import { authAtom, mockUsers } from '@/store/auth';

export const AuthStateSwitcher = () => {
  const [, setAuth] = useAtom(authAtom);

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 text-white rounded">
      <h3 className="text-lg font-bold">認証状態切替</h3>
      {Object.entries(mockUsers).map(([key, state]) => (
        <button
          key={key}
          onClick={() => setAuth(state)}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          {state.role}として表示
        </button>
      ))}
      
      {/* 現在の認証状態表示 */}
      <div className="mt-4">
        <AuthStateViewer />
      </div>
    </div>
  );
};

// 認証状態の表示コンポーネント
const AuthStateViewer = () => {
  const [auth] = useAtom(authAtom);
  
  return (
    <div className="text-sm">
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
};
```

これにより得られるメリット：

1. **開発効率の向上**
- 認証状態の切り替えが容易
- 異なるロールでのUI検証が即座に可能
- デバッグが容易

2. **将来の本番実装への移行が容易**
```typescript
// hooks/useAuth.ts
import { useAtom } from 'jotai';
import { authAtom } from '@/store/auth';

export const useAuth = () => {
  const [auth, setAuth] = useAtom(authAtom);

  return {
    ...auth,
    login: async (credentials: Credentials) => {
      // 開発環境ではモックログイン
      if (process.env.NODE_ENV === 'development') {
        setAuth(mockUsers.user);
        return;
      }
      // 本番環境では実際の認証処理
      // const response = await cognitoLogin(credentials);
      // setAuth(response);
    },
    logout: async () => {
      setAuth(mockUsers.guest);
    },
  };
};
```

3. **認証に依存するUI実装の早期開発**
```typescript
// components/NavBar.tsx
const NavBar = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <nav>
      {isAuthenticated && (
        <>
          {role === 'admin' && <AdminMenu />}
          {role === 'user' && <UserMenu />}
        </>
      )}
      {!isAuthenticated && <GuestMenu />}
    </nav>
  );
};
```

4. **状態の永続化も容易**
```typescript
import { atomWithStorage } from 'jotai/utils';

// ローカルストレージに認証状態を保存
export const authAtom = atomWithStorage('auth', initialAuthState);
```

この方法での実装は、以下のような開発フローを可能にします：

1. UIの実装とテスト
2. 認証状態に依存する機能の実装
3. APIとの連携
4. 本番の認証システムへの移行

これにより、開発の初期段階から完成度の高いUIを実装でき、かつ後の認証実装への移行もスムーズに行えます。