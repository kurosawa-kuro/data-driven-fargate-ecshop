import Link from "next/link";

export default function Page() {
  // 商品データの配列（後でデータベースから取得するように変更可能）
  const products = [
    { 
      id: 1, 
      name: "Product 1", 
      price: 1980, 
      image: "https://picsum.photos/id/1/180/200",
      rating: 4.5,
      reviews: 123
    },
    { 
      id: 2, 
      name: "Product 2", 
      price: 1980, 
      image: "https://picsum.photos/id/2/180/200",
      rating: 4.2,
      reviews: 89
    },
    { 
      id: 3, 
      name: "Product 3", 
      price: 1980, 
      image: "https://picsum.photos/id/3/180/200",
      rating: 4.7,
      reviews: 256
    },
    { 
      id: 4, 
      name: "Product 4", 
      price: 1980, 
      image: "https://picsum.photos/id/4/180/200",
      rating: 4.3,
      reviews: 167
    },
    { 
      id: 5, 
      name: "Product 5", 
      price: 1980, 
      image: "https://picsum.photos/id/5/180/200",
      rating: 4.6,
      reviews: 198
    },
    { 
      id: 6, 
      name: "Product 6", 
      price: 1980, 
      image: "https://picsum.photos/id/6/180/200",
      rating: 4.4,
      reviews: 145
    },
    { 
      id: 7, 
      name: "Product 7", 
      price: 1980, 
      image: "https://picsum.photos/id/7/180/200",
      rating: 4.8,
      reviews: 321
    },
    { 
      id: 8, 
      name: "Product 8", 
      price: 1980, 
      image: "https://picsum.photos/id/8/180/200",
      rating: 4.1,
      reviews: 78
    },
    { 
      id: 9, 
      name: "Product 9", 
      price: 1980, 
      image: "https://picsum.photos/id/9/180/200",
      rating: 4.5,
      reviews: 234
    },
    { 
      id: 10, 
      name: "Product 10", 
      price: 1980, 
      image: "https://picsum.photos/id/10/180/200",
      rating: 4.3,
      reviews: 156
    },
    { 
      id: 11, 
      name: "Product 11", 
      price: 1980, 
      image: "https://picsum.photos/id/11/180/200",
      rating: 4.6,
      reviews: 189
    },
    { 
      id: 12, 
      name: "Product 12", 
      price: 1980, 
      image: "https://picsum.photos/id/12/180/200",
      rating: 4.2,
      reviews: 143
    },
    { 
      id: 13, 
      name: "Product 13", 
      price: 1980, 
      image: "https://picsum.photos/id/13/180/200",
      rating: 4.7,
      reviews: 278
    },
    { 
      id: 14, 
      name: "Product 14", 
      price: 1980, 
      image: "https://picsum.photos/id/14/180/200",
      rating: 4.4,
      reviews: 167
    },
    { 
      id: 15, 
      name: "Product 15", 
      price: 1980, 
      image: "https://picsum.photos/id/15/180/200",
      rating: 4.5,
      reviews: 198
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Public Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.id}`}
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
              <img 
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <span 
                      key={index}
                      className={`${
                        index < Math.floor(product.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } text-lg`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({product.reviews})
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                ¥{product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}