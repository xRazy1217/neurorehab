'use client'

import Image from 'next/image'
import CircularProgress from '@/components/ui/CircularProgress'
import AreaCard from '@/components/patient/AreaCard'
import Link from 'next/link'

interface Props {
  fullName: string
  overallPercent: number
  areas: { lenguaje: number; habla: number; cognicion: number }
  streak: number
  completedTodayCount: number
  totalCompletedCount: number
  totalMinutes: number
}

function getGreeting(name: string) {
  const hour = new Date().getHours()
  const first = name.split(' ')[0]
  if (hour < 12) return { greeting: `¡Buenos días, ${first}!`, sub: 'Empecemos el día con energía 💪' }
  if (hour < 19) return { greeting: `¡Hola, ${first}!`, sub: 'Es un buen momento para practicar 🌟' }
  return { greeting: `¡Buenas noches, ${first}!`, sub: 'Termina el día con un ejercicio 🌙' }
}

export default function PatientDashboard({
  fullName, overallPercent, areas, streak,
  completedTodayCount, totalCompletedCount, totalMinutes
}: Props) {
  const { greeting, sub } = getGreeting(fullName)

  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  const motivationalMsg = overallPercent >= 70
    ? '¡Excelente progreso hoy! 🌟'
    : overallPercent > 0
      ? 'Cada ejercicio te acerca a tu meta 💪'
      : '¡Comienza tu primer ejercicio de hoy!'

  const areaCards = [
    {
      label: 'Lenguaje',
      area: 'lenguaje' as const,
      percent: areas.lenguaje,
      color: '#1D9E75',
      bg: '#E8F9F4',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      label: 'Habla',
      area: 'habla' as const,
      percent: areas.habla,
      color: '#D85A30',
      bg: '#FEF0EB',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
        </svg>
      ),
    },
    {
      label: 'Cognición',
      area: 'cognicion' as const,
      percent: areas.cognicion,
      color: '#7F77DD',
      bg: '#EEEDFE',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2C6.5 2 4 4.5 4 7.5c0 1.5.6 2.9 1.5 3.9L4 21l5-2 3 2 3-2 5 2-1.5-9.6c.9-1 1.5-2.4 1.5-3.9C20 4.5 17.5 2 14.5 2c-1 0-1.9.3-2.7.7A5.46 5.46 0 009.5 2z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header con gradiente */}
      <header
        className="px-5 pt-12 pb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <Image
              src="/icons/logo.png"
              alt="NeuroRehab"
              width={44}
              height={44}
              className="rounded-2xl shadow-lg"
            />
            <div>
              <h1 className="text-[20px] font-bold text-white leading-tight">{greeting}</h1>
              <p className="text-white/70 text-xs mt-0.5">{sub}</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">

        {/* Progress card */}
        <div className="bg-surface rounded-[20px] p-5 animate-in"
          style={{ boxShadow: '0 4px 24px rgba(127,119,221,0.12)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-text">Tu progreso de hoy</h2>
            <span className="text-xs text-text-muted">{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <CircularProgress percent={overallPercent} size={100} strokeWidth={9} />
            </div>

            <div className="flex-1 grid grid-cols-1 gap-2.5">
              {/* Streak */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl" style={{ background: '#FFF7ED' }}>
                <span className="text-xl">🔥</span>
                <div>
                  <p className="text-[18px] font-bold text-text leading-none">{streak}</p>
                  <p className="text-[11px] text-text-muted">días de racha</p>
                </div>
              </div>
              {/* Completed */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl" style={{ background: '#EEEDFE' }}>
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <p className="text-[18px] font-bold text-text leading-none">{completedTodayCount}</p>
                  <p className="text-[11px] text-text-muted">hoy · {totalCompletedCount} total</p>
                </div>
              </div>
              {/* Time */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl" style={{ background: '#E8F9F4' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#1D9E75' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p className="text-[18px] font-bold text-text leading-none">{timeLabel}</p>
                  <p className="text-[11px] text-text-muted">tiempo total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational */}
          <div className="mt-4 py-2.5 px-4 rounded-2xl text-center text-xs font-medium"
            style={{
              background: overallPercent >= 70
                ? 'linear-gradient(135deg, #EEEDFE, #E8F9F4)'
                : '#F5F5FA',
              color: overallPercent >= 70 ? '#534AB7' : '#6B7280'
            }}>
            {motivationalMsg}
          </div>
        </div>

        {/* Area cards */}
        <div className="animate-in animate-in-delay-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[16px] font-semibold text-text">Áreas de trabajo</h2>
            <Link href="/app/tareas" className="text-xs font-semibold" style={{ color: '#7F77DD' }}>
              Ver tareas →
            </Link>
          </div>
          <div className="space-y-3">
            {areaCards.map((card, i) => (
              <AreaCard key={card.area} {...card} delay={i} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
