import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  UserPlus,
  X,
} from 'lucide-react';
import { Product, Client, Sale, SaleItem, PaymentMethod } from '../types';
import { formatCurrency } from '../data/initialData';

interface NewSaleViewProps {
  products: Product[];
  clients: Client[];
  onCompleteSale: (sale: Omit<Sale, 'id' | 'saleNumber'>) => void;
  onQuickAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  preselectedClientId?: string | null;
}

export const NewSaleView: React.FC<NewSaleViewProps> = ({
  products,
  clients,
  onCompleteSale,
  onQuickAddClient,
  preselectedClientId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Cart state
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preselectedClientId || ''
  );
  const [customClientName, setCustomClientName] = useState('Consumidor Final (Balcão)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [discount, setDiscount] = useState<string>('0');
  const [saleNotes, setSaleNotes] = useState('');

  // Quick add client modal
  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientPhone, setQuickClientPhone] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'todas' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.productId === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      alert(`Estoque insuficiente. Há apenas ${product.stock} unidade(s) disponível(is).`);
      return;
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          quantity: 1,
          subtotal: product.sellingPrice,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, newQty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > prod.stock) {
      alert(`Quantidade solicitada excede o estoque disponível (${prod.stock} un).`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount('0');
    setSaleNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalCost = cart.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
  const discountVal = Math.min(subtotal, Math.max(0, parseFloat(discount) || 0));
  const finalTotal = Math.max(0, subtotal - discountVal);
  const estimatedProfit = finalTotal - totalCost;

  const handleFinishSale = () => {
    if (cart.length === 0) {
      alert('Adicione pelo menos um produto para concluir a venda.');
      return;
    }

    let clientName = customClientName;
    if (selectedClientId) {
      const found = clients.find((c) => c.id === selectedClientId);
      if (found) clientName = found.name;
    }

    onCompleteSale({
      date: new Date().toISOString(),
      clientId: selectedClientId || undefined,
      clientName: clientName.trim() || 'Consumidor Final (Balcão)',
      items: cart,
      subtotal,
      discount: discountVal,
      total: finalTotal,
      totalCost,
      paymentMethod,
      notes: saleNotes.trim() || undefined,
    });

    clearCart();
  };

  const handleSaveQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientName.trim()) return;
    const newCli = onQuickAddClient({
      name: quickClientName.trim(),
      phone: quickClientPhone.trim() || 'Não informado',
      notes: 'Cadastrada durante registro de venda',
    });
    setSelectedClientId(newCli.id);
    setIsQuickClientOpen(false);
    setQuickClientName('');
    setQuickClientPhone('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left side: Product Catalog / Selection (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Nova Venda</h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Selecione os produtos para adicionar à venda atual.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="pos-search-product"
              type="text"
              placeholder="Pesquisar produto pelo nome, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('todas')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'todas'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-neutral-200 text-neutral-400 text-sm">
              Nenhum produto correspondente encontrado.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const inCartItem = cart.find((it) => it.productId === p.id);
              const inCartQty = inCartItem ? inCartItem.quantity : 0;
              const remainingStock = p.stock - inCartQty;
              const isOutOfStock = remainingStock <= 0;

              return (
                <div
                  key={p.id}
                  className={`bg-white p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isOutOfStock
                      ? 'border-neutral-200 opacity-60'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-medium text-neutral-500 uppercase">
                        {p.category}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          p.stock <= p.minStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        Estoque: {p.stock} un.
                      </span>
                    </div>

                    <h4 className="font-semibold text-neutral-900 text-sm mt-1 leading-snug">
                      {p.name}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{p.brand}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 block">Preço</span>
                      <span className="text-base font-bold text-neutral-900">
                        {formatCurrency(p.sellingPrice)}
                      </span>
                    </div>

                    <button
                      id={`add-to-cart-${p.id}-btn`}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        isOutOfStock
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{inCartQty > 0 ? `Adicionado (${inCartQty})` : 'Adicionar'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right side: Active Sale / Checkout (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-neutral-800" />
              <h3 className="font-bold text-neutral-900 text-base">Carrinho de Venda</h3>
            </div>
            {cart.length > 0 && (
              <button
                id="clear-cart-btn"
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-rose-600 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Client Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-600">
                Cliente da venda
              </label>
              <button
                id="quick-add-client-btn"
                onClick={() => setIsQuickClientOpen(true)}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Cadastrar rápido</span>
              </button>
            </div>

            <select
              id="select-client-for-sale"
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                if (!e.target.value) {
                  setCustomClientName('Consumidor Final (Balcão)');
                }
              }}
              className="w-full text-xs sm:text-sm py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400"
            >
              <option value="">Consumidor Final (Balcão)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-lg">
                Nenhum produto no carrinho.
                <br />
                Clique em um produto à esquerda para adicionar.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-neutral-900 block leading-tight">
                      {item.productName}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {formatCurrency(item.unitPrice)} un.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-neutral-200 rounded-md bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-neutral-100 text-neutral-600 rounded-l-md"
                        title="Diminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-neutral-100 text-neutral-600 rounded-r-md"
                        title="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-neutral-900 w-16 text-right">
                      {formatCurrency(item.subtotal)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-neutral-400 hover:text-rose-600 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-200">
            <label className="text-xs font-medium text-neutral-600 block">
              Forma de pagamento
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'pix', label: 'Pix', icon: QrCode },
                { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
                { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
                { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount & Notes */}
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">
                Desconto (R$)
              </label>
              <input
                id="sale-discount-input"
                type="number"
                step="0.50"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 block mb-1">
                Observação
              </label>
              <input
                id="sale-notes-input"
                type="text"
                placeholder="Ex: cliente solicitou embrulho"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400"
              />
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="pt-3 border-t border-neutral-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens):</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Desconto aplicado:</span>
                <span>-{formatCurrency(discountVal)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-neutral-900 pt-1 border-t border-neutral-200">
              <span>Total da Venda:</span>
              <span className="text-lg">{formatCurrency(finalTotal)}</span>
            </div>

            {/* Discreet profit indicator for the owner */}
            {cart.length > 0 && (
              <div className="flex justify-between text-[11px] text-neutral-500 pt-0.5">
                <span>Lucro líquido estimado:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(estimatedProfit)}
                </span>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            id="finish-sale-btn"
            disabled={cart.length === 0}
            onClick={handleFinishSale}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              cart.length === 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Concluir Venda e Gerar Recibo</span>
          </button>
        </div>
      </div>

      {/* Quick Add Client Modal */}
      <AnimatePresence>
      {isQuickClientOpen && (
        <motion.div
          id="quick-client-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-neutral-200 p-5"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h4 className="font-semibold text-neutral-900 text-sm">Cadastro Rápido de Cliente</h4>
              <button
                onClick={() => setIsQuickClientOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickClient} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nome da Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={quickClientPhone}
                  onChange={(e) => setQuickClientPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsQuickClientOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                >
                  Salvar e Selecionar
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
