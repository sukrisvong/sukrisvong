import { useState } from "react"
import { submitScore } from "../api"
import type { ScoreResponse } from "../api"
import type { Theme, ThemeId } from "../themes/index"
import type { Input } from "../games/laneDodger/engine"

type Props = {
  sessionId: string
  score: number
  theme: Theme
  themeId: ThemeId
  inputs: Input[]
  onSubmitted: (result: ScoreResponse) => void
}

export default function ScoreSubmit({ sessionId, score, theme, themeId, inputs, onSubmitted }: Props) {
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await submitScore({
        sessionId,
        claimedScore: score,
        playerName: name.trim(),
        theme: themeId,
        inputs,
      })
      onSubmitted(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ color: theme.colors.pageText, fontFamily: "monospace" }}>
      <p>GAME OVER — SCORE: {score}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="player-name">Enter your name:</label>
        <br />
        <input
          id="player-name"
          type="text"
          maxLength={30}
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginTop: 4, marginBottom: 8, background: "#111", color: theme.colors.hudText, border: `1px solid ${theme.colors.accent}`, padding: "4px 8px" }}
        />
        <br />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          style={{ background: theme.colors.accent, color: "#000", padding: "6px 16px", border: "none", cursor: "pointer" }}
        >
          {submitting ? "Submitting..." : "Submit Score"}
        </button>
      </form>
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
    </div>
  )
}
