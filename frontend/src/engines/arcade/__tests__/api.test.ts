import { createSession, submitScore, fetchLeaderboard } from "../api"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

function mockFail(status = 422, data: unknown = { error: "Oops" }) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve(data),
  })
}

function mockFailNoJson() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () => Promise.reject(new Error("no json")),
  })
}

beforeEach(() => mockFetch.mockClear())

describe("createSession", () => {
  it("calls the sessions endpoint and returns data", async () => {
    const data = { session_id: "abc", seed: 123, game: "lane_dodger", expires_at: "2026-01-01T00:00:00Z" }
    mockOk(data)
    const result = await createSession("lane_dodger")
    expect(result).toEqual(data)
    expect(mockFetch).toHaveBeenCalledWith("/api/arcade/sessions", expect.objectContaining({ method: "POST" }))
  })

  it("throws on non-ok response", async () => {
    mockFail(500)
    await expect(createSession("lane_dodger")).rejects.toThrow("Failed to create session")
  })
})

describe("submitScore", () => {
  const opts = {
    sessionId: "abc",
    claimedScore: 10,
    playerName: "Alice",
    theme: "cyberpunk" as const,
    inputs: [],
  }

  it("posts to scores endpoint and returns data", async () => {
    const data = { id: 1, score: 10, rank: 1, player_name: "Alice" }
    mockOk(data)
    const result = await submitScore(opts)
    expect(result).toEqual(data)
    expect(mockFetch).toHaveBeenCalledWith("/api/arcade/scores", expect.objectContaining({ method: "POST" }))
  })

  it("throws with server error message on failure", async () => {
    mockFail(422, { error: "Score could not be verified" })
    await expect(submitScore(opts)).rejects.toThrow("Score could not be verified")
  })

  it("throws generic message when no json body on failure", async () => {
    mockFailNoJson()
    await expect(submitScore(opts)).rejects.toThrow("Failed to submit score")
  })
})

describe("fetchLeaderboard", () => {
  it("fetches leaderboard data", async () => {
    const data = [{ rank: 1, player_name: "Alice", score: 100, theme: "cyberpunk", created_at: "2026-01-01T00:00:00Z" }]
    mockOk(data)
    const result = await fetchLeaderboard("lane_dodger")
    expect(result).toEqual(data)
    expect(mockFetch).toHaveBeenCalledWith("/api/arcade/leaderboard?game=lane_dodger")
  })

  it("throws on non-ok response", async () => {
    mockFail(500)
    await expect(fetchLeaderboard("lane_dodger")).rejects.toThrow("Failed to fetch leaderboard")
  })
})
