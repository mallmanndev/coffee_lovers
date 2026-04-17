import { initContract } from '@ts-rest/core';
import { authContract } from './contracts/auth.contract';
import { equipmentContract } from './contracts/equipment.contract';

const c = initContract();

export const apiContract = c.router(
  {
    auth: authContract,
    equipment: equipmentContract,
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
export * from './schemas/equipment.schema';
export * from './schemas/user-equipment.schema';
export * from './contracts/equipment.contract';
