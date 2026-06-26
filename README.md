# Sistema de Holding Financeira

## Descrição
O **Sistema de Holding Financeira** é uma aplicação completa para gestão financeira corporativa, com integração real entre frontend e backend. O sistema permite controlar operações financeiras de forma estruturada, incluindo:

- cadastros gerenciais e financeiros;
- gestão de contas bancárias;
- títulos a pagar e a receber;
- baixas parciais e totais;
- atualização automática de saldo bancário;
- rastreabilidade básica de alterações;
- assistente financeiro com inteligência artificial.

---

## Funcionalidades implementadas
- Login com autenticação JWT (CPF + senha)
- Dashboard com cards e gráficos financeiros
- Gestão de Empresas
- Gestão de Entidades
- Gestão de Bancos
- Gestão de Contas Bancárias
- Gestão de Categorias Financeiras
- Gestão de Centros de Custo
- Gestão de Títulos Financeiros (pagar/receber)
- Baixa parcial e total de títulos
- Atualização de saldo bancário por movimentação
- Fluxo de Caixa com gráficos por empresa e filtro de ano
- Relatórios financeiros
- Assistente IA integrado com OpenAI
- Auditoria básica
- Controle de status financeiro dos títulos

---

## Tecnologias

### Frontend
- React
- Vite
- Chakra UI
- Recharts

### Backend
- Node.js
- Express
- Knex
- PostgreSQL
- JWT
- Zod
- bcrypt
- OpenAI API

---

## Pré-requisitos
- Node.js 20+
- npm
- PostgreSQL (ou Docker)
- Git

---

## Estrutura do projeto
\`\`\`text
.
├── front/                # Aplicação frontend (React + Vite + Chakra UI)
├── backend/              # API backend (Node.js + Express + Knex + PostgreSQL)
└── docker-compose.yml    # Orquestração opcional com Docker
\`\`\`

---

## Configuração do backend
1. Acesse a pasta do backend:
   \`\`\`bash
   cd backend
   \`\`\`
2. Crie o arquivo de ambiente:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
3. Configure as variáveis no `.env`.
4. Instale dependências:
   \`\`\`bash
   npm install
   \`\`\`
5. Execute as migrations:
   \`\`\`bash
   npm run migrate
   \`\`\`
6. Execute o seed:
   \`\`\`bash
   npm run seed
   \`\`\`
7. Inicie em modo desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

### Exemplo de `backend/.env`
\`\`\`env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=holding_finance
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=uma_chave_com_mais_de_32_caracteres_para_dev
ADMIN_INITIAL_PASSWORD=admin123
CORS_ORIGIN=http://localhost:5173
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4.1-mini
\`\`\`

---

## Configuração do frontend
1. Acesse a pasta do frontend:
   \`\`\`bash
   cd front
   \`\`\`
2. Crie o arquivo de ambiente:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
3. Configure a URL da API (`VITE_API_URL`).
4. Instale dependências:
   \`\`\`bash
   npm install
   \`\`\`
5. Inicie em modo desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

### Exemplo de `front/.env`
\`\`\`env
VITE_API_URL=http://localhost:3000
\`\`\`

---

## Usuário inicial
- O login é feito com CPF e senha.
- CPF do administrador padrão: `57035040900`
- A senha inicial é lida de `ADMIN_INITIAL_PASSWORD` **no momento em que o seed foi executado**.

> Se você alterar `ADMIN_INITIAL_PASSWORD` depois que o seed já foi executado, a senha do admin **não muda automaticamente**.

---

## Ordem correta para rodar o sistema
1. Subir o PostgreSQL (ou `docker-compose up -d db`)
2. Rodar migrations
3. Rodar seed
4. Subir backend (`npm run dev`)
5. Subir frontend (`npm run dev`)
6. Acessar `http://localhost:5173`
7. Fazer login com CPF e senha

---

## Teste rápido (Postman)
### Login
**POST** `http://localhost:3000/auth/login`

Body JSON:
\`\`\`json
{
  "cpf": "57035040900",
  "senha": "admin123"
}
\`\`\`

---

## Fluxo recomendado para validar o sistema
1. Cadastrar empresa
2. Cadastrar banco
3. Cadastrar conta bancária
4. Cadastrar entidade
5. Cadastrar categoria
6. Cadastrar centro de custo
7. Criar título a receber
8. Registrar baixa parcial
9. Registrar baixa total
10. Criar título a pagar
11. Registrar pagamento

---

## Regras financeiras importantes
- O valor de baixa não pode exceder o saldo/valor disponível do título.
- Título baixado parcialmente deve permanecer com status `PARCIAL`.
- Título totalmente recebido/pago não pode receber nova baixa.
- Toda baixa gera movimentação financeira.
- Toda movimentação financeira altera o saldo bancário.
- A baixa utiliza `data_baixa` como data efetiva de pagamento/recebimento.

---

## Problemas comuns
- **Erro de CORS**: conferir `CORS_ORIGIN` no backend e `VITE_API_URL` no frontend.
- **Erro de JWT_SECRET ausente**: definir `JWT_SECRET` no `backend/.env`.
- **Erro de senha do PostgreSQL**: validar `DB_USER` e `DB_PASSWORD`.
- **Erro `ENOTFOUND db`**: geralmente ocorre quando `DB_HOST=db` é usado fora do Docker.
- **Senha do admin não confere**: seed já foi executado anteriormente com outra senha.
- **Assistente IA não responde**: verificar se `OPENAI_API_KEY` está configurada no `backend/.env`.

---

## Scripts disponíveis

### Backend
- `npm run dev`
- `npm run migrate`
- `npm run seed`

### Frontend
- `npm run dev`
- `npm run build`

---

## Docker (opcional)
Se preferir, use o `docker-compose.yml` para subir o banco de dados PostgreSQL em ambiente containerizado:
\`\`\`bash
docker-compose up -d db
\`\`\`

---
