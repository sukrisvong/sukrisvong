export type ThemeId = "cyberpunk" | "medieval"

export type Theme = {
  id: ThemeId
  label: string
  colors: {
    background: string
    track: string
    player: string
    obstacle: string
    hud: string
    hudText: string
    accent: string
  }
  playerEmoji: string
  obstacleEmoji: string
  pageBackground: string
  pageText: string
}

import { cyberpunk } from "./cyberpunk"
import { medieval } from "./medieval"

const THEMES: Record<ThemeId, Theme> = { cyberpunk, medieval }

export function themeFor(id: ThemeId): Theme {
  return THEMES[id]
}

export const ALL_THEME_IDS: ThemeId[] = ["cyberpunk", "medieval"]
