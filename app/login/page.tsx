import Image from 'next/image'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6">
      {/* Logo / Brand */}
      <div className="mb-8 text-center animate-in">
        <div className="mx-auto mb-4 flex items-center justify-center">
          <Image
            src="/icons/logo.png"
            alt="NeuroRehab"
            width={96}
            height={96}
            className="rounded-2xl shadow-lg"
            priority
          />
        </div>
        <h1 className="text-[22px] font-bold text-text">NeuroRehab</h1>
        <p className="text-text-muted text-xs mt-1">Tu recuperación, paso a paso</p>
      </div>

      <LoginForm />
    </div>
  )
}
