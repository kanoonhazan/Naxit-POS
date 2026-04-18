import {create} from 'zustand';

import {persistReceipt} from '../database/posDb';
import type {PaymentMethod, Receipt, SalesFeedback} from '../types';

type SalesStore = {
  receipts: Receipt[];
  lastReceipt: Receipt | null;
  feedback: SalesFeedback | null;

  setReceipts: (receipts: Receipt[]) => void;

  pushFeedback: (
    tone: SalesFeedback['tone'],
    title: string,
    detail: string,
  ) => void;

  checkout: (params: {
    items: Receipt['items'];
    subtotal: number;
    paymentMethod: PaymentMethod;
    customerName?: string;
    customerPhone?: string;
    receiptCount: number;
  }) => Promise<Receipt>;

  clearLastReceipt: () => void;
};

export const useSalesStore = create<SalesStore>((set, get) => ({
  receipts: [],
  lastReceipt: null,
  feedback: null,

  setReceipts: (receipts: Receipt[]) => set({receipts}),

  pushFeedback: (tone, title, detail) => {
    set({
      feedback: {
        id: Date.now(),
        tone,
        title,
        detail,
      },
    });
  },

  checkout: async ({items, subtotal, paymentMethod, customerName, customerPhone, receiptCount}) => {
    // Safety check: Don't checkout empty carts
    if (!items || items.length === 0) {
      throw new Error('Checkout failed: Cart is empty');
    }

    const tax = 0;
    const total = subtotal + tax;

    // Safety check: Prevent negative or impossible totals
    if (total < 0) {
      throw new Error('Checkout failed: Total cannot be negative');
    }

    const nextReceipt: Receipt = {
      id: `receipt-${Date.now()}`,
      number: `#${String(receiptCount + 1).padStart(4, '0')}`,
      items,
      subtotal,
      tax,
      total,
      paidAmount: total,
      changeDue: 0,
      paymentMethod,
      customerName,
      customerPhone,
      issuedAt: new Date().toISOString(),
    };

    set(state => ({
      receipts: [nextReceipt, ...state.receipts],
      lastReceipt: nextReceipt,
    }));

    try {
      await persistReceipt(nextReceipt);
    } catch {
      get().pushFeedback(
        'danger',
        'Receipt not saved',
        'The sale worked on screen, but local persistence failed.',
      );
    }

    return nextReceipt;
  },

  clearLastReceipt: () => set({lastReceipt: null}),
}));
