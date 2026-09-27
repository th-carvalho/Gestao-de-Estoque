import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { ProductsView } from './components/ProductsView';
import { ClientsView } from './components/ClientsView';
import { NewSaleView } from './components/NewSaleView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ReportsView } from './components/ReportsView';
import { ReceiptModal } from './components/ReceiptModal';
import { TabType, Product, Client, Sale, StoreSettings } from './types';
import { INITIAL_SETTINGS } from './data/initialData';
import {
  apiGetProducts, apiAddProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetClients, apiAddClient, apiUpdateClient, apiDeleteClient,
  apiGetSales, apiAddSale, apiDeleteSale,
  apiGetSettings, apiSaveSettings,
} from './data/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('nova_venda');
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [preselectedClientId, setPreselectedClientId] = useState<string | null>(null);

  // Carrega dados do banco na inicialização
  useEffect(() => {
    apiGetProducts().then(setProducts).catch(console.error);
    apiGetClients().then(setClients).catch(console.error);
    apiGetSales().then(setSales).catch(console.error);
    apiGetSettings().then(setSettings).catch(console.error);
  }, []);

  // Product Actions
  const handleAddProduct = async (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await apiAddProduct(newProduct);
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await apiUpdateProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await apiDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStockEntry = async (productId: string, quantityToAdd: number, newCostPrice?: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stock: p.stock + quantityToAdd,
          costPrice: newCostPrice !== undefined && newCostPrice > 0 ? newCostPrice : p.costPrice,
        };
      }
      return p;
    });
    const product = updated.find((p) => p.id === productId);
    if (product) {
      await apiUpdateProduct(product);
      setProducts(updated);
    }
  };

  // Client Actions
  const handleAddClient = async (newCliData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const newClient: Client = {
      ...newCliData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await apiAddClient(newClient);
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    await apiUpdateClient(updatedClient);
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const handleDeleteClient = async (id: string) => {
    await apiDeleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelectClientForSale = (client: Client) => {
    setPreselectedClientId(client.id);
    setCurrentTab('nova_venda');
  };

  // Sale Actions
  const handleCompleteSale = async (saleData: Omit<Sale, 'id' | 'saleNumber'>) => {
    const nextNumber = sales.length > 0 ? Math.max(...sales.map((s) => s.saleNumber)) + 1 : 1001;
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      saleNumber: nextNumber,
    };
    // O servidor já desconta o estoque, mas atualizamos o state local também
    setProducts((prev) =>
      prev.map((p) => {
        const itemInSale = saleData.items.find((it) => it.productId === p.id);
        if (itemInSale) return { ...p, stock: Math.max(0, p.stock - itemInSale.quantity) };
        return p;
      })
    );
    await apiAddSale(newSale);
    setSales((prev) => [newSale, ...prev]);
    setPreselectedClientId(null);
    setActiveReceiptSale(newSale);
  };

  const handleCancelSale = async (saleId: string) => {
    // O servidor restaura o estoque ao deletar
    await apiDeleteSale(saleId);
    const saleToCancel = sales.find((s) => s.id === saleId);
    if (saleToCancel) {
      setProducts((prev) =>
        prev.map((p) => {
          const item = saleToCancel.items.find((it) => it.productId === p.id);
          if (item) return { ...p, stock: p.stock + item.quantity };
          return p;
        })
      );
    }
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lowStockCount={lowStockCount}
        settings={settings}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {currentTab === 'nova_venda' && (
              <NewSaleView
                products={products}
                clients={clients}
                onCompleteSale={handleCompleteSale}
                onQuickAddClient={handleAddClient}
                preselectedClientId={preselectedClientId}
              />
            )}
            {currentTab === 'produtos' && (
              <ProductsView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onStockEntry={handleStockEntry}
              />
            )}
            {currentTab === 'clientes' && (
              <ClientsView
                clients={clients}
                sales={sales}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
                onSelectClientForSale={handleSelectClientForSale}
              />
            )}
            {currentTab === 'vendas' && (
              <SalesHistoryView
                sales={sales}
                onViewReceipt={(sale) => setActiveReceiptSale(sale)}
                onCancelSale={handleCancelSale}
              />
            )}
            {currentTab === 'relatorios' && (
              <ReportsView sales={sales} products={products} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="no-print border-t border-neutral-200 bg-white py-3 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{settings.storeName} • Sistema de Controle de Estoque e Vendas</span>
          <span>Operação Local Simplificada • Sem comissão</span>
        </div>
      </footer>

      <AnimatePresence>
        {activeReceiptSale && (
          <ReceiptModal
            sale={activeReceiptSale}
            settings={settings}
            onClose={() => setActiveReceiptSale(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
