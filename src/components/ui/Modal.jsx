import { useModalKeyboard } from "../../lib/useModalKeyboard";

export default function Modal({
  children,
  onClose,
  labelId,
  position = "bottom",
  className = "",
}) {
  const modalRef = useModalKeyboard(onClose);

  const positions = {
    bottom: "items-end",
    center: "items-center",
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex justify-center z-1000 ${positions[position]}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-800 w-full max-w-md ${position === "bottom" ? "rounded-t-3xl" : "rounded-3xl mx-4"} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
