import StepCard from "./StepCard.jsx";

export default function PeopleListStep({
  numero, titulo, corChip, singular,
  campoId, rotuloCampo, placeholder, valorCampo, onValorCampoChange, onAdicionar,
  lista, onRemover,
  rotuloPorCelebracao, valorPorCelebracao, onValorPorCelebracaoChange,
}) {
  return (
    <StepCard numero={numero} titulo={titulo}>
      {rotuloPorCelebracao && (
        <>
          <label htmlFor={`${campoId}-por-cel`}>{rotuloPorCelebracao}</label>
          <input
            id={`${campoId}-por-cel`}
            type="number" min="1" max="6"
            value={valorPorCelebracao}
            onChange={(e) => onValorPorCelebracaoChange(e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={(e) => onValorPorCelebracaoChange(Math.min(6, Math.max(1, Number(e.target.value) || 1)))}
          />
        </>
      )}

      <label htmlFor={campoId}>{rotuloCampo}</label>
      <div className="add-date-row">
        <input
          id={campoId}
          type="text"
          value={valorCampo}
          onChange={(e) => onValorCampoChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdicionar(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={onAdicionar}>Adicionar</button>
      </div>

      {lista.length > 0 ? (
        <ul className={`chip-list`}>
          {lista.map((nome) => (
            <li className={`chip ${corChip}`} key={nome}>
              {nome}
              <button type="button" onClick={() => onRemover(nome)} aria-label={`Remover ${nome}`}>×</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-hint">Nenhum {singular} adicionado ainda.</div>
      )}
    </StepCard>
  );
}
