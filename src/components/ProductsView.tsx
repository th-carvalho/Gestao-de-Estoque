import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plus,
  Search,
  AlertTriangle,
  ArrowDownToLine,
  Edit2,
  Trash2,
  Check,
  X,
  PackageCheck,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../data/initialData';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onStockEntry: (productId: string, quantityToAdd: number, newCostPrice?: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onStockEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockEntryProduct, setStockEntryProduct] = useState<Product | null>(null);
  const [entryQuantity, setEntryQuantity] = useState<number>(1);
  const [entryNewCost, setEntryNewCost] = useState<string>('');

  // Form state for add / edit
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Tratamento',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    minStock: '3',
    notes: '',
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'todas' || product.category === selectedCategory;

      const matchesLowStock = !onlyLowStock || product.stock <= product.minStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, searchTerm, selectedCategory, onlyLowStock]);

  // Inventory summary totals
  const totalItemsCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockCost = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
  const totalStockSalesValue = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      brand: '',
      category: categories[0] || 'Tratamento',
      costPrice: '',
      sellingPrice: '',
      stock: '0',
      minStock: '3',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      notes: product.notes || '',
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(formData.costPrice) || 0;
    const price = parseFloat(formData.sellingPrice) || 0;
    const stock = parseInt(formData.stock, 10) || 0;
    const minStock = parseInt(formData.minStock, 10) || 0;

    if (!formData.name.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        costPrice: cost,
        sellingPrice: price,
        stock: stock,
        minStock: minStock,
        notes: formData.notes.trim(),
      });
      setEditingProduct(null);
    } else {
      onAddProduct({
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        costPrice: cost,
        sellingPrice: price,
        stock: stock,
        minStock: minStock,
        notes: formData.notes.trim(),
      });
      setIsAddModalOpen(false);
    }
  };

  const handleOpenStockEntry = (product: Product) => {
    setStockEntryProduct(product);
    setEntryQuantity(1);
    setEntryNewCost(product.costPrice.toString());
  };

  const handleConfirmStockEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockEntryProduct) return;
    const qty = parseInt(String(entryQuantity), 10);
    const newCost = entryNewCost ? parseFloat(entryNewCost) : undefined;
    if (qty > 0) {
      onStockEntry(stockEntryProduct.id, qty, newCost);
    }
    setStockEntryProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Top action and stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Estoque de Produtos
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Cadastre novos cosméticos, controle quantidades e registre entradas de reposição.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-add-product-modal-btn"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Total de Itens</span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block">
            {totalItemsCount} un.
          </span>
          <span className="text-[11px] text-neutral-500">{products.length} produtos cadastrados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Itens com Estoque Baixo</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-2xl font-bold ${
                lowStockCount > 0 ? 'text-amber-700' : 'text-neutral-900'
              }`}
            >
              {lowStockCount}
            </span>
            {lowStockCount > 0 && <AlertTriangle className="w-4 h-4 text-amber-600" />}
          </div>
          <span className="text-[11px] text-neutral-500">Abaixo do estoque mínimo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Custo Total em Estoque</span>
          <span className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 block">
            {formatCurrency(totalStockCost)}
          </span>
          <span className="text-[11px] text-neutral-500">Investimento em mercadoria</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium block">Previsão em Vendas</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 block">
            {formatCurrency(totalStockSalesValue)}
          </span>
          <span className="text-[11px] text-neutral-500">Valor de revenda estocado</span>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="search-product-input"
              type="text"
              placeholder="Buscar por produto, marca ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400"
            >
              <option value="todas">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              id="filter-low-stock-btn"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                onlyLowStock
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Estoque Baixo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <PackageCheck className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-700">Nenhum produto encontrado</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Verifique os termos da busca ou cadastre um novo produto de cabelo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Produto & Marca</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3 text-right">Preço Custo</th>
                  <th className="py-3 px-3 text-right">Preço Venda</th>
                  <th className="py-3 px-3 text-right">Margem</th>
                  <th className="py-3 px-4 text-center">Estoque</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const profit = p.sellingPrice - p.costPrice;
                  const marginPercent =
                    p.sellingPrice > 0 ? Math.round((profit / p.sellingPrice) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{p.name}</div>
                        <div className="text-xs text-neutral-500 font-normal">
                          {p.brand} {p.notes ? `• ${p.notes}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-600">
                        {formatCurrency(p.costPrice)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-medium text-neutral-900">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="font-medium text-emerald-700">
                          {formatCurrency(profit)}
                        </div>
                        <div className="text-[11px] text-neutral-400">{marginPercent}% margem</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold">
                          <span
                            className={`text-sm ${
                              p.stock === 0
                                ? 'text-rose-700'
                                : isLow
                                ? 'text-amber-700'
                                : 'text-neutral-900'
                            }`}
                          >
                            {p.stock} un.
                          </span>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            {p.stock === 0 ? 'Esgotado' : `Mínimo: ${p.minStock}`}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Entrada de Estoque Rápida */}
                          <button
                            id={`stock-entry-${p.id}-btn`}
                            onClick={() => handleOpenStockEntry(p)}
                            className="p-1.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                            title="Entrada de estoque (repor produtos)"
                          >
                            <ArrowDownToLine className="w-4 h-4 text-emerald-700" />
                          </button>

                          {/* Editar */}
                          <button
                            id={`edit-product-${p.id}-btn`}
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Editar produto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            id={`delete-product-${p.id}-btn`}
                            onClick={() => {
                              if (confirm(`Deseja remover "${p.name}" do catálogo?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Excluir produto"
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

      {/* Modal: Add or Edit Product */}
      <AnimatePresence>
      {(isAddModalOpen || editingProduct) && (
        <motion.div
          id="product-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="bg-white w-full max-w-md rounded-xl shadow-xl border border-neutral-200 p-6 my-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900 text-base">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Nome do produto *
                </label>
                <input
                  id="product-name-input"
                  type="text"
                  required
                  placeholder="Ex: Máscara Reconstrutora 500g"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Marca / fabricante
                  </label>
                  <input
                    id="product-brand-input"
                    type="text"
                    placeholder="Ex: Wella, Truss, Braé"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Categoria
                  </label>
                  <input
                    id="product-category-input"
                    type="text"
                    placeholder="Ex: Tratamento, Shampoo"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Preço de custo (R$) *
                  </label>
                  <input
                    id="product-cost-input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Preço de venda (R$) *
                  </label>
                  <input
                    id="product-selling-input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Estoque atual
                  </label>
                  <input
                    id="product-stock-input"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Estoque mínimo (alerta)
                  </label>
                  <input
                    id="product-min-stock-input"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Observações / modo de uso (opcional)
                </label>
                <textarea
                  id="product-notes-input"
                  rows={2}
                  placeholder="Instruções de aplicação ou notas sobre o fornecedor"
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
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="save-product-submit-btn"
                  className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {editingProduct ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Modal: Quick Stock Entry (Entrada de Produtos) */}
      <AnimatePresence>
      {stockEntryProduct && (
        <motion.div
          id="stock-entry-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-neutral-200 p-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-neutral-900 text-base">Entrada de Mercadoria</h3>
              </div>
              <button
                onClick={() => setStockEntryProduct(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockEntry} className="space-y-4 mt-4">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <div className="font-medium text-neutral-900 text-sm">
                  {stockEntryProduct.name}
                </div>
                <div className="text-xs text-neutral-500">
                  Marca: {stockEntryProduct.brand} • Estoque atual:{' '}
                  <span className="font-semibold text-neutral-800">
                    {stockEntryProduct.stock} un.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Quantidade a adicionar *
                </label>
                <input
                  id="entry-quantity-input"
                  type="number"
                  min="1"
                  required
                  value={entryQuantity}
                  onChange={(e) => setEntryQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 text-base font-semibold border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
                <span className="text-[11px] text-neutral-500 block mt-1">
                  Novo estoque será: {stockEntryProduct.stock + (entryQuantity || 0)} un.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Preço de custo unitário (R$)
                </label>
                <input
                  id="entry-cost-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={entryNewCost}
                  onChange={(e) => setEntryNewCost(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Atualize se o fornecedor tiver alterado o custo desta remessa.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setStockEntryProduct(null)}
                  className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="confirm-stock-entry-btn"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Entrada</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
