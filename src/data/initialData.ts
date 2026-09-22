import { Product, Client, Sale, StoreSettings } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Espaço dos Cabelos',
  ownerName: 'Gestão Própria',
  phone: '(11) 98765-4321',
  address: 'Rua das Flores, 120 - Loja 2',
  pixKey: '11987654321',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Máscara Reconstrutora 500g',
    brand: 'Truss',
    category: 'Tratamento',
    costPrice: 65.0,
    sellingPrice: 135.0,
    stock: 8,
    minStock: 4,
    notes: 'Uso profissional e home care para cabelos danificados',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Óleo Reparador de Pontas 60ml',
    brand: 'Wella',
    category: 'Finalizadores',
    costPrice: 48.0,
    sellingPrice: 98.0,
    stock: 12,
    minStock: 5,
    notes: 'Óleo de reflexão com óleo de macadâmia e abacate',
    createdAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Shampoo Nutritivo 1 Litro',
    brand: 'LOréal Professionnel',
    category: 'Lavatório e Higiene',
    costPrice: 75.0,
    sellingPrice: 155.0,
    stock: 3,
    minStock: 5,
    notes: 'Estoque baixo - solicitar novo lote ao fornecedor',
    createdAt: '2026-08-03T10:00:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Condicionador Hidratação Intensa 1L',
    brand: 'LOréal Professionnel',
    category: 'Lavatório e Higiene',
    costPrice: 80.0,
    sellingPrice: 165.0,
    stock: 6,
    minStock: 3,
    notes: 'Linha profissional',
    createdAt: '2026-08-03T10:00:00.000Z',
  },
  {
    id: 'prod-5',
    name: 'Protetor Térmico Leave-in 200ml',
    brand: 'Braé',
    category: 'Finalizadores',
    costPrice: 38.0,
    sellingPrice: 85.0,
    stock: 10,
    minStock: 4,
    notes: 'Proteção até 230 graus para secador e prancha',
    createdAt: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 'prod-6',
    name: 'Tônico Fortalecedor Antiqueda 100ml',
    brand: 'Amend',
    category: 'Tratamento',
    costPrice: 24.0,
    sellingPrice: 52.0,
    stock: 2,
    minStock: 4,
    notes: 'Estoque em nível crítico',
    createdAt: '2026-08-06T10:00:00.000Z',
  },
  {
    id: 'prod-7',
    name: 'Kit Cronograma Capilar 3 x 250g',
    brand: 'Cadiveu',
    category: 'Kits',
    costPrice: 90.0,
    sellingPrice: 195.0,
    stock: 5,
    minStock: 3,
    notes: 'Etapas de Hidratação, Nutrição e Reconstrução',
    createdAt: '2026-08-07T10:00:00.000Z',
  },
  {
    id: 'prod-8',
    name: 'Coloração Permanente 60g 7.1 Louro Cinza',
    brand: 'Igora Royal',
    category: 'Coloração',
    costPrice: 22.0,
    sellingPrice: 48.0,
    stock: 7,
    minStock: 4,
    notes: 'Cobertura total de brancos',
    createdAt: '2026-08-08T10:00:00.000Z',
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Fernanda Lima',
    phone: '(11) 99123-4567',
    email: 'fernanda.lima@email.com',
    notes: 'Prefere linhas sem sulfato e produtos de reconstrução',
    createdAt: '2026-08-10T14:00:00.000Z',
  },
  {
    id: 'cli-2',
    name: 'Juliana Mendes',
    phone: '(11) 98234-5678',
    email: 'juliana.mendes@email.com',
    notes: 'Cabelos loiros com mechas, usa protetor térmico sempre',
    createdAt: '2026-08-12T15:30:00.000Z',
  },
  {
    id: 'cli-3',
    name: 'Camila Rocha',
    phone: '(11) 97345-6789',
    email: 'camila.rocha@email.com',
    notes: 'Cliente frequente de kits de cronograma',
    createdAt: '2026-08-15T11:20:00.000Z',
  },
  {
    id: 'cli-4',
    name: 'Beatriz Santos',
    phone: '(11) 96456-7890',
    notes: 'Costuma comprar óleos reparadores e máscaras',
    createdAt: '2026-08-18T16:45:00.000Z',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1001',
    saleNumber: 1001,
    date: '2026-09-10T14:30:00.000Z',
    clientId: 'cli-1',
    clientName: 'Fernanda Lima',
    items: [
      {
        productId: 'prod-1',
        productName: 'Máscara Reconstrutora 500g',
        brand: 'Truss',
        unitPrice: 135.0,
        costPrice: 65.0,
        quantity: 1,
        subtotal: 135.0,
      },
      {
        productId: 'prod-2',
        productName: 'Óleo Reparador de Pontas 60ml',
        brand: 'Wella',
        unitPrice: 98.0,
        costPrice: 48.0,
        quantity: 1,
        subtotal: 98.0,
      },
    ],
    subtotal: 233.0,
    discount: 13.0,
    total: 220.0,
    totalCost: 113.0,
    paymentMethod: 'pix',
    notes: 'Desconto à vista no Pix',
  },
  {
    id: 'sale-1002',
    saleNumber: 1002,
    date: '2026-09-12T16:15:00.000Z',
    clientId: 'cli-3',
    clientName: 'Camila Rocha',
    items: [
      {
        productId: 'prod-7',
        productName: 'Kit Cronograma Capilar 3 x 250g',
        brand: 'Cadiveu',
        unitPrice: 195.0,
        costPrice: 90.0,
        quantity: 1,
        subtotal: 195.0,
      },
    ],
    subtotal: 195.0,
    discount: 0,
    total: 195.0,
    totalCost: 90.0,
    paymentMethod: 'cartao_credito',
    notes: 'Parcelado em 2x no balcão',
  },
  {
    id: 'sale-1003',
    saleNumber: 1003,
    date: '2026-09-13T11:00:00.000Z',
    clientName: 'Cliente Balcão (Avulso)',
    items: [
      {
        productId: 'prod-5',
        productName: 'Protetor Térmico Leave-in 200ml',
        brand: 'Braé',
        unitPrice: 85.0,
        costPrice: 38.0,
        quantity: 1,
        subtotal: 85.0,
      },
    ],
    subtotal: 85.0,
    discount: 5.0,
    total: 80.0,
    totalCost: 38.0,
    paymentMethod: 'dinheiro',
    notes: '',
  },
];

const STORAGE_KEYS = {
  PRODUCTS: 'gestao_cabelo_produtos',
  CLIENTS: 'gestao_cabelo_clientes',
  SALES: 'gestao_cabelo_vendas',
  SETTINGS: 'gestao_cabelo_config',
};

export function loadStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar produtos', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Erro ao salvar produtos', e);
  }
}

export function loadStoredClients(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar clientes', e);
  }
  return INITIAL_CLIENTS;
}

export function saveStoredClients(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Erro ao salvar clientes', e);
  }
}

export function loadStoredSales(): Sale[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar vendas', e);
  }
  return INITIAL_SALES;
}

export function saveStoredSales(sales: Sale[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  } catch (e) {
    console.error('Erro ao salvar vendas', e);
  }
}

export function loadStoredSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar configurações', e);
  }
  return INITIAL_SETTINGS;
}

export function saveStoredSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Erro ao salvar configurações', e);
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}
