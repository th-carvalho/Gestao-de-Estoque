import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Printer, Copy, Check, X, Receipt } from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { formatCurrency, formatDate } from '../data/initialData';

interface ReceiptModalProps {
  sale: Sale;
  settings: StoreSettings;
  onClose: () => void;
}

const LINE = '--------------------------------';

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
        return sale.installments > 1
          ? `Cartão de Crédito ${sale.installments}x`
          : 'Cartão de Crédito à vista';
      case 'prazo':
        return 'A Prazo (Fiado)';
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
      sale.paymentMethod === 'cartao_credito' && sale.installments > 1
        ? `Pagamento: ${sale.installments}x de ${formatCurrency(sale.total / sale.installments)}`
        : `Forma de Pagamento: ${getPaymentLabel(sale.paymentMethod)}`,
      settings.pixKey && sale.paymentMethod === 'pix' ? `Chave Pix: ${settings.pixKey}` : null,
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
        className="bg-white w-full max-w-xs rounded-xl shadow-xl border border-neutral-200 overflow-hidden my-6"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
      >
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-neutral-700" />
            <h3 className="font-semibold text-neutral-800 text-sm">Cupom #{sale.saleNumber}</h3>
          </div>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 p-1 rounded-md transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons (hidden on print) */}
        <div className="no-print p-3 bg-neutral-100/70 border-b border-neutral-200 flex flex-col gap-2">
          <button
            id="print-receipt-btn"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Imprimir Cupom
          </button>
          <button
            id="copy-whatsapp-text-btn"
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado para o WhatsApp' : 'Copiar Texto para WhatsApp'}
          </button>
        </div>

        {/* Actual Printable Coupon */}
        <div className="bg-neutral-200 p-3">
          <div
            id="printable-receipt"
            className="bg-white mx-auto p-3 text-neutral-900 text-[12px] leading-snug"
            style={{ width: '280px', fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Header */}
            <div className="text-center">
              <div className="font-bold text-[14px] uppercase">{settings.storeName}</div>
              {settings.phone && <div>Tel: {settings.phone}</div>}
              {settings.address && <div>{settings.address}</div>}
            </div>

            <div className="my-1 whitespace-pre">{LINE}</div>

            <div className="text-center font-bold">CUPOM NAO FISCAL</div>
            <div className="text-center">Venda #{sale.saleNumber}</div>

            <div className="my-1 whitespace-pre">{LINE}</div>

            <div>Data: {formatDate(sale.date)}</div>
            <div>Cliente: {sale.clientName}</div>

            <div className="my-1 whitespace-pre">{LINE}</div>

            {sale.items.map((item, index) => (
              <div key={index} className="mb-1">
                <div>{item.productName}</div>
                <div className="flex justify-between">
                  <span>
                    {item.quantity}x {formatCurrency(item.unitPrice)}
                  </span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}

            <div className="my-1 whitespace-pre">{LINE}</div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between">
                <span>Desconto</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[14px] mt-1">
              <span>TOTAL</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>

            <div className="my-1 whitespace-pre">{LINE}</div>

            <div>Pagamento: {getPaymentLabel(sale.paymentMethod)}</div>
            {sale.paymentMethod === 'cartao_credito' && sale.installments > 1 && (
              <div>
                {sale.installments}x de {formatCurrency(sale.total / sale.installments)}
              </div>
            )}
            {settings.pixKey && sale.paymentMethod === 'pix' && (
              <div>Chave Pix: {settings.pixKey}</div>
            )}

            {sale.notes && (
              <>
                <div className="my-1 whitespace-pre">{LINE}</div>
                <div>Obs: {sale.notes}</div>
              </>
            )}

            <div className="my-1 whitespace-pre">{LINE}</div>

            <div className="text-center mt-2">Obrigado pela preferencia!</div>
            <div className="text-center">volte sempre</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
