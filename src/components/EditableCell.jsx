export default function EditableCell({ valor, opcoes, emEdicao, onIniciarEdicao, onConfirmar, onCancelar, rotulo }) {
  if (emEdicao) {
    return (
      <select
        autoFocus
        className="cell-select"
        aria-label={rotulo}
        value={valor}
        onChange={(e) => onConfirmar(e.target.value)}
        onBlur={onCancelar}
      >
        {opcoes.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    );
  }
  return (
    <button type="button" className="cell-editable" onClick={onIniciarEdicao}>
      {valor}
    </button>
  );
}
