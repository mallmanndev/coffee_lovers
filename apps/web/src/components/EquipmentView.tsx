"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  CreateEquipamentOutput,
  EquipamentResponse,
} from "@coffee-lovers/shared";
import {
  formatEquipmentShareDraft,
  formatEquipmentShareSummary,
} from "@/lib/format-equipment-share-draft";
import { CreatePostForm } from "@/components/feed/CreatePostForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateEquipmentForm } from "@/components/equipment/CreateEquipmentForm";
import { EQUIPMENT_TYPE_LABELS } from "@/components/equipment/equipment-type-labels";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const shellClass =
  "flex min-h-[calc(100dvh-4rem)] w-full flex-col px-4 pb-28 pt-8";

export function EquipmentView() {
  const [items, setItems] = useState<EquipamentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePostDraft, setSharePostDraft] =
    useState<CreateEquipamentOutput | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiClient.equipament.list({
        query: { userOnly: true },
      });
      if (res.status === 200) {
        setItems(res.body);
      } else {
        setError("Não foi possível carregar seus equipamentos.");
      }
    } catch {
      setError("Erro ao carregar equipamentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreated = (created: CreateEquipamentOutput) => {
    setOpen(false);
    setSharePostDraft(created);
    setShareOpen(true);
    setLoading(true);
    void load();
  };

  const handleShareOpenChange = (next: boolean) => {
    setShareOpen(next);
    if (!next) {
      setSharePostDraft(null);
    }
  };

  return (
    <div className={shellClass}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
            <p className="text-muted-foreground mt-1">
              Seus equipamentos cadastrados na plataforma.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button">Novo equipamento</Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-lg max-h-[min(90vh,720px)] overflow-y-auto gap-0"
              showCloseButton
            >
              <DialogHeader>
                <DialogTitle>Cadastrar equipamento</DialogTitle>
                <DialogDescription>
                  Associe um item do catálogo ou cadastre um equipamento novo.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                <CreateEquipmentForm
                  onSuccess={handleCreated}
                  onCancel={() => setOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={shareOpen} onOpenChange={handleShareOpenChange}>
            <DialogContent
              className="sm:max-w-lg max-h-[min(90vh,720px)] overflow-y-auto gap-0"
              showCloseButton
            >
              <DialogHeader>
                <DialogTitle>Compartilhar no feed</DialogTitle>
                <DialogDescription>
                  Revise a mensagem e as fotos antes de publicar. Você pode editar
                  antes de enviar.
                </DialogDescription>
              </DialogHeader>
              {sharePostDraft ? (
                <div className="pt-4">
                  <CreatePostForm
                    key={sharePostDraft.userEquipamentId}
                    initialMessage={formatEquipmentShareDraft(sharePostDraft)}
                    initialImageUrls={sharePostDraft.photos}
                    equipmentShare={{
                      userEquipamentId: sharePostDraft.userEquipamentId,
                      shareSummary: formatEquipmentShareSummary(sharePostDraft),
                    }}
                    onSuccess={() => {
                      setShareOpen(false);
                      setSharePostDraft(null);
                    }}
                  />
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum equipamento ainda</CardTitle>
              <CardDescription>
                Use &quot;Novo equipamento&quot; para adicionar o primeiro à sua coleção.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>
                      {EQUIPMENT_TYPE_LABELS[item.type]} · {item.brand} {item.model}
                    </CardDescription>
                  </CardHeader>
                  {((item.photos && item.photos.length > 0) || item.description) ? (
                    <CardContent className="space-y-3 pt-0">
                      {item.photos && item.photos.length > 0 ? (
                        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {item.photos.map((url) => (
                            <li
                              key={url}
                              className="aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element -- media from API */}
                              <img
                                src={resolveMediaUrl(url)}
                                alt={`Foto de ${item.name}`}
                                className="h-full w-full object-cover"
                              />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {item.description ? (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
