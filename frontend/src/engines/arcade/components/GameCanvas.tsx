import { useEffect, useRef } from "react"
import type { GameState } from "../games/laneDodger/engine"
import { initState, movePlayer, update, obstacleProgress } from "../games/laneDodger/engine"
import type { Theme } from "../themes/index"
import { LANES } from "../games/laneDodger/constants"

const CANVAS_W = 300
const CANVAS_H = 530
const LANE_W = CANVAS_W / LANES

type Props = {
  seed: number
  sessionId: string
  theme: Theme
  onDead: (state: GameState) => void
}

export default function GameCanvas({ seed, sessionId, theme, onDead }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState | null>(null)
  const rafRef = useRef<number>(0)
  const deadRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    const now = performance.now()
    stateRef.current = initState(seed, sessionId, now)
    deadRef.current = false

    function onKey(e: KeyboardEvent) {
      if (!stateRef.current || deadRef.current) return
      if (e.key === "ArrowLeft") {
        stateRef.current = movePlayer(stateRef.current, "left", performance.now())
      } else if (e.key === "ArrowRight") {
        stateRef.current = movePlayer(stateRef.current, "right", performance.now())
      }
    }

    window.addEventListener("keydown", onKey)

    function draw(ts: number) {
      if (!stateRef.current || deadRef.current || !ctx) return

      stateRef.current = update(stateRef.current, ts)

      if (stateRef.current.dead) {
        deadRef.current = true
        onDead(stateRef.current)
        render(ctx, stateRef.current, ts, theme)
        return
      }

      render(ctx, stateRef.current, ts, theme)
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("keydown", onKey)
      cancelAnimationFrame(rafRef.current)
    }
  }, [seed, sessionId, theme, onDead])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ display: "block", margin: "0 auto", border: `2px solid ${theme.colors.accent}` }}
      aria-label="game canvas"
    />
  )
}

function render(ctx: CanvasRenderingContext2D, state: GameState, now: number, theme: Theme) {
  ctx.fillStyle = theme.colors.background
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  for (let i = 1; i < LANES; i++) {
    ctx.strokeStyle = theme.colors.track
    ctx.beginPath()
    ctx.moveTo(i * LANE_W, 0)
    ctx.lineTo(i * LANE_W, CANVAS_H)
    ctx.stroke()
  }

  for (const obs of state.obstacles) {
    const progress = obstacleProgress(obs, now, state.startTime)
    const x = obs.lane * LANE_W + LANE_W / 2
    const y = progress * CANVAS_H
    ctx.font = "28px serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(theme.obstacleEmoji, x, y)
  }

  const playerX = state.lane * LANE_W + LANE_W / 2
  ctx.font = "28px serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(theme.playerEmoji, playerX, CANVAS_H - 60)
}
