'use client';

interface Category {
  id: number;
  name: string;
}

interface CategoryButtonsProps {
  categories: Category[];
}

export default function CategoryButtons({ categories }: CategoryButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => {
            console.log('Selected category:', category.id);
          }}
          className="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}