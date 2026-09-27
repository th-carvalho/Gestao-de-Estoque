import { Product, Client, Sale, StoreSettings } from '../types';

const BASE = 'http://localhost:3001/api';

// ── helpers de conversão ──────────────────────────────────

function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: r.id as string,
    name: r.nome as string,
    brand: (r.marca ?? '') as string,
    category: (r.categoria ?? '') as string,
    costPrice: Number(r.preco_custo),
    sellingPrice: Number(r.preco_venda),
    stock: Number(r.estoque),
    minStock: Number(r.estoque_minimo),
    notes: (r.notas ?? '') as string,
    createdAt: r.criado_em as string,
  };
}

function productToRow(p: Omit<Product, 'createdAt'> & { id: string }) {
  return {
    id: p.id,
    nome: p.name,
    marca: p.brand,
    categoria: p.category,
    preco_custo: p.costPrice,
    preco_venda: p.sellingPrice,
    estoque: p.stock,
    estoque_minimo: p.minStock,
    notas: p.notes ?? '',
  };
}

function rowToClient(r: Record<string, unknown>): Client {
  return {
    id: r.id as string,
    name: r.nome as string,
    phone: (r.telefone ?? '') as string,
    email: (r.email ?? '') as string,
    notes: (r.notas ?? '') as string,
    createdAt: r.criado_em as string,
  };
}

function clientToRow(c: Omit<Client, 'createdAt'> & { id: string }) {
  return {
    id: c.id,
    nome: c.name,
    telefone: c.phone,
    email: c.email ?? '',
    notas: c.notes ?? '',
  };
}

function rowToSale(r: Record<string, unknown>): Sale {
  const rawItems = (r.items ?? []) as Record<string, unknown>[];
  return {
    id: r.id as string,
    saleNumber: Number(r.numero_venda),
    date: r.data_venda as string,
    clientId: (r.cliente_id ?? undefined) as string | undefined,
    clientName: r.nome_cliente as string,
    subtotal: Number(r.subtotal),
    discount: Number(r.desconto),
    total: Number(r.total),
    totalCost: Number(r.custo_total),
    paymentMethod: r.forma_pagamento as Sale['paymentMethod'],
    notes: (r.notas ?? '') as string,
    items: rawItems.map((i) => ({
      productId: i.produto_id as string,
      productName: i.nome_produto as string,
      brand: (i.marca ?? '') as string,
      unitPrice: Number(i.preco_unitario),
      costPrice: Number(i.preco_custo),
      quantity: Number(i.quantidade),
      subtotal: Number(i.subtotal),
    })),
  };
}

function settingsToRow(s: StoreSettings) {
  return {
    nome_loja: s.storeName,
    nome_proprietario: s.ownerName,
    telefone: s.phone,
    endereco: s.address ?? '',
    chave_pix: s.pixKey ?? '',
  };
}

function rowToSettings(r: Record<string, unknown>): StoreSettings {
  return {
    storeName: (r.nome_loja ?? 'Minha Loja') as string,
    ownerName: (r.nome_proprietario ?? '') as string,
    phone: (r.telefone ?? '') as string,
    address: (r.endereco ?? '') as string,
    pixKey: (r.chave_pix ?? '') as string,
  };
}

// ── PRODUTOS ──────────────────────────────────────────────

export async function apiGetProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/produtos`);
  const data = await res.json();
  return data.map(rowToProduct);
}

export async function apiAddProduct(p: Product): Promise<void> {
  await fetch(`${BASE}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productToRow(p)),
  });
}

export async function apiUpdateProduct(p: Product): Promise<void> {
  await fetch(`${BASE}/produtos/${p.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productToRow(p)),
  });
}

export async function apiDeleteProduct(id: string): Promise<void> {
  await fetch(`${BASE}/produtos/${id}`, { method: 'DELETE' });
}

// ── CLIENTES ──────────────────────────────────────────────

export async function apiGetClients(): Promise<Client[]> {
  const res = await fetch(`${BASE}/clientes`);
  const data = await res.json();
  return data.map(rowToClient);
}

export async function apiAddClient(c: Client): Promise<void> {
  await fetch(`${BASE}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientToRow(c)),
  });
}

export async function apiUpdateClient(c: Client): Promise<void> {
  await fetch(`${BASE}/clientes/${c.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientToRow(c)),
  });
}

export async function apiDeleteClient(id: string): Promise<void> {
  await fetch(`${BASE}/clientes/${id}`, { method: 'DELETE' });
}

// ── VENDAS ────────────────────────────────────────────────

export async function apiGetSales(): Promise<Sale[]> {
  const res = await fetch(`${BASE}/vendas`);
  const data = await res.json();
  return data.map(rowToSale);
}

export async function apiAddSale(s: Sale): Promise<void> {
  await fetch(`${BASE}/vendas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: s.id,
      numero_venda: s.saleNumber,
      cliente_id: s.clientId ?? null,
      nome_cliente: s.clientName,
      subtotal: s.subtotal,
      desconto: s.discount,
      total: s.total,
      custo_total: s.totalCost,
      forma_pagamento: s.paymentMethod,
      notas: s.notes ?? '',
      data_venda: s.date,
      items: s.items.map((i) => ({
        produto_id: i.productId,
        nome_produto: i.productName,
        marca: i.brand,
        preco_unitario: i.unitPrice,
        preco_custo: i.costPrice,
        quantidade: i.quantity,
        subtotal: i.subtotal,
      })),
    }),
  });
}

export async function apiDeleteSale(id: string): Promise<void> {
  await fetch(`${BASE}/vendas/${id}`, { method: 'DELETE' });
}

// ── CONFIGURAÇÕES ─────────────────────────────────────────

export async function apiGetSettings(): Promise<StoreSettings> {
  const res = await fetch(`${BASE}/configuracoes`);
  const data = await res.json();
  return rowToSettings(data);
}

export async function apiSaveSettings(s: StoreSettings): Promise<void> {
  await fetch(`${BASE}/configuracoes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsToRow(s)),
  });
}
