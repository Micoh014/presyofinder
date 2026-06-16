import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders default icon", () => {
    render(<EmptyState />);
    expect(screen.getByText("📍")).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(<EmptyState icon="🛒" />);
    expect(screen.getByText("🛒")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<EmptyState title="No items yet" />);
    expect(screen.getByText("No items yet")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState description="Add one below." />);
    expect(screen.getByText("Add one below.")).toBeInTheDocument();
  });

  it("does not render title element when omitted", () => {
    render(<EmptyState description="Only description" />);
    expect(screen.queryByText("Only description")).toBeInTheDocument();
    // no title paragraph with font-semibold
    expect(document.querySelector(".font-semibold")).toBeNull();
  });
});
