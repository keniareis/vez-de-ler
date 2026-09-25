import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import PeopleListStep from "./PeopleListStep.jsx";

// A real stateful wrapper — testing the onChange/onBlur clamping contract
// against a static, never-updated `value` prop doesn't work: React reverts
// a controlled input's displayed value to that fixed prop after every
// event, so a second event (blur) would never see the first event's typed
// value. This wrapper mirrors how useEscala actually drives the field.
function ControlledCount({ onChangeSpy, valorInicial = 2 }) {
  const [valor, setValor] = useState(valorInicial);
  return (
    <PeopleListStep
      numero={2} titulo="Leitores" corChip="chip-blue" singular="leitor"
      campoId="novo-leitor" rotuloCampo="Adicionar leitor" placeholder="Nome do leitor"
      valorCampo="" onValorCampoChange={() => {}} onAdicionar={() => {}}
      lista={[]} onRemover={() => {}}
      rotuloPorCelebracao="Leitor(es) por celebração"
      valorPorCelebracao={valor}
      onValorPorCelebracaoChange={(v) => { setValor(v); onChangeSpy(v); }}
    />
  );
}

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

  it("does not snap the per-celebration count back to 1 while the field is being cleared to retype it — only clamps on blur", () => {
    const onChangeSpy = vi.fn();
    render(<ControlledCount onChangeSpy={onChangeSpy} />);
    const input = screen.getByLabelText("Leitor(es) por celebração");

    fireEvent.change(input, { target: { value: "" } });
    expect(onChangeSpy).not.toHaveBeenCalledWith(1);
    expect(input.value).toBe("");

    fireEvent.blur(input);
    expect(onChangeSpy).toHaveBeenLastCalledWith(1);
  });

  it("clamps the per-celebration count to the 1-6 range on blur", () => {
    const onChangeSpy = vi.fn();
    render(<ControlledCount onChangeSpy={onChangeSpy} />);
    const input = screen.getByLabelText("Leitor(es) por celebração");

    fireEvent.change(input, { target: { value: "13" } });
    fireEvent.blur(input);
    expect(onChangeSpy).toHaveBeenLastCalledWith(6);
  });

  it("uses the correct singular in the empty-list hint instead of a naive plural-to-singular regex", () => {
    // "Leitores" is exactly the case a naive /s$/ strip gets wrong: it
    // yields "leitore", not "leitor".
    setup({ lista: [], titulo: "Leitores", singular: "leitor" });
    expect(screen.getByText("Nenhum leitor adicionado ainda.")).toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<PeopleListStep {...setup()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
