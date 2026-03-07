import axios from 'axios'
import type { Product, ProductFormData, ProductFilters, ProductsResponse } from '../types/product'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export const productsApi = {
  getAll: (filters: Partial<ProductFilters>): Promise<ProductsResponse> => {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      per_page: filters.per_page ?? 10,
    }
    if (filters.search) params.search = filters.search
    if (filters.status && filters.status !== 'all') params.status = filters.status

    return api.get<ProductsResponse>('/products', { params }).then(r => r.data)
  },

  getOne: (id: number): Promise<Product> =>
    api.get<Product>(`/products/${id}`).then(r => r.data),

  create: (data: ProductFormData): Promise<Product> =>
    api.post<Product>('/products', { product: data }).then(r => r.data),

  update: (id: number, data: Partial<ProductFormData>): Promise<Product> =>
    api.put<Product>(`/products/${id}`, { product: data }).then(r => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/products/${id}`).then(() => undefined),
}
