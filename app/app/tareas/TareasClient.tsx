'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  type: string
  area: string
  duration_minutes: number
  description: string
}

interface PatientTask {
  id: string
  completed: boolean
  completed_at: string | null
  due_date: string | null
  assigned_at: string
  tasks: Task | null
}

interface Props {
  tasks: PatientTask[]
  weekTotal: number
  weekCompleted: number
}

const areaConfig: Record<string, { color: string; bg: string; label: string }> = {
  lenguaje: { color: '#1D9E75', bg: '#E8F9F4', label: 'Lenguaje' },
  habla: { color: '#D85A30', bg: '#FEF0EB', label: 'Habla' },
  cognicion: { color: '#7F77DD', bg: '#EEEDFE', label: 'Cognición' },
}

const typeIcons: Record<string, React.ReactNode> = {
  image_naming: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  phrase_repetition: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
      <path d="M19 10v2a7 7 0 01-14 0v-2"/>
    </svg>
  ),
  visual_memory: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
}

export default function TareasClient({ tasks, weekTotal, weekCompleted }: Props) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')

  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)
  const shown = activeTab === 'pending' ? pending : completed
  const weekPercent = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary px-5 pt-12 pb-5">
        <h1 className="text-[22px] font-bold text-white">Mis tareas</h1>
        <p className="text-white/70 text-sm mt-0.5">
          {pending.length} pendiente{pending.length !== 1 ? 's' : ''} · {completed.length} completada{completed.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Tabs */}
        <div className="bg-surface rounded-xl p-1 flex shadow-card animate-in">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted'
            }`}
          >
            Pendientes ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted'
            }`}
          >
            Completadas ({completed.length})
          </button>
        </div>

        {/* Task list */}
        <div className="space-y-3 animate-in animate-in-delay-1">
          {shown.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <div className="text-4xl mb-3">
                {activeTab === 'pending' ? '🎉' : '📋'}
              </div>
              <p className="text-sm font-medium">
                {activeTab === 'pending'
                  ? '¡No tienes tareas pendientes!'
                  : 'Aún no has completado tareas'}
              </p>
            </div>
          )}

          {shown.map((pt, i) => {
            const task = pt.tasks
            if (!task) return null
            const cfg = areaConfig[task.area] ?? areaConfig.lenguaje
            const icon = typeIcons[task.type]

            return (
              <div
                key={pt.id}
                className="bg-surface rounded-card shadow-card p-4 animate-in"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
              >
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-text leading-tight">{task.title}</p>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {task.duration_minutes} min
                      </span>
                      {pt.completed && pt.completed_at && (
                        <span className="flex items-center gap-1 text-xs text-[#1D9E75]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Completada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  {!pt.completed && (
                    <Link
                      href={`/app/tareas/${pt.id}`}
                      className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-primary-dark transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  )}
                  {pt.completed && (
                    <div className="w-9 h-9 bg-[#E8F9F4] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Plan semanal */}
        <div className="bg-surface rounded-card shadow-card p-4 animate-in animate-in-delay-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Plan semanal</h3>
            <span className="text-xs text-primary font-semibold">{weekCompleted}/{weekTotal}</span>
          </div>
          <div className="w-full bg-primary-light rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${weekPercent}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">{weekPercent}% de tu plan semanal completado</p>
        </div>
      </div>
    </div>
  )
}
