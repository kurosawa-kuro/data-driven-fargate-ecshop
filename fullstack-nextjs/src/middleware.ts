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
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}

export async function middleware(request: NextRequest) {
  // すべてのCookieをログ出力（デバッグ用）
  console.log('All cookies:', request.cookies.getAll());
  
  // Cookieの取得方法を変更
  const idToken = request.cookies.get('idToken')?.value || 
                 request.headers.get('cookie')?.split(';')
                   .find(c => c.trim().startsWith('idToken='))
                   ?.split('=')[1];

  const requestHeaders = new Headers(request.headers);

  console.log('Middleware - Cookie:', idToken); // デバッグ用

  if (idToken) {
    try {
      const decodedIdToken = await jose.decodeJwt(idToken);
      console.log('Middleware - Decoded Token:', decodedIdToken); // デバッグ用
      
      if (decodedIdToken.email && decodedIdToken.sub) {
        requestHeaders.set('x-user-email', String(decodedIdToken.email));
        requestHeaders.set('x-user-id', String(decodedIdToken.sub));
      }
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // // APIルートの場合はレスポンスヘッダーにも設定
  // if (request.nextUrl.pathname.startsWith('/api/')) {
  //   response.headers.set('x-user-email', requestHeaders.get('x-user-email') || '');
  //   response.headers.set('x-user-id', requestHeaders.get('x-user-id') || '');
  // }

  return response;
}