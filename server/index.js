import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// ── PRODUTOS ──────────────────────────────────────────────
app.get('/api/produtos', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM produtos ORDER BY criado_em DESC');
  res.json(rows);
});

app.post('/api/produtos', async (req, res) => {
  const { id, nome, marca, categoria, preco_custo, preco_venda, estoque, estoque_minimo, notas } = req.body;
  await db.query(
    'INSERT INTO produtos (id, nome, marca, categoria, preco_custo, preco_venda, estoque, estoque_minimo, notas) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, nome, marca, categoria, preco_custo, preco_venda, estoque, estoque_minimo, notas]
  );
  res.status(201).json({ id });
});

app.put('/api/produtos/:id', async (req, res) => {
  const { nome, marca, categoria, preco_custo, preco_venda, estoque, estoque_minimo, notas } = req.body;
  await db.query(
    'UPDATE produtos SET nome=?, marca=?, categoria=?, preco_custo=?, preco_venda=?, estoque=?, estoque_minimo=?, notas=? WHERE id=?',
    [nome, marca, categoria, preco_custo, preco_venda, estoque, estoque_minimo, notas, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/produtos/:id', async (req, res) => {
  await db.query('DELETE FROM produtos WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ── CLIENTES ──────────────────────────────────────────────
app.get('/api/clientes', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM clientes ORDER BY criado_em DESC');
  res.json(rows);
});

app.post('/api/clientes', async (req, res) => {
  const { id, nome, telefone, email, notas } = req.body;
  await db.query(
    'INSERT INTO clientes (id, nome, telefone, email, notas) VALUES (?,?,?,?,?)',
    [id, nome, telefone, email, notas]
  );
  res.status(201).json({ id });
});

app.put('/api/clientes/:id', async (req, res) => {
  const { nome, telefone, email, notas } = req.body;
  await db.query(
    'UPDATE clientes SET nome=?, telefone=?, email=?, notas=? WHERE id=?',
    [nome, telefone, email, notas, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/clientes/:id', async (req, res) => {
  await db.query('DELETE FROM clientes WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ── VENDAS ────────────────────────────────────────────────
app.get('/api/vendas', async (req, res) => {
  const [vendas] = await db.query('SELECT * FROM vendas ORDER BY data_venda DESC');
  const [itens] = await db.query('SELECT * FROM itens_venda');
  const [parcelas] = await db.query('SELECT * FROM vendas_parcelas ORDER BY numero ASC');
  const result = vendas.map((v) => ({
    ...v,
    items: itens.filter((i) => i.venda_id === v.id),
    parcelas_prazo: parcelas.filter((p) => p.venda_id === v.id),
  }));
  res.json(result);
});

app.post('/api/vendas', async (req, res) => {
  const { id, numero_venda, cliente_id, nome_cliente, subtotal, desconto, total, custo_total, forma_pagamento, parcelas, notas, data_venda, items, parcelas_prazo } = req.body;
  const dataFormatada = new Date(data_venda).toISOString().slice(0, 19).replace('T', ' ');
  const statusPagamento = forma_pagamento === 'prazo' ? 'pendente' : 'pago';
  const numParcelas = forma_pagamento === 'cartao_credito' ? (parcelas || 1) : 1;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO vendas (id, numero_venda, cliente_id, nome_cliente, subtotal, desconto, total, custo_total, forma_pagamento, status_pagamento, parcelas, notas, data_venda) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, numero_venda, cliente_id || null, nome_cliente, subtotal, desconto, total, custo_total, forma_pagamento, statusPagamento, numParcelas, notas, dataFormatada]
    );
    for (const item of items) {
      await conn.query(
        'INSERT INTO itens_venda (venda_id, produto_id, nome_produto, marca, preco_unitario, preco_custo, quantidade, subtotal) VALUES (?,?,?,?,?,?,?,?)',
        [id, item.produto_id, item.nome_produto, item.marca, item.preco_unitario, item.preco_custo, item.quantidade, item.subtotal]
      );
      await conn.query('UPDATE produtos SET estoque = estoque - ? WHERE id=?', [item.quantidade, item.produto_id]);
    }
    if (forma_pagamento === 'prazo') {
      const lista = parcelas_prazo && parcelas_prazo.length > 0
        ? parcelas_prazo
        : [{ numero: 1, valor: total, vencimento: new Date(new Date(dataFormatada).getTime() + 30 * 86400000).toISOString().slice(0, 10) }];
      for (const p of lista) {
        await conn.query(
          'INSERT INTO vendas_parcelas (venda_id, numero, valor, vencimento, pago) VALUES (?,?,?,?,0)',
          [id, p.numero, p.valor, p.vencimento]
        );
      }
    }
    await conn.commit();
    res.status(201).json({ id });
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao salvar venda:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.delete('/api/vendas/:id', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [itens] = await conn.query('SELECT produto_id, quantidade FROM itens_venda WHERE venda_id=?', [req.params.id]);
    for (const item of itens) {
      await conn.query('UPDATE produtos SET estoque = estoque + ? WHERE id=?', [item.quantidade, item.produto_id]);
    }
    await conn.query('DELETE FROM itens_venda WHERE venda_id=?', [req.params.id]);
    await conn.query('DELETE FROM vendas_parcelas WHERE venda_id=?', [req.params.id]);
    await conn.query('DELETE FROM vendas WHERE id=?', [req.params.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao cancelar venda:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.put('/api/vendas/:id/pagamento', async (req, res) => {
  const { status_pagamento } = req.body;
  await db.query('UPDATE vendas SET status_pagamento=? WHERE id=?', [status_pagamento, req.params.id]);
  if (status_pagamento === 'pago') {
    await db.query(
      'UPDATE vendas_parcelas SET pago=1, data_pagamento=NOW() WHERE venda_id=? AND pago=0',
      [req.params.id]
    );
  }
  res.json({ ok: true });
});

app.put('/api/vendas/:id/parcelas/:numero', async (req, res) => {
  const { pago } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE vendas_parcelas SET pago=?, data_pagamento=? WHERE venda_id=? AND numero=?',
      [pago ? 1 : 0, pago ? new Date() : null, req.params.id, req.params.numero]
    );
    const [pendentes] = await conn.query(
      'SELECT COUNT(*) AS total FROM vendas_parcelas WHERE venda_id=? AND pago=0',
      [req.params.id]
    );
    const novoStatus = pendentes[0].total === 0 ? 'pago' : 'pendente';
    await conn.query('UPDATE vendas SET status_pagamento=? WHERE id=?', [novoStatus, req.params.id]);
    await conn.commit();
    res.json({ ok: true, status_pagamento: novoStatus });
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao atualizar parcela:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ── CONFIGURAÇÕES ─────────────────────────────────────────
app.get('/api/configuracoes', async (req, res) => {
  const [[row]] = await db.query('SELECT * FROM configuracoes WHERE id=1');
  res.json(row);
});

app.put('/api/configuracoes', async (req, res) => {
  const { nome_loja, nome_proprietario, telefone, endereco, chave_pix } = req.body;
  await db.query(
    'UPDATE configuracoes SET nome_loja=?, nome_proprietario=?, telefone=?, endereco=?, chave_pix=? WHERE id=1',
    [nome_loja, nome_proprietario, telefone, endereco, chave_pix]
  );
  res.json({ ok: true });
});

// ── FRONTEND ESTÁTICO ─────────────────────────────────────
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', 'dist');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
}

// ── TRATAMENTO GLOBAL DE ERROS ────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: err.message });
});

// ── START ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Sistema rodando em http://localhost:${PORT}`);
});
