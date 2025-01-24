import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/(auth)/login/page';
import { signIn } from '@/lib/auth/cognito';
import { useAuthStore } from '@/stores/auth.store';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/lib/auth/cognito', () => ({
  signIn: jest.fn()
}));

// joseモジュール全体をモック
jest.mock('jose', () => ({
  decodeJwt: () => Promise.resolve({
    email: 'test@example.com',
    sub: 'user123'
  })
}));

jest.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      setUser: jest.fn()
    })
  }
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('フォームが正しく表示されること', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('ログイン成功時に/productsにリダイレクトされること', async () => {
    const mockIdToken = 'mock-id-token';
    (signIn as jest.Mock).mockResolvedValueOnce({
      AuthenticationResult: {
        IdToken: mockIdToken
      }
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('パスワード'), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/products');
    });
  });

  it('ログイン失敗時にエラーメッセージが表示されること', async () => {
    (signIn as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('パスワード'), { 
      target: { value: 'wrongpassword' } 
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
    });
  });

  it('必須フィールドが空の場合にフォーム送信を防ぐこと', () => {
    render(<LoginPage />);
    
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(signIn).not.toHaveBeenCalled();
  });
});
