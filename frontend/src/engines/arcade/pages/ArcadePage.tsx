import { useState } from "react"
import type { ThemeId } from "../themes/index"
import { themeFor } from "../themes/index"
import type { GameState } from "../games/laneDodger/engine"
import type { ScoreResponse } from "../api"
import { createSession } from "../api"
import ThemePicker from "../components/ThemePicker"
import GameCanvas from "../components/GameCanvas"
import Leaderboard from "../components/Leaderboard"
import ScoreSubmit from "../components/ScoreSubmit"

type Phase = "idle" | "playing" | "dead" | "submitted"

type Session = { sessionId: string; seed: number }

export default function ArcadePage() {
  const [themeId, setThemeId] = useState<ThemeId>("cyberpunk")
  const [phase, setPhase] = useState<Phase>("idle")
  const [session, setSession] = useState<Session | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const theme = themeFor(themeId)

  async function startGame() {
    setError(null)
    try {
      const s = await createSession("lane_dodger")
      setSession({ sessionId: s.session_id, seed: s.seed })
      setGameState(null)
      setPhase("playing")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start game")
    }
  }

  function handleDead(state: GameState) {
    setGameState(state)
    setPhase("dead")
  }

  function handleSubmitted(result: ScoreResponse) {
    setScoreResult(result)
    setPhase("submitted")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.pageBackground,
        color: theme.pageText,
        fontFamily: "monospace",
        padding: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>ARCADE</h1>
        <ThemePicker current={themeId} onChange={setThemeId} theme={theme} />
      </div>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {phase === "idle" && (
        <div>
          <button
            onClick={startGame}
            style={{ background: theme.colors.accent, color: "#000", padding: "10px 24px", border: "none", cursor: "pointer", fontSize: 16 }}
          >
            START GAME
          </button>
          <div style={{ marginTop: 24 }}>
            <Leaderboard game="lane_dodger" theme={theme} />
          </div>
        </div>
      )}

      {phase === "playing" && session && (
        <div>
          <GameCanvas
            seed={session.seed}
            sessionId={session.sessionId}
            theme={theme}
            onDead={handleDead}
          />
          <p style={{ textAlign: "center", fontSize: 12, marginTop: 8 }}>← → arrow keys to dodge</p>
        </div>
      )}

      {phase === "dead" && gameState && session && (
        <div>
          <ScoreSubmit
            sessionId={session.sessionId}
            score={gameState.score}
            theme={theme}
            themeId={themeId}
            inputs={gameState.inputs}
            onSubmitted={handleSubmitted}
          />
        </div>
      )}

      {phase === "submitted" && scoreResult && (
        <div>
          <p>Score submitted! You ranked #{scoreResult.rank} with {scoreResult.score} points.</p>
          <button
            onClick={startGame}
            style={{ background: theme.colors.accent, color: "#000", padding: "10px 24px", border: "none", cursor: "pointer", fontSize: 16 }}
          >
            PLAY AGAIN
          </button>
          <div style={{ marginTop: 24 }}>
            <Leaderboard game="lane_dodger" theme={theme} />
          </div>
        </div>
      )}
    </div>
  )
}
