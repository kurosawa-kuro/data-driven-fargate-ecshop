import { CartActions } from './addToCart';

// 型定義
type ProductPageProps = {
  params: Promise<{ productId: string }>
};

type Product = {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
};

// 定数
const MAX_RATING_STARS = 5;
const API_BASE_URL = 'http://localhost:3000/api';

// コンポーネント
const RatingStars = ({ rating, reviews }: { rating: number; reviews: number }) => (
  <div className="flex items-center">
    <div className="flex items-center">
      {[...Array(MAX_RATING_STARS)].map((_, index) => (
        <span 
          key={index}
          className={`${
            index < Math.floor(rating)
              ? "text-yellow-400"
              : "text-gray-600"
          } text-lg`}
        >
          ★
        </span>
      ))}
    </div>
    <span className="ml-2 text-sm text-gray-300">{rating}</span>
    <span className="ml-2 text-sm text-gray-400">({reviews}件のレビュー)</span>
  </div>
);

// メインページコンポーネント
export default async function Page({ params }: ProductPageProps) {
  // Zustand等のステート管理でユーザー情報を管理しているので、ヘッダーから取得する必要はない

  const resolvedParams = await params;
  
  // データフェッチング
  const response = await fetch(`${API_BASE_URL}/products/${resolvedParams.productId}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store'
  });
  const { product } = await response.json() as { product: Product };

  // 閲覧履歴の記録
  await fetch(`${API_BASE_URL}/view-history`, {
    credentials: 'include',
    cache: 'no-store',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId: resolvedParams.productId })
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-white">商品詳細</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左ペイン: 商品画像 */}
        <div className="overflow-hidden rounded-lg bg-gray-700 relative h-[400px]">
          Image
        </div>

        {/* 中央ペイン: 商品情報 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{product.name}</h2>
          <p className="text-xl font-semibold text-white">
            ¥{product.price.toLocaleString()}
          </p>
          <RatingStars rating={product.rating} reviews={product.reviews} />
          <p className="text-gray-300">{product.description}</p>
        </div>

        {/* 右ペイン: カートコンポーネント */}
        <CartActions productData={product} />
      </div>
    </div>
  );
}
