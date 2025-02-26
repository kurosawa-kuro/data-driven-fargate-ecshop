import Link from "next/link";
import Image from "next/image";
import CategoryButtons from "./products/categoryButtons";
import { topAPI } from "@/lib/api/client";

// Dummy category data
const dummyCategories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Books" },
  { id: 3, name: "Clothing" },
  { id: 4, name: "Sports" },
  { id: 5, name: "Home & Garden" },
];

// Group labels mapping for display groups (Japanese labels)
const GROUP_LABELS: Record<string, string> = {
  SALE: "セール商品",
  CONTINUE_SHOPPING: "引き続きお買い物",
  RECOMMENDED_CATEGORY: "おすすめカテゴリー",
};

// Interface for product item data
interface ProductItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  specialPrice?: number | null;
  // Additional fields can be defined as needed
}

/**
 * Renders a single product card.
 * Responsible for displaying product image, name and pricing.
 */
function ProductCard({ item }: { item: ProductItem }) {
  return (
    <Link
      href={`/products/${item.productId}`}
      className="group block bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-700 relative">
        <div className="relative w-full h-0 pb-[50%]">
          <Image
            src="/product/2025-02-26_09h24_47.png"
            alt={item.productName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain object-center group-hover:opacity-75 transition-opacity"
            priority={item.id <= 4}
          />
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-medium text-white">{item.productName}</h2>
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
  );
}

/**
 * Renders a section for a specific product group.
 * This component is responsible for group title and its product list.
 */
function GroupSection({
  groupKey,
  items,
  labels,
}: {
  groupKey: string;
  items: ProductItem[];
  labels: Record<string, string>;
}) {
  // If there are no items in this group, do not render
  if (!items || items.length === 0) return null;

  // Determine the display label, fallback to groupKey
  const label = labels[groupKey] || groupKey;

  return (
    <section key={groupKey} className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{label}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item: ProductItem) => (
          <ProductCard key={`${groupKey}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

/**
 * Main page component.
 * Fetches top page display data from the API and renders category buttons along with product groups.
 */
export default async function Page() {
  // Fetch data from top page display API (no cache)
  const topResponse = await topAPI.getTopPageDisplay();

  // Extract display groups from API response
  const topPageDisplayByDisplayType: Record<string, ProductItem[]> =
    topResponse.topPageDisplayByDisplayType;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Render category buttons */}
      <CategoryButtons categories={dummyCategories} />

      {/* Render product group sections */}
      {Object.entries(topPageDisplayByDisplayType).map(([groupKey, items]) => (
        <GroupSection key={groupKey} groupKey={groupKey} items={items} labels={GROUP_LABELS} />
      ))}
    </div>
  );
}