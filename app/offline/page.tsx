'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
          </svg>
        </div>
        <h1 className="text-[22px] font-bold text-text mb-2">Sin conexión</h1>
        <p className="text-text-muted text-sm max-w-xs">
          Parece que no tienes conexión a internet. Conéctate para continuar con tus ejercicios.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
