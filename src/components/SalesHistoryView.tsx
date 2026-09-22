import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Printer,
  Trash2,
  Calendar,
  Filter,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { Sale } from '../types';
import { formatCurrency, formatDate } from '../data/initialData';

interface SalesHistoryViewProps {
  sales: Sale[];
  onViewReceipt: (sale: Sale) => void;
  onCancelSale: (saleId: string) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  onViewReceipt,
  onCancelSale,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return sales
      .filter((sale) => {
        const matchesSearch =
          sale.saleNumber.toString().includes(searchTerm) ||
          sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.items.some((item) =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
          );

        if (!matchesSearch) return false;

        const saleDate = new Date(sale.date);
        if (dateFilter === 'today') {
          return sale.date.startsWith(todayStr);
        }
        if (dateFilter === '7days') {
          return saleDate >= sevenDaysAgo;
        }
        if (dateFilter === 'month') {
          return saleDate >= firstDayOfMonth;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm, dateFilter]);

  const totalPeriodRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'pix':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cartao_credito':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'cartao_debito':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'dinheiro':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getPaymentName = (method: string) => {
    switch (method) {
      case 'pix':
        return 'Pix';
      case 'cartao_credito':
        return 'Cartão Crédito';
      case 'cartao_debito':
        return 'Cartão Débito';
      case 'dinheiro':
        return 'Dinheiro';
      default:
        return 'Outro';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Histórico de Vendas Realizadas
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Consulte todas as vendas registradas, imprima recibos e notas não-fiscais.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 self-start sm:self-auto">
          <span className="text-xs text-neutral-500 block">Total do período filtrado</span>
          <span className="text-lg font-bold text-neutral-900">
            {formatCurrency(totalPeriodRevenue)}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="search-sales-input"
              type="text"
              placeholder="Buscar por número (#1001), cliente ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div className="flex items-center bg-white p-1 rounded-lg border border-neutral-200 text-xs font-medium overflow-x-auto">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'today', label: 'Hoje' },
              { id: '7days', label: '7 dias' },
              { id: 'month', label: 'Este mês' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  dateFilter === f.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-700">Nenhuma venda encontrada</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Registre uma nova venda na aba "Nova Venda" para que ela apareça neste histórico.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Registro</th>
                  <th className="py-3 px-3">Data e Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Itens Comprados</th>
                  <th className="py-3 px-3">Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredSales.map((sale) => {
                  const itemsSummary = sale.items
                    .map((it) => `${it.quantity}x ${it.productName}`)
                    .join(', ');

                  return (
                    <tr key={sale.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        #{sale.saleNumber}
                      </td>

                      <td className="py-3.5 px-3 text-neutral-600 whitespace-nowrap">
                        {formatDate(sale.date)}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-neutral-900">
                        {sale.clientName}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs text-neutral-700 truncate" title={itemsSummary}>
                          {itemsSummary}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {sale.items.reduce((a, b) => a + b.quantity, 0)} unidade(s)
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getPaymentBadge(
                            sale.paymentMethod
                          )}`}
                        >
                          {getPaymentName(sale.paymentMethod)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-neutral-900 whitespace-nowrap">
                        {formatCurrency(sale.total)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`view-receipt-${sale.id}-btn`}
                            onClick={() => onViewReceipt(sale)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                            title="Visualizar e Imprimir Recibo"
                          >
                            <Printer className="w-3.5 h-3.5 text-neutral-700" />
                            <span>Nota / Recibo</span>
                          </button>

                          <button
                            id={`cancel-sale-${sale.id}-btn`}
                            onClick={() => {
                              if (
                                confirm(
                                  `Deseja cancelar o registro da venda #${sale.saleNumber}? Os produtos retornarão ao estoque.`
                                )
                              ) {
                                onCancelSale(sale.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Cancelar venda e devolver itens ao estoque"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
