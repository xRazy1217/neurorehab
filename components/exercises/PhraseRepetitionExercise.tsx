'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  content: { phrases: string[] }
}

export default function PhraseRepetitionExercise({
  patientTaskId, patientId, title, area, content, alreadyCompleted
}: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(alreadyCompleted)
  const [loadingAudio, setLoadingAudio] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Cache blobs so we don't re-fetch the same phrase
  const audioCacheRef = useRef<Record<number, string>>({})

  const phrases = content.phrases
  const current = phrases[currentIndex]
  const total = phrases.length

  const playPhrase = useCallback(async () => {
    // Stop if already playing
    if (isPlaying) {
      audioRef.current?.pause()
      speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    setLoadingAudio(true)

    try {
      // Use cached blob URL if available
      let blobUrl = audioCacheRef.current[currentIndex]

      if (!blobUrl) {
        // Fetch from ElevenLabs proxy
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: current }),
        })

        if (res.ok) {
          const buffer = await res.arrayBuffer()
          const blob = new Blob([buffer], { type: 'audio/mpeg' })
          blobUrl = URL.createObjectURL(blob)
          audioCacheRef.current[currentIndex] = blobUrl
        } else {
          throw new Error('TTS API failed')
        }
      }

      setLoadingAudio(false)

      // Play audio
      const audio = new Audio(blobUrl)
      audioRef.current = audio
      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
      await audio.play()

    } catch (e) {
      console.warn('ElevenLabs failed, falling back to Web Speech:', e)
      setLoadingAudio(false)

      // Fallback to Web Speech API
      try {
        const utterance = new SpeechSynthesisUtterance(current)
        utterance.lang = 'es-ES'
        utterance.rate = 0.85
        const voices = speechSynthesis.getVoices()
        const spanish = voices.find(v => v.lang.startsWith('es'))
        if (spanish) utterance.voice = spanish
        utterance.onstart = () => setIsPlaying(true)
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        speechSynthesis.speak(utterance)
      } catch {
        setIsPlaying(false)
      }
    }
  }, [current, currentIndex, isPlaying])

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
      alert('No se pudo acceder al micrófono.')
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
        score: null,
      })

      if (currentIndex < total - 1) {
        // Stop any playing audio before moving on
        audioRef.current?.pause()
        speechSynthesis.cancel()
        setIsPlaying(false)
        setCurrentIndex(i => i + 1)
        setRecordingBlob(null)
      } else {
        await completePatientTask(supabase, patientTaskId, patientId, area as 'lenguaje' | 'habla' | 'cognicion', 10)
        setDone(true)
      }
    } catch (e) {
      console.error(e)
      alert('Error al guardar. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }, [recordingBlob, currentIndex, total, patientTaskId, patientId, area])

  if (done) return <CompletionScreen onBack={() => router.push('/app/tareas')} title={title} />

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <ExerciseHeader title={title} area={area} onBack={() => router.back()} />

      <div className="flex-1 px-5 py-6 flex flex-col">
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {phrases.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === currentIndex ? '24px' : '8px', backgroundColor: i <= currentIndex ? '#7F77DD' : '#E5E7EB' }} />
            ))}
          </div>
          <span className="text-xs text-text-muted font-medium">{currentIndex + 1} / {total}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Phrase card */}
          <div className="w-full bg-surface rounded-card shadow-card p-6">
            <p className="text-xs text-text-muted mb-2 text-center">Escucha y repite en voz alta:</p>
            <p className="text-[18px] font-semibold text-text text-center leading-relaxed">
              &ldquo;{current}&rdquo;
            </p>
          </div>

          {/* Play button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={playPhrase}
              disabled={loadingAudio}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all ${
                loadingAudio
                  ? 'bg-gray-200 cursor-wait'
                  : isPlaying
                    ? 'bg-primary-dark scale-105'
                    : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {loadingAudio ? (
                <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              ) : isPlaying ? (
                <div className="flex gap-1 items-end h-6">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-1 bg-white rounded-full wave-bar" style={{ height: `${(i % 3 + 1) * 7}px` }} />
                  ))}
                </div>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>
            <p className="text-xs text-text-muted">
              {loadingAudio ? 'Cargando audio...' : isPlaying ? 'Reproduciendo...' : 'Toca para escuchar la frase'}
            </p>
          </div>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {isRecording && <div className="absolute inset-0 rounded-full bg-red-400 pulse-ring" />}
              <button
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                onPointerLeave={() => { if (isRecording) stopRecording() }}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg select-none touch-none transition-all ${
                  isRecording ? 'bg-red-500 scale-110' : 'bg-[#FEF0EB] hover:bg-red-100'
                }`}
              >
                {isRecording ? (
                  <div className="flex gap-1 items-end h-7">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="w-1 bg-white rounded-full wave-bar" style={{ height: `${(i % 3 + 1) * 8}px` }} />
                    ))}
                  </div>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-text-muted text-center">
              {isRecording
                ? 'Grabando… suelta para detener'
                : recordingBlob
                  ? '✓ Repetición grabada'
                  : 'Mantén presionado para grabar tu voz'}
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
