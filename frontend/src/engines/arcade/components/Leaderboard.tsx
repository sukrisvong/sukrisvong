import { useEffect, useState } from "react"
import { fetchLeaderboard } from "../api"
import type { LeaderboardEntry } from "../api"
import type { Theme } from "../themes/index"

type Props = {
  game: string
  theme: Theme
}

export default function Leaderboard({ game, theme }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard(game)
      .then(setEntries)
      .catch((e: Error) => setError(e.message))
  }, [game])

  if (error) {
    return <p style={{ color: "red" }} role="alert">{error}</p>
  }

  return (
    <div style={{ color: theme.colors.pageText, fontFamily: "monospace" }}>
      <h3 style={{ margin: "0 0 8px" }}>LEADERBOARD</h3>
      {entries.length === 0 ? (
        <p>No scores yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Player</th>
              <th style={{ textAlign: "right", padding: "4px 8px" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.rank}>
                <td style={{ padding: "4px 8px" }}>{e.rank}</td>
                <td style={{ padding: "4px 8px" }}>{e.player_name}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{e.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
