import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Sale, Product } from '../types';
import { formatCurrency, formatDateShort } from '../data/initialData';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sales, products }) => {
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'all'>('month');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      if (period === 'today') {
        return sale.date.startsWith(todayStr);
      }
      if (period === '7days') {
        return saleDate >= sevenDaysAgo;
      }
      if (period === 'month') {
        return saleDate >= firstDayOfMonth;
      }
      return true;
    });
  }, [sales, period]);

  // Aggregates
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalCost = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin =
    totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const totalSalesCount = filteredSales.length;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  // Best selling products in period
  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; brand: string; quantity: number; revenue: number }
    >();

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.productId;
        const current = map.get(key) || {
          name: item.productName,
          brand: item.brand,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += item.quantity;
        current.revenue += item.subtotal;
        map.set(key, current);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredSales]);

  // Low stock products needing replenishment
  const replenishmentProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock);
  }, [products]);

  // Payment methods breakdown
  const paymentBreakdown = useMemo(() => {
    const summary: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      cartao_credito: { count: 0, total: 0 },
      cartao_debito: { count: 0, total: 0 },
      dinheiro: { count: 0, total: 0 },
      outro: { count: 0, total: 0 },
    };

    filteredSales.forEach((s) => {
      const m = s.paymentMethod || 'outro';
      if (!summary[m]) summary[m] = { count: 0, total: 0 };
      summary[m].count += 1;
      summary[m].total += s.total;
    });

    return summary;
  }, [filteredSales]);

  const handleExportCSV = () => {
    const headers = [
      'Numero_Venda',
      'Data',
      'Cliente',
      'Qtd_Itens',
      'Forma_Pagamento',
      'Subtotal',
      'Desconto',
      'Total',
      'Custo_Estimado',
      'Lucro_Estimado',
    ];

    const rows = filteredSales.map((s) => [
      `#${s.saleNumber}`,
      formatDateShort(s.date),
      `"${s.clientName.replace(/"/g, '""')}"`,
      s.items.reduce((a, b) => a + b.quantity, 0),
      s.paymentMethod,
      s.subtotal.toFixed(2),
      s.discount.toFixed(2),
      s.total.toFixed(2),
      s.totalCost.toFixed(2),
      (s.total - s.totalCost).toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_vendas_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'Hoje';
      case '7days':
        return 'Últimos 7 dias';
      case 'month':
        return 'Este Mês';
      case 'all':
        return 'Todo o Histórico';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Relatórios e Indicadores
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Acompanhe o faturamento, lucro sobre os produtos e reposição de estoque.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white p-1 rounded-lg border border-neutral-200 text-xs font-medium">
            {[
              { id: 'today', label: 'Hoje' },
              { id: '7days', label: '7 Dias' },
              { id: 'month', label: 'Este Mês' },
              { id: 'all', label: 'Tudo' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  period === p.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Planilha (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">
            Faturamento ({getPeriodLabel()})
          </span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-[11px] text-neutral-500">
            {totalSalesCount} venda(s) realizada(s)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Lucro Bruto Estimado</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {formatCurrency(totalProfit)}
          </span>
          <span className="text-[11px] text-neutral-500">
            Margem aproximada: {profitMargin}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">
            Custo dos Produtos Vendidos
          </span>
          <span className="text-2xl font-bold text-neutral-700 mt-1 block">
            {formatCurrency(totalCost)}
          </span>
          <span className="text-[11px] text-neutral-500">Valor pago aos fornecedores</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Ticket Médio por Venda</span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block">
            {formatCurrency(averageTicket)}
          </span>
          <span className="text-[11px] text-neutral-500">Média por cliente no período</span>
        </div>
      </div>

      {/* Two Columns: Best Sellers & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neutral-700" />
              <h3 className="font-bold text-neutral-900 text-sm">
                Produtos Mais Vendidos ({getPeriodLabel()})
              </h3>
            </div>
            <span className="text-xs text-neutral-400">Por unidades</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              Nenhuma venda registrada no período selecionado.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-[11px]">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-neutral-900">{p.name}</div>
                      <div className="text-[11px] text-neutral-400">{p.brand}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-neutral-900">{p.quantity} un. vendidas</div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      {formatCurrency(p.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Replenishment Alert */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-neutral-900 text-sm">
                Alerta de Reposição de Estoque
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {replenishmentProducts.length} itens
            </span>
          </div>

          {replenishmentProducts.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              Todos os produtos estão com estoque em nível seguro.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {replenishmentProducts.map((p) => {
                const suggestedBuy = Math.max(1, p.minStock * 2 - p.stock);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900">{p.name}</div>
                      <div className="text-[11px] text-neutral-500">
                        {p.brand} • Categoria: {p.category}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-amber-800">
                        {p.stock === 0 ? 'Esgotado (0 un)' : `Apenas ${p.stock} un`}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Comprar ~{suggestedBuy} un (Mín: {p.minStock})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment methods distribution */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
          <CreditCard className="w-4 h-4 text-neutral-700" />
          <h3 className="font-bold text-neutral-900 text-sm">
            Recebimentos por Forma de Pagamento ({getPeriodLabel()})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { key: 'pix', label: 'Pix' },
            { key: 'cartao_credito', label: 'Cartão Crédito' },
            { key: 'cartao_debito', label: 'Cartão Débito' },
            { key: 'dinheiro', label: 'Dinheiro' },
          ].map((item) => {
            const data = paymentBreakdown[item.key] || { count: 0, total: 0 };
            const percent = totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0;

            return (
              <div key={item.key} className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                <span className="text-xs text-neutral-500 font-medium block">{item.label}</span>
                <span className="text-base font-bold text-neutral-900 mt-0.5 block">
                  {formatCurrency(data.total)}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {data.count} venda(s) ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
