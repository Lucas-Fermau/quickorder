# QuickOrder Burger

Aplicativo full-stack de delivery para restaurante — área do cliente + painel administrativo. Carrinho com cupons, rastreio visual de pedido, autenticação JWT, controle de papéis (cliente / admin), tema claro/escuro e UI responsiva.

> Projeto de portfólio criado para demonstrar engenharia full-stack: API REST tipada, modelagem MongoDB (5 entidades), autenticação JWT com middlewares de papel, gestão de estado com Zustand persistido, e fluxos completos de checkout e administração.

---

## Funcionalidades

### Cliente
- Cadastro, login e logout
- Cardápio com categorias, busca e destaques
- Página de produto com avaliações (1–5 estrelas)
- Carrinho persistente (localStorage) com alteração de quantidade e remoção
- Cupons de desconto fictícios: `QUICK10`, `PRIMEIRA`, `FRETE20`
- Checkout com endereço, forma de pagamento (Pix, cartão, dinheiro) e observações
- Histórico de pedidos com **rastreamento visual** (Recebido → Confirmado → Preparando → Saiu para entrega → Entregue)
- Favoritar produtos
- Tema claro / escuro

### Admin
- Dashboard com totais (pedidos, pendentes, vendido, produtos)
- CRUD de produtos (criar, editar, excluir, ativar/desativar)
- Listar todos os pedidos com filtro por status
- Atualizar status do pedido em tempo real
- Acesso restrito por middleware de papel (`requireAdmin`)

---

## Tecnologias

**Front-end** — React 18 · Vite · TypeScript · Tailwind CSS · React Router · React Hook Form + Zod · Zustand (carrinho) · Context API (auth/tema) · lucide-react
**Back-end** — Node.js · Express · TypeScript · MongoDB · Mongoose · Zod · JWT · bcrypt
**Deploy** — Vercel (front-end) · Render (back-end) · MongoDB Atlas (banco)

---

## Estrutura

```
QuickOrder/
├── server/                      API REST (Express + Mongoose)
│   └── src/
│       ├── config/              env + db
│       ├── models/              User, Product, Order, Review, Favorite
│       ├── middleware/          auth, errorHandler
│       ├── controllers/         auth, products, orders, reviews, favorites
│       ├── routes/              um arquivo por recurso
│       ├── schemas/             validação Zod
│       ├── utils/               jwt, coupons, seed
│       ├── app.ts               factory do Express
│       └── index.ts             bootstrap
└── client/                      SPA React (Vite)
    └── src/
        ├── components/
        │   ├── ui/              Button, Input, Modal, Toast, Spinner, EmptyState
        │   ├── layout/          Header, Footer
        │   ├── product/         Card, Filter, SearchBar
        │   ├── cart/            Drawer, QuantitySelector
        │   ├── order/           StatusTracker
        │   ├── admin/           AdminLayout
        │   └── routes/          ProtectedRoute, AdminRoute
        ├── contexts/            AuthContext, ThemeContext
        ├── store/               cartStore (Zustand persistido)
        ├── services/            api, products, orders, reviews, favorites
        ├── hooks/               useToast, useFavorites
        ├── pages/
        │   ├── customer:        Home, ProductDetail, Cart, Checkout, Login, Register, MyOrders
        │   └── admin/           Dashboard, Products, Orders
        ├── types/               types compartilhados
        ├── utils/               cn, formatters
        ├── App.tsx              roteamento + providers
        └── main.tsx
```

---

## API REST

### Autenticação
| Método | Rota                    | Acesso     | Descrição                          |
| ------ | ----------------------- | ---------- | ---------------------------------- |
| POST   | `/api/auth/register`    | público    | Cadastro de cliente                |
| POST   | `/api/auth/login`       | público    | Login, retorna `{ user, token }`   |
| GET    | `/api/auth/me`          | autenticado| Usuário atual                      |

### Produtos
| Método | Rota                          | Acesso  | Descrição                                  |
| ------ | ----------------------------- | ------- | ------------------------------------------ |
| GET    | `/api/products`               | público | Lista com filtros (`category`, `search`, `featured`, `available`) |
| GET    | `/api/products/:id`           | público | Detalhe                                    |
| POST   | `/api/products/admin`         | admin   | Criar                                      |
| PUT    | `/api/products/admin/:id`     | admin   | Atualizar                                  |
| DELETE | `/api/products/admin/:id`     | admin   | Excluir                                    |

### Pedidos
| Método | Rota                                | Acesso     | Descrição                       |
| ------ | ----------------------------------- | ---------- | ------------------------------- |
| POST   | `/api/orders`                       | autenticado| Criar pedido                    |
| GET    | `/api/orders/my-orders`             | autenticado| Pedidos do usuário              |
| GET    | `/api/orders/admin`                 | admin      | Todos pedidos (filtro `status`) |
| GET    | `/api/orders/admin/stats`           | admin      | Métricas do dashboard           |
| GET    | `/api/orders/:id`                   | dono/admin | Detalhe                         |
| PATCH  | `/api/orders/admin/:id/status`      | admin      | Atualizar status                |

