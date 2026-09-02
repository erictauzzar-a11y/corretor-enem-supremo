# Project TODO

- [x] Migrar a interface educativa React existente para o projeto permanente
- [x] Migrar o backend Express/tRPC de correção por texto e imagem
- [x] Migrar a geração de relatórios em PDF
- [x] Configurar secrets de produção do Gemini exclusivamente no servidor
- [x] Configurar secrets de produção do Supabase sem expor a service role no navegador
- [x] Manter cadastro e login por e-mail e senha com Supabase Auth
- [x] Manter recuperação de senha e sessão persistente
- [ ] Completar login com Google via Supabase Auth
- [ ] Atualizar URLs de redirecionamento para o domínio permanente
  - O callback Supabase está configurado; o domínio final só existe após publicação
- [x] Criar ou migrar o modelo de histórico de correções por usuário
- [x] Garantir isolamento do histórico por conta autenticada
- [x] Validar typecheck, testes e build de produção
- [ ] Validar autenticação e persistência no preview de produção
  - Requer teste com uma conta real após o primeiro publish
- [x] Validar correção por texto e imagem com Gemini
  - Correção de texto e imagem validadas com resposta 200 no preview
- [ ] Validar geração e download de PDF
  - Geração e renderização validadas; download pelo navegador após a última correção requer confirmação manual
- [x] Criar checkpoint final antes da publicação
- [ ] Entregar endereço permanente e instruções de domínio próprio

## Histórico de problemas

- [ ] Diagnosticar e corrigir qualquer divergência entre o projeto fonte e o projeto permanente
- [x] Confirmar que nenhuma chave privada aparece no navegador, bundle ou repositório
- [x] Inspecionar o bundle público para garantir que secrets privados não foram incorporados
- [ ] Comparar e validar os fluxos principais entre fonte e produção

- [x] Manter o projeto em modo de desenvolvimento com preview acessível por link
- [x] Não publicar a versão definitiva enquanto a fase de testes não terminar

- [ ] Continuar as validações ponta a ponta no preview sem publicar a versão definitiva
- [ ] Corrigir e validar qualquer erro restante no login Google
- [ ] Validar correção, histórico por conta e geração de PDF no preview

- [x] Atualizar o modelo Gemini indisponível para o modelo recomendado pelo gateway

- [ ] Corrigir o redirect_uri_mismatch reproduzido no login Google do preview

- [x] Melhorar o design e a hierarquia visual do relatório PDF
- [x] Adicionar resumo visual, paginação e seções de estudo ao PDF
- [ ] Validar o PDF aprimorado no preview e no arquivo gerado
  - Arquivo final validado e renderizado; confirmação no preview após a última correção requer teste manual

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
