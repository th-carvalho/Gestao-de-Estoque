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
  const result = vendas.map((v) => ({
    ...v,
    items: itens.filter((i) => i.venda_id === v.id),
  }));
  res.json(result);
});

app.post('/api/vendas', async (req, res) => {
  const { id, numero_venda, cliente_id, nome_cliente, subtotal, desconto, total, custo_total, forma_pagamento, notas, data_venda, items } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO vendas (id, numero_venda, cliente_id, nome_cliente, subtotal, desconto, total, custo_total, forma_pagamento, notas, data_venda) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, numero_venda, cliente_id || null, nome_cliente, subtotal, desconto, total, custo_total, forma_pagamento, notas, data_venda]
    );
    for (const item of items) {
      await conn.query(
        'INSERT INTO itens_venda (venda_id, produto_id, nome_produto, marca, preco_unitario, preco_custo, quantidade, subtotal) VALUES (?,?,?,?,?,?,?,?)',
        [id, item.produto_id, item.nome_produto, item.marca, item.preco_unitario, item.preco_custo, item.quantidade, item.subtotal]
      );
      await conn.query('UPDATE produtos SET estoque = estoque - ? WHERE id=?', [item.quantidade, item.produto_id]);
    }
    await conn.commit();
    res.status(201).json({ id });
  } catch (err) {
    await conn.rollback();
    throw err;
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
    await conn.query('DELETE FROM vendas WHERE id=?', [req.params.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    throw err;
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

// ── START ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Sistema rodando em http://localhost:${PORT}`);
});
