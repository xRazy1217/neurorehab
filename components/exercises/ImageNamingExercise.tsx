'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { uploadRecording, completePatientTask } from '@/lib/exercises'
import ExerciseHeader from './ExerciseHeader'
import CompletionScreen from './CompletionScreen'

interface Props {
  patientTaskId: string
  patientId: string
  title: string
  area: string
  alreadyCompleted: boolean
  content: { images: Array<{ url: string; answer: string }> }
}

export default function ImageNamingExercise({
  patientTaskId, patientId, title, area, content, alreadyCompleted
}: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(alreadyCompleted)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const images = content.images
  const current = images[currentIndex]
  const total = images.length

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        setRecordingBlob(new Blob(chunksRef.current, { type: mimeType }))
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingBlob(null)
    } catch {
      alert('No se pudo acceder al micrófono. Verifica los permisos.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  const handleNext = useCallback(async () => {
    if (!recordingBlob) return
    setUploading(true)

    try {
      const supabase = createClient()
      const recordingPath = await uploadRecording(supabase, recordingBlob, patientId, patientTaskId, currentIndex)

      await supabase.from('task_responses').insert({
        patient_task_id: patientTaskId,
        patient_id: patientId,
        recording_url: recordingPath,
        score: null, // therapist scores later
      })

      if (currentIndex < total - 1) {
        setCurrentIndex(i => i + 1)
        setRecordingBlob(null)
      } else {
        await completePatientTask(supabase, patientTaskId, patientId, area as 'lenguaje' | 'habla' | 'cognicion', 8)
        setDone(true)
      }
    } catch (e) {
      console.error('handleNext error:', e)
      alert('Error al guardar. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }, [recordingBlob, currentIndex, total, patientTaskId, patientId, area])

  if (done) {
    return <CompletionScreen onBack={() => router.push('/app/tareas')} title={title} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <ExerciseHeader title={title} area={area} onBack={() => router.back()} />

      <div className="flex-1 px-5 py-6 flex flex-col">
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === currentIndex ? '24px' : '8px', backgroundColor: i <= currentIndex ? '#7F77DD' : '#E5E7EB' }} />
            ))}
          </div>
          <span className="text-xs text-text-muted font-medium">{currentIndex + 1} / {total}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Image */}
          <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-card bg-surface mb-6">
            <Image src={current.url} alt="Ejercicio" width={320} height={320} className="w-full h-full object-cover" unoptimized />
          </div>

          <p className="text-sm text-text-muted text-center mb-8">
            Mira la imagen y di en voz alta lo que ves
          </p>

          {/* Mic */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {isRecording && <div className="absolute inset-0 rounded-full bg-red-400 pulse-ring" />}
              <button
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                onPointerLeave={() => { if (isRecording) stopRecording() }}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg select-none touch-none ${
                  isRecording ? 'bg-red-500 scale-110' : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {isRecording ? (
                  <div className="flex gap-1 items-end h-7">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="w-1 bg-white rounded-full wave-bar" style={{ height: `${(i % 3 + 1) * 8}px` }} />
                    ))}
                  </div>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-text-muted text-center">
              {isRecording ? 'Grabando… suelta para detener' : recordingBlob ? '✓ Audio grabado' : 'Mantén presionado para grabar'}
            </p>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!recordingBlob || uploading}
          className="w-full py-4 bg-primary text-white font-semibold rounded-xl mt-6 disabled:opacity-40 hover:bg-primary-dark transition-all shadow-sm"
        >
          {uploading ? 'Guardando...' : currentIndex < total - 1 ? 'Siguiente →' : 'Finalizar ejercicio'}
        </button>
      </div>
    </div>
  )
}
