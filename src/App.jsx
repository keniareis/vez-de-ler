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

export default function App() {
  const escala = useEscala();

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
    doc.save(`cronograma_${MESES[escala.mes].toLowerCase()}_${escala.ano}.pdf`);
  }

  return (
    <div className="wrap">
      <Masthead />
      <LiveAnnouncer mensagem={escala.mensagem} />

      <DatasStep
        igreja={escala.igreja} setIgreja={escala.setIgreja}
        mes={escala.mes} setMes={escala.setMes}
        ano={escala.ano} setAno={escala.setAno}
        diasSelecionados={escala.diasSelecionados} toggleDia={escala.toggleDia}
        datas={escala.datas} novaData={escala.novaData} setNovaData={escala.setNovaData}
        gerarDatasDoMes={escala.gerarDatasDoMes} removerData={escala.removerData}
        adicionarDataManual={escala.adicionarDataManual}
      />

      <PeopleListStep
        numero={2} titulo="Leitores" corChip="chip-blue"
        campoId="novo-leitor" rotuloCampo="Adicionar leitor" placeholder="Nome do leitor"
        valorCampo={escala.novoLeitor} onValorCampoChange={escala.setNovoLeitor} onAdicionar={escala.adicionarLeitor}
        lista={escala.leitores} onRemover={escala.removerLeitor}
        rotuloPorCelebracao="Leitor(es) por celebração"
        valorPorCelebracao={escala.leitoresPorCel} onValorPorCelebracaoChange={escala.setLeitoresPorCel}
      />

      <PeopleListStep
        numero={3} titulo="Ministros" corChip="chip-green"
        campoId="novo-ministro" rotuloCampo="Adicionar ministro" placeholder="Nome do ministro"
        valorCampo={escala.novoMinistro} onValorCampoChange={escala.setNovoMinistro} onAdicionar={escala.adicionarMinistro}
        lista={escala.ministros} onRemover={escala.removerMinistro}
        rotuloPorCelebracao="Ministro(s) por celebração"
        valorPorCelebracao={escala.ministrosPorCel} onValorPorCelebracaoChange={escala.setMinistrosPorCel}
      />

      <PeopleListStep
        numero={4} titulo="Celebrantes" corChip="chip-gold"
        campoId="novo-celebrante" rotuloCampo="Adicionar celebrante" placeholder="Ex.: Pe. Carlos"
        valorCampo={escala.novoResponsavel} onValorCampoChange={escala.setNovoResponsavel} onAdicionar={escala.adicionarResponsavel}
        lista={escala.responsaveis} onRemover={escala.removerResponsavel}
      />

      <SorteioButton podeSortear={escala.podeSortear} onSortear={escala.sortear} />

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
    </div>
  );
}
