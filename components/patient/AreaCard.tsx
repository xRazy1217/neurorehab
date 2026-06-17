interface Props {
  label: string
  area: string
  percent: number
  color: string
  bg: string
  icon: React.ReactNode
  delay?: number
}

const descriptions: Record<string, string> = {
  Lenguaje: 'Comprensión y expresión',
  Habla: 'Articulación y fluidez',
  Cognición: 'Memoria y atención',
}

export default function AreaCard({ label, percent, color, bg, icon, delay = 0 }: Props) {
  return (
    <div
      className="bg-surface rounded-[20px] p-4 flex items-center gap-4 animate-in"
      style={{
        animationDelay: `${delay * 0.06}s`,
        opacity: 0,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="text-xs text-text-muted">{descriptions[label]}</p>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Percent badge */}
      <div
        className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        {percent}%
      </div>
    </div>
  )
}
