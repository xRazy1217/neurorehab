'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// ── Edit Modal ──────────────────────────────────────────────
function EditPatientModal({
  patientId, fullName, diagnosis, notes, active, onClose
}: {
  patientId: string
  fullName: string
  diagnosis: string | null
  notes: string | null
  active: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: fullName, diagnosis: diagnosis ?? '', notes: notes ?? '', active })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/update-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al guardar'); return }
      onClose()
      router.refresh()
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="bg-surface rounded-t-[24px] sm:rounded-card w-full max-w-lg shadow-xl animate-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-[16px] font-semibold text-text">Editar paciente</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Nombre completo</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Diagnóstico</label>
            <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              placeholder="ACV isquémico, afasia de Broca..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Notas clínicas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} placeholder="Observaciones..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-text">{form.active ? 'Paciente activo' : 'Paciente inactivo'}</span>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-3 bg-bg text-text-muted font-semibold rounded-xl border border-gray-200 text-sm">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all text-sm disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ─────────────────────────────────────
function DeleteConfirmModal({
  patientId, fullName, onClose
}: {
  patientId: string
  fullName: string
  onClose: () => void
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/delete-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al eliminar'); return }
      router.push('/admin')
      router.refresh()
    } catch { setError('Error de conexión') }
    finally { setDeleting(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-card w-full max-w-sm shadow-xl animate-in p-6">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <h2 className="text-[16px] font-bold text-text mb-1">Eliminar paciente</h2>
          <p className="text-text-muted text-sm">
            ¿Estás seguro que deseas eliminar a <strong>{fullName}</strong>? Esta acción no se puede deshacer. Se eliminarán todas sus tareas, respuestas y progreso.
          </p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">{error}</div>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-bg text-text-muted font-semibold rounded-xl border border-gray-200 text-sm">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all text-sm disabled:opacity-60">
            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DailyProgress {
  id: string
  date: string
  area: string
  percentage: number
  tasks_completed: number
  time_spent_minutes: number
}

interface Response {
  id: string
  recording_url: string | null
  selected_options: string[] | null
  score: number | null
  therapist_note: string | null
  responded_at: string
  patient_tasks: {
    id: string
    completed: boolean
    tasks: { title: string; type: string; area: string } | null
  } | null
}

interface Props {
  patientId: string
  fullName: string
  avatarUrl: string | null
  active: boolean
  diagnosis: string | null
  notes: string | null
  createdAt: string
  progress: DailyProgress[]
  responses: Response[]
}

const areaColors: Record<string, string> = {
  lenguaje: '#1D9E75',
  habla: '#D85A30',
  cognicion: '#7F77DD',
}

export default function PatientDetailClient({
  patientId, fullName, avatarUrl, active, diagnosis, notes, createdAt,
  progress, responses
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'progreso' | 'respuestas'>('progreso')
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
  const [savingNote, setSavingNote] = useState<string | null>(null)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const initials = fullName.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()

  // Build chart data
  const chartData = (() => {
    const grouped: Record<string, { lenguaje: number; habla: number; cognicion: number }> = {}
    for (const p of progress) {
      if (!grouped[p.date]) grouped[p.date] = { lenguaje: 0, habla: 0, cognicion: 0 }
      grouped[p.date][p.area as 'lenguaje' | 'habla' | 'cognicion'] = p.percentage
    }
    return Object.entries(grouped).slice(-14).map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }),
      ...vals,
      promedio: Math.round((vals.lenguaje + vals.habla + vals.cognicion) / 3),
    }))
  })()

  async function saveNote(responseId: string) {
    const note = noteInputs[responseId]
    if (!note?.trim()) return
    setSavingNote(responseId)
    setNoteError(null)

    try {
      const res = await fetch('/api/save-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId, note }),
      })

      const data = await res.json()
      if (!res.ok) {
        setNoteError(data.error ?? 'Error al guardar')
        return
      }

      // Clear input and refresh
      setNoteInputs(n => ({ ...n, [responseId]: '' }))
      router.refresh()
    } catch {
      setNoteError('Error de conexión')
    } finally {
      setSavingNote(null)
    }
  }

  return (
    <>
    <div className="max-w-3xl mx-auto px-5 py-6">
      {/* Back */}
      <Link href="/admin" className="flex items-center gap-2 text-text-muted text-sm mb-5 hover:text-text transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        Volver a pacientes
      </Link>

      {/* Patient header */}
      <div className="bg-surface rounded-card shadow-card p-5 mb-5 animate-in">
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary text-lg">{initials}</span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-bold text-text">{fullName}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                active ? 'bg-[#E8F9F4] text-[#1D9E75]' : 'bg-gray-100 text-gray-500'
              }`}>
                {active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {diagnosis && <p className="text-sm text-text-muted mt-0.5">{diagnosis}</p>}
            {notes && <p className="text-xs text-text-muted mt-1 italic">{notes}</p>}
            <p className="text-xs text-text-muted mt-1">
              Desde {new Date(createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link
            href={`/admin/pacientes/${patientId}/tareas`}
            className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary-dark transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tareas
          </Link>
          <button
            onClick={() => setShowEdit(true)}
            className="w-8 h-8 bg-bg rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Editar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
            title="Eliminar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-xl p-1 flex shadow-card mb-5 animate-in animate-in-delay-1">
        {(['progreso', 'respuestas'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-muted'
            }`}
          >
            {tab === 'progreso' ? 'Progreso' : 'Respuestas'}
          </button>
        ))}
      </div>

      {activeTab === 'progreso' && (
        <div className="space-y-4 animate-in">
          {chartData.length > 0 ? (
            <div className="bg-surface rounded-card shadow-card p-4">
              <h3 className="text-sm font-semibold text-text mb-4">Evolución (últimas 2 semanas)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} formatter={(v: number) => [`${v}%`]} />
                  {(['lenguaje', 'habla', 'cognicion'] as const).map(area => (
                    <Line key={area} type="monotone" dataKey={area} stroke={areaColors[area]} strokeWidth={2} dot={false} />
                  ))}
                  <Line type="monotone" dataKey="promedio" stroke="#1A1A2E" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex gap-4 mt-3 flex-wrap">
                {[
                  { label: 'Lenguaje', color: '#1D9E75' },
                  { label: 'Habla', color: '#D85A30' },
                  { label: 'Cognición', color: '#7F77DD' },
                  { label: 'Promedio', color: '#1A1A2E' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5" style={{ backgroundColor: l.color }} />
                    <span className="text-[11px] text-text-muted">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-card shadow-card p-8 text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm text-text-muted">Sin datos de progreso aún</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'respuestas' && (
        <div className="space-y-3 animate-in">
          {noteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              {noteError}
            </div>
          )}
          {responses.length === 0 && (
            <div className="bg-surface rounded-card shadow-card p-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-text-muted">Sin respuestas aún</p>
            </div>
          )}

          {responses.map((response, i) => {
            const task = response.patient_tasks?.tasks
            const area = task?.area ?? 'lenguaje'
            const areaColor = areaColors[area] ?? '#7F77DD'

            return (
              <div
                key={response.id}
                className="bg-surface rounded-card shadow-card p-4 animate-in"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{task?.title ?? 'Ejercicio'}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(response.responded_at).toLocaleDateString('es-CL', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {response.score !== null && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                        {response.score} pts
                      </span>
                    )}
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${areaColor}20`, color: areaColor }}
                    >
                      {area}
                    </span>
                  </div>
                </div>

                {/* Audio player */}
                {response.recording_url && (
                  <div className="mb-3">
                    <p className="text-xs text-text-muted mb-1.5">Grabación</p>
                    <audio
                      controls
                      src={response.recording_url}
                      className="w-full h-8"
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                )}

                {/* Selected options for visual memory */}
                {response.selected_options && Array.isArray(response.selected_options) && (
                  <div className="mb-3">
                    <p className="text-xs text-text-muted mb-1">Opciones seleccionadas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(response.selected_options as string[]).map(opt => (
                        <span key={opt} className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Therapist note */}
                <div>
                  <p className="text-xs text-text-muted mb-1.5">Nota del terapeuta</p>
                  {response.therapist_note && (
                    <p className="text-xs text-text bg-bg p-2 rounded-lg mb-2">{response.therapist_note}</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Agregar nota..."
                      value={noteInputs[response.id] ?? ''}
                      onChange={e => setNoteInputs(n => ({ ...n, [response.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-primary bg-bg"
                      onKeyDown={e => e.key === 'Enter' && saveNote(response.id)}
                    />
                    <button
                      onClick={() => saveNote(response.id)}
                      disabled={savingNote === response.id}
                      className="px-3 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark transition-all disabled:opacity-60"
                    >
                      {savingNote === response.id ? '...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>

    {/* Modals */}
    {showEdit && (
      <EditPatientModal
        patientId={patientId}
        fullName={fullName}
        diagnosis={diagnosis}
        notes={notes}
        active={active}
        onClose={() => setShowEdit(false)}
      />
    )}
    {showDelete && (
      <DeleteConfirmModal
        patientId={patientId}
        fullName={fullName}
        onClose={() => setShowDelete(false)}
      />
    )}
    </>
  )
}
