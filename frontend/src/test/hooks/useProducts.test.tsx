import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { server } from '../server'
import { useProducts, useCreateProduct, useDeleteProduct } from '../../hooks/useProducts'
import { buildProduct, buildProductsResponse } from '../factories'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useProducts', () => {
  it('fetches and returns products', async () => {
    const products = [buildProduct(), buildProduct()]
    server.use(
      http.get('http://localhost:3001/api/v1/products', () =>
        HttpResponse.json(buildProductsResponse(products))
      )
    )

    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.products).toHaveLength(2)
    expect(result.current.data?.pagination).toBeDefined()
  })

  it('exposes isLoading while fetching', () => {
    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('exposes isError on API failure', async () => {
    server.use(
      http.get('http://localhost:3001/api/v1/products', () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    )

    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateProduct', () => {
  it('calls API and returns created product', async () => {
    const newProduct = buildProduct({ name: 'Created Product' })
    server.use(
      http.post('http://localhost:3001/api/v1/products', () =>
        HttpResponse.json(newProduct, { status: 201 })
      )
    )

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() })

    result.current.mutate({
      name: 'Created Product', sku: 'CRT001', price: 50, stock: 5, description: '', active: true,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('Created Product')
  })
})

describe('useDeleteProduct', () => {
  it('calls DELETE and succeeds', async () => {
    server.use(
      http.delete('http://localhost:3001/api/v1/products/1', () =>
        new HttpResponse(null, { status: 204 })
      )
    )

    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() })

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
