カート情報の管理について、それぞれの選択肢を評価しましょう：

1. ローカルストレージベース:
```typescript
// lib/cart/storage.ts
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export const cartStorage = {
  save: (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
  },
  get: (): CartItem[] => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },
  clear: () => {
    localStorage.removeItem('cart');
  }
};
```

2. Zustandベース:
```typescript
// store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.productId !== productId)
      })),
      clearCart: () => set({ items: [] })
    }),
    { name: 'cart-storage' }
  )
);
```

👍 推奨: **Zustand + persist middleware**

理由：
1. 状態管理とストレージの統合
2. リアクティブな更新
3. デバッグが容易
4. TypeScriptサポートが優秀
5. パフォーマンスが良好
6. コード量が少なく管理が容易

実装例:
```typescript
// store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(item => item.productId === newItem.productId);
        if (existingItem) {
          return {
            items: state.items.map(item => 
              item.productId === newItem.productId 
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          };
        }
        return { items: [...state.items, newItem] };
      }),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.productId === productId 
            ? { ...item, quantity }
            : item
        )
      })),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.productId !== productId)
      })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);
```

使用例:
```typescript
// components/AddToCart.tsx
'use client';

import { useCartStore } from '@/store/cart';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  };

  return (
    <button onClick={handleAddToCart}>
      カートに追加
    </button>
  );
}
```

このアプローチにより：
- 永続化されたカート情報
- リアクティブな更新
- クリーンな状態管理
- 型安全性
が実現できます。