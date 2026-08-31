export type Usuario = { id: number; nome: string; email: string; tipo: "cliente" | "admin" };
export type Pacote = { id: number; titulo: string; descricao: string; destino: string; preco: string | number; duracaoDias: number; imagem?: string | null; destaque: boolean; disponivel: boolean };
export type Reserva = { id: number; usuarioId: number; pacoteId: number; dataViagem: string; dataReserva: string; quantidadePessoas: number; status: "pendente" | "confirmada" | "cancelada"; observacoes?: string | null };

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const resposta = await fetch(caminho, { ...opcoes, credentials: "include", headers: { "Content-Type": "application/json", ...(opcoes.headers || {}) } });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.error || "Não foi possível concluir a operação");
  return dados as T;
}

export const api = {
  usuarioAtual: () => requisitar<{ usuario: Usuario }>("/api/usuarios/me"),
  entrar: (email: string, senha: string) => requisitar<{ usuario: Usuario }>("/api/usuarios/login", { method: "POST", body: JSON.stringify({ email, senha }) }),
  cadastrar: (nome: string, email: string, senha: string) => requisitar<{ usuario: Usuario }>("/api/usuarios/cadastro", { method: "POST", body: JSON.stringify({ nome, email, senha }) }),
  sair: () => requisitar<{ success: true }>("/api/usuarios/logout", { method: "POST" }),
  listarPacotes: () => requisitar<Pacote[]>("/api/pacotes"),
  listarPacotesAdmin: () => requisitar<Pacote[]>("/api/pacotes/admin"),
  criarPacote: (dados: Partial<Pacote>) => requisitar<Pacote>("/api/pacotes", { method: "POST", body: JSON.stringify(dados) }),
  atualizarPacote: (id: number, dados: Partial<Pacote>) => requisitar<Pacote>(`/api/pacotes/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
  arquivarPacote: (id: number) => requisitar<{ success: true }>(`/api/pacotes/${id}`, { method: "DELETE" }),
  listarReservas: () => requisitar<Reserva[]>("/api/reservas"),
  criarReserva: (dados: { pacoteId: number; dataViagem: string; quantidadePessoas: number; observacoes?: string }) => requisitar<Reserva>("/api/reservas", { method: "POST", body: JSON.stringify(dados) }),
  atualizarStatusReserva: (id: number, status: Reserva["status"]) => requisitar<{ success: true }>(`/api/reservas/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
