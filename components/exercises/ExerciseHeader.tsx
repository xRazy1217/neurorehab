const areaConfig: Record<string, { color: string; bg: string; label: string }> = {
  lenguaje: { color: '#1D9E75', bg: '#E8F9F4', label: 'Lenguaje' },
  habla: { color: '#D85A30', bg: '#FEF0EB', label: 'Habla' },
  cognicion: { color: '#7F77DD', bg: '#EEEDFE', label: 'Cognición' },
}

interface Props {
  title: string
  area: string
  onBack: () => void
}

export default function ExerciseHeader({ title, area, onBack }: Props) {
  const cfg = areaConfig[area] ?? areaConfig.lenguaje

  return (
    <header className="bg-surface border-b border-gray-100 px-5 pt-12 pb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-semibold text-text truncate">{title}</h1>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
      </div>
    </header>
  )
}
