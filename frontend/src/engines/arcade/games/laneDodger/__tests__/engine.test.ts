import {
  initState, movePlayer, update, obstacleProgress,
  tierAt, obstacleSpeed, obstacleInterval, travelMs,
} from "../engine"

const BASE_NOW = 1000

describe("tierAt", () => {
  it("returns 0 at start", () => expect(tierAt(0)).toBe(0))
  it("returns 1 at MS_PER_TIER", () => expect(tierAt(8000)).toBe(1))
  it("caps at 9", () => expect(tierAt(9999999)).toBe(9))
})

describe("obstacleSpeed", () => {
  it("returns base speed at tier 0", () => expect(obstacleSpeed(0)).toBe(200))
  it("increases with tier", () => expect(obstacleSpeed(1)).toBe(230))
})

describe("obstacleInterval", () => {
  it("returns base interval at tier 0", () => expect(obstacleInterval(0)).toBe(2000))
  it("decreases with tier", () => expect(obstacleInterval(1)).toBe(1850))
  it("floors at MIN_INTERVAL for high tiers", () => expect(obstacleInterval(13)).toBe(500))
})

describe("travelMs", () => {
  it("returns a positive number", () => expect(travelMs(0)).toBeGreaterThan(0))
})

describe("initState", () => {
  it("initializes with correct defaults", () => {
    const state = initState(42, "abc", BASE_NOW)
    expect(state.seed).toBe(42)
    expect(state.sessionId).toBe("abc")
    expect(state.lives).toBe(3)
    expect(state.lane).toBe(1)
    expect(state.dead).toBe(false)
    expect(state.inputs).toEqual([])
  })
})

describe("movePlayer", () => {
  it("moves left", () => {
    const state = initState(42, "abc", BASE_NOW)
    const next = movePlayer(state, "left", BASE_NOW + 100)
    expect(next.lane).toBe(0)
    expect(next.inputs).toHaveLength(1)
    expect(next.inputs[0].dir).toBe("left")
  })

  it("moves right", () => {
    const state = initState(42, "abc", BASE_NOW)
    const next = movePlayer(state, "right", BASE_NOW + 100)
    expect(next.lane).toBe(2)
  })

  it("clamps to left boundary", () => {
    let state = initState(42, "abc", BASE_NOW)
    state = movePlayer(state, "left", BASE_NOW + 100)
    state = movePlayer(state, "left", BASE_NOW + 200)
    expect(state.lane).toBe(0)
  })

  it("clamps to right boundary", () => {
    let state = initState(42, "abc", BASE_NOW)
    state = movePlayer(state, "right", BASE_NOW + 100)
    state = movePlayer(state, "right", BASE_NOW + 200)
    expect(state.lane).toBe(2)
  })

  it("does nothing when dead", () => {
    const state = { ...initState(42, "abc", BASE_NOW), dead: true }
    const next = movePlayer(state, "left", BASE_NOW + 100)
    expect(next).toBe(state)
  })
})

describe("update", () => {
  it("returns same state when dead", () => {
    const state = { ...initState(42, "abc", BASE_NOW), dead: true }
    const next = update(state, BASE_NOW + 1000)
    expect(next).toBe(state)
  })

  it("increases score over time", () => {
    const state = initState(42, "abc", BASE_NOW)
    const next = update(state, BASE_NOW + 10000)
    expect(next.score).toBeGreaterThan(0)
  })

  it("caps at MAX_MS", () => {
    const state = initState(0, "abc", BASE_NOW)
    const next = update(state, BASE_NOW + 300001)
    expect(next.dead).toBe(true)
    expect(next.score).toBe(3000)
  })

  it("spawns obstacles over time", () => {
    const state = initState(42, "abc", BASE_NOW)
    const next = update(state, BASE_NOW + 3000)
    expect(next.obstacles.length).toBeGreaterThan(0)
  })

  it("reduces lives on collision", () => {
    const state = initState(42, "abc", BASE_NOW)
    const evolved = update(state, BASE_NOW + 60000)
    expect(evolved.lives).toBeLessThanOrEqual(3)
  })
})

describe("obstacleProgress", () => {
  it("returns 0 before spawn", () => {
    const obs = { lane: 0, spawnMs: 500, hitMs: 3000 }
    expect(obstacleProgress(obs, BASE_NOW + 200, BASE_NOW)).toBe(0)
  })

  it("returns 1 at hit time", () => {
    const obs = { lane: 0, spawnMs: 0, hitMs: 1000 }
    expect(obstacleProgress(obs, BASE_NOW + 1000, BASE_NOW)).toBe(1)
  })

  it("returns fractional progress", () => {
    const obs = { lane: 0, spawnMs: 0, hitMs: 1000 }
    const progress = obstacleProgress(obs, BASE_NOW + 500, BASE_NOW)
    expect(progress).toBeCloseTo(0.5)
  })

  it("clamps to 1 beyond hit time", () => {
    const obs = { lane: 0, spawnMs: 0, hitMs: 500 }
    expect(obstacleProgress(obs, BASE_NOW + 2000, BASE_NOW)).toBe(1)
  })
})
