import {
  LANES, PLAYER_LANE_START, LIVES, INVINCIBILITY_MS,
  TRAVEL_DISTANCE, BASE_SPEED, SPEED_PER_TIER,
  BASE_INTERVAL, INTERVAL_DROP, MIN_INTERVAL,
  MS_PER_TIER, SCORE_DIVISOR, MAX_MS,
} from "./constants"
import { Rng } from "./rng"

export type Input = { t: number; dir: "left" | "right" }

export type Obstacle = {
  lane: number
  spawnMs: number
  hitMs: number
}

export type GameState = {
  seed: number
  sessionId: string
  rng: Rng
  startTime: number
  lane: number
  lives: number
  invincibleUntilMs: number
  score: number
  obstacles: Obstacle[]
  nextSpawnMs: number
  inputs: Input[]
  dead: boolean
  deathMs: number | null
}

export function tierAt(elapsedMs: number): number {
  return Math.min(Math.floor(elapsedMs / MS_PER_TIER), 9)
}

export function obstacleSpeed(tier: number): number {
  return BASE_SPEED + tier * SPEED_PER_TIER
}

export function obstacleInterval(tier: number): number {
  return Math.max(BASE_INTERVAL - tier * INTERVAL_DROP, MIN_INTERVAL)
}

export function travelMs(elapsedMs: number): number {
  return Math.round((TRAVEL_DISTANCE * 1000) / obstacleSpeed(tierAt(elapsedMs)))
}

export function initState(seed: number, sessionId: string, now: number): GameState {
  const rng = new Rng(seed)
  return {
    seed,
    sessionId,
    rng,
    startTime: now,
    lane: PLAYER_LANE_START,
    lives: LIVES,
    invincibleUntilMs: -1,
    score: 0,
    obstacles: [],
    nextSpawnMs: obstacleInterval(tierAt(0)),
    inputs: [],
    dead: false,
    deathMs: null,
  }
}

export function movePlayer(state: GameState, dir: "left" | "right", now: number): GameState {
  if (state.dead) return state
  const delta = dir === "right" ? 1 : -1
  const newLane = Math.max(0, Math.min(LANES - 1, state.lane + delta))
  const elapsedMs = now - state.startTime
  const input: Input = { t: elapsedMs, dir }
  return { ...state, lane: newLane, inputs: [...state.inputs, input] }
}

export function update(state: GameState, now: number): GameState {
  if (state.dead) return state

  const elapsedMs = now - state.startTime
  if (elapsedMs > MAX_MS) {
    return { ...state, score: Math.floor(MAX_MS / SCORE_DIVISOR), dead: true }
  }

  let { lane, lives, invincibleUntilMs, obstacles, nextSpawnMs, rng } = state
  let dead = false
  let deathMs: number | null = null

  while (nextSpawnMs <= elapsedMs) {
    const obsLane = rng.nextInt(LANES)
    const travel = travelMs(nextSpawnMs)
    const hitMs = nextSpawnMs + travel
    obstacles = [...obstacles, { lane: obsLane, spawnMs: nextSpawnMs, hitMs }]
    nextSpawnMs += obstacleInterval(tierAt(nextSpawnMs))
  }

  const remaining: Obstacle[] = []
  for (const obs of obstacles) {
    if (obs.hitMs > elapsedMs) {
      remaining.push(obs)
      continue
    }
    if (obs.lane === lane && obs.hitMs > invincibleUntilMs) {
      lives -= 1
      if (lives <= 0) {
        dead = true
        deathMs = obs.hitMs
        break
      }
      invincibleUntilMs = obs.hitMs + INVINCIBILITY_MS
    }
  }

  const score = dead && deathMs !== null
    ? Math.floor(deathMs / SCORE_DIVISOR)
    : Math.floor(elapsedMs / SCORE_DIVISOR)

  return { ...state, lane, lives, invincibleUntilMs, obstacles: remaining, nextSpawnMs, rng, score, dead, deathMs }
}

export function obstacleProgress(obs: Obstacle, now: number, startTime: number): number {
  const elapsed = now - startTime
  const total = obs.hitMs - obs.spawnMs
  const done = elapsed - obs.spawnMs
  return Math.max(0, Math.min(1, done / total))
}
