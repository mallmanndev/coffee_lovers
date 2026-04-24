import { createEquipamentInputSchema } from "@coffee-lovers/shared";
import type { z } from "zod";

/** Valores do formulário (entrada Zod, alinhado ao resolver). */
export type EquipmentFormValues = z.input<typeof createEquipamentInputSchema>;
