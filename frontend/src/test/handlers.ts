import { http, HttpResponse } from 'msw'
import { buildProduct, buildProductsResponse } from './factories'

const BASE = 'http://localhost:3001/api/v1'

export const handlers = [
  http.get(`${BASE}/products`, () => {
    const products = [buildProduct(), buildProduct(), buildProduct()]
    return HttpResponse.json(buildProductsResponse(products))
  }),

  http.get(`${BASE}/products/:id`, ({ params }) => {
    const product = buildProduct({ id: Number(params.id), name: 'Laptop Pro' })
    return HttpResponse.json(product)
  }),

  http.post(`${BASE}/products`, async ({ request }) => {
    const body = await request.json() as { product: Record<string, unknown> }
    const product = buildProduct({ ...body.product as Partial<ReturnType<typeof buildProduct>> })
    return HttpResponse.json(product, { status: 201 })
  }),

  http.put(`${BASE}/products/:id`, async ({ params, request }) => {
    const body = await request.json() as { product: Record<string, unknown> }
    const product = buildProduct({ id: Number(params.id), ...body.product as Partial<ReturnType<typeof buildProduct>> })
    return HttpResponse.json(product)
  }),

  http.delete(`${BASE}/products/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
