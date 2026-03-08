import { useState, useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import Toast, { type ToastMessage } from './components/Toast'
import { useCreateProduct, useUpdateProduct } from './hooks/useProducts'
import type { Product, ProductFormData } from './types/product'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductManager />
    </QueryClientProvider>
  )
}

function ProductManager() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleAdd = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data })
        addToast('Producto actualizado correctamente', 'success')
      } else {
        await createMutation.mutateAsync(data)
        addToast('Producto creado correctamente', 'success')
      }
      setShowForm(false)
      setEditingProduct(null)
    } catch (err: unknown) {
      const errors = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors
      const msg = errors ? errors.join(', ') : 'Error al guardar el producto'
      addToast(msg, 'error')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Gestión de Productos</h1>
            <p className="text-xs text-gray-500">Pitz Technical Challenge</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductList onEdit={handleEdit} onAdd={handleAdd} addToast={addToast} />
      </main>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
