import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, Pacote, Reserva, Usuario } from "@/servicos/api";

const formularioVazio = { titulo: "", descricao: "", destino: "", preco: "", duracaoDias: 1, imagem: "", destaque: false };

/** Permite ao administrador cadastrar pacotes e acompanhar reservas. */
export default function Administracao() {
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [mensagem, setMensagem] = useState("");

  /** Carrega os dados do painel e impede o acesso de usuários comuns. */
  useEffect(() => {
    api.usuarioAtual().then(({ usuario: atual }) => {
      if (atual.tipo !== "admin") return navegar("/");
      setUsuario(atual);
      api.listarPacotesAdmin().then(setPacotes);
      api.listarReservas().then(setReservas);
    }).catch(() => navegar("/login"));
  }, [navegar]);

  /** Salva um novo pacote usando os campos preenchidos no formulário. */
  async function salvarPacote(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    try {
      const pacote = await api.criarPacote(formulario);
      setPacotes((lista) => [pacote, ...lista]);
      setFormulario(formularioVazio);
      setMensagem("Pacote cadastrado com sucesso.");
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : "Não foi possível salvar o pacote.");
    }
  }

  /** Altera o status de uma reserva escolhida pelo administrador. */
  async function mudarStatus(id: number, status: Reserva["status"]) {
    await api.atualizarStatusReserva(id, status);
    setReservas((lista) => lista.map((reserva) => reserva.id === id ? { ...reserva, status } : reserva));
  }

  /** Arquiva um pacote para que ele não apareça mais na vitrine. */
  async function arquivarPacote(id: number) {
    if (!confirm("Arquivar este pacote?")) return;
    await api.arquivarPacote(id);
    setPacotes((lista) => lista.filter((pacote) => pacote.id !== id));
  }

  if (!usuario) return <main className="loading-screen">Carregando painel...</main>;

  return <main className="admin-main"><header className="admin-topbar"><div><Link className="back-link" to="/">← Voltar para a vitrine</Link><h1>Painel administrativo</h1><p>Olá, {usuario.nome}.</p></div><button className="button dark" onClick={async () => { await api.sair(); navegar("/"); }}>Sair</button></header><div className="admin-content"><section className="admin-section"><h2>Novo pacote</h2><form onSubmit={salvarPacote} className="booking-form"><label>Título<input value={formulario.titulo} onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })} required /></label><label>Destino<input value={formulario.destino} onChange={(evento) => setFormulario({ ...formulario, destino: evento.target.value })} required /></label><label>Preço<input type="number" min="1" step="0.01" value={formulario.preco} onChange={(evento) => setFormulario({ ...formulario, preco: evento.target.value })} required /></label><label>Duração em dias<input type="number" min="1" value={formulario.duracaoDias} onChange={(evento) => setFormulario({ ...formulario, duracaoDias: Number(evento.target.value) })} required /></label><label>Imagem (URL)<input value={formulario.imagem} onChange={(evento) => setFormulario({ ...formulario, imagem: evento.target.value })} /></label><label>Descrição<textarea value={formulario.descricao} onChange={(evento) => setFormulario({ ...formulario, descricao: evento.target.value })} required /></label><label className="check-label"><input type="checkbox" checked={formulario.destaque} onChange={(evento) => setFormulario({ ...formulario, destaque: evento.target.checked })} /> Destacar na página inicial</label><button className="button primary" type="submit">Salvar pacote</button></form>{mensagem && <p className="notice">{mensagem}</p>}</section><section className="admin-section"><h2>Pacotes cadastrados</h2><div className="booking-list">{pacotes.map((pacote) => <div className="booking-row" key={pacote.id}><div><strong>{pacote.titulo}</strong><small>{pacote.destino} · R$ {Number(pacote.preco).toFixed(2)}</small></div><button onClick={() => arquivarPacote(pacote.id)}>Arquivar</button></div>)}</div></section><section className="admin-section"><h2>Reservas</h2><div className="booking-list">{reservas.map((reserva) => <div className="booking-row" key={reserva.id}><div><strong>Reserva #{reserva.id}</strong><small>{new Date(reserva.dataViagem).toLocaleDateString("pt-BR")} · {reserva.quantidadePessoas} pessoa(s)</small></div><select value={reserva.status} onChange={(evento) => mudarStatus(reserva.id, evento.target.value as Reserva["status"])}><option value="pendente">Pendente</option><option value="confirmada">Confirmada</option><option value="cancelada">Cancelada</option></select></div>)}</div></section></div></main>;
}
