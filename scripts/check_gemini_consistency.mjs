const essay = `A educação pública brasileira enfrenta desafios relacionados ao acesso desigual à tecnologia. Em muitas escolas, a falta de internet e de equipamentos limita as oportunidades de aprendizagem dos estudantes. Além disso, famílias de baixa renda nem sempre conseguem oferecer conexão adequada em casa, o que amplia a distância entre alunos. Portanto, é necessário que o poder público invista em infraestrutura digital e formação de professores, para garantir uma educação mais igualitária.`;

const scores = [];
for (let attempt = 0; attempt < 3; attempt += 1) {
  const response = await fetch("http://localhost:3000/api/trpc/correction.analyze?batch=1", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: { text: essay } } }),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${raw.slice(0, 500)}`);
  const parsed = JSON.parse(raw);
  const result = parsed?.[0]?.result?.data?.json ?? parsed?.[0]?.result?.data;
  if (!result?.finalScore || !Array.isArray(result.competencies)) throw new Error(`Resposta inesperada: ${raw.slice(0, 500)}`);
  scores.push({ finalScore: result.finalScore, competencies: result.competencies.map(item => item.score) });
  console.log(JSON.stringify(scores.at(-1)));
}
console.log(JSON.stringify({ consistent: scores.every(item => item.finalScore === scores[0].finalScore && item.competencies.join(",") === scores[0].competencies.join(",")), scores }));
