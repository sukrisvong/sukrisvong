import styles from "./PlaybackControls.module.css"

interface Props {
  playing: boolean
  done: boolean
  stepIndex: number
  totalSteps: number
  speed: number
  onPlay: () => void
  onPause: () => void
  onStepBack: () => void
  onStepForward: () => void
  onReset: () => void
  onJumpToEnd: () => void
  onSpeedChange: (speed: number) => void
}

const SPEEDS = [
  { label: "0.25×", ms: 1200 },
  { label: "0.5×", ms: 600 },
  { label: "1×", ms: 300 },
  { label: "2×", ms: 150 },
  { label: "4×", ms: 75 },
]

export default function PlaybackControls({
  playing,
  done,
  stepIndex,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepBack,
  onStepForward,
  onReset,
  onJumpToEnd,
  onSpeedChange,
}: Props) {
  const atStart = stepIndex < 0
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0

  return (
    <div className={styles.root}>
      <div className={styles.progress}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.row}>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={onReset} disabled={atStart} title="Reset">
            ⏮
          </button>
          <button className={styles.btn} onClick={onStepBack} disabled={atStart} title="Step back">
            ◀
          </button>
          {playing ? (
            <button className={`${styles.btn} ${styles.primary}`} onClick={onPause} title="Pause">
              ⏸
            </button>
          ) : (
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={onPlay}
              disabled={done || totalSteps === 0}
              title="Play"
            >
              ▶
            </button>
          )}
          <button className={styles.btn} onClick={onStepForward} disabled={done || totalSteps === 0} title="Step forward">
            ▶
          </button>
          <button className={styles.btn} onClick={onJumpToEnd} disabled={done || totalSteps === 0} title="Jump to end">
            ⏭
          </button>
        </div>

        <div className={styles.meta}>
          <span className={styles.counter}>
            {stepIndex < 0 ? "—" : stepIndex + 1} / {totalSteps}
          </span>
          <div className={styles.speeds}>
            {SPEEDS.map((s) => (
              <button
                key={s.ms}
                className={`${styles.speedBtn} ${speed === s.ms ? styles.activeSpeed : ""}`}
                onClick={() => onSpeedChange(s.ms)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
