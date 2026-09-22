export type TabType = 'produtos' | 'clientes' | 'nova_venda' | 'vendas' | 'relatorios';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'outro';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  barcode?: string;
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  brand: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  saleNumber: number;
  date: string; // ISO string
  clientId?: string;
  clientName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalCost: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  phone: string;
  address?: string;
  pixKey?: string;
}
