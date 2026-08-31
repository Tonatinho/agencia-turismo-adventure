import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from "node:http";
import { registrarRotas } from "./rotas/api";
import { configurarVite, servirArquivos } from "./config/vite";

async function iniciarServidor() {
  const app = express();
  const servidor = createServer(app);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  registrarRotas(app);

  if (process.env.NODE_ENV === "development") await configurarVite(app, servidor);
  else servirArquivos(app);

  const porta = Number(process.env.PORT || 3000);
  servidor.listen(porta, () => console.log(`Servidor disponível em http://localhost:${porta}`));
}

iniciarServidor().catch((erro) => console.error("Não foi possível iniciar o servidor:", erro));
