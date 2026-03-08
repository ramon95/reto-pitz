import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '../utils'
import Toast from '../../components/Toast'
import type { ToastMessage } from '../../components/Toast'

const makeToast = (overrides: Partial<ToastMessage> = {}): ToastMessage => ({
  id: 1,
  message: 'Operation successful',
  type: 'success',
  ...overrides,
})

describe('Toast', () => {
  it('renders a success toast', () => {
    render(<Toast toasts={[makeToast()]} onRemove={vi.fn()} />)
    expect(screen.getByText('Operation successful')).toBeInTheDocument()
  })

  it('renders an error toast', () => {
    render(<Toast toasts={[makeToast({ type: 'error', message: 'Something went wrong' })]} onRemove={vi.fn()} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    const toasts: ToastMessage[] = [
      { id: 1, message: 'First', type: 'success' },
      { id: 2, message: 'Second', type: 'error' },
    ]
    render(<Toast toasts={toasts} onRemove={vi.fn()} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('calls onRemove when × is clicked', async () => {
    const onRemove = vi.fn()
    const { getByRole } = render(<Toast toasts={[makeToast({ id: 42 })]} onRemove={onRemove} />)

    getByRole('button').click()
    expect(onRemove).toHaveBeenCalledWith(42)
  })

  it('auto-removes after 3.5 seconds', async () => {
    vi.useFakeTimers()
    const onRemove = vi.fn()
    render(<Toast toasts={[makeToast({ id: 7 })]} onRemove={onRemove} />)

    act(() => { vi.advanceTimersByTime(3500) })
    expect(onRemove).toHaveBeenCalledWith(7)

    vi.useRealTimers()
  })
})
