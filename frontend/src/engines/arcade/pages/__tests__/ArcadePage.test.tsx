import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import ArcadePage from "../ArcadePage"
import * as api from "../../api"

vi.mock("../../api")
const mockCreateSession = vi.mocked(api.createSession)
const mockFetchLeaderboard = vi.mocked(api.fetchLeaderboard)

vi.mock("../../components/GameCanvas", () => ({
  default: ({ onDead }: { onDead: (state: unknown) => void }) => (
    <div data-testid="game-canvas">
      <button onClick={() => onDead({ score: 50, inputs: [], sessionId: "s1", dead: true, deathMs: null, lives: 0, lane: 1, seed: 1, rng: null, startTime: 0, invincibleUntilMs: -1, obstacles: [], nextSpawnMs: 0 })}>
        Trigger Dead
      </button>
    </div>
  ),
}))

beforeEach(() => {
  mockFetchLeaderboard.mockResolvedValue([])
  mockCreateSession.mockResolvedValue({ session_id: "s1", seed: 42, game: "lane_dodger", expires_at: "2026-01-01T00:00:00Z" })
})

describe("ArcadePage", () => {
  it("renders in idle phase with start button and leaderboard", async () => {
    render(<ArcadePage />)
    expect(screen.getByText("START GAME")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText("LEADERBOARD")).toBeInTheDocument())
  })

  it("shows theme picker", () => {
    render(<ArcadePage />)
    expect(screen.getByText("Cyberpunk")).toBeInTheDocument()
    expect(screen.getByText("Medieval")).toBeInTheDocument()
  })

  it("switches theme when picker is used", () => {
    render(<ArcadePage />)
    fireEvent.click(screen.getByText("Medieval"))
    expect(screen.getByText("Medieval")).toHaveAttribute("aria-pressed", "true")
  })

  it("transitions to playing on start", async () => {
    render(<ArcadePage />)
    await act(async () => { fireEvent.click(screen.getByText("START GAME")) })
    await waitFor(() => expect(screen.getByTestId("game-canvas")).toBeInTheDocument())
  })

  it("transitions to dead phase when game over", async () => {
    render(<ArcadePage />)
    await act(async () => { fireEvent.click(screen.getByText("START GAME")) })
    await waitFor(() => screen.getByTestId("game-canvas"))
    act(() => { fireEvent.click(screen.getByText("Trigger Dead")) })
    expect(screen.getByText(/GAME OVER/)).toBeInTheDocument()
  })

  it("shows error when createSession fails", async () => {
    mockCreateSession.mockRejectedValue(new Error("Network error"))
    render(<ArcadePage />)
    await act(async () => { fireEvent.click(screen.getByText("START GAME")) })
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Network error"))
  })

  it("shows generic error when non-Error thrown from createSession", async () => {
    mockCreateSession.mockRejectedValue("something")
    render(<ArcadePage />)
    await act(async () => { fireEvent.click(screen.getByText("START GAME")) })
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Failed to start game"))
  })

  it("transitions to submitted and shows play again button", async () => {
    vi.mocked(api.submitScore).mockResolvedValue({ id: 1, score: 50, rank: 3, player_name: "Alice" })

    render(<ArcadePage />)
    await act(async () => { fireEvent.click(screen.getByText("START GAME")) })
    await waitFor(() => screen.getByTestId("game-canvas"))
    act(() => { fireEvent.click(screen.getByText("Trigger Dead")) })

    fireEvent.change(screen.getByLabelText("Enter your name:"), { target: { value: "Alice" } })
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Submit Score" })) })

    await waitFor(() => expect(screen.getByText(/You ranked #3/)).toBeInTheDocument())
    expect(screen.getByText("PLAY AGAIN")).toBeInTheDocument()
  })
})
