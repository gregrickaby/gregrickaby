import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Links } from "./Links";

describe("Links", () => {
  const mockLinks = [
    {
      title: "Test Link 1",
      url: "https://example.com/1",
      description: "First test link",
    },
    {
      title: "Test Link 2",
      url: "https://example.com/2",
      description: "Second test link",
    },
  ];

  it("should render section title", () => {
    render(<Links links={mockLinks} />);
    expect(screen.getByText("Links")).toBeInTheDocument();
  });

  it("should render all link titles", () => {
    render(<Links links={mockLinks} />);
    expect(screen.getByText("Test Link 1")).toBeInTheDocument();
    expect(screen.getByText("Test Link 2")).toBeInTheDocument();
  });

  it("should render link descriptions", () => {
    render(<Links links={mockLinks} />);
    expect(screen.getByText("First test link")).toBeInTheDocument();
    expect(screen.getByText("Second test link")).toBeInTheDocument();
  });

  it("should render links with correct URLs", () => {
    render(<Links links={mockLinks} />);
    const link1 = screen.getByText("Test Link 1").closest("a");
    const link2 = screen.getByText("Test Link 2").closest("a");

    expect(link1).toHaveAttribute("href", "https://example.com/1");
    expect(link2).toHaveAttribute("href", "https://example.com/2");
  });

  it("should open links in new tab", () => {
    render(<Links links={mockLinks} />);
    const link1 = screen.getByText("Test Link 1").closest("a");
    const link2 = screen.getByText("Test Link 2").closest("a");

    expect(link1).toHaveAttribute("target", "_blank");
    expect(link2).toHaveAttribute("target", "_blank");
    expect(link1).toHaveAttribute("rel", "noopener noreferrer");
    expect(link2).toHaveAttribute("rel", "noopener noreferrer");
  });
});
