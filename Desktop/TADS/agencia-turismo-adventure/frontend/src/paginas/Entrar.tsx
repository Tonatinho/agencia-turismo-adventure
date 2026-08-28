import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { api } from "@/servicos/api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Envia os dados de login ou cadastro conforme a opção escolhida. */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      const result = mode === "login" ? await api.entrar(String(data.get("email")), String(data.get("senha"))) : await api.cadastrar(String(data.get("nome")), String(data.get("email")), String(data.get("senha")));
      navigate(result.usuario.tipo === "admin" ? "/admin" : "/");
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível concluir."); } finally { setLoading(false); }
  }

  return <div className="auth-page"><div className="auth-visual"><Link className="brand auth-brand" to="/"><span className="brand-mark"><Compass size={19} /></span>adventure<span className="brand-dot">.</span></Link><div className="auth-visual-copy"><div className="eyebrow light">o mundo espera</div><h1>Entre para<br /><em>ir mais longe.</em></h1><p>Salve seus roteiros, acompanhe reservas e conte com nosso time em cada passo.</p></div><span className="auth-coordinate">46° 33' S · 72° 39' W</span></div><div className="auth-form-wrap"><Link className="back-link" to="/"><ArrowLeft size={16} /> Voltar para a vitrine</Link><div className="auth-card"><div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Entrar</button><button className={mode === "cadastro" ? "active" : ""} onClick={() => setMode("cadastro")}>Criar conta</button></div><h2>{mode === "login" ? "Bem-vindo de volta." : "Comece sua jornada."}</h2><p className="auth-subtitle">{mode === "login" ? "Acesse sua área de viajante." : "Uma conta simples para uma viagem memorável."}</p><form onSubmit={submit} className="auth-form">{mode === "cadastro" && <label><span><UserRound size={15} /> Nome completo</span><input name="nome" placeholder="Como podemos te chamar?" required /></label>}<label><span><Mail size={15} /> E-mail</span><input name="email" type="email" placeholder="voce@email.com" required /></label><label><span><LockKeyhole size={15} /> Senha</span><div className="password-field"><input name="senha" type={showPassword ? "text" : "password"} placeholder="Mínimo de 6 caracteres" minLength={6} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <div className="form-error">{error}</div>}<button className="button primary full" type="submit" disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar na minha conta" : "Criar minha conta"}<ArrowRight size={17} /></button></form><div className="auth-note">Ao continuar, você concorda com nosso jeito simples e transparente de viajar.</div></div></div></div>;
}
