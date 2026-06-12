<div align="center">

# 🔍 Forescan

**Plataforma de gestão de casos forenses com inteligência artificial**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://flask.palletsprojects.com)
[![PWA](https://img.shields.io/badge/PWA-Habilitado-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps)

> Sistema completo para registro, acompanhamento e análise preditiva de casos forenses —  
> com mapa interativo, gráficos animados e modelo de Machine Learning integrado.

</div>

---

## ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 🔐 **Autenticação** | Login com controle de papéis (Administrador, Perito, Assistente) |
| 📁 **Gestão de casos** | CRUD completo com status, tipo de crime, perito responsável e geolocalização |
| 🖼️ **Evidências** | Upload de imagens e vinculação de evidências a cada caso |
| 🗺️ **Mapa interativo** | Visualização geoespacial dos casos via Leaflet + CARTO Voyager |
| 📊 **Dashboard** | Gráficos animados com métricas, filtros e evolução mensal |
| 🤖 **Análise ML** | Predição de tipo de crime por regressão logística (Flask + scikit-learn) |
| 🖨️ **Laudo em PDF** | Impressão direta do laudo pericial via `window.print()` |
| 📱 **PWA** | Instalável como app, com Service Worker e cache offline |

---

## 🖼️ Telas

```
/login              → Autenticação com painel institucional
/dashboard          → Visão geral, filtros, gráficos e mapa
/casos/novo         → Formulário de cadastro com mapa de geolocalização
/casos/[id]         → Laudo completo e evidências vinculadas
/casos/[id]/editar  → Edição do caso
/casos/[id]/evidencias → Gerenciamento de evidências com fotos
/ml                 → Predição de crimes e importância das features
/usuarios           → Gerenciamento de usuários (somente Administrador)
```

---

## 🏗️ Arquitetura

```
Forescan/
├── src/
│   ├── app/                        # Rotas — Next.js App Router
│   │   ├── layout.tsx              # Layout raiz com Inter font + AppShell
│   │   ├── globals.css             # Design system completo (tokens, componentes)
│   │   ├── dashboard/page.tsx
│   │   ├── login/page.tsx
│   │   ├── ml/page.tsx
│   │   ├── usuarios/page.tsx
│   │   └── casos/
│   │       ├── novo/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── editar/page.tsx
│   │           └── evidencias/page.tsx
│   ├── components/
│   │   ├── layout/AppShell.tsx     # Topbar, nav, footer
│   │   ├── cases/CaseForm.tsx      # Formulário com mapa integrado
│   │   └── ui/
│   │       ├── BarChart.tsx        # Gráfico com animações escalonadas
│   │       ├── LeafletMap.tsx      # Mapa CARTO com picker de coordenadas
│   │       ├── MetricCard.tsx      # Cards do dashboard com ícones e variantes
│   │       ├── StatusBadge.tsx     # Badge colorido por status
│   │       ├── EmptyState.tsx      # Estado vazio com ícone
│   │       └── LoadingState.tsx    # Spinner de carregamento
│   └── lib/
│       ├── types.ts                # Tipos globais (User, CaseRecord, Evidence…)
│       ├── storage.ts              # CRUD via localStorage
│       ├── analytics.ts            # Filtros, agregações e formatação
│       ├── ml-api.ts               # Cliente HTTP para a API Flask
│       ├── constants.ts            # Listas fixas (peritos, crimes, etnias…)
│       └── use-auth-guard.ts       # Hook de proteção de rotas por papel
├── backend/
│   ├── app.py                      # API Flask com CORS configurável
│   ├── train_model.py              # Treino do modelo de regressão logística
│   ├── model.pkl                   # Modelo serializado
│   ├── run_backend.py              # Servidor de desenvolvimento
│   └── requirements.txt
├── public/
│   ├── manifest.json               # Manifesto PWA
│   ├── pwabuilder-sw.js            # Service Worker com cache offline
│   └── images/                     # Logos e ícones
├── next.config.mjs
├── vercel.json
└── tsconfig.json
```

---

## 🚀 Como rodar

### Pré-requisitos

- **Node.js** 18+ e **npm** 9+
- **Python** 3.9+

---

### 1. Frontend (Next.js)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/forescan.git
cd forescan

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **[http://localhost:3000](http://localhost:3000)**

> **Login padrão:** `admin@forescan.com` / `admin123`

---

### 2. Backend de ML (Flask)

Em outro terminal:

```bash
# Instale as dependências Python
pip install -r backend/requirements.txt

# (Opcional) Retreine o modelo
python backend/train_model.py

# Inicie o servidor Flask
npm run dev:backend
# ou diretamente:
python backend/run_backend.py
```

API disponível em: **[http://localhost:5000](http://localhost:5000)**

---

### 3. Variável de ambiente (opcional)

Por padrão, a tela `/ml` aponta para `http://localhost:5000`.  
Para apontar para outro servidor, crie um `.env.local`:

```env
NEXT_PUBLIC_FORESCAN_API_BASE_URL=https://seu-backend.com
```

---

## 🤖 API de Machine Learning

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/predict` | Predição do tipo de crime |
| `GET` | `/api/model/features` | Importância das features do modelo |
| `GET` | `/api/estatisticas` | Estatísticas dos casos por tipo, local e gênero |
| `GET` | `/api/casos` | Listagem de casos (backend) |
| `POST` | `/api/casos` | Criação de caso (backend) |

**Payload de predição:**

```json
{
  "idade_vitima": 30,
  "genero_vitima": "Feminino",
  "local_crime": 2
}
```

**Resposta:**

```json
{
  "prediction": 1,
  "tipo_crime": "Roubo",
  "probabilidade": [0.32, 0.68]
}
```

---

## 🛠️ Stack técnica

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| [Next.js](https://nextjs.org) | 16 | App Router, SSR, build |
| [React](https://react.dev) | 19 | Componentes e estado |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Tipagem estática |
| [Leaflet](https://leafletjs.com) | 1.9 | Mapa interativo |
| [CARTO Voyager](https://carto.com) | — | Tiles limpos e profissionais |
| [Inter](https://fonts.google.com/specimen/Inter) | — | Tipografia via `next/font` |

### Backend

| Tecnologia | Uso |
|------------|-----|
| [Flask](https://flask.palletsprojects.com) | API REST |
| [scikit-learn](https://scikit-learn.org) | Regressão logística |
| [pandas](https://pandas.pydata.org) | Manipulação de dados |
| [flask-cors](https://flask-cors.readthedocs.io) | CORS configurável por origem |

---

## 🎨 Design system

O projeto usa um design system próprio em CSS puro (`src/app/globals.css`), sem dependências externas de UI.

**Tokens principais:**

```css
--brand:   #1e3a5f   /* Azul navy institucional  */
--accent:  #0ea5e9   /* Cyan para destaques       */
--bg:      #f0f4f8   /* Fundo da aplicação        */
--surface: #ffffff   /* Cards e painéis           */
--radius-md: 12px    /* Bordas dos componentes    */
```

**Componentes disponíveis:**

- `MetricCard` — card com variantes `brand`, `success`, `warning`
- `BarChart` — barras animadas com entrada escalonada
- `StatusBadge` — `Em andamento`, `Finalizado`, `Arquivado`
- `LeafletMap` — modo exibição e modo picker de coordenadas
- `EmptyState`, `LoadingState` — estados intermediários

---

## 🔐 Controle de acesso

| Papel | Permissões |
|-------|-----------|
| **Administrador** | Acesso total, gerencia usuários e altera qualquer status |
| **Perito** | Cria/edita casos, altera status |
| **Assistente** | Somente leitura de casos e evidências |

O hook `useAuthGuard(roles?)` protege cada rota no cliente.

---

## 📋 Scripts disponíveis

```bash
npm run dev          # Servidor Next.js em modo desenvolvimento (porta 3000)
npm run dev:backend  # Servidor Flask em modo desenvolvimento (porta 5000)
npm run build        # Build de produção
npm run start        # Servidor Next.js em produção
npm run typecheck    # Verificação de tipos TypeScript
```

---

## 📦 Deploy

O frontend está configurado para **Vercel** (`vercel.json`):

```bash
# Deploy de preview
npx vercel

# Deploy de produção
npx vercel --prod
```

O backend Flask precisa de hospedagem separada (ex.: [Railway](https://railway.app), [Render](https://render.com), ou como função serverless). Após o deploy, configure a variável:

```env
NEXT_PUBLIC_FORESCAN_API_BASE_URL=https://sua-api.railway.app
```

---

## 🗺️ Roadmap

- [ ] Autenticação real com JWT e hash de senhas (bcrypt)
- [ ] Migração do armazenamento para banco de dados (Supabase / Netlify DB)
- [ ] Upload de evidências para storage externo (S3 / Supabase Storage)
- [ ] Retreinamento do modelo ML com dados reais
- [ ] Middleware Next.js para proteção de rotas no servidor
- [ ] Testes automatizados (Vitest + Playwright)
- [ ] Auditoria de alterações em casos (log de eventos)
- [ ] Modo escuro

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com 🔍 para a área forense

</div>
