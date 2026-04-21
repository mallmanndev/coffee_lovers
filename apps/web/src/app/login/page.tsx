import { LoginForm } from "@/components/LoginForm";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-foreground/80 mt-2">
              Acesse sua conta para continuar descobrindo cafés especiais.
            </p>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-lg p-8 shadow-sm">
            <Suspense fallback={<div className="h-64 flex items-center justify-center">Carregando...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="text-center text-sm text-foreground/80">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Crie uma conta
            </Link>
          </p>
        </div>
      </main>
    </RedirectIfAuthenticated>
  );
}
