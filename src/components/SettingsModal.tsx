import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Store, RotateCcw } from 'lucide-react';
import { StoreSettings } from '../types';

interface SettingsModalProps {
  settings: StoreSettings;
  onSave: (settings: StoreSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onResetData,
  onClose,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <motion.div
      id="settings-modal-backdrop"
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
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-neutral-800" />
            <h3 className="font-semibold text-neutral-900 text-base">
              Configurações da Loja e Recibo
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Nome da Loja / Espaço
            </label>
            <input
              id="settings-store-name"
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Nome da Proprietária
            </label>
            <input
              id="settings-owner-name"
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Telefone / WhatsApp de Contato
            </label>
            <input
              id="settings-phone"
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Endereço / Local
            </label>
            <input
              id="settings-address"
              type="text"
              placeholder="Ex: Rua das Flores, 120"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Chave Pix (Para sair no comprovante)
            </label>
            <input
              id="settings-pix"
              type="text"
              placeholder="CPF, Telefone, E-mail ou Chave Aleatória"
              value={formData.pixKey || ''}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-500"
            />
          </div>

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Deseja restaurar os produtos e clientes de demonstração iniciais? Isso reiniciará os dados do estoque.'
                  )
                ) {
                  onResetData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 p-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar dados de exemplo</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="save-settings-btn"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
              >
                <Check className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
