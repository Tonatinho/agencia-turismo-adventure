import { createRoot } from "react-dom/client";
import Aplicacao from "./Aplicacao";
import "./estilos.css";

/** Monta a aplicação React no elemento principal da página. */
createRoot(document.getElementById("root")!).render(<Aplicacao />);
