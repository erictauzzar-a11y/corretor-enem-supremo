import { jsPDF } from "jspdf";

export type CorrectionPdfData = {
  finalScore: number;
  transcription: string;
  competencies: Array<{
    score: number;
    title: string;
    summary: string;
    details: string[];
    evidence: string[];
    verdict: string;
    protocolFindings: Record<string, string>;
  }>;
  intervention: {
    agent: string;
    action: string;
    means: string;
    purpose: string;
    detail: string;
    viability: string;
    checklist: Record<string, string>;
  };
  pedagogicalReport: string;
  warning: string;
};

const colors = {
  navy: [23, 35, 61] as const,
  blue: [49, 85, 216] as const,
  paleBlue: [239, 243, 255] as const,
  ink: [55, 66, 91] as const,
  muted: [105, 116, 139] as const,
  line: [226, 231, 241] as const,
  white: [255, 255, 255] as const,
  green: [36, 115, 74] as const,
  amber: [166, 106, 0] as const,
};

const protocolLabels: Record<string, string> = {
  grammar: "Desvios gramaticais e ortográficos",
  syntax: "Falhas de estrutura sintática",
  theme: "Adequação ao tema",
  textType: "Tipo textual",
  repertoire: "Repertório legítimo e produtivo",
  project: "Projeto de texto",
  coherence: "Coerência e argumentação",
  interparagraphCohesion: "Coesão interparágrafos",
  intraparagraphCohesion: "Coesão intraparágrafos",
  cohesionInadequacies: "Inadequações coesivas",
};

const checklistLabels: Record<string, string> = {
  agent: "Agente",
  action: "Ação",
  means: "Meio / modo",
  purpose: "Finalidade",
  detail: "Detalhamento",
};

