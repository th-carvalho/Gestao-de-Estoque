import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Printer,
  Trash2,
  Calendar,
  Filter,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Circle,
} from 'lucide-react';
import { Sale, Product } from '../types';
import { formatCurrency, formatDate, formatDateOnly } from '../data/initialData';

interface SalesHistoryViewProps {
  sales: Sale[];
  products: Product[];
  onViewReceipt: (sale: Sale) => void;
  onCancelSale: (saleId: string) => void;
  onMarkAsPaid: (saleId: string) => void;
  onMarkInstallmentPaid: (saleId: string, number: number, paid: boolean) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  products,
  onViewReceipt,
  onCancelSale,
  onMarkAsPaid,
  onMarkInstallmentPaid,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const categoryByProductId = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.id, p.category));
    return map;
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

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

        if (paymentFilter !== 'all' && sale.paymentMethod !== paymentFilter) return false;

        if (
          categoryFilter !== 'all' &&
          !sale.items.some((item) => categoryByProductId.get(item.productId) === categoryFilter)
        ) {
          return false;
        }

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
  }, [sales, searchTerm, dateFilter, paymentFilter, categoryFilter, categoryByProductId]);

  const totalPeriodRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalPendente = filteredSales
    .filter((s) => s.paymentStatus === 'pendente')
    .reduce((acc, s) => acc + s.total, 0);

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
      case 'prazo':
        return 'bg-orange-50 text-orange-800 border-orange-200';
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
      case 'prazo':
        return 'A Prazo';
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

        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 self-start sm:self-auto">
            <span className="text-xs text-neutral-500 block">Total do período filtrado</span>
            <span className="text-lg font-bold text-neutral-900">
              {formatCurrency(totalPeriodRevenue)}
            </span>
          </div>

          {totalPendente > 0 && (
            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-200 self-start sm:self-auto">
              <span className="text-xs text-orange-700 block">Fiado pendente</span>
              <span className="text-lg font-bold text-orange-800">
                {formatCurrency(totalPendente)}
              </span>
            </div>
          )}
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

          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400 appearance-none"
            >
              <option value="all">Todas as formas</option>
              <option value="pix">Pix</option>
              <option value="cartao_credito">Cartão Crédito</option>
              <option value="cartao_debito">Cartão Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="prazo">A Prazo</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400 appearance-none"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredSales.map((sale) => {
                  const itemsSummary = sale.items
                    .map((it) => `${it.quantity}x ${it.productName}`)
                    .join(', ');

                  const hasSchedule = sale.paymentMethod === 'prazo' && (sale.prazoSchedule?.length ?? 0) > 0;
                  const paidCount = sale.prazoSchedule?.filter((p) => p.paid).length ?? 0;
                  const totalParcelas = sale.prazoSchedule?.length ?? 0;
                  const isExpanded = expandedSaleId === sale.id;

                  return (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-neutral-50/70 transition-colors">
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
                            {sale.paymentMethod === 'cartao_credito' && sale.installments > 1
                              ? ` ${sale.installments}x`
                              : ''}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          {hasSchedule ? (
                            <button
                              onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
                                paidCount === totalParcelas
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                              }`}
                              title="Ver datas de pagamento"
                            >
                              {paidCount}/{totalParcelas} pagas
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          ) : sale.paymentStatus === 'pendente' ? (
                            <button
                              onClick={() => {
                                if (confirm(`Confirmar recebimento da venda #${sale.saleNumber}?`)) {
                                  onMarkAsPaid(sale.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 transition-colors"
                              title="Clique para marcar como pago"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Pendente
                            </button>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                              Pago
                            </span>
                          )}
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

                      {hasSchedule && isExpanded && (
                        <tr className="bg-neutral-50/70">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-2">
                              Datas de pagamento combinadas
                            </div>
                            <div className="space-y-1.5 max-w-md">
                              {sale.prazoSchedule!.map((p) => (
                                <div
                                  key={p.number}
                                  className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                    <span className="font-medium text-neutral-800">
                                      {formatDateOnly(p.dueDate)}
                                    </span>
                                    <span className="text-neutral-500">
                                      {formatCurrency(p.amount)}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      onMarkInstallmentPaid(sale.id, p.number, !p.paid)
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
                                      p.paid
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                                    }`}
                                  >
                                    {p.paid ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <Circle className="w-3 h-3" />
                                    )}
                                    {p.paid ? 'Recebido' : 'Marcar como recebido'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
