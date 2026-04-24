"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { EquipmentFormValues } from "@/components/equipment/equipment-form-values";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload-image";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { ImageIcon, XIcon, Loader2Icon } from "lucide-react";

const MAX_PHOTOS = 8;
const MAX_FILE_MB = 5;

type EquipmentPhotosFieldProps = {
  disabled?: boolean;
};

export function EquipmentPhotosField({ disabled }: EquipmentPhotosFieldProps) {
  const { setValue, getValues, control } = useFormContext<EquipmentFormValues>();
  const photos = useWatch({ control, name: "photos" }) ?? [];
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);
    const current = getValues("photos") ?? [];
    const remaining = MAX_PHOTOS - current.length;
    if (remaining <= 0) {
      setError(`Máximo de ${MAX_PHOTOS} fotos.`);
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);
    try {
      const next: string[] = [...current];
      for (const file of files) {
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          setError(`Cada arquivo deve ter no máximo ${MAX_FILE_MB} MB.`);
          continue;
        }
        const { url } = await uploadImage(file);
        next.push(url);
      }
      setValue("photos", next, { shouldDirty: true, shouldValidate: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload.");
    } finally {
      setUploading(false);
    }
  };

  const remove = (url: string) => {
    const current = getValues("photos") ?? [];
    setValue(
      "photos",
      current.filter((u) => u !== url),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label htmlFor="equipment-photos-input">Fotos (opcional)</Label>
        <span className="text-xs text-muted-foreground">
          Até {MAX_PHOTOS} imagens, {MAX_FILE_MB} MB cada
        </span>
      </div>
      <input
        id="equipment-photos-input"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
        multiple
        className="sr-only"
        tabIndex={-1}
        disabled={disabled || uploading}
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={disabled || uploading || photos.length >= MAX_PHOTOS}
          onClick={() => document.getElementById("equipment-photos-input")?.click()}
        >
          {uploading ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : (
            <ImageIcon className="size-4" aria-hidden />
          )}
          {uploading ? "Enviando…" : "Adicionar fotos"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((url) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- URLs de upload na API */}
              <img
                src={resolveMediaUrl(url)}
                alt=""
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                onClick={() => remove(url)}
                disabled={disabled || uploading}
                aria-label="Remover foto"
              >
                <XIcon className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
