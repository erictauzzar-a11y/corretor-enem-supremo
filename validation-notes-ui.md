
## Fluxo de compra validado

No preview local, a rota `/comprar` carregou com o plano anual de R$ 37/ano. O clique em `Criar conta e continuar` abriu corretamente o modal existente de autenticação, com Google, e-mail, senha, recuperação e alternância para cadastro. O checkout não foi chamado porque a sessão estava deslogada; isso evita executar cobrança sem credencial Stripe configurada.
