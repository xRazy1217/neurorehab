// Server-side TTS proxy — keeps ElevenLabs API key secret
export async function POST(req: Request) {
  const { text, voiceId } = await req.json()

  if (!text || typeof text !== 'string') {
    return Response.json({ error: 'text required' }, { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    // No key configured → client falls back to Web Speech
    return Response.json({ error: 'TTS not configured', fallback: true }, { status: 503 })
  }

  const voice = voiceId ?? 'pFZP5JQG7iQjIQuC4Bku' // Lucia — Spanish female

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    })

    // Quota exceeded (402) or any other error → signal client to use fallback
    if (!res.ok) {
      const body = await res.text()
      console.warn(`ElevenLabs ${res.status}:`, body)

      // 402 = out of credits, 429 = rate limit — both should fallback gracefully
      const isFallbackable = res.status === 402 || res.status === 429 || res.status >= 500
      return Response.json(
        { error: 'TTS unavailable', fallback: isFallbackable },
        { status: res.status }
      )
    }

    const audioBuffer = await res.arrayBuffer()

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // cache 24h — same phrase = same audio
      },
    })
  } catch (e) {
    console.error('TTS fetch error:', e)
    return Response.json({ error: 'Connection error', fallback: true }, { status: 500 })
  }
}
