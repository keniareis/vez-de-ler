export default function SorteioButton({ podeSortear, onSortear }) {
  return (
    <>
      <button
        className="primary"
        type="button"
        disabled={!podeSortear}
        aria-describedby={!podeSortear ? "sortear-hint" : undefined}
        onClick={onSortear}
      >
        Sortear cronograma
      </button>
      {!podeSortear && (
        <div id="sortear-hint" className="empty-hint">
          Adicione datas, leitores, ministros e celebrantes para sortear.
        </div>
      )}
    </>
  );
}
