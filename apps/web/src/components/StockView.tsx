"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateCoffeeForm } from "@/components/coffee/CreateCoffeeForm";
import type { CreateCoffeeOutput } from "@coffee-lovers/shared";
import { apiClient } from "@/lib/api-client";

const shellClass =
  "flex min-h-[calc(100dvh-4rem)] w-full flex-col px-4 pb-28 pt-8";

export function StockView() {
  const [open, setOpen] = useState(false);
  const [coffees, setCoffees] = useState<CreateCoffeeOutput[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoffees = async () => {
    setLoading(true);
    try {
      const res = await apiClient.coffee.list({ query: {} });
      if (res.status === 200) {
        setCoffees(res.body);
      }
    } catch (error) {
      console.error("Failed to fetch coffees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoffees();
  }, []);

  const handleCreated = (created: CreateCoffeeOutput) => {
    setOpen(false);
    setCoffees((prev) => [created, ...prev]);
  };

  return (
    <div className={shellClass}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cafés</h1>
            <p className="text-muted-foreground mt-1">
              Seus cafés cadastrados na plataforma.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button">Novo café</Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-lg max-h-[min(90vh,720px)] overflow-y-auto gap-0"
              showCloseButton
            >
              <DialogHeader>
                <DialogTitle>Cadastrar café</DialogTitle>
                <DialogDescription>
                  Registre um novo café na sua coleção.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                <CreateCoffeeForm
                  onSuccess={handleCreated}
                  onCancel={() => setOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="gap-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : coffees.length > 0 ? (
          <div className="grid gap-4">
            {coffees.map((coffee) => (
              <Card key={coffee.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{coffee.coffee_name}</CardTitle>
                      <CardDescription>{coffee.roastery}</CardDescription>
                    </div>
                    {coffee.sensory_profile?.sca_score && (
                      <div className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        SCA {coffee.sensory_profile.sca_score}
                      </div>
                    )}
                  </div>
                </CardHeader>
                {(coffee.origin_country || coffee.region || coffee.variety) && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {[coffee.origin_country, coffee.region, coffee.variety]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum café ainda</CardTitle>
              <CardDescription>
                Use &quot;Novo café&quot; para adicionar o primeiro à sua coleção.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
