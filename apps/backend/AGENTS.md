# Backend — Coffee Lovers

API REST construída com **NestJS** e **MongoDB**.

## Stack

- **Framework:** NestJS 11
- **Banco de dados:** MongoDB (Mongoose)
- **Linguagem:** TypeScript
- **Testes:** Jest

## Comandos

```bash
pnpm dev        # inicia em modo watch
pnpm build      # gera o build
pnpm test       # executa os testes unitários
pnpm test:e2e   # executa os testes e2e
pnpm test:cov   # cobertura de testes
```

## Estrutura do Projeto

```
src/
├── main.ts                  ← bootstrap da aplicação
├── app.module.ts            ← módulo raiz
├── <feature>/
│   ├── <feature>.module.ts
│   ├── <feature>.controller.ts
│   ├── <feature>.service.ts
│   ├── <feature>.controller.spec.ts
│   ├── <feature>.service.spec.ts
│   ├── dto/
│   │   └── <action>-<feature>.dto.ts
│   └── schemas/
│       └── <feature>.schema.ts
test/
└── <feature>.e2e-spec.ts    ← testes e2e
```

## Padrões de Nomenclatura

| Artefato       | Convenção                         | Exemplo                      |
|----------------|-----------------------------------|------------------------------|
| Arquivo        | kebab-case                        | `coffee-shop.service.ts`     |
| Classe         | PascalCase                        | `CoffeeShopService`          |
| Método/variável| camelCase                         | `findAllShops()`             |
| DTO            | `<Action><Feature>Dto`            | `CreateCoffeeShopDto`        |
| Schema         | `<Feature>Schema` / `<Feature>`   | `CoffeeShopSchema`           |
| Módulo         | `<Feature>Module`                 | `CoffeeShopModule`           |
| Controller     | `<Feature>Controller`             | `CoffeeShopController`       |
| Service        | `<Feature>Service`                | `CoffeeShopService`          |

## Regras Básicas

- Cada feature vive em seu próprio módulo dentro de `src/`.
- Controllers apenas delegam para services — sem lógica de negócio.
- DTOs devem usar `class-validator` para validação de entrada.
- Todo endpoint deve ter ao menos um teste unitário.
- Siga TDD: testes passando antes de considerar a feature pronta.

## Variáveis de Ambiente

A aplicação utiliza `@nestjs/config` com validação via `class-validator` definida em `src/config/env.ts`.

| Variável      | Obrigatória | Descrição                     | Default |
|---------------|-------------|-------------------------------|---------|
| `PORT`        | Não         | Porta HTTP da aplicação       | `3001`  |
| `MONGODB_URI` | **Sim**     | URI de conexão com o MongoDB  | -       |
