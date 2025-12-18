import { describe, expect, it } from "vitest";
import { getIcon } from "./iconResolver";

describe("getIcon", () => {
  it("should return FaGithubSquare icon for FaGithubSquare string", () => {
    const icon = getIcon("FaGithubSquare");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaPaypal icon for FaPaypal string", () => {
    const icon = getIcon("FaPaypal");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaVenmo icon for FaVenmo string", () => {
    const icon = getIcon("FaVenmo");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaCoffee icon for FaCoffee string", () => {
    const icon = getIcon("FaCoffee");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaLinkedin icon for FaLinkedin string", () => {
    const icon = getIcon("FaLinkedin");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaYoutubeSquare icon for FaYoutubeSquare string", () => {
    const icon = getIcon("FaYoutubeSquare");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaEnvelope icon for FaEnvelope string", () => {
    const icon = getIcon("FaEnvelope");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaGoodreads icon for FaGoodreads string", () => {
    const icon = getIcon("FaGoodreads");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return FaWpforms icon for FaWpforms string", () => {
    const icon = getIcon("FaWpforms");
    expect(icon).toBeDefined();
    expect(icon).not.toBeNull();
  });

  it("should return null for unknown icon name", () => {
    const icon = getIcon("UnknownIcon");
    expect(icon).toBeNull();
  });

  it("should return null for empty string", () => {
    const icon = getIcon("");
    expect(icon).toBeNull();
  });
});
