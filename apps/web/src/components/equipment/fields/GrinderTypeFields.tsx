"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { EquipmentFormValues } from "@/components/equipment/equipment-form-values";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GrinderTypeFields() {
  const { control } = useFormContext<EquipmentFormValues>();

  return (
    <div className="space-y-2">
      <Label htmlFor="typeSpecificData.clicks">Cliques do moedor (opcional)</Label>
      <Controller
        name="typeSpecificData.clicks"
        control={control}
        render={({ field }) => (
          <Input
            id="typeSpecificData.clicks"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Ex.: 12"
            value={field.value === undefined || field.value === null ? "" : String(field.value)}
            onChange={(e) => {
              const v = e.target.value;
              field.onChange(v === "" ? undefined : Number(v));
            }}
          />
        )}
      />
    </div>
  );
}
