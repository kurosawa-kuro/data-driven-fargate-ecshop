AWS Athenaでの分析を前提としたログ設計を提案します：

1. アクセスログ（行動追跡用）:
```json
{
  "timestamp": "2024-01-22T10:00:00.000Z",
  "event_type": "page_view",
  "user_id": "123",  // 未ログインの場合はnull
  "session_id": "abc123xyz",
  "page": "/products",
  "referrer": "/categories/1",
  "device_info": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "xxx.xxx.xxx.xxx"
  }
}
```

2. 商品閲覧ログ:
```json
{
  "timestamp": "2024-01-22T10:01:00.000Z",
  "event_type": "product_view",
  "user_id": "123",
  "session_id": "abc123xyz",
  "product_id": 456,
  "category_ids": [1, 3],
  "view_duration": 45,  // 秒
  "source_page": "/products"
}
```

3. カート操作ログ:
```json
{
  "timestamp": "2024-01-22T10:02:00.000Z",
  "event_type": "cart_action",
  "user_id": "123",
  "session_id": "abc123xyz",
  "action": "add", // add, remove, update
  "product_id": 456,
  "quantity": 1,
  "price": 1000,
  "cart_total": 3000
}
```

4. 購入ログ:
```json
{
  "timestamp": "2024-01-22T10:05:00.000Z",
  "event_type": "purchase",
  "user_id": "123",
  "session_id": "abc123xyz",
  "purchase_id": "order_789",
  "total_amount": 3000,
  "items": [
    {
      "product_id": 456,
      "quantity": 1,
      "price": 1000,
      "category_ids": [1, 3]
    }
  ],
  "cart_to_purchase_duration": 180  // カート追加から購入までの秒数
}
```

5. エラーログ:
```json
{
  "timestamp": "2024-01-22T10:06:00.000Z",
  "event_type": "error",
  "error_type": "api_error",
  "user_id": "123",
  "session_id": "abc123xyz",
  "path": "/api/cart",
  "error_message": "Failed to add item to cart",
  "error_code": "CART_001",
  "stack_trace": "..." // 開発環境のみ
}
```

Athenaでの分析用クエリ例：
```sql
-- カテゴリー別の閲覧から購入までのコンバージョン率
WITH product_views AS (
  SELECT 
    category_ids,
    COUNT(*) as view_count
  FROM product_view_logs
  WHERE date_trunc('month', timestamp) = '2024-01-01'
  GROUP BY category_ids
),
purchases AS (
  SELECT 
    i.category_ids,
    COUNT(*) as purchase_count
  FROM purchase_logs p
  CROSS JOIN UNNEST(items) AS i
  WHERE date_trunc('month', timestamp) = '2024-01-01'
  GROUP BY i.category_ids
)
SELECT 
  pv.category_ids,
  pv.view_count,
  p.purchase_count,
  (p.purchase_count::float / pv.view_count) as conversion_rate
FROM product_views pv
LEFT JOIN purchases p ON pv.category_ids = p.category_ids;
```

ログ実装例：
```typescript
// utils/logger.ts
export const logEvent = async (eventData: any) => {
  if (process.env.NODE_ENV === 'production') {
    // CloudWatch Logsへ出力
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      ...eventData
    }));
  }
};

// 使用例
await logEvent({
  event_type: 'product_view',
  user_id: session?.user?.id,
  product_id: productId,
  session_id: getSessionId(), // セッションID取得関数
  category_ids: product.categories.map(c => c.id)
});
```

このログ設計により：
1. ユーザー行動の詳細な分析
2. コンバージョンファネルの分析
3. カテゴリー別のパフォーマンス分析
4. エラー追跡と問題特定
が可能になります。