import { render, screen, waitFor } from "@testing-library/react"
import Leaderboard from "../Leaderboard"
import { themeFor } from "../../themes/index"
import * as api from "../../api"

vi.mock("../../api")
const mockFetchLeaderboard = vi.mocked(api.fetchLeaderboard)

const theme = themeFor("cyberpunk")

describe("Leaderboard", () => {
  it("shows entries when data loads", async () => {
    mockFetchLeaderboard.mockResolvedValue([
      { rank: 1, player_name: "Alice", score: 200, theme: "cyberpunk", created_at: "2026-01-01T00:00:00Z" },
    ])
    render(<Leaderboard game="lane_dodger" theme={theme} />)
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument())
    expect(screen.getByText("200")).toBeInTheDocument()
  })

  it("shows empty message when no entries", async () => {
    mockFetchLeaderboard.mockResolvedValue([])
    render(<Leaderboard game="lane_dodger" theme={theme} />)
    await waitFor(() => expect(screen.getByText("No scores yet.")).toBeInTheDocument())
  })

  it("shows error when fetch fails", async () => {
    mockFetchLeaderboard.mockRejectedValue(new Error("Server error"))
    render(<Leaderboard game="lane_dodger" theme={theme} />)
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Server error"))
  })
})
