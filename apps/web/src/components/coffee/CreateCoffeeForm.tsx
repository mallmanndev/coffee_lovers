"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createCoffeeInputSchema,
  type CreateCoffeeInput,
  type CreateCoffeeOutput,
} from "@coffee-lovers/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhotoUrlsEditor } from "@/components/PhotoUrlsEditor";
import { apiClient } from "@/lib/api-client";
import { useId, useState } from "react";

const formSchema = createCoffeeInputSchema.extend({
  coffee_name: z.string().min(1, "Nome é obrigatório"),
  roastery: z.string().min(1, "Torrefação é obrigatória"),
});

const strip = (v: string | undefined): string | undefined =>
  v?.trim() || undefined;

type CreateCoffeeFormProps = {
  onSuccess: (created: CreateCoffeeOutput) => void;
  onCancel?: () => void;
};

export function CreateCoffeeForm({ onSuccess, onCancel }: CreateCoffeeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const photoInputId = useId();

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCoffeeInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coffee_name: "",
      roastery: "",
      producer_farm: "",
      origin_country: "",
      region: "",
      variety: "",
      altitude_meters: undefined,
      photos: [],
      processing: {
        processing_method: "",
        fermentation_details: "",
        drying_method: "",
      },
      roast: {
        roast_profile: "",
      },
      sensory_profile: {
        notes: "",
        acidity: "",
        body: "",
        sweetness: "",
        finish: "",
        sca_score: undefined,
      },
    },
  });

  const onSubmit = handleSubmit(async (raw) => {
    console.log("Raw data:", raw);
    setError(null);
    setIsLoading(true);
    try {
      const response = await apiClient.coffee.create({
        body: {
          coffee_name: raw.coffee_name,
          roastery: raw.roastery,
          producer_farm: strip(raw.producer_farm),
          origin_country: strip(raw.origin_country),
          region: strip(raw.region),
          variety: strip(raw.variety),
          altitude_meters: raw.altitude_meters,
          photos: raw.photos?.length ? raw.photos : undefined,
          processing:
            strip(raw.processing?.processing_method) ??
            strip(raw.processing?.fermentation_details) ??
            strip(raw.processing?.drying_method)
              ? {
                  processing_method: strip(raw.processing?.processing_method),
                  fermentation_details: strip(raw.processing?.fermentation_details),
                  drying_method: strip(raw.processing?.drying_method),
                }
              : undefined,
          roast: strip(raw.roast?.roast_profile)
            ? { roast_profile: strip(raw.roast?.roast_profile) }
            : undefined,
          sensory_profile:
            strip(raw.sensory_profile?.notes) ??
            strip(raw.sensory_profile?.acidity) ??
            strip(raw.sensory_profile?.body) ??
            strip(raw.sensory_profile?.sweetness) ??
            strip(raw.sensory_profile?.finish) ??
            raw.sensory_profile?.sca_score != null
              ? {
                  notes: strip(raw.sensory_profile?.notes),
                  acidity: strip(raw.sensory_profile?.acidity),
                  body: strip(raw.sensory_profile?.body),
                  sweetness: strip(raw.sensory_profile?.sweetness),
                  finish: strip(raw.sensory_profile?.finish),
                  sca_score: raw.sensory_profile?.sca_score,
                }
              : undefined,
        },
      });
      if (response.status === 201) {
        reset();
        onSuccess(response.body);
      } else if (response.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError("Não foi possível cadastrar o café.");
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Informações básicas</legend>

        <div className="space-y-2">
          <Label htmlFor="coffee-name">Nome do café *</Label>
          <Input
            id="coffee-name"
            placeholder="Ex: Bourbon Amarelo Fermentado"
            disabled={isLoading}
            {...register("coffee_name")}
          />
          {errors.coffee_name && (
            <p className="text-sm text-destructive">{errors.coffee_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="coffee-roastery">Torrefação *</Label>
          <Input
            id="coffee-roastery"
            placeholder="Nome da torrefação"
            disabled={isLoading}
            {...register("roastery")}
          />
          {errors.roastery && (
            <p className="text-sm text-destructive">{errors.roastery.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="coffee-producer">Fazenda / Produtor</Label>
          <Input
            id="coffee-producer"
            placeholder="Nome da fazenda ou produtor"
            disabled={isLoading}
            {...register("producer_farm")}
          />
          {errors.producer_farm && (
            <p className="text-sm text-destructive">{errors.producer_farm.message}</p>
          )}
        </div>

        <PhotoUrlsEditor
          value={watch("photos") ?? []}
          onChange={(next) => setValue("photos", next, { shouldDirty: true, shouldValidate: true })}
          disabled={isLoading}
          maxPhotos={5}
          maxFileMb={5}
          fileInputId={`coffee-photos-input-${photoInputId}`}
          label="Fotos (opcional)"
          labelHint={<>Até 5 imagens, 5 MB cada</>}
        />
      </fieldset>

      <Separator />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Origem</legend>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="coffee-country">País</Label>
            <Input
              id="coffee-country"
              placeholder="Ex: Brasil"
              disabled={isLoading}
              {...register("origin_country")}
            />
            {errors.origin_country && (
              <p className="text-sm text-destructive">{errors.origin_country.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-region">Região</Label>
            <Input
              id="coffee-region"
              placeholder="Ex: Sul de Minas"
              disabled={isLoading}
              {...register("region")}
            />
            {errors.region && (
              <p className="text-sm text-destructive">{errors.region.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="coffee-variety">Variedade</Label>
            <Input
              id="coffee-variety"
              placeholder="Ex: Bourbon, Catuaí"
              disabled={isLoading}
              {...register("variety")}
            />
            {errors.variety && (
              <p className="text-sm text-destructive">{errors.variety.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-altitude">Altitude (metros)</Label>
            <Input
              id="coffee-altitude"
              type="number"
              placeholder="Ex: 1200"
              disabled={isLoading}
              {...register("altitude_meters", {
                setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
              })}
            />
            {errors.altitude_meters && (
              <p className="text-sm text-destructive">{errors.altitude_meters.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <Separator />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Processamento</legend>

        <div className="space-y-2">
          <Label htmlFor="coffee-processing-method">Método de processamento</Label>
          <Input
            id="coffee-processing-method"
            placeholder="Ex: Natural, Lavado, Honey"
            disabled={isLoading}
            {...register("processing.processing_method")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coffee-fermentation">Detalhes de fermentação</Label>
          <Input
            id="coffee-fermentation"
            placeholder="Ex: 72h anaeróbico"
            disabled={isLoading}
            {...register("processing.fermentation_details")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coffee-drying">Método de secagem</Label>
          <Input
            id="coffee-drying"
            placeholder="Ex: Terreiro suspenso"
            disabled={isLoading}
            {...register("processing.drying_method")}
          />
        </div>
      </fieldset>

      <Separator />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Torra</legend>

        <div className="space-y-2">
          <Label htmlFor="coffee-roast-profile">Perfil de torra</Label>
          <Input
            id="coffee-roast-profile"
            placeholder="Ex: Clara, Média, Escura"
            disabled={isLoading}
            {...register("roast.roast_profile")}
          />
        </div>
      </fieldset>

      <Separator />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Perfil sensorial</legend>

        <div className="space-y-2">
          <Label htmlFor="coffee-notes">Notas sensoriais</Label>
          <Input
            id="coffee-notes"
            placeholder="Ex: Chocolate amargo, frutas vermelhas"
            disabled={isLoading}
            {...register("sensory_profile.notes")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="coffee-acidity">Acidez</Label>
            <Input
              id="coffee-acidity"
              placeholder="Ex: Alta, Cítrica"
              disabled={isLoading}
              {...register("sensory_profile.acidity")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-body">Corpo</Label>
            <Input
              id="coffee-body"
              placeholder="Ex: Encorpado"
              disabled={isLoading}
              {...register("sensory_profile.body")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-sweetness">Doçura</Label>
            <Input
              id="coffee-sweetness"
              placeholder="Ex: Alta"
              disabled={isLoading}
              {...register("sensory_profile.sweetness")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-finish">Final</Label>
            <Input
              id="coffee-finish"
              placeholder="Ex: Longo, achocolatado"
              disabled={isLoading}
              {...register("sensory_profile.finish")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coffee-sca-score">Pontuação SCA</Label>
          <Input
            id="coffee-sca-score"
            type="number"
            step="0.01"
            placeholder="Ex: 86.5"
            disabled={isLoading}
            {...register("sensory_profile.sca_score", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
          {errors.sensory_profile?.sca_score && (
            <p className="text-sm text-destructive">{errors.sensory_profile.sca_score.message}</p>
          )}
        </div>
      </fieldset>

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
          {isLoading ? "Salvando…" : "Cadastrar café"}
        </Button>
      </div>
    </form>
  );
}
