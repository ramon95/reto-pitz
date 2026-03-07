export interface Product {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  sku: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Pagination {
  current_page: number
  per_page: number
  total_count: number
  total_pages: number
  next_page: number | null
  prev_page: number | null
}

export interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

export interface ProductFormData {
  name: string
  description: string
  price: number | string
  stock: number | string
  sku: string
  active: boolean
}

export interface ProductFilters {
  page: number
  per_page: number
  search: string
  status: 'all' | 'active' | 'inactive'
}
