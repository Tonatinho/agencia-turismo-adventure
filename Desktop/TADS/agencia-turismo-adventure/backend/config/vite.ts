import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";
import { createServer as criarServidorVite } from "vite";
import configuracaoVite from "../../vite.config";

/** Configura o Vite para entregar o React durante o desenvolvimento. */
export async function configurarVite(app: Express, servidor: Server) {
  const vite = await criarServidorVite({
    ...configuracaoVite,
    configFile: false,
    server: { middlewareMode: true, hmr: { server: servidor } },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (requisicao, resposta, proximo) => {
    try {
      const caminhoHtml = path.resolve(import.meta.dirname, "../..", "frontend", "index.html");
      const modelo = await fs.promises.readFile(caminhoHtml, "utf-8");
      const pagina = await vite.transformIndexHtml(requisicao.originalUrl, modelo);
      resposta.status(200).type("html").end(pagina);
    } catch (erro) {
      vite.ssrFixStacktrace(erro as Error);
      proximo(erro);
    }
  });
}

/** Entrega os arquivos gerados pelo React quando o projeto está em produção. */
export function servirArquivos(app: Express) {
  const pastaPublica = path.resolve(import.meta.dirname, "../..", "dist", "public");
  app.use(express.static(pastaPublica));
  app.use("*", (_requisicao, resposta) => resposta.sendFile(path.join(pastaPublica, "index.html")));
}
