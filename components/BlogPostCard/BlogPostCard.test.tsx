import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogPostCard } from "./BlogPostCard";

describe("BlogPostCard", () => {
  const mockProps = {
    title: "Test Blog Post",
    slug: "test-blog-post",
    date: "January 11, 2026",
    description: "This is a test blog post description.",
  };

  it("should render the blog post title", () => {
    render(<BlogPostCard {...mockProps} />);
    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
  });

  it("should render the date", () => {
    render(<BlogPostCard {...mockProps} />);
    expect(screen.getByText("January 11, 2026")).toBeInTheDocument();
  });

  it("should render the description", () => {
    render(<BlogPostCard {...mockProps} />);
    expect(
      screen.getByText("This is a test blog post description.")
    ).toBeInTheDocument();
  });

  it("should render a link with correct href", () => {
    render(<BlogPostCard {...mockProps} />);
    const link = screen.getByRole("link", { name: "Test Blog Post" });
    expect(link).toHaveAttribute("href", "/blog/test-blog-post");
  });

  it("should render as an article element", () => {
    const { container } = render(<BlogPostCard {...mockProps} />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("should apply card styling classes", () => {
    const { container } = render(<BlogPostCard {...mockProps} />);
    const article = container.querySelector("article");
    expect(article).toHaveClass("card", "card-border");
  });
});
