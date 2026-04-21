"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth-session";

type GateState =
  | { status: "pending" }
  | { status: "denied" }
  | { status: "allowed" };

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [gate, setGate] = useState<GateState>({ status: "pending" });

  useEffect(() => {
    queueMicrotask(() => {
      const session = getSession();
      if (!session) {
        const next = encodeURIComponent(pathname ?? "/feed");
        router.replace(`/login?next=${next}`);
        setGate({ status: "denied" });
        return;
      }
      setGate({ status: "allowed" });
    });
  }, [router, pathname]);

  if (gate.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  if (gate.status === "denied") {
    return null;
  }

  return <>{children}</>;
}
