import { useEffect, useState } from "react"
import styles from "./HomePage.module.css"

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#"

function useGlitchText(target: string, active: boolean) {
  const [glitched, setGlitched] = useState(target)

  useEffect(() => {
    if (!active) return
    let iteration = 0
    const interval = setInterval(() => {
      setGlitched(
        target
          .split("")
          .map((char, i) => {
            if (char === " ") return " "
            if (i < iteration) return target[i]
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          })
          .join("")
      )
      if (iteration >= target.length) clearInterval(interval)
      iteration += 0.5
    }, 40)
    return () => clearInterval(interval)
  }, [active, target])

  return active ? glitched : target
}

export default function HomePage() {
  const [glitching, setGlitching] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setGlitching(false), 2500)
    return () => clearTimeout(t)
  }, [])

  const title = useGlitchText("UNDER CONSTRUCTION", glitching)

  return (
    <div className={styles.root}>
      <div className={styles.scanlines} />
      <div className={styles.grid} />

      <main className={styles.content}>
        <div className={styles.tag}>&gt; SYSTEM_BOOT :: ENGINE_CORE v0.1.0</div>

        <h1 className={styles.title} data-text="UNDER CONSTRUCTION">
          {title}
        </h1>

        <p className={styles.subtitle}>
          Something is being assembled in the dark.
        </p>

        <div className={styles.statusBlock}>
          <StatusLine label="FRONTEND" value="ONLINE" ok />
          <StatusLine label="BACKEND" value="ONLINE" ok />
          <StatusLine label="CONTENT" value="PENDING" />
        </div>

        <div className={styles.blink}>▋</div>
      </main>
    </div>
  )
}

function StatusLine({ label, value, ok = false }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className={styles.statusLine}>
      <span className={styles.statusLabel}>{label}</span>
      <span className={styles.statusDots}>{"· ".repeat(8)}</span>
      <span className={ok ? styles.statusOk : styles.statusPending}>{value}</span>
    </div>
  )
}
