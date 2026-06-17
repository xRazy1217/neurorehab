'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { completePatientTask } from '@/lib/exercises'
import ExerciseHeader from './ExerciseHeader'
import CompletionScreen from './CompletionScreen'

interface Props {
  patientTaskId: string
  patientId: string
  title: string
  area: string
  alreadyCompleted: boolean
  content: {
    image_url: string
    display_seconds: number
    question: string
    options: string[]
    correct: string[]
  }
}

type Phase = 'show' | 'select' | 'result'

export default function VisualMemoryExercise({
  patientTaskId, patientId, title, area, content, alreadyCompleted
}: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>(alreadyCompleted ? 'result' : 'show')
  const [countdown, setCountdown] = useState(content.display_seconds)
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (phase !== 'show') return
    if (countdown <= 0) { setPhase('select'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, phase])

  const toggleOption = useCallback((option: string) => {
    setSelected(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option])
  }, [])

  const handleSubmit = useCallback(async () => {
    if (saving) return
    const correct = content.correct
    const hits = selected.filter(s => correct.includes(s)).length
    const falsePositives = selected.filter(s => !correct.includes(s)).length
    const calculatedScore = Math.max(0, Math.round((hits / correct.length) * 100 - falsePositives * 10))

    setScore(calculatedScore)
    setPhase('result')
    setSaving(true)

    try {
      const supabase = createClient()

      await supabase.from('task_responses').insert({
        patient_task_id: patientTaskId,
        patient_id: patientId,
        selected_options: selected,
        score: calculatedScore,
      })

      await completePatientTask(
        supabase, patientTaskId, patientId,
        area as 'lenguaje' | 'habla' | 'cognicion', 5
      )
    } catch (e) {
      console.error('submit error:', e)
    } finally {
      setSaving(false)
    }
  }, [selected, content.correct, patientTaskId, patientId, area, saving])

  if (done) {
    return <CompletionScreen onBack={() => router.push('/app/tareas')} title={title} score={score} />
  }

  const circumference = 2 * Math.PI * 20
  const dashoffset = circumference * (1 - countdown / content.display_seconds)

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <ExerciseHeader title={title} area={area} onBack={() => router.back()} />

      <div className="flex-1 px-5 py-6 flex flex-col">

        {/* SHOW phase */}
        {phase === 'show' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in">
            <p className="text-sm text-text-muted text-center">Memoriza los objetos de la imagen</p>

            {/* Countdown ring */}
            <div className="relative">
              <svg width="56" height="56" className="-rotate-90">
                <circle cx="28" cy="28" r="20" fill="none" stroke="#EEEDFE" strokeWidth="5"/>
                <circle cx="28" cy="28" r="20" fill="none" stroke="#7F77DD" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{countdown}</span>
              </div>
            </div>

            <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-card bg-surface">
              <Image
                src={content.image_url}
                alt="Imagen a memorizar"
                width={320}
                height={320}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* SELECT phase */}
        {phase === 'select' && (
          <div className="flex-1 flex flex-col animate-in">
            <div className="bg-surface rounded-card shadow-card p-4 mb-5">
              <p className="text-sm font-semibold text-text text-center">{content.question}</p>
              <p className="text-xs text-text-muted text-center mt-1">
                Selecciona todos los objetos que recuerdas haber visto
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 content-start">
              {content.options.map(option => {
                const isSelected = selected.includes(option)
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={`rounded-xl p-4 text-sm font-medium transition-all border-2 ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface text-text border-transparent shadow-card hover:border-primary/30'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={selected.length === 0 || saving}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl mt-5 disabled:opacity-40 hover:bg-primary-dark transition-all shadow-sm"
            >
              {saving ? 'Guardando...' : 'Confirmar respuesta'}
            </button>
          </div>
        )}

        {/* RESULT phase */}
        {phase === 'result' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in">
            <div className="text-5xl mb-4">{score >= 70 ? '🎉' : score >= 40 ? '👍' : '💪'}</div>
            <h2 className="text-[22px] font-bold text-text mb-1">
              {score >= 70 ? '¡Excelente memoria!' : score >= 40 ? '¡Buen intento!' : '¡Sigue practicando!'}
            </h2>
            <p className="text-text-muted text-sm mb-6">
              {alreadyCompleted ? 'Ya completaste este ejercicio' : `Puntuación: ${score}/100`}
            </p>

            <div className="w-full space-y-2 mb-8">
              {content.options.map(opt => {
                const isCorrect = content.correct.includes(opt)
                const wasSelected = selected.includes(opt)
                let status: 'correct' | 'wrong' | 'missed' | 'neutral' = 'neutral'
                if (alreadyCompleted) { status = isCorrect ? 'correct' : 'neutral' }
                else {
                  if (isCorrect && wasSelected) status = 'correct'
                  else if (!isCorrect && wasSelected) status = 'wrong'
                  else if (isCorrect && !wasSelected) status = 'missed'
                }

                return (
                  <div key={opt} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                    status === 'correct' ? 'bg-[#E8F9F4] text-[#1D9E75]' :
                    status === 'wrong' ? 'bg-[#FEF0EB] text-[#D85A30]' :
                    status === 'missed' ? 'bg-primary-light text-primary' :
                    'bg-surface text-text-muted'
                  }`}>
                    <span>{opt}</span>
                    {status === 'correct' && <span>✓</span>}
                    {status === 'wrong' && <span>✗</span>}
                    {status === 'missed' && <span className="text-xs">No recordado</span>}
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setDone(true)}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm"
            >
              Ver mis tareas
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
