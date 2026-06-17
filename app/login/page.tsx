import Image from 'next/image'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #F0EFFF 0%, #F5F5FA 40%, #EEF2FF 100%)'
      }}
    >
      {/* Background decoration circles */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'radial-gradient(circle, #7F77DD, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 translate-x-1/3 translate-y-1/3"
        style={{ background: 'radial-gradient(circle, #534AB7, transparent)' }} />

      {/* Logo / Brand */}
      <div className="mb-8 text-center animate-in relative z-10">
        <div className="mx-auto mb-5 flex items-center justify-center drop-shadow-xl">
          <Image
            src="/icons/logo.png"
            alt="NeuroRehab"
            width={110}
            height={110}
            className="rounded-3xl"
            priority
          />
        </div>
        <h1 className="text-[28px] font-bold" style={{ color: '#534AB7' }}>
          Neuro<span style={{ color: '#7F77DD' }}>Rehab</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">Tu recuperación, paso a paso</p>
      </div>

      <LoginForm />

      <p className="mt-6 text-xs text-text-muted text-center relative z-10">
        Plataforma de rehabilitación fonoaudiológica
      </p>
    </div>
  )
}
