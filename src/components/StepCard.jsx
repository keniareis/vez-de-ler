export default function StepCard({ numero, titulo, children, as: As = "div" }) {
  return (
    <As className="card">
      <h2><span className="num" aria-hidden="true">{numero}</span>{titulo}</h2>
      {children}
    </As>
  );
}
