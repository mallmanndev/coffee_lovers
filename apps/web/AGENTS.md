# Frontend — Coffee Lovers

Rede social para descoberta, avaliação e compartilhamento de experiências com cafés especiais. Construído com Next.js 16 usando App Router.

## Stack

| Camada      | Tecnologia                    |
|-------------|-------------------------------|
| Framework   | Next.js 16 (App Router)       |
| UI Library  | React 19 + shadcn/ui          |
| Estilização | Tailwind CSS 4                |
| API Client  | @ts-rest/core                 |
| Validação   | Zod                           |
| Testes      | Playwright (E2E) + Jest (utils)|
| Linguagem   | TypeScript                    |

## Comandos

- `pnpm dev` — inicia em modo desenvolvimento
- `pnpm build` — gera o build de produção
- `pnpm start` — inicia o servidor de produção
- `pnpm lint` — executa o ESLint
- `pnpm test` — executa testes unitários (apenas para utils)
- `pnpm test:e2e` — executa os testes Playwright (fluxos de API)

## Arquitetura

Camadas únicas:
- **Page** (`src/app/<rota>/page.tsx`) — um arquivo por rota; busca dados via API client e renderiza
- **Component** (`src/components/`) — componentes reutilizáveis entre páginas; puramente de apresentação
- **Lib** (`src/lib/`) — utilitários e o cliente HTTP tipado (`api-client.ts`)

Sem use cases, repositórios ou entidades de domínio — a regra de negócio fica no backend.

## Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx         ← layout raiz
│   ├── globals.css
│   ├── page.tsx           ← página inicial (/)
│   └── <rota>/
│       └── page.tsx       ← uma página por rota
├── components/
│   └── <Componente>.tsx   ← componentes reutilizáveis
└── lib/
    └── api-client.ts      ← cliente HTTP tipado (@ts-rest)
```

## Padrões de Nomenclatura

| Artefato             | Convenção                 | Exemplo                    |
|----------------------|---------------------------|----------------------------|
| Pasta de rota        | kebab-case                | `coffee-shops/`            |
| Arquivo de página    | sempre `page.tsx`         | `coffee-shops/page.tsx`    |
| Arquivo de componente| PascalCase                | `CoffeeShopCard.tsx`       |
| Classe/componente    | PascalCase                | `CoffeeShopCard`           |
| Hook customizado     | `use` + PascalCase        | `useAuth.ts`               |
| Arquivo de lib       | kebab-case                | `api-client.ts`            |

## Regras Básicas

- Uma rota = uma pasta com `page.tsx` em `src/app/`
- Componentes usados em mais de uma página vão em `src/components/`
- Nenhuma lógica de negócio nos componentes — apenas chamadas à API e renderização
- **Proibido o uso de `any`:** Tipagem estrita é obrigatória em todo o projeto.
- **Testes (E2E):** Fluxos que dependem de API devem ser feitos com Playwright em `e2e/`.
- **Sem Mocks:** Não mockar respostas da API em testes de frontend. Os testes E2E batem no backend real.
- **Jest:** Reservado apenas para funções utilitárias puras.
- TDD: testes passando antes de considerar a feature pronta
- Use shadcn/ui para componentes de interface; evite reinventar primitivos de UI

## Variáveis de Ambiente

| Variável                | Obrigatória | Descrição                  | Default                   |
|-------------------------|-------------|----------------------------|---------------------------|
| `NEXT_PUBLIC_API_URL`   | Não         | URL base da API backend    | `http://localhost:3001`   |

