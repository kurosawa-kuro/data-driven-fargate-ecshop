'use client'; // Client Componentとして宣言

import Image from "next/image";
import Link from "next/link";

export default function Page() {
  // 商品データの配列（後でデータベースから取得するように変更可能）
  const product = 
    { 
      id: 1, 
      name: "Product 1", 
      price: 1980, 
      image: "https://picsum.photos/id/1/180/200",
      rating: 4.5,
      reviews: 123,
      description: "商品の詳細説明がここに入ります。"
    }
  ;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-white">商品詳細</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左ペイン: 商品画像 */}
        <div className="overflow-hidden rounded-lg bg-gray-700 relative h-[400px]">
          <Image 
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center"
            priority
          />
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

        {/* 右ペイン: カート追加 */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-white">
              <span className="text-lg font-medium">価格:</span>
              <span className="text-xl font-bold">¥{product.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-white">
              <span className="text-lg font-medium">数量:</span>
              <span className="text-xl font-bold">1</span>
            </div>
            {/* http://localhost:3001/cart にリンク */}
            <Link href="/cart">
              <button
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                カートに追加
              </button>
            </Link>
            <p className="text-sm text-gray-400 text-center">
              通常配送 2-4 日でお届け
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}