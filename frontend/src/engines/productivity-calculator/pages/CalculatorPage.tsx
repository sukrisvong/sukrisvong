import { useState } from "react"
import styles from "./CalculatorPage.module.css"

interface Result {
  end_time: string
  time_on_site: string
  productivity_percentage: number | null
}

const DEFAULT_FORM = {
  start_time: "",
  hours_scheduled: "",
  minutes_scheduled: "",
  productivity_goal: "",
}

export default function CalculatorPage() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setResult(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/productivity-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
      } else {
        setResult(data)
      }
    } catch {
      setError("Could not reach the server.")
    } finally {
      setLoading(false)
    }
  }

  const pct = result?.productivity_percentage
  const pctColor = pct == null ? undefined : pct >= 100 ? "var(--green)" : pct >= 75 ? "var(--amber)" : "var(--red)"

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.label}>ENGINE · PRODUCTIVITY</p>
        <h1 className={styles.title}>Productivity Calculator</h1>
        <p className={styles.subtitle}>How much did you get done today?</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Start Time" htmlFor="start_time">
          <input
            id="start_time"
            name="start_time"
            type="time"
            value={form.start_time}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </Field>

        <div className={styles.row}>
          <Field label="Hours Scheduled" htmlFor="hours_scheduled">
            <input
              id="hours_scheduled"
              name="hours_scheduled"
              type="number"
              min="0"
              max="23"
              placeholder="0"
              value={form.hours_scheduled}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </Field>
          <Field label="Minutes Scheduled" htmlFor="minutes_scheduled">
            <input
              id="minutes_scheduled"
              name="minutes_scheduled"
              type="number"
              min="0"
              max="59"
              placeholder="0"
              value={form.minutes_scheduled}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </Field>
        </div>

        <Field label="Productivity Goal (%)" htmlFor="productivity_goal">
          <input
            id="productivity_goal"
            name="productivity_goal"
            type="number"
            min="1"
            max="100"
            placeholder="85"
            value={form.productivity_goal}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </Field>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>

      {result && (
        <section className={styles.results}>
          <ResultCard label="End Time" value={result.end_time} />
          <ResultCard label="Time On-Site" value={result.time_on_site} />
          {pct != null && (
            <ResultCard
              label="vs. Goal"
              value={`${pct}%`}
              valueStyle={{ color: pctColor }}
              note={pct >= 100 ? "Goal met!" : `${(100 - pct).toFixed(1)}% below goal`}
            />
          )}
        </section>
      )}
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

function ResultCard({
  label,
  value,
  valueStyle,
  note,
}: {
  label: string
  value: string
  valueStyle?: React.CSSProperties
  note?: string
}) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue} style={valueStyle}>{value}</span>
      {note && <span className={styles.cardNote}>{note}</span>}
    </div>
  )
}
