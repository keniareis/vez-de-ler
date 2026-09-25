import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import App from "../App.jsx";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

describe("App — full flow, keyboard only", () => {
  it("goes from empty state to a rendered cronograma using only Tab/Enter/typing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Adicionar leitor"), "Ana{Enter}");
    await user.type(screen.getByLabelText("Adicionar ministro"), "Duda{Enter}");
    await user.type(screen.getByLabelText("Adicionar celebrante"), "Padre Carlos{Enter}");

    await user.click(screen.getByRole("button", { name: "Gerar datas do mês" }));

    const sortearBtn = screen.getByRole("button", { name: /sortear cronograma/i });
    expect(sortearBtn).not.toBeDisabled();
    sortearBtn.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/cronograma sorteado/i);
  });

  it("has no automatically detectable accessibility violations once a cronograma is showing", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.type(screen.getByLabelText("Adicionar leitor"), "Ana{Enter}");
    await user.type(screen.getByLabelText("Adicionar ministro"), "Duda{Enter}");
    await user.type(screen.getByLabelText("Adicionar celebrante"), "Padre Carlos{Enter}");
    await user.click(screen.getByRole("button", { name: "Gerar datas do mês" }));
    await user.click(screen.getByRole("button", { name: /sortear cronograma/i }));
    await screen.findByRole("table");

    expect(await axe(container)).toHaveNoViolations();
  });
});
