# Mapeamento do prompt do AprovaAI

## Já existente e será reutilizado

A autenticação Supabase, o cadastro/login, a sessão do aluno, o histórico de correções, a correção por Gemini, a análise das cinco competências, o parecer pedagógico, a intervenção, o PDF, o chat de suporte e a estrutura de cobrança anual já existem no projeto. A Stripe permanece desacoplada e fora da implementação atual.

## Lacunas prioritárias que podem funcionar com os dados atuais

A página principal ainda concentra envio, plano, resultado e histórico. O prompt pede uma experiência de treinador pessoal. A primeira camada funcional será um painel autenticado com última nota, melhor nota, média, quantidade de redações, evolução desde a primeira redação, gráfico de notas e principal competência de atenção, usando os registros reais do endpoint `correction.history`.

A segunda camada será separar a experiência em rotas para painel, nova redação/resultado e minhas redações. A terceira será enriquecer o resultado com pontos positivos, pontos a melhorar e recomendações baseadas no retorno que o Gemini já gera. O plano de evolução, treinamentos, desafios, metas, tutor contextualizado, OCR/PDF de entrada, WhatsApp e administração exigem novos campos, endpoints ou configurações externas; serão preparados em etapas, sem inventar dados ou afirmar integrações inexistentes.

## Restrições de segurança

Nenhuma chave secreta pode chegar ao frontend. O isolamento por usuário deve continuar sendo aplicado pelo servidor ao consultar o Supabase. WhatsApp e Stripe não serão chamados sem credenciais e webhooks configurados.
