# Coffee Lovers

Rede social para descoberta, avaliação e compartilhamento de experiências com cafés especiais.

## Stack

| Camada   | Tecnologia                  | Localização     |
|----------|-----------------------------|-----------------|
| Backend  | NestJS + MongoDB            | `apps/backend`  |
| Frontend | Next.js + shadcn/ui         | `apps/web`      |
| Monorepo | Turborepo + pnpm workspaces | `/`             |

## Estrutura do Monorepo

```
/
├── AGENTS.md
├── apps/
│   ├── backend/         ← NestJS + MongoDB
│   └── web/             ← Next.js + shadcn/ui
├── packages/
│   └── shared/          ← tipos e utils compartilhados (@coffee-lovers/shared)
├── package.json
└── turbo.json
```

> Se a tarefa envolver o backend, consulte também [`apps/backend/AGENTS.md`](apps/backend/AGENTS.md) para convenções e regras específicas.

## Comandos Úteis

- `pnpm dev`: Inicia todos os apps em modo desenvolvimento
- `pnpm build`: Gera o build de todos os apps e pacotes
- `pnpm test`: Executa os testes em todo o monorepo
- `pnpm format`: Formata o código com Prettier

## TDD

Toda feature deve ter testes passando antes de ser considerada pronta.

- Backend (NestJS): Jest — `pnpm test` em `apps/backend`
- Frontend (Next.js): Jest + Testing Library — `pnpm test` em `apps/web`
