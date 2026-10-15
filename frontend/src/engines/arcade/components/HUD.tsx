import type { Theme } from "../themes/index"
import { LIVES } from "../games/laneDodger/constants"

type Props = {
  score: number
  lives: number
  theme: Theme
}

export default function HUD({ score, lives, theme }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 16px",
        background: theme.colors.hud,
        color: theme.colors.hudText,
        fontFamily: "monospace",
        fontSize: 14,
      }}
    >
      <span aria-label="score">SCORE: {score}</span>
      <span aria-label="lives">
        {Array.from({ length: LIVES }, (_, i) => (
          <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤</span>
        ))}
      </span>
    </div>
  )
}
