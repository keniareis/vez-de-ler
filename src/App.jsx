import { useEffect, useRef, useState } from "react";
import { useEscala } from "./hooks/useEscala.js";
import { loadImage, gerarPDF } from "./lib/pdf.js";
import { MESES } from "./lib/dates.js";
import logo from "./assets/logo-pascom.png";
import Masthead from "./components/Masthead.jsx";
import LiveAnnouncer from "./components/LiveAnnouncer.jsx";
import DatasStep from "./components/DatasStep.jsx";
import PeopleListStep from "./components/PeopleListStep.jsx";
import SorteioButton from "./components/SorteioButton.jsx";
import CronogramaTable from "./components/CronogramaTable.jsx";
import StepCard from "./components/StepCard.jsx";

const TOTAL_PASSOS = 4;
const TITULOS_PASSO = {
  1: "Mês e datas das celebrações",
  2: "Leitores",
  3: "Ministros",
  4: "Celebrantes",
};

export default function App() {
  const escala = useEscala();
  const [passo, setPasso] = useState(1);
  const painelRef = useRef(null);
  const montouRef = useRef(false);

  useEffect(() => {
    if (!montouRef.current) {
      montouRef.current = true;
      return;
    }
    painelRef.current?.focus();
    if (passo >= 1 && passo <= TOTAL_PASSOS) {
      escala.anunciar(`Passo ${passo} de ${TOTAL_PASSOS}: ${TITULOS_PASSO[passo]}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on passo changes, not on every escala identity change
  }, [passo]);

  function irPara(novoPasso) {
    setPasso(novoPasso);
  }

  async function baixarPDF() {
    if (!escala.cronograma) return;
    let logoImage = null;
    try {
      logoImage = await loadImage(logo);
    } catch {
      /* ignore — PDF still generates without the logo */
    }
    const doc = gerarPDF({
      cronograma: escala.cronograma,
      igreja: escala.igreja,
      mes: escala.mes,
      ano: escala.ano,
      logoImage,
    });
    const nomeArquivo = `cronograma_${MESES[escala.mes].toLowerCase()}_${escala.ano}.pdf`;
    doc.save(nomeArquivo);
    escala.anunciar(`PDF gerado: ${nomeArquivo}`);
  }

  return (
    <div className="wrap">
      <Masthead />
      <LiveAnnouncer mensagem={escala.mensagem} mensagemId={escala.mensagemId} />

      <main>
        {passo === 1 && (
          <div ref={painelRef} tabIndex={-1}>
            <DatasStep
              igreja={escala.igreja} setIgreja={escala.setIgreja}
              mes={escala.mes} setMes={escala.setMes}
              ano={escala.ano} setAno={escala.setAno}
              diasSelecionados={escala.diasSelecionados} toggleDia={escala.toggleDia}
              datas={escala.datas} novaData={escala.novaData} setNovaData={escala.setNovaData}
              gerarDatasDoMes={escala.gerarDatasDoMes} removerData={escala.removerData}
              adicionarDataManual={escala.adicionarDataManual}
            />
            <button className="primary" type="button" onClick={() => irPara(2)}>Continuar</button>
          </div>
        )}

        {passo === 2 && (
          <div ref={painelRef} tabIndex={-1}>
            <PeopleListStep
              numero={2} titulo="Leitores" corChip="chip-blue" singular="leitor"
              campoId="novo-leitor" rotuloCampo="Adicionar leitor" placeholder="Nome do leitor"
              valorCampo={escala.novoLeitor} onValorCampoChange={escala.setNovoLeitor} onAdicionar={escala.adicionarLeitor}
              lista={escala.leitores} onRemover={escala.removerLeitor}
              rotuloPorCelebracao="Leitor(es) por celebração"
              valorPorCelebracao={escala.leitoresPorCel} onValorPorCelebracaoChange={escala.setLeitoresPorCel}
            />
            <div className="actions-row">
              <button className="secondary" type="button" onClick={() => irPara(1)}>Voltar</button>
              <button className="primary" type="button" style={{ marginTop: 0 }} onClick={() => irPara(3)}>Continuar</button>
            </div>
          </div>
        )}

        {passo === 3 && (
          <div ref={painelRef} tabIndex={-1}>
            <PeopleListStep
              numero={3} titulo="Ministros" corChip="chip-green" singular="ministro"
              campoId="novo-ministro" rotuloCampo="Adicionar ministro" placeholder="Nome do ministro"
              valorCampo={escala.novoMinistro} onValorCampoChange={escala.setNovoMinistro} onAdicionar={escala.adicionarMinistro}
              lista={escala.ministros} onRemover={escala.removerMinistro}
              rotuloPorCelebracao="Ministro(s) por celebração"
              valorPorCelebracao={escala.ministrosPorCel} onValorPorCelebracaoChange={escala.setMinistrosPorCel}
            />
            <div className="actions-row">
              <button className="secondary" type="button" onClick={() => irPara(2)}>Voltar</button>
              <button className="primary" type="button" style={{ marginTop: 0 }} onClick={() => irPara(4)}>Continuar</button>
            </div>
          </div>
        )}

        {passo === 4 && (
          <div ref={painelRef} tabIndex={-1}>
            <PeopleListStep
              numero={4} titulo="Celebrantes" corChip="chip-gold" singular="celebrante"
              campoId="novo-celebrante" rotuloCampo="Adicionar celebrante" placeholder="Ex.: Pe. Carlos"
              valorCampo={escala.novoResponsavel} onValorCampoChange={escala.setNovoResponsavel} onAdicionar={escala.adicionarResponsavel}
              lista={escala.responsaveis} onRemover={escala.removerResponsavel}
            />
            <button className="secondary" type="button" onClick={() => irPara(3)}>Voltar</button>
            <SorteioButton podeSortear={escala.podeSortear} onSortear={escala.sortear} />
          </div>
        )}

        {escala.cronograma && (
          <StepCard numero={5} titulo="Cronograma sorteado" as="section">
            <CronogramaTable
              cronograma={escala.cronograma}
              editando={escala.editando}
              setEditando={escala.setEditando}
              atualizarCelula={escala.atualizarCelula}
              leitores={escala.leitores}
              ministros={escala.ministros}
              responsaveis={escala.responsaveis}
            />
            <div className="edit-hint">Toque em um nome para trocá-lo sem precisar sortear tudo de novo.</div>
            <div className="actions-row">
              <button className="secondary" type="button" onClick={escala.sortear}>Sortear novamente</button>
              <button className="primary" type="button" style={{ marginTop: 0 }} onClick={baixarPDF}>Baixar PDF</button>
            </div>
          </StepCard>
        )}
      </main>
    </div>
  );
}
