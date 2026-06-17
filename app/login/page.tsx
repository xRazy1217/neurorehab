import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6">
      {/* Logo / Brand */}
      <div className="mb-8 text-center animate-in">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" fill="white" fillOpacity="0.3"/>
            <path d="M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white" fillOpacity="0.6"/>
            <path d="M16 12a4 4 0 100 8 4 4 0 000-8z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-[22px] font-bold text-text">NeuroRehab</h1>
        <p className="text-text-muted text-xs mt-1">Tu recuperación, paso a paso</p>
      </div>

      <LoginForm />
    </div>
  )
}
