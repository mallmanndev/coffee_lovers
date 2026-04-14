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

## Arquitetura

O projeto segue **Clean Architecture**. Features transacionais (cadastros, updates, qualquer fluxo com regra de negócio) devem seguir as camadas abaixo:

### Camadas

#### Controller
- Recebe a requisição HTTP e delega imediatamente para um **use case**.
- Não contém lógica de negócio.
- Única responsabilidade além de delegar: conversão de dados de apresentação (ex.: mapear entidade de domínio para DTO de resposta).

#### Use Case
- Contém as **regras de negócio da aplicação**.
- Trabalha exclusivamente com **entidades de domínio** (nunca com DTOs do banco ou de APIs externas diretamente).
- Um use case = uma ação/intenção do usuário (ex.: `CreateCoffeeShopUseCase`).

#### Entidade de Domínio
- Representa o conceito central do negócio.
- **Atributos privados** — nenhum campo é alterado diretamente de fora.
- Modificações ocorrem apenas via **métodos com semântica clara** (ex.: `shop.activate()`, `shop.updateName(name)`).
- É o primeiro lugar onde validações de negócio devem ser feitas.

#### Repository
- Responsável por **persistir e recuperar entidades de domínio** no banco de dados.
- A interface do repositório pertence ao domínio; a implementação (Mongoose) pertence à infraestrutura.
- Recebe e retorna entidades de domínio — nunca documentos Mongoose diretamente.

#### Gateway
- Responsável por **comunicação com APIs externas** (ex.: serviço de pagamento, geocodificação).
- Recebe e retorna **DTOs** — nunca entidades de domínio.
- Isola o domínio de detalhes de integrações externas.

#### DAO (Data Access Object)
- Usado exclusivamente em **consultas sem regra de negócio**: listas, relatórios, dashboards, filtros paginados.
- Acessa o banco diretamente (Mongoose) e retorna **DTOs prontos** — sem passar por entidade de domínio, repository ou use case.
- O Controller chama o DAO diretamente e devolve o resultado ao cliente.
- Não deve ser usado em fluxos transacionais ou que envolvam escrita.

### Fluxo de Dados (feature transacional)

```
HTTP Request
    │
    ▼
Controller          → converte input em parâmetros do use case
    │
    ▼
Use Case            → orquestra regras de negócio com entidades de domínio
    │          │
    ▼          ▼
Repository   Gateway    → Repository persiste entidade; Gateway acessa API externa
    │
    ▼
Controller          → mapeia entidade de domínio → DTO de resposta
    │
    ▼
HTTP Response
```

### Fluxo de Dados (consulta / relatório / lista)

```
HTTP Request
    │
    ▼
Controller          → repassa parâmetros de filtro/paginação
    │
    ▼
DAO                 → consulta direta ao banco, monta e retorna DTO
    │
    ▼
HTTP Response
```

### Validações

1. **Entidade de domínio** — primeira barreira; valida invariantes de negócio (ex.: nome não vazio, preço positivo).
2. **Use case** — quando a validação depende de estado externo (ex.: verificar duplicidade no banco).
3. **DTO de entrada** — usa `class-validator` para sanitizar dados de apresentação antes de chegarem ao use case.

## Estrutura do Projeto

```
src/
├── main.ts                         ← bootstrap da aplicação
├── app.module.ts                   ← módulo raiz
├── <feature>/
│   ├── <feature>.module.ts
│   ├── domain/
│   │   └── <feature>.entity.ts        ← entidade de domínio (atributos privados)
│   ├── use-cases/
│   │   ├── <action>-<feature>.use-case.ts
│   │   └── <action>-<feature>.use-case.spec.ts
│   ├── repositories/
│   │   ├── <feature>.repository.ts    ← interface (domínio)
│   │   └── <feature>.repository.impl.ts ← implementação Mongoose (infraestrutura)
│   ├── gateways/                      ← somente se houver APIs externas
│   │   └── <gateway>.gateway.ts
│   ├── daos/                          ← somente para consultas/relatórios
│   │   ├── <feature>.dao.ts
│   │   └── <feature>.dao.spec.ts
│   ├── controllers/
│   │   ├── <feature>.controller.ts
│   │   └── <feature>.controller.spec.ts
│   ├── dto/
│   │   └── <action>-<feature>.dto.ts
│   └── schemas/
│       └── <feature>.schema.ts        ← schema Mongoose
test/
└── <feature>.e2e-spec.ts             ← testes e2e
```

## Padrões de Nomenclatura

| Artefato          | Convenção                              | Exemplo                           |
|-------------------|----------------------------------------|-----------------------------------|
| Arquivo           | kebab-case                             | `coffee-shop.entity.ts`           |
| Classe            | PascalCase                             | `CoffeeShopEntity`                |
| Método/variável   | camelCase                              | `findAllShops()`                  |
| Use Case          | `<Action><Feature>UseCase`             | `CreateCoffeeShopUseCase`         |
| DTO               | `<Action><Feature>Dto`                 | `CreateCoffeeShopDto`             |
| Repository (iface)| `<Feature>Repository`                  | `CoffeeShopRepository`            |
| Repository (impl) | `<Feature>RepositoryImpl`              | `CoffeeShopRepositoryImpl`        |
| Gateway           | `<Name>Gateway`                        | `MapsGateway`                     |
| DAO               | `<Feature>Dao`                         | `CoffeeShopDao`                   |
| Schema            | `<Feature>Schema` / `<Feature>`        | `CoffeeShopSchema`                |
| Módulo            | `<Feature>Module`                      | `CoffeeShopModule`                |
| Controller        | `<Feature>Controller`                  | `CoffeeShopController`            |

## Regras Básicas

- Cada feature vive em seu próprio módulo dentro de `src/`.
- Controllers apenas delegam para use cases — sem lógica de negócio.
- Use cases trabalham com entidades de domínio, não com DTOs do banco ou de APIs.
- Entidades de domínio têm atributos privados; modificações somente via métodos semânticos.
- Repositórios recebem e retornam entidades de domínio.
- Gateways recebem e retornam DTOs — nunca entidades de domínio.
- Para consultas, listas e relatórios sem regra de negócio, use um **DAO** que retorna DTOs diretamente — sem use case nem entidade de domínio.
- Validações de negócio ficam na entidade; validações dependentes de estado externo, no use case.
- DTOs de entrada usam `class-validator`.
- Todo use case deve ter ao menos um teste unitário.
- Siga TDD: testes passando antes de considerar a feature pronta.

## Variáveis de Ambiente

A aplicação utiliza `@nestjs/config` com validação via `class-validator` definida em `src/config/env.ts`.

| Variável      | Obrigatória | Descrição                     | Default |
|---------------|-------------|-------------------------------|---------|
| `PORT`        | Não         | Porta HTTP da aplicação       | `3001`  |
| `MONGODB_URI` | **Sim**     | URI de conexão com o MongoDB  | -       |
