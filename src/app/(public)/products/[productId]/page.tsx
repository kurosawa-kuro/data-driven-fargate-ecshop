import { CartActions } from './addToCart';
import { productAPI, historyAPI } from '@/lib/api/client';
import { Product } from "@prisma/client";
import Image from 'next/image';

// 型定義
type ProductPageProps = {
  params: Promise<{ productId: string }>
};

// メインページコンポーネント
export default async function Page({ params }: ProductPageProps) {
  const resolvedParams = await params;
  
  // データフェッチング
  let product: Product | null = null;
  try {
    const { product: fetchedProduct } = await productAPI.getProduct(resolvedParams.productId);
    product = fetchedProduct;
  } catch (error) {
    console.error('商品情報の取得エラー:', error);
    return <div className="container mx-auto px-4 py-8 text-white">商品情報を取得できませんでした</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-white">商品が見つかりません</div>;
  }

  // 閲覧履歴の記録
  try {
    await historyAPI.recordView(resolvedParams.productId, 'auth0|user1');
  } catch (error) {
    console.error('閲覧履歴の記録に失敗しました:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-white">商品詳細</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左ペイン: 商品画像 */}
        <div className="overflow-hidden rounded-lg bg-gray-700 relative h-[400px] flex items-center justify-center p-4">
          <img
            src="/product/4Kテレビ 55インチ.webp"
            alt={product.name}
            className="object-contain object-center max-h-full max-w-full group-hover:opacity-75 transition-opacity"
          />
        </div>

        {/* 中央ペイン: 商品情報 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{product.name}</h2>
          <p className="text-xl font-semibold text-white">
            ¥{product.price.toLocaleString()}
          </p>
          {/* <RatingStars rating={product.rating} reviews={product.reviews} />
          <p className="text-gray-300">{product.description}</p> */}
        </div>

        {/* 右ペイン: カートコンポーネント */}
        <CartActions productData={product} />
      </div>
    </div>
  );
} 