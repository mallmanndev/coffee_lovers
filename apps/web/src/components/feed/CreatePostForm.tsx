"use client";

import { useEffect, useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type CreatePostInput,
  type CreatePostOutput,
} from "@coffee-lovers/shared";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PhotoUrlsEditor } from "@/components/PhotoUrlsEditor";
import { cn } from "@/lib/utils";

const uploadPathRegex = /^\/uploads\/.+/;
const MAX_PHOTOS = 10;
const MAX_MESSAGE = 5000;
const MAX_SHARE = 500;

const createPostFormValuesSchema = z.object({
  message: z
    .string()
    .min(1, "Mensagem obrigatória")
    .max(MAX_MESSAGE, "Mensagem muito longa"),
  imageUrls: z
    .array(
      z
        .string()
        .regex(
          uploadPathRegex,
          "Cada imagem deve ser uma URL com prefixo /uploads/",
        ),
    )
    .max(MAX_PHOTOS, `No máximo ${MAX_PHOTOS} imagens`),
  shareSummary: z.string().max(MAX_SHARE, "Resumo muito longo").optional(),
});

export type CreatePostFormValues = z.infer<typeof createPostFormValuesSchema>;

export type CreatePostFormProps = {
  initialMessage?: string;
  initialImageUrls?: string[];
  /** Só o modo `equipment_share`: resumo curto (ex.: de `formatEquipmentShareSummary`). */
  initialShareSummary?: string;
  equipmentShare?: { userEquipamentId: string; shareSummary?: string };
  onSuccess?: (post: CreatePostOutput) => void;
  onError?: (message: string) => void;
  className?: string;
  /** Se true (padrão), limpa o formulário após publicar com sucesso. */
  resetOnSuccess?: boolean;
};

function buildCreatePostBody(
  values: CreatePostFormValues,
  equipmentShare: CreatePostFormProps["equipmentShare"],
): CreatePostInput {
  const message = values.message.trim();
  const imageUrls = values.imageUrls;
  if (equipmentShare) {
    const fromForm = values.shareSummary?.trim();
    const fromProps = equipmentShare.shareSummary?.trim();
    const shareSummary = fromForm || fromProps;
    return {
      message,
      imageUrls,
      kind: "equipment_share",
      userEquipamentId: equipmentShare.userEquipamentId,
      ...(shareSummary ? { shareSummary } : {}),
    };
  }
  return {
    message,
    imageUrls,
    kind: "user",
  };
}

function safeErrorMessage(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message?: string }).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return "Não foi possível publicar. Tente novamente.";
}

export function CreatePostForm({
  initialMessage = "",
  initialImageUrls = [],
  initialShareSummary = "",
  equipmentShare,
  onSuccess,
  onError,
  className,
  resetOnSuccess = true,
}: CreatePostFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileScopeId = useId();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostFormValuesSchema),
    defaultValues: {
      message: initialMessage,
      imageUrls: initialImageUrls,
      shareSummary:
        initialShareSummary ||
        (equipmentShare?.shareSummary ?? ""),
    },
  });

  useEffect(() => {
    reset({
      message: initialMessage,
      imageUrls: initialImageUrls,
      shareSummary:
        initialShareSummary || (equipmentShare?.shareSummary ?? ""),
    });
  }, [
    initialMessage,
    initialImageUrls,
    initialShareSummary,
    equipmentShare?.userEquipamentId,
    equipmentShare?.shareSummary,
    reset,
  ]);

  const onSubmit = async (values: CreatePostFormValues) => {
    setSubmitError(null);
    const body = buildCreatePostBody(values, equipmentShare);
    try {
      const response = await apiClient.feed.createPost({ body });
      if (response.status === 201) {
        onSuccess?.(response.body);
        if (resetOnSuccess) {
          reset({
            message: "",
            imageUrls: [],
            shareSummary: "",
          });
        }
      } else if (response.status === 400) {
        const msg = safeErrorMessage(response.body);
        setSubmitError(msg);
        onError?.(msg);
      } else {
        const msg = "Não foi possível publicar. Tente novamente.";
        setSubmitError(msg);
        onError?.(msg);
      }
    } catch {
      const msg = "Erro de conexão com o servidor.";
      setSubmitError(msg);
      onError?.(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
      noValidate
    >
      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`create-post-message-${fileScopeId}`}>
          Mensagem
        </Label>
        <Textarea
          id={`create-post-message-${fileScopeId}`}
          placeholder="O que você está preparando hoje?"
          className="min-h-24"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        {errors.message ? (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        ) : null}
      </div>
      <Controller
        name="imageUrls"
        control={control}
        render={({ field }) => (
          <PhotoUrlsEditor
            value={field.value}
            onChange={field.onChange}
            disabled={isSubmitting}
            maxPhotos={MAX_PHOTOS}
            fileInputId={`create-post-photos-${fileScopeId}`}
            label="Fotos (opcional)"
            labelHint={
              <>Até {MAX_PHOTOS} imagens; aparecem no post.</>
            }
          />
        )}
      />
      {errors.imageUrls ? (
        <p className="text-sm text-destructive">
          {errors.imageUrls.message as string}
        </p>
      ) : null}
      {equipmentShare ? (
        <div className="space-y-2">
          <Label htmlFor={`create-post-summary-${fileScopeId}`}>
            Resumo do equipamento (opcional)
          </Label>
          <Input
            id={`create-post-summary-${fileScopeId}`}
            placeholder="Ex.: Marca · modelo"
            maxLength={MAX_SHARE}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.shareSummary)}
            {...register("shareSummary")}
          />
          {errors.shareSummary ? (
            <p className="text-sm text-destructive">
              {errors.shareSummary.message}
            </p>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Publicando…" : "Publicar"}
      </Button>
    </form>
  );
}
