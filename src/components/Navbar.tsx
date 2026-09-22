import React from 'react';
import {
  Package,
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { TabType, StoreSettings } from '../types';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  lowStockCount: number;
  settings: StoreSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  lowStockCount,
  settings,
}) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'nova_venda', label: 'Nova Venda', icon: ShoppingCart },
    { id: 'produtos', label: 'Estoque / Produtos', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'vendas', label: 'Histórico de Vendas', icon: FileText },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <header className="no-print bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
              {settings.storeName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-neutral-900 leading-tight">
                {settings.storeName}
              </h1>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Controle de Estoque e Vendas de Produtos
              </p>
            </div>
          </div>

          {/* Quick Info & Config */}
          <div className="flex items-center gap-2">
            {lowStockCount > 0 && (
              <button
                id="header-low-stock-btn"
                onClick={() => onSelectTab('produtos')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                title={`${lowStockCount} produto(s) com estoque baixo`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowStockCount} estoque baixo</span>
              </button>
            )}

          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-neutral-100 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}-btn`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'produtos' && lowStockCount > 0 && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
