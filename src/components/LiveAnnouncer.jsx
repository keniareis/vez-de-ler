export default function LiveAnnouncer({ mensagem, mensagemId }) {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {/* Keying on mensagemId forces a fresh DOM node even when the text is
          identical to the previous announcement (e.g. "Sortear novamente"
          producing the same count), so assistive tech still re-announces it. */}
      <span key={mensagemId}>{mensagem}</span>
    </div>
  );
}
