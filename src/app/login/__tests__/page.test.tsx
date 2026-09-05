import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { server } from '@/mocks/server'
import LoginPage from '../page'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('CMS LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText(/login ke admin panel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('has demo credentials button', () => {
    render(<LoginPage />)
    
    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument()
    expect(screen.getByText(/admin@insurance.com/)).toBeInTheDocument()
  })

  it('fills demo credentials when clicked', () => {
    render(<LoginPage />)
    
    const demoButton = screen.getByText(/click to use/i)
    fireEvent.click(demoButton)
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    
    expect(emailInput.value).toBe('admin@insurance.com')
    expect(passwordInput.value).toBe('admin123')
  })

  it('handles successful login', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /^login$/i })
    
    fireEvent.change(emailInput, { target: { value: 'admin@insurance.com' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeTruthy()
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('redirects to dashboard even on API error (demo mode)', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /^login$/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'test123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
