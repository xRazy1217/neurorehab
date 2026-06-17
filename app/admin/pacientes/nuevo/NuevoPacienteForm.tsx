'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoPacienteForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    diagnosis: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/create-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? 'Error al crear el paciente')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('create patient catch:', err)
      setError('Error inesperado. Revisa la consola del servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in animate-in-delay-1">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Personal info */}
      <div className="bg-surface rounded-card shadow-card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-text">Datos personales</h3>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Nombre completo *</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            placeholder="Juan Pérez García"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-bg"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Correo electrónico *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="paciente@correo.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-bg"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Contraseña inicial *</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-bg"
          />
          <p className="text-xs text-text-muted mt-1">Comparte estas credenciales con el paciente</p>
        </div>
      </div>

      {/* Clinical info */}
      <div className="bg-surface rounded-card shadow-card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-text">Información clínica</h3>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Diagnóstico</label>
          <input
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            placeholder="ACV isquémico, afasia de Broca..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-bg"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Notas clínicas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Observaciones, consideraciones especiales..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-bg resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3.5 bg-surface text-text-muted font-semibold rounded-xl border border-gray-200 hover:bg-bg transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm disabled:opacity-60"
        >
          {loading ? 'Creando...' : 'Crear paciente'}
        </button>
      </div>
    </form>
  )
}
