import { useEffect, useRef } from "react";

export default function EditableCell({ valor, opcoes, emEdicao, onIniciarEdicao, onConfirmar, onCancelar, rotulo }) {
  const btnRef = useRef(null);
  const estavaEditando = useRef(false);

  useEffect(() => {
    if (estavaEditando.current && !emEdicao) {
      btnRef.current?.focus();
    }
    estavaEditando.current = emEdicao;
  }, [emEdicao]);

  if (emEdicao) {
    return (
      <select
        // eslint-disable-next-line jsx-a11y/no-autofocus -- opening this select is itself the result of the user's own keyboard/click action, not something that happens on page load, so moving focus here is expected.
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
    <button ref={btnRef} type="button" className="cell-editable" onClick={onIniciarEdicao}>
      {valor}
    </button>
  );
}
