# Corretor ENEM Supremo

Aplicação web open source para apoiar a correção pedagógica de redações do ENEM. O sistema aceita texto digitado e imagem manuscrita, envia a redação para uma análise multimodal no servidor e apresenta nota final, competências, proposta de intervenção e parecer pedagógico.

## Objetivo

O projeto transforma o protocolo de correção fornecido pelo proprietário em uma experiência editável e transparente. A aplicação não substitui a avaliação oficial do INEP: ela é uma ferramenta educacional para estudo, revisão e preparação.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Interface | React 19, Vite, Tailwind CSS 4, shadcn/ui |
| API | Express, tRPC 11, Zod |
| IA | `invokeLLM` no servidor, com saída JSON estruturada |
| Conta | Manus OAuth já integrado pelo template |
| Banco | Drizzle/TiDB disponível para persistência futura |

## Como executar

Use Node.js 22 ou superior e pnpm. Depois de configurar as variáveis de ambiente da plataforma, execute:

```bash
pnpm install
pnpm dev
```

Para validar o projeto:

```bash
pnpm test
pnpm build
```

As credenciais não devem ser colocadas no código-fonte. Use o painel de Secrets do projeto ou um arquivo `.env` local que não seja versionado. Consulte `.env.example` para saber quais categorias de configuração existem.

## Arquitetura rápida

| Arquivo | Responsabilidade |
| --- | --- |
| `client/src/pages/Home.tsx` | Interface de entrada, upload e visualização dos resultados |
| `client/src/index.css` | Tokens visuais e estilos globais |
| `server/routers.ts` | Contrato tRPC e procedimento público de correção |
| `server/_core/llm.ts` | Adaptador interno para chamadas de texto e visão |
| `server/_core/env.ts` | Leitura segura das variáveis de ambiente |
| `todo.md` | Histórico verificável de requisitos e tarefas |
| `AGENTS.md` | Contexto operacional para outras IAs e colaboradores |

## Como outra IA pode editar

Uma IA deve começar lendo `AGENTS.md`, `README.md` e `todo.md`. Em seguida, deve localizar o requisito na lista de tarefas, modificar apenas os arquivos necessários, testar com `pnpm test` e `pnpm build`, verificar a interface no navegador e marcar a tarefa concluída. Nunca deve expor ou substituir segredos, remover validações do servidor ou mover chamadas de IA para o cliente.

O ponto principal para alterar o comportamento da correção é `server/routers.ts`. O ponto principal para alterar a experiência visual é `client/src/pages/Home.tsx` e `client/src/index.css`. O schema JSON do endpoint deve permanecer compatível com o tipo validado por Zod para evitar respostas incompletas.

## Compartilhamento

O código pode ser baixado pelo painel do projeto e enviado a colaboradores ou outras IAs. Para publicação pública, exporte o projeto para um repositório Git público e mantenha os segredos somente na configuração do ambiente. O código-fonte não contém chaves privadas por design.

## Licença

Distribuído sob a licença MIT. Consulte `LICENSE`.


## Recuperação do preview

O preview de desenvolvimento usa uma URL temporária vinculada ao servidor local gerenciado pelo ambiente. Após uma sincronização, alteração de dependências ou encerramento do processo, o endereço pode ficar indisponível temporariamente enquanto o servidor é reiniciado. Para recuperar o preview, use a opção de reiniciar o servidor no painel do projeto e aguarde o novo endereço ser disponibilizado; o código e o repositório público do GitHub não são apagados por esse reinício.
