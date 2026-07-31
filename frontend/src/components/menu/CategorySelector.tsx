'use client';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export default function CategorySelector({ categories, activeCategoryId, onSelectCategory }: Props) {
  return (
    <div className="flex overflow-x-auto py-4 px-2 space-x-4 no-scrollbar border-b bg-white sticky top-0 z-10">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-all ${
            activeCategoryId === cat.id
              ? 'bg-black text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
