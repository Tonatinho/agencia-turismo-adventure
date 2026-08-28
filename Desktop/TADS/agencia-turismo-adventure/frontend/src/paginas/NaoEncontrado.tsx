import { Link } from "react-router-dom";

/** Mostra uma mensagem simples quando a página solicitada não existe. */
export default function NaoEncontrado() {
  return <main className="loading-screen"><div><h1>404</h1><p>Esta página não foi encontrada.</p><Link className="button primary" to="/">Voltar ao início</Link></div></main>;
}
