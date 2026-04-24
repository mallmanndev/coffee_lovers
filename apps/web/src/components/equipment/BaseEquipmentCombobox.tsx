"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { EquipamentResponse } from "@coffee-lovers/shared";
import type { EquipmentFormValues } from "@/components/equipment/equipment-form-values";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { EQUIPMENT_TYPE_LABELS } from "@/components/equipment/equipment-type-labels";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";

const DEBOUNCE_MS = 300;

export function BaseEquipmentCombobox() {
  const { watch, setValue } = useFormContext<EquipmentFormValues>();
  const equipamentId = watch("equipamentId");
  const selectedType = watch("type");
  const selectedName = watch("name");
  const selectedBrand = watch("brand");
  const selectedModel = watch("model");

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<EquipamentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(search), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search]);

  const fetchCatalog = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const res = await apiClient.equipament.list({
        query: {
          userOnly: false,
          ...(text.trim() ? { text: text.trim() } : {}),
        },
      });
      if (res.status === 200) {
        setResults(res.body);
      } else {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void fetchCatalog(debounced);
  }, [debounced, open, fetchCatalog]);

  const applySelection = (item: EquipamentResponse) => {
    setValue("equipamentId", item.id, { shouldDirty: true, shouldValidate: true });
    setValue("type", item.type, { shouldDirty: true, shouldValidate: true });
    setValue("name", item.name, { shouldDirty: true, shouldValidate: true });
    setValue("model", item.model, { shouldDirty: true, shouldValidate: true });
    setValue("brand", item.brand, { shouldDirty: true, shouldValidate: true });
    setValue("typeSpecificData", {}, { shouldDirty: true });
    setOpen(false);
    setSearch("");
  };

  const clearSelection = () => {
    setValue("equipamentId", undefined, { shouldDirty: true, shouldValidate: true });
    setValue("name", "", { shouldDirty: true, shouldValidate: true });
    setValue("model", "", { shouldDirty: true, shouldValidate: true });
    setValue("brand", "", { shouldDirty: true, shouldValidate: true });
    setValue("typeSpecificData", {}, { shouldDirty: true });
  };

  const summary =
    equipamentId && selectedName
      ? `${selectedName} · ${EQUIPMENT_TYPE_LABELS[selectedType]} · ${selectedBrand} ${selectedModel}`
      : "Buscar equipamento no catálogo…";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium leading-none" id="base-equipment-label">
          Equipamento base (catálogo)
        </span>
        {equipamentId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-muted-foreground"
            onClick={clearSelection}
          >
            <XIcon className="size-4" aria-hidden />
            Limpar
          </Button>
        ) : null}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-labelledby="base-equipment-label"
            className={cn("w-full justify-between font-normal", !equipamentId && "text-muted-foreground")}
          >
            <span className="truncate text-left">{summary}</span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Digite para buscar por nome ou descrição…"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Buscando…" : "Nenhum equipamento encontrado."}
              </CommandEmpty>
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.id}-${item.name}`}
                    onSelect={() => applySelection(item)}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {EQUIPMENT_TYPE_LABELS[item.type]} · {item.brand} {item.model}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Selecione um item existente ou limpe para cadastrar um equipamento novo no catálogo.
      </p>
    </div>
  );
}
