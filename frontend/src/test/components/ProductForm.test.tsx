import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '../utils'
import ProductForm from '../../components/ProductForm'
import { buildProduct } from '../factories'

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()

const defaultProps = {
  product: null,
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
  isLoading: false,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProductForm', () => {
  describe('render', () => {
    it('shows "Nuevo producto" title when creating', () => {
      render(<ProductForm {...defaultProps} />)
      expect(screen.getByText('Nuevo producto')).toBeInTheDocument()
    })

    it('shows "Editar producto" title when editing', () => {
      render(<ProductForm {...defaultProps} product={buildProduct()} />)
      expect(screen.getByText('Editar producto')).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      render(<ProductForm {...defaultProps} />)
      expect(screen.getByPlaceholderText('Ej: Laptop Pro 15')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Ej: LAP001')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Descripción del producto...')).toBeInTheDocument()
    })

    it('disables SKU field when editing', () => {
      render(<ProductForm {...defaultProps} product={buildProduct()} />)
      expect(screen.getByPlaceholderText('Ej: LAP001')).toBeDisabled()
    })

    it('enables SKU field when creating', () => {
      render(<ProductForm {...defaultProps} />)
      expect(screen.getByPlaceholderText('Ej: LAP001')).toBeEnabled()
    })

    it('pre-fills fields when editing a product', () => {
      const product = buildProduct({ name: 'Wireless Mouse', price: '29.99', stock: 50 })
      render(<ProductForm {...defaultProps} product={product} />)
      expect(screen.getByDisplayValue('Wireless Mouse')).toBeInTheDocument()
      expect(screen.getByDisplayValue('29.99')).toBeInTheDocument()
      expect(screen.getByDisplayValue('50')).toBeInTheDocument()
    })

    it('shows spinner on submit button when loading', () => {
      render(<ProductForm {...defaultProps} isLoading />)
      const submitBtn = screen.getByRole('button', { name: /crear producto/i })
      expect(submitBtn).toBeDisabled()
    })
  })

  describe('validation', () => {
    it('shows error when name is too short', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('Ej: Laptop Pro 15'), 'AB')
      await user.click(screen.getByRole('button', { name: /crear producto/i }))

      await waitFor(() => {
        expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('shows error when name is empty', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /crear producto/i }))

      await waitFor(() => {
        expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
      })
    })

    it('shows error when SKU has invalid characters', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('Ej: LAP001'), 'invalid-sku')
      await user.click(screen.getByRole('button', { name: /crear producto/i }))

      await waitFor(() => {
        expect(screen.getByText('Solo letras mayúsculas y números')).toBeInTheDocument()
      })
    })

    it('shows error when price is 0 or negative', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('0.00'), '0')
      await user.click(screen.getByRole('button', { name: /crear producto/i }))

      await waitFor(() => {
        expect(screen.getByText('Debe ser mayor a 0')).toBeInTheDocument()
      })
    })

    it('shows error when stock is negative', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('0'), '-1')
      await user.click(screen.getByRole('button', { name: /crear producto/i }))

      await waitFor(() => {
        expect(screen.getByText('No puede ser negativo')).toBeInTheDocument()
      })
    })

    it('shows description character count', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('Descripción del producto...'), 'Hola')

      expect(screen.getByText('4/1000')).toBeInTheDocument()
    })
  })

  describe('submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('Ej: Laptop Pro 15'), 'Laptop Pro')
      await user.type(screen.getByPlaceholderText('Ej: LAP001'), 'LAP001')
      await user.type(screen.getByPlaceholderText('0.00'), '999.99')
      await user.type(screen.getByPlaceholderText('0'), '10')
      await user.click(screen.getByRole('button', { name: /crear producto/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledOnce()
        // react-hook-form passes (data, event) — check only the data argument
        const [data] = mockOnSubmit.mock.calls[0] as [Record<string, unknown>]
        expect(data).toMatchObject({ name: 'Laptop Pro', sku: 'LAP001' })
      })
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /cancelar/i }))
      expect(mockOnCancel).toHaveBeenCalledOnce()
    })

    it('calls onCancel when × button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductForm {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: '×' }))
      expect(mockOnCancel).toHaveBeenCalledOnce()
    })
  })
})
