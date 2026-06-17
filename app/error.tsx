'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="text-[22px] font-bold text-text mb-2">Algo salió mal</h1>
        <p className="text-text-muted text-sm mb-6">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all text-sm"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="flex-1 py-3 bg-surface text-text-muted font-semibold rounded-xl border border-gray-200 hover:bg-bg transition-all text-sm text-center"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
