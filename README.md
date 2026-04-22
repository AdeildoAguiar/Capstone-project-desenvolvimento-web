# 📚 BiblioJala – Biblioteca Universitária

Uma Aplicação de Página Única (SPA) para gerenciar e explorar o acervo de uma biblioteca universitária.

🔗 **[Demo ao vivo](#)** ← substitua após o deploy

---

## ✨ Funcionalidades

- 🔍 Busca e filtragem por título, autor, gênero e ordenação
- 📖 Página de detalhes com capa, descrição e categorias
- 📤 Sistema de empréstimo com prazo de 14 dias e alerta de atraso
- ⭐ Lista de desejos persistente
- 📋 Rastreador de status de leitura (Lendo / Concluído / Quero ler)
- 💾 Dados persistidos via localStorage
- 📱 Design responsivo mobile-first
- ♿ Acessibilidade com navegação por teclado e ARIA

## 🛠 Stack Tecnológico

| Componente | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Framework | React 18 |
| Estado | React Context API + useReducer |
| Roteamento | React Router DOM v6 |
| API | Open Library (Fetch API, sem chave) |
| Persistência | localStorage |
| Build | Vite 5 |
| Deploy | Vercel / Netlify |

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
