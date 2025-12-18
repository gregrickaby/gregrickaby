import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

describe("Footer", () => {
  const mockData = {
    profile: {
      name: "John Doe",
      siteTitle: "John Doe - Developer",
      bio: "Test bio",
      url: "https://example.com",
      company: {
        name: "Example Corp",
        role: "Developer",
        url: "https://example.com/company",
      },
      location: "New York, NY",
      pronouns: "he/him",
    },
    links: [],
    contact: [],
    payment: [],
    social: [],
  };

  it("should render profile name in copyright", () => {
    render(<Footer {...mockData} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it("should render current year in copyright", () => {
    render(<Footer {...mockData} />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(String(currentYear)))
    ).toBeInTheDocument();
  });

  it("should render full copyright range", () => {
    render(<Footer {...mockData} />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© 1997-${currentYear} John Doe`)
    ).toBeInTheDocument();
  });

  it("should render data.json link", () => {
    render(<Footer {...mockData} />);
    const link = screen.getByLabelText("View this site's JSON data");
    expect(link).toHaveAttribute("href", "/data.json");
  });
});
