import { describe, expect, it } from "vitest";
import { getProfileData } from "./dataService";

describe("getProfileData", () => {
  it("should return validated profile data", () => {
    const data = getProfileData();

    expect(data).toBeDefined();
    expect(data.profile).toBeDefined();
    expect(data.links).toBeInstanceOf(Array);
    expect(data.payment).toBeInstanceOf(Array);
    expect(data.social).toBeInstanceOf(Array);
  });

  it("should have valid profile with required fields", () => {
    const data = getProfileData();

    expect(data.profile.name).toBe("Greg Rickaby");
    expect(data.profile.bio).toBeDefined();
    expect(data.profile.company.name).toBe("Mindsize");
    expect(data.profile.company.url).toMatch(/^https?:\/\//);
    expect(data.profile.location).toBe("Alabama");
    expect(data.profile.pronouns).toBe("He/Him");
  });

  it("should have valid links array", () => {
    const data = getProfileData();

    expect(data.links.length).toBeGreaterThan(0);
    for (const link of data.links) {
      expect(link.title).toBeDefined();
      expect(link.url).toMatch(/^https?:\/\//);
      expect(link.description).toBeDefined();
    }
  });

  it("should have valid payment array with icons", () => {
    const data = getProfileData();

    expect(data.payment.length).toBeGreaterThan(0);
    for (const payment of data.payment) {
      expect(payment.name).toBeDefined();
      expect(payment.url).toMatch(/^https?:\/\//);
      expect(payment.icon).toBeDefined();
    }
  });

  it("should have valid social array with icons", () => {
    const data = getProfileData();

    expect(data.social.length).toBeGreaterThan(0);
    for (const social of data.social) {
      expect(social.name).toBeDefined();
      expect(social.url).toMatch(/^(https?|mailto):/);
      expect(social.icon).toBeDefined();
    }
  });
});
