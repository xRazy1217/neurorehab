'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Patient {
  id: string
  fullName: string
  avatarUrl: string | null
  active: boolean
  diagnosis: string | null
  progress: number
  lastActivity: string | null
}

interface Props {
  patients: Patient[]
}

export default function AdminDashboard({ patients }: Props) {
  const [search, setSearch] = useState('')

  const filtered = patients.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Sin actividad'
    const d = new Date(dateStr)
    const today = new Date()
    today.setHours(0,0,0,0)
    const diff = Math.round((today.getTime() - d.getTime()) / (1000*60*60*24))
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return `Hace ${diff} días`
  }

  function getInitials(name: string) {
    return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-in">
        <div>
          <h1 className="text-[22px] font-bold text-text">Pacientes</h1>
          <p className="text-text-muted text-sm">{patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/pacientes/nuevo"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo paciente
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 animate-in animate-in-delay-1">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-text"
        />
      </div>

      {/* Patient list */}
      <div className="space-y-3 animate-in animate-in-delay-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm font-medium">{search ? 'Sin resultados' : 'No hay pacientes aún'}</p>
            {!search && (
              <Link href="/admin/pacientes/nuevo" className="text-primary text-sm mt-2 inline-block">
                Agregar primer paciente →
              </Link>
            )}
          </div>
        )}

        {filtered.map((patient, i) => (
          <Link
            key={patient.id}
            href={`/admin/pacientes/${patient.id}`}
            className="bg-surface rounded-card shadow-card p-4 flex items-center gap-4 hover:shadow-md transition-all animate-in block"
            style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
          >
            {/* Avatar */}
            {patient.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={patient.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">{getInitials(patient.fullName)}</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-text">{patient.fullName}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  patient.active ? 'bg-[#E8F9F4] text-[#1D9E75]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {patient.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {patient.diagnosis && (
                <p className="text-xs text-text-muted truncate mt-0.5">{patient.diagnosis}</p>
              )}
              <p className="text-xs text-text-muted mt-0.5">
                Última actividad: {formatDate(patient.lastActivity)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[22px] font-bold text-text">{patient.progress}%</span>
              <div className="w-16 h-1.5 bg-primary-light rounded-full">
                <div
                  className="h-1.5 bg-primary rounded-full transition-all"
                  style={{ width: `${patient.progress}%` }}
                />
              </div>
            </div>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
