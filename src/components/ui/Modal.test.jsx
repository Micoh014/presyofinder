import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./Modal";

vi.mock("../../lib/useModalKeyboard", () => ({
  useModalKeyboard: () => ({ current: null }),
}));

describe("Modal", () => {
  it("renders children", () => {
    render(
      <Modal onClose={() => {}} labelId="test-label">
        <p>Hello</p>
      </Modal>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("has role dialog", () => {
    render(
      <Modal onClose={() => {}} labelId="test-label">
        <p>Hi</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal onClose={onClose} labelId="test-label">
        <p>Content</p>
      </Modal>,
    );
    const backdrop = screen.getByRole("dialog").parentElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when inner panel is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} labelId="test-label">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
