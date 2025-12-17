import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { IconModal } from "./IconModal";

describe("IconModal", () => {
  const mockItems = [
    { name: "Item 1", url: "https://example.com/1", icon: "FaGithubSquare" },
    { name: "Item 2", url: "mailto:test@example.com", icon: "FaEnvelope" },
  ];

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it("should render button with correct text", () => {
    render(
      <IconModal
        items={mockItems}
        buttonText="Open Modal"
        modalTitle="Test Modal"
      />
    );

    expect(
      screen.getByRole("button", { name: "Open Modal" })
    ).toBeInTheDocument();
  });

  it("should return null when items array is empty", () => {
    const { container } = render(
      <IconModal items={[]} buttonText="Open Modal" modalTitle="Test Modal" />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render modal with correct title", () => {
    render(
      <IconModal
        items={mockItems}
        buttonText="Open Modal"
        modalTitle="Test Modal"
      />
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("should render all items", () => {
    render(
      <IconModal
        items={mockItems}
        buttonText="Open Modal"
        modalTitle="Test Modal"
      />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("should render item links correctly", () => {
    render(
      <IconModal
        items={mockItems}
        buttonText="Open Modal"
        modalTitle="Test Modal"
      />
    );

    expect(screen.getByText("example.com/1")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    const link1 = screen.getByText("example.com/1").closest("a");
    const link2 = screen.getByText("test@example.com").closest("a");

    expect(link1).toHaveAttribute("href", "https://example.com/1");
    expect(link2).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("should call showModal when button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <IconModal
        items={mockItems}
        buttonText="Open Modal"
        modalTitle="Test Modal"
      />
    );

    const button = screen.getByRole("button", { name: "Open Modal" });
    await user.click(button);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });
});
