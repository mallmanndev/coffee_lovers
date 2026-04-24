"use client";

import { useId, useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload-image";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { ImageIcon, XIcon, Loader2Icon } from "lucide-react";

const DEFAULT_MAX_PHOTOS = 10;
const DEFAULT_MAX_FILE_MB = 5;

export type PhotoUrlsEditorProps = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  /** Máximo de imagens (feed: 10, equipamento: 8). */
  maxPhotos?: number;
  maxFileMb?: number;
  fileInputId?: string;
  label?: ReactNode;
  /** Texto curto à direita do label (ex.: limites de tamanho). */
  labelHint?: ReactNode;
  addPhotosLabel?: string;
};

export function PhotoUrlsEditor({
  value,
  onChange,
  disabled,
  maxPhotos = DEFAULT_MAX_PHOTOS,
  maxFileMb = DEFAULT_MAX_FILE_MB,
  fileInputId: fileInputIdProp,
  label,
  labelHint,
  addPhotosLabel = "Adicionar fotos",
}: PhotoUrlsEditorProps) {
  const reactId = useId();
  const fileInputId = fileInputIdProp ?? `photo-urls-input-${reactId}`;
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);
    const remaining = maxPhotos - value.length;
    if (remaining <= 0) {
      setError(`Máximo de ${maxPhotos} fotos.`);
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);
    try {
      const next: string[] = [...value];
      for (const file of files) {
        if (file.size > maxFileMb * 1024 * 1024) {
          setError(`Cada arquivo deve ter no máximo ${maxFileMb} MB.`);
          continue;
        }
        const { url } = await uploadImage(file);
        next.push(url);
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload.");
    } finally {
      setUploading(false);
    }
  };

  const remove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div className="space-y-2">
      {label != null || labelHint != null ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {label != null ? (
            typeof label === "string" ? (
              <Label htmlFor={fileInputId}>{label}</Label>
            ) : (
              label
            )
          ) : null}
          {labelHint != null ? (
            <span className="text-xs text-muted-foreground">{labelHint}</span>
          ) : null}
        </div>
      ) : null}
      <input
        id={fileInputId}
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
          disabled={disabled || uploading || value.length >= maxPhotos}
          onClick={() => document.getElementById(fileInputId)?.click()}
        >
          {uploading ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : (
            <ImageIcon className="size-4" aria-hidden />
          )}
          {uploading ? "Enviando…" : addPhotosLabel}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {value.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url) => (
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
