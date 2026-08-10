# 📚 BiblioJala – Biblioteca Universitária

Uma Aplicação de Página Única (SPA) para gerenciar e explorar o acervo de uma biblioteca universitária.

🔗 **[Demo ao vivo](#)** ← substitua após o deploy

---

## ✨ Funcionalidades

- 🔐 **Login em 2 etapas (2FA)**: senha + código de uso único enviado por e-mail
- 📧 **Envio real de e-mail** via API serverless (Resend) — com modo demonstração automático
- 🔒 **Senhas com hash** (PBKDF2 / Web Crypto) — nada é salvo em texto puro
- 📊 **Painel administrativo** com gráficos de uso, autores mais lidos (mês/ano), situação dos livros e atividade dos usuários
- 🔍 Busca e filtragem por título, autor, gênero e ordenação
- 📖 Página de detalhes com capa, descrição e categorias
- 📤 Sistema de empréstimo com prazo de 14 dias e alerta de atraso
- ⭐ Lista de desejos persistente e status de leitura
- 👤 **Perfil do usuário** (`/profile`): ver e editar nome, celular e endereço, com **auto-preenchimento por CEP** (ViaCEP)
- 🌗 **Tema claro/escuro** (automático + alternância manual)
- 📱 Design responsivo mobile-first

## 🔐 Segurança & Autenticação

O fluxo de login tem **duas etapas**:

1. E-mail + senha → a senha é verificada contra um hash **PBKDF2** (150k iterações, salt aleatório).
2. Um **código de 6 dígitos** é enviado ao e-mail. Ele é verificado por um **token assinado (HMAC)** gerado no servidor — o código nunca é armazenado, e o token não pode ser adulterado nem revela o código.

As funções serverless ficam em [`/api`](api/):

| Rota | Função |
|---|---|
| `POST /api/send-code` | Gera o código, envia por e-mail (Resend) e retorna o token assinado |
| `POST /api/verify-code` | Valida o código contra o token (assinatura, expiração e hash) |

> **Sem `RESEND_API_KEY` configurada**, o app entra em **modo demonstração**: todo o fluxo funciona e o código aparece na tela (ideal para `npm run dev` e para avaliar sem configurar e-mail).

## 📊 Painel Administrativo

Qualquer conta cujo e-mail seja igual a `VITE_ADMIN_EMAIL` recebe o papel **admin** e o link **Painel** (`/admin`), com:

- Indicadores (empréstimos, ativos, devoluções, leitores, taxa de devolução)
- Gráfico de **empréstimos por mês** (SVG, sem bibliotecas externas)
- **Autores mais lidos** — alternável entre mês e ano
- Rosca de **situação dos livros**, gêneros/livros/leitores em destaque
- Tabela de **atividade recente dos usuários**
- Botão para **popular com dados de exemplo** (demonstração)

As métricas vêm de um log de eventos no dispositivo; em produção viriam de um banco compartilhado.

## 🛠 Stack Tecnológico

| Componente | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Framework | React 18 |
| Estado | React Context API + useReducer |
| Roteamento | React Router DOM v6 |
| Catálogo | Open Library (Fetch API, sem chave) |
| Autenticação | 2FA por e-mail · PBKDF2 (Web Crypto) · token HMAC |
| Backend | Funções serverless (Vercel) + Resend |
| Gráficos | SVG puro (sem dependências) |
| Persistência | localStorage |
| Build | Vite 5 |
| Deploy | Vercel (recomendado, para `/api`) |

### ⚙️ Variáveis de ambiente

Copie `.env.example` para `.env` (local) e configure no painel do Vercel (produção):

| Variável | Escopo | Descrição |
|---|---|---|
| `VITE_ADMIN_EMAIL` | client | E-mail que vira admin automaticamente |
| `AUTH_SECRET` | servidor | Segredo para assinar os tokens OTP |
| `RESEND_API_KEY` | servidor | Chave do [Resend](https://resend.com) — ativa o envio real |
| `EMAIL_FROM` | servidor | Remetente (ex.: `onboarding@resend.dev`) |

---

## 🚀 Executar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/biblio-jala.git
cd biblio-jala

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
# → Acesse http://localhost:5173
```

---

## ☁️ Deploy — Passo a Passo

### Opção A: Vercel (recomendado, mais rápido)

**Via interface web:**
1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New → Project"**
3. Importe o repositório `biblio-jala`
4. O Vercel detecta Vite automaticamente. Confirme as configurações:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em **"Deploy"** — pronto! URL gerada em ~1 minuto.

**Via CLI:**
```bash
npm install -g vercel
vercel login
vercel          # deploy de preview
vercel --prod   # deploy de produção
```

---

### Opção B: Netlify

**Via interface web (arrastar e soltar):**
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Rode o build localmente: `npm run build`
3. Na dashboard do Netlify, arraste a pasta `dist/` para a área de deploy
4. URL gerada instantaneamente.

**Via GitHub (deploy contínuo):**
1. Acesse [netlify.com](https://netlify.com) → **"Add new site → Import an existing project"**
2. Conecte seu repositório GitHub
3. Confirme as configurações (já presentes no `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Clique em **"Deploy site"**

**Via CLI:**
```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --dir=dist              # deploy de preview
netlify deploy --dir=dist --prod       # deploy de produção
```

---

## 📁 Estrutura do Projeto

```
biblio-jala/
├── public/                  # Arquivos estáticos
├── src/
│   ├── components/
│   │   ├── BookCard.tsx     # Card com skeleton loader
│   │   ├── Navbar.tsx       # Navegação com badges
│   │   └── Toast.tsx        # Notificações
│   ├── context/
│   │   └── LibraryContext.tsx  # Estado global (Context + useReducer)
│   ├── hooks/
│   │   └── useBookSearch.ts    # Hook da Open Library API
│   ├── pages/
│   │   ├── HomePage.tsx        # Catálogo com busca e filtros
│   │   ├── BookDetailPage.tsx  # Detalhes do livro
│   │   ├── LoansPage.tsx       # Gestão de empréstimos
│   │   └── WishlistPage.tsx    # Lista de desejos
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   ├── App.tsx              # Rotas
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── .env.example             # Template de variáveis de ambiente
├── .gitignore
├── netlify.toml             # Config Netlify (SPA redirects)
├── vercel.json              # Config Vercel (SPA rewrites)
├── vite.config.ts           # Build + code splitting
└── README.md
```

---

## 🏗 Arquitetura

O estado global é gerenciado com **React Context API + useReducer** seguindo o padrão Flux. Todas as ações passam pelo reducer centralizado e são automaticamente persistidas no `localStorage`.

Os dados vêm da **Open Library API** (gratuita, sem chave), consumida pelo hook `useBookSearch` que gerencia loading, erros e cancelamento de requisições com `AbortController`.

O `vercel.json` e `netlify.toml` já incluem as regras de **redirect/rewrite** necessárias para que o React Router funcione corretamente em produção (todas as rotas apontam para `index.html`).

---

## 📄 Licença

Desenvolvido como projeto Capstone — Universidade Jala, 2026.
