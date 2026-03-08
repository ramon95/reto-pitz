import { useEffect } from 'react'

export type ToastType = 'success' | 'error'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: number) => void
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const colors =
    toast.type === 'success'
      ? 'bg-green-600 text-white'
      : 'bg-red-600 text-white'

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-64 ${colors}`}>
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-white/80 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  )
}