export function downloadCorrectionPdf(result: CorrectionPdfData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 42;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = 46;
  let pageNumber = 1;

  const setColor = (kind: keyof typeof colors) => doc.setTextColor(colors[kind][0], colors[kind][1], colors[kind][2]);
  const fillColor = (kind: keyof typeof colors) => doc.setFillColor(colors[kind][0], colors[kind][1], colors[kind][2]);
  const strokeColor = (kind: keyof typeof colors) => doc.setDrawColor(colors[kind][0], colors[kind][1], colors[kind][2]);

  const footer = () => {
    strokeColor("line");
    doc.setLineWidth(0.6);
    doc.line(margin, pageHeight - 38, pageWidth - margin, pageHeight - 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor("muted");
    doc.text("Corretor ENEM Supremo · Relatório orientativo", margin, pageHeight - 22);
    doc.text(`${pageNumber}`, pageWidth - margin, pageHeight - 22, { align: "right" });
  };

  const addPage = () => {
    footer();
    doc.addPage();
    pageNumber += 1;
    y = 48;
  };

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 58) addPage();
  };

  const wrapped = (value: string, size: number, width = contentWidth) => {
    doc.setFontSize(size);
    return doc.splitTextToSize(value || "—", width) as string[];
  };

  const paragraph = (value: string, size = 10, kind: keyof typeof colors = "ink", gap = 8, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    setColor(kind);
    const lines = wrapped(value, size);
    const lineHeight = size + 4;
    ensureSpace(lines.length * lineHeight + gap);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + gap;
  };

  const sectionTitle = (number: string, title: string, subtitle?: string) => {
    ensureSpace(52);
    fillColor("paleBlue");
    doc.roundedRect(margin, y - 17, 28, 24, 7, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor("blue");
    doc.text(number, margin + 14, y - 1, { align: "center" });
    doc.setFontSize(16);
    setColor("navy");
    doc.text(title, margin + 40, y + 1);
    y += 20;
    if (subtitle) paragraph(subtitle, 9, "muted", 10);
  };

  const labeledValue = (label: string, value: string, width = contentWidth) => {
    const labelWidth = 92;
    const lines = wrapped(value, 9, width - labelWidth - 14);
    const height = Math.max(24, lines.length * 13 + 12);
    ensureSpace(height);
    fillColor("paleBlue");
    doc.roundedRect(margin, y - 10, width, height, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor("blue");
    doc.text(label.toUpperCase(), margin + 10, y + 4);
    doc.setFont("helvetica", "normal");
    setColor("ink");
    doc.text(lines, margin + labelWidth, y + 4);
    y += height + 7;
  };

  const drawScoreCard = () => {
    ensureSpace(116);
    fillColor("blue");
    doc.roundedRect(margin, y, contentWidth, 98, 14, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.white);
    doc.text("NOTA FINAL", margin + 18, y + 25);
    doc.setFontSize(38);
    doc.text(`${result.finalScore}`, margin + 18, y + 68);
    doc.setFontSize(14);
    doc.setTextColor(210, 220, 255);
    doc.text("/1000", margin + 112, y + 67);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Uma leitura global do seu desempenho nas cinco competências.", margin + 205, y + 36);
    doc.text("Use este relatório como roteiro para sua próxima versão.", margin + 205, y + 56);
    y += 122;
  };

  const drawCompetency = (item: CorrectionPdfData["competencies"][number], index: number) => {
    const titleLines = wrapped(item.title, 11, contentWidth - 76);
    const summaryLines = wrapped(item.summary, 9, contentWidth - 24);
    const baseHeight = 74 + titleLines.length * 14 + summaryLines.length * 13;
    ensureSpace(Math.min(baseHeight, 180));
    fillColor("white");
    strokeColor("line");
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y - 12, contentWidth, Math.min(baseHeight, 210), 10, 10, "FD");
    fillColor("blue");
    doc.roundedRect(margin, y - 12, 52, 52, 10, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.white);
    doc.text(`C${index + 1}`, margin + 26, y + 10, { align: "center" });
    doc.setFontSize(18);
    doc.text(`${item.score}`, margin + 26, y + 31, { align: "center" });
    doc.setFontSize(8);
    doc.text("/200", margin + 26, y + 43, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor("navy");
    doc.text(titleLines, margin + 66, y + 1);
    y += titleLines.length * 14 + 13;
    paragraph(item.summary, 9, "ink", 6);
    fillColor("line");
    doc.roundedRect(margin + 12, y - 2, contentWidth - 24, 6, 3, 3, "F");
    fillColor("blue");
    doc.roundedRect(margin + 12, y - 2, (contentWidth - 24) * Math.max(0, Math.min(item.score / 200, 1)), 6, 3, 3, "F");
    y += 18;
    Object.entries(item.protocolFindings).forEach(([key, value]) => labeledValue(protocolLabels[key] ?? key, value, contentWidth - 24));
    item.details.slice(0, 4).forEach(detail => paragraph(`• ${detail}`, 8.5, "muted", 4));
    item.evidence.slice(0, 3).forEach(evidence => paragraph(`Evidência: ${evidence}`, 8.5, "ink", 4));
    paragraph(`Veredito: ${item.verdict}`, 9, "navy", 12, true);
    y += 6;
  };

  fillColor("navy");
  doc.rect(0, 0, pageWidth, 126, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...colors.white);
  doc.text("Corretor ENEM Supremo", margin, 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(201, 213, 255);
  doc.text("Relatório de desempenho e plano de evolução", margin, 75);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), margin, 101);
  y = 164;
  drawScoreCard();

  sectionTitle("01", "Texto analisado", "A transcrição abaixo é a base utilizada na análise pedagógica.");
  paragraph(result.transcription, 10, "ink", 18);

  sectionTitle("02", "Desempenho por competência", "Cada competência vale até 200 pontos. Observe o diagnóstico e transforme as evidências em revisão prática.");
  result.competencies.forEach(drawCompetency);

  sectionTitle("03", "Proposta de intervenção", "Uma proposta completa apresenta agente, ação, meio, finalidade e detalhamento.");
  [
    ["Agente", result.intervention.agent],
    ["Ação", result.intervention.action],
    ["Meio / modo", result.intervention.means],
    ["Finalidade", result.intervention.purpose],
    ["Detalhamento", result.intervention.detail],
    ["Viabilidade", result.intervention.viability],
  ].forEach(([label, value]) => labeledValue(label, value));
  ensureSpace(64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor("blue");
  doc.text("CHECKLIST DOS CINCO ELEMENTOS", margin, y);
  y += 18;
  Object.entries(result.intervention.checklist).forEach(([key, value]) => labeledValue(checklistLabels[key] ?? key, value));

  sectionTitle("04", "Parecer pedagógico", "Síntese orientativa para apoiar a reescrita e o estudo autônomo.");
  fillColor("navy");
  const reportLines = wrapped(result.pedagogicalReport, 10, contentWidth - 32);
  const reportHeight = reportLines.length * 15 + 30;
  ensureSpace(reportHeight);
  doc.roundedRect(margin, y - 8, contentWidth, reportHeight, 10, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.white);
  doc.text(reportLines, margin + 16, y + 14);
  y += reportHeight + 16;
  if (result.warning) {
    fillColor("paleBlue");
    const warningLines = wrapped(`Observação: ${result.warning}`, 9, contentWidth - 28);
    ensureSpace(warningLines.length * 13 + 22);
    doc.roundedRect(margin, y - 8, contentWidth, warningLines.length * 13 + 22, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor("amber");
    doc.text(warningLines, margin + 14, y + 7);
    y += warningLines.length * 13 + 30;
  }

  footer();
  doc.save(`relatorio-corretor-enem-${result.finalScore}.pdf`);
}
