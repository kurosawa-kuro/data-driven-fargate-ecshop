import { CartActions } from './addToCart';
import { use } from 'react';

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = await params;
  const response = await fetch(`http://localhost:3000/api/products/${resolvedParams.productId}`, {
    cache: 'no-store'
  });
  const { product } = await response.json();
  
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
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <span 
                  key={index}
                  className={`${
                    index < Math.floor(product.rating)
                      ? "text-yellow-400"
                      : "text-gray-600"
                  } text-lg`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-300">
              {product.rating}
            </span>
            <span className="ml-2 text-sm text-gray-400">
              ({product.reviews}件のレビュー)
            </span>
          </div>
          <p className="text-gray-300">{product.description}</p>
        </div>

        {/* 右ペイン: カートコンポーネント */}
        <CartActions productData={product} />
      </div>
    </div>
  );
}
