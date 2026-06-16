import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "./Input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input id="test" value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders visible label when provided", () => {
    render(<Input id="name" label="Store name" value="" onChange={() => {}} />);
    expect(screen.getByText("Store name")).toBeInTheDocument();
  });

  it("hides label visually when srOnlyLabel is true", () => {
    render(
      <Input
        id="name"
        label="Hidden label"
        srOnlyLabel
        value=""
        onChange={() => {}}
      />,
    );
    const label = screen.getByText("Hidden label");
    expect(label.className).toContain("sr-only");
  });

  it("calls onChange when typing", () => {
    const handler = vi.fn();
    render(<Input id="price" value="" onChange={handler} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "99" } });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders placeholder text", () => {
    render(
      <Input id="x" value="" onChange={() => {}} placeholder="Enter price" />,
    );
    expect(screen.getByPlaceholderText("Enter price")).toBeInTheDocument();
  });

  it("applies extra className to input", () => {
    render(
      <Input id="x" value="" onChange={() => {}} className="custom-class" />,
    );
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });
});
