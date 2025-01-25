import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

// マッチャー設定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}

// トークン取得とデコード処理を担当
class TokenProcessor {
  private request: NextRequest;

  constructor(request: NextRequest) {
    this.request = request;
  }

  // Cookieからトークンを取得
  getIdToken(): string | undefined {
    const idToken = this.request.cookies.get('idToken')?.value || 
                   this.request.headers.get('cookie')?.split(';')
                     .find(c => c.trim().startsWith('idToken='))
                     ?.split('=')[1];

    return idToken;
  }

  // トークンをデコードしてユーザー情報を取得
  async decodeToken(idToken: string): Promise<{ email?: string, sub?: string } | null> {
    try {
      const decodedIdToken = await jose.decodeJwt(idToken);
      
      if (decodedIdToken.email && decodedIdToken.sub) {
        return {
          email: String(decodedIdToken.email),
          sub: String(decodedIdToken.sub)
        };
      }
    } catch (error) {
      console.error('Token decode error:', error);
    }
    return null;
  }
}

// ヘッダー処理を担当
class HeaderManager {
  private headers: Headers;

  constructor(originalHeaders: Headers) {
    this.headers = new Headers(originalHeaders);
  }

  setRequestId(requestID: string): void {
    this.headers.set('x-request-id', requestID);
  }

  // ユーザー情報をヘッダーに設定
  setUserInfo(email: string, userId: string): void {
    this.headers.set('x-user-email', email);
    this.headers.set('x-user-id', userId);
  }

  getHeaders(): Headers {
    return this.headers;
  }
}

// メインのミドルウェア関数
export async function middleware(request: NextRequest) {
  // console.log("hit middleware");

  // ランダムでリクエストIDを生成
  const requestID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  // console.log("middleware requestID", requestID);

  const tokenProcessor = new TokenProcessor(request);
  const headerManager = new HeaderManager(request.headers);
  headerManager.setRequestId(requestID);

  const idToken = tokenProcessor.getIdToken();
  
  if (idToken) {
    const userInfo = await tokenProcessor.decodeToken(idToken);
    if (userInfo?.email && userInfo.sub) {
      headerManager.setUserInfo(userInfo.email, userInfo.sub);    
    }
  }

  return NextResponse.next({
    request: {
      headers: headerManager.getHeaders(),
    },
  });
}