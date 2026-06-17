import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="text-[22px] font-bold text-text mb-2">Página no encontrada</h1>
        <p className="text-text-muted text-sm mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-block py-3 px-8 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all text-sm"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
