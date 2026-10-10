import { useState } from "react"
import styles from "./CalculatorPage.module.css"

interface Result {
  time_required: string
  end_time: string
}

type Tab = "time_based" | "unit_based"

function currentTimeHHMM() {
  const now = new Date()
  // Round down to nearest 15-minute interval
  const minutes = Math.floor(now.getMinutes() / 15) * 15
  return `${String(now.getHours()).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

const DEFAULT_TIME_FORM = {
  start_time: currentTimeHHMM(),
  hours_scheduled: "6",
  minutes_scheduled: "0",
  productivity_goal: "85",
  include_lunch: false,
}

const DEFAULT_UNIT_FORM = {
  start_time: currentTimeHHMM(),
  units: "20",
  productivity_goal: "75",
  include_lunch: false,
}

export default function CalculatorPage() {
  const [tab, setTab] = useState<Tab>("time_based")
  const [timeForm, setTimeForm] = useState(DEFAULT_TIME_FORM)
  const [unitForm, setUnitForm] = useState(DEFAULT_UNIT_FORM)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleTabChange(next: Tab) {
    setTab(next)
    setResult(null)
    setError(null)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setTimeForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }))
    setResult(null)
    setError(null)
  }

  function handleUnitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setUnitForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }))
    setResult(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const body = tab === "time_based"
      ? { mode: "time_based", ...timeForm }
      : { mode: "unit_based", ...unitForm }

    try {
      const res = await fetch("/api/productivity_calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.label}>ENGINE · PRODUCTIVITY</p>
        <h1 className={styles.title}>Productivity Calculator</h1>
      </header>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === "time_based"}
          className={tab === "time_based" ? styles.tabActive : styles.tab}
          onClick={() => handleTabChange("time_based")}
        >
          Time Based
        </button>
        <button
          role="tab"
          aria-selected={tab === "unit_based"}
          className={tab === "unit_based" ? styles.tabActive : styles.tab}
          onClick={() => handleTabChange("unit_based")}
        >
          Unit Based
        </button>
      </div>

      {tab === "time_based" && (
        <form className={styles.form} onSubmit={handleSubmit} aria-label="Time Based">
          <Field label="Start Time" htmlFor="tb_start_time">
            <input
              id="tb_start_time"
              name="start_time"
              type="time"
              step="900"
              value={timeForm.start_time}
              onChange={handleTimeChange}
              required
              className={styles.input}
            />
          </Field>

          <div className={styles.row}>
            <Field label="Hours of Work" htmlFor="tb_hours">
              <input
                id="tb_hours"
                name="hours_scheduled"
                type="number"
                min="0"
                max="23"
                placeholder="0"
                value={timeForm.hours_scheduled}
                onChange={handleTimeChange}
                required
                className={styles.input}
              />
            </Field>
            <Field label="Minutes of Work" htmlFor="tb_minutes">
              <input
                id="tb_minutes"
                name="minutes_scheduled"
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={timeForm.minutes_scheduled}
                onChange={handleTimeChange}
                required
                className={styles.input}
              />
            </Field>
          </div>

          <Field label="Productivity Goal (%)" htmlFor="tb_goal">
            <input
              id="tb_goal"
              name="productivity_goal"
              type="number"
              min="1"
              max="100"
              placeholder="85"
              value={timeForm.productivity_goal}
              onChange={handleTimeChange}
              required
              className={styles.input}
            />
          </Field>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="include_lunch"
              checked={timeForm.include_lunch}
              onChange={handleTimeChange}
              className={styles.checkbox}
            />
            Include 30-minute lunch break
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Calculating…" : "Calculate"}
          </button>
        </form>
      )}

      {tab === "unit_based" && (
        <form className={styles.form} onSubmit={handleSubmit} aria-label="Unit Based">
          <Field label="Start Time" htmlFor="ub_start_time">
            <input
              id="ub_start_time"
              name="start_time"
              type="time"
              step="900"
              value={unitForm.start_time}
              onChange={handleUnitChange}
              required
              className={styles.input}
            />
          </Field>

          <Field label="Units (1 unit = 15 min billable)" htmlFor="ub_units">
            <input
              id="ub_units"
              name="units"
              type="number"
              min="1"
              placeholder="20"
              value={unitForm.units}
              onChange={handleUnitChange}
              required
              className={styles.input}
            />
          </Field>

          <Field label="Productivity Goal (%)" htmlFor="ub_goal">
            <input
              id="ub_goal"
              name="productivity_goal"
              type="number"
              min="1"
              max="100"
              placeholder="75"
              value={unitForm.productivity_goal}
              onChange={handleUnitChange}
              required
              className={styles.input}
            />
          </Field>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="include_lunch"
              checked={unitForm.include_lunch}
              onChange={handleUnitChange}
              className={styles.checkbox}
            />
            Include 30-minute lunch break
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Calculating…" : "Calculate"}
          </button>
        </form>
      )}

      {result && (
        <section className={styles.results}>
          <ResultCard label="Time Required On-Site" value={result.time_required} />
          <ResultCard label="Clock-Out Time" value={result.end_time} />
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

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue}>{value}</span>
    </div>
  )
}
