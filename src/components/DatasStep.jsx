import { MESES, DIAS_ABREV, formatDateBR, weekdayOf } from "../lib/dates.js";
import StepCard from "./StepCard.jsx";

export default function DatasStep({
  igreja, setIgreja, mes, setMes, ano, setAno,
  diasSelecionados, toggleDia,
  datas, novaData, setNovaData, gerarDatasDoMes, removerData, adicionarDataManual,
}) {
  return (
    <StepCard numero={1} titulo="Mês e datas das celebrações">
      <label htmlFor="campo-igreja">Nome da igreja / comunidade (opcional)</label>
      <input id="campo-igreja" type="text" value={igreja} onChange={(e) => setIgreja(e.target.value)} placeholder="Ex.: Paróquia Santo Antônio" />

      <div className="row">
        <div>
          <label htmlFor="campo-mes">Mês</label>
          <select id="campo-mes" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="campo-ano">Ano</label>
          <input id="campo-ano" type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
        </div>
      </div>

      <fieldset>
        <legend>Dias da semana com celebração</legend>
        <div className="weekdays">
          {DIAS_ABREV.map((d, i) => (
            <button
              key={i}
              type="button"
              className="wd-btn"
              aria-pressed={diasSelecionados.has(i)}
              onClick={() => toggleDia(i)}
            >
              {d}
            </button>
          ))}
        </div>
      </fieldset>

      <button className="secondary" type="button" onClick={gerarDatasDoMes}>Gerar datas do mês</button>

      <div className="add-date-row">
        <label htmlFor="campo-nova-data" className="sr-only">Adicionar data avulsa</label>
        <input id="campo-nova-data" type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} />
        <button type="button" onClick={adicionarDataManual}>Adicionar</button>
      </div>

      {datas.length > 0 ? (
        <ul className="datelist">
          {datas.map((iso) => (
            <li key={iso}>
              <span>{formatDateBR(iso)} — {DIAS_ABREV[weekdayOf(iso)]}</span>
              <button className="del" type="button" onClick={() => removerData(iso)} aria-label={`Remover celebração de ${formatDateBR(iso)}`}>×</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-hint">Nenhuma data adicionada ainda.</div>
      )}
    </StepCard>
  );
}
