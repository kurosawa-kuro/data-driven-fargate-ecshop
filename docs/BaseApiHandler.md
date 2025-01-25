```typescript
// lib/api/baseHandler.ts
abstract class BaseApiHandler {
  protected async getHeaders() {
    const headersList = await headers();
    return {
      userId: headersList.get('x-user-id'),
      requestId: headersList.get('x-request-id')
    };
  }

  protected checkAuth(userId: string | null) {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
  }

  protected handleError(error: unknown) {
    console.error('API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: '処理に失敗しました' }, { status: 500 });
  }
}

// api/cart/route.ts
class CartHandler extends BaseApiHandler {
  async GET() {
    try {
      const { userId } = await this.getHeaders();
      const authError = this.checkAuth(userId);
      if (authError) return authError;
      
      const cartItems = await prisma.cartItem.findMany({/*...*/});
      return NextResponse.json({ success: true, cartItems });
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  async POST(request: Request) {
    // 同様の実装
  }
}

export const { GET, POST, DELETE } = new CartHandler();
```