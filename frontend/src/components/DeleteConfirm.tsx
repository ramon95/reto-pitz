import type { Product } from '../types/product'

interface DeleteConfirmProps {
  product: Product
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export default function DeleteConfirm({ product, onConfirm, onCancel, isLoading }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-xl">⚠</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Eliminar producto</h2>
        </div>

        <p className="text-gray-600 mb-2">
          ¿Estás seguro de que quieres eliminar{' '}
          <span className="font-semibold text-gray-900">"{product.name}"</span>?
        </p>
        <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
