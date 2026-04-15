import { RegisterForm } from "@/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Crie sua conta</h1>
          <p className="text-slate-500 mt-2">
            Comece a descobrir os melhores cafés especiais agora mesmo.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border rounded-lg p-8 shadow-sm">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-slate-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </main>
  );
}
