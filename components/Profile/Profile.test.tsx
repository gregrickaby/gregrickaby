import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Profile } from "./Profile";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: { src: string };
    alt: string;
    width?: number;
    height?: number;
  }) => {
    const imgSrc = typeof src === "object" ? src.src : src;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imgSrc} alt={alt} width={width} height={height} />;
  },
}));

describe("Profile", () => {
  const mockProps = {
    profile: {
      name: "John Doe",
      siteTitle: "John Doe - Developer",
      bio: "Test bio description",
      url: "https://example.com",
      company: {
        name: "Example Corp",
        role: "Developer",
        url: "https://example.com/company",
      },
      pronouns: "he/him",
      location: "New York, NY",
    },
    contact: [
      { name: "Email", url: "mailto:test@example.com", icon: "FaEnvelope" },
    ],
    payment: [
      { name: "PayPal", url: "https://paypal.me/test", icon: "FaCcPaypal" },
    ],
    social: [
      {
        name: "GitHub",
        url: "https://github.com/test",
        icon: "FaGithubSquare",
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/test",
        icon: "FaLinkedin",
      },
    ],
  };

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it("should render profile name", () => {
    render(<Profile {...mockProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render company and role", () => {
    render(<Profile {...mockProps} />);
    expect(screen.getByText(/Developer, Example Corp/)).toBeInTheDocument();
  });

  it("should render pronouns and location", () => {
    render(<Profile {...mockProps} />);
    expect(screen.getByText(/he\/him/)).toBeInTheDocument();
    expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
  });

  it("should render bio", () => {
    render(<Profile {...mockProps} />);
    expect(screen.getByText("Test bio description")).toBeInTheDocument();
  });

  it("should render social links", () => {
    render(<Profile {...mockProps} />);
    const githubLink = screen.getByRole("link", { name: "GitHub" });
    const linkedinLink = screen.getByRole("link", { name: "LinkedIn" });

    expect(githubLink).toHaveAttribute("href", "https://github.com/test");
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://linkedin.com/in/test"
    );
  });

  it("should render Contact button", () => {
    render(<Profile {...mockProps} />);
    expect(screen.getByRole("button", { name: "Contact" })).toBeInTheDocument();
  });

  it("should render Payments button", () => {
    render(<Profile {...mockProps} />);
    expect(
      screen.getByRole("button", { name: "Payments" })
    ).toBeInTheDocument();
  });

  it("should open modal when Contact button is clicked", async () => {
    const user = userEvent.setup();
    render(<Profile {...mockProps} />);

    const button = screen.getByRole("button", { name: "Contact" });
    await user.click(button);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it("should open modal when Payments button is clicked", async () => {
    const user = userEvent.setup();
    render(<Profile {...mockProps} />);

    const button = screen.getByRole("button", { name: "Payments" });
    await user.click(button);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });
});
