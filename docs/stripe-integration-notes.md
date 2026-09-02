# Notas de integração Stripe

A estrutura do checkout foi implementada como assinatura anual recorrente em modo `subscription`, com valor de 3700 centavos em BRL, equivalente a R$ 37,00.

Na validação real de uma sessão de teste, o Stripe retornou `Invalid currency: brl` e informou que a conta de teste atualmente aceita apenas ARS. Para vender em reais, é necessário ativar/configurar BRL na conta Stripe, incluindo uma conta bancária compatível, ou usar chaves de uma conta Stripe brasileira que aceite BRL. O código deve permanecer em BRL; não substituir silenciosamente o preço por ARS.

A sessão de checkout é criada no backend, com metadata do usuário, renovação anual e webhook assinado em `/api/stripe/webhook`. Nenhum dado de cartão é armazenado pela aplicação.
