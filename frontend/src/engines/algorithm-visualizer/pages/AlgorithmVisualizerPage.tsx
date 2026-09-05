import Editor from "@monaco-editor/react"
import { useEffect, useState } from "react"
import { fetchAlgorithms, runAlgorithm, runUserCode } from "../api"
import BarChart from "../components/BarChart"
import PlaybackControls from "../components/PlaybackControls"
import { usePlayback } from "../hooks/usePlayback"
import type { Algorithm, AlgorithmRunResult, RunResult } from "../types"
import styles from "./AlgorithmVisualizerPage.module.css"

const DEFAULT_INPUT = [8, 3, 1, 7, 5, 2, 6, 4, 9, 10]

const STARTER_CODE = `def sort(arr)
  # arr supports:
  #   arr[i]          — read element
  #   arr[i] = val    — write element
  #   arr.compare(i, j) — returns -1 / 0 / 1 and records a compare step
  #   arr.swap(i, j)  — swaps elements and records a swap step
  #   arr.length / arr.size
  length = arr.length
  (length - 1).times do |pass|
    (length - 1 - pass).times do |index|
      arr.swap(index, index + 1) if arr.compare(index, index + 1) > 0
    end
  end
end`

function StatBadge({ label, value, color }: { label: string; value: number; color: "cyan" | "magenta" }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${styles[color]}`}>{value}</span>
    </div>
  )
}

function VisualizationPanel({
  title,
  result,
  error,
}: {
  title: string
  result: RunResult | AlgorithmRunResult | null
  error: string | null
}) {
  const pb = usePlayback(result?.initial ?? [], result?.steps ?? [])

  useEffect(() => {
    if (result) pb.reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  return (
    <div className={styles.vizPanel}>
      <div className={styles.vizHeader}>
        <span className={styles.vizTitle}>{title}</span>
        {result && (
          <div className={styles.stats}>
            <StatBadge label="CMP" value={result.stats.comparisons} color="cyan" />
            <StatBadge label="SWP" value={result.stats.swaps} color="magenta" />
            <StatBadge label="STEPS" value={result.steps.length} color="cyan" />
          </div>
        )}
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {!result && !error && (
        <div className={styles.emptyChart}>
          <span className={styles.dim}>Run code to see visualization</span>
        </div>
      )}

      {result && (
        <>
          <div className={styles.chartArea}>
            <BarChart
              values={pb.currentArray}
              activeIndices={pb.activeIndices}
              activeType={pb.activeType}
            />
          </div>
          <PlaybackControls
            playing={pb.playing}
            done={pb.done}
            stepIndex={pb.stepIndex}
            totalSteps={pb.totalSteps}
            speed={pb.speed}
            onPlay={pb.play}
            onPause={pb.pause}
            onStepBack={pb.stepBack}
            onStepForward={pb.stepForward}
            onReset={pb.reset}
            onJumpToEnd={pb.jumpToEnd}
            onSpeedChange={pb.setSpeed}
          />
        </>
      )}
    </div>
  )
}

export default function AlgorithmVisualizerPage() {
  const [code, setCode] = useState(STARTER_CODE)
  const [inputText, setInputText] = useState(DEFAULT_INPUT.join(", "))
  const [inputError, setInputError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const [userResult, setUserResult] = useState<RunResult | null>(null)
  const [userError, setUserError] = useState<string | null>(null)

  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [selectedAlgo, setSelectedAlgo] = useState<string>("")
  const [compResult, setCompResult] = useState<AlgorithmRunResult | null>(null)
  const [compError, setCompError] = useState<string | null>(null)
  const [compRunning, setCompRunning] = useState(false)

  useEffect(() => {
    fetchAlgorithms()
      .then((algos) => {
        setAlgorithms(algos)
        if (algos.length > 0) setSelectedAlgo(algos[0].name)
      })
      /* v8 ignore next */
      .catch(() => {})
  }, [])

  function parseInput(): number[] | null {
    const parts = inputText
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
    if (parts.some(isNaN) || parts.length < 2 || parts.length > 100) {
      setInputError("Enter 2–100 integers separated by commas or spaces")
      return null
    }
    setInputError(null)
    return parts
  }

  async function handleRun() {
    const input = parseInput()
    if (!input) return
    setRunning(true)
    setUserError(null)
    try {
      const result = await runUserCode(code, input)
      setUserResult(result)
    } catch (e) {
      setUserError(e instanceof Error ? e.message : "Unknown error")
      setUserResult(null)
    } finally {
      setRunning(false)
    }
  }

  async function handleCompare() {
    /* v8 ignore next */
    if (!selectedAlgo) return
    const input = parseInput()
    if (!input) return
    setCompRunning(true)
    setCompError(null)
    try {
      const result = await runAlgorithm(selectedAlgo, input)
      setCompResult(result)
    } catch (e) {
      setCompError(e instanceof Error ? e.message : "Unknown error")
      setCompResult(null)
    } finally {
      setCompRunning(false)
    }
  }

  const compAlgoLabel = algorithms.find((a) => a.name === selectedAlgo)?.label ?? selectedAlgo

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.tag}>&gt; ALGORITHM_VISUALIZER :: ENGINE v0.1.0</span>
        <h1 className={styles.title}>Sort Visualizer</h1>
      </header>

      <div className={styles.layout}>
        {/* Left: editor */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sectionLabel}>CODE EDITOR</div>
            <div className={styles.editorWrap}>
              <Editor
                height="100%"
                defaultLanguage="ruby"
                value={code}
                onChange={(val) => setCode(/* v8 ignore next */ val ?? "")}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "line",
                  padding: { top: 12 },
                  tabSize: 2,
                }}
              />
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sectionLabel}>INPUT ARRAY</div>
            <textarea
              aria-label="Input array"
              className={`${styles.inputArea} ${inputError ? styles.inputError : ""}`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={2}
              spellCheck={false}
            />
            {inputError && <div className={styles.fieldError}>{inputError}</div>}
            <button
              className={styles.resetInputBtn}
              onClick={() => {
                setInputText(DEFAULT_INPUT.join(", "))
                setInputError(null)
              }}
            >
              reset to default
            </button>
          </div>

          <button className={styles.runBtn} onClick={handleRun} disabled={running}>
            {running ? "RUNNING..." : "▶ RUN"}
          </button>

          <div className={styles.sidebarSection}>
            <div className={styles.sectionLabel}>COMPARE AGAINST</div>
            <select
              className={styles.algoSelect}
              value={selectedAlgo}
              onChange={(e) => {
                setSelectedAlgo(e.target.value)
                setCompResult(null)
                setCompError(null)
              }}
            >
              {algorithms.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.label}
                </option>
              ))}
            </select>
            <button className={styles.compareBtn} onClick={handleCompare} disabled={compRunning || !selectedAlgo}>
              {compRunning ? "RUNNING..." : "▶ RUN COMPARISON"}
            </button>
          </div>
        </aside>

        {/* Right: visualizations */}
        <main className={styles.main}>
          <VisualizationPanel title="YOUR CODE" result={userResult} error={userError} />
          <div className={styles.divider} />
          <VisualizationPanel
            title={`BUILT-IN: ${compAlgoLabel.toUpperCase()}`}
            result={compResult}
            error={compError}
          />
        </main>
      </div>
    </div>
  )
}
