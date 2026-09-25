import { formatDateBR, weekdayOf, DIAS_ABREV } from "../lib/dates.js";
import EditableCell from "./EditableCell.jsx";

export default function CronogramaTable({ cronograma, editando, setEditando, atualizarCelula, leitores, ministros, responsaveis }) {
  return (
    <div className="table-scroll">
      <table className="schedule-table">
        <caption className="sr-only">Cronograma de leitores, ministros e celebrante por data</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Leitor(es)</th>
            <th scope="col">Ministro(s)</th>
            <th scope="col">Celebrante</th>
          </tr>
        </thead>
        <tbody>
          {cronograma.map((linha) => (
            <tr key={linha.data}>
              <td className="date-cell">
                {formatDateBR(linha.data)}<br />
                <span style={{ fontWeight: 400, color: "var(--ink-soft)", fontSize: 12 }}>{DIAS_ABREV[weekdayOf(linha.data)]}</span>
              </td>

              <td>
                {linha.leitores.map((nome, idx) => {
                  const aEditar = editando && editando.data === linha.data && editando.tipo === "leitor" && editando.idx === idx;
                  const opcoes = leitores.filter((n) => n === nome || (!linha.leitores.includes(n) && n !== linha.responsavel));
                  return (
                    <span key={idx}>
                      <EditableCell
                        valor={nome}
                        opcoes={opcoes}
                        emEdicao={aEditar}
                        rotulo={`Leitor ${idx + 1} em ${formatDateBR(linha.data)}`}
                        onIniciarEdicao={() => setEditando({ data: linha.data, tipo: "leitor", idx })}
                        onConfirmar={(v) => atualizarCelula(linha.data, "leitor", v, idx)}
                        onCancelar={() => setEditando(null)}
                      />
                      {idx < linha.leitores.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </td>

              <td>
                {linha.ministros.map((nome, idx) => {
                  const aEditar = editando && editando.data === linha.data && editando.tipo === "ministro" && editando.idx === idx;
                  const opcoes = ministros.filter((n) => n === nome || !linha.ministros.includes(n));
                  return (
                    <span key={idx}>
                      <EditableCell
                        valor={nome}
                        opcoes={opcoes}
                        emEdicao={aEditar}
                        rotulo={`Ministro ${idx + 1} em ${formatDateBR(linha.data)}`}
                        onIniciarEdicao={() => setEditando({ data: linha.data, tipo: "ministro", idx })}
                        onConfirmar={(v) => atualizarCelula(linha.data, "ministro", v, idx)}
                        onCancelar={() => setEditando(null)}
                      />
                      {idx < linha.ministros.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </td>

              <td>
                <EditableCell
                  valor={linha.responsavel}
                  opcoes={responsaveis.filter((n) => n === linha.responsavel || !linha.leitores.includes(n))}
                  emEdicao={editando && editando.data === linha.data && editando.tipo === "celebrante"}
                  rotulo={`Celebrante em ${formatDateBR(linha.data)}`}
                  onIniciarEdicao={() => setEditando({ data: linha.data, tipo: "celebrante" })}
                  onConfirmar={(v) => atualizarCelula(linha.data, "celebrante", v)}
                  onCancelar={() => setEditando(null)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
