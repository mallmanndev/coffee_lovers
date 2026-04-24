import type { CreateEquipamentOutput } from "@coffee-lovers/shared";

/** Gera o texto sugerido (PT-BR) para compartilhar um equipamento recém-cadastrado no feed. */
export function formatEquipmentShareDraft(created: CreateEquipamentOutput): string {
  const lines = ["Novo equipamento cadastrado:", created.name.trim()];
  const desc = created.description?.trim();
  if (desc) {
    lines.push("", desc);
  }
  return lines.join("\n").trim();
}

/** Resumo curto opcional (ex.: post `shareSummary`) — brand, modelo e nome. */
export function formatEquipmentShareSummary(created: CreateEquipamentOutput): string {
  const parts = [created.brand, created.model, created.name].map((s) => s.trim()).filter(Boolean);
  return parts.join(" · ");
}