### Avaliações & Favoritos
| Método | Rota                                | Acesso      |
| ------ | ----------------------------------- | ----------- |
| POST   | `/api/reviews`                      | autenticado |
| GET    | `/api/reviews/product/:productId`   | público     |
| GET    | `/api/favorites`                    | autenticado |
| POST   | `/api/favorites/:productId`         | autenticado |
| DELETE | `/api/favorites/:productId`         | autenticado |

---

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- MongoDB — escolha:
  - **MongoDB Atlas** (recomendado, grátis): cole a connection string em `server/.env`
  - **MongoDB local** rodando em `mongodb://localhost:27017`

### 1. Clonar e instalar
```bash
git clone https://github.com/Lucas-Fermau/quickorder.git
cd quickorder

cd server && npm install
cd ../client && npm install
```

### 2. Variáveis de ambiente
```bash
cp server/.env.example server/.env

# Gere uma chave JWT longa
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Cole o resultado em JWT_SECRET dentro de server/.env

# Cliente
cp client/.env.example client/.env
```

### 3. Popular o banco com dados de teste
```bash
cd server
npm run seed
```

Isso cria:
- 11 produtos iniciais (hambúrgueres, pizzas, bebidas, etc.)
- 2 usuários de teste:
  - **Admin** — `admin@quickorder.com` / `123456`
  - **Cliente** — `cliente@quickorder.com` / `123456`

### 4. Rodar
Em **dois terminais**:
```bash
# terminal 1 — API
cd server && npm run dev          # http://localhost:4000

# terminal 2 — front
cd client && npm run dev          # http://localhost:5173
```

---

## Variáveis de ambiente

### `server/.env`
| Variável         | Descrição                                                         |
| ---------------- | ----------------------------------------------------------------- |
| `MONGODB_URI`    | Connection string do MongoDB                                      |
| `JWT_SECRET`     | Chave para assinar tokens (≥32 caracteres)                        |
| `JWT_EXPIRES_IN` | Tempo de vida do token (ex: `7d`)                                 |
| `PORT`           | Porta do servidor (padrão `4000`)                                 |
| `CLIENT_ORIGIN`  | Origens permitidas (CORS), separadas por vírgula                  |

### `client/.env`
| Variável        | Descrição                                |
| --------------- | ---------------------------------------- |
| `VITE_API_URL`  | URL base da API (ex: `http://localhost:4000/api`) |

---

## Cupons disponíveis

| Código     | Desconto                |
| ---------- | ----------------------- |
| `QUICK10`  | 10% off no subtotal     |
| `PRIMEIRA` | 15% off no subtotal     |
| `FRETE20`  | R$ 20 fixos de desconto |

---

## Deploy

### Front-end → Vercel
1. Importe o repositório no Vercel
2. **Root Directory:** `client`
3. **Framework preset:** Vite (autodetectado)
4. Variável de ambiente: `VITE_API_URL` = URL do back-end deployado

### Back-end → Render
1. Em https://render.com → "New Web Service" → conecte ao repositório
2. **Root Directory:** `server`
3. **Build:** `npm install && npm run build`
4. **Start:** `node dist/index.js`
5. Variáveis de ambiente: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`

> O arquivo `render.yaml` na raiz já tem essa configuração — você pode usar "Blueprint" no Render.

### Banco → MongoDB Atlas
1. Crie uma conta grátis em https://www.mongodb.com/atlas
2. Crie um cluster (Free Tier M0)
3. Em **Network Access** → "Allow access from anywhere" (0.0.0.0/0)
4. Em **Database Access** → crie usuário com senha
5. Copie a connection string e cole no `MONGODB_URI` do back-end

---

## Notas de produção

- O token é guardado em `localStorage` por simplicidade. Em produção: cookie httpOnly + CSRF.
- O middleware `requireAdmin` não confia no header — o `role` vem do JWT verificado.
- O total e desconto do pedido são **recalculados no servidor** (não confiar no front).
- Pagamento é simulado — sem integração real com Stripe/Pix (passo natural de evolução).

---

## Próximas melhorias

- [ ] Integração real com Stripe / Mercado Pago / Pix
- [ ] WebSockets para atualização de status em tempo real
- [ ] Upload de imagens dos produtos (S3/Cloudinary)
- [ ] Geolocalização para cálculo de frete
- [ ] Notificações push
- [ ] Testes (Vitest + Supertest)

---

## Licença

MIT — veja [LICENSE](./LICENSE).
