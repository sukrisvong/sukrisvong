import type { ThemeId } from "./themes/index"
import type { Input } from "./games/laneDodger/engine"

const BASE = "/api/arcade"

export type SessionResponse = {
  session_id: string
  seed: number
  game: string
  expires_at: string
}

export type ScoreResponse = {
  id: number
  score: number
  rank: number
  player_name: string
}

export type LeaderboardEntry = {
  rank: number
  player_name: string
  score: number
  theme: ThemeId
  created_at: string
}

export async function createSession(game: string): Promise<SessionResponse> {
  const res = await fetch(`${BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game }),
  })
  if (!res.ok) throw new Error("Failed to create session")
  return res.json()
}

export async function submitScore(opts: {
  sessionId: string
  claimedScore: number
  playerName: string
  theme: ThemeId
  inputs: Input[]
}): Promise<ScoreResponse> {
  const res = await fetch(`${BASE}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: opts.sessionId,
      claimed_score: opts.claimedScore,
      player_name: opts.playerName,
      theme: opts.theme,
      inputs: opts.inputs,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? "Failed to submit score")
  }
  return res.json()
}

export async function fetchLeaderboard(game: string): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE}/leaderboard?game=${encodeURIComponent(game)}`)
  if (!res.ok) throw new Error("Failed to fetch leaderboard")
  return res.json()
}
