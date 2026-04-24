"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEquipamentInputSchema,
  type EquipamentType,
} from "@coffee-lovers/shared";
import type { EquipmentFormValues } from "@/components/equipment/equipment-form-values";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { BaseEquipmentCombobox } from "@/components/equipment/BaseEquipmentCombobox";
import { TypeSpecificFieldsByType } from "@/components/equipment/type-specific-fields-registry";
import { EquipmentPhotosField } from "@/components/equipment/EquipmentPhotosField";
import { EQUIPMENT_TYPE_LABELS } from "@/components/equipment/equipment-type-labels";

type CreateEquipmentFormProps = {
  onSuccess: () => void;
  onCancel?: () => void;
};

const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_TYPE_LABELS) as EquipamentType[];

export function CreateEquipmentForm({ onSuccess, onCancel }: CreateEquipmentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<EquipmentFormValues>({
    resolver: zodResolver(createEquipamentInputSchema),
    defaultValues: {
      equipamentId: undefined,
      type: "MISC",
      name: "",
      model: "",
      brand: "",
      description: "",
      photos: [],
      modifications: [],
      typeSpecificData: {},
    },
  });

  const { handleSubmit, register, setValue, control, formState } = methods;
  const equipamentId = useWatch({ control, name: "equipamentId" });
  const type = useWatch({ control, name: "type" });
  const catalogLocked = Boolean(equipamentId);

  const onSubmit = handleSubmit(async () => {
    setError(null);
    const payload = createEquipamentInputSchema.parse(methods.getValues());
    setIsLoading(true);
    try {
      const response = await apiClient.equipament.create({
        body: payload,
      });
      if (response.status === 201) {
        methods.reset();
        onSuccess();
      } else if (response.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (response.status === 404) {
        setError(response.body?.message ?? "Equipamento base não encontrado.");
      } else if (response.status === 409) {
        setError(response.body?.message ?? "Conflito ao cadastrar.");
      } else {
        setError("Não foi possível cadastrar o equipamento.");
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-4">
        <BaseEquipmentCombobox />

        <div className="space-y-2">
          <Label htmlFor="equipment-type">Tipo</Label>
          <Select
            disabled={catalogLocked || isLoading}
            value={type}
            onValueChange={(v) => {
              setValue("type", v as EquipamentType, { shouldValidate: true, shouldDirty: true });
              setValue("typeSpecificData", {}, { shouldDirty: true });
            }}
          >
            <SelectTrigger id="equipment-type" className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {EQUIPMENT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formState.errors.type && (
            <p className="text-sm text-destructive">{formState.errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment-name">Nome</Label>
          <Input
            id="equipment-name"
            placeholder="Nome do equipamento"
            disabled={catalogLocked || isLoading}
            {...register("name")}
          />
          {formState.errors.name && (
            <p className="text-sm text-destructive">{formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment-brand">Marca</Label>
          <Input
            id="equipment-brand"
            placeholder="Marca"
            disabled={catalogLocked || isLoading}
            {...register("brand")}
          />
          {formState.errors.brand && (
            <p className="text-sm text-destructive">{formState.errors.brand.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment-model">Modelo</Label>
          <Input
            id="equipment-model"
            placeholder="Modelo"
            disabled={catalogLocked || isLoading}
            {...register("model")}
          />
          {formState.errors.model && (
            <p className="text-sm text-destructive">{formState.errors.model.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment-description">Descrição (opcional)</Label>
          <Textarea
            id="equipment-description"
            placeholder="Notas sobre o seu equipamento"
            disabled={isLoading}
            rows={3}
            {...register("description")}
          />
          {formState.errors.description && (
            <p className="text-sm text-destructive">{formState.errors.description.message}</p>
          )}
        </div>

        <EquipmentPhotosField disabled={isLoading} />

        <TypeSpecificFieldsByType type={type} />

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando…" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
