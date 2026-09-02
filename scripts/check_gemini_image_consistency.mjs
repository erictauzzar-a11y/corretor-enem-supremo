import { readFile } from "node:fs/promises";

const imagePath = "/home/ubuntu/upload/08551701584_REDACAO_ENEM2019(1).webp";
const imageDataUrl = `data:image/webp;base64,${(await readFile(imagePath)).toString("base64")}`;
const scores = [];
for (let attempt = 0; attempt < 3; attempt += 1) {
  const response = await fetch("http://localhost:3000/api/trpc/correction.analyze?batch=1", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: { imageDataUrl } } }),
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
