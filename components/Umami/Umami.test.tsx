import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Umami } from "./Umami";

describe("Umami", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should not render in non-production environments", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("UMAMI_URL", "https://umami.example.com/script.js");
    vi.stubEnv("UMAMI_WEBSITE_ID", "test-website-id");

    const { container } = render(<Umami />);

    expect(container.firstChild).toBeNull();
  });

  it("should not render in development environment", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("UMAMI_URL", "https://umami.example.com/script.js");
    vi.stubEnv("UMAMI_WEBSITE_ID", "test-website-id");

    const { container } = render(<Umami />);

    expect(container.firstChild).toBeNull();
  });

  it("should render in production environment", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UMAMI_URL", "https://umami.example.com/script.js");
    vi.stubEnv("UMAMI_WEBSITE_ID", "test-website-id");

    const { container } = render(<Umami />);

    expect(container).toBeTruthy();
  });
});
