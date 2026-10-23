# Sistema de Gestão de Vendas de Produtos de Beleza

## 📌 Sobre o Projeto

O **Sistema de Gestão de Vendas de Produtos de Beleza** é um projeto acadêmico desenvolvido no curso de Sistemas de Informação, com o objetivo de facilitar a administração das vendas de produtos de beleza comercializados para salões.

A proposta surgiu da necessidade de melhorar a organização das informações comerciais, reduzindo a dependência de planilhas, anotações e controles manuais. O sistema centraliza dados de clientes, produtos, estoque e vendas em uma única aplicação web, com relatórios e emissão de comprovantes.

A solução é direcionada principalmente a uma profissional autônoma responsável por todas as etapas do processo comercial, desde o contato com os clientes até o acompanhamento financeiro das vendas.

## 🎯 Objetivos

### Objetivo geral

Desenvolver um sistema web para centralizar e facilitar o gerenciamento das operações comerciais, proporcionando maior organização, controle e eficiência na administração das vendas.

### Objetivos específicos

- Cadastrar e gerenciar clientes e produtos.
- Registrar e acompanhar as vendas realizadas para os salões de beleza.
- Controlar a disponibilidade e a movimentação do estoque.
- Acompanhar os recebimentos por forma de pagamento.
- Disponibilizar informações que auxiliem na análise dos resultados e na tomada de decisões.

## ⚙️ Funcionalidades

### ✅ Implementadas

#### 🛒 Nova venda (PDV)
- Busca de produtos e montagem do carrinho, com ajuste de quantidades.
- Seleção de cliente existente ou cadastro rápido durante a venda.
- Aplicação de desconto e observações.
- Formas de pagamento: Pix, cartão de crédito, cartão de débito e dinheiro.
- Baixa automática do estoque ao concluir a venda (feita em transação no banco).

#### 🧾 Comprovante de venda
- Comprovante gerado ao final de cada venda, com dados da loja e chave Pix.
- Impressão do comprovante.
- Cópia do comprovante em texto formatado para envio pelo WhatsApp.

#### 🛍️ Estoque e produtos
- Cadastro, edição e exclusão de produtos (nome, marca, categoria, preço de custo, preço de venda, estoque e estoque mínimo).
- Filtro por categoria e por produtos com estoque baixo.
- Entrada de estoque (reposição), com atualização opcional do preço de custo.
- Alerta de estoque baixo na barra de navegação.

#### 👥 Clientes
- Cadastro, edição e exclusão de clientes (nome, telefone, e-mail e observações).
- Histórico de compras por cliente.
- Atalho para iniciar uma nova venda a partir do cadastro do cliente.

#### 📄 Histórico de vendas
- Listagem de todas as vendas registradas.
- Reabertura do comprovante de qualquer venda.
- Cancelamento de venda com devolução automática dos itens ao estoque.

#### 📊 Relatórios
- Filtro por período: hoje, últimos 7 dias, mês atual ou todo o período.
- Faturamento, custo, lucro, margem de lucro, quantidade de vendas e ticket médio.
- Ranking dos produtos mais vendidos.
- Alerta de reposição de estoque.
- Recebimentos por forma de pagamento.

### 🔜 Previstas

- Cadastro e gerenciamento de vendedores, com associação às vendas.
- Cálculo automatizado das comissões por produto.
- Controle de pagamentos pendentes (vendas a prazo).
- Tela de configurações da loja na interface (hoje os dados ficam na tabela `configuracoes`).
- Automações de processos (n8n ou Python).

## 🛠️ Tecnologias utilizadas

### Front-end

| Tecnologia | Finalidade |
|---|---|
| React 19 | Construção da interface em componentes |
| TypeScript | Tipagem estática do código do front-end |
| Vite 6 | Servidor de desenvolvimento e build |
| Tailwind CSS 4 | Estilização e layout responsivo |
| Motion | Animações de transição entre telas e modais |
| Lucide React | Ícones |

### Back-end

| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução do servidor |
| Express 4 | API REST e entrega do front-end compilado |
| MySQL | Armazenamento dos dados |
| mysql2 | Conexão com o MySQL (pool de conexões e transações) |
| dotenv | Leitura das variáveis de ambiente |
| cors | Liberação de acesso do front-end à API em desenvolvimento |

### Ferramentas

| Tecnologia | Finalidade |
|---|---|
| Git e GitHub | Controle de versão e colaboração |
| Visual Studio Code | Ambiente de desenvolvimento |

## 📁 Estrutura do projeto

```
gerenciadorEstoque/
├── database/
│   └── schema.sql            # Criação do banco e das tabelas
├── server/
│   ├── db.js                 # Pool de conexão com o MySQL
│   └── index.js              # API Express e entrega do front-end (dist/)
├── src/
│   ├── components/           # Telas e modais (Nova Venda, Produtos, Clientes, etc.)
│   ├── data/
│   │   ├── api.ts            # Cliente da API (conversão entre front-end e banco)
│   │   └── initialData.ts    # Configurações padrão da loja
│   ├── App.tsx               # Componente principal e estado da aplicação
│   ├── main.tsx              # Ponto de entrada do React
│   └── types.ts              # Tipos (Produto, Cliente, Venda, etc.)
├── Iniciar Sistema.bat       # Inicializa o sistema no Windows
├── Iniciar Sistema.vbs       # Atalho para executar o .bat sem abrir terminal
├── index.html
├── package.json
└── vite.config.ts
```

## 🗄️ Banco de dados

O script [database/schema.sql](database/schema.sql) cria o banco `estoque_db` com as tabelas:

| Tabela | Conteúdo |
|---|---|
| `produtos` | Produtos, preços de custo e venda, estoque atual e estoque mínimo |
| `clientes` | Clientes (salões) e seus contatos |
| `vendas` | Cabeçalho das vendas: cliente, subtotal, desconto, total, custo e forma de pagamento |
| `itens_venda` | Itens de cada venda, com preço e custo no momento da venda |
| `configuracoes` | Dados da loja exibidos no comprovante (nome, proprietária, telefone, endereço, chave Pix) |

## 🔌 API

O servidor roda por padrão em `http://localhost:3001`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/produtos` | Lista os produtos |
| POST | `/api/produtos` | Cadastra um produto |
| PUT | `/api/produtos/:id` | Atualiza um produto |
| DELETE | `/api/produtos/:id` | Exclui um produto |
| GET | `/api/clientes` | Lista os clientes |
| POST | `/api/clientes` | Cadastra um cliente |
| PUT | `/api/clientes/:id` | Atualiza um cliente |
| DELETE | `/api/clientes/:id` | Exclui um cliente |
| GET | `/api/vendas` | Lista as vendas com seus itens |
| POST | `/api/vendas` | Registra uma venda e dá baixa no estoque |
| DELETE | `/api/vendas/:id` | Cancela uma venda e devolve os itens ao estoque |
| GET | `/api/configuracoes` | Retorna os dados da loja |
| PUT | `/api/configuracoes` | Atualiza os dados da loja |

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [MySQL](https://www.mysql.com/) 8 ou superior

### 1. Instalar as dependências

```bash
npm install
```

### 2. Criar o banco de dados

```bash
mysql -u root -p < database/schema.sql
```

### 3. Configurar a conexão (opcional)

Por padrão o servidor conecta em `localhost` com o usuário `root`, sem senha, no banco `estoque_db`. Para usar outros valores, crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=estoque_db
PORT=3001
```

> ⚠️ Nunca suba o arquivo `.env` para o repositório. Ele já está no `.gitignore`.

### 4. Executar

**Modo de uso (produção):** compila o front-end e inicia o servidor, que entrega a aplicação e a API no mesmo endereço.

```bash
npm start
```

Acesse `http://localhost:3001`.

**Modo de desenvolvimento:** rode a API e o Vite em terminais separados.

```bash
npm run server   # API em http://localhost:3001
npm run dev      # Interface em http://localhost:3000
```

