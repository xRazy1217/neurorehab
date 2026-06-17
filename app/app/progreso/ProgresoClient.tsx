'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

export interface DailyProgress {
  id: string
  date: string
  area: 'lenguaje' | 'habla' | 'cognicion'
  percentage: number
  tasks_completed: number
  time_spent_minutes: number
}

interface Props {
  progress: DailyProgress[]
  completedCount: number
  totalMinutes: number
  streak: number
  avgScore: number
}

const badges = [
  { id: 'first', label: 'Primera actividad', icon: '🌟', threshold: 1 },
  { id: 'week', label: 'Semana completa', icon: '📅', threshold: 7 },
  { id: 'ten', label: '10 actividades', icon: '🏆', threshold: 10 },
  { id: 'month', label: 'Mes continuo', icon: '🎯', threshold: 30 },
]

export default function ProgresoClient({ progress, completedCount, totalMinutes, streak, avgScore }: Props) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'estadisticas'>('resumen')
  const [range, setRange] = useState<'week' | 'month'>('week')

  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  // Build chart data
  const chartData = useMemo(() => {
    const days = range === 'week' ? 7 : 30
    const result: Array<{ date: string; lenguaje: number; habla: number; cognicion: number; promedio: number }> = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })

      const dayProgress = progress.filter(p => p.date === dateStr)
      const lenguaje = dayProgress.find(p => p.area === 'lenguaje')?.percentage ?? 0
      const habla = dayProgress.find(p => p.area === 'habla')?.percentage ?? 0
      const cognicion = dayProgress.find(p => p.area === 'cognicion')?.percentage ?? 0
      const promedio = Math.round((lenguaje + habla + cognicion) / 3)

      result.push({ date: dayLabel, lenguaje, habla, cognicion, promedio })
    }
    return result
  }, [progress, range])

  const unlockedBadges = badges.filter(b => {
    if (b.threshold <= 10) return completedCount >= b.threshold
    return streak >= b.threshold
  })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary px-5 pt-12 pb-5">
        <h1 className="text-[22px] font-bold text-white">Mi progreso</h1>
        <p className="text-white/70 text-sm mt-0.5">Evolución de tu recuperación</p>
      </header>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Tabs */}
        <div className="bg-surface rounded-xl p-1 flex shadow-card animate-in">
          {(['resumen', 'estadisticas'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-muted'
              }`}
            >
              {tab === 'resumen' ? 'Resumen' : 'Estadísticas'}
            </button>
          ))}
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-5 animate-in">
            {/* Range selector */}
            <div className="flex gap-2">
              {(['week', 'month'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    range === r ? 'bg-primary text-white' : 'bg-surface text-text-muted shadow-card'
                  }`}
                >
                  {r === 'week' ? 'Esta semana' : 'Este mes'}
                </button>
              ))}
            </div>

            {/* Line chart */}
            <div className="bg-surface rounded-card shadow-card p-4">
              <h3 className="text-sm font-semibold text-text mb-4">Progreso general</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                  <Line type="monotone" dataKey="promedio" stroke="#7F77DD" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart by area */}
            <div className="bg-surface rounded-card shadow-card p-4">
              <h3 className="text-sm font-semibold text-text mb-4">Por área</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData.slice(-7)} margin={{ top: 5, right: 5, bottom: 5, left: -20 }} barSize={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="lenguaje" fill="#1D9E75" radius={[3,3,0,0]} name="Lenguaje" />
                  <Bar dataKey="habla" fill="#D85A30" radius={[3,3,0,0]} name="Habla" />
                  <Bar dataKey="cognicion" fill="#7F77DD" radius={[3,3,0,0]} name="Cognición" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="space-y-4 animate-in">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Actividades', value: completedCount, icon: '✅', color: '#1D9E75', bg: '#E8F9F4' },
                { label: 'Tiempo total', value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`, icon: '⏱️', color: '#7F77DD', bg: '#EEEDFE' },
                { label: 'Racha', value: `${streak} días`, icon: '🔥', color: '#D85A30', bg: '#FEF0EB' },
                { label: 'Precisión', value: `${avgScore}%`, icon: '🎯', color: '#534AB7', bg: '#EEEDFE' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface rounded-card shadow-card p-4 animate-in" style={{ opacity: 0 }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-lg"
                    style={{ backgroundColor: stat.bg }}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-[22px] font-bold text-text leading-none">{stat.value}</p>
                  <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="bg-surface rounded-card shadow-card p-4">
              <h3 className="text-sm font-semibold text-text mb-4">Logros</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map(badge => {
                  const unlocked = unlockedBadges.some(b => b.id === badge.id)
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-xl p-3 flex items-center gap-3 transition-all ${
                        unlocked ? 'bg-primary-light' : 'bg-bg opacity-50'
                      }`}
                    >
                      <span className={`text-2xl ${!unlocked && 'grayscale'}`}>{badge.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-text leading-tight">{badge.label}</p>
                        {unlocked && <p className="text-[10px] text-primary">Desbloqueado</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
