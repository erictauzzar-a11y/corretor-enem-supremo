# Project TODO

- [x] Migrar a interface educativa React existente para o projeto permanente
- [x] Migrar o backend Express/tRPC de correção por texto e imagem
- [x] Migrar a geração de relatórios em PDF
- [x] Configurar secrets de produção do Gemini exclusivamente no servidor
- [x] Configurar secrets de produção do Supabase sem expor a service role no navegador
- [x] Manter cadastro e login por e-mail e senha com Supabase Auth
- [x] Manter recuperação de senha e sessão persistente
- [x] Completar login com Google via Supabase Auth
- [x] Atualizar URLs de redirecionamento para o domínio do preview estável
  - Callback Google, Site URL e Redirect URL do preview estável configurados; domínio definitivo permanece adiado porque a publicação final não foi autorizada
- [x] Criar ou migrar o modelo de histórico de correções por usuário
- [x] Garantir isolamento do histórico por conta autenticada
- [x] Validar typecheck, testes e build de produção
- [x] Validar autenticação e persistência no preview de produção
  - Conta real `eric.tauzz.arck@gmail.com` validada no preview estável em 02/09/2026; o teste do domínio publicado permanece pendente
- [x] Validar correção por texto e imagem com Gemini
  - Correção de texto e imagem validadas com resposta 200 no preview
- [x] Validar geração e download de PDF
  - PDF A4 de 4 páginas baixado pelo navegador no preview estável em 02/09/2026
- [x] Criar checkpoint final antes da publicação
- [x] Registrar o endereço estável de desenvolvimento e adiar domínio próprio até a publicação autorizada

## Histórico de problemas

- [x] Diagnosticar e corrigir divergências entre o projeto fonte e o projeto permanente
- [x] Confirmar que nenhuma chave privada aparece no navegador, bundle ou repositório
- [x] Inspecionar o bundle público para garantir que secrets privados não foram incorporados
- [x] Comparar e validar os fluxos principais entre código sincronizado e preview estável

- [x] Manter o projeto em modo de desenvolvimento com preview acessível por link
- [x] Não publicar a versão definitiva enquanto a fase de testes não terminar

- [x] Continuar as validações ponta a ponta no preview sem publicar a versão definitiva
- [x] Corrigir e validar qualquer erro restante no login Google
- [x] Validar correção, histórico por conta e geração de PDF no preview

- [x] Atualizar o modelo Gemini indisponível para o modelo recomendado pelo gateway

- [x] Corrigir o redirect_uri_mismatch reproduzido no login Google do preview

- [x] Melhorar o design e a hierarquia visual do relatório PDF
- [x] Adicionar resumo visual, paginação e seções de estudo ao PDF
- [x] Validar o PDF aprimorado no preview e no arquivo gerado
  - Arquivo baixado no preview estável e identificado como originado do domínio estável

- [x] Corrigir a falha reportada na correção após a melhoria do PDF
- [x] Exibir a mensagem técnica real quando uma correção falhar no preview

- [x] Corrigir sobreposição de textos e blocos no PDF sem alterar a correção
- [x] Validar visualmente o PDF corrigido e o arquivo gerado

- [x] Criar botão de suporte contextual no site
- [x] Implementar chat Gemini restrito ao contexto do AprovAI
- [x] Recusar perguntas fora do escopo da plataforma
  - Guarda server-side determinística adicionada e testada
- [x] Validar suporte no frontend, endpoint, testes e build
  - Painel Jamily aberto no preview estável e resposta contextual sobre as cinco competências confirmada; endpoint, testes e build aprovados

- [x] Renomear o suporte contextual para Jamily na interface e no servidor

- [x] Reformular os textos estranhos do PDF para linguagem clara e natural
- [x] Simplificar a apresentação das competências e dos achados
- [x] Renderizar e revisar visualmente o PDF reformulado

- [x] Sincronizar todas as alterações do projeto com o repositório GitHub
- [x] Confirmar que nenhum segredo ou arquivo `.env` será enviado
- [x] Atualizar documentação para a próxima IA encontrar o estado atual

- [x] Exportar o commit local a968f44 para erictauzzar-a11y/corretor-enem-supremo na branch main usando o conector GitHub
  - O estado enviado inclui o histórico mesclado e está na descendência de a968f44

- [x] Corrigir novamente o `redirect_uri_mismatch` reproduzido no login Google
- [x] Reavaliar a interface que permaneceu em “Analisando sua redação...” durante uma chamada longa
  - O estado mudou para o resultado após o tempo normal da chamada Gemini; não houve reprodução consistente nem alteração de código necessária
- [x] Validar login Google e persistência de sessão diretamente na URL estável do preview após o retorno OAuth
- [x] Validar correção autenticada, histórico e download de PDF na URL estável do preview, não apenas em `localhost`
- [x] Reavaliar o item anterior sobre “Analisando sua redação...” com reprodução consistente e alteração de código comprovada antes de considerá-lo resolvido
- [x] Documentar o endereço estável atual do preview e escrever instruções objetivas para futura configuração de domínio próprio/publicação autorizada
- [x] Executar uma comparação explícita entre o repositório sincronizado e o preview estável, registrando divergências encontradas e correções aplicadas
- [x] Validar os fluxos principais lado a lado entre o código sincronizado e o preview estável, com evidências de login, correção, histórico, PDF e suporte
- [x] Confirmar no navegador uma resposta completa da Jamily no frontend e uma recusa fora de escopo
- [x] Validar no navegador a renderização completa de uma resposta da Jamily para pergunta dentro do escopo e registrar evidência direta no frontend
  - Captura direta: `screenshots/3000-iklen2qnt7dm3wl_2026-09-02_12-57-04_1945.webp`
