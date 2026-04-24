"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { EquipmentFormValues } from "@/components/equipment/equipment-form-values";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EspressoTypeFields() {
  const { control } = useFormContext<EquipmentFormValues>();

  return (
    <div className="space-y-2">
      <Label htmlFor="typeSpecificData.portafilterSize">Tamanho do portafilter (opcional)</Label>
      <Controller
        name="typeSpecificData.portafilterSize"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ?? ""}
            onValueChange={(v) => {
              field.onChange(v === "" ? undefined : v);
            }}
          >
            <SelectTrigger id="typeSpecificData.portafilterSize" className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="51mm">51 mm</SelectItem>
              <SelectItem value="58mm">58 mm</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
