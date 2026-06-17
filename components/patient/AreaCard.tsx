interface Props {
  label: string
  area: string
  percent: number
  color: string
  bg: string
  icon: React.ReactNode
  delay?: number
}

export default function AreaCard({ label, percent, color, bg, icon, delay = 0 }: Props) {
  const descriptions: Record<string, string> = {
    Lenguaje: 'Comprensión y expresión del lenguaje',
    Habla: 'Articulación y fluidez del habla',
    Cognición: 'Memoria, atención y razonamiento',
  }

  return (
    <div
      className="bg-surface rounded-card shadow-card p-4 flex items-center gap-4 animate-in"
      style={{ animationDelay: `${delay * 0.05}s`, opacity: 0 }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="text-xs text-text-muted truncate">{descriptions[label]}</p>
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        {percent}%
      </div>
    </div>
  )
}
