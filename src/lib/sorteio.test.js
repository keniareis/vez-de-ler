import { describe, it, expect } from "vitest";
import { createPicker, montarCronograma } from "./sorteio.js";

describe("createPicker", () => {
  it("cycles through every name before repeating", () => {
    const pick = createPicker(["Ana", "Beto", "Cris"]);
    const seen = new Set([pick(), pick(), pick()]);
    expect(seen).toEqual(new Set(["Ana", "Beto", "Cris"]));
  });

  it("skips names in the exclude set for that call", () => {
    const pick = createPicker(["Ana", "Beto"]);
    const result = pick(new Set(["Ana"]));
    expect(result).toBe("Beto");
  });

  it("falls back to a name in the exclude set rather than throwing when all names are excluded", () => {
    const pick = createPicker(["Ana"]);
    expect(() => pick(new Set(["Ana"]))).not.toThrow();
  });
});

describe("montarCronograma", () => {
  const base = {
    datas: ["2026-03-01", "2026-03-08"],
    leitores: ["Ana", "Beto", "Cris"],
    ministros: ["Duda", "Elo"],
    responsaveis: ["Padre Carlos"],
    leitoresPorCel: 2,
    ministrosPorCel: 1,
  };

  it("produces one row per date with the requested number of readers and ministers", () => {
    const linhas = montarCronograma(base);
    expect(linhas).toHaveLength(2);
    linhas.forEach((linha) => {
      expect(linha.leitores).toHaveLength(2);
      expect(linha.ministros).toHaveLength(1);
      expect(linha.responsavel).toBe("Padre Carlos");
    });
  });

  it("never repeats a reader within the same day's list", () => {
    const linhas = montarCronograma(base);
    linhas.forEach((linha) => {
      expect(new Set(linha.leitores).size).toBe(linha.leitores.length);
    });
  });

  it("excludes the day's celebrant from that day's readers when the celebrant is also in the reader pool", () => {
    const linhas = montarCronograma({
      ...base,
      leitores: ["Ana", "Beto", "Padre Carlos"],
    });
    linhas.forEach((linha) => {
      expect(linha.leitores).not.toContain(linha.responsavel);
    });
  });

  it("does not throw when leitoresPorCel exceeds the number of available readers", () => {
    expect(() =>
      montarCronograma({ ...base, leitores: ["Ana"], leitoresPorCel: 5 })
    ).not.toThrow();
  });
});
