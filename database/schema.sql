CREATE DATABASE IF NOT EXISTS estoque_db;
USE estoque_db;

CREATE TABLE IF NOT EXISTS produtos (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  marca VARCHAR(100),
  categoria VARCHAR(80),
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
  estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 3,
  notas TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(150),
  notas TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendas (
  id VARCHAR(36) PRIMARY KEY,
  numero_venda INTEGER NOT NULL,
  cliente_id VARCHAR(36) REFERENCES clientes(id),
  nome_cliente VARCHAR(150) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  custo_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pagamento VARCHAR(30) NOT NULL,
  notas TEXT,
  data_venda DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS itens_venda (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  venda_id VARCHAR(36) NOT NULL REFERENCES vendas(id),
  produto_id VARCHAR(36) NOT NULL,
  nome_produto VARCHAR(150) NOT NULL,
  marca VARCHAR(100),
  preco_unitario DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY DEFAULT 1,
  nome_loja VARCHAR(150) NOT NULL DEFAULT 'Minha Loja',
  nome_proprietario VARCHAR(150),
  telefone VARCHAR(20),
  endereco VARCHAR(255),
  chave_pix VARCHAR(150)
);

INSERT IGNORE INTO configuracoes (id, nome_loja) VALUES (1, 'Minha Loja');
