import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import DatasStep from "./DatasStep.jsx";

function setup(overrides = {}) {
  const props = {
    igreja: "", setIgreja: vi.fn(),
    mes: 2, setMes: vi.fn(),
    ano: 2026, setAno: vi.fn(),
    diasSelecionados: new Set([0]), toggleDia: vi.fn(),
    datas: ["2026-03-01"], novaData: "", setNovaData: vi.fn(),
    gerarDatasDoMes: vi.fn(), removerData: vi.fn(), adicionarDataManual: vi.fn(),
    ...overrides,
  };
  render(<DatasStep {...props} />);
  return props;
}

describe("DatasStep", () => {
  it("associates every label with its field", () => {
    setup();
    expect(screen.getByLabelText(/nome da igreja/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mês$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^ano$/i)).toBeInTheDocument();
  });

  it("marks the selected weekday with aria-pressed and toggles it via the keyboard", async () => {
    const user = userEvent.setup();
    const props = setup();
    const domingo = screen.getByRole("button", { name: "Dom" });
    expect(domingo).toHaveAttribute("aria-pressed", "true");

    await user.tab();
    while (document.activeElement !== domingo) await user.tab();
    await user.keyboard("{Enter}");
    expect(props.toggleDia).toHaveBeenCalledWith(0);
  });

  it("labels each remove button with the date it removes", () => {
    setup();
    expect(screen.getByRole("button", { name: /remover celebração de 01\/03/i })).toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<DatasStep {...setup()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
