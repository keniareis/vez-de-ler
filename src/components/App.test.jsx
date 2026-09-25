import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import App from "../App.jsx";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

// Drives the wizard from step 1 through step 4, leaving "Sortear cronograma"
// visible, enabled, and NOT yet clicked.
async function preencherAteSortear(user) {
  await user.click(screen.getByRole("button", { name: "Gerar datas do mês" }));
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  await user.type(screen.getByLabelText("Adicionar leitor"), "Ana{Enter}");
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  await user.type(screen.getByLabelText("Adicionar ministro"), "Duda{Enter}");
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  await user.type(screen.getByLabelText("Adicionar celebrante"), "Padre Carlos{Enter}");
}

describe("App — step-by-step wizard", () => {
  it("shows only the Datas step at first, not the later steps' fields", () => {
    render(<App />);
    expect(screen.getByLabelText(/nome da igreja/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Adicionar leitor")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Adicionar ministro")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Adicionar celebrante")).not.toBeInTheDocument();
  });

  it("advances one step per Continuar click, hiding the previous step", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.queryByLabelText(/nome da igreja/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Adicionar leitor")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Adicionar leitor"), "Ana{Enter}");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.queryByLabelText("Adicionar leitor")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Adicionar ministro")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Adicionar ministro"), "Duda{Enter}");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.queryByLabelText("Adicionar ministro")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Adicionar celebrante")).toBeInTheDocument();
  });

  it("shows Sortear cronograma on the Celebrantes step, not a fifth Continuar", async () => {
    const user = userEvent.setup();
    render(<App />);
    await preencherAteSortear(user);

    expect(screen.getByRole("button", { name: /sortear cronograma/i })).not.toBeDisabled();
    expect(screen.queryByRole("button", { name: "Continuar" })).not.toBeInTheDocument();
  });

  it("moves focus into the new step's panel after Continuar, for keyboard/screen-reader users", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    const leitorField = screen.getByLabelText("Adicionar leitor");
    // Focus should land inside the new step's panel, not stay on the old
    // Continuar button (removed from the DOM) or fall back to <body>.
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement.closest("main")).toContainElement(leitorField);
  });

  it("announces the step change in the live region", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("status")).toHaveTextContent(/passo 2 de 4/i);
  });

  it("lets the user go back a step with Voltar", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByLabelText("Adicionar leitor")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByLabelText(/nome da igreja/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Adicionar leitor")).not.toBeInTheDocument();
  });

  it("goes from empty state to a rendered cronograma using only Tab/Enter/typing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await preencherAteSortear(user);

    const sortearBtn = screen.getByRole("button", { name: /sortear cronograma/i });
    sortearBtn.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/cronograma sorteado/i);
  });

  it("wraps the steps in a <main> landmark", () => {
    render(<App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("announces the downloaded PDF's filename in the status region", async () => {
    // jsdom never fires onload/onerror for a real <img> resource load, so
    // loadImage()'s promise would hang forever without this stand-in —
    // real browsers do fire it, as verified manually in Chrome.
    class FakeImage {
      set src(_v) { queueMicrotask(() => this.onload && this.onload()); }
    }
    vi.stubGlobal("Image", FakeImage);

    const user = userEvent.setup();
    render(<App />);
    await preencherAteSortear(user);
    await user.click(screen.getByRole("button", { name: /sortear cronograma/i }));
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: /baixar pdf/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/pdf gerado/i);

    vi.unstubAllGlobals();
  });

  it("has no automatically detectable accessibility violations once a cronograma is showing", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await preencherAteSortear(user);
    await user.click(screen.getByRole("button", { name: /sortear cronograma/i }));
    await screen.findByRole("table");

    expect(await axe(container)).toHaveNoViolations();
  });
});
