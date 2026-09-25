import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SorteioButton from "./SorteioButton.jsx";

describe("SorteioButton", () => {
  it("when disabled, points aria-describedby at visible text explaining what's missing", () => {
    render(<SorteioButton podeSortear={false} onSortear={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /sortear cronograma/i });
    expect(btn).toBeDisabled();
    const descId = btn.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId)).toHaveTextContent(/adicione datas, leitores, ministros e celebrantes/i);
  });

  it("when enabled, has no aria-describedby and calls onSortear when activated", () => {
    const onSortear = vi.fn();
    render(<SorteioButton podeSortear={true} onSortear={onSortear} />);
    const btn = screen.getByRole("button", { name: /sortear cronograma/i });
    expect(btn).not.toBeDisabled();
    expect(btn).not.toHaveAttribute("aria-describedby");
    btn.click();
    expect(onSortear).toHaveBeenCalled();
  });
});
