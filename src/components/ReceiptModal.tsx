import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Printer, Copy, Check, X, FileText } from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { formatCurrency, formatDate } from '../data/initialData';

interface ReceiptModalProps {
  sale: Sale;
  settings: StoreSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, settings, onClose }) => {
  const [copied, setCopied] = useState(false);

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix':
        return 'Pix';
      case 'dinheiro':
        return 'Dinheiro';
      case 'cartao_debito':
        return 'Cartão de Débito';
      case 'cartao_credito':
        return 'Cartão de Crédito';
      default:
        return 'Outro';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `*${settings.storeName}*`,
      `Comprovante de Venda #${sale.saleNumber}`,
      `Data: ${formatDate(sale.date)}`,
      `Cliente: ${sale.clientName}`,
      `---------------------------------`,
      ...sale.items.map(
        (item) =>
          `${item.quantity}x ${item.productName} (${formatCurrency(item.unitPrice)}) = ${formatCurrency(item.subtotal)}`
      ),
      `---------------------------------`,
      `Subtotal: ${formatCurrency(sale.subtotal)}`,
      sale.discount > 0 ? `Desconto: -${formatCurrency(sale.discount)}` : null,
      `*Total: ${formatCurrency(sale.total)}*`,
      `Forma de Pagamento: ${getPaymentLabel(sale.paymentMethod)}`,
      settings.pixKey ? `Chave Pix: ${settings.pixKey}` : null,
      `---------------------------------`,
      `Agradecemos pela preferência!`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <motion.div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-6"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
      >
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-700" />
            <h3 className="font-semibold text-neutral-800 text-base">
              Nota / Comprovante de Venda #{sale.saleNumber}
            </h3>
          </div>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 p-1 rounded-md transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action buttons (hidden on print) */}
        <div className="no-print p-4 bg-neutral-100/70 border-b border-neutral-200 flex flex-wrap gap-2 justify-end">
          <button
            id="copy-whatsapp-text-btn"
            onClick={handleCopyText}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado para o WhatsApp' : 'Copiar Texto para Enviar'}
          </button>
          <button
            id="print-receipt-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>

        {/* Actual Printable Receipt */}
        <div id="printable-receipt" className="p-6 md:p-8 bg-white text-neutral-900 font-sans text-sm">
          {/* Header */}
          <div className="text-center pb-5 border-b border-neutral-200">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
              {settings.storeName}
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">Gestão de Produtos Capilares</p>
            {settings.phone && (
              <p className="text-xs text-neutral-600">Telefone: {settings.phone}</p>
            )}
            {settings.address && (
              <p className="text-xs text-neutral-500">{settings.address}</p>
            )}
            <div className="mt-3 inline-block bg-neutral-100 px-3 py-1 rounded text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Comprovante de Venda Não-Fiscal
            </div>
          </div>

          {/* Sale details */}
          <div className="py-4 border-b border-neutral-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-neutral-500 block">Número do Registro:</span>
              <span className="font-semibold text-neutral-900">#{sale.saleNumber}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Data e Horário:</span>
              <span className="font-semibold text-neutral-900">{formatDate(sale.date)}</span>
            </div>
            <div className="col-span-2 pt-1">
              <span className="text-neutral-500 block">Cliente:</span>
              <span className="font-semibold text-neutral-900 text-sm">{sale.clientName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 border-b border-neutral-200">
            <div className="text-xs font-semibold uppercase text-neutral-500 mb-2">
              Itens da Compra
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-500 text-left">
                  <th className="pb-1 font-medium">Qtd</th>
                  <th className="pb-1 font-medium">Descrição</th>
                  <th className="pb-1 font-medium text-right">Unit.</th>
                  <th className="pb-1 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sale.items.map((item, index) => (
                  <tr key={index} className="py-1">
                    <td className="py-1.5 align-top font-medium w-8">{item.quantity}x</td>
                    <td className="py-1.5 align-top">
                      <div className="font-medium text-neutral-800">{item.productName}</div>
                      {item.brand && (
                        <div className="text-[11px] text-neutral-400">{item.brand}</div>
                      )}
                    </td>
                    <td className="py-1.5 align-top text-right text-neutral-600 w-20">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-1.5 align-top text-right font-medium text-neutral-900 w-20">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment */}
          <div className="py-4 border-b border-neutral-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Desconto aplicado</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-neutral-900 pt-1 border-t border-neutral-200">
              <span>Total Pago</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-600 pt-1">
              <span>Forma de Pagamento:</span>
              <span className="font-medium text-neutral-900">
                {getPaymentLabel(sale.paymentMethod)}
              </span>
            </div>
            {settings.pixKey && sale.paymentMethod === 'pix' && (
              <div className="flex justify-between text-xs text-neutral-600">
                <span>Chave Pix:</span>
                <span className="font-mono text-neutral-800">{settings.pixKey}</span>
              </div>
            )}
          </div>

          {/* Notes if any */}
          {sale.notes && (
            <div className="py-3 border-b border-neutral-200 text-xs">
              <span className="text-neutral-500 block font-medium">Observações:</span>
              <p className="text-neutral-700 mt-0.5">{sale.notes}</p>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-6 text-center text-xs text-neutral-500 space-y-1">
            <p className="font-medium text-neutral-700">Obrigado pela preferência e confiança!</p>
            <p className="text-[11px] text-neutral-400">
              Em caso de dúvidas sobre o modo de uso dos produtos, entre em contato.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
