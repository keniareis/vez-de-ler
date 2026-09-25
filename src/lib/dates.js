export const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const DIAS_SEMANA = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
export const DIAS_ABREV = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export function pad(n) {
  return n.toString().padStart(2, "0");
}

export function formatDateBR(iso) {
  const [, m, d] = iso.split("-").map(Number);
  return `${pad(d)}/${pad(m)}`;
}

export function weekdayOf(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function datasDoMes(ano, mes, diasSelecionados) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const novas = [];
  for (let d = 1; d <= diasNoMes; d++) {
    const dt = new Date(ano, mes, d);
    if (diasSelecionados.has(dt.getDay())) {
      novas.push(`${ano}-${pad(mes + 1)}-${pad(d)}`);
    }
  }
  return novas;
}
