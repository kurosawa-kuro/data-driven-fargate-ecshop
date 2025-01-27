TOPページのデータ構造をDynamoDBに移行する案に賛成です：

```typescript
// DynamoDBのTOPページ用テーブル設計
{
  PK: 'TOP_PAGE',
  SK: 'CAROUSEL#1',  // スライダー
  images: [],
  title: '',
  link: ''
}

{
  PK: 'TOP_PAGE',
  SK: 'FEATURED#1',  // おすすめ商品
  products: [{
    id: number,
    name: string,
    price: number,
    imageUrl: string
  }]
}
```

理由：
- 更新頻度が低い
- 結合クエリが少ない
- キャッシュとして機能
- レイテンシー改善

RDBは購入フローなどのトランザクション処理に集中させるべきです。