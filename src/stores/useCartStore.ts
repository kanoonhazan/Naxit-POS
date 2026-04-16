import {create} from 'zustand';

import type {CartItem} from '../types';

type CartStore = {
  items: CartItem[];

  addToCart: (productId: string) => void;

  updateQuantity: (productId: string, delta: number) => void;

  removeFromCart: (productId: string) => void;

  clearCart: () => void;

  getItemQuantity: (productId: string) => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addToCart: (productId: string) => {
    set(state => {
      const existing = state.items.find(item => item.productId === productId);

      if (existing) {
        return {
          items: state.items.map(item =>
            item.productId === productId
              ? {...item, quantity: item.quantity + 1}
              : item,
          ),
        };
      }

      return {items: [...state.items, {productId, quantity: 1}]};
    });
  },

  updateQuantity: (productId: string, delta: number) => {
    set(state => {
      const existing = state.items.find(item => item.productId === productId);

      if (!existing) {
        return state;
      }

      const nextQuantity = existing.quantity + delta;

      if (nextQuantity <= 0) {
        return {items: state.items.filter(item => item.productId !== productId)};
      }

      return {
        items: state.items.map(item =>
          item.productId === productId
            ? {...item, quantity: nextQuantity}
            : item,
        ),
      };
    });
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      items: state.items.filter(item => item.productId !== productId),
    }));
  },

  clearCart: () => set({items: []}),

  getItemQuantity: (productId: string) => {
    return get().items.find(item => item.productId === productId)?.quantity ?? 0;
  },
}));
