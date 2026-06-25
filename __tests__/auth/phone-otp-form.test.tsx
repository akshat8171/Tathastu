import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'

// Mock Firebase client — prevents real initializeApp from running in jsdom.
jest.mock('@/lib/firebase/client', () => ({
  getFirebaseAuth: jest.fn(() => ({})),
  isFirebaseConfigured: true,
}))

// Mock Firebase Auth SDK — no real network calls.
jest.mock('firebase/auth', () => ({
  RecaptchaVerifier: jest.fn().mockImplementation(() => ({
    clear: jest.fn(),
    render: jest.fn().mockResolvedValue(1),
  })),
  signInWithPhoneNumber: jest.fn().mockResolvedValue({
    confirm: jest.fn().mockResolvedValue({
      user: {
        getIdToken: jest.fn().mockResolvedValue('fake-id-token'),
      },
    }),
  }),
}))

// Mock Next.js navigation.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}))

// Mock global fetch — covers /api/auth/send-otp and /api/auth/firebase-session.
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  }) as unknown as typeof fetch
})

afterEach(() => {
  jest.restoreAllMocks()
})

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
