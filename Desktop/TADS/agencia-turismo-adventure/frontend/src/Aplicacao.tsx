import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Inicio from "./paginas/Inicio";
import Entrar from "./paginas/Entrar";
import Administracao from "./paginas/Administracao";
import NaoEncontrado from "./paginas/NaoEncontrado";

export default function Aplicacao() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Entrar />} />
        <Route path="/admin" element={<Administracao />} />
        <Route path="/404" element={<NaoEncontrado />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
