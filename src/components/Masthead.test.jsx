import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Masthead from "./Masthead.jsx";
import StepCard from "./StepCard.jsx";
import LiveAnnouncer from "./LiveAnnouncer.jsx";

describe("Masthead", () => {
  it("renders exactly one h1 with the app name and an alt-texted logo", () => {
    render(<Masthead />);
    expect(screen.getByRole("heading", { level: 1, name: "Vez de Ler" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /pascom/i })).toBeInTheDocument();
  });
});

describe("StepCard", () => {
  it("renders an h2 with the step title and its children", () => {
    render(<StepCard numero={1} titulo="Passo um">Conteúdo</StepCard>);
    // The numbered badge is aria-hidden, so the heading's accessible name is just the title.
    expect(screen.getByRole("heading", { level: 2, name: "Passo um" })).toBeInTheDocument();
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });
});

describe("LiveAnnouncer", () => {
  it("exposes the message through a polite status region", () => {
    render(<LiveAnnouncer mensagem="Cronograma sorteado com 4 celebrações." />);
    expect(screen.getByRole("status")).toHaveTextContent("Cronograma sorteado com 4 celebrações.");
  });
});
