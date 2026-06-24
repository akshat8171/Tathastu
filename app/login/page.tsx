import { PhoneOtpForm } from '@/components/auth/phone-otp-form'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold mb-2">Welcome to Tathastu</h1>
          <p className="text-gray-400">Sign in with your phone number</p>
        </div>
        <PhoneOtpForm />
      </div>
    </div>
  )
}
