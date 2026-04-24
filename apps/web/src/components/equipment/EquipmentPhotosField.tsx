"use client";

import { useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { EquipmentFormValues } from "@/components/equipment/equipment-form-values";
import { PhotoUrlsEditor } from "@/components/PhotoUrlsEditor";

const MAX_PHOTOS = 8;
const MAX_FILE_MB = 5;

type EquipmentPhotosFieldProps = {
  disabled?: boolean;
};

export function EquipmentPhotosField({ disabled }: EquipmentPhotosFieldProps) {
  const { setValue, control } = useFormContext<EquipmentFormValues>();
  const photos = useWatch({ control, name: "photos" }) ?? [];
  const id = useId();

  return (
    <PhotoUrlsEditor
      value={photos}
      onChange={(next) => {
        setValue("photos", next, { shouldDirty: true, shouldValidate: true });
      }}
      disabled={disabled}
      maxPhotos={MAX_PHOTOS}
      maxFileMb={MAX_FILE_MB}
      fileInputId={`equipment-photos-input-${id}`}
      label="Fotos (opcional)"
      labelHint={
        <>
          Até {MAX_PHOTOS} imagens, {MAX_FILE_MB} MB cada
        </>
      }
    />
  );
}
