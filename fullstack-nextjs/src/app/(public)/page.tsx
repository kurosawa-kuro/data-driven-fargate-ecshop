import Image from "next/image";
import Link from "next/link";
import { productAPI } from "@/lib/api/client";
import CategoryButtons from "./products/categoryButtons";

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
}

// Dummy category data
const dummyCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Books' },
  { id: 3, name: 'Clothing' },
  { id: 4, name: 'Sports' },
  { id: 5, name: 'Home & Garden' },
];

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Retrieve products using productAPI
  const { products } = await productAPI.getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category list */}
      <CategoryButtons categories={dummyCategories} />

      {/* Product list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.id}`}
            className="group block bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-700 relative">
              <Image 
                src={`https://picsum.photos/id/${product.id}/180/200`}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center group-hover:opacity-75 transition-opacity"
                priority={product.id <= 4}
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-medium text-white">{product.name}</h2>
              <div className="mt-2 flex items-center">
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
                  ({Math.floor(Math.random() * 200 + 50)})
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                ¥{product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}