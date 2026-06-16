import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "./Spinner";

describe("Spinner", () => {
  it("renders with role status and aria-label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("applies sm size classes", () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole("status").className).toContain("w-3");
  });

  it("applies md size classes by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").className).toContain("w-5");
  });

  it("applies lg size classes", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status").className).toContain("w-8");
  });

  it("applies extra className", () => {
    render(<Spinner className="mt-4" />);
    expect(screen.getByRole("status").className).toContain("mt-4");
  });
});
