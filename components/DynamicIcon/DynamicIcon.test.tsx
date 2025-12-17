import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DynamicIcon } from "./DynamicIcon";

describe("DynamicIcon", () => {
  it("should render icon when valid name is provided", () => {
    const { container } = render(<DynamicIcon name="FaGithubSquare" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render with custom size", () => {
    const { container } = render(
      <DynamicIcon name="FaGithubSquare" size={32} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("should return null when invalid icon name is provided", () => {
    const { container } = render(<DynamicIcon name="InvalidIcon" />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null when empty string is provided", () => {
    const { container } = render(<DynamicIcon name="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render FaPaypal icon", () => {
    const { container } = render(<DynamicIcon name="FaPaypal" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render FaLinkedin icon", () => {
    const { container } = render(<DynamicIcon name="FaLinkedin" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
