import { initContract } from '@ts-rest/core';
import { authContract } from './contracts/auth.contract';
import { equipamentContract } from './contracts/equipament.contract';
import { coffeeContract } from './contracts/coffee.contract';

const c = initContract();

export const apiContract = c.router(
  {
    auth: authContract,
    equipament: equipamentContract,
    coffee: coffeeContract,
  },
  {
    commonResponses: {
      401: c.type<{ message: string }>(),
    },
    metadata: {
      security: [{ bearerAuth: [] }],
    },
  },
);

export * from './schemas/auth.schema';
export * from './contracts/auth.contract';
export * from './schemas/equipament.schema';
export * from './schemas/user-equipament.schema';
export * from './contracts/equipament.contract';
export * from './schemas/coffee.schema';
export * from './contracts/coffee.contract';
