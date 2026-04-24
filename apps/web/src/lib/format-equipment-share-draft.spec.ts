import { formatEquipmentShareDraft, formatEquipmentShareSummary } from "./format-equipment-share-draft";
import type { CreateEquipamentOutput } from "@coffee-lovers/shared";

const base: CreateEquipamentOutput = {
  id: "e1",
  type: "MISC",
  name: "Meu moinho",
  model: "X",
  brand: "Marca",
  description: undefined,
  photos: ["/uploads/a.jpg"],
  createdById: "u1",
  typeSpecificData: {},
  userEquipamentId: "ue1",
  modifications: [],
  createdAt: "2020-01-01T00:00:00.000Z",
  updatedAt: "2020-01-01T00:00:00.000Z",
};

describe("formatEquipmentShareDraft", () => {
  it("inclui título, nome e descrição em linhas separadas", () => {
    const out = formatEquipmentShareDraft({
      ...base,
      name: "Grinder 1",
      description: "Notas açucaradas",
    });
    expect(out).toContain("Novo equipamento cadastrado:");
    expect(out).toContain("Grinder 1");
    expect(out).toContain("Notas açucaradas");
  });

  it("omite descrição quando vazia", () => {
    const out = formatEquipmentShareDraft({ ...base, description: "   " });
    expect(out).not.toMatch(/\n\n\s*$/m);
  });
});

describe("formatEquipmentShareSummary", () => {
  it("une brand, model e name", () => {
    expect(formatEquipmentShareSummary(base)).toBe("Marca · X · Meu moinho");
  });
});
