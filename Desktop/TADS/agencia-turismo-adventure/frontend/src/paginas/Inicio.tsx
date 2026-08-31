import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, Compass, LogIn, MapPin, Menu, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { api, Pacote, Usuario } from "@/servicos/api";

const fallbackImages = ["https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=85"];

export default function Home() {
  const [packages, setPackages] = useState<Pacote[]>([]);
  const [user, setUser] = useState<Usuario | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Pacote | null>(null);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.listarPacotes().then(setPackages).catch(() => setNotice("Não foi possível carregar os pacotes agora."));
    api.usuarioAtual().then((result) => setUser(result.usuario)).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => packages.filter((item) => `${item.titulo} ${item.destino}`.toLowerCase().includes(query.toLowerCase())), [packages, query]);
  const featured = filtered.filter((item) => item.destaque).slice(0, 3);
  const visible = featured.length ? featured : filtered.slice(0, 6);

  async function reserve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) { setNotice("Entre na sua conta para solicitar uma reserva."); return; }
    const data = new FormData(event.currentTarget);
    try {
      await api.criarReserva({ pacoteId: selected!.id, dataViagem: String(data.get("dataViagem")), quantidadePessoas: Number(data.get("quantidadePessoas")), observacoes: String(data.get("observacoes") || "") });
      setSelected(null); setNotice("Solicitação recebida. Nossa equipe confirmará os próximos passos.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível reservar."); }
  }

  return <div className="adventure-shell">
    <header className="site-header">
      <Link className="brand" to="/"><span className="brand-mark"><Compass size={19} /></span><span>adventure<span className="brand-dot">.</span></span></Link>
      <nav className={menuOpen ? "site-nav open" : "site-nav"}>
        <a href="#experiencias">Experiências</a><a href="#manifesto">Nossa curadoria</a><a href="#contato">Fale conosco</a>
        {user?.tipo === "admin" && <Link to="/admin">Painel</Link>}
        {!user ? <Link className="nav-login" to="/login"><LogIn size={15} /> Entrar</Link> : <button className="nav-user" onClick={async () => { await api.sair(); setUser(null); }}>Olá, {user.nome.split(" ")[0]}</button>}
      </nav>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> viagens com intenção</div>
          <h1>O mundo é grande.<br /><em>Viva mais longe.</em></h1>
          <p>Roteiros que transformam paisagens em histórias — com curadoria local, ritmo humano e espaço para o inesperado.</p>
          <div className="hero-actions"><a className="button primary" href="#experiencias">Explorar destinos <ArrowRight size={17} /></a><a className="text-link" href="#manifesto">Por que Adventure? <span>↗</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>AM</span><span>JP</span><span>LC</span></div><span>+2.400 viajantes<br /><strong>já foram mais longe</strong></span></div>
        </div>
        <div className="hero-visual"><div className="hero-photo"><img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=90" alt="Montanhas ao pôr do sol" /></div><div className="hero-card"><span>próxima saída</span><strong>Patagônia<br />Essencial</strong><small>12 — 20 NOV, 2026</small><ArrowRight size={18} /></div><div className="hero-stamp">feito para<br /><b>lembrar</b></div></div>
      </section>

      <section className="experience-section" id="experiencias">
        <div className="section-heading"><div><div className="eyebrow">seleção adventure</div><h2>Escolha a sua <em>próxima história.</em></h2></div><div className="search-wrap"><MapPin size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar destino..." /></div></div>
        {notice && <div className="notice"><Check size={16} /> {notice}</div>}
        <div className="package-grid">{visible.map((item, index) => <article className="package-card" key={item.id}><div className="package-image"><img src={item.imagem || fallbackImages[index % fallbackImages.length]} alt={item.titulo} />{item.destaque ? <span className="card-badge">curadoria da casa</span> : null}<button className="round-arrow" onClick={() => setSelected(item)} aria-label={`Reservar ${item.titulo}`}><ArrowRight size={18} /></button></div><div className="package-meta"><span>{item.destino}</span><span>{item.duracaoDias} dias</span></div><h3>{item.titulo}</h3><p>{item.descricao}</p><div className="package-bottom"><strong>R$ {Number(item.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong><button onClick={() => setSelected(item)}>Ver roteiro</button></div></article>)}</div>
        {!visible.length && <div className="empty-state"><div className="empty-route"><span>ROTA 01</span><i></i><span>36° 46' S</span></div><div className="empty-compass"><Compass size={31} /></div><div><div className="eyebrow">caderno de campo · em breve</div><h3>Estamos preparando<br /><em>o próximo horizonte.</em></h3><p>Nosso time está desenhando roteiros com o tempo e o cuidado que eles merecem. Enquanto isso, conte para onde você quer ir.</p><a className="text-link ink-link" href="#contato">Falar com um curador <span>↗</span></a></div><div className="empty-coordinates">— 52° 31' S · 13° 24' E —<br /><b>destinos em curadoria</b></div></div>}
      </section>

      <section className="manifesto-section" id="manifesto"><div className="manifesto-number">01</div><div className="manifesto-copy"><div className="eyebrow">o jeito adventure</div><h2>Menos turismo.<br /><em>Mais encontro.</em></h2><p>Não acreditamos em viagens de checklist. A gente acredita em acordar cedo por uma vista, aprender o nome de quem prepara o almoço e voltar para casa com uma versão nova de você.</p><Link className="button dark" to="/login">Conheça nosso jeito <ArrowRight size={17} /></Link></div><div className="manifesto-aside"><div className="aside-line"></div><strong>Curadoria local</strong><span>Guias que chamam o destino de casa.</span><div className="aside-line"></div><strong>Grupos pequenos</strong><span>Mais presença. Menos pressa.</span></div></section>
      <section className="trust-strip"><div><ShieldCheck size={20} /><span>Compra segura<br /><b>e transparente</b></span></div><div><Users size={20} /><span>Grupos de até<br /><b>12 pessoas</b></span></div><div><CalendarDays size={20} /><span>Datas flexíveis<br /><b>e suporte humano</b></span></div></section>
    </main>
    <footer id="contato" className="site-footer"><div className="brand">adventure<span className="brand-dot">.</span></div><p>Viagens para quem quer estar presente.</p><span>© 2026 Adventure Turismo</span></footer>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="booking-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button><div className="eyebrow">solicitar reserva</div><h2>{selected.titulo}</h2><p>{selected.destino} · {selected.duracaoDias} dias · R$ {Number(selected.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>{!user ? <div className="login-prompt"><p>Crie sua conta ou entre para continuar com a reserva.</p><Link className="button primary" to="/login">Entrar ou cadastrar <ArrowRight size={16} /></Link></div> : <form onSubmit={reserve} className="booking-form"><label>Data desejada<input name="dataViagem" type="date" required /></label><label>Viajantes<input name="quantidadePessoas" type="number" min="1" max="12" defaultValue="2" required /></label><label>Alguma observação? <textarea name="observacoes" placeholder="Conte algo importante para o nosso time..." /></label><button className="button primary" type="submit">Solicitar reserva <ArrowRight size={16} /></button></form>}</div></div>}
  </div>;
}
