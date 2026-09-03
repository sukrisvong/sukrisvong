import styles from "./BarChart.module.css"

interface Props {
  values: number[]
  activeIndices: [number, number] | null
  activeType: "compare" | "swap" | null
  label?: string
}

export default function BarChart({ values, activeIndices, activeType, label }: Props) {
  const max = Math.max(...values, 1)

  return (
    <div className={styles.root}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.chart} style={{ "--bar-count": values.length } as React.CSSProperties}>
        {values.map((val, idx) => {
          const isActive = activeIndices?.includes(idx) ?? false
          const color = !isActive ? "normal" : activeType === "compare" ? "compare" : "swap"
          return (
            <div key={idx} className={`${styles.barWrapper} ${styles[color]}`}>
              <div
                className={styles.bar}
                style={{ height: `${(val / max) * 100}%` }}
                title={String(val)}
              />
              {values.length <= 20 && (
                <div className={styles.barLabel}>{val}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
