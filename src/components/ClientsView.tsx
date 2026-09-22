import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  FileText,
  Edit2,
  Trash2,
  X,
  Clock,
} from 'lucide-react';
import { Client, Sale } from '../types';
import { formatCurrency, formatDate } from '../data/initialData';

interface ClientsViewProps {
  clients: Client[];
  sales: Sale[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onSelectClientForSale?: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  sales,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onSelectClientForSale,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewHistoryClient, setViewHistoryClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    });
  }, [clients, searchTerm]);

  // Map each client to their sales stats
  const clientStats = useMemo(() => {
    const map = new Map<string, { count: number; totalSpent: number; lastDate: string | null }>();
    clients.forEach((c) => {
      const clientSales = sales.filter((s) => s.clientId === c.id);
      const total = clientSales.reduce((acc, s) => acc + s.total, 0);
      const last = clientSales.length > 0 ? clientSales[0].date : null;
      map.set(c.id, {
        count: clientSales.length,
        totalSpent: total,
        lastDate: last,
      });
    });
    return map;
  }, [clients, sales]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      setEditingClient(null);
    } else {
      onAddClient({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  const clientHistorySales = useMemo(() => {
    if (!viewHistoryClient) return [];
    return sales.filter((s) => s.clientId === viewHistoryClient.id);
  }, [viewHistoryClient, sales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Clientes</h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Cadastre suas clientes, acompanhe o histórico de compras e preferências capilares.
          </p>
        </div>

        <button
          id="open-add-client-modal-btn"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="search-client-input"
            type="text"
            placeholder="Buscar cliente por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-700">Nenhuma cliente encontrada</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Cadastre sua primeira cliente para vincular compras e emitir comprovantes nominais.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nome da Cliente</th>
                  <th className="py-3 px-3">Contato</th>
                  <th className="py-3 px-3">Observações / Preferências</th>
                  <th className="py-3 px-3 text-center">Compras</th>
                  <th className="py-3 px-3 text-right">Total Comprado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredClients.map((client) => {
                  const stats = clientStats.get(client.id) || {
                    count: 0,
                    totalSpent: 0,
                    lastDate: null,
                  };

                  return (
                    <tr key={client.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{client.name}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 text-neutral-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{client.phone || 'Sem telefone'}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1 text-neutral-500 text-xs mt-0.5">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            <span>{client.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 max-w-xs">
                        <p className="text-xs text-neutral-600 truncate">
                          {client.notes || 'Nenhuma observação'}
                        </p>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          id={`view-history-${client.id}-btn`}
                          onClick={() => setViewHistoryClient(client)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors font-medium"
                          title="Ver histórico de compras"
                        >
                          <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{stats.count} vendas</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-3 text-right font-medium text-neutral-900">
                        {formatCurrency(stats.totalSpent)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectClientForSale && (
                            <button
                              id={`start-sale-for-${client.id}-btn`}
                              onClick={() => onSelectClientForSale(client)}
                              className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                              title="Registrar nova venda para esta cliente"
                            >
                              Vender
                            </button>
                          )}

                          <button
                            id={`edit-client-${client.id}-btn`}
                            onClick={() => handleOpenEditModal(client)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Editar cliente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            id={`delete-client-${client.id}-btn`}
                            onClick={() => {
                              if (
                                confirm(
                                  `Tem certeza que deseja excluir o cadastro de "${client.name}"?`
                                )
                              ) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Excluir cliente"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal: Add or Edit Client */}
      <AnimatePresence>
      {(isAddModalOpen || editingClient) && (
        <motion.div
          id="client-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="bg-white w-full max-w-md rounded-xl shadow-xl border border-neutral-200 p-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900 text-base">
                {editingClient ? 'Editar Cadastro de Cliente' : 'Cadastrar Nova Cliente'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingClient(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Nome Completo *
                </label>
                <input
                  id="client-name-input"
                  type="text"
                  required
                  placeholder="Ex: Fernanda Lima"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  id="client-phone-input"
                  type="text"
                  required
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  E-mail (opcional)
                </label>
                <input
                  id="client-email-input"
                  type="email"
                  placeholder="cliente@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Tipo de Cabelo / Preferências / Observações
                </label>
                <textarea
                  id="client-notes-input"
                  rows={3}
                  placeholder="Ex: Cabelo descolorido, gosta de óleos florais, cronograma capilar"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="save-client-submit-btn"
                  className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Modal: Client Purchase History */}
      <AnimatePresence>
      {viewHistoryClient && (
        <motion.div
          id="client-history-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-neutral-200 p-6 max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="font-semibold text-neutral-900 text-base">Histórico de Compras</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Cliente: {viewHistoryClient.name}</p>
              </div>
              <button
                onClick={() => setViewHistoryClient(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {clientHistorySales.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  Nenhuma compra registrada para esta cliente até o momento.
                </div>
              ) : (
                clientHistorySales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-800">
                        Registro #{sale.saleNumber}
                      </span>
                      <span className="flex items-center gap-1 text-neutral-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(sale.date)}
                      </span>
                    </div>

                    <div className="divide-y divide-neutral-100 text-xs">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="py-1 flex justify-between">
                          <span className="text-neutral-700">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium text-neutral-900">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
                      <span className="text-neutral-500">
                        Pagamento:{' '}
                        <span className="font-medium text-neutral-800 uppercase">
                          {sale.paymentMethod}
                        </span>
                      </span>
                      <span className="font-bold text-sm text-neutral-900">
                        Total: {formatCurrency(sale.total)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setViewHistoryClient(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
