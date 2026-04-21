"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth-session";

type ViewState = "pending" | "redirect" | "form";

export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("pending");

  useEffect(() => {
    queueMicrotask(() => {
      const session = getSession();
      if (session) {
        router.replace("/feed");
        setView("redirect");
        return;
      }
      setView("form");
    });
  }, [router]);

  if (view === "pending" || view === "redirect") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
