import { useState } from "react";
import { datasDoMes, formatDateBR } from "../lib/dates.js";
import { montarCronograma } from "../lib/sorteio.js";

function adicionarNomeEm(lista, setLista, campo, setCampo) {
  const limpo = campo.trim();
  if (!limpo) return;
  if (!lista.includes(limpo)) setLista([...lista, limpo]);
  setCampo("");
}

export function useEscala() {
  const today = new Date();
  const [igreja, setIgreja] = useState("");
  const [mes, setMes] = useState(today.getMonth());
  const [ano, setAno] = useState(today.getFullYear());
  const [diasSelecionados, setDiasSelecionados] = useState(new Set([0]));
  const [datas, setDatas] = useState([]);
  const [novaData, setNovaData] = useState("");
  const [leitoresPorCel, setLeitoresPorCel] = useState(2);
  const [ministrosPorCel, setMinistrosPorCel] = useState(2);
  const [leitores, setLeitores] = useState([]);
  const [ministros, setMinistros] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [novoLeitor, setNovoLeitor] = useState("");
  const [novoMinistro, setNovoMinistro] = useState("");
  const [novoResponsavel, setNovoResponsavel] = useState("");
  const [cronograma, setCronograma] = useState(null);
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemId, setMensagemId] = useState(0);

  function anunciar(texto) {
    setMensagem(texto);
    setMensagemId((id) => id + 1);
  }

  function toggleDia(i) {
    const s = new Set(diasSelecionados);
    if (s.has(i)) s.delete(i); else s.add(i);
    setDiasSelecionados(s);
  }

  function adicionarLeitor() {
    adicionarNomeEm(leitores, setLeitores, novoLeitor, setNovoLeitor);
    setCronograma(null);
  }
  function removerLeitor(nome) {
    setLeitores(leitores.filter((n) => n !== nome));
    setCronograma(null);
  }
  function adicionarMinistro() {
    adicionarNomeEm(ministros, setMinistros, novoMinistro, setNovoMinistro);
    setCronograma(null);
  }
  function removerMinistro(nome) {
    setMinistros(ministros.filter((n) => n !== nome));
    setCronograma(null);
  }
  function adicionarResponsavel() {
    adicionarNomeEm(responsaveis, setResponsaveis, novoResponsavel, setNovoResponsavel);
    setCronograma(null);
  }
  function removerResponsavel(nome) {
    setResponsaveis(responsaveis.filter((n) => n !== nome));
    setCronograma(null);
  }

  function gerarDatasDoMes() {
    const novas = datasDoMes(ano, mes, diasSelecionados);
    setDatas(Array.from(new Set([...datas, ...novas])).sort());
    setCronograma(null);
  }
  function removerData(iso) {
    setDatas(datas.filter((d) => d !== iso));
    setCronograma(null);
  }
  function adicionarDataManual() {
    if (!novaData) return;
    if (!datas.includes(novaData)) setDatas([...datas, novaData].sort());
    setNovaData("");
    setCronograma(null);
  }

  const podeSortear = datas.length > 0 && leitores.length > 0 && responsaveis.length > 0 && ministros.length > 0;

  function sortear() {
    const linhas = montarCronograma({ datas, leitores, ministros, responsaveis, leitoresPorCel, ministrosPorCel });
    setCronograma(linhas);
    setEditando(null);
    anunciar(`Cronograma sorteado com ${linhas.length} celebraç${linhas.length === 1 ? "ão" : "ões"}.`);
  }

  function atualizarCelula(dataIso, tipo, novoValor, idx) {
    setCronograma(
      cronograma.map((linha) => {
        if (linha.data !== dataIso) return linha;
        if (tipo === "celebrante") return { ...linha, responsavel: novoValor };
        if (tipo === "leitor") {
          const novos = [...linha.leitores];
          novos[idx] = novoValor;
          return { ...linha, leitores: novos };
        }
        if (tipo === "ministro") {
          const novos = [...linha.ministros];
          novos[idx] = novoValor;
          return { ...linha, ministros: novos };
        }
        return linha;
      })
    );
    setEditando(null);
    const rotulo = tipo === "celebrante" ? "celebrante" : tipo;
    anunciar(`${novoValor} definido como ${rotulo} em ${formatDateBR(dataIso)}.`);
  }

  return {
    igreja, setIgreja, mes, setMes, ano, setAno,
    diasSelecionados, toggleDia,
    datas, novaData, setNovaData, gerarDatasDoMes, removerData, adicionarDataManual,
    leitoresPorCel, setLeitoresPorCel, ministrosPorCel, setMinistrosPorCel,
    leitores, ministros, responsaveis,
    novoLeitor, setNovoLeitor, novoMinistro, setNovoMinistro, novoResponsavel, setNovoResponsavel,
    adicionarLeitor, removerLeitor, adicionarMinistro, removerMinistro, adicionarResponsavel, removerResponsavel,
    podeSortear, cronograma, sortear, editando, setEditando, atualizarCelula,
    mensagem, mensagemId, anunciar,
  };
}
