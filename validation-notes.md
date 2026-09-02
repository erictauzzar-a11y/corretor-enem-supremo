# Validação ponta a ponta — 02/09/2026

O login Google foi concluído com a conta `eric.tauzz.ar@gmail.com` após cadastrar no OAuth Client REDAÇÃO a URI `https://rqfgtxubpuxgmsvffkoy.supabase.co/auth/v1/callback`. O preview exibiu o e-mail autenticado e o botão Sair.

A correção autenticada por texto foi executada com resposta HTTP 200; o servidor retornou `finalScore: 1000` e `persisted: true`. A interface exibiu o resultado completo, com cinco competências de 200/200 e o botão Baixar PDF. O estado permaneceu em processamento apenas enquanto a chamada Gemini estava em andamento; após o retorno, o resultado apareceu normalmente.

O arquivo `/home/ubuntu/Downloads/relatorio-corretor-enem-1000.pdf` foi baixado pelo navegador. O PDF tem 4 páginas A4 e 47.916 bytes. As páginas 1 e 2 foram renderizadas visualmente: a composição editorial, os blocos de competências, o texto e a paginação aparecem com espaçamento consistente, sem sobreposição de texto observável.

## Validação no domínio estável

O Supabase Auth foi atualizado com Site URL e Redirect URL `https://3000-iklen2qnt7dm3wl0tbehq-6b5986f0.us4.manus.computer`. Em nova tentativa, o retorno OAuth permaneceu nessa URL e o site exibiu `eric.tauzz.ar@gmail.com` e `Sair`. O histórico carregou diretamente no domínio estável com a correção de 1000/1000.

A correção foi executada novamente no domínio estável; após o tempo normal de processamento, a interface saiu de “Analisando sua redação...” e exibiu o resultado completo com nota 1000/1000. O botão Baixar PDF gerou `relatorio-corretor-enem-1000 (1).pdf`, identificado pelo navegador como originado do domínio estável. Portanto, o loading observado anteriormente não foi uma falha persistente nem exigiu alteração de código: era o tempo de resposta do Gemini.
