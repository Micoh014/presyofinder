import Modal from "./ui/Modal";
import Button from "./ui/Button";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <Modal
      onClose={onCancel}
      labelId="confirm-title"
      position="center"
      className="p-6 space-y-4"
    >
      <h3
        id="confirm-title"
        className="text-lg font-bold text-gray-800 dark:text-white"
      >
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          fullWidth
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
