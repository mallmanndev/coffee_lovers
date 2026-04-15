import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterForm } from "@/components/RegisterForm";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

// Mock do next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock do api-client
jest.mock("@/lib/api-client", () => ({
  apiClient: {
    register: jest.fn(),
  },
}));

describe("RegisterForm", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it("deve renderizar os campos do formulário", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criar conta/i })).toBeInTheDocument();
  });

  it("deve mostrar erros de validação quando os campos estiverem vazios", async () => {
    render(<RegisterForm />);

    fireEvent.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      // O shared schema tem validações básicas, vamos verificar se as mensagens aparecem
      // Nota: As mensagens exatas dependem de como o zod está configurado no shared
      const minCharErrors = screen.getAllByText(/String must contain at least 1 character/i);
      expect(minCharErrors.length).toBeGreaterThan(0);
    });
  });

  it("deve chamar a API e redirecionar em caso de sucesso", async () => {
    (apiClient.register as jest.Mock).mockResolvedValue({
      status: 201,
      body: { id: "1", name: "John", email: "john@example.com" },
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      expect(apiClient.register).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
        }),
      });
      expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
    });
  });

  it("deve mostrar erro se o e-mail já estiver em uso", async () => {
    (apiClient.register as jest.Mock).mockResolvedValue({
      status: 409,
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/Este e-mail já está em uso/i)).toBeInTheDocument();
    });
  });
});
