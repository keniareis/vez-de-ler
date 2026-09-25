import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import CronogramaTable from "./CronogramaTable.jsx";

function setup() {
  const atualizarCelula = vi.fn();
  const setEditando = vi.fn();
  const cronograma = [
    { data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" },
  ];
  const utils = render(
    <CronogramaTable
      cronograma={cronograma}
      editando={null}
      setEditando={setEditando}
      atualizarCelula={atualizarCelula}
      leitores={["Ana", "Beto", "Cris"]}
      ministros={["Duda", "Elo"]}
      responsaveis={["Padre Carlos", "Padre João"]}
    />
  );
  return { ...utils, atualizarCelula, setEditando, cronograma };
}

describe("CronogramaTable", () => {
  it("uses scope=col on every header and provides a caption", () => {
    setup();
    screen.getAllByRole("columnheader").forEach((th) => expect(th).toHaveAttribute("scope", "col"));
    expect(screen.getByText(/cronograma de leitores, ministros e celebrante/i)).toBeInTheDocument();
  });

  it("a name is a real button reachable and operable by keyboard alone", async () => {
    const user = userEvent.setup();
    const { setEditando } = setup();
    const nomeBtn = screen.getByRole("button", { name: "Ana" });
    nomeBtn.focus();
    expect(nomeBtn).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(setEditando).toHaveBeenCalledWith({ data: "2026-03-01", tipo: "leitor", idx: 0 });
  });

  it("when editing, offers a select of the other available names and commits on change", async () => {
    const atualizarCelula = vi.fn();
    const cronograma = [
      { data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" },
    ];
    render(
      <CronogramaTable
        cronograma={cronograma}
        editando={{ data: "2026-03-01", tipo: "leitor", idx: 0 }}
        setEditando={vi.fn()}
        atualizarCelula={atualizarCelula}
        leitores={["Ana", "Beto", "Cris"]}
        ministros={["Duda", "Elo"]}
        responsaveis={["Padre Carlos", "Padre João"]}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveFocus();
    await userEvent.selectOptions(select, "Cris");
    expect(atualizarCelula).toHaveBeenCalledWith("2026-03-01", "leitor", "Cris", 0);
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = setup();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("excludes the day's celebrant from a reader's edit options", () => {
    render(
      <CronogramaTable
        cronograma={[{ data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Cris" }]}
        editando={{ data: "2026-03-01", tipo: "leitor", idx: 0 }}
        setEditando={vi.fn()}
        atualizarCelula={vi.fn()}
        leitores={["Ana", "Beto", "Cris"]}
        ministros={["Duda", "Elo"]}
        responsaveis={["Cris", "Padre João"]}
      />
    );
    const select = screen.getByRole("combobox");
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).not.toContain("Cris");
  });

  it("excludes the day's readers from the celebrant's edit options", () => {
    render(
      <CronogramaTable
        cronograma={[{ data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" }]}
        editando={{ data: "2026-03-01", tipo: "celebrante" }}
        setEditando={vi.fn()}
        atualizarCelula={vi.fn()}
        leitores={["Ana", "Beto", "Cris"]}
        ministros={["Duda", "Elo"]}
        responsaveis={["Padre Carlos", "Ana"]}
      />
    );
    const select = screen.getByRole("combobox");
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).not.toContain("Ana");
  });

  it("returns focus to the cell button after cancelling an edit (blur without a change)", () => {
    const cronograma = [
      { data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" },
    ];
    const commonProps = {
      cronograma,
      atualizarCelula: vi.fn(),
      leitores: ["Ana", "Beto", "Cris"],
      ministros: ["Duda", "Elo"],
      responsaveis: ["Padre Carlos", "Padre João"],
    };
    const { rerender } = render(<CronogramaTable {...commonProps} editando={null} setEditando={vi.fn()} />);

    rerender(<CronogramaTable {...commonProps} editando={{ data: "2026-03-01", tipo: "leitor", idx: 0 }} setEditando={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveFocus();

    // Simulates onBlur -> onCancelar -> setEditando(null) with no value change.
    rerender(<CronogramaTable {...commonProps} editando={null} setEditando={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Ana" })).toHaveFocus();
  });

  it("returns focus to the cell button after committing a new value", () => {
    const commonProps = {
      atualizarCelula: vi.fn(),
      leitores: ["Ana", "Beto", "Cris"],
      ministros: ["Duda", "Elo"],
      responsaveis: ["Padre Carlos", "Padre João"],
    };
    const { rerender } = render(
      <CronogramaTable
        {...commonProps}
        cronograma={[{ data: "2026-03-01", leitores: ["Ana", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" }]}
        editando={{ data: "2026-03-01", tipo: "leitor", idx: 0 }}
        setEditando={vi.fn()}
      />
    );
    expect(screen.getByRole("combobox")).toHaveFocus();

    // Simulates onChange -> atualizarCelula (parent updates cronograma) -> onConfirmar -> setEditando(null).
    rerender(
      <CronogramaTable
        {...commonProps}
        cronograma={[{ data: "2026-03-01", leitores: ["Cris", "Beto"], ministros: ["Duda"], responsavel: "Padre Carlos" }]}
        editando={null}
        setEditando={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Cris" })).toHaveFocus();
  });
});
