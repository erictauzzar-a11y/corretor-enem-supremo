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
- [ ] Validar correção por texto e imagem com Gemini
  - Requer execução ponta a ponta no preview publicado
- [ ] Validar geração e download de PDF
  - Requer uma correção concluída no preview publicado
- [ ] Criar checkpoint final antes da publicação
- [ ] Entregar endereço permanente e instruções de domínio próprio

## Histórico de problemas

- [ ] Diagnosticar e corrigir qualquer divergência entre o projeto fonte e o projeto permanente
- [ ] Confirmar que nenhuma chave privada aparece no navegador, bundle ou repositório
- [x] Inspecionar o bundle público para garantir que secrets privados não foram incorporados
- [ ] Comparar e validar os fluxos principais entre fonte e produção
