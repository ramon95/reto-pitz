import type { Product, ProductsResponse } from '../types/product'

let idCounter = 1

export function buildProduct(overrides: Partial<Product> = {}): Product {
  const id = idCounter++
  return {
    id,
    name: `Product ${id}`,
    description: 'A test product',
    price: '99.99',
    stock: 10,
    sku: `SKU${String(id).padStart(5, '0')}`,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function buildProductsResponse(
  products: Product[],
  overrides: Partial<ProductsResponse['pagination']> = {}
): ProductsResponse {
  return {
    products,
    pagination: {
      current_page: 1,
      per_page: 10,
      total_count: products.length,
      total_pages: 1,
      next_page: null,
      prev_page: null,
      ...overrides,
    },
  }
}
