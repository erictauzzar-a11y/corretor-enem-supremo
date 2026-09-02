# Endereço e domínio do AprovAI

## Estado atual

O projeto permanece em **modo desenvolvedor**, sem publicação definitiva. O preview estável atualmente disponível é:

> https://3000-iklen2qnt7dm3wl0tbehq-6b5986f0.us4.manus.computer

Esse endereço é o ponto de teste para login Google, correção, histórico, suporte Jamily e download dos relatórios PDF. O Supabase Auth está configurado com esse endereço como **Site URL** e como **Redirect URL** permitido.

## Como publicar futuramente

A publicação definitiva deve ser feita somente quando o proprietário autorizar a mudança de fase. No painel do projeto, crie um checkpoint atualizado e use o botão **Publish** da interface de gerenciamento. Este trabalho não publica a aplicação.

Depois que o domínio publicado existir, substitua o Site URL do Supabase pelo domínio definitivo e mantenha o preview estável na lista de Redirect URLs enquanto os testes continuarem. Adicione também o domínio definitivo à lista de Redirect URLs do Supabase Auth.

## Como configurar domínio próprio

No painel de gerenciamento do projeto, abra **Settings → Domains**. Escolha a opção de adicionar um domínio existente ou comprar um novo domínio. Para um domínio já registrado, informe o hostname, siga as instruções de DNS apresentadas pelo painel e aguarde a verificação. Para um domínio comprado pelo painel, conclua o fluxo de registro e atribuição ao projeto.

Após a verificação do domínio próprio, atualize as configurações OAuth em dois lugares: no OAuth Client **REDAÇÃO** do Google Cloud, inclua a callback fixa do Supabase `https://rqfgtxubpuxgmsvffkoy.supabase.co/auth/v1/callback` em **Authorized redirect URIs**; no Supabase Auth, defina a origem publicada como Site URL e inclua a origem publicada em Redirect URLs. O endereço do callback do Supabase não deve ser trocado pelo domínio do site.

## Checklist pós-publicação

1. Confirmar que o domínio responde por HTTPS.
2. Atualizar Site URL e Redirect URLs no Supabase Auth.
3. Confirmar o callback do OAuth Client REDAÇÃO no Google Cloud.
4. Testar login Google e e-mail/senha.
5. Testar uma correção, o histórico por conta e o download do PDF.
6. Testar a abertura da Jamily e uma pergunta dentro e outra fora do escopo.
7. Registrar o novo endereço no README e no histórico de validação.
