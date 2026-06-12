# Migracao para React/Next.js

Este repositorio agora possui uma aplicacao Next.js em `src/`, mantendo o backend Flask em `backend/` para a API de Machine Learning.

## Como rodar

Instale as dependencias:

```bash
npm install --cache .npm-cache
```

Rode o frontend:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Rode o backend Flask em outro terminal quando for usar a tela de ML:

```bash
npm run dev:backend
```

Alternativa direta:

```bash
python backend/run_backend.py
```

## Rotas migradas

- `/login` substitui `Login.html`
- `/dashboard` substitui `index.html`
- `/casos/novo` substitui `Adicionar_casos.html`
- `/casos/[id]` substitui `Laudos.html`
- `/casos/[id]/editar` substitui a edicao por query string de `Adicionar_casos.html?id=...`
- `/casos/[id]/evidencias` substitui `Adicionar_evidencias.html?casoId=...`
- `/ml` substitui `Analise_ML.html`
- `/usuarios` substitui `Gerenciar_usuarios.html`

## Estado atual

- Frontend migrado para Next.js App Router com React e TypeScript.
- UI reimplementada sem jQuery/Bootstrap obrigatorios.
- Casos, usuarios e evidencias usam `localStorage` temporariamente.
- A tela de ML chama o Flask em `http://localhost:5000`.
- Assets, manifest e service worker ficam em `public/`.
- Mapa geografico real reativado com Leaflet no dashboard e no formulario de casos.

## Validacao feita

```bash
npm run typecheck
npm run build
```

As duas validacoes devem passar antes de considerar uma alteracao concluida.

## Proximos passos recomendados

1. Trocar `localStorage` por banco real e API autenticada.
2. Substituir senha em texto puro por hash no backend.
3. Criar autenticacao real com sessao/JWT.
4. Decidir se laudos em PDF continuam no navegador ou passam a ser gerados no servidor.
