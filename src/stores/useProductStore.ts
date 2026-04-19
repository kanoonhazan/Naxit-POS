import {create} from 'zustand';

import {
  deleteProductById,
  updateProductStock,
  upsertProduct,
} from '../database/posDb';
// Removed unused theme import
import type {Product} from '../types';

type ProductStore = {
  products: Product[];

  setProducts: (products: Product[]) => void;

  saveProduct: (
    values: Omit<Product, 'id' | 'code'> & {id?: string; code?: string},
  ) => Promise<string | null>;

  deleteProduct: (productId: string) => void;

  adjustStock: (productId: string, delta: number) => void;
  bulkAdjustStock: (adjustments: Array<{id: string; delta: number}>) => void;

  getProductById: (productId: string) => Product | undefined;

  getProductByCode: (code: string) => Product | undefined;
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],

  setProducts: (products: Product[]) => set({products}),

  saveProduct: async (values) => {
    const normalizedName = values.name.trim();

    if (!normalizedName) {
      return null;
    }

    const generatedCode = values.code
      ? values.code
      : normalizedName
          .split(' ')
          .map(part => part.slice(0, 1).toUpperCase())
          .join('')
          .padEnd(3, 'X') + String(Date.now()).slice(-4);

    const nextProduct: Product = {
      ...values,
      id: values.id ?? `product-${Date.now()}`,
      name: normalizedName,
      code: generatedCode,
    };

    set(state => {
      const existingIndex = state.products.findIndex(
        product => product.id === nextProduct.id,
      );

      if (existingIndex === -1) {
        return {products: [nextProduct, ...state.products]};
      }

      return {
        products: state.products.map(product =>
          product.id === nextProduct.id ? nextProduct : product,
        ),
      };
    });

    try {
      await upsertProduct(nextProduct);
      return nextProduct.id;
    } catch {
      return null;
    }
  },

  deleteProduct: (productId: string) => {
    set(state => ({
      products: state.products.filter(item => item.id !== productId),
    }));

    deleteProductById(productId).catch(() => {});
  },

  adjustStock: (productId: string, delta: number) => {
    let nextStockValue = 0;

    set(state => ({
      products: state.products.map(product => {
        if (product.id !== productId) {
          return product;
        }

        nextStockValue = Math.max(0, product.stock + delta);
        return {
          ...product,
          stock: nextStockValue,
        };
      }),
    }));

    updateProductStock(productId, nextStockValue).catch(() => {});
  },

  bulkAdjustStock: (adjustments) => {
    const products = get().products;
    const nextProducts = products.map(product => {
      const adj = adjustments.find(a => a.id === product.id);
      if (!adj) {
        return product;
      }
      return {
        ...product,
        stock: Math.max(0, product.stock + adj.delta),
      };
    });

    set({products: nextProducts});
    // Note: Database sync is handled by persistReceipt during checkout to avoid double deduction
  },

  getProductById: (productId: string) => {
    return get().products.find(product => product.id === productId);
  },

  getProductByCode: (code: string) => {
    const normalized = code.trim().toLowerCase();
    return get().products.find(
      product =>
        product.code.toLowerCase() === normalized ||
        product.id.toLowerCase() === normalized,
    );
  },
}));