- [x] Validar no navegador a renderização da recusa fora de escopo da Jamily e então revalidar o fluxo principal de suporte no preview estável
  - A mesma captura direta mostra a pergunta sobre previsão do tempo e a recusa contextual renderizada
- [x] Sincronizar novamente todas as alterações atuais com `erictauzzar-a11y/corretor-enem-supremo` na branch `main` e confirmar o commit remoto
- [x] Commitar as alterações pendentes atuais e fazer push para `erictauzzar-a11y/corretor-enem-supremo` na branch `main`
- [x] Confirmar a sincronização final comparando o SHA local com o SHA remoto de `main` e registrar a evidência no projeto
- [x] Só considerar a sincronização concluída após `git status` ficar limpo e o GitHub remoto refletir o commit mais recente
- [x] Executar `git status --short` após o último commit/push e garantir árvore limpa
- [x] Commitar e enviar quaisquer alterações feitas após `91bfecc` para `erictauzzar-a11y/corretor-enem-supremo` na branch `main`
- [x] Confirmar novamente a sincronização final comparando o SHA local atualizado com o SHA remoto de `main` e só então marcar a conclusão

## Migración al proyecto publicable actual

- [x] Migrar el código actual del repositorio GitHub al proyecto full-stack permanente
- [x] Configurar GEMINI_API_KEY en secrets del proyecto
- [x] Configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en secrets del proyecto
- [x] Configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en secrets del proyecto
- [x] Verificar endpoints de Gemini y Supabase con las credenciales configuradas
- [x] Confirmar que app_users, submissions y corrections existen en Supabase
- [x] Ejecutar typecheck y 14 pruebas automatizadas en el proyecto migrado
- [x] Validar visualmente el preview del proyecto migrado
- [ ] Crear checkpoint final del proyecto migrado
- [ ] Publicar el proyecto mediante la acción Publish de la interfaz
- [ ] Configurar Site URL y Redirect URLs con el dominio permanente publicado
- [ ] Validar autenticación, corrección, historial y PDF en producción

## Venda da plataforma — assinatura anual

- [x] Definir a oferta anual do AprovAI por R$ 37,00
- [x] Adicionar área de compra e apresentação da oferta no site
  - Oferta visual validada no preview; imagem bloqueada para contas sem plano e CTA anual exibido
- [x] Configurar integração de pagamentos com checkout seguro
- [ ] Criar produto/preço anual em modo de teste
- [x] Implementar criação de checkout vinculada ao usuário autenticado
- [x] Processar confirmação por webhook assinado
- [x] Liberar acesso somente após pagamento confirmado
- [x] Controlar acesso enquanto a assinatura estiver ativa
- [x] Tratar cancelamento, expiração e falha de pagamento
- [x] Adicionar testes Vitest para checkout, webhook e autorização
  - 21 testes aprovados, incluindo parâmetros de checkout, webhook assinado, política freemium e sanitização premium
- [ ] Validar a experiência de compra em ambiente de teste
- [x] Configurar secrets de pagamento fora do código e do GitHub
- [ ] Criar checkpoint da estrutura comercial antes da publicação

## Regras confirmadas do modelo freemium

- [x] Exigir criação de conta e autenticação para usar qualquer modalidade
- [x] Liberar exatamente uma correção gratuita por texto para cada conta elegível
- [x] Bloquear correção gratuita por imagem
- [x] Bloquear PDF e análises pedagógicas no plano gratuito
- [x] Criar plano pago anual de R$ 37,00 com renovação automática
- [x] Liberar correção por texto e imagem, PDF, análises pedagógicas, histórico e suporte no plano pago
- [x] Remover o limite de correções enquanto a assinatura paga estiver ativa
- [x] Manter o histórico isolado por usuário em ambas as modalidades

## Bloqueio operacional encontrado no Stripe

- [ ] Ativar suporte a BRL na conta Stripe de teste ou configurar chaves de uma conta brasileira
- [ ] Validar uma sessão real de checkout em BRL sem concluir cobrança
- [ ] Confirmar webhook de assinatura no ambiente Stripe com BRL habilitado

Observação: a conta Stripe conectada ao ambiente atual retornou que aceita apenas ARS. O produto permanece corretamente configurado em BRL por R$ 37,00; não foi feita conversão silenciosa para outra moeda.

## Renomeação da marca para AprovAI

- [x] Substituir a marca Corretor ENEM Supremo por AprovAI na interface
- [x] Atualizar título, nome do produto, checkout e mensagens do suporte
- [x] Atualizar textos públicos, documentação e metadados sem alterar secrets
  - O slug técnico `corretor-enem-supremo-permanente` foi preservado para não quebrar o projeto administrado; o nome público está como AprovAI
- [x] Atualizar VITE_APP_TITLE para AprovAI
- [x] Verificar que a marca antiga não permanece em arquivos ativos
- [x] Executar testes, typecheck e build após a renomeação
- [x] Validar visualmente o preview com a marca AprovAI
- [x] Criar checkpoint da renomeação

## Handoff e sincronização final com GitHub

- [x] Criar documentação objetiva para a próxima pessoa ou IA continuar o projeto AprovAI
- [x] Revisar arquivos sensíveis e confirmar que nenhum secret será enviado
- [x] Validar testes, typecheck e build antes do commit
- [x] Commitar o estado atual na branch main
- [x] Enviar o commit para erictauzzar-a11y/corretor-enem-supremo
- [x] Confirmar que o SHA local e o SHA remoto são iguais
- [x] Confirmar que a árvore local ficou limpa após o push
