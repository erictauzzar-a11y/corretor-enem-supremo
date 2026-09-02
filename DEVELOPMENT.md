# Guia de continuidade — AprovAI

## Estado atual

O projeto é uma aplicação React + Vite no cliente e Express + tRPC no servidor. O preview de desenvolvimento está disponível em:

https://3000-iklen2qnt7dm3wl0tbehq-6b5986f0.us4.manus.computer/

A versão definitiva ainda não foi publicada.

## Funcionalidades implementadas

- Correção de redação por texto e por imagem usando Gemini no servidor.
- Transcrição separada da avaliação para imagens manuscritas.
- Persistência do histórico por usuário autenticado no Supabase.
- Cadastro, login, recuperação de senha e sessão persistente com Supabase Auth.
- Login Google integrado no cliente e no servidor; a configuração OAuth ainda depende de corrigir o `redirect_uri_mismatch` no Google Cloud.
- Relatório PDF editorial com capa, nota, competências, evidências, proposta de intervenção, checklist, parecer e paginação dinâmica.
- Assistente Jamily com botão flutuante e endpoint `support.ask`.
- Jamily responde apenas sobre o produto, redação do ENEM, autenticação, histórico e PDF. Há uma guarda determinística server-side para recusar perguntas fora desse escopo.

## Arquivos principais

- `client/src/pages/Home.tsx`: interface de correção, histórico e integração do PDF.
- `client/src/components/AuthDialog.tsx`: cadastro, login, recuperação e Google.
- `client/src/components/SupportChat.tsx`: interface da Jamily.
- `client/src/lib/supabase.ts`: cliente público Supabase; nunca adicionar service role ao cliente.
- `client/src/lib/pdf.ts`: gerador do relatório PDF.
- `server/routers.ts`: contratos tRPC, correção Gemini e suporte Jamily.
- `server/supabase.ts`: validação de sessão e persistência do histórico.
- `server/support.test.ts`: testes de limites e escopo da Jamily.
- `todo.md`: histórico de tarefas e pendências.

## Variáveis de ambiente

Os nomes usados pelo projeto são `GEMINI_API_KEY`, `GEMINI_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Os valores devem ser configurados pelo gerenciador seguro do ambiente. Não criar ou versionar arquivos de ambiente com valores reais.

## Validação

Os comandos principais são:

```bash
pnpm check
pnpm test
pnpm build
```

O modelo Gemini atualmente configurado é o modelo recomendado pelo gateway e as correções de texto e imagem foram validadas no preview. O PDF final foi gerado e renderizado sem sobreposição.

## Pendência conhecida

Para finalizar o Google OAuth, cadastrar no OAuth Client do Google Cloud, em `Authorized redirect URIs`, exatamente:

```text
https://rqfgtxubpuxgmsvffkoy.supabase.co/auth/v1/callback
```

Essa URL é diferente da URL do preview. Depois, atualizar a lista de URLs permitidas do Supabase quando existir um domínio permanente.
