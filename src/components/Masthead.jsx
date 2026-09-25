import logo from "../assets/logo-pascom.png";

export default function Masthead() {
  return (
    <header className="masthead">
      <img className="logo" src={logo} alt="Logo PASCOM" />
      <div className="kicker">ORGANIZADOR MENSAL</div>
      <h1>Vez de Ler</h1>
      <div className="sub">Monte o cronograma das celebrações do mês e exporte em PDF</div>
    </header>
  );
}
