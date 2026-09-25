import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEscala } from "./useEscala.js";

function adicionarNome(result, campo, valor, setter, adder) {
  act(() => result.current[setter](valor));
  act(() => result.current[adder]());
}

describe("useEscala", () => {
  it("adds and removes a leitor, resetting any existing cronograma", () => {
    const { result } = renderHook(() => useEscala());
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    expect(result.current.leitores).toEqual(["Ana"]);

    act(() => result.current.removerLeitor("Ana"));
    expect(result.current.leitores).toEqual([]);
  });

  it("does not add a duplicate or blank name", () => {
    const { result } = renderHook(() => useEscala());
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "leitor", "   ", "setNovoLeitor", "adicionarLeitor");
    expect(result.current.leitores).toEqual(["Ana"]);
  });

  it("podeSortear is only true once dates, leitores, ministros and responsaveis are all non-empty", () => {
    const { result } = renderHook(() => useEscala());
    expect(result.current.podeSortear).toBe(false);
  });

  it("sortear fills cronograma and sets an announce message", () => {
    const { result } = renderHook(() => useEscala());
    // Sunday (0) is selected by default, so gerarDatasDoMes already has a weekday to work with.
    act(() => result.current.gerarDatasDoMes());
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "ministro", "Duda", "setNovoMinistro", "adicionarMinistro");
    adicionarNome(result, "responsavel", "Padre Carlos", "setNovoResponsavel", "adicionarResponsavel");
    expect(result.current.podeSortear).toBe(true);

    act(() => result.current.sortear());
    expect(result.current.cronograma).not.toBeNull();
    expect(result.current.cronograma.length).toBe(result.current.datas.length);
    expect(result.current.mensagem).toMatch(/cronograma sorteado/i);
  });

  it("atualizarCelula updates one cell and sets an announce message", () => {
    const { result } = renderHook(() => useEscala());
    act(() => result.current.gerarDatasDoMes());
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "leitor", "Beto", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "ministro", "Duda", "setNovoMinistro", "adicionarMinistro");
    adicionarNome(result, "responsavel", "Padre Carlos", "setNovoResponsavel", "adicionarResponsavel");
    act(() => result.current.sortear());

    const dataIso = result.current.datas[0];
    act(() => result.current.atualizarCelula(dataIso, "celebrante", "Padre Carlos"));
    expect(result.current.cronograma[0].responsavel).toBe("Padre Carlos");
    expect(result.current.mensagem).toMatch(/celebrante/i);
  });

  it("bumps mensagemId on every sortear so a live region re-announces even identical text", () => {
    const { result } = renderHook(() => useEscala());
    act(() => result.current.gerarDatasDoMes());
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "ministro", "Duda", "setNovoMinistro", "adicionarMinistro");
    adicionarNome(result, "responsavel", "Padre Carlos", "setNovoResponsavel", "adicionarResponsavel");

    act(() => result.current.sortear());
    const primeiraMensagem = result.current.mensagem;
    const primeiroId = result.current.mensagemId;

    act(() => result.current.sortear());
    expect(result.current.mensagem).toBe(primeiraMensagem); // same count, same text
    expect(result.current.mensagemId).not.toBe(primeiroId); // but a fresh id
  });

  it("announces the cell edit date in DD/MM format, not the raw ISO string", () => {
    const { result } = renderHook(() => useEscala());
    act(() => result.current.gerarDatasDoMes());
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "leitor", "Beto", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "ministro", "Duda", "setNovoMinistro", "adicionarMinistro");
    adicionarNome(result, "responsavel", "Padre Carlos", "setNovoResponsavel", "adicionarResponsavel");
    act(() => result.current.sortear());

    const dataIso = result.current.datas[0];
    act(() => result.current.atualizarCelula(dataIso, "celebrante", "Padre Carlos"));
    expect(result.current.mensagem).not.toContain(dataIso);
    expect(result.current.mensagem).toMatch(/\d{2}\/\d{2}/);
  });

  it("exposes anunciar() for callers outside the hook (e.g. after a successful PDF download)", () => {
    const { result } = renderHook(() => useEscala());
    const idAntes = result.current.mensagemId;
    act(() => result.current.anunciar("PDF gerado: cronograma_marco_2026.pdf"));
    expect(result.current.mensagem).toBe("PDF gerado: cronograma_marco_2026.pdf");
    expect(result.current.mensagemId).not.toBe(idAntes);
  });

  it("clears a sorted cronograma when a name it used is removed, so a stale name can never linger in the results", () => {
    const { result } = renderHook(() => useEscala());
    act(() => result.current.gerarDatasDoMes());
    adicionarNome(result, "leitor", "Ana", "setNovoLeitor", "adicionarLeitor");
    adicionarNome(result, "ministro", "Duda", "setNovoMinistro", "adicionarMinistro");
    adicionarNome(result, "responsavel", "Padre Carlos", "setNovoResponsavel", "adicionarResponsavel");
    act(() => result.current.sortear());
    expect(result.current.cronograma).not.toBeNull();

    act(() => result.current.removerLeitor("Ana"));
    expect(result.current.cronograma).toBeNull();
  });
});
