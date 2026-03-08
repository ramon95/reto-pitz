import { useState, useCallback } from 'react'
import { useProducts, useDeleteProduct } from '../hooks/useProducts'
import type { Product, ProductFilters } from '../types/product'
import type { ToastMessage } from './Toast'

interface ProductListProps {
  onEdit: (product: Product) => void
  onAdd: () => void
  addToast: (message: string, type: ToastMessage['type']) => void
}

export default function ProductList({ onEdit, onAdd, addToast }: ProductListProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    per_page: 10,
    search: '',
    status: 'all',
  })
  const [searchInput, setSearchInput] = useState('')
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const { data, isLoading, isError } = useProducts(filters)
  const deleteMutation = useDeleteProduct()

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setFilters(f => ({ ...f, search: searchInput, page: 1 }))
  }, [searchInput])

  const handleStatusChange = (status: ProductFilters['status']) => {
    setFilters(f => ({ ...f, status, page: 1 }))
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    try {
      await deleteMutation.mutateAsync(deletingProduct.id)
      addToast(`"${deletingProduct.name}" eliminado correctamente`, 'success')
      setDeletingProduct(null)
    } catch {
      addToast('Error al eliminar el producto', 'error')
    }
  }

  const products = data?.products ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Buscar
          </button>
          {filters.search && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: '', page: 1 })) }}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              ×
            </button>
          )}
        </form>

        <div className="flex gap-2 items-center">
          {/* Status filter */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-2 transition-colors ${filters.status === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>

          <button
            onClick={onAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> Nuevo producto
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500">
            <p className="text-2xl mb-2">⚠</p>
            <p>Error al cargar los productos. ¿Está el backend corriendo?</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500 font-medium">No se encontraron productos</p>
            <p className="text-sm mt-1">Intenta cambiar los filtros o crea uno nuevo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{product.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono">{product.sku}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock === 0 ? 'text-red-500 font-medium' : 'text-gray-700'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEdit(product)}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {(pagination.current_page - 1) * pagination.per_page + 1}–
            {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} de {pagination.total_count}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={!pagination.prev_page}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.total_pages || Math.abs(p - pagination.current_page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-3 py-1.5">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setFilters(f => ({ ...f, page: p as number }))}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${pagination.current_page === p ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={!pagination.next_page}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingProduct && (
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
              <span className="font-semibold text-gray-900">"{deletingProduct.name}"</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteMutation.isPending && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
