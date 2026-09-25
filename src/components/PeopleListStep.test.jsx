import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import PeopleListStep from "./PeopleListStep.jsx";

function setup(overrides = {}) {
  const props = {
    numero: 2, titulo: "Leitores", corChip: "chip-blue",
    campoId: "novo-leitor", rotuloCampo: "Adicionar leitor", placeholder: "Nome do leitor",
    valorCampo: "", onValorCampoChange: vi.fn(), onAdicionar: vi.fn(),
    lista: ["Ana", "Beto"], onRemover: vi.fn(),
    rotuloPorCelebracao: "Leitor(es) por celebração", valorPorCelebracao: 2, onValorPorCelebracaoChange: vi.fn(),
    ...overrides,
  };
  render(<PeopleListStep {...props} />);
  return props;
}

describe("PeopleListStep", () => {
  it("associates the add-field label and the per-celebration count label", () => {
    setup();
    expect(screen.getByLabelText("Adicionar leitor")).toBeInTheDocument();
    expect(screen.getByLabelText("Leitor(es) por celebração")).toBeInTheDocument();
  });

  it("labels each remove button with the person's name", () => {
    setup();
    expect(screen.getByRole("button", { name: "Remover Ana" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover Beto" })).toBeInTheDocument();
  });

  it("adds a name when Enter is pressed in the text field", async () => {
    const user = userEvent.setup();
    const props = setup();
    await user.type(screen.getByLabelText("Adicionar leitor"), "Cris{Enter}");
    expect(props.onAdicionar).toHaveBeenCalled();
  });

  it("omits the per-celebration field when not provided (celebrantes step)", () => {
    setup({ rotuloPorCelebracao: undefined, valorPorCelebracao: undefined, onValorPorCelebracaoChange: undefined });
    expect(screen.queryByLabelText(/por celebração/i)).not.toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<PeopleListStep {...setup()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
