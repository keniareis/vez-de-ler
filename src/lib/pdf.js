import { jsPDF } from "jspdf";
import { pad, formatDateBR, weekdayOf, MESES, DIAS_ABREV } from "./dates.js";

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function gerarPDF({ cronograma, igreja, mes, ano, logoImage }) {
  const today = new Date();
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const tableRight = pageW - marginX;

  const COL_INK = [32, 36, 43];
  const COL_INK_SOFT = [87, 98, 111];
  const COL_GOLD = [245, 168, 28];
  const COL_BLUE = [0, 134, 195];
  const COL_BLUE_DARK = [0, 102, 154];
  const COL_GREEN_TEXT = [46, 125, 50]; // contrast-fixed dark green, for text only (see ACCESSIBILITY_SPEC.md §7)
  const COL_GREEN_BRAND = [82, 185, 71]; // PASCOM brand green, for the decorative stripe (no text-contrast reason to change it)
  const COL_PAPER = [247, 250, 252];
  const COL_ZEBRA = [235, 246, 251];

  function paginaBase() {
    doc.setFillColor(...COL_PAPER);
    doc.rect(0, 0, pageW, pageH, "F");
    const stripeH = 3.2;
    doc.setFillColor(...COL_GOLD);
    doc.rect(0, 0, pageW / 3, stripeH, "F");
    doc.setFillColor(...COL_BLUE);
    doc.rect(pageW / 3, 0, pageW / 3, stripeH, "F");
    doc.setFillColor(...COL_GREEN_BRAND);
    doc.rect((2 * pageW) / 3, 0, pageW / 3, stripeH, "F");
    doc.setDrawColor(220, 228, 235);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageH - 14, tableRight, pageH - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 160);
    doc.text(
      "Vez de Ler · PASCOM · Gerado em " + `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`,
      marginX, pageH - 10
    );
    // The final page-numbering pass below draws the definitive "Página N de M"
    // once the total is known — drawing a page number here too would overlap it.
  }

  paginaBase();
  let y = 16;

  if (logoImage) {
    const logoW = 22;
    const logoH = logoW * (logoImage.naturalHeight / logoImage.naturalWidth);
    try {
      doc.addImage(logoImage, "PNG", pageW / 2 - logoW / 2, y, logoW, logoH);
      y += logoH + 6;
    } catch {
      /* ignore — schedule still renders without the logo */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...COL_GREEN_TEXT);
  doc.text("CRONOGRAMA MENSAL", pageW / 2, y, { align: "center", charSpace: 1.2 });
  y += 9;

  doc.setFont("times", "bold");
  doc.setFontSize(23);
  doc.setTextColor(...COL_BLUE_DARK);
  doc.text("Vez de Ler", pageW / 2, y, { align: "center" });
  y += 7.5;

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...COL_INK_SOFT);
  if (igreja) {
    doc.text(igreja, pageW / 2, y, { align: "center" });
    y += 6;
  }
  doc.text(`${MESES[mes]} de ${ano}`, pageW / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(...COL_GOLD);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, tableRight, y);
  y += 10;

  const colData = marginX + 3;
  const colLeitores = marginX + 30;
  const colMinistros = marginX + 98;
  const colResp = marginX + 154;
  const colLeitoresW = 66;
  const colMinistrosW = 54;
  const colRespW = 38;
  const padTop = 8;

  function cabecalhoTabela() {
    doc.setFillColor(...COL_BLUE_DARK);
    doc.rect(marginX, y - 5.5, tableRight - marginX, 9.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("DATA", colData, y);
    doc.text("LEITOR(ES)", colLeitores, y);
    doc.text("MINISTRO(S)", colMinistros, y);
    doc.text("CELEBRANTE", colResp, y);
    y += padTop;
  }

  cabecalhoTabela();

  cronograma.forEach((linha, idx) => {
    const wd = DIAS_ABREV[weekdayOf(linha.data)];
    const leitoresTxt = doc.splitTextToSize(linha.leitores.join(", "), colLeitoresW);
    const ministrosTxt = doc.splitTextToSize(linha.ministros.join(", "), colMinistrosW);
    const respTxt = doc.splitTextToSize(linha.responsavel, colRespW);
    const nLinhas = Math.max(1, leitoresTxt.length, ministrosTxt.length, respTxt.length);
    const alturaLinha = nLinhas * 5 + 6;

    if (y + alturaLinha > pageH - 20) {
      doc.addPage();
      paginaBase();
      y = 24;
      cabecalhoTabela();
    }

    doc.setFillColor(...(idx % 2 === 0 ? COL_ZEBRA : [255, 255, 255]));
    doc.rect(marginX, y - 5, tableRight - marginX, alturaLinha, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COL_BLUE_DARK);
    doc.text(formatDateBR(linha.data), colData, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COL_INK_SOFT);
    doc.text(wd, colData, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COL_INK);
    doc.text(leitoresTxt, colLeitores, y);
    doc.text(ministrosTxt, colMinistros, y);
    doc.text(respTxt, colResp, y);

    y += alturaLinha;
    doc.setDrawColor(220, 228, 235);
    doc.setLineWidth(0.3);
    doc.line(marginX, y - 5, tableRight, y - 5);
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...COL_PAPER);
    doc.setDrawColor(220, 228, 235);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(154, 146, 132);
    doc.text(`Página ${p} de ${totalPages}`, tableRight, pageH - 10, { align: "right" });
  }

  return doc;
}
