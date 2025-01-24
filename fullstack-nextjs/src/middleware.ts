import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const idToken = request.cookies.get('idToken')?.value;
  
  // クローンではなく新しいヘッダーを作成
  const requestHeaders = new Headers(request.headers);

  if (idToken) {
    try {
      const decodedIdToken = await jose.decodeJwt(idToken);
      
      if (typeof decodedIdToken.email === 'string') {
        // カスタムヘッダーを設定
        requestHeaders.set('x-user-email', decodedIdToken.email);
        if (typeof decodedIdToken.sub === 'string') {
          requestHeaders.set('x-user-id', decodedIdToken.sub);
        }
        // Cookieを明示的に設定
        requestHeaders.set('cookie', `idToken=${idToken}`);
      }
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }

  // // デバッグ用
  // console.log('Middleware - Request path:', request.nextUrl.pathname);
  // console.log('Middleware - Headers:', Object.fromEntries(requestHeaders.entries()));

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // レスポンスヘッダーにも設定（クライアントサイドで利用可能にする）
  if (idToken) {
    try {
      const decodedIdToken = await jose.decodeJwt(idToken);
      if (typeof decodedIdToken.email === 'string') {
        response.headers.set('x-user-email', decodedIdToken.email);
        if (typeof decodedIdToken.sub === 'string') {
          response.headers.set('x-user-id', decodedIdToken.sub);
        }
      }
    } catch (error) {
      console.error('Token decode error in response:', error);
    }
  }

  // APIルートの場合は特別な処理
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // APIルート用のヘッダーを設定
    response.headers.append('x-middleware-override-headers', 'x-user-email,x-user-id');
    response.headers.append('x-middleware-request-x-user-email', requestHeaders.get('x-user-email') || '');
    response.headers.append('x-middleware-request-x-user-id', requestHeaders.get('x-user-id') || '');
  }

  return response;
}