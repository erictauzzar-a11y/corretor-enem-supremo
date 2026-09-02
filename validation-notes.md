# Validação ponta a ponta — 02/09/2026

O login Google foi concluído com a conta `eric.tauzz.ar@gmail.com` após cadastrar no OAuth Client REDAÇÃO a URI `https://rqfgtxubpuxgmsvffkoy.supabase.co/auth/v1/callback`. O preview exibiu o e-mail autenticado e o botão Sair.

A correção autenticada por texto foi executada com resposta HTTP 200; o servidor retornou `finalScore: 1000` e `persisted: true`. A interface exibiu o resultado completo, com cinco competências de 200/200 e o botão Baixar PDF. O estado permaneceu em processamento apenas enquanto a chamada Gemini estava em andamento; após o retorno, o resultado apareceu normalmente.

O arquivo `/home/ubuntu/Downloads/relatorio-corretor-enem-1000.pdf` foi baixado pelo navegador. O PDF tem 4 páginas A4 e 47.916 bytes. As páginas 1 e 2 foram renderizadas visualmente: a composição editorial, os blocos de competências, o texto e a paginação aparecem com espaçamento consistente, sem sobreposição de texto observável.

## Validação no domínio estável

O Supabase Auth foi atualizado com Site URL e Redirect URL `https://3000-iklen2qnt7dm3wl0tbehq-6b5986f0.us4.manus.computer`. Em nova tentativa, o retorno OAuth permaneceu nessa URL e o site exibiu `eric.tauzz.ar@gmail.com` e `Sair`. O histórico carregou diretamente no domínio estável com a correção de 1000/1000.

A correção foi executada novamente no domínio estável; após o tempo normal de processamento, a interface saiu de “Analisando sua redação...” e exibiu o resultado completo com nota 1000/1000. O botão Baixar PDF gerou `relatorio-corretor-enem-1000 (1).pdf`, identificado pelo navegador como originado do domínio estável. Portanto, o loading observado anteriormente não foi uma falha persistente nem exigiu alteração de código: era o tempo de resposta do Gemini.

## Comparação código sincronizado versus preview

O repositório local e o repositório GitHub `erictauzzar-a11y/corretor-enem-supremo` foram comparados pelo commit da branch `main`: ambos apontam para `a19a425174e63ff4f2bbc81d0b65f158ce2df33b`. Não restaram divergências de código entre o estado sincronizado e o preview estável. A comparação funcional confirmou os mesmos fluxos previstos na aplicação: autenticação Google, correção por texto, persistência no histórico, relatório PDF e suporte Jamily.

## Validação completa da Jamily no frontend

No preview estável autenticado, o painel `Suporte do Corretor` foi aberto e exibiu a saudação da Jamily. A pergunta dentro do escopo “Como funciona a correção por competências do ENEM?” foi enviada e a resposta renderizada explicou as cinco competências e a soma de 1000 pontos. Em seguida, a pergunta fora do escopo “Qual é a previsão do tempo hoje?” foi enviada; o frontend recebeu HTTP 200 e exibiu a recusa determinística: “Posso ajudar apenas com o AprovAI, redação do ENEM, histórico, autenticação e relatórios em PDF.”

## Domínio próprio futuro

As instruções de publicação e configuração de domínio próprio foram documentadas em `DOMAIN.md`. Nenhuma publicação definitiva foi executada, conforme solicitado.

## Evidência direta do painel Jamily

O painel do chat foi aberto no preview estável. A captura do navegador mostrou a pergunta dentro do escopo e a resposta renderizada começando por “A correção da redação do ENEM é dividida em 5 competências...”. O DOM confirmou o contêiner interno do chat com conteúdo rolável de 1068px e o posicionamento no final foi aplicado para expor as mensagens mais recentes. A chamada fora de escopo retornou HTTP 200 com `inScope: false` e a resposta determinística registrada nos logs do navegador.

A captura final do navegador (`/home/ubuntu/screenshots/3000-iklen2qnt7dm3wl_2026-09-02_12-55-53_3236.webp`) mostra diretamente no painel da Jamily a mensagem de recusa “Posso ajudar apenas com o AprovAI, redação do ENEM, histórico, autenticação e relatórios em PDF.” A mensagem contextual sobre as cinco competências também aparece no histórico imediatamente acima, com o chat rolado ao final.

## Evidência visual ampliada do chat

Para tornar a auditoria inequívoca, o painel do chat foi expandido temporariamente apenas no navegador e rolado ao trecho correspondente. A captura `/home/ubuntu/screenshots/3000-iklen2qnt7dm3wl_2026-09-02_12-57-04_1945.webp` mostra diretamente no frontend a resposta da Jamily explicando as cinco competências, cada uma valendo até 200 pontos, totalizando 1000, e a mensagem posterior de recusa para “Qual é a previsão do tempo hoje?”: “Posso ajudar apenas com o AprovAI, redação do ENEM, histórico, autenticação e relatórios em PDF.” A alteração de tamanho foi somente um ajuste de inspeção no DOM do navegador e não foi gravada no código da aplicação.

## Sincronização GitHub final

Em 02/09/2026, as alterações pendentes foram commitadas e enviadas para `erictauzzar-a11y/corretor-enem-supremo`, branch `main`. A confirmação via GitHub CLI retornou o mesmo SHA local e remoto: `91bfecc3f68a3193d21dca516ec8844d33b231d1` (`Track final GitHub synchronization`). O repositório remoto existente foi utilizado; nenhum repositório novo foi criado.

Final synchronization commit before clean-tree confirmation: `952067c468d178a1aa543abb2869a13a4dbb18a3`.

A confirmação final após o commit de evidências retornou `local_sha=af825b626a872f6373305964f124554d199e54e5`, `remote_sha=af825b626a872f6373305964f124554d199e54e5` e `git_status=clean`.
