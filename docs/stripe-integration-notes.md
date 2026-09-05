# Notas de integração Stripe

A estrutura do checkout usa assinatura anual recorrente em modo `subscription`, com 5390 centavos em BRL, equivalente a R$ 53,90. O Price de produção foi criado no Stripe com ID `price_1UC9OAGx475CvFbvIMGq9f0u`, e o checkout usa esse ID diretamente.

A conta de produção autorizada possui BRL habilitado para este preço. Ainda falta validar uma sessão de checkout sem concluir cobrança e confirmar o webhook assinado em produção. O código permanece em BRL e não converte silenciosamente o valor para outra moeda.

A sessão de checkout é criada no backend, com metadata do usuário, renovação anual e webhook assinado em `/api/stripe/webhook`. Nenhum dado de cartão é armazenado pela aplicação.
