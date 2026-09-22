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
import {
  loadStoredProducts,
  saveStoredProducts,
  loadStoredClients,
  saveStoredClients,
  loadStoredSales,
  saveStoredSales,
  loadStoredSettings,
  saveStoredSettings,
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_SALES,
  INITIAL_SETTINGS,
} from './data/initialData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('nova_venda');
  const [products, setProducts] = useState<Product[]>(loadStoredProducts);
  const [clients, setClients] = useState<Client[]>(loadStoredClients);
  const [sales, setSales] = useState<Sale[]>(loadStoredSales);
  const [settings, setSettings] = useState<StoreSettings>(loadStoredSettings);

  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
const [preselectedClientId, setPreselectedClientId] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredClients(clients);
  }, [clients]);

  useEffect(() => {
    saveStoredSales(sales);
  }, [sales]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Product Actions
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStockEntry = (
    productId: string,
    quantityToAdd: number,
    newCostPrice?: number
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stock: p.stock + quantityToAdd,
            costPrice: newCostPrice !== undefined && newCostPrice > 0 ? newCostPrice : p.costPrice,
          };
        }
        return p;
      })
    );
  };

  // Client Actions
  const handleAddClient = (newCliData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...newCliData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelectClientForSale = (client: Client) => {
    setPreselectedClientId(client.id);
    setCurrentTab('nova_venda');
  };

  // Sale Actions
  const handleCompleteSale = (saleData: Omit<Sale, 'id' | 'saleNumber'>) => {
    const nextNumber =
      sales.length > 0 ? Math.max(...sales.map((s) => s.saleNumber)) + 1 : 1001;

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      saleNumber: nextNumber,
    };

    // Decrement stock for each item sold
    setProducts((prev) =>
      prev.map((p) => {
        const itemInSale = saleData.items.find((it) => it.productId === p.id);
        if (itemInSale) {
          return {
            ...p,
            stock: Math.max(0, p.stock - itemInSale.quantity),
          };
        }
        return p;
      })
    );

    // Save sale
    setSales((prev) => [newSale, ...prev]);
    // Clear preselection
    setPreselectedClientId(null);
    // Show printable receipt immediately
    setActiveReceiptSale(newSale);
  };

  const handleCancelSale = (saleId: string) => {
    const saleToCancel = sales.find((s) => s.id === saleId);
    if (!saleToCancel) return;

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = saleToCancel.items.find((it) => it.productId === p.id);
        if (item) {
          return {
            ...p,
            stock: p.stock + item.quantity,
          };
        }
        return p;
      })
    );

    // Remove sale
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  // Reset to initial demo data
  const handleResetData = () => {
    setProducts(INITIAL_PRODUCTS);
    setClients(INITIAL_CLIENTS);
    setSales(INITIAL_SALES);
    setSettings(INITIAL_SETTINGS);
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lowStockCount={lowStockCount}
        settings={settings}
      />

      {/* Main Content Area */}
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

      {/* Footer */}
      <footer className="no-print border-t border-neutral-200 bg-white py-3 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{settings.storeName} • Sistema de Controle de Estoque e Vendas</span>
          <span>Operação Local Simplificada • Sem comissão</span>
        </div>
      </footer>

      {/* Modal: Receipt & Printable Note */}
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
