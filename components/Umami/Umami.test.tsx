import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Umami } from "./Umami";

describe("Umami", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should not render in non-production environments", () => {
    vi.stubEnv("NODE_ENV", "test");

    const { container } = render(<Umami />);

    expect(container.firstChild).toBeNull();
  });

  it("should not render in development environment", () => {
    vi.stubEnv("NODE_ENV", "development");

    const { container } = render(<Umami />);

    expect(container.firstChild).toBeNull();
  });

  it("should render in production environment", () => {
    vi.stubEnv("NODE_ENV", "production");

    const { container } = render(<Umami />);

    expect(container).toBeTruthy();
  });
});
