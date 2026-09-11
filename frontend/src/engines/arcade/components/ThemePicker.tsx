import type { Theme, ThemeId } from "../themes/index"
import { ALL_THEME_IDS, themeFor } from "../themes/index"

type Props = {
  current: ThemeId
  onChange: (id: ThemeId) => void
  theme: Theme
}

export default function ThemePicker({ current, onChange, theme }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ color: theme.colors.hudText, fontSize: 12 }}>THEME:</span>
      {ALL_THEME_IDS.map((id) => {
        const t = themeFor(id)
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-pressed={current === id}
            style={{
              background: current === id ? theme.colors.accent : "transparent",
              color: theme.colors.hudText,
              border: `1px solid ${theme.colors.accent}`,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
