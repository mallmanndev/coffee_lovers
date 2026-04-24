import { getAccessToken } from "@/lib/auth-session";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Faz upload de um arquivo de imagem e retorna a URL pública (path `/uploads/...`).
 */
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAccessToken();
  const res = await fetch(`${apiBase.replace(/\/$/, "")}/upload`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = "Falha ao enviar a imagem.";
    try {
      const j = JSON.parse(text) as { message?: string | string[] };
      if (Array.isArray(j.message)) {
        message = j.message[0] ?? message;
      } else if (typeof j.message === "string") {
        message = j.message;
      }
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return (await res.json()) as { url: string };
}
