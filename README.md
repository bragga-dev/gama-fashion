# Gama Fashion - Moda Fitness (front-end)

React 19 + TypeScript + Tailwind v4 + React Router + TanStack Query + React Hook Form/Zod.

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:3000 (proxy /api -> localhost:8000)
```

Back: `FRONTEND_URL=http://localhost:3000` e `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` com a origem do front.

Rotas usadas pelo back: `/redefinir-senha`, `/verificacao-concluida`, `/painel/meus-pedidos`.
