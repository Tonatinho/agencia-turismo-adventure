# Agência de Turismo Adventure

Projeto acadêmico de uma agência de turismo. O sistema permite cadastrar usuários, visualizar pacotes, solicitar reservas e administrar os pacotes cadastrados.

## Tecnologias

- React e Vite no frontend
- Node.js e Express no backend
- Prisma e MySQL no banco de dados

## Estrutura

```text
frontend/   telas e estilos do React
backend/    servidor Express, rotas e conexão com o banco
prisma/     modelo e migrações do banco de dados
infra/      arquivos opcionais para Docker
```

## Como executar

1. Crie um arquivo `.env` com `DATABASE_URL` e, se desejar, `JWT_SECRET`.
2. Execute `npm install`.
3. Execute `npm run prisma:generate`.
4. Execute `npm run prisma:migrate` para criar as tabelas.
5. Execute `npm run dev`.

O site ficará disponível em `http://localhost:3000`.

## Primeiro administrador

Faça uma requisição para `GET /api/usuarios/setup` uma vez. Ela cria o administrador padrão. As variáveis `ADMIN_DEFAULT_EMAIL` e `ADMIN_DEFAULT_PASSWORD` permitem alterar os dados iniciais.
