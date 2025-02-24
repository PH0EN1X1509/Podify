"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Mic, AudioWaveformIcon as Waveform } from "lucide-react"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { FormData, ApiResponse } from "@/types"
import Recommendations from "@/components/recommendation"
import Form from "@/components/recommend"

const emotions = ["Happy", "Sad", "Angry", "Excited", "Neutral", "Fearful"]

interface Speaker {
  name: string
  voice: string
  pitch: number
  loudness: number
  emotion: string
}

export default function PodcastApp() {
  const [topic, setTopic] = useState("")
  const [location, setLocation] = useState("")
  const [emotion, setEmotion] = useState("Professional")
  const [numSpeakers, setNumSpeakers] = useState(1)
  const [speakers, setSpeakers] = useState<Record<string, Speaker>>({})
  const [script, setScript] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [availableVoices, setAvailableVoices] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])

  const handleSubmit = async (formData: FormData) => {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    const data: ApiResponse = await response.json()
    setRecommendations(data.topics)
  }

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/get-voices")
        const data = await res.json()
        setAvailableVoices(data.voices)
      } catch (error) {
        console.error("Failed to fetch voices:", error)
        setError("Failed to load available voices")
      }
    }
    fetchVoices()
  }, [])

  useEffect(() => {
    setSpeakers((prev) => {
      const newSpeakers: Record<string, Speaker> = {}
      for (let i = 1; i <= numSpeakers; i++) {
        const speakerKey = `Speaker ${i}`
        newSpeakers[speakerKey] = prev[speakerKey] || {
          name: speakerKey,
          voice: availableVoices[0] || "Default",
          pitch: 1.0,
          loudness: 1.0,
          emotion: "Neutral",
        }
      }
      return newSpeakers
    })
  }, [numSpeakers, availableVoices])

  const generateContent = async () => {
    setIsLoading(true)
    setError("")
    try {
      const scriptRes = await fetch("http://127.0.0.1:5000/generate_script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          location,
          emotion,
          duration: "5",
          speakers: Object.keys(speakers),
          mood: emotion,
        }),
      })

      const scriptData = await scriptRes.json()
      if (scriptData.error) throw new Error(scriptData.error)
      setScript(scriptData.script)

      const audioRes = await fetch("http://127.0.0.1:5000/generate_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: scriptData.script,
          speakers: Object.fromEntries(
            Object.entries(speakers).map(([key, speaker]) => [
              key,
              {
                ...speaker,
                voice: speaker.voice || availableVoices[0],
                pitch: speaker.pitch || 1.0,
                loudness: speaker.loudness || 1.0,
                emotion: speaker.emotion || "Neutral"
              }
            ])
          )
        }),
      })

      if (!audioRes.ok) {
        const audioError = await audioRes.text()
        throw new Error(audioError)
      }

      const audioBlob = await audioRes.blob()
      setAudioUrl(URL.createObjectURL(audioBlob))
    } catch (error) {
      setError("Failed to generate content. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">AI Podcast Generator</h1>
          <p className="text-gray-400">Create professional podcasts with AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Podcast Settings</h2>
                
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter podcast topic"
                  className="bg-gray-700 border-gray-600"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Recording location"
                    className="bg-gray-700 border-gray-600"
                  />

                  <Select value={emotion} onValueChange={setEmotion}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      {emotions.map((emo) => (
                        <SelectItem key={emo} value={emo}>{emo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select
                  value={numSpeakers.toString()}
                  onValueChange={(value) => setNumSpeakers(Number(value))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Number of speakers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Speaker</SelectItem>
                    <SelectItem value="2">2 Speakers</SelectItem>
                  </SelectContent>
                </Select>

                {Object.entries(speakers).map(([speakerKey, speaker]) => (
                  <div key={speakerKey} className="bg-gray-700 p-4 rounded-lg space-y-4">
                    <h3 className="font-medium">{speakerKey}</h3>
                    <Select
                      value={speaker.voice}
                      onValueChange={(value) => {
                        setSpeakers((prev) => ({
                          ...prev,
                          [speakerKey]: { ...prev[speakerKey], voice: value },
                        }))
                      }}
                    >
                      <SelectTrigger className="bg-gray-600 border-gray-500">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVoices.map((voice) => (
                          <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div>
                      <label className="text-sm text-gray-400">Voice Pitch</label>
                      <Slider
                        value={[speaker.pitch * 100]}
                        min={50}
                        max={200}
                        step={1}
                        onValueChange={(value) => {
                          setSpeakers((prev) => ({
                            ...prev,
                            [speakerKey]: { ...prev[speakerKey], pitch: value[0] / 100 },
                          }))
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  onClick={generateContent}
                  disabled={isLoading || !topic}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate Podcast"}
                </Button>
              </div>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </section>

          <section className="space-y-6">
            {script && (
              <Card className="bg-gray-800 border-gray-700">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Generated Script</h2>
                  <div className="bg-gray-700 p-4 rounded-lg max-h-80 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{script}</p>
                  </div>
                </div>
              </Card>
            )}

            {audioUrl && (
              <Card className="bg-gray-800 border-gray-700">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Waveform className="w-5 h-5" />
                    Audio Preview
                  </h2>
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full"
                    onError={() => setError("Failed to load audio")}
                  />
                </div>
              </Card>
            )}
          </section>
        </div>

        <section className="mt-12">
          <Form onSubmit={handleSubmit} />
          <div className="mt-6">
            <Recommendations topics={recommendations} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}