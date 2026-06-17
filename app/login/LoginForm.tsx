'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm relative z-10"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 8px 40px rgba(127,119,221,0.15), 0 2px 8px rgba(0,0,0,0.06)',
        padding: '28px 24px',
        border: '1px solid rgba(127,119,221,0.15)',
      }}
    >
      <h2 className="text-[22px] font-bold text-text mb-1">Iniciar sesión</h2>
      <p className="text-text-muted text-xs mb-6">Ingresa tus credenciales para continuar</p>

      {error && (
        <div className="mb-4 p-3 rounded-2xl text-red-600 text-sm flex items-center gap-2"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Email */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="correo@ejemplo.com"
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-text outline-none transition-all"
            style={{
              background: '#F5F5FA',
              border: '1.5px solid transparent',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #7F77DD'}
            onBlur={e => e.target.style.border = '1.5px solid transparent'}
          />
        </div>
      </div>

      {/* Password */}
      <div className="mb-7">
        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-sm text-text outline-none transition-all"
            style={{
              background: '#F5F5FA',
              border: '1.5px solid transparent',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #7F77DD'}
            onBlur={e => e.target.style.border = '1.5px solid transparent'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-white font-semibold rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
        style={{
          background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(127,119,221,0.4)',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            Ingresando...
          </span>
        ) : 'Ingresar →'}
      </button>
    </form>
  )
}
