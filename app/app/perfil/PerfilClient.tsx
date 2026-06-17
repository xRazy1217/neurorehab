'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  fullName: string
  email: string
  avatarUrl: string | null
  diagnosis: string | null
  notes: string | null
  memberSince: string
}

export default function PerfilClient({ fullName, email, avatarUrl, diagnosis, notes, memberSince }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const since = memberSince
    ? new Date(memberSince).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })
    : ''

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary px-5 pt-12 pb-6">
        <h1 className="text-[22px] font-bold text-white">Mi perfil</h1>
      </header>

      <div className="flex-1 px-5 py-5 space-y-4">
        {/* Avatar + name */}
        <div className="bg-surface rounded-card shadow-card p-5 flex items-center gap-4 animate-in">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-[22px] font-bold text-white">{initials}</span>
            </div>
          )}
          <div>
            <h2 className="text-[16px] font-semibold text-text">{fullName}</h2>
            <p className="text-xs text-text-muted mt-0.5">{email}</p>
            <p className="text-xs text-text-muted mt-0.5">Paciente desde {since}</p>
          </div>
        </div>

        {/* Clinical info */}
        {(diagnosis || notes) && (
          <div className="bg-surface rounded-card shadow-card p-4 animate-in animate-in-delay-1 space-y-3">
            <h3 className="text-sm font-semibold text-text">Información clínica</h3>
            {diagnosis && (
              <div>
                <p className="text-xs text-text-muted mb-1">Diagnóstico</p>
                <p className="text-sm text-text">{diagnosis}</p>
              </div>
            )}
            {notes && (
              <div>
                <p className="text-xs text-text-muted mb-1">Notas del terapeuta</p>
                <p className="text-sm text-text">{notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Info rows */}
        <div className="bg-surface rounded-card shadow-card divide-y divide-gray-50 animate-in animate-in-delay-2">
          {[
            { icon: '🔒', label: 'Seguridad', sub: 'Contraseña y acceso' },
            { icon: '🔔', label: 'Notificaciones', sub: 'Próximamente' },
            { icon: '📋', label: 'Sobre NeuroRehab', sub: 'Versión 1.0.0' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{item.label}</p>
                <p className="text-xs text-text-muted">{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full py-3.5 bg-surface text-red-500 font-semibold rounded-xl shadow-card hover:bg-red-50 transition-all animate-in animate-in-delay-3 disabled:opacity-60"
        >
          {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}
