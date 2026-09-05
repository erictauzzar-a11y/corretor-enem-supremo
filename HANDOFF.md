# Handoff do AprovAI

## Estado atual

O projeto é um aplicativo full-stack React + Express + tRPC para correção de redações do ENEM. A marca pública atual é **AprovAI**. O código foi migrado do repositório `erictauzzar-a11y/corretor-enem-supremo` para o projeto administrado `corretor-enem-supremo-permanente`.

O preview atual é `https://3000-i860zltcc870b73k6gzcr-7644db92.us4.manus.computer/`. O projeto está preparado para publicação permanente, mas a ação **Publish** ainda precisa ser executada pela pessoa responsável na interface de gerenciamento.

## Funcionalidades implementadas

A aplicação possui cadastro e login com Supabase Auth, sessão persistente, login Google, correção de redação por texto e imagem com Gemini exclusivamente no backend, histórico isolado por usuário, geração de PDF, suporte contextual Jamily e interface responsiva com a marca AprovAI.

O modelo comercial é freemium. Toda pessoa precisa criar uma conta. O plano gratuito permite uma correção por texto, bloqueia imagem, PDF e análise pedagógica detalhada. O plano AprovAI pago libera correções ilimitadas por texto e imagem, PDF, histórico e análises pedagógicas completas.

O preço-alvo está centralizado em `server/products.ts` como `5390` centavos em BRL, com recorrência anual. A criação do novo Price em produção permanece como etapa final após a liberação da conta Stripe. O checkout é criado no backend em `server/billing.ts`, e o webhook assinado está registrado em `/api/stripe/webhook`. O sistema processa confirmação, assinatura ativa, cancelamento, falha de pagamento e checkout expirado.

## Variáveis e secrets

Nunca inserir chaves no GitHub, em `.env` versionado, no frontend ou em bundles. Gemini deve ser chamado somente no servidor. Os secrets administrados são `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY` e `VITE_APP_TITLE`.

O título público está configurado como `AprovAI`. O slug técnico `corretor-enem-supremo-permanente` foi mantido para não quebrar o projeto administrado.

## Banco e migrações

As tabelas do histórico no Supabase são `app_users`, `submissions` e `corrections`; elas já foram verificadas no projeto Supabase configurado. O banco interno do projeto contém a tabela de contas de cobrança com apenas identificadores Stripe e estado mínimo de acesso. Não armazenar números de cartão, CVV, payloads brutos de webhook ou chaves.

## Comandos de validação

```bash
pnpm test
pnpm check
pnpm build
```

Após a renomeação para AprovAI, a suíte passou com 22 testes, o typecheck passou e o build foi concluído. O build emite somente um aviso de tamanho de chunks JavaScript.

## Pendências conhecidas

A conta Stripe atualmente conectada ao ambiente de teste aceita ARS e rejeita BRL. O código deve continuar configurado em BRL para o preço de R$ 53,90; não converter silenciosamente para ARS. Quando o proprietário ativar BRL ou conectar uma conta brasileira, validar uma sessão de checkout e o webhook em modo de teste.

Também é necessário clicar em **Publish** para criar a URL HTTPS permanente. Depois, atualizar no Supabase a Site URL e as Redirect URLs para o domínio publicado e validar login, correção, histórico e PDF em produção.

## Continuidade segura

Antes de qualquer publicação, ler `todo.md`, executar os três comandos de validação e verificar `git diff` e `git status`. Não fazer reset destrutivo. Não commitar arquivos `.env`, chaves ou valores de secrets. Usar checkpoints do projeto antes de mudanças arriscadas.
