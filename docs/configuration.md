# Configuração segura

O projeto depende de variáveis fornecidas pelo ambiente de execução. Para desenvolvimento local, configure-as no painel de Secrets ou em um arquivo local ignorado pelo Git. Não copie valores reais para README, issues, commits, prompts de IA ou arquivos públicos.

| Variável | Uso | Exposição |
| --- | --- | --- |
| `BUILT_IN_FORGE_API_URL` | Endereço do gateway interno de IA | Apenas servidor |
| `BUILT_IN_FORGE_API_KEY` | Autorização das chamadas de IA | Apenas servidor |
| `DATABASE_URL` | Conexão com banco | Apenas servidor |
| `JWT_SECRET` | Assinatura de sessão | Apenas servidor |
| `VITE_APP_TITLE` | Nome público da aplicação | Cliente |
| `GEMINI_API_KEY` | Chave da API Gemini para correção de texto e imagem | Apenas servidor |
| `GEMINI_MODEL` | Modelo Gemini usado pelo backend; padrão atual: `gemini-3.6-flash` | Apenas servidor |

Ao pedir que outra IA edite o projeto, compartilhe este arquivo, o README e o AGENTS.md, mas nunca compartilhe os valores das variáveis. Para usar o Gemini, cadastre `GEMINI_API_KEY` no painel de Secrets e, opcionalmente, altere `GEMINI_MODEL`. A chave é lida somente pelo servidor e não deve aparecer no cliente, em commits ou no GitHub. Para testar a interface sem uma chamada real, altere o backend em uma branch local e escreva testes de contrato; não adicione chaves falsas ao repositório.
