'use client'

import { useEffect, useState } from 'react'

interface Props {
  onBack: () => void
  title: string
  score?: number
}

export default function CompletionScreen({ onBack, title, score }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  return (
    <div className={`min-h-screen bg-bg flex flex-col items-center justify-center px-6 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Celebration */}
      <div className="text-7xl mb-6 animate-bounce">🎉</div>

      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-text mb-2">¡Completado!</h1>
        <p className="text-text-muted text-sm">Terminaste: <span className="font-semibold text-text">{title}</span></p>
        {score !== undefined && (
          <div className="mt-4 inline-flex items-center gap-2 bg-primary-light px-5 py-2.5 rounded-full">
            <span className="text-[22px] font-bold text-primary">{score}</span>
            <span className="text-sm text-primary/70">puntos</span>
          </div>
        )}
      </div>

      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <p className="text-text-muted text-sm text-center max-w-xs mb-8">
        Cada ejercicio completado es un paso más en tu recuperación. ¡Sigue así!
      </p>

      <button
        onClick={onBack}
        className="w-full max-w-xs py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm"
      >
        Volver a tareas
      </button>
    </div>
  )
}
