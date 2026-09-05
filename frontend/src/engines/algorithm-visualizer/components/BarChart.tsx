import styles from "./BarChart.module.css"

interface Props {
  values: number[]
  activeIndices: [number, number] | null
  activeType: "compare" | "swap" | null
  label?: string
}

type BarRole = "normal" | "compareA" | "compareB" | "swapA" | "swapB"

function barRole(idx: number, activeIndices: [number, number] | null, activeType: "compare" | "swap" | null): BarRole {
  if (!activeIndices) return "normal"
  if (idx === activeIndices[0]) return activeType === "compare" ? "compareA" : "swapA"
  if (idx === activeIndices[1]) return activeType === "compare" ? "compareB" : "swapB"
  return "normal"
}

export default function BarChart({ values, activeIndices, activeType, label }: Props) {
  const max = Math.max(...values, 1)

  return (
    <div className={styles.root}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.chart}>
        {values.map((val, idx) => {
          const role = barRole(idx, activeIndices, activeType)
          return (
            <div key={idx} className={`${styles.barWrapper} ${styles[role]}`}>
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
