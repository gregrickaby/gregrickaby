import { describe, expect, it } from "vitest";
import {
  LinkSchema,
  PaymentLinkSchema,
  ProfileDataSchema,
  ProfileSchema,
  SocialLinkSchema,
} from "./profileSchema";

describe("ProfileSchema", () => {
  it("should validate a valid profile", () => {
    const validProfile = {
      name: "John Doe",
      bio: "Software Engineer",
      url: "https://example.com",
      company: {
        name: "Tech Corp",
        url: "https://techcorp.com",
      },
      location: "New York",
      pronouns: "he/him",
    };

    expect(() => ProfileSchema.parse(validProfile)).not.toThrow();
  });

  it("should reject profile with empty name", () => {
    const invalidProfile = {
      name: "",
      bio: "Software Engineer",
      url: "https://example.com",
      company: {
        name: "Tech Corp",
        url: "https://techcorp.com",
      },
      location: "New York",
      pronouns: "he/him",
    };

    expect(() => ProfileSchema.parse(invalidProfile)).toThrow();
  });

  it("should reject profile with invalid URL", () => {
    const invalidProfile = {
      name: "John Doe",
      bio: "Software Engineer",
      url: "not-a-url",
      company: {
        name: "Tech Corp",
        url: "https://techcorp.com",
      },
      location: "New York",
      pronouns: "he/him",
    };

    expect(() => ProfileSchema.parse(invalidProfile)).toThrow();
  });
});

describe("LinkSchema", () => {
  it("should validate a valid link", () => {
    const validLink = {
      title: "My Blog",
      url: "https://blog.example.com",
      description: "Read my articles",
    };

    expect(() => LinkSchema.parse(validLink)).not.toThrow();
  });

  it("should reject link with empty title", () => {
    const invalidLink = {
      title: "",
      url: "https://blog.example.com",
      description: "Read my articles",
    };

    expect(() => LinkSchema.parse(invalidLink)).toThrow();
  });

  it("should reject link with invalid URL", () => {
    const invalidLink = {
      title: "My Blog",
      url: "not-a-url",
      description: "Read my articles",
    };

    expect(() => LinkSchema.parse(invalidLink)).toThrow();
  });
});

describe("SocialLinkSchema", () => {
  it("should validate a valid social link", () => {
    const validSocial = {
      name: "GitHub",
      url: "https://github.com/user",
      icon: "FaGithub",
    };

    expect(() => SocialLinkSchema.parse(validSocial)).not.toThrow();
  });

  it("should reject social link with empty icon", () => {
    const invalidSocial = {
      name: "GitHub",
      url: "https://github.com/user",
      icon: "",
    };

    expect(() => SocialLinkSchema.parse(invalidSocial)).toThrow();
  });
});

describe("PaymentLinkSchema", () => {
  it("should validate a valid payment link", () => {
    const validPayment = {
      name: "PayPal",
      url: "https://paypal.me/user",
      icon: "FaPaypal",
    };

    expect(() => PaymentLinkSchema.parse(validPayment)).not.toThrow();
  });

  it("should reject payment link with invalid URL", () => {
    const invalidPayment = {
      name: "PayPal",
      url: "invalid",
      icon: "FaPaypal",
    };

    expect(() => PaymentLinkSchema.parse(invalidPayment)).toThrow();
  });
});

describe("ProfileDataSchema", () => {
  it("should validate complete profile data", () => {
    const validData = {
      profile: {
        name: "John Doe",
        bio: "Software Engineer",
        url: "https://example.com",
        company: {
          name: "Tech Corp",
          url: "https://techcorp.com",
        },
        location: "New York",
        pronouns: "he/him",
      },
      links: [
        {
          title: "Blog",
          url: "https://blog.example.com",
          description: "Read my articles",
        },
      ],
      contact: [
        {
          name: "Email",
          url: "mailto:test@example.com",
          icon: "FaEnvelope",
        },
      ],
      payment: [
        {
          name: "PayPal",
          url: "https://paypal.me/user",
          icon: "FaPaypal",
        },
      ],
      social: [
        {
          name: "GitHub",
          url: "https://github.com/user",
          icon: "FaGithub",
        },
      ],
    };

    expect(() => ProfileDataSchema.parse(validData)).not.toThrow();
  });

  it("should reject data with invalid nested profile", () => {
    const invalidData = {
      profile: {
        name: "",
        bio: "Software Engineer",
        url: "https://example.com",
        company: {
          name: "Tech Corp",
          url: "https://techcorp.com",
        },
        location: "New York",
        pronouns: "he/him",
      },
      links: [],
      contact: [],
      payment: [],
      social: [],
    };

    expect(() => ProfileDataSchema.parse(invalidData)).toThrow();
  });

  it("should reject data with invalid links array", () => {
    const invalidData = {
      profile: {
        name: "John Doe",
        bio: "Software Engineer",
        url: "https://example.com",
        company: {
          name: "Tech Corp",
          url: "https://techcorp.com",
        },
        location: "New York",
        pronouns: "he/him",
      },
      links: [
        {
          title: "",
          url: "invalid-url",
          description: "Invalid",
        },
      ],
      contact: [],
      payment: [],
      social: [],
    };

    expect(() => ProfileDataSchema.parse(invalidData)).toThrow();
  });
});
