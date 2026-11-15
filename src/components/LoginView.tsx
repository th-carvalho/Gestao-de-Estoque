import React, { useState } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onLogin: () => void;
}

const MOCK_EMAIL = 'admin@estoque.teste';
const MOCK_PASSWORD = 'estoque123';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
        sessionStorage.setItem('logado', '1');
        onLogin();
      } else {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Painel esquerdo — identidade */}
      <div className="hidden md:flex md:w-2/5 bg-neutral-900 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              Gestão de<br />Estoque
            </h1>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              Controle de produtos, clientes e vendas em um só lugar.
            </p>
          </div>
          <div className="pt-6 border-t border-white/10 space-y-3 text-left">
            {['Entrada e saída de produtos', 'Histórico de vendas', 'Cadastro de clientes'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center bg-neutral-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-neutral-900">Gestão de Estoque</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Entrar</h2>
            <p className="mt-1 text-sm text-neutral-500">Acesse o sistema com suas credenciais.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
