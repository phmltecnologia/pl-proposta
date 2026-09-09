# React + Vite

## Assinatura eletrônica

O editor pode criar links públicos de assinatura para os dois modelos de documento. O fluxo usa funções da Vercel e o Supabase para guardar o snapshot congelado da proposta e os artefatos assinados.

### Configuração do Supabase

1. Crie um projeto no Supabase.
2. Execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor.
3. Configure na Vercel (e no ambiente local, se necessário):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

A chave `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente nas variáveis de ambiente do servidor. O bucket `signature-artifacts` é privado e os PDFs assinados são entregues pela API após a validação do token.

O link expira às 23:59:59 do dia em que foi criado, no horário de Brasília. A assinatura implementada é eletrônica simples; não substitui uma assinatura certificada por uma plataforma especializada ou ICP-Brasil.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
