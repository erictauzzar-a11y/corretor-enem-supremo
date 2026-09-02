# Project TODO

- [x] Migrar a interface educativa React existente para o projeto permanente
- [x] Migrar o backend Express/tRPC de correção por texto e imagem
- [x] Migrar a geração de relatórios em PDF
- [x] Configurar secrets de produção do Gemini exclusivamente no servidor
- [x] Configurar secrets de produção do Supabase sem expor a service role no navegador
- [x] Manter cadastro e login por e-mail e senha com Supabase Auth
- [x] Manter recuperação de senha e sessão persistente
- [x] Completar login com Google via Supabase Auth
- [ ] Atualizar URLs de redirecionamento para o domínio permanente
  - O callback Supabase está configurado; o domínio final só existe após publicação
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
- [ ] Entregar endereço permanente e instruções de domínio próprio

## Histórico de problemas

- [ ] Diagnosticar e corrigir qualquer divergência entre o projeto fonte e o projeto permanente
- [x] Confirmar que nenhuma chave privada aparece no navegador, bundle ou repositório
- [x] Inspecionar o bundle público para garantir que secrets privados não foram incorporados
- [ ] Comparar e validar os fluxos principais entre fonte e produção

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
- [x] Implementar chat Gemini restrito ao contexto do Corretor ENEM Supremo
- [x] Recusar perguntas fora do escopo da plataforma
  - Guarda server-side determinística adicionada e testada
- [ ] Validar suporte no frontend, endpoint, testes e build
  - Endpoint, testes e build validados; interação manual no navegador permanece para confirmação

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
