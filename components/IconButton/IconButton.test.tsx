import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("should render icon button with correct href", () => {
    render(
      <IconButton icon="FaGithub" name="GitHub" url="https://github.com/user" />
    );
    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/user");
  });

  it("should open in new tab", () => {
    render(
      <IconButton icon="FaGithub" name="GitHub" url="https://github.com/user" />
    );
    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should render icon inside button", () => {
    const { container } = render(
      <IconButton
        icon="FaGithubSquare"
        name="GitHub"
        url="https://github.com/user"
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have accessible label", () => {
    render(
      <IconButton
        icon="FaLinkedin"
        name="LinkedIn"
        url="https://linkedin.com/in/user"
      />
    );
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
  });

  it("should render PayPal icon button", () => {
    const { container } = render(
      <IconButton icon="FaPaypal" name="PayPal" url="https://paypal.me/user" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
