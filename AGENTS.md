# Guia para agentes e IAs

## Missão

Este repositório implementa o AprovAI, uma aplicação educacional para análise de redações. Preserve a experiência em português do Brasil e o formato obrigatório de resposta definido no prompt do produto.

## Antes de editar

Leia `README.md`, `todo.md`, `server/routers.ts` e os arquivos da área que será alterada. Não invente requisitos, notas, erros gramaticais ou avaliações de aluno. Não coloque chaves, cookies, tokens ou valores de ambiente no código.

## Regras de implementação

A interface deve permanecer acessível, responsiva e utilizável por teclado. Chamadas de IA são exclusivamente server-side. Entrada externa deve ser validada com Zod. O endpoint de correção deve continuar retornando cinco competências, com notas discretas de 0 a 200, nota final de 0 a 1000 e os campos da intervenção.

Use componentes existentes em `client/src/components/ui` antes de criar novos. Para o frontend, altere preferencialmente `client/src/pages/Home.tsx` e `client/src/index.css`. Para o contrato de correção, altere `server/routers.ts`. Não edite a infraestrutura em `server/_core` sem necessidade comprovada.

## Processo de trabalho

1. Adicione qualquer novo requisito em `todo.md` como item pendente.
2. Faça a menor alteração coerente com o requisito.
3. Rode `pnpm test` e `pnpm build`.
4. Verifique visualmente o fluxo de entrada, carregamento, erro e resultado.
5. Marque o item correspondente como concluído somente após a validação.
6. Descreva no commit ou checkpoint o que mudou e como testar.

## Segurança

Variáveis `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY` são fornecidas pelo ambiente. Nunca as exponha no navegador. Imagens enviadas são dados do usuário: limite tamanho, valide o MIME type e não as execute como código. Se o comportamento de OCR não puder ser realizado, informe a limitação ao usuário em vez de inventar uma transcrição.
