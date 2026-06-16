import { useState } from 'react'

export function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState(null)

  function showConfirm({ title, message, confirmLabel, danger, onConfirm }) {
    setConfirmDialog({ title, message, confirmLabel, danger, onConfirm })
  }

  function hideConfirm() {
    setConfirmDialog(null)
  }

  return { confirmDialog, showConfirm, hideConfirm }
}