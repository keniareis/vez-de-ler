export default function LiveAnnouncer({ mensagem }) {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {mensagem}
    </div>
  );
}
