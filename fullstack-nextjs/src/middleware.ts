import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger';

export async function middleware(request: NextRequest) {

  // クッキーから email を参照
  const email = request.cookies.get('email')?.value;
  console.log("email : ", email);
  
  // ユーザー情報をヘッダーに設定
  const response = NextResponse.next();
  response.headers.set('X-User-Email', email || '');

  // ロギング対象外のパスはスキップ
  if (request.nextUrl.pathname === '/api/logging') {
    return NextResponse.next()
  }

  try {
    // CloudFrontヘッダーから国情報を取得
    const country = request.headers.get('CloudFront-Viewer-Country') || 'Unknown';
    const countryName = request.headers.get('CloudFront-Viewer-Country-Name') || 'Unknown';
    const region = request.headers.get('CloudFront-Viewer-Country-Region') || 'Unknown';
    const city = request.headers.get('CloudFront-Viewer-City') || 'Unknown';

    // ロガーを使用してリクエスト情報を記録
    logger.info('API Request', {
      method: request.method,
      origin: request.nextUrl.origin,
      pathname: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers),
      geoInfo: {
        country,
        countryName,
        region,
        city
      }
    });

    // レスポンスヘッダーに国情報を追加
    response.headers.set('X-Country-Code', country);
    response.headers.set('X-Country-Name', countryName);
    response.headers.set('X-Region', region);
    response.headers.set('X-City', city);

    return response;

  } catch (error) {
    logger.error('Logging failed', error as Error);
    return NextResponse.next()
  }
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}