import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileCard } from "./ProfileCard";

const mockProfile = {
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

describe("ProfileCard", () => {
  it("should render profile name", () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render profile bio", () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("should render profile company", () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
  });

  it("should render pronouns and location", () => {
    render(<ProfileCard profile={mockProfile} />);
    expect(screen.getByText("he/him · New York")).toBeInTheDocument();
  });

  it("should render avatar image", () => {
    render(<ProfileCard profile={mockProfile} />);
    const img = screen.getByAltText("John Doe");
    expect(img).toBeInTheDocument();
  });
});
