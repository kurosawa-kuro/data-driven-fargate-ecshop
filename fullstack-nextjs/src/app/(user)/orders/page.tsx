'use client';

import Image from 'next/image';

// 商品アイテムの型定義
type Product = {
  id: string;
  name: string;
  quantity: number;
  imageUrl: string;
  price: number;
};

// 注文の型定義を更新
type OrderItem = {
  id: string;
  orderDate: string;
  totalAmount: number;
  products: Product[];
};

// モックデータを更新
const mockOrders: OrderItem[] = [
  {
    id: '1',
    orderDate: '2024年3月15日',
    totalAmount: 18200,
    products: [
      {
        id: 'p1',
        name: 'プレミアムレザーバッグ',
        quantity: 1,
        imageUrl: 'https://picsum.photos/id/1/180/200',
        price: 12800
      },
      {
        id: 'p2',
        name: 'シルクスカーフ',
        quantity: 2,
        imageUrl: 'https://picsum.photos/id/4/180/200',
        price: 2700
      }
    ]
  },
  {
    id: '2',
    orderDate: '2024年3月10日',
    totalAmount: 8600,
    products: [
      {
        id: 'p3',
        name: 'ワイヤレスイヤホン',
        quantity: 2,
        imageUrl: 'https://picsum.photos/id/2/180/200',
        price: 4300
      }
    ]
  }
];

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">注文履歴</h1>
      
      {/* 注文履歴カード */}
      <div className="space-y-6">
        {mockOrders.map((order) => (
          <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
            {/* 上部: 注文情報 */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
              <div>注文日: {order.orderDate}</div>
              <div>合計: ¥{order.totalAmount.toLocaleString()}</div>
            </div>
            
            {/* 下部: 商品情報 */}
            <div className="space-y-4">
              {order.products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 border-b border-gray-700 last:border-b-0 pb-4 last:pb-0">
                  <div className="w-20 h-20 bg-gray-700 rounded flex-shrink-0 relative">
                    <Image 
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium text-white">{product.name}</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>数量: {product.quantity}</p>
                      <p>価格: ¥{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* アクションボタン */}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                返品
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                再度購入
              </button>
              <button className="px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded hover:bg-gray-700">
                レビューを書く
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}