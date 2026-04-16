export type TabKey = 'sales' | 'products' | 'inventory' | 'reports' | 'settings';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  code: string;
  color: string;
  description: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type PaymentMethod = 'cash' | 'card' | 'split';

export type Receipt = {
  id: string;
  number: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  changeDue: number;
  paymentMethod: PaymentMethod;
  issuedAt: string;
};

export type SalesFeedback = {
  id: number;
  tone: 'success' | 'warning' | 'danger';
  title: string;
  detail: string;
};

export type StoreSettings = {
  storeName: string;
  storeSubtitle: string;
  printerName: string;
  printerConnected: boolean;
  autoPrint: boolean;
  currency: string;
};
