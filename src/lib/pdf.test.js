import { describe, it, expect } from "vitest";
import { gerarPDF } from "./pdf.js";

function linha(n) {
  return { data: `2026-03-${String(n).padStart(2, "0")}`, leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" };
}

describe("gerarPDF", () => {
  it("produces a single-page document for a short cronograma", () => {
    const doc = gerarPDF({ cronograma: [linha(1), linha(8)], igreja: "Paróquia Teste", mes: 2, ano: 2026, logoImage: null });
    expect(doc.internal.getNumberOfPages()).toBe(1);
  });

  it("paginates automatically when the cronograma doesn't fit on one page", () => {
    const muitasLinhas = Array.from({ length: 40 }, (_, i) => linha((i % 28) + 1));
    const doc = gerarPDF({ cronograma: muitasLinhas, igreja: "Paróquia Teste", mes: 2, ano: 2026, logoImage: null });
    expect(doc.internal.getNumberOfPages()).toBeGreaterThan(1);
  });

  it("does not throw when logoImage is null", () => {
    expect(() => gerarPDF({ cronograma: [linha(1)], igreja: "", mes: 2, ano: 2026, logoImage: null })).not.toThrow();
  });
});
