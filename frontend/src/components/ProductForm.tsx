import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Product, ProductFormData } from '../types/product'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  isLoading: boolean
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const isEditing = !!product

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      sku: '',
      active: true,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        stock: product.stock,
        sku: product.sku,
        active: product.active,
      })
    }
  }, [product, reset])

  const description = watch('description') ?? ''

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Ej: Laptop Pro 15"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              {...register('sku', {
                required: 'El SKU es obligatorio',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Solo letras mayúsculas y números',
                },
              })}
              disabled={isEditing}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase ${errors.sku ? 'border-red-400' : 'border-gray-300'} ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="Ej: LAP001"
            />
            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', {
                  required: 'El precio es obligatorio',
                  min: { value: 0.01, message: 'Debe ser mayor a 0' },
                })}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('stock', {
                  required: 'El stock es obligatorio',
                  min: { value: 0, message: 'No puede ser negativo' },
                  validate: v => Number.isInteger(Number(v)) || 'Debe ser un número entero',
                })}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.stock ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="0"
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              {...register('description', {
                maxLength: { value: 1000, message: 'Máximo 1000 caracteres' },
              })}
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Descripción del producto..."
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-xs text-red-500">{errors.description.message}</p>
                : <span />}
              <span className="text-xs text-gray-400">{description.length}/1000</span>
            </div>
          </div>

          {/* Active */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('active')}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Producto activo</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
