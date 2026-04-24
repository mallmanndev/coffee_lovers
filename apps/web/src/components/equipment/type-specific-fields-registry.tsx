"use client";

import type { ComponentType } from "react";
import type { EquipamentType } from "@coffee-lovers/shared";
import { EspressoTypeFields } from "@/components/equipment/fields/EspressoTypeFields";
import { GrinderTypeFields } from "@/components/equipment/fields/GrinderTypeFields";
import { NoopTypeFields } from "@/components/equipment/fields/NoopTypeFields";

const TYPE_SPECIFIC_FIELDS = {
  GRINDER: GrinderTypeFields,
  SCALE: NoopTypeFields,
  KETTLE: NoopTypeFields,
  ESPRESSO_MACHINE: EspressoTypeFields,
  MISC: NoopTypeFields,
} as const satisfies Record<EquipamentType, ComponentType>;

type TypeSpecificFieldsByTypeProps = {
  type: EquipamentType;
};

export function TypeSpecificFieldsByType({ type }: TypeSpecificFieldsByTypeProps) {
  const Fields = TYPE_SPECIFIC_FIELDS[type];
  return <Fields />;
}
