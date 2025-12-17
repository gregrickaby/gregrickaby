import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";

describe("ThemeSwitcher", () => {
  it("should render theme switcher button", () => {
    const { container } = render(<ThemeSwitcher />);
    const button = container.querySelector(".btn-circle");
    expect(button).toBeInTheDocument();
  });

  it("should render all DaisyUI themes", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("Cupcake")).toBeInTheDocument();
    expect(screen.getByText("Bumblebee")).toBeInTheDocument();
  });
});
