import { useEffect, useRef } from 'react'

export function useModalKeyboard(onClose) {
  const containerRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && onClose) {
        onClose()
        return
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll(
          'button, input, select, textarea, a[href]'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Focus first focusable element on open
    setTimeout(() => {
      const firstInput = containerRef.current?.querySelector('button, input, select, textarea')
      firstInput?.focus()
    }, 100)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return containerRef
}