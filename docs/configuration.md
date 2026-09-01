# Configuração segura

O projeto depende de variáveis fornecidas pelo ambiente de execução. Para desenvolvimento local, configure-as no painel de Secrets ou em um arquivo local ignorado pelo Git. Não copie valores reais para README, issues, commits, prompts de IA ou arquivos públicos.

| Variável | Uso | Exposição |
| --- | --- | --- |
| `BUILT_IN_FORGE_API_URL` | Endereço do gateway interno de IA | Apenas servidor |
| `BUILT_IN_FORGE_API_KEY` | Autorização das chamadas de IA | Apenas servidor |
| `DATABASE_URL` | Conexão com banco | Apenas servidor |
| `JWT_SECRET` | Assinatura de sessão | Apenas servidor |
| `VITE_APP_TITLE` | Nome público da aplicação | Cliente |

Ao pedir que outra IA edite o projeto, compartilhe este arquivo e o README, mas nunca compartilhe os valores das variáveis. Para testar a interface sem uma chamada real, altere o backend em uma branch local e escreva testes de contrato; não adicione chaves falsas ao repositório.