**Atalho no Windows:** dê um duplo clique no arquivo `Iniciar Sistema.vbs` na raiz do projeto. Ele compila o front-end na primeira execução, inicia o servidor e abre o navegador automaticamente.

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o front-end com Vite na porta 3000 |
| `npm run server` | Inicia a API Express na porta 3001 |
| `npm run build` | Gera a versão de produção do front-end em `dist/` |
| `npm start` | Executa o build e inicia o servidor |
| `npm run preview` | Pré-visualiza o build do Vite |
| `npm run lint` | Verifica os tipos com o TypeScript |

## 🏗️ Desenvolvimento do projeto

O desenvolvimento está organizado nas seguintes etapas:

1. **Análise de requisitos:** levantamento das necessidades da profissional e identificação dos problemas existentes no processo comercial.
2. **Modelagem do banco de dados:** definição da estrutura e dos relacionamentos entre as informações.
3. **Desenvolvimento do back-end:** implementação das regras de negócio e da API utilizando Node.js, Express e MySQL.
4. **Desenvolvimento do front-end:** criação das interfaces com React, TypeScript e Tailwind CSS.
5. **Integração e automação:** conexão entre a interface, a API e o banco de dados, incluindo a atualização automática do estoque.
6. **Testes e validação:** verificação das funcionalidades, da precisão dos dados e da facilidade de utilização.
7. **Documentação e apresentação:** registro das decisões técnicas e apresentação dos resultados do projeto.

## 🧪 Metodologia

O projeto utiliza uma abordagem qualitativa e aplicada, com características de **estudo de caso e pesquisa-ação**.

O levantamento de requisitos considera conversas com a profissional autônoma, observação dos processos comerciais e identificação das principais dificuldades enfrentadas na rotina de trabalho.

Durante o desenvolvimento, serão realizados testes e coletados feedbacks da usuária para avaliar o funcionamento das funcionalidades, a organização das informações e a contribuição da solução para o controle das vendas.

## 🎯 Público-alvo

O público diretamente beneficiado é uma profissional autônoma que comercializa produtos de beleza para salões e administra individualmente suas operações comerciais.

Os salões de beleza atendidos são beneficiários indiretos, pois a melhoria na organização das vendas pode contribuir para um relacionamento comercial mais eficiente.

## 📈 Resultados esperados

Espera-se que o sistema contribua para:

- Centralizar as informações comerciais em uma única plataforma.
- Reduzir erros e inconsistências nos registros.
- Facilitar o acompanhamento das vendas e dos recebimentos.
- Melhorar a precisão do controle de estoque.
- Automatizar tarefas repetitivas, como a baixa de estoque e, futuramente, o cálculo de comissões.
- Tornar a rotina administrativa mais organizada.
- Apoiar a tomada de decisões com base nas informações registradas.

## 👨‍💻 Equipe de desenvolvimento

Projeto desenvolvido por estudantes do curso de Sistemas de Informação:

- Vinicius Aglay de Lima Braga
- Thiago Carvalho dos Santos
- Ryan Aguiar Moreira
- Pedro Isaac Lopes Ramos Souza
- Murilo Sergio de Souza Lira
- Gabriel Farias de Oliveira

**Professor orientador:** David Victor dos Santos Andrade.

## 🎓 Contexto acadêmico

Projeto Integrador desenvolvido no âmbito do Desafio UNIFACISA, na área de Tecnologia, com foco na aplicação prática dos conhecimentos de desenvolvimento de software para solucionar uma necessidade real.

## 📚 Referências

- SOMMERVILLE, Ian. *Engenharia de Software*. Referência para os princípios de desenvolvimento e teste de software.
- NODE.JS. *Documentação oficial*. Disponível em: https://nodejs.org/
- REACT. *Documentação oficial*. Disponível em: https://react.dev/
- MYSQL. *Documentação oficial*. Disponível em: https://dev.mysql.com/doc/
- CHIAVENATO, Idalberto. Referência para conceitos de gestão, planejamento, organização e controle.
- TOTVS. Conteúdos sobre gestão integrada e centralização de informações empresariais.

---

**Status do projeto:** Em desenvolvimento.

**Área:** Desenvolvimento Web, Gestão Comercial e Automação de Processos.
