'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/types'

interface Task {
  id: string
  title: string
  type: string
  area: string
  duration_minutes: number
  description: string
}

interface AssignedTask {
  id: string
  completed: boolean
  due_date: string | null
  assigned_at: string
  tasks: Task | null
}

interface Props {
  patientId: string
  patientName: string
  assignedTasks: AssignedTask[]
  taskLibrary: Task[]
}

const areaConfig: Record<string, { color: string; bg: string; label: string }> = {
  lenguaje: { color: '#1D9E75', bg: '#E8F9F4', label: 'Lenguaje' },
  habla: { color: '#D85A30', bg: '#FEF0EB', label: 'Habla' },
  cognicion: { color: '#7F77DD', bg: '#EEEDFE', label: 'Cognición' },
}

export default function PatientTasksClient({ patientId, patientName, assignedTasks, taskLibrary }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '', description: '', type: 'image_naming' as Task['type'],
    area: 'lenguaje', duration_minutes: 5
  })
  const [creating, setCreating] = useState(false)

  async function assignTask(taskId: string) {
    setAssigning(taskId)
    const supabase = createClient()
    await supabase.from('patient_tasks').insert({
      patient_id: patientId,
      task_id: taskId,
    })
    setAssigning(null)
    setShowModal(false)
    router.refresh()
  }

  async function removeTask(ptId: string) {
    const supabase = createClient()
    await supabase.from('patient_tasks').delete().eq('id', ptId)
    router.refresh()
  }

  async function createAndAssign() {
    setCreating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Default content per type
    const defaultContent: Record<string, Json> = {
      image_naming: { images: [{ url: 'https://picsum.photos/400/400?random=1', answer: 'objeto' }] },
      phrase_repetition: { phrases: ['El perro corre por el parque'] },
      visual_memory: {
        image_url: 'https://picsum.photos/400/400?random=2',
        display_seconds: 5,
        question: '¿Qué objetos recuerdas?',
        options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correct: ['Opción A', 'Opción B'],
      },
    }

    const { data: newTask } = await supabase.from('tasks').insert({
      ...createForm,
      content: defaultContent[createForm.type],
      created_by: user.id,
    }).select().single()

    if (newTask) {
      await supabase.from('patient_tasks').insert({
        patient_id: patientId,
        task_id: newTask.id,
      })
    }

    setCreating(false)
    setShowCreateForm(false)
    setShowModal(false)
    router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-6">
      <Link href={`/admin/pacientes/${patientId}`} className="flex items-center gap-2 text-text-muted text-sm mb-5 hover:text-text">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        {patientName}
      </Link>

      <div className="flex items-center justify-between mb-5 animate-in">
        <div>
          <h1 className="text-[22px] font-bold text-text">Tareas asignadas</h1>
          <p className="text-text-muted text-sm">{assignedTasks.length} tarea{assignedTasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Asignar tarea
        </button>
      </div>

      <div className="space-y-3 animate-in animate-in-delay-1">
        {assignedTasks.length === 0 && (
          <div className="bg-surface rounded-card shadow-card p-8 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-text-muted">Sin tareas asignadas</p>
          </div>
        )}

        {assignedTasks.map((pt, i) => {
          const task = pt.tasks
          if (!task) return null
          const cfg = areaConfig[task.area] ?? areaConfig.lenguaje

          return (
            <div
              key={pt.id}
              className="bg-surface rounded-card shadow-card p-4 flex items-center gap-3 animate-in"
              style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                <span className="text-lg">
                  {task.type === 'image_naming' ? '🖼️' : task.type === 'phrase_repetition' ? '🎤' : '👁️'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  <span className="text-xs text-text-muted">{task.duration_minutes} min</span>
                  {pt.completed && <span className="text-xs text-[#1D9E75]">✓ Completada</span>}
                </div>
              </div>
              <button
                onClick={() => removeTask(pt.id)}
                className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="bg-surface rounded-t-[24px] sm:rounded-card w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-xl animate-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-[16px] font-semibold text-text">Asignar tarea</h2>
              <button onClick={() => { setShowModal(false); setShowCreateForm(false) }} className="w-8 h-8 rounded-full bg-bg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {!showCreateForm && (
                <>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full py-3 border-2 border-dashed border-primary/40 rounded-xl text-primary text-sm font-medium hover:border-primary hover:bg-primary-light transition-all mb-4"
                  >
                    + Crear ejercicio personalizado
                  </button>

                  {taskLibrary.length === 0 && (
                    <p className="text-sm text-text-muted text-center py-4">No hay tareas en la biblioteca</p>
                  )}

                  <div className="space-y-3">
                    {taskLibrary.map(task => {
                      const cfg = areaConfig[task.area] ?? areaConfig.lenguaje
                      const alreadyAssigned = assignedTasks.some(at => at.tasks?.id === task.id && !at.completed)

                      return (
                        <div key={task.id} className="flex items-center gap-3 bg-bg rounded-xl p-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: cfg.bg }}>
                            {task.type === 'image_naming' ? '🖼️' : task.type === 'phrase_repetition' ? '🎤' : '👁️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">{task.title}</p>
                            <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.label} · {task.duration_minutes} min</span>
                          </div>
                          <button
                            onClick={() => assignTask(task.id)}
                            disabled={alreadyAssigned || assigning === task.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              alreadyAssigned
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-dark'
                            }`}
                          >
                            {assigning === task.id ? '...' : alreadyAssigned ? 'Asignada' : 'Asignar'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {showCreateForm && (
                <div className="space-y-4">
                  <button onClick={() => setShowCreateForm(false)} className="flex items-center gap-1 text-text-muted text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    Volver
                  </button>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Título *</label>
                    <input
                      value={createForm.title}
                      onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Nombre del ejercicio"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Descripción</label>
                    <input
                      value={createForm.description}
                      onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descripción breve"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Tipo</label>
                      <select
                        value={createForm.type}
                        onChange={e => setCreateForm(f => ({ ...f, type: e.target.value as Task['type'] }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg"
                      >
                        <option value="image_naming">Nombrar imágenes</option>
                        <option value="phrase_repetition">Repetir frases</option>
                        <option value="visual_memory">Memoria visual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Área</label>
                      <select
                        value={createForm.area}
                        onChange={e => setCreateForm(f => ({ ...f, area: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg"
                      >
                        <option value="lenguaje">Lenguaje</option>
                        <option value="habla">Habla</option>
                        <option value="cognicion">Cognición</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Duración (minutos)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={createForm.duration_minutes}
                      onChange={e => setCreateForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 5 }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-bg"
                    />
                  </div>

                  <p className="text-xs text-text-muted bg-bg p-3 rounded-xl">
                    💡 El ejercicio se crea con contenido de ejemplo. Podrás editarlo desde la biblioteca de tareas.
                  </p>

                  <button
                    onClick={createAndAssign}
                    disabled={!createForm.title || creating}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-60"
                  >
                    {creating ? 'Creando...' : 'Crear y asignar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
