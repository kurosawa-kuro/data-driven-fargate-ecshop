import Image from "next/image";
import Link from "next/link";
import CategoryButtons from "./products/categoryButtons";
import { topAPI } from "@/lib/api/client";

// ダミーのカテゴリー情報
const dummyCategories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Books" },
  { id: 3, name: "Clothing" },
  { id: 4, name: "Sports" },
  { id: 5, name: "Home & Garden" },
];

export const dynamic = "force-dynamic";

export default async function Page() {
  // トップページ表示用APIからデータ取得（キャッシュを無効化）
  const topResponse = await topAPI.getTopPageDisplay();

  // APIレスポンスから各ディスプレイグループごとのデータを取得
  const topPageDisplayByDisplayType = topResponse.topPageDisplayByDisplayType;

  // 各グループのラベル設定（日本語表示用）
  const groupLabels: Record<string, string> = {
    SALE: "セール商品",
    CONTINUE_SHOPPING: "引き続きお買い物",
    RECOMMENDED_CATEGORY: "おすすめカテゴリー",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* カテゴリー一覧 */}
      <CategoryButtons categories={dummyCategories} />

      {/* 各グループごとの商品一覧 */}
      {Object.entries(topPageDisplayByDisplayType).map(([groupKey, items]) => {
        if (!items || items.length === 0) return null;
        return (
          <section key={groupKey} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {groupLabels[groupKey] || groupKey}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item: any) => (
                <Link
                  key={`${groupKey}-${item.id}`}
                  href={`/products/${item.productId}`}
                  className="group block bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-700 relative">
                    <Image
                      src={`https://picsum.photos/id/${item.productId}/180/200`}
                      alt={item.productName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-center group-hover:opacity-75 transition-opacity"
                      priority={item.productId <= 4}
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-medium text-white">
                      {item.productName}
                    </h2>
                    {/* 価格情報 */}
                    <p className="mt-2 text-lg font-semibold text-white">
                      {item.specialPrice != null ? (
                        <>
                          <span>¥{item.specialPrice.toLocaleString()}</span>{" "}
                          <span className="text-sm text-gray-400 line-through">
                            ¥{item.productPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <>¥{item.productPrice.toLocaleString()}</>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}