import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkCard } from "./LinkCard";

const mockLink = {
  title: "My Blog",
  url: "https://blog.example.com",
  description: "Read my latest articles",
};

describe("LinkCard", () => {
  it("should render link title", () => {
    render(<LinkCard link={mockLink} />);
    expect(screen.getByText("My Blog")).toBeInTheDocument();
  });

  it("should render link description", () => {
    render(<LinkCard link={mockLink} />);
    expect(screen.getByText("Read my latest articles")).toBeInTheDocument();
  });

  it("should render as anchor with correct href", () => {
    render(<LinkCard link={mockLink} />);
    const anchor = screen.getByRole("link");
    expect(anchor).toHaveAttribute("href", "https://blog.example.com");
  });

  it("should open in new tab", () => {
    render(<LinkCard link={mockLink} />);
    const anchor = screen.getByRole("link");
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should not render description when empty", () => {
    const linkWithoutDescription = {
      ...mockLink,
      description: "",
    };
    render(<LinkCard link={linkWithoutDescription} />);
    expect(
      screen.queryByText("Read my latest articles")
    ).not.toBeInTheDocument();
  });
});
