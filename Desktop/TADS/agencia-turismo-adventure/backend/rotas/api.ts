import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "../banco";

const NOME_COOKIE = "adventure_session";
const chaveJwt = new TextEncoder().encode(process.env.JWT_SECRET || "adventure-dev-secret-change-me");
const senhaAdministrador = process.env.ADMIN_DEFAULT_PASSWORD || "Adventure@2026";

type UsuarioLocal = Awaited<ReturnType<typeof prisma.usuario.findUnique>>;
type RequisicaoAutenticada = Request & { usuario?: NonNullable<UsuarioLocal> };

/** Envia uma resposta de erro padronizada para o navegador. */
function enviarErro(resposta: Response, status: number, mensagem: string) {
  return resposta.status(status).json({ error: mensagem });
}

/** Cria o cookie que mantém o usuário conectado por sete dias. */
async function criarSessao(usuario: NonNullable<UsuarioLocal>, resposta: Response) {
  const token = await new SignJWT({ tipo: usuario.tipo, email: usuario.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuario.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(chaveJwt);

  resposta.cookie(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/** Confere o cookie da sessão e coloca o usuário na requisição. */
async function verificarLogin(requisicao: RequisicaoAutenticada, resposta: Response, proximo: () => void) {
  const token = requisicao.cookies?.[NOME_COOKIE];
  if (!token) return enviarErro(resposta, 401, "Autenticação necessária");

  try {
    const { payload } = await jwtVerify(token, chaveJwt);
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(payload.sub) } });
    if (!usuario || !usuario.ativo) return enviarErro(resposta, 401, "Sessão inválida");
    requisicao.usuario = usuario;
    proximo();
  } catch {
    return enviarErro(resposta, 401, "Sessão inválida ou expirada");
  }
}

/** Permite continuar somente quando o usuário conectado é administrador. */
function verificarAdministrador(requisicao: RequisicaoAutenticada, resposta: Response, proximo: () => void) {
  if (requisicao.usuario?.tipo !== "admin") return enviarErro(resposta, 403, "Acesso restrito ao administrador");
  proximo();
}

/** Remove a senha antes de enviar os dados do usuário ao navegador. */
function usuarioPublico(usuario: NonNullable<UsuarioLocal>) {
  const { senha: _senha, ...dados } = usuario;
  return dados;
}

/** Converte o preço Decimal do Prisma para um número comum no JSON. */
function pacotePublico<T extends { preco: { toString(): string } }>(pacote: T) {
  return { ...pacote, preco: Number(pacote.preco) };
}

/** Organiza os campos recebidos ao criar ou editar um pacote. */
export function normalizarPacote(entrada: Record<string, unknown>) {
  return {
    titulo: String(entrada.titulo || "").trim(),
    descricao: String(entrada.descricao || "").trim(),
    destino: String(entrada.destino || "").trim(),
    preco: String(Number(entrada.preco || 0).toFixed(2)),
    duracaoDias: entrada.duracaoDias == null ? 1 : Number(entrada.duracaoDias),
    imagem: entrada.imagem ? String(entrada.imagem) : null,
    destaque: Boolean(entrada.destaque),
    disponivel: entrada.disponivel !== false,
  };
}

/** Verifica se os dados mínimos de um pacote foram preenchidos corretamente. */
export function pacoteValido(pacote: ReturnType<typeof normalizarPacote>) {
  return Boolean(pacote.titulo && pacote.descricao && pacote.destino && pacote.duracaoDias >= 1 && Number(pacote.preco) > 0);
}

/** Registra todas as rotas simples usadas pelo sistema de turismo. */
export function registrarRotas(app: Express) {
  app.get("/api/usuarios/setup", async (_requisicao, resposta) => {
    const email = process.env.ADMIN_DEFAULT_EMAIL || "admin@adventure.tur.br";
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) return resposta.json({ created: false, usuario: usuarioPublico(existente) });

    const administrador = await prisma.usuario.create({
      data: { nome: "Administrador Adventure", email, senha: await bcrypt.hash(senhaAdministrador, 12), tipo: "admin" },
    });
    return resposta.status(201).json({ created: true, usuario: usuarioPublico(administrador) });
  });

  app.post("/api/usuarios/cadastro", async (requisicao, resposta) => {
    const { nome, email, senha } = requisicao.body || {};
    if (!nome || !email || !senha || String(senha).length < 6) return enviarErro(resposta, 400, "Nome, e-mail e senha com ao menos 6 caracteres são obrigatórios");
    const emailNormalizado = String(email).trim().toLowerCase();
    if (await prisma.usuario.findUnique({ where: { email: emailNormalizado } })) return enviarErro(resposta, 409, "E-mail já cadastrado");

    const usuario = await prisma.usuario.create({ data: { nome: String(nome).trim(), email: emailNormalizado, senha: await bcrypt.hash(String(senha), 12) } });
    await criarSessao(usuario, resposta);
    return resposta.status(201).json({ usuario: usuarioPublico(usuario) });
  });

  app.post("/api/usuarios/login", async (requisicao, resposta) => {
    const email = String(requisicao.body?.email || "").trim().toLowerCase();
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.ativo || !(await bcrypt.compare(String(requisicao.body?.senha || ""), usuario.senha))) return enviarErro(resposta, 401, "Credenciais inválidas");

    await criarSessao(usuario, resposta);
    return resposta.json({ usuario: usuarioPublico(usuario) });
  });

  app.post("/api/usuarios/logout", (_requisicao, resposta) => resposta.clearCookie(NOME_COOKIE).json({ success: true }));
  app.get("/api/usuarios/me", verificarLogin, (requisicao: RequisicaoAutenticada, resposta) => resposta.json({ usuario: usuarioPublico(requisicao.usuario!) }));
  app.get("/api/usuarios", verificarLogin, verificarAdministrador, async (_requisicao, resposta) => resposta.json((await prisma.usuario.findMany({ orderBy: { createdAt: "desc" } })).map(usuarioPublico)));

  app.get("/api/pacotes", async (_requisicao, resposta) => resposta.json((await prisma.pacote.findMany({ where: { disponivel: true }, orderBy: [{ destaque: "desc" }, { createdAt: "desc" }] })).map(pacotePublico)));
  app.get("/api/pacotes/admin", verificarLogin, verificarAdministrador, async (_requisicao, resposta) => resposta.json((await prisma.pacote.findMany({ orderBy: { createdAt: "desc" } })).map(pacotePublico)));

  app.post("/api/pacotes", verificarLogin, verificarAdministrador, async (requisicao, resposta) => {
    const pacote = normalizarPacote(requisicao.body || {});
    if (!pacoteValido(pacote)) return enviarErro(resposta, 400, "Dados do pacote inválidos");
    return resposta.status(201).json(pacotePublico(await prisma.pacote.create({ data: pacote })));
  });

  app.put("/api/pacotes/:id", verificarLogin, verificarAdministrador, async (requisicao, resposta) => {
    const pacote = normalizarPacote(requisicao.body || {});
    if (!pacoteValido(pacote)) return enviarErro(resposta, 400, "Dados do pacote inválidos");
    try {
      return resposta.json(pacotePublico(await prisma.pacote.update({ where: { id: Number(requisicao.params.id) }, data: pacote })));
    } catch {
      return enviarErro(resposta, 404, "Pacote não encontrado");
    }
  });

  app.delete("/api/pacotes/:id", verificarLogin, verificarAdministrador, async (requisicao, resposta) => {
    await prisma.pacote.update({ where: { id: Number(requisicao.params.id) }, data: { disponivel: false } }).catch(() => undefined);
    return resposta.json({ success: true });
  });

  app.get("/api/reservas", verificarLogin, async (requisicao: RequisicaoAutenticada, resposta) => {
    const filtro = requisicao.usuario!.tipo === "admin" ? undefined : { usuarioId: requisicao.usuario!.id };
    return resposta.json(await prisma.reserva.findMany({ where: filtro, orderBy: { dataReserva: "desc" } }));
  });

  app.post("/api/reservas", verificarLogin, async (requisicao: RequisicaoAutenticada, resposta) => {
    const { pacoteId, dataViagem, quantidadePessoas = 1, observacoes } = requisicao.body || {};
    if (!pacoteId || !dataViagem || Number(quantidadePessoas) < 1) return enviarErro(resposta, 400, "Pacote, data da viagem e quantidade são obrigatórios");
    const pacote = await prisma.pacote.findFirst({ where: { id: Number(pacoteId), disponivel: true } });
    if (!pacote) return enviarErro(resposta, 404, "Pacote indisponível");

    const reserva = await prisma.reserva.create({ data: { usuarioId: requisicao.usuario!.id, pacoteId: Number(pacoteId), dataViagem: new Date(dataViagem), quantidadePessoas: Number(quantidadePessoas), observacoes: observacoes ? String(observacoes) : null } });
    return resposta.status(201).json(reserva);
  });

  app.patch("/api/reservas/:id/status", verificarLogin, verificarAdministrador, async (requisicao, resposta) => {
    const status = ["pendente", "confirmada", "cancelada"].includes(requisicao.body?.status) ? requisicao.body.status : null;
    if (!status) return enviarErro(resposta, 400, "Status inválido");
    try {
      await prisma.reserva.update({ where: { id: Number(requisicao.params.id) }, data: { status } });
      return resposta.json({ success: true });
    } catch {
      return enviarErro(resposta, 404, "Reserva não encontrada");
    }
  });
}
