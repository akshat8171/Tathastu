import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      verifyOtp: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

describe('PhoneOtpForm', () => {
  it('renders phone input initially', () => {
    render(<PhoneOtpForm />)
    expect(screen.getByPlaceholderText('9876543210')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument()
  })

  it('shows error for invalid phone number', async () => {
    render(<PhoneOtpForm />)
    const input = screen.getByPlaceholderText('9876543210')
    await userEvent.type(input, '123')
    fireEvent.click(screen.getByRole('button', { name: /send otp/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid 10-digit/i)).toBeInTheDocument()
    })
  })

  it('moves to OTP step after valid phone', async () => {
    render(<PhoneOtpForm />)
    const input = screen.getByPlaceholderText('9876543210')
    await userEvent.type(input, '9876543210')
    fireEvent.click(screen.getByRole('button', { name: /send otp/i }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument()
    })
  })

  it('shows OTP sent message with phone number', async () => {
    render(<PhoneOtpForm />)
    const input = screen.getByPlaceholderText('9876543210')
    await userEvent.type(input, '9876543210')
    fireEvent.click(screen.getByRole('button', { name: /send otp/i }))
    await waitFor(() => {
      expect(screen.getByText(/9876543210/)).toBeInTheDocument()
    })
  })
})
