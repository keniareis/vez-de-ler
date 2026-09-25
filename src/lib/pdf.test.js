import { describe, it, expect, vi } from "vitest";
import { gerarPDF } from "./pdf.js";

// jsPDF attaches its drawing methods as own instance properties during
// construction (not on the prototype and not on a patchable jsPDF.API
// registry in this build), so vi.spyOn(jsPDF.prototype, ...) can't see
// them. Instead, wrap each instance's methods immediately after
// construction — before gerarPDF gets a chance to call any of them — by
// mocking the module to hand back a capturing subclass.
const capturados = [];
vi.mock("jspdf", async (importOriginal) => {
  const real = await importOriginal();
  class JsPDFCapturado extends real.jsPDF {
    constructor(...args) {
      super(...args);
      const chamadas = { text: [], setFillColor: [], setTextColor: [] };
      for (const metodo of Object.keys(chamadas)) {
        const original = this[metodo].bind(this);
        this[metodo] = (...a) => {
          chamadas[metodo].push(a);
          return original(...a);
        };
      }
      capturados.push(chamadas);
    }
  }
  return { ...real, jsPDF: JsPDFCapturado };
});

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

  it("never draws a bare page-number footer that the final 'Página N de M' pass would overlap", () => {
    capturados.length = 0;
    gerarPDF({ cronograma: [linha(1)], igreja: "", mes: 2, ano: 2026, logoImage: null });

    const rodapesParciais = capturados[0].text
      .map(([texto]) => texto)
      .filter((t) => typeof t === "string" && /^Página \d+$/.test(t));
    expect(rodapesParciais).toHaveLength(0);
  });

  it("draws the top stripe in the original PASCOM brand green, not the darker text-contrast green", () => {
    capturados.length = 0;
    gerarPDF({ cronograma: [linha(1)], igreja: "", mes: 2, ano: 2026, logoImage: null });

    const fillCalls = capturados[0].setFillColor.map((args) => args.join(","));
    const textColorCalls = capturados[0].setTextColor.map((args) => args.join(","));

    expect(fillCalls).toContain("82,185,71"); // PASCOM brand green, unchanged for the decorative stripe
    expect(textColorCalls).toContain("46,125,50"); // contrast-fixed dark green, only for the kicker text
  });
});
