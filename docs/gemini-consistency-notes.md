# Consistência da correção Gemini

A documentação oficial do Gemini informa que `generationConfig` controla os parâmetros de geração e que temperatura controla a aleatoriedade da amostragem. A documentação de saídas estruturadas informa que um JSON Schema torna o resultado previsível e tipado, mas não substitui regras de avaliação no prompt nem validações do servidor.

Fontes consultadas:

- [Gemini API — Generating content](https://ai.google.dev/api/generate-content)
- [Gemini API — Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)

Decisão do projeto: usar temperatura mínima, solicitar evidência textual observável para cada competência, separar análise de pontuação e exigir coerência entre evidências, nível atribuído e nota final. A validação server-side continuará sendo a autoridade final do contrato.
