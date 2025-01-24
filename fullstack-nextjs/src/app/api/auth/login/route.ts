import { NextRequest, NextResponse } from "next/server";
import { signIn } from '@/lib/auth/cognito';
import * as jose from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const result = await signIn(email, password);
    const idToken = result?.AuthenticationResult?.IdToken;

    if (!idToken) {
      return NextResponse.json({ error: '認証トークンがありません' }, { status: 401 });
    }

    const decoded = await jose.decodeJwt(idToken);
    
    const response = NextResponse.json({ 
      success: true,
      user: {
        email: decoded.email,
        userId: decoded.sub
      }
    });

    // サーバーサイドでCookieを設定
    response.cookies.set({
      name: 'idToken',
      value: idToken,
      path: '/',
      secure: false,
      sameSite: 'lax',
      httpOnly: true,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'ログインに失敗しました' }, { status: 500 });
  }
}