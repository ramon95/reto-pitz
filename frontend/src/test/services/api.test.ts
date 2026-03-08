import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../server'
import { productsApi } from '../../services/api'
import { buildProduct, buildProductsResponse } from '../factories'

describe('productsApi', () => {
  describe('getAll', () => {
    it('returns products and pagination', async () => {
      const products = [buildProduct(), buildProduct()]
      server.use(
        http.get('http://localhost:3001/api/v1/products', () =>
          HttpResponse.json(buildProductsResponse(products))
        )
      )

      const result = await productsApi.getAll({})
      expect(result.products).toHaveLength(2)
      expect(result.pagination).toBeDefined()
      expect(result.pagination.current_page).toBe(1)
    })

    it('passes search param to the API', async () => {
      let capturedUrl: string | undefined

      server.use(
        http.get('http://localhost:3001/api/v1/products', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(buildProductsResponse([]))
        })
      )

      await productsApi.getAll({ search: 'laptop' })
      expect(capturedUrl).toContain('search=laptop')
    })

    it('passes status param to the API', async () => {
      let capturedUrl: string | undefined

      server.use(
        http.get('http://localhost:3001/api/v1/products', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(buildProductsResponse([]))
        })
      )

      await productsApi.getAll({ status: 'active' })
      expect(capturedUrl).toContain('status=active')
    })

    it('does not send status param when status is "all"', async () => {
      let capturedUrl: string | undefined

      server.use(
        http.get('http://localhost:3001/api/v1/products', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(buildProductsResponse([]))
        })
      )

      await productsApi.getAll({ status: 'all' })
      expect(capturedUrl).not.toContain('status=all')
    })
  })

  describe('getOne', () => {
    it('returns a single product', async () => {
      const product = buildProduct({ id: 5, name: 'Monitor 4K' })
      server.use(
        http.get('http://localhost:3001/api/v1/products/5', () =>
          HttpResponse.json(product)
        )
      )

      const result = await productsApi.getOne(5)
      expect(result.id).toBe(5)
      expect(result.name).toBe('Monitor 4K')
    })

    it('throws on 404', async () => {
      server.use(
        http.get('http://localhost:3001/api/v1/products/999', () =>
          HttpResponse.json({ error: 'Record not found' }, { status: 404 })
        )
      )

      await expect(productsApi.getOne(999)).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('sends POST and returns created product', async () => {
      const newProduct = buildProduct({ name: 'New Product', sku: 'NEW001' })
      server.use(
        http.post('http://localhost:3001/api/v1/products', () =>
          HttpResponse.json(newProduct, { status: 201 })
        )
      )

      const result = await productsApi.create({
        name: 'New Product', sku: 'NEW001', price: 99, stock: 5, description: '', active: true,
      })
      expect(result.name).toBe('New Product')
    })

    it('throws on validation error', async () => {
      server.use(
        http.post('http://localhost:3001/api/v1/products', () =>
          HttpResponse.json({ errors: ['Name is too short'] }, { status: 422 })
        )
      )

      await expect(
        productsApi.create({ name: 'AB', sku: '', price: 0, stock: 0, description: '', active: true })
      ).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('sends PUT and returns updated product', async () => {
      const updated = buildProduct({ id: 1, name: 'Updated Name' })
      server.use(
        http.put('http://localhost:3001/api/v1/products/1', () =>
          HttpResponse.json(updated)
        )
      )

      const result = await productsApi.update(1, { name: 'Updated Name' })
      expect(result.name).toBe('Updated Name')
    })
  })

  describe('remove', () => {
    it('sends DELETE and resolves', async () => {
      server.use(
        http.delete('http://localhost:3001/api/v1/products/1', () =>
          new HttpResponse(null, { status: 204 })
        )
      )

      await expect(productsApi.remove(1)).resolves.toBeUndefined()
    })
  })
})
